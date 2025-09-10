import logging
import traceback
from flask import jsonify, request
from werkzeug.exceptions import HTTPException
import pymysql

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    """Register error handlers for the Flask app"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': 'Bad request',
            'error': {
                'code': 'BAD_REQUEST',
                'timestamp': error.description if hasattr(error, 'description') else 'Invalid request data'
            }
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'message': 'Unauthorized access',
            'error': {
                'code': 'UNAUTHORIZED',
                'timestamp': 'Authentication required'
            }
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'message': 'Access forbidden',
            'error': {
                'code': 'FORBIDDEN',
                'timestamp': 'Insufficient permissions'
            }
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'error': {
                'code': 'NOT_FOUND',
                'timestamp': f'Endpoint {request.path} not found'
            }
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'Method not allowed',
            'error': {
                'code': 'METHOD_NOT_ALLOWED',
                'timestamp': f'Method {request.method} not allowed for {request.path}'
            }
        }), 405
    
    @app.errorhandler(422)
    def validation_error(error):
        return jsonify({
            'success': False,
            'message': 'Validation error',
            'error': {
                'code': 'VALIDATION_ERROR',
                'timestamp': error.description if hasattr(error, 'description') else 'Request validation failed'
            }
        }), 422
    
    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal server error: {error}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'timestamp': 'An unexpected error occurred'
            }
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle all unhandled exceptions"""
        
        # Log the error
        logger.error(f"Unhandled exception: {error}")
        logger.error(f"Request: {request.method} {request.url}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Handle HTTP exceptions
        if isinstance(error, HTTPException):
            return jsonify({
                'success': False,
                'message': error.description,
                'error': {
                    'code': error.name.upper().replace(' ', '_'),
                    'timestamp': error.description
                }
            }), error.code
        
        # Handle database errors
        if isinstance(error, pymysql.Error):
            return handle_database_error(error)
        
        # Handle validation errors
        if hasattr(error, 'messages'):
            return jsonify({
                'success': False,
                'message': 'Validation error',
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'details': error.messages
                }
            }), 400
        
        # Default error response
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred',
            'error': {
                'code': 'UNKNOWN_ERROR',
                'timestamp': str(error) if app.debug else 'Internal server error'
            }
        }), 500

def handle_database_error(error):
    """Handle database-specific errors"""
    
    error_code = getattr(error, 'args', [None])[0]
    error_message = str(error)
    
    if error_code == 1062:  # Duplicate entry
        return jsonify({
            'success': False,
            'message': 'Duplicate entry',
            'error': {
                'code': 'DUPLICATE_ENTRY',
                'timestamp': 'A record with this information already exists'
            }
        }), 409
    
    elif error_code == 1452:  # Foreign key constraint
        return jsonify({
            'success': False,
            'message': 'Invalid reference',
            'error': {
                'code': 'FOREIGN_KEY_ERROR',
                'timestamp': 'Referenced record does not exist'
            }
        }), 400
    
    elif error_code == 2003:  # Connection refused
        return jsonify({
            'success': False,
            'message': 'Service unavailable',
            'error': {
                'code': 'DATABASE_CONNECTION_ERROR',
                'timestamp': 'Database connection failed'
            }
        }), 503
    
    else:
        logger.error(f"Database error: {error_message}")
        return jsonify({
            'success': False,
            'message': 'Database error',
            'error': {
                'code': 'DATABASE_ERROR',
                'timestamp': 'A database error occurred'
            }
        }), 500

# Custom exception classes
class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message, details=None):
        super().__init__(message)
        self.message = message
        self.details = details

class AuthenticationError(Exception):
    """Custom authentication error"""
    def __init__(self, message="Authentication failed"):
        super().__init__(message)
        self.message = message

class AuthorizationError(Exception):
    """Custom authorization error"""
    def __init__(self, message="Access denied"):
        super().__init__(message)
        self.message = message

class NotFoundError(Exception):
    """Custom not found error"""
    def __init__(self, message="Resource not found"):
        super().__init__(message)
        self.message = message

class ConflictError(Exception):
    """Custom conflict error"""
    def __init__(self, message="Resource conflict"):
        super().__init__(message)
        self.message = message
