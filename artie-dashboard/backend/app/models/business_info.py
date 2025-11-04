"""
BusinessInfo model for storing onboarding data
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base


class BusinessInfo(Base):
    """BusinessInfo model for onboarding data"""
    __tablename__ = "business_info"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    business_name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    size = Column(String, nullable=True)  # Small, Medium, Large, Enterprise
    country = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
