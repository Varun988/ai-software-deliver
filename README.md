# DevBand: Band-Powered Multi-Agent Software Delivery Team

DevBand is a full-stack hackathon project for the **Band of Agents Hackathon**. It demonstrates a cross-framework, multi-agent software delivery workflow where specialized AI agents collaborate through **Band** to convert a software feature request into a PR-ready delivery package.

The project focuses on **Track 2: Multi-Agent Software Development**.

---

## 1. Short Description

DevBand uses **Band** as the collaboration layer and **AI/ML API** as the model provider to coordinate a software delivery team of specialized agents. The agents plan, implement, test, review, revise, and document a requested software feature while preserving structured context handoffs and an audit-ready collaboration timeline.

---

## 2. Problem Statement

Modern AI coding tools often operate as isolated assistants. Enterprise software delivery, however, is collaborative. A feature request usually moves through multiple roles:

- Product planning
- Engineering implementation
- Testing
- Code review
- Revision
- Documentation
- Release preparation

DevBand demonstrates what becomes possible when these roles are represented by specialized AI agents that coordinate through a shared collaboration layer instead of acting as one large monolithic chatbot.

---

## 3. Solution Overview

A user submits a feature request, such as:

```text
Add a dark mode toggle to a React dashboard and persist selected theme across refreshes.
```

DevBand then creates a Band collaboration room and runs a multi-agent workflow:

```text
Feature Request
   ↓
Product Planner Agent
   ↓
Software Engineer Agent
   ↓
Test Engineer Agent
   ↓
Code Reviewer Agent
   ↓
Software Engineer Revision Agent
   ↓
Documentation Agent
   ↓
Final PR Delivery Package
```

Each agent receives the structured output from earlier agents, performs a specialized task, and posts its result into the Band-powered collaboration timeline.

---

## 4. Key Features

### Multi-Agent Software Delivery Workflow

DevBand includes six software delivery stages:

1. Product planning
2. Implementation design
3. Test planning
4. Code review
5. Engineering revision
6. Documentation and release preparation

### Live Band Integration

DevBand connects to Band using the Band Agent REST API. It creates a real Band chat room and records each agent handoff as a Band event.

### Real AI/ML API Integration

DevBand uses AI/ML API through an OpenAI-compatible chat completions endpoint to generate agent outputs.

### Review-Driven Revision Loop

The Code Reviewer Agent can approve with suggestions, which triggers a Software Engineer Revision Agent before documentation is finalized.

### Downloadable PR Package

The frontend can export the completed delivery package as a Markdown file containing:

- Feature request
- Workflow details
- Band room details
- Agent outputs
- Band collaboration timeline
- Final PR title
- PR summary
- Release notes
- README update

### Cost Guard Logic

The backend includes safeguards to reduce unnecessary AI spending:

- Economical default model
- Output token limit
- Prompt length limit
- Daily/session request limit
- In-memory cache
- Mock fallback mode

---

## 5. Agent Roles

### 5.1 Product Planner Agent

Converts the user's raw feature request into a structured delivery plan.

Produces:

- User story
- Acceptance criteria
- Technical tasks
- Risks
- Handoff instruction for the Software Engineer Agent

### 5.2 Software Engineer Agent

Creates an implementation approach based on the planner output.

Produces:

- Files changed
- Implementation summary
- React code snippet
- Assumptions
- Handoff instruction for the Test Engineer Agent

### 5.3 Test Engineer Agent

Creates validation plans for the generated implementation.

Produces:

- Unit test ideas
- Integration test ideas
- Manual QA checklist
- Edge cases
- Handoff instruction for the Code Reviewer Agent

### 5.4 Code Reviewer Agent

Reviews the implementation and testing strategy.

Produces:

- Review status
- Quality score
- Maintainability feedback
- Accessibility feedback
- Security feedback
- Blocking issues
- Revision decision

### 5.5 Software Engineer Revision Agent

Handles review feedback and improves the implementation.

Produces:

- Revision summary
- Changes applied
- Revised code snippet
- Resolved review items
- Handoff instruction for the Documentation Agent

### 5.6 Documentation Agent

Creates the final PR-ready delivery package.

Produces:

- PR title
- PR summary
- Developer notes
- Release notes
- README update
- Final status

---

## 6. Architecture

```text
React Frontend
   │
   │ POST /api/workflows/start
   ▼
Node.js / Express Backend
   │
   ├── Workflow Service
   │      ├── Product Planner Agent
   │      ├── Software Engineer Agent
   │      ├── Test Engineer Agent
   │      ├── Code Reviewer Agent
   │      ├── Software Engineer Revision Agent
   │      └── Documentation Agent
   │
   ├── Model Service
   │      └── AI/ML API
   │
   └── Band Service
          └── Band Agent API
               ├── Create chat room
               └── Create task events
```

---

## 7. Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- CORS
- dotenv
- Nodemon for development

### AI Provider

- AI/ML API
- OpenAI-compatible chat completions format
- Recommended default model: `gpt-4o-mini`

### Collaboration Layer

- Band Agent API
- Live Band chat room creation
- Band task events for agent outputs and structured handoffs

### Hosting Plan

- Frontend: Vercel
- Backend: Render

---

## 8. Repository Structure

```text
devband/
  frontend/
    src/
      App.jsx
      index.css
      main.jsx
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

## 9. Environment Variables

Create this file locally:

```text
backend/.env
```

Use the following structure:

```env
PORT=5000

AGENT_MODE=ai
BAND_MODE=live

BAND_API_KEY=your_band_api_key_here
BAND_AGENT_ID=your_band_agent_id_here
BAND_AGENT_HANDLE=your_band_agent_handle_here
BAND_WORKSPACE_ID=
BAND_REST_URL=https://app.band.ai
BAND_WS_URL=wss://app.band.ai/api/v1/socket/websocket

AIML_API_KEY=your_aiml_api_key_here
AIML_BASE_URL=https://api.aimlapi.com/v1
AIML_MODEL=gpt-4o-mini
AIML_MAX_OUTPUT_TOKENS=700
AIML_MAX_PROMPT_CHARS=12000
AIML_DAILY_REQUEST_LIMIT=12

FEATHERLESS_API_KEY=
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_MODEL=Qwen/Qwen2.5-7B-Instruct
```

### Important Security Note

Never commit `backend/.env`.

The project `.gitignore` should include:

```gitignore
.env
backend/.env
frontend/.env
node_modules
dist
```

---

## 10. Modes

### Mock Agent Mode

Use mock output without spending AI credits:

```env
AGENT_MODE=mock
```

### AI Agent Mode

Use AI/ML API for real agent outputs:

```env
AGENT_MODE=ai
```

### Mock Band Mode

Use local mock Band timeline:

```env
BAND_MODE=mock
```

### Live Band Mode

Create real Band rooms and task events:

```env
BAND_MODE=live
```

---

## 11. Cost Guard Configuration

DevBand includes basic cost protection for AI usage.

Recommended development settings:

```env
AIML_MODEL=gpt-4o-mini
AIML_MAX_OUTPUT_TOKENS=700
AIML_MAX_PROMPT_CHARS=12000
AIML_DAILY_REQUEST_LIMIT=12
```

Why this matters:

- One workflow uses approximately six AI calls.
- `AIML_DAILY_REQUEST_LIMIT=12` allows roughly two full AI workflows per backend session/day counter.
- Use `AGENT_MODE=mock` while testing UI changes repeatedly.
- Increase the request limit only for final demo testing.

For final demo, a possible setting is:

```env
AIML_DAILY_REQUEST_LIMIT=60
```

---

## 12. Local Development Setup

### 12.1 Clone the Repository

```bash
git clone <your-repository-url>
cd devband
```

### 12.2 Install Backend Dependencies

```bash
cd backend
npm install
```

### 12.3 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 12.4 Start Backend

From the `backend` folder:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 12.5 Start Frontend

From the `frontend` folder:

```bash
npm run dev -- --host 0.0.0.0
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 13. GitHub Codespaces Setup

If using GitHub Codespaces:

1. Open the repository in Codespaces.
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

4. Open the forwarded port `5173` for the frontend.
5. Make sure backend port `5000` is also running.

---

## 14. API Endpoints

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
    "bandMode": "live"
  }
}
```

### Start Workflow

```http
POST /api/workflows/start
```

Request body:

```json
{
  "featureRequest": "Add a dark mode toggle to a React dashboard and persist selected theme across refreshes"
}
```

Successful response includes:

- Workflow ID
- Feature request
- Band room details
- Agent outputs
- Band message/event timeline
- Final PR package

---

## 15. Test with curl

```bash
curl -X POST http://localhost:5000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d "{\"featureRequest\":\"Add a dark mode toggle to a React dashboard and persist selected theme across refreshes\"}"
```

Expected indicators for successful AI and Band integration:

```json
"provider": "AI/ML API"
```

```json
"bandRoom": {
  "mode": "live",
  "liveBand": true
}
```

```json
"bandSuccess": true
```

---

## 16. Frontend Demo Flow

1. Open the DevBand frontend.
2. Enter or select a feature request.
3. Click **Start DevBand Workflow**.
4. Review the **Workflow Summary** metrics.
5. Review **How DevBand Uses Band**.
6. Inspect the live Band collaboration room details.
7. Inspect each agent output.
8. Review the Band message timeline.
9. Review the final PR package.
10. Click **Download PR Package** to export the generated Markdown delivery artifact.

---

## 17. How DevBand Uses Band

DevBand uses Band as the collaboration and coordination layer.

In live mode, DevBand:

1. Creates a real Band chat room for each workflow.
2. Posts the workflow start event to Band.
3. Posts each agent output as a structured Band task event.
4. Records agent handoffs and review decisions in the Band timeline.
5. Posts a workflow completion event after the final PR package is generated.

The current implementation uses Band events instead of normal text messages because the DevBand workflow is recording structured task activity rather than routing conversational messages to another participant.

---

## 18. Why Band Is Central to This Project

Band is not used only as a notification channel. DevBand uses Band as the shared collaboration layer where each step of the software delivery workflow is recorded.

Each agent output becomes part of the workflow state:

- Planner output informs Engineer output.
- Engineer output informs Tester output.
- Tester output informs Reviewer output.
- Reviewer output triggers Revision output.
- Revision output informs Documentation output.

The Band timeline acts as the audit trail for these handoffs.

---

## 19. Example Final Output

A completed DevBand workflow produces a PR-style package:

```text
PR Title: Implement user-requested frontend feature with persistent state

PR Summary:
This pull request implements the requested feature and includes planning,
implementation, tests, review feedback, revision handling, and release notes.

Release Notes:
- Added a new user-facing feature control.
- Added persistence-friendly behavior for user preference.
- Prepared test scenarios and QA checklist.
- Completed code review with no blocking issues.
- Resolved review suggestions through a revision handoff.

Final Status:
ready_for_submission
```

---

## 20. Deployment Plan

### Backend Deployment: Render

1. Create a new Web Service on Render.
2. Connect the GitHub repository.
3. Set root directory:

```text
backend
```

4. Build command:

```bash
npm install
```

5. Start command:

```bash
npm start
```

6. Add environment variables from `backend/.env` in Render dashboard.
7. Do not upload or commit `.env`.

### Frontend Deployment: Vercel

1. Import the GitHub repository in Vercel.
2. Set root directory:

```text
frontend
```

3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Add frontend environment variable if required:

```env
VITE_API_BASE_URL=https://your-render-backend-url
```

6. Update frontend API calls if deploying with a separate backend domain.

---

## 21. Hackathon Submission Details

### Project Title

```text
DevBand: Band-Powered Multi-Agent Software Delivery Team
```

### Short Description

```text
DevBand uses Band and AI/ML API to coordinate specialized software delivery agents that transform a feature request into a planned, implemented, tested, reviewed, revised, and documented PR package.
```

### Long Description

```text
DevBand is a Band-powered multi-agent software delivery workflow for enterprise engineering teams. A user submits a feature request, and specialized agents collaborate through Band to plan the change, generate an implementation approach, create tests, review quality and security, apply revision feedback, and produce a final PR-ready delivery package. AI/ML API powers the reasoning and generation for each agent, while Band records the collaboration room, structured handoffs, review decisions, and workflow timeline. The result is an auditable, downloadable software delivery artifact that demonstrates how agents can coordinate across the software development lifecycle.
```

### Suggested Tags

```text
Band
Multi-Agent
AI Agents
Software Development
Developer Tools
AI/ML API
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

## 22. Demo Script

### Opening

```text
DevBand is a Band-powered multi-agent software delivery team. Instead of using one AI assistant to answer a prompt, DevBand coordinates specialized agents through Band to move a feature request across planning, implementation, testing, review, revision, and documentation.
```

### Demo Steps

1. Show the feature request input.
2. Submit a sample feature request.
3. Show the workflow summary metrics.
4. Show that a live Band room was created.
5. Show each agent output.
6. Show the reviewer-driven revision loop.
7. Show the Band message timeline.
8. Show the final PR package.
9. Download the Markdown PR package.
10. Open Band dashboard and show the created room/events if available.

### Closing

```text
DevBand demonstrates how enterprise software delivery can move beyond isolated coding assistants into coordinated multi-agent workflows. Band provides the shared collaboration layer, AI/ML API powers each specialized agent, and the final output is an auditable PR-ready delivery package.
```

---

## 23. Known Limitations

- The current implementation uses one Band remote agent as the workflow coordinator while the backend runs six logical software delivery agents.
- Band events are used for structured workflow activity; future versions can add multiple individual Band remote agents.
- The generated code snippets are illustrative and not automatically committed to GitHub.
- GitHub PR creation is not yet automated.
- AI model outputs may occasionally include escaped JSX entities; a future cleanup step can decode or sanitize these outputs.

---

## 24. Future Improvements

- Create six separate Band remote agents, one for each software delivery role.
- Add GitHub issue and pull request integration.
- Add real repository context ingestion.
- Add generated file diffs instead of standalone snippets.
- Add human approval step before final PR package.
- Add WebSocket-based live progress streaming.
- Add model selection per agent.
- Add Featherless AI as an optional independent reviewer model.
- Add persistent database storage for workflow history.
- Add user authentication and team workspaces.

---

## 25. Safety and Reliability Notes

DevBand includes fallbacks so the demo remains reliable:

- If AI/ML API fails, DevBand falls back to deterministic mock output.
- If Band event posting fails, DevBand falls back to local timeline messages.
- If AI request limits are reached, DevBand stops calling the AI provider and uses fallback output.
- Secrets are loaded only from environment variables.

---

## 26. License

This project is intended for hackathon submission and educational demonstration. Add an MIT license file if required by the hackathon submission rules.

---

## 27. Credits

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

## 28. Final Project Summary

DevBand demonstrates a real enterprise-style multi-agent software delivery workflow. It uses AI agents not as isolated prompt responders, but as collaborating specialists that pass structured context, review each other’s work, trigger revision handoffs, and produce an audit-ready final delivery package through Band.
