import requests
import os
from src.utils.logger import logger
from src.config.app import config as app_config_dict

class CommunicationService:
    """Service for handling email and SMS communications via Node.js backend"""

    def __init__(self):
        env = os.getenv('FLASK_ENV', 'development')
        app_config = app_config_dict.get(env, app_config_dict['default'])

        # Node.js backend URL for communication service
        nodejs_backend_url = os.getenv('NODE_BACKEND_URL', 'http://localhost:5001')
        self.communication_base_url = f"{nodejs_backend_url}/api/communication"

        # Fallback configurations for development
        self.mail_default_sender = app_config.MAIL_DEFAULT_SENDER if hasattr(app_config, 'MAIL_DEFAULT_SENDER') else 'noreply@gmail.com'

        # AWS configuration (kept for potential future use, not used for SMS)
        self.aws_access_key_id = app_config.AWS_ACCESS_KEY_ID
        self.aws_secret_access_key = app_config.AWS_SECRET_ACCESS_KEY
        self.aws_region = app_config.AWS_REGION

    def send_email(self, to_email, subject, message):
        """Send an email via Node.js backend"""
        try:
            url = f"{self.communication_base_url}/email"
            payload = {
                'to': to_email,
                'subject': subject,
                'message': message
            }

            response = requests.post(url, json=payload, timeout=10)

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    logger.info(f"Email sent successfully to {to_email}")
                    return True
                else:
                    logger.error(f"Failed to send email to {to_email}: {result.get('error')}")
                    return False
            else:
                logger.error(f"Failed to send email to {to_email}: HTTP {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            # For development/testing, log the email instead of failing
            if os.getenv('FLASK_ENV') == 'development':
                logger.info(f"Development mode: Email would be sent to {to_email} with subject '{subject}' and message: {message}")
                return True
            return False

    def send_sms(self, to_phone, message):
        """Send an SMS via Node.js backend"""
        try:
            url = f"{self.communication_base_url}/sms"
            payload = {
                'to': to_phone,
                'message': message
            }

            response = requests.post(url, json=payload, timeout=10)

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    logger.info(f"SMS sent successfully to {to_phone}")
                    return True
                else:
                    logger.error(f"Failed to send SMS to {to_phone}: {result.get('error')}")
                    return False
            else:
                logger.error(f"Failed to send SMS to {to_phone}: HTTP {response.status_code}")
                return False

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send SMS to {to_phone}: {str(e)}")
            # For development/testing, log the SMS instead of failing
            if os.getenv('FLASK_ENV') == 'development':
                logger.info(f"Development mode: SMS would be sent to {to_phone} with message: {message}")
                return True
            return False

# Create singleton instance
communication_service = CommunicationService()
