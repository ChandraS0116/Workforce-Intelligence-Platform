from core.database import Base, engine

import models.employee
import models.auth
import models.audit
import models.projects
import models.skills
import models.analytics
import models.notification

print("Creating tables...")

Base.metadata.create_all(bind=engine)

print("Done")