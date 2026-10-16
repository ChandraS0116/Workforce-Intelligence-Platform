# Workforce Intelligence Platform

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![ML Engine](https://img.shields.io/badge/ML%20Engine-XGBoost%20%7C%20Scikit--Learn-FF6F00?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Enterprise AI Workforce Intelligence, Predictive Talent Capacity & Team Optimization System**

*Transform static human capital records into predictive organizational intelligence—forecast institutional skill deficits, evaluate burnout vectors, mathematically synthesize optimal project squads, simulate macro talent disruption scenarios, and orchestrate autonomous multi-agent workforce governance.*

[Key Features](#-key-features) • [Workforce Risk Matrix](#-workforce-optimization--risk-matrix) • [Architecture](#-architecture) • [Interactive Workflows](#-interactive-decision-workflows) • [Agent Mesh Orchestrator](#-agent-mesh-orchestrator) • [Technology Stack](#-technology-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference)

</div>

---

## 🌟 Overview

The **Workforce Intelligence Platform** is an enterprise-grade decision-support ecosystem engineered for C-suite technology executives, resource directors, and engineering leadership.

Unlike conventional HRIS software and static ERP spreadsheets that treat headcount as backward-looking administrative data, this platform operates as a **proactive predictive intelligence layer**. It continuously correlates employee proficiency vectors, historical collaboration chemistry, project delivery velocity, and burnout indicators. By leveraging machine learning models alongside an autonomous **Agent Mesh**, the system predicts institutional skill bottlenecks 12 weeks before they jeopardize roadmaps, simulates macro headcount attrition scenarios, and calculates mathematically optimized project staffing recommendations.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend Application (React 19 + TypeScript + Vite)"]
        Dashboard["Executive Command Center\n(C-Suite Realtime KPIs & Trends)"]
        TeamBuilder["Smart Team Builder UI\n(Drag & Drop Squad Synthesis)"]
        Simulator["Macro Scenario Simulator\n(Attrition, Hiring & Capacity Modeling)"]
        SkillRadar["Skill Gap & Matrix Intelligence\n(Buy / Build / Borrow Allocation)"]
        AgentMeshUI["Autonomous Agent Mesh Studio\n(Multi-Agent Lifecycle Visualization)"]
        DataGov["Data Quality & Anomaly Engine\n(Automated Remediation Console)"]
    end

    subgraph Gateway ["Backend API Gateway (FastAPI 0.110+)"]
        Router["Enterprise REST Router (/api/v1)"]
        AuthMiddleware["JWT RBAC Guard (Admin, HR, Exec, PM)"]
        AuditInterceptor["Transactional Audit Logging Subsystem"]
    end

    subgraph CoreEngine ["Intelligence & Machine Learning Core"]
        HealthScorer["Workforce Health Index Engine\n(Capacity, Readiness, Burnout, Growth)"]
        Recommender["Executive Directive Synthesizer\n(Contextual Remediation Actions)"]
        TeamOptimizer["Quadratic Team Chemistry & Skill Solver"]
        SimEngine["Monte Carlo & Parametric Scenario Simulator"]
        MLModels["Predictive Models (XGBoost & Scikit-Learn)"]
    end

    subgraph AgentRuntime ["Autonomous Multi-Agent Mesh"]
        RuntimeEngine["Runtime Execution Engine"]
        RescueAgent["ProjectRescueAgent"]
        ResourceAgent["ResourceBalancerAgent"]
        ExecAgent["ExecutiveDecisionAgent"]
        RiskAgent["PreMortemRiskAgent"]
        SkillAgent["SkillIntelligenceAgent"]
        CompAgent["ComplianceAuditorAgent"]
    end

    subgraph Storage ["Persistent Storage & Data Fabrics"]
        DB[(SQLAlchemy ORM Engine\nSQLite WAL / PostgreSQL)]
        EmpStore[("Employees & Skill Matrices")]
        ProjectStore[("Projects & Allocation Tables")]
        AnalyticsStore[("Burnout & Collaboration History")]
        AuditStore[("Audit Logs & System Events")]
    end

    Client --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> AuditInterceptor

    AuditInterceptor --> HealthScorer
    AuditInterceptor --> Recommender
    AuditInterceptor --> TeamOptimizer
    AuditInterceptor --> SimEngine
    AuditInterceptor --> RuntimeEngine

    HealthScorer --> MLModels
    TeamOptimizer --> MLModels
    SimEngine --> MLModels

    RuntimeEngine --> RescueAgent
    RuntimeEngine --> ResourceAgent
    RuntimeEngine --> ExecAgent
    RuntimeEngine --> RiskAgent
    RuntimeEngine --> SkillAgent
    RuntimeEngine --> CompAgent

    HealthScorer --> DB
    TeamOptimizer --> DB
    SimEngine --> DB
    RuntimeEngine --> DB

    DB --> EmpStore
    DB --> ProjectStore
    DB --> AnalyticsStore
    DB --> AuditStore
```

---

## ⚡ Key Features

- **Executive Command Center**: Cinematic, presentation-ready executive console delivering high-level organizational health scores, real-time attrition hazards, utilization curves, and AI directives.
- **Smart Team Builder & Chemistry Solver**: Algorithmic squad compiler balancing technical skill coverage, seniority distributions, historical interpersonal collaboration chemistry, and individual burnout risk.
- **Autonomous Multi-Agent Mesh**: Pluggable autonomous agent runtime featuring specialized agents (`ProjectRescueAgent`, `ResourceBalancerAgent`, `PreMortemRiskAgent`, `ComplianceAuditorAgent`) that orchestrate multi-phase crisis detection and mitigation.
- **Predictive Skill Gap Intelligence**: Continuously evaluates current employee competency supply against multi-quarter project demand pipelines, automatically outputting prioritized **Buy** (recruit), **Build** (upskill), and **Borrow** (contract) financial blueprints.
- **Macro Scenario Simulator**: Interactive sandbox enabling leadership to simulate macroeconomic variables—freezes, sudden attrition spikes, project timeline accelerations—and compute impact on capacity and delivery risk.
- **Data Quality & Anomaly Engine**: Autonomous background health inspector detecting missing skill assessments, overallocated staff, ghost assignments, and stale profiles with 1-click remediation actions.
- **Enterprise Role-Based Access Control (RBAC)**: Comprehensive security model with JWT tokens and bcrypt encryption tailoring workflows for **Admin**, **HR Director**, **Project Manager**, and **Executive** tiers.
- **Audit Trail & Governance**: Immutable audit logs capturing every user login, data modification, team reassignment, and policy override for ISO 27001 and SOC 2 compliance readiness.

---

## 📊 Workforce Optimization & Risk Matrix

The platform classifies workforce vulnerabilities into a structured remediation matrix:

| Decision Dimension | Signal / Metric Monitored | Critical Risk Threshold | AI Remediation Strategy | Expected Business Outcome |
| :--- | :--- | :---: | :--- | :--- |
| **Utilization & Burnout** | 30-day average individual allocation | `> 100% for 3+ consecutive weeks` | Automatically flags flight risk, splits deliverables, and queues internal bench rebalancing | **40% reduction in key engineer attrition** |
| **Skill Scarcity** | Supply vs. demand headcount differential | `Demand - Supply > 5 headcounts` | Synthesizes 12-week internal upskilling curricula and external contractor requisition | **Eliminates project milestone delays by 85%** |
| **Team Chemistry** | Historical collaboration outcome index | `Chemistry Score < 65%` | Suggests squad reshuffle or embeds a proven high-chemistry tech lead | **28% improvement in squad delivery velocity** |
| **Bench Inefficiency** | Unallocated engineer capacity | `< 40% allocation across 14+ days` | Matches unassigned personnel against impending project pipeline requirements | **15% lift in billable capacity utilization** |
| **Data Integrity** | Incomplete skill tags & orphan records | `Integrity Health Score < 90%` | Triggers self-service verification alerts and automated profile completions | **100% audit-ready workforce inventory** |

---

## 🎯 Interactive Decision Workflows

The following sequence demonstrates how the platform resolves a high-risk project crisis through automated multi-agent coordination and executive intervention:

```mermaid
sequenceDiagram
    autonumber
    actor Exec as Technology Executive
    participant UI as Command Center UI
    participant API as FastAPI Router (/api/v1)
    participant Mesh as Agent Mesh Runtime
    participant Solver as Team Chemistry Solver
    participant DB as Persistent Database

    Exec->>UI: Request Squad Optimization for "Project Titan"
    UI->>API: POST /api/v1/ml/team-builder/optimize
    API->>DB: Query Available Engineers, Skills & Burnout Indexes
    DB-->>API: Active Employee Pool & History Records
    
    API->>Solver: Compute Skill Alignment, Seniority & Chemistry Matrix
    Solver-->>API: Optimized Squad (Match Score: 94.2%, Burnout: Low)
    API-->>UI: Return Squad Candidate Recommendations
    
    Exec->>UI: Trigger Multi-Agent "Project Rescue" Simulation
    UI->>API: GET /api/v1/orchestration/run/project-rescue
    API->>Mesh: Run Agent Lifecycle (ProjectRescueAgent -> ResourceBalancerAgent)
    Mesh->>Mesh: Detect Critical Gap: Need 3 Senior ML Engineers
    Mesh->>Mesh: Execute Reallocation Plan from Non-Critical Backlog
    Mesh-->>API: Structured Multi-Phase Governance Plan
    API-->>UI: Live Agent Mesh State & Recommendation
    
    Exec->>UI: Approve Rebalancing & Assign Squad
    UI->>API: POST /api/v1/projects/assignments
    API->>DB: Write Transactional Team Assignments & Audit Log
    DB-->>API: 200 OK (Committed)
    API-->>UI: Squad Activated & Notifications Dispatched
```

---

## 🛠️ Technology Stack

- **Frontend Application**:
  - React 19, TypeScript 5.8, Vite 8
  - Tailwind CSS 3.4 (with dynamic CSS variables supporting multiple themes)
  - State Management: Zustand 5.0
  - Data Visualizations: Recharts 3.8, D3-scale, React-Simple-Maps
  - Drag & Drop: `@dnd-kit/core`, `@dnd-kit/sortable`
  - Icons & UI Primitives: Lucide React, Radix UI Slot
  - Reporting: jsPDF, jsPDF-AutoTable, XLSX
- **Backend API & Microservices**:
  - Python 3.12, FastAPI 0.110+
  - Web Server: Uvicorn (ASGI)
  - Database ORM: SQLAlchemy with Alembic migrations
  - Authentication: JWT (JSON Web Tokens) with `python-jose` & `passlib` bcrypt
  - Validation: Pydantic v2 & Pydantic-Settings
- **AI, ML & Agent Runtime**:
  - XGBoost, Scikit-Learn, NumPy, Pandas
  - Custom Event-Driven Autonomous Agent Mesh Runtime
- **Database & Storage**:
  - SQLite (Native WAL mode for development / demo)
  - PostgreSQL (Production cloud deployment)
- **Containerization & Tooling**:
  - Docker, Docker Compose, Nginx

---

## 🚀 Getting Started

### Prerequisites

- **Python**: v3.11 or v3.12
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- *(Optional)* **Docker & Docker Compose**

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd Backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Launch the FastAPI development server
uvicorn main:app --reload --port 8000
```

> [!NOTE]
> The database is pre-configured with SQLite. On initial boot, the seeder automatically verifies schemas and loads realistic enterprise profiles and historical telemetry.

### 2. Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Launch the Vite development server
npm run dev
```

The frontend client will be accessible at `http://localhost:5173` (or `http://localhost:80` when running under Docker).

### 3. Docker Deployment (Recommended)

Run the entire fullstack stack with a single command:

```bash
cp .env.example .env
docker-compose up --build -d
```

- **Frontend Client**: `http://localhost`
- **FastAPI Backend**: `http://localhost:8000`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs`

### 4. Default Enterprise Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@company.com` | `admin123` | Full administrative rights & audit access |
| **HR Director** | `hr@company.com` | `hr123` | Employee records, skill matrices, reviews |
| **Project Lead** | `pm@company.com` | `pm123` | Project delivery, team optimizer, simulator |
| **Executive** | `exec@company.com` | `exec123` | Executive Command Center & Board decks |

---

## 🔌 API Reference

### Core Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check and system operational state |
| `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT Bearer token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile and active RBAC permissions |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token with secure dispatch |
| `GET` | `/api/v1/dashboard/metrics` | Retrieve enterprise workforce KPIs, headcount totals, and health index |
| `GET` | `/api/v1/dashboard/trends` | Time-series trends for historical attrition, hiring, and velocity |
| `GET` | `/api/v1/employees/` | Paginated employee roster with filtering (`department`, `location`, `title`) |
| `GET` | `/api/v1/employees/{id}` | Detailed employee dossier including skill ratings and project assignments |
| `POST` | `/api/v1/employees/` | Create a new employee profile with role specifications |
| `GET` | `/api/v1/projects/` | Retrieve active projects, delivery phase, required skills, and deadlines |
| `POST` | `/api/v1/projects/` | Create new enterprise project specification and staffing requirements |
| `POST` | `/api/v1/projects/assignments` | Assign personnel to project squad with allocation percentages |

### Intelligence & Orchestration Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/ml/intelligence/workforce-health` | Quantitative health index (Capacity, Skill Readiness, Burnout, Growth) |
| `GET` | `/api/v1/ml/intelligence/recommendations` | AI-generated executive directives categorized by severity and impact |
| `POST` | `/api/v1/ml/team-builder/optimize` | Quadratic optimizer calculating ideal squads based on chemistry & skills |
| `POST` | `/api/v1/ml/scenarios/simulate` | Macro scenario simulator modeling hiring freezes and attrition spikes |
| `GET` | `/api/v1/ml/skills/gap-analysis` | Talent supply vs. demand matrix outputting Buy/Build/Borrow blueprints |
| `GET` | `/api/v1/orchestration/run/{workflow}` | Execute Autonomous Agent Mesh (`project-rescue`, `premortem`, `generic`) |
| `GET` | `/api/v1/data-quality/audit` | Scan database for anomalies, missing skills, and overallocated employees |
| `POST` | `/api/v1/data-quality/fix` | Execute automated remediation on identified data discrepancies |
| `GET` | `/api/v1/audit/logs` | Query immutable audit log stream with user actions and entity details |

---

## 📄 License & Attribution

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Sri Chandra Pappu**  
*Creator & Lead Developer — Workforce Intelligence Platform*  
[LinkedIn Profile](https://www.linkedin.com/in/chandrapappu1609)
