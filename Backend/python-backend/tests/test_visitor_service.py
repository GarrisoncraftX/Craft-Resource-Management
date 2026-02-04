import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from src.visitor_module.service import VisitorService

@pytest.fixture
def mock_db():
    """Mock database manager"""
    return MagicMock()

@pytest.fixture
def visitor_service(mock_db):
    """Create visitor service with mocked database"""
    with patch('src.database.connection.DatabaseManager', return_value=mock_db):
        service = VisitorService()
        service.db = mock_db
        return service

@pytest.fixture
def sample_visitor_data():
    return {
        'first_name': 'John',
        'last_name': 'Visitor',
        'email': 'visitor@example.com',
        'phone': '1234567890',
        'purpose_of_visit': 'Business meeting',
        'visiting_employee_id': 1,
        'company': 'Test Corp'
    }

class TestVisitorApprovalWorkflow:
    
    @patch('src.visitor_module.service.communication_service')
    @patch('src.visitor_module.service.notification_helper')
    @patch('src.visitor_module.service.audit_service')
    def test_check_in_visitor_pending_approval(self, mock_audit, mock_notif, mock_comm, visitor_service, sample_visitor_data):
        """Test visitor check-in creates pending_approval status"""
        visitor_service.db.execute_query.side_effect = [
            [{'AUTO_INCREMENT': 1}],  # Get next ID
            None,  # Insert visitor
            None,  # Insert checkin
            [{'first_name': 'Host', 'last_name': 'Employee', 'email': 'host@test.com', 'phone': '9876543210'}]  # Host query
        ]
        
        success, visitor_id = visitor_service.check_in_visitor(sample_visitor_data, user_id=None)
        
        assert success is True
        assert visitor_id == 'CrmsVisitor001'
        mock_notif.notify_visitor_approval_request.assert_called_once()
    
    @patch('src.visitor_module.service.communication_service')
    @patch('src.visitor_module.service.audit_service')
    def test_approve_visitor_success(self, mock_audit, mock_comm, visitor_service):
        """Test host approves visitor"""
        visitor_id = 'CrmsVisitor001'
        host_user_id = 1
        
        visitor_service.db.execute_query.side_effect = [
            1,  # Update affected rows
            [{'first_name': 'John', 'last_name': 'Visitor', 'email': 'visitor@test.com'}]  # Visitor details
        ]
        
        success, message = visitor_service.approve_visitor(visitor_id, host_user_id)
        
        assert success is True
        assert message is None
        mock_comm.send_email.assert_called_once()
    
    @patch('src.visitor_module.service.communication_service')
    @patch('src.visitor_module.service.audit_service')
    def test_reject_visitor_success(self, mock_audit, mock_comm, visitor_service):
        """Test host rejects visitor with reason"""
        visitor_id = 'CrmsVisitor001'
        host_user_id = 1
        reason = 'Host is in a meeting'
        
        visitor_service.db.execute_query.side_effect = [
            1,  # Update affected rows
            [{'first_name': 'John', 'last_name': 'Visitor', 'email': 'visitor@test.com'}],  # Visitor details
            [{'phone': '1234567890'}]  # Visitor phone
        ]
        
        success, message = visitor_service.reject_visitor(visitor_id, host_user_id, reason)
        
        assert success is True
        assert message is None
        assert mock_comm.send_email.called
        assert mock_comm.send_sms.called
    
    def test_check_visitor_status(self, visitor_service):
        """Test checking visitor status"""
        visitor_id = 'CrmsVisitor001'
        
        visitor_service.db.execute_query.return_value = [{
            'status': 'approved',
            'first_name': 'John',
            'last_name': 'Visitor',
            'purpose_of_visit': 'Business meeting',
            'host_first_name': 'Host',
            'host_last_name': 'Employee',
            'check_in_time': datetime.now()
        }]
        
        result = visitor_service.check_visitor_status(visitor_id)
        
        assert result is not None
        assert result['status'] == 'approved'
        assert result['visitor_id'] == visitor_id
    
    def test_generate_entry_pass_approved_only(self, visitor_service):
        """Test entry pass only generated for approved visitors"""
        visitor_id = 'CrmsVisitor001'
        
        visitor_service.db.execute_query.return_value = [{
            'full_name': 'John Visitor',
            'check_in_time': datetime.now(),
            'purpose_of_visit': 'Business meeting',
            'host_first_name': 'Host',
            'host_last_name': 'Employee'
        }]
        
        entry_pass = visitor_service.generate_visitor_entry_pass(visitor_id)
        
        assert entry_pass is not None
        assert 'qr_code' in entry_pass
        assert entry_pass['visitor_id'] == visitor_id
    
    def test_reject_visitor_already_processed(self, visitor_service):
        """Test rejecting visitor that's already processed"""
        visitor_id = 'CrmsVisitor001'
        host_user_id = 1
        
        visitor_service.db.execute_query.return_value = 0  # No rows affected
        
        success, message = visitor_service.reject_visitor(visitor_id, host_user_id)
        
        assert success is False
        assert 'already processed' in message.lower()
    
    def test_approve_visitor_not_found(self, visitor_service):
        """Test approving non-existent visitor"""
        visitor_id = 'CrmsVisitor999'
        host_user_id = 1
        
        visitor_service.db.execute_query.return_value = 0  # No rows affected
        
        success, message = visitor_service.approve_visitor(visitor_id, host_user_id)
        
        assert success is False
        assert 'not found' in message.lower()
