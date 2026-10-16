from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from api.routers.auth import get_current_user
from models.auth import User
from api.services.executive_metrics import compute_executive_metrics
from api.services.forecasting import generate_forecasts

router = APIRouter()

@router.get("/metrics")
def get_executive_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return high-level executive KPIs and breakdown factors."""
    return compute_executive_metrics(db)

@router.get("/forecast")
def get_executive_forecast(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Return future workforce capacity and demand forecasts."""
    return generate_forecasts(db)
