import os
import json

base_path = r'D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Backend\agent_runtime'
files = {}

# 11. Resource Reservation (Global Locking)
os.makedirs(os.path.join(base_path, 'scheduler', 'resources'), exist_ok=True)
files['scheduler/resources/manager.py'] = """
class ResourceReservationManager:
    def __init__(self):
        self.locked_resources = {} # resource_id -> workflow_id
        
    def request_lock(self, resource_id: str, workflow_id: str):
        if resource_id in self.locked_resources and self.locked_resources[resource_id] != workflow_id:
            return {"success": False, "reason": f"Resource {resource_id} is already locked by {self.locked_resources[resource_id]}"}
        self.locked_resources[resource_id] = workflow_id
        return {"success": True}
        
    def release_lock(self, resource_id: str, workflow_id: str):
        if self.locked_resources.get(resource_id) == workflow_id:
            del self.locked_resources[resource_id]
"""

# 12. Transaction Manager (Distributed Rollback)
files['scheduler/transaction.py'] = """
class TransactionManager:
    def __init__(self):
        self.history = []
        
    def log_action(self, run_id: str, step_id: str, reverse_action_fn):
        self.history.append({
            "run_id": run_id,
            "step_id": step_id,
            "reverse": reverse_action_fn
        })
        
    def rollback(self, run_id: str):
        # Pop actions for this run_id in reverse order and execute them
        rollbacks = [h for h in self.history if h['run_id'] == run_id]
        for action in reversed(rollbacks):
            try:
                action['reverse']()
            except Exception as e:
                print(f"Failed to rollback step {action['step_id']}: {e}")
"""

# 13. Explainability & Metrics
files['explainability/ledger.py'] = """
import time

class ExplainabilityLedger:
    def __init__(self):
        self.decisions = []
        
    def record_decision(self, node_id, evidence, reasoning, alternatives, chosen, expected_outcome):
        self.decisions.append({
            "timestamp": time.time(),
            "node_id": node_id,
            "evidence": evidence,
            "reasoning": reasoning,
            "alternatives_rejected": alternatives,
            "chosen_option": chosen,
            "expected_outcome": expected_outcome,
            "actual_outcome": None # Filled later by Learning Engine
        })
"""

files['metrics/monitor.py'] = """
import time

class RuntimeMetrics:
    def __init__(self):
        self.latencies = {}
        
    def start_timer(self, metric_name: str):
        self.latencies[metric_name] = {"start": time.time(), "end": None}
        
    def end_timer(self, metric_name: str):
        if metric_name in self.latencies:
            self.latencies[metric_name]["end"] = time.time()
            return self.latencies[metric_name]["end"] - self.latencies[metric_name]["start"]
        return 0
"""

# 14. Learning Engine (Outcome updates)
os.makedirs(os.path.join(base_path, 'learning'), exist_ok=True)
with open(os.path.join(base_path, 'learning', '__init__.py'), 'w') as f: pass

files['learning/engine.py'] = """
class LearningEngine:
    def __init__(self, capability_registry, explainability_ledger):
        self.registry = capability_registry
        self.ledger = explainability_ledger
        
    def process_workflow_outcome(self, run_id: str, success: bool, kpi_achieved: bool):
        # Look up all agents that participated
        # Adjust their historical_success rankings in the Capability Registry
        # Example:
        adjustment = 0.05 if (success and kpi_achieved) else -0.10
        print(f"Adjusting agent capability rankings by {adjustment} based on outcome of {run_id}")
        
        # Update Explainability Ledger with Actual Outcome
        for decision in self.ledger.decisions:
            if not decision.get("actual_outcome"):
                decision["actual_outcome"] = "Success" if success else "Failure"
"""

for file_path, code in files.items():
    full_path = os.path.join(base_path, file_path)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + "\\n")

print("Generated Layers 11-14 algorithms.")
