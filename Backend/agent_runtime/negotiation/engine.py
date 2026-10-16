# Placed in the agent_runtime root or a specific folder (will create negotiation/ in root)
class NegotiationEngine:
    def __init__(self):
        self.active_negotiations = {}
        
    def request_consensus(self, topic: str, proposals: list, voters: list):
        # proposals = [{"agent": "Project Rescue", "plan": PlanA, "confidence": 0.91, "weight": 0.7}]
        # voters = list of agents participating in the vote
        
        scores = {}
        for prop in proposals:
            # Mathematical Weighted Confidence
            weighted_score = prop['confidence'] * prop.get('weight', 1.0)
            scores[prop['agent']] = weighted_score
            
        best_agent = max(scores, key=scores.get)
        
        # Check for Veto
        for voter in voters:
            if voter.get("can_veto") and voter.get("veto_triggered_for") == best_agent:
                return {"consensus": False, "reason": f"Vetoed by {voter['name']}", "escalate_to": "ExecutiveAgent"}
                
        return {"consensus": True, "winner": best_agent, "winning_score": scores[best_agent]}