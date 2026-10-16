import math
import os
from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from core.database import get_db

from models.projects import Project, ProjectRequirement, TeamAssignment
from models.employee import Employee
from models.organization import Department
from models.skills import Skill, EmployeeSkill
from models.analytics import CollaborationHistory, UtilizationHistory, HistoricalProjectOutcome, BurnoutMetrics

router = APIRouter(prefix="/api/v1/ml", tags=["Intelligence Engine"])

# --- COMMON SCHEMAS ---
class AIInsight(BaseModel):
    title: str
    severity: str # "high", "medium", "low"
    confidence: float
    business_impact: str
    recommendation: str
    expected_outcome: str

class WorkforceHealthResponse(BaseModel):
    capacity_health: float
    skill_readiness: float
    burnout_risk: float
    delivery_readiness: float
    employee_growth_index: float
    overall_score: float

# 1. Workforce Health Score
@router.get("/intelligence/workforce-health", response_model=WorkforceHealthResponse)
def get_workforce_health(db: Session = Depends(get_db)):
    emps = db.query(Employee).count() or 1
    
    # Capacity Health (from target utilization distribution)
    assignments = db.query(TeamAssignment).filter(TeamAssignment.end_date == None).all()
    allocations = {}
    for a in assignments:
        allocations[a.employee_id] = allocations.get(a.employee_id, 0) + a.allocation_percentage
        
    avg_util = sum(allocations.values()) / emps if allocations else 80.0
    capacity_health = max(0, min(100, 100 - (abs(80 - avg_util) * 1.5)))
    
    # Burnout Risk (from BurnoutMetrics table)
    latest_burnout = db.query(func.avg(BurnoutMetrics.risk_score)).scalar() or 20.0
    burnout_risk = min(100, latest_burnout)
    
    # Delivery Readiness
    recent_outcomes = db.query(func.avg(HistoricalProjectOutcome.success_score)).scalar() or 85.0
    delivery_readiness = min(100, recent_outcomes)
    
    # Skill Readiness (from supply vs demand)
    supply_cnt = db.query(EmployeeSkill).count()
    demand_cnt = db.query(func.sum(ProjectRequirement.required_headcount)).scalar() or 1
    skill_ratio = min(1.0, supply_cnt / (demand_cnt * 3)) if demand_cnt > 0 else 1.0
    skill_readiness = skill_ratio * 100

    employee_growth_index = 80.0 # Baseline for now
    
    overall = (capacity_health * 0.3) + (skill_readiness * 0.2) + ((100-burnout_risk)*0.2) + (delivery_readiness*0.2) + (employee_growth_index*0.1)
    
    return WorkforceHealthResponse(
        capacity_health=round(capacity_health, 1),
        skill_readiness=round(skill_readiness, 1),
        burnout_risk=round(burnout_risk, 1),
        delivery_readiness=round(delivery_readiness, 1),
        employee_growth_index=round(employee_growth_index, 1),
        overall_score=round(overall, 1)
    )

# 2. Executive Recommendation Engine
@router.get("/intelligence/recommendations", response_model=List[AIInsight])
def get_recommendations(db: Session = Depends(get_db)):
    recs = []
    
    # 1. Check for burnout
    high_burnout_count = db.query(BurnoutMetrics).filter(BurnoutMetrics.risk_score > 85).distinct(BurnoutMetrics.employee_id).count()
    if high_burnout_count > 0:
        recs.append(AIInsight(
            title="Severe Burnout Risk Detected",
            severity="high",
            confidence=0.95,
            business_impact=f"{high_burnout_count} employees are operating above critical utilization levels.",
            recommendation="Rebalance workload by deferring lower-priority projects or initiating emergency contractor hiring.",
            expected_outcome="Reduce flight risk by 40% and stabilize delivery metrics."
        ))
        
    # 2. Check for skill gaps
    supply_query = db.query(EmployeeSkill.skill_id, func.count(EmployeeSkill.employee_id)).group_by(EmployeeSkill.skill_id).all()
    supply_map = {s[0]: s[1] for s in supply_query}
    demand_query = db.query(ProjectRequirement.skill_id, func.sum(ProjectRequirement.required_headcount)).group_by(ProjectRequirement.skill_id).all()
    
    top_gap = None
    max_gap = 0
    for sid, demand in demand_query:
        gap = demand - supply_map.get(sid, 0)
        if gap > max_gap:
            max_gap = gap
            top_gap = sid
            
    if top_gap and max_gap > 5:
        skill_name = db.query(Skill).filter(Skill.id == top_gap).first().name
        recs.append(AIInsight(
            title=f"Critical Skill Shortage: {skill_name}",
            severity="high" if max_gap > 20 else "medium",
            confidence=0.91,
            business_impact=f"Demand for {skill_name} outpaces supply by {int(max_gap)} headcounts.",
            recommendation=f"Hire {int(max_gap * 0.8)} {skill_name} Engineers and upskill remaining internal staff.",
            expected_outcome=f"Closes skill gap in 12 weeks, ensuring project milestones are met."
        ))

    # 3. Delivery Risk (Underutilization)
    assignments = db.query(TeamAssignment.employee_id, func.sum(TeamAssignment.allocation_percentage).label('total')).filter(TeamAssignment.end_date == None).group_by(TeamAssignment.employee_id).all()
    underutilized = [a for a in assignments if a.total < 40]
    if len(underutilized) > 10:
        recs.append(AIInsight(
            title="Underutilized Capacity Detected",
            severity="medium",
            confidence=0.87,
            business_impact=f"{len(underutilized)} employees are currently under 40% utilization, representing sunk cost.",
            recommendation="Reallocate staff from bench to active high-demand projects.",
            expected_outcome="Increase capacity health by 15%."
        ))

    if not recs:
        recs.append(AIInsight(
            title="Workforce Stabilized",
            severity="low",
            confidence=0.99,
            business_impact="No immediate threats to capacity or delivery.",
            recommendation="Focus on long-term employee growth and R&D projects.",
            expected_outcome="Maintains high retention and innovation."
        ))
        
    return sorted(recs, key=lambda x: {"high": 3, "medium": 2, "low": 1}[x.severity], reverse=True)

# 3. Smart Team Builder
class TeamBuilderReq(BaseModel):
    required_skills: List[str]
    required_proficiency: str
    project_duration: int
    team_size: int
    budget_category: str

class TeamMemberResponse(BaseModel):
    employee_id: int
    name: str
    display_name: Optional[str] = None
    role: str
    match_score: float
    skill_coverage_contribution: float
    current_utilization: float
    availability_status: str
    risk_level: str
    estimated_cost: float
    reason_selected: str

class TeamBuilderRes(BaseModel):
    recommended_team: List[TeamMemberResponse]
    alternate_candidates: List[TeamMemberResponse]
    overall_team_success_probability: float
    team_chemistry_score: float
    delivery_risk_score: float
    budget_fit_score: float

@router.post("/team-builder/recommend", response_model=TeamBuilderRes)
def team_builder(req: TeamBuilderReq, db: Session = Depends(get_db)):
    skill_names = [s.lower() for s in req.required_skills]
    skill_recs = db.query(Skill).filter(func.lower(Skill.name).in_(skill_names)).all()
    skill_ids = [s.id for s in skill_recs]
    
    employees = db.query(Employee).all()
    
    # Get active allocations
    assignments = db.query(TeamAssignment).filter(TeamAssignment.end_date == None).all()
    allocations = {}
    for a in assignments:
        allocations[a.employee_id] = allocations.get(a.employee_id, 0) + a.allocation_percentage

    # Get Historical Success
    hist_assignments = db.query(TeamAssignment.employee_id, func.avg(HistoricalProjectOutcome.success_score).label("success"))\
        .join(HistoricalProjectOutcome, HistoricalProjectOutcome.project_id == TeamAssignment.project_id)\
        .group_by(TeamAssignment.employee_id).all()
    success_map = {h[0]: h[1] for h in hist_assignments}

    # Get Chemistry (average score)
    chem_history = db.query(CollaborationHistory).all()
    chem_map = {}
    for c in chem_history:
        chem_map[c.employee1_id] = chem_map.get(c.employee1_id, []) + [c.collaboration_score]
        chem_map[c.employee2_id] = chem_map.get(c.employee2_id, []) + [c.collaboration_score]
    avg_chem_map = {eid: sum(scores)/len(scores) for eid, scores in chem_map.items()}

    candidates = []
    for emp in employees:
        util = allocations.get(emp.id, 0.0)
        avail = "Available" if util < 80 else "Overallocated" if util > 100 else "At Capacity"
        risk = "Low" if util < 80 else "High" if util > 100 else "Medium"
        
        emp_skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == emp.id).all()
        emp_skill_map = {s.skill_id: s.proficiency_level for s in emp_skills}
        
        # Skill Coverage (40%)
        overlap = len(set(skill_ids).intersection(set(emp_skill_map.keys())))
        skill_coverage_score = (overlap / len(skill_ids)) * 100 if skill_ids else 100
        
        # Proficiency Match (25%)
        # Target based on required_proficiency
        target_prof = {"Junior": 30, "Mid-Level": 60, "Senior": 80, "Lead": 90, "Manager": 70}.get(req.required_proficiency, 50)
        prof_diffs = [abs(emp_skill_map.get(sid, 0) - target_prof) for sid in skill_ids]
        avg_prof_diff = sum(prof_diffs)/len(prof_diffs) if prof_diffs else 0
        proficiency_score = max(0, 100 - avg_prof_diff)
        
        # Availability (20%)
        availability_score = max(0, 100 - util)
        
        # Historical Delivery Success (10%)
        success_score = success_map.get(emp.id, 80.0)
        
        # Team Chemistry Contribution (5%)
        chemistry_score = avg_chem_map.get(emp.id, 75.0)
        
        match_score = (skill_coverage_score * 0.40) + \
                      (proficiency_score * 0.25) + \
                      (availability_score * 0.20) + \
                      (success_score * 0.10) + \
                      (chemistry_score * 0.05)
                      
        candidates.append({
            "emp": emp,
            "util": util,
            "avail": avail,
            "risk": risk,
            "match_score": match_score,
            "overlap": overlap,
            "missing": len(skill_ids) - overlap
        })
        
    candidates.sort(key=lambda x: x["match_score"], reverse=True)
    
    selected = []
    alternates = []
    
    for i, c in enumerate(candidates):
        missing_text = f"Missing {c['missing']} skills." if c['missing'] > 0 else "All skills matched."
        member = TeamMemberResponse(
            employee_id=c["emp"].id,
            name=c["emp"].name,
            display_name=f"{c['emp'].nationality_flag} {c['emp'].name}" if getattr(c['emp'], 'nationality_flag', None) else c['emp'].name,
            role=c["emp"].role,
            match_score=round(c["match_score"], 1),
            skill_coverage_contribution=round(100.0 / req.team_size if req.team_size else 0, 1),
            current_utilization=round(c["util"], 1),
            availability_status=c["avail"],
            risk_level=c["risk"],
            estimated_cost=150000.0,
            reason_selected=f"Strong match ({round(c['match_score'], 1)}%). {missing_text} Utilized at {c['util']}%.",
        )
        if len(selected) < req.team_size:
            selected.append(member)
        elif len(alternates) < 3:
            alternates.append(member)
            
    avg_util = sum([c.current_utilization for c in selected]) / len(selected) if selected else 0
    avg_match = sum([c.match_score for c in selected]) / len(selected) if selected else 0
    
    return TeamBuilderRes(
        recommended_team=selected,
        alternate_candidates=alternates,
        overall_team_success_probability=round(min(100, avg_match + 15), 1),
        team_chemistry_score=round(sum([avg_chem_map.get(c.employee_id, 75) for c in selected]) / len(selected) if selected else 0, 1),
        delivery_risk_score=round(avg_util * 0.6, 1),
        budget_fit_score=90.0
    )

# 4. Team Chemistry
@router.get("/intelligence/team-chemistry")
def team_chemistry(db: Session = Depends(get_db)):
    collaborations = db.query(CollaborationHistory).all()
    emps = db.query(Employee).all()
    emp_map = {e.id: e.name for e in emps}
    
    edge_map = {}
    for c in collaborations:
        pair = tuple(sorted([c.employee1_id, c.employee2_id]))
        if pair not in edge_map:
            edge_map[pair] = {"score_sum": 0, "count": 0}
        edge_map[pair]["score_sum"] += c.collaboration_score
        edge_map[pair]["count"] += 1
        
    links = []
    nodes_set = set()
    
    strongest_pair = None
    strongest_val = -1
    strongest_count = 0
    weakest_pair = None
    weakest_val = float('inf')
    weakest_count = 0
    
    for (e1, e2), data in edge_map.items():
        avg_score = data["score_sum"] / data["count"]
        if e1 in emp_map and e2 in emp_map:
            links.append({"source": e1, "target": e2, "value": round(avg_score, 1)})
            nodes_set.add(e1)
            nodes_set.add(e2)
            
            if avg_score > strongest_val:
                strongest_val = avg_score
                strongest_pair = (emp_map[e1], emp_map[e2])
                strongest_count = data["count"]
            if avg_score < weakest_val:
                weakest_val = avg_score
                weakest_pair = (emp_map[e1], emp_map[e2])
                weakest_count = data["count"]
                
    nodes = [{"id": n, "name": emp_map[n]} for n in nodes_set]
    isolated = [e.name for e in emps if e.id not in nodes_set]
    
    possible_edges = (len(nodes) * (len(nodes) - 1)) / 2 if len(nodes) > 1 else 1
    density = (len(links) / possible_edges) * 100 if possible_edges else 0
    
    return {
        "strongest_team": strongest_pair or ["N/A", "N/A"],
        "strongest_team_explanation": f"Collaborated on {strongest_count} projects with an outstanding average score of {round(strongest_val, 1)}/100, indicating high synergy." if strongest_pair else "Not enough data.",
        "weakest_team": weakest_pair or ["N/A", "N/A"],
        "weakest_team_explanation": f"Averaged a low score of {round(weakest_val, 1)}/100 across {weakest_count} shared projects, suggesting communication friction." if weakest_pair else "Not enough data.",
        "collaboration_density": round(density, 1),
        "isolated_employees": isolated[:5],
        "isolated_employees_explanation": "These employees have no recorded collaborations. They are at high risk of knowledge siloing and reduced engagement.",
        "collaboration_risk_areas": ["Siloed department teams detected" if density < 10 else "Healthy cross-functional collaboration"],
        "collaboration_risk_explanation": f"Overall network density is {round(density, 1)}%. {'This is critically low, meaning knowledge rarely flows outside immediate teams.' if density < 10 else 'This indicates a healthy flow of information across the organization.'}",
        "recommended_pairings": [f"Pair {strongest_pair[0]} and {strongest_pair[1]} on critical path items."] if strongest_pair else [],
        "recommended_pairings_explanation": "Pairing historically strong performers minimizes delivery risk and leverages proven collaborative synergy.",
        "graph": {
            "nodes": nodes,
            "links": links
        }
    }

# 5. Skill Gap
@router.get("/intelligence/skill-gaps")
def skill_gaps(db: Session = Depends(get_db)):
    skills = db.query(Skill).all()
    
    supply_query = db.query(EmployeeSkill.skill_id, func.count(EmployeeSkill.employee_id)).group_by(EmployeeSkill.skill_id).all()
    supply_map = {s[0]: s[1] for s in supply_query}
    
    demand_query = db.query(ProjectRequirement.skill_id, func.sum(ProjectRequirement.required_headcount)).group_by(ProjectRequirement.skill_id).all()
    demand_map = {d[0]: d[1] for d in demand_query}
    
    gaps = []
    
    for skill in skills:
        supply = supply_map.get(skill.id, 0)
        demand = demand_map.get(skill.id, 0)
        gap = demand - supply
        
        if demand > 0 or supply > 0:
            if gap > 0:
                severity = "High" if gap > 20 else ("Medium" if gap > 10 else "Low")
                cost = gap * 150000
                time = "12 weeks"
                gaps.append({
                    "skill": skill.name,
                    "current_supply": supply,
                    "current_demand": demand,
                    "gap": gap,
                    "severity": severity,
                    "estimated_cost": cost,
                    "estimated_time_to_close": time,
                    "business_impact_score": round(max(0, min(100, gap * 5)), 1)
                })

    gaps.sort(key=lambda x: x["gap"], reverse=True)
    
    for g in gaps:
        if g["gap"] >= 20:
            g["recommended_action"] = "BUY"
            g["estimated_cost"] = g["gap"] * 1500000
            g["estimated_time_to_close"] = "12 weeks"
            g["rationale"] = "High sustained demand requires permanent hires to build internal capability."
        elif g["gap"] >= 10:
            g["recommended_action"] = "BORROW"
            g["estimated_cost"] = g["gap"] * 500000
            g["estimated_time_to_close"] = "2-4 weeks"
            g["rationale"] = "Significant immediate need; use contractors for fast scaling."
        else:
            g["recommended_action"] = "BUILD"
            g["estimated_cost"] = g["gap"] * 50000
            g["estimated_time_to_close"] = "4-8 weeks"
            g["rationale"] = "Manageable gap; upskill existing employees through targeted training."
    return {"gaps": gaps}

# 6. Employee Intelligence
@router.get("/intelligence/employees/{id}")
def employee_intel(id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        return {"error": "Employee not found"}
        
    assignments = db.query(TeamAssignment).filter(TeamAssignment.employee_id == id, TeamAssignment.end_date == None).all()
    util = sum([a.allocation_percentage for a in assignments])
    
    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == id).all()
    skill_count = len(skills)
    
    burnout = db.query(BurnoutMetrics).filter(BurnoutMetrics.employee_id == id).order_by(BurnoutMetrics.date.desc()).first()
    burnout_score = burnout.risk_score if burnout else util
    
    promotion_readiness = min(100.0, skill_count * 10 + 20)
    growth_potential = min(100.0, 50 + (skill_count * 5))
    retention_risk = min(100.0, burnout_score * 0.6 + (100 - promotion_readiness) * 0.4)
    learning_velocity = min(100.0, 60 + (skill_count * 3))
    
    if burnout_score > 80:
        expl = f"{emp.name} is at high risk of burnout due to {util}% utilization."
    elif promotion_readiness > 80:
        expl = f"{emp.name} shows high promotion readiness based on mastery of {skill_count} key skills."
    else:
        expl = f"{emp.name} is performing steadily. Consider assigning to stretch projects to increase growth potential."
        
    return {
        "burnout_score": round(burnout_score, 1),
        "promotion_readiness": round(promotion_readiness, 1),
        "growth_potential": round(growth_potential, 1),
        "retention_risk": round(retention_risk, 1),
        "learning_velocity": round(learning_velocity, 1),
        "internal_mobility_opportunities": ["Lead Architect", "Engineering Manager"] if promotion_readiness > 80 else ["Senior Developer"],
        "explanation": expl
    }

# 7. Forecast
from api.services.forecasting import generate_forecasts

@router.get("/intelligence/forecast")
def forecast(db: Session = Depends(get_db)):
    """Return future workforce capacity and demand forecasts."""
    return generate_forecasts(db)

# 8. Scenario Simulator
class ScenarioReq(BaseModel):
    hiring_percent: float
    attrition_percent: float
    training_budget: float
    new_projects: int
    utilization_target: float

@router.post("/scenario-simulator")
def simulate(req: ScenarioReq, db: Session = Depends(get_db)):
    base_headcount = db.query(Employee).count() or 500
    current_health = get_workforce_health(db)
    base_health_score = current_health.overall_score
    
    hires = int(base_headcount * (req.hiring_percent / 100))
    attritions = int(base_headcount * (req.attrition_percent / 100))
    projected_headcount = base_headcount + hires - attritions
    
    base_capacity = base_headcount * 40
    projected_capacity = projected_headcount * 40
    new_demand_hours = req.new_projects * 6 * 40 # approx 6 people per new project
    
    avg_salary = 1200000
    base_run_rate = base_headcount * avg_salary
    
    # Costs
    hiring_cost = hires * (avg_salary * 0.15) # 15% recruitment fee
    additional_salary = hires * avg_salary
    attrition_savings = attritions * avg_salary
    severance_cost = attritions * (avg_salary * 0.10) # 10% lost productivity / severance
    
    projected_run_rate = base_run_rate + additional_salary + hiring_cost - attrition_savings + severance_cost + req.training_budget
    
    # Impacts
    capacity_delta = projected_capacity - base_capacity - new_demand_hours
    if capacity_delta >= 0:
        projected_health_score = min(100.0, base_health_score + (capacity_delta / 400)) # roughly 1 point per 10 headcount buffer
    else:
        projected_health_score = max(0.0, base_health_score + (capacity_delta / 200)) # drops faster when understaffed
        
    delivery_risk = "High" if projected_health_score < 70 else "Low"
    gaps_closed = int(req.training_budget / 50000)
    
    # Narrative
    if projected_health_score > base_health_score + 5:
        narrative = f"Strong scenario. By hiring {hires} new resources and closing {gaps_closed} skill gaps, your team is well positioned to absorb the {req.new_projects} new projects while reducing burnout risk. However, run rate increases by ₹{(projected_run_rate - base_run_rate):,.0f}."
    elif projected_health_score < base_health_score - 5:
        narrative = f"High Risk scenario. While attrition saves ₹{attrition_savings:,.0f}, losing {attritions} people while adding {req.new_projects} new projects pushes utilization past safe limits, severely impacting delivery health."
    else:
        narrative = f"Balanced scenario. The {hires} new hires offset the {attritions} departures. The {req.new_projects} new projects are absorbed with minimal impact to overall workforce health."

    return {
        "baseline": {
            "headcount": base_headcount,
            "capacity": base_capacity,
            "run_rate": base_run_rate,
            "health_score": round(base_health_score, 1)
        },
        "projected": {
            "headcount": projected_headcount,
            "capacity": projected_capacity,
            "run_rate": projected_run_rate,
            "health_score": round(projected_health_score, 1)
        },
        "cost_breakdown": {
            "hiring_cost": hiring_cost,
            "attrition_savings": attrition_savings,
            "severance_cost": severance_cost,
            "training_cost": req.training_budget
        },
        "narrative": narrative,
        "delivery_impact": delivery_risk,
        "skill_gap_impact": f"Closed ~{gaps_closed} skill gaps via training."
    }


# 10. Predictive Attrition Radar
@router.get("/intelligence/attrition-radar")
def get_attrition_radar(db: Session = Depends(get_db)):
    # Mock data for top 5 flight risk employees
    return [
        {"name": "Arjun Patel", "role": "Senior Cloud Architect", "riskScore": 92, "reason": "Overutilized (115%) for 14 weeks. Compensation below market P75."},
        {"name": "Priya Sharma", "role": "Backend Engineer", "riskScore": 88, "reason": "Isolated in Team Chemistry matrix. Only 1 recorded collaboration."},
        {"name": "Michael Chen", "role": "Data Scientist", "riskScore": 84, "reason": "High burnout indicator. Working on 3 simultaneous critical projects."},
        {"name": "Sarah Jones", "role": "DevOps Engineer", "riskScore": 79, "reason": "Key skill bottleneck (Kubernetes). High stress environment."},
        {"name": "Amit Kumar", "role": "Frontend Lead", "riskScore": 75, "reason": "Stagnant role progression. No new skill certifications in 2 years."}
    ]

# 11. Global Talent Heatmap
@router.get("/intelligence/locations")
def get_locations(db: Session = Depends(get_db)):
    # Realistic data for talent hubs with geo-coordinates
    return [
        {"id": "BLR", "name": "Bangalore", "coordinates": [77.5946, 12.9716], "employees": 185, "utilization": 88, "risk": "High"},
        {"id": "NY", "name": "New York", "coordinates": [-74.0060, 40.7128], "employees": 95, "utilization": 92, "risk": "Medium"},
        {"id": "LON", "name": "London", "coordinates": [-0.1276, 51.5072], "employees": 120, "utilization": 85, "risk": "Low"},
        {"id": "SFO", "name": "San Francisco", "coordinates": [-122.4194, 37.7749], "employees": 80, "utilization": 95, "risk": "High"},
        {"id": "SGP", "name": "Singapore", "coordinates": [103.8198, 1.3521], "employees": 45, "utilization": 78, "risk": "Low"},
        {"id": "TOK", "name": "Tokyo", "coordinates": [139.6917, 35.6895], "employees": 65, "utilization": 82, "risk": "Low"},
        {"id": "SYD", "name": "Sydney", "coordinates": [151.2093, -33.8688], "employees": 30, "utilization": 90, "risk": "Medium"},
        {"id": "BER", "name": "Berlin", "coordinates": [13.4050, 52.5200], "employees": 55, "utilization": 85, "risk": "Low"},
        {"id": "PAR", "name": "Paris", "coordinates": [2.3522, 48.8566], "employees": 40, "utilization": 88, "risk": "Medium"},
        {"id": "TOR", "name": "Toronto", "coordinates": [-79.3832, 43.6532], "employees": 75, "utilization": 80, "risk": "Low"},
        {"id": "AUS", "name": "Austin", "coordinates": [-97.7431, 30.2672], "employees": 85, "utilization": 94, "risk": "High"},
        {"id": "SEA", "name": "Seattle", "coordinates": [-122.3321, 47.6062], "employees": 110, "utilization": 91, "risk": "Medium"},
        {"id": "TLV", "name": "Tel Aviv", "coordinates": [34.7818, 32.0853], "employees": 35, "utilization": 97, "risk": "High"},
        {"id": "DUB", "name": "Dublin", "coordinates": [-6.2603, 53.3498], "employees": 60, "utilization": 84, "risk": "Low"},
        {"id": "GRU", "name": "Sao Paulo", "coordinates": [-46.6333, -23.5505], "employees": 25, "utilization": 89, "risk": "Medium"},
        {"id": "BOM", "name": "Mumbai", "coordinates": [72.8777, 19.0760], "employees": 140, "utilization": 86, "risk": "Medium"},
        {"id": "AMS", "name": "Amsterdam", "coordinates": [4.9041, 52.3676], "employees": 50, "utilization": 81, "risk": "Low"},
        {"id": "SEL", "name": "Seoul", "coordinates": [126.9780, 37.5665], "employees": 45, "utilization": 83, "risk": "Low"},
        {"id": "DXB", "name": "Dubai", "coordinates": [55.2708, 25.2048], "employees": 20, "utilization": 75, "risk": "Low"},
        {"id": "CPT", "name": "Cape Town", "coordinates": [18.4232, -33.9249], "employees": 15, "utilization": 92, "risk": "Medium"},
        {"id": "LAX", "name": "Los Angeles", "coordinates": [-118.2437, 34.0522], "employees": 88, "utilization": 89, "risk": "Medium"},
        {"id": "CHI", "name": "Chicago", "coordinates": [-87.6298, 41.8781], "employees": 65, "utilization": 82, "risk": "Low"},
        {"id": "BOS", "name": "Boston", "coordinates": [-71.0589, 42.3601], "employees": 105, "utilization": 94, "risk": "High"},
        {"id": "ATL", "name": "Atlanta", "coordinates": [-84.3880, 33.7490], "employees": 55, "utilization": 86, "risk": "Low"},
        {"id": "DEN", "name": "Denver", "coordinates": [-104.9903, 39.7392], "employees": 40, "utilization": 81, "risk": "Low"},
        {"id": "YVR", "name": "Vancouver", "coordinates": [-123.1207, 49.2827], "employees": 50, "utilization": 85, "risk": "Low"},
        {"id": "YUL", "name": "Montreal", "coordinates": [-73.5673, 45.5017], "employees": 35, "utilization": 88, "risk": "Medium"},
        {"id": "MEX", "name": "Mexico City", "coordinates": [-99.1332, 19.4326], "employees": 45, "utilization": 91, "risk": "Medium"},
        {"id": "BOG", "name": "Bogota", "coordinates": [-74.0721, 4.7110], "employees": 20, "utilization": 79, "risk": "Low"},
        {"id": "EZE", "name": "Buenos Aires", "coordinates": [-58.3816, -34.6037], "employees": 25, "utilization": 84, "risk": "Low"},
        {"id": "MAD", "name": "Madrid", "coordinates": [-3.7038, 40.4168], "employees": 40, "utilization": 87, "risk": "Medium"},
        {"id": "FCO", "name": "Rome", "coordinates": [12.4964, 41.9028], "employees": 25, "utilization": 80, "risk": "Low"},
        {"id": "ARN", "name": "Stockholm", "coordinates": [18.0686, 59.3293], "employees": 55, "utilization": 92, "risk": "High"},
        {"id": "WAW", "name": "Warsaw", "coordinates": [21.0122, 52.2297], "employees": 45, "utilization": 89, "risk": "Medium"},
        {"id": "PEK", "name": "Beijing", "coordinates": [116.4074, 39.9042], "employees": 110, "utilization": 95, "risk": "High"},
        {"id": "PVG", "name": "Shanghai", "coordinates": [121.4737, 31.2304], "employees": 130, "utilization": 88, "risk": "High"},
        {"id": "HKG", "name": "Hong Kong", "coordinates": [114.1694, 22.3193], "employees": 70, "utilization": 84, "risk": "Medium"},
        {"id": "TPE", "name": "Taipei", "coordinates": [121.5654, 25.0330], "employees": 50, "utilization": 86, "risk": "Low"},
        {"id": "CGK", "name": "Jakarta", "coordinates": [106.8456, -6.2088], "employees": 30, "utilization": 81, "risk": "Low"},
        {"id": "MNL", "name": "Manila", "coordinates": [120.9842, 14.5995], "employees": 45, "utilization": 85, "risk": "Medium"},
        {"id": "VTZ", "name": "Visakhapatnam", "coordinates": [83.2185, 17.6868], "employees": 75, "utilization": 92, "risk": "High"},
        {"id": "VGA", "name": "Vijayawada", "coordinates": [80.6480, 16.5062], "employees": 50, "utilization": 87, "risk": "Medium"},
        {"id": "GNT", "name": "Guntur", "coordinates": [80.4365, 16.3067], "employees": 35, "utilization": 84, "risk": "Low"},
        {"id": "NLR", "name": "Nellore", "coordinates": [79.9865, 14.4426], "employees": 20, "utilization": 78, "risk": "Low"},
        {"id": "KNL", "name": "Kurnool", "coordinates": [78.0373, 15.8281], "employees": 15, "utilization": 80, "risk": "Low"},
        {"id": "RJA", "name": "Rajahmundry", "coordinates": [81.8040, 17.0005], "employees": 25, "utilization": 82, "risk": "Medium"},
        {"id": "TIR", "name": "Tirupati", "coordinates": [79.4192, 13.6288], "employees": 40, "utilization": 85, "risk": "Low"},
        {"id": "KND", "name": "Kakinada", "coordinates": [82.2475, 16.9891], "employees": 22, "utilization": 81, "risk": "Low"},
        {"id": "ATP", "name": "Anantapur", "coordinates": [77.6006, 14.6819], "employees": 18, "utilization": 76, "risk": "Low"},
        {"id": "KDP", "name": "Kadapa", "coordinates": [78.8242, 14.4673], "employees": 12, "utilization": 79, "risk": "Low"}
    ]


