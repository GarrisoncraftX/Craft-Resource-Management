import pytest
from unittest.mock import Mock, patch, MagicMock
from src.reports_analytics_module.service import ReportsAnalyticsService

@pytest.fixture
def reports_service():
    return ReportsAnalyticsService()

@pytest.fixture
def mock_db_session():
    return MagicMock()

class TestReportsAnalyticsService:
    
    def test_generate_attendance_report(self, reports_service, mock_db_session):
        with patch('src.reports_analytics_module.service.db.session', mock_db_session):
            result = reports_service.generate_attendance_report('2024-06-01', '2024-06-30')
            
            assert result['success'] is True
            assert 'report_data' in result
    
    def test_generate_leave_report(self, reports_service, mock_db_session):
        with patch('src.reports_analytics_module.service.db.session', mock_db_session):
            result = reports_service.generate_leave_report(2024, 6)
            
            assert result['success'] is True
    
    def test_generate_payroll_report(self, reports_service, mock_db_session):
        with patch('src.reports_analytics_module.service.db.session', mock_db_session):
            result = reports_service.generate_payroll_report(2024, 6)
            
            assert result['success'] is True
    
    def test_export_report_pdf(self, reports_service):
        report_data = {'title': 'Test Report', 'data': []}
        
        result = reports_service.export_to_pdf(report_data)
        
        assert result['success'] is True
        assert 'file_path' in result
    
    def test_export_report_excel(self, reports_service):
        report_data = {'title': 'Test Report', 'data': []}
        
        result = reports_service.export_to_excel(report_data)
        
        assert result['success'] is True
    
    def test_get_analytics_trends(self, reports_service, mock_db_session):
        with patch('src.reports_analytics_module.service.db.session', mock_db_session):
            result = reports_service.get_trends('attendance', 30)
            
            assert 'trend_data' in result
