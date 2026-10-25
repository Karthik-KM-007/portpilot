import sys
import os
from typing import List, Optional
from datetime import datetime, timezone
import json

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func as sqlfunc

# Ensure ml module is importable
backend_dir = os.path.dirname(os.path.abspath(__file__))
ml_dir = os.path.abspath(os.path.join(backend_dir, "..", "ml"))
if ml_dir not in sys.path:
    sys.path.insert(0, ml_dir)

import models
import schemas
import auth
from database import engine, get_db, get_db_engine_type

# Create tables in the active database (PostgreSQL or SQLite)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PortPilot AI API",
    description="Enterprise Maritime Port Logistics & Predictive Operations Engine",
    version="2.0.0"
)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Root & Health Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "PortPilot AI Backend API",
        "version": "2.0.0",
        "database_engine": get_db_engine_type(),
        "docs": "/docs",
        "health": "operational",
        "message": "PortPilot AI backend is active and ready."
    }

# ---------------------------------------------------------------------------
# Authentication Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = auth.timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role, "port_name": user.port_name},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# ---------------------------------------------------------------------------
# Machine Learning Endpoints (Waiting-Time Prediction & Model Benchmark)
# ---------------------------------------------------------------------------

@app.post("/api/ml/predict", response_model=schemas.MLPredictResponse)
def predict_vessel_waiting_time(
    req: schemas.MLPredictRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Predict vessel turnaround waiting time using production XGBoost model.
    Evaluates draft constraints, quay occupancy, available cranes, and weather.
    """
    try:
        from predictor import WaitingTimePredictor
        predictor = WaitingTimePredictor()
        prediction = predictor.predict(
            vessel_type=req.vessel_type,
            vessel_length_m=req.vessel_length_m,
            vessel_draft_m=req.vessel_draft_m,
            total_teu=req.total_teu,
            berth_occupancy_ratio=req.berth_occupancy_ratio,
            available_cranes=req.available_cranes,
            yard_density_percent=req.yard_density_percent,
            wind_speed_knots=req.wind_speed_knots,
            eta=req.eta
        )

        # Log prediction to database
        log_entry = models.MLPredictionLog(
            report_id=req.report_id,
            vessel_name=req.vessel_name or "Unknown Vessel",
            imo_number=req.imo_number,
            vessel_type=req.vessel_type,
            model_name=prediction["model_name"],
            model_version=prediction["model_version"],
            predicted_waiting_time_hours=prediction["predicted_waiting_time_hours"],
            confidence_score_percent=prediction["confidence_score_percent"],
            congestion_level=prediction["congestion_level"],
            recommended_berth=prediction["recommended_berth"],
            recommended_cranes=prediction["recommended_cranes"],
            features_json=json.dumps(prediction["operational_factors"])
        )
        db.add(log_entry)

        # If linked to an arrival report, update the report record with ML insights
        if req.report_id:
            report = db.query(models.VesselArrivalReport).filter(models.VesselArrivalReport.id == req.report_id).first()
            if report:
                report.predicted_wait_hours = prediction["predicted_waiting_time_hours"]
                report.congestion_level = prediction["congestion_level"]
                report.confidence_score = prediction["confidence_score_percent"]
                if not report.assigned_berth_code:
                    report.assigned_berth_code = prediction["recommended_berth"].split(" ")[0]

        db.commit()
        return prediction

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Prediction Engine Error: {str(e)}")

@app.get("/api/ml/metrics", response_model=schemas.MLModelMetricsResponse)
def get_ml_metrics():
    """
    Returns comparative evaluation metrics for Random Forest vs XGBoost models:
    MAE, RMSE, R2-score, training sample size, and top feature importances.
    """
    try:
        from predictor import WaitingTimePredictor
        predictor = WaitingTimePredictor()
        return predictor.get_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load ML model metrics: {str(e)}")

@app.post("/api/ml/retrain")
def retrain_ml_models(
    current_user: models.User = Depends(auth.get_current_port_authority)
):
    """
    Triggers automated retraining of Random Forest and XGBoost models,
    reevaluates metrics, selects the superior model, and saves production artifacts.
    """
    try:
        from train import train_and_evaluate
        metrics = train_and_evaluate()
        # Reload singleton model in predictor
        from predictor import WaitingTimePredictor
        predictor = WaitingTimePredictor()
        predictor._load_model()
        return {
            "status": "success",
            "message": "Models successfully retrained and evaluated.",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")

@app.get("/api/ml/predictions", response_model=List[schemas.MLPredictionLogResponse])
def get_ml_predictions_history(
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List recent ML prediction logs."""
    logs = db.query(models.MLPredictionLog).order_by(models.MLPredictionLog.created_at.desc()).limit(limit).all()
    return logs

# ---------------------------------------------------------------------------
# Port Physical Resources Endpoints (Berths, Cranes, Yard)
# ---------------------------------------------------------------------------

@app.get("/api/resources/berths", response_model=List[schemas.BerthResponse])
def list_berths(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List all quayside berths and their mooring status."""
    return db.query(models.Berth).order_by(models.Berth.berth_code.asc()).all()

@app.patch("/api/resources/berths/{berth_id}", response_model=schemas.BerthResponse)
def update_berth(
    berth_id: int,
    update: schemas.BerthUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority)
):
    berth = db.query(models.Berth).filter(models.Berth.id == berth_id).first()
    if not berth:
        raise HTTPException(status_code=404, detail="Berth not found")
    
    if update.status is not None:
        berth.status = update.status
    if update.cranes_allocated is not None:
        berth.cranes_allocated = update.cranes_allocated
    if update.current_vessel_name is not None:
        berth.current_vessel_name = update.current_vessel_name

    berth.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(berth)
    return berth

@app.get("/api/resources/cranes", response_model=List[schemas.CraneResponse])
def list_cranes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List all Ship-to-Shore (STS) gantry cranes."""
    return db.query(models.Crane).order_by(models.Crane.crane_code.asc()).all()

@app.patch("/api/resources/cranes/{crane_id}", response_model=schemas.CraneResponse)
def update_crane(
    crane_id: int,
    update: schemas.CraneUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority)
):
    crane = db.query(models.Crane).filter(models.Crane.id == crane_id).first()
    if not crane:
        raise HTTPException(status_code=404, detail="Crane not found")

    if update.status is not None:
        crane.status = update.status
    if update.moves_per_hour is not None:
        crane.moves_per_hour = update.moves_per_hour
    if update.assigned_berth_code is not None:
        crane.assigned_berth_code = update.assigned_berth_code

    crane.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(crane)
    return crane

@app.get("/api/resources/yard", response_model=List[schemas.YardBlockResponse])
def list_yard_blocks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """List all container yard stacking blocks and density levels."""
    return db.query(models.YardBlock).order_by(models.YardBlock.block_code.asc()).all()

@app.patch("/api/resources/yard/{block_id}", response_model=schemas.YardBlockResponse)
def update_yard_block(
    block_id: int,
    update: schemas.YardBlockUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority)
):
    block = db.query(models.YardBlock).filter(models.YardBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Yard block not found")

    if update.current_occupancy_teu is not None:
        block.current_occupancy_teu = update.current_occupancy_teu
        block.density_percent = round((block.current_occupancy_teu / block.capacity_teu) * 100, 1)
    if update.density_percent is not None:
        block.density_percent = update.density_percent
    if update.status is not None:
        block.status = update.status

    block.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(block)
    return block

@app.get("/api/resources/snapshot", response_model=schemas.PortResourceSnapshot)
def get_resource_snapshot(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Real-time physical telemetry aggregation."""
    total_berths = db.query(models.Berth).count()
    available_berths = db.query(models.Berth).filter(models.Berth.status == models.ResourceStatusEnum.AVAILABLE).count()

    total_cranes = db.query(models.Crane).count()
    available_cranes = db.query(models.Crane).filter(
        models.Crane.status.in_([models.ResourceStatusEnum.AVAILABLE, models.ResourceStatusEnum.OPTIMAL])
    ).count()

    yard_blocks = db.query(models.YardBlock).all()
    if yard_blocks:
        avg_density = int(sum(b.density_percent for b in yard_blocks) / len(yard_blocks))
    else:
        avg_density = 74

    incoming_count = db.query(models.VesselArrivalReport).filter(
        models.VesselArrivalReport.status.in_([models.ReportStatusEnum.SENT, models.ReportStatusEnum.ACCEPTED])
    ).count()

    return {
        "available_berths": available_berths,
        "total_berths": total_berths or 4,
        "available_cranes": available_cranes,
        "total_cranes": total_cranes or 6,
        "yard_capacity_percent": avg_density,
        "active_incoming_vessels": incoming_count,
        "database_type": get_db_engine_type().upper()
    }

# ---------------------------------------------------------------------------
# Vessel Registry Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/vessels", response_model=List[schemas.VesselResponse])
def get_vessels(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.Vessel).order_by(models.Vessel.created_at.desc()).all()

@app.post("/api/vessels", response_model=schemas.VesselResponse, status_code=status.HTTP_201_CREATED)
def create_vessel(
    vessel: schemas.VesselCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    existing = db.query(models.Vessel).filter(models.Vessel.imo_number == vessel.imo_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vessel with this IMO number already registered")

    new_vessel = models.Vessel(
        **vessel.model_dump(),
        status=models.VesselStatusEnum.INCOMING,
        submitted_by=current_user.id,
    )
    db.add(new_vessel)
    db.commit()
    db.refresh(new_vessel)
    return new_vessel

# ---------------------------------------------------------------------------
# Vessel Arrival Reports (Sender -> Receiver Workflow)
# ---------------------------------------------------------------------------

def generate_report_number(db: Session) -> str:
    count = db.query(sqlfunc.count(models.VesselArrivalReport.id)).scalar() or 0
    return f"PR-{(count + 1):04d}"

@app.post("/api/reports", response_model=schemas.ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_data: schemas.ReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_shipping_agent),
):
    """
    Shipping Agent submits or drafts a Vessel Arrival Report.
    Automatically scores waiting time with ML predictor.
    """
    report_number = generate_report_number(db)
    is_send = report_data.action == "send"
    init_status = models.ReportStatusEnum.SENT if is_send else models.ReportStatusEnum.DRAFT
    now = datetime.now(timezone.utc)

    # ML Turnaround Prediction integration
    predicted_wait = None
    cong_level = None
    conf_score = None
    rec_berth = None
    try:
        from predictor import WaitingTimePredictor
        p = WaitingTimePredictor()
        ml_res = p.predict(
            vessel_type=report_data.vessel_type,
            vessel_length_m=report_data.vessel_length or 300.0,
            vessel_draft_m=report_data.vessel_draft or 13.5,
            total_teu=report_data.total_containers or 5000,
            eta=report_data.eta
        )
        predicted_wait = ml_res["predicted_waiting_time_hours"]
        cong_level = ml_res["congestion_level"]
        conf_score = ml_res["confidence_score_percent"]
        rec_berth = ml_res["recommended_berth"].split(" ")[0] # e.g. "Berth B-02" -> "B-02"
    except Exception as e:
        print(f"Warning: ML inline prediction skipped: {e}")

    report = models.VesselArrivalReport(
        report_number=report_number,
        sender_id=current_user.id,
        receiver_port=report_data.destination_port or "Rotterdam",
        status=init_status,
        vessel_name=report_data.vessel_name,
        imo_number=report_data.imo_number,
        vessel_type=report_data.vessel_type,
        vessel_length=report_data.vessel_length,
        vessel_draft=report_data.vessel_draft,
        flag=report_data.flag,
        origin_port=report_data.origin_port,
        destination_port=report_data.destination_port or "Rotterdam",
        eta=report_data.eta,
        etd=report_data.etd,
        total_containers=report_data.total_containers or 0,
        import_containers=report_data.import_containers or 0,
        export_containers=report_data.export_containers or 0,
        reefer_containers=report_data.reefer_containers or 0,
        hazardous_containers=report_data.hazardous_containers or 0,
        cargo_description=report_data.cargo_description,
        predicted_wait_hours=predicted_wait,
        congestion_level=cong_level,
        confidence_score=conf_score,
        assigned_berth_code=rec_berth,
        sent_at=now if is_send else None,
    )
    db.add(report)
    db.flush()

    # Create audit history log
    history = models.ReportStatusHistory(
        report_id=report.id,
        previous_status=None,
        new_status=init_status.value,
        changed_by_id=current_user.id,
        notes="Initial report created by shipping agent" if is_send else "Draft created"
    )
    db.add(history)

    # Also log to ML predictions table
    if predicted_wait is not None:
        ml_log = models.MLPredictionLog(
            report_id=report.id,
            vessel_name=report.vessel_name,
            imo_number=report.imo_number,
            vessel_type=report.vessel_type,
            predicted_waiting_time_hours=predicted_wait,
            confidence_score_percent=conf_score or 92.0,
            congestion_level=cong_level or "MODERATE",
            recommended_berth=rec_berth,
            features_json=json.dumps({"containers": report.total_containers, "draft": report.vessel_draft})
        )
        db.add(ml_log)

    db.commit()
    db.refresh(report)

    # Attach sender info
    report.sender = current_user
    return report

@app.get("/api/reports/sent", response_model=List[schemas.ReportResponse])
def get_sent_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_shipping_agent),
):
    """Shipping Agent: list all reports submitted by their agency."""
    reports = (
        db.query(models.VesselArrivalReport)
        .options(joinedload(models.VesselArrivalReport.sender_user))
        .filter(models.VesselArrivalReport.sender_id == current_user.id)
        .order_by(models.VesselArrivalReport.created_at.desc())
        .all()
    )
    for r in reports:
        r.sender = r.sender_user
    return reports

@app.get("/api/reports/incoming", response_model=List[schemas.ReportResponse])
def get_incoming_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority),
):
    """
    Port Authority: list reports addressed to their port (by port_name),
    excluding unsubmitted drafts.
    """
    port = current_user.port_name or "Rotterdam"
    reports = (
        db.query(models.VesselArrivalReport)
        .options(joinedload(models.VesselArrivalReport.sender_user))
        .filter(
            models.VesselArrivalReport.receiver_port == port,
            models.VesselArrivalReport.status != models.ReportStatusEnum.DRAFT,
        )
        .order_by(models.VesselArrivalReport.sent_at.desc())
        .all()
    )
    for r in reports:
        r.sender = r.sender_user
    return reports

@app.get("/api/reports/accepted", response_model=List[schemas.ReportResponse])
def get_accepted_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority),
):
    """Port Authority: list only ACCEPTED reports for their port."""
    port = current_user.port_name or "Rotterdam"
    reports = (
        db.query(models.VesselArrivalReport)
        .options(joinedload(models.VesselArrivalReport.sender_user))
        .filter(
            models.VesselArrivalReport.receiver_port == port,
            models.VesselArrivalReport.status == models.ReportStatusEnum.ACCEPTED,
        )
        .order_by(models.VesselArrivalReport.sent_at.desc())
        .all()
    )
    for r in reports:
        r.sender = r.sender_user
    return reports

@app.get("/api/reports/{report_id}", response_model=schemas.ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Get single report. Agent can view their own; Authority can view reports for their port."""
    report = (
        db.query(models.VesselArrivalReport)
        .options(joinedload(models.VesselArrivalReport.sender_user))
        .filter(models.VesselArrivalReport.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if current_user.role == models.RoleEnum.SHIPPING_AGENT and report.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this report")

    if current_user.role == models.RoleEnum.PORT_AUTHORITY:
        port = current_user.port_name or "Rotterdam"
        if report.receiver_port != port:
            raise HTTPException(status_code=403, detail="This report is not addressed to your port")

    report.sender = report.sender_user
    return report

@app.patch("/api/reports/{report_id}/status", response_model=schemas.ReportResponse)
def update_report_status(
    report_id: int,
    update: schemas.ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority),
):
    """Port Authority updates report status (ACCEPTED, REJECTED, CHANGES_REQUESTED, BERTHED, COMPLETED)."""
    port = current_user.port_name or "Rotterdam"
    report = db.query(models.VesselArrivalReport).filter(models.VesselArrivalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.receiver_port != port:
        raise HTTPException(status_code=403, detail="Not authorized to update this report")

    prev_status = report.status.value
    report.status = update.status
    report.updated_at = datetime.now(timezone.utc)

    # Audit history record
    history = models.ReportStatusHistory(
        report_id=report.id,
        previous_status=prev_status,
        new_status=update.status.value,
        changed_by_id=current_user.id,
        notes=update.notes or f"Status updated by {current_user.name}"
    )
    db.add(history)
    db.commit()
    db.refresh(report)

    sender = db.query(models.User).filter(models.User.id == report.sender_id).first()
    report.sender = sender
    return report

@app.post("/api/reports/{report_id}/assign-berth", response_model=schemas.ReportResponse)
def assign_berth_to_report(
    report_id: int,
    assignment: schemas.ReportAssignBerth,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_port_authority)
):
    """Assigns an active berth and updates quayside mooring."""
    report = db.query(models.VesselArrivalReport).filter(models.VesselArrivalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.assigned_berth_code = assignment.berth_code
    report.updated_at = datetime.now(timezone.utc)

    # Update the berth physical status
    berth = db.query(models.Berth).filter(models.Berth.berth_code == assignment.berth_code).first()
    if berth:
        berth.status = models.ResourceStatusEnum.INCOMING
        berth.current_vessel_name = report.vessel_name
        if assignment.cranes_allocated:
            berth.cranes_allocated = assignment.cranes_allocated

    db.commit()
    db.refresh(report)
    sender = db.query(models.User).filter(models.User.id == report.sender_id).first()
    report.sender = sender
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
