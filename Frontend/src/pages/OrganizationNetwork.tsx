import { useState, useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { Play, CheckCircle2, Terminal, ShieldCheck, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

const PROJECT_AGENTS = [
    "Signal Agent",
    "Integration Agent",
    "Data Quality Agent"
];

const AGENT_NOTES: Record<string, string> = {
    "Signal Agent": "Captures raw external triggers and intent signals from HR systems via Algoleap Temporal Anomaly Engine.",
    "Integration Agent": "Bridges Workforce Intelligence and synthetic source data via RoBERTa NER & R-GCN Graph Resolution.",
    "Data Quality Agent": "Validates and cleans ingested HR data, inferring missing skills from Jira/GitHub via AWFM-13B Transformer."
};

const NAMES = ["Amit Kumar", "Arjun Patel", "Sarah Jones", "Priya Sharma", "David Chen", "Vikram Malhotra"];
const REPOS = ["algoleap-workforce-frontend", "workforce-intelligence-core", "temporal-anomaly-engine", "enterprise-hris-sync"];
const SKILLS = ["React 19", "TypeScript", "Python 3.12", "Kubernetes", "GraphQL API", "Sentence Transformers"];

const FLOWCHART_CSS = `
  .flowchart-container {
    --border-color: #cbd5e1;
    --text-muted: #64748b;
    --text-main: #0f172a;
    --accent: #2563eb;
    --status-running: #d97706;
    --status-completed: #059669;
    --blue: #2563eb;
    --border: #e2e8f0;
    
    font-family: inherit;
    padding: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    color: var(--text-main);
  }

  .flowchart {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 960px;
    position: relative;
  }

  .agent-layer {
    border: 1px dashed var(--border-color);
    border-radius: 14px;
    padding: 26px 20px 20px 20px;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background: #f8fafc;
    transition: all 0.3s ease;
  }

  .agent-layer.active-layer {
    border-color: #2563eb;
    background: #eff6ff;
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.1);
  }

  .agent-layer-label {
    position: absolute;
    top: -11px;
    left: 20px;
    background: #ffffff;
    padding: 2px 14px;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #334155;
  }

  .agent-node {
    padding: 16px 32px;
    border-radius: 12px;
    min-width: 280px;
    text-align: center;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 5;
    color: #0f172a;
  }

  .agent-node.idle,
  .agent-node.dimmed {
    opacity: 0.5;
    border: 1px solid var(--border-color);
    background: #ffffff;
    color: #64748b;
  }

  .agent-node.running {
    border: 2px solid var(--status-running);
    background: #fffbeb;
    color: #92400e;
    transform: scale(1.05);
    box-shadow: 0 0 0 6px rgba(217, 119, 6, 0.15);
  }

  .agent-node.completed {
    border: 2px solid var(--status-completed);
    background: #ecfdf5;
    color: #065f46;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
  }

  .agent-node.selected {
    border: 2px solid var(--blue) !important;
    box-shadow: 0 0 15px rgba(37,99,235,0.25);
    opacity: 1;
  }

  /* Animated Glowing Pipes */
  .pipe-container {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .agent-pipe {
    width: 4px;
    height: 100%;
    background: var(--border-color);
    position: relative;
    overflow: hidden;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .agent-pipe.flowing {
    background: #2563eb;
    width: 6px;
    box-shadow: 0 0 12px rgba(37, 99, 235, 0.4);
  }

  .agent-pipe.flowing::after {
    content: '';
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to bottom, transparent, #60a5fa, #1e3a8a);
    animation: flow-beam 0.8s infinite linear;
  }

  @keyframes flow-beam {
    0% { top: -100%; }
    100% { top: 200%; }
  }

  /* Floating Data Packet Badge */
  .data-packet {
    position: absolute;
    background: #1e3a8a;
    color: white;
    font-size: 11px;
    font-weight: 800;
    padding: 5px 14px;
    border-radius: 20px;
    border: 1px solid #60a5fa;
    box-shadow: 0 4px 10px rgba(30, 58, 138, 0.25);
    white-space: nowrap;
    z-index: 10;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .data-packet.show {
    opacity: 1;
    transform: scale(1);
    animation: packet-bounce 1s infinite alternate ease-in-out;
  }

  @keyframes packet-bounce {
    from { transform: translateY(-3px) scale(1); }
    to { transform: translateY(3px) scale(1.02); }
  }

  .critical-wrapper {
    padding: 4px;
    border: 2px solid #dc2626;
    border-radius: 12px;
    animation: pulse-red 2s infinite;
  }

  @keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
    70% { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
    100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
  }

  .agent-popup {
    position: absolute;
    top: 115%;
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    padding: 14px;
    border-radius: 8px;
    background: white;
    color: #0f172a;
    z-index: 100;
    box-shadow: 0 10px 25px rgba(0,0,0,0.18);
    text-align: left;
    font-size: 12px;
    line-height: 1.5;
  }

  .agent-title {
    font-size: 10px;
    text-transform: uppercase;
    font-weight: bold;
    margin-bottom: 6px;
    color: #64748b;
  }
`;

export function OrganizationNetwork() {
  const { t } = useLanguageStore();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Interactive Simulation States
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [simulationStep, setSimulationStep] = useState(0); // 0: Idle, 1: Signal, 2: Integration, 3: Quality, 4: Done
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeLogs, setActiveLogs] = useState<Array<{ step: number; agent: string; text: string }>>([]);
  const [activePacket1, setActivePacket1] = useState("");
  const [activePacket2, setActivePacket2] = useState("");
  const [activeResult, setActiveResult] = useState("");

  // Dynamic Generator State
  const [seed, setSeed] = useState(1);

  const generateEventPayload = (idx: number, s: number) => {
    const randId = (10000 + ((s * 49381) % 89999)).toString();
    const empId = (100 + ((s * 19382) % 899)).toString();
    const name = NAMES[(s + idx) % NAMES.length];
    const timeStr = new Date().toISOString();

    if (idx === 0) {
      const lines = 2000 + ((s * 3921) % 5000);
      const skill = SKILLS[(s + idx) % SKILLS.length];
      const repo = REPOS[(s + idx) % REPOS.length];
      return {
        event_id: `evt_git_${randId}`,
        employee_name: name,
        timestamp: timeStr,
        source: "GitHub_Enterprise_VPC",
        author: `dev-${name.toLowerCase().replace(" ", "")}`,
        repository: repo,
        pull_request: `#${100 + ((s * 123) % 800)}`,
        lines_added: lines,
        extracted_tokens: [skill, "System Architecture", "Unit Tests", "Code Optimization"]
      };
    } else if (idx === 1) {
      const oldBase = 140 + ((s * 31) % 30);
      const newBase = oldBase + 15 + ((s * 13) % 20);
      const ratio = (0.88 + (((s * 7) % 12) / 100)).toFixed(2);
      return {
        event_id: `evt_wd_${randId}`,
        employee_name: name,
        timestamp: timeStr,
        source: "Workday_HRIS_Prod",
        employee_id: `EMP-00${empId}`,
        action: "SALARY_MERIT_ADJUSTMENT",
        previous_base: `INR ${oldBase},00,000`,
        new_base: `INR ${newBase},00,000`,
        new_compa_ratio: parseFloat(ratio),
        department: "Engineering - Cloud Infrastructure"
      };
    } else {
      const tickets = 12 + ((s * 3) % 8);
      const hours = (2.0 + (((s * 11) % 20) / 10)).toFixed(1);
      return {
        event_id: `evt_jira_${randId}`,
        employee_name: name,
        timestamp: timeStr,
        source: "Jira_Enterprise_VPC",
        user_email: `${name.toLowerCase().replace(" ", ".")}@algoleap.com`,
        action: "TICKET_BURST_CLOSURE",
        tickets_resolved: tickets,
        timespan_hours: parseFloat(hours),
        component: "Kubernetes-Cluster-Autoscaler",
        severity_distribution: { P0_Critical: Math.floor(tickets * 0.3), P1_High: Math.floor(tickets * 0.7) }
      };
    }
  };

  // Editable JSON Textarea State
  const [editableJson, setEditableJson] = useState("");

  useEffect(() => {
    const p = generateEventPayload(selectedSampleIndex, seed);
    setEditableJson(JSON.stringify(p, null, 2));
  }, [selectedSampleIndex, seed]);

  const cleanName = (name: string) => name.split(" [")[0];

  const getAgentState = (name: string) => {
    const clean = cleanName(name);
    if (selectedAgent && selectedAgent !== clean) return "dimmed";
    
    if (simulationStep === 0) return "idle";
    
    if (clean === "Signal Agent") {
      if (simulationStep === 1) return "running";
      if (simulationStep > 1) return "completed";
    }
    if (clean === "Integration Agent") {
      if (simulationStep === 2) return "running";
      if (simulationStep > 2) return "completed";
    }
    if (clean === "Data Quality Agent") {
      if (simulationStep === 3) return "running";
      if (simulationStep > 3) return "completed";
    }
    return "idle";
  };

  const startSimulation = async () => {
    if (isSimulating) return;

    let parsed: any;
    try {
      parsed = JSON.parse(editableJson);
    } catch (e) {
      alert("Invalid JSON format in Box 2! Please ensure your edited JSON is valid syntax before executing.");
      return;
    }

    setIsSimulating(true);
    setSimulationStep(1);

    const evtId = parsed.event_id || "evt_custom_001";
    const src = parsed.source || "External_HRIS";
    
    // Extract employee name cleanly from edited JSON
    let rawName = parsed.employee_name || parsed.author || parsed.user_email || "Custom Employee";
    if (rawName.startsWith("dev-")) rawName = rawName.replace("dev-", "");
    if (rawName.includes("@")) rawName = rawName.split("@")[0].replace(/\./g, " ");
    const formattedName = rawName.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    let logs: Array<{ step: number; agent: string; text: string }> = [];
    let p1 = "";
    let p2 = "";
    let resText = "";
    const empId = Math.floor(100 + Math.random() * 899);

    if (selectedSampleIndex === 0) {
      const author = parsed.author || `dev-${formattedName.toLowerCase().replace(" ", "")}`;
      const lines = parsed.lines_added || 3500;
      const repo = parsed.repository || "enterprise-repo";
      const tokens = Array.isArray(parsed.extracted_tokens) && parsed.extracted_tokens.length > 0 ? parsed.extracted_tokens[0] : "TypeScript";

      p1 = `[RAW PAYLOAD: ${evtId}] -> TRANSLATING SCHEMA`;
      p2 = `[CANONICAL ID #${empId}: ${formattedName.toUpperCase()}] -> INFERRING SKILLS`;
      logs = [
        { step: 1, agent: "Signal Agent", text: `Caught raw input webhook '${evtId}' from ${src}. Calculated velocity anomaly score: 0.14 (Normal). Handing custom payload to Integration Layer...` },
        { step: 2, agent: "Integration Agent", text: `Resolving identity for author '${author}'. Querying relational graph... Matched canonical ID: #${empId} (${formattedName}, Senior Engineer). Normalizing repository metadata...` },
        { step: 3, agent: "Data Quality Agent", text: `Inspecting canonical record #${empId}. Notice: Profile currently lists zero formal proficiency matrices for '${tokens}'.` },
        { step: 3, agent: "Data Quality Agent", text: `Invoking AWFM-13B semantic reasoning: Evaluated ${lines} lines of verified production code in '${repo}'. Cosine similarity against ${tokens} ontology: 0.97.` },
        { step: 3, agent: "Data Quality Agent", text: `AUTONOMOUS INFERENCE EXECUTED: Updating ${formattedName}'s profile -> Added skill '${tokens} (Level 5/5 - Expert)'. Confidence: 98.6%.` },
        { step: 4, agent: "SYSTEM SUCCESS", text: `Canonical HR Database automatically updated with verified skill: ${tokens} (L5).` }
      ];
      resText = `Canonical Record #${empId} (${formattedName}) updated with customized skill: ${tokens} (L5). Zero manual data entry required!`;
    } else if (selectedSampleIndex === 1) {
      const empStr = parsed.employee_id || `EMP-00${empId}`;
      const action = parsed.action || "SALARY_ADJUSTMENT";
      const ratio = parsed.new_compa_ratio || 0.95;
      const newBase = parsed.new_base || "INR 1,80,00,000";

      p1 = `[RAW HRIS EVENT: ${action}] -> RESOLVING ID`;
      p2 = `[CANONICAL RECORD: ${empStr}] -> RECALCULATING RISK`;
      logs = [
        { step: 1, agent: "Signal Agent", text: `Detected compa-ratio modification event '${evtId}' from ${src}. Triggering real-time compensation risk recalculation...` },
        { step: 2, agent: "Integration Agent", text: `Mapping Workday schema '${empStr}' to internal database primary key -> ID #${empId} (${formattedName}). Standardizing salary base '${newBase}' to numerical decimal...` },
        { step: 3, agent: "Data Quality Agent", text: `Validating customized compa-ratio shift to ${ratio} against market midpoint. Cross-referencing L-BFGS Gradient Ascent retention curve...` },
        { step: 3, agent: "Data Quality Agent", text: `Mathematical verification passed. Flight Risk (P_attrition) recalculated for ${formattedName}: Dropping from critical 89.2% -> safe 14.2%. Financial attrition savings locked.` },
        { step: 4, agent: "SYSTEM SUCCESS", text: "Executive Portfolio Command Center dynamically synced with customized flight risk metrics." }
      ];
      resText = `Employee record for ${formattedName} (${empStr}) Flight Risk reduced to 14.2% based on your edited salary parameters.`;
    } else {
      const email = parsed.user_email || `${formattedName.toLowerCase().replace(" ", ".")}@algoleap.com`;
      const tickets = parsed.tickets_resolved || 15;
      const hours = parsed.timespan_hours || 2.5;

      p1 = `[RAW BURST: ${tickets} TICKETS / ${hours} HRS] -> SCORE VELOCITY`;
      p2 = `[CANONICAL EMAIL: ${email}] -> AUDITING BURNOUT`;
      logs = [
        { step: 1, agent: "Signal Agent", text: `WARNING: High-velocity ticket burst detected! User '${email}' (${formattedName}) closed ${tickets} tickets in ${hours} hours. Statistical anomaly score: 0.96 (HIGH).` },
        { step: 2, agent: "Integration Agent", text: `Resolving email '${email}' -> Canonical Employee #${empId} (${formattedName}). Aggregating customized weekly utilization hours...` },
        { step: 3, agent: "Data Quality Agent", text: `Auditing workload saturation for ${formattedName}. Current utilization spiked over critical burnout threshold based on your edited ticket burst speed.` },
        { step: 3, agent: "Data Quality Agent", text: `Triggering proactive intervention protocol: Recommending immediate workload rebalancing on Operational Dashboard.` },
        { step: 4, agent: "SYSTEM SUCCESS", text: `Alert dispatched to Engineering Manager. Burnout risk flagged before delivery failure occurred.` }
      ];
      resText = `High Burnout Anomaly caught in real-time for ${formattedName}! Flagged for immediate sprint offloading.`;
    }

    setActivePacket1(p1);
    setActivePacket2(p2);
    setActiveResult(resText);
    setActiveLogs([logs[0]]);

    // Step 1 -> 2
    await new Promise((r) => setTimeout(r, 1600));
    setSimulationStep(2);
    setActiveLogs((prev) => [...prev, logs[1]]);

    // Step 2 -> 3
    await new Promise((r) => setTimeout(r, 1800));
    setSimulationStep(3);
    const qualityLogs = logs.filter((l) => l.step === 3);
    for (const qLog of qualityLogs) {
      setActiveLogs((prev) => [...prev, qLog]);
      await new Promise((r) => setTimeout(r, 1300));
    }

    // Step 3 -> 4 (Done)
    setSimulationStep(4);
    const finalLog = logs.find((l) => l.step === 4);
    if (finalLog) setActiveLogs((prev) => [...prev, finalLog]);

    // AUTONOMOUS PERSISTENCE: Save the newly customized employee into backend DB & localStorage so it appears in Employee Directory!
    const customId = 9000 + Math.floor(Math.random() * 899);
    const roleStr = selectedSampleIndex === 0 ? "Senior AI Architect" : selectedSampleIndex === 1 ? "Cloud Principal Engineer" : "DevOps Tech Lead";
    const emailStr = `${formattedName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@algoleap.com`;

    const customEmpObj = {
      id: customId,
      name: formattedName,
      display_name: formattedName,
      email: emailStr,
      role: roleStr,
      hire_date: new Date().toISOString().split('T')[0],
      department_id: 1,
      department: { id: 1, name: "AI & Advanced Engineering" },
      skills: [
        { proficiency_level: 95, skill: { id: 1, name: Array.isArray(parsed.extracted_tokens) ? parsed.extracted_tokens[0] : "React 19", category: "Core AI/Dev" } },
        { proficiency_level: 92, skill: { id: 2, name: "TypeScript / Python", category: "Language" } },
        { proficiency_level: 96, skill: { id: 3, name: "Algoleap Enterprise Intelligence Engine", category: "AI Platform" } }
      ],
      certifications: [
        { id: 101, name: "Algoleap Certified Enterprise AI Architect", issue_date: "2025-01-15" }
      ],
      assignments: [
        { id: 201, project_id: 1, role: "Lead Engineer", allocation_percentage: 100, start_date: "2025-06-01" }
      ],
      utilization_history: [
        { date: "2026-03-01", utilization_percentage: 88 },
        { date: "2026-04-01", utilization_percentage: 92 },
        { date: "2026-05-01", utilization_percentage: 95 },
        { date: "2026-06-01", utilization_percentage: 91 }
      ],
      burnout_metrics: [
        { date: "2026-06-30", risk_score: selectedSampleIndex === 2 ? 88.5 : 14.2 }
      ]
    };

    // 1. Store in localStorage for immediate sync across dashboards
    try {
      const existingStorage = JSON.parse(localStorage.getItem("mesh_custom_employees") || "[]");
      const filtered = existingStorage.filter((e: any) => e.name.toLowerCase() !== formattedName.toLowerCase());
      filtered.unshift(customEmpObj);
      localStorage.setItem("mesh_custom_employees", JSON.stringify(filtered));
    } catch (err) {
      console.error("Local sync error", err);
    }

    // 2. Try POSTing to real API backend if available
    try {
      await apiClient.post('/employees', {
        name: formattedName,
        email: emailStr,
        role: roleStr,
        hire_date: new Date().toISOString().split('T')[0],
        department_id: 1
      });
    } catch (err) {
      // If employee already exists or backend offline, localStorage fallback will handle it
    }

    setIsSimulating(false);
  };

  const handleSelectSample = (idx: number) => {
    if (isSimulating) return;
    setSelectedSampleIndex(idx);
    setSimulationStep(0);
    setActiveLogs([]);
  };

  const handleRandomize = () => {
    if (isSimulating) return;
    setSeed((prev) => prev + 1);
    setSimulationStep(0);
    setActiveLogs([]);
  };

  const renderNode = (agentName: string) => {
    const clean = cleanName(agentName);
    const state = getAgentState(agentName);
    const isSelected = selectedAgent === clean;
    const isCritical = PROJECT_AGENTS.includes(clean);

    const nodeContent = (
      <div
        key={agentName}
        className={`agent-node ${state} ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedAgent(isSelected ? null : clean)}
      >
        <span>{t(agentName)}</span>
        <span className="block text-[12px] font-normal opacity-90 mt-1">
          {clean === "Signal Agent" && t("Algoleap Temporal Anomaly Engine")}
          {clean === "Integration Agent" && t("RoBERTa NER & R-GCN Graph Resolution")}
          {clean === "Data Quality Agent" && t("AWFM-13B Transformer Reasoning")}
        </span>

        {isSelected && (
          <div className="agent-popup" style={{ border: isCritical ? "1px solid #dc2626" : "1px solid #2563eb" }}>
            <div className="agent-title">{t("Agent Description")}</div>
            {t(AGENT_NOTES[clean] || "No description available")}
          </div>
        )}
      </div>
    );

    if (isCritical) {
      return (
        <div key={`wrap-${agentName}`} className="critical-wrapper">
          {nodeContent}
        </div>
      );
    }

    return nodeContent;
  };

  return (
    <div className="animate-in fade-in duration-700 pb-12">
      <style>{FLOWCHART_CSS}</style>
      
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("Algoleap Enterprise Intelligence Engine - Agent Mesh")}
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          {t("Interactive simulation of our 100% proprietary, on-premises autonomous 3-agent mesh workflow with randomized and editable ingress data streams.")}
        </p>
      </div>

      {/* Interactive Input Dummy Data Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column: Event Selection */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              1. {t("Select Raw Input Dummy Data (Ingress)")}
            </h2>
            <button
              onClick={handleRandomize}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-background hover:bg-accent/10 text-xs font-bold text-foreground transition-all shadow-sm"
              title={t("Generate new randomized values")}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t("Randomize Input Data Values")}</span>
            </button>
          </div>
          
          <div className="flex flex-col gap-3 flex-grow">
            {[
              { idx: 0, title: "[GitHub PR Merge] Thin HR Profile", desc: "Engineer merges code repository pull request. Zero skill matrices in HRIS." },
              { idx: 1, title: "[Workday HRIS] Promotion & Comp Change", desc: "Manager updates salary compa-ratio for Senior Cloud Architect." },
              { idx: 2, title: "[Jira Enterprise] High-Velocity Ticket Burst", desc: "DevOps Engineer closes multiple P0/P1 Kubernetes tickets in rapid succession." }
            ].map((item) => (
              <button
                key={item.idx}
                onClick={() => handleSelectSample(item.idx)}
                disabled={isSimulating}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedSampleIndex === item.idx
                    ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                    : "border-border bg-card hover:bg-accent/5"
                } ${isSimulating ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="font-extrabold text-sm text-foreground mb-1 flex items-center gap-2">{t(item.title)}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{t(item.desc)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Raw JSON Payload Display & Execute Button (Now Editable!) */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
            <span>2. {t("Raw Input Event Payload (Editable Ingress Box)")}</span>
            <span className="text-xs font-mono text-indigo-500 font-bold">{t("Editable Sandbox - Edit employee_name below!")}</span>
          </h2>

          <textarea
            value={editableJson}
            onChange={(e) => setEditableJson(e.target.value)}
            disabled={isSimulating}
            spellCheck={false}
            rows={12}
            className="bg-slate-950 text-sky-400 p-4 rounded-xl font-mono text-xs overflow-y-auto flex-grow mb-3 border border-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50 w-full resize-y"
          />

          <div className="text-[11px] text-muted-foreground italic mb-4">
            <span>{t("[NOTICE: Edit employee_name above to your name, click execute, and watch it automatically register in Employee Intelligence Directory!]")}</span>
          </div>

          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("Processing Ingress & Visualizing Flow...")}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{t("Inject Input Data & Watch Visual Workflow")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Topography Mesh Visualization with Glowing Pipes */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            3. {t("Live Connected Agent Mesh Topography (Visual Data Flow)")}
          </span>
          <span className={`text-xs font-extrabold uppercase px-3.5 py-1 rounded-full ${
            simulationStep === 0 ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" :
            simulationStep === 4 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 animate-bounce" :
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse"
          }`}>
            {simulationStep === 0 && t("STATUS: IDLE (AWAITING INPUT DATA)")}
            {simulationStep === 1 && t("STATUS: STEP 1/3 - LISTENER CATCHING INPUT")}
            {simulationStep === 2 && t("STATUS: STEP 2/3 - TRANSLATING DATA SCHEMA")}
            {simulationStep === 3 && t("STATUS: STEP 3/3 - AUTONOMOUS REASONING")}
            {simulationStep === 4 && t("STATUS: 100% WORKFLOW COMPLETED")}
          </span>
        </div>

        <div className="flowchart-container bg-background">
          <div className="flowchart">
            
            {/* Layer 1: Signal */}
            <div className={`agent-layer ${simulationStep === 1 ? "active-layer" : ""}`}>
              <div className="agent-layer-label">{t("Layer 1: Sensory Ingress (Raw Event Detection)")}</div>
              <div className="agent-node-row">
                {renderNode("Signal Agent")}
              </div>
            </div>
            
            {/* Glowing Pipe 1 & Floating Packet Badge */}
            <div className="pipe-container">
              <div className={`agent-pipe ${simulationStep >= 2 ? "flowing" : ""}`} />
              <div className={`data-packet ${simulationStep === 2 ? "show" : ""}`}>
                {activePacket1}
              </div>
            </div>
            
            {/* Layer 2: Integration */}
            <div className={`agent-layer ${simulationStep === 2 ? "active-layer" : ""}`}>
              <div className="agent-layer-label">{t("Layer 2: Entity Resolution & Schema Mapping")}</div>
              <div className="agent-node-row">
                {renderNode("Integration Agent")}
              </div>
            </div>
            
            {/* Glowing Pipe 2 & Floating Packet Badge */}
            <div className="pipe-container">
              <div className={`agent-pipe ${simulationStep >= 3 ? "flowing" : ""}`} />
              <div className={`data-packet ${simulationStep === 3 ? "show" : ""}`}>
                {activePacket2}
              </div>
            </div>
            
            {/* Layer 3: Quality */}
            <div className={`agent-layer ${simulationStep === 3 ? "active-layer" : ""}`}>
              <div className="agent-layer-label">{t("Layer 3: Autonomous Reasoning & Skill Inference")}</div>
              <div className="agent-node-row">
                {renderNode("Data Quality Agent")}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Real-Time Autonomous Reasoning Logs Console */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-xl font-mono text-slate-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            4. {t("Real-Time Autonomous Reasoning Logs (Step-by-Step AI Execution)")}
          </span>
          <span className={simulationStep > 0 && simulationStep < 4 ? "text-amber-400 animate-pulse font-extrabold" : "text-emerald-400 font-extrabold"}>
            {simulationStep === 0 ? t("Ready for Ingress") : simulationStep === 4 ? t("Workflow Executed Successfully") : t("Processing Stream...")}
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-3 text-xs pr-2">
          {activeLogs.length === 0 ? (
            <div className="text-slate-500 italic py-4 text-center">
              {t("Select a dummy data input above and click 'Inject Input Data & Watch Visual Workflow' to observe live agentic reasoning.")}
            </div>
          ) : (
            activeLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 bg-slate-900/60 p-2.5 rounded-lg border-l-2 border-slate-700">
                <span className="text-slate-500 shrink-0 font-semibold">{new Date().toLocaleTimeString()}</span>
                <span className={`font-extrabold shrink-0 w-36 ${
                  log.agent.includes("Signal") ? "text-amber-400" :
                  log.agent.includes("Integration") ? "text-sky-400" :
                  log.agent.includes("Quality") ? "text-purple-400" : "text-emerald-400"
                }`}>
                  [{t(log.agent)}]
                </span>
                <span className="text-slate-200">{t(log.text)}</span>
              </div>
            ))
          )}
        </div>

        {simulationStep === 4 && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/60 text-emerald-300 flex items-center gap-3.5 shadow-lg shadow-emerald-900/20 animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-extrabold text-emerald-200">{t("Autonomous Execution Success")}: </span>
              <span className="font-medium">{t(activeResult)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
