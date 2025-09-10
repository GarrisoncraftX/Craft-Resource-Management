from flask import Blueprint, request, jsonify
from src.reports_analytics_module.controller import ReportsController, AnalyticsController
from src.middleware.auth import auth_required as require_auth

reports_analytics_bp = Blueprint('reports_analytics', __name__)

reports_controller = ReportsController()
analytics_controller = AnalyticsController()

@reports_analytics_bp.route('/reports', methods=['POST'])
@require_auth
def generate_report():
    response, status_code = reports_controller.generate_report()
    return jsonify(response), status_code

@reports_analytics_bp.route('/reports', methods=['GET'])
@require_auth
def list_reports():
    response, status_code = reports_controller.list_reports()
    return jsonify(response), status_code

@reports_analytics_bp.route('/reports/<int:report_id>', methods=['GET'])
@require_auth
def get_report(report_id):
    response, status_code = reports_controller.get_report(report_id)
    return jsonify(response), status_code

@reports_analytics_bp.route('/analytics/attendance', methods=['GET'])
@require_auth
def get_attendance_analytics():
    response, status_code = analytics_controller.get_attendance_analytics()
    return jsonify(response), status_code

@reports_analytics_bp.route('/analytics/financial', methods=['GET'])
@require_auth
def get_financial_analytics():
    response, status_code = analytics_controller.get_financial_analytics()
    return jsonify(response), status_code

@reports_analytics_bp.route('/analytics/performance', methods=['GET'])
@require_auth
def get_performance_analytics():
    response, status_code = analytics_controller.get_performance_analytics()
    return jsonify(response), status_code

@reports_analytics_bp.route('/analytics/detect-anomaly', methods=['POST'])
@require_auth
def detect_anomaly():
    response, status_code = analytics_controller.detect_anomaly()
    return jsonify(response), status_code

@reports_analytics_bp.route('/analytics/llm-insights', methods=['POST'])
@require_auth
def get_llm_insights():
    response, status_code = analytics_controller.get_llm_insights()
    return jsonify(response), status_code
