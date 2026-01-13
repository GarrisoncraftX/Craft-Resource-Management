import requests
import os
import logging
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from collections import deque
import threading
import time

logger = logging.getLogger(__name__)

class AuditService:
    def __init__(self):
        self.java_backend_url = os.getenv('JAVA_BACKEND_URL', 'http://localhost:5002')
        self.service_auth_token = os.getenv('SERVICE_AUTH_TOKEN', 'default-service-token-change-in-production')
        self.batch_size = 50
        self.flush_interval = 5
        self.audit_queue = deque(maxlen=1000)
        self.lock = threading.Lock()
        self.running = True
        
        self.flush_thread = threading.Thread(target=self._flush_worker, daemon=True)
        self.flush_thread.start()

    def log_action(self, user_id: Optional[str], action: str, details: Optional[Any] = None,
                   entity_type: Optional[str] = None, entity_id: Optional[str] = None) -> None:
        """
        Non-blocking audit logging with queueing
        """
        audit_log = {
            'action': action,
            'performedBy': str(user_id) if user_id else 'SYSTEM',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'details': self._mask_sensitive_data(str(details) if details else '{}'),
            'serviceName': 'python-backend',
            'entityType': entity_type,
            'entityId': entity_id,
            'result': 'success'
        }
        
        with self.lock:
            self.audit_queue.append(audit_log)
            
        if len(self.audit_queue) >= self.batch_size:
            self._flush_queue()

    def _send_with_retry(self, audit_log: Dict[str, Any], max_retries: int = 3) -> bool:
        headers = {
            'Content-Type': 'application/json',
            'X-Service-Auth-Token': self.service_auth_token
        }

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    f"{self.java_backend_url}/system/audit-logs",
                    json=audit_log,
                    headers=headers,
                    timeout=5
                )
                response.raise_for_status()
                return True
            except requests.RequestException as e:
                wait_time = (2 ** attempt) * 1
                logger.warning(f"Audit send failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                else:
                    logger.error(f"Failed after {max_retries} attempts, re-queuing")
                    with self.lock:
                        self.audit_queue.append(audit_log)
                    return False
        return False

    def _flush_queue(self) -> None:
        if not self.audit_queue:
            return

        with self.lock:
            batch = [self.audit_queue.popleft() for _ in range(min(self.batch_size, len(self.audit_queue)))]

        if not batch:
            return

        for audit_log in batch:
            self._send_with_retry(audit_log, max_retries=2)

        logger.debug(f"Flushed {len(batch)} audit logs")

    def _flush_worker(self) -> None:
        while self.running:
            time.sleep(self.flush_interval)
            if self.audit_queue:
                self._flush_queue()

    def _mask_sensitive_data(self, details: str) -> str:
        if not details:
            return details
        
        masked = re.sub(r'(?i)(password|pwd|secret|token|key)["\']?\s*[:=]\s*["\']?[^"\s,}]+', 
                       r'\1=***MASKED***', details)
        masked = re.sub(r'(?i)(ssn|social.?security)["\']?\s*[:=]\s*["\']?\d{3}-?\d{2}-?\d{4}', 
                       r'\1=***MASKED***', masked)
        masked = re.sub(r'(?i)(credit.?card|card.?number)["\']?\s*[:=]\s*["\']?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}', 
                       r'\1=***MASKED***', masked)
        
        return masked

    def shutdown(self) -> None:
        logger.info("Shutting down AuditService, flushing remaining logs...")
        self.running = False
        self._flush_queue()
        if self.flush_thread.is_alive():
            self.flush_thread.join(timeout=10)

audit_service = AuditService()
