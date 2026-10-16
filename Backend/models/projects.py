from sqlalchemy import String, Integer, ForeignKey, Date, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from core.database import Base

class Project(Base):
    """Core project entity."""
    __tablename__ = "projects"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    status: Mapped[str] = mapped_column(String(50), index=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("employees.id"), nullable=True)
    
    # Relationships
    requirements: Mapped[list["ProjectRequirement"]] = relationship("ProjectRequirement", back_populates="project")
    assignments: Mapped[list["TeamAssignment"]] = relationship("TeamAssignment", back_populates="project")
    outcomes: Mapped[list["HistoricalProjectOutcome"]] = relationship("HistoricalProjectOutcome", back_populates="project")

class ProjectRequirement(Base):
    """Skills required for a project."""
    __tablename__ = "project_requirements"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    required_proficiency: Mapped[int] = mapped_column(Integer)
    required_headcount: Mapped[int] = mapped_column(Integer, default=1)
    
    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="requirements")
    skill: Mapped["Skill"] = relationship("Skill")

class TeamAssignment(Base):
    """Links employees to projects with their role and allocation."""
    __tablename__ = "team_assignments"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    role: Mapped[str] = mapped_column(String(100))
    allocation_percentage: Mapped[float] = mapped_column(Float)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    # Relationships
    employee: Mapped["Employee"] = relationship("Employee", back_populates="assignments")
    project: Mapped["Project"] = relationship("Project", back_populates="assignments")
