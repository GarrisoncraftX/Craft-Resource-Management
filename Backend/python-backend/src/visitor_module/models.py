from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Visitor(Base):
    __tablename__ = 'visitors'

    visitor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_id = Column(Integer, default=0)
    full_name = Column(String(200), nullable=False)  # Combined first and last name
    contact_number = Column(String(20), nullable=False)
    email = Column(String(255), nullable=True)
    visiting_employee_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    purpose_of_visit = Column(Text, nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String(20), default='Checked In')  # 'Checked In', 'Checked Out'
    id_document_type = Column(String(50), nullable=True)
    id_document_number = Column(String(100), nullable=True)
    photo_path = Column(String(500), nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VisitorCheckIn(Base):
    __tablename__ = 'visitor_checkins'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    visitor_id = Column(Integer, ForeignKey('visitors.visitor_id'), nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    check_out_time = Column(DateTime, nullable=True)
    check_in_method = Column(String(50), default='manual')  # 'qr', 'manual', etc.
    check_out_method = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    purpose = Column(Text, nullable=True)
    host_employee_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    badge_number = Column(String(50), nullable=True)
    vehicle_registration = Column(String(50), nullable=True)
    status = Column(String(20), default='checked_in')  # 'checked_in', 'checked_out'
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QRToken(Base):
    __tablename__ = 'qr_tokens'

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
