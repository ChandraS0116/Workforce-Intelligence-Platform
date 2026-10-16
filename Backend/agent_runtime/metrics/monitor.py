import time

class RuntimeMetrics:
    def __init__(self):
        self.latencies = {}
        
    def start_timer(self, metric_name: str):
        self.latencies[metric_name] = {"start": time.time(), "end": None}
        
    def end_timer(self, metric_name: str):
        if metric_name in self.latencies:
            self.latencies[metric_name]["end"] = time.time()
            return self.latencies[metric_name]["end"] - self.latencies[metric_name]["start"]
        return 0