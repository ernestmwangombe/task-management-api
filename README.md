# Containerized Task Management & Workflow Automation API

An enterprise-ready, containerized REST API built with Node.js, Express, and PostgreSQL. Designed with parameterized database isolation, Docker Compose stack orchestration, and ODPC-compliant local persistence for secure workflow automation.

---

## Architecture Overview

- **API Gateway:** Node.js Express framework handling input sanitization and route control.
- **Database Engine:** PostgreSQL 16 (Alpine distribution) for disk-backed B-tree transactional storage.
- **Network Bridge:** Isolated Docker bridge network with internal DNS resolution (`db:5432`).
- **Data Persistence:** Mounted Docker volume (`taskdata`) ensuring persistence across cold stack restarts.

---

## One-Command Stack Startup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed locally.

### Setup Instructions

1. **Clone the repository:**