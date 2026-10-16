import random
from datetime import datetime, timedelta
from core.database import SessionLocal
from models.audit import AuditLog
from models.auth import User

db = SessionLocal()
admin = db.query(User).filter_by(role='Admin').first()

actions = [
    ('EMPLOYEE_ADDED', 'Employee', '{"message": "Onboarded new Data Engineer"}'),
    ('EMPLOYEE_UPDATED', 'Employee', '{"message": "Updated skill proficiency for Python"}'),
    ('PROJECT_CREATED', 'Project', '{"message": "Initiated Cloud Migration Phase 3"}'),
    ('PROJECT_UPDATED', 'Project', '{"message": "Adjusted timeline and increased required budget"}'),
    ('TEAM_ASSIGNED', 'Assignment', '{"message": "Assigned 3 engineers to Project Alpha"}'),
    ('TEAM_REMOVED', 'Assignment', '{"message": "Removed contractor from active project"}'),
    ('INTELLIGENCE_FORECAST_RUN', 'System', '{"message": "Generated 90-day capacity forecast"}'),
    ('SETTINGS_UPDATED', 'System', '{"message": "Updated global allocation thresholds"}'),
    ('DATA_QUALITY_SCAN', 'System', '{"message": "Detected 5 anomalies in employee data"}'),
    ('EMPLOYEE_CERT_ADDED', 'Employee', '{"message": "Added AWS Solutions Architect certification"}'),
]

now = datetime.utcnow()
for i in range(40):
    action, entity_type, details = random.choice(actions)
    timestamp = now - timedelta(hours=random.randint(1, 48), minutes=random.randint(0, 59))
    log = AuditLog(
        user_id=admin.id if admin else 1,
        action=action,
        entity_type=entity_type,
        entity_id=random.randint(1, 100),
        details=details,
        created_at=timestamp
    )
    db.add(log)

db.commit()
print('Seeded 40 audit logs.')
