from flask import Blueprint, jsonify
from src.visitor_module.controller import VisitorController
from src.middleware.auth import auth_required as require_auth

visitor_bp = Blueprint('visitor', __name__)
visitor_controller = VisitorController()

# Visitor Check-in/Check-out endpoints
@visitor_bp.route('/visitors/checkin', methods=['POST'])
def check_in_visitor():
    response, status_code = visitor_controller.check_in_visitor()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/checkout', methods=['POST'])
@require_auth
def check_out_visitor():
    response, status_code = visitor_controller.check_out_visitor()
    return jsonify(response), status_code

# QR Token management endpoints
@visitor_bp.route('/visitors/generate-token', methods=['POST'])
def generate_qr_token():
    response, status_code = visitor_controller.generate_qr_token()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/validate-token', methods=['POST'])
def validate_qr_token():
    response, status_code = visitor_controller.validate_qr_token()
    return jsonify(response), status_code

# Visitor entry pass endpoint (public for visitors)
@visitor_bp.route('/visitors/entry-pass', methods=['POST'])
def generate_entry_pass():
    response, status_code = visitor_controller.generate_entry_pass()
    return jsonify(response), status_code

# Visitor listing endpoints
@visitor_bp.route('/visitors/active', methods=['GET'])
@require_auth
def get_active_visitors():
    response, status_code = visitor_controller.get_current_visitors()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/list', methods=['GET'])
@require_auth
def get_visitor_list():
    response, status_code = visitor_controller.get_visitor_logs()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/search', methods=['GET'])
@require_auth
def search_visitors():
    response, status_code = visitor_controller.search_visitors()
    return jsonify(response), status_code

# Legacy endpoints for backward compatibility
@visitor_bp.route('/visitors/check-in', methods=['POST'])
def check_in_visitor_legacy():
    response, status_code = visitor_controller.check_in_visitor()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/check-out', methods=['POST'])
@require_auth
def check_out_visitor_legacy():
    response, status_code = visitor_controller.check_out_visitor()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/current', methods=['GET'])
@require_auth
def get_current_visitors_legacy():
    response, status_code = visitor_controller.get_current_visitors()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/logs', methods=['GET'])
@require_auth
def get_visitor_logs_legacy():
    response, status_code = visitor_controller.get_visitor_logs()
    return jsonify(response), status_code

# Visitor approval endpoints
@visitor_bp.route('/visitors/approve', methods=['POST'])
@require_auth
def approve_visitor():
    response, status_code = visitor_controller.approve_visitor()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/reject', methods=['POST'])
@require_auth
def reject_visitor():
    response, status_code = visitor_controller.reject_visitor()
    return jsonify(response), status_code

# Visitor status check endpoint (public for visitors to check their status)
@visitor_bp.route('/visitors/status', methods=['GET'])
def check_visitor_status():
    response, status_code = visitor_controller.check_visitor_status()
    return jsonify(response), status_code
