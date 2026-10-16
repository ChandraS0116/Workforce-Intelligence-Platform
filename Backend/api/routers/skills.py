from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db
from models.skills import Skill

router = APIRouter(prefix="/api/v1/skills", tags=["Skills"])

@router.get("")
def get_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).all()
    return skills

@router.get("/gaps")
def get_skill_gaps(db: Session = Depends(get_db)):
    # Basic mocked logic until Phase 3 intelligence engine
    return [
        {"skill": "Kubernetes", "demand": 100, "supply": 45},
        {"skill": "Cloud Arch", "demand": 90, "supply": 60},
        {"skill": "React", "demand": 85, "supply": 120},
        {"skill": "GenAI", "demand": 95, "supply": 30},
        {"skill": "Go", "demand": 60, "supply": 40},
    ]

@router.get("/demand")
def get_skill_demand():
    return {"message": "Skill demand endpoint"}

@router.get("/supply")
def get_skill_supply():
    return {"message": "Skill supply endpoint"}
