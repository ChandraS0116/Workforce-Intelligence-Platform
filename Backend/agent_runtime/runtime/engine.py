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