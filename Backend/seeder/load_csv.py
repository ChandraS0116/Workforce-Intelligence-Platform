import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
import re

# Adjust path if needed when running locally
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal, engine, Base
from models.organization import Department
from models.employee import Employee
from models.skills import Skill, EmployeeSkill, Certification
from models.projects import Project, ProjectRequirement, TeamAssignment
from models.analytics import (
    UtilizationHistory, CollaborationHistory, HistoricalProjectOutcome, 
    BurnoutMetrics, HiringPipeline, LearningHistory, PromotionHistory, AttritionHistory
)
from models.auth import User
from core.security import get_password_hash

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Data")

def parse_id(id_str):
    if pd.isna(id_str): return None
    if isinstance(id_str, (int, float)): return int(id_str)
    # Extracts the first numeric sequence from strings like EMP0001 or PRJ002
    match = re.search(r'\d+', str(id_str))
    return int(match.group()) if match else None

def parse_date(date_str):
    if pd.isna(date_str): return None
    try:
        return datetime.strptime(str(date_str).strip(), "%Y-%m-%d").date()
    except:
        return None

def reset_db():
    print("Dropping and recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def load_data():
    db = SessionLocal()
    reset_db()
    
    # 1. Create Admin User
    admin = User(email="admin@company.com", hashed_password=get_password_hash("admin"), is_active=True, role="admin")
    db.add(admin)
    db.commit()

    # 2. Load Skills
    print("Loading Skills...")
    skills_df = pd.read_csv(os.path.join(DATA_DIR, "skills.csv"))
    for _, row in skills_df.iterrows():
        db.add(Skill(
            id=parse_id(row['skill_id']),
            name=row['skill_name'],
            category=row['skill_category']
        ))
    db.commit()

    # 3. Load Departments & Employees
    print("Loading Departments and Employees...")
    emp_df = pd.read_csv(os.path.join(DATA_DIR, "employees.csv"))
    
    # Extract unique departments
    departments = emp_df['department'].dropna().unique()
    dept_map = {}
    for idx, d_name in enumerate(departments, start=1):
        dept = Department(id=idx, name=d_name, target_utilization=0.8)
        db.add(dept)
        dept_map[d_name] = idx
    db.commit()

    for _, row in emp_df.iterrows():
        # Generate an email
        name_parts = str(row['employee_name']).split()
        email = f"{name_parts[0].lower()}.{name_parts[-1].lower()}@company.com" if len(name_parts) > 1 else f"{name_parts[0].lower()}@company.com"
        
        # Append a number if email exists (simplification)
        emp = Employee(
            id=parse_id(row['employee_id']),
            name=row['employee_name'],
            email=email + str(parse_id(row['employee_id'])), # Ensure unique
            role=row['designation'],
            nationality_flag=str(row['country'])[:2].upper(),
            hire_date=parse_date(row['joining_date']),
            department_id=dept_map.get(row['department'])
        )
        db.add(emp)
    db.commit()

    # 4. Load Employee Skills
    print("Loading Employee Skills...")
    emp_skills_df = pd.read_csv(os.path.join(DATA_DIR, "employee_skills.csv"))
    for _, row in emp_skills_df.iterrows():
        db.add(EmployeeSkill(
            employee_id=parse_id(row['employee_id']),
            skill_id=parse_id(row['skill_id']),
            proficiency_level=int(row['proficiency_level']) if not pd.isna(row['proficiency_level']) else 3
        ))
    db.commit()

    # 5. Load Projects
    print("Loading Projects...")
    proj_df = pd.read_csv(os.path.join(DATA_DIR, "projects.csv"))
    for _, row in proj_df.iterrows():
        db.add(Project(
            id=parse_id(row['project_id']),
            name=row['project_name'],
            client_name=row['client_name'],
            status=row['status'],
            start_date=parse_date(row['start_date']),
            end_date=parse_date(row['end_date']),
            budget=float(row['budget']) if not pd.isna(row['budget']) else 0.0
        ))
    db.commit()

    # 6. Load Project Requirements
    print("Loading Project Requirements...")
    req_df = pd.read_csv(os.path.join(DATA_DIR, "project_requirements.csv"))
    for _, row in req_df.iterrows():
        db.add(ProjectRequirement(
            project_id=parse_id(row['project_id']),
            skill_id=parse_id(row['skill_id']),
            required_proficiency=int(row['required_proficiency']) if not pd.isna(row['required_proficiency']) else 3,
            headcount_needed=int(row['headcount_needed']) if not pd.isna(row['headcount_needed']) else 1
        ))
    db.commit()

    # 7. Load Team Assignments
    print("Loading Team Assignments...")
    ta_df = pd.read_csv(os.path.join(DATA_DIR, "team_assignments.csv"))
    for _, row in ta_df.iterrows():
        db.add(TeamAssignment(
            employee_id=parse_id(row['employee_id']),
            project_id=parse_id(row['project_id']),
            role=row.get('role', 'Member'),
            allocation_percentage=float(row['allocation_percentage']) if not pd.isna(row['allocation_percentage']) else 100.0,
            start_date=parse_date(row['start_date']),
            end_date=parse_date(row['end_date'])
        ))
    db.commit()

    # 8. Load Analytics data (subset)
    print("Loading Analytics...")
    try:
        uh_df = pd.read_csv(os.path.join(DATA_DIR, "utilization_history.csv"))
        for _, row in uh_df.iterrows():
            db.add(UtilizationHistory(
                employee_id=parse_id(row['employee_id']),
                date=parse_date(row['date']),
                hours_logged=float(row['hours_logged']) if not pd.isna(row['hours_logged']) else 40.0,
                utilization_percentage=float(row['utilization_percentage']) if not pd.isna(row['utilization_percentage']) else 1.0
            ))
        db.commit()
    except Exception as e: print("Skipped Utilization:", e)
    
    try:
        bm_df = pd.read_csv(os.path.join(DATA_DIR, "burnout_metrics.csv"))
        for _, row in bm_df.iterrows():
            db.add(BurnoutMetrics(
                employee_id=parse_id(row['employee_id']),
                date=parse_date(row['date']),
                risk_score=float(row['risk_score']) if not pd.isna(row['risk_score']) else 0.0,
                hours_worked_30d=float(row['hours_worked_30d']) if not pd.isna(row['hours_worked_30d']) else 160.0
            ))
        db.commit()
    except Exception as e: print("Skipped Burnout:", e)

    # 9. Load New Data Tables
    print("Loading New Features (Pipeline, Learning, Promotions, Attrition)...")
    try:
        hp_df = pd.read_csv(os.path.join(DATA_DIR, "hiring_pipeline.csv"))
        for _, row in hp_df.iterrows():
            db.add(HiringPipeline(
                candidate_id=str(row['candidate_id']),
                skill_id=parse_id(row['skill_id']),
                experience_years=int(row['experience_years']) if not pd.isna(row['experience_years']) else 0,
                expected_salary=float(row['expected_salary']) if not pd.isna(row['expected_salary']) else 0.0,
                status=str(row['status'])
            ))
        db.commit()
    except Exception as e: print("Skipped Hiring Pipeline:", e)

    try:
        lh_df = pd.read_csv(os.path.join(DATA_DIR, "learning_history.csv"))
        for _, row in lh_df.iterrows():
            db.add(LearningHistory(
                employee_id=parse_id(row['employee_id']),
                course_name=str(row['course_name']),
                skill_id=parse_id(row['skill_id']),
                completion_date=parse_date(row['completion_date']),
                assessment_score=float(row['assessment_score']) if not pd.isna(row['assessment_score']) else 0.0
            ))
        db.commit()
    except Exception as e: print("Skipped Learning History:", e)

    try:
        pr_df = pd.read_csv(os.path.join(DATA_DIR, "promotions.csv"))
        for _, row in pr_df.iterrows():
            db.add(PromotionHistory(
                employee_id=parse_id(row['employee_id']),
                old_role=str(row['old_role']),
                new_role=str(row['new_role']),
                promotion_date=parse_date(row['promotion_date'])
            ))
        db.commit()
    except Exception as e: print("Skipped Promotions:", e)

    try:
        ah_df = pd.read_csv(os.path.join(DATA_DIR, "attrition_history.csv"))
        for _, row in ah_df.iterrows():
            db.add(AttritionHistory(
                employee_id=parse_id(row['employee_id']),
                attrition_reason=str(row['attrition_reason']),
                exit_date=parse_date(row['exit_date']),
                tenure_years=float(row['tenure_years']) if not pd.isna(row['tenure_years']) else 0.0
            ))
        db.commit()
    except Exception as e: print("Skipped Attrition:", e)

    print("Data loading complete!")

if __name__ == "__main__":
    load_data()
