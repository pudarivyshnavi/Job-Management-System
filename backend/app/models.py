from typing import Literal, TypedDict


EmploymentType = Literal["Full-time", "Part-time", "Internship", "Contract"]
JobStatus = Literal["Active", "Draft", "Archived"]


class Job(TypedDict):
    id: int
    title: str
    company: str
    location: str
    description: str
    required_skills: list[str]
    experience: str
    employment_type: EmploymentType
    status: JobStatus
    created_date: str
    work_mode: str
    department: str
    category: str
    preferred_skills: list[str]
    responsibilities: list[str]
    benefits: list[str]
    workflow_status: str
