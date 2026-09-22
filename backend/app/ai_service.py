import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any

UNAVAILABLE_MESSAGE = "AI service is currently unavailable. You can continue using the standard job creation workflow."


@dataclass
class AiResult:
    available: bool
    source: str
    content: dict[str, Any] | None = None
    message: str | None = None


def _settings() -> tuple[str, str, float]:
    url = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    try:
        timeout = max(1.0, float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "8")))
    except ValueError:
        timeout = 8.0
    return url, model, timeout


def ollama_generate(prompt: str) -> AiResult:
    url, model, timeout = _settings()
    body = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode(
        "utf-8"
    )
    request = urllib.request.Request(
        f"{url}/api/generate",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
        text = str(payload.get("response", "")).strip()
        if not text:
            raise ValueError("Ollama returned an empty response.")
        return AiResult(
            available=True, source=f"ollama:{model}", content={"text": text}
        )
    except (
        urllib.error.URLError,
        TimeoutError,
        OSError,
        ValueError,
        json.JSONDecodeError,
    ):
        return AiResult(
            available=False, source="unavailable", message=UNAVAILABLE_MESSAGE
        )


def local_fallback(prompt: str, action: str) -> AiResult:
    brief = prompt.strip() or "the role brief"
    if action == "titles":
        content = {
            "titles": [
                "Python Platform Engineer",
                "Backend Engineer",
                "Software Engineer, Python",
            ]
        }
    elif action == "skills":
        content = {
            "required_skills": ["Python", "FastAPI", "SQL", "Testing"],
            "preferred_skills": ["Docker", "Cloud platforms"],
        }
    elif action == "quality":
        content = {
            "checks": [
                "Add a measurable outcome",
                "Name the team or reporting line",
                "Explain the interview process",
            ],
            "score": 72,
        }
    elif action == "improve":
        content = {
            "suggestions": [
                "Use inclusive, outcome-focused language.",
                "Separate must-have skills from skills that can be learned.",
                "Add a concise explanation of the team's purpose.",
            ]
        }
    else:
        content = {
            "title": "Python Platform Engineer",
            "summary": f"Build reliable services and tooling around {brief.lower()}.",
            "description": "Join a collaborative product team to design, ship, and improve dependable software. You will partner with product and design to turn clear problems into measurable outcomes.",
            "responsibilities": [
                "Design maintainable services",
                "Review code and improve quality",
                "Document decisions and share context",
            ],
            "required_skills": ["Python", "FastAPI", "SQL", "Testing"],
            "preferred_skills": ["Docker", "Cloud platforms", "Observability"],
        }
        return AiResult(
            available=False,
            source="deterministic local assistant",
            content=content,
            message=UNAVAILABLE_MESSAGE,
        )


def assist(prompt: str, action: str, use_fallback: bool = True) -> AiResult:
    result = ollama_generate(prompt)
    if result.available:
        return result
    return local_fallback(prompt, action) if use_fallback else result
