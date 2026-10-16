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