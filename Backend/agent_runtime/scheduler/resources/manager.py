class ResourceReservationManager:
    def __init__(self):
        self.locked_resources = {} # resource_id -> workflow_id
        
    def request_lock(self, resource_id: str, workflow_id: str):
        if resource_id in self.locked_resources and self.locked_resources[resource_id] != workflow_id:
            return {"success": False, "reason": f"Resource {resource_id} is already locked by {self.locked_resources[resource_id]}"}
        self.locked_resources[resource_id] = workflow_id
        return {"success": True}
        
    def release_lock(self, resource_id: str, workflow_id: str):
        if self.locked_resources.get(resource_id) == workflow_id:
            del self.locked_resources[resource_id]