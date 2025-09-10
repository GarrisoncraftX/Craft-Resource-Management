import unittest
from unittest.mock import patch, MagicMock
from src.biometric_module.controller import BiometricController
from src.biometric_module.service import BiometricService
from src.biometric_module.models import BiometricModel

class TestBiometricModuleExtended(unittest.TestCase):
    def setUp(self):
        self.mock_db_manager = MagicMock()
        self.controller = BiometricController(self.mock_db_manager)
        self.service = BiometricService()
        self.model = BiometricModel(self.mock_db_manager)

    @patch('src.biometric_module.controller.request')
    def test_enroll_biometric_success(self, mock_request):
        # Mock valid face biometric enrollment data
        mock_request.get_json.return_value = {
            'user_id': 'user123',
            'biometric_type': 'face',
            'raw_data': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
        }
        # Patch service methods to bypass actual image processing
        with patch.object(self.service, 'validate_image_quality', return_value=(True, None)), \
             patch.object(self.service, 'process_face_image', return_value=({'template_data': 'template', 'template_hash': 'hash'}, None)), \
             patch.object(self.model, 'enroll_biometric', return_value={'biometric_id': 1, 'template_hash': 'hash'}), \
             patch.object(self.model, 'log_biometric_access') as mock_log:
            response, status = self.controller.enroll_biometric()
            self.assertEqual(status, 201)
            self.assertTrue(response['success'])
            self.assertIn('data', response)
            mock_log.assert_called_once()

    @patch('src.biometric_module.controller.request')
    def test_verify_biometric_success(self, mock_request):
        mock_request.get_json.return_value = {
            'user_id': 'user123',
            'biometric_type': 'face',
            'raw_data': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
        }
        with patch.object(self.service, 'validate_image_quality', return_value=(True, None)), \
             patch.object(self.service, 'process_face_image', return_value=({'template_data': 'live_template'}, None)), \
             patch.object(self.model, 'get_biometric_template', return_value='stored_template'), \
             patch.object(self.service, 'verify_biometric', return_value={'is_match': True, 'similarity_score': 0.9}), \
             patch.object(self.model, 'log_biometric_access') as mock_log:
            response, status = self.controller.verify_biometric()
            self.assertEqual(status, 200)
            self.assertTrue(response['success'])
            self.assertIn('data', response)
            mock_log.assert_called_once()

    @patch('src.biometric_module.controller.request')
    def test_identify_biometric_success(self, mock_request):
        mock_request.get_json.return_value = {
            'biometric_type': 'face',
            'raw_data': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
        }
        with patch.object(self.service, 'validate_image_quality', return_value=(True, None)), \
             patch.object(self.service, 'process_face_image', return_value=({'template_data': 'live_template'}, None)), \
             patch.object(self.model, 'get_all_templates', return_value=[
                 ('user123', 'stored_template', 'John', 'Doe', 'E123')
             ]), \
             patch.object(self.service, 'identify_from_templates', return_value={
                 'user_id': 'user123', 'first_name': 'John', 'last_name': 'Doe', 'employee_id': 'E123', 'similarity_score': 0.95
             }), \
             patch.object(self.model, 'log_biometric_access') as mock_log:
            response, status = self.controller.identify_biometric()
            self.assertEqual(status, 200)
            self.assertTrue(response['success'])
            self.assertIn('data', response)
            mock_log.assert_called_once()

    @patch('src.biometric_module.controller.request')
    def test_card_lookup_success(self, mock_request):
        mock_request.get_json.return_value = {
            'card_identifier': 'card123'
        }
        with patch.object(self.model, 'lookup_card', return_value={'holder_type': 'user', 'holder_id': 'user123'}):
            response, status = self.controller.card_lookup()
            self.assertEqual(status, 200)
            self.assertTrue(response['success'])
            self.assertIn('data', response)

if __name__ == '__main__':
    unittest.main()
