import pytest
from unittest.mock import Mock, patch, MagicMock
from src.biometric_module.service import BiometricService
from src.biometric_module.models import BiometricTemplate, BiometricAccessLog

@pytest.fixture
def biometric_service():
    return BiometricService()

@pytest.fixture
def mock_db_session():
    return MagicMock()

class TestBiometricService:
    
    def test_enroll_biometric_success(self, biometric_service, mock_db_session):
        """Test successful biometric enrollment"""
        # Arrange
        user_id = 1
        biometric_type = 'face'
        raw_data = 'base64_encoded_face_data'
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            # Act
            result = biometric_service.enroll_biometric(user_id, biometric_type, raw_data)
            
            # Assert
            assert result['success'] is True
            assert 'template_id' in result
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
    
    def test_enroll_biometric_invalid_type(self, biometric_service):
        """Test enrollment with invalid biometric type"""
        # Arrange
        user_id = 1
        biometric_type = 'invalid_type'
        raw_data = 'some_data'
        
        # Act & Assert
        with pytest.raises(ValueError, match="Invalid biometric type"):
            biometric_service.enroll_biometric(user_id, biometric_type, raw_data)
    
    def test_verify_biometric_success(self, biometric_service, mock_db_session):
        """Test successful biometric verification"""
        # Arrange
        user_id = 1
        biometric_type = 'fingerprint'
        raw_data = 'fingerprint_data'
        
        mock_template = Mock()
        mock_template.template_data = 'stored_template'
        mock_template.quality_score = 95.0
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_template
            
            # Act
            result = biometric_service.verify_biometric(user_id, biometric_type, raw_data)
            
            # Assert
            assert result['success'] is True
            assert result['confidence_score'] > 0
    
    def test_verify_biometric_no_template(self, biometric_service, mock_db_session):
        """Test verification when no template exists"""
        # Arrange
        user_id = 999
        biometric_type = 'face'
        raw_data = 'face_data'
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = None
            
            # Act
            result = biometric_service.verify_biometric(user_id, biometric_type, raw_data)
            
            # Assert
            assert result['success'] is False
            assert 'No template found' in result['message']
    
    def test_identify_biometric_success(self, biometric_service, mock_db_session):
        """Test successful biometric identification"""
        # Arrange
        biometric_type = 'face'
        raw_data = 'face_data'
        
        mock_templates = [
            Mock(user_id=1, template_data='template1', quality_score=90.0),
            Mock(user_id=2, template_data='template2', quality_score=85.0)
        ]
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().all.return_value = mock_templates
            
            # Act
            result = biometric_service.identify_biometric(biometric_type, raw_data)
            
            # Assert
            assert result['success'] is True
            assert 'user_id' in result
    
    def test_identify_biometric_no_match(self, biometric_service, mock_db_session):
        """Test identification when no match found"""
        # Arrange
        biometric_type = 'fingerprint'
        raw_data = 'unknown_fingerprint'
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().all.return_value = []
            
            # Act
            result = biometric_service.identify_biometric(biometric_type, raw_data)
            
            # Assert
            assert result['success'] is False
            assert 'No match found' in result['message']
    
    def test_log_access_attempt(self, biometric_service, mock_db_session):
        """Test logging of access attempt"""
        # Arrange
        user_id = 1
        biometric_type = 'face'
        access_type = 'verification'
        success = True
        confidence_score = 95.5
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            # Act
            biometric_service.log_access_attempt(
                user_id, biometric_type, access_type, success, confidence_score
            )
            
            # Assert
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
    
    def test_get_user_biometric_templates(self, biometric_service, mock_db_session):
        """Test retrieving user biometric templates"""
        # Arrange
        user_id = 1
        mock_templates = [
            Mock(id=1, biometric_type='face', is_active=True),
            Mock(id=2, biometric_type='fingerprint', is_active=True)
        ]
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().all.return_value = mock_templates
            
            # Act
            result = biometric_service.get_user_templates(user_id)
            
            # Assert
            assert len(result) == 2
            assert result[0].biometric_type == 'face'
    
    def test_deactivate_template(self, biometric_service, mock_db_session):
        """Test deactivating a biometric template"""
        # Arrange
        template_id = 1
        mock_template = Mock(id=1, is_active=True)
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().first.return_value = mock_template
            
            # Act
            result = biometric_service.deactivate_template(template_id)
            
            # Assert
            assert result is True
            assert mock_template.is_active is False
            mock_db_session.commit.assert_called_once()
    
    def test_get_access_logs(self, biometric_service, mock_db_session):
        """Test retrieving access logs"""
        # Arrange
        user_id = 1
        mock_logs = [
            Mock(id=1, user_id=1, success=True),
            Mock(id=2, user_id=1, success=False)
        ]
        
        with patch('src.biometric_module.service.db.session', mock_db_session):
            mock_db_session.query().filter_by().order_by().limit().all.return_value = mock_logs
            
            # Act
            result = biometric_service.get_access_logs(user_id, limit=10)
            
            # Assert
            assert len(result) == 2
            assert result[0].success is True
    
    def test_calculate_match_score(self, biometric_service):
        """Test biometric match score calculation"""
        # Arrange
        template1 = 'template_data_1'
        template2 = 'template_data_2'
        
        # Act
        score = biometric_service.calculate_match_score(template1, template2)
        
        # Assert
        assert isinstance(score, float)
        assert 0 <= score <= 100
    
    def test_validate_quality_score(self, biometric_service):
        """Test quality score validation"""
        # Arrange
        high_quality_data = 'high_quality_biometric'
        low_quality_data = 'low_quality_biometric'
        
        # Act
        high_score = biometric_service.validate_quality(high_quality_data)
        low_score = biometric_service.validate_quality(low_quality_data)
        
        # Assert
        assert high_score >= 70.0  # Minimum acceptable quality
        assert isinstance(low_score, float)
