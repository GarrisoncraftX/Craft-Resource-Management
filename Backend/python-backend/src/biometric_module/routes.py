from flask import Blueprint, request, jsonify
from src.biometric_module.controller import BiometricController
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

biometric_bp = Blueprint('biometric', __name__)
db_manager = DatabaseManager(config_dict)
biometric_controller = BiometricController(db_manager)

@biometric_bp.route('/biometric/enroll', methods=['POST'])
@optional_auth
def enroll_biometric():
    response, status_code = biometric_controller.enroll_biometric()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/verify', methods=['POST'])
@auth_required
def verify_biometric():
    response, status_code = biometric_controller.verify_biometric()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/identify', methods=['POST'])
@optional_auth
def identify_biometric():
    response, status_code = biometric_controller.identify_biometric()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/card-lookup', methods=['POST'])
@auth_required
def card_lookup():
    response, status_code = biometric_controller.card_lookup()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/statistics', methods=['GET'])
@auth_required
def biometric_statistics():
    response, status_code = biometric_controller.get_biometric_statistics()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/attendance/qr-display', methods=['GET'])
@auth_required
def kiosk_qr_display():
    """Generate QR code for kiosk display"""
    response, status_code = biometric_controller.generate_kiosk_qr()
    return jsonify(response), status_code

# Attendance endpoints
@biometric_bp.route('/biometric/attendance/clock-in', methods=['POST'])
@optional_auth
def attendance_clock_in():
    response, status_code = biometric_controller.attendance_clock_in()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/attendance/clock-out', methods=['POST'])
@auth_required
def attendance_clock_out():
    response, status_code = biometric_controller.attendance_clock_out()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/attendance/qr-scan', methods=['POST'])
@optional_auth
def qr_attendance_scan():
    response, status_code = biometric_controller.scan_kiosk_qr()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/attendance/status', methods=['GET'])
@auth_required
def attendance_status():
    response, status_code = biometric_controller.get_attendance_status()
    return jsonify(response), status_code

# Attendance management routes
@biometric_bp.route('/biometric/attendance/records', methods=['GET'])
@auth_required
def get_biometric_attendance_records():
    response, status_code = biometric_controller.get_attendance_records()
    return jsonify(response), status_code

@biometric_bp.route('/attendance/records', methods=['GET'])
@auth_required
def get_attendance_records():
    response, status_code = biometric_controller.get_attendance_records()
    return jsonify(response), status_code

@biometric_bp.route('/attendance/stats', methods=['GET'])
@auth_required
def get_attendance_stats():
    response, status_code = biometric_controller.get_attendance_stats()
    return jsonify(response), status_code

@biometric_bp.route('/attendance/checked-in', methods=['GET'])
@auth_required
def get_checked_in_employees():
    response, status_code = biometric_controller.get_checked_in_employees()
    return jsonify(response), status_code


