class WorkflowExporter:
    @staticmethod
    def export(runtime) -> dict:
        # Serializes the entire runtime state into the exact JSON 
        # required by enterprise-orchestration-center.html
        return {
            "template": runtime.template,
            "execution": runtime.execution_context,
            "phases": runtime.phases,
            "nodes": runtime.nodes,
            "edges": runtime.edges,
            "ledger": runtime.ledger,
            "metrics": runtime.metrics
        }