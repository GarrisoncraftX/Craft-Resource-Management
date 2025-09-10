"""
Mock data and services for biometric functionality
"""
import base64
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any

# Mock biometric templates
mock_biometric_templates = {
    "550e8400-e29b-41d4-a716-446655440000": {
        "face": {
            "template_data": base64.b64encode(b"mock_face_template_user1").decode('utf-8'),
            "template_hash": hashlib.sha256(b"mock_face_template_user1").hexdigest(),
            "created_at": "2024-01-15T10:00:00Z"
        },
        "fingerprint": {
            "template_data": base64.b64encode(b"mock_fingerprint_template_user1").decode('utf-8'),
            "template_hash": hashlib.sha256(b"mock_fingerprint_template_user1").hexdigest(),
            "created_at": "2024-01-15T10:00:00Z"
        }
    },
    "550e8400-e29b-41d4-a716-446655440001": {
        "face": {
            "template_data": base64.b64encode(b"mock_face_template_user2").decode('utf-8'),
            "template_hash": hashlib.sha256(b"mock_face_template_user2").hexdigest(),
            "created_at": "2024-01-16T14:30:00Z"
        }
    }
}

# Mock user data for identification
mock_users = {
    "550e8400-e29b-41d4-a716-446655440000": {
        "first_name": "John",
        "last_name": "Doe",
        "employee_id": "EMP001"
    },
    "550e8400-e29b-41d4-a716-446655440001": {
        "first_name": "Jane",
        "last_name": "Smith",
        "employee_id": "EMP002"
    }
}

# Mock ID cards
mock_id_cards = {
    "CARD_123456": {
        "holder_type": "employee",
        "holder_id": "550e8400-e29b-41d4-a716-446655440000"
    },
    "CARD_789012": {
        "holder_type": "visitor",
        "holder_id": "visitor_001"
    }
}

# Mock access logs
mock_access_logs = []

def enroll_biometric_mock(user_id: str, visitor_id: Optional[str], biometric_type: str, raw_data: str) -> Dict[str, Any]:
    """Mock biometric enrollment"""
    template_data = base64.b64encode(f"mock_{biometric_type}_template_{user_id or visitor_id}".encode()).decode('utf-8')
    template_hash = hashlib.sha256(f"mock_{biometric_type}_template_{user_id or visitor_id}".encode()).hexdigest()
    
    # Store in mock data
    if user_id:
        if user_id not in mock_biometric_templates:
            mock_biometric_templates[user_id] = {}
        
        mock_biometric_templates[user_id][biometric_type] = {
            "template_data": template_data,
            "template_hash": template_hash,
            "created_at": datetime.now().isoformat()
        }
    
    return {
        "biometric_id": f"BIO_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "template_hash": template_hash
    }

def verify_biometric_mock(user_id: str, biometric_type: str, raw_data: str) -> Dict[str, Any]:
    """Mock biometric verification (1:1)"""
    if user_id not in mock_biometric_templates:
        return {
            "is_match": False,
            "similarity_score": 0.0,
            "message": "No biometric template found for user"
        }
    
    if biometric_type not in mock_biometric_templates[user_id]:
        return {
            "is_match": False,
            "similarity_score": 0.0,
            "message": f"No {biometric_type} template found for user"
        }
    
    # Mock verification logic - in real implementation, this would compare actual biometric data
    # For demo purposes, we'll simulate a successful match
    live_template = base64.b64encode(f"mock_{biometric_type}_template_{user_id}".encode()).decode('utf-8')
    stored_template = mock_biometric_templates[user_id][biometric_type]["template_data"]
    
    is_match = live_template == stored_template
    similarity_score = 1.0 if is_match else 0.3  # Mock similarity score
    
    return {
        "is_match": is_match,
        "similarity_score": similarity_score,
        "user_id": user_id
    }

def identify_biometric_mock(biometric_type: str, raw_data: str) -> Optional[Dict[str, Any]]:
    """Mock biometric identification (1:N)"""
    # Mock identification logic
    # For demo purposes, we'll simulate finding a match for the first user
    for user_id, templates in mock_biometric_templates.items():
        if biometric_type in templates:
            # Simulate successful identification
            if user_id in mock_users:
                return {
                    "user_id": user_id,
                    "first_name": mock_users[user_id]["first_name"],
                    "last_name": mock_users[user_id]["last_name"],
                    "employee_id": mock_users[user_id]["employee_id"],
                    "similarity_score": 0.95
                }
    
    return None

def lookup_card_mock(card_identifier: str) -> Optional[Dict[str, str]]:
    """Mock card lookup"""
    return mock_id_cards.get(card_identifier)

def log_biometric_access_mock(user_id: Optional[str], biometric_type: str, action: str, success: bool, details: Optional[Dict] = None):
    """Mock biometric access logging"""
    log_entry = {
        "id": f"LOG_{len(mock_access_logs) + 1}",
        "user_id": user_id,
        "biometric_type": biometric_type,
        "action": action,
        "success": success,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    
    mock_access_logs.append(log_entry)

def get_biometric_statistics_mock() -> Dict[str, Any]:
    """Mock biometric statistics"""
    total_enrollments = sum(len(templates) for templates in mock_biometric_templates.values())
    unique_users = len(mock_biometric_templates)
    face_enrollments = sum(1 for templates in mock_biometric_templates.values() if "face" in templates)
    fingerprint_enrollments = sum(1 for templates in mock_biometric_templates.values() if "fingerprint" in templates)
    
    return {
        "total_enrollments": total_enrollments,
        "unique_users": unique_users,
        "face_enrollments": face_enrollments,
        "fingerprint_enrollments": fingerprint_enrollments,
        "card_enrollments": len(mock_id_cards),
        "recent_access_attempts": len(mock_access_logs),
        "generated_at": datetime.now().isoformat()
    }

def get_access_logs_mock(filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
    """Mock access logs retrieval"""
    logs = mock_access_logs.copy()
    
    if filters:
        if filters.get('user_id'):
            logs = [log for log in logs if log['user_id'] == filters['user_id']]
        
        if filters.get('biometric_type'):
            logs = [log for log in logs if log['biometric_type'] == filters['biometric_type']]
        
        if filters.get('success') is not None:
            logs = [log for log in logs if log['success'] == filters['success']]
        
        if filters.get('limit'):
            logs = logs[:int(filters['limit'])]
    
    return logs

# Export mock data for testing
__all__ = [
    'mock_biometric_templates',
    'mock_users',
    'mock_id_cards',
    'mock_access_logs',
    'enroll_biometric_mock',
    'verify_biometric_mock',
    'identify_biometric_mock',
    'lookup_card_mock',
    'log_biometric_access_mock',
    'get_biometric_statistics_mock',
    'get_access_logs_mock'
]
