from __future__ import annotations

from typing import List, Tuple

import pandas as pd
from sklearn.preprocessing import StandardScaler

class StandardScalerWrapper:
    def __init__(self) -> None:
        self.scaler = StandardScaler()

    def scale(self, df: pd.DataFrame, columns: List[str]) -> Tuple[pd.DataFrame, List[str]]:
        if not columns:
            return df, []
        scaled_values = self.scaler.fit_transform(df[columns])
        df.loc[:, columns] = scaled_values
        return df, columns

