# Task Management API

A containerized REST API for managing tasks, built with **Node.js, Express and PostgreSQL**. The whole stack (API plus database) starts with one command, keeps its data across restarts, and keeps credentials out of the code.

```bash
cp .env.example .env    # then set POSTGRES_PASSWORD
docker compose up --build
```

It is a deliberately small service, built to show the engineering habits I bring to client work: clean API contracts, safe database access, reproducible environments and honest documentation.

---

## What this demonstrates

| Capability | Where to see it |
|------------|-----------------|
| Clean REST design with correct status codes (`200`, `201`, `204`, `400`, `404`) | [API reference](#api-reference) |
| Safe database access: every query is parameterized, so user input can never run as SQL | `index.js` |
| Reproducible environments: one command brings up the API and its database on any machine | `compose.yaml`, `Dockerfile` |
| Secrets management: credentials live in a git-ignored `.env`, never in the code or the image | [Configuration](#configuration) |
| Startup reliability: the API waits for a healthy database and seeds data only once | [Design decisions](#design-decisions) |
| Migration experience: the same API moved from memory to SQLite to PostgreSQL without changing its contract | [How it evolved](#how-it-evolved) |

---

## Table of contents

1. [Architecture](#architecture)
2. [Quick start](#quick-start)
3. [Configuration](#configuration)
4. [API reference](#api-reference)
5. [Try it with curl](#try-it-with-curl)
6. [Proving persistence](#proving-persistence)
7. [Looking inside the database](#looking-inside-the-database)
8. [Swagger UI (SQLite version)](#swagger-ui-sqlite-version)
9. [Running without Docker](#running-without-docker)
10. [Project structure](#project-structure)
11. [How it evolved](#how-it-evolved)
12. [Design decisions](#design-decisions)
13. [Current limitations](#current-limitations)
14. [Roadmap: Supabase](#roadmap-supabase)
15. [Security notes](#security-notes)

---

## Architecture

```mermaid
flowchart LR
    Client["Client<br/>(curl, Swagger, Hoppscotch)"] -->|"HTTP :3000"| API["api container<br/>Node.js + Express<br/>index.js"]
    API -->|"pg connection pool<br/>db:5432"| DB[("db container<br/>PostgreSQL 16 Alpine")]
    DB --- Vol[["named volume<br/>taskdata"]]
```

- **API container:** Express handles routing, input validation and status codes. Every database call is a parameterized query.
- **Database container:** the official `postgres:16-alpine` image, with a health check so the API only starts once the database is ready.
- **Network:** Docker Compose puts both containers on one private network. The API reaches the database by its service name (`db`), not `localhost`, and the database port is not published to your machine by default.
- **Persistence:** the named volume `taskdata` holds the Postgres data directory, so rows outlive the containers.

---

## Quick start

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running) and [Git](https://git-scm.com/).

```bash
git clone https://github.com/ernestmwangombe/task-management-api.git
cd task-management-api
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Open `.env` and replace `change_me` with a password of your own in **both** `POSTGRES_PASSWORD` and the `DATABASE_URL` line (the `DATABASE_URL` line is only used when you run outside Docker). Then start the stack:

```bash
docker compose up --build
```

In a second terminal:

```bash
curl -i http://localhost:3000/tasks
```

You should get `200 OK` and three seeded tasks. The first start creates the `tasks` table and seeds three example tasks. Every later start sees existing rows and skips the seed, so the examples never multiply.

Stop the stack and keep your data:

```bash
docker compose down
```

---

## Configuration

| Variable | Purpose | Default in `.env.example` |
|----------|---------|---------------------------|
| `PORT` | Port the API is published on | `3000` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password (**set your own**) | `change_me` |
| `POSTGRES_DB` | Database name | `tasks` |
| `DATABASE_URL` | Connection string, only for running the API outside Docker | `postgres://postgres:change_me@localhost:5432/tasks` |

Docker Compose builds the API's connection string from the `POSTGRES_*` values, so the password is defined in exactly one place. `.env.example` is committed as a template. `.env` is git-ignored and excluded from the Docker image.

---

## API reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Purpose | Success | Errors |
|--------|----------|---------|---------|--------|
| `GET` | `/tasks` | List all tasks, ordered by id | `200` | `500` |
| `GET` | `/tasks/:id` | Get one task | `200` | `400` bad id, `404` not found, `500` |
| `POST` | `/tasks` | Create a task | `201` | `400` missing or empty title, `500` |
| `PUT` | `/tasks/:id` | Update a task's title and done flag | `200` | `400` bad id or title, `404`, `500` |
| `DELETE` | `/tasks/:id` | Delete a task | `204` (empty body) | `400` bad id, `404`, `500` |

**Task shape**

```json
{
  "id": 1,
  "title": "Responding to routine client emails",
  "done": false
}
```

**Error shape** (every error is JSON, never an HTML stack trace)

```json
{ "error": "Task not found" }
```

**Behavior notes**

- `POST /tasks` requires a non-empty string `title`. `done` is optional and defaults to `false`.
- `PUT /tasks/:id` requires a non-empty string `title`. If `done` is omitted it is stored as `false`, so send both fields when updating.
- Titles are trimmed of leading and trailing whitespace before they are stored.
- A successful `DELETE` returns `204` with no body.

---

## Try it with curl

Run these in order for the full create, read, update, delete cycle. On Windows PowerShell, use `curl.exe` (plain `curl` is an alias for a different command there).

**1. Create a task** (expect `201 Created`)

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Prepare quarterly infrastructure report"}'
```

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":4,"title":"Prepare quarterly infrastructure report","done":false}
```

**2. Read it back** (expect `200 OK`)

```bash
curl -i http://localhost:3000/tasks/4
```

**3. Mark it done** (expect `200 OK`)

```bash
curl -i -X PUT http://localhost:3000/tasks/4 \
  -H "Content-Type: application/json" \
  -d '{"title":"Prepare quarterly infrastructure report","done":true}'
```

**4. Delete it** (expect `204 No Content`)

```bash
curl -i -X DELETE http://localhost:3000/tasks/4
```

**5. Confirm it is gone** (expect `404 Not Found`)

```bash
curl -i http://localhost:3000/tasks/4
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"error":"Task not found"}
```

**6. Trigger validation** (expect `400 Bad Request`)

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{}'
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"error":"Title is required"}
```

---

## Proving persistence

```bash
# 1. Create a task
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Still here after a full restart"}'

# 2. Tear the whole stack down (containers removed, volume kept)
docker compose down

# 3. Bring it back up
docker compose up --build

# 4. The task is still in the list
curl -i http://localhost:3000/tasks
```

The task survives because the `taskdata` volume lives outside the container. To wipe the data on purpose, add `-v`, which also deletes the volume:

```bash
docker compose down -v
```

---

## Looking inside the database

The API and `psql` read the same rows, so there is no syncing step. Open a SQL prompt inside the running database container:

```bash
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Then try:

```sql
\dt
SELECT * FROM tasks ORDER BY id;
SELECT COUNT(*) FROM tasks WHERE done = true;
\q
```

Any change made in `psql` shows up in `GET /tasks` immediately.

---

## Swagger UI (SQLite version)

The earlier SQLite version of the service (`server.js`) serves interactive OpenAPI 3.0 documentation at `http://localhost:3000/docs`, generated from the hand-written `openapi.json`. Every endpoint has a "Try it out" button, so the full create, read, update, delete cycle can be run without curl.

![Swagger UI showing the five task endpoints](ScreenShots/Swagger%20Front%20Page.JPG)

| Step | Screenshot |
|------|------------|
| Create a task | ![Create task](ScreenShots/Create%20Task.JPG) |
| Task created | ![Task created](ScreenShots/Task%20Created.JPG) |
| Get a task | ![Get task](ScreenShots/Get%20Task.JPG) |
| Task found | ![Task found](ScreenShots/Task%20Found.JPG) |
| Update a task | ![Update task](ScreenShots/Update%20Task.JPG) |
| Marked as done | ![Task marked as done](ScreenShots/Task%20Marked%20as%20Done.JPG) |
| Delete a task | ![Delete task](ScreenShots/Delete%20Task.JPG) |
| Task deleted | ![Task deleted](ScreenShots/Task%20Deleted.JPG) |

The PostgreSQL version (`index.js`) exposes the same five task endpoints but does not mount `/docs` yet.

---

## Running without Docker

### Option A: SQLite version (with Swagger UI)

Needs Node.js 18 or newer. No database install is required, because SQLite is a single file created on first run.

```bash
npm install
npm run start:sqlite
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- Data file: `tasks.db`, created on first run with the `tasks` table and three seeded tasks. Delete it to reset (it is git-ignored).

### Option B: PostgreSQL version on your machine, database in Docker

Start only the database, publishing its port to your own machine (and nothing else) with the dev override file:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up -d db
```

Make sure the `DATABASE_URL` line in your `.env` points at `localhost` and uses your password, then:

```bash
npm install
npm start
```

---

## Project structure

```
task-management-api/
├── index.js            # Main entry point: Express routes backed by PostgreSQL
├── db.js               # Storage module: pg pool, table creation, seed-once logic
├── server.js           # SQLite entry point: Express routes + Swagger UI
├── database.js         # SQLite storage module: WAL mode, transactional seed
├── openapi.json        # OpenAPI 3.0 spec served at /docs by server.js
├── Dockerfile          # API image (node:22-alpine, unprivileged user)
├── compose.yaml        # api + db services, health check, taskdata volume
├── compose.dev.yaml    # Optional override: publishes the DB port on localhost only
├── ScreenShots/        # Swagger UI screenshots used in this README
├── .env.example        # Template for required environment variables
├── .dockerignore       # Keeps secrets and local files out of the image
├── .gitignore          # Keeps .env, node_modules and database files out of git
├── package.json
└── package-lock.json
```

---

## How it evolved

The same five endpoints were kept stable while the storage underneath changed three times. This is the core migration skill: the API is the promise, and the database is just the filing cabinet behind it.

| Phase | Where tasks live | What was built |
|-------|------------------|----------------|
| 1. In-memory API | A JavaScript array | Express server, `GET /` and `GET /health`, read endpoints with JSON `404`, `POST` with validation, `PUT` and `DELETE`, OpenAPI 3.0 spec and Swagger UI |
| 2. SQLite | A `tasks.db` file on disk | Table created automatically, seed-once logic, every endpoint rewritten as a parameterized SQL query, data survives restarts |
| 3. PostgreSQL in Docker | Rows in a Postgres 16 container | Connection pool, `RETURNING *` queries, `Dockerfile` and `compose.yaml`, named volume, secrets moved into `.env` |

The git history follows these phases commit by commit.

---

## Design decisions

- **Parameterized queries everywhere.** Values travel separately from the SQL text (`$1` in Postgres, `?` in SQLite), so user input is always treated as data.
- **Validate at the edge.** Bad ids and empty titles are rejected with a `400` before any query runs.
- **Defensive body handling.** A request with no body and no `Content-Type` once crashed a handler with a `500` and an HTML stack trace that leaked file paths. The SQLite version now falls back to an empty object so malformed requests get a clean JSON `400`.
- **Idempotent startup.** The table is created with `CREATE TABLE IF NOT EXISTS`, and the seed runs only when `COUNT(*)` is `0`, so restarts never duplicate data.
- **Ordered startup.** The API waits for the database health check, then `index.js` awaits schema setup before opening its port, and exits loudly if the database is unreachable.
- **Connection pooling.** Postgres connections are expensive to open, so `pg.Pool` keeps a few warm and lends them per query.
- **`RETURNING *`.** `INSERT`, `UPDATE` and `DELETE` return the affected row in the same round trip, which gives the generated `id` and a reliable `404` check without a second query.
- **One source for credentials.** Compose builds the connection string from the same `POSTGRES_*` values that create the database, and `.env` is excluded from git and from the image.
- **Consistent contracts.** Errors are always `{ "error": "..." }`, and the same status codes hold across all three storage engines.

---

## Current limitations

- The PostgreSQL version does not yet serve Swagger UI, `GET /`, or `GET /health`. Those live in the earlier version.
- `PUT` replaces the title and done flag together rather than patching a single field.
- There is no authentication, pagination, or automated test suite yet.
- Schema creation happens in application code at startup. There is no migration tool yet.

---

## Roadmap: Supabase

The next step is pointing this API at a managed PostgreSQL database on **Supabase**. Because the app already speaks standard PostgreSQL through `pg`, the core of the change is configuration rather than a rewrite. Planned work:

1. Create a Supabase project and move the `tasks` schema there as a proper SQL migration instead of startup code.
2. Point `DATABASE_URL` at the Supabase connection string, and enable TLS in the `pg` pool configuration.
3. Choose between Supabase's direct and pooled connection strings based on where the API runs, and size the pool to match.
4. Keep the Docker Compose stack as the local development environment, with Supabase as the hosted one.
5. Review Supabase's row-level security settings for the `tasks` table before exposing anything publicly.

---

## Security notes

- `.env` is git-ignored and excluded from the Docker image. `.env.example` documents the required keys with placeholder values only.
- All SQL is parameterized.
- The API container runs as an unprivileged user.
- The database port is not published by default. The optional `compose.dev.yaml` binds it to `127.0.0.1` only.
- Errors return generic JSON messages. Internal details are logged server-side only.
- Replace the `change_me` placeholder with a strong password before running anywhere other than your own machine.
- The service stores task titles only and holds no personal data.

---

## Author

**Ernest Mwangombe**: IT consultant moving into AI backend engineering, focused on AI integration, backend architecture and workflow automation for client businesses.
