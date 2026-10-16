from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from models.employee import Employee
from models.organization import Department
from models.projects import Project, TeamAssignment
from models.skills import Skill
from models.auth import User
from core.security import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

class MetricScore(BaseModel):
    score: int
    trend: str
    trend_direction: str

class DashboardStats(BaseModel):
    total_employees: int
    active_projects: int
    total_departments: int
    total_skills: int

class DashboardOverviewResponse(BaseModel):
    organization_health: MetricScore
    workforce_health: MetricScore
    project_delivery: MetricScore
    ai_confidence: MetricScore
    stats: DashboardStats

class UtilizationResponse(BaseModel):
    month: str
    capacity: int
    utilized: float

class RiskResponse(BaseModel):
    department: str
    delayRisk: int
    budgetRisk: int

from api.routers.ml import get_workforce_health

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_employees = db.query(Employee).count()
    active_projects = db.query(Project).filter(Project.status == "Active").count()
    total_departments = db.query(Department).count()
    total_skills = db.query(Skill).count()
    
    # Calculate dynamically using the ML router's actual logic
    health_data = get_workforce_health(db)
    
    # The new dynamic metrics
    org_health_score = int(health_data.overall_score)
    workforce_health_score = int(100 - health_data.burnout_risk)
    project_delivery_score = int(health_data.delivery_readiness)
    ai_confidence_score = int(health_data.skill_readiness)

    return {
        "organization_health": {
            "score": org_health_score,
            "trend": "Positive" if org_health_score >= 80 else "Stable",
            "trend_direction": "up" if org_health_score >= 80 else "neutral"
        },
        "workforce_health": {
            "score": workforce_health_score,
            "trend": "Stable" if workforce_health_score >= 70 else "At Risk",
            "trend_direction": "neutral" if workforce_health_score >= 70 else "down"
        },
        "project_delivery": {
            "score": project_delivery_score,
            "trend": "Positive" if project_delivery_score >= 80 else "Stable",
            "trend_direction": "up" if project_delivery_score >= 80 else "neutral"
        },
        "ai_confidence": {
            "score": ai_confidence_score,
            "trend": "Stable" if ai_confidence_score >= 80 else "Needs Review",
            "trend_direction": "neutral"
        },
        "stats": {
            "total_employees": total_employees,
            "active_projects": active_projects,
            "total_departments": total_departments,
            "total_skills": total_skills
        }
    }

from models.analytics import UtilizationHistory
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import extract

@router.get("/utilization", response_model=List[UtilizationResponse])
def get_utilization_data(months: int = 6, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Support 6 months or 12 months (Task 5)
    months_to_fetch = min(max(months, 6), 12)
    end_date = datetime.now()
    start_date = end_date - relativedelta(months=months_to_fetch-1)
    
    # Query actual historical utilization records
    history = db.query(
        extract('year', UtilizationHistory.date).label('year'),
        extract('month', UtilizationHistory.date).label('month'),
        func.avg(UtilizationHistory.utilization_percentage).label('avg_utilization')
    ).filter(
        UtilizationHistory.date >= start_date.replace(day=1)
    ).group_by(
        extract('year', UtilizationHistory.date),
        extract('month', UtilizationHistory.date)
    ).order_by(
        extract('year', UtilizationHistory.date),
        extract('month', UtilizationHistory.date)
    ).all()
    
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    results = []
    
    # Fill in blanks if DB has gaps, or just use history
    # For a robust solution, we generate the last N months and match with DB
    for m in range(months_to_fetch):
        current = start_date + relativedelta(months=m)
        y, mo = current.year, current.month
        
        db_record = next((h for h in history if int(h.year) == y and int(h.month) == mo), None)
        utilized = db_record.avg_utilization if db_record else 0
        
        results.append({
            "month": month_names[mo - 1],
            "capacity": 100, # Base capacity metric
            "utilized": round(utilized, 1)
        })

    return results

@router.get("/risks", response_model=List[RiskResponse])
def get_department_risks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    departments = db.query(Department).all()
    risks = []
    
    for dept in departments:
        # Calculate risk based on actual projects in this department
        # We simulate this by checking how many employees in this dept are over-utilized
        dept_employees = db.query(Employee).filter(Employee.department_id == dept.id).count()
        dept_assignments = db.query(TeamAssignment).join(Employee).filter(Employee.department_id == dept.id).count()
        
        utilization_ratio = dept_assignments / dept_employees if dept_employees > 0 else 0
        
        risks.append({
            "department": dept.name,
            "delayRisk": min(100, int(utilization_ratio * 40)), 
            "budgetRisk": min(100, int(utilization_ratio * 25))
        })
    return risks
