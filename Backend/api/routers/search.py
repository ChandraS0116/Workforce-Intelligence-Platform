from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Any, Optional
from core.database import get_db
from models.employee import Employee
from models.organization import Department
from models.projects import Project
from models.skills import Skill

router = APIRouter(prefix="/api/v1/search", tags=["Search"])

@router.get("")
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    results = []
    search_term = f"%{q}%"

    # Search Employees
    emps = db.query(Employee).filter(
        or_(
            Employee.name.ilike(search_term),
            Employee.email.ilike(search_term),
            Employee.role.ilike(search_term)
        )
    ).limit(5).all()
    for e in emps:
        results.append({
            "id": e.id,
            "type": "Employee",
            "title": e.name,
            "subtitle": f"{e.role} • {e.email}",
            "link": f"/employees/{e.id}"
        })

    # Search Projects
    projects = db.query(Project).filter(
        or_(
            Project.name.ilike(search_term),
            Project.status.ilike(search_term)
        )
    ).limit(5).all()
    for p in projects:
        results.append({
            "id": p.id,
            "type": "Project",
            "title": p.name,
            "subtitle": f"Status: {p.status}",
            "link": f"/projects/{p.id}"
        })

    # Search Skills
    skills = db.query(Skill).filter(Skill.name.ilike(search_term)).limit(5).all()
    for s in skills:
        results.append({
            "id": s.id,
            "type": "Skill",
            "title": s.name,
            "subtitle": f"Category: {s.category}",
            "link": f"/skills"
        })

    # Search Departments
    depts = db.query(Department).filter(Department.name.ilike(search_term)).limit(5).all()
    for d in depts:
        results.append({
            "id": d.id,
            "type": "Department",
            "title": d.name,
            "subtitle": "Department",
            "link": f"/departments" # if there's a page
        })

    return {"results": results}
