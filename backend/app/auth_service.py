import base64
import hashlib
import hmac
import os
import secrets
import time
from typing import Any

from app.data_store import collection_snapshot, next_id, update_collection

TOKEN_TTL_SECONDS = 60 * 60 * 8


def _secret() -> bytes:
    return os.getenv("AUTH_SECRET", "jobboard-demo-secret-change-me").encode("utf-8")


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 240_000)
    return f"pbkdf2_sha256$240000${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, rounds, salt, expected = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            base64.urlsafe_b64decode(salt),
            int(rounds),
        )
        return hmac.compare_digest(base64.urlsafe_b64encode(actual).decode(), expected)
    except (ValueError, TypeError):
        return False


def issue_token(user_id: int) -> str:
    expires = str(int(time.time()) + TOKEN_TTL_SECONDS)
    payload = f"{user_id}:{expires}"
    signature = hmac.new(_secret(), payload.encode(), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(f"{payload}:{signature}".encode()).decode()


def get_user_from_token(token: str | None) -> dict[str, Any] | None:
    if not token:
        return None
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        user_id, expires, signature = decoded.split(":", 2)
        payload = f"{user_id}:{expires}"
        if int(expires) < int(time.time()) or not hmac.compare_digest(
            signature, hmac.new(_secret(), payload.encode(), hashlib.sha256).hexdigest()
        ):
            return None
        return next(
            (
                user
                for user in collection_snapshot("users")
                if str(user.get("id")) == user_id and user.get("status") == "Active"
            ),
            None,
        )
    except (ValueError, TypeError, UnicodeDecodeError):
        return None


def signup(name: str, email: str, password: str, company: str = "") -> dict[str, Any]:
    users = collection_snapshot("users")
    normalized = email.strip().lower()
    if any(user.get("email", "").lower() == normalized for user in users):
        raise ValueError("An account with that email already exists.")
    user = {
        "id": next_id(users),
        "name": name.strip(),
        "email": normalized,
        "company": company.strip(),
        "role": "Recruiter",
        "status": "Active",
        "last_activity": "Just now",
        "password_hash": hash_password(password),
    }
    users.append(user)
    update_collection("users", users)
    return public_user(user)


def authenticate(email: str, password: str) -> dict[str, Any] | None:
    normalized = email.strip().lower()
    user = next(
        (
            item
            for item in collection_snapshot("users")
            if item.get("email", "").lower() == normalized
        ),
        None,
    )
    if not user or not verify_password(password, user.get("password_hash", "")):
        return None
    return user


def public_user(user: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in user.items() if key != "password_hash"}
