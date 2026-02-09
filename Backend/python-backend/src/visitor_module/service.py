from datetime import datetime, timedelta, timezone
import uuid
import hashlib
import base64
import json
from src.utils.logger import logger
from src.config.app import config as app_config_dict
from src.communication_service import communication_service
from src.audit_service import audit_service
from src.utils.notification_helper import notification_helper
import os

class VisitorService:
    def __init__(self, db_config=None):

        if db_config is None:
            env = os.getenv('FLASK_ENV', 'development')
            app_config = app_config_dict.get(env, app_config_dict['default'])
            db_config = {
                'host': app_config.DB_HOST,
                'port': app_config.DB_PORT,
                'user': app_config.DB_USER,
                'password': app_config.DB_PASSWORD,
                'database': app_config.DB_NAME,
                'pool_name': 'craft_resource_pool',
                'pool_size': 5,
                'pool_reset_session': True,
                'charset': 'utf8mb4'
            }
        from src.database.connection import DatabaseManager
        self.db = DatabaseManager(db_config)

    def generate_qr_token(self, frontend_url=None):
        """Generate a dynamic QR token that expires in 5 minutes"""
        try:
            token = str(uuid.uuid4())
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

            query = """
                INSERT INTO qr_tokens (token, expires_at, is_used)
                VALUES (%s, %s, 0)
            """
            self.db.execute_query(query, (token, expires_at), fetch=False)

            # Generate check-in URL for the QR code
            if not frontend_url:
                frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            check_in_url = f"{frontend_url}/visitor-checkin?token={token}"

            # Log QR token generation
            audit_service.log_action(None, 'GENERATE_QR_TOKEN', {'token': token, 'expires_at': expires_at.isoformat()})

            return {
                'token': token,
                'expires_at': expires_at.isoformat(),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'check_in_url': check_in_url
            }
        except Exception as e:
            logger.error(f"Error generating QR token: {e}")
            raise e

    def validate_qr_token(self, token):
        """Validate QR token - check if exists, not expired, and not used"""
        try:
            query = """
                SELECT id, expires_at, is_used FROM qr_tokens
                WHERE token = %s
            """
            result = self.db.execute_query(query, (token,))

            if not result:
                return {'valid': False, 'message': 'Token not found'}

            token_data = result[0]
            now = datetime.utcnow()

            # Ensure expires_at is a datetime object and naive (since MySQL returns naive datetimes)
            if isinstance(token_data['expires_at'], str):
                token_data['expires_at'] = datetime.fromisoformat(token_data['expires_at'])
            elif isinstance(token_data['expires_at'], datetime) and token_data['expires_at'].tzinfo is not None:
                token_data['expires_at'] = token_data['expires_at'].replace(tzinfo=None)

            if token_data['is_used']:
                return {'valid': False, 'message': 'Token has already been used'}

            if now > token_data['expires_at']:
                return {'valid': False, 'message': 'Token has expired'}

            return {'valid': True}
        except Exception as e:
            logger.error(f"Error validating QR token: {e}")
            return {'valid': False, 'message': 'Error validating token'}

    def check_in_visitor(self, visitor_data, user_id):
        """Check in a visitor using the new visitors table structure"""
        try:
            # Extract data from payload
            first_name = visitor_data.get('first_name')
            last_name = visitor_data.get('last_name')
            company = visitor_data.get('company')
            email = visitor_data.get('email')
            phone = visitor_data.get('phone')
            visiting_employee_id = visitor_data.get('visiting_employee_id')
            purpose_of_visit = visitor_data.get('purpose_of_visit')
            qr_token = visitor_data.get('qr_token')

            # Validate required fields
            if not all([first_name, last_name, visiting_employee_id, purpose_of_visit]):
                return False, "Missing required fields"

            # Validate QR token if provided
            if qr_token:
                token_valid = self.validate_qr_token(qr_token)
                logger.info(f"QR token validation result for {qr_token}: {token_valid}")
                if not token_valid['valid']:
                    return False, token_valid['message']

            # Get the next auto-increment ID for visitors table
            next_id_query = "SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'visitors'"
            next_id_result = self.db.execute_query(next_id_query)
            next_auto_id = next_id_result[0]['AUTO_INCREMENT']

            # Generate visitor_id string
            visitor_id = f'CrmsVisitor{next_auto_id:03d}'

            # Insert visitor record with visitor_id
            visitor_query = """
                INSERT INTO visitors (visitor_id, first_name, last_name, company, email, phone, purpose_of_visit, employee_to_visit, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, NOW(), NOW())
            """
            visitor_params = (visitor_id, first_name, last_name, company, email, phone, purpose_of_visit, visiting_employee_id)
            self.db.execute_query(visitor_query, visitor_params, fetch=False)

            # Insert check-in record with pending_approval status
            checkin_query = """
                INSERT INTO visitor_checkins (visitor_id, check_in_time, check_in_method, purpose, host_employee_id, status, created_at, updated_at)
                VALUES (%s, NOW(), %s, %s, %s, 'pending_approval', NOW(), NOW())
            """
            checkin_method = 'qr' if qr_token else 'manual'
            checkin_params = (visitor_id, checkin_method, purpose_of_visit, visiting_employee_id)
            self.db.execute_query(checkin_query, checkin_params, fetch=False)

            # Mark QR token as used if provided
            if qr_token:
                update_token_query = "UPDATE qr_tokens SET is_used = 1 WHERE token = %s"
                self.db.execute_query(update_token_query, (qr_token,), fetch=False)

            # Send notification to host employee
            self._send_host_notification(visitor_id, visitor_data)

            # Send system notification to host employee for approval
            notification_helper.notify_visitor_approval_request(
                visiting_employee_id,
                f"{first_name} {last_name}",
                purpose_of_visit,
                visitor_id
            )

            # Send notification to visitor if email provided
            if email:
                self._send_visitor_notification(visitor_id, visitor_data)

            if user_id:
                audit_service.log_action(user_id, 'CHECK_IN_VISITOR', {'entity': 'visitor', 'id': visitor_id, 'data': visitor_data})
            logger.info(f"Visitor {first_name} {last_name} checked in successfully with ID {visitor_id}, awaiting host approval")
            return True, visitor_id
        except Exception as e:
            logger.error(f"Error checking in visitor: {e}")
            return False, str(e)

    def approve_visitor(self, visitor_id, host_user_id):
        """Approve visitor and generate entry pass"""
        try:
            # Update status to approved
            query = """
                UPDATE visitor_checkins
                SET status = 'approved', updated_at = NOW()
                WHERE visitor_id = %s AND host_employee_id = %s AND status = 'pending_approval'
            """
            affected = self.db.execute_query(query, (visitor_id, host_user_id), fetch=False)
            
            if affected == 0:
                return False, "Visitor not found or already processed"
            
            # Get visitor details for notification
            visitor_query = "SELECT first_name, last_name, email FROM visitors WHERE visitor_id = %s"
            visitor_result = self.db.execute_query(visitor_query, (visitor_id,))
            
            if visitor_result:
                visitor = visitor_result[0]
                visitor_name = f"{visitor['first_name']} {visitor['last_name']}"
                
                # Send approval notification to visitor
                if visitor['email']:
                    communication_service.send_email(
                        visitor['email'],
                        'Visitor Access Approved',
                        f"Dear {visitor_name},\n\nYour visit has been approved. Your digital entry pass is now available.\n\nPlease access your entry pass at the check-in page on your phone and show it at security checkpoints.\n\nBest regards,\nVisitor Management System"
                    )
            
            audit_service.log_action(host_user_id, 'APPROVE_VISITOR', {'visitor_id': visitor_id})
            logger.info(f"Visitor {visitor_id} approved by host {host_user_id}")
            return True, None
        except Exception as e:
            logger.error(f"Error approving visitor: {e}")
            return False, str(e)

    def reject_visitor(self, visitor_id, host_user_id, reason=None):
        """Reject visitor"""
        try:
            # Update status to rejected
            query = """
                UPDATE visitor_checkins
                SET status = 'rejected', updated_at = NOW()
                WHERE visitor_id = %s AND host_employee_id = %s AND status = 'pending_approval'
            """
            affected = self.db.execute_query(query, (visitor_id, host_user_id), fetch=False)
            
            if affected == 0:
                return False, "Visitor not found or already processed"
            
            # Get visitor details for notification
            visitor_query = "SELECT first_name, last_name, email FROM visitors WHERE visitor_id = %s"
            visitor_result = self.db.execute_query(visitor_query, (visitor_id,))
            
            if visitor_result:
                visitor = visitor_result[0]
                visitor_name = f"{visitor['first_name']} {visitor['last_name']}"
                
                # Send rejection notification to visitor
                if visitor['email']:
                    communication_service.send_email(
                        visitor['email'],
                        '❌ Visitor Access Denied',
                        f"Dear {visitor_name},\n\nWe regret to inform you that your visit request has been DECLINED.\n\n{('Reason: ' + reason) if reason else 'Your host is currently unavailable.'}\n\nPlease contact your host directly for more information or to reschedule.\n\nVisitor ID: {visitor_id}\n\nBest regards,\nVisitor Management System"
                    )
                
                # Send SMS if phone available
                visitor_phone_query = "SELECT phone FROM visitors WHERE visitor_id = %s"
                phone_result = self.db.execute_query(visitor_phone_query, (visitor_id,))
                if phone_result and phone_result[0]['phone']:
                    communication_service.send_sms(
                        phone_result[0]['phone'],
                        f"Visit Declined: Your visit request has been declined. {('Reason: ' + reason) if reason else ''} Please contact your host."
                    )
            
            audit_service.log_action(host_user_id, 'REJECT_VISITOR', {'visitor_id': visitor_id, 'reason': reason})
            logger.info(f"Visitor {visitor_id} rejected by host {host_user_id}")
            return True, None
        except Exception as e:
            logger.error(f"Error rejecting visitor: {e}")
            return False, str(e)

    def check_visitor_status(self, visitor_id):
        """Check visitor approval status"""
        try:
            query = """
                SELECT vc.status, v.first_name, v.last_name, v.purpose_of_visit,
                       u.first_name as host_first_name, u.last_name as host_last_name,
                       vc.check_in_time
                FROM visitor_checkins vc
                JOIN visitors v ON vc.visitor_id = v.visitor_id
                LEFT JOIN users u ON vc.host_employee_id = u.id
                WHERE vc.visitor_id = %s
                ORDER BY vc.check_in_time DESC LIMIT 1
            """
            result = self.db.execute_query(query, (visitor_id,))
            
            if not result:
                return None
            
            data = result[0]
            return {
                'visitor_id': visitor_id,
                'status': data['status'],
                'visitor_name': f"{data['first_name']} {data['last_name']}",
                'host_name': f"{data['host_first_name']} {data['host_last_name']}" if data['host_first_name'] else None,
                'purpose': data['purpose_of_visit'],
                'check_in_time': data['check_in_time'].isoformat() if data['check_in_time'] else None
            }
        except Exception as e:
            logger.error(f"Error checking visitor status: {e}")
            return None

    def _send_host_notification(self, visitor_id, visitor_data):
        """Send notification to the host employee about visitor arrival"""
        try:
            # Get host employee details
            host_query = """
                SELECT first_name, last_name, email, phone FROM users
                WHERE id = %s
            """
            host_result = self.db.execute_query(host_query, (visitor_data['visiting_employee_id'],))

            if host_result:
                host = host_result[0]
                host_name = f"{host['first_name']} {host['last_name']}"
                host_email = host['email']
                host_phone = host['phone']

                visitor_name = f"{visitor_data['first_name']} {visitor_data['last_name']}"

                # Send email notification to host
                subject = "Visitor Check-in Notification"
                message = f"""
                Dear {host_name},

                A visitor has checked in and is waiting for you.

                Visitor Details:
                - Name: {visitor_name}
                - Contact: {visitor_data.get('phone', 'Not provided')}
                - Email: {visitor_data.get('email', 'Not provided')}
                - Purpose: {visitor_data['purpose_of_visit']}
                - Check-in Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}

                Please meet your visitor at the reception area.

                Best regards,
                Visitor Management System
                """

                communication_service.send_email(host_email, subject, message)

                # Send SMS notification to host if phone number available
                if host_phone:
                    sms_message = f"Visitor Alert: {visitor_name} has checked in for {visitor_data['purpose_of_visit']}. Please meet at reception."
                    communication_service.send_sms(host_phone, sms_message)

                logger.info(f"Host notification sent to {host_name} ({host_email}, {host_phone or 'no phone'})")

        except Exception as e:
            logger.error(f"Error sending host notification: {e}")

    def _send_visitor_notification(self, visitor_id, visitor_data):
        """Send notification to the visitor about successful check-in"""
        try:
            visitor_name = f"{visitor_data['first_name']} {visitor_data['last_name']}"

            # Send email notification to visitor
            subject = "Visitor Check-in Confirmation"
            message = f"""
            Dear {visitor_name},

            Your check-in has been completed successfully.

            Check-in Details:
            - Check-in Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}
            - Purpose: {visitor_data['purpose_of_visit']}
            - Contact: {visitor_data.get('phone', 'Not provided')}

            Your host has been notified and will meet you shortly.

            Please show your entry pass QR code at security checkpoints.

            Best regards,
            Visitor Management System
            """

            communication_service.send_email(visitor_data['email'], subject, message)

            logger.info(f"Visitor notification sent to {visitor_name} ({visitor_data['email']})")

        except Exception as e:
            logger.error(f"Error sending visitor notification: {e}")

    def generate_visitor_entry_pass(self, visitor_id):
        """Generate an entry pass for the visitor - only if approved"""
        try:
            # Get visitor details - MUST be approved
            visitor_query = """
                SELECT CONCAT(v.first_name, ' ', v.last_name) as full_name, vc.check_in_time, v.purpose_of_visit,
                       u.first_name as host_first_name, u.last_name as host_last_name, vc.status
                FROM visitors v
                LEFT JOIN visitor_checkins vc ON v.visitor_id = vc.visitor_id
                LEFT JOIN users u ON v.employee_to_visit = u.id
                WHERE v.visitor_id = %s
                ORDER BY vc.check_in_time DESC LIMIT 1
            """
            visitor_result = self.db.execute_query(visitor_query, (visitor_id,))

            if not visitor_result:
                logger.warning(f"Entry pass request for non-existent visitor: {visitor_id}")
                return None
            
            visitor = visitor_result[0]
            
            # Check if visitor is approved
            if visitor.get('status') != 'approved':
                logger.warning(f"Entry pass request for non-approved visitor: {visitor_id}, status: {visitor.get('status')}")
                return None

            # Generate entry pass data
            entry_pass = {
                'visitor_id': visitor_id,
                'visitor_name': visitor['full_name'],
                'host_name': f"{visitor['host_first_name']} {visitor['host_last_name']}",
                'purpose': visitor['purpose_of_visit'],
                'check_in_time': visitor['check_in_time'].isoformat() if visitor['check_in_time'] else None,
                'valid_until': (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat(),
                'issued_at': datetime.now(timezone.utc).isoformat()
            }

            # Generate QR code data for entry pass
            qr_data = base64.b64encode(json.dumps({
                'type': 'visitor_entry_pass',
                'visitor_id': visitor_id,
                'valid_until': entry_pass['valid_until']
            }).encode()).decode()

            entry_pass['qr_code'] = qr_data
            
            logger.info(f"Entry pass generated for approved visitor: {visitor_id}")
            return entry_pass

        except Exception as e:
            logger.error(f"Error generating visitor entry pass: {e}")
            return None

    def check_out_visitor(self, visitor_id, user_id):
        """Check out a visitor"""
        try:
            # Update the check-in record to checked_out status
            query_update_checkin = """
                UPDATE visitor_checkins
                SET status = 'checked_out', check_out_time = NOW(), check_out_method = 'manual', updated_at = NOW()
                WHERE visitor_id = %s AND status = 'checked_in'
            """
            params_update = (visitor_id,)
            affected_rows = self.db.execute_query(query_update_checkin, params_update, fetch=False)

            if affected_rows == 0:
                return False, "Visitor not found or already checked out"

            audit_service.log_action(user_id, 'CHECK_OUT_VISITOR', {'entity': 'visitor', 'id': visitor_id})
            logger.info(f"Visitor {visitor_id} checked out successfully")
            return True, None
        except Exception as e:
            logger.error(f"Error checking out visitor: {e}")
            return False, str(e)

    def get_current_visitors(self):
        """Get all currently checked-in visitors"""
        try:
            query = """
                SELECT
                    v.visitor_id as id,
                    CONCAT(v.first_name, ' ', v.last_name) as visitor_name,
                    v.email,
                    v.phone,
                    vc.check_in_time,
                    v.purpose_of_visit as purpose,
                    u.first_name as host_first_name,
                    u.last_name as host_last_name
                FROM visitors v
                LEFT JOIN visitor_checkins vc ON v.visitor_id = vc.visitor_id
                LEFT JOIN users u ON v.employee_to_visit = u.id
                WHERE vc.status = 'checked_in'
                ORDER BY vc.check_in_time DESC
            """
            results = self.db.execute_query(query)
            visitors = []
            for row in results:
                visitors.append({
                    'id': row['id'],
                    'visitor_name': row['visitor_name'],
                    'email': row['email'],
                    'phone': row['phone'],
                    'check_in_time': row['check_in_time'].isoformat() if row['check_in_time'] else None,
                    'purpose': row['purpose'],
                    'host_name': f"{row['host_first_name']} {row['host_last_name']}" if row['host_first_name'] else None
                })
            return visitors
        except Exception as e:
            logger.error(f"Error fetching current visitors: {e}")
            raise e

    def get_visitor_logs(self):
        """Get visitor check-in/out logs"""
        try:
            query = """
                SELECT
                    v.visitor_id as id,
                    CONCAT(v.first_name, ' ', v.last_name) as visitor_name,
                    v.email,
                    v.phone,
                    vc.check_in_time,
                    vc.check_out_time,
                    vc.check_in_method,
                    vc.check_out_method,
                    v.purpose_of_visit as purpose,
                    u.first_name as host_first_name,
                    u.last_name as host_last_name,
                    vc.status
                FROM visitors v
                LEFT JOIN visitor_checkins vc ON v.visitor_id = vc.visitor_id
                LEFT JOIN users u ON v.employee_to_visit = u.id
                ORDER BY vc.check_in_time DESC
            """
            results = self.db.execute_query(query)
            logs = []
            for row in results:
                logs.append({
                    'id': row['id'],
                    'visitor_name': row['visitor_name'],
                    'email': row['email'],
                    'phone': row['phone'],
                    'check_in_time': row['check_in_time'].isoformat() if row['check_in_time'] else None,
                    'check_out_time': row['check_out_time'].isoformat() if row['check_out_time'] else None,
                    'check_in_method': row['check_in_method'] or 'manual',
                    'check_out_method': row['check_out_method'],
                    'purpose': row['purpose'],
                    'host_name': f"{row['host_first_name']} {row['host_last_name']}" if row['host_first_name'] else None,
                    'status': row['status']
                })
            return logs
        except Exception as e:
            logger.error(f"Error fetching visitor logs: {e}")
            raise e

    def search_visitors(self, name=None, host=None, date=None):
        """Search visitors by name, host, or date"""
        try:
            query = """
                SELECT
                    v.visitor_id as id,
                    CONCAT(v.first_name, ' ', v.last_name) as visitor_name,
                    v.email,
                    v.phone,
                    vc.check_in_time,
                    vc.check_out_time,
                    vc.check_in_method,
                    vc.check_out_method,
                    v.purpose_of_visit as purpose,
                    u.first_name as host_first_name,
                    u.last_name as host_last_name,
                    vc.status
                FROM visitors v
                LEFT JOIN visitor_checkins vc ON v.visitor_id = vc.visitor_id
                LEFT JOIN users u ON v.employee_to_visit = u.id
                WHERE 1=1
            """
            params = []

            if name:
                query += " AND (v.first_name LIKE %s OR v.last_name LIKE %s)"
                params.extend([f'%{name}%', f'%{name}%'])

            if host:
                query += " AND (u.first_name LIKE %s OR u.last_name LIKE %s)"
                params.extend([f'%{host}%', f'%{host}%'])

            if date:
                query += " AND DATE(vc.check_in_time) = %s"
                params.append(date)

            query += " ORDER BY vc.check_in_time DESC"

            results = self.db.execute_query(query, params)
            logs = []
            for row in results:
                logs.append({
                    'id': row['id'],
                    'visitor_name': row['visitor_name'],
                    'email': row['email'],
                    'phone': row['phone'],
                    'check_in_time': row['check_in_time'].isoformat() if row['check_in_time'] else None,
                    'check_out_time': row['check_out_time'].isoformat() if row['check_out_time'] else None,
                    'check_in_method': row['check_in_method'] or 'manual',
                    'check_out_method': row['check_out_method'],
                    'purpose': row['purpose'],
                    'host_name': f"{row['host_first_name']} {row['host_last_name']}" if row['host_first_name'] else None,
                    'status': row['status']
                })
            return logs
        except Exception as e:
            logger.error(f"Error searching visitors: {e}")
            raise e
