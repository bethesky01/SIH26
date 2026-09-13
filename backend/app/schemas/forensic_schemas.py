from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

# User Schemas
class UserBase(BaseModel):
    username: str
    full_name: str
    role: str = "investigator"
    organization: str
    badge_number: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Case Schemas
class CaseBase(BaseModel):
    case_id: str
    name: str
    description: Optional[str] = None
    investigator_name: str
    organization: str
    location: str
    status: str = "Active"
    priority: str = "High"
    incident_date: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: str
    created_at: datetime
    updated_at: datetime
    devices_count: Optional[int] = 0
    evidence_count: Optional[int] = 0
    model_config = ConfigDict(from_attributes=True)

# Camera Schemas
class CameraBase(BaseModel):
    channel_number: int
    camera_name: str
    location: Optional[str] = None
    clock_offset_seconds: int = 0
    resolution: str = "1920x1080"
    fps: float = 25.0
    status: str = "Online"

class CameraCreate(CameraBase):
    device_id: str

class CameraResponse(CameraBase):
    id: str
    device_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Device Schemas
class DeviceBase(BaseModel):
    device_name: str
    vendor: str
    model_name: str
    device_type: str = "NVR"
    firmware_version: str = "v4.22.015"
    file_system: str = "Proprietary FS"
    channels_count: int = 4
    serial_number: Optional[str] = None
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None

class DeviceCreate(DeviceBase):
    case_id: str

class DeviceResponse(DeviceBase):
    id: str
    case_id: str
    cameras: List[CameraResponse] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Evidence Schemas
class EvidenceBase(BaseModel):
    evidence_id: str
    filename: str
    file_size: int
    mime_type: str
    hash_sha256: str
    hash_md5: str
    acquisition_timestamp: datetime
    original_timestamp: Optional[str] = None
    normalized_timestamp: Optional[str] = None
    duration_seconds: float = 0.0
    resolution: str = "1920x1080"
    fps: float = 25.0
    codec: str = "H.264 / AVC"
    vendor: str = "Hikvision"
    status: str = "Acquired"
    is_read_only: bool = True

class EvidenceCreate(BaseModel):
    case_id: str
    device_id: Optional[str] = None
    camera_id: Optional[str] = None
    filename: str
    vendor: Optional[str] = "Generic"
    original_timestamp: Optional[str] = None

class EvidenceResponse(EvidenceBase):
    id: str
    case_id: str
    device_id: Optional[str] = None
    camera_id: Optional[str] = None
    forensic_copy_path: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Detection Schemas
class DetectionBase(BaseModel):
    detection_id: str
    timestamp_sec: float
    timestamp_str: str
    detection_type: str
    label: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_w: float
    bbox_h: float
    metadata_json: Optional[str] = None

class DetectionResponse(DetectionBase):
    id: str
    evidence_id: str
    camera_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Recovery Record Schemas
class RecoveryRecordBase(BaseModel):
    fragment_id: str
    cluster_offset: str
    hex_signature: str
    estimated_duration_sec: float
    recovery_status: str
    confidence: float
    details: Optional[str] = None

class RecoveryRecordResponse(RecoveryRecordBase):
    id: str
    evidence_id: str
    camera_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Timeline Event Schemas
class TimelineEventBase(BaseModel):
    event_type: str
    original_timestamp: str
    normalized_timestamp: str
    start_sec: float = 0.0
    end_sec: float = 0.0
    description: str
    severity: str = "INFO"
    confidence: float = 1.0

class TimelineEventResponse(TimelineEventBase):
    id: str
    case_id: str
    evidence_id: Optional[str] = None
    camera_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Chain of Custody / Ledger Schemas
class ChainOfCustodyBase(BaseModel):
    event_id: str
    block_number: int
    actor_name: str
    actor_role: str
    action: str
    timestamp: datetime
    previous_hash: str
    current_hash: str
    evidence_hash: Optional[str] = None
    description: Optional[str] = None

class ChainOfCustodyResponse(ChainOfCustodyBase):
    id: str
    case_id: str
    evidence_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ChainVerificationResult(BaseModel):
    is_valid: bool
    status: str
    total_blocks: int
    genesis_hash: str
    latest_hash: str
    invalid_block_index: Optional[int] = None
    message: str

# Integrity Verification Schemas
class HashVerificationRequest(BaseModel):
    evidence_id: str
    recalculate: bool = True

class HashVerificationResponse(BaseModel):
    evidence_id: str
    baseline_sha256: str
    baseline_md5: str
    calculated_sha256: str
    calculated_md5: str
    is_verified: bool
    status: str
    tamper_detected: bool
    message: str
    timestamp: datetime

# Report Schemas
class ReportGenerateRequest(BaseModel):
    case_id: str
    title: Optional[str] = None
    include_ai_findings: bool = True
    include_timeline: bool = True
    include_recovery: bool = True
    include_custody_ledger: bool = True

class ReportResponse(BaseModel):
    id: str
    report_id: str
    case_id: str
    title: str
    generated_by: str
    file_path: str
    format: str
    hash_sha256: str
    summary_findings: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Natural Language Search Query
class EventSearchRequest(BaseModel):
    query: str
    case_id: Optional[str] = None
    camera_id: Optional[str] = None
    detection_type: Optional[str] = None
    min_confidence: Optional[float] = 0.5
    start_time: Optional[str] = None
    end_time: Optional[str] = None

# Timestamp Normalization Update
class ClockOffsetUpdate(BaseModel):
    camera_id: str
    clock_offset_seconds: int

# Validation & Accuracy Schemas
class TimestampComparisonItem(BaseModel):
    camera_id: Optional[str] = None
    camera_name: str
    original_timestamp: str
    extracted_timestamp: str
    error_seconds: float

class RecoveryRateMetrics(BaseModel):
    total_fragments_analyzed: int
    valid_fragments: int
    recovered_files: int
    deleted_recovered_files: int
    unrecoverable_files: int
    recovery_rate_percent: float

class TimestampAccuracyMetrics(BaseModel):
    total_samples_compared: int
    average_timestamp_error_sec: float
    samples: List[TimestampComparisonItem]

class AIValidationMetrics(BaseModel):
    has_ground_truth: bool
    precision_percent: Optional[float] = None
    recall_percent: Optional[float] = None
    f1_score_percent: Optional[float] = None
    detection_count: int
    average_confidence: float
    status_message: str

class ValidationMetricsResponse(BaseModel):
    case_id: str
    recovery_rate: RecoveryRateMetrics
    timestamp_accuracy: TimestampAccuracyMetrics
    ai_validation: AIValidationMetrics
    timestamp: datetime

# Live Stream / RTSP Ingest Schema
class LiveStreamIngestRequest(BaseModel):
    case_id: str
    stream_url: str
    stream_name: str
    camera_name: Optional[str] = "RTSP Camera Feed"
    vendor: Optional[str] = "Generic RTSP"
    capture_duration_seconds: Optional[float] = 10.0
