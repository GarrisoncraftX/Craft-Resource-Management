import pytest
from unittest.mock import Mock, patch, MagicMock
from src.health_safety_module.service import HealthSafetyService
from src.health_safety_module.models import Incident, SafetyInspection

@pytest.fixture
def health_safety_service():
    return HealthSafetyService()

@pytest.fixture
def mock_db_session():
    return MagicMock()

class TestHealthSafetyService:
    
    def test_report_incident_success(self, health_safety_service, mock_db_session):
        incident_data = {
            'title': 'Slip and Fall',
            'description': 'Employee slipped',
            'severity': 'MEDIUM',
            'location': 'Office Floor 2'
        }
        
        with patch('src.health_safety_module.service.db.session', mock_db_session):
            result = health_safety_service.report_incident(incident_data)
            
            assert result['success'] is True
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
    
    def test_get_incidents_by_severity(self, health_safety_service, mock_db_session):
        mock_incidents = [
            Mock(id=1, severity='HIGH'),
            Mock(id=2, severity='HIGH')
        ]
        
        with patch('src.health_safety_service.db.session', mock_db_session):
            mock_db_session.query().filter_by().all.return_value = mock_incidents
            
            result = health_safety_service.get_incidents_by_severity('HIGH')
            
            assert len(result) == 2
    
    def test_create_safety_inspection(self, health_safety_service, mock_db_session):
        inspection_data = {
            'area': 'Warehouse',
            'inspector_id': 1,
            'inspection_date': '2024-06-01'
        }
        
        with patch('src.health_safety_module.service.db.session', mock_db_session):
            result = health_safety_service.create_inspection(inspection_data)
            
            assert result['success'] is True
    
    def test_update_incident_status(self, health_safety_service, mock_db_session):
        mock_incident = Mock(id=1, status='OPEN')
        
        with patch('src.health_safety_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_incident
            
            result = health_safety_service.update_incident_status(1, 'RESOLVED')
            
            assert mock_incident.status == 'RESOLVED'
    
    def test_get_safety_statistics(self, health_safety_service, mock_db_session):
        with patch('src.health_safety_module.service.db.session', mock_db_session):
            mock_db_session.query().count.side_effect = [10, 5, 2]
            
            result = health_safety_service.get_statistics()
            
            assert result['total_incidents'] == 10
            assert result['open_incidents'] == 5
