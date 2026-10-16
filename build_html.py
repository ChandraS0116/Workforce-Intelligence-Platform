import os

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Agent Mesh - Command Center</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- Panzoom library for native graph panning and zooming -->
    <script src="https://unpkg.com/@panzoom/panzoom/dist/panzoom.min.js"></script>
    <style>
        :root {
            /* 4-Color Light Theme */
            --bg-canvas: #f8fafc;
            --bg-panel: #ffffff;
            --border: #e2e8f0;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --accent-blue: #2563eb;
            --accent-green: #10b981;
            --accent-yellow: #f59e0b;
        }
        body { background-color: var(--bg-canvas); color: var(--text-main); font-family: 'Inter', sans-serif; overflow: hidden; }
        .panel { background-color: var(--bg-panel); border: 1px solid var(--border); }
        
        /* Graph Node Animations */
        @keyframes pulse-running {
            0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .node-running { animation: pulse-running 2s infinite; border-color: var(--accent-blue); }
        .node-completed { border-color: var(--accent-green); }
        
        /* Flow Animation */
        @keyframes flow {
            from { stroke-dashoffset: 24; }
            to { stroke-dashoffset: 0; }
        }
        .edge-flow { stroke-dasharray: 4; animation: flow 1s linear infinite; stroke: var(--accent-blue); }
        
        /* Mini-map */
        #minimap-container { position: absolute; bottom: 20px; left: 20px; width: 200px; height: 150px; background: white; border: 1px solid var(--border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    </style>
</head>
<body>
    <div id="root" class="h-screen w-screen flex flex-col"></div>
    
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Mock Initial Data (Would come from /api/v1/orchestration/run/...)
        const MOCK_DATA = {
            template: { name: "Project Rescue & Rebalance", version: "2.3" },
            execution: { runId: "RUN-98242", status: "Running" },
            phases: ["Detection", "Planning", "Governance"],
            nodes: [
                { id: "premortem_risk_agent", label: "Pre-Mortem Risk Agent", phase: "Detection", status: "Completed", confidence: 0.92, tools: ["Project Parser", "Historical Analzyer"], reasoning: "Detected 43% failure probability based on dependency depth." },
                { id: "project_rescue_agent", label: "Project Rescue Agent", phase: "Detection", status: "Completed", confidence: 0.88, tools: ["Burnout Scanner", "Conflict Engine"], reasoning: "Identified severe burnout in DB team. Suggesting immediate resource shift." },
                { id: "resource_balancer_agent", label: "Resource Balancer Agent", phase: "Planning", status: "Completed", confidence: 0.94, tools: ["Allocation Optimizer"], reasoning: "Generated 3 re-allocation scenarios minimizing cost impact." },
                { id: "compliance_auditor_agent", label: "Compliance Auditor Agent", phase: "Governance", status: "Running", confidence: 0.99, tools: ["Policy Engine", "Budget API"], reasoning: "Checking scenario 2 against Q3 budget constraints." },
                { id: "executive_decision_agent", label: "Executive Decision Agent", phase: "Governance", status: "Pending", confidence: 0.0, tools: [], reasoning: "Waiting for compliance clearance." }
            ],
            edges: [
                { source: "premortem_risk_agent", target: "project_rescue_agent", label: "Risk Detected" },
                { source: "project_rescue_agent", target: "resource_balancer_agent", label: "Rescue Requested" },
                { source: "resource_balancer_agent", target: "compliance_auditor_agent", label: "Plan Generated" },
                { source: "compliance_auditor_agent", target: "executive_decision_agent", label: "Approval Required" }
            ],
            events: [
                { time: "09:00:00", agent: "Runtime", event: "WorkflowStarted" },
                { time: "09:00:01", agent: "Pre-Mortem Risk Agent", event: "ToolInvoked: Project Parser" },
                { time: "09:00:15", agent: "Pre-Mortem Risk Agent", event: "DecisionGenerated: High Risk" },
                { time: "09:00:16", agent: "Project Rescue Agent", event: "AgentStarted" }
            ]
        };

        const Canvas = ({ data, selectedNode, setSelectedNode }) => {
            const canvasRef = useRef(null);
            
            useEffect(() => {
                if (canvasRef.current) {
                    const panzoom = Panzoom(canvasRef.current, { maxScale: 3, minScale: 0.3, step: 0.1 });
                    canvasRef.current.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);
                }
            }, []);

            return (
                <div className="flex-1 relative overflow-hidden bg-slate-50" style={{ cursor: 'grab' }}>
                    <div ref={canvasRef} className="absolute inset-0 flex p-20 transform-origin-top-left">
                        {data.phases.map((phase, i) => (
                            <div key={phase} className="flex flex-col mx-10 w-80">
                                <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider text-center">{phase}</h3>
                                <div className="space-y-12 relative z-10">
                                    {data.nodes.filter(n => n.phase === phase).map(node => (
                                        <div 
                                            key={node.id} 
                                            onClick={() => setSelectedNode(node)}
                                            className={`panel p-4 rounded-xl shadow-sm cursor-pointer border-2 transition-all hover:shadow-md
                                                ${node.status === 'Running' ? 'node-running' : ''}
                                                ${node.status === 'Completed' ? 'node-completed' : ''}
                                                ${selectedNode?.id === node.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                                            `}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-semibold text-slate-800">{node.label}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium
                                                    ${node.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                                                    ${node.status === 'Running' ? 'bg-blue-100 text-blue-700' : ''}
                                                    ${node.status === 'Pending' ? 'bg-slate-100 text-slate-600' : ''}
                                                `}>{node.status}</span>
                                            </div>
                                            
                                            {/* Confidence Heatmap bar */}
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden flex">
                                                <div className="bg-emerald-500 h-full" style={{ width: `${node.confidence * 100}%` }}></div>
                                                <div className="bg-amber-400 h-full" style={{ width: `${(1 - node.confidence) * 100}%` }}></div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex justify-between">
                                                <span>Confidence</span>
                                                <span>{Math.round(node.confidence * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        {/* Edges SVG layer */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {/* In a real implementation with known X/Y coordinates, we would draw paths here. For this dynamic flexbox layout, drawing exact SVG lines requires ResizeObserver logic which is omitted for brevity, but the Edge data is passed to the component. */}
                        </svg>
                    </div>
                </div>
            );
        };

        const Inspector = ({ node }) => {
            if (!node) return (
                <div className="w-80 panel border-l flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <i data-lucide="mouse-pointer-click" className="w-12 h-12 mb-4 opacity-50"></i>
                    <p>Select an agent node to inspect its execution memory, tool calls, and reasoning.</p>
                </div>
            );

            return (
                <div className="w-96 panel border-l flex flex-col overflow-y-auto">
                    <div className="p-4 border-b bg-slate-50">
                        <h2 className="font-bold text-lg text-slate-800">{node.label}</h2>
                        <span className="text-xs text-slate-500">Agent ID: {node.id}</span>
                    </div>
                    
                    <div className="p-4 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reasoning Summary</h3>
                            <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-700">
                                {node.reasoning || "Reasoning engine initializing..."}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tools Invoked</h3>
                            <div className="space-y-2">
                                {node.tools?.length > 0 ? node.tools.map(t => (
                                    <div key={t} className="flex items-center text-sm border p-2 rounded bg-white shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                        {t}
                                    </div>
                                )) : <div className="text-sm text-slate-500 italic">No tools invoked yet.</div>}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Approval Checkpoints</h3>
                            {node.phase === "Governance" ? (
                                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-amber-800 text-sm">Human Review Required</span>
                                    </div>
                                    <p className="text-xs text-amber-700 mb-3">Workflow paused pending executive clearance.</p>
                                    <button className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded">View Briefing</button>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 italic">Auto-approved by rules engine.</div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        const EventStream = ({ events }) => (
            <div className="h-48 panel border-t flex flex-col">
                <div className="px-4 py-2 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-sm text-slate-700 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                        Live Event Stream
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-xs border px-2 py-1 rounded hover:bg-slate-100">Filter</button>
                        <button className="text-xs border px-2 py-1 rounded hover:bg-slate-100">Export Logs</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
                    {events.map((e, i) => (
                        <div key={i} className="flex gap-4 p-1.5 hover:bg-slate-50 rounded">
                            <span className="text-slate-400 w-20">{e.time}</span>
                            <span className="text-blue-600 font-semibold w-40 truncate">{e.agent}</span>
                            <span className="text-slate-700">{e.event}</span>
                        </div>
                    ))}
                </div>
            </div>
        );

        const App = () => {
            const [data, setData] = useState(MOCK_DATA);
            const [selectedNode, setSelectedNode] = useState(null);
            const [isFullscreen, setIsFullscreen] = useState(false);

            useEffect(() => {
                lucide.createIcons();
                
                // Simulate real-time backend updates
                const timer = setInterval(() => {
                    setData(prev => {
                        const newData = {...prev};
                        if (newData.nodes[3].status === 'Running') {
                            newData.nodes[3].status = 'Completed';
                            newData.nodes[4].status = 'Running';
                            newData.events.push({ time: new Date().toLocaleTimeString(), agent: "Compliance Auditor", event: "DecisionGenerated: Approved" });
                            newData.events.push({ time: new Date().toLocaleTimeString(), agent: "Executive Decision Agent", event: "ApprovalRequested" });
                        }
                        return newData;
                    });
                }, 8000);
                return () => clearInterval(timer);
            }, []);

            return (
                <div className="flex flex-col h-full bg-slate-100">
                    {/* Header */}
                    <div className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shadow-md z-20">
                        <div className="flex items-center gap-4">
                            <i data-lucide="network" className="w-5 h-5 text-blue-400"></i>
                            <h1 className="font-bold text-lg tracking-wide">Enterprise Agent Mesh <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded ml-2 border border-blue-500/30">RUNTIME</span></h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span>Workflow:</span>
                                <span className="font-bold text-white">{data.template.name} v{data.template.version}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <span>Execution:</span>
                                <span className="font-mono text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded">{data.execution.runId}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-slate-700 rounded"><i data-lucide="search" className="w-4 h-4"></i></button>
                                <button className="p-1.5 hover:bg-slate-700 rounded" onClick={() => {
                                    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                                    else document.exitFullscreen();
                                }}><i data-lucide="maximize" className="w-4 h-4"></i></button>
                            </div>
                        </div>
                    </div>

                    {/* Main Workspace */}
                    <div className="flex-1 flex overflow-hidden">
                        <Canvas data={data} selectedNode={selectedNode} setSelectedNode={setSelectedNode} />
                        <Inspector node={selectedNode} />
                    </div>

                    {/* Minimap overlay (visual mock) */}
                    <div id="minimap-container" className="hidden md:flex flex-col z-10">
                        <div className="bg-slate-100 text-[10px] font-bold p-1 text-center border-b text-slate-500">MINIMAP</div>
                        <div className="flex-1 p-2 relative bg-slate-50 opacity-80 grid grid-cols-3 gap-1">
                            {data.nodes.map(n => <div key={n.id} className={`rounded-sm ${n.status==='Completed'?'bg-emerald-300':n.status==='Running'?'bg-blue-400':'bg-slate-300'}`}></div>)}
                        </div>
                    </div>

                    <EventStream events={data.events} />
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
"""

with open(r'D:\Engineering\Projects\Algoleap\Workforce Intelligence Platform\enterprise-agent-mesh.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
print("Upgraded HTML viewer written successfully.")
