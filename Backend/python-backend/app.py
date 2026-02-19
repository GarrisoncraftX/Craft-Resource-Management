from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime

# Import middleware
from src.middleware.auth import auth_required, get_current_user
from src.middleware.error_handler import register_error_handlers
from src.middleware.request_logger import setup_request_logging
from src.middleware.session_tracker import session_tracker, start_cleanup_thread

# Import controllers
from src.attendance_module.controller import AttendanceController
from src.visitor_module.controller import VisitorController

# Import blueprints
from src.attendance_module.routes import attendance_bp
from src.visitor_module.routes import visitor_bp

# Import database connection
from src.database.connection import DatabaseManager
from src.config.app import config
from src.extensions import cache

# Initialize Flask app
app = Flask(__name__)

# Determine environment and config
env = os.getenv('FLASK_ENV', 'development')
app_config = config.get(env, config['default'])
app.config.from_object(app_config)

# Initialize extensions
cache.init_app(app)

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

# Configure CORS
CORS(app, origins=[
    os.getenv('FRONTEND_URL', 'http://localhost:5173'),
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
attendance_controller = AttendanceController(db_manager)
visitor_controller = VisitorController()

# Register blueprints
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(visitor_bp, url_prefix='/api')

# Register error handlers
register_error_handlers(app)

# Middleware
setup_request_logging(app)
app.before_request(session_tracker())
start_cleanup_thread()

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
