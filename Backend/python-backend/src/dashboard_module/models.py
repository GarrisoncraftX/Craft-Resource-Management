from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class DashboardData(Base):
    __tablename__ = 'dashboard_data'

    id = Column(Integer, primary_key=True, index=True)
    data_key = Column(String(255), nullable=False)
    data_value = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DashboardWidget(Base):
    __tablename__ = 'dashboard_widgets'

    id = Column(Integer, primary_key=True, index=True)
    widget_name = Column(String(255), nullable=False)
    widget_config = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
