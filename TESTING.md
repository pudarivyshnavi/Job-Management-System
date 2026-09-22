# Testing

Testing for the Job Management System has two parts:

1. **Automated backend tests** — 23 pytest cases in `backend/tests/test_api.py` covering CRUD, archive semantics, search, filters, validation, 404s, and JSON persistence.
2. **Manual end-to-end testing** — the complete workflow executed in a real browser (Chrome, desktop and mobile-width viewports) against the running app.

## Running the automated tests

```bash
cd backend
.venv\Scripts\python -m pytest tests/ -v     # Windows
# or: .venv/bin/python -m pytest tests/ -v   # Linux/macOS
```

Result from the final run:

```
======================= 23 passed, 2 warnings in 1.23s ========================
```

The test fixture copies `jobs.json` into a temporary folder for every test, so the real data file is never modified by the test suite.

## Manual test cases

Environment used: Windows 11, Python 3.14 (FastAPI 0.141, Pydantic 2.13), Node 22 (Vite 5.4, React 18). Backend on `http://127.0.0.1:8000`, frontend on `http://localhost:5173`.

| # | Test Case | Expected Result | Actual Result | Status |
| - | --------- | --------------- | ------------- | ------ |
| 1 | View all jobs | Jobs page shows 18 sample jobs in the table with all columns | 18 rows rendered with title, company, location, experience, type, status badge, created date, actions | ✅ Pass |
| 2 | View individual job | `/jobs/1` shows full details: title, company, location, status, type, experience, created date, description, skills | All fields rendered correctly with skill chips and Active badge | ✅ Pass |
| 3 | Create valid job | POST succeeds; success toast "Job created successfully."; app navigates to the new job's details | Job #19 "Cloud Support Engineer" created, toast shown, details page opened | ✅ Pass |
| 4 | Submit empty job form | Field-level errors for all 8 required fields; nothing saved | 8 field errors shown ("Job title is required." etc.), no request sent | ✅ Pass |
| 5 | Submit invalid job data (whitespace-only company, `"   "`) | Company rejected with "Company is required." | Only the company field errored; other values preserved | ✅ Pass |
| 6 | Edit job | `/jobs/1/edit` pre-filled; after save, details show updated data with "Job updated successfully." | Title changed to "Senior Python Developer"; toast shown; details updated | ✅ Pass |
| 7 | Archive job | Confirmation dialog "Are you sure you want to archive this job?" appears; after confirming, status becomes Archived with "Job archived successfully." | Dialog shown with job title; after confirm, badge = Archived, toast shown | ✅ Pass |
| 8 | Open nonexistent job (`/jobs/9999`) | "Job Not Found" page with a Back to Jobs link; HTTP 404 from backend | Dedicated not-found page rendered; API returned 404 | ✅ Pass |
| 9 | Search by title (`pyth`) | Backend returns partial, case-insensitive title match | Only "Python Developer" listed (request: `/api/jobs?search=pyth`) | ✅ Pass |
| 10 | Search by company (`nimbus`) | Company match returned | "Python Developer" @ Nimbus Labs returned | ✅ Pass |
| 11 | Filter by location (`Hyderabad`) | Only Hyderabad jobs shown | 3 jobs (Python Developer, DevOps Engineer, Java Developer) | ✅ Pass |
| 12 | Filter by experience (`2-4 years`) | Only 2-4 years jobs shown | Backend returned only 2-4 years jobs (6 jobs) | ✅ Pass |
| 13 | Filter by employment type (`Full-time`) | Only Full-time jobs shown | Backend returned only Full-time jobs | ✅ Pass |
| 14 | Filter by status (`Archived`) | Only Archived jobs shown | DevOps Engineer, Product Manager, Data Entry Operator + the newly archived job | ✅ Pass |
| 15 | Combine filters + search (`search=python&location=Hyderabad&employment_type=Full-time&status=Active`) | Only jobs matching every criterion | Exactly 1 job: "Python Developer" | ✅ Pass |
| 16 | Search with no result (`zzz`) | "No jobs found matching your criteria." empty state | Empty state rendered with illustration and message | ✅ Pass |
| 17 | Clear filters | All filters and search reset; full list returns | Inputs cleared, 18 jobs shown again (Clear Filters button disabled when nothing active) | ✅ Pass |
| 18 | Backend unavailable | Friendly error, no crash, no raw stack trace | Stopped uvicorn: banner "Unable to connect to the server. Please make sure the backend is running."; page recovered after restart | ✅ Pass |
| 19 | Verify JSON persistence | jobs.json reflects every change; valid formatted JSON | After create: 19 jobs; job #19 present with `created_date: 2026-09-19` | ✅ Pass |
| 20 | Refresh after creating a job | Created job still visible after F5 | Reloaded `/jobs`: count 19; job #19 in the list | ✅ Pass |
| 21 | Refresh after editing | Edited title still shown after F5 | GET `/api/jobs/1` after reload returned "Senior Python Developer" and updated description | ✅ Pass |
| 22 | Archived job remains in JSON | DELETE does not remove the record; status becomes "Archived" | jobs.json still contains 19 records; job #19 status = Archived | ✅ Pass |
| 23 | Archived job appears under Archived filter | Filtering by Archived lists the archived job | "Cloud Support Engineer" listed among Archived jobs in the UI | ✅ Pass |

## Verification notes

- The 23 automated tests validate the same behaviors at the API level (they run against a temporary copy of the data file).
- The backend-down scenario (#18) was verified by actually killing the uvicorn process and observing the frontend error banner, then restarting it and confirming recovery.
- Browser checks were performed via the DOM (text, badges, toasts, dialogs) and screenshots at desktop and mobile widths; no horizontal overflow was observed.
- Summary cards were cross-checked against the API: Total 18→19, Active 11→11, Draft 4, Archived 3→4 after the test job was archived.
