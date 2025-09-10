from datetime import datetime
from src.utils.logger import logger
from src.config.app import config as app_config_dict

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

    def check_in_visitor(self, visitor_data):
        try:
            visitor_name = visitor_data.get('visitor_name')
            if not visitor_name:
                return False, "Visitor name is required"
            query = """
                INSERT INTO VisitorCheckIn (visitor_name, check_in_time, checked_out)
                VALUES (%s, NOW(), FALSE)
            """
            params = (visitor_name,)
            self.db.execute_query(query, params, fetch=False)
            # Assuming lastrowid is returned for new check-in id
            return True, None
        except Exception as e:
            logger.error(f"Error checking in visitor: {e}")
            return False, str(e)

    def check_out_visitor(self, visitor_id):
        try:
            # Update check-in record to mark checked_out and set check_out_time
            query_update = """
                UPDATE VisitorCheckIn
                SET checked_out = TRUE, check_out_time = NOW()
                WHERE id = %s AND checked_out = FALSE
            """
            params_update = (visitor_id,)
            self.db.execute_query(query_update, params_update, fetch=False)

            # Insert into VisitorLog
            query_insert_log = """
                INSERT INTO VisitorLog (visitor_name, check_in_time, check_out_time)
                SELECT visitor_name, check_in_time, check_out_time
                FROM VisitorCheckIn
                WHERE id = %s
            """
            params_log = (visitor_id,)
            self.db.execute_query(query_insert_log, params_log, fetch=False)

            return True, None
        except Exception as e:
            logger.error(f"Error checking out visitor: {e}")
            return False, str(e)

    def get_current_visitors(self):
        try:
            query = """
                SELECT id, visitor_name, check_in_time
                FROM VisitorCheckIn
                WHERE checked_out = FALSE
            """
            results = self.db.execute_query(query)
            visitors = []
            for row in results:
                visitors.append({
                    'id': row['id'],
                    'visitor_name': row['visitor_name'],
                    'check_in_time': row['check_in_time'].isoformat() if row['check_in_time'] else None
                })
            return visitors
        except Exception as e:
            logger.error(f"Error fetching current visitors: {e}")
            raise e

    def get_visitor_logs(self):
        try:
            query = """
                SELECT id, visitor_name, check_in_time, check_out_time
                FROM VisitorLog
            """
            results = self.db.execute_query(query)
            logs = []
            for row in results:
                logs.append({
                    'id': row['id'],
                    'visitor_name': row['visitor_name'],
                    'check_in_time': row['check_in_time'].isoformat() if row['check_in_time'] else None,
                    'check_out_time': row['check_out_time'].isoformat() if row['check_out_time'] else None
                })
            return logs
        except Exception as e:
            logger.error(f"Error fetching visitor logs: {e}")
            raise e
