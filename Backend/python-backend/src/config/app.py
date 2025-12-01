import os
from datetime import timedelta

class Config:
    """Application configuration class"""
    
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    TESTING = False
    
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'craft_resource_management')
    
    # Database URL for SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_timeout': 20,
        'pool_recycle': -1,
        'max_overflow': 0
    }
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'your-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    
    # Biometric configuration
    FACE_RECOGNITION_THRESHOLD = float(os.getenv('FACE_RECOGNITION_THRESHOLD', 0.6))
    FINGERPRINT_THRESHOLD = float(os.getenv('FINGERPRINT_THRESHOLD', 0.8))
    FINGERPRINT_PORT = os.getenv('FINGERPRINT_PORT')  # Optional for Windows Biometric Framework
    BIOMETRIC_TEMPLATE_ENCRYPTION = os.getenv('BIOMETRIC_TEMPLATE_ENCRYPTION', 'True').lower() == 'true'
    USE_WINDOWS_BIOMETRIC = os.getenv('USE_WINDOWS_BIOMETRIC', 'True').lower() == 'true'  # Prioritize Windows Biometric Framework
    
    # OpenCV configuration
    OPENCV_FACE_CASCADE_PATH = os.getenv('OPENCV_FACE_CASCADE_PATH', 'haarcascade_frontalface_default.xml')
    
    # Analytics configuration
    ANALYTICS_BATCH_SIZE = int(os.getenv('ANALYTICS_BATCH_SIZE', 1000))
    ANALYTICS_CACHE_TIMEOUT = int(os.getenv('ANALYTICS_CACHE_TIMEOUT', 3600))  # 1 hour
    
    # Machine Learning configuration
    ML_MODEL_PATH = os.getenv('ML_MODEL_PATH', 'models')
    ANOMALY_DETECTION_THRESHOLD = float(os.getenv('ANOMALY_DETECTION_THRESHOLD', 0.95))
    
    # Lightweight face detection model files
    LIGHTWEIGHT_FACE_DETECTOR_PROTOTXT = os.getenv('LIGHTWEIGHT_FACE_DETECTOR_PROTOTXT', 'deploy.prototxt')
    LIGHTWEIGHT_FACE_DETECTOR_MODEL = os.getenv('LIGHTWEIGHT_FACE_DETECTOR_MODEL', 'res10_300x300_ssd_iter_140000.caffemodel')
    
    # Lightweight face recognition model weights
    LIGHTWEIGHT_FACE_RECOGNITION_MODEL = os.getenv('LIGHTWEIGHT_FACE_RECOGNITION_MODEL', 'mobilefacenet.pth')
    
    # External API configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')

    # AWS configuration for SMS
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION', 'af-south-1')

    # Email configuration
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@gmail.com')
    
    # Logging configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/app.log')
    LOG_MAX_BYTES = int(os.getenv('LOG_MAX_BYTES', 10485760))  # 10MB
    LOG_BACKUP_COUNT = int(os.getenv('LOG_BACKUP_COUNT', 5))
    
    # Security configuration
    BCRYPT_LOG_ROUNDS = int(os.getenv('BCRYPT_LOG_ROUNDS', 12))
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True').lower() == 'true'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Rate limiting configuration
    RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
    RATELIMIT_DEFAULT = os.getenv('RATELIMIT_DEFAULT', '1000 per hour')
    
    # Cache configuration
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', 300))
    USE_MOCK_DATA = os.getenv('USE_MOCK_DATA', 'False').lower() == 'true'
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        
        # Log to syslog in production
        import logging
        from logging.handlers import SysLogHandler
        syslog_handler = SysLogHandler()
        syslog_handler.setLevel(logging.WARNING)
        app.logger.addHandler(syslog_handler)

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
