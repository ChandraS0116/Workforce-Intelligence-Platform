from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from core.database import get_db
from models.employee import Employee
from models.organization import Department
from models.skills import EmployeeSkill, Skill, Certification
from models.projects import TeamAssignment
from models.analytics import BurnoutMetrics, UtilizationHistory
from models.auth import User
from core.security import get_current_user, require_role
from pydantic import BaseModel, computed_field
from datetime import date

router = APIRouter(prefix="/api/v1/employees", tags=["Employees"])

class DepartmentResponse(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class SkillResponse(BaseModel):
    id: int
    name: str
    category: str
    class Config:
        orm_mode = True

class EmployeeSkillResponse(BaseModel):
    proficiency_level: int
    skill: SkillResponse
    class Config:
        orm_mode = True

class CertificationResponse(BaseModel):
    id: int
    name: str
    issue_date: date
    expiration_date: Optional[date] = None
    class Config:
        orm_mode = True

class EmployeeAssignmentResponse(BaseModel):
    id: int
    project_id: int
    role: str
    allocation_percentage: float
    start_date: date
    end_date: Optional[date] = None
    class Config:
        orm_mode = True

class UtilizationHistoryResponse(BaseModel):
    date: date
    utilization_percentage: float
    class Config:
        orm_mode = True

class BurnoutMetricResponse(BaseModel):
    date: date
    risk_score: float
    class Config:
        orm_mode = True

class EmployeeBase(BaseModel):
    name: str
    email: str
    role: str
    nationality_flag: Optional[str] = None
    hire_date: date
    department_id: int

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    
    @computed_field
    @property
    def display_name(self) -> str:
        return f"{self.nationality_flag} {self.name}" if self.nationality_flag else self.name

    class Config:
        orm_mode = True

class EmployeeDetailResponse(EmployeeResponse):
    department: Optional[DepartmentResponse] = None
    skills: List[EmployeeSkillResponse] = []
    certifications: List[CertificationResponse] = []
    assignments: List[EmployeeAssignmentResponse] = []
    utilization_history: List[UtilizationHistoryResponse] = []
    burnout_metrics: List[BurnoutMetricResponse] = []
    
    class Config:
        orm_mode = True

@router.get("", response_model=List[EmployeeResponse])
def get_employees(
    skip: int = 0, 
    limit: int = 100, 
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Employee)
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if search:
        query = query.filter(Employee.name.ilike(f"%{search}%") | Employee.email.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.get("/{employee_id}/details", response_model=EmployeeDetailResponse)
def get_employee_details(employee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    employee = db.query(Employee).options(
        joinedload(Employee.department),
        joinedload(Employee.skills).joinedload(EmployeeSkill.skill),
        joinedload(Employee.certifications),
        joinedload(Employee.assignments)
    ).filter(Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    util_history = db.query(UtilizationHistory).filter(UtilizationHistory.employee_id == employee_id).order_by(UtilizationHistory.date.desc()).limit(6).all()
    burnout = db.query(BurnoutMetrics).filter(BurnoutMetrics.employee_id == employee_id).order_by(BurnoutMetrics.date.desc()).limit(1).all()

    # Convert to Pydantic compatible dictionary by attaching to a response object wrapper
    emp_dict = employee.__dict__.copy()
    emp_dict['utilization_history'] = util_history
    emp_dict['burnout_metrics'] = burnout
    return emp_dict

@router.post("", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Admin", "HR Manager"]))):
    db_employee = Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, employee: EmployeeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Admin", "HR Manager"]))):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in employee.model_dump().items():
        setattr(db_employee, key, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted"}
