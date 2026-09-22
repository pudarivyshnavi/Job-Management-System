# Frontend — Job Management System

React + Vite recruiter interface for the Job Management System.

**All job data is loaded and updated through the FastAPI backend. This app never reads or writes `jobs.json` directly.**

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (the dev server is pinned to port 5173).

## Routes

| Route             | Page          | Description |
| ----------------- | ------------- | ----------- |
| `/jobs`           | Jobs list     | Dashboard with Total/Active/Draft/Archived summary cards, search bar, four filter dropdowns, jobs table, empty states |
| `/jobs/new`       | Create job    | Validated job form; navigates to the new job's details with a success toast |
| `/jobs/:id`       | Job details   | Complete job view with Edit / Archive (confirmation dialog) / Back actions; "Job Not Found" for bad ids |
| `/jobs/:id/edit`  | Edit job      | Pre-filled form loaded from the API; saves via PUT and returns to details |

## API connection

All HTTP calls live in one module: `src/services/api.js`.

- Base URL: `http://127.0.0.1:8000` (change it once here if the backend moves)
- `getJobs(params)` — list + search + filters
- `getJob(id)` — one job
- `createJob(job)` — POST
- `updateJob(id, job)` — PUT
- `archiveJob(id)` — DELETE (backend archives, does not delete)

Network failures and non-2xx responses are converted into friendly `ApiError` messages that the pages display in banners and toasts. Search requests are debounced (300 ms) on the Jobs page; dropdown filters call the backend immediately.

## Shared constants

`src/services/constants.js` exports the location/experience/employment-type/status option lists used by both the filters and the form, plus small helpers for date formatting and comma-separated skills.

## Components

`Header`, `JobTable`, `JobForm`, `SearchFilters`, `StatusBadge`, `ConfirmDialog`, `Toast`, `EmptyState`, `Banner` — small, single-purpose components kept beginner-readable.

## Build

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```
