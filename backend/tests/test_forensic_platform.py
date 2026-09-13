import os
import tempfile
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database.session import Base
from backend.app.models.forensic_models import User, Case, ChainOfCustody
from backend.app.hashing.integrity import compute_hashes, verify_file_integrity
from backend.app.custody.ledger import append_ledger_event, verify_case_chain
from backend.app.parsers.vendor_adapters import VendorParserRegistry, HikvisionAdapter, DahuaAdapter
from backend.app.recovery.carver import ForensicCarver
from backend.app.ai.cv_engine import ForensicAIEngine
from backend.app.reports.pdf_generator import ForensicReportGenerator

@pytest.fixture
def db_session():
    test_db = "sqlite:///:memory:"
    engine = create_engine(test_db, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_hashing_and_verification():
    with tempfile.NamedTemporaryFile(delete=False) as f:
        f.write(b"SAMPLE_FORENSIC_CCTV_STREAM_DATA_BLOCK_001")
        f_path = f.name

    try:
        sha256, md5, sz = compute_hashes(f_path)
        assert len(sha256) == 64
        assert len(md5) == 32
        assert sz == len(b"SAMPLE_FORENSIC_CCTV_STREAM_DATA_BLOCK_001")

        # Verify authentic
        res = verify_file_integrity(f_path, sha256, md5)
        assert res["is_verified"] is True
        assert res["status"] == "VERIFIED_AUTHENTIC"

        # Tamper with file
        with open(f_path, "ab") as f:
            f.write(b"_TAMPERED_MODIFIED_BYTE")

        tamper_res = verify_file_integrity(f_path, sha256, md5)
        assert tamper_res["is_verified"] is False
        assert tamper_res["status"] == "INTEGRITY_COMPROMISED"
    finally:
        if os.path.exists(f_path):
            os.remove(f_path)

def test_blockchain_ledger_chaining_and_tampering(db_session):
    test_case = Case(
        case_id="TEST-CASE-001",
        name="Test Incident",
        investigator_name="Investigator Sharma",
        organization="Cyber Forensics Unit",
        location="Lab 1"
    )
    db_session.add(test_case)
    db_session.commit()

    # Append 3 blocks
    b0 = append_ledger_event(db_session, test_case.id, "GENESIS: Case Initialized")
    b1 = append_ledger_event(db_session, test_case.id, "Evidence Ingestion", evidence_hash="abc123")
    b2 = append_ledger_event(db_session, test_case.id, "Hash Recalculated")

    assert b0.block_number == 0
    assert b1.block_number == 1
    assert b2.block_number == 2
    assert b1.previous_hash == b0.current_hash
    assert b2.previous_hash == b1.current_hash

    # Verify chain
    chain_status = verify_case_chain(db_session, test_case.id)
    assert chain_status["is_valid"] is True
    assert chain_status["status"] == "CHAIN VERIFIED"
    assert chain_status["total_blocks"] == 3

    # Tamper with block 1 payload
    b1.actor_name = "MALICIOUS_ACTOR"
    db_session.commit()

    tampered_status = verify_case_chain(db_session, test_case.id)
    assert tampered_status["is_valid"] is False
    assert tampered_status["status"] == "CHAIN INTEGRITY FAILED"
    assert tampered_status["invalid_block_index"] == 1

def test_vendor_adapter_detection():
    hik = HikvisionAdapter()
    id_hik = hik.identify("sample_camera_01_hikvision.mp4", b"HKEX\x00\x01")
    assert id_hik["matched"] is True
    assert id_hik["vendor"] == "Hikvision"

    dah = DahuaAdapter()
    id_dah = dah.identify("sample_camera_03_dahua.dav", b"DHAV\x00\x00")
    assert id_dah["matched"] is True
    assert id_dah["vendor"] == "Dahua"

def test_recovery_carver_signatures():
    # Test binary with NAL unit start codes
    synthetic_stream = b"\x00\x00\x00\x01\x67\x42\xC0\x1E" + (b"\xFF" * 1024) + b"\x00\x00\x00\x01\x65\x88"
    with tempfile.NamedTemporaryFile(delete=False) as f:
        f.write(synthetic_stream)
        temp_path = f.name

    try:
        frags = ForensicCarver.scan_fragments(temp_path)
        assert len(frags) >= 2
        statuses = [f["recovery_status"] for f in frags]
        assert "Recovered" in statuses
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_ai_query_parser():
    q1 = "Show all vehicles between 22:00 and 23:00"
    p1 = ForensicAIEngine.parse_natural_language_query(q1)
    assert p1["detection_type"] == "Vehicle"
    assert p1["time_start"] == "22:00"
    assert p1["time_end"] == "23:00"

    q2 = "Show high confidence person detections from Camera 2"
    p2 = ForensicAIEngine.parse_natural_language_query(q2)
    assert p2["detection_type"] == "Person"
    assert p2["camera_channel"] == 2
    assert p2["min_confidence"] == 0.85

def test_pdf_report_generation():
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
        pdf_path = f.name

    try:
        report_data = {
            "case_info": {
                "case_id": "TEST-CASE-001",
                "name": "Test Forensic Audit",
                "investigator_name": "Examiner Verma",
                "organization": "Forensic Lab",
                "location": "Bhopal",
                "status": "Active",
                "priority": "High"
            },
            "evidence_items": [
                {
                    "evidence_id": "EVD-001",
                    "filename": "camera_01.mp4",
                    "vendor": "Hikvision",
                    "file_size": 2048000,
                    "hash_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "status": "Verified"
                }
            ],
            "detections": [
                {
                    "detection_id": "DET-001",
                    "timestamp_str": "22:15:00",
                    "detection_type": "Person",
                    "label": "Adult Subject",
                    "confidence": 0.95,
                    "bbox_x": 0.2, "bbox_y": 0.2, "bbox_w": 0.1, "bbox_h": 0.3
                }
            ],
            "recovery_records": [
                {
                    "fragment_id": "FRAG-001",
                    "cluster_offset": "0x00A4",
                    "hex_signature": "00 00 00 01",
                    "estimated_duration_sec": 30.0,
                    "recovery_status": "Recovered",
                    "confidence": 0.92
                }
            ],
            "custody_blocks": [
                {
                    "block_number": 0,
                    "action": "Case Created",
                    "actor_name": "Examiner",
                    "timestamp": "2026-08-22 22:00:00",
                    "current_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"
                }
            ]
        }

        generated_p = ForensicReportGenerator.generate_pdf_report(report_data, pdf_path)
        assert os.path.exists(generated_p)
        assert os.path.getsize(generated_p) > 1000
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

def test_device_identification_module_1():
    from backend.app.parsers.device_identifier import DVRDeviceIdentifier
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)

    # 1. Test direct python engine for Hikvision
    hik_res = DVRDeviceIdentifier.identify(header_bytes=b"HKEX\x00\x01HIKVISION", file_name="warehouse_cctv_01.dav")
    assert hik_res["status"] == "SUCCESS"
    assert hik_res["manufacturer"] == "Hikvision"
    assert "DS-" in hik_res["model"]
    assert "HIK-FS" in hik_res["filesystem"]
    assert hik_res["channels"] == 16
    assert "4 TB" in hik_res["storage_capacity"]
    assert "H.264" in hik_res["video_codec"] or "H.265" in hik_res["video_codec"]

    # 2. Test direct engine for Dahua
    dah_res = DVRDeviceIdentifier.identify(header_bytes=b"DHAV\xfd\x00\x00", file_name="perimeter_gate.dav")
    assert dah_res["manufacturer"] == "Dahua"
    assert "DHFS" in dah_res["filesystem"]
    assert dah_res["channels"] == 16
    assert "4 TB" in dah_res["storage_capacity"]

    # 3. Test direct engine for CP Plus
    cp_res = DVRDeviceIdentifier.identify(sample_id="cpplus")
    assert cp_res["manufacturer"] == "CP Plus"
    assert cp_res["channels"] == 8
    assert "2 TB" in cp_res["storage_capacity"]

    # 4. Test REST API endpoint
    response = client.post("/api/devices/identify", json={"sample_id": "hikvision"})
    assert response.status_code == 200
    data = response.json()
    assert data["manufacturer"] == "Hikvision"
    assert data["channels"] == 16
    assert "4 TB" in data["storage_capacity"]
    assert "magic_signatures" in data["forensic_signals"]

def test_module_7_multi_camera_correlation_and_module_10_audit_trail():
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)

    # 1. Test Module 7: Multi-Camera Event Correlation (Event #1032 across Cameras 1, 2, 5, 7)
    res_corr = client.get("/api/timeline/correlations")
    assert res_corr.status_code == 200
    correlations = res_corr.json()
    assert len(correlations) >= 1

    event1032 = next(c for c in correlations if c["incident_id"] == "EVENT #1032")
    assert event1032["total_cameras"] == 4
    assert len(event1032["steps"]) == 4

    # Verify trajectory sequence matches prompt
    step_cams = [s["camera_name"] for s in event1032["steps"]]
    assert any("Camera 1" in c for c in step_cams)
    assert any("Camera 2" in c for c in step_cams)
    assert any("Camera 5" in c for c in step_cams)
    assert any("Camera 7" in c for c in step_cams)

    # 2. Test Module 10: Simplified Chain of Custody Audit Trail ("Who, When, What")
    res_audit = client.get("/api/custody/audit-trail")
    assert res_audit.status_code == 200
    audit = res_audit.json()
    assert len(audit) == 6

    events = [a["event"] for a in audit]
    assert "Evidence acquired" in events
    assert "Hash generated" in events
    assert "Image created" in events
    assert "Analysis started" in events
    assert "Video recovered" in events
    assert "Report generated" in events

def test_validation_metrics_endpoint():
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)
    res = client.get("/api/validation/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "recovery_rate" in data
    assert "timestamp_accuracy" in data
    assert "ai_validation" in data

    # Verify recovery rate metrics
    rr = data["recovery_rate"]
    assert "recovery_rate_percent" in rr
    assert rr["recovery_rate_percent"] >= 0.0

    # Verify AI validation strictly flags missing ground-truth instead of fake metrics
    ai = data["ai_validation"]
    assert ai["has_ground_truth"] is False
    assert ai["precision_percent"] is None
    assert ai["recall_percent"] is None
    assert "Validation dataset not provided" in ai["status_message"]

def test_live_stream_intake():
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)
    # Get active case
    cases_res = client.get("/api/cases")
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) > 0
    case_id = cases[0]["case_id"]

    stream_payload = {
        "case_id": case_id,
        "stream_url": "rtsp://192.168.1.120:554/live/ch0",
        "stream_name": "Gate North RTSP",
        "camera_name": "Camera 09 - Perimeter Gate",
        "vendor": "Dahua RTSP IP",
        "capture_duration_seconds": 12.0
    }
    res = client.post("/api/evidence/live-stream", json=stream_payload)
    assert res.status_code == 200
    ev = res.json()
    assert ev["evidence_id"].startswith("EVD-")
    assert ev["hash_sha256"] is not None
    assert len(ev["hash_sha256"]) == 64
    assert ev["is_read_only"] is True

def test_unsupported_format_handling():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    import io

    client = TestClient(app)
    cases = client.get("/api/cases").json()
    case_id = cases[0]["case_id"]

    # Upload an unsupported file format e.g. .xyz
    fake_file = io.BytesIO(b"\x99\x88\x77\x66UNSUPPORTED_DATA_STREAM")
    res = client.post(
        "/api/evidence/upload",
        data={"case_id": case_id},
        files={"file": ("proprietary_unknown.xyz", fake_file, "application/octet-stream")}
    )
    assert res.status_code == 200
    ev = res.json()
    assert ev["status"] == "Unsupported"
    assert ev["vendor"] == "Unsupported Vendor"

def test_ai_video_file_analysis_and_corrupted_recovery():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    import io

    client = TestClient(app)

    # 1. Test video file detection
    fake_video = io.BytesIO(b"MOCK_CCTV_VIDEO_STREAM_DATA_WITH_METADATA")
    res = client.post(
        "/api/ai/analyze-video-file",
        files={"file": ("incident_cctv.mp4", fake_video, "video/mp4")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["is_corrupted"] is False
    assert data["detections_count"] >= 4
    categories = {d["detection_type"] for d in data["detections"]}
    assert "Person" in categories
    assert "Vehicle" in categories

    # 2. Test corrupted / raw dump file detection and recovery
    raw_corrupted = io.BytesIO(b"\x00\x00\x00\x01\x67\x42\x00\x1fMOCK_CARVED_H264_STREAM" * 20)
    res_corrupt = client.post(
        "/api/ai/analyze-video-file",
        files={"file": ("corrupted_dump.raw", raw_corrupted, "application/octet-stream")}
    )
    assert res_corrupt.status_code == 200
    corrupt_data = res_corrupt.json()
    assert corrupt_data["status"] == "SUCCESS"
    assert corrupt_data["is_corrupted"] is True
    assert corrupt_data["fragments_found"] >= 1

def test_media_tamper_and_modification_detection():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    import io

    client = TestClient(app)

    # 1. Test image with Photoshop tampering signature
    tampered_photo = io.BytesIO(b"\xff\xd8\xff\xe1\x00\x18Exif\x00\x00Adobe Photoshop CC 2024 (Windows)\xff\xda_PIXEL_DATA")
    res_img = client.post(
        "/api/integrity/analyze-media",
        files={"file": ("crime_scene_edited.jpg", tampered_photo, "image/jpeg")}
    )
    assert res_img.status_code == 200
    img_data = res_img.json()
    assert img_data["status"] == "SUCCESS"
    assert img_data["has_changed"] is True
    assert img_data["tamper_detected"] is True
    assert img_data["changes_count"] >= 1
    assert any("Photoshop" in c["title"] or "Photoshop" in c["details"] for c in img_data["changes_detected"])

    # 2. Test video with transcoder signature
    tampered_video = io.BytesIO(b"\x00\x00\x00\x20ftypisom\x00\x00\x00\x08freeLavf58.76.100\x00\x00\x00\x10mdat_VIDEO_STREAM")
    res_vid = client.post(
        "/api/integrity/analyze-media",
        files={"file": ("cctv_splice.mp4", tampered_video, "video/mp4")}
    )
    assert res_vid.status_code == 200
    vid_data = res_vid.json()
    assert vid_data["status"] == "SUCCESS"
    assert vid_data["has_changed"] is True
    assert any("Lavf" in c["title"] or "Lavf" in c["details"] for c in vid_data["changes_detected"])

    # 3. Test Two-File Comparison (Original vs Suspect)
    orig_file = io.BytesIO(b"AUTHENTIC_CCTV_STREAM_DATA_ORIGINAL_VERSION_001")
    suspect_file = io.BytesIO(b"AUTHENTIC_CCTV_STREAM_DATA_TAMPERED_VERSION_001")
    res_comp = client.post(
        "/api/integrity/analyze-media",
        files={
            "file": ("suspect_clip.mp4", suspect_file, "video/mp4"),
            "baseline_file": ("original_clip.mp4", orig_file, "video/mp4")
        }
    )
    assert res_comp.status_code == 200
    comp_data = res_comp.json()
    assert comp_data["is_comparison"] is True
    assert comp_data["has_changed"] is True
    assert comp_data["first_modified_byte_offset"] != "None"

def test_universal_forensic_diagnose_4_pillars():
    from fastapi.testclient import TestClient
    from backend.app.main import app
    import io

    client = TestClient(app)

    # 1. Test Video with 4 Pillars (Recovery, Detection, Timeline, Tamper)
    fake_video = io.BytesIO(b"\x00\x00\x00\x20ftypisom\x00\x00\x00\x10mdatMOCK_VIDEO_DATA" * 50)
    res_vid = client.post(
        "/api/forensic/universal-diagnose",
        files={"file": ("surveillance_hallway.mp4", fake_video, "video/mp4")}
    )
    assert res_vid.status_code == 200
    diag = res_vid.json()
    assert diag["status"] == "SUCCESS"
    assert "pillars" in diag
    assert "recovery" in diag["pillars"]
    assert "detection" in diag["pillars"]
    assert "timeline" in diag["pillars"]
    assert "tamper" in diag["pillars"]
    assert diag["pillars"]["detection"]["detections_count"] >= 3
    assert diag["pillars"]["timeline"]["events_count"] >= 2

    # 2. Test Photo with 4 Pillars
    fake_photo = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xda_RASTER_PIXELS")
    res_img = client.post(
        "/api/forensic/universal-diagnose",
        files={"file": ("evidence_snapshot.jpg", fake_photo, "image/jpeg")}
    )
    assert res_img.status_code == 200
    img_diag = res_img.json()
    assert img_diag["status"] == "SUCCESS"
    assert img_diag["media_classification"] == "Picture / Photo"
    assert img_diag["pillars"]["detection"]["detections_count"] >= 2

    # 3. Test Corrupted Dump with Carving Recovery (Negative Result: Corrupted / Serious Issues)
    corrupt_dump = io.BytesIO(b"\x00\x00\x00\x01\x67\x42\x00\x1fRAW_CARVED_UNALLOCATED_STREAM" * 30)
    res_corrupt = client.post(
        "/api/forensic/universal-diagnose",
        files={"file": ("corrupted_cctv_block.raw", corrupt_dump, "application/octet-stream")}
    )
    assert res_corrupt.status_code == 200
    corrupt_diag = res_corrupt.json()
    assert corrupt_diag["pillars"]["recovery"]["is_corrupted"] is True
    assert corrupt_diag["pillars"]["recovery"]["fragments_found"] >= 1
    assert corrupt_diag["is_corrupted"] is True
    assert corrupt_diag["has_serious_issues"] is True
    assert corrupt_diag["is_accurate_for_case"] is False
    assert "CORRUPTED" in corrupt_diag["verdict_headline"]

    # 4. Test Heavy Changes & Spliced Tamper (Negative Result: Heavy Changes / Inaccurate for Case)
    spliced_video = io.BytesIO(b"Lavf\x00\x00\x00\x20ftypisom\x00\x00\x00\x10mdatSPLICED_HEAVY_TAMPER_STREAM" * 50)
    res_spliced = client.post(
        "/api/forensic/universal-diagnose",
        files={"file": ("tampered_spliced_cctv_lavf.mp4", spliced_video, "video/mp4")}
    )
    assert res_spliced.status_code == 200
    spliced_diag = res_spliced.json()
    assert spliced_diag["has_changes"] is True
    assert spliced_diag["has_heavy_changes"] is True
    assert spliced_diag["has_serious_issues"] is True
    assert spliced_diag["is_accurate_for_case"] is False
    assert spliced_diag["case_verdict_category"] == "HEAVY_CHANGES_INACCURATE"
    assert spliced_diag["case_accuracy_label"] == "NOT ACCURATE FOR THE CASE"
    assert "SERIOUS ISSUES" in spliced_diag["verdict_headline"]

def test_batch_demo_evidence_ingestion_and_segments_pipeline():
    """Verify batch demo evidence ingest returns all 8 segments with completed statuses."""
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)
    res = client.post(
        "/api/cases/batch-ingest-demo",
        json={"case_id": "CASE-2026-001"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["ingested_count"] == 6
    assert len(data["segments_processed"]) == 8

    seg_ids = [s["segment_id"] for s in data["segments_processed"]]
    assert "adapters" in seg_ids
    assert "evidence" in seg_ids
    assert "player" in seg_ids
    assert "recovery" in seg_ids
    assert "timeline" in seg_ids
    assert "integrity" in seg_ids
    assert "ledger" in seg_ids
    assert "reports" in seg_ids

    for seg in data["segments_processed"]:
        assert seg["status"] == "COMPLETED"
        assert len(seg["details"]) > 10



