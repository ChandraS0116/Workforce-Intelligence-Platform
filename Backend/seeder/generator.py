import random
import numpy as np
from datetime import datetime, timedelta, date
from faker import Faker
from sqlalchemy.orm import Session
from sqlalchemy import text
from core.database import SessionLocal, engine, Base
from models.organization import Department
from models.employee import Employee
from models.skills import Skill, EmployeeSkill, Certification
from models.projects import Project, ProjectRequirement, TeamAssignment
from models.analytics import UtilizationHistory, CollaborationHistory, HistoricalProjectOutcome, BurnoutMetrics, SkillDemandHistory, WorkforceForecastHistory
from models.auth import User
from core.security import get_password_hash

fake = Faker()
Faker.seed(101)
np.random.seed(101)

def chunker(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))

def reset_db(db):
    print("Dropping and recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def generate_data():
    db = SessionLocal()
    reset_db(db)
    
    print("Seeding Phase 3.5 Data...")
    
    # 1. Departments (100)
    print("Generating Departments...")
    dept_bases = ["Engineering", "Data Science", "Product", "Design", "DevOps", "Security", "Cloud", "Operations", "Marketing", "Sales"]
    departments = []
    for i in range(100):
        name = f"{random.choice(dept_bases)} - {fake.word().capitalize()} {i}"
        dept = Department(name=name)
        db.add(dept)
        departments.append(dept)
    db.commit()

    # 2. Skills
    print("Generating Skills...")
    skill_data = {
        "Engineering": ["Python", "JavaScript", "React", "Node.js", "Java", "Go", "C++", "C#", "Rust", "Swift"],
        "Data Science": ["Machine Learning", "SQL", "Pandas", "PyTorch", "TensorFlow", "Statistics", "Data Engineering", "AI/ML"],
        "DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Cloud Architecture", "Azure"],
        "Product": ["Agile", "Scrum", "Product Strategy", "User Research", "Jira"],
        "Design": ["Figma", "UI/UX", "Prototyping", "Adobe Creative Suite"],
        "Security": ["Cybersecurity", "Penetration Testing", "Compliance", "Network Security"]
    }
    skills = []
    skill_map = {}
    for cat, s_names in skill_data.items():
        for s in s_names:
            skill = Skill(name=s, category=cat)
            db.add(skill)
            skills.append(skill)
            skill_map[s] = skill
    db.commit()

    # 3. Employees (500)
    print("Generating Employees...")
    employees = []
    
    # Naming data
    south_indian_first = ["Karthik", "Ravi", "Arjun", "Lakshmi", "Priya", "Anand", "Venkatesh", "Srinivas", "Ganesh", "Meera", "Swathi", "Aishwarya"]
    south_indian_last = ["Iyer", "Reddy", "Nair", "Menon", "Rao", "Pillai", "Krishnan"]
    north_indian_first = ["Rahul", "Amit", "Priya", "Neha", "Vikram", "Rohan", "Sneha", "Pooja", "Raj", "Sanjay"]
    north_indian_last = ["Sharma", "Singh", "Patel", "Gupta", "Verma", "Kumar", "Chauhan", "Yadav"]
    foreign_flags = {"US": "🇺🇸", "UK": "🇬🇧", "CA": "🇨🇦", "AU": "🇦🇺", "DE": "🇩🇪", "FR": "🇫🇷"}
    
    # Role domains and seniorities
    domains = [
        "Full Stack Developer", "AI Engineer", "Python Developer", "Data Scientist", 
        "DevOps Engineer", "Cloud Architect", "Graphic Designer", "UI/UX Designer", 
        "QA Engineer", "Business Analyst", "Product Manager", "Mobile Developer"
    ]
    seniorities = ["Junior", "Mid-Level", "Senior", "Lead", "Manager"]

    for i in range(500):
        dept = random.choice(departments)
        
        # Determine seniority and domain
        seniority = random.choices(seniorities, weights=[20, 40, 25, 10, 5])[0]
        domain = random.choice(domains)
        role = f"{seniority} {domain}"
        
        # Determine name and flag
        category = random.choices(["south", "north", "foreign"], weights=[40, 30, 30])[0]
        if category == "south":
            name = f"{random.choice(south_indian_first)} {random.choice(south_indian_last)}"
            flag = "🇮🇳"
        elif category == "north":
            name = f"{random.choice(north_indian_first)} {random.choice(north_indian_last)}"
            flag = "🇮🇳"
        else:
            name = fake.name()
            flag = foreign_flags[random.choice(list(foreign_flags.keys()))]

        emp = Employee(
            name=name,
            email=f"emp_{i}@company.com",
            role=role,
            nationality_flag=flag,
            hire_date=fake.date_between(start_date='-5y', end_date='-1y'),
            department_id=dept.id
        )
        db.add(emp)
        employees.append(emp)
    db.commit()

    # Create Demo Users
    print("Generating Auth Users...")
    demo_users = [
        ("admin@company.com", "Enterprise Admin", "Admin"),
        ("hr@company.com", "HR Manager", "HR Manager"),
        ("pm@company.com", "Project Manager", "Project Manager"),
        ("delivery@company.com", "Delivery Manager", "Delivery Manager")
    ]
    for email, name, role in demo_users:
        db.add(User(email=email, hashed_password=get_password_hash("password123"), name=name, role=role))
    db.commit()

    # Employee Skills
    print("Generating Employee Skills...")
    employee_skills = []
    for emp in employees:
        base_cat = random.choice(list(skill_data.keys()))
        emp_skills_choices = skill_data[base_cat]
        
        if "Junior" in emp.role:
            num_skills, prof_range = 2, (20, 50)
        elif "Mid-Level" in emp.role:
            num_skills, prof_range = 4, (40, 80)
        elif "Senior" in emp.role:
            num_skills, prof_range = 6, (70, 100)
        elif "Lead" in emp.role:
            num_skills, prof_range = 7, (85, 100)
        else:
            num_skills, prof_range = 5, (60, 90)
            
        selected_skills = random.sample(emp_skills_choices, min(num_skills, len(emp_skills_choices)))
        
        for s_name in selected_skills:
            prof = random.randint(prof_range[0], prof_range[1])
            employee_skills.append(EmployeeSkill(employee_id=emp.id, skill_id=skill_map[s_name].id, proficiency_level=prof))
    db.add_all(employee_skills)
    db.commit()

    # Target utilization buckets for active assignments
    # 15% 0-40%, 70% 40-80%, 10% 80-100%, 5% 100-120%
    print("Calculating utilization targets...")
    emp_ids = [e.id for e in employees]
    random.shuffle(emp_ids)
    n = len(emp_ids)
    u_under = emp_ids[:int(n*0.15)]
    u_healthy = emp_ids[int(n*0.15):int(n*0.85)]
    u_high = emp_ids[int(n*0.85):int(n*0.95)]
    u_critical = emp_ids[int(n*0.95):]

    target_utilization = {}
    for eid in u_under: target_utilization[eid] = random.randint(0, 40)
    for eid in u_healthy: target_utilization[eid] = random.randint(45, 80)
    for eid in u_high: target_utilization[eid] = random.randint(85, 100)
    for eid in u_critical: target_utilization[eid] = random.randint(105, 120)

    # 4. Projects (1000 total: 800 Completed, 200 Active)
    print("Generating Projects...")
    projects = []
    today = datetime.now().date()
    
    project_themes = [
        ("Cloud Migration to AWS", "Migrating legacy on-premise infrastructure to AWS to improve scalability and reduce costs."),
        ("Next-Gen Mobile App", "Developing a cross-platform mobile application using React Native to reach a wider audience."),
        ("ERP System Upgrade", "Upgrading the core enterprise resource planning software to the latest version with custom modules."),
        ("AI-Powered Support Bot", "Implementing advanced NLP models to automate tier 1 customer support inquiries."),
        ("Data Warehouse Modernization", "Transitioning data pipelines to Snowflake for real-time analytics and BI reporting."),
        ("Cybersecurity Audit & Overhaul", "Comprehensive security review and implementation of zero-trust architecture."),
        ("E-Commerce Platform Redesign", "Overhauling the user interface and checkout flow for the main online store."),
        ("Global CRM Rollout", "Deploying Salesforce across all international branches with localized workflows."),
        ("IoT Fleet Tracking", "Building a real-time dashboard for tracking and managing the logistics vehicle fleet."),
        ("Blockchain Supply Chain", "Creating an immutable ledger for verifying provenance of physical goods."),
        ("HR Intranet Portal", "Designing a new internal portal for employee benefits, onboarding, and communications."),
        ("Payment Gateway Integration", "Adding support for international payment methods and crypto transactions."),
        ("Customer Data Platform", "Consolidating user touchpoints into a unified CDP for marketing automation."),
        ("Microservices Architecture", "Breaking down the monolithic backend into scalable microservices using Kubernetes."),
        ("Automated QA Pipeline", "Setting up end-to-end testing frameworks to improve release confidence.")
    ]
    
    # 800 Historical
    for i in range(800):
        duration = random.randint(30, 180)
        end_dt = fake.date_between(start_date='-3y', end_date='-1d')
        start_dt = end_dt - timedelta(days=duration)
        theme = random.choice(project_themes)
        proj_name = f"{theme[0]} - {fake.word().capitalize()} {i%100}"
        
        projects.append(Project(
            name=proj_name, description=theme[1], status="Completed", start_date=start_dt, end_date=end_dt,
            manager_id=random.choice(employees).id
        ))
        
    # 100 Active
    for i in range(100):
        duration = random.randint(90, 730)
        start_dt = fake.date_between(start_date='-6m', end_date='today')
        theme = random.choice(project_themes)
        proj_name = f"{theme[0]} - {fake.word().capitalize()} {i%100}"
        
        end_dt = start_dt + timedelta(days=duration)
        projects.append(Project(
            name=proj_name, description=theme[1], status=random.choice(["Active", "On Hold"]), start_date=start_dt, end_date=end_dt,
            manager_id=random.choice(employees).id
        ))
        
    for chunk in chunker(projects, 200): db.add_all(chunk); db.commit()
    
    active_projects = [p for p in projects if p.status == "Active"]
    completed_projects = [p for p in projects if p.status == "Completed"]

    # 5. Project Requirements (Demand Generation)
    print("Generating Project Requirements...")
    high_demand_skills = ["React", "Python", "Java", "Data Engineering", "AI/ML", "AWS", "Docker", "Kubernetes", "Cloud Architecture", "Machine Learning", "Cybersecurity"]
    requirements = []
    # Generate requirements for ALL projects, including historical ones
    for p in projects:
        req_skills = random.sample(high_demand_skills, random.randint(2, 4))
        for rs in req_skills:
            requirements.append(ProjectRequirement(
                project_id=p.id, skill_id=skill_map[rs].id, required_headcount=random.randint(1, 3),
                required_proficiency=random.randint(60, 95)
            ))
    for chunk in chunker(requirements, 500): db.add_all(chunk); db.commit()

    # 6. Assignments & Collaboration (Past & Present)
    print("Generating Assignments & Collaborations...")
    assignments = []
    collaborations = []
    outcomes = []
    
    # Track current utilization to hit targets
    current_util = {eid: 0 for eid in emp_ids}
    emp_map = {e.id: e for e in employees}
    
    # Fill Active Projects (5000+ target)
    for p in active_projects:
        team_size = random.randint(5, 15)
        available_emps = [eid for eid in emp_ids if current_util[eid] < target_utilization[eid]]
        if len(available_emps) < team_size:
            team_eids = random.sample(emp_ids, team_size)
        else:
            team_eids = random.sample(available_emps, team_size)
            
        for eid in team_eids:
            needed = target_utilization[eid] - current_util[eid]
            alloc = min(max(10, needed), 100)
            if alloc > 0:
                assignments.append(TeamAssignment(
                    employee_id=eid, project_id=p.id, role=emp_map[eid].role, allocation_percentage=alloc,
                    start_date=p.start_date, end_date=None
                ))
                current_util[eid] += alloc
                
    # Fill Completed Projects
    for p in completed_projects:
        team_size = random.randint(3, 10)
        team_eids = random.sample(emp_ids, team_size)
        success_score = random.uniform(40, 100)
        
        # Outcome
        outcomes.append(HistoricalProjectOutcome(
            project_id=p.id, success_score=success_score, 
            delayed_days=int(max(0, (100-success_score)*0.5)),
            budget_variance=float((100-success_score)*0.01)
        ))
        
        # History assignments
        for eid in team_eids:
            assignments.append(TeamAssignment(
                employee_id=eid, project_id=p.id, role=emp_map[eid].role, allocation_percentage=random.randint(20, 100),
                start_date=p.start_date, end_date=p.end_date
            ))
            
        # Collaboration graph
        for i in range(len(team_eids)):
            for j in range(i+1, len(team_eids)):
                e1, e2 = min(team_eids[i], team_eids[j]), max(team_eids[i], team_eids[j])
                chem_score = random.uniform(50, 100) if success_score > 70 else random.uniform(20, 60)
                collaborations.append(CollaborationHistory(
                    employee1_id=e1, employee2_id=e2, project_id=p.id,
                    collaboration_score=chem_score, project_success_score=success_score,
                    end_date=p.end_date
                ))

    for chunk in chunker(assignments, 2000): db.add_all(chunk); db.commit()
    for chunk in chunker(outcomes, 1000): db.add_all(chunk); db.commit()
    for chunk in chunker(collaborations, 5000): db.add_all(chunk); db.commit()
    
    print(f"Generated {len(assignments)} assignments and {len(collaborations)} collaboration records.")

    # 7. Utilization History & Burnout Metrics
    print("Generating Time-Series Data (Utilization & Burnout)...")
    util_history = []
    burnout_records = []
    
    for month_offset in range(6):
        record_date = today - timedelta(days=30 * month_offset)
        for eid in emp_ids:
            hist_util = max(0, target_utilization[eid] + random.randint(-15, 15))
            util_history.append(UtilizationHistory(
                employee_id=eid, date=record_date, hours_logged=hist_util*0.4, utilization_percentage=hist_util
            ))
            
            risk_score = min(100, hist_util * 0.8)
            if hist_util >= 100: risk_score += 20
            if hist_util >= 80 and hist_util < 100: risk_score += 10
            
            burnout_records.append(BurnoutMetrics(
                employee_id=eid, date=record_date, risk_score=min(100, risk_score),
                hours_worked_last_30_days=hist_util*0.4*4, consecutive_assignments=random.randint(1, 5)
            ))

    for chunk in chunker(util_history, 2000): db.add_all(chunk); db.commit()
    for chunk in chunker(burnout_records, 2000): db.add_all(chunk); db.commit()

    print("Data Realism Generation Complete!")
    db.close()

if __name__ == "__main__":
    generate_data()
