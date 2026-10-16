from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from models.analytics import HistoricalProjectOutcome
from models.projects import Project

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/workforce")
def get_workforce_analytics():
    return {"message": "Workforce analytics"}

@router.get("/project-risks")
def get_project_risks(db: Session = Depends(get_db)):
    # Fetch latest 50 outcomes to plot
    outcomes = db.query(HistoricalProjectOutcome).join(Project).order_by(HistoricalProjectOutcome.id.desc()).limit(50).all()
    data = []
    for o in outcomes:
        data.append({
            "name": o.project.name,
            "scheduleVariance": o.delayed_days,
            "budgetVariance": o.budget_variance,
            "successScore": o.success_score
        })
    return data

@router.get("/projects")
def get_project_analytics():
    return {"message": "Project analytics"}

@router.get("/utilization")
def get_utilization_analytics():
    return {"message": "Utilization analytics"}
