from src.utils.logger import logger
import os

class HealthSafetyService:
    def __init__(self, config=None):
        if config is None:
            from src.config.app import config as app_config_dict
            env = os.getenv('FLASK_ENV', 'development')
            app_config = app_config_dict.get(env, app_config_dict['default'])
            config = {
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
        self.db = DatabaseManager(config)

    def fetch_incidents(self):
        try:
            query = "SELECT id, reporter_name, incident_date, description, severity FROM IncidentReport"
            results = self.db.execute_query(query)
            incidents = []
            for row in results:
                incidents.append({
                    'id': row['id'],
                    'reporter_name': row['reporter_name'],
                    'incident_date': row['incident_date'].isoformat() if row['incident_date'] else None,
                    'description': row['description'],
                    'severity': row['severity']
                })
            return incidents
        except Exception as e:
            logger.error(f"Error fetching incidents from DB: {e}")
            raise e

    def add_incident(self, incident_data):
        try:
            query = """
                INSERT INTO IncidentReport (reporter_name, incident_date, description, severity)
                VALUES (%s, %s, %s, %s)
            """
            params = (
                incident_data.get('reporter_name'),
                incident_data.get('incident_date'),
                incident_data.get('description'),
                incident_data.get('severity')
            )
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error adding incident to DB: {e}")
            return False

    def fetch_inspections(self):
        try:
            query = "SELECT id, inspector_name, inspection_date, location, notes FROM SafetyInspection"
            results = self.db.execute_query(query)
            inspections = []
            for row in results:
                inspections.append({
                    'id': row['id'],
                    'inspector_name': row['inspector_name'],
                    'inspection_date': row['inspection_date'].isoformat() if row['inspection_date'] else None,
                    'location': row['location'],
                    'notes': row['notes']
                })
            return inspections
        except Exception as e:
            logger.error(f"Error fetching inspections from DB: {e}")
            raise e

    def add_inspection(self, inspection_data):
        try:
            query = """
                INSERT INTO SafetyInspection (inspector_name, inspection_date, location, notes)
                VALUES (%s, %s, %s, %s)
            """
            params = (
                inspection_data.get('inspector_name'),
                inspection_data.get('inspection_date'),
                inspection_data.get('location'),
                inspection_data.get('notes')
            )
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error adding inspection to DB: {e}")
            return False

    def fetch_trainings(self):
        try:
            query = "SELECT id, training_name, trainer_name, training_date, description FROM SafetyTraining"
            results = self.db.execute_query(query)
            trainings = []
            for row in results:
                trainings.append({
                    'id': row['id'],
                    'training_name': row['training_name'],
                    'trainer_name': row['trainer_name'],
                    'training_date': row['training_date'].isoformat() if row['training_date'] else None,
                    'description': row['description']
                })
            return trainings
        except Exception as e:
            logger.error(f"Error fetching trainings from DB: {e}")
            raise e

    def add_training(self, training_data):
        try:
            query = """
                INSERT INTO SafetyTraining (training_name, trainer_name, training_date, description)
                VALUES (%s, %s, %s, %s)
            """
            params = (
                training_data.get('training_name'),
                training_data.get('trainer_name'),
                training_data.get('training_date'),
                training_data.get('description')
            )
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error adding training to DB: {e}")
            return False

    def update_training(self, training_id, training_data):
        try:
            query = """
                UPDATE SafetyTraining
                SET training_name = %s, trainer_name = %s, training_date = %s, description = %s
                WHERE id = %s
            """
            params = (
                training_data.get('training_name'),
                training_data.get('trainer_name'),
                training_data.get('training_date'),
                training_data.get('description'),
                training_id
            )
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error updating training in DB: {e}")
            return False

    def delete_training(self, training_id):
        try:
            query = "DELETE FROM SafetyTraining WHERE id = %s"
            params = (training_id,)
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error deleting training from DB: {e}")
            return False

    def fetch_environmental_health_records(self):
        try:
            query = "SELECT id, record_type, record_date, details FROM EnvironmentalHealthRecord"
            results = self.db.execute_query(query)
            records = []
            for row in results:
                records.append({
                    'id': row['id'],
                    'record_type': row['record_type'],
                    'record_date': row['record_date'].isoformat() if row['record_date'] else None,
                    'details': row['details']
                })
            return records
        except Exception as e:
            logger.error(f"Error fetching environmental health records from DB: {e}")
            raise e

    def add_environmental_health_record(self, record_data):
        try:
            query = """
                INSERT INTO EnvironmentalHealthRecord (record_type, record_date, details)
                VALUES (%s, %s, %s)
            """
            params = (
                record_data.get('record_type'),
                record_data.get('record_date'),
                record_data.get('details')
            )
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error adding environmental health record to DB: {e}")
            return False

    def update_environmental_health_record(self, record_id, record_data):
        try:
            query = """
                UPDATE EnvironmentalHealthRecord
                SET record_type = %s, record_date = %s, details = %s
                WHERE id = %s
            """
            params = (
                record_data.get('record_type'),
                record_data.get('record_date'),
                record_data.get('details'),
                record_id
            )
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error updating environmental health record in DB: {e}")
            return False

    def delete_environmental_health_record(self, record_id):
        try:
            query = "DELETE FROM EnvironmentalHealthRecord WHERE id = %s"
            params = (record_id,)
            self.db.execute_query(query, params, fetch=False)
            return True
        except Exception as e:
            logger.error(f"Error deleting environmental health record from DB: {e}")
            return False
