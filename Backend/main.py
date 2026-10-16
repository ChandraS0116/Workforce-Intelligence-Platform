from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
from api.routers import (
    ml,
    auth,
    employees,
    projects,
    dashboard,
    skills,
    analytics,
    system,
    notifications,
    audit,
    search,
    data_quality,
    executive,
    enterprise_intelligence,
    agent_mesh,
)

app = FastAPI(
    title="AI Workforce Intelligence Platform API",
    description="Premium Decision Support APIs for Enterprise IT Organizations",
    version="1.0.0"
)

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(projects.router)
app.include_router(dashboard.router)
app.include_router(skills.router)
app.include_router(analytics.router)
app.include_router(ml.router)
app.include_router(system.router)
app.include_router(notifications.router)
app.include_router(audit.router)
app.include_router(search.router)
app.include_router(data_quality.router)
app.include_router(executive.router, prefix="/api/v1/executive", tags=["Executive"])
app.include_router(enterprise_intelligence.router)
app.include_router(agent_mesh.router)
@app.get("/")
def health_check():
    return {
        "status": "online", 
        "system": "AI Workforce Intelligence Platform",
        "mode": "Decision Support"
    }
