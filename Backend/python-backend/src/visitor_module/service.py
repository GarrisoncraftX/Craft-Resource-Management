from datetime import datetime, timedelta, timezone
import uuid
import hashlib
import base64
import json
from src.utils.logger import logger
from src.config.app import config as app_config_dict
from src.communication_service import communication_service
from src.audit_service import audit_service
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

    def generate_qr_token(self):
        """Generate a dynamic QR token that expires in 10 seconds"""
        try:
            token = str(uuid.uuid4())
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=10)

            query = """
                INSERT INTO qr_tokens (token, expires_at, is_used)
                VALUES (%s, %s, 0)
            """
            self.db.execute_query(query, (token, expires_at), fetch=False)

            # Generate check-in URL for the QR code
            check_in_url = f"/visitor-checkin?token={token}"

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
            now = datetime.now(timezone.utc)

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
            full_name = visitor_data.get('full_name')
            contact_number = visitor_data.get('contact_number')
            email = visitor_data.get('email')
            visiting_employee_id = visitor_data.get('visiting_employee_id')
            purpose_of_visit = visitor_data.get('purpose_of_visit')
            qr_token = visitor_data.get('qr_token')

            # Validate required fields
            if not all([full_name, contact_number, visiting_employee_id, purpose_of_visit]):
                return False, "Missing required fields"

            # Validate QR token if provided
            if qr_token:
                token_valid = self.validate_qr_token(qr_token)
                if not token_valid['valid']:
                    return False, token_valid['message']

            # Insert visitor record with check-in time
            visitor_query = """
                INSERT INTO visitors (full_name, contact_number, email, visiting_employee_id, purpose_of_visit, check_in_time, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), 'Checked In', NOW(), NOW())
            """
            visitor_params = (full_name, contact_number, email, visiting_employee_id, purpose_of_visit)
            visitor_result = self.db.execute_query(visitor_query, visitor_params, fetch=False)

            # Log the visitor insertion result for audit purposes
            logger.info(f"Visitor record inserted successfully, result: {visitor_result}")

            # Get the inserted visitor ID
            visitor_id_query = "SELECT LAST_INSERT_ID() as visitor_id"
            visitor_id_result = self.db.execute_query(visitor_id_query)
            visitor_id = visitor_id_result[0]['visitor_id']

            # Insert check-in record
            checkin_query = """
                INSERT INTO visitor_checkins (visitor_id, check_in_time, check_in_method, purpose, host_employee_id, status, created_at, updated_at)
                VALUES (%s, NOW(), %s, %s, %s, 'checked_in', NOW(), NOW())
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

            # Send notification to visitor if email provided
            if email:
                self._send_visitor_notification(visitor_id, visitor_data)

            if user_id:
                audit_service.log_action(user_id, 'CHECK_IN_VISITOR', {'entity': 'visitor', 'id': visitor_id, 'data': visitor_data})
            logger.info(f"Visitor {full_name} checked in successfully with ID {visitor_id}")
            return True, visitor_id
        except Exception as e:
            logger.error(f"Error checking in visitor: {e}")
            return False, str(e)

    def _send_host_notification(self, visitor_id, visitor_data):
        """Send notification to the host employee about visitor arrival"""
        try:
            # Get host employee details
            host_query = """
                SELECT first_name, last_name, email FROM users
                WHERE id = %s
            """
            host_result = self.db.execute_query(host_query, (visitor_data['visiting_employee_id'],))

            if host_result:
                host = host_result[0]
                host_name = f"{host['first_name']} {host['last_name']}"
                host_email = host['email']

                # Send email notification to host
                subject = "Visitor Check-in Notification"
                message = f"""
                Dear {host_name},

                A visitor has checked in and is waiting for you.

                Visitor Details:
                - Name: {visitor_data['full_name']}
                - Contact: {visitor_data['contact_number']}
                - Email: {visitor_data.get('email', 'Not provided')}
                - Purpose: {visitor_data['purpose_of_visit']}
                - Check-in Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}

                Please meet your visitor at the reception area.

                Best regards,
                Visitor Management System
                """

                communication_service.send_email(host_email, subject, message)

                logger.info(f"Host notification sent to {host_name} ({host_email})")

        except Exception as e:
            logger.error(f"Error sending host notification: {e}")

    def _send_visitor_notification(self, visitor_id, visitor_data):
        """Send notification to the visitor about successful check-in"""
        try:
            # Send email notification to visitor
            subject = "Visitor Check-in Confirmation"
            message = f"""
            Dear {visitor_data['full_name']},

            Your check-in has been completed successfully.

            Check-in Details:
            - Check-in Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}
            - Purpose: {visitor_data['purpose_of_visit']}
            - Contact: {visitor_data['contact_number']}

            Your host has been notified and will meet you shortly.

            Please show your entry pass QR code at security checkpoints.

            Best regards,
            Visitor Management System
            """

            communication_service.send_email(visitor_data['email'], subject, message)

            logger.info(f"Visitor notification sent to {visitor_data['full_name']} ({visitor_data['email']})")

        except Exception as e:
            logger.error(f"Error sending visitor notification: {e}")

    def generate_visitor_entry_pass(self, visitor_id):
        """Generate an entry pass for the visitor"""
        try:
            # Get visitor details
            visitor_query = """
                SELECT full_name, check_in_time, purpose_of_visit,
                       u.first_name as host_first_name, u.last_name as host_last_name
                FROM visitors v
                LEFT JOIN users u ON v.visiting_employee_id = u.id
                WHERE v.visitor_id = %s
            """
            visitor_result = self.db.execute_query(visitor_query, (visitor_id,))

            if not visitor_result:
                return None

            visitor = visitor_result[0]

            # Generate entry pass data
            entry_pass = {
                'visitor_id': visitor_id,
                'visitor_name': visitor['full_name'],
                'host_name': f"{visitor['host_first_name']} {visitor['host_last_name']}",
                'purpose': visitor['purpose_of_visit'],
                'check_in_time': visitor['check_in_time'].isoformat() if visitor['check_in_time'] else None,
                'valid_until': (datetime.utcnow() + timedelta(hours=8)).isoformat(),  # Valid for 8 hours
                'issued_at': datetime.utcnow().isoformat()
            }

            # Generate QR code data for entry pass
            qr_data = base64.b64encode(json.dumps({
                'type': 'visitor_entry_pass',
                'visitor_id': visitor_id,
                'valid_until': entry_pass['valid_until']
            }).encode()).decode()

            entry_pass['qr_code'] = qr_data

            return entry_pass

        except Exception as e:
            logger.error(f"Error generating visitor entry pass: {e}")
            return None

    def check_out_visitor(self, visitor_id, user_id):
        """Check out a visitor"""
        try:

            query_update = """
                UPDATE visitors
                SET status = 'Checked Out', check_out_time = NOW(), updated_at = NOW()
                WHERE visitor_id = %s AND status = 'Checked In'
            """
            params_update = (visitor_id,)
            affected_rows = self.db.execute_query(query_update, params_update, fetch=False)

            if affected_rows == 0:
                return False, "Visitor not found or already checked out"

            # Also update the check-in record for audit purposes
            query_update_checkin = """
                UPDATE visitor_checkins
                SET status = 'checked_out', check_out_time = NOW(), check_out_method = 'manual', updated_at = NOW()
                WHERE visitor_id = %s AND status = 'checked_in'
            """
            self.db.execute_query(query_update_checkin, (visitor_id,), fetch=False)

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
                    v.full_name as visitor_name,
                    v.email,
                    v.contact_number as phone,
                    v.check_in_time,
                    v.purpose_of_visit as purpose,
                    u.first_name as host_first_name,
                    u.last_name as host_last_name
                FROM visitors v
                LEFT JOIN users u ON v.visiting_employee_id = u.id
                WHERE v.status = 'Checked In'
                ORDER BY v.check_in_time DESC
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
                    v.full_name as visitor_name,
                    v.email,
                    v.contact_number as phone,
                    v.check_in_time,
                    v.check_out_time,
                    v.purpose_of_visit as purpose,
                    u.first_name as host_first_name,
                    u.last_name as host_last_name,
                    v.status
                FROM visitors v
                LEFT JOIN users u ON v.visiting_employee_id = u.id
                ORDER BY v.check_in_time DESC
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
                    'check_in_method': 'qr' if row.get('check_in_method') == 'qr' else 'manual',
                    'check_out_method': 'manual',
                    'purpose': row['purpose'],
                    'host_name': f"{row['host_first_name']} {row['host_last_name']}" if row['host_first_name'] else None,
                    'status': row['status']
                })
            return logs
        except Exception as e:
            logger.error(f"Error fetching visitor logs: {e}")
            raise e
