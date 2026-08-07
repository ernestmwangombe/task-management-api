# Persistent SQLite Task Management API

Express REST API integrated with persistent SQLite database storage, built for lightweight deployment and zero-touch local configuration.

## Storage Architecture & Design Decisions

- **Why SQLite Was Chosen:** Operates as a single-file, zero-configuration embedded database engine. It survives application server restarts, eliminates external database network dependencies, and provides near-zero query latency.
- **Database Storage Location:** The database file is auto-provisioned at `./tasks.db` on first server boot. It is excluded from version control via `.gitignore` so each fresh clone starts clean without committing binary runtime data.

## Quickstart (One Command Deployment)

Clone the repository, install dependencies, and launch the server daemon:

```bash
npm install && node server.js