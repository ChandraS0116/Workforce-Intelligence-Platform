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