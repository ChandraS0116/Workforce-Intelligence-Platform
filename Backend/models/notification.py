from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True) # nullable for global broadcast
    title = Column(String(255))
    description = Column(Text)
    severity = Column(String(20)) # "info", "warning", "critical", "success"
    category = Column(String(50)) # e.g. "Workforce", "Projects", "System"
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
