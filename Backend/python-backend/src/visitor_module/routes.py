from flask import Blueprint, jsonify
from src.visitor_module.controller import VisitorController
from src.middleware.auth import auth_required as require_auth

visitor_bp = Blueprint('visitor', __name__)
visitor_controller = VisitorController()

@visitor_bp.route('/visitors/check-in', methods=['POST'])
def check_in_visitor():
    response, status_code = visitor_controller.check_in_visitor()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/check-out', methods=['POST'])
def check_out_visitor():
    response, status_code = visitor_controller.check_out_visitor()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/current', methods=['GET'])
@require_auth
def get_current_visitors():
    response, status_code = visitor_controller.get_current_visitors()
    return jsonify(response), status_code

@visitor_bp.route('/visitors/logs', methods=['GET'])
@require_auth
def get_visitor_logs():
    response, status_code = visitor_controller.get_visitor_logs()
    return jsonify(response), status_code
