# DevBand: Band-Powered Multi-Agent Software Delivery Team

DevBand is a full-stack Band of Agents Hackathon project that demonstrates an enterprise-style multi-agent software delivery workflow. It uses **Band** as the shared collaboration layer and **AI/ML API** as the model provider to coordinate multiple specialized software delivery agents.

The project is designed for **Track 2: Multi-Agent Software Development**.

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Why This Is Multi-Agent](#why-this-is-multi-agent)
5. [How DevBand Uses Band](#how-devband-uses-band)
6. [Agent Team](#agent-team)
7. [End-to-End Workflow](#end-to-end-workflow)
8. [Architecture](#architecture)
9. [Technology Stack](#technology-stack)
10. [Repository Structure](#repository-structure)
11. [Environment Variables](#environment-variables)
12. [Cost Guard Strategy](#cost-guard-strategy)
13. [Local Development](#local-development)
14. [GitHub Codespaces Development](#github-codespaces-development)
15. [API Endpoints](#api-endpoints)
16. [Testing with curl](#testing-with-curl)
17. [Frontend Demo Flow](#frontend-demo-flow)
18. [Deployment Guide](#deployment-guide)
19. [Hackathon Submission Content](#hackathon-submission-content)
20. [Demo Script](#demo-script)
21. [Known Limitations](#known-limitations)
22. [Future Improvements](#future-improvements)
23. [Safety and Reliability](#safety-and-reliability)
24. [License](#license)
25. [Credits](#credits)

---

## Project Summary

**DevBand** turns a software feature request into a structured PR-ready delivery package by coordinating multiple specialized agents through Band.

A user enters a request such as:

```text
Add a dark mode toggle to a React dashboard and persist selected theme across refreshes.
```

DevBand then runs a multi-agent software delivery flow:

```text
Feature Request
  -> Product Planner Agent
  -> Software Engineer Agent
  -> Test Engineer Agent
  -> Code Reviewer Agent
  -> Software Engineer Revision Agent
  -> Documentation Agent
  -> Final PR Delivery Package
```

Each stage produces structured context that is handed off to the next agent. DevBand records the workflow in a live Band collaboration room and produces a downloadable Markdown PR package.

---

## Problem Statement

AI coding assistants are powerful, but many operate as isolated single-agent tools. Real software delivery in enterprises is collaborative and usually includes planning, implementation, testing, review, revision, documentation, and release preparation.

DevBand addresses this gap by creating a coordinated agent team where each agent has a specific software delivery responsibility. Band acts as the collaboration layer where the workflow room, participants, structured handoffs, task events, review decisions, and final delivery trail are recorded.

---

## Solution Overview

DevBand is a full-stack web application with:

- A React frontend for entering feature requests and viewing the workflow.
- A Node.js/Express backend for orchestrating the agents.
- AI/ML API integration for generating agent outputs.
- Band Agent API integration for live collaboration rooms, participants, and task events.
- A downloadable Markdown PR package for final developer handoff.

The result is an auditable software delivery artifact showing how multiple agents collaborated from feature request to PR-ready package.

---

## Why This Is Multi-Agent

DevBand is not a single chatbot. DevBand uses a team of specialized agents with separate responsibilities and separate workflow stages.

The current implementation supports two levels of multi-agent behavior:

### 1. Logical Agent Collaboration

The backend runs six logical software delivery agents:

1. Product Planner Agent
2. Software Engineer Agent
3. Test Engineer Agent
4. Code Reviewer Agent
5. Software Engineer Revision Agent
6. Documentation Agent

Each logical agent receives structured context from previous stages and produces structured output for the next stage.

### 2. Band Multi-Agent Identity Mode

DevBand can run in **Band multi-agent identity mode**, where a coordinator Band agent creates a room and six specialist Band agents are added as room participants.

The specialist Band agents are:

1. DevBand Planner Agent
2. DevBand Engineer Agent
3. DevBand Tester Agent
4. DevBand Reviewer Agent
5. DevBand Revision Agent
6. DevBand Documentation Agent

Each stage event is posted to Band under the matching specialist agent identity.

---

## How DevBand Uses Band

Band is central to DevBand. DevBand uses Band as the workflow collaboration layer, not just a final notification channel.

In live Band mode, DevBand performs these actions:

1. Creates a real Band collaboration room for every workflow.
2. Adds specialist Band agents as participants in the room.
3. Posts a workflow start event.
4. Posts each agent output as a structured Band task event.
5. Records task handoffs, review decisions, revision activity, and final completion.
6. Displays the Band room, participants, task events, Band roles, handles, and success status in the frontend.

The workflow timeline becomes an audit trail showing how the feature request moved across planning, implementation, testing, review, revision, and documentation.

---

## Agent Team

### Workflow Controller / Coordinator

The coordinator creates the Band room, adds specialist agents as participants, starts the workflow, and posts the final completion event.

### Product Planner Agent

Converts the feature request into:

- User story
- Acceptance criteria
- Technical tasks
- Risks
- Handoff instruction

### Software Engineer Agent

Creates implementation guidance including:

- Files changed
- Implementation summary
- Code snippet
- Assumptions
- Handoff instruction

### Test Engineer Agent

Creates validation plans including:

- Unit test ideas
- Integration test ideas
- Manual QA checklist
- Edge cases
- Handoff instruction

### Code Reviewer Agent

Reviews the plan, implementation, and testing outputs for:

- Quality
- Maintainability
- Accessibility
- Security
- Blocking issues
- Revision decision

### Software Engineer Revision Agent

Handles reviewer suggestions and produces:

- Revision summary
- Changes applied
- Revised code snippet
- Resolved review items
- Handoff instruction

### Documentation Agent

Creates the final delivery package including:

- PR title
- PR summary
- Developer notes
- Release notes
- README update
- Final status

---

## End-to-End Workflow

```text
1. User enters a feature request.
2. Backend creates a Band room.
3. Backend adds six specialist Band agents as participants.
4. Workflow Controller posts the workflow start event.
5. Product Planner Agent creates a structured delivery plan.
6. Software Engineer Agent creates implementation guidance.
7. Test Engineer Agent creates test and QA guidance.
8. Code Reviewer Agent reviews output and produces feedback.
9. Software Engineer Revision Agent resolves review suggestions.
10. Documentation Agent creates the final PR package.
11. Workflow Controller posts the completion event.
12. Frontend displays metrics, agent outputs, Band timeline, and final package.
13. User downloads the PR package as Markdown.
```

---

## Architecture

```text
React + Vite Frontend
  |
  | POST /api/workflows/start
  v
Node.js + Express Backend
  |
  |-- Workflow Service
  |     |-- Product Planner Agent
  |     |-- Software Engineer Agent
  |     |-- Test Engineer Agent
  |     |-- Code Reviewer Agent
  |     |-- Software Engineer Revision Agent
  |     |-- Documentation Agent
  |
  |-- Model Service
  |     |-- AI/ML API
  |     |-- Cost guards
  |     |-- Mock fallback
  |
  |-- Band Service
        |-- Create Band room
        |-- Add specialist Band participants
        |-- Post Band task events
        |-- Fallback to local timeline if needed
```

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Browser-based Markdown export

### Backend

- Node.js
- Express
- CORS
- dotenv
- Nodemon for development

### AI

- AI/ML API
- OpenAI-compatible chat completions endpoint
- Recommended default model: `gpt-4o-mini`

### Collaboration Layer

- Band Agent API
- Live Band chat room creation
- Specialist Band participant addition
- Band task events for structured handoffs

### Deployment Target

- Frontend: Vercel
- Backend: Render

---

## Repository Structure

```text
ai-software-deliver/
  frontend/
    src/
      config/
        api.js
      App.jsx
      index.css
      main.jsx
    .env.example
    package.json
    vite.config.js

  backend/
    src/
      agents/
        productPlannerAgent.js
        softwareEngineerAgent.js
        testEngineerAgent.js
        codeReviewerAgent.js
        documentationAgent.js
      routes/
        workflowRoutes.js
      services/
        bandService.js
        modelService.js
        workflowService.js
      server.js
    .env.example
    package.json

  README.md
  .gitignore
```

---

## Environment Variables

Create this file locally:

```text
backend/.env
```

Use this structure:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

AGENT_MODE=ai
BAND_MODE=live
BAND_MULTI_AGENT_MODE=true

BAND_API_KEY=your_coordinator_api_key
BAND_AGENT_ID=your_coordinator_agent_id
BAND_AGENT_HANDLE=your_coordinator_handle

BAND_COORDINATOR_API_KEY=your_coordinator_api_key
BAND_COORDINATOR_AGENT_ID=your_coordinator_agent_id
BAND_COORDINATOR_AGENT_HANDLE=your_coordinator_handle

BAND_PLANNER_API_KEY=your_planner_api_key
BAND_PLANNER_AGENT_ID=your_planner_agent_id
BAND_PLANNER_AGENT_HANDLE=your_planner_handle

BAND_ENGINEER_API_KEY=your_engineer_api_key
BAND_ENGINEER_AGENT_ID=your_engineer_agent_id
BAND_ENGINEER_AGENT_HANDLE=your_engineer_handle

BAND_TESTER_API_KEY=your_tester_api_key
BAND_TESTER_AGENT_ID=your_tester_agent_id
BAND_TESTER_AGENT_HANDLE=your_tester_handle

BAND_REVIEWER_API_KEY=your_reviewer_api_key
BAND_REVIEWER_AGENT_ID=your_reviewer_agent_id
BAND_REVIEWER_AGENT_HANDLE=your_reviewer_handle

BAND_REVISION_API_KEY=your_revision_api_key
BAND_REVISION_AGENT_ID=your_revision_agent_id
BAND_REVISION_AGENT_HANDLE=your_revision_handle

BAND_DOCS_API_KEY=your_docs_api_key
BAND_DOCS_AGENT_ID=your_docs_agent_id
BAND_DOCS_AGENT_HANDLE=your_docs_handle

BAND_WORKSPACE_ID=
BAND_REST_URL=https://app.band.ai
BAND_WS_URL=wss://app.band.ai/api/v1/socket/websocket

AIML_API_KEY=your_aiml_api_key
AIML_BASE_URL=https://api.aimlapi.com/v1
AIML_MODEL=gpt-4o-mini
AIML_MAX_OUTPUT_TOKENS=700
AIML_MAX_PROMPT_CHARS=12000
AIML_DAILY_REQUEST_LIMIT=12

FEATHERLESS_API_KEY=
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_MODEL=Qwen/Qwen2.5-7B-Instruct
```

Create this file for frontend deployment documentation:

```text
frontend/.env.example
```

```env
VITE_API_BASE_URL=
```

For Vercel deployment, set:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

---

## Environment Modes

### Mock AI Mode

```env
AGENT_MODE=mock
```

Use this mode while developing UI to avoid spending AI credits.

### Real AI Mode

```env
AGENT_MODE=ai
```

Use this mode when testing real agent outputs.

### Mock Band Mode

```env
BAND_MODE=mock
```

Use this mode if Band credentials are unavailable.

### Live Band Mode

```env
BAND_MODE=live
```

Use this mode to create real Band rooms and events.

### Multi-Agent Band Identity Mode

```env
BAND_MULTI_AGENT_MODE=true
```

Use this mode to add specialist Band agents as participants and post events using specialist agent identities.

---

## Cost Guard Strategy

One DevBand workflow can use approximately six AI calls:

1. Planner
2. Engineer
3. Tester
4. Reviewer
5. Revision
6. Documentation

Recommended development settings:

```env
AIML_MODEL=gpt-4o-mini
AIML_MAX_OUTPUT_TOKENS=700
AIML_MAX_PROMPT_CHARS=12000
AIML_DAILY_REQUEST_LIMIT=12
```

Recommended final demo setting:

```env
AIML_DAILY_REQUEST_LIMIT=60
```

The backend also includes:

- Prompt trimming
- Output token limits
- In-memory cache
- Mock fallback after API failure
- Mock fallback after request-limit exhaustion

---

## Local Development

### Install Backend

```bash
cd backend
npm install
```

### Install Frontend

```bash
cd frontend
npm install
```

### Run Backend

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Run Frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Frontend runs on:

```text
http://localhost:5173
```

---

## GitHub Codespaces Development

1. Open the repository in GitHub Codespaces.
2. Start backend in one terminal:

```bash
cd backend
npm run dev
```

3. Start frontend in another terminal:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

4. Open forwarded port `5173`.
5. Ensure port `5000` is also running.

---

## API Endpoints

### Health Check

```http
GET /
```

Example response:

```json
{
  "app": "DevBand API",
  "status": "running",
  "message": "Multi-agent software delivery backend is live",
  "mode": {
    "agentMode": "ai",
    "bandMode": "live",
    "bandMultiAgentMode": "true"
  }
}
```

### Start Workflow

```http
POST /api/workflows/start
```

Request:

```json
{
  "featureRequest": "Add a dark mode toggle to a React dashboard and persist selected theme across refreshes"
}
```

Response includes:

- Workflow ID
- Band room details
- Specialist Band participants
- Agent outputs
- Band event timeline
- Final PR package

---

## Testing with curl

```bash
curl -X POST http://localhost:5000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d "{\"featureRequest\":\"Add a dark mode toggle to a React dashboard and persist selected theme across refreshes\"}"
```

Successful indicators:

```json
"provider": "AI/ML API"
```

```json
"liveBand": true
```

```json
"multiAgentMode": true
```

```json
"bandAgentRole": "planner"
```

```json
"bandSuccess": true
```

---

## Frontend Demo Flow

1. Open DevBand.
2. Enter a feature request.
3. Click **Start DevBand Workflow**.
4. Review the workflow summary metrics.
5. Review the Band coordination explanation.
6. Confirm live Band room details.
7. Confirm six specialist Band participants.
8. Review each agent output.
9. Review the Band message timeline.
10. Confirm each timeline item shows Band role, handle, and success status.
11. Review the final PR package.
12. Download the Markdown PR package.

---

## Current UI Notes

The current UI includes:

- Hero section with live Band multi-agent and AI/ML API badges.
- Workflow summary metrics.
- Band coordination explanation.
- Live Band room details.
- Specialist Band participants display.
- Agent output cards.
- Band message timeline with agent identity metadata.
- Final PR package export.

If a metric value is visually long, such as `approved_with_suggestions` or `ready_for_submission`, the UI may need small responsive styling improvements before final recording.

---

## Deployment Guide

### Backend: Render

Create a new Render Web Service.

Settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Add all backend environment variables in Render dashboard.

Recommended Render settings for demo:

```env
AGENT_MODE=ai
BAND_MODE=live
BAND_MULTI_AGENT_MODE=true
AIML_DAILY_REQUEST_LIMIT=60
```

After Render deployment, test:

```text
https://your-render-backend-url.onrender.com
```

### Frontend: Vercel

Import the repository into Vercel.

Settings:

```text
Root Directory: frontend
Framework: Vite
Build Command: npm run build
Output Directory: dist
```

Set this Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

After Vercel deploys, update Render with:

```env
FRONTEND_URL=https://your-vercel-url.vercel.app
```

Restart the Render backend service after updating `FRONTEND_URL`.

---

## Hackathon Submission Content

### Project Title

```text
DevBand: Band-Powered Multi-Agent Software Delivery Team
```

### Short Description

```text
DevBand uses Band and AI/ML API to coordinate specialist software delivery agents that transform a feature request into a planned, implemented, tested, reviewed, revised, and documented PR package.
```

### Long Description

```text
DevBand is a Band-powered multi-agent software delivery workflow for enterprise engineering teams. A user submits a feature request, and DevBand creates a live Band collaboration room, adds specialist Band agents as participants, and coordinates a software delivery workflow across planning, implementation, testing, review, revision, and documentation. AI/ML API powers each agent's reasoning and generation, while Band records the shared room, participant identities, structured task events, handoffs, review decisions, and workflow completion. The final output is an auditable, downloadable PR-ready delivery package.
```

### Suggested Tags

```text
Band
AI/ML API
Multi-Agent
Software Development
Developer Tools
AI Agents
React
Node.js
Express
Vite
Enterprise Workflow
Code Review
Testing
Documentation
```

---

## Demo Script

### Opening

```text
DevBand is a Band-powered multi-agent software delivery team. Instead of using one AI assistant to answer a prompt, DevBand creates a live Band collaboration room and coordinates specialist agents across the software delivery lifecycle.
```

### Walkthrough

1. Show the input screen and describe the feature request.
2. Click Start DevBand Workflow.
3. Show the workflow metrics.
4. Show live Band room and specialist participants.
5. Show agent outputs from planner, engineer, tester, reviewer, revision, and documentation agents.
6. Show the reviewer-driven revision loop.
7. Show the Band timeline and point out different Band roles and handles.
8. Show the final PR package.
9. Download the Markdown PR package.
10. Optionally open Band dashboard and show the created room/events.

### Closing

```text
DevBand demonstrates how enterprise software delivery can move beyond isolated coding assistants into coordinated multi-agent workflows. Band provides the collaboration layer, AI/ML API powers the specialist agents, and the final output is an auditable PR-ready delivery artifact.
```

---

## Known Limitations

- Specialist Band agents are currently represented through Band identities and event posting. They are not separate deployed WebSocket runtimes yet.
- Generated code is illustrative and is not automatically committed to GitHub.
- GitHub PR creation is not yet automated.
- There is no persistent database for workflow history.
- UI metric cards may need additional responsive styling for long status values.
- The project currently uses Band task events rather than routed text messages with mentions.

---

## Future Improvements

- Run each specialist Band agent as a separate remote process with WebSocket event handling.
- Add GitHub issue and PR creation.
- Add repository context ingestion.
- Generate real file diffs.
- Add human approval before final package.
- Add persistent database storage for workflow history.
- Add WebSocket streaming for live frontend progress.
- Add model selection per agent.
- Add Featherless AI as an optional independent reviewer model.
- Add authentication and team workspaces.

---

## Safety and Reliability

DevBand is designed to be demo-safe:

- AI failures fall back to deterministic mock outputs.
- Band failures fall back to local timeline messages.
- AI request limits prevent accidental credit overuse.
- Secrets are read from environment variables only.
- `.env` files are ignored by Git.

---

## License

This project is intended for hackathon submission and educational demonstration. Add an MIT license file if required by the hackathon submission rules.

---

## Credits

Built for the Band of Agents Hackathon.

Core technologies:

- Band
- AI/ML API
- React
- Vite
- Tailwind CSS
- Node.js
- Express

---

## Final Summary

DevBand demonstrates a practical enterprise multi-agent software delivery workflow. It uses Band to coordinate specialist agent identities, AI/ML API to generate software delivery outputs, and a full-stack interface to visualize collaboration from feature request to final PR package.
