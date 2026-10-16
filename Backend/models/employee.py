from sqlalchemy import String, Integer, ForeignKey, Date, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date
from core.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(100))
    nationality_flag: Mapped[str] = mapped_column(String(10), nullable=True)
    hire_date: Mapped[date] = mapped_column(Date)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))

    department = relationship("Department", back_populates="employees")
    skills = relationship("EmployeeSkill", back_populates="employee")
    certifications = relationship("Certification", back_populates="employee")
    assignments = relationship("TeamAssignment", back_populates="employee")