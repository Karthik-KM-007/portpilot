"""
PortPilot AI — Machine Learning Model Training & Comparative Evaluation
Trains and compares Random Forest and XGBoost regressors on vessel waiting-time prediction.
Evaluates using MAE, RMSE, and R2, selects the superior model, and saves artifacts for production.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timezone
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from xgboost import XGBRegressor

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer domain-specific maritime features."""
    data = df.copy()
    data["teu_per_length"] = data["total_teu"] / (data["vessel_length_m"] + 1e-5)
    data["draft_occupancy_stress"] = data["vessel_draft_m"] * data["berth_occupancy_ratio"]
    data["wind_crane_ratio"] = data["wind_speed_knots"] / (data["available_cranes"] + 1e-5)
    data["sin_hour"] = np.sin(2 * np.pi * data["arrival_hour"] / 24.0)
    data["cos_hour"] = np.cos(2 * np.pi * data["arrival_hour"] / 24.0)
    return data

def train_and_evaluate(data_path: str = None, models_dir: str = None) -> dict:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.join(base_dir, "data", "vessel_turnaround_dataset.csv")
    if models_dir is None:
        models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading maritime training data from: {data_path}")
    df = pd.read_csv(data_path)
    df_feat = build_features(df)

    cat_features = ["vessel_type"]
    num_features = [
        "vessel_length_m", "vessel_draft_m", "total_teu",
        "berth_occupancy_ratio", "available_cranes", "yard_density_percent",
        "wind_speed_knots", "is_weekend", "teu_per_length",
        "draft_occupancy_stress", "wind_crane_ratio", "sin_hour", "cos_hour"
    ]

    X = df_feat[cat_features + num_features]
    y = df_feat["waiting_time_hours"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features),
            ("num", StandardScaler(), num_features)
        ]
    )

    # 1. Random Forest Regressor Pipeline
    print("Training Candidate 1: Random Forest Regressor...")
    rf_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(
            n_estimators=160,
            max_depth=14,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        ))
    ])
    rf_pipeline.fit(X_train, y_train)
    rf_pred = rf_pipeline.predict(X_test)

    rf_mae = float(mean_absolute_error(y_test, rf_pred))
    rf_rmse = float(root_mean_squared_error(y_test, rf_pred))
    rf_r2 = float(r2_score(y_test, rf_pred))

    # 2. XGBoost Regressor Pipeline
    print("Training Candidate 2: XGBoost Regressor...")
    xgb_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", XGBRegressor(
            n_estimators=180,
            learning_rate=0.06,
            max_depth=5,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            n_jobs=-1
        ))
    ])
    xgb_pipeline.fit(X_train, y_train)
    xgb_pred = xgb_pipeline.predict(X_test)

    xgb_mae = float(mean_absolute_error(y_test, xgb_pred))
    xgb_rmse = float(root_mean_squared_error(y_test, xgb_pred))
    xgb_r2 = float(r2_score(y_test, xgb_pred))

    print("\n=================== MODEL BENCHMARK COMPARISON ===================")
    print(f"Random Forest  ->  MAE: {rf_mae:.4f}h | RMSE: {rf_rmse:.4f}h | R2: {rf_r2:.4f}")
    print(f"XGBoost        ->  MAE: {xgb_mae:.4f}h | RMSE: {xgb_rmse:.4f}h | R2: {xgb_r2:.4f}")

    # Model Selection (lower RMSE and higher R2)
    if xgb_rmse <= rf_rmse:
        winning_name = "XGBoost Regressor"
        winning_pipeline = xgb_pipeline
        winning_metrics = {"mae": xgb_mae, "rmse": xgb_rmse, "r2": xgb_r2}
    else:
        winning_name = "Random Forest Regressor"
        winning_pipeline = rf_pipeline
        winning_metrics = {"mae": rf_mae, "rmse": rf_rmse, "r2": rf_r2}

    print(f"\n[WINNER SELECTED]: {winning_name} (RMSE: {winning_metrics['rmse']:.4f}h)")

    # Save models
    best_model_path = os.path.join(models_dir, "best_model.joblib")
    rf_model_path = os.path.join(models_dir, "random_forest_model.joblib")
    xgb_model_path = os.path.join(models_dir, "xgboost_model.joblib")

    joblib.dump(winning_pipeline, best_model_path)
    joblib.dump(rf_pipeline, rf_model_path)
    joblib.dump(xgb_pipeline, xgb_model_path)

    # Feature Importances extraction from winning model
    encoded_cat_names = list(winning_pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(cat_features))
    all_feature_names = encoded_cat_names + num_features
    importances = winning_pipeline.named_steps["regressor"].feature_importances_
    feat_imp = sorted(
        [{"feature": name, "importance": round(float(imp), 4)} for name, imp in zip(all_feature_names, importances)],
        key=lambda x: x["importance"],
        reverse=True
    )

    metrics_report = {
        "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
        "dataset_info": {
            "source": "Port of Rotterdam / European Container Terminal Queue Simulation",
            "provenance": "SYNTHETIC_BENCHMARK_ROTTERDAM_QUEUE_V1",
            "total_records": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "models": {
            "Random Forest Regressor": {
                "algorithm": "RandomForestRegressor(n_estimators=160, max_depth=14)",
                "mae": round(rf_mae, 4),
                "rmse": round(rf_rmse, 4),
                "r2_score": round(rf_r2, 4),
            },
            "XGBoost Regressor": {
                "algorithm": "XGBRegressor(n_estimators=180, learning_rate=0.06, max_depth=5)",
                "mae": round(xgb_mae, 4),
                "rmse": round(xgb_rmse, 4),
                "r2_score": round(xgb_r2, 4),
            }
        },
        "selected_model": {
            "name": winning_name,
            "selection_criteria": "Lowest Root Mean Squared Error (RMSE) on 20% holdout test split",
            "metrics": {
                "mae_hours": round(winning_metrics["mae"], 4),
                "rmse_hours": round(winning_metrics["rmse"], 4),
                "r2_score": round(winning_metrics["r2"], 4)
            },
            "top_feature_importances": feat_imp[:8]
        }
    }

    metrics_json_path = os.path.join(models_dir, "model_metrics.json")
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)

    print(f"[OK] Best model exported to: {best_model_path}")
    print(f"[OK] Metrics report exported to: {metrics_json_path}")
    return metrics_report

if __name__ == "__main__":
    train_and_evaluate()
