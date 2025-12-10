from flask import request, g
from typing import Dict, Any, Optional
from datetime import datetime

from .models import BiometricModel
from .service import BiometricService
from src.mockData.biometric_service import (
    enroll_biometric_mock, verify_biometric_mock, identify_biometric_mock,
    lookup_card_mock, get_biometric_statistics_mock
)
from src.middleware.auth import require_permission
from src.utils.logger import logger
from src.config.app import Config

class BiometricController:
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.biometric_model = BiometricModel(db_manager) if not Config.USE_MOCK_DATA else None
        self.biometric_service = BiometricService()
        self.use_mock_data = Config.USE_MOCK_DATA
    
    def enroll_biometric(self) -> tuple[Dict[str, Any], int]:
        """Handle biometric enrollment"""
        try:
            data = request.get_json()

            # Handle both snake_case and camelCase field names
            user_id = data.get('user_id') or data.get('userId')
            visitor_id = data.get('visitor_id') or data.get('visitorId')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')
            
            if not biometric_type:
                return {
                    'success': False,
                    'message': 'Biometric type is required'
                }, 400

            if not raw_data:
                return {
                    'success': False,
                    'message': 'Raw data is required for this biometric type'
                }, 400
            
            if not user_id and not visitor_id:
                return {
                    'success': False,
                    'message': 'Either user_id or visitor_id is required'
                }, 400
            
            # Use mock data if configured
            if self.use_mock_data:
                result = enroll_biometric_mock(user_id, visitor_id, biometric_type, raw_data)
                logger.info(f"Mock biometric enrollment: {result}")
                return {
                    'success': True,
                    'message': 'Biometric data enrolled successfully (mock)',
                    'data': result
                }, 201
            
            # Process biometric data
            template_data = None
            template_hash = None
            
            if biometric_type == 'face':
                is_valid, error_msg = self.biometric_service.validate_image_quality(raw_data)
                if not is_valid:
                    return {
                        'success': False,
                        'message': f'Image quality validation failed: {error_msg}'
                    }, 400
                
                result, error = self.biometric_service.process_face_image(raw_data)
                if error:
                    return {
                        'success': False,
                        'message': error
                    }, 400
                template_data = result['template_data']
                template_hash = result['template_hash']
                

                
            elif biometric_type == 'card':
                result = self.biometric_service.process_card_data(raw_data)
                template_data = result['template_data']
                template_hash = result['template_hash']
            
            # Store in database
            enrollment_result = self.biometric_model.enroll_biometric(
                user_id, visitor_id, biometric_type, template_data, template_hash
            )
            
            # Log the enrollment
            self.biometric_model.log_biometric_access(
                user_id, biometric_type, 'enrollment', True, 
                {'enrollment_id': enrollment_result['biometric_id']}
            )
            
            logger.info(f"Biometric enrollment successful: {enrollment_result}")
            
            return {
                'success': True,
                'message': 'Biometric data enrolled successfully',
                'data': enrollment_result
            }, 201
            
        except Exception as e:
            logger.error(f"Error in biometric enrollment: {e}")
            return {
                'success': False,
                'message': 'Error enrolling biometric data'
            }, 500

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
        """Verify biometric data against stored template (1:1 verification)"""
        try:
            data = request.get_json()

            # Handle both snake_case and camelCase field names
            user_id = data.get('user_id') or data.get('userId')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')

            if not all([user_id, biometric_type]):
                return {
                    'success': False,
                    'message': 'User ID and biometric type are required'
                }, 400

            if not raw_data:
                return {
                    'success': False,
                    'message': 'Raw data is required for this biometric type'
                }, 400

            # Use mock data if configured
            if self.use_mock_data:
                result = verify_biometric_mock(user_id, biometric_type, raw_data)
                logger.info(f"Mock biometric verification: {result}")
                return {
                    'success': True,
                    'data': result
                }, 200

            # Process the provided biometric data
            live_template = None

            if biometric_type == 'face':
                is_valid, error_msg = self.biometric_service.validate_image_quality(raw_data)
                if not is_valid:
                    return {
                        'success': False,
                        'message': f'Image quality validation failed: {error_msg}'
                    }, 400

                result, error = self.biometric_service.process_face_image(raw_data)
                if error:
                    return {
                        'success': False,
                        'message': error
                    }, 400
                live_template = result['template_data']
            else: # card
                processed = self.biometric_service.process_card_data(raw_data)
                live_template = processed['template_data']
            
            # Retrieve stored template from database
            stored_template = self.biometric_model.get_biometric_template(user_id, biometric_type)
            
            if not stored_template:
                self.biometric_model.log_biometric_access(
                    user_id, biometric_type, 'verification', False,
                    {'reason': 'No template found'}
                )
                return {
                    'success': False,
                    'message': 'No biometric template found for user'
                }, 404
            
            # Compare templates
            verification_result = self.biometric_service.verify_biometric(
                live_template, stored_template, biometric_type
            )
            
            # Log the verification attempt
            self.biometric_model.log_biometric_access(
                user_id, biometric_type, 'verification', verification_result['is_match'],
                {'similarity_score': verification_result['similarity_score']}
            )
            
            verification_result['user_id'] = user_id
            
            logger.info(f"Biometric verification completed: {verification_result}")
            
            return {
                'success': True,
                'data': verification_result
            }, 200
            
        except Exception as e:
            logger.error(f"Error in biometric verification: {e}")
            return {
                'success': False,
                'message': 'Error verifying biometric data'
            }, 500
    
    def identify_biometric(self) -> tuple[Dict[str, Any], int]:
        """Identify user from biometric data (1:N identification)"""
        try:
            data = request.get_json()

            biometric_type = data.get('biometric_type')
            raw_data = data.get('raw_data')

            if not biometric_type:
                return {
                    'success': False,
                    'message': 'Biometric type is required'
                }, 400

            if not raw_data:
                return {
                    'success': False,
                    'message': 'Raw data is required for this biometric type'
                }, 400

            # Use mock data if configured
            if self.use_mock_data:
                result = identify_biometric_mock(biometric_type, raw_data)
                logger.info(f"Mock biometric identification: {result}")

                if result:
                    return {
                        'success': True,
                        'data': result
                    }, 200
                else:
                    return {
                        'success': False,
                        'message': 'No matching biometric template found'
                    }, 404

            # Process the provided biometric data
            live_template = None

            if biometric_type == 'face':
                is_valid, error_msg = self.biometric_service.validate_image_quality(raw_data)
                if not is_valid:
                    return {
                        'success': False,
                        'message': f'Image quality validation failed: {error_msg}'
                    }, 400

                result, error = self.biometric_service.process_face_image(raw_data)
                if error:
                    return {
                        'success': False,
                        'message': error
                    }, 400
                live_template = result['template_data']
            else: # card
                processed = self.biometric_service.process_card_data(raw_data)
                live_template = processed['template_data']
            
            # Retrieve all stored templates of the same type
            stored_templates = self.biometric_model.get_all_templates(biometric_type)
            
            if not stored_templates:
                return {
                    'success': False,
                    'message': 'No biometric templates found'
                }, 404
            
            # Identify user from templates
            identification_result = self.biometric_service.identify_from_templates(
                live_template, stored_templates, biometric_type
            )
            
            if identification_result:
                # Determine action based on last attendance
                user_id = identification_result['user_id']
                last_attendance = self.biometric_model.get_employee_last_attendance(user_id)

                if last_attendance and last_attendance['clock_out_time'] is None:
                    action = 'clock_out'
                else:
                    action = 'clock_in'

                # Update the result with action
                identification_result['action'] = action

                # Log successful identification
                self.biometric_model.log_biometric_access(
                    user_id, biometric_type, 'identification', True,
                    {'similarity_score': identification_result['similarity_score'], 'action': action}
                )

                logger.info(f"Biometric identification successful: {identification_result}")

                return {
                    'success': True,
                    'data': identification_result
                }, 200
            else:
                # Log failed identification
                self.biometric_model.log_biometric_access(
                    None, biometric_type, 'identification', False,
                    {'reason': 'No match found'}
                )
                
                return {
                    'success': False,
                    'message': 'No matching biometric template found'
                }, 404
                
        except Exception as e:
            logger.error(f"Error in biometric identification: {e}")
            return {
                'success': False,
                'message': 'Error identifying biometric data'
            }, 500
    
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
        """Handle attendance clock-in with biometric verification"""
        try:
            data = request.get_json()

            # Handle both snake_case and camelCase field names
            user_id = data.get('user_id') or data.get('userId')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')
            location = data.get('location')

            if not user_id:
                return {
                    'success': False,
                    'message': 'User ID is required'
                }, 400

            # Use mock data if configured
            if self.use_mock_data:
                # For mock, just record attendance without biometric verification
                attendance_result = self.biometric_model.record_attendance(user_id, 'clock_in', 'face_mock', location)
                self.biometric_model.log_attendance(user_id, 'clock_in', 'face_mock', True, {'location': location})

                return {
                    'success': True,
                    'message': 'Clocked in successfully (mock)',
                    'data': attendance_result
                }, 200

            # Verify biometric data first
            if biometric_type and raw_data:
                verification_result = self.verify_biometric()
                if verification_result[1] != 200 or not verification_result[0]['success']:
                    return {
                        'success': False,
                        'message': 'Biometric verification failed'
                    }, 401

            # Record attendance
            attendance_result = self.biometric_model.record_attendance(user_id, 'clock_in', biometric_type or 'manual', location)

            # Log attendance
            self.biometric_model.log_attendance(user_id, 'clock_in', biometric_type or 'manual', True, {
                'location': location,
                'biometric_verification': biometric_type is not None
            })

            logger.info(f"Attendance clock-in successful for user {user_id}")

            return {
                'success': True,
                'message': 'Clocked in successfully',
                'data': attendance_result
            }, 200

        except Exception as e:
            logger.error(f"Error in attendance clock-in: {e}")
            return {
                'success': False,
                'message': 'Error processing clock-in'
            }, 500

    def attendance_clock_out(self) -> tuple[Dict[str, Any], int]:
        """Handle attendance clock-out with biometric verification"""
        try:
            data = request.get_json()

            # Handle both snake_case and camelCase field names
            user_id = data.get('user_id') or data.get('userId')
            biometric_type = data.get('biometric_type') or data.get('biometricType')
            raw_data = data.get('raw_data') or data.get('rawData')
            location = data.get('location')

            if not user_id:
                return {
                    'success': False,
                    'message': 'User ID is required'
                }, 400

            # Use mock data if configured
            if self.use_mock_data:
                # For mock, just record attendance without biometric verification
                attendance_result = self.biometric_model.record_attendance(user_id, 'clock_out', 'face_mock', location)
                self.biometric_model.log_attendance(user_id, 'clock_out', 'face_mock', True, {'location': location})

                return {
                    'success': True,
                    'message': 'Clocked out successfully (mock)',
                    'data': attendance_result
                }, 200

            # Verify biometric data first
            if biometric_type and raw_data:
                verification_result = self.verify_biometric()
                if verification_result[1] != 200 or not verification_result[0]['success']:
                    return {
                        'success': False,
                        'message': 'Biometric verification failed'
                    }, 401

            # Record attendance
            attendance_result = self.biometric_model.record_attendance(user_id, 'clock_out', biometric_type or 'manual', location)

            # Log attendance
            self.biometric_model.log_attendance(user_id, 'clock_out', biometric_type or 'manual', True, {
                'location': location,
                'biometric_verification': biometric_type is not None
            })

            logger.info(f"Attendance clock-out successful for user {user_id}")

            return {
                'success': True,
                'message': 'Clocked out successfully',
                'data': attendance_result
            }, 200

        except Exception as e:
            logger.error(f"Error in attendance clock-out: {e}")
            return {
                'success': False,
                'message': 'Error processing clock-out'
            }, 500

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

            # In a real implementation, you might store this in cache/redis with expiry
            # For now, we'll just return the token that can be used for attendance

            qr_data = {
                'type': 'attendance_kiosk',
                'session_token': session_token,
                'timestamp': datetime.utcnow().isoformat(),
                'valid_for': 300  # 5 minutes
            }

            # Encode as base64 for QR code
            import base64
            import json
            qr_string = base64.b64encode(json.dumps(qr_data).encode()).decode()

            return {
                'success': True,
                'qr_data': qr_string,
                'session_token': session_token,
                'expires_in': 300
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
            data = request.get_json()
            session_token = data.get('session_token')
            user_id = data.get('user_id') or getattr(g, 'user_id', None)

            if not session_token or not user_id:
                return {
                    'success': False,
                    'message': 'Session token and user ID required'
                }, 400

            # Validate session token (in real implementation, check cache/redis)
            # For now, just check if it's a valid UUID format
            import uuid
            try:
                uuid.UUID(session_token)
            except ValueError:
                return {
                    'success': False,
                    'message': 'Invalid session token'
                }, 400

            # Determine action based on last attendance
            last_attendance = self.biometric_model.get_employee_last_attendance(user_id)
            action = 'clock_in' if not last_attendance or last_attendance['clock_out_time'] else 'clock_out'

            # Record attendance
            attendance_result = self.biometric_model.record_attendance(
                user_id, action, 'qr_scan', 'kiosk'
            )

            # Log attendance
            self.biometric_model.log_attendance(
                user_id, action, 'qr_scan', True,
                {'session_token': session_token, 'location': 'kiosk'}
            )

            return {
                'success': True,
                'message': f'Successfully {action.replace("_", " ")}',
                'action': action,
                'data': attendance_result
            }, 200

        except Exception as e:
            logger.error(f"Error processing QR attendance: {e}")
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
