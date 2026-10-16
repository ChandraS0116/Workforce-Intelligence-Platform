class ToolRegistry:
    def __init__(self):
        self.tools = {}
        
    def register(self, tool_name: str, metadata: dict, execute_fn):
        # metadata = {"description": "...", "latency_ms": 200, "cost_cents": 2, "permissions": ["DB_READ"], "input_schema": {}}
        self.tools[tool_name] = {
            "metadata": metadata,
            "execute_fn": execute_fn
        }
        
    def discover(self, requirement_keywords: list):
        # Simple discovery logic matching descriptions against keywords
        matches = []
        for name, tool in self.tools.items():
            desc = tool['metadata'].get('description', '').lower()
            if any(k.lower() in desc for k in requirement_keywords):
                matches.append(name)
        return matches
        
    def request_execution(self, tool_name: str, params: dict, context_permissions: list):
        if tool_name not in self.tools:
            return {"error": "Tool not found"}
            
        tool = self.tools[tool_name]
        # Security Sandbox check
        required_perms = tool['metadata'].get('permissions', [])
        for p in required_perms:
            if p not in context_permissions:
                return {"error": f"Security Sandbox Exception: Missing permission {p}"}
                
        return tool['execute_fn'](params)