# Backend — Job Management System API

FastAPI REST API for the Job Management System. It owns all job data: reading, writing, validation, search, filtering, and archiving.

**Job data is stored in `data/jobs.json`. The frontend must not read or write this file directly — every operation goes through this API.**

## Setup and run

```bash
cd backend

python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

- API base URL: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- Liveness check: http://127.0.0.1:8000/

## Dependencies

| Package   | Purpose                                        |
| --------- | ---------------------------------------------- |
| FastAPI   | Web framework and routing                      |
| Pydantic  | Request/response validation (schemas)          |
| Uvicorn   | ASGI development server                        |
| pytest + httpx | Test-only dependencies for the test suite |

## Code layout

```
app/
├── main.py      # Routes, CORS, exception handlers, Swagger metadata
├── schemas.py   # Pydantic models: JobCreate, JobUpdate, JobResponse + field validators
├── models.py    # Typed models for a job record
├── services.py  # JSON read/write, CRUD, search, filter logic
└── utils.py     # Data-file path, id generation, matching helpers
tests/
└── test_api.py  # 23 automated API tests (pytest + TestClient)
```

## API

| Method | Endpoint             | Description | Success | Errors |
| ------ | -------------------- | ----------- | ------- | ------ |
| GET    | `/api/jobs`          | List jobs; supports `search`, `location`, `experience`, `employment_type`, `status` query params (combinable) | 200 | 500 |
| GET    | `/api/jobs/{job_id}` | Get one job | 200 | 404 |
| POST   | `/api/jobs`          | Create a job (server assigns `id` and `created_date`) | 201 | 422 |
| PUT    | `/api/jobs/{job_id}` | Update all editable fields (`id` and `created_date` preserved) | 200 | 404, 422 |
| DELETE | `/api/jobs/{job_id}` | **Archive**: sets `status` to `Archived`; the record is NOT removed | 200 | 404 |

### Query parameter details

- `search` — case-insensitive partial match on title or company (`pyth` finds `Python Developer`).
- `location`, `experience`, `employment_type`, `status` — case-insensitive exact matches, combinable with each other and with `search`.

### Validation rules (Pydantic)

- All fields are required: `title`, `company`, `location`, `description`, `required_skills`, `experience`, `employment_type`, `status`.
- Strings must be non-blank after trimming (whitespace-only is rejected).
- `employment_type` must be one of: `Full-time`, `Part-time`, `Internship`, `Contract`.
- `status` must be one of: `Active`, `Draft`, `Archived`.
- `required_skills` must contain at least one non-blank skill.

## JSON storage

- Data lives in `data/jobs.json` as a formatted JSON array (indent 2, UTF-8).
- Reads parse the file safely; a missing or corrupt file returns a clean HTTP 500 instead of crashing the server.
- Writes are atomic: the file is written to a temp file and then replaced, so a crash can never leave a half-written data file. A thread lock serializes concurrent writes.
- `DELETE` never removes a record — it flips `status` to `Archived` so history is preserved.

## Tests

```bash
.venv\Scripts\python -m pytest tests/ -v      # Windows
# or: .venv/bin/python -m pytest tests/ -v    # Linux/macOS
```

Each test runs against a temporary copy of `jobs.json`, so the real data file is never touched. The suite covers CRUD, archive-not-delete semantics, search (title/company/partial/no-match), every filter, combined filters, validation rejections, 404s, and corrupt-file handling.
