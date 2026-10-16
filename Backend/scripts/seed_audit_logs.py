import sys
import os
import random
import json
from datetime import datetime, timedelta

# Add parent directory to path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.database import SessionLocal
from models.audit import AuditLog
from models.auth import User

db = SessionLocal()

# Check if users exist
user = db.query(User).first()
if not user:
    user = User(email="admin@algoleap.com", name="Admin Manager", hashed_password="fake")
    db.add(user)
    db.commit()
    db.refresh(user)

user_id = user.id

actions = [
    ("UPDATE_PROJECT_BUDGET", "PROJECT", "Increased budget for Q3 AI Initiative"),
    ("ASSIGN_EMPLOYEE", "PROJECT", "Assigned Sarah Jenkins to Project Titan"),
    ("CREATE_EMPLOYEE", "EMPLOYEE", "Onboarded new Data Scientist: Michael Chang"),
    ("GENERATE_REPORT", "INTELLIGENCE", "Exported Weekly Executive Summary PDF"),
    ("TRIGGER_FORECAST", "FORECAST", "Ran 180-day capacity projection"),
    ("UPDATE_SKILL", "EMPLOYEE", "Added 'React' to James Smith's skill matrix"),
    ("PROMOTE_EMPLOYEE", "EMPLOYEE", "Promoted Emily Davis to Lead Engineer"),
    ("ARCHIVE_PROJECT", "PROJECT", "Archived completed Project Alpha"),
    ("MODIFY_RBAC", "SYSTEM", "Granted Manager access to John Doe"),
    ("SIMULATE_SCENARIO", "INTELLIGENCE", "Simulated 'Aggressive Hiring' scenario"),
    ("REVIEW_ATTRITION", "INTELLIGENCE", "Reviewed flight risk for David Lee"),
    ("SCHEDULE_REPORT", "SYSTEM", "Scheduled Monthly Skill Gap report to executive@algoleap.com")
]

# Create 60 realistic logs over the last 3 days
logs_to_add = []
now = datetime.utcnow()
for i in range(60):
    action, entity_type, msg = random.choice(actions)
    
    # generate random time between now and 3 days ago
    random_minutes = random.randint(1, 4320)
    created = now - timedelta(minutes=random_minutes)
    
    details = json.dumps({"message": msg, "user_agent": "Mozilla/5.0", "ip": f"192.168.1.{random.randint(1, 255)}"})
    
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=random.randint(100, 999),
        details=details,
        created_at=created
    )
    logs_to_add.append(log)

# Sort them to insert sequentially, though created_at determines UI sort
logs_to_add.sort(key=lambda x: x.created_at)

for log in logs_to_add:
    db.add(log)

db.commit()
print("Seeded 60 realistic audit logs.")
