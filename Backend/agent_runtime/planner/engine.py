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