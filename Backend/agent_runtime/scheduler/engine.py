from .state import ExecutionStateMachine, WorkflowState
from .resolver import DependencyResolver

class ExecutionScheduler:
    def __init__(self, planner, resolver):
        self.planner = planner
        self.resolver = resolver
        self.active_workflows = {}
        
    def start_workflow(self, run_id, goal, template):
        sm = ExecutionStateMachine(run_id)
        self.active_workflows[run_id] = {"state_machine": sm, "dag": None}
        
        sm.transition(WorkflowState.PLANNING, "Initiating planning phase")
        
        try:
            dag = self.planner.generate_dag(goal, template)
            self.active_workflows[run_id]["dag"] = dag
            
            # Resolve dependencies
            exec_order = self.resolver.resolve(dag)
            self.active_workflows[run_id]["execution_order"] = exec_order
            
            sm.transition(WorkflowState.WAITING, "DAG generated and resolved")
            
        except Exception as e:
            sm.transition(WorkflowState.FAILED, f"Planning Failed: {str(e)}")
            
        return sm.get_snapshot()