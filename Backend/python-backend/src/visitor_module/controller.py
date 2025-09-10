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
                return {'success': True, 'message': 'Visitor checked in', 'check_in_id': result}, 201
            else:
                return {'success': False, 'message': result}, 400
        except Exception as e:
            logger.error(f"Error in visitor check-in: {e}")
            return {'success': False, 'message': 'Error checking in visitor'}, 500

    def check_out_visitor(self):
        try:
            data = request.get_json()
            visitor_id = data.get('check_in_id')
            if not visitor_id:
                return {'success': False, 'message': 'check_in_id is required'}, 400
            success, message = self.service.check_out_visitor(visitor_id)
            if success:
                return {'success': True, 'message': 'Visitor checked out'}, 200
            else:
                return {'success': False, 'message': message}, 400
        except Exception as e:
            logger.error(f"Error in visitor check-out: {e}")
            return {'success': False, 'message': 'Error checking out visitor'}, 500

    def get_current_visitors(self):
        try:
            visitors = self.service.get_current_visitors()
            return {'success': True, 'current_visitors': visitors}, 200
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
