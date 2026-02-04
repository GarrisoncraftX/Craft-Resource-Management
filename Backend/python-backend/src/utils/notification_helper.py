import requests
import os
from src.utils.logger import logger

JAVA_BACKEND_URL = os.getenv('JAVA_BACKEND_URL', 'http://localhost:5002')

class NotificationHelper:
    @staticmethod
    def send_notification(user_id, title, message, notification_type='INFO'):
        try:
            response = requests.post(
                f'{JAVA_BACKEND_URL}/system/notifications',
                json={
                    'userId': user_id,
                    'title': title,
                    'message': message,
                    'type': notification_type
                },
                timeout=5
            )
            response.raise_for_status()
            logger.info(f"Notification sent to user {user_id}: {title}")
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")

    @staticmethod
    def notify_visitor_approval_request(host_user_id, visitor_name, purpose, visitor_id):
        NotificationHelper.send_notification(
            host_user_id,
            'Visitor Approval Required',
            f'{visitor_name} is waiting for approval. Purpose: {purpose}. Visitor ID: {visitor_id}',
            'WARNING'
        )

    @staticmethod
    def notify_incident_reported(user_id, severity, description):
        NotificationHelper.send_notification(
            user_id,
            'Incident Report Submitted',
            f'Your {severity} incident report has been submitted: {description[:50]}...',
            'WARNING'
        )

    @staticmethod
    def notify_safety_inspection(user_id, location, date):
        NotificationHelper.send_notification(
            user_id,
            'Safety Inspection Scheduled',
            f'Safety inspection scheduled at {location} on {date}.',
            'INFO'
        )

    @staticmethod
    def notify_safety_training(user_id, training_name, date):
        NotificationHelper.send_notification(
            user_id,
            'Safety Training Scheduled',
            f'You have been enrolled in {training_name} on {date}.',
            'INFO'
        )

notification_helper = NotificationHelper()
