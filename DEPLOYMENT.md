# Deployment Guide

This document outlines how to deploy the Workforce Intelligence Platform across various environments, ranging from local development to production-grade cloud clusters.

## 1. Local Deployment (Development)

### Prerequisites
- Node.js (v20+)
- Python (v3.12+)
- Git

### Backend Setup
```bash
cd workforce-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Update variables as needed
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd workforce-frontend
npm install
cp .env.example .env      # Ensure VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

---

## 2. Docker Deployment (Containerized Local/Prod)

We provide a complete `docker-compose.yml` to spin up the entire stack seamlessly.

### Prerequisites
- Docker Engine & Docker Compose

### Execution
```bash
# From the root directory
docker-compose up --build -d
```
- **Frontend** will be available at: `http://localhost:80`
- **Backend API** will be available at: `http://localhost:8000`

> **Note**: To view logs, run `docker-compose logs -f`. To bring the cluster down, run `docker-compose down`.

---

## 3. Cloud Deployment (Recommended Platforms)

For enterprise scalability, we recommend deploying the Backend and Frontend as decoupled services.

### A. Backend (Render / Railway / Fly.io)

**Render.com Example**:
1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**: Add `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET`, and `FRONTEND_URL`.

*Note*: We recommend provisioning a managed **PostgreSQL** database on Render or AWS RDS and linking the `DATABASE_URL` to it rather than using SQLite in production.

### B. Frontend (Vercel / Netlify)

**Vercel Example**:
1. Connect your GitHub repository to Vercel.
2. Framework Preset: **Vite**
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**: Set `VITE_API_URL` to the public URL of your Render backend (e.g., `https://workforce-api.onrender.com/api/v1`).

### C. Database (PostgreSQL)

For production, migrate from SQLite to PostgreSQL:
1. Update `workforce-backend/requirements.txt` to include `psycopg2-binary`.
2. Update the `DATABASE_URL` environment variable to your Postgres connection string:
   `postgresql://user:password@host:port/dbname`
3. SQLAlchemy will automatically translate the ORM models to PostgreSQL dialects on startup.
