import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import pymysql

# Configure logging
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'craft_resource_management'),
    'charset': 'utf8mb4'
}

# Create database URL
DATABASE_URL = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset={DB_CONFIG['charset']}"

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=os.getenv('SQLALCHEMY_ECHO', 'False').lower() == 'true'
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base
Base = declarative_base()

def get_db_session():
    """Get database session"""
    session = SessionLocal()
    try:
        return session
    except Exception as e:
        session.close()
        raise e

def close_db_session(session):
    """Close database session"""
    try:
        session.close()
    except Exception as e:
        logger.error(f"Error closing database session: {e}")

def init_database():
    """Initialize database connection"""
    try:
        # Test database connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info("Database connection established successfully")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise e

def execute_query(query, params=None):
    """Execute a database query"""
    session = get_db_session()
    try:
        if params:
            result = session.execute(text(query), params)
        else:
            result = session.execute(text(query))
        
        session.commit()
        return result
    except Exception as e:
        session.rollback()
        logger.error(f"Database query error: {e}")
        raise e
    finally:
        close_db_session(session)

def execute_transaction(queries):
    """Execute multiple queries in a transaction"""
    session = get_db_session()
    try:
        results = []
        for query_data in queries:
            query = query_data.get('query')
            params = query_data.get('params')
            
            if params:
                result = session.execute(text(query), params)
            else:
                result = session.execute(text(query))
            
            results.append(result)
        
        session.commit()
        return results
    except Exception as e:
        session.rollback()
        logger.error(f"Transaction error: {e}")
        raise e
    finally:
        close_db_session(session)

def get_connection():
    """Get raw database connection"""
    return engine.connect()

# Context manager for database sessions
class DatabaseSession:
    def __init__(self):
        self.session = None
    
    def __enter__(self):
        self.session = get_db_session()
        return self.session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.session.rollback()
        else:
            self.session.commit()
        close_db_session(self.session)
