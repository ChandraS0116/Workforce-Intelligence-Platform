from ..base.agent_base import AgentBase

class ExecutiveDecisionAgent(AgentBase):
    def __init__(self, runtime):
        super().__init__(runtime, "Executive Decision Agent")
        
    def perceive(self, context):
        self.context = context
        
    def reason(self):
        self.confidence = 0.95
        
    def plan(self):
        pass
        
    def invoke_tools(self):
        self.runtime.tool_registry.invoke("Analytics Tool", {}, self.runtime)
        
    def execute(self):
        self.runtime.event_bus.publish(None) # Mock publish