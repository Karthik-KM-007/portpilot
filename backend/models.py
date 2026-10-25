from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class RoleEnum(str, enum.Enum):
    SHIPPING_AGENT = "SHIPPING_AGENT"
    PORT_AUTHORITY = "PORT_AUTHORITY"
    ADMIN = "ADMIN"

class VesselStatusEnum(str, enum.Enum):
    INCOMING = "INCOMING"
    AT_ANCHOR = "AT_ANCHOR"
    AT_BERTH = "AT_BERTH"
    DEPARTED = "DEPARTED"

class ReportStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    UNDER_REVIEW = "UNDER_REVIEW"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    BERTHED = "BERTHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ResourceStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    INCOMING = "INCOMING"
    IN_USE = "IN_USE"
    OPTIMAL = "OPTIMAL"
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    MAINTENANCE = "MAINTENANCE"
    CRITICAL = "CRITICAL"

# ---------------------------------------------------------------------------
# User & Agent Models
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.SHIPPING_AGENT)
    company_name = Column(String(160), nullable=True)
    phone = Column(String(40), nullable=True)
    port_name = Column(String(100), nullable=True)  # Assigned port (for PORT_AUTHORITY)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    shipping_agent_profile = relationship("ShippingAgent", back_populates="user", uselist=False)
    submitted_reports = relationship("VesselArrivalReport", back_populates="sender_user", foreign_keys="VesselArrivalReport.sender_id")

class ShippingAgent(Base):
    __tablename__ = "shipping_agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    agency_name = Column(String(160), nullable=False)
    license_number = Column(String(80), unique=True, nullable=True)
    contact_person = Column(String(120), nullable=True)
    phone = Column(String(40), nullable=True)
    email = Column(String(180), nullable=True)
    headquarters_country = Column(String(80), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="shipping_agent_profile")

# ---------------------------------------------------------------------------
# Vessel Registry
# ---------------------------------------------------------------------------

class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(Integer, primary_key=True, index=True)
    vessel_name = Column(String(160), nullable=False, index=True)
    imo_number = Column(String(20), unique=True, index=True, nullable=False)
    call_sign = Column(String(20), nullable=True)
    mmsi = Column(String(20), nullable=True)
    vessel_type = Column(String(80), nullable=False, default="Container Ship")
    flag = Column(String(60), nullable=True)
    built_year = Column(Integer, nullable=True)
    deadweight_tonnage = Column(Integer, nullable=True)
    gross_tonnage = Column(Integer, nullable=True)
    vessel_length = Column(Float, nullable=False)  # LOA in meters
    vessel_draft = Column(Float, nullable=False)   # Draft in meters
    container_count = Column(Integer, nullable=False, default=0) # TEU capacity
    status = Column(Enum(VesselStatusEnum), default=VesselStatusEnum.INCOMING)
    origin = Column(String(120), nullable=True)
    destination = Column(String(120), nullable=True)
    eta = Column(DateTime(timezone=True), nullable=True)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# ---------------------------------------------------------------------------
# Port Physical Resources
# ---------------------------------------------------------------------------

class Berth(Base):
    __tablename__ = "port_berths"

    id = Column(Integer, primary_key=True, index=True)
    berth_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g. B-01
    name = Column(String(160), nullable=False)
    port_name = Column(String(100), nullable=False, default="Rotterdam")
    status = Column(Enum(ResourceStatusEnum), nullable=False, default=ResourceStatusEnum.AVAILABLE)
    depth_meters = Column(Float, nullable=False)
    length_meters = Column(Float, nullable=False)
    bollards = Column(Integer, nullable=False, default=20)
    cranes_allocated = Column(Integer, nullable=False, default=2)
    current_vessel_name = Column(String(160), nullable=True)
    current_vessel_id = Column(Integer, ForeignKey("vessels.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Crane(Base):
    __tablename__ = "port_cranes"

    id = Column(Integer, primary_key=True, index=True)
    crane_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g. QC-01
    name = Column(String(160), nullable=False)
    port_name = Column(String(100), nullable=False, default="Rotterdam")
    crane_type = Column(String(80), nullable=False, default="STS Super Post-Panamax")
    status = Column(Enum(ResourceStatusEnum), nullable=False, default=ResourceStatusEnum.AVAILABLE)
    moves_per_hour = Column(Integer, nullable=False, default=32)
    max_reach_rows = Column(String(40), nullable=False, default="24 rows")
    safe_working_load_tons = Column(String(40), nullable=False, default="65 Ton")
    assigned_berth_code = Column(String(30), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class YardBlock(Base):
    __tablename__ = "port_yard_blocks"

    id = Column(Integer, primary_key=True, index=True)
    block_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g. BLK-A1
    port_name = Column(String(100), nullable=False, default="Rotterdam")
    cargo_type = Column(String(80), nullable=False, default="Dry Containers 40ft")
    capacity_teu = Column(Integer, nullable=False, default=3000)
    current_occupancy_teu = Column(Integer, nullable=False, default=2100)
    density_percent = Column(Float, nullable=False, default=70.0)
    status = Column(Enum(ResourceStatusEnum), nullable=False, default=ResourceStatusEnum.NORMAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# ---------------------------------------------------------------------------
# Vessel Arrival Reports (Sender -> Receiver Workflow)
# ---------------------------------------------------------------------------

class VesselArrivalReport(Base):
    __tablename__ = "vessel_arrival_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String(30), unique=True, index=True, nullable=False)  # e.g. PR-0001

    # Sender / Receiver
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_port = Column(String(100), nullable=False)  # Destination port

    # Status
    status = Column(Enum(ReportStatusEnum), default=ReportStatusEnum.DRAFT, nullable=False)

    # Vessel Information
    vessel_id = Column(Integer, ForeignKey("vessels.id", ondelete="SET NULL"), nullable=True)
    vessel_name = Column(String(160), nullable=False)
    imo_number = Column(String(20), nullable=False)
    vessel_type = Column(String(80), nullable=False)
    vessel_length = Column(Float, nullable=True)
    vessel_draft = Column(Float, nullable=True)
    flag = Column(String(60), nullable=True)

    # Voyage Information
    origin_port = Column(String(120), nullable=False)
    destination_port = Column(String(120), nullable=False)
    eta = Column(DateTime(timezone=True), nullable=False)
    etd = Column(DateTime(timezone=True), nullable=True)
    actual_arrival = Column(DateTime(timezone=True), nullable=True)
    actual_departure = Column(DateTime(timezone=True), nullable=True)

    # Cargo Information
    total_containers = Column(Integer, nullable=True, default=0)
    import_containers = Column(Integer, nullable=True, default=0)
    export_containers = Column(Integer, nullable=True, default=0)
    reefer_containers = Column(Integer, nullable=True, default=0)
    hazardous_containers = Column(Integer, nullable=True, default=0)
    cargo_description = Column(Text, nullable=True)

    # Operational Assignments & ML Insights
    assigned_berth_code = Column(String(30), nullable=True)
    predicted_wait_hours = Column(Float, nullable=True)
    congestion_level = Column(String(40), nullable=True)
    confidence_score = Column(Float, nullable=True)
    remarks = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sent_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    sender_user = relationship("User", foreign_keys=[sender_id], back_populates="submitted_reports")
    status_history = relationship("ReportStatusHistory", back_populates="report", cascade="all, delete-orphan")
    ml_predictions = relationship("MLPredictionLog", back_populates="report", cascade="all, delete-orphan")

# ---------------------------------------------------------------------------
# Machine Learning Prediction Logs
# ---------------------------------------------------------------------------

class MLPredictionLog(Base):
    __tablename__ = "ml_prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("vessel_arrival_reports.id", ondelete="SET NULL"), nullable=True)
    vessel_name = Column(String(160), nullable=False)
    imo_number = Column(String(20), nullable=True)
    vessel_type = Column(String(80), nullable=False)
    model_name = Column(String(100), nullable=False, default="XGBoost Regressor")
    model_version = Column(String(50), nullable=False, default="v1.2-xgb-production")
    predicted_waiting_time_hours = Column(Float, nullable=False)
    confidence_score_percent = Column(Float, nullable=False)
    congestion_level = Column(String(30), nullable=False)
    recommended_berth = Column(String(80), nullable=True)
    recommended_cranes = Column(Integer, nullable=True)
    features_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("VesselArrivalReport", back_populates="ml_predictions")

# ---------------------------------------------------------------------------
# Report Status History (Audit Log)
# ---------------------------------------------------------------------------

class ReportStatusHistory(Base):
    __tablename__ = "report_status_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("vessel_arrival_reports.id", ondelete="CASCADE"), nullable=False)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    report = relationship("VesselArrivalReport", back_populates="status_history")
    changed_by_user = relationship("User", foreign_keys=[changed_by_id])
