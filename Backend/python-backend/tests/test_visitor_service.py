import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from src.visitor_module.service import VisitorService
from src.visitor_module.models import Visitor, VisitorLog

@pytest.fixture
def visitor_service():
    return VisitorService()

@pytest.fixture
def mock_db_session():
    return MagicMock()

@pytest.fixture
def sample_visitor():
    return {
        'name': 'John Visitor',
        'email': 'visitor@example.com',
        'phone': '1234567890',
        'purpose': 'Business meeting',
        'host_employee_id': 1
    }

class TestVisitorService:
    
    def test_register_visitor_success(self, visitor_service, mock_db_session, sample_visitor):
        """Test successful visitor registration"""
        with patch('src.visitor_module.service.db.session', mock_db_session):
            # Act
            result = visitor_service.register_visitor(sample_visitor)
            
            # Assert
            assert result['success'] is True
            assert 'visitor_id' in result
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
    
    def test_register_visitor_missing_fields(self, visitor_service):
        """Test registration with missing required fields"""
        # Arrange
        incomplete_data = {'name': 'John Visitor'}
        
        # Act & Assert
        with pytest.raises(ValueError, match="Missing required fields"):
            visitor_service.register_visitor(incomplete_data)
    
    def test_check_in_visitor_success(self, visitor_service, mock_db_session):
        """Test successful visitor check-in"""
        # Arrange
        visitor_id = 1
        mock_visitor = Mock(id=1, name='John Visitor', status='REGISTERED')
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_visitor
            
            # Act
            result = visitor_service.check_in_visitor(visitor_id)
            
            # Assert
            assert result['success'] is True
            assert mock_visitor.status == 'CHECKED_IN'
            mock_db_session.commit.assert_called_once()
    
    def test_check_in_visitor_not_found(self, visitor_service, mock_db_session):
        """Test check-in for non-existent visitor"""
        # Arrange
        visitor_id = 999
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = None
            
            # Act
            result = visitor_service.check_in_visitor(visitor_id)
            
            # Assert
            assert result['success'] is False
            assert 'not found' in result['message'].lower()
    
    def test_check_out_visitor_success(self, visitor_service, mock_db_session):
        """Test successful visitor check-out"""
        # Arrange
        visitor_id = 1
        mock_visitor = Mock(id=1, status='CHECKED_IN', check_in_time=datetime.now())
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_visitor
            
            # Act
            result = visitor_service.check_out_visitor(visitor_id)
            
            # Assert
            assert result['success'] is True
            assert mock_visitor.status == 'CHECKED_OUT'
            assert mock_visitor.check_out_time is not None
    
    def test_get_active_visitors(self, visitor_service, mock_db_session):
        """Test retrieving active visitors"""
        # Arrange
        mock_visitors = [
            Mock(id=1, name='Visitor 1', status='CHECKED_IN'),
            Mock(id=2, name='Visitor 2', status='CHECKED_IN')
        ]
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().all.return_value = mock_visitors
            
            # Act
            result = visitor_service.get_active_visitors()
            
            # Assert
            assert len(result) == 2
            assert all(v.status == 'CHECKED_IN' for v in result)
    
    def test_get_visitor_history(self, visitor_service, mock_db_session):
        """Test retrieving visitor history"""
        # Arrange
        visitor_id = 1
        mock_logs = [
            Mock(id=1, visitor_id=1, action='CHECK_IN'),
            Mock(id=2, visitor_id=1, action='CHECK_OUT')
        ]
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().order_by().all.return_value = mock_logs
            
            # Act
            result = visitor_service.get_visitor_history(visitor_id)
            
            # Assert
            assert len(result) == 2
            assert result[0].action == 'CHECK_IN'
    
    def test_search_visitors(self, visitor_service, mock_db_session):
        """Test searching visitors by name"""
        # Arrange
        search_term = 'John'
        mock_visitors = [
            Mock(id=1, name='John Visitor'),
            Mock(id=2, name='Johnny Doe')
        ]
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter().all.return_value = mock_visitors
            
            # Act
            result = visitor_service.search_visitors(search_term)
            
            # Assert
            assert len(result) == 2
            assert all('John' in v.name for v in result)
    
    def test_get_visitors_by_date(self, visitor_service, mock_db_session):
        """Test retrieving visitors by date"""
        # Arrange
        target_date = datetime.now().date()
        mock_visitors = [
            Mock(id=1, check_in_time=datetime.now()),
            Mock(id=2, check_in_time=datetime.now())
        ]
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter().all.return_value = mock_visitors
            
            # Act
            result = visitor_service.get_visitors_by_date(target_date)
            
            # Assert
            assert len(result) == 2
    
    def test_update_visitor_info(self, visitor_service, mock_db_session):
        """Test updating visitor information"""
        # Arrange
        visitor_id = 1
        mock_visitor = Mock(id=1, name='Old Name', phone='1111111111')
        update_data = {'name': 'New Name', 'phone': '2222222222'}
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_visitor
            
            # Act
            result = visitor_service.update_visitor(visitor_id, update_data)
            
            # Assert
            assert result['success'] is True
            assert mock_visitor.name == 'New Name'
            assert mock_visitor.phone == '2222222222'
    
    def test_get_visitor_statistics(self, visitor_service, mock_db_session):
        """Test retrieving visitor statistics"""
        # Arrange
        mock_stats = {
            'total_today': 10,
            'checked_in': 5,
            'checked_out': 5
        }
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter().count.side_effect = [10, 5, 5]
            
            # Act
            result = visitor_service.get_statistics()
            
            # Assert
            assert result['total_today'] == 10
            assert result['checked_in'] == 5
            assert result['checked_out'] == 5
    
    def test_validate_visitor_badge(self, visitor_service, mock_db_session):
        """Test visitor badge validation"""
        # Arrange
        badge_number = 'BADGE001'
        mock_visitor = Mock(id=1, badge_number=badge_number, status='CHECKED_IN')
        
        with patch('src.visitor_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_visitor
            
            # Act
            result = visitor_service.validate_badge(badge_number)
            
            # Assert
            assert result['valid'] is True
            assert result['visitor_id'] == 1
    
    def test_send_visitor_notification(self, visitor_service):
        """Test sending notification to host employee"""
        # Arrange
        visitor_data = {
            'name': 'John Visitor',
            'host_employee_id': 1
        }
        
        with patch('src.visitor_module.service.notification_service') as mock_notif:
            # Act
            visitor_service.send_host_notification(visitor_data)
            
            # Assert
            mock_notif.send.assert_called_once()
