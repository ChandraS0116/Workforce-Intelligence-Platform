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