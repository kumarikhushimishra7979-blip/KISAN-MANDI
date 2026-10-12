"""
Data Preprocessing & Lag Feature Engineering Pipeline
Prepares historical Agmarknet mandi daily price and arrival records for XGBoost regression.
"""

import pandas as pd
import numpy as np
from datetime import datetime

def load_and_clean_mandi_data(filepath: str) -> pd.DataFrame:
    """Loads CSV, standardizes column names, and imputes missing price records."""
    df = pd.read_csv(filepath)
    df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]
    
    # Standardize date
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values(by=['mandi', 'crop', 'date']).reset_index(drop=True)
    
    # Interpolate missing modal prices
    df['modal_price'] = df.groupby(['mandi', 'crop'])['modal_price'].transform(
        lambda s: s.interpolate(method='time').bfill().ffill()
    )
    return df

def generate_lag_and_rolling_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes time-series lags and rolling statistics:
    - Lag 1, Lag 2, Lag 3, Lag 7 (weekly cycle)
    - 7-day and 14-day rolling moving averages
    - 7-day rolling standard deviation (volatility)
    - Day-of-week and month cyclical features
    """
    df = df.copy()
    
    # Lag features
    for lag in [1, 2, 3, 7]:
        df[f'price_lag_{lag}'] = df.groupby(['mandi', 'crop'])['modal_price'].shift(lag)
        df[f'arrivals_lag_{lag}'] = df.groupby(['mandi', 'crop'])['arrivals_quintal'].shift(lag)
        
    # Rolling averages
    df['price_roll_mean_7'] = df.groupby(['mandi', 'crop'])['modal_price'].transform(
        lambda s: s.rolling(window=7, min_periods=1).mean()
    )
    df['price_roll_std_7'] = df.groupby(['mandi', 'crop'])['modal_price'].transform(
        lambda s: s.rolling(window=7, min_periods=1).std().fillna(0)
    )
    
    # Calendar features
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Target: 7-day future price
    df['target_price_t_plus_7'] = df.groupby(['mandi', 'crop'])['modal_price'].shift(-7)
    
    return df.dropna()

if __name__ == "__main__":
    print("Preprocessing module ready for Agmarknet pipeline execution.")
