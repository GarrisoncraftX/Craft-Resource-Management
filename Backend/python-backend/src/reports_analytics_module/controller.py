from flask import request, g, send_file
from src.reports_analytics_module.service import ReportsAnalyticsService
from src.utils.logger import logger
import io

class ReportsController:
    def __init__(self):
        self.reports_service = ReportsAnalyticsService()

    def generate_report(self):
        try:
            report_params = request.get_json()
            user_id = g.user_id
            result = self.reports_service.generate_report(report_params, user_id)
            return {'success': True, 'message': 'Report generated successfully', 'data': result}, 200
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return {'success': False, 'message': 'Failed to generate report'}, 500

    def list_reports(self):
        try:
            user_id = g.user_id
            reports = self.reports_service.list_reports(user_id)
            return {'success': True, 'reports': reports}, 200
        except Exception as e:
            logger.error(f"Error listing reports: {e}")
            return {'success': False, 'message': 'Failed to list reports'}, 500

    def get_report(self, report_id):
        try:
            report = self.reports_service.get_report(report_id)
            return {'success': True, 'report_id': report_id, 'data': report}, 200
        except Exception as e:
            logger.error(f"Error getting report {report_id}: {e}")
            return {'success': False, 'message': 'Failed to get report'}, 500

    def delete_report(self, report_id):
        try:
            user_id = g.user_id
            self.reports_service.delete_report(report_id, user_id)
            return {'success': True, 'message': 'Report deleted successfully'}, 200
        except Exception as e:
            logger.error(f"Error deleting report {report_id}: {e}")
            return {'success': False, 'message': 'Failed to delete report'}, 500

    def download_report(self, report_id):
        try:
            file_data = self.reports_service.download_report(report_id)
            return send_file(io.BytesIO(file_data), mimetype='application/pdf', as_attachment=True, download_name=f'report-{report_id}.pdf')
        except Exception as e:
            logger.error(f"Error downloading report {report_id}: {e}")
            return {'success': False, 'message': 'Failed to download report'}, 500

class AnalyticsController:
    def __init__(self):
        self.analytics_service = ReportsAnalyticsService()

    def get_monthly_trends(self):
        try:
            data = self.analytics_service.get_monthly_trends()
            return {'success': True, 'data': data}, 200
        except Exception as e:
            logger.error(f"Error getting monthly trends: {e}")
            return {'success': False, 'message': 'Failed to get monthly trends'}, 500

    def get_ai_insights(self):
        try:
            data = self.analytics_service.get_ai_insights()
            return {'success': True, 'data': data}, 200
        except Exception as e:
            logger.error(f"Error getting AI insights: {e}")
            return {'success': False, 'message': 'Failed to get AI insights'}, 500

    def get_kpis(self):
        try:
            data = self.analytics_service.get_kpis()
            return {'success': True, 'data': data}, 200
        except Exception as e:
            logger.error(f"Error getting KPIs: {e}")
            return {'success': False, 'message': 'Failed to get KPIs'}, 500

    def get_attendance_analytics(self):
        try:
            data = self.analytics_service.get_attendance_analytics()
            return {'success': True, 'data': data}, 200
        except Exception as e:
            logger.error(f"Error getting attendance analytics: {e}")
            return {'success': False, 'message': 'Failed to get attendance analytics'}, 500

    def get_financial_analytics(self):
        try:
            data = self.analytics_service.get_financial_analytics()
            return {'success': True, 'data': data}, 200
        except Exception as e:
            logger.error(f"Error getting financial analytics: {e}")
            return {'success': False, 'message': 'Failed to get financial analytics'}, 500

    def get_performance_analytics(self):
        try:
            data = self.analytics_service.get_performance_analytics()
            return {'success': True, 'data': data}, 200
        except Exception as e:
            logger.error(f"Error getting performance analytics: {e}")
            return {'success': False, 'message': 'Failed to get performance analytics'}, 500

    def detect_anomaly(self):
        try:
            transaction_data = request.get_json()
            result = self.analytics_service.detect_anomaly(transaction_data)
            return {'success': True, 'data': result}, 200
        except Exception as e:
            logger.error(f"Error detecting anomaly: {e}")
            return {'success': False, 'message': 'Failed to detect anomaly'}, 500

    def get_llm_insights(self):
        try:
            data = request.get_json()
            free_text = data.get('text', '')
            result = self.analytics_service.get_llm_insights(free_text)
            return {'success': True, 'data': result}, 200
        except Exception as e:
            logger.error(f"Error getting LLM insights: {e}")
            return {'success': False, 'message': 'Failed to get LLM insights'}, 500
