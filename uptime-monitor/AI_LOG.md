# AI_LOG.md

## AI Collaboration Log

### AI Tech Stack

The following AI tools were used during development:

* ChatGPT (GPT-5.5) – architecture design, backend implementation guidance, debugging support, Docker configuration, README drafting, and deployment planning.
* Claude Sonnet – architecture validation, frontend implementation suggestions, code review, and alternative design approaches.
* Cursor IDE – AI-assisted coding, code generation, and iterative development workflow.
* GitHub Copilot – inline code completion, refactoring assistance, and boilerplate generation.

### Why Multiple AI Tools Were Used

Different AI systems were used for different purposes:

* ChatGPT was primarily used for system design discussions, DevOps decisions, Docker setup, and deployment planning.
* Claude was used to cross-check architecture decisions, review implementation approaches, and generate alternative solutions for frontend and backend components.
* Cursor accelerated end-to-end development through integrated AI-assisted coding workflows.
* GitHub Copilot improved development speed through contextual code suggestions inside the IDE.

Using multiple AI tools allowed architectural decisions and implementation approaches to be validated from different perspectives rather than relying on a single model.


---

## Development Workflow

The project was built incrementally using AI-assisted development.

### Phase 1: Architecture Design

Prompt:

"Design a simple uptime monitoring application for a few dozen URLs. The solution should include a FastAPI backend, React frontend, SQLite database, Docker Compose setup, and periodic health checks."

Outcome:

* FastAPI selected for backend development.
* React selected for frontend dashboard.
* SQLite selected for MVP persistence.
* APScheduler selected for periodic URL monitoring.

Reasoning:

The assignment emphasized execution speed and simplicity over large-scale production architecture.

---

### Phase 2: Backend Development

Prompt:

"Generate a FastAPI backend that allows URL registration, stores health check history, and performs periodic uptime checks."

Outcome:

* URL registration API.
* Health check storage.
* Response time measurement.
* Scheduler-based monitoring.

Manual Changes:

* Added application health endpoint.
* Improved Docker container configuration.
* Added database persistence.

---

### Phase 3: Frontend Development

Prompt:

"Create a React dashboard that displays monitored URLs, current status, and response times. Refresh data automatically."

Outcome:

* URL submission form.
* Monitoring dashboard.
* Automatic status updates.

Manual Changes:

* Simplified component structure.
* Improved API integration.
* Added error handling.

---

## Course Correction Example

Initial AI Suggestion:

The AI proposed a Redis + Celery architecture for scheduling health checks.

Problem:

For the scale described in the assignment (a few dozen URLs), introducing Redis and Celery increased operational complexity unnecessarily.

Correction Prompt:

"Remove Redis and Celery. Use a lightweight scheduler suitable for an MVP deployment."

Final Solution:

APScheduler was used instead of Redis/Celery, resulting in a simpler and easier-to-maintain architecture.

---

## Engineering Decisions

Several AI-generated suggestions were intentionally not implemented:

* Kubernetes deployment
* Microservice decomposition
* Message queue architecture
* Distributed caching layer

These approaches were intentionally rejected because the assignment prioritized simplicity, rapid execution, and an MVP-scale solution.

---

## Final Reflection

AI significantly accelerated development by generating boilerplate code, suggesting architecture patterns, and assisting with debugging. However, final design decisions, architectural trade-offs, code integration, testing, and deployment structure were manually reviewed and adjusted to align with the assignment requirements.

