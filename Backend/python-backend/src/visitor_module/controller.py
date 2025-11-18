from flask import request, jsonify
from src.visitor_module.service import VisitorService
from src.utils.logger import logger

class VisitorController:
    def __init__(self):
        self.service = VisitorService()

    def check_in_visitor(self):
        try:
            visitor_data = request.get_json()
            success, result = self.service.check_in_visitor(visitor_data)
            if success:
                return {
                    'success': True,
                    'message': 'Visitor checked in successfully',
                    'visitor_id': result,
                    'check_in_time': visitor_data.get('check_in_time')
                }, 201
            else:
                return {'success': False, 'message': result}, 400
        except Exception as e:
            logger.error(f"Error in visitor check-in: {e}")
            return {'success': False, 'message': 'Error checking in visitor'}, 500

    def check_out_visitor(self):
        try:
            data = request.get_json()
            visitor_id = data.get('visitor_id')
            if not visitor_id:
                return {'success': False, 'message': 'visitor_id is required'}, 400
            success, message = self.service.check_out_visitor(visitor_id)
            if success:
                return {'success': True, 'message': 'Visitor checked out successfully'}, 200
            else:
                return {'success': False, 'message': message}, 400
        except Exception as e:
            logger.error(f"Error in visitor check-out: {e}")
            return {'success': False, 'message': 'Error checking out visitor'}, 500

    def generate_qr_token(self):
        try:
            token_data = self.service.generate_qr_token()
            return {
                'success': True,
                'token': token_data['token'],
                'expires_at': token_data['expires_at'],
                'created_at': token_data['created_at']
            }, 201
        except Exception as e:
            logger.error(f"Error generating QR token: {e}")
            return {'success': False, 'message': 'Error generating QR token'}, 500

    def validate_qr_token(self):
        try:
            data = request.get_json()
            token = data.get('token')
            if not token:
                return {'success': False, 'message': 'Token is required'}, 400

            result = self.service.validate_qr_token(token)
            return result, 200 if result['valid'] else 400
        except Exception as e:
            logger.error(f"Error validating QR token: {e}")
            return {'success': False, 'message': 'Error validating token'}, 500

    def get_current_visitors(self):
        try:
            visitors = self.service.get_current_visitors()
            return {'success': True, 'active_visitors': visitors}, 200
        except Exception as e:
            logger.error(f"Error fetching current visitors: {e}")
            return {'success': False, 'message': 'Error fetching current visitors'}, 500

    def get_visitor_logs(self):
        try:
            logs = self.service.get_visitor_logs()
            return {'success': True, 'visitor_logs': logs}, 200
        except Exception as e:
            logger.error(f"Error fetching visitor logs: {e}")
            return {'success': False, 'message': 'Error fetching visitor logs'}, 500
