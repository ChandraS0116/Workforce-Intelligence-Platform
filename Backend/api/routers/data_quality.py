from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from pydantic import BaseModel
from core.database import get_db
from models.employee import Employee
from models.projects import Project, TeamAssignment
from models.skills import EmployeeSkill

router = APIRouter(prefix="/api/v1/data-quality", tags=["Data Quality"])

class DataQualityIssue(BaseModel):
    id: str
    entity: str
    issue: str
    severity: str
    recommended_fix: str
    quick_action: str

@router.get("/issues", response_model=List[DataQualityIssue])
def get_data_quality_issues(db: Session = Depends(get_db)):
    issues = []
    
    # 1. Missing skills (Employees with 0 skills)
    emps_with_skills = db.query(EmployeeSkill.employee_id).distinct().all()
    emp_ids_with_skills = {e[0] for e in emps_with_skills}
    all_emps = db.query(Employee).all()
    
    missing_skills = [e for e in all_emps if e.id not in emp_ids_with_skills]
    for e in missing_skills[:10]: # cap for demo
        issues.append(DataQualityIssue(
            id=f"emp-skill-{e.id}",
            entity=f"Employee: {e.name}",
            issue="No skills recorded",
            severity="Medium",
            recommended_fix="Request employee to update skill profile",
            quick_action="Send Reminder"
        ))
        
    # 2. Missing allocations (Active projects with 0 team members)
    active_projects = db.query(Project).filter(Project.status == "Active").all()
    assignments = db.query(TeamAssignment.project_id).filter(TeamAssignment.end_date == None).distinct().all()
    assigned_proj_ids = {a[0] for a in assignments}
    
    unstaffed_projects = [p for p in active_projects if p.id not in assigned_proj_ids]
    for p in unstaffed_projects[:10]:
        issues.append(DataQualityIssue(
            id=f"proj-staff-{p.id}",
            entity=f"Project: {p.name}",
            issue="Active project with no assigned staff",
            severity="High",
            recommended_fix="Use Team Builder to staff project immediately",
            quick_action="Open Team Builder"
        ))
        
    # 3. Invalid assignments (Overallocated employees > 100%)
    allocations = db.query(TeamAssignment.employee_id, func.sum(TeamAssignment.allocation_percentage).label('total')).filter(TeamAssignment.end_date == None).group_by(TeamAssignment.employee_id).all()
    overallocated = [a for a in allocations if a.total > 100]
    for a in overallocated[:10]:
        emp = next((e for e in all_emps if e.id == a.employee_id), None)
        if emp:
            issues.append(DataQualityIssue(
                id=f"emp-alloc-{emp.id}",
                entity=f"Employee: {emp.name}",
                issue=f"Overallocated at {a.total}%",
                severity="Critical",
                recommended_fix="Rebalance workload or reduce allocations",
                quick_action="View Assignments"
            ))

    return issues
