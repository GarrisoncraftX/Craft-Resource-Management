from typing import Optional, Dict, Any, List, Tuple
import json
from datetime import datetime

from src.database.connection import DatabaseManager
from src.utils.logger import logger

class BiometricModel:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    def enroll_biometric(self, user_id: Optional[str], visitor_id: Optional[str],
                        biometric_type: str, template_data: str, template_hash: str) -> Dict[str, Any]:
        """Store biometric template in database"""
        try:
            query = """
                INSERT INTO biometric_templates (user_id, visitor_id, biometric_type, template_data, template_hash, enrollment_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            biometric_id = self.db.execute_query(
                query,
                (user_id, visitor_id, biometric_type, template_data, template_hash, datetime.now()),
                fetch=False
            )

            # Update user's biometric enrollment status if user_id is provided
            if user_id:
                update_query = """
                    UPDATE users
                    SET biometric_enrollment_status = 'ENROLLED', updated_at = %s
                    WHERE id = %s
                """
                self.db.execute_query(update_query, (datetime.now(), user_id), fetch=False)
                logger.info(f"Updated biometric enrollment status for user {user_id}")

            logger.info(f"Biometric enrolled successfully: {biometric_id}")

            return {
                'biometric_id': biometric_id,
                'template_hash': template_hash
            }

        except Exception as e:
            logger.error(f"Error enrolling biometric: {e}")
            raise e
    
    def get_biometric_template(self, user_id: str, biometric_type: str) -> Optional[str]:
        """Retrieve stored biometric template for user"""
        try:
            query = """
                SELECT template_data FROM biometric_templates
                WHERE user_id = %s AND biometric_type = %s
                ORDER BY enrollment_date DESC LIMIT 1
            """

            result = self.db.execute_query(query, (user_id, biometric_type))

            if result:
                template_data = result[0]['template_data']
                if isinstance(template_data, bytes):
                    return template_data
                return template_data
            return None

        except Exception as e:
            logger.error(f"Error retrieving biometric template: {e}")
            raise e
    
    def get_all_templates(self, biometric_type: str) -> List[Dict[str, Any]]:
        """Retrieve all stored templates of a specific type for identification"""
        try:
            query = """
                SELECT b.user_id, b.template_data, u.first_name, u.last_name, u.employee_id
                FROM biometric_templates b
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.biometric_type = %s AND b.user_id IS NOT NULL
            """

            results = self.db.execute_query(query, (biometric_type,))

            if results:
                # Handle BLOB data returned as bytes
                for result in results:
                    if isinstance(result['template_data'], bytes):
                        result['template_data'] = result['template_data'].decode('utf-8')

            return results or []

        except Exception as e:
            logger.error(f"Error retrieving all templates: {e}")
            raise e
    
    def lookup_card(self, card_identifier: str) -> Optional[Dict[str, str]]:
        """Look up card holder information"""
        try:
            query = """
                SELECT holder_type, holder_id FROM id_cards 
                WHERE card_unique_identifier = %s AND is_active = TRUE
            """
            
            result = self.db.execute_query(query, (card_identifier,))
            
            if result:
                return {
                    'holder_type': result[0]['holder_type'],
                    'holder_id': result[0]['holder_id']
                }
            return None
            
        except Exception as e:
            logger.error(f"Error looking up card: {e}")
            raise e
    
    def log_biometric_access(self, user_id: Optional[str], biometric_type: str,
                           access_type: str, success: bool, details: Optional[Dict] = None):
        """Log biometric access attempts"""
        try:
            query = """
                INSERT INTO biometric_access_logs (user_id, biometric_type, access_type, success, additional_data, access_time)
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            self.db.execute_query(
                query,
                (user_id, biometric_type, access_type, success, json.dumps(details) if details else None, datetime.now()),
                fetch=False
            )

        except Exception as e:
            logger.error(f"Error logging biometric access: {e}")
            # Don't raise here as this is just logging

    def log_attendance(self, user_id: str, action: str, method: str, success: bool, details: Optional[Dict] = None):
        """Log attendance transactions for audit purposes"""
        try:
            query = """
                INSERT INTO attendance_audit_logs (user_id, action, method, success, details, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            self.db.execute_query(
                query,
                (user_id, action, method, success, json.dumps(details) if details else None, datetime.now()),
                fetch=False
            )

        except Exception as e:
            logger.error(f"Error logging attendance: {e}")
            # Don't raise here as this is just logging

    def get_employee_last_attendance(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get employee's last attendance record to determine check-in/out action"""
        try:
            query = """
                SELECT clock_in_time, clock_out_time, status
                FROM attendance_records
                WHERE user_id = %s
                ORDER BY clock_in_time DESC
                LIMIT 1
            """

            result = self.db.execute_query(query, (user_id,))

            if result:
                record = result[0]
                return {
                    'clock_in_time': record['clock_in_time'],
                    'clock_out_time': record['clock_out_time'],
                    'status': record.get('status', 'unknown')
                }
            return None

        except Exception as e:
            logger.error(f"Error getting last attendance for user {user_id}: {e}")
            raise e

    def record_attendance(self, user_id: str, action: str, method: str, location: Optional[str] = None) -> Dict[str, Any]:
        """Record attendance check-in or check-out"""
        try:
            now = datetime.now()

            if action == 'clock_in':
                # Insert new attendance record
                query = """
                    INSERT INTO attendance_records (user_id, clock_in_time, clock_in_method, status, created_at, updated_at)
                    VALUES (%s, %s, %s, 'present', %s, %s)
                """
                params = (user_id, now, method, now, now)
                record_id = self.db.execute_query(query, params, fetch=False)

                return {
                    'record_id': record_id,
                    'action': 'clock_in',
                    'timestamp': now.isoformat(),
                    'method': method
                }

            elif action == 'clock_out':
                # Update existing attendance record with clock out time
                query = """
                    UPDATE attendance_records
                    SET clock_out_time = %s, clock_out_method = %s, total_hours = TIMESTAMPDIFF(HOUR, clock_in_time, %s), updated_at = %s
                    WHERE user_id = %s AND clock_out_time IS NULL
                    ORDER BY clock_in_time DESC
                    LIMIT 1
                """
                params = (now, method, now, now, user_id)
                affected_rows = self.db.execute_query(query, params, fetch=False)

                if affected_rows == 0:
                    raise Exception("No open attendance record found for clock out")

                return {
                    'action': 'clock_out',
                    'timestamp': now.isoformat(),
                    'method': method
                }

            else:
                raise Exception(f"Invalid action: {action}")

        except Exception as e:
            logger.error(f"Error recording attendance for user {user_id}: {e}")
            raise e
    
    def get_biometric_statistics(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Get biometric system statistics"""
        try:
            base_query = """
                SELECT
                    COUNT(*) as total_enrollments,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(CASE WHEN biometric_type = 'face' THEN 1 END) as face_enrollments,
                    COUNT(CASE WHEN biometric_type = 'card' THEN 1 END) as card_enrollments
                FROM biometric_templates
                WHERE user_id IS NOT NULL
            """
            
            params = []
            
            if filters:
                if filters.get('start_date'):
                    base_query += " AND enrollment_date >= %s"
                    params.append(filters['start_date'])
                
                if filters.get('end_date'):
                    base_query += " AND enrollment_date <= %s"
                    params.append(filters['end_date'])
            
            result = self.db.execute_query(base_query, tuple(params))
            
            if result:
                stats = result[0]
                stats['generated_at'] = datetime.now().isoformat()
                return stats
            
            return {
                'total_enrollments': 0,
                'unique_users': 0,
                'face_enrollments': 0,
                'card_enrollments': 0,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting biometric statistics: {e}")
            raise e
    
    def delete_biometric_template(self, user_id: str, biometric_type: str) -> bool:
        """Delete biometric template for user"""
        try:
            query = """
                DELETE FROM biometric_templates
                WHERE user_id = %s AND biometric_type = %s
            """
            
            affected_rows = self.db.execute_query(query, (user_id, biometric_type), fetch=False)
            
            logger.info(f"Deleted {affected_rows} biometric template(s) for user {user_id}")
            return affected_rows > 0
            
        except Exception as e:
            logger.error(f"Error deleting biometric template: {e}")
            raise e
