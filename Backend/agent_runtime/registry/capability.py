class CapabilityRegistry:
    def __init__(self):
        self.capabilities = {}
        
    def register_agent(self, agent_id: str, cap_profile: dict):
        # cap_profile = {"capabilities": ["risk_analysis", ...], "availability": 1.0, "cost": 50, "historical_success": 0.95}
        for cap in cap_profile['capabilities']:
            if cap not in self.capabilities:
                self.capabilities[cap] = []
            
            # Format candidate specifically for the planner's cost function
            candidate = {
                "id": agent_id,
                "capability_match": 1.0, 
                "availability": cap_profile.get('availability', 1.0),
                "historical_success": cap_profile.get('historical_success', 0.5),
                "cost": cap_profile.get('cost', 100),
                "latency": cap_profile.get('latency', 500),
                "base_confidence": cap_profile.get('base_confidence', 0.8)
            }
            self.capabilities[cap].append(candidate)
            
    def find_agents_for(self, capability: str):
        return self.capabilities.get(capability, [])