import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.auth import User
from core.security import get_password_hash

def add_demo_users():
    db = SessionLocal()
    
    if not db.query(User).filter(User.email == "admin@company.com").first():
        demo_admin = User(
            email="admin@company.com",
            hashed_password=get_password_hash("password123"),
            name="Enterprise Admin",
            role="Admin"
        )
        db.add(demo_admin)
        print("Created demo admin")
    
    if not db.query(User).filter(User.email == "hr@company.com").first():
        demo_hr = User(
            email="hr@company.com",
            hashed_password=get_password_hash("password123"),
            name="HR Manager",
            role="HR Manager"
        )
        db.add(demo_hr)
        print("Created demo HR")
        
    if not db.query(User).filter(User.email == "pm@company.com").first():
        demo_pm = User(
            email="pm@company.com",
            hashed_password=get_password_hash("password123"),
            name="Project Manager",
            role="Project Manager"
        )
        db.add(demo_pm)
        print("Created demo PM")
        
    if not db.query(User).filter(User.email == "delivery@company.com").first():
        demo_delivery = User(
            email="delivery@company.com",
            hashed_password=get_password_hash("password123"),
            name="Delivery Manager",
            role="Delivery Manager"
        )
        db.add(demo_delivery)
        print("Created demo Delivery Manager")
        
    db.commit()
    db.close()

if __name__ == "__main__":
    add_demo_users()
