from flask import Blueprint, request, jsonify
from src.health_safety_module.controller import HealthSafetyController
from src.middleware.auth import auth_required as require_auth

health_safety_bp = Blueprint('health_safety', __name__)
health_safety_controller = HealthSafetyController()

@health_safety_bp.route('/health-safety/incidents', methods=['GET'])
@require_auth
def get_incidents():
    response, status_code = health_safety_controller.get_incidents()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/incidents', methods=['POST'])
@require_auth
def create_incident():
    response, status_code = health_safety_controller.create_incident()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/inspections', methods=['GET'])
@require_auth
def get_inspections():
    response, status_code = health_safety_controller.get_inspections()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/inspections', methods=['POST'])
@require_auth
def create_inspection():
    response, status_code = health_safety_controller.create_inspection()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/trainings', methods=['GET'])
@require_auth
def get_trainings():
    response, status_code = health_safety_controller.get_trainings()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/trainings', methods=['POST'])
@require_auth
def create_training():
    response, status_code = health_safety_controller.create_training()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/trainings/<int:training_id>', methods=['PUT'])
@require_auth
def update_training(training_id):
    response, status_code = health_safety_controller.update_training(training_id)
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/trainings/<int:training_id>', methods=['DELETE'])
@require_auth
def delete_training(training_id):
    response, status_code = health_safety_controller.delete_training(training_id)
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/environmental-health-records', methods=['GET'])
@require_auth
def get_environmental_health_records():
    response, status_code = health_safety_controller.get_environmental_health_records()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/environmental-health-records', methods=['POST'])
@require_auth
def create_environmental_health_record():
    response, status_code = health_safety_controller.create_environmental_health_record()
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/environmental-health-records/<int:record_id>', methods=['PUT'])
@require_auth
def update_environmental_health_record(record_id):
    response, status_code = health_safety_controller.update_environmental_health_record(record_id)
    return jsonify(response), status_code

@health_safety_bp.route('/health-safety/environmental-health-records/<int:record_id>', methods=['DELETE'])
@require_auth
def delete_environmental_health_record(record_id):
    response, status_code = health_safety_controller.delete_environmental_health_record(record_id)
    return jsonify(response), status_code
