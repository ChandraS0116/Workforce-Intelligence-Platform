from typing import Dict, Any, Optional
from abc import ABC, abstractmethod

class AgentBase(ABC):
    def __init__(self, runtime, name: str):
        self.runtime = runtime
        self.name = name
        self.id = name.lower().replace(" ", "_")
        self.confidence = 0.0
        self.status = "Pending"
    
    @abstractmethod
    def perceive(self, context: Dict[str, Any]) -> None:
        pass
        
    @abstractmethod
    def reason(self) -> None:
        pass
        
    @abstractmethod
    def plan(self) -> None:
        pass
        
    @abstractmethod
    def invoke_tools(self) -> None:
        pass
        
    def request_approval(self) -> bool:
        return True # Default to auto-approve
        
    @abstractmethod
    def execute(self) -> None:
        pass