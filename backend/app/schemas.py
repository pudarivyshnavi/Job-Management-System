from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator


EmploymentType = Literal["Full-time", "Part-time", "Internship", "Contract"]
JobStatus = Literal["Active", "Draft", "Archived"]
ApplicationStatus = Literal[
    "Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"
]

REQUIRED_STRING_FIELDS = (
    "title",
    "company",
    "location",
    "description",
    "experience",
    "employment_type",
    "status",
)


class JobBase(BaseModel):
    title: str
    company: str
    location: str
    description: str
    required_skills: list[str] = Field(min_length=1)
    experience: str
    employment_type: EmploymentType
    status: JobStatus
    work_mode: str = "Hybrid"
    department: str = "Engineering"
    category: str = "Technology"
    preferred_skills: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    benefits: list[str] = Field(default_factory=list)
    workflow_status: Literal["Open", "Closed"] = "Open"

    @field_validator(*REQUIRED_STRING_FIELDS)
    @classmethod
    def reject_empty_strings(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned

    @field_validator("required_skills")
    @classmethod
    def reject_empty_skills(cls, skills: list[str]) -> list[str]:
        cleaned_skills: list[str] = []
        for skill in skills:
            cleaned = skill.strip()
            if not cleaned:
                raise ValueError("required_skills must not contain empty values")
            cleaned_skills.append(cleaned)
        return cleaned_skills

    @field_validator("preferred_skills", "responsibilities", "benefits")
    @classmethod
    def clean_optional_lists(cls, values: list[str]) -> list[str]:
        return [value.strip() for value in values if value.strip()]


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    pass


class JobResponse(JobBase):
    id: int
    created_date: str


class AiRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    action: Literal["generate", "titles", "skills", "summary", "improve", "quality"] = (
        "generate"
    )
    use_fallback: bool = True


class ApplicationUpdate(BaseModel):
    status: ApplicationStatus
    notes: str = Field(default="", max_length=2000)


class InterviewCreate(BaseModel):
    candidate: str = Field(min_length=1, max_length=120)
    job: str = Field(min_length=1, max_length=160)
    date: date
    time: str = Field(min_length=1, max_length=20)
    type: Literal["Video", "Phone", "On-site", "Panel"]
    status: Literal["Scheduled", "Completed", "Cancelled"] = "Scheduled"
    feedback: str = Field(default="", max_length=3000)


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)
    company: str = Field(default="", max_length=160)


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=200)
    password: str = Field(min_length=1, max_length=128)
