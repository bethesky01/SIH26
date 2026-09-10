import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
STORAGE_DIR = BASE_DIR / "storage"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Unified DVR/NVR Forensic Analysis & Intelligence Platform"
    PROJECT_VERSION: str = "1.0.0-MVP"
    API_V1_PREFIX: str = "/api"
    SECRET_KEY: str = os.getenv("FORENSIC_SECRET_KEY", "cctv-forensic-sha256-audit-secret-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Storage paths
    STORAGE_PATH: Path = STORAGE_DIR
    ORIGINAL_EVIDENCE_DIR: Path = STORAGE_DIR / "evidence" / "original"
    FORENSIC_COPIES_DIR: Path = STORAGE_DIR / "evidence" / "forensic_copies"
    RECOVERED_DIR: Path = STORAGE_DIR / "recovered"
    REPORTS_DIR: Path = STORAGE_DIR / "reports"
    DEMO_VIDEOS_DIR: Path = BASE_DIR / "demo" / "videos"

    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'forensic_evidence.db'}"

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
for folder in [
    settings.ORIGINAL_EVIDENCE_DIR,
    settings.FORENSIC_COPIES_DIR,
    settings.RECOVERED_DIR,
    settings.REPORTS_DIR,
    settings.DEMO_VIDEOS_DIR,
]:
    folder.mkdir(parents=True, exist_ok=True)
