from ..base.tool_base import ToolBase
import time

class ToolRegistry:
    def __init__(self):
        self.tools = {}
        
    def register(self, tool: ToolBase):
        self.tools[tool.name] = tool
        
    def invoke(self, name: str, params: dict, runtime) -> dict:
        if name in self.tools:
            start = time.time()
            result = self.tools[name].execute(params)
            duration = (time.time() - start) * 1000
            
            # Log to runtime
            runtime.log_tool_call({
                "tool": name,
                "params": params,
                "duration_ms": duration,
                "result": result
            })
            return result
        return {"error": "Tool not found"}

class DummyTool(ToolBase):
    def execute(self, params: dict) -> dict:
        import random
        return {"status": "success", "records": random.randint(10, 50)}