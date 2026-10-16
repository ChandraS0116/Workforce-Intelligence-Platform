from typing import List, Callable, Dict, Any
import datetime

class Event:
    def __init__(self, name: str, source: str, payload: Dict[str, Any]):
        self.name = name
        self.source = source
        self.payload = payload
        self.timestamp = datetime.datetime.now().isoformat()

class EventBus:
    def __init__(self):
        self.subscribers = {}
        self.history = []
        
    def subscribe(self, event_name: str, callback: Callable):
        if event_name not in self.subscribers:
            self.subscribers[event_name] = []
        self.subscribers[event_name].append(callback)
        
    def publish(self, event: Event):
        self.history.append(event)
        if event.name in self.subscribers:
            for cb in self.subscribers[event.name]:
                cb(event)