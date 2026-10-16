class ContextBuilder:
    def __init__(self, blackboard, memory):
        self.blackboard = blackboard
        self.memory = memory
        
    def build_context_for_agent(self, agent_id: str, context_type: str):
        # Assemble relevant slice
        context = {}
        if context_type == "project_rescue":
            # Fetch only active project state and relevant history
            context['current_project'] = self.blackboard.read("current_project_state", agent_id)
            context['relevant_history'] = self.memory.semantic.find_similar("rescue_scenarios", limit=5)
            context['policies'] = self.memory.semantic.get_policies("HR_REASSIGNMENT")
            
        return context