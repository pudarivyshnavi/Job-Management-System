import os

from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.ai_service import assist
from app.auth_service import (
    authenticate,
    get_user_from_token,
    issue_token,
    public_user,
    signup,
)
from app.data_store import collection_snapshot
from app.matching import match_candidate
from app.resume_service import analyse_resume
from app.schemas import (
    AiRequest,
    ApplicationUpdate,
    InterviewCreate,
    JobCreate,
    JobResponse,
    JobUpdate,
    LoginRequest,
    SignupRequest,
)
from app.services import (
    JobDataError,
    JobNotFoundError,
    archive_job,
    create_job,
    get_job,
    list_jobs,
    update_job,
)
from app.workflow import (
    change_job_status,
    create_interview,
    duplicate_job,
    list_applications,
    update_application,
)


app = FastAPI(
    title="Job Management System API",
    description=(
        "Recruiter API for managing fictional job openings stored in a JSON file "
        "(`backend/data/jobs.json`). The React frontend talks only to this API; "
        "it never touches the JSON file itself."
    ),
    version="1.0.0",
)

DEMO_CANDIDATES = [
    {
        "id": 1,
        "name": "Aarav Mehta",
        "role": "Backend Engineer",
        "location": "Bengaluru",
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "experience": "4 years",
        "status": "Shortlisted",
    },
    {
        "id": 2,
        "name": "Mira Shah",
        "role": "Product Designer",
        "location": "Remote",
        "skills": ["Figma", "Research", "Design systems"],
        "experience": "5 years",
        "status": "Under Review",
    },
    {
        "id": 3,
        "name": "Jon Bell",
        "role": "Frontend Engineer",
        "location": "Pune",
        "skills": ["React", "TypeScript", "Testing"],
        "experience": "3 years",
        "status": "Interview",
    },
]

DEMO_APPLICATIONS = [
    {
        "id": 1,
        "candidate": "Aarav Mehta",
        "job": "Senior Backend Engineer",
        "stage": "Shortlisted",
        "applied_date": "2026-09-18",
    },
    {
        "id": 2,
        "candidate": "Mira Shah",
        "job": "Product Designer",
        "stage": "Under Review",
        "applied_date": "2026-09-17",
    },
    {
        "id": 3,
        "candidate": "Jon Bell",
        "job": "Frontend Engineer",
        "stage": "Interview",
        "applied_date": "2026-09-15",
    },
]

DEMO_NOTIFICATIONS = [
    {
        "id": 1,
        "title": "New application received",
        "message": "Aarav Mehta applied for Senior Backend Engineer.",
        "time": "18 min ago",
        "read": False,
    },
    {
        "id": 2,
        "title": "Interview reminder",
        "message": "Jon Bell's interview is scheduled for tomorrow.",
        "time": "2 hours ago",
        "read": False,
    },
    {
        "id": 3,
        "title": "Job published",
        "message": "Senior Backend Engineer is now visible publicly.",
        "time": "Yesterday",
        "read": True,
    },
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_user(authorization: str | None = Header(default=None)) -> dict:
    token = authorization.removeprefix("Bearer ").strip() if authorization else None
    user = get_user_from_token(token)
    if user is None:
        raise HTTPException(
            status_code=401, detail="Please sign in to access the recruiter workspace."
        )
    return user


@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED)
def signup_account(payload: SignupRequest) -> dict:
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=422, detail="Passwords do not match.")
    try:
        user = signup(payload.name, payload.email, payload.password, payload.company)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"user": user, "message": "Account created. You can now sign in."}


@app.post("/api/auth/login")
def login_account(payload: LoginRequest) -> dict:
    user = authenticate(payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return {"token": issue_token(int(user["id"])), "user": public_user(user)}


@app.get("/api/auth/me")
def auth_me(user: dict = Depends(current_user)) -> dict:
    return public_user(user)


@app.post("/api/auth/logout")
def logout_account(user: dict = Depends(current_user)) -> dict:
    return {"message": "Signed out successfully."}


@app.get("/", include_in_schema=False)
def health_check() -> dict[str, str]:
    """Simple liveness check so users can confirm the API is running."""
    return {"status": "ok", "docs": "/docs"}


@app.get("/health")
def health_endpoint() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/api/candidates")
def get_candidates(
    search: str | None = None, user: dict = Depends(current_user)
) -> list[dict]:
    records = collection_snapshot("candidates")
    query = (search or "").strip().lower()
    return [record for record in records if not query or query in str(record).lower()]


@app.get("/api/applications")
def get_applications(
    search: str | None = None,
    status: str | None = None,
    user: dict = Depends(current_user),
) -> list[dict]:
    return list_applications(search=search, status=status)


@app.get("/api/notifications")
def get_notifications(user: dict = Depends(current_user)) -> list[dict]:
    return collection_snapshot("notifications")


@app.get("/api/interviews")
def get_interviews(user: dict = Depends(current_user)) -> list[dict]:
    return collection_snapshot("interviews")


@app.post("/api/interviews", status_code=status.HTTP_201_CREATED)
def schedule_interview(
    payload: InterviewCreate, user: dict = Depends(current_user)
) -> dict:
    return create_interview(payload.model_dump())


@app.patch("/api/applications/{application_id}")
def change_application(
    application_id: int, payload: ApplicationUpdate, user: dict = Depends(current_user)
) -> dict:
    try:
        return update_application(application_id, payload.status, payload.notes)
    except ValueError as exc:
        return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.get("/api/analytics")
def get_analytics(user: dict = Depends(current_user)) -> dict:
    jobs = list_jobs()
    applications = collection_snapshot("applications")
    candidates = collection_snapshot("candidates")
    interviews = collection_snapshot("interviews")
    return {
        "jobs_by_status": {
            key: sum(job["status"] == key for job in jobs)
            for key in ("Active", "Draft", "Archived")
        },
        "jobs_by_type": {
            key: sum(job["employment_type"] == key for job in jobs)
            for key in ("Full-time", "Contract", "Internship", "Part-time")
        },
        "applications_by_stage": {
            key: sum(item.get("stage") == key for item in applications)
            for key in (
                "Applied",
                "Under Review",
                "Shortlisted",
                "Interview",
                "Selected",
                "Rejected",
            )
        },
        "counts": {
            "jobs": len(jobs),
            "candidates": len(candidates),
            "applications": len(applications),
            "interviews": len(interviews),
        },
        "demo": True,
    }


@app.post("/api/ai/generate")
def generate_job_assistance(
    payload: AiRequest, user: dict = Depends(current_user)
) -> dict:
    result = assist(payload.prompt, payload.action, payload.use_fallback)
    return {
        "available": result.available,
        "source": result.source,
        "message": result.message,
        **(result.content or {}),
    }


@app.post("/api/ai/check")
def check_job_quality(payload: AiRequest, user: dict = Depends(current_user)) -> dict:
    result = assist(payload.prompt, "quality", payload.use_fallback)
    return {
        "available": result.available,
        "source": result.source,
        "message": result.message,
        **(result.content or {}),
    }


@app.get("/api/matching/{candidate_id}/{job_id}")
def candidate_match(
    candidate_id: int, job_id: int, user: dict = Depends(current_user)
) -> dict:
    candidate = next(
        (
            item
            for item in collection_snapshot("candidates")
            if item.get("id") == candidate_id
        ),
        None,
    )
    job = get_job(job_id)
    if candidate is None:
        return JSONResponse(
            status_code=404, content={"detail": "Candidate was not found."}
        )
    return {"candidate": candidate, "job": job, **match_candidate(candidate, job)}


@app.post("/api/resumes/analyse")
async def analyse_uploaded_resume(
    file: UploadFile = File(...),
    job_id: str | None = Form(default=None),
    role: str | None = Form(default=None),
    user: dict = Depends(current_user),
) -> dict:
    content = await file.read()
    job = None
    if job_id:
        try:
            job = get_job(int(job_id))
        except (TypeError, ValueError):
            if not role:
                raise HTTPException(
                    status_code=400, detail="The selected role was invalid."
                )
        except JobNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    try:
        return analyse_resume(
            file.filename or "resume.txt",
            content,
            job=job,
            role_name=role or (job.get("title") if job else None),
        )
    except ValueError as exc:
        return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(JobNotFoundError)
async def job_not_found_handler(_, exc: JobNotFoundError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)}
    )


@app.exception_handler(JobDataError)
async def job_data_error_handler(_, exc: JobDataError) -> JSONResponse:
    # Corrupt/missing data file or write failure: report 500 without leaking paths.
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(_, exc: Exception) -> JSONResponse:
    # Last-resort handler: never leak stack traces to API consumers.
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred."},
    )


@app.get(
    "/api/jobs",
    response_model=list[JobResponse],
    summary="List jobs",
    description=(
        "Returns all jobs, optionally narrowed by a text `search` and by filters. "
        "Search matches the job title or company, case-insensitively and partially "
        "(`pyth` finds `Python Developer`). All filters can be combined freely, "
        "for example `/api/jobs?search=python&location=Hyderabad&status=Active`."
    ),
)
def get_jobs(
    search: str | None = Query(
        default=None, description="Case-insensitive partial match on title or company."
    ),
    location: str | None = Query(
        default=None, description="Exact (case-insensitive) match on location."
    ),
    experience: str | None = Query(
        default=None, description="Exact (case-insensitive) match, e.g. `2-4 years`."
    ),
    employment_type: str | None = Query(
        default=None, description="Exact (case-insensitive) match, e.g. `Full-time`."
    ),
    status: str | None = Query(
        default=None,
        description="Exact (case-insensitive) match: `Active`, `Draft` or `Archived`.",
    ),
    title: str | None = None,
    company: str | None = None,
    skills: str | None = None,
    work_mode: str | None = None,
    created_date: str | None = None,
) -> list[JobResponse]:
    return list_jobs(
        search=search,
        location=location,
        experience=experience,
        employment_type=employment_type,
        status=status,
        title=title,
        company=company,
        skills=skills,
        work_mode=work_mode,
        created_date=created_date,
    )


@app.get(
    "/api/jobs/{job_id}",
    response_model=JobResponse,
    summary="Get one job",
    description="Returns a single job by id, or 404 if no job with that id exists.",
    responses={404: {"description": "Job not found"}},
)
def get_single_job(job_id: int) -> JobResponse:
    return get_job(job_id)


@app.post(
    "/api/jobs",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a job",
    description=(
        "Creates a job with server-assigned `id` and `created_date`. Every field is "
        "required; strings must not be blank and `required_skills` needs at least one "
        "non-blank entry. Invalid payloads are rejected with HTTP 422 details."
    ),
    responses={422: {"description": "Validation error"}},
)
def create_single_job(
    payload: JobCreate, user: dict = Depends(current_user)
) -> JobResponse:
    return create_job(payload)


@app.put(
    "/api/jobs/{job_id}",
    response_model=JobResponse,
    summary="Update a job",
    description=(
        "Replaces all editable fields of an existing job. `id` and `created_date` "
        "are preserved. Returns 404 if the job does not exist."
    ),
    responses={
        404: {"description": "Job not found"},
        422: {"description": "Validation error"},
    },
)
def update_single_job(
    job_id: int, payload: JobUpdate, user: dict = Depends(current_user)
) -> JobResponse:
    return update_job(job_id, payload)


@app.delete(
    "/api/jobs/{job_id}",
    response_model=JobResponse,
    summary="Archive a job",
    description=(
        "Soft delete: the job is NOT removed. Its status is set to `Archived` so it "
        "remains in the JSON file and shows up under the Archived filter. "
        "Returns 404 if the job does not exist."
    ),
    responses={404: {"description": "Job not found"}},
)
def archive_single_job(job_id: int, user: dict = Depends(current_user)) -> JobResponse:
    return archive_job(job_id)


@app.post(
    "/api/jobs/{job_id}/duplicate",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_single_job(
    job_id: int, user: dict = Depends(current_user)
) -> JobResponse:
    return duplicate_job(job_id)


@app.post("/api/jobs/{job_id}/restore", response_model=JobResponse)
def restore_single_job(job_id: int, user: dict = Depends(current_user)) -> JobResponse:
    return change_job_status(job_id, "Active")


@app.post("/api/jobs/{job_id}/close", response_model=JobResponse)
def close_single_job(job_id: int, user: dict = Depends(current_user)) -> JobResponse:
    return change_job_status(job_id, "Closed")


@app.post("/api/jobs/{job_id}/reopen", response_model=JobResponse)
def reopen_single_job(job_id: int, user: dict = Depends(current_user)) -> JobResponse:
    return change_job_status(job_id, "Open")
