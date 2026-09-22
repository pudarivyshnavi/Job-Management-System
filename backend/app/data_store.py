import json
import threading
from pathlib import Path
from typing import Any

from app.utils import BACKEND_DIR

DATA_DIR = BACKEND_DIR / "data"
_store_lock = threading.Lock()


def read_collection(name: str) -> list[dict[str, Any]]:
    path = DATA_DIR / f"{name}.json"
    try:
        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError, OSError) as exc:
        raise ValueError(f"The {name} sample data could not be read.") from exc
    if not isinstance(data, list):
        raise ValueError(f"The {name} data must contain a JSON array.")
    return data


def write_collection(name: str, records: list[dict[str, Any]]) -> None:
    path = DATA_DIR / f"{name}.json"
    temporary = path.with_suffix(".json.tmp")
    try:
        with temporary.open("w", encoding="utf-8") as file:
            json.dump(records, file, indent=2, ensure_ascii=False)
            file.write("\n")
        temporary.replace(path)
    except OSError as exc:
        raise ValueError(f"The {name} sample data could not be saved.") from exc
    finally:
        if temporary.exists():
            temporary.unlink(missing_ok=True)


def collection_snapshot(name: str) -> list[dict[str, Any]]:
    with _store_lock:
        return read_collection(name)


def update_collection(name: str, records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    with _store_lock:
        write_collection(name, records)
        return records


def next_id(records: list[dict[str, Any]]) -> int:
    return max((int(record.get("id", 0)) for record in records), default=0) + 1
