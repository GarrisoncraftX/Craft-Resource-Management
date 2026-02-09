import base64
import hashlib
from typing import Optional, Dict, Any, Tuple
from src.utils.logger import logger
from src.audit_service import audit_service
from src.config.app import Config
import os
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
import secrets

class AttendanceService:
    def __init__(self):
        self.encryption_key = os.getenv('BIOMETRIC_ENCRYPTION_KEY', secrets.token_bytes(32))
    
    def process_card_data(self, card_data: str, user_id: str) -> Dict[str, str]:
        """Process card data"""
        try:
            template_hash = hashlib.sha256(card_data.encode()).hexdigest()
            template_data = base64.b64encode(card_data.encode()).decode('utf-8')

            audit_service.log_action(user_id, 'PROCESS_CARD_DATA', {'method': 'card', 'template_hash': template_hash})
            return {
                'template_hash': template_hash,
                'template_data': template_data,
                'method': 'card'
            }
        except Exception as e:
            logger.error(f"Error processing card data: {e}")
            audit_service.log_action(user_id, 'PROCESS_CARD_DATA_FAILED', {'reason': 'exception', 'error': str(e)})
            raise e
    
    def verify_biometric(self, live_template: str, stored_template: str, biometric_type: str, user_id: str) -> Dict[str, Any]:
        """Verify biometric data against stored template (1:1 verification)"""
        audit_service.log_action(user_id, 'VERIFY_BIOMETRIC', {'biometric_type': biometric_type})
        try:
            is_match = live_template == stored_template
            similarity_score = 1.0 if is_match else 0.0

            audit_service.log_action(user_id, 'VERIFY_BIOMETRIC', {'entity': 'biometric', 'type': biometric_type, 'is_match': is_match})

            return {
                'is_match': is_match,
                'similarity_score': similarity_score,
                'threshold': 1.0
            }
        except Exception as e:
            logger.error(f"Error verifying biometric: {e}")
            raise e
    
    def identify_from_templates(self, live_template: str, stored_templates: list, biometric_type: str) -> Optional[Dict[str, Any]]:
        """Identify user from biometric data (1:N identification)"""
        try:
            best_match = None
            best_similarity = 0.0
            threshold = 1.0
            
            for user_id, stored_template, first_name, last_name, employee_id in stored_templates:
                similarity = 1.0 if live_template == stored_template else 0.0
                
                if similarity >= threshold and similarity > best_similarity:
                    best_similarity = similarity
                    best_match = {
                        'user_id': user_id,
                        'first_name': first_name,
                        'last_name': last_name,
                        'employee_id': employee_id,
                        'similarity_score': similarity
                    }
            
            return best_match
        except Exception as e:
            logger.error(f"Error identifying from templates: {e}")
            raise e

    def encrypt_template(self, template_data: str) -> str:
        """Encrypt biometric template using AES-256"""
        try:
            iv = secrets.token_bytes(16)
            cipher = Cipher(algorithms.AES(self.encryption_key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            padder = padding.PKCS7(algorithms.AES.block_size).padder()
            padded_data = padder.update(template_data.encode()) + padder.finalize()
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
            encrypted_blob = iv + encrypted_data
            return base64.b64encode(encrypted_blob).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encrypting template: {e}")
            raise e

    def decrypt_template(self, encrypted_template: str) -> str:
        """Decrypt biometric template using AES-256"""
        try:
            encrypted_blob = base64.b64decode(encrypted_template)
            iv = encrypted_blob[:16]
            encrypted_data = encrypted_blob[16:]
            cipher = Cipher(algorithms.AES(self.encryption_key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()
            padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
            unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
            data = unpadder.update(padded_data) + unpadder.finalize()
            return data.decode('utf-8')
        except Exception as e:
            logger.error(f"Error decrypting template: {e}")
            raise e
