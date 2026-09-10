import hashlib
import os
from pathlib import Path
from typing import Tuple, Dict, Any

CHUNK_SIZE = 65536  # 64 KB chunks for memory-efficient streaming hashing

def compute_hashes(file_path: str | Path) -> Tuple[str, str, int]:
    """
    Computes both SHA-256 and MD5 cryptographic hashes and file size
    by reading the file in 64KB blocks.
    Returns: (sha256_hex, md5_hex, file_size_bytes)
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Evidence file not found: {file_path}")

    sha256_hash = hashlib.sha256()
    md5_hash = hashlib.md5()
    file_size = 0

    with open(path, "rb") as f:
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            sha256_hash.update(chunk)
            md5_hash.update(chunk)
            file_size += len(chunk)

    return sha256_hash.hexdigest(), md5_hash.hexdigest(), file_size

def verify_file_integrity(file_path: str | Path, baseline_sha256: str, baseline_md5: str) -> Dict[str, Any]:
    """
    Recalculates SHA-256 and MD5 from disk and compares against the recorded baseline.
    Returns validation dictionary with forensic verdict.
    """
    current_sha256, current_md5, current_size = compute_hashes(file_path)
    sha_match = (current_sha256.lower() == baseline_sha256.lower())
    md5_match = (current_md5.lower() == baseline_md5.lower())
    is_valid = sha_match and md5_match

    return {
        "is_verified": is_valid,
        "baseline_sha256": baseline_sha256,
        "baseline_md5": baseline_md5,
        "calculated_sha256": current_sha256,
        "calculated_md5": current_md5,
        "sha256_match": sha_match,
        "md5_match": md5_match,
        "file_size": current_size,
        "status": "VERIFIED_AUTHENTIC" if is_valid else "INTEGRITY_COMPROMISED",
        "message": "Cryptographic integrity verified. File matches forensic baseline bit-for-bit."
                   if is_valid else "ALERT: Cryptographic mismatch detected! Evidence has been altered or corrupted."
    }

def set_read_only(file_path: str | Path) -> None:
    """Sets file permission to read-only on disk to prevent accidental modifications."""
    path = Path(file_path)
    if path.exists():
        # Set read-only permissions
        os.chmod(path, 0o444)
