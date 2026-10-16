from sqlalchemy import String, Integer, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from core.database import Base

class Skill(Base):
    """Dictionary of all available skills in the organization."""
    __tablename__ = "skills"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(255), index=True)

class EmployeeSkill(Base):
    """Mapping table for an employee's proficiency in a given skill."""
    __tablename__ = "employee_skills"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    proficiency_level: Mapped[int] = mapped_column(Integer) # e.g. 1-100
    
    # Relationships
    employee = relationship("Employee", back_populates="skills")
    skill = relationship("Skill")

class Certification(Base):
    """Professional certifications held by employees."""
    __tablename__ = "certifications"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    issue_date: Mapped[date] = mapped_column(Date)
    expiration_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    
    # Relationships
    employee = relationship("Employee", back_populates="certifications")
