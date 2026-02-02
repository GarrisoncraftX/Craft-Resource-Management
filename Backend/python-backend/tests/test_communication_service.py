import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from communication_service import CommunicationService


class TestCommunicationService:
    """Test suite for Communication Service"""

    @pytest.fixture
    def communication_service(self):
        """Fixture to create CommunicationService instance"""
        return CommunicationService()

    @pytest.fixture
    def mock_requests(self):
        """Fixture to mock requests library"""
        with patch('communication_service.requests') as mock:
            yield mock

    def test_send_notification_success(self, communication_service, mock_requests):
        """Test successful notification sending"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'messageId': 'MSG123'}
        mock_requests.post.return_value = mock_response

        result = communication_service.send_notification(
            user_id=1,
            title='Test Notification',
            message='Test message content',
            notification_type='info'
        )

        assert result is not None
        assert result.get('success') is True
        mock_requests.post.assert_called_once()

    def test_send_notification_failure(self, communication_service, mock_requests):
        """Test notification sending failure"""
        mock_requests.post.side_effect = Exception('Network error')

        with pytest.raises(Exception):
            communication_service.send_notification(
                user_id=1,
                title='Test',
                message='Test',
                notification_type='error'
            )

    def test_send_email_success(self, communication_service, mock_requests):
        """Test successful email sending"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'sent': True}
        mock_requests.post.return_value = mock_response

        result = communication_service.send_email(
            to_email='test@example.com',
            subject='Test Email',
            body='Test email body'
        )

        assert result is not None
        assert result.get('sent') is True

    def test_send_email_invalid_address(self, communication_service):
        """Test email sending with invalid address"""
        with pytest.raises(ValueError):
            communication_service.send_email(
                to_email='invalid-email',
                subject='Test',
                body='Test'
            )

    def test_send_sms_success(self, communication_service, mock_requests):
        """Test successful SMS sending"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'delivered': True, 'smsId': 'SMS456'}
        mock_requests.post.return_value = mock_response

        result = communication_service.send_sms(
            phone_number='+1234567890',
            message='Test SMS message'
        )

        assert result is not None
        assert result.get('delivered') is True

    def test_send_sms_invalid_number(self, communication_service):
        """Test SMS sending with invalid phone number"""
        with pytest.raises(ValueError):
            communication_service.send_sms(
                phone_number='invalid',
                message='Test'
            )

    def test_send_bulk_notifications(self, communication_service, mock_requests):
        """Test sending bulk notifications"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'sent': 3, 'failed': 0}
        mock_requests.post.return_value = mock_response

        user_ids = [1, 2, 3]
        result = communication_service.send_bulk_notifications(
            user_ids=user_ids,
            title='Bulk Notification',
            message='Test bulk message'
        )

        assert result is not None
        assert result.get('sent') == 3

    def test_get_notification_history(self, communication_service, mock_requests):
        """Test retrieving notification history"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'notifications': [
                {'id': 1, 'title': 'Test 1', 'read': False},
                {'id': 2, 'title': 'Test 2', 'read': True}
            ]
        }
        mock_requests.get.return_value = mock_response

        result = communication_service.get_notification_history(user_id=1)

        assert result is not None
        assert len(result.get('notifications', [])) == 2

    def test_mark_notification_as_read(self, communication_service, mock_requests):
        """Test marking notification as read"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'read': True}
        mock_requests.put.return_value = mock_response

        result = communication_service.mark_notification_as_read(notification_id=1)

        assert result is not None
        assert result.get('success') is True

    def test_delete_notification(self, communication_service, mock_requests):
        """Test deleting notification"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'deleted': True}
        mock_requests.delete.return_value = mock_response

        result = communication_service.delete_notification(notification_id=1)

        assert result is not None
        assert result.get('deleted') is True

    def test_send_notification_with_priority(self, communication_service, mock_requests):
        """Test sending notification with priority"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True}
        mock_requests.post.return_value = mock_response

        result = communication_service.send_notification(
            user_id=1,
            title='Urgent',
            message='Urgent message',
            notification_type='alert',
            priority='high'
        )

        assert result is not None
        assert result.get('success') is True

    def test_get_unread_notification_count(self, communication_service, mock_requests):
        """Test getting unread notification count"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'count': 5}
        mock_requests.get.return_value = mock_response

        result = communication_service.get_unread_notification_count(user_id=1)

        assert result is not None
        assert result.get('count') == 5

    def test_send_notification_with_attachment(self, communication_service, mock_requests):
        """Test sending notification with attachment"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'success': True, 'attachmentUploaded': True}
        mock_requests.post.return_value = mock_response

        result = communication_service.send_notification(
            user_id=1,
            title='Document',
            message='Please review',
            attachment_url='https://example.com/doc.pdf'
        )

        assert result is not None
        assert result.get('success') is True

    def test_schedule_notification(self, communication_service, mock_requests):
        """Test scheduling notification for future delivery"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'scheduled': True, 'scheduleId': 'SCH789'}
        mock_requests.post.return_value = mock_response

        scheduled_time = datetime.now().isoformat()
        result = communication_service.schedule_notification(
            user_id=1,
            title='Scheduled',
            message='Future message',
            scheduled_time=scheduled_time
        )

        assert result is not None
        assert result.get('scheduled') is True

    def test_cancel_scheduled_notification(self, communication_service, mock_requests):
        """Test canceling scheduled notification"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'cancelled': True}
        mock_requests.delete.return_value = mock_response

        result = communication_service.cancel_scheduled_notification(schedule_id='SCH789')

        assert result is not None
        assert result.get('cancelled') is True

    def test_send_notification_to_department(self, communication_service, mock_requests):
        """Test sending notification to entire department"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'sent': 25, 'departmentId': 5}
        mock_requests.post.return_value = mock_response

        result = communication_service.send_notification_to_department(
            department_id=5,
            title='Department Update',
            message='Important department message'
        )

        assert result is not None
        assert result.get('sent') == 25


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
