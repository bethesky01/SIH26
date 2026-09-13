import hashlib
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.forensic_models import ChainOfCustody

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

def calculate_block_hash(
    block_number: int,
    previous_hash: str,
    timestamp_str: str,
    actor_name: str,
    actor_role: str,
    action: str,
    case_id: str,
    evidence_id: Optional[str],
    evidence_hash: Optional[str],
    description: Optional[str]
) -> str:
    """
    Computes SHA-256 for a block payload ensuring strict deterministic canonical serialization.
    """
    payload = {
        "block_number": block_number,
        "previous_hash": previous_hash,
        "timestamp": timestamp_str,
        "actor_name": actor_name,
        "actor_role": actor_role,
        "action": action,
        "case_id": case_id,
        "evidence_id": evidence_id or "",
        "evidence_hash": evidence_hash or "",
        "description": description or ""
    }
    canonical_json = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    raw = f"{previous_hash}::{canonical_json}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def _normalize_dt(dt: datetime) -> str:
    if dt.tzinfo is not None:
        dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt.isoformat()

def append_ledger_event(
    db: Session,
    case_id: str,
    action: str,
    actor_name: str = "Investigator R. Verma",
    actor_role: str = "Digital Forensics Examiner",
    evidence_id: Optional[str] = None,
    evidence_hash: Optional[str] = None,
    description: Optional[str] = None,
    custom_timestamp: Optional[datetime] = None
) -> ChainOfCustody:
    """
    Appends a new immutable audit block to the tamper-evident chain of custody ledger.
    Links cryptographically to the preceding block.
    """
    # Fetch latest block for this case
    last_block = db.query(ChainOfCustody).filter(
        ChainOfCustody.case_id == case_id
    ).order_by(ChainOfCustody.block_number.desc()).first()

    if last_block is None:
        block_number = 0
        previous_hash = GENESIS_PREV_HASH
    else:
        block_number = last_block.block_number + 1
        previous_hash = last_block.current_hash

    raw_ts = custom_timestamp or datetime.now(timezone.utc)
    # Store naive UTC for consistent SQLite and PostgreSQL roundtrips
    if raw_ts.tzinfo is not None:
        ts = raw_ts.astimezone(timezone.utc).replace(tzinfo=None)
    else:
        ts = raw_ts
    ts_str = _normalize_dt(ts)
    event_id = f"AUDIT-{case_id[:8]}-BLK-{block_number:05d}"

    current_hash = calculate_block_hash(
        block_number=block_number,
        previous_hash=previous_hash,
        timestamp_str=ts_str,
        actor_name=actor_name,
        actor_role=actor_role,
        action=action,
        case_id=case_id,
        evidence_id=evidence_id,
        evidence_hash=evidence_hash,
        description=description
    )

    ledger_entry = ChainOfCustody(
        event_id=event_id,
        case_id=case_id,
        evidence_id=evidence_id,
        block_number=block_number,
        actor_name=actor_name,
        actor_role=actor_role,
        action=action,
        timestamp=ts,
        previous_hash=previous_hash,
        current_hash=current_hash,
        evidence_hash=evidence_hash,
        description=description
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(ledger_entry)
    return ledger_entry

def verify_case_chain(db: Session, case_id: str) -> Dict[str, Any]:
    """
    Verifies the entire cryptographic ledger chain for a case.
    Re-calculates every block hash and verifies linkage to previous blocks.
    Pinpoints tampering immediately.
    """
    blocks = db.query(ChainOfCustody).filter(
        ChainOfCustody.case_id == case_id
    ).order_by(ChainOfCustody.block_number.asc()).all()

    if not blocks:
        return {
            "is_valid": True,
            "status": "EMPTY_LEDGER",
            "total_blocks": 0,
            "genesis_hash": GENESIS_PREV_HASH,
            "latest_hash": GENESIS_PREV_HASH,
            "invalid_block_index": None,
            "message": "Ledger is currently empty. No audit records to verify."
        }

    expected_prev_hash = GENESIS_PREV_HASH

    for idx, block in enumerate(blocks):
        # 1. Verify previous hash link
        if block.previous_hash != expected_prev_hash:
            return {
                "is_valid": False,
                "status": "CHAIN INTEGRITY FAILED",
                "total_blocks": len(blocks),
                "genesis_hash": blocks[0].current_hash,
                "latest_hash": blocks[-1].current_hash,
                "invalid_block_index": block.block_number,
                "message": f"CHAIN INTEGRITY FAILED at Block #{block.block_number}: Previous hash mismatch! Tampering detected."
            }

        # 2. Recalculate block hash
        expected_hash = calculate_block_hash(
            block_number=block.block_number,
            previous_hash=block.previous_hash,
            timestamp_str=_normalize_dt(block.timestamp),
            actor_name=block.actor_name,
            actor_role=block.actor_role,
            action=block.action,
            case_id=block.case_id,
            evidence_id=block.evidence_id,
            evidence_hash=block.evidence_hash,
            description=block.description
        )

        if block.current_hash != expected_hash:
            return {
                "is_valid": False,
                "status": "CHAIN INTEGRITY FAILED",
                "total_blocks": len(blocks),
                "genesis_hash": blocks[0].current_hash,
                "latest_hash": blocks[-1].current_hash,
                "invalid_block_index": block.block_number,
                "message": f"CHAIN INTEGRITY FAILED at Block #{block.block_number}: Block payload signature mismatch! Data was modified."
            }

        expected_prev_hash = block.current_hash

    return {
        "is_valid": True,
        "status": "CHAIN VERIFIED",
        "total_blocks": len(blocks),
        "genesis_hash": blocks[0].current_hash,
        "latest_hash": blocks[-1].current_hash,
        "invalid_block_index": None,
        "message": f"CHAIN VERIFIED: All {len(blocks)} blocks intact with valid cryptographic chaining."
    }
