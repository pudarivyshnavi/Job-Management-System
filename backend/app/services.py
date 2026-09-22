import json
import threading
from typing import Optional

from app.models import Job
from app.schemas import JobCreate, JobUpdate
from app.utils import (
    JOBS_FILE,
    case_insensitive_match,
    contains_ignore_case,
    generate_job_id,
    today_iso,
)


_file_lock = threading.Lock()


class JobNotFoundError(Exception):
    def __init__(self, job_id: int) -> None:
        self.job_id = job_id
        super().__init__(f"Job with id {job_id} was not found.")


class JobDataError(Exception):
    pass


def read_jobs() -> list[Job]:
    try:
        with JOBS_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError as exc:
        raise JobDataError("Job data file was not found.") from exc
    except json.JSONDecodeError as exc:
        raise JobDataError("Job data file contains invalid JSON.") from exc
    except OSError as exc:
        raise JobDataError("Job data file could not be read.") from exc

    if not isinstance(data, list):
        raise JobDataError("Job data file must contain a JSON array.")
    return data


def write_jobs(jobs: list[Job]) -> None:
    JOBS_FILE.parent.mkdir(parents=True, exist_ok=True)
    temp_file = JOBS_FILE.with_suffix(".json.tmp")
    try:
        with temp_file.open("w", encoding="utf-8") as file:
            json.dump(jobs, file, indent=2, ensure_ascii=False)
            file.write("\n")
        temp_file.replace(JOBS_FILE)
    except OSError as exc:
        raise JobDataError("Job data file could not be saved.") from exc
    finally:
        if temp_file.exists():
            temp_file.unlink(missing_ok=True)


def get_all_jobs() -> list[Job]:
    with _file_lock:
        return read_jobs()


def get_job(job_id: int) -> Job:
    with _file_lock:
        jobs = read_jobs()
    for job in jobs:
        if job["id"] == job_id:
            return job
    raise JobNotFoundError(job_id)


def create_job(payload: JobCreate) -> Job:
    with _file_lock:
        jobs = read_jobs()
        new_job: Job = {
            "id": generate_job_id(jobs),
            **payload.model_dump(),
            "created_date": today_iso(),
        }
        jobs.append(new_job)
        write_jobs(jobs)
        return new_job


def update_job(job_id: int, payload: JobUpdate) -> Job:
    with _file_lock:
        jobs = read_jobs()
        for index, job in enumerate(jobs):
            if job["id"] == job_id:
                updated_job: Job = {
                    **job,
                    **payload.model_dump(),
                    "id": job["id"],
                    "created_date": job["created_date"],
                }
                jobs[index] = updated_job
                write_jobs(jobs)
                return updated_job
    raise JobNotFoundError(job_id)


def archive_job(job_id: int) -> Job:
    with _file_lock:
        jobs = read_jobs()
        for index, job in enumerate(jobs):
            if job["id"] == job_id:
                archived_job: Job = {**job, "status": "Archived"}
                jobs[index] = archived_job
                write_jobs(jobs)
                return archived_job
    raise JobNotFoundError(job_id)


def search_jobs(jobs: list[Job], search: str) -> list[Job]:
    return [
        job
        for job in jobs
        if contains_ignore_case(job["title"], search)
        or contains_ignore_case(job["company"], search)
    ]


def filter_jobs(
    jobs: list[Job],
    location: Optional[str] = None,
    experience: Optional[str] = None,
    employment_type: Optional[str] = None,
    status: Optional[str] = None,
    title: Optional[str] = None,
    company: Optional[str] = None,
    skills: Optional[str] = None,
    work_mode: Optional[str] = None,
    created_date: Optional[str] = None,
) -> list[Job]:
    filtered = jobs
    if location:
        filtered = [
            job for job in filtered if case_insensitive_match(job["location"], location)
        ]
    if experience:
        filtered = [
            job
            for job in filtered
            if case_insensitive_match(job["experience"], experience)
        ]
    if employment_type:
        filtered = [
            job
            for job in filtered
            if case_insensitive_match(job["employment_type"], employment_type)
        ]
    if status:
        filtered = [
            job for job in filtered if case_insensitive_match(job["status"], status)
        ]
    if title:
        filtered = [
            job for job in filtered if contains_ignore_case(job["title"], title)
        ]
    if company:
        filtered = [
            job for job in filtered if contains_ignore_case(job["company"], company)
        ]
    if skills:
        requested = [item.strip().lower() for item in skills.split(",") if item.strip()]
        filtered = [
            job
            for job in filtered
            if all(
                any(
                    requested_skill in skill.lower()
                    for skill in job.get("required_skills", [])
                )
                for requested_skill in requested
            )
        ]
    if work_mode:
        filtered = [
            job
            for job in filtered
            if case_insensitive_match(job.get("work_mode", ""), work_mode)
        ]
    if created_date:
        filtered = [job for job in filtered if job.get("created_date") == created_date]
    return filtered


def list_jobs(
    search: Optional[str] = None,
    location: Optional[str] = None,
    experience: Optional[str] = None,
    employment_type: Optional[str] = None,
    status: Optional[str] = None,
    title: Optional[str] = None,
    company: Optional[str] = None,
    skills: Optional[str] = None,
    work_mode: Optional[str] = None,
    created_date: Optional[str] = None,
) -> list[Job]:
    with _file_lock:
        jobs = read_jobs()
    if search and search.strip():
        jobs = search_jobs(jobs, search)
    return filter_jobs(
        jobs,
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
