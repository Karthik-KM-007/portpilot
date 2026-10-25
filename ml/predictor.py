"""
PortPilot AI — Real-Time Inference Predictor
Provides waiting-time predictions, turnaround forecasts, and berth-allocation recommendations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone, timedelta

class WaitingTimePredictor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WaitingTimePredictor, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_dir, "models", "best_model.joblib")
        self.metrics_path = os.path.join(base_dir, "models", "model_metrics.json")

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}. Run train.py first.")

        self.model = joblib.load(self.model_path)
        with open(self.metrics_path, "r", encoding="utf-8") as f:
            self.metrics = json.load(f)

    def get_metrics(self) -> dict:
        return self.metrics

    def predict(
        self,
        vessel_type: str = "Container Ship",
        vessel_length_m: float = 300.0,
        vessel_draft_m: float = 13.5,
        total_teu: int = 8500,
        berth_occupancy_ratio: float = 0.72,
        available_cranes: int = 4,
        yard_density_percent: float = 75.0,
        wind_speed_knots: float = 12.0,
        eta: datetime = None
    ) -> dict:
        if eta is None:
            eta = datetime.now(timezone.utc) + timedelta(hours=12)

        arrival_hour = eta.hour
        arrival_day_of_week = eta.weekday()
        is_weekend = 1 if arrival_day_of_week >= 5 else 0

        # Normalization and defaults
        v_length = float(vessel_length_m or 300.0)
        v_draft = float(vessel_draft_m or 13.5)
        teu = int(total_teu or 5000)

        # Feature engineering
        teu_per_length = teu / (v_length + 1e-5)
        draft_occupancy_stress = v_draft * berth_occupancy_ratio
        wind_crane_ratio = wind_speed_knots / (available_cranes + 1e-5)
        sin_hour = np.sin(2 * np.pi * arrival_hour / 24.0)
        cos_hour = np.cos(2 * np.pi * arrival_hour / 24.0)

        df_input = pd.DataFrame([{
            "vessel_type": vessel_type,
            "vessel_length_m": v_length,
            "vessel_draft_m": v_draft,
            "total_teu": teu,
            "berth_occupancy_ratio": berth_occupancy_ratio,
            "available_cranes": available_cranes,
            "yard_density_percent": yard_density_percent,
            "wind_speed_knots": wind_speed_knots,
            "is_weekend": is_weekend,
            "teu_per_length": teu_per_length,
            "draft_occupancy_stress": draft_occupancy_stress,
            "wind_crane_ratio": wind_crane_ratio,
            "sin_hour": sin_hour,
            "cos_hour": cos_hour
        }])

        pred_wait = float(self.model.predict(df_input)[0])
        pred_wait = round(max(0.2, pred_wait), 2)

        # Congestion classification
        if pred_wait < 3.0:
            congestion_level = "LOW"
            congestion_color = "emerald"
        elif pred_wait < 6.0:
            congestion_level = "MODERATE"
            congestion_color = "sky"
        elif pred_wait < 9.5:
            congestion_level = "HIGH"
            congestion_color = "amber"
        else:
            congestion_level = "SEVERE"
            congestion_color = "rose"

        # Model accuracy and confidence
        r2 = self.metrics["selected_model"]["metrics"]["r2_score"]
        mae = self.metrics["selected_model"]["metrics"]["mae_hours"]
        confidence_pct = round(min(98.5, max(85.0, (r2 * 100) - (pred_wait * 0.4))), 1)

        estimated_berthing_time = eta + timedelta(hours=pred_wait)

        # Smart Berth & Crane Recommendation Logic
        if v_draft > 15.0 or v_length > 370:
            recommended_berth = "Berth B-04 (ULCV Mega Pier)"
            recommended_cranes = 4
        elif v_draft > 13.0 or v_length > 330:
            recommended_berth = "Berth B-02 (Deepwater Quay)"
            recommended_cranes = 3
        elif v_draft > 11.0:
            recommended_berth = "Berth B-01 (North Terminal)"
            recommended_cranes = 2
        else:
            recommended_berth = "Berth B-03 (Feeder Terminal)"
            recommended_cranes = 2

        # Estimated turnaround service time (crane handling speed ~30 moves/hr per crane)
        handling_hours = round(max(4.0, (teu * 0.65) / (recommended_cranes * 30.0)), 1)
        estimated_departure_time = estimated_berthing_time + timedelta(hours=handling_hours)

        return {
            "model_name": self.metrics["selected_model"]["name"],
            "model_version": "v1.2-xgb-production",
            "model_r2_score": r2,
            "model_mae_hours": mae,
            "predicted_waiting_time_hours": pred_wait,
            "confidence_score_percent": confidence_pct,
            "congestion_level": congestion_level,
            "congestion_color": congestion_color,
            "estimated_berthing_time": estimated_berthing_time.isoformat(),
            "estimated_departure_time": estimated_departure_time.isoformat(),
            "estimated_turnaround_hours": handling_hours,
            "recommended_berth": recommended_berth,
            "recommended_cranes": recommended_cranes,
            "operational_factors": {
                "berth_occupancy": f"{int(berth_occupancy_ratio * 100)}%",
                "available_cranes": available_cranes,
                "yard_density": f"{int(yard_density_percent)}%",
                "wind_speed": f"{wind_speed_knots} kts",
            },
            "data_provenance": "SYNTHETIC_BENCHMARK_ROTTERDAM_QUEUE_V1"
        }
