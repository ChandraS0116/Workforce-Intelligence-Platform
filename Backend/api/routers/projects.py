from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from core.database import get_db
from models.projects import Project, ProjectRequirement, TeamAssignment
from models.analytics import HistoricalProjectOutcome
from models.skills import Skill
from models.auth import User
from core.security import get_current_user, require_role
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/api/v1/projects", tags=["Projects"])

class SkillResponse(BaseModel):
    id: int
    name: str
    category: str
    class Config:
        from_attributes = True

class ProjectRequirementResponse(BaseModel):
    id: int
    skill: SkillResponse
    required_proficiency: int
    required_headcount: int
    class Config:
        from_attributes = True

class SimpleEmployeeResponse(BaseModel):
    id: int
    name: str
    role: str
    class Config:
        from_attributes = True

class TeamAssignmentResponse(BaseModel):
    id: int
    employee: SimpleEmployeeResponse
    role: str
    allocation_percentage: float
    start_date: date
    end_date: Optional[date] = None
    class Config:
        from_attributes = True

class ProjectOutcomeResponse(BaseModel):
    success_score: float
    delayed_days: int
    budget_variance: float
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    status: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    manager_id: int

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    requirements: List[ProjectRequirementResponse] = []
    assignments: List[TeamAssignmentResponse] = []
    outcomes: List[ProjectOutcomeResponse] = []
    class Config:
        from_attributes = True

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/{project_id}/details", response_model=ProjectDetailResponse)
def get_project_details(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).options(
        joinedload(Project.requirements).joinedload(ProjectRequirement.skill),
        joinedload(Project.assignments).joinedload(TeamAssignment.employee),
        joinedload(Project.outcomes)
    ).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Project Manager"]))):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, project: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Project Manager"]))):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in project.model_dump().items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted"}
