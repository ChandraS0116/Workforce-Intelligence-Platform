import os

base_path = r'D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Backend\agent_runtime'
files = {}

# 1. Execution State Machine (inside scheduler/state.py)
files['scheduler/state.py'] = """
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
"""

# 2. Planner Engine (Cost Function & DAG Generation)
files['planner/engine.py'] = """
import uuid

class PlannerEngine:
    def __init__(self, capability_registry):
        self.registry = capability_registry
        
    def optimize_agent_selection(self, required_capabilities):
        # Score = Capability × Availability × Historical Success × Cost × Latency × Confidence
        selected = {}
        for cap in required_capabilities:
            candidates = self.registry.find_agents_for(cap)
            best_agent = None
            best_score = -1.0
            
            for agent in candidates:
                score = (agent['capability_match'] * 
                         agent['availability'] * 
                         agent['historical_success'] * 
                         (1.0 / agent['cost']) * 
                         (1.0 / agent['latency']) * 
                         agent['base_confidence'])
                         
                if score > best_score:
                    best_score = score
                    best_agent = agent
                    
            selected[cap] = best_agent
        return selected

    def generate_dag(self, goal, workflow_template):
        # 1. Capability Discovery
        required = workflow_template.get('required_capabilities', [])
        agents = self.optimize_agent_selection(required)
        
        # 2. Task Decomposition
        nodes = []
        edges = workflow_template.get('edges', [])
        
        for cap, agent in agents.items():
            nodes.append({
                "id": str(uuid.uuid4()),
                "capability": cap,
                "assigned_agent": agent['id'],
                "status": "pending"
            })
            
        return {"nodes": nodes, "edges": edges}
"""

# 3. Dependency Resolver (Cycle detection)
files['scheduler/resolver.py'] = """
from collections import defaultdict

class DependencyResolver:
    def resolve(self, dag):
        nodes = {n['id']: n for n in dag['nodes']}
        edges = dag['edges']
        
        in_degree = {n_id: 0 for n_id in nodes}
        graph = defaultdict(list)
        
        for edge in edges:
            u, v = edge['source'], edge['target']
            graph[u].append(v)
            in_degree[v] += 1
            
        # Detect cycles using Kahn's algorithm
        queue = [n_id for n_id, deg in in_degree.items() if deg == 0]
        visited = 0
        execution_order = []
        
        while queue:
            u = queue.pop(0)
            execution_order.append(u)
            visited += 1
            
            for v in graph[u]:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)
                    
        if visited != len(nodes):
            raise Exception("Cycle detected in DAG. Cannot execute.")
            
        return execution_order
"""

# 4. Scheduler (Orchestrates the layers)
files['scheduler/engine.py'] = """
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
"""

for file_path, code in files.items():
    full_path = os.path.join(base_path, file_path)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + "\\n")

print("Generated core algorithms (Layers 1-4).")
