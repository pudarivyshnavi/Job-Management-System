# Jobboard

Jobboard is a professional recruitment operations demo built on the original internship requirement: React talks to a FastAPI REST API, and the API owns a JSON data layer. All people, companies, roles, and metrics in the repository are fictional sample data.

## Product surface

- Public landing page and searchable job catalogue at `/` and `/jobs`
- Recruiter dashboard at `/dashboard` with role metrics, activity, and recent applications
- Preserved job CRUD, validation, search, filters, detail views, and soft archive workflow
- Candidate, application, notification, interview, analytics, activity, users, and settings views
- Optional Ollama AI assistant at `/ai-assistant` with deterministic fallback suggestions and a clear disclosure
- Candidate matching with transparent weighted scoring, resume analysis for TXT/PDF/DOCX, and recruiter-only decision support
- Application Kanban workflow with search, filtering, status changes, and interview scheduling
- Five-step create-job wizard with draft/publish choices, duplicate/restore/close/reopen job actions, and advanced filters
- Responsive layout, keyboard focus states, semantic labels, empty/error states, and confirmation dialogs
- SEO metadata, `robots.txt`, and a starter `sitemap.xml`

## Architecture

```text
React + Vite
    |
    | REST / JSON
    v
FastAPI + Pydantic
    |
    v
backend/data/*.json
```

The frontend never reads or writes JSON files. The JSON store is intentionally retained for the internship assignment and is not a multi-user production database.

## Stack and structure

- Frontend: React 18, React Router, Vite, CSS
- Backend: Python, FastAPI, Pydantic, Uvicorn
- Tests: pytest and FastAPI TestClient
- Authentication: demo bearer-token sessions with PBKDF2 password hashes stored in JSON

```text
backend/app/       API routes, schemas, services, and data access
backend/data/      Fictional JSON records
backend/tests/     API and persistence tests
frontend/src/      Components, pages, services, and styling
frontend/public/   robots.txt and sitemap.xml
.vscode/           Launch and task configuration
```

## Local development

```powershell
# Backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

# In a second terminal
cd frontend
npm install
npm run dev
```

The development frontend runs on port 5173 and the API on port 8000. Set `VITE_API_URL` for another API origin; production CORS should be restricted to the deployed frontend origin.

Copy the environment examples when configuring local settings:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

## Demo authentication

The public landing page, job catalogue, and job details are available without an account. Recruiter workspace routes redirect to `/login` until a session exists. Use `/signup` to create a fictional recruiter account, then sign in. Passwords are never stored in plain text; the backend stores PBKDF2-SHA256 hashes in `backend/data/users.json`. This is local/demo authentication, not production identity infrastructure. Logout clears the browser token and the backend accepts only signed, expiring bearer tokens.

## API

Interactive documentation is available at `/docs`. Core routes are:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Health status |
| POST | `/api/auth/signup` | Create a demo recruiter account |
| POST | `/api/auth/login` | Return a signed expiring bearer token |
| GET | `/api/auth/me` | Return the current recruiter |
| POST | `/api/auth/logout` | Complete the demo logout flow |
| GET | `/api/jobs` | Searchable and filterable jobs |
| GET | `/api/jobs/{id}` | Job details |
| POST | `/api/jobs` | Create a validated job |
| PUT | `/api/jobs/{id}` | Update a job |
| DELETE | `/api/jobs/{id}` | Archive without deleting |
| GET | `/api/candidates` | Fictional candidate examples |
| GET | `/api/applications` | Searchable and filterable application pipeline |
| PATCH | `/api/applications/{id}` | Change stage and append status history |
| GET/POST | `/api/interviews` | List and schedule interviews |
| GET | `/api/notifications` | Local sample notifications |
| GET | `/api/analytics` | Demo metrics |
| POST | `/api/ai/generate` | Ollama or deterministic job assistance |
| GET | `/api/matching/{candidate_id}/{job_id}` | Transparent candidate/job comparison |
| POST | `/api/resumes/analyse` | Extract profile signals from TXT/PDF/DOCX |
| POST | `/api/jobs/{id}/duplicate` | Create a draft copy |
| POST | `/api/jobs/{id}/restore` | Restore an archived job |
| POST | `/api/jobs/{id}/close` | Close a job without deleting it |
| POST | `/api/jobs/{id}/reopen` | Reopen a closed job |

## AI and privacy

The assistant optionally calls a local Ollama server. Configure `OLLAMA_URL`, `OLLAMA_MODEL`, and `OLLAMA_TIMEOUT_SECONDS` in the backend environment. No API key is required. If Ollama is unavailable, the service returns clearly marked deterministic suggestions and the UI says: "AI service is currently unavailable. You can continue using the standard job creation workflow." The assistant never claims fallback text came from a model.

Candidate matching uses a transparent score: 60% required skills, 20% preferred skills, and 20% experience. It is decision support only; recruiters make the final decision. Resume uploads are limited to 5 MB and TXT, PDF, and DOCX formats. Extracted resume data is not persisted automatically.

## SEO

The public site includes titles, description, canonical metadata, Open Graph metadata, `robots.txt`, and `sitemap.xml`. SEO configuration prepares the site for indexing after public deployment; local development does not make the site searchable on Google. Replace the relative sitemap URLs with the deployed absolute site URL before submission.

## Testing and build

```powershell
backend\.venv\Scripts\python.exe -m pytest backend\tests -v
cd frontend
npm run build
```

## Deployment

Build the frontend with `npm run build` and deploy `frontend/dist` to Vercel or another static host. Deploy the FastAPI app to Render, Railway, Fly.io, or equivalent with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Configure `VITE_API_URL` at frontend build time and production CORS in the backend. Expose `/health` as the service health check. Update the absolute sitemap URL before submitting it to a search engine.

## Implemented features

Ollama integration, AI job generation/title/skills/summary/improvement/quality actions, deterministic fallback behavior, candidate matching, resume extraction, application status history, interview scheduling, job lifecycle controls, advanced search, and the five-step job wizard are implemented in the current version.

## Known limitations / future improvements

The JSON store is appropriate for a single-user demo and internship submission, not concurrent production use. Authentication and permissions, persistent extracted candidate profiles, full calendar integration, and a database migration remain future improvements. No real personal information or secrets belong in this repository.
