from flask import Blueprint, request, jsonify
from src.biometric_module.controller import BiometricController
from src.middleware.auth import auth_required
from src.database.connection import DatabaseManager
from src.config.app import config
import os

env = os.getenv('FLASK_ENV', 'development')
app_config = config.get(env, config['default'])

# Create filtered config dict with only valid keys for MySQLConnectionPool
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
@auth_required
def enroll_biometric():
    response, status_code = biometric_controller.enroll_biometric()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/verify', methods=['POST'])
@auth_required
def verify_biometric():
    response, status_code = biometric_controller.verify_biometric()
    return jsonify(response), status_code

@biometric_bp.route('/biometric/identify', methods=['POST'])
@auth_required
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
