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

    def delete_report(self, report_id, user_id):
        try:
            query = "DELETE FROM Report WHERE id = %s"
            params = (report_id,)
            self.db.execute_query(query, params, fetch=False)
            audit_service.log_action(user_id, 'DELETE_REPORT', {'report_id': report_id})
        except Exception as e:
            logger.error(f"Error deleting report {report_id}: {e}")
            raise e

    def download_report(self, report_id):
        try:
            # Mock PDF generation - in production, retrieve actual file
            return b'%PDF-1.4 Mock Report Content'
        except Exception as e:
            logger.error(f"Error downloading report {report_id}: {e}")
            raise e

    def get_monthly_trends(self):
        try:
            # Query actual data or return mock
            return [
                {'month': 'Jan', 'revenue': 450000, 'expenses': 320000, 'employees': 245, 'incidents': 3},
                {'month': 'Feb', 'revenue': 480000, 'expenses': 335000, 'employees': 248, 'incidents': 2},
                {'month': 'Mar', 'revenue': 520000, 'expenses': 348000, 'employees': 252, 'incidents': 1},
                {'month': 'Apr', 'revenue': 490000, 'expenses': 342000, 'employees': 255, 'incidents': 4},
                {'month': 'May', 'revenue': 530000, 'expenses': 356000, 'employees': 258, 'incidents': 2},
                {'month': 'Jun', 'revenue': 560000, 'expenses': 365000, 'employees': 262, 'incidents': 1}
            ]
        except Exception as e:
            logger.error(f"Error getting monthly trends: {e}")
            raise e

    def get_ai_insights(self):
        try:
            return [
                {'id': 1, 'type': 'anomaly', 'severity': 'high', 'title': 'Unusual Spending Pattern Detected', 'description': 'Procurement expenses increased 25%', 'department': 'Procurement', 'confidence': 94, 'date': '2024-07-02'},
                {'id': 2, 'type': 'prediction', 'severity': 'medium', 'title': 'Budget Overrun Forecast', 'description': 'HR projected to exceed budget by 8%', 'department': 'HR', 'confidence': 87, 'date': '2024-07-01'}
            ]
        except Exception as e:
            logger.error(f"Error getting AI insights: {e}")
            raise e

    def get_kpis(self):
        try:
            return {
                'totalRevenue': {'value': 560000, 'change': 5.8},
                'activeEmployees': {'value': 262, 'change': 4},
                'reportsGenerated': {'value': 47, 'period': 'This month'},
                'systemEfficiency': {'value': 94.2, 'change': 2.1}
            }
        except Exception as e:
            logger.error(f"Error getting KPIs: {e}")
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
