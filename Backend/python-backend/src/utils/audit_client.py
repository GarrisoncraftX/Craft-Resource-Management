import requests
import os
import json
from datetime import datetime

class AuditClient:
    def __init__(self):
        self.java_backend_url = os.getenv('JAVA_BACKEND_URL', 'http://localhost:5002')

    def log_action(self, user_id, action, details=None):
        """
        Log an audit action synchronously to the Java backend.
        """
        if details is None:
            details = {}

        audit_log = {
            'action': action,
            'performedBy': str(user_id) if user_id else None,
            'timestamp': datetime.utcnow().isoformat(),
            'details': json.dumps(details)
        }

        try:
            response = requests.post(f"{self.java_backend_url}/system/audit-logs", json=audit_log)
            response.raise_for_status() 
        except requests.RequestException as e:
            print(f"Failed to log audit: {e}")
            raise e  

    def log_entity_action(self, entity_type, entity_id, action, user_id, details=None):
        """
        Log an entity-specific audit action.
        """
        if details is None:
            details = {}
        full_details = {
            'entityType': entity_type,
            'entityId': entity_id,
            **details
        }
        self.log_action(user_id, action, full_details)

# Singleton instance
audit_client = AuditClient()
