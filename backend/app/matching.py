import re
from typing import Any


def _normalise(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _years(value: str) -> float:
    numbers = [float(item) for item in re.findall(r"\d+(?:\.\d+)?", value or "")]
    return max(numbers) if numbers else 0.0


def match_candidate(candidate: dict[str, Any], job: dict[str, Any]) -> dict[str, Any]:
    candidate_skills = {_normalise(skill) for skill in candidate.get("skills", [])}
    required = [str(skill) for skill in job.get("required_skills", [])]
    preferred = [str(skill) for skill in job.get("preferred_skills", [])]
    matching_required = [
        skill for skill in required if _normalise(skill) in candidate_skills
    ]
    matching_preferred = [
        skill for skill in preferred if _normalise(skill) in candidate_skills
    ]
    missing = [skill for skill in required if _normalise(skill) not in candidate_skills]
    required_score = len(matching_required) / len(required) if required else 1.0
    preferred_score = len(matching_preferred) / len(preferred) if preferred else 1.0
    candidate_years = _years(str(candidate.get("experience", "")))
    required_years = _years(str(job.get("experience", "")))
    experience_score = (
        1.0
        if candidate_years >= required_years
        else (candidate_years / required_years if required_years else 1.0)
    )
    score = round(
        (required_score * 0.6 + preferred_score * 0.2 + experience_score * 0.2) * 100
    )
    return {
        "score": score,
        "matching_skills": matching_required + matching_preferred,
        "missing_skills": missing,
        "experience": {
            "candidate": candidate.get("experience", "Not provided"),
            "required": job.get("experience", "Not provided"),
            "meets_requirement": candidate_years >= required_years,
        },
        "calculation": "60% required skills, 20% preferred skills, 20% experience. Scores support recruiter review and never make a hiring decision.",
    }
