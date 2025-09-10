from flask import jsonify
from src.dashboard_module.service import DashboardService
from src.utils.logger import logger

class DashboardController:
    def __init__(self):
        self.service = DashboardService()

    def get_dashboard_data(self):
        try:
            data = self.service.get_dashboard_data()
            return {'success': True, 'dashboard_data': data}, 200
        except Exception as e:
            logger.error(f"Error fetching dashboard data: {e}")
            return {'success': False, 'message': 'Failed to fetch dashboard data'}, 500

    def get_dashboard_widgets(self):
        try:
            widgets = self.service.get_dashboard_widgets()
            return {'success': True, 'dashboard_widgets': widgets}, 200
        except Exception as e:
            logger.error(f"Error fetching dashboard widgets: {e}")
            return {'success': False, 'message': 'Failed to fetch dashboard widgets'}, 500
