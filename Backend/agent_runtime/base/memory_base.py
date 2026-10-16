from typing import Any

class MemoryBase:
    def __init__(self):
        self.state = {}
        
    def set(self, key: str, value: Any):
        self.state[key] = value
        
    def get(self, key: str) -> Any:
        return self.state.get(key)