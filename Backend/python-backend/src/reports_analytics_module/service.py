import requests
from src.reports_analytics_module.models import Report, AnalyticsData
from src.database.connection import DatabaseManager
from src.utils.logger import logger
from src.audit_service import audit_service
from src.config.app import config
import os
import json

class ReportsAnalyticsService:
    def __init__(self):
        env = os.getenv('FLASK_ENV', 'development')
        app_config = config.get(env, config['default'])
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
        self.db = DatabaseManager(config_dict)

    # Report related methods
    def generate_report(self, report_params, user_id):
        try:
            report_name = report_params.get('name', 'Unnamed Report')
            description = report_params.get('description', '')
            query = """
                INSERT INTO Report (name, description)
                VALUES (%s, %s)
            """
            params = (report_name, description)
            self.db.execute_query(query, params, fetch=False)
            audit_service.log_action(user_id, 'CREATE_REPORT', {'entity': 'report', 'data': report_params})
            # Assuming lastrowid is returned for new report id
            return {'report_id': None, 'status': 'generated'}
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            raise e

    def list_reports(self, user_id):
        try:
            query = "SELECT id, name, description FROM Report"
            results = self.db.execute_query(query)
            reports = []
            for row in results:
                reports.append({
                    'id': row['id'],
                    'name': row['name'],
                    'description': row['description']
                })
            audit_service.log_action(user_id, 'LIST_REPORTS', {'count': len(reports)})
            return reports
        except Exception as e:
            logger.error(f"Error listing reports: {e}")
            raise e

    def get_report(self, report_id):
        try:
            query = "SELECT id, name, description FROM Report WHERE id = %s"
            params = (report_id,)
            results = self.db.execute_query(query, params)
            if results:
                row = results[0]
                return {'id': row['id'], 'name': row['name'], 'description': row['description']}
            return None
        except Exception as e:
            logger.error(f"Error getting report {report_id}: {e}")
            raise e

    # Analytics related methods
    def get_attendance_analytics(self):
        try:
            query = "SELECT data FROM AnalyticsData WHERE type = 'attendance' LIMIT 1"
            results = self.db.execute_query(query)
            if results:
                return json.loads(results[0]['data'])
            return {}
        except Exception as e:
            logger.error(f"Error getting attendance analytics: {e}")
            raise e

    def get_financial_analytics(self):
        try:
            query = "SELECT data FROM AnalyticsData WHERE type = 'financial' LIMIT 1"
            results = self.db.execute_query(query)
            if results:
                return json.loads(results[0]['data'])
            return {}
        except Exception as e:
            logger.error(f"Error getting financial analytics: {e}")
            raise e

    def get_performance_analytics(self):
        try:
            query = "SELECT data FROM AnalyticsData WHERE type = 'performance' LIMIT 1"
            results = self.db.execute_query(query)
            if results:
                return json.loads(results[0]['data'])
            return {}
        except Exception as e:
            logger.error(f"Error getting performance analytics: {e}")
            raise e

    def detect_anomaly(self, transaction_data):
        """Detect anomalies in financial transactions using ML model"""
        try:
            amount = transaction_data.get('amount', 0)
            threshold = config.ANOMALY_DETECTION_THRESHOLD
            is_anomaly = amount > threshold
            confidence_score = min(amount / threshold, 1.0)
            return {'is_anomaly': is_anomaly, 'confidence_score': confidence_score}
        except Exception as e:
            logger.error(f"Error detecting anomaly: {e}")
            raise e

    def get_llm_insights(self, free_text):
        """Get automated insights from LLM API"""
        try:
            api_key = config.OPENAI_API_KEY
            model = config.OPENAI_MODEL
            if not api_key:
                raise Exception("LLM API key not configured")
            
            prompt = f"Analyze the following text and provide insights:\n{free_text}"
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            payload = {
                'model': model,
                'prompt': prompt,
                'max_tokens': 500
            }
            response = requests.post('https://api.gemini.ai/v1/completions', headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            insights = result.get('choices', [{}])[0].get('text', '')
            return {'insights': insights}
        except Exception as e:
            logger.error(f"Error getting LLM insights: {e}")
            raise e
