import os

base_path = r'D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Backend\agent_runtime'

files = {}

# --- BASE ---
files['base/agent_base.py'] = """
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

class AgentBase(ABC):
    def __init__(self, runtime, name: str):
        self.runtime = runtime
        self.name = name
        self.id = name.lower().replace(" ", "_")
        self.confidence = 0.0
        self.status = "Pending"
    
    @abstractmethod
    def perceive(self, context: Dict[str, Any]) -> None:
        pass
        
    @abstractmethod
    def reason(self) -> None:
        pass
        
    @abstractmethod
    def plan(self) -> None:
        pass
        
    @abstractmethod
    def invoke_tools(self) -> None:
        pass
        
    def request_approval(self) -> bool:
        return True # Default to auto-approve
        
    @abstractmethod
    def execute(self) -> None:
        pass
"""

files['base/tool_base.py'] = """
from abc import ABC, abstractmethod

class ToolBase(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        
    @abstractmethod
    def execute(self, params: dict) -> dict:
        pass
"""

files['base/memory_base.py'] = """
class MemoryBase:
    def __init__(self):
        self.state = {}
        
    def set(self, key: str, value: Any):
        self.state[key] = value
        
    def get(self, key: str) -> Any:
        return self.state.get(key)
"""

# --- EVENTS ---
files['events/event_bus.py'] = """
from typing import List, Callable, Dict, Any
import datetime

class Event:
    def __init__(self, name: str, source: str, payload: Dict[str, Any]):
        self.name = name
        self.source = source
        self.payload = payload
        self.timestamp = datetime.datetime.now().isoformat()

class EventBus:
    def __init__(self):
        self.subscribers = {}
        self.history = []
        
    def subscribe(self, event_name: str, callback: Callable):
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        self.subscribers[event_name].append(callback)
        
    def publish(self, event: Event):
        self.history.append(event)
        if event.name in self.subscribers:
            for cb in self.subscribers[event.name]:
                cb(event)
"""

# --- MEMORY ---
files['memory/memory_manager.py'] = """
from ..base.memory_base import MemoryBase

class WorkingMemory(MemoryBase):
    pass
    
class SharedMemory(MemoryBase):
    pass
"""

# --- TOOLS ---
files['tools/registry.py'] = """
from ..base.tool_base import ToolBase
import time

class ToolRegistry:
    def __init__(self):
        self.tools = {}
        
    def register(self, tool: ToolBase):
        self.tools[tool.name] = tool
        
    def invoke(self, name: str, params: dict, runtime) -> dict:
        if name in self.tools:
            start = time.time()
            result = self.tools[name].execute(params)
            duration = (time.time() - start) * 1000
            
            # Log to runtime
            runtime.log_tool_call({
                "tool": name,
                "params": params,
                "duration_ms": duration,
                "result": result
            })
            return result
        return {"error": "Tool not found"}

class DummyTool(ToolBase):
    def execute(self, params: dict) -> dict:
        import random
        return {"status": "success", "records": random.randint(10, 50)}
"""

# --- APPROVAL ---
files['approval/engine.py'] = """
class ApprovalEngine:
    def request(self, agent_name: str, context: dict) -> dict:
        # Mocking human approval
        return {"status": "Approved", "by": "Executive VP"}
"""

# --- SERIALIZATION ---
files['serialization/exporter.py'] = """
class WorkflowExporter:
    @staticmethod
    def export(runtime) -> dict:
        # Serializes the entire runtime state into the exact JSON 
        # required by enterprise-orchestration-center.html
        return {
            "template": runtime.template,
            "execution": runtime.execution_context,
            "phases": runtime.phases,
            "nodes": runtime.nodes,
            "edges": runtime.edges,
            "ledger": runtime.ledger,
            "metrics": runtime.metrics
        }
"""

# --- RUNTIME ---
files['runtime/engine.py'] = """
from ..events.event_bus import EventBus
from ..tools.registry import ToolRegistry, DummyTool
from ..approval.engine import ApprovalEngine
from ..serialization.exporter import WorkflowExporter
from ..memory.memory_manager import SharedMemory
import time

class RuntimeEngine:
    def __init__(self):
        self.event_bus = EventBus()
        self.tool_registry = ToolRegistry()
        self.approval_engine = ApprovalEngine()
        self.shared_memory = SharedMemory()
        self.agents = {}
        
        # UI Export State
        self.template = {"name": "Dynamic Workflow", "version": "1.0"}
        self.execution_context = {"runId": f"RUN-{int(time.time())}", "status": "Running"}
        self.phases = []
        self.nodes = []
        self.edges = []
        self.ledger = []
        self.metrics = {"duration": "0s", "toolCalls": 0}
        
        # Register standard tools
        self.tool_registry.register(DummyTool("HR Database", "Fetch HR data"))
        self.tool_registry.register(DummyTool("Budget Engine", "Check budgets"))
        
    def register_agent(self, agent):
        self.agents[agent.id] = agent
        
    def log_tool_call(self, call: dict):
        self.metrics["toolCalls"] += 1
        
    def run_agent_lifecycle(self, agent_id: str, context: dict):
        agent = self.agents.get(agent_id)
        if not agent:
            return
            
        agent.status = "Running"
        self.ledger.append({"time": "now", "agent": agent.name, "action": "Initialized", "result": "OK"})
        
        agent.perceive(context)
        agent.reason()
        agent.plan()
        agent.invoke_tools()
        
        if agent.request_approval():
            agent.execute()
            
        agent.status = "Completed"
        
    def export_json(self):
        return WorkflowExporter.export(self)
"""

for file_path, code in files.items():
    full_path = os.path.join(base_path, file_path)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + "\\n")

print("Created Core Framework files.")
