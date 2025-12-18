import json
import jwt
import os
import logging
from flask import request, jsonify, current_app, g
from functools import wraps
from typing import List, Optional

logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key')

class AuthMiddleware:
    def extract_user_context(self):
        """Extract user context from API Gateway headers"""
        g.user_context = {
            'user_id': request.headers.get('x-user-id'),
            'department_id': int(request.headers.get('x-department-id', 0)),
            'role_id': int(request.headers.get('x-role-id', 0)),
            'permissions': json.loads(request.headers.get('x-permissions', '[]'))
        }
        
        logger.debug(f"User context extracted: {g.user_context}")

def auth_required(f):
    """Authentication middleware decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # First, check if user context headers are present (from API Gateway)
            user_id_header = request.headers.get('x-user-id')
            department_id_header = request.headers.get('x-department-id')
            role_id_header = request.headers.get('x-role-id')
            permissions_header = request.headers.get('x-permissions')

            if user_id_header and department_id_header and role_id_header and permissions_header:
                # Use user context from API Gateway
                try:
                    request.user_id = int(user_id_header)
                    request.employee_id = None  
                    request.department_id = int(department_id_header)
                    request.role_id = int(role_id_header)
                    request.permissions = json.loads(permissions_header)

                    logger.debug(f"Authenticated user via API Gateway context: {request.user_id}")
                    return f(*args, **kwargs)
                except (ValueError, json.JSONDecodeError) as e:
                    logger.error(f"Invalid user context headers: {e}")
                    return jsonify({
                        'success': False,
                        'message': 'Invalid user context'
                    }), 401

            # Fallback to JWT validation if no user context headers
            auth_header = request.headers.get('Authorization')
            logger.debug(f"Authorization header: {auth_header}")

            if not auth_header or not auth_header.startswith('Bearer '):
                logger.warning("No valid Authorization header found")
                return jsonify({
                    'success': False,
                    'message': 'Access token is required'
                }), 401

            token = auth_header[7:]

            # Verify token
            try:
                decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Access token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid access token'
                }), 401

            # Add user information to request and global context
            request.user_id = decoded.get('userId')
            request.employee_id = decoded.get('employeeId')
            request.department_id = decoded.get('departmentId')
            request.role_id = decoded.get('roleId')
            request.permissions = decoded.get('permissions', [])

            # Set global context for easier access in controllers
            g.user_id = request.user_id
            g.employee_id = request.employee_id
            g.department_id = request.department_id
            g.role_id = request.role_id
            g.permissions = request.permissions

            logger.debug(f"Authenticated user via JWT: {request.employee_id} (ID: {request.user_id})")

            return f(*args, **kwargs)

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return jsonify({
                'success': False,
                'message': 'Authentication failed'
            }), 500

    return decorated_function

def require_permission(permission):
    """Permission check decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'permissions') or not request.permissions:
                return jsonify({
                    'success': False,
                    'message': 'Access denied - no permissions found'
                }), 403
            
            if permission not in request.permissions:
                logger.warning(f"Access denied for user {request.employee_id} - missing permission: {permission}")
                return jsonify({
                    'success': False,
                    'message': f'Access denied - missing permission: {permission}'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_permissions(permissions: List[str]):
    """Decorator to require multiple permissions"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'permissions') or not request.permissions:
                return jsonify({
                    'success': False,
                    'message': 'Access denied - no permissions found'
                }), 403
            
            user_permissions = request.permissions
            missing_permissions = [p for p in permissions if p not in user_permissions]
            
            if missing_permissions:
                return jsonify({
                    'success': False,
                    'message': 'Insufficient permissions',
                    'required': permissions,
                    'missing': missing_permissions
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_any_permission(permissions):
    """Require any of the specified permissions"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'permissions') or not request.permissions:
                return jsonify({
                    'success': False,
                    'message': 'Access denied - no permissions found'
                }), 403
            
            has_permission = any(perm in request.permissions for perm in permissions)
            
            if not has_permission:
                logger.warning(f"Access denied for user {request.employee_id} - missing any of permissions: {', '.join(permissions)}")
                return jsonify({
                    'success': False,
                    'message': 'Access denied - missing required permissions'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_role(role_id: int):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'role_id'):
                return jsonify({
                    'success': False,
                    'message': 'Access denied - user not authenticated'
                }), 403
            
            if request.role_id != role_id:
                logger.warning(f"Access denied for user {request.employee_id} - wrong role")
                return jsonify({
                    'success': False,
                    'message': 'Access denied - role restriction'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_department(department_id):
    """Require specific department"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'department_id'):
                return jsonify({
                    'success': False,
                    'message': 'Access denied - user not authenticated'
                }), 403
            
            if request.department_id != department_id:
                logger.warning(f"Access denied for user {request.employee_id} - wrong department")
                return jsonify({
                    'success': False,
                    'message': 'Access denied - department restriction'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_current_user():
    """Get current user information from request"""
    if hasattr(request, 'user_id'):
        return {
            'id': request.user_id,
            'employee_id': request.employee_id,
            'department_id': request.department_id,
            'role_id': request.role_id,
            'permissions': request.permissions
        }
    return None

def optional_auth(f):
    """Optional authentication decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header[7:]
                
                try:
                    decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                    request.user_id = decoded.get('userId')
                    request.employee_id = decoded.get('employeeId')
                    request.department_id = decoded.get('departmentId')
                    request.role_id = decoded.get('roleId')
                    request.permissions = decoded.get('permissions', [])

                    # Set global context for easier access in controllers
                    g.user_id = request.user_id
                    g.employee_id = request.employee_id
                    g.department_id = request.department_id
                    g.role_id = request.role_id
                    g.permissions = request.permissions
                except jwt.InvalidTokenError:
                    # Token is invalid, but we continue without authentication
                    pass
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Optional authentication error: {e}")
            return f(*args, **kwargs)
    
    return decorated_function
