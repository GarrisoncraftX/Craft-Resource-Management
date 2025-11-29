import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from src.utils.logger import logger
from src.config.app import config as app_config_dict

class CommunicationService:
    """Service for handling email and SMS communications"""

    def __init__(self):
        env = os.getenv('FLASK_ENV', 'development')
        app_config = app_config_dict.get(env, app_config_dict['default'])
        self.mail_server = app_config.MAIL_SERVER
        self.mail_port = app_config.MAIL_PORT
        self.mail_use_tls = app_config.MAIL_USE_TLS
        self.mail_use_ssl = app_config.MAIL_USE_SSL
        self.mail_username = app_config.MAIL_USERNAME
        self.mail_password = app_config.MAIL_PASSWORD
        self.mail_default_sender = app_config.MAIL_DEFAULT_SENDER

        # SMS configuration
        self.twilio_account_sid = app_config.TWILIO_ACCOUNT_SID
        self.twilio_auth_token = app_config.TWILIO_AUTH_TOKEN
        self.twilio_phone_number = app_config.TWILIO_PHONE_NUMBER

    def send_email(self, to_email, subject, message):
        """Send an email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.mail_default_sender
            msg['To'] = to_email
            msg['Subject'] = subject

            # Add body to email
            msg.attach(MIMEText(message, 'plain'))

            # Create SMTP session
            if self.mail_use_ssl:
                server = smtplib.SMTP_SSL(self.mail_server, self.mail_port)
            else:
                server = smtplib.SMTP(self.mail_server, self.mail_port)

            if self.mail_use_tls:
                server.starttls()

            # Login to SMTP server
            if self.mail_username and self.mail_password:
                server.login(self.mail_username, self.mail_password)

            # Send email
            text = msg.as_string()
            server.sendmail(self.mail_default_sender, to_email, text)
            server.quit()

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            # For development/testing, log the email instead of failing
            if os.getenv('FLASK_ENV') == 'development':
                logger.info(f"Development mode: Email would be sent to {to_email} with subject '{subject}' and message: {message}")
                return True
            return False

    def send_sms(self, to_phone, message):
        """Send an SMS using Twilio"""
        try:
            if not self.twilio_account_sid or not self.twilio_auth_token or not self.twilio_phone_number:
                logger.warning("Twilio credentials not configured, SMS not sent")
                if os.getenv('FLASK_ENV') == 'development':
                    logger.info(f"Development mode: SMS would be sent to {to_phone} with message: {message}")
                    return True
                return False

            # Import Twilio here to avoid dependency issues if not installed
            from twilio.rest import Client

            client = Client(self.twilio_account_sid, self.twilio_auth_token)
            client.messages.create(
                body=message,
                from_=self.twilio_phone_number,
                to=to_phone
            )

            logger.info(f"SMS sent successfully to {to_phone}")
            return True

        except ImportError:
            logger.warning("Twilio not installed, SMS functionality disabled")
            if os.getenv('FLASK_ENV') == 'development':
                logger.info(f"Development mode: SMS would be sent to {to_phone} with message: {message}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_phone}: {str(e)}")
            return False

# Create singleton instance
communication_service = CommunicationService()
