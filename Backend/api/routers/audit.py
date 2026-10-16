from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from core.database import get_db
from models.audit import AuditLog
from models.auth import User

router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])

class AuditLogResponse(BaseModel):
    id: int
    user_email: Optional[str]
    action: str
    entity_type: str
    entity_id: Optional[int]
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog, User).outerjoin(User, AuditLog.user_id == User.id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                AuditLog.action.ilike(search_filter),
                AuditLog.entity_type.ilike(search_filter),
                AuditLog.details.ilike(search_filter),
                User.email.ilike(search_filter)
            )
        )
        
    results = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    response = []
    for log, user in results:
        response.append({
            "id": log.id,
            "user_email": user.email if user else "System",
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at
        })
        
    return response
