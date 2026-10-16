from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import random
import math

router = APIRouter(prefix="/api/v1/intelligence", tags=["Enterprise Intelligence"])

# 1. 3D ONA
@router.get("/ona")
def get_ona_graph():
    # Deterministic generation for the 3D Network
    nodes = []
    links = []
    
    # Create 3 main clusters (Engineering, Sales, Product)
    clusters = ["Engineering", "Sales", "Product", "Executive"]
    
    for i in range(100):
        cluster = random.choice(clusters)
        
        # Calculate a fake Betweenness Centrality
        # Hubs get high centrality
        is_hub = random.random() > 0.9
        centrality = random.uniform(0.7, 1.0) if is_hub else random.uniform(0.01, 0.3)
        
        # Risk score calculation
        attrition_prob = random.uniform(0.1, 0.9) if is_hub else random.uniform(0.0, 0.5)
        risk_score = centrality * attrition_prob * 100 # Financial impact proxy
        
        nodes.append({
            "id": str(i),
            "name": f"Employee {i}",
            "group": cluster,
            "centrality": centrality,
            "is_hub": is_hub,
            "attrition_prob": attrition_prob,
            "risk_score": risk_score,
            "val": 10 if is_hub else random.uniform(2, 5) # Node size
        })
        
    for i in range(100):
        # Intra-cluster connections (high probability)
        for j in range(i+1, 100):
            if nodes[i]["group"] == nodes[j]["group"] and random.random() > 0.85:
                links.append({"source": str(i), "target": str(j), "value": random.uniform(0.5, 2.0)})
            # Inter-cluster connections via hubs
            elif (nodes[i]["is_hub"] or nodes[j]["is_hub"]) and random.random() > 0.95:
                links.append({"source": str(i), "target": str(j), "value": random.uniform(2.0, 5.0)})

    return {
        "nodes": nodes,
        "links": links,
        "metrics": {
            "resilience_score": 84.5,
            "modularity_q": 0.62,
            "density": len(links) / (100 * 99)
        }
    }

# 2. 9-Box Talent Grid
@router.get("/talent-grid")
def get_talent_grid():
    employees = []
    for i in range(40):
        performance = random.uniform(0, 1) # 0 to 1
        flight_risk = random.uniform(0, 1) # 0 to 1
        
        # Map to 3x3 Grid
        # X: Risk (Low, Med, High) -> 0, 1, 2
        # Y: Performance (Low, Med, High) -> 0, 1, 2
        x = min(2, math.floor(flight_risk * 3))
        y = min(2, math.floor(performance * 3))
        
        # SHAP Explainability
        shap_values = [
            {"feature": "Compa-Ratio", "impact": random.uniform(-0.3, 0.4)},
            {"feature": "Months in Role", "impact": random.uniform(0.1, 0.5)},
            {"feature": "Manager Attrition", "impact": random.uniform(-0.1, 0.2)}
        ]
        
        employees.append({
            "id": f"emp_{i}",
            "name": f"Employee {i}",
            "performance": performance,
            "flight_risk": flight_risk,
            "grid_x": x,
            "grid_y": y,
            "shap_values": sorted(shap_values, key=lambda k: abs(k['impact']), reverse=True)
        })
        
    return {"employees": employees}

# 3. Resource Conflict Resolver
@router.get("/conflicts")
def get_resource_conflicts():
    # Return Critical Path DAG and conflict blocks
    tasks = []
    for i in range(20):
        start = random.randint(0, 14) # Days from today
        duration = random.randint(2, 7)
        tasks.append({
            "id": f"task_{i}",
            "name": f"Task {i}",
            "project": random.choice(["Project Titan", "Project Apollo", "Project Athena"]),
            "start_day": start,
            "duration": duration,
            "critical_path": random.random() > 0.7,
            "resource": random.choice(["Alice", "Bob", "Charlie", "Diana"]),
            "conflict": False
        })
        
    # Inject a deterministic conflict
    tasks[0] = {
        "id": "task_0", "name": "API Design", "project": "Project Titan",
        "start_day": 2, "duration": 5, "critical_path": True, "resource": "Alice", "conflict": True
    }
    tasks[1] = {
        "id": "task_1", "name": "DB Migration", "project": "Project Apollo",
        "start_day": 3, "duration": 4, "critical_path": False, "resource": "Alice", "conflict": True
    }
    
    return {
        "tasks": tasks,
        "monte_carlo_p85_delay": 4.2 # days
    }

# 4. Compensation Matrix
@router.get("/compensation")
def get_compensation_matrix():
    data = []
    for i in range(150):
        compa_ratio = random.normalvariate(0.95, 0.15) # Mean 0.95, SD 0.15
        risk = random.uniform(0, 100)
        
        # Correlate risk slightly with low compa ratio
        if compa_ratio < 0.85:
            risk = random.uniform(60, 100)
            
        base_salary = random.uniform(80000, 200000)
        market_mid = base_salary / max(0.5, compa_ratio)
        
        replacement_cost = base_salary * 1.5
        eca = (risk / 100) * replacement_cost
        
        data.append({
            "id": f"c_{i}",
            "name": f"Employee {i}",
            "department": random.choice(["Engineering", "Sales", "Marketing"]),
            "compa_ratio": round(compa_ratio, 2),
            "risk_score": round(risk, 1),
            "base_salary": round(base_salary),
            "market_mid": round(market_mid),
            "eca": round(eca)
        })
        
    return {"data": data}
