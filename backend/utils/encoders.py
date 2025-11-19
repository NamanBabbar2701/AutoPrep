from __future__ import annotations

from typing import List

import pandas as pd
from sklearn.preprocessing import LabelEncoder


def encode_label(series: pd.Series) -> pd.Series:
    encoder = LabelEncoder()
    encoded = encoder.fit_transform(series.astype(str))
    return pd.Series(encoded, index=series.index)


def encode_one_hot(df: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    if not columns:
        return df
    return pd.get_dummies(df, columns=columns, prefix=columns, drop_first=False)

