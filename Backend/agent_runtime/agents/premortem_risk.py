from ..base.agent_base import AgentBase

class PreMortemRiskAgent(AgentBase):
    def __init__(self, runtime):
        super().__init__(runtime, "Pre-Mortem Risk Agent")
        
    def perceive(self, context):
        pass
        
    def reason(self):
        self.confidence = 0.92
        
    def plan(self):
        pass
        
    def invoke_tools(self):
        pass
        
    def execute(self):
        pass