from abc import ABC, abstractmethod

class ToolBase(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        
    @abstractmethod
    def execute(self, params: dict) -> dict:
        pass