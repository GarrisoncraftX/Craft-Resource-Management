from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

# Import middleware
from src.middleware.auth import auth_required, get_current_user
from src.middleware.error_handler import register_error_handlers
from src.middleware.request_logger import setup_request_logging

# Import controllers
from src.biometric_module.controller import BiometricController
from src.reports_analytics_module.controller import AnalyticsController
from src.reports_analytics_module.controller import ReportsController
from src.health_safety_module.controller import HealthSafetyController
from src.visitor_module.controller import VisitorController
from src.dashboard_module.controller import DashboardController

# Import blueprints
from src.biometric_module.routes import biometric_bp
from src.health_safety_module.routes import health_safety_bp
from src.dashboard_module.routes import dashboard_bp
from src.visitor_module.routes import visitor_bp
from src.reports_analytics_module.routes import reports_analytics_bp

# Import database connection
from src.database.connection import DatabaseManager
from src.config.app import config

# Initialize Flask app
app = Flask(__name__)

# Determine environment and config
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

from src.utils.logger import logger

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, origins=[
    os.getenv('FRONTEND_URL', 'http://192.168.1.101:5173'),
    'http://localhost:5173'
], supports_credentials=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize database manager with config
db_manager = DatabaseManager(config_dict)

# Initialize controllers
biometric_controller = BiometricController(db_manager)
analytics_controller = AnalyticsController()
reports_controller = ReportsController()
health_safety_controller = HealthSafetyController()
visitor_controller = VisitorController()
dashboard_controller = DashboardController()

# Register blueprints
app.register_blueprint(dashboard_bp, url_prefix='/api')
app.register_blueprint(biometric_bp, url_prefix='/api')
app.register_blueprint(health_safety_bp, url_prefix='/api')
app.register_blueprint(visitor_bp, url_prefix='/api')
app.register_blueprint(reports_analytics_bp, url_prefix='/api')

# Register error handlers
register_error_handlers(app)

# Middleware
setup_request_logging(app)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': 'Python service is healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'python-backend'
    })



# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': f'Route {request.url} not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f'Internal server error: {error}')
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f'🚀 Python service starting on port {port}')
    logger.info(f'📊 Health check available at http://localhost:{port}/health')
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug, 
        threaded=True
    )
