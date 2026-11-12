# CodeNext

A web-based multi-language compiler platform for C, C++, and Java.

## Project structure

- `frontend/` — React + Vite interface with Monaco Editor and Axios dependencies.
- `backend/` — Express API starter with a health-check endpoint.
- `backend/temp/` — Reserved for temporary compilation files (do not execute untrusted code directly on the host).

## Requirements

- Node.js LTS
- npm
- Git

Compiler toolchains (GCC, G++, and JDK) will be configured in a later development phase.

## Run the project

Open two terminals in VS Code.

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend: http://localhost:5000  
Health check: http://localhost:5000/api/health

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

The frontend requests the backend health endpoint to show whether the API is connected.

## Important security note

Do not add an endpoint that executes submitted source code directly on the host machine.
Before enabling compilation/execution, implement an isolated sandbox (for example, a properly restricted container) with CPU, memory, time, filesystem, and network limits.

## Team workflow

Create a GitHub repository named `CodeNext`, then connect it:

```bash
git init
git add .
git commit -m "Initial CodeNext project structure"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```
