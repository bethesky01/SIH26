import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), default="investigator")  # investigator, forensic_expert, admin
    organization = Column(String(128), default="Digital Forensic & Cyber Security Cell")
    badge_number = Column(String(64), default="INV-9821")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(64), unique=True, nullable=False, index=True)  # e.g. CASE-2026-001
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    investigator_name = Column(String(128), nullable=False)
    organization = Column(String(128), nullable=False)
    location = Column(String(255), nullable=False)
    status = Column(String(32), default="Active")  # Active, Under Review, Closed, Archived
    priority = Column(String(32), default="High")  # Critical, High, Medium, Low
    incident_date = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    devices = relationship("Device", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    custody_records = relationship("ChainOfCustody", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="case", cascade="all, delete-orphan")


class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    device_name = Column(String(128), nullable=False)
    vendor = Column(String(64), nullable=False)  # Hikvision, Dahua, CP Plus, Matrix, Generic
    model_name = Column(String(128), nullable=False)
    device_type = Column(String(64), default="NVR")  # NVR, DVR, Hybrid, IP-SAN
    firmware_version = Column(String(64), default="v4.22.015")
    file_system = Column(String(64), default="Proprietary FS")
    channels_count = Column(Integer, default=4)
    serial_number = Column(String(128), nullable=True)
    ip_address = Column(String(64), nullable=True)
    mac_address = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="devices")
    cameras = relationship("Camera", back_populates="device", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="device")


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_id = Column(String(36), ForeignKey("devices.id", ondelete="CASCADE"), nullable=False)
    channel_number = Column(Integer, nullable=False)  # 1, 2, 3, etc.
    camera_name = Column(String(128), nullable=False)
    location = Column(String(255), nullable=True)
    clock_offset_seconds = Column(Integer, default=0)  # Clock drift in seconds (e.g. +330s)
    resolution = Column(String(32), default="1920x1080")
    fps = Column(Float, default=25.0)
    status = Column(String(32), default="Online")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    device = relationship("Device", back_populates="cameras")
    evidence_items = relationship("Evidence", back_populates="camera")
    timeline_events = relationship("TimelineEvent", back_populates="camera")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evidence_id = Column(String(64), unique=True, nullable=False, index=True)  # EVD-000124
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String(36), ForeignKey("devices.id", ondelete="SET NULL"), nullable=True)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)

    filename = Column(String(255), nullable=False)
    original_path = Column(String(512), nullable=False)
    forensic_copy_path = Column(String(512), nullable=True)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(64), default="video/mp4")

    # Cryptographic integrity
    hash_sha256 = Column(String(64), nullable=False, index=True)
    hash_md5 = Column(String(32), nullable=False)

    acquisition_timestamp = Column(DateTime, default=datetime.utcnow)
    acquisition_method = Column(String(128), default="Bit-Stream Forensic Copy (File-Level)")
    original_timestamp = Column(String(64), nullable=True)
    normalized_timestamp = Column(String(64), nullable=True)

    duration_seconds = Column(Float, default=0.0)
    resolution = Column(String(32), default="1920x1080")
    fps = Column(Float, default=25.0)
    codec = Column(String(32), default="H.264 / AVC")
    vendor = Column(String(64), default="Hikvision")

    status = Column(String(32), default="Acquired")  # Acquired, Verified, Parsed, Recovered, Flagged
    is_read_only = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    case = relationship("Case", back_populates="evidence_items")
    device = relationship("Device", back_populates="evidence_items")
    camera = relationship("Camera", back_populates="evidence_items")
    detections = relationship("Detection", back_populates="evidence", cascade="all, delete-orphan")
    recovery_records = relationship("RecoveryRecord", back_populates="evidence", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="evidence", cascade="all, delete-orphan")
    hash_records = relationship("HashRecord", back_populates="evidence", cascade="all, delete-orphan")
    custody_records = relationship("ChainOfCustody", back_populates="evidence", cascade="all, delete-orphan")


class Detection(Base):
    __tablename__ = "detections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    detection_id = Column(String(64), unique=True, nullable=False, index=True)  # DET-000124
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)

    timestamp_sec = Column(Float, nullable=False)
    timestamp_str = Column(String(64), nullable=False)  # HH:MM:SS format
    detection_type = Column(String(64), nullable=False)  # Person, Vehicle, Face, Motion, Object
    label = Column(String(128), default="Person")
    confidence = Column(Float, default=0.90)

    # Normalized bounding box coordinates (0.0 to 1.0 or pixel coordinates)
    bbox_x = Column(Float, default=0.1)
    bbox_y = Column(Float, default=0.1)
    bbox_w = Column(Float, default=0.2)
    bbox_h = Column(Float, default=0.4)

    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evidence = relationship("Evidence", back_populates="detections")


class RecoveryRecord(Base):
    __tablename__ = "recovery_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    fragment_id = Column(String(64), unique=True, nullable=False, index=True)  # REC-0091
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)

    cluster_offset = Column(String(64), default="0x00A4F000")
    hex_signature = Column(String(64), default="00 00 00 01 67 42 C0")
    estimated_duration_sec = Column(Float, default=45.0)
    recovery_status = Column(String(64), default="Recovered")  # Recoverable, Partially Recoverable, Corrupted, Not Recoverable, Recovered
    confidence = Column(Float, default=0.88)
    carved_file_path = Column(String(512), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evidence = relationship("Evidence", back_populates="recovery_records")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)
    camera_id = Column(String(36), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)

    event_type = Column(String(64), nullable=False)  # recording_span, motion, person, vehicle, face, recovered, acquisition
    original_timestamp = Column(String(64), nullable=False)
    normalized_timestamp = Column(String(64), nullable=False)
    start_sec = Column(Float, default=0.0)
    end_sec = Column(Float, default=0.0)
    description = Column(String(255), nullable=False)
    severity = Column(String(32), default="INFO")  # INFO, WARNING, CRITICAL
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="timeline_events")
    evidence = relationship("Evidence", back_populates="timeline_events")
    camera = relationship("Camera", back_populates="timeline_events")


class HashRecord(Base):
    __tablename__ = "hash_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    calculated_sha256 = Column(String(64), nullable=False)
    calculated_md5 = Column(String(32), nullable=False)
    baseline_sha256 = Column(String(64), nullable=False)
    baseline_md5 = Column(String(32), nullable=False)
    match_status = Column(String(32), default="MATCH")  # MATCH, MISMATCH
    verification_timestamp = Column(DateTime, default=datetime.utcnow)
    verified_by = Column(String(128), default="Forensic Engine v1.0")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    evidence = relationship("Evidence", back_populates="hash_records")


class ChainOfCustody(Base):
    __tablename__ = "chain_of_custody"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(64), unique=True, nullable=False, index=True)  # AUDIT-0001
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="SET NULL"), nullable=True)

    block_number = Column(Integer, nullable=False, index=True)
    actor_name = Column(String(128), default="Investigator Verma")
    actor_role = Column(String(64), default="Forensic Analyst")
    action = Column(String(128), nullable=False)  # Evidence Ingested, Hash Recalculated, etc.
    timestamp = Column(DateTime, default=datetime.utcnow)

    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)
    evidence_hash = Column(String(64), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="custody_records")
    evidence = relationship("Evidence", back_populates="custody_records")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_id = Column(String(64), unique=True, nullable=False, index=True)  # REP-2026-001
    case_id = Column(String(36), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    generated_by = Column(String(128), default="Senior Forensic Examiner")
    file_path = Column(String(512), nullable=False)
    format = Column(String(16), default="PDF")
    hash_sha256 = Column(String(64), nullable=False)
    summary_findings = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("Case", back_populates="reports")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(64), unique=True, nullable=False, index=True)
    evidence_id = Column(String(36), nullable=False)
    job_type = Column(String(64), default="AI_VIDEO_ANALYSIS")
    status = Column(String(32), default="QUEUED")  # QUEUED, PROCESSING, COMPLETED, FAILED
    progress = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
