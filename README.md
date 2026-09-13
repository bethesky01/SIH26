# Saboot Netra (सबूत नेत्र) — Unified DVR/NVR CCTV Forensic Analysis & Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-00e5ff?style=for-the-badge&logo=vercel&logoColor=white)](https://sih-2026-blush-seven.vercel.app/)

[![Forensic Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2027037-emerald?style=flat-square)](https://www.iso.org/standard/44381.html)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11+-cyan?style=flat-square)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-blue?style=flat-square)](https://vitejs.dev/)
[![Integrity](https://img.shields.io/badge/Integrity-Dual%20SHA--256%20%2B%20MD5-purple?style=flat-square)]()
[![Ledger](https://img.shields.io/badge/Ledger-Immutable%20Blockchain%20Audit-orange?style=flat-square)]()

> 🌐 **Live Interactive Demo**: **[https://sih-2026-blush-seven.vercel.app/](https://sih-2026-blush-seven.vercel.app/)**

A digital forensics and intelligence platform designed for law enforcement, cyber-forensic analysts, and security investigators to ingest, acquire, parse, recover, normalize, analyze (AI/CV), and report CCTV evidence across heterogeneous, proprietary DVR/NVR hardware (**Hikvision**, **Dahua**, **CP Plus**, **Matrix**, and **Generic ISO-BMFF**).

---

## 🏛️ Forensic Principles Enforced (ISO/IEC 27037)

1. **Read-Only Evidence Preservation**: Original evidence files are mounted write-protected with zero-modification guarantees.
2. **Forensic Working Copy Isolation**: All AI computer vision, carving, and scrubbing execute strictly on isolated working copies.
3. **Dual Cryptographic Verification**: SHA-256 and MD5 hashes computed immediately upon ingestion and recalculated live to catch tampering.
4. **Tamper-Evident Blockchain Ledger**: Every analyst action, metadata extraction, and chain-of-custody transfer is sealed in an immutable hash chain (`CurrentHash = SHA256(PrevHash + Payload)`).
5. **Drift & Clock Offset Normalization**: Synchronizes unsynced camera clocks to a single Master Incident Timeline without corrupting raw timestamps.
6. **Judicial PDF Reporting**: ReportLab-powered official forensic reports compliant with Section 65B of the Indian Evidence Act.

---

## 🚀 Quick Start & Running Locally

### 🌐 Option 1: Live Cloud Demo (Instant Access)
Try the platform immediately in your browser with pre-loaded forensic evidence:  
👉 **[https://sih-2026-blush-seven.vercel.app/](https://sih-2026-blush-seven.vercel.app/)**

### Option 2: 1-Click Windows Launcher (Local Full-Stack)
Double-click [`start.bat`](start.bat) in the project root. It will automatically launch both the FastAPI backend and Vite frontend in background terminals.

### Option 3: Manual Terminal Execution

#### 1. Backend (Port 8000)
```bash
# In the workspace root:
pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**
* ReDoc Specification: **http://127.0.0.1:8000/redoc**

#### 2. Frontend Dashboard (Port 5173 or Port 8000)
```bash
cd frontend
npm install
npm run dev
```
* Dashboard URL: **http://127.0.0.1:5173**

*(Note: The production bundle `frontend/dist` is also mounted directly onto `http://127.0.0.1:8000/` for single-port deployment!)*

---

## 🐳 Docker Production Deployment

To run the complete full-stack environment in isolated production containers:

```bash
docker-compose up --build -d
```

* **Frontend**: http://localhost:80 or http://localhost:3000
* **Backend API**: http://localhost:8000
* **Persistent Volumes**: Evidence, databases, and generated reports are persisted in `forensic_storage`.

---

## 🔬 Core Investigation Workflow

1. **Ingest Evidence**: Upload raw CCTV video (`.mp4`, `.dav`, `.avi`) or choose auto-detected proprietary vendor formats.
2. **Video & AI HUD**: Inspect video with frame-by-frame scrubbing, speed multiplier, dual timestamp display (CCTV OSD vs Master Incident Time), and bounding boxes.
3. **Clock Offset Synchronization**: Adjust camera drift offsets (e.g. `+3600s`) to align multi-camera footage.
4. **Audit Cryptographic Integrity**: Recalculate SHA-256 and MD5 hashes live against baseline seals.
5. **Interactive Tamper Testing**: Click **"Simulate Tamper"** to demonstrate immediate detection of unauthorized byte modification.
6. **Verify Blockchain Ledger**: Click **"Verify Ledger Chain Integrity"** to validate cryptographic audit blocks.
7. **Deleted Footage Carving**: Scan raw cluster offsets for fragmented H.264 NALUs and container atoms.
8. **Export Court Report**: Generate sealed PDF forensic examination reports, with JSON and CSV exports.

---

## 🧪 Automated Testing

To run the automated forensic test suite:

```bash
python -m pytest backend/tests/test_forensic_platform.py -v
```
All 6 tests verify hash calculation, tamper detection, blockchain chaining, and report generation.
