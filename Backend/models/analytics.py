from sqlalchemy import String, Integer, ForeignKey, Date, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from core.database import Base

class UtilizationHistory(Base):
    """Time-series data for employee utilization."""
    __tablename__ = "utilization_history"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    hours_logged: Mapped[float] = mapped_column(Float)
    utilization_percentage: Mapped[float] = mapped_column(Float)

class CollaborationHistory(Base):
    """Graph edges representing team chemistry and past collaboration."""
    __tablename__ = "collaboration_history"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee1_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    employee2_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    collaboration_score: Mapped[float] = mapped_column(Float)
    project_success_score: Mapped[float] = mapped_column(Float, default=0.0)
    end_date: Mapped[date] = mapped_column(Date)

class HistoricalProjectOutcome(Base):
    """ML training targets for project success."""
    __tablename__ = "historical_project_outcomes"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), unique=True)
    success_score: Mapped[float] = mapped_column(Float) # 0-100
    delayed_days: Mapped[int] = mapped_column(Integer, default=0)
    budget_variance: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Relationships
    project = relationship("Project", back_populates="outcomes")

class BurnoutMetrics(Base):
    """Time-series predictions of burnout probability."""
    __tablename__ = "burnout_metrics"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    risk_score: Mapped[float] = mapped_column(Float) # 0-100
    hours_worked_last_30_days: Mapped[float] = mapped_column(Float)
    consecutive_assignments: Mapped[int] = mapped_column(Integer)

class SkillDemandHistory(Base):
    """Tracking skill demand over time."""
    __tablename__ = "skill_demand_history"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    demand_score: Mapped[float] = mapped_column(Float)
    open_positions: Mapped[int] = mapped_column(Integer)

class WorkforceForecastHistory(Base):
    """Saved forecasts for headcount and capacity."""
    __tablename__ = "workforce_forecast_history"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    department_id: Mapped[int] = mapped_column(Integer, index=True)
    forecast_date: Mapped[date] = mapped_column(Date, index=True)
    target_date: Mapped[date] = mapped_column(Date, index=True)
    predicted_headcount_need: Mapped[int] = mapped_column(Integer)
    confidence_interval: Mapped[float] = mapped_column(Float)

from sqlalchemy import Column, Integer
from core.database import Base

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
class HiringPipeline(Base):
    __tablename__ = 'hiring_pipeline'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[str] = mapped_column(String(50), index=True)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey('skills.id'))
    experience_years: Mapped[int] = mapped_column(Integer)
    expected_salary: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(50))

class LearningHistory(Base):
    __tablename__ = 'learning_history'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey('employees.id'))
    course_name: Mapped[str] = mapped_column(String(200))
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey('skills.id'))
    completion_date: Mapped[date] = mapped_column(Date)
    assessment_score: Mapped[float] = mapped_column(Float)

class PromotionHistory(Base):
    __tablename__ = 'promotions'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey('employees.id'))
    old_role: Mapped[str] = mapped_column(String(100))
    new_role: Mapped[str] = mapped_column(String(100))
    promotion_date: Mapped[date] = mapped_column(Date)

class AttritionHistory(Base):
    __tablename__ = 'attrition_history'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey('employees.id'))
    attrition_reason: Mapped[str] = mapped_column(String(200))
    exit_date: Mapped[date] = mapped_column(Date)
    tenure_years: Mapped[float] = mapped_column(Float)
