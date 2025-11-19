from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from models.schemas import ProcessRequest, ProcessResponse, UploadResponse
from services.file_handler import (
    PROCESSED_DIR,
    ensure_directories,
    get_processed_file_path,
    get_uploaded_file_path,
    save_processed_dataframe,
    save_upload_file,
)
from services.preprocess import PreprocessingEngine

app = FastAPI(title="AutoPrep API", version="1.0.0")
engine = PreprocessingEngine()
ensure_directories()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)) -> UploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name.")

    file_id, stored_path = await save_upload_file(file)
    df = engine.load_dataframe(stored_path)

    rows, cols, missing_summary, dtypes, column_analysis = engine.analyze_dataframe(df)

    return UploadResponse(
        file_id=file_id,
        rows=rows,
        columns=cols,
        missing_summary=missing_summary,
        dtypes=dtypes,
        column_analysis=column_analysis,
    )


@app.post("/process", response_model=ProcessResponse)
async def process_dataset(request: ProcessRequest) -> ProcessResponse:
    source_path = get_uploaded_file_path(request.file_id)
    df = engine.load_dataframe(source_path)
    processed_df, outcome = engine.process_dataframe(df, request.preferences)

    processed_path = PROCESSED_DIR / f"{request.file_id}_clean.csv"
    processed_df.to_csv(processed_path, index=False)
    save_processed_dataframe(processed_path, request.file_id)

    download_url = f"/download/{request.file_id}"

    return ProcessResponse(
        file_id=request.file_id,
        rows=len(processed_df),
        columns=len(processed_df.columns),
        download_url=download_url,
        operations=outcome.as_dict(),
    )


@app.get("/download/{file_id}")
async def download_clean_file(file_id: str) -> FileResponse:
    processed_path = get_processed_file_path(file_id)
    return FileResponse(path=processed_path, filename=processed_path.name, media_type="text/csv")

