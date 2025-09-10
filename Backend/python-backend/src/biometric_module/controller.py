from flask import request, g
from typing import Dict, Any, Optional

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
            
            user_id = data.get('user_id')
            visitor_id = data.get('visitor_id')
            biometric_type = data.get('biometric_type')
            raw_data = data.get('raw_data')
            
            if not biometric_type or not raw_data:
                return {
                    'success': False,
                    'message': 'Biometric type and raw data are required'
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
                # Validate image quality first
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
                
            elif biometric_type == 'fingerprint':
                result = self.biometric_service.process_fingerprint_data(raw_data)
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
            
            user_id = data.get('user_id')
            biometric_type = data.get('biometric_type')
            raw_data = data.get('raw_data')
            
            if not all([user_id, biometric_type, raw_data]):
                return {
                    'success': False,
                    'message': 'User ID, biometric type, and raw data are required'
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
                # Validate image quality first
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
            else:
                # Mock processing for fingerprint/card
                processed = self.biometric_service.process_fingerprint_data(raw_data) if biometric_type == 'fingerprint' else self.biometric_service.process_card_data(raw_data)
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
            
            if not all([biometric_type, raw_data]):
                return {
                    'success': False,
                    'message': 'Biometric type and raw data are required'
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
                # Validate image quality first
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
            else:
                # Mock processing for fingerprint/card
                processed = self.biometric_service.process_fingerprint_data(raw_data) if biometric_type == 'fingerprint' else self.biometric_service.process_card_data(raw_data)
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
                # Log successful identification
                self.biometric_model.log_biometric_access(
                    identification_result['user_id'], biometric_type, 'identification', True,
                    {'similarity_score': identification_result['similarity_score']}
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
