import requests
import os
from datetime import datetime, timezone

class AuditService:
    def __init__(self):
        self.java_backend_url = os.getenv('JAVA_BACKEND_URL', 'http://localhost:5002')

    def log_action(self, user_id, action, details=None):
        try:
            audit_log = {
                'action': action,
                'performedBy': str(user_id) if user_id else None,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'details': str(details) if details else '{}'
            }
            response = requests.post(f"{self.java_backend_url}/system/audit-logs", json=audit_log)
            response.raise_for_status()
        except Exception as e:
            print(f"Failed to log audit: {e}")
            # Don't raise to avoid blocking operations

audit_service = AuditService()
