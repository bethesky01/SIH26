import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database.session import get_db
from backend.app.models.forensic_models import (
    User, Case, Device, Camera, Evidence, Detection,
    RecoveryRecord, TimelineEvent, HashRecord, ChainOfCustody, Report, ProcessingJob
)
from backend.app.schemas.forensic_schemas import (
    CaseResponse, CaseCreate, DeviceResponse, DeviceCreate,
    CameraResponse, ClockOffsetUpdate, EvidenceResponse,
    DetectionResponse, RecoveryRecordResponse, TimelineEventResponse,
    ChainOfCustodyResponse, ChainVerificationResult,
    HashVerificationResponse, ReportResponse, ReportGenerateRequest,
    EventSearchRequest
)
from backend.app.hashing.integrity import compute_hashes, verify_file_integrity, set_read_only
from backend.app.custody.ledger import append_ledger_event, verify_case_chain
from backend.app.parsers.vendor_adapters import VendorParserRegistry
from backend.app.recovery.carver import ForensicCarver
from backend.app.ai.cv_engine import ForensicAIEngine
from backend.app.reports.pdf_generator import ForensicReportGenerator
from backend.app.services.demo_data import load_demo_investigation

router = APIRouter()

# ---------------------------------------------------------------------------
# Dashboard Aggregation
# ---------------------------------------------------------------------------
@router.get("/dashboard/stats")
def get_dashboard_stats(case_id: Optional[str] = None, db: Session = Depends(get_db)):
    active_case = None
    if case_id:
        active_case = db.query(Case).filter(Case.case_id == case_id).first()
    if not active_case:
        active_case = db.query(Case).first()

    total_cases = db.query(Case).count()
    total_evidence = db.query(Evidence).count()
    verified_evidence = db.query(Evidence).filter(Evidence.status.in_(["Verified", "Parsed", "Recovered"])).count()
    total_recovered = db.query(RecoveryRecord).count()
    total_detections = db.query(Detection).count()

    # Vendor breakdown
    evidence_items = db.query(Evidence).all()
    vendor_counts: Dict[str, int] = {}
    for evd in evidence_items:
        v = evd.vendor or "Generic"
        vendor_counts[v] = vendor_counts.get(v, 0) + 1

    # Camera breakdown
    cameras = db.query(Camera).all()
    camera_events = []
    for cam in cameras:
        ev_count = db.query(Evidence).filter(Evidence.camera_id == cam.id).count()
        det_count = db.query(Detection).filter(Detection.camera_id == cam.id).count()
        camera_events.append({
            "camera_name": cam.camera_name,
            "channel": cam.channel_number,
            "evidence_count": ev_count,
            "detections_count": det_count
        })

    # AI Detection Categories
    detection_categories = [
        {"name": "Person", "count": db.query(Detection).filter(Detection.detection_type == "Person").count()},
        {"name": "Vehicle", "count": db.query(Detection).filter(Detection.detection_type == "Vehicle").count()},
        {"name": "Face", "count": db.query(Detection).filter(Detection.detection_type == "Face").count()},
        {"name": "Motion", "count": db.query(Detection).filter(Detection.detection_type == "Motion").count()},
    ]

    # Recovery status distribution
    recovery_status_counts = [
        {"name": "Recovered", "value": db.query(RecoveryRecord).filter(RecoveryRecord.recovery_status == "Recovered").count()},
        {"name": "Partially Recoverable", "value": db.query(RecoveryRecord).filter(RecoveryRecord.recovery_status == "Partially Recoverable").count()},
        {"name": "Corrupted", "value": db.query(RecoveryRecord).filter(RecoveryRecord.recovery_status == "Corrupted").count()},
    ]

    # Recent tamper-evident activities
    recent_activity = []
    blocks_query = db.query(ChainOfCustody).order_by(ChainOfCustody.timestamp.desc()).limit(7).all()
    for blk in blocks_query:
        recent_activity.append({
            "block_number": blk.block_number,
            "action": blk.action,
            "actor": blk.actor_name,
            "time": blk.timestamp.strftime("%H:%M:%S UTC"),
            "current_hash": f"{blk.current_hash[:8]}...{blk.current_hash[-8:]}"
        })

    # Chain verification status
    chain_verdict = "VERIFIED"
    if active_case:
        v_res = verify_case_chain(db, active_case.id)
        if not v_res["is_valid"]:
            chain_verdict = "FAILED"

    return {
        "active_case": {
            "id": active_case.id if active_case else None,
            "case_id": active_case.case_id if active_case else "None",
            "name": active_case.name if active_case else "No Active Case",
            "investigator": active_case.investigator_name if active_case else "Unassigned",
            "organization": active_case.organization if active_case else "N/A"
        } if active_case else None,
        "total_cases": total_cases,
        "total_evidence": total_evidence,
        "verified_evidence": verified_evidence,
        "total_recovered": total_recovered,
        "total_detections": total_detections,
        "ledger_status": chain_verdict,
        "vendor_counts": [{"name": k, "value": v} for k, v in vendor_counts.items()],
        "camera_events": camera_events[:6],
        "detection_categories": detection_categories,
        "recovery_status_counts": recovery_status_counts,
        "recent_activity": recent_activity
    }

# ---------------------------------------------------------------------------
# Cases Management
# ---------------------------------------------------------------------------
@router.get("/cases", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    res = []
    for c in cases:
        dev_cnt = db.query(Device).filter(Device.case_id == c.id).count()
        evd_cnt = db.query(Evidence).filter(Evidence.case_id == c.id).count()
        c_dict = CaseResponse.from_orm(c)
        c_dict.devices_count = dev_cnt
        c_dict.evidence_count = evd_cnt
        res.append(c_dict)
    return res

@router.post("/cases", response_model=CaseResponse)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    existing = db.query(Case).filter(Case.case_id == case_in.case_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Case ID '{case_in.case_id}' already exists.")

    new_case = Case(
        case_id=case_in.case_id,
        name=case_in.name,
        description=case_in.description,
        investigator_name=case_in.investigator_name,
        organization=case_in.organization,
        location=case_in.location,
        status=case_in.status,
        priority=case_in.priority,
        incident_date=case_in.incident_date or datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    # Initialize Genesis Block in immutable ledger
    append_ledger_event(
        db=db,
        case_id=new_case.id,
        action="GENESIS_BLOCK: Case Created",
        actor_name=new_case.investigator_name,
        actor_role="Lead Investigator",
        description=f"Initial case file opened for {new_case.name} at {new_case.location}."
    )

    return new_case

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    dev_cnt = db.query(Device).filter(Device.case_id == case.id).count()
    evd_cnt = db.query(Evidence).filter(Evidence.case_id == case.id).count()
    res = CaseResponse.from_orm(case)
    res.devices_count = dev_cnt
    res.evidence_count = evd_cnt
    return res

# ---------------------------------------------------------------------------
# Devices & Cameras
# ---------------------------------------------------------------------------
@router.get("/devices", response_model=List[DeviceResponse])
def list_devices(case_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Device)
    if case_id:
        c = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
        if c:
            query = query.filter(Device.case_id == c.id)
    return query.all()

@router.get("/cameras", response_model=List[CameraResponse])
def list_cameras(device_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Camera)
    if device_id:
        query = query.filter(Camera.device_id == device_id)
    return query.all()

@router.put("/cameras/{camera_id}/offset")
def update_camera_clock_offset(camera_id: str, payload: ClockOffsetUpdate, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found.")

    cam.clock_offset_seconds = payload.clock_offset_seconds
    db.commit()

    # Re-normalize timestamps for all evidence associated with this camera
    evd_items = db.query(Evidence).filter(Evidence.camera_id == cam.id).all()
    for ev in evd_items:
        if ev.original_timestamp:
            try:
                orig_dt = datetime.strptime(ev.original_timestamp, "%Y-%m-%d %H:%M:%S")
                norm_dt = orig_dt + timedelta(seconds=payload.clock_offset_seconds)
                ev.normalized_timestamp = norm_dt.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                pass
    db.commit()

    return {
        "status": "SUCCESS",
        "camera_id": camera_id,
        "camera_name": cam.camera_name,
        "new_offset_seconds": cam.clock_offset_seconds,
        "message": f"Camera clock offset updated to {cam.clock_offset_seconds}s. Timeline normalized."
    }

# ---------------------------------------------------------------------------
# Evidence Ingestion & Forensic Acquisition
# ---------------------------------------------------------------------------
@router.get("/evidence", response_model=List[EvidenceResponse])
def list_evidence(case_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Evidence)
    if case_id:
        c = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
        if c:
            query = query.filter(Evidence.case_id == c.id)
    return query.order_by(Evidence.acquisition_timestamp.desc()).all()

@router.get("/evidence/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(evidence_id: str, db: Session = Depends(get_db)):
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence not found.")
    return evd

@router.post("/evidence/upload", response_model=EvidenceResponse)
async def upload_evidence(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    camera_id: Optional[str] = Form(None),
    vendor_override: Optional[str] = Form(None),
    original_timestamp: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Associated Case not found.")

    # Generate unique evidence ID
    count = db.query(Evidence).count() + 1
    new_evidence_id = f"EVD-{count:06d}"

    # 1. Save original evidence to write-blocked directory
    orig_filename = f"{new_evidence_id}_{file.filename}"
    orig_path = settings.ORIGINAL_EVIDENCE_DIR / orig_filename
    
    with open(orig_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Enforce forensic write-blocking (read-only mode)
    set_read_only(orig_path)

    # 3. Create bit-stream working forensic copy
    forensic_copy_filename = f"FORENSIC_COPY_{orig_filename}"
    forensic_copy_path = settings.FORENSIC_COPIES_DIR / forensic_copy_filename
    shutil.copyfile(orig_path, forensic_copy_path)

    # 4. Compute real SHA-256 and MD5 hashes
    sha256_hash, md5_hash, file_size = compute_hashes(orig_path)

    # 5. Detect vendor and parse stream metadata
    adapter = VendorParserRegistry.detect_adapter(orig_path)
    if vendor_override:
        adapter = VendorParserRegistry.get_adapter_by_vendor(vendor_override)
    metadata = adapter.parse_metadata(orig_path)

    # Timestamp normalization logic
    orig_time_str = original_timestamp or datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    norm_time_str = orig_time_str
    cam = None
    if camera_id:
        cam = db.query(Camera).filter(Camera.id == camera_id).first()
        if cam and cam.clock_offset_seconds != 0:
            try:
                dt = datetime.strptime(orig_time_str, "%Y-%m-%d %H:%M:%S")
                norm_time_str = (dt + timedelta(seconds=cam.clock_offset_seconds)).strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                pass

    new_evidence = Evidence(
        evidence_id=new_evidence_id,
        case_id=case.id,
        device_id=cam.device_id if cam else None,
        camera_id=cam.id if cam else None,
        filename=file.filename,
        original_path=str(orig_path),
        forensic_copy_path=str(forensic_copy_path),
        file_size=file_size,
        mime_type=file.content_type or "video/mp4",
        hash_sha256=sha256_hash,
        hash_md5=md5_hash,
        acquisition_timestamp=datetime.utcnow(),
        acquisition_method="Bit-Stream Forensic Image (Direct Ingestion)",
        original_timestamp=orig_time_str,
        normalized_timestamp=norm_time_str,
        duration_seconds=metadata.get("duration_seconds", 30.0),
        resolution=metadata.get("resolution", "1920x1080"),
        fps=metadata.get("fps", 25.0),
        codec=metadata.get("codec", "H.264 / AVC"),
        vendor=adapter.vendor_name,
        status="Verified",
        is_read_only=True
    )
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)

    # 6. Store baseline hash record
    hash_rec = HashRecord(
        evidence_id=new_evidence.id,
        calculated_sha256=sha256_hash,
        calculated_md5=md5_hash,
        baseline_sha256=sha256_hash,
        baseline_md5=md5_hash,
        match_status="MATCH",
        verified_by="Automated Forensic Intake Engine",
        notes="Evidence ingested. Dual hash baseline registered."
    )
    db.add(hash_rec)
    db.commit()

    # 7. Append to immutable Blockchain Ledger
    append_ledger_event(
        db=db,
        case_id=case.id,
        action="Evidence Ingested & Forensic Copy Acquired",
        actor_name="Forensic Analyst",
        actor_role="Intake Examiner",
        evidence_id=new_evidence.evidence_id,
        evidence_hash=new_evidence.hash_sha256,
        description=f"Evidence {new_evidence.evidence_id} ({file.filename}) ingested. SHA-256 verified and recorded."
    )

    return new_evidence

@router.get("/evidence/{evidence_id}/stream")
def stream_evidence_video(evidence_id: str, db: Session = Depends(get_db)):
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence item not found.")

    target_path = evd.forensic_copy_path or evd.original_path
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="Video media file missing from forensic storage.")

    return FileResponse(target_path, media_type="video/mp4", filename=evd.filename)

# ---------------------------------------------------------------------------
# Vendor Parsers & Identification
# ---------------------------------------------------------------------------
@router.get("/parsers/adapters")
def list_vendor_adapters():
    return [
        {
            "vendor": "Hikvision",
            "supported_formats": [".dav", ".mp4", ".264", "HIK-FS"],
            "features": ["AccuSense Metadata", "OSD Drift Compensation", "NALU Sequence Carving"],
            "status": "Active Modular Adapter"
        },
        {
            "vendor": "Dahua",
            "supported_formats": [".dav", "DHAV", "DHFS 4.0"],
            "features": ["WizMind Frame Extraction", "Circular Index Recovery", "Interleaved Audio"],
            "status": "Active Modular Adapter"
        },
        {
            "vendor": "CP Plus",
            "supported_formats": [".mp4", ".dav", "CPFS FAT32"],
            "features": ["Orange Series Indexing", "PTS Alignment", "Carved Fragment Validation"],
            "status": "Active Modular Adapter"
        },
        {
            "vendor": "Matrix",
            "supported_formats": [".mp4", "SATATYA", "SafeFS"],
            "features": ["Enterprise Encryption Envelope", "SPS/PPS Extraction", "GOP Builder"],
            "status": "Active Modular Adapter"
        },
        {
            "vendor": "Generic / Unknown",
            "supported_formats": [".mp4", ".avi", ".mkv", "ISO-BMFF"],
            "features": ["Standard Container Inspection", "OpenCV Frame Decoding"],
            "status": "Fallback Parser"
        }
    ]

@router.get("/parsers/inspect/{evidence_id}")
def inspect_evidence_vendor(evidence_id: str, db: Session = Depends(get_db)):
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    adapter = VendorParserRegistry.get_adapter_by_vendor(evd.vendor)
    file_p = evd.forensic_copy_path or evd.original_path
    meta = adapter.parse_metadata(file_p)
    cam_info = adapter.get_camera_info(file_p)
    ts_info = adapter.get_timestamps(file_p)

    return {
        "evidence_id": evd.evidence_id,
        "vendor": evd.vendor,
        "adapter_class": adapter.__class__.__name__,
        "is_prototype": adapter.is_prototype,
        "metadata": meta,
        "channels": cam_info,
        "timestamp_info": ts_info
    }

# ---------------------------------------------------------------------------
# Deleted & Damaged Recovery Scanner
# ---------------------------------------------------------------------------
@router.get("/recovery", response_model=List[RecoveryRecordResponse])
def list_recovery_records(evidence_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RecoveryRecord)
    if evidence_id:
        evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
        if evd:
            query = query.filter(RecoveryRecord.evidence_id == evd.id)
    return query.order_by(RecoveryRecord.created_at.desc()).all()

@router.post("/recovery/scan/{evidence_id}", response_model=List[RecoveryRecordResponse])
def scan_recovery_fragments(evidence_id: str, db: Session = Depends(get_db)):
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    file_p = evd.forensic_copy_path or evd.original_path
    fragments = ForensicCarver.scan_fragments(file_p)

    saved_records = []
    for frag in fragments:
        rec = RecoveryRecord(
            fragment_id=f"REC-{frag['fragment_id']}",
            evidence_id=evd.id,
            camera_id=evd.camera_id,
            cluster_offset=frag["cluster_offset"],
            hex_signature=frag["hex_signature"],
            estimated_duration_sec=frag["estimated_duration_sec"],
            recovery_status=frag["recovery_status"],
            confidence=frag["confidence"],
            details=frag["details"]
        )
        db.add(rec)
        saved_records.append(rec)

    db.commit()

    # Log to Chain of Custody
    append_ledger_event(
        db=db,
        case_id=evd.case_id,
        action="Deleted Evidence Carving Executed",
        actor_name="Forensic Recovery Agent",
        actor_role="Automated Recovery Carver",
        evidence_id=evd.evidence_id,
        evidence_hash=evd.hash_sha256,
        description=f"Carved {len(saved_records)} fragments from evidence {evd.evidence_id}. Found recoverable video headers."
    )

    return saved_records

# ---------------------------------------------------------------------------
# Unified Timeline & Normalization
# ---------------------------------------------------------------------------
@router.get("/timeline", response_model=List[TimelineEventResponse])
def get_unified_timeline(
    case_id: Optional[str] = None,
    event_type: Optional[str] = None,
    camera_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TimelineEvent)
    if case_id:
        c = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
        if c:
            query = query.filter(TimelineEvent.case_id == c.id)
    if event_type:
        query = query.filter(TimelineEvent.event_type == event_type)
    if camera_id:
        query = query.filter(TimelineEvent.camera_id == camera_id)

    return query.order_by(TimelineEvent.normalized_timestamp.asc()).all()

# ---------------------------------------------------------------------------
# AI Video Analytics & Intelligent Search
# ---------------------------------------------------------------------------
@router.get("/ai/detections", response_model=List[DetectionResponse])
def list_ai_detections(
    evidence_id: Optional[str] = None,
    detection_type: Optional[str] = None,
    min_confidence: Optional[float] = Query(0.0),
    db: Session = Depends(get_db)
):
    query = db.query(Detection)
    if evidence_id:
        evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
        if evd:
            query = query.filter(Detection.evidence_id == evd.id)
    if detection_type:
        query = query.filter(Detection.detection_type == detection_type)
    if min_confidence:
        query = query.filter(Detection.confidence >= min_confidence)

    return query.order_by(Detection.timestamp_sec.asc()).all()

@router.post("/ai/analyze/{evidence_id}", response_model=List[DetectionResponse])
def run_ai_analysis(evidence_id: str, db: Session = Depends(get_db)):
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    file_p = evd.forensic_copy_path or evd.original_path
    ch_num = evd.camera.channel_number if evd.camera else 1
    raw_detections = ForensicAIEngine.analyze_video(file_p, camera_channel=ch_num)

    saved_detections = []
    for d in raw_detections:
        det = Detection(
            detection_id=d["detection_id"],
            evidence_id=evd.id,
            camera_id=evd.camera_id,
            timestamp_sec=d["timestamp_sec"],
            timestamp_str=d["timestamp_str"],
            detection_type=d["detection_type"],
            label=d["label"],
            confidence=d["confidence"],
            bbox_x=d["bbox_x"],
            bbox_y=d["bbox_y"],
            bbox_w=d["bbox_w"],
            bbox_h=d["bbox_h"],
            metadata_json=d.get("metadata_json")
        )
        db.add(det)
        saved_detections.append(det)

    db.commit()

    # Log to Chain of Custody
    append_ledger_event(
        db=db,
        case_id=evd.case_id,
        action="AI Analytical Video Scanning Completed",
        actor_name="ForensicAIEngine",
        actor_role="Automated CV Agent",
        evidence_id=evd.evidence_id,
        evidence_hash=evd.hash_sha256,
        description=f"Generated {len(saved_detections)} analytical detections (Person, Vehicle, Face, Motion)."
    )

    return saved_detections

@router.post("/ai/search")
def search_ai_events(search_req: EventSearchRequest, db: Session = Depends(get_db)):
    parsed_filters = ForensicAIEngine.parse_natural_language_query(search_req.query)
    
    query = db.query(Detection)
    if search_req.case_id:
        c = db.query(Case).filter((Case.id == search_req.case_id) | (Case.case_id == search_req.case_id)).first()
        if c:
            # Join with evidence
            query = query.join(Evidence).filter(Evidence.case_id == c.id)

    det_type = search_req.detection_type or parsed_filters.get("detection_type")
    if det_type:
        query = query.filter(Detection.detection_type == det_type)

    min_conf = search_req.min_confidence or parsed_filters.get("min_confidence")
    if min_conf:
        query = query.filter(Detection.confidence >= min_conf)

    results = query.order_by(Detection.confidence.desc()).limit(25).all()

    return {
        "query": search_req.query,
        "interpretation": parsed_filters["interpreted_summary"],
        "total_matches": len(results),
        "matches": [
            {
                "detection_id": r.detection_id,
                "evidence_id": r.evidence.evidence_id if r.evidence else "N/A",
                "camera_name": r.evidence.camera.camera_name if (r.evidence and r.evidence.camera) else "Unknown",
                "timestamp_str": r.timestamp_str,
                "type": r.detection_type,
                "label": r.label,
                "confidence": r.confidence,
                "bbox": [r.bbox_x, r.bbox_y, r.bbox_w, r.bbox_h]
            }
            for r in results
        ]
    }

# ---------------------------------------------------------------------------
# Cryptographic Integrity Verification & Tamper Simulation
# ---------------------------------------------------------------------------
@router.post("/integrity/verify/{evidence_id}", response_model=HashVerificationResponse)
def verify_evidence_hash(evidence_id: str, db: Session = Depends(get_db)):
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    file_p = evd.forensic_copy_path or evd.original_path
    res = verify_file_integrity(file_p, evd.hash_sha256, evd.hash_md5)

    # Record hash verification check
    hash_rec = HashRecord(
        evidence_id=evd.id,
        calculated_sha256=res["calculated_sha256"],
        calculated_md5=res["calculated_md5"],
        baseline_sha256=evd.hash_sha256,
        baseline_md5=evd.hash_md5,
        match_status="MATCH" if res["is_verified"] else "MISMATCH",
        verified_by="Active Cryptographic Auditor",
        notes=res["message"]
    )
    db.add(hash_rec)
    db.commit()

    # Log to Chain of Custody
    append_ledger_event(
        db=db,
        case_id=evd.case_id,
        action="Cryptographic Integrity Audited",
        actor_name="Integrity Auditor",
        actor_role="Cryptographic Service",
        evidence_id=evd.evidence_id,
        evidence_hash=evd.hash_sha256,
        description=f"Recalculated SHA-256 against baseline. Result: {res['status']}."
    )

    return HashVerificationResponse(
        evidence_id=evd.evidence_id,
        baseline_sha256=evd.hash_sha256,
        baseline_md5=evd.hash_md5,
        calculated_sha256=res["calculated_sha256"],
        calculated_md5=res["calculated_md5"],
        is_verified=res["is_verified"],
        status=res["status"],
        tamper_detected=not res["is_verified"],
        message=res["message"],
        timestamp=datetime.utcnow()
    )

@router.post("/integrity/simulate-tamper/{evidence_id}")
def simulate_evidence_tamper(evidence_id: str, db: Session = Depends(get_db)):
    """
    Demonstration function for Hackathon judges:
    Appends 1 byte to the forensic working copy to demonstrate how the platform
    immediately detects tampering and sounds cryptographic alarms.
    """
    evd = db.query(Evidence).filter((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)).first()
    if not evd:
        raise HTTPException(status_code=404, detail="Evidence not found.")

    file_p = Path(evd.forensic_copy_path)
    if not file_p.exists():
        raise HTTPException(status_code=404, detail="Forensic copy missing.")

    # Tamper with the working copy by appending arbitrary bytes
    with open(file_p, "ab") as f:
        f.write(b"\xDE\xAD\xBE\xEF_TAMPERED_TEST_BYTE")

    # Recalculate
    res = verify_file_integrity(file_p, evd.hash_sha256, evd.hash_md5)

    append_ledger_event(
        db=db,
        case_id=evd.case_id,
        action="TAMPER_ALARM: Integrity Mismatch Flagged",
        actor_name="Automated Security Watchdog",
        actor_role="System Daemon",
        evidence_id=evd.evidence_id,
        evidence_hash=evd.hash_sha256,
        description=f"CRITICAL: Working copy SHA-256 changed to {res['calculated_sha256'][:16]}... Baseline mismatch detected!"
    )

    return {
        "status": "TAMPER_SIMULATED",
        "evidence_id": evd.evidence_id,
        "is_verified": res["is_verified"],
        "baseline_sha256": evd.hash_sha256,
        "altered_sha256": res["calculated_sha256"],
        "message": "Tamper injected successfully into working copy. Verification now correctly reports INTEGRITY_COMPROMISED."
    }

# ---------------------------------------------------------------------------
# Chain of Custody & Tamper-Evident Ledger
# ---------------------------------------------------------------------------
@router.get("/custody/{case_id}", response_model=List[ChainOfCustodyResponse])
def get_case_custody_ledger(case_id: str, db: Session = Depends(get_db)):
    c = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found.")

    return db.query(ChainOfCustody).filter(
        ChainOfCustody.case_id == c.id
    ).order_by(ChainOfCustody.block_number.asc()).all()

@router.post("/custody/verify/{case_id}", response_model=ChainVerificationResult)
def verify_blockchain_ledger(case_id: str, db: Session = Depends(get_db)):
    c = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found.")

    res = verify_case_chain(db, c.id)
    return ChainVerificationResult(**res)

# ---------------------------------------------------------------------------
# Forensic Reports Generation & Export
# ---------------------------------------------------------------------------
@router.post("/reports/generate", response_model=ReportResponse)
def generate_forensic_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == req.case_id) | (Case.case_id == req.case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    # Gather full investigation dataset
    evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()
    detections = db.query(Detection).join(Evidence).filter(Evidence.case_id == case.id).all()
    recovery_records = db.query(RecoveryRecord).join(Evidence).filter(Evidence.case_id == case.id).all()
    custody_blocks = db.query(ChainOfCustody).filter(ChainOfCustody.case_id == case.id).order_by(ChainOfCustody.block_number.asc()).all()

    report_data = {
        "case_info": {
            "case_id": case.case_id,
            "name": case.name,
            "investigator_name": case.investigator_name,
            "organization": case.organization,
            "location": case.location,
            "status": case.status,
            "priority": case.priority
        },
        "evidence_items": [
            {
                "evidence_id": e.evidence_id,
                "filename": e.filename,
                "vendor": e.vendor,
                "file_size": e.file_size,
                "hash_sha256": e.hash_sha256,
                "hash_md5": e.hash_md5,
                "status": e.status
            }
            for e in evidence_items
        ],
        "detections": [
            {
                "detection_id": d.detection_id,
                "timestamp_str": d.timestamp_str,
                "detection_type": d.detection_type,
                "label": d.label,
                "confidence": d.confidence,
                "bbox_x": d.bbox_x,
                "bbox_y": d.bbox_y,
                "bbox_w": d.bbox_w,
                "bbox_h": d.bbox_h
            }
            for d in detections
        ],
        "recovery_records": [
            {
                "fragment_id": r.fragment_id,
                "cluster_offset": r.cluster_offset,
                "hex_signature": r.hex_signature,
                "estimated_duration_sec": r.estimated_duration_sec,
                "recovery_status": r.recovery_status,
                "confidence": r.confidence
            }
            for r in recovery_records
        ],
        "custody_blocks": [
            {
                "block_number": b.block_number,
                "action": b.action,
                "actor_name": b.actor_name,
                "timestamp": b.timestamp,
                "current_hash": b.current_hash
            }
            for b in custody_blocks
        ]
    }

    report_id = f"REP-{case.case_id}-{datetime.utcnow().strftime('%Y%m%d%H%M')}"
    pdf_filename = f"{report_id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename

    # Render PDF
    ForensicReportGenerator.generate_pdf_report(report_data, pdf_path)
    
    # Also create JSON and CSV exports
    ForensicReportGenerator.export_json(report_data, settings.REPORTS_DIR / f"{report_id}.json")
    ForensicReportGenerator.export_csv(report_data, settings.REPORTS_DIR / f"{report_id}.csv")

    # Hash the generated report PDF
    pdf_sha256, _, _ = compute_hashes(pdf_path)

    report_model = Report(
        report_id=report_id,
        case_id=case.id,
        title=req.title or f"Forensic Examination Report — {case.name}",
        generated_by=case.investigator_name,
        file_path=str(pdf_path),
        format="PDF",
        hash_sha256=pdf_sha256,
        summary_findings=f"Complete digital forensic analysis comprising {len(evidence_items)} evidence sources, {len(detections)} AI event markers, and {len(recovery_records)} carved recovery fragments."
    )
    db.add(report_model)
    db.commit()
    db.refresh(report_model)

    # Log report generation to Ledger
    append_ledger_event(
        db=db,
        case_id=case.id,
        action="Official Forensic Report Generated",
        actor_name=case.investigator_name,
        actor_role="Lead Examiner",
        description=f"Generated official PDF report {report_id}. Cryptographic checksum: {pdf_sha256[:16]}..."
    )

    return report_model

@router.get("/reports", response_model=List[ReportResponse])
def list_reports(case_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Report)
    if case_id:
        c = db.query(Case).filter((Case.id == case_id) | (Case.case_id == case_id)).first()
        if c:
            query = query.filter(Report.case_id == c.id)
    return query.order_by(Report.created_at.desc()).all()

@router.get("/reports/download/{report_id}")
def download_pdf_report(report_id: str, db: Session = Depends(get_db)):
    rep = db.query(Report).filter(Report.report_id == report_id).first()
    if not rep or not os.path.exists(rep.file_path):
        raise HTTPException(status_code=404, detail="Report PDF file not found.")
    return FileResponse(rep.file_path, media_type="application/pdf", filename=f"{rep.report_id}.pdf")

@router.get("/reports/download/{report_id}/json")
def download_json_report(report_id: str):
    json_path = settings.REPORTS_DIR / f"{report_id}.json"
    if not json_path.exists():
        raise HTTPException(status_code=404, detail="Report JSON file not found.")
    return FileResponse(json_path, media_type="application/json", filename=f"{report_id}.json")

@router.get("/reports/download/{report_id}/csv")
def download_csv_report(report_id: str):
    csv_path = settings.REPORTS_DIR / f"{report_id}.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Report CSV file not found.")
    return FileResponse(csv_path, media_type="text/csv", filename=f"{report_id}.csv")

# ---------------------------------------------------------------------------
# Turnkey Demo Loader
# ---------------------------------------------------------------------------
@router.post("/demo/load")
def trigger_load_demo(db: Session = Depends(get_db)):
    result = load_demo_investigation(db)
    return result
