import os

base_path = r'D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\Backend\agent_runtime'
files = {}

# 5. Capability Registry
files['registry/capability.py'] = """
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
"""

# 6. Tool Registry with metadata schemas
files['registry/tool.py'] = """
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
"""

# 7. Blackboard & Context Builder
files['blackboard/core.py'] = """
import time

class BlackboardEntry:
    def __init__(self, author: str, content: dict, confidence: float, expires_in_sec: int = 3600):
        self.author = author
        self.content = content
        self.confidence = confidence
        self.timestamp = time.time()
        self.expires_at = self.timestamp + expires_in_sec
        self.consumed_by = []
        self.version = 1
        self.locked = False
        
    def is_expired(self):
        return time.time() > self.expires_at

class Blackboard:
    def __init__(self):
        self.entries = {}
        
    def write(self, key: str, author: str, content: dict, confidence: float = 1.0):
        if key in self.entries and self.entries[key].locked:
            raise Exception("Blackboard entry is locked.")
            
        if key in self.entries:
            # Versioning
            entry = self.entries[key]
            entry.content = content
            entry.confidence = confidence
            entry.version += 1
            entry.timestamp = time.time()
        else:
            self.entries[key] = BlackboardEntry(author, content, confidence)
            
    def read(self, key: str, consumer: str = None):
        entry = self.entries.get(key)
        if entry and not entry.is_expired():
            if consumer and consumer not in entry.consumed_by:
                entry.consumed_by.append(consumer)
            return entry
        return None
        
    def lock(self, key: str):
        if key in self.entries:
            self.entries[key].locked = True
"""

files['context/engine.py'] = """
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
"""

for file_path, code in files.items():
    full_path = os.path.join(base_path, file_path)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(code.strip() + "\\n")

print("Generated Layers 5-7 algorithms.")
