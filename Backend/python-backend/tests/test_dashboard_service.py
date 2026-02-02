import pytest
from unittest.mock import Mock, patch, MagicMock
from src.dashboard_module.service import DashboardService

@pytest.fixture
def dashboard_service():
    return DashboardService()

@pytest.fixture
def mock_db_session():
    return MagicMock()

class TestDashboardService:
    
    def test_get_dashboard_metrics(self, dashboard_service, mock_db_session):
        with patch('src.dashboard_module.service.db.session', mock_db_session):
            mock_db_session.query().count.side_effect = [100, 50, 25]
            
            result = dashboard_service.get_metrics()
            
            assert 'total_employees' in result
            assert 'active_projects' in result
    
    def test_get_attendance_summary(self, dashboard_service, mock_db_session):
        with patch('src.dashboard_module.service.db.session', mock_db_session):
            result = dashboard_service.get_attendance_summary()
            
            assert 'present' in result
            assert 'absent' in result
    
    def test_get_leave_summary(self, dashboard_service, mock_db_session):
        with patch('src.dashboard_module.service.db.session', mock_db_session):
            result = dashboard_service.get_leave_summary()
            
            assert 'pending_requests' in result
    
    def test_get_financial_summary(self, dashboard_service, mock_db_session):
        with patch('src.dashboard_module.service.db.session', mock_db_session):
            result = dashboard_service.get_financial_summary()
            
            assert 'total_budget' in result
            assert 'total_expenses' in result
