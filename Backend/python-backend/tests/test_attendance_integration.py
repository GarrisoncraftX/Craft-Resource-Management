import pytest
import json
from datetime import datetime, timedelta
from app import app
from src.database.connection import DatabaseManager

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    return {'Authorization': 'Bearer test_token', 'Content-Type': 'application/json'}

class TestAttendanceIntegration:
    
    def test_clock_in_success(self, client, auth_headers):
        response = client.post('/api/biometric/attendance/clock-in', 
            headers=auth_headers,
            data=json.dumps({
                'user_id': '1',
                'verification_method': 'qr_scan',
                'location': 'Main Office'
            }))
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert data['action'] == 'clock_in'

    def test_clock_out_success(self, client, auth_headers):
        response = client.post('/api/biometric/attendance/clock-out',
            headers=auth_headers,
            data=json.dumps({
                'user_id': '1',
                'verification_method': 'qr_scan'
            }))
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True

    def test_get_attendance_records(self, client, auth_headers):
        response = client.get('/api/attendance/records', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'records' in data

    def test_get_attendance_stats(self, client, auth_headers):
        response = client.get('/api/attendance/stats', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'stats' in data

    def test_get_manual_fallback_attendances(self, client, auth_headers):
        response = client.get('/api/attendance/manual-fallbacks', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'attendances' in data

    def test_get_user_attendance_by_date_range(self, client, auth_headers):
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        response = client.get(f'/api/attendance/user/1/date-range?startDate={start_date}&endDate={end_date}',
            headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'attendances' in data

    def test_get_attendance_method_statistics(self, client, auth_headers):
        response = client.get('/api/attendance/method-statistics', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'stats' in data
        assert 'qrCount' in data['stats']
        assert 'manualCount' in data['stats']

    def test_flag_attendance_for_audit(self, client, auth_headers):
        response = client.post('/api/attendance/1/flag-audit',
            headers=auth_headers,
            data=json.dumps({'auditNotes': 'Suspicious manual entry'}))
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True

    def test_review_attendance(self, client, auth_headers):
        response = client.post('/api/attendance/1/review',
            headers=auth_headers,
            data=json.dumps({'hrUserId': 1, 'notes': 'Reviewed and approved'}))
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True

    def test_get_monthly_attendance_stats(self, client):
        response = client.get('/api/attendance/stats/monthly')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'totalAttendance' in data

    def test_qr_scan_workflow(self, client, auth_headers):
        # Generate QR token
        qr_response = client.get('/api/biometric/attendance/qr-display', headers=auth_headers)
        assert qr_response.status_code == 200
        qr_data = json.loads(qr_response.data)
        assert 'session_token' in qr_data
        
        # Scan QR token
        scan_response = client.post('/api/biometric/attendance/qr-scan',
            headers=auth_headers,
            data=json.dumps({'session_token': qr_data['session_token']}))
        
        assert scan_response.status_code in [200, 401]

    def test_attendance_status(self, client, auth_headers):
        response = client.get('/api/biometric/attendance/status?user_id=1', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'status' in data

    def test_buddy_punch_report(self, client, auth_headers):
        response = client.get('/api/attendance/buddy-punch-report', headers=auth_headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'report' in data
        assert 'totalManualEntries' in data['report']
