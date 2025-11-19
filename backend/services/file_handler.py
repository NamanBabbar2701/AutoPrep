from __future__ import annotations

import shutil
from pathlib import Path
from typing import Dict, Optional, Tuple
from uuid import uuid4

from fastapi import HTTPException, UploadFile

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
PROCESSED_DIR = BASE_DIR / "processed"

FILE_REGISTRY: Dict[str, Dict[str, Path | str]] = {}


def ensure_directories() -> None:
    """Guarantee the expected directory structure exists."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


async def save_upload_file(file: UploadFile) -> Tuple[str, Path]:
    """Persist an uploaded file to disk and register it for later processing."""
    ensure_directories()

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".csv", ".xlsx", ".xls"}:
        raise HTTPException(status_code=400, detail="Unsupported file format. Upload CSV or Excel files.")

    file_id = str(uuid4())
    destination = UPLOAD_DIR / f"{file_id}{suffix}"

    await file.seek(0)
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    FILE_REGISTRY[file_id] = {"source": destination, "original_name": file.filename or "dataset"}
    return file_id, destination


def get_uploaded_file_path(file_id: str) -> Path:
    """Locate the path of the uploaded file for the supplied id."""
    record = FILE_REGISTRY.get(file_id)
    if not record:
        raise HTTPException(status_code=404, detail="File id not found. Upload a dataset first.")

    source_path = Path(record["source"])
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="Uploaded file is missing on the server.")
    return source_path


def save_processed_dataframe(path: Path, file_id: str) -> None:
    """Register the final processed file path."""
    if file_id not in FILE_REGISTRY:
        FILE_REGISTRY[file_id] = {}
    FILE_REGISTRY[file_id]["processed"] = path


def get_processed_file_path(file_id: str) -> Path:
    record = FILE_REGISTRY.get(file_id)
    if not record or "processed" not in record:
        raise HTTPException(status_code=404, detail="Processed file not found. Run preprocessing first.")

    processed_path = Path(record["processed"])
    if not processed_path.exists():
        raise HTTPException(status_code=404, detail="Processed file missing on the server.")
    return processed_path

