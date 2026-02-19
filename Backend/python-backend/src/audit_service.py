import requests
import os
import logging
import re
from datetime import datetime
import pytz
from typing import Optional, Dict, Any
from collections import deque
import threading
import time

logger = logging.getLogger(__name__)

class AuditService:
    def __init__(self):
        self.java_backend_url = os.getenv('API_GATEWAY_URL', 'http://localhost:5003')
        self.service_auth_token = os.getenv('SERVICE_AUTH_TOKEN', 'default-service-token-change-in-production')
        self.batch_size = 50
        self.flush_interval = 5
        self.audit_queue = deque(maxlen=1000)
        self.lock = threading.Lock()
        self.running = True
        
        self.flush_thread = threading.Thread(target=self._flush_worker, daemon=True)
        self.flush_thread.start()

    def log_action(self, user_id: Optional[int], action: str, details: Optional[Any] = None,
                   entity_type: Optional[str] = None, entity_id: Optional[str] = None, ip_address: Optional[str] = None) -> None:
        """
        Non-blocking audit logging with queueing
        """
        # Use Rwanda timezone and format as ISO with 'T'
        rwanda_tz = pytz.timezone('Africa/Kigali')
        timestamp = datetime.now(rwanda_tz).strftime('%Y-%m-%dT%H:%M:%S')
        
        audit_log = {
            'userId': user_id,
            'action': self._build_descriptive_action(action, details if isinstance(details, dict) else {}),
            'timestamp': timestamp,
            'details': self._mask_sensitive_data(str(details) if details else '{}'),
            'serviceName': 'python-backend',
            'ipAddress': ip_address,
            'entityType': entity_type,
            'entityId': entity_id,
            'result': 'success'
        }
        
        with self.lock:
            self.audit_queue.append(audit_log)
            
        if len(self.audit_queue) >= self.batch_size:
            self._flush_queue()

    def _build_descriptive_action(self, action: str, details: Dict[str, Any]) -> str:
        """Build human-readable action statements"""
        module = details.get('module', '')
        operation = details.get('operation', '')
        
        if module == 'biometric' and operation == 'ENROLL':
            employee_id = details.get('employeeId', 'unknown')
            return f"has enrolled biometric data for employee {employee_id}"
        
        
        if module == 'visitor' and operation == 'CHECK_IN':
            visitor_name = details.get('visitorName', 'unknown visitor')
            return f"has checked in visitor {visitor_name}"
        
       
        
        return action

    def _send_with_retry(self, audit_log: Dict[str, Any], max_retries: int = 3) -> bool:
        headers = {
            'Content-Type': 'application/json'
        }

        for attempt in range(max_retries):
            try:
                response = requests.post(
                    f"{self.java_backend_url}/api/system/audit-logs",
                    json=audit_log,
                    headers=headers,
                    timeout=5
                )
                response.raise_for_status()
                return True
            except requests.RequestException as e:
                if attempt == 0:
                    logger.debug(f"Audit send failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
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
