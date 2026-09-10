import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
import numpy as np
import cv2
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.forensic_models import (
    Base, User, Case, Device, Camera, Evidence, Detection,
    RecoveryRecord, TimelineEvent, HashRecord, ChainOfCustody
)
from backend.app.hashing.integrity import compute_hashes, set_read_only
from backend.app.custody.ledger import append_ledger_event

def generate_synthetic_cctv_video(
    output_path: Path,
    camera_name: str,
    channel_num: int,
    base_time_str: str,
    duration_sec: int = 15,
    fps: int = 10,
    width: int = 640,
    height: int = 360
) -> Path:
    """
    Generates a synthetic forensic CCTV video clip with burned-in OSD metadata,
    timestamp clock, and simulated movement (subject/vehicle).
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    total_frames = duration_sec * fps
    start_dt = datetime.strptime(base_time_str, "%Y-%m-%d %H:%M:%S")

    for f_idx in range(total_frames):
        current_time = start_dt + timedelta(seconds=f_idx / fps)
        time_display = current_time.strftime("%Y-%m-%d %H:%M:%S.%f")[:-4]

        # Dark CCTV surveillance background (slate / industrial grey)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (22, 27, 34)  # Dark surveillance background

        # Draw grid lines to mimic warehouse floor / parking lanes
        cv2.line(frame, (0, int(height * 0.7)), (width, int(height * 0.7)), (45, 55, 72), 1)
        cv2.line(frame, (int(width * 0.2), height), (int(width * 0.4), int(height * 0.7)), (45, 55, 72), 1)
        cv2.line(frame, (int(width * 0.8), height), (int(width * 0.6), int(height * 0.7)), (45, 55, 72), 1)

        # Simulate movement:
        # Subject moving right
        progress = f_idx / total_frames
        sub_x = int(50 + progress * (width - 150))
        sub_y = int(height * 0.55)
        # Person bounding indicator
        cv2.rectangle(frame, (sub_x, sub_y), (sub_x + 35, sub_y + 80), (60, 180, 75), 1)
        cv2.circle(frame, (sub_x + 17, sub_y + 15), 10, (180, 200, 220), -1)

        # Vehicle moving left in second half
        if progress > 0.3:
            veh_progress = (progress - 0.3) / 0.7
            veh_x = int(width - 120 - veh_progress * (width * 0.6))
            veh_y = int(height * 0.60)
            cv2.rectangle(frame, (veh_x, veh_y), (veh_x + 110, veh_y + 55), (200, 130, 40), 1)
            # Headlights
            cv2.circle(frame, (veh_x + 5, veh_y + 35), 4, (100, 255, 255), -1)

        # Burned-in CCTV OSD Header (Forensic Metadata)
        # Top-left: Camera Name and Channel
        cv2.putText(frame, f"[REC] {camera_name} (CH-{channel_num:02d})", (15, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 128), 1, cv2.LINE_AA)
        # Top-right: Timestamp clock
        cv2.putText(frame, time_display, (width - 240, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.50, (240, 240, 240), 1, cv2.LINE_AA)
        # Bottom-left: Forensic Watermark
        cv2.putText(frame, "FORENSIC DEMO BITSTREAM - READ ONLY", (15, height - 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (120, 120, 120), 1, cv2.LINE_AA)
        # Bottom-right: FPS & Resolution
        cv2.putText(frame, f"{fps} FPS | {width}x{height}", (width - 130, height - 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (160, 160, 160), 1, cv2.LINE_AA)

        out.write(frame)

    out.release()
    return output_path


def load_demo_investigation(db: Session) -> dict:
    """
    Populates full realistic demo investigation dataset into SQLite.
    Includes cases, devices, cameras, synthetic CCTV files, cryptographic hashes,
    carved recovery fragments, AI detections, and tamper-evident blockchain custody ledger.
    """
    # 1. Default Forensic Examiner User
    examiner = db.query(User).filter(User.username == "rverma").first()
    if not examiner:
        examiner = User(
            username="rverma",
            full_name="Inspector R. Verma",
            role="forensic_expert",
            organization="Digital Forensics & Cyber Crime Unit",
            badge_number="DFU-IND-7492"
        )
        db.add(examiner)
        db.commit()

    # 2. Case 1: Industrial Warehouse Incident (Primary Demonstration Case)
    case1 = db.query(Case).filter(Case.case_id == "CASE-2026-001").first()
    if not case1:
        case1 = Case(
            case_id="CASE-2026-001",
            name="Industrial Warehouse Security Incident — Bhopal",
            description="Unauthorized nocturnal perimeter breach, warehouse loading dock infiltration, and DVR tampering attempt.",
            investigator_name="Inspector R. Verma",
            organization="State Cyber Police Cell & Forensic Science Lab",
            location="Industrial Area Sector 3, Govindpura, Bhopal",
            status="Active",
            priority="Critical",
            incident_date="2026-08-22 22:15:00"
        )
        db.add(case1)
        db.commit()
        db.refresh(case1)

    # Case 2: Perimeter Breach & Vehicle Theft
    case2 = db.query(Case).filter(Case.case_id == "CASE-2026-002").first()
    if not case2:
        case2 = Case(
            case_id="CASE-2026-002",
            name="Perimeter Breach & Commercial Fleet Theft — Indore",
            description="Theft of commercial transport vehicles from distribution depot.",
            investigator_name="Sub-Inspector A. Sharma",
            organization="Special Investigation Team",
            location="Transport Hub, Dewas Naka, Indore",
            status="Active",
            priority="High",
            incident_date="2026-08-20 03:30:00"
        )
        db.add(case2)
        db.commit()

    # Case 3: ATM Cash Logistics Discrepancy
    case3 = db.query(Case).filter(Case.case_id == "CASE-2026-003").first()
    if not case3:
        case3 = Case(
            case_id="CASE-2026-003",
            name="Retail ATM Cash Logistics Discrepancy — Jabalpur",
            description="Forensic examination of DVR vault camera footage during replenishment audit.",
            investigator_name="Inspector R. Verma",
            organization="Economic Offences Unit",
            location="Civic Centre Branch, Jabalpur",
            status="Closed",
            priority="Medium",
            incident_date="2026-08-15 14:10:00"
        )
        db.add(case3)
        db.commit()

    # 3. DVR/NVR Devices for Case 1
    devices_data = [
        {
            "device_name": "Hikvision AccuSense NVR",
            "vendor": "Hikvision",
            "model_name": "DS-7608NXI-I2 / S AccuSense NVR",
            "device_type": "Network Video Recorder (NVR)",
            "firmware_version": "v4.61.025 build 230915",
            "file_system": "HIK-FS Proprietary Cluster",
            "channels_count": 4,
            "serial_number": "DS7608NXI-20240915AAWR8912",
            "ip_address": "192.168.1.64",
            "mac_address": "C8:02:8F:A1:34:BC"
        },
        {
            "device_name": "Dahua WizMind NVR",
            "vendor": "Dahua",
            "model_name": "DHI-NVR5216-16P-I WizMind",
            "device_type": "Network Video Recorder (NVR)",
            "firmware_version": "v4.002.0000000.1.R",
            "file_system": "DHFS 4.0",
            "channels_count": 4,
            "serial_number": "DH-NVR5216-99381A22",
            "ip_address": "192.168.1.80",
            "mac_address": "3C:EF:8C:55:12:90"
        },
        {
            "device_name": "CP Plus Orange Series DVR",
            "vendor": "CP Plus",
            "model_name": "CP-UVR-0801E1-CS Orange Series",
            "device_type": "Digital Video Recorder (DVR)",
            "firmware_version": "v3.218.0000.0",
            "file_system": "CPFS FAT32 Hybrid",
            "channels_count": 4,
            "serial_number": "CP-UVR-88219003",
            "ip_address": "192.168.1.92",
            "mac_address": "70:B3:D5:19:88:E2"
        },
        {
            "device_name": "Matrix SATATYA Enterprise NVR",
            "vendor": "Matrix",
            "model_name": "SATATYA NVR4808X Enterprise",
            "device_type": "IP NVR",
            "firmware_version": "v2.8.1-P3",
            "file_system": "Matrix SafeFS",
            "channels_count": 8,
            "serial_number": "MX-SAT-4808-1102",
            "ip_address": "192.168.1.110",
            "mac_address": "00:1A:E8:4D:99:31"
        }
    ]

    device_objs = {}
    for d_data in devices_data:
        dev = db.query(Device).filter(Device.case_id == case1.id, Device.device_name == d_data["device_name"]).first()
        if not dev:
            dev = Device(case_id=case1.id, **d_data)
            db.add(dev)
            db.commit()
            db.refresh(dev)
        device_objs[dev.vendor] = dev

    # 4. Cameras (8 Cameras across Warehouse & Grounds)
    cameras_data = [
        {"vendor": "Hikvision", "channel_number": 1, "camera_name": "CAM-01 Main Gate Entrance", "location": "North Perimeter Gate", "clock_offset_seconds": 330},
        {"vendor": "Hikvision", "channel_number": 2, "camera_name": "CAM-02 Loading Bay 4 North", "location": "Warehouse Bay 4", "clock_offset_seconds": 330},
        {"vendor": "Dahua", "channel_number": 3, "camera_name": "CAM-03 Perimeter Fence West", "location": "West Perimeter Fence", "clock_offset_seconds": 0},
        {"vendor": "CP Plus", "channel_number": 4, "camera_name": "CAM-04 Cash Vault & Dispatch Room", "location": "Central Administration Block", "clock_offset_seconds": -180},
        {"vendor": "Hikvision", "channel_number": 5, "camera_name": "CAM-05 Rear Parking & Alleyway", "location": "South Yard Parking", "clock_offset_seconds": 330},
        {"vendor": "Dahua", "channel_number": 6, "camera_name": "CAM-06 Inbound Logistics Dock", "location": "Dock Gate 2", "clock_offset_seconds": 0},
        {"vendor": "Matrix", "channel_number": 7, "camera_name": "CAM-07 Datacenter / Server Room", "location": "NVR Rack Enclosure", "clock_offset_seconds": 0},
        {"vendor": "CP Plus", "channel_number": 8, "camera_name": "CAM-08 Emergency Exit Stairwell", "location": "Fire Escape Level 1", "clock_offset_seconds": 60}
    ]

    camera_objs = []
    for c_data in cameras_data:
        dev = device_objs.get(c_data["vendor"], device_objs["Hikvision"])
        cam = db.query(Camera).filter(Camera.device_id == dev.id, Camera.camera_name == c_data["camera_name"]).first()
        if not cam:
            cam = Camera(
                device_id=dev.id,
                channel_number=c_data["channel_number"],
                camera_name=c_data["camera_name"],
                location=c_data["location"],
                clock_offset_seconds=c_data["clock_offset_seconds"],
                resolution="1920x1080",
                fps=25.0,
                status="Online"
            )
            db.add(cam)
            db.commit()
            db.refresh(cam)
        camera_objs.append(cam)

    # 5. Generate Real Synthetic CCTV Video Files & Register Forensic Evidence
    evidence_meta = [
        {
            "evidence_id": "EVD-000124",
            "filename": "camera_01_main_gate_2026-08-22.mp4",
            "camera_idx": 0,
            "vendor": "Hikvision",
            "base_time": "2026-08-22 22:10:00",
            "norm_time": "2026-08-22 22:15:30",
            "duration": 15.0
        },
        {
            "evidence_id": "EVD-000125",
            "filename": "camera_02_loading_bay_2026-08-22.mp4",
            "camera_idx": 1,
            "vendor": "Hikvision",
            "base_time": "2026-08-22 22:10:15",
            "norm_time": "2026-08-22 22:15:45",
            "duration": 15.0
        },
        {
            "evidence_id": "EVD-000126",
            "filename": "camera_03_perimeter_west_2026-08-22.mp4",
            "camera_idx": 2,
            "vendor": "Dahua",
            "base_time": "2026-08-22 22:15:30",
            "norm_time": "2026-08-22 22:15:30",
            "duration": 15.0
        },
        {
            "evidence_id": "EVD-000127",
            "filename": "camera_04_cash_vault_2026-08-22.mp4",
            "camera_idx": 3,
            "vendor": "CP Plus",
            "base_time": "2026-08-22 22:18:30",
            "norm_time": "2026-08-22 22:15:30",
            "duration": 15.0
        }
    ]

    evidence_objs = []
    for item in evidence_meta:
        orig_file_path = settings.ORIGINAL_EVIDENCE_DIR / item["filename"]
        copy_file_path = settings.FORENSIC_COPIES_DIR / f"FORENSIC_COPY_{item['filename']}"

        # Render video if doesn't exist
        if not orig_file_path.exists():
            cam = camera_objs[item["camera_idx"]]
            generate_synthetic_cctv_video(
                output_path=orig_file_path,
                camera_name=cam.camera_name,
                channel_num=cam.channel_number,
                base_time_str=item["base_time"],
                duration_sec=int(item["duration"]),
                fps=10
            )

        # Write-block original file
        set_read_only(orig_file_path)

        # Make bit-stream working copy
        if not copy_file_path.exists():
            shutil.copyfile(orig_file_path, copy_file_path)

        # Compute real SHA-256 and MD5 from disk
        sha256_hash, md5_hash, file_sz = compute_hashes(orig_file_path)

        evd = db.query(Evidence).filter(Evidence.evidence_id == item["evidence_id"]).first()
        cam = camera_objs[item["camera_idx"]]
        dev = cam.device
        if not evd:
            evd = Evidence(
                evidence_id=item["evidence_id"],
                case_id=case1.id,
                device_id=dev.id,
                camera_id=cam.id,
                filename=item["filename"],
                original_path=str(orig_file_path),
                forensic_copy_path=str(copy_file_path),
                file_size=file_sz,
                mime_type="video/mp4",
                hash_sha256=sha256_hash,
                hash_md5=md5_hash,
                acquisition_timestamp=datetime.utcnow() - timedelta(hours=3),
                acquisition_method="Bit-Stream Forensic Image (Direct SATA/NVR Ingestion)",
                original_timestamp=item["base_time"],
                normalized_timestamp=item["norm_time"],
                duration_seconds=item["duration"],
                resolution="1920x1080",
                fps=25.0,
                codec="H.264 / AVC",
                vendor=item["vendor"],
                status="Verified",
                is_read_only=True
            )
            db.add(evd)
            db.commit()
            db.refresh(evd)

            # Store baseline hash verification record
            hash_rec = HashRecord(
                evidence_id=evd.id,
                calculated_sha256=sha256_hash,
                calculated_md5=md5_hash,
                baseline_sha256=sha256_hash,
                baseline_md5=md5_hash,
                match_status="MATCH",
                verification_timestamp=datetime.utcnow() - timedelta(hours=2, minutes=50),
                verified_by="Lead Analyst R. Verma",
                notes="Initial bit-stream ingestion integrity verification verified bit-for-bit."
            )
            db.add(hash_rec)
            db.commit()

        evidence_objs.append(evd)

    # 6. AI Computer Vision Detections for Evidence 1 & 3
    evd1 = evidence_objs[0]
    evd3 = evidence_objs[2]

    # Check if detections already exist
    existing_dets = db.query(Detection).filter(Detection.evidence_id == evd1.id).count()
    if existing_dets == 0:
        sample_detections = [
            Detection(
                detection_id="DET-000124",
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                timestamp_sec=4.2,
                timestamp_str="22:14:12",
                detection_type="Person",
                label="Adult Subject (Dark Hoodie / Infiltrator)",
                confidence=0.94,
                bbox_x=0.32,
                bbox_y=0.28,
                bbox_w=0.14,
                bbox_h=0.42,
                metadata_json='{"direction": "Inbound Gate 1", "stride_frequency": "1.8Hz"}'
            ),
            Detection(
                detection_id="DET-000125",
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                timestamp_sec=8.5,
                timestamp_str="22:14:16",
                detection_type="Vehicle",
                label="Commercial White Delivery Van (Getaway Vehicle)",
                confidence=0.92,
                bbox_x=0.55,
                bbox_y=0.35,
                bbox_w=0.28,
                bbox_h=0.38,
                metadata_json='{"vehicle_class": "Light Commercial", "headlights": "Low-Beam"}'
            ),
            Detection(
                detection_id="DET-000126",
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                timestamp_sec=11.2,
                timestamp_str="22:14:19",
                detection_type="Face",
                label="Subject Facial Contour (Analytical Finding)",
                confidence=0.86,
                bbox_x=0.34,
                bbox_y=0.30,
                bbox_w=0.06,
                bbox_h=0.08,
                metadata_json='{"forensic_note": "Analytical feature only; requires judicial corroboration."}'
            ),
            Detection(
                detection_id="DET-000127",
                evidence_id=evd3.id,
                camera_id=camera_objs[2].id,
                timestamp_sec=6.0,
                timestamp_str="22:15:36",
                detection_type="Motion",
                label="Perimeter Fence Wire Cut / Intrusion",
                confidence=0.97,
                bbox_x=0.15,
                bbox_y=0.20,
                bbox_w=0.45,
                bbox_h=0.55,
                metadata_json='{"motion_energy": "89%", "roi": "West Perimeter Zone B"}'
            ),
            Detection(
                detection_id="DET-000128",
                evidence_id=evd3.id,
                camera_id=camera_objs[2].id,
                timestamp_sec=10.0,
                timestamp_str="22:15:40",
                detection_type="Person",
                label="Accomplice Lookout (Perimeter Fence)",
                confidence=0.89,
                bbox_x=0.22,
                bbox_y=0.32,
                bbox_w=0.12,
                bbox_h=0.36,
                metadata_json='{"posture": "Crouched Lookout", "equipment": "Wire Tool"}'
            )
        ]
        db.add_all(sample_detections)
        db.commit()

    # 7. Deleted / Damaged Video Recovery Records
    existing_recs = db.query(RecoveryRecord).filter(RecoveryRecord.evidence_id == evd1.id).count()
    if existing_recs == 0:
        sample_recs = [
            RecoveryRecord(
                fragment_id="REC-000091",
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                cluster_offset="0x00A4F000",
                hex_signature="00 00 00 01 67 42 C0",
                estimated_duration_sec=48.0,
                recovery_status="Recovered",
                confidence=0.94,
                details="Unallocated HIK-FS cluster carved successfully using NALU boundary parsing."
            ),
            RecoveryRecord(
                fragment_id="REC-000092",
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                cluster_offset="0x00B8D200",
                hex_signature="00 00 00 01 68 CE 3C",
                estimated_duration_sec=22.5,
                recovery_status="Partially Recoverable",
                confidence=0.76,
                details="Damaged macroblock headers; partial I-frame recovery possible."
            ),
            RecoveryRecord(
                fragment_id="REC-000093",
                evidence_id=evd3.id,
                camera_id=camera_objs[2].id,
                cluster_offset="0x011C4000",
                hex_signature="44 48 41 56 fd 00 00",
                estimated_duration_sec=65.0,
                recovery_status="Recovered",
                confidence=0.92,
                details="DHAV video packet carved from circular index buffer overwrite space."
            ),
            RecoveryRecord(
                fragment_id="REC-000094",
                evidence_id=evd1.id,
                camera_id=camera_objs[1].id,
                cluster_offset="0x028A1000",
                hex_signature="ff ff ff ff 00 12 a4",
                estimated_duration_sec=14.0,
                recovery_status="Corrupted",
                confidence=0.38,
                details="Overwritten data blocks with invalid parity; cannot decode GOP structure."
            )
        ]
        db.add_all(sample_recs)
        db.commit()

    # 8. Normalized Timeline Events
    existing_events = db.query(TimelineEvent).filter(TimelineEvent.case_id == case1.id).count()
    if existing_events == 0:
        events = [
            TimelineEvent(
                case_id=case1.id,
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                event_type="recording_start",
                original_timestamp="22:10:00 (Drift: +5m30s)",
                normalized_timestamp="22:15:30",
                start_sec=0.0,
                end_sec=15.0,
                description="CAM-01 recording session initiated (Main Gate)",
                severity="INFO",
                confidence=1.0
            ),
            TimelineEvent(
                case_id=case1.id,
                evidence_id=evd3.id,
                camera_id=camera_objs[2].id,
                event_type="motion",
                original_timestamp="22:15:36 (Drift: 0s)",
                normalized_timestamp="22:15:36",
                start_sec=6.0,
                end_sec=9.0,
                description="CAM-03 Optical flow alarm: Perimeter fence wire breach",
                severity="CRITICAL",
                confidence=0.97
            ),
            TimelineEvent(
                case_id=case1.id,
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                event_type="person",
                original_timestamp="22:10:12 (Drift: +5m30s)",
                normalized_timestamp="22:15:42",
                start_sec=4.2,
                end_sec=7.5,
                description="CAM-01 Person detected moving rapidly past gate entry",
                severity="WARNING",
                confidence=0.94
            ),
            TimelineEvent(
                case_id=case1.id,
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                event_type="vehicle",
                original_timestamp="22:10:16 (Drift: +5m30s)",
                normalized_timestamp="22:15:46",
                start_sec=8.5,
                end_sec=14.0,
                description="CAM-01 Unregistered commercial van observed idling",
                severity="CRITICAL",
                confidence=0.92
            ),
            TimelineEvent(
                case_id=case1.id,
                evidence_id=evd1.id,
                camera_id=camera_objs[0].id,
                event_type="recovered",
                original_timestamp="22:10:20 (Drift: +5m30s)",
                normalized_timestamp="22:15:50",
                start_sec=10.0,
                end_sec=15.0,
                description="Recovered deleted DVR fragment REC-000091: Suspect entering warehouse bay",
                severity="CRITICAL",
                confidence=0.94
            )
        ]
        db.add_all(events)
        db.commit()

    # 9. Immutable Blockchain-Style Chain of Custody Ledger (Blocks 0 to 7)
    existing_blocks = db.query(ChainOfCustody).filter(ChainOfCustody.case_id == case1.id).count()
    if existing_blocks == 0:
        base_t = datetime.utcnow() - timedelta(hours=4)
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="GENESIS_BLOCK: Investigation Case Initialized",
            actor_name="System Forensic Engine",
            actor_role="Root Authority",
            evidence_id=None,
            evidence_hash=None,
            description="Genesis block established for CASE-2026-001 under ISO/IEC 27037 protocol.",
            custom_timestamp=base_t
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="Evidence Physical Ingestion & Write-Blocking",
            actor_name="Inspector R. Verma",
            actor_role="Lead Forensic Examiner",
            evidence_id=evd1.id,
            evidence_hash=evd1.hash_sha256,
            description="Original SATA drive mounted via write-blocking bridge. Hardware write protection verified.",
            custom_timestamp=base_t + timedelta(minutes=15)
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="Bit-Stream Forensic Copy Created",
            actor_name="Inspector R. Verma",
            actor_role="Lead Forensic Examiner",
            evidence_id=evd1.id,
            evidence_hash=evd1.hash_sha256,
            description="Forensic working image acquired. Original evidence sealed in secure storage.",
            custom_timestamp=base_t + timedelta(minutes=30)
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="Cryptographic Hash Baseline Verification",
            actor_name="Forensic Integrity Service",
            actor_role="Automated Cryptographic Agent",
            evidence_id=evd1.id,
            evidence_hash=evd1.hash_sha256,
            description=f"Dual SHA-256 and MD5 computed from raw blocks. Baseline registered: {evd1.hash_sha256[:16]}...",
            custom_timestamp=base_t + timedelta(minutes=35)
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="Multi-Vendor DVR Parsing (Hikvision HIK-FS)",
            actor_name="HikvisionAdapter v1.2",
            actor_role="Modular Forensic Parser",
            evidence_id=evd1.id,
            evidence_hash=evd1.hash_sha256,
            description="Identified Hikvision DS-7608NXI-I2 container. Extracted 4 channels and OSD drift offset (+330s).",
            custom_timestamp=base_t + timedelta(minutes=50)
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="Unallocated Cluster Carving & Footage Recovery",
            actor_name="CarverEngine v2.0",
            actor_role="Forensic Recovery Agent",
            evidence_id=evd1.id,
            evidence_hash=evd1.hash_sha256,
            description="Executed NALU pattern carving. Identified 2 deleted fragments, successfully recovered REC-000091.",
            custom_timestamp=base_t + timedelta(hours=1, minutes=10)
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="AI Video Analytics & Object Tracking Executed",
            actor_name="ForensicAIEngine",
            actor_role="Computer Vision Agent",
            evidence_id=evd1.id,
            evidence_hash=evd1.hash_sha256,
            description="Detected 5 key events (Person, Vehicle, Face, Motion). All tagged as analytical findings.",
            custom_timestamp=base_t + timedelta(hours=1, minutes=30)
        )
        append_ledger_event(
            db=db,
            case_id=case1.id,
            action="Forensic Investigation Audit Ledger Verified",
            actor_name="Inspector R. Verma",
            actor_role="Lead Forensic Examiner",
            evidence_id=None,
            evidence_hash=None,
            description="Cryptographic chain of custody verified from Genesis block. Tamper audit passed bit-for-bit.",
            custom_timestamp=base_t + timedelta(hours=2)
        )

    return {
        "status": "SUCCESS",
        "case_id": case1.case_id,
        "cases_count": 3,
        "devices_count": 4,
        "cameras_count": 8,
        "evidence_count": len(evidence_objs),
        "detections_count": db.query(Detection).count(),
        "recovery_records_count": db.query(RecoveryRecord).count(),
        "custody_blocks_count": db.query(ChainOfCustody).filter(ChainOfCustody.case_id == case1.id).count(),
        "message": "Demo investigation environment loaded successfully with synthetic CCTV footage and real SHA-256 hashes."
    }
