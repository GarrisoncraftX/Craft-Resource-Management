import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from audit_service import AuditService


class TestAuditService:
    """Test suite for Audit Service"""

    @pytest.fixture
    def audit_service(self):
        """Fixture to create AuditService instance"""
        return AuditService()

    @pytest.fixture
    def mock_requests(self):
        """Fixture to mock requests library"""
        with patch('audit_service.requests') as mock:
            yield mock

    @pytest.fixture
    def sample_audit_log(self):
        """Fixture for sample audit log data"""
        return {
            'userId': 1,
            'action': 'USER_LOGIN',
            'timestamp': datetime.now().isoformat(),
            'details': {'ip': '127.0.0.1', 'browser': 'Chrome'},
            'serviceName': 'python-backend',
            'result': 'success'
        }

    def test_log_action_success(self, audit_service, mock_requests, sample_audit_log):
        """Test successful action logging"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logged': True, 'logId': 'LOG123'}
        mock_requests.post.return_value = mock_response

        result = audit_service.log_action(
            user_id=1,
            action='USER_LOGIN',
            details={'ip': '127.0.0.1'}
        )

        assert result is not None
        assert result.get('logged') is True

    def test_log_action_with_entity(self, audit_service, mock_requests):
        """Test logging action with entity information"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logged': True}
        mock_requests.post.return_value = mock_response

        result = audit_service.log_action(
            user_id=1,
            action='UPDATE_RECORD',
            details={'field': 'status'},
            entity_type='Visitor',
            entity_id=123
        )

        assert result is not None
        assert result.get('logged') is True

    def test_log_action_failure(self, audit_service, mock_requests):
        """Test action logging failure handling"""
        mock_requests.post.side_effect = Exception('Network error')

        # Should not raise exception, but log error
        result = audit_service.log_action(
            user_id=1,
            action='TEST_ACTION',
            details={}
        )

        # Service should handle error gracefully
        assert result is None or isinstance(result, dict)

    def test_mask_sensitive_data(self, audit_service):
        """Test masking of sensitive data"""
        sensitive_data = {
            'password': 'secret123',
            'ssn': '123-45-6789',
            'creditCard': '1234-5678-9012-3456',
            'username': 'john_doe'
        }

        masked = audit_service.mask_sensitive_data(sensitive_data)

        assert 'secret123' not in str(masked)
        assert '***MASKED***' in str(masked) or masked['password'] != 'secret123'
        assert 'john_doe' in str(masked)  # username should not be masked

    def test_build_descriptive_action_biometric(self, audit_service):
        """Test building descriptive action for biometric module"""
        action = audit_service.build_descriptive_action(
            'CLOCK_IN',
            {
                'module': 'biometric',
                'operation': 'CLOCK_IN',
                'employeeId': 'EMP001',
                'timestamp': '2024-01-15 08:00:00'
            }
        )

        assert 'biometric' in action.lower() or 'clock' in action.lower()

    def test_build_descriptive_action_visitor(self, audit_service):
        """Test building descriptive action for visitor module"""
        action = audit_service.build_descriptive_action(
            'CHECK_IN',
            {
                'module': 'visitor',
                'operation': 'CHECK_IN',
                'visitorName': 'John Doe',
                'purpose': 'Meeting'
            }
        )

        assert 'visitor' in action.lower() or 'check' in action.lower()

    def test_build_descriptive_action_health_safety(self, audit_service):
        """Test building descriptive action for health & safety module"""
        action = audit_service.build_descriptive_action(
            'INCIDENT_REPORT',
            {
                'module': 'health_safety',
                'operation': 'CREATE',
                'incidentType': 'Accident',
                'severity': 'high'
            }
        )

        assert 'incident' in action.lower() or 'safety' in action.lower()

    def test_get_audit_logs_by_user(self, audit_service, mock_requests):
        """Test retrieving audit logs by user ID"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'logs': [
                {'id': 1, 'action': 'LOGIN', 'timestamp': '2024-01-15T08:00:00'},
                {'id': 2, 'action': 'LOGOUT', 'timestamp': '2024-01-15T17:00:00'}
            ],
            'total': 2
        }
        mock_requests.get.return_value = mock_response

        result = audit_service.get_audit_logs_by_user(user_id=1, limit=10, page=0)

        assert result is not None
        assert len(result.get('logs', [])) == 2

    def test_get_audit_logs_by_date_range(self, audit_service, mock_requests):
        """Test retrieving audit logs by date range"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logs': [], 'total': 0}
        mock_requests.get.return_value = mock_response

        result = audit_service.get_audit_logs_by_date_range(
            start_date='2024-01-01',
            end_date='2024-01-31'
        )

        assert result is not None
        assert 'logs' in result

    def test_get_audit_logs_by_action(self, audit_service, mock_requests):
        """Test retrieving audit logs by action type"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'logs': [{'id': 1, 'action': 'USER_LOGIN'}],
            'total': 1
        }
        mock_requests.get.return_value = mock_response

        result = audit_service.get_audit_logs_by_action(action='USER_LOGIN')

        assert result is not None
        assert result.get('total') == 1

    def test_get_audit_logs_by_module(self, audit_service, mock_requests):
        """Test retrieving audit logs by module"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logs': [], 'total': 0}
        mock_requests.get.return_value = mock_response

        result = audit_service.get_audit_logs_by_module(module='biometric')

        assert result is not None
        assert 'logs' in result

    def test_search_audit_logs(self, audit_service, mock_requests):
        """Test searching audit logs with filters"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'logs': [{'id': 1, 'action': 'UPDATE'}],
            'total': 1
        }
        mock_requests.get.return_value = mock_response

        filters = {
            'userId': 1,
            'action': 'UPDATE',
            'startDate': '2024-01-01',
            'endDate': '2024-01-31'
        }
        result = audit_service.search_audit_logs(filters)

        assert result is not None
        assert 'logs' in result

    def test_log_security_event(self, audit_service, mock_requests):
        """Test logging security event"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logged': True, 'severity': 'high'}
        mock_requests.post.return_value = mock_response

        result = audit_service.log_security_event(
            event_type='UNAUTHORIZED_ACCESS',
            severity='high',
            details={'ip': '192.168.1.100', 'endpoint': '/admin'}
        )

        assert result is not None
        assert result.get('logged') is True

    def test_log_data_access(self, audit_service, mock_requests):
        """Test logging data access"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logged': True}
        mock_requests.post.return_value = mock_response

        result = audit_service.log_data_access(
            user_id=1,
            resource='employee_records',
            action='READ',
            record_id=123
        )

        assert result is not None
        assert result.get('logged') is True

    def test_log_system_event(self, audit_service, mock_requests):
        """Test logging system event"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'logged': True}
        mock_requests.post.return_value = mock_response

        result = audit_service.log_system_event(
            event_type='BACKUP_COMPLETED',
            details={'duration': '5 minutes', 'size': '2GB'}
        )

        assert result is not None
        assert result.get('logged') is True

    def test_get_recent_activities(self, audit_service, mock_requests):
        """Test getting recent activities"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'activities': [
                {'action': 'LOGIN', 'timestamp': '2024-01-15T08:00:00'},
                {'action': 'UPDATE', 'timestamp': '2024-01-15T09:00:00'}
            ]
        }
        mock_requests.get.return_value = mock_response

        result = audit_service.get_recent_activities(user_id=1, limit=10)

        assert result is not None
        assert len(result.get('activities', [])) == 2

    def test_export_audit_logs(self, audit_service, mock_requests):
        """Test exporting audit logs"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = b'CSV content here'
        mock_requests.get.return_value = mock_response

        result = audit_service.export_audit_logs(
            format='csv',
            start_date='2024-01-01',
            end_date='2024-01-31'
        )

        assert result is not None

    def test_get_audit_statistics(self, audit_service, mock_requests):
        """Test getting audit statistics"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'totalLogs': 1000,
            'byAction': {'LOGIN': 300, 'LOGOUT': 280, 'UPDATE': 420},
            'byUser': {1: 150, 2: 200, 3: 180}
        }
        mock_requests.get.return_value = mock_response

        result = audit_service.get_audit_statistics(
            start_date='2024-01-01',
            end_date='2024-01-31'
        )

        assert result is not None
        assert result.get('totalLogs') == 1000


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
