# Deployment guide

## Architecture

```text
Browser
  -> Netlify (React/Vite static frontend)
  -> Render (FastAPI API)
  -> backend/data/*.json
```

The existing JSON storage and API routes are unchanged. The backend reads and
writes JSON files in its application directory. This is suitable for a
single-instance demo, not durable or concurrent production storage.

## Deploy the backend to Render

1. Make the deployment files available in the Git branch you plan to deploy.
   No service has been deployed by this repository setup.
2. In Render, create a new **Blueprint** from the repository and select the
   branch containing `render.yaml`.
3. Review the service settings from the Blueprint:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Health check path: `/health`
   - Plan: Free
4. Deploy and copy the public HTTPS service URL from the Render dashboard. Do
   not add a trailing slash when setting it in Netlify.
5. After creating the Netlify site, update the Render service's
   `CORS_ORIGINS` environment variable to include its exact origin, for example:
   `https://your-site-name.netlify.app,http://localhost:5173,http://127.0.0.1:5173`
   Origins must include the scheme and must not have a trailing slash. Save the
   change and allow Render to redeploy.

`render.yaml` asks Render to generate `AUTH_SECRET`. Keep that generated value
private. If deploying without the Blueprint, set `AUTH_SECRET` to a long,
random value in the Render dashboard; do not use the local demo fallback.

The Blueprint uses Render's free web-service plan, whose filesystem is
ephemeral. Changes to JSON data, including new accounts and jobs, can be lost
when the instance is replaced or redeployed. Do not use real candidate or
recruiter data. A persistent disk is not included in this free configuration,
and even a disk would not make the current file-based store safe for multiple
instances or concurrent production use. Free services may also spin down after
inactivity, so the first request after an idle period can take longer.

### Backend environment variables

| Variable | Required | Value |
| --- | --- | --- |
| `AUTH_SECRET` | Yes for deployment | A long, random signing secret; generated automatically by the Blueprint. |
| `CORS_ORIGINS` | Yes | Comma-separated, exact origins for the deployed Netlify site. Local origins may also be included for development. |
| `OLLAMA_URL` | No | URL of an Ollama service reachable by the backend. |
| `OLLAMA_MODEL` | No | Ollama model name; defaults to `llama3.2`. |
| `OLLAMA_TIMEOUT_SECONDS` | No | Ollama request timeout; defaults to `8`. |

Ollama is optional. A Render service cannot reach Ollama running on your
development computer via `localhost`; if no reachable Ollama service is
configured, AI assistance uses the existing deterministic fallback. Point
`OLLAMA_URL` only at an Ollama service that the backend can actually reach.

## Deploy the frontend to Netlify

1. Create a Netlify site from the same repository and deployment branch.
2. `netlify.toml` configures the frontend base directory, build command, publish
   directory, and React Router fallback:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. In the Netlify site's environment variables, set
   `VITE_API_URL` to the public Render HTTPS service URL, with no trailing
   slash. This variable is used at build time, so trigger a new deploy after
   changing it.
4. Copy the Netlify site's exact HTTPS origin into Render's `CORS_ORIGINS`
   setting as described above.
5. Open and refresh `/`, `/jobs`, `/login`, and a protected route such as
   `/dashboard`. The `/*` to `/index.html` rule allows React Router to handle
   direct navigation; the route's existing authentication behavior remains in
   effect.

No credentials, tokens, or signing secrets belong in Netlify environment
variables. `VITE_API_URL` is a public API address and is not a secret. In a
production build, the frontend does not fall back to a localhost API. If
`VITE_API_URL` is missing, API requests show a configuration error rather than
silently targeting a local server.

## Health and API checks

After deployment, open:

```text
https://your-render-service.onrender.com/health
```

Expected response: HTTP 200 with `{"status":"healthy"}`. Interactive API
documentation remains available at `/docs`.

Sign up using fictional demo data, sign in, reload a protected page to verify
session restoration, and sign out. Confirm that protected API calls require the
bearer token while public job browsing remains available. Test create/update/
archive/restore only with disposable demo records because changes are written
to the ephemeral JSON files.

Resume analysis accepts authenticated TXT, PDF, and DOCX multipart uploads up
to 5 MB. Files are read for analysis and are not persisted by the application.
The browser supplies the multipart boundary; do not manually set the
`Content-Type` header for these requests.

## Environment examples and local development

The checked-in `backend/.env.example` and `frontend/.env.example` contain
placeholders and local development values only. `.env` files are ignored by
Git. Vite reads `frontend/.env` automatically. FastAPI does not load
`backend/.env` automatically, so set backend values in the shell or configure
an environment-file loader in your local tooling.

From PowerShell, start the API from `backend`:

```powershell
.venv\Scripts\Activate.ps1
$env:CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
uvicorn app.main:app --reload
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The local API default is `http://127.0.0.1:8000`. To use another local API
address, set `VITE_API_URL` in `frontend/.env`.

## Verification checklist

- [ ] Render reports the service healthy at `/health`.
- [ ] `/docs` loads from the Render service.
- [ ] Netlify environment has `VITE_API_URL` set to the Render HTTPS URL, then
      the frontend has been rebuilt.
- [ ] Render `CORS_ORIGINS` includes the exact Netlify HTTPS origin.
- [ ] Public pages load directly and after refresh; protected routes retain
      their existing sign-in behavior.
- [ ] Sign-up, sign-in, session restoration, sign-out, jobs, applications,
      candidates, interviews, analytics, notifications, and AI fallback work.
- [ ] Resume TXT, PDF, and DOCX analysis, including the 5 MB limit, works with
      an authenticated request.
- [ ] Only fictional demo data is used, and the team understands that free
      Render JSON changes are not durable.
