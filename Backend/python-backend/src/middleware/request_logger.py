import logging
import time
from flask import request, g
from datetime import datetime

logger = logging.getLogger(__name__)

def setup_request_logging(app):
    """Setup request logging for the Flask app"""
    
    @app.before_request
    def before_request():
        """Log incoming requests"""
        g.start_time = time.time()
        
        # Get user information if available
        user_id = getattr(request, 'user_id', None)
        employee_id = getattr(request, 'employee_id', None)
        
        logger.info(f"Incoming request: {request.method} {request.url}", extra={
            'method': request.method,
            'url': request.url,
            'path': request.path,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent'),
            'user_id': user_id,
            'employee_id': employee_id,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    @app.after_request
    def after_request(response):
        """Log request completion"""
        duration = time.time() - g.start_time if hasattr(g, 'start_time') else 0
        
        # Get user information if available
        user_id = getattr(request, 'user_id', None)
        employee_id = getattr(request, 'employee_id', None)
        
        logger.info(f"Request completed: {request.method} {request.path} - {response.status_code} ({duration:.3f}s)", extra={
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration': f"{duration:.3f}s",
            'user_id': user_id,
            'employee_id': employee_id,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        return response
    
    @app.teardown_request
    def teardown_request(exception):
        """Log request teardown"""
        if exception:
            logger.error(f"Request teardown with exception: {exception}", extra={
                'method': request.method,
                'path': request.path,
                'exception': str(exception),
                'timestamp': datetime.utcnow().isoformat()
            })
