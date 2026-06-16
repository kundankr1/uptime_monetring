# 🤖 AI Collaboration Log

This document provides a transparent record of how AI tools were used to build the Uptime Monitor MVP.

---

## 🛠 AI Tech Stack

| Tool | Model | Purpose |
|------|-------|---------|
| Claude (claude.ai) | Claude Sonnet 4.6 | Primary AI assistant — architecture decisions, backend API, frontend UI, Docker config, README |

---

## 💬 Key Prompts That Shipped It

### 1. Initial Architecture Prompt
> *"I need to build a URL uptime monitor — a full-stack app that pings URLs every 60 seconds and shows up/down status and response time. Backend: FastAPI + SQLite + APScheduler. Frontend: React. Containerized with Docker Compose. Build the complete project."*

Claude generated the full project skeleton: FastAPI routes, APScheduler job, SQLite schema, React dashboard with real-time polling, and Docker Compose configuration.

### 2. Frontend UI Prompt
> *"Build a React dashboard that fetches from the FastAPI backend every 15 seconds, displays each URL with a colored UP/DOWN badge, response time, last checked timestamp, and a history modal. Use dark theme inline styles — no external CSS libraries."*

Claude produced the full `App.js` with dark-themed inline styles, status badges with glow effects, a history modal, and auto-refresh logic using `setInterval`.

### 3. Docker & Nginx Prompt
> *"Write a multi-stage Dockerfile for the React frontend that builds with Node and serves with Nginx on port 3000. Write the nginx.conf and docker-compose.yml that wires backend and frontend together with a persistent SQLite volume."*

Claude generated the multi-stage Dockerfile, `nginx.conf`, and `docker-compose.yml` with health checks and volume mounts.

### 4. Deployment Sketch Prompt
> *"Write a brief hypothetical Terraform snippet for deploying this on AWS — React on S3 + CloudFront, FastAPI on ECS Fargate with an ALB, SQLite replaced by RDS. Keep it concise, not production-hardened."*

Claude produced the Terraform sketch included in the README.

---

## ⚠️ Course Corrections

### Issue 1: CORS error blocking frontend → backend calls

**What AI generated initially:**
The initial FastAPI backend did not include CORS middleware, causing the React frontend to get blocked by the browser with a CORS policy error when calling `http://localhost:8000`.

**How I identified it:**
Browser console showed: `Access to XMLHttpRequest at 'http://localhost:8000/urls' from origin 'http://localhost:3000' has been blocked by CORS policy.`

**Fix prompt I used:**
> *"The FastAPI backend is missing CORS middleware. Add CORSMiddleware allowing all origins so the React frontend on port 3000 can call the API on port 8000."*

Claude immediately added the correct middleware block:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
```

---

### Issue 2: React build environment variable not passed to Docker

**What AI generated initially:**
The `docker-compose.yml` set `REACT_APP_API_URL` as a runtime environment variable. However, React bakes environment variables into the static build at **build time**, not runtime — so the variable was not available inside the browser.

**How I identified it:**
The frontend was calling `undefined/urls` instead of `http://localhost:8000/urls`.

**Fix prompt I used:**
> *"REACT_APP_API_URL needs to be passed as a Docker build ARG during `npm run build`, not as a runtime ENV. Update the Dockerfile and docker-compose.yml to pass it as a build argument."*

Claude corrected the Dockerfile to use `ARG REACT_APP_API_URL` and the compose file to use `build.args`.

---

### Issue 3: SQLite path not persistent across container restarts

**What AI generated initially:**
The database was being written to `/app/monitor.db` inside the container, which was lost on every `docker compose down`.

**Fix:**
> *"Move the SQLite database to `/data/monitor.db` and mount a named Docker volume at `/data` so data persists across container restarts."*

Claude updated `main.py` to use `/data/monitor.db` and the `docker-compose.yml` to define and mount the `sqlite_data` volume.

---

## 📝 Summary

AI was used to rapidly generate all layers I don't write daily (primarily the React frontend, multi-stage Docker builds, and Nginx config). My DevOps background meant I validated and corrected the infrastructure layer — particularly around Docker networking, build-time vs runtime environment variables, and volume persistence — while leaning on AI to accelerate the UI and API boilerplate.
