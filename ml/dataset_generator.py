"""
PortPilot AI — Maritime Vessel Turnaround & Waiting-Time Dataset Generator
Generates a realistic, verifiable maritime operations dataset modeled after container terminal
queueing dynamics (e.g., Port of Rotterdam / Singapore).
All generated records are clearly labeled as synthetic benchmark data with deterministic seed.
"""

import os
import numpy as np
import pandas as pd

def generate_vessel_dataset(num_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    # 1. Vessel Characteristics
    vessel_types = ["Container Ship", "Ultra Large Container Vessel (ULCV)", "Feeder Container", "Bulk Carrier", "Chemical Tanker"]
    type_probs = [0.45, 0.25, 0.15, 0.10, 0.05]
    v_types = np.random.choice(vessel_types, size=num_samples, p=type_probs)

    lengths = []
    drafts = []
    teus = []
    for vt in v_types:
        if vt == "Ultra Large Container Vessel (ULCV)":
            lengths.append(np.random.uniform(366, 400))
            drafts.append(np.random.uniform(14.5, 16.5))
            teus.append(int(np.random.uniform(14000, 24000)))
        elif vt == "Container Ship":
            lengths.append(np.random.uniform(250, 365))
            drafts.append(np.random.uniform(11.0, 14.5))
            teus.append(int(np.random.uniform(5000, 14000)))
        elif vt == "Feeder Container":
            lengths.append(np.random.uniform(120, 240))
            drafts.append(np.random.uniform(7.0, 10.5))
            teus.append(int(np.random.uniform(800, 4900)))
        elif vt == "Bulk Carrier":
            lengths.append(np.random.uniform(180, 300))
            drafts.append(np.random.uniform(10.0, 15.0))
            teus.append(int(np.random.uniform(0, 500)))
        else: # Chemical Tanker
            lengths.append(np.random.uniform(140, 220))
            drafts.append(np.random.uniform(8.5, 12.0))
            teus.append(int(np.random.uniform(0, 200)))

    lengths = np.round(lengths, 1)
    drafts = np.round(drafts, 1)
    teus = np.array(teus)

    # 2. Terminal & Environmental Operational Features
    berth_occupancy = np.random.uniform(0.35, 0.98, size=num_samples)
    available_cranes = np.random.choice([1, 2, 3, 4, 5, 6, 7, 8], size=num_samples, p=[0.05, 0.1, 0.2, 0.3, 0.15, 0.1, 0.05, 0.05])
    yard_density = np.random.uniform(40.0, 95.0, size=num_samples)
    wind_speed_knots = np.random.exponential(scale=12.0, size=num_samples) + 4.0
    wind_speed_knots = np.clip(wind_speed_knots, 4.0, 48.0)

    arrival_hour = np.random.randint(0, 24, size=num_samples)
    arrival_day_of_week = np.random.randint(0, 7, size=num_samples)
    is_weekend = (arrival_day_of_week >= 5).astype(int)

    # 3. Queue & Turnaround Physics (Domain formula for waiting time)
    # Baseline queue waiting time modeled with Erlang-C/congestion non-linearities:
    # - Heavy traffic penalty when berth occupancy > 80%
    # - Deep draft penalty (> 14m requires tidal window or deep quay)
    # - Low crane allocation penalty
    # - Wind delays when wind > 28 knots (crane wind limits)
    # - High yard density back-pressure

    base_wait = 0.8
    occupancy_penalty = np.where(berth_occupancy > 0.80, (berth_occupancy - 0.75) * 18.0, berth_occupancy * 2.5)
    deep_draft_penalty = np.where(drafts > 14.0, (drafts - 13.5) * 1.8, 0.0)
    crane_factor = np.clip(5.0 / available_cranes, 0.6, 3.5)
    yard_penalty = np.where(yard_density > 80.0, (yard_density - 80.0) * 0.12, 0.0)
    wind_penalty = np.where(wind_speed_knots > 28.0, (wind_speed_knots - 28.0) * 0.25, 0.0)
    teu_load_factor = (teus / 10000.0) * 0.75
    hour_rush = np.where((arrival_hour >= 6) & (arrival_hour <= 10) | (arrival_hour >= 16) & (arrival_hour <= 20), 0.9, 0.0)

    # Stochastic variance (unforeseen pilot delay, customs inspection, mechanical hold)
    noise = np.random.normal(0, 0.45, size=num_samples)

    waiting_time_hours = (
        base_wait
        + occupancy_penalty
        + deep_draft_penalty
        + (crane_factor * 0.6)
        + yard_penalty
        + wind_penalty
        + teu_load_factor
        + hour_rush
        + noise
    )
    waiting_time_hours = np.round(np.clip(waiting_time_hours, 0.2, 28.0), 2)

    df = pd.DataFrame({
        "vessel_type": v_types,
        "vessel_length_m": lengths,
        "vessel_draft_m": drafts,
        "total_teu": teus,
        "berth_occupancy_ratio": np.round(berth_occupancy, 3),
        "available_cranes": available_cranes,
        "yard_density_percent": np.round(yard_density, 1),
        "wind_speed_knots": np.round(wind_speed_knots, 1),
        "arrival_hour": arrival_hour,
        "arrival_day_of_week": arrival_day_of_week,
        "is_weekend": is_weekend,
        "waiting_time_hours": waiting_time_hours,
        "data_provenance": "SYNTHETIC_BENCHMARK_ROTTERDAM_QUEUE_V1"
    })

    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_csv = os.path.join(out_dir, "vessel_turnaround_dataset.csv")
    df = generate_vessel_dataset(num_samples=3000, random_seed=42)
    df.to_csv(out_csv, index=False)
    print(f"[OK] Generated {len(df)} records saved to: {out_csv}")
    print(df.describe())
