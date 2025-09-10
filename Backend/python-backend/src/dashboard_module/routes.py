from flask import Blueprint, jsonify
from src.dashboard_module.controller import DashboardController
from src.middleware.auth import auth_required as  require_auth

dashboard_bp = Blueprint('dashboard', __name__)
dashboard_controller = DashboardController()

@dashboard_bp.route('/dashboard', methods=['GET'])
@require_auth
def get_dashboard_data():
    response, status_code = dashboard_controller.get_dashboard_data()
    return jsonify(response), status_code

@dashboard_bp.route('/dashboard/widgets', methods=['GET'])
@require_auth
def get_dashboard_widgets():
    response, status_code = dashboard_controller.get_dashboard_widgets()
    return jsonify(response), status_code
