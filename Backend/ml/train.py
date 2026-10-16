import sys
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import joblib

# Add parent directory to path to import core/models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.projects import Project
from models.employee import Employee

def extract_project_data(db):
    projects = db.query(Project).all()
    data = []
    for p in projects:
        # Synthesize features based on MVP data
        duration = (p.end_date - p.start_date).days if p.end_date else 100
        team_size = np.random.randint(3, 15)
        skill_coverage = np.random.uniform(0.5, 1.0)
        budget = np.random.uniform(50000, 500000)
        utilization = np.random.uniform(0.7, 1.3)
        
        # Synthetic label based on features to ensure the model learns something logical
        # High skill coverage, normal utilization -> more success
        success_prob = skill_coverage * 0.6 + (1.0 - abs(utilization - 0.9)) * 0.4
        is_success = 1 if success_prob > 0.75 else 0
        
        data.append({
            'project_id': p.id,
            'duration_days': duration,
            'team_size': team_size,
            'skill_coverage': skill_coverage,
            'budget': budget,
            'utilization': utilization,
            'is_success': is_success
        })
    return pd.DataFrame(data)

def train_project_success_model():
    print("Extracting data from database...")
    db = SessionLocal()
    df = extract_project_data(db)
    db.close()
    
    if df.empty:
        print("No project data found to train model.")
        return

    print(f"Training on {len(df)} project records...")
    
    features = ['duration_days', 'team_size', 'skill_coverage', 'budget', 'utilization']
    X = df[features]
    y = df['is_success']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost
    model = XGBClassifier(n_estimators=100, random_state=42, use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train, y_train)
    
    # Evaluate
    accuracy = model.score(X_test, y_test)
    print(f"Model Accuracy: {accuracy:.2f}")
    
    # Save Model
    os.makedirs(os.path.dirname(os.path.abspath(__file__)) + '/models', exist_ok=True)
    model_path = os.path.dirname(os.path.abspath(__file__)) + '/models/project_success_model.joblib'
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

    # Feature Importance Report
    importance = model.feature_importances_
    with open(os.path.dirname(os.path.abspath(__file__)) + '/models/feature_importance.txt', 'w') as f:
        f.write("Project Success Model Feature Importance:\n")
        for feature, imp in zip(features, importance):
            f.write(f"{feature}: {imp:.4f}\n")
    print("Saved feature importance report.")

if __name__ == "__main__":
    train_project_success_model()
