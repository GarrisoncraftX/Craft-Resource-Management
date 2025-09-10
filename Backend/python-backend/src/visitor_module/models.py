from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class VisitorCheckIn(Base):
    __tablename__ = 'visitor_check_ins'

    id = Column(Integer, primary_key=True, index=True)
    visitor_name = Column(String(255), nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    checked_out = Column(Boolean, default=False)
    check_out_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VisitorLog(Base):
    __tablename__ = 'visitor_logs'

    id = Column(Integer, primary_key=True, index=True)
    visitor_name = Column(String(255), nullable=False)
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
