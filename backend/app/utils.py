from datetime import date
from pathlib import Path

from app.models import Job


BACKEND_DIR = Path(__file__).resolve().parent.parent
JOBS_FILE = BACKEND_DIR / "data" / "jobs.json"


def generate_job_id(jobs: list[Job]) -> int:
    if not jobs:
        return 1
    return max(job["id"] for job in jobs) + 1


def today_iso() -> str:
    return date.today().isoformat()


def case_insensitive_match(left: str, right: str) -> bool:
    return left.strip().lower() == right.strip().lower()


def contains_ignore_case(text: str, query: str) -> bool:
    return query.strip().lower() in text.lower()
