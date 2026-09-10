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
