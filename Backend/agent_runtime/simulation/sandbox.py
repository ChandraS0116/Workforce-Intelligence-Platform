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