# MiniLinks

A full-stack Linktree-style app built with FastAPI, React, TypeScript, Vite, PostgreSQL, SQLAlchemy, Alembic, JWT authentication, React Hook Form, Axios, and Tailwind CSS.

## Features

- User registration and login with bcrypt password hashing
- JWT access tokens stored in `localStorage`
- Protected dashboard routes
- Public profile pages at `/u/:username`
- Profile settings with avatar, bio, username, and theme
- Link CRUD, active/inactive toggles, reordering, and click counts
- Public click tracking through `POST /api/links/{id}/click`
- FastAPI Swagger docs at `http://localhost:8000/docs`

## Requirements

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- npm

## Repository Layout

```text
backend/    FastAPI API, SQLAlchemy models, Alembic migrations
frontend/   React + TypeScript + Vite client
README.md   Setup, API, and development documentation
```

## Backend Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Create a PostgreSQL database:

```sql
CREATE DATABASE linktree_clone;
```

Update `backend/.env` if your PostgreSQL user, password, host, or database name is different.

Run migrations:

```powershell
alembic upgrade head
```

Seed a demo account:

```powershell
python -m app.seed
```

Demo credentials:

- Email: `demo@example.com`
- Password: `password123`
- Public profile: `http://localhost:5173/u/demo`

Start the FastAPI server:

```powershell
uvicorn app.main:app --reload --reload-dir app --host 0.0.0.0 --port 8000
```

Backend docs:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
- Health check: `http://localhost:8000/health`

## Frontend Setup

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

If your API runs somewhere other than `http://localhost:8000/api`, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Build the frontend:

```powershell
cd frontend
npm run build
```

## Local Development

Run the backend and frontend in two terminals.

Terminal 1:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --reload-dir app --host 0.0.0.0 --port 8000
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

## API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Profile:

- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/public/{username}`

Links:

- `GET /api/links`
- `POST /api/links`
- `PUT /api/links/{id}`
- `DELETE /api/links/{id}`
- `PATCH /api/links/reorder`
- `PATCH /api/links/{id}/toggle`
- `POST /api/links/{id}/click`

## Project Structure

```text
backend/
  app/
    main.py
    config.py
    database.py
    models/
    schemas/
    routers/
    services/
    utils/
    dependencies/
  alembic/
  requirements.txt
  .env.example

frontend/
  src/
    api/
    components/
    pages/
    routes/
    types/
    utils/
  package.json
  vite.config.ts
```
