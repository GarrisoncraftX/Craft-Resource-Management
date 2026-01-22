import requests
import os
import threading
import time
from datetime import datetime
from flask import request, g

JAVA_BACKEND_URL = os.getenv('JAVA_BACKEND_URL', 'http://localhost:5002')
SESSION_TIMEOUT = 30  # minutes

def session_tracker():
    def before_request():
        user_id = g.get('user_id') or request.headers.get('X-User-Id')
        
        if user_id:
            session_id = f"python-{user_id}-{int(time.time() * 1000)}"
            
            try:
                requests.post(f"{JAVA_BACKEND_URL}/sessions", json={
                    'sessionId': session_id,
                    'userId': int(user_id),
                    'service': 'python-backend',
                    'lastActivity': datetime.now().isoformat()
                }, timeout=2)
                
                g.session_id = session_id
            except Exception as e:
                print(f"Session tracking error: {e}")
    
    return before_request

def cleanup_sessions():
    while True:
        time.sleep(5 * 60)  # Cleanup every 5 minutes
        try:
            requests.post(f"{JAVA_BACKEND_URL}/sessions/cleanup", 
                         params={'timeoutMinutes': SESSION_TIMEOUT}, timeout=2)
        except Exception as e:
            print(f"Session cleanup error: {e}")

def start_cleanup_thread():
    thread = threading.Thread(target=cleanup_sessions, daemon=True)
    thread.start()
