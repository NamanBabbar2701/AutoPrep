from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from models.schemas import ColumnAnalysis, ProcessPreferences
from utils.encoders import encode_label, encode_one_hot
from utils.scalers import StandardScalerWrapper


@dataclass
class ProcessingOutcome:
    dropped_columns: List[str] = field(default_factory=list)
    imputations: Dict[str, str] = field(default_factory=dict)
    encodings: Dict[str, str] = field(default_factory=dict)
    scaled_columns: List[str] = field(default_factory=list)
    duplicates_removed: int = 0
    outliers_removed: int = 0
    date_columns: List[str] = field(default_factory=list)

    def as_dict(self) -> Dict[str, object]:
        return {
            "dropped_columns": self.dropped_columns,
            "imputations": self.imputations,
            "encodings": self.encodings,
            "scaled_columns": self.scaled_columns,
            "duplicates_removed": self.duplicates_removed,
            "outliers_removed": self.outliers_removed,
            "date_columns": self.date_columns,
        }


class PreprocessingEngine:
    """Encapsulates the AutoPrep preprocessing and analysis logic."""

    def __init__(self) -> None:
        self.scaler = StandardScalerWrapper()

    def load_dataframe(self, path: Path) -> pd.DataFrame:
        suffix = path.suffix.lower()
        if suffix == ".csv":
            return pd.read_csv(path)
        if suffix in {".xlsx", ".xls"}:
            return pd.read_excel(path)
        raise ValueError("Unsupported file extension")

    def analyze_dataframe(self, df: pd.DataFrame) -> Tuple[int, int, Dict[str, int], Dict[str, str], List[ColumnAnalysis]]:
        rows, cols = df.shape
        missing_summary = df.isna().sum().to_dict()
        dtypes = {column: str(dtype) for column, dtype in df.dtypes.items()}
        analyses: List[ColumnAnalysis] = []

        for column in df.columns:
            missing_pct = float(missing_summary[column]) / rows if rows else 0
            unique_count = int(df[column].nunique(dropna=True))
            dtype = str(df[column].dtype)
            suggested_imputation = self._suggest_imputation(dtype, missing_pct)
            suggested_encoding = self._suggest_encoding(dtype, unique_count, rows)

            analyses.append(
                ColumnAnalysis(
                    column=column,
                    dtype=dtype,
                    missing=int(missing_summary[column]),
                    missing_pct=round(missing_pct * 100, 2),
                    unique=unique_count,
                    suggested_imputation=suggested_imputation,
                    suggested_encoding=suggested_encoding,
                )
            )
        return rows, cols, missing_summary, dtypes, analyses

    def process_dataframe(self, df: pd.DataFrame, preferences: Optional[ProcessPreferences] = None) -> Tuple[pd.DataFrame, ProcessingOutcome]:
        prefs = preferences or ProcessPreferences()
        outcome = ProcessingOutcome()

        df = df.copy()
        # Drop requested columns
        for column in prefs.drop_columns:
            if column in df.columns:
                df = df.drop(columns=[column])
                outcome.dropped_columns.append(column)

        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        date_cols = self._identify_and_convert_dates(df, categorical_cols, outcome)
        categorical_cols = [col for col in categorical_cols if col not in date_cols]

        self._handle_numeric_columns(df, numeric_cols, prefs, outcome)
        df = self._handle_categorical_columns(df, categorical_cols, prefs, outcome)
        self._handle_text_columns(df)

        if numeric_cols:
            outliers_mask = self._detect_outliers(df, numeric_cols)
            if outliers_mask.any():
                df = df[~outliers_mask]
                outcome.outliers_removed = int(outliers_mask.sum())

        before_duplicates = len(df)
        df = df.drop_duplicates()
        outcome.duplicates_removed = before_duplicates - len(df)

        df = self._expand_dates(df, date_cols, outcome)
        numeric_cols_after = df.select_dtypes(include=[np.number]).columns.tolist()
        df, scaled_columns = self.scaler.scale(df, numeric_cols_after)
        outcome.scaled_columns = scaled_columns

        df = df.reset_index(drop=True)
        return df, outcome

    def _suggest_imputation(self, dtype: str, missing_pct: float) -> Optional[str]:
        if "float" in dtype or "int" in dtype:
            if missing_pct == 0:
                return None
            return "drop" if missing_pct > 0.3 else "median"
        if dtype == "category" or "object" in dtype:
            return "mode" if missing_pct > 0 else None
        return None

    def _suggest_encoding(self, dtype: str, unique_count: int, rows: int) -> Optional[str]:
        if dtype == "category" or "object" in dtype:
            ratio = unique_count / rows if rows else 0
            return "label" if ratio > 0.3 else "onehot"
        return None

    def _identify_and_convert_dates(self, df: pd.DataFrame, candidate_cols: List[str], outcome: ProcessingOutcome) -> List[str]:
        date_columns: List[str] = []
        for column in candidate_cols:
            converted = pd.to_datetime(df[column], errors="coerce", infer_datetime_format=True)
            non_null_ratio = converted.notna().mean()
            if non_null_ratio >= 0.6:
                df[column] = converted
                date_columns.append(column)
                outcome.date_columns.append(column)
        return date_columns

    def _handle_numeric_columns(self, df: pd.DataFrame, numeric_cols: List[str], prefs: ProcessPreferences, outcome: ProcessingOutcome) -> None:
        for column in list(numeric_cols):
            missing_pct = df[column].isna().mean()
            rule = prefs.imputation.get(column)
            if rule == "drop" or (rule is None and missing_pct > 0.3):
                df.drop(columns=[column], inplace=True)
                outcome.dropped_columns.append(column)
                numeric_cols.remove(column)
                continue

            if rule == "mean":
                fill_value = df[column].mean()
            elif rule == "mode":
                fill_value = df[column].mode(dropna=True).iloc[0] if not df[column].mode(dropna=True).empty else 0
            else:
                fill_value = df[column].median()
                rule = "median"

            if df[column].isna().any():
                df[column].fillna(fill_value, inplace=True)
                outcome.imputations[column] = rule

    def _handle_categorical_columns(self, df: pd.DataFrame, categorical_cols: List[str], prefs: ProcessPreferences, outcome: ProcessingOutcome) -> pd.DataFrame:
        one_hot_targets: List[str] = []
        label_targets: List[str] = []

        for column in categorical_cols:
            if df[column].isna().any():
                mode_series = df[column].mode(dropna=True)
                fill_value = mode_series.iloc[0] if not mode_series.empty else ""
                df[column].fillna(fill_value, inplace=True)
                outcome.imputations[column] = "mode"

            rule = prefs.encoding.get(column)
            if rule:
                rule = rule.lower()
            else:
                unique_ratio = df[column].nunique(dropna=True) / max(len(df), 1)
                rule = "label" if unique_ratio > 0.3 else "onehot"

            if rule == "onehot":
                one_hot_targets.append(column)
            else:
                label_targets.append(column)
                outcome.encodings[column] = "label"

        for column in label_targets:
            df[column] = encode_label(df[column])

        if one_hot_targets:
            df = encode_one_hot(df, one_hot_targets)
            for column in one_hot_targets:
                outcome.encodings[column] = "onehot"

        return df

    def _handle_text_columns(self, df: pd.DataFrame) -> None:
        text_cols = df.select_dtypes(include=["object"]).columns.tolist()
        for column in text_cols:
            df[column].fillna("", inplace=True)

    def _detect_outliers(self, df: pd.DataFrame, numeric_cols: List[str]) -> pd.Series:
        mask = pd.Series(False, index=df.index, dtype=bool)
        for column in numeric_cols:
            series = df[column]
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1
            if iqr == 0:
                continue
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            mask = mask | (series < lower) | (series > upper)
        return mask

    def _expand_dates(self, df: pd.DataFrame, date_cols: List[str], outcome: ProcessingOutcome) -> pd.DataFrame:
        for column in date_cols:
            df[f"{column}_year"] = df[column].dt.year
            df[f"{column}_month"] = df[column].dt.month
            df[f"{column}_day"] = df[column].dt.day
            df.drop(columns=[column], inplace=True)
        return df


