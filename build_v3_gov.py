import os

base_path = r'D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Backend\agent_runtime'
files = {}

# 8. Policy Engine (Constraint Solver)
files['policy/engine.py'] = """
class PolicyViolation(Exception):
    pass

class PolicyEngine:
    def __init__(self):
        self.policies = []
        
    def load_policies(self, rules: list):
        self.policies = rules
        
    def validate_plan_branch(self, branch_actions: list, context: dict):
        # Pre-execution constraint evaluation
        for action in branch_actions:
            if action.get("type") == "reassign_employee":
                emp_id = action.get("employee_id")
                # e.g. Evaluate "Key personnel cannot be reassigned without VP approval"
                if context.get("employee_metadata", {}).get(emp_id, {}).get("tier") == "key_personnel":
                    return {"valid": False, "reason": f"Policy Violation: Cannot reassign key personnel {emp_id} without escalation."}
                    
            if action.get("type") == "budget_allocation":
                amount = action.get("amount", 0)
                if amount > context.get("available_budget", 0):
                    return {"valid": False, "reason": "Policy Violation: Insufficient budget."}
                    
        return {"valid": True, "reason": "Passed all policy constraints."}
"""

# 9. Simulation Sandbox
files['simulation/sandbox.py'] = """
import random

class SimulationSandbox:
    def __init__(self):
        pass
        
    def simulate_plan(self, plan: dict, current_state: dict):
        # Calculate KPI Deltas against mocked state
        # In a real enterprise system, this uses Monte Carlo or ML prediction models
        
        cost_delta = sum([a.get('estimated_cost', 0) for a in plan.get('actions', [])])
        delay_delta = max([a.get('duration_days', 0) for a in plan.get('actions', [])], default=0)
        
        # Simulate burnout reduction
        burnout_reduction = random.uniform(5.0, 15.0) if plan.get("type") == "load_balancing" else 0.0
        
        roi = (burnout_reduction * 10000) / (cost_delta + 1) # Dummy ROI formula
        
        return {
            "delay_days_added": delay_delta,
            "cost_incurred": cost_delta,
            "burnout_delta": -burnout_reduction,
            "roi": round(roi, 2)
        }
"""

# 10. Negotiation Engine
files['negotiation/engine.py'] = """
# Placed in the agent_runtime root or a specific folder (will create negotiation/ in root)
class NegotiationEngine:
    def __init__(self):
        self.active_negotiations = {}
        
    def request_consensus(self, topic: str, proposals: list, voters: list):
        # proposals = [{"agent": "Project Rescue", "plan": PlanA, "confidence": 0.91, "weight": 0.7}]
        # voters = list of agents participating in the vote
        
        scores = {}
        for prop in proposals:
            # Mathematical Weighted Confidence
            weighted_score = prop['confidence'] * prop.get('weight', 1.0)
            scores[prop['agent']] = weighted_score
            
        best_agent = max(scores, key=scores.get)
        
        # Check for Veto
        for voter in voters:
            if voter.get("can_veto") and voter.get("veto_triggered_for") == best_agent:
                return {"consensus": False, "reason": f"Vetoed by {voter['name']}", "escalate_to": "ExecutiveAgent"}
                
        return {"consensus": True, "winner": best_agent, "winning_score": scores[best_agent]}
"""

# Note: Negotiation directory was not explicitly in the earlier list but was implicitly requested as a first-class engine. 
# We'll create it now.
os.makedirs(os.path.join(base_path, 'negotiation'), exist_ok=True)
with open(os.path.join(base_path, 'negotiation', '__init__.py'), 'w') as f: pass

for file_path, code in files.items():
    full_path = os.path.join(base_path, file_path)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + "\\n")

print("Generated Layers 8-10 algorithms.")
