from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50), index=True) # e.g., "LOGIN", "CREATE_PROJECT"
    entity_type = Column(String(50)) # e.g., "Employee", "Project"
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
