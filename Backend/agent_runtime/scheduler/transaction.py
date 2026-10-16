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