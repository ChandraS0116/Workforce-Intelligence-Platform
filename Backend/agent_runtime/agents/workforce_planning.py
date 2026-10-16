from ..base.agent_base import AgentBase

class WorkforcePlanningAgent(AgentBase):
    def __init__(self, runtime):
        super().__init__(runtime, "Workforce Planning Agent")
        
    def perceive(self, context):
        pass
        
    def reason(self):
        self.confidence = 0.85
        
    def plan(self):
        pass
        
    def invoke_tools(self):
        pass
        
    def execute(self):
        pass