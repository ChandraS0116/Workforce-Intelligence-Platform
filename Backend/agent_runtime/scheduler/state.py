from enum import Enum
import time

class WorkflowState(Enum):
    CREATED = "Created"
    PLANNING = "Planning"
    WAITING = "Waiting"
    RUNNING = "Running"
    BLOCKED = "Blocked"
    NEGOTIATING = "Negotiating"
    SIMULATION = "Simulation"
    APPROVAL = "Approval"
    EXECUTING = "Executing"
    COMPLETED = "Completed"
    FAILED = "Failed"
    RECOVERED = "Recovered"
    ARCHIVED = "Archived"

class ExecutionStateMachine:
    def __init__(self, run_id):
        self.run_id = run_id
        self.state = WorkflowState.CREATED
        self.transitions = []
        
    def transition(self, new_state: WorkflowState, reason: str = ""):
        # Enforce valid state transitions (omitted full matrix for brevity)
        old_state = self.state
        self.state = new_state
        self.transitions.append({
            "timestamp": time.time(),
            "from": old_state.value,
            "to": new_state.value,
            "reason": reason
        })
        return True
        
    def get_snapshot(self):
        return {"run_id": self.run_id, "current_state": self.state.value, "history": self.transitions}