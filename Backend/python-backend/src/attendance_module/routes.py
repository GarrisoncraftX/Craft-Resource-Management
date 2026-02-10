from flask import Blueprint, request, jsonify
from src.attendance_module.controller import AttendanceController
from src.middleware.auth import auth_required, optional_auth
from src.database.connection import DatabaseManager
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

attendance_bp = Blueprint('biometric', __name__)
db_manager = DatabaseManager(config_dict)
attendance_controller = AttendanceController(db_manager)

@attendance_bp.route('/biometric/enroll', methods=['POST'])
@optional_auth
def enroll_biometric():
    response, status_code = attendance_controller.enroll_biometric()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/verify', methods=['POST'])
@auth_required
def verify_biometric():
    response, status_code = attendance_controller.verify_biometric()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/identify', methods=['POST'])
@optional_auth
def identify_biometric():
    response, status_code = attendance_controller.identify_biometric()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/card-lookup', methods=['POST'])
@auth_required
def card_lookup():
    response, status_code = attendance_controller.card_lookup()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/statistics', methods=['GET'])
@auth_required
def biometric_statistics():
    response, status_code = attendance_controller.get_biometric_statistics()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/attendance/qr-display', methods=['GET'])
@auth_required
def kiosk_qr_display():
    """Generate QR code for kiosk display"""
    response, status_code = attendance_controller.generate_kiosk_qr()
    return jsonify(response), status_code

# Attendance endpoints
@attendance_bp.route('/biometric/attendance/clock-in', methods=['POST'])
@optional_auth
def attendance_clock_in():
    response, status_code = attendance_controller.attendance_clock_in()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/attendance/clock-out', methods=['POST'])
@auth_required
def attendance_clock_out():
    response, status_code = attendance_controller.attendance_clock_out()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/attendance/qr-scan', methods=['POST'])
@optional_auth
def qr_attendance_scan():
    response, status_code = attendance_controller.scan_kiosk_qr()
    return jsonify(response), status_code

@attendance_bp.route('/biometric/attendance/status', methods=['GET'])
@auth_required
def attendance_status():
    response, status_code = attendance_controller.get_attendance_status()
    return jsonify(response), status_code

# Attendance management routes
@attendance_bp.route('/biometric/attendance/records', methods=['GET'])
@auth_required
def get_biometric_attendance_records():
    response, status_code = attendance_controller.get_attendance_records()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/records', methods=['GET'])
@auth_required
def get_attendance_records():
    response, status_code = attendance_controller.get_attendance_records()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/stats', methods=['GET'])
@auth_required
def get_attendance_stats():
    response, status_code = attendance_controller.get_attendance_stats()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/checked-in', methods=['GET'])
@auth_required
def get_checked_in_employees():
    response, status_code = attendance_controller.get_checked_in_employees()
    return jsonify(response), status_code

# Pillar 2: HR Dashboard monitoring endpoints
@attendance_bp.route('/attendance/manual-fallbacks', methods=['GET'])
@auth_required
def get_manual_fallback_attendances():
    response, status_code = attendance_controller.get_manual_fallback_attendances()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/by-method/<method>', methods=['GET'])
@auth_required
def get_attendances_by_method(method):
    response, status_code = attendance_controller.get_attendances_by_method(method)
    return jsonify(response), status_code

@attendance_bp.route('/attendance/<int:attendance_id>/flag-audit', methods=['POST'])
@auth_required
def flag_attendance_for_audit(attendance_id):
    response, status_code = attendance_controller.flag_attendance_for_audit(attendance_id)
    return jsonify(response), status_code

@attendance_bp.route('/attendance/manual-fallbacks/date-range', methods=['GET'])
@auth_required
def get_manual_fallbacks_by_date_range():
    response, status_code = attendance_controller.get_manual_fallbacks_by_date_range()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/user/<int:user_id>/date-range', methods=['GET'])
@auth_required
def get_user_attendance_by_date_range(user_id):
    response, status_code = attendance_controller.get_user_attendance_by_date_range(user_id)
    return jsonify(response), status_code

@attendance_bp.route('/attendance/buddy-punch-report', methods=['GET'])
@auth_required
def get_buddy_punch_report():
    response, status_code = attendance_controller.get_buddy_punch_report()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/<int:attendance_id>/buddy-punch-flag', methods=['POST'])
@auth_required
def flag_buddy_punch_risk(attendance_id):
    response, status_code = attendance_controller.flag_buddy_punch_risk(attendance_id)
    return jsonify(response), status_code

@attendance_bp.route('/attendance/method-statistics', methods=['GET'])
@auth_required
def get_attendance_method_statistics():
    response, status_code = attendance_controller.get_attendance_method_statistics()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/<int:attendance_id>/review', methods=['POST'])
@auth_required
def review_attendance(attendance_id):
    response, status_code = attendance_controller.review_attendance(attendance_id)
    return jsonify(response), status_code

# Java Backend Integration Endpoints
@attendance_bp.route('/attendance/count/today', methods=['GET'])
def get_today_attendance_count():
    response, status_code = attendance_controller.get_today_attendance_count()
    return jsonify(response), status_code

@attendance_bp.route('/attendance/stats/monthly', methods=['GET'])
def get_monthly_attendance_stats():
    response, status_code = attendance_controller.get_monthly_attendance_stats()
    return jsonify(response), status_code

