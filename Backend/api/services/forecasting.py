from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from datetime import datetime, timedelta, date
from models.employee import Employee
from models.projects import Project, TeamAssignment, ProjectRequirement
from models.skills import Skill, EmployeeSkill

def generate_forecast_horizon(db: Session, horizon_days: int) -> dict:
    target_date = date.today() + timedelta(days=horizon_days)
    
    # Current active metrics
    current_employees = db.query(Employee).count() or 1
    
    # Current average utilization across all employees
    current_assignments = db.query(
        TeamAssignment.employee_id,
        func.sum(TeamAssignment.allocation_percentage).label("utilization")
    ).join(Project).filter(
        Project.status == "Active"
    ).group_by(TeamAssignment.employee_id).all()
    
    if current_assignments:
        total_current_allocation = sum(a.utilization for a in current_assignments)
        avg_current_utilization = total_current_allocation / current_employees
    else:
        avg_current_utilization = 80.0 # fallback if no data
        
    # Future Demand (projects active on target_date)
    # We consider a project active if its start_date <= target_date and (end_date >= target_date or end_date is null)
    future_projects_query = db.query(Project).filter(
        Project.start_date <= target_date,
        or_(Project.end_date >= target_date, Project.end_date == None)
    )
    future_projects_count = future_projects_query.count()
    
    # Future required headcount (Demand)
    future_demand_query = db.query(
        ProjectRequirement.skill_id,
        func.sum(ProjectRequirement.required_headcount).label("demand")
    ).join(Project).filter(
        Project.start_date <= target_date,
        or_(Project.end_date >= target_date, Project.end_date == None)
    ).group_by(ProjectRequirement.skill_id).all()
    
    future_demand_map = {row.skill_id: row.demand for row in future_demand_query}
    total_future_demand = sum(future_demand_map.values())
    
    # Current Supply (Employees with skills)
    supply_query = db.query(
        EmployeeSkill.skill_id,
        func.count(EmployeeSkill.employee_id).label("supply")
    ).group_by(EmployeeSkill.skill_id).all()
    
    supply_map = {row.skill_id: row.supply for row in supply_query}
    
    # Skill Shortages on target_date
    shortages = []
    for skill_id, demand in future_demand_map.items():
        supply = supply_map.get(skill_id, 0)
        if demand > supply:
            shortages.append((skill_id, demand - supply))
            
    # Sort shortages by largest gap
    shortages.sort(key=lambda x: x[1], reverse=True)
    
    skill_names = []
    if shortages:
        top_skill_ids = [s[0] for s in shortages[:3]]
        skills = db.query(Skill).filter(Skill.id.in_(top_skill_ids)).all()
        s_map = {s.id: s.name for s in skills}
        for s_id, gap in shortages[:3]:
            skill_names.append(f"{s_map.get(s_id, 'Unknown')} (Shortage: {gap})")
    else:
        skill_names = ["No severe shortages projected"]

    # Calculate utilization forecast
    # Base it on current utilization, scaled by the ratio of future demand to current employees
    # If demand is higher than supply, utilization will go up until capped, then hiring demand kicks in
    if current_employees > 0:
        projected_utilization_ratio = total_future_demand / current_employees
    else:
        projected_utilization_ratio = 1.0

    # Simplified projection: base utilization * demand ratio
    # If a company usually runs at 80% with 100 demand and 100 supply.
    raw_utilization = avg_current_utilization * max(0.5, projected_utilization_ratio)
    utilization_forecast = min(95.0, raw_utilization) # Hard cap at 95% avg utilization
    
    # Hiring Demand
    # If total demand > current supply, we need more people
    hiring_demand = max(0, total_future_demand - current_employees)
    
    # Delivery Risk
    # Spikes if utilization is very high or if there are large skill shortages
    risk_base = 20.0
    if utilization_forecast > 85:
        risk_base += (utilization_forecast - 85) * 3
    if total_future_demand > 0:
        shortage_sum = sum(gap for _, gap in shortages)
        risk_base += (shortage_sum / total_future_demand) * 50
    delivery_risk = min(100.0, risk_base)
    
    # Confidence Score
    # Confidence is high (90%+) for near-term. 
    # It drops based on how far out we project AND if there's a steep dropoff in planned projects.
    current_active_projects = db.query(Project).filter(Project.status == "Active").count() or 1
    project_retention = future_projects_count / current_active_projects
    
    # Base confidence degrades by ~10% every 90 days.
    time_degradation = (horizon_days / 90.0) * 10
    
    # If very few projects are planned that far out, data stability is low.
    data_stability = min(100.0, project_retention * 100.0)
    
    confidence_score = max(10.0, min(95.0, data_stability - time_degradation))
    if horizon_days <= 30:
        confidence_score = max(85.0, confidence_score)

    return {
        "capacity_forecast": int(current_employees * 40),
        "total_demand": int(total_future_demand * 40),
        "utilization_forecast": round(utilization_forecast, 1),
        "hiring_demand": int(hiring_demand),
        "delivery_risk": round(delivery_risk, 1),
        "skill_shortage": skill_names,
        "confidence_score": f"{round(confidence_score)}%"
    }

def generate_forecasts(db: Session) -> dict:
    return {
        "forecasts": {
            "30_days": generate_forecast_horizon(db, 30),
            "90_days": generate_forecast_horizon(db, 90),
            "180_days": generate_forecast_horizon(db, 180),
            "365_days": generate_forecast_horizon(db, 365)
        }
    }
