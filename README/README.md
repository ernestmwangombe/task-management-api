# Task Management REST API

A lightweight, robust, and fully documented RESTful Task Management API built with **Node.js** and **Express.js**. Developed as part of the **FlyRank Internship Backend Engineering Track**.

This project provides complete CRUD lifecycle management for system tasks, strictly structured JSON payloads, defensive input validation, standard HTTP status codes, and interactive API documentation powered by OpenAPI 3.0 and Swagger UI.

---

## 🚀 1. Quickstart & Setup Guide (One-Command Execution)

### Prerequisites

* Node.js (v18.x or higher)
* npm (bundled with Node.js)
* Git

### One-Command Launch

Clone the repository, install dependencies, and launch the API server using a single command:

```bash
git clone https://github.com/ernestmwangombe/task-management-api.git && cd task-management-api && npm install && node server.js

---

## 📡 2. API Endpoint Reference Table

| Method | Endpoint | Description | Request Body | Success Code | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | API system metadata banner | None | `200 OK` | N/A |
| **GET** | `/health` | Server heartbeat status check | None | `200 OK` | N/A |
| **GET** | `/tasks` | Retrieve full task inventory | None | `200 OK` | N/A |
| **POST** | `/tasks` | Create a new task record | `{"title": "string"}` | `201 Created` | `400 Bad Request` |
| **GET** | `/tasks/:id` | Lookup task by dynamic primary key | None | `200 OK` | `404 Not Found` |
| **PUT** | `/tasks/:id` | Update task title or completed state | `{"title": "string", "done": boolean}` | `200 OK` | `404 Not Found` |
| **DELETE** | `/tasks/:id` | Purge task record from memory | None | `204 No Content` | `404 Not Found` |

---

## 🧪 3. Live Protocol Inspection (`curl -i` Terminal Output)

Below is an authentic raw HTTP protocol response trace captured via `curl.exe -i` during runtime verification:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 260
ETag: W/"104-e3p/92E79dI0fS4oE3iJkM1dJ"
Date: Sat, 25 Jul 2026 06:00:00 GMT
Connection: keep-alive

[
  {
    "id": 1,
    "title": "Responding to routine client emails",
    "done": false
  },
  {
    "id": 2,
    "title": "Monitoring server status alerts",
    "done": false
  },
  {
    "id": 3,
    "title": "Prepare for client meeting",
    "done": false
  }
]
```
##📸 4. Interactive Swagger UI Documentation

This API serves an interactive OpenAPI 3.0 specification rendered live via Swagger UI at /docs/.

To test endpoints interactively:

1. Ensure the daemon is running (node server.js).

2. Open http://localhost:3000/docs/ in your browser.

3. Click any route panel and press Try it out to execute real HTTP requests directly against your local server.

##🛠️ Tech Stack & Architecture

* Runtime: Node.js

* Framework: Express.js

* API Blueprint: OpenAPI 3.0 (openapi.json)

* Interactive UI: swagger-ui-express

* Version Control: Git & GitHub

##👤 Author

Ernest Mwang'ombe

* Role: IT Consultant & Backend AI Engineer

* Track: FlyRank Internship Backend Engineering

* GitHub: @ernestmwangombe