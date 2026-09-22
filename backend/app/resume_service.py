import io
import re
from pathlib import Path
from typing import Any

MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx"}
KNOWN_SKILLS = (
    "python",
    "fastapi",
    "react",
    "typescript",
    "sql",
    "postgresql",
    "docker",
    "figma",
    "testing",
    "aws",
    "javascript",
    "node",
    "machine learning",
    "data analysis",
    "design systems",
    "api",
    "rest",
    "cloud",
)


def _normalise_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _extract_name(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines[:6]:
        if re.search(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+", line):
            if not re.search(r"@|\d{3,}", line):
                return line
    return None


def _extract_email(text: str) -> str | None:
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return match.group(0) if match else None


def _extract_phone(text: str) -> str | None:
    match = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
    return match.group(0).strip() if match else None


def extract_text(filename: str, content: bytes) -> str:
    extension = Path(filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Resume format must be PDF, DOCX, or TXT.")
    if len(content) == 0:
        raise ValueError("The resume did not contain readable text.")
    if len(content) > MAX_RESUME_BYTES:
        raise ValueError("Resume file must be 5 MB or smaller.")
    if extension == ".txt":
        try:
            decoded = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            decoded = content.decode("latin-1", errors="replace")
        text = decoded.strip()
        if not text:
            raise ValueError("The resume did not contain readable text.")
        return text
    if extension == ".pdf":
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(content))
            pages = [page.extract_text() or "" for page in reader.pages]
            text = "\n".join(pages).strip()
            if not text:
                raise ValueError(
                    "The PDF does not contain readable text. Scanned or image-only PDFs cannot be processed."
                )
            return text
        except ImportError as exc:
            raise ValueError("PDF parsing is not installed on this server.") from exc
        except ValueError:
            raise
        except Exception as exc:
            raise ValueError("The PDF could not be parsed.") from exc
    try:
        from docx import Document

        document = Document(io.BytesIO(content))
        text = "\n".join(paragraph.text for paragraph in document.paragraphs).strip()
        if not text:
            raise ValueError("The resume did not contain readable text.")
        return text
    except ImportError as exc:
        raise ValueError("DOCX parsing is not installed on this server.") from exc
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("The DOCX could not be parsed.") from exc


def _detect_skill_matches(text: str) -> list[str]:
    lower = text.lower()
    matches = []
    for skill in KNOWN_SKILLS:
        if re.search(rf"\b{re.escape(skill)}\b", lower):
            matches.append(skill.title())
    return matches


def _detect_experience(text: str) -> tuple[str, list[str]]:
    patterns = re.findall(
        r"(?:\d+(?:\.\d+)?\s*(?:\+\s*)?years?|\d+\s*-\s*\d+\s*years?)",
        text,
        flags=re.IGNORECASE,
    )
    evidence = []
    for line in text.splitlines():
        if re.search(r"experience|years?", line, flags=re.IGNORECASE):
            evidence.append(line.strip())
    if patterns:
        return patterns[0].strip(), evidence[:3] or [patterns[0].strip()]
    return "Not detected", evidence[:3] if evidence else [
        "No experience pattern detected"
    ]


def _detect_education(text: str) -> list[str]:
    education_lines = []
    for line in text.splitlines():
        lowered = line.lower()
        if any(
            word in lowered
            for word in ("university", "college", "bachelor", "master", "degree")
        ):
            education_lines.append(line.strip())
    return education_lines[:5] or ["Not detected"]


def _detect_keywords(text: str) -> list[str]:
    words = re.findall(r"\b[A-Za-z][A-Za-z+#.-]{2,}\b", text)
    counts: dict[str, int] = {}
    for word in words:
        normalized = word.lower()
        if normalized in {"the", "and", "for", "with", "from", "your", "this", "that"}:
            continue
        counts[normalized] = counts.get(normalized, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [word.title() for word, _ in ranked[:20]]


def analyse_resume(filename: str, content: bytes) -> dict[str, Any]:
    text = extract_text(filename, content)
    if not text:
        raise ValueError("The resume did not contain readable text.")

    candidate_name = _extract_name(text)
    candidate_email = _extract_email(text)
    candidate_phone = _extract_phone(text)
    skills = _detect_skill_matches(text)
    experience_value, experience_evidence = _detect_experience(text)
    education = _detect_education(text)
    keywords = _detect_keywords(text)

    summary_parts = []
    if candidate_name:
        summary_parts.append(candidate_name)
    if skills:
        summary_parts.append(f"with experience in {', '.join(skills[:3])}")
    elif experience_value != "Not detected":
        summary_parts.append(f"with {experience_value} of experience")
    if education and education != ["Not detected"]:
        summary_parts.append(f"and educational background including {education[0]}")
    if not summary_parts:
        summary = "Candidate details could not be confidently extracted from the provided document. Recruiter review is recommended."
    else:
        summary = "Candidate profile: " + " ".join(summary_parts) + "."

    return {
        "filename": filename,
        "candidate": {
            "name": candidate_name or "Not detected",
            "email": candidate_email or "Not detected",
            "phone": candidate_phone or "Not detected",
        },
        "skills": skills or ["Not detected"],
        "experience": {
            "years": experience_value,
            "evidence": experience_evidence,
            "summary": experience_value
            if experience_value != "Not detected"
            else "Not detected",
        },
        "education": education,
        "keywords": keywords or ["Not detected"],
        "summary": summary,
        "notes": "Extraction is based on text-pattern matching and may require recruiter verification.",
        "confidence": "Medium"
        if skills or experience_value != "Not detected"
        else "Low",
        "text_preview": _normalise_text(text)[:500],
    }
