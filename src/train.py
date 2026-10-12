"""
Model Training Script for Kisan Mandi Price Predictor
Trains an XGBoost Regressor with hyperparameter tuning to forecast future commodity rates.
"""

import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
import joblib
import os

def train_xgboost_model(X_train: pd.DataFrame, y_train: pd.Series,
                        X_test: pd.DataFrame, y_test: pd.Series,
                        model_name: str = "xgboost_maize_gulabbagh.joblib"):
    """
    Fits an XGBoost regressor, computes test set metrics, and serializes the model artifact.
    """
    model = XGBRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.03,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        objective="reg:squarederror"
    )
    
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    
    predictions = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    mape = mean_absolute_percentage_error(y_test, predictions) * 100
    
    print(f"✅ Model Training Complete: {model_name}")
    print(f"📊 Test RMSE: ₹{rmse:.2f} / Quintal")
    print(f"📊 Test MAPE: {mape:.2f}%")
    
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, os.path.join("models", model_name))
    print(f"💾 Saved artifact to models/{model_name}")
    return model

if __name__ == "__main__":
    print("Training script configured. Execute with training dataset to generate .joblib artifacts.")
