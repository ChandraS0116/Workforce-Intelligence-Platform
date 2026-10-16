from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from core.database import get_db
from models.audit import AuditLog
from models.notification import Notification
from models.employee import Employee
from models.projects import Project, TeamAssignment
from models.skills import Skill

router = APIRouter(prefix="/api/v1", tags=["System"])

@router.get("/system/health")
def system_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False
        
    return {
        "database_connected": db_connected,
        "employees_count": db.query(Employee).count() if db_connected else 0,
        "projects_count": db.query(Project).count() if db_connected else 0,
        "skills_count": db.query(Skill).count() if db_connected else 0,
        "assignments_count": db.query(TeamAssignment).count() if db_connected else 0
    }

@router.get("/system/data-status")
def data_status(db: Session = Depends(get_db)):
    warnings = []
    empty_tables = []
    
    emp_count = db.query(Employee).count()
    if emp_count == 0:
        empty_tables.append("Employee")
    
    proj_count = db.query(Project).count()
    if proj_count == 0:
        empty_tables.append("Project")
        
    skill_count = db.query(Skill).count()
    if skill_count == 0:
        empty_tables.append("Skill")
        
    if emp_count > 0 and skill_count == 0:
        warnings.append("Employees exist but no skills are defined in the database.")
        
    assign_count = db.query(TeamAssignment).count()
    if assign_count == 0:
        empty_tables.append("TeamAssignment")
        warnings.append("No team assignments exist. Dashboard utilization will be flat.")

    seeding_status = "Complete" if len(empty_tables) == 0 else "Incomplete"
    if len(empty_tables) == 4:
        seeding_status = "Unseeded"
        
    return {
        "missing_data_warnings": warnings,
        "empty_tables": empty_tables,
        "seeding_status": seeding_status
    }




@router.get("/search")
def global_search(q: str, db: Session = Depends(get_db)):
    # Very basic global search implementation
    employees = db.query(Employee).filter(Employee.name.ilike(f"%{q}%")).limit(5).all()
    projects = db.query(Project).filter(Project.name.ilike(f"%{q}%")).limit(5).all()
    
    results = []
    for e in employees:
        results.append({"id": e.id, "type": "Employee", "title": e.name, "subtitle": e.role, "url": f"/employees"})
    for p in projects:
        results.append({"id": p.id, "type": "Project", "title": p.name, "subtitle": p.status, "url": f"/projects"})
        
    return results


