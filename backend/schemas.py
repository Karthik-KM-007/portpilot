from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from models import RoleEnum, VesselStatusEnum, ReportStatusEnum, ResourceStatusEnum

# ---------------------------------------------------------------------------
# Auth & User Schemas
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: RoleEnum
    company_name: Optional[str] = None
    phone: Optional[str] = None
    port_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ShippingAgentCreate(BaseModel):
    agency_name: str
    license_number: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    headquarters_country: Optional[str] = None

class ShippingAgentResponse(ShippingAgentCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Vessel Schemas
# ---------------------------------------------------------------------------

class VesselBase(BaseModel):
    vessel_name: str
    imo_number: str
    vessel_type: str = "Container Ship"
    call_sign: Optional[str] = None
    mmsi: Optional[str] = None
    flag: Optional[str] = None
    vessel_length: float
    vessel_draft: float
    container_count: Optional[int] = 0
    origin: Optional[str] = None
    destination: Optional[str] = None
    eta: Optional[datetime] = None

class VesselCreate(VesselBase):
    built_year: Optional[int] = None
    deadweight_tonnage: Optional[int] = None
    gross_tonnage: Optional[int] = None

class VesselUpdate(BaseModel):
    vessel_name: Optional[str] = None
    vessel_length: Optional[float] = None
    vessel_draft: Optional[float] = None
    status: Optional[VesselStatusEnum] = None
    eta: Optional[datetime] = None

class VesselResponse(VesselBase):
    id: int
    status: VesselStatusEnum
    submitted_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Port Physical Resource Schemas (Berths, Cranes, Yard)
# ---------------------------------------------------------------------------

class BerthBase(BaseModel):
    berth_code: str
    name: str
    port_name: str = "Rotterdam"
    status: ResourceStatusEnum = ResourceStatusEnum.AVAILABLE
    depth_meters: float
    length_meters: float
    bollards: int = 20
    cranes_allocated: int = 2
    current_vessel_name: Optional[str] = None

class BerthCreate(BerthBase):
    pass

class BerthUpdate(BaseModel):
    status: Optional[ResourceStatusEnum] = None
    cranes_allocated: Optional[int] = None
    current_vessel_name: Optional[str] = None

class BerthResponse(BerthBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CraneBase(BaseModel):
    crane_code: str
    name: str
    port_name: str = "Rotterdam"
    crane_type: str = "STS Super Post-Panamax"
    status: ResourceStatusEnum = ResourceStatusEnum.AVAILABLE
    moves_per_hour: int = 32
    max_reach_rows: str = "24 rows"
    safe_working_load_tons: str = "65 Ton"
    assigned_berth_code: Optional[str] = None

class CraneCreate(CraneBase):
    pass

class CraneUpdate(BaseModel):
    status: Optional[ResourceStatusEnum] = None
    moves_per_hour: Optional[int] = None
    assigned_berth_code: Optional[str] = None

class CraneResponse(CraneBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class YardBlockBase(BaseModel):
    block_code: str
    port_name: str = "Rotterdam"
    cargo_type: str = "Dry Containers 40ft"
    capacity_teu: int = 3000
    current_occupancy_teu: int = 2100
    density_percent: float = 70.0
    status: ResourceStatusEnum = ResourceStatusEnum.NORMAL

class YardBlockCreate(YardBlockBase):
    pass

class YardBlockUpdate(BaseModel):
    current_occupancy_teu: Optional[int] = None
    density_percent: Optional[float] = None
    status: Optional[ResourceStatusEnum] = None

class YardBlockResponse(YardBlockBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PortResourceSnapshot(BaseModel):
    available_berths: int
    total_berths: int
    available_cranes: int
    total_cranes: int
    yard_capacity_percent: int
    active_incoming_vessels: int
    database_type: str

# ---------------------------------------------------------------------------
# Vessel Arrival Report Schemas
# ---------------------------------------------------------------------------

class ReportCreate(BaseModel):
    # Vessel
    vessel_name: str
    imo_number: str
    vessel_type: str = "Container Ship"
    vessel_length: Optional[float] = None
    vessel_draft: Optional[float] = None
    flag: Optional[str] = None

    # Voyage
    origin_port: str
    destination_port: str = "Rotterdam"
    eta: datetime
    etd: Optional[datetime] = None

    # Cargo
    total_containers: Optional[int] = 0
    import_containers: Optional[int] = 0
    export_containers: Optional[int] = 0
    reefer_containers: Optional[int] = 0
    hazardous_containers: Optional[int] = 0
    cargo_description: Optional[str] = None

    # Action flag: "draft" | "send"
    action: Optional[str] = "send"

class ReportStatusUpdate(BaseModel):
    status: ReportStatusEnum
    notes: Optional[str] = None

class ReportAssignBerth(BaseModel):
    berth_code: str
    cranes_allocated: Optional[int] = None

class SenderInfo(BaseModel):
    id: int
    name: str
    email: str
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

class StatusHistoryResponse(BaseModel):
    id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    id: int
    report_number: str
    sender_id: int
    sender: Optional[SenderInfo] = None
    receiver_port: str
    status: ReportStatusEnum

    # Vessel
    vessel_id: Optional[int] = None
    vessel_name: str
    imo_number: str
    vessel_type: str
    vessel_length: Optional[float] = None
    vessel_draft: Optional[float] = None
    flag: Optional[str] = None

    # Voyage
    origin_port: str
    destination_port: str
    eta: datetime
    etd: Optional[datetime] = None

    # Cargo
    total_containers: Optional[int] = 0
    import_containers: Optional[int] = 0
    export_containers: Optional[int] = 0
    reefer_containers: Optional[int] = 0
    hazardous_containers: Optional[int] = 0
    cargo_description: Optional[str] = None

    # Operational & ML details
    assigned_berth_code: Optional[str] = None
    predicted_wait_hours: Optional[float] = None
    congestion_level: Optional[str] = None
    confidence_score: Optional[float] = None
    remarks: Optional[str] = None

    created_at: datetime
    sent_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ---------------------------------------------------------------------------
# Machine Learning Schemas
# ---------------------------------------------------------------------------

class MLPredictRequest(BaseModel):
    vessel_name: Optional[str] = "Unknown Vessel"
    imo_number: Optional[str] = None
    vessel_type: str = "Container Ship"
    vessel_length_m: float = Field(default=300.0, ge=50, le=450)
    vessel_draft_m: float = Field(default=13.5, ge=4, le=22)
    total_teu: int = Field(default=8500, ge=0, le=30000)
    berth_occupancy_ratio: Optional[float] = Field(default=0.72, ge=0.0, le=1.0)
    available_cranes: Optional[int] = Field(default=4, ge=1, le=12)
    yard_density_percent: Optional[float] = Field(default=75.0, ge=10.0, le=100.0)
    wind_speed_knots: Optional[float] = Field(default=12.0, ge=0.0, le=65.0)
    eta: Optional[datetime] = None
    report_id: Optional[int] = None

class MLPredictResponse(BaseModel):
    model_name: str
    model_version: str
    model_r2_score: float
    model_mae_hours: float
    predicted_waiting_time_hours: float
    confidence_score_percent: float
    congestion_level: str
    congestion_color: str
    estimated_berthing_time: str
    estimated_departure_time: str
    estimated_turnaround_hours: float
    recommended_berth: str
    recommended_cranes: int
    operational_factors: Dict[str, Any]
    data_provenance: str

class MLModelMetricsResponse(BaseModel):
    evaluation_timestamp: str
    dataset_info: Dict[str, Any]
    models: Dict[str, Any]
    selected_model: Dict[str, Any]

class MLPredictionLogResponse(BaseModel):
    id: int
    report_id: Optional[int] = None
    vessel_name: str
    imo_number: Optional[str] = None
    vessel_type: str
    model_name: str
    model_version: str
    predicted_waiting_time_hours: float
    confidence_score_percent: float
    congestion_level: str
    recommended_berth: Optional[str] = None
    recommended_cranes: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
