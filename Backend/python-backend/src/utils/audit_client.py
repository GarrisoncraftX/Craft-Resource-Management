import asyncio
import aiohttp
import os
import json
from datetime import datetime
from typing import Optional, Dict, Any
import logging
from collections import deque
import threading
import time
import re

logger = logging.getLogger(__name__)

class AuditClient:
    def __init__(self):
        self.java_backend_url = os.getenv('JAVA_BACKEND_URL', 'http://localhost:5002')
        self.service_auth_token = os.getenv('SERVICE_AUTH_TOKEN', 'default-service-token-change-in-production')
        self.batch_size = int(os.getenv('AUDIT_BATCH_SIZE', '50'))
        self.flush_interval = int(os.getenv('AUDIT_FLUSH_INTERVAL', '5')) 
        self.audit_queue = deque(maxlen=int(os.getenv('AUDIT_QUEUE_MAX_SIZE', '1000')))  
        self.lock = threading.Lock()
        self.running = True
        
        # Start background flush thread
        self.flush_thread = threading.Thread(target=self._flush_worker, daemon=True)
        self.flush_thread.start()

    def log_action(self, user_id: Optional[int], action: str, details: Optional[Dict[str, Any]] = None,
                   entity_type: Optional[str] = None, entity_id: Optional[str] = None, ip_address: Optional[str] = None) -> None:
        """
        Async audit logging with queueing and batching
        """
        if details is None:
            details = {}

        audit_log = {
            'userId': user_id,
            'action': self._build_descriptive_action(action, details),
            'timestamp': datetime.utcnow().isoformat(),
            'details': self._mask_sensitive_data(json.dumps(details)),
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
        
        if module == 'biometric' and operation == 'UPDATE':
            employee_id = details.get('employeeId', 'unknown')
            return f"has updated biometric data for employee {employee_id}"
        
        if module == 'biometric' and operation == 'DELETE':
            employee_id = details.get('employeeId', 'unknown')
            return f"has deleted biometric data for employee {employee_id}"
        
        if module == 'dashboard' and operation == 'VIEW':
            widget_name = details.get('widgetName', 'unknown widget')
            return f"viewed the Employee Dashboard - {widget_name}"
        
        if module == 'visitor' and operation == 'CHECK_IN':
            visitor_name = details.get('visitorName', 'unknown visitor')
            return f"has checked in visitor {visitor_name}"
        
        if module == 'visitor' and operation == 'CHECK_OUT':
            visitor_name = details.get('visitorName', 'unknown visitor')
            return f"has checked out visitor {visitor_name}"
        
        if module == 'visitor' and operation == 'CREATE':
            visitor_name = details.get('visitorName', 'unknown visitor')
            return f"has registered a new visitor {visitor_name}"
        
        if module == 'health_safety' and operation == 'CREATE':
            incident_type = details.get('incidentType', 'incident')
            return f"has reported a new {incident_type}"
        
        if module == 'health_safety' and operation == 'UPDATE':
            incident_id = details.get('incidentId', 'unknown')
            return f"has updated health & safety incident {incident_id}"
        
        if module == 'reports' and operation == 'GENERATE':
            report_type = details.get('reportType', 'report')
            return f"has generated a {report_type}"
        
        return action

    def log_action_sync(self, user_id: Optional[int], action: str, details: Optional[Dict[str, Any]] = None,
                        entity_type: Optional[str] = None, entity_id: Optional[str] = None, ip_address: Optional[str] = None) -> bool:
        """
        Synchronous audit logging with retry (use sparingly)
        """
        if details is None:
            details = {}

        audit_log = {
            'userId': user_id,
            'action': self._build_descriptive_action(action, details),
            'timestamp': datetime.utcnow().isoformat(),
            'details': self._mask_sensitive_data(json.dumps(details)),
            'serviceName': 'python-backend',
            'ipAddress': ip_address,
            'entityType': entity_type,
            'entityId': entity_id,
            'result': 'success'
        }

        return self._send_with_retry(audit_log)

    def _send_with_retry(self, audit_log: Dict[str, Any], max_retries: int = 3) -> bool:
        """
        Send audit log with exponential backoff retry
        """
        headers = {
            'Content-Type': 'application/json',
            'X-Service-Auth-Token': self.service_auth_token
        }

        for attempt in range(max_retries):
            try:
                import requests
                response = requests.post(
                    f"{self.java_backend_url}/system/audit-logs",
                    json=audit_log,
                    headers=headers,
                    timeout=5
                )
                response.raise_for_status()
                logger.debug(f"Audit log sent successfully: {audit_log['action']}")
                return True
            except requests.RequestException as e:
                wait_time = (2 ** attempt) * 1  # Exponential backoff: 1s, 2s, 4s
                logger.warning(f"Audit log send failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                else:
                    logger.error(f"Failed to send audit log after {max_retries} attempts")
                    with self.lock:
                        self.audit_queue.append(audit_log)
                    return False
        return False

    def _flush_queue(self) -> None:
        """
        Flush queued audit logs in batch
        """
        if not self.audit_queue:
            return

        with self.lock:
            batch = [self.audit_queue.popleft() for _ in range(min(self.batch_size, len(self.audit_queue)))]

        if not batch:
            return

        headers = {
            'Content-Type': 'application/json',
            'X-Service-Auth-Token': self.service_auth_token
        }

        # Send batch
        for audit_log in batch:
            try:
                import requests
                response = requests.post(
                    f"{self.java_backend_url}/system/audit-logs",
                    json=audit_log,
                    headers=headers,
                    timeout=5
                )
                response.raise_for_status()
            except requests.RequestException as e:
                logger.error(f"Failed to send audit log in batch: {e}")
                # Re-queue failed items
                with self.lock:
                    self.audit_queue.append(audit_log)

        logger.debug(f"Flushed {len(batch)} audit logs")

    def _flush_worker(self) -> None:
        """
        Background worker to periodically flush queue
        """
        while self.running:
            time.sleep(self.flush_interval)
            if self.audit_queue:
                self._flush_queue()

    def _mask_sensitive_data(self, details: str) -> str:
        """
        Mask sensitive data patterns in audit details
        """
        if not details:
            return details
        
        # Mask passwords, tokens, secrets
        masked = re.sub(r'(?i)(password|pwd|secret|token|key)["\']?\s*[:=]\s*["\']?[^"\s,}]+', 
                       r'\1=***MASKED***', details)
        # Mask SSN
        masked = re.sub(r'(?i)(ssn|social.?security)["\']?\s*[:=]\s*["\']?\d{3}-?\d{2}-?\d{4}', 
                       r'\1=***MASKED***', masked)
        # Mask credit cards
        masked = re.sub(r'(?i)(credit.?card|card.?number)["\']?\s*[:=]\s*["\']?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}', 
                       r'\1=***MASKED***', masked)
        
        return masked

    def log_entity_action(self, entity_type: str, entity_id: str, action: str, 
                         user_id: Optional[int], details: Optional[Dict[str, Any]] = None, ip_address: Optional[str] = None) -> None:
        """
        Log an entity-specific audit action
        """
        self.log_action(user_id, action, details, entity_type, entity_id, ip_address)

    def shutdown(self) -> None:
        """
        Graceful shutdown - flush remaining logs
        """
        logger.info("Shutting down AuditClient, flushing remaining logs...")
        self.running = False
        self._flush_queue()
        if self.flush_thread.is_alive():
            self.flush_thread.join(timeout=10)

# Singleton instance
audit_client = AuditClient()
