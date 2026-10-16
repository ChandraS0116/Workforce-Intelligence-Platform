from fastapi import APIRouter
import time

from agent_runtime.runtime.engine import RuntimeEngine
from agent_runtime.agents.executive import ExecutiveDecisionAgent
from agent_runtime.agents.project_rescue import ProjectRescueAgent
from agent_runtime.agents.premortem_risk import PreMortemRiskAgent
from agent_runtime.agents.skill_intelligence import SkillIntelligenceAgent
from agent_runtime.agents.compliance_auditor import ComplianceAuditorAgent
from agent_runtime.agents.workforce_planning import WorkforcePlanningAgent
from agent_runtime.agents.resource_balancer import ResourceBalancerAgent

router = APIRouter(prefix="/api/v1/orchestration", tags=["Agent Mesh Orchestrator"])

@router.get("/run/{workflow_type}")
def run_workflow(workflow_type: str):
    runtime = RuntimeEngine()
    
    if workflow_type == "project-rescue":
        runtime.template = {"name": "Project Rescue Workflow", "version": "2.3"}
        
        # Instantiate Agents
        rescue_agent = ProjectRescueAgent(runtime)
        resource_agent = ResourceBalancerAgent(runtime)
        exec_agent = ExecutiveDecisionAgent(runtime)
        
        runtime.register_agent(rescue_agent)
        runtime.register_agent(resource_agent)
        runtime.register_agent(exec_agent)
        
        # Setup specific nodes for visualization
        runtime.phases = ["Phase 1 - Detection", "Phase 2 - Planning", "Phase 3 - Governance"]
        runtime.nodes = [
            {"id": rescue_agent.id, "label": rescue_agent.name, "phase": "Phase 1 - Detection", "status": "Completed", "confidence": rescue_agent.confidence},
            {"id": resource_agent.id, "label": resource_agent.name, "phase": "Phase 2 - Planning", "status": "Completed", "confidence": resource_agent.confidence},
            {"id": exec_agent.id, "label": exec_agent.name, "phase": "Phase 3 - Governance", "status": "Running", "confidence": exec_agent.confidence}
        ]
        
        runtime.edges = [
            {"source": rescue_agent.id, "target": resource_agent.id, "label": "Resource Allocation Requested"},
            {"source": resource_agent.id, "target": exec_agent.id, "label": "Allocation Plan Ready"}
        ]
        
        # Run Lifecycle
        runtime.run_agent_lifecycle(rescue_agent.id, {"crisis": "Project Titan Failing"})
        runtime.run_agent_lifecycle(resource_agent.id, {"allocation": "Need 3 ML Engineers"})
        runtime.run_agent_lifecycle(exec_agent.id, {"review": "Approval Requested"})
        
    elif workflow_type == "premortem":
        runtime.template = {"name": "Pre-Mortem Risk Analysis", "version": "1.1"}
        risk_agent = PreMortemRiskAgent(runtime)
        runtime.register_agent(risk_agent)
        
        runtime.phases = ["Phase 1 - Analysis"]
        runtime.nodes = [{"id": risk_agent.id, "label": risk_agent.name, "phase": "Phase 1 - Analysis", "status": "Completed", "confidence": risk_agent.confidence}]
        
        runtime.run_agent_lifecycle(risk_agent.id, {"brief": "New 12-month NLP Project"})
        
    else:
        # Generic multi-agent boot
        skill_agent = SkillIntelligenceAgent(runtime)
        comp_agent = ComplianceAuditorAgent(runtime)
        workforce_agent = WorkforcePlanningAgent(runtime)
        
        runtime.register_agent(skill_agent)
        runtime.register_agent(comp_agent)
        runtime.register_agent(workforce_agent)
        
        runtime.phases = ["Data Ingestion", "Analysis"]
        runtime.nodes = [
            {"id": skill_agent.id, "label": skill_agent.name, "phase": "Data Ingestion", "status": "Completed", "confidence": skill_agent.confidence},
            {"id": comp_agent.id, "label": comp_agent.name, "phase": "Analysis", "status": "Completed", "confidence": comp_agent.confidence},
            {"id": workforce_agent.id, "label": workforce_agent.name, "phase": "Analysis", "status": "Completed", "confidence": workforce_agent.confidence}
        ]
        runtime.edges = [
            {"source": skill_agent.id, "target": workforce_agent.id, "label": "Profile Updated"},
            {"source": skill_agent.id, "target": comp_agent.id, "label": "Audit Required"}
        ]
        
        runtime.run_agent_lifecycle(skill_agent.id, {"profile": "LinkedIn Update"})
        runtime.run_agent_lifecycle(comp_agent.id, {"policy": "Check Budget Allocation"})
        runtime.run_agent_lifecycle(workforce_agent.id, {"forecast": "Hiring Plan 2027"})
        
    return runtime.export_json()
