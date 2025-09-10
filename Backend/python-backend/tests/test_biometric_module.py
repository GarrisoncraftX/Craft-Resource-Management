import unittest
from unittest.mock import patch, MagicMock
from src.biometric_module.controller import BiometricController
from src.biometric_module.service import BiometricService
from src.biometric_module.models import BiometricModel

class TestBiometricModule(unittest.TestCase):
    def setUp(self):
        self.mock_db_manager = MagicMock()
        self.controller = BiometricController(self.mock_db_manager)
        self.service = BiometricService()
        self.model = BiometricModel(self.mock_db_manager)

    @patch('src.controllers.BiometricController.request')
    def test_enroll_biometric_missing_data(self, mock_request):
        mock_request.get_json.return_value = {}
        response, status = self.controller.enroll_biometric()
        self.assertEqual(status, 400)
        self.assertFalse(response['success'])

    @patch('src.controllers.BiometricController.request')
    def test_verify_biometric_missing_data(self, mock_request):
        mock_request.get_json.return_value = {}
        response, status = self.controller.verify_biometric()
        self.assertEqual(status, 400)
        self.assertFalse(response['success'])

    @patch('src.controllers.BiometricController.request')
    def test_identify_biometric_missing_data(self, mock_request):
        mock_request.get_json.return_value = {}
        response, status = self.controller.identify_biometric()
        self.assertEqual(status, 400)
        self.assertFalse(response['success'])

    @patch('src.controllers.BiometricController.request')
    def test_card_lookup_missing_data(self, mock_request):
        mock_request.get_json.return_value = {}
        response, status = self.controller.card_lookup()
        self.assertEqual(status, 400)
        self.assertFalse(response['success'])

if __name__ == '__main__':
    unittest.main()
