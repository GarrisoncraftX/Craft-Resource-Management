import mysql.connector
from mysql.connector import pooling, Error
from typing import Optional, Dict, Any, List, Tuple
import threading
from contextlib import contextmanager
import logging

from src.utils.logger import logger
from src.config.database import init_database, get_db_session, close_db_session

logger = logging.getLogger(__name__)

class DatabaseManager:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, config: Dict[str, Any]):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self, config: Dict[str, Any]):
        if not hasattr(self, 'initialized'):
            self.config = config
            self.pool = None
            self._initialize_pool()
            self.initialized = True
    
    def _initialize_pool(self):
        """Initialize the database connection pool"""
        try:
            self.pool = pooling.MySQLConnectionPool(**self.config)
            logger.info("✅ Database connection pool created successfully")
        except Error as e:
            logger.error(f"❌ Error creating database connection pool: {e}")
            raise e
    
    @contextmanager
    def get_connection(self):
        """Get a database connection from the pool"""
        connection = None
        try:
            if not self.pool:
                raise Exception("Database pool not initialized")
            
            connection = self.pool.get_connection()
            yield connection
            
        except Error as e:
            if connection:
                connection.rollback()
            logger.error(f"Database connection error: {e}")
            raise e
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    def execute_query(self, query: str, params: Optional[Tuple] = None, fetch: bool = True) -> Optional[List[Dict]]:
        """Execute a single query"""
        with self.get_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            try:
                cursor.execute(query, params or ())
                
                if fetch:
                    result = cursor.fetchall()
                    return result
                else:
                    connection.commit()
                    return cursor.lastrowid if cursor.lastrowid else cursor.rowcount
                    
            except Error as e:
                connection.rollback()
                logger.error(f"Query execution error: {e}")
                raise e
            finally:
                cursor.close()
    
    def execute_transaction(self, queries: List[Dict[str, Any]]) -> List[Any]:
        """Execute multiple queries in a transaction"""
        with self.get_connection() as connection:
            cursor = connection.cursor(dictionary=True)
            results = []
            
            try:
                connection.start_transaction()
                
                for query_data in queries:
                    query = query_data.get('query')
                    params = query_data.get('params', ())
                    fetch = query_data.get('fetch', False)
                    
                    cursor.execute(query, params)
                    
                    if fetch:
                        results.append(cursor.fetchall())
                    else:
                        results.append(cursor.lastrowid if cursor.lastrowid else cursor.rowcount)
                
                connection.commit()
                return results
                
            except Error as e:
                connection.rollback()
                logger.error(f"Transaction execution error: {e}")
                raise e
            finally:
                cursor.close()
    
    def test_connection(self) -> bool:
        """Test database connectivity"""
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False
    
    def close_pool(self):
        """Close the connection pool"""
        if self.pool:
            try:
                # Close all connections in the pool
                while True:
                    try:
                        conn = self.pool.get_connection()
                        conn.close()
                    except:
                        break
                logger.info("Database connection pool closed")
            except Exception as e:
                logger.error(f"Error closing database pool: {e}")

async def connect_database():
    """Connect to database"""
    try:
        success = init_database()
        if success:
            logger.info("Database connection established successfully")
            return True
        else:
            raise Exception("Failed to establish database connection")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise e

def get_database_session():
    """Get database session"""
    return get_db_session()

def close_database_session(session):
    """Close database session"""
    close_db_session(session)
