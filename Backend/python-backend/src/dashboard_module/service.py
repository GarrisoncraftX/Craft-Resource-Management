from src.dashboard_module.models import DashboardData, DashboardWidget
from src.database.connection import DatabaseManager
from src.utils.logger import logger
from src.config.app import config
import os

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

class DashboardService:
    def __init__(self):
        self.db = DatabaseManager(config_dict)

    def get_dashboard_data(self):
        try:
            query = "SELECT id, data_key, data_value FROM DashboardData"
            results = self.db.execute_query(query)
            data = []
            for row in results:
                data.append({
                    'id': row['id'],
                    'data_key': row['data_key'],
                    'data_value': row['data_value']
                })
            return data
        except Exception as e:
            logger.error(f"Error fetching dashboard data: {e}")
            raise e

    def get_dashboard_widgets(self):
        try:
            query = "SELECT id, widget_name, widget_config FROM DashboardWidget"
            results = self.db.execute_query(query)
            widgets = []
            for row in results:
                widgets.append({
                    'id': row['id'],
                    'widget_name': row['widget_name'],
                    'widget_config': row['widget_config']
                })
            return widgets
        except Exception as e:
            logger.error(f"Error fetching dashboard widgets: {e}")
            raise e
