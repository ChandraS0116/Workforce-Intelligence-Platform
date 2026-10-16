from collections import defaultdict

class DependencyResolver:
    def resolve(self, dag):
        nodes = {n['id']: n for n in dag['nodes']}
        edges = dag['edges']
        
        in_degree = {n_id: 0 for n_id in nodes}
        graph = defaultdict(list)
        
        for edge in edges:
            u, v = edge['source'], edge['target']
            graph[u].append(v)
            in_degree[v] += 1
            
        # Detect cycles using Kahn's algorithm
        queue = [n_id for n_id, deg in in_degree.items() if deg == 0]
        visited = 0
        execution_order = []
        
        while queue:
            u = queue.pop(0)
            execution_order.append(u)
            visited += 1
            
            for v in graph[u]:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)
                    
        if visited != len(nodes):
            raise Exception("Cycle detected in DAG. Cannot execute.")
            
        return execution_order