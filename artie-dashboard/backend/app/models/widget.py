"""
Widget model for dashboard components
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Widget(Base):
    """Widget model for dashboard components"""
    __tablename__ = "widgets"
    
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # chart, table, card, etc.
    chart_type = Column(String, nullable=True)  # area, bar, donut, combo, etc.
    data = Column(JSON, nullable=True)  # Chart data
    config = Column(JSON, nullable=True)  # Widget configuration
    vega_spec = Column(JSON, nullable=True)  # Vega-Lite specification
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    width = Column(Integer, default=4)
    height = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")
    user = relationship("User", back_populates="widgets")
