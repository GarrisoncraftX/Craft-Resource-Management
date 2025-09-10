from flask import request
from src.health_safety_module.service import HealthSafetyService
from src.utils.logger import logger
from src.config.app import config
import os

env = os.getenv('FLASK_ENV', 'development')
app_config = config.get(env, config['default'])

# Create filtered config dict with only valid keys for MySQLConnectionPool
config_dict = {
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

class HealthSafetyController:
    def __init__(self):
        from src.database.connection import DatabaseManager
        self.db = DatabaseManager(config_dict)
        self.service = HealthSafetyService(config_dict)

    def get_incidents(self):
        try:
            incidents = self.service.fetch_incidents()
            return {'success': True, 'incidents': incidents}, 200
        except Exception as e:
            logger.error(f"Error fetching incidents: {e}")
            return {'success': False, 'message': 'Failed to fetch incidents'}, 500

    def create_incident(self):
        try:
            incident_data = request.get_json()
            success = self.service.add_incident(incident_data)
            if success:
                return {'success': True, 'message': 'Incident created'}, 201
            else:
                return {'success': False, 'message': 'Failed to create incident'}, 400
        except Exception as e:
            logger.error(f"Error creating incident: {e}")
            return {'success': False, 'message': 'Failed to create incident'}, 500

    def get_inspections(self):
        try:
            inspections = self.service.fetch_inspections()
            return {'success': True, 'inspections': inspections}, 200
        except Exception as e:
            logger.error(f"Error fetching inspections: {e}")
            return {'success': False, 'message': 'Failed to fetch inspections'}, 500

    def create_inspection(self):
        try:
            inspection_data = request.get_json()
            success = self.service.add_inspection(inspection_data)
            if success:
                return {'success': True, 'message': 'Inspection created'}, 201
            else:
                return {'success': False, 'message': 'Failed to create inspection'}, 400
        except Exception as e:
            logger.error(f"Error creating inspection: {e}")
            return {'success': False, 'message': 'Failed to create inspection'}, 500

    def get_trainings(self):
        try:
            trainings = self.service.fetch_trainings()
            return {'success': True, 'trainings': trainings}, 200
        except Exception as e:
            logger.error(f"Error fetching trainings: {e}")
            return {'success': False, 'message': 'Failed to fetch trainings'}, 500

    def create_training(self):
        try:
            training_data = request.get_json()
            success = self.service.add_training(training_data)
            if success:
                return {'success': True, 'message': 'Training created'}, 201
            else:
                return {'success': False, 'message': 'Failed to create training'}, 400
        except Exception as e:
            logger.error(f"Error creating training: {e}")
            return {'success': False, 'message': 'Failed to create training'}, 500

    def update_training(self, training_id):
        try:
            training_data = request.get_json()
            success = self.service.update_training(training_id, training_data)
            if success:
                return {'success': True, 'message': 'Training updated'}, 200
            else:
                return {'success': False, 'message': 'Failed to update training'}, 400
        except Exception as e:
            logger.error(f"Error updating training: {e}")
            return {'success': False, 'message': 'Failed to update training'}, 500

    def delete_training(self, training_id):
        try:
            success = self.service.delete_training(training_id)
            if success:
                return {'success': True, 'message': 'Training deleted'}, 200
            else:
                return {'success': False, 'message': 'Failed to delete training'}, 400
        except Exception as e:
            logger.error(f"Error deleting training: {e}")
            return {'success': False, 'message': 'Failed to delete training'}, 500

    def get_environmental_health_records(self):
        try:
            records = self.service.fetch_environmental_health_records()
            return {'success': True, 'environmental_health_records': records}, 200
        except Exception as e:
            logger.error(f"Error fetching environmental health records: {e}")
            return {'success': False, 'message': 'Failed to fetch environmental health records'}, 500

    def create_environmental_health_record(self):
        try:
            record_data = request.get_json()
            success = self.service.add_environmental_health_record(record_data)
            if success:
                return {'success': True, 'message': 'Environmental health record created'}, 201
            else:
                return {'success': False, 'message': 'Failed to create environmental health record'}, 400
        except Exception as e:
            logger.error(f"Error creating environmental health record: {e}")
            return {'success': False, 'message': 'Failed to create environmental health record'}, 500

    def update_environmental_health_record(self, record_id):
        try:
            record_data = request.get_json()
            success = self.service.update_environmental_health_record(record_id, record_data)
            if success:
                return {'success': True, 'message': 'Environmental health record updated'}, 200
            else:
                return {'success': False, 'message': 'Failed to update environmental health record'}, 400
        except Exception as e:
            logger.error(f"Error updating environmental health record: {e}")
            return {'success': False, 'message': 'Failed to update environmental health record'}, 500

    def delete_environmental_health_record(self, record_id):
        try:
            success = self.service.delete_environmental_health_record(record_id)
            if success:
                return {'success': True, 'message': 'Environmental health record deleted'}, 200
            else:
                return {'success': False, 'message': 'Failed to delete environmental health record'}, 400
        except Exception as e:
            logger.error(f"Error deleting environmental health record: {e}")
            return {'success': False, 'message': 'Failed to delete environmental health record'}, 500
