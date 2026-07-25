Task Management REST API

A lightweight, robust, and fully documented RESTful Task Management API built with Node.js and Express.js. Developed as part of the FlyRank Internship Backend Engineering Track.

This project provides complete CRUD lifecycle management for tasks, strictly structured JSON payloads, robust HTTP error handling, and interactive API documentation powered by OpenAPI 3.0 and Swagger UI.

🚀 Quickstart & Setup Guide

Prerequisites

Node.js (v18.x or higher)

npm (bundled with Node.js)

Git

Installation & Execution

Clone the repository, install dependencies, and start the daemon server:

git clone https://github.com/ernestmwangombe/task-management-api.git
cd task-management-api
npm install
node server.js


Once running, the server daemon listens at:

Base API: http://localhost:3000

Interactive Swagger UI: http://localhost:3000/docs/

📡 API Endpoint Reference

Method

Endpoint

Description

Request Body

Success Code

GET

/

API system metadata

None

200 OK

GET

/health

Server status heartbeat

None

200 OK

GET

/tasks

Retrieve full task inventory

None

200 OK

POST

/tasks

Create a new task

{"title": "string"}

201 Created

GET

/tasks/:id

Lookup task by dynamic ID

None

200 OK

PUT

/tasks/:id

Update task title or state

{"title": "string", "done": boolean}

200 OK

DELETE

/tasks/:id

Purge task record

None

204 No Content

📸 Interactive Documentation

This API exposes an interactive developer interface rendered from an OpenAPI 3.0 specification (openapi.json).

Start the server: node server.js

Open your browser: http://localhost:3000/docs/

Use the Try it out button to test live requests directly from your web browser.

🛠️ Tech Stack

Runtime Engine: Node.js

Framework: Express.js

API Specification: OpenAPI 3.0 (openapi.json)

Interactive UI Engine: swagger-ui-express

Version Control: Git & GitHub

👤 Author

Ernest Mwang'ombe

Track: FlyRank Internship Backend Engineering

GitHub: @ernestmwangombe
