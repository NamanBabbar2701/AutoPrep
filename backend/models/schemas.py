from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ColumnAnalysis(BaseModel):
    column: str
    dtype: str
    missing: int
    missing_pct: float
    unique: int
    suggested_imputation: Optional[str]
    suggested_encoding: Optional[str]


class UploadResponse(BaseModel):
    file_id: str
    rows: int
    columns: int
    missing_summary: Dict[str, int]
    dtypes: Dict[str, str]
    column_analysis: List[ColumnAnalysis]


class ProcessPreferences(BaseModel):
    imputation: Dict[str, str] = Field(default_factory=dict)
    encoding: Dict[str, str] = Field(default_factory=dict)
    drop_columns: List[str] = Field(default_factory=list)


class ProcessRequest(BaseModel):
    file_id: str
    preferences: Optional[ProcessPreferences] = None


class ProcessResponse(BaseModel):
    file_id: str
    rows: int
    columns: int
    download_url: str
    operations: Dict[str, object]

