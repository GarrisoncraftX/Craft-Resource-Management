import os
from flask import request, g
from typing import Dict, Any
from datetime import datetime, timedelta

from .models import BiometricModel
from .service import BiometricService
from src.mockData.biometric_service import (
    enroll_biometric_mock, verify_biometric_mock, identify_biometric_mock,
    lookup_card_mock, get_biometric_statistics_mock
)
from src.utils.logger import logger
from src.config.app import Config
from src.extensions import cache

class BiometricController:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.biometric_model = BiometricModel(db_manager) if not Config.USE_MOCK_DATA else None
        self.biometric_service = BiometricService()
        self.use_mock_data = Config.USE_MOCK_DATA
    
    def enroll_biometric(self) -> tuple[Dict[str, Any], int]:
        """Handle biometric enrollment (card only)"""
        try:
            data = request.get_json()

            user_id = data.get('user_id') or data.get('userId')
            visitor_id = data.get('visitor_id') or data.get('visitorId')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')
            
            if not biometric_type:
                return {'success': False, 'message': 'Biometric type is required'}, 400

            if biometric_type != 'card':
                return {'success': False, 'message': 'Only card enrollment supported'}, 400

            if not raw_data:
                return {'success': False, 'message': 'Raw data is required'}, 400
            
            if not user_id and not visitor_id:
                return {'success': False, 'message': 'Either user_id or visitor_id is required'}, 400
            
            if self.use_mock_data:
                result = enroll_biometric_mock(user_id, visitor_id, biometric_type, raw_data)
                logger.info(f"Mock biometric enrollment: {result}")
                return {'success': True, 'message': 'Card enrolled successfully (mock)', 'data': result}, 201
            
            result = self.biometric_service.process_card_data(raw_data, user_id or visitor_id)
            template_data = result['template_data']
            template_hash = result['template_hash']
            
            enrollment_result = self.biometric_model.enroll_biometric(
                user_id, visitor_id, biometric_type, template_data, template_hash
            )
            
            self.biometric_model.log_biometric_access(
                user_id, biometric_type, 'enrollment', True, 
                {'enrollment_id': enrollment_result['biometric_id']}
            )
            
            logger.info(f"Card enrollment successful: {enrollment_result}")
            
            return {'success': True, 'message': 'Card enrolled successfully', 'data': enrollment_result}, 201
            
        except Exception as e:
            logger.error(f"Error in card enrollment: {e}")
            return {'success': False, 'message': 'Error enrolling card data'}, 500

    def get_biometric_statistics(self) -> tuple[Dict[str, Any], int]:
        """Get biometric system statistics"""
        try:
            if self.use_mock_data:
                result = get_biometric_statistics_mock()
                logger.info(f"Mock biometric statistics: {result}")
                return {
                    'success': True,
                    'data': result
                }, 200
            
            stats = self.biometric_model.get_biometric_statistics()
            return {
                'success': True,
                'data': stats
            }, 200
        except Exception as e:
            logger.error(f"Error getting biometric statistics: {e}")
            return {
                'success': False,
                'message': 'Error retrieving biometric statistics'
            }, 500
    
    def verify_biometric(self) -> tuple[Dict[str, Any], int]:
        """Verify card data against stored template (1:1 verification)"""
        try:
            data = request.get_json()
            user_id = data.get('user_id') or data.get('userId')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')

            if not all([user_id, biometric_type]):
                return {'success': False, 'message': 'User ID and biometric type are required'}, 400

            if biometric_type != 'card':
                return {'success': False, 'message': 'Only card verification supported'}, 400

            if not raw_data:
                return {'success': False, 'message': 'Raw data is required'}, 400

            if self.use_mock_data:
                result = verify_biometric_mock(user_id, biometric_type, raw_data)
                logger.info(f"Mock biometric verification: {result}")
                return {'success': True, 'data': result}, 200

            processed = self.biometric_service.process_card_data(raw_data, user_id)
            live_template = processed['template_data']
            
            stored_template = self.biometric_model.get_biometric_template(user_id, biometric_type)
            
            if not stored_template:
                self.biometric_model.log_biometric_access(
                    user_id, biometric_type, 'verification', False,
                    {'reason': 'No template found'}
                )
                return {'success': False, 'message': 'Card verification failed'}, 400
            
            verification_result = self.biometric_service.verify_biometric(
                live_template, stored_template, biometric_type, user_id
            )
            
            self.biometric_model.log_biometric_access(
                user_id, biometric_type, 'verification', verification_result['is_match'],
                {'similarity_score': verification_result['similarity_score']}
            )
            
            verification_result['user_id'] = user_id
            logger.info(f"Card verification completed: {verification_result}")
            
            return {'success': True, 'data': verification_result}, 200
            
        except Exception as e:
            logger.error(f"Error in card verification: {e}")
            return {'success': False, 'message': 'Error verifying card data'}, 500
    
    def identify_biometric(self) -> tuple[Dict[str, Any], int]:
        """Identify user from card data (1:N identification)"""
        try:
            data = request.get_json()
            biometric_type = data.get('biometric_type')
            raw_data = data.get('raw_data')

            if not biometric_type:
                return {'success': False, 'message': 'Biometric type is required'}, 400

            if biometric_type != 'card':
                return {'success': False, 'message': 'Only card identification supported'}, 400

            if not raw_data:
                return {'success': False, 'message': 'Raw data is required'}, 400

            if self.use_mock_data:
                result = identify_biometric_mock(biometric_type, raw_data)
                logger.info(f"Mock biometric identification: {result}")
                if result:
                    return {'success': True, 'data': result}, 200
                else:
                    return {'success': False, 'message': 'No matching card found'}, 404

            processed = self.biometric_service.process_card_data(raw_data, 'system')
            live_template = processed['template_data']
            
            stored_templates = self.biometric_model.get_all_templates(biometric_type)
            
            if not stored_templates:
                return {'success': False, 'message': 'No card templates found'}, 404
            
            identification_result = self.biometric_service.identify_from_templates(
                live_template, stored_templates, biometric_type
            )
            
            if identification_result:
                user_id = identification_result['user_id']
                last_attendance = self.biometric_model.get_employee_last_attendance(user_id)

                if last_attendance and last_attendance['clock_out_time'] is None:
                    action = 'clock_out'
                else:
                    action = 'clock_in'

                identification_result['action'] = action

                self.biometric_model.log_biometric_access(
                    user_id, biometric_type, 'identification', True,
                    {'similarity_score': identification_result['similarity_score'], 'action': action}
                )

                logger.info(f"Card identification successful: {identification_result}")
                return {'success': True, 'data': identification_result}, 200
            else:
                self.biometric_model.log_biometric_access(
                    None, biometric_type, 'identification', False,
                    {'reason': 'No match found'}
                )
                return {'success': False, 'message': 'No matching card found'}, 404
                
        except Exception as e:
            logger.error(f"Error in card identification: {e}")
            return {'success': False, 'message': 'Error identifying card data'}, 500
    
    def card_lookup(self) -> tuple[Dict[str, Any], int]:
        """Look up card holder information"""
        try:
            data = request.get_json()
            card_identifier = data.get('card_identifier')

            if not card_identifier:
                return {
                    'success': False,
                    'message': 'Card identifier is required'
                }, 400

            # Use mock data if configured
            if self.use_mock_data:
                result = lookup_card_mock(card_identifier)
                logger.info(f"Mock card lookup: {result}")
                if result:
                    return {
                        'success': True,
                        'data': result
                    }, 200
                else:
                    return {
                        'success': False,
                        'message': 'Card not found'
                    }, 404

            # Query database for card info
            card_info = self.biometric_model.lookup_card(card_identifier)

            if card_info:
                return {
                    'success': True,
                    'data': card_info
                }, 200
            else:
                return {
                    'success': False,
                    'message': 'Card not found'
                }, 404

        except Exception as e:
            logger.error(f"Error in card lookup: {e}")
            return {
                'success': False,
                'message': 'Error looking up card information'
            }, 500

    def attendance_clock_in(self) -> tuple[Dict[str, Any], int]:
        """Handle attendance clock-in with QR, card, or manual verification"""
        try:
            data = request.get_json()
            user_id = data.get('user_id') or data.get('userId')
            employee_id = data.get('employee_id') or data.get('employeeId')
            password = data.get('password')
            verification_method = data.get('verification_method') or data.get('verificationMethod')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')
            location = data.get('location')

            if verification_method == 'manual' and employee_id and password:
                employee = self.biometric_model.authenticate_employee(employee_id, password)
                if not employee:
                    return {'success': False, 'message': 'Invalid employee credentials'}, 401
                user_id = employee['id']
            elif not user_id:
                return {'success': False, 'message': 'User ID or employee credentials are required'}, 400

            if self.use_mock_data:
                attendance_result = self.biometric_model.record_attendance(user_id, 'clock_in', 'qr_mock', location)
                self.biometric_model.log_attendance(user_id, 'clock_in', 'qr_mock', True, {'location': location})
                return {'success': True, 'message': 'Clocked in successfully (mock)', 'data': attendance_result}, 200

            if biometric_type and raw_data and verification_method != 'manual':
                if biometric_type != 'card':
                    return {'success': False, 'message': 'Only card/ID card verification supported'}, 400
                    
                processed = self.biometric_service.process_card_data(raw_data, user_id)
                live_template = processed['template_data']
                
                stored_template = self.biometric_model.get_biometric_template(user_id, biometric_type)
                
                if not stored_template:
                    self.biometric_model.log_biometric_access(
                        user_id, biometric_type, 'verification', False,
                        {'reason': 'No template found'}
                    )
                    return {'success': False, 'message': 'Card verification failed - no template found'}, 400
                
                verification_result = self.biometric_service.verify_biometric(
                    live_template, stored_template, biometric_type, user_id
                )
                
                if not verification_result['is_match']:
                    self.biometric_model.log_biometric_access(
                        user_id, biometric_type, 'verification', False,
                        {'similarity_score': verification_result['similarity_score']}
                    )
                    return {'success': False, 'message': 'Card verification failed'}, 401
                
                self.biometric_model.log_biometric_access(
                    user_id, biometric_type, 'verification', True,
                    {'similarity_score': verification_result['similarity_score']}
                )

            method = verification_method or biometric_type or 'manual'
            logger.info(f"Recording clock-in with method: {method} for user: {user_id}")
            attendance_result = self.biometric_model.record_attendance(user_id, 'clock_in', method, location)

            # Check if already checked in
            if attendance_result.get('action') in ['already_checked_in', 'already_completed']:
                return {
                    'success': False, 
                    'message': attendance_result.get('message', 'Already checked in'),
                    'action': attendance_result.get('action'),
                    'data': {
                        'timestamp': attendance_result.get('timestamp'),
                        'status': attendance_result.get('status', 'present'),
                        'method': method,
                        **attendance_result
                    }
                }, 200 

            self.biometric_model.log_attendance(user_id, 'clock_in', method, True, {
                'location': location,
                'verification_method': verification_method,
                'biometric_verification': biometric_type is not None,
                'status': attendance_result.get('status', 'present')
            })

            logger.info(f"Attendance clock-in successful for user {user_id}")
            return {
                'success': True, 
                'message': 'Welcome to work! You have successfully clocked in.',
                'action': 'clock_in',
                'data': {
                    'timestamp': attendance_result.get('timestamp'),
                    'status': attendance_result.get('status', 'present'),
                    'method': method,
                    **attendance_result
                }
            }, 200

        except Exception as e:
            logger.error(f"Error in attendance clock-in: {e}")
            return {'success': False, 'message': 'Error processing clock-in'}, 500

    def attendance_clock_out(self) -> tuple[Dict[str, Any], int]:
        """Handle attendance clock-out with QR, card, or manual verification"""
        try:
            data = request.get_json()
            user_id = data.get('user_id') or data.get('userId')
            employee_id = data.get('employee_id') or data.get('employeeId')
            password = data.get('password')
            verification_method = data.get('verification_method') or data.get('verificationMethod')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')
            location = data.get('location')

            if verification_method == 'manual' and employee_id and password:
                employee = self.biometric_model.authenticate_employee(employee_id, password)
                if not employee:
                    return {'success': False, 'message': 'Invalid employee credentials'}, 401
                user_id = employee['id']
            elif not user_id:
                return {'success': False, 'message': 'User ID or employee credentials are required'}, 400

            if self.use_mock_data:
                attendance_result = self.biometric_model.record_attendance(user_id, 'clock_out', 'qr_mock', location)
                self.biometric_model.log_attendance(user_id, 'clock_out', 'qr_mock', True, {'location': location})
                return {'success': True, 'message': 'Clocked out successfully (mock)', 'data': attendance_result}, 200

            if biometric_type and raw_data and verification_method != 'manual':
                if biometric_type != 'card':
                    return {'success': False, 'message': 'Only card/ID card verification supported'}, 400
                    
                processed = self.biometric_service.process_card_data(raw_data, user_id)
                live_template = processed['template_data']
                
                stored_template = self.biometric_model.get_biometric_template(user_id, biometric_type)
                
                if not stored_template:
                    self.biometric_model.log_biometric_access(
                        user_id, biometric_type, 'verification', False,
                        {'reason': 'No template found'}
                    )
                    return {'success': False, 'message': 'Card verification failed - no template found'}, 400
                
                verification_result = self.biometric_service.verify_biometric(
                    live_template, stored_template, biometric_type, user_id
                )
                
                if not verification_result['is_match']:
                    self.biometric_model.log_biometric_access(
                        user_id, biometric_type, 'verification', False,
                        {'similarity_score': verification_result['similarity_score']}
                    )
                    return {'success': False, 'message': 'Card verification failed'}, 401
                
                self.biometric_model.log_biometric_access(
                    user_id, biometric_type, 'verification', True,
                    {'similarity_score': verification_result['similarity_score']}
                )

            method = verification_method or biometric_type or 'manual'
            logger.info(f"Recording clock-out with method: {method} for user: {user_id}")
            attendance_result = self.biometric_model.record_attendance(user_id, 'clock_out', method, location)

            self.biometric_model.log_attendance(user_id, 'clock_out', method, True, {
                'location': location,
                'verification_method': verification_method,
                'biometric_verification': biometric_type is not None
            })

            logger.info(f"Attendance clock-out successful for user {user_id}")
            return {
                'success': True, 
                'message': 'Goodbye! You have successfully clocked out. Have a great day!',
                'action': 'clock_out',
                'data': {
                    'timestamp': attendance_result.get('timestamp'),
                    'method': method,
                    **attendance_result
                }
            }, 200

        except Exception as e:
            logger.error(f"Error in attendance clock-out: {e}")
            return {'success': False, 'message': 'Error processing clock-out'}, 500

    def get_attendance_status(self) -> tuple[Dict[str, Any], int]:
        """Get current attendance status for user"""
        try:
            # Get user from auth context
            user_id = getattr(g, 'user_id', None)
            if not user_id:
                return {
                    'success': False,
                    'message': 'User not authenticated'
                }, 401

            # Get last attendance record
            last_attendance = self.biometric_model.get_employee_last_attendance(user_id)

            if not last_attendance:
                return {
                    'success': True,
                    'status': 'not_checked_in',
                    'message': 'No attendance records found'
                }, 200

            # Determine current status
            if last_attendance['clock_out_time'] is None:
                return {
                    'success': True,
                    'status': 'checked_in',
                    'last_check_in': last_attendance['clock_in_time'].isoformat() if last_attendance['clock_in_time'] else None,
                    'message': 'Currently checked in'
                }, 200
            else:
                return {
                    'success': True,
                    'status': 'checked_out',
                    'last_check_out': last_attendance['clock_out_time'].isoformat() if last_attendance['clock_out_time'] else None,
                    'message': 'Currently checked out'
                }, 200

        except Exception as e:
            logger.error(f"Error getting attendance status: {e}")
            return {
                'success': False,
                'message': 'Error retrieving attendance status'
            }, 500

    def generate_kiosk_qr(self) -> tuple[Dict[str, Any], int]:
        """Generate QR code data for kiosk display"""
        try:
            # Generate a unique session token for the kiosk
            import uuid
            session_token = str(uuid.uuid4())

            # Store session data in cache for validation
            cache_key = f"qr_session:{session_token}"
            session_data = {
                'created_at': datetime.utcnow().isoformat(),
                'expires_at': (datetime.utcnow() + timedelta(seconds=30)).isoformat(),
                'used': False
            }
            cache.set(cache_key, session_data, timeout=30)  

            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            from urllib.parse import urlparse
            parsed_url = urlparse(frontend_url)
            allowed_domains = ['localhost:5173', '127.0.0.1:5173', 'yourdomain.com', parsed_url.netloc]
            if parsed_url.scheme not in ['http', 'https'] or parsed_url.netloc not in allowed_domains:
                return {
                    'success': False,
                    'message': 'Invalid frontend URL configuration'
                }, 500
            qr_data = f"{frontend_url}/signin?session_token={session_token}"

            return {
                'success': True,
                'qr_data': qr_data,
                'session_token': session_token,
                'expires_in': 30
            }, 200

        except Exception as e:
            logger.error(f"Error generating kiosk QR: {e}")
            return {
                'success': False,
                'message': 'Error generating kiosk QR code'
            }, 500

    def scan_kiosk_qr(self) -> tuple[Dict[str, Any], int]:
        """Handle QR code scan from employee dashboard"""
        try:
            logger.info("=== QR SCAN REQUEST STARTED ===")

            # Simple rate limiting: allow max 5 requests per minute per IP
            client_ip = request.remote_addr
            rate_key = f"rate_limit:{client_ip}"
            rate_data = cache.get(rate_key) or {'count': 0, 'reset_time': datetime.utcnow().timestamp() + 60}
            if datetime.utcnow().timestamp() > rate_data['reset_time']:
                rate_data = {'count': 1, 'reset_time': datetime.utcnow().timestamp() + 60}
            elif rate_data['count'] >= 5:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return {
                    'success': False,
                    'message': 'Rate limit exceeded. Please try again later.'
                }, 429
            else:
                rate_data['count'] += 1
            cache.set(rate_key, rate_data, timeout=60)

            data = request.get_json()
            session_token = data.get('session_token')
            user_id = getattr(g, 'user_id', None)

            logger.info(f"Request data: session_token={session_token}, user_id={user_id}")
            logger.info(f"Request headers: {dict(request.headers)}")
            logger.info(f"Global context g attributes: {dir(g)}")
            logger.info(f"Global context g user_id: {getattr(g, 'user_id', 'Not set')}")

            # Debug JWT token if present
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header[7:]
                logger.info(f"JWT token present, length: {len(token)}")
                try:
                    import jwt
                    from src.config.app import Config
                    decoded = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
                    logger.info(f"JWT decoded successfully: {decoded}")
                except Exception as jwt_error:
                    logger.error(f"JWT decode error: {jwt_error}")
            else:
                logger.info("No JWT token in request")

            if not session_token:
                logger.warning("Session token is missing from request")
                return {
                    'success': False,
                    'message': 'Session token is required'
                }, 400

            if not user_id:
                logger.info(f"User not authenticated, redirecting to sign in. Session token: {session_token}")
                return {
                    'success': False,
                    'message': 'Please sign in to proceed with attendance.',
                    'redirect_to': '/signin',
                    'session_token': session_token,
                    'requires_sign_in': True
                }, 401

            # Validate session token against cache
            cache_key = f"qr_session:{session_token}"
            logger.info(f"Looking up cache key: {cache_key}")
            session_data = cache.get(cache_key)
            logger.info(f"Session data from cache: {session_data}")

            if not session_data:
                logger.warning(f"Invalid or expired session token: {session_token}")
                return {
                    'success': False,
                    'message': 'Invalid or expired session token'
                }, 400

            # Check if session token has already been used
            if session_data.get('used', False):
                logger.warning(f"Session token already used: {session_token}")
                return {
                    'success': False,
                    'message': 'Session token has already been used'
                }, 400

            # Check if session token has expired
            expires_at = datetime.fromisoformat(session_data['expires_at'])
            current_time = datetime.utcnow()
            logger.info(f"Current time: {current_time}, Expires at: {expires_at}")
            if current_time > expires_at:
                logger.warning(f"Session token expired: {session_token}")
                cache.delete(cache_key)  # Clean up expired token
                return {
                    'success': False,
                    'message': 'Session token has expired'
                }, 400

            logger.info("Session token validation passed")

            # Mark session token as used
            session_data['used'] = True
            session_data['used_at'] = datetime.utcnow().isoformat()
            # Encrypt sensitive data before storing in cache
            import hashlib
            session_data['used_by'] = hashlib.sha256(str(user_id).encode()).hexdigest()  # Hash user_id for privacy
            cache.set(cache_key, session_data, timeout=30)  # Extend cache for audit purposes
            logger.info("Session token marked as used")

            # Determine action based on last attendance
            last_attendance = self.biometric_model.get_employee_last_attendance(user_id)
            action = 'clock_in' if not last_attendance or last_attendance['clock_out_time'] else 'clock_out'

            # Get employee info for response
            employee_info = self.biometric_model.get_employee_by_id(user_id)

            # Record attendance
            logger.info(f"Recording QR attendance with method: qr_scan for user: {user_id}, action: {action}")
            attendance_result = self.biometric_model.record_attendance(
                user_id, action, 'qr_scan', 'kiosk'
            )

            # Check if already checked in or completed
            if attendance_result.get('action') in ['already_checked_in', 'already_completed']:
                return {
                    'success': False,
                    'message': attendance_result.get('message', 'Attendance already recorded'),
                    'action': attendance_result.get('action'),
                    'data': {
                        'employee_id': user_id,
                        'employee_name': employee_info.get('first_name', '') + ' ' + employee_info.get('last_name', '') if employee_info else 'Employee',
                        'timestamp': attendance_result.get('timestamp'),
                        'attendance': attendance_result
                    }
                }, 200  # Return 200 so frontend shows the pass with error message

            # Log attendance
            self.biometric_model.log_attendance(
                user_id, action, 'qr_scan', True,
                {'session_token': session_token, 'location': 'kiosk', 'session_data': session_data}
            )

            logger.info(f"QR attendance processed for user {user_id}: {action}")
            logger.info(f"Attendance result: {attendance_result}")
            logger.info(f"Employee info: {employee_info}")
            response_message = {
                'clock_in': f'Welcome to work! You have successfully clocked in.',
                'clock_out': f'Goodbye! You have successfully clocked out. Have a great day!'
            }

            return {
                'success': True,
                'message': response_message.get(action, f'Successfully {action.replace("_", " ")}'),
                'action': action,
                'data': {
                    'employee_id': user_id,
                    'employee_name': employee_info.get('first_name', '') + ' ' + employee_info.get('last_name', '') if employee_info else 'Employee',
                    'timestamp': attendance_result.get('timestamp'),
                    'status': attendance_result.get('status', 'present'),
                    'method': 'qr_scan',
                    'attendance': attendance_result
                }
            }, 200

        except Exception as e:
            logger.error(f"=== QR SCAN REQUEST ERROR ===")
            logger.error(f"Error processing QR attendance: {e}")
            logger.error(f"Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return {
                'success': False,
                'message': 'Error processing attendance'
            }, 500

    def get_attendance_records(self) -> tuple[Dict[str, Any], int]:
        """Get attendance records with optional filtering"""
        try:
            # Get query parameters
            employee_name = request.args.get('employee_name')
            department = request.args.get('department')
            date_from = request.args.get('date_from')
            date_to = request.args.get('date_to')
            status = request.args.get('status')
            user_id = request.args.get('user_id')

            filters = {}
            if employee_name:
                filters['employee_name'] = employee_name
            if department:
                filters['department'] = department
            if date_from:
                filters['date_from'] = date_from
            if date_to:
                filters['date_to'] = date_to
            if status:
                filters['status'] = status
            if user_id:
                filters['user_id'] = user_id

            records = self.biometric_model.get_attendance_records(filters)

            return {
                'success': True,
                'records': records
            }, 200

        except Exception as e:
            logger.error(f"Error getting attendance records: {e}")
            return {
                'success': False,
                'message': 'Error retrieving attendance records'
            }, 500

    def get_attendance_stats(self) -> tuple[Dict[str, Any], int]:
        """Get attendance statistics"""
        try:
            date = request.args.get('date')
            department = request.args.get('department')

            stats = self.biometric_model.get_attendance_stats(date, department)

            return {
                'success': True,
                'stats': stats
            }, 200

        except Exception as e:
            logger.error(f"Error getting attendance stats: {e}")
            return {
                'success': False,
                'message': 'Error retrieving attendance statistics'
            }, 500

    def get_checked_in_employees(self) -> tuple[Dict[str, Any], int]:
        """Get currently checked-in employees"""
        try:
            employees = self.biometric_model.get_checked_in_employees()

            return {
                'success': True,
                'employees': employees
            }, 200

        except Exception as e:
            logger.error(f"Error getting checked-in employees: {e}")
            return {
                'success': False,
                'message': 'Error retrieving checked-in employees'
            }, 500

    # Pillar 2: HR Dashboard monitoring methods
    def get_manual_fallback_attendances(self) -> tuple[Dict[str, Any], int]:
        """Get manual fallback attendances for HR review (all time)"""
        try:
            attendances = self.biometric_model.get_manual_fallback_attendances()
            return {
                'success': True,
                'attendances': attendances
            }, 200
        except Exception as e:
            logger.error(f"Error getting manual fallback attendances: {e}")
            return {
                'success': False,
                'message': 'Error retrieving manual fallback attendances'
            }, 500

    def get_attendances_by_method(self, method: str) -> tuple[Dict[str, Any], int]:
        """Get attendances by verification method"""
        try:
            attendances = self.biometric_model.get_attendances_by_method(method)
            return {
                'success': True,
                'attendances': attendances
            }, 200
        except Exception as e:
            logger.error(f"Error getting attendances by method: {e}")
            return {
                'success': False,
                'message': 'Error retrieving attendances by method'
            }, 500

    def flag_attendance_for_audit(self, attendance_id: int) -> tuple[Dict[str, Any], int]:
        """Flag attendance for audit review"""
        try:
            data = request.get_json()
            audit_notes = data.get('auditNotes', 'Flagged for manual check-in review')
            self.biometric_model.flag_attendance_for_audit(attendance_id, audit_notes)
            return {
                'success': True,
                'message': 'Attendance flagged for audit successfully'
            }, 200
        except Exception as e:
            logger.error(f"Error flagging attendance for audit: {e}")
            return {
                'success': False,
                'message': 'Error flagging attendance for audit'
            }, 500

    def get_manual_fallbacks_by_date_range(self) -> tuple[Dict[str, Any], int]:
        """Get manual fallback attendances by date range"""
        try:
            start_date = request.args.get('startDate')
            end_date = request.args.get('endDate')
            attendances = self.biometric_model.get_manual_fallbacks_by_date_range(start_date, end_date)
            return {
                'success': True,
                'attendances': attendances
            }, 200
        except Exception as e:
            logger.error(f"Error getting manual fallbacks by date range: {e}")
            return {
                'success': False,
                'message': 'Error retrieving manual fallbacks by date range'
            }, 500

    def get_user_attendance_by_date_range(self, user_id: int) -> tuple[Dict[str, Any], int]:
        """Get user attendance by date range"""
        try:
            start_date = request.args.get('startDate')
            end_date = request.args.get('endDate')
            attendances = self.biometric_model.get_user_attendance_by_date_range(user_id, start_date, end_date)
            return {
                'success': True,
                'attendances': attendances
            }, 200
        except Exception as e:
            logger.error(f"Error getting user attendance by date range: {e}")
            return {
                'success': False,
                'message': 'Error retrieving user attendance by date range'
            }, 500

    def get_buddy_punch_report(self) -> tuple[Dict[str, Any], int]:
        """Generate buddy punch risk report"""
        try:
            manual_attendances = self.biometric_model.get_manual_fallback_attendances()
            report = {
                'totalManualEntries': len(manual_attendances),
                'flaggedAttendances': manual_attendances,
                'reportGeneratedAt': datetime.utcnow().isoformat(),
                'buddyPunchRisk': 'HIGH' if len(manual_attendances) > 10 else 'MEDIUM' if len(manual_attendances) > 5 else 'LOW'
            }
            return {
                'success': True,
                'report': report
            }, 200
        except Exception as e:
            logger.error(f"Error generating buddy punch report: {e}")
            return {
                'success': False,
                'message': 'Error generating buddy punch report'
            }, 500

    def flag_buddy_punch_risk(self, attendance_id: int) -> tuple[Dict[str, Any], int]:
        """Flag attendance for buddy punch review"""
        try:
            data = request.get_json()
            reason = data.get('reason', 'Flagged for buddy punch review')
            self.biometric_model.flag_attendance_for_audit(attendance_id, reason)
            return {
                'success': True,
                'message': 'Attendance flagged for buddy punch review'
            }, 200
        except Exception as e:
            logger.error(f"Error flagging buddy punch risk: {e}")
            return {
                'success': False,
                'message': 'Error flagging attendance'
            }, 500

    def get_attendance_method_statistics(self) -> tuple[Dict[str, Any], int]:
        """Get attendance method distribution statistics (all time)"""
        try:
            # Query database for all-time counts - only count manual check-ins
            query = """
                SELECT 
                    COUNT(DISTINCT CASE WHEN clock_in_method LIKE '%qr%' THEN user_id END) as qr_count,
                    COUNT(DISTINCT CASE WHEN clock_in_method = 'manual' THEN user_id END) as manual_count,
                    COUNT(DISTINCT CASE WHEN clock_in_method IN ('card', 'biometric') THEN user_id END) as card_count,
                    COUNT(DISTINCT user_id) as total_count
                FROM attendance_records
            """
            
            result = self.biometric_model.db.execute_query(query)
            
            if result and len(result) > 0:
                data = result[0]
                qr_count = data.get('qr_count', 0)
                manual_count = data.get('manual_count', 0)
                card_count = data.get('card_count', 0)
                total = data.get('total_count', 0)
            else:
                qr_count = manual_count = card_count = total = 0

            stats = {
                'qrCount': qr_count,
                'manualCount': manual_count,
                'cardCount': card_count,
                'totalAttendances': total,
                'manualPercentage': (manual_count / total * 100) if total > 0 else 0
            }

            return {
                'success': True,
                'stats': stats
            }, 200
        except Exception as e:
            logger.error(f"Error getting attendance method statistics: {e}")
            return {
                'success': False,
                'message': 'Error retrieving attendance method statistics'
            }, 500

    def review_attendance(self, attendance_id: int) -> tuple[Dict[str, Any], int]:
        """Review and approve/reject attendance record"""
        try:
            data = request.get_json()
            hr_user_id = data.get('hrUserId')
            notes = data.get('notes', '')
            
            if not hr_user_id:
                return {
                    'success': False,
                    'message': 'HR user ID is required'
                }, 400
            
            # Update attendance record with review
            self.biometric_model.review_attendance_record(attendance_id, hr_user_id, notes)
            
            return {
                'success': True,
                'message': 'Attendance reviewed successfully'
            }, 200
        except Exception as e:
            logger.error(f"Error reviewing attendance: {e}")
            return {
                'success': False,
                'message': 'Error reviewing attendance'
            }, 500

    def get_today_attendance_count(self) -> tuple[Dict[str, Any], int]:
        """Get today's attendance count for Java backend"""
        try:
            today = datetime.now().date()
            query = "SELECT COUNT(DISTINCT user_id) as count FROM attendance_records WHERE DATE(clock_in_time) = %s"
            result = self.biometric_model.db.execute_query(query, (today,))
            count = result[0]['count'] if result else 0
            return count, 200
        except Exception as e:
            logger.error(f"Error getting today attendance count: {e}")
            return 0, 500

    def get_monthly_attendance_stats(self) -> tuple[Dict[str, Any], int]:
        """Get monthly attendance statistics for Java backend"""
        try:
            from datetime import date
            today = date.today()
            first_day = today.replace(day=1)
            query = "SELECT COUNT(*) as total FROM attendance_records WHERE DATE(clock_in_time) >= %s AND DATE(clock_in_time) <= %s"
            result = self.biometric_model.db.execute_query(query, (first_day, today))
            total = result[0]['total'] if result else 0
            return {'totalAttendance': total}, 200
        except Exception as e:
            logger.error(f"Error getting monthly attendance stats: {e}")
            return {'totalAttendance': 0}, 500
