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
                INSERT INTO biometrics (user_id, visitor_id, biometric_type, template_data, template_hash, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            biometric_id = self.db.execute_query(
                query, 
                (user_id, visitor_id, biometric_type, template_data, template_hash, datetime.now()),
                fetch=False
            )
            
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
                SELECT template_data FROM biometrics 
                WHERE user_id = %s AND biometric_type = %s
                ORDER BY created_at DESC LIMIT 1
            """
            
            result = self.db.execute_query(query, (user_id, biometric_type))
            
            if result:
                return result[0]['template_data']
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving biometric template: {e}")
            raise e
    
    def get_all_templates(self, biometric_type: str) -> List[Dict[str, Any]]:
        """Retrieve all stored templates of a specific type for identification"""
        try:
            query = """
                SELECT b.user_id, b.template_data, u.first_name, u.last_name, u.employee_id
                FROM biometrics b
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.biometric_type = %s AND b.user_id IS NOT NULL
            """
            
            results = self.db.execute_query(query, (biometric_type,))
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
                           action: str, success: bool, details: Optional[Dict] = None):
        """Log biometric access attempts"""
        try:
            query = """
                INSERT INTO biometric_access_logs (user_id, biometric_type, action, success, details, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            self.db.execute_query(
                query, 
                (user_id, biometric_type, action, success, json.dumps(details) if details else None, datetime.now()),
                fetch=False
            )
            
        except Exception as e:
            logger.error(f"Error logging biometric access: {e}")
            # Don't raise here as this is just logging
    
    def get_biometric_statistics(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Get biometric system statistics"""
        try:
            base_query = """
                SELECT 
                    COUNT(*) as total_enrollments,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(CASE WHEN biometric_type = 'face' THEN 1 END) as face_enrollments,
                    COUNT(CASE WHEN biometric_type = 'fingerprint' THEN 1 END) as fingerprint_enrollments,
                    COUNT(CASE WHEN biometric_type = 'card' THEN 1 END) as card_enrollments
                FROM biometrics
                WHERE user_id IS NOT NULL
            """
            
            params = []
            
            if filters:
                if filters.get('start_date'):
                    base_query += " AND created_at >= %s"
                    params.append(filters['start_date'])
                
                if filters.get('end_date'):
                    base_query += " AND created_at <= %s"
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
                'fingerprint_enrollments': 0,
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
                DELETE FROM biometrics 
                WHERE user_id = %s AND biometric_type = %s
            """
            
            affected_rows = self.db.execute_query(query, (user_id, biometric_type), fetch=False)
            
            logger.info(f"Deleted {affected_rows} biometric template(s) for user {user_id}")
            return affected_rows > 0
            
        except Exception as e:
            logger.error(f"Error deleting biometric template: {e}")
            raise e
