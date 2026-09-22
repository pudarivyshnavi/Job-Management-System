from datetime import date
from typing import Any

from app.data_store import collection_snapshot, next_id, update_collection
from app.services import JobNotFoundError, get_job, write_jobs, read_jobs


def _find(records: list[dict[str, Any]], record_id: int) -> dict[str, Any]:
    for record in records:
        if int(record.get("id", 0)) == record_id:
            return record
    raise ValueError(f"Record with id {record_id} was not found.")


def change_job_status(job_id: int, target: str) -> dict:
    jobs = read_jobs()
    for index, job in enumerate(jobs):
        if job["id"] == job_id:
            job = {**job, "workflow_status": job.get("workflow_status", "Open")}
            if target == "Closed":
                job["workflow_status"] = "Closed"
            elif target == "Open":
                job["workflow_status"] = "Open"
                job["status"] = "Active"
            else:
                job["status"] = target
            jobs[index] = job
            write_jobs(jobs)
            return job
    raise JobNotFoundError(job_id)


def duplicate_job(job_id: int) -> dict:
    jobs = read_jobs()
    source = next((job for job in jobs if job["id"] == job_id), None)
    if source is None:
        raise JobNotFoundError(job_id)
    duplicate = {
        **source,
        "id": max(job["id"] for job in jobs) + 1,
        "title": f"{source['title']} (Copy)",
        "status": "Draft",
        "workflow_status": "Open",
    }
    jobs.append(duplicate)
    write_jobs(jobs)
    return duplicate


def list_applications(
    search: str | None = None, status: str | None = None
) -> list[dict]:
    records = collection_snapshot("applications")
    query = (search or "").strip().lower()
    return [
        record
        for record in records
        if (
            not query
            or query in f"{record.get('candidate', '')} {record.get('job', '')}".lower()
        )
        and (not status or record.get("stage") == status)
    ]


def update_application(application_id: int, status: str, notes: str) -> dict:
    records = collection_snapshot("applications")
    application = _find(records, application_id)
    history = list(application.get("status_history", []))
    history.append({"status": status, "date": date.today().isoformat()})
    application.update({"stage": status, "notes": notes, "status_history": history})
    update_collection("applications", records)
    return application


def create_interview(payload: dict) -> dict:
    records = collection_snapshot("interviews")
    interview = {
        "id": next_id(records),
        **payload,
        "date": payload["date"].isoformat()
        if hasattr(payload["date"], "isoformat")
        else payload["date"],
    }
    records.append(interview)
    update_collection("interviews", records)
    return interview
