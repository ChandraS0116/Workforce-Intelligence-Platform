import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_login_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@company.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@company.com"

def test_login_failure():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@company.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_employees():
    response = client.get("/api/v1/employees")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_projects():
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_dashboard():
    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "organization_health" in data
