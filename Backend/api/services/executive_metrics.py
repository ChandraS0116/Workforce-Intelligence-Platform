from sqlalchemy.orm import Session
from sqlalchemy import func, or_, case
from datetime import datetime, date

from models.employee import Employee
from models.projects import Project, TeamAssignment, ProjectRequirement
from models.skills import Skill, EmployeeSkill
from models.analytics import BurnoutMetrics

def compute_executive_metrics(db: Session) -> dict:
    # Fetch employees for name resolution
    employees = db.query(Employee.id, Employee.name).all()
    emp_map = {e.id: e.name for e in employees}
    
    # 1. Workforce Health
    employee_utilizations = db.query(
        TeamAssignment.employee_id,
        func.sum(TeamAssignment.allocation_percentage).label("total_utilization")
    ).join(Project).filter(Project.status == "Active").group_by(TeamAssignment.employee_id).all()
    
    total_employees = len(emp_map) or 1
    utilization_map = {row.employee_id: row.total_utilization for row in employee_utilizations}
    
    overutilized_count = sum(1 for u in utilization_map.values() if u > 85)
    idle_employees = total_employees - len(utilization_map)
    avg_util = sum(utilization_map.values()) / total_employees if total_employees > 0 else 0
    
    overutilization_penalty = (overutilized_count / total_employees) * 100
    avg_burnout = db.query(func.avg(BurnoutMetrics.risk_score)).scalar() or 0.0
    workforce_health = max(0, min(100, 100 - overutilization_penalty - (avg_burnout * 0.2)))
    
    # Top risks for workforce health
    wh_top_risks = []
    # Sort by highest util
    sorted_utils = sorted(utilization_map.items(), key=lambda x: x[1], reverse=True)
    for emp_id, util in sorted_utils[:3]:
        if util > 85:
            wh_top_risks.append(f"{emp_map.get(emp_id, 'Unknown')} ({int(util)}% utilization)")
            
    # Add a couple idle employees
    assigned_ids = set(utilization_map.keys())
    idle_ids = [e_id for e_id in emp_map.keys() if e_id not in assigned_ids]
    for emp_id in idle_ids[:2]:
        wh_top_risks.append(f"{emp_map.get(emp_id, 'Unknown')} (no assignment)")
    
    # 2. Skill Readiness
    demand_query = db.query(
        ProjectRequirement.skill_id,
        func.sum(ProjectRequirement.required_headcount).label("demand")
    ).join(Project).filter(Project.status == "Active").group_by(ProjectRequirement.skill_id).all()
    demand_map = {row.skill_id: row.demand for row in demand_query}
    
    supply_query = db.query(
        EmployeeSkill.skill_id,
        func.count(EmployeeSkill.employee_id).label("supply")
    ).group_by(EmployeeSkill.skill_id).all()
    supply_map = {row.skill_id: row.supply for row in supply_query}
    
    skills = db.query(Skill.id, Skill.name).all()
    skill_map = {s.id: s.name for s in skills}
    
    total_demand = sum(demand_map.values())
    missing_skills = []
    
    if total_demand == 0:
        skill_readiness = 100.0
    else:
        met_demand = 0
        gaps = []
        for skill_id, demand in demand_map.items():
            supply = supply_map.get(skill_id, 0)
            met_demand += min(demand, supply)
            if demand > supply:
                gaps.append((skill_id, demand - supply))
                
        skill_readiness = (met_demand / total_demand) * 100.0
        
        # Sort gaps descending
        gaps.sort(key=lambda x: x[1], reverse=True)
        for skill_id, gap_size in gaps[:5]:
            missing_skills.append(f"{skill_map.get(skill_id, 'Unknown')} (gap: {int(gap_size)} engineers)")
            
    # 3. Talent Risk
    high_util_count = sum(1 for u in utilization_map.values() if u > 90)
    
    long_streaks = db.query(BurnoutMetrics.employee_id, BurnoutMetrics.consecutive_assignments)\
        .filter(BurnoutMetrics.consecutive_assignments > 5).all()
        
    streak_map = {row.employee_id: row.consecutive_assignments for row in long_streaks}
    long_streak_count = len(streak_map)
    
    at_risk_score = (idle_employees + high_util_count + long_streak_count) / total_employees * 100.0
    talent_risk = min(100.0, at_risk_score)
    
    tr_top_employees = []
    # Add high streak
    sorted_streaks = sorted(streak_map.items(), key=lambda x: x[1], reverse=True)
    for emp_id, streaks in sorted_streaks[:3]:
        tr_top_employees.append(f"{emp_map.get(emp_id, 'Unknown')} (Streak: {streaks} projects)")
        
    # Add high util
    for emp_id, util in sorted_utils:
        if util > 90 and len(tr_top_employees) < 5 and emp_id not in [x[0] for x in sorted_streaks[:3]]:
            tr_top_employees.append(f"{emp_map.get(emp_id, 'Unknown')} ({int(util)}% utilization)")
    
    # 4. Executive Readiness Score
    talent_readiness = 100.0 - talent_risk
    executive_readiness = (workforce_health * 0.3) + (skill_readiness * 0.4) + (talent_readiness * 0.3)
    
    return {
        "workforce_health": {
            "value": round(workforce_health, 1),
            "factors": {
                "avg_utilization": f"{round(avg_util, 1)}%",
                "overallocated_employees": overutilized_count,
                "idle_employees": idle_employees
            },
            "top_risks": wh_top_risks
        },
        "skill_readiness": {
            "value": round(skill_readiness, 1),
            "missing_skills": missing_skills
        },
        "talent_risk": {
            "value": round(talent_risk, 1),
            "factors": {
                "high_utilization_count": high_util_count,
                "long_streak_count": long_streak_count,
                "no_assignment_count": idle_employees
            },
            "top_risk_employees": tr_top_employees
        },
        "executive_readiness": {
            "value": round(executive_readiness, 1)
        }
    }
