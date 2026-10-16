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