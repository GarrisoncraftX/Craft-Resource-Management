from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SafetyInspection(Base):
    __tablename__ = 'safety_inspections'
    
    id = Column(Integer, primary_key=True, index=True)
    inspector_name = Column(String(255), nullable=False)
    inspection_date = Column(DateTime, default=datetime.utcnow)
    location = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class IncidentReport(Base):
    __tablename__ = 'incident_reports'
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_name = Column(String(255), nullable=False)
    incident_date = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    severity = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SafetyTraining(Base):
    __tablename__ = 'safety_trainings'
    
    id = Column(Integer, primary_key=True, index=True)
    training_name = Column(String(255), nullable=False)
    trainer_name = Column(String(255))
    training_date = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EnvironmentalHealthRecord(Base):
    __tablename__ = 'environmental_health_records'
    
    id = Column(Integer, primary_key=True, index=True)
    record_type = Column(String(255))
    record_date = Column(DateTime, default=datetime.utcnow)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
