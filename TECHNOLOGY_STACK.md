# Technology Stack & Architecture Reference
## Saboot Netra (सबूत नेत्र) — CCTV Forensic Analysis & Evidence Intelligence Platform
**Compliance**: ISO/IEC 27037 Digital Evidence Standard & Section 65B Indian Evidence Act  
**Document Version**: 2.0.0-PROD  

---

## 📌 Executive Summary

This document provides a comprehensive, technical audit of **what technologies are used**, **how they are implemented**, and **where they reside in the codebase** across the entire full-stack Saboot Netra architecture.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND LAYER                                          │
│  React 19 • Vite 8 • HTML5 Canvas HUD • Web Crypto API • FileReader API • Vanilla CSS Tokens │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │ REST API / WebSocket / Binary Streams
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BACKEND LAYER                                           │
│  FastAPI 0.110 • Python 3.11+ • Uvicorn ASGI • Pydantic V2 • SQLAlchemy 2.0 • SQLite WAL    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 SPECIALIZED ENGINES                                         │
│  • Cryptographic Dual Hashing (SHA-256 + MD5): hashlib                                      │
│  • Low-Level Sector Carver: re, struct, binary heuristics (NALU 00 00 00 01)                │
│  • Proprietary Filesystem Adapters: HIK-FS, DHFS, CPFS, Matrix SafeFS                       │
│  • Judicial PDF Generator: ReportLab 4.1 (Vector Court Copy & Digital Seals)                │
│  • Blockchain Custody Ledger: Merkle/Hash Chaining (PrevHash + Action + Payload)            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Complete Technology Matrix: What, How & Where

| Technology | Category | What It Is | How It Is Implemented | Where It Is Used (Exact Paths) |
| :--- | :--- | :--- | :--- | :--- |
| **Python 3.11+** | Backend Runtime | Core programming language | Powers REST endpoints, binary disk carving, cryptographic math, and hardware parsing. | Entire `backend/` directory |
| **FastAPI** (`0.110+`) | Web Framework | Modern, high-performance async REST API framework | Manages HTTP request lifecycles, route dispatching, auto-generated OpenAPI (Swagger) documentation, and streaming binary responses. | [`backend/app/main.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/main.py)<br>[`backend/app/api/routes.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/api/routes.py) |
| **Uvicorn** (`0.28+`) | ASGI Server | High-throughput asynchronous server | Runs the FastAPI application with multi-worker event loops and non-blocking I/O. | [`start.bat`](file:///c:/Users/prern/SIH%2026%202/start.bat)<br>[`start.sh`](file:///c:/Users/prern/SIH%2026%202/start.sh) |
| **Pydantic V2** (`2.6+`) | Schema & Validation | Strict type enforcement and data validation | Validates incoming case inputs, clock drift offsets, RTSP stream URLs, and serializes JSON responses. | [`backend/app/schemas/forensic_schemas.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/schemas/forensic_schemas.py)<br>[`backend/app/core/config.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/core/config.py) |
| **SQLAlchemy** (`2.0+`) | ORM & Database Engine | Relational Object-Relational Mapping library | Abstracts database queries with foreign-key constraints, cascading deletes, and session injection. | [`backend/app/database/session.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/database/session.py)<br>[`backend/app/models/forensic_models.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/models/forensic_models.py) |
| **SQLite (WAL Mode)** | Persistence | Zero-configuration embedded database | Stores investigation records, camera channels, evidence metadata, and custody blocks with Write-Ahead Logging (WAL) concurrency. | Root: `forensic_evidence.db`<br>Configured in: [`backend/app/database/session.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/database/session.py) |
| **hashlib** | Cryptography | Standard C-accelerated cryptographic library | Calculates 64 KB chunked dual SHA-256 and MD5 hashes, verifies forensic copies, and detects single-bit tampering. | [`backend/app/hashing/integrity.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/hashing/integrity.py)<br>[`backend/app/custody/ledger.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/custody/ledger.py) |
| **ReportLab** (`4.1+`) | Document Generation | Vector PDF layout and typography engine | Compiles tamper-evident, court-admissible Section 65B forensic examination certificates with cryptographic seals. | [`backend/app/reports/pdf_generator.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/reports/pdf_generator.py) |
| **Binary Pattern Carver (`re`, `struct`)** | Forensic Carving | Low-level bitstream pattern scanner | Scans unallocated sectors for H.264/H.265 NALUs (`00 00 00 01`), DHAV packets, and JPEG/PNG keyframes. | [`backend/app/recovery/carver.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/recovery/carver.py) |
| **Pytest** (`8.4+`) | Test Automation | Testing framework | Automated execution of 11 end-to-end platform tests covering hashing, tamper detection, carving, and reporting. | [`backend/tests/test_forensic_platform.py`](file:///c:/Users/prern/SIH%2026%202/backend/tests/test_forensic_platform.py)<br>[`pytest.ini`](file:///c:/Users/prern/SIH%2026%202/pytest.ini) |
| **React 19** (`19.2+`) | Frontend Framework | Declarative component UI library | Renders reactive forensic views, manages investigative case states, playback scrubbing, and interactive modals. | [`frontend/src/App.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/App.jsx)<br>[`frontend/src/views/`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/) |
| **Vite** (`8.3+`) | Build Tool & Bundler | Next-generation frontend bundler | Provides sub-second HMR dev server and compiles the production client bundle (`dist/`) in ~860ms. | [`frontend/vite.config.js`](file:///c:/Users/prern/SIH%2026%202/frontend/vite.config.js)<br>[`frontend/package.json`](file:///c:/Users/prern/SIH%2026%202/frontend/package.json) |
| **HTML5 Canvas 2D API** | Visual Rendering | Hardware-accelerated 2D graphics | Draws surveillance HUD overlays, bounding boxes, OSD clocks, and real-time canvas CCTV playback for carved video sectors. | [`frontend/src/views/VideoPlayerView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/VideoPlayerView.jsx)<br>[`frontend/src/views/RecoveryView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/RecoveryView.jsx) |
| **Web Crypto API** | Client Cryptography | Native browser cryptographic engine | Computes client-side SHA-256 hashes instantly via `crypto.subtle.digest` upon file selection without network lag. | [`frontend/src/views/RecoveryView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/RecoveryView.jsx)<br>[`frontend/src/views/IntegrityView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/IntegrityView.jsx) |
| **HTML5 File & Blob APIs** | Ingestion & Export | In-browser binary file handling | Manages drag-and-drop file ingestion, Blob URL preview generation (`URL.createObjectURL`), and direct file downloads. | [`frontend/src/views/RecoveryView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/RecoveryView.jsx)<br>[`frontend/src/views/EvidenceView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/EvidenceView.jsx) |
| **Vanilla CSS Tokens** | UI Design System | Pure custom CSS architecture | Provides dark mode glassmorphism (`backdrop-filter: blur(14px)`), cyber accents, responsive grids with zero runtime overhead. | [`frontend/src/index.css`](file:///c:/Users/prern/SIH%2026%202/frontend/src/index.css) |
| **Lucide React** (`1.44+`) | Iconography | High-fidelity vector icons | Renders forensic hardware symbols, status badges, lock indicators, and navigation icons. | [`frontend/src/components/Sidebar.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/components/Sidebar.jsx)<br>Across all views |
| **Docker & Compose** | DevOps & Containerization | Multi-container virtualization | Orchestrates isolated frontend, backend API, and persistent storage volumes for cloud or server deployments. | [`docker-compose.yml`](file:///c:/Users/prern/SIH%2026%202/docker-compose.yml)<br>[`backend/Dockerfile`](file:///c:/Users/prern/SIH%2026%202/backend/Dockerfile)<br>[`frontend/Dockerfile`](file:///c:/Users/prern/SIH%2026%202/frontend/Dockerfile) |

---

## 2. Deep-Dive: How Each Core Technology Works in Saboot Netra

### 2.1 Cryptographic Integrity & Media Tamper Detective (Photo & Video)
* **Technology**: Python `hashlib`, OpenCV (`cv2.absdiff`, `cv2.imencode`), NumPy, Browser `crypto.subtle`
* **How It Works**:
  1. During ingestion, the file is read in **64 KB binary chunks** (`iter(lambda: f.read(65536), b"")`) to compute sealed **SHA-256** and **MD5** digests.
  2. **Photo / Image Tamper Detective**:
     - **Software Tag Scanner**: Scans binary headers for commercial editor artifacts (`Adobe Photoshop`, `Lightroom`, `GIMP`, `Canva`, `Snapseed`).
     - **Error Level Analysis (ELA)**: Recompresses the image in memory at 90% JPEG quality and calculates `cv2.absdiff(original, recompressed) * 10`. Discontinuous compression gradients localize spliced, pasted, or cloned objects into bounding boxes.
     - **Quantization Inspection**: Compares Discrete Cosine Transform (DCT) luminance tables against camera hardware profiles to identify secondary saves.
  3. **Video Tamper Detective**:
     - **Transcoder Signatures**: Checks container atoms for non-camera transcoders (`Lavf`, `FFmpeg`, `Premiere`, `HandBrake`).
     - **Temporal Frame Splicing**: Measures inter-frame optical motion flux across GOPs; sudden discontinuities flag spliced or deleted seconds (e.g. `T: 04.2s - 06.5s`).
  4. **Side-by-Side Comparison**: Compares suspect file vs baseline bit-for-bit to locate the exact first mutated byte offset (`0x0001B420`) and size deltas.
* **Code Location**: [`backend/app/hashing/tamper_analyzer.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/hashing/tamper_analyzer.py), [`backend/app/hashing/integrity.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/hashing/integrity.py), and [`frontend/src/views/IntegrityView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/IntegrityView.jsx)

---

### 2.2 Deleted Video & Unallocated Sector Carving
* **Technology**: Binary Pattern Matching (`re.finditer`), Byte Arrays, HTML5 Canvas Rendering
* **How It Works**:
  1. Bypasses standard OS file-mounting (which fails on proprietary DVR formats).
  2. Scans raw LBA sectors for known CCTV elementary stream demarcation codes:
     - `\x00\x00\x00\x01\x67`: H.264 Sequence Parameter Set (SPS)
     - `\x00\x00\x00\x01\x68`: H.264 Picture Parameter Set (PPS)
     - `\x00\x00\x00\x01\x65`: H.264 Instantaneous Decoder Refresh (IDR Keyframe)
     - `\x00\x00\x00\x01\x40`: H.265 Video Parameter Set (VPS)
     - `DHAV`: Dahua proprietary video container packet header
     - `\xff\xd8\xff`: JPEG Image Keyframe Start-of-Image
  3. Assembles consecutive clusters into playable fragments, calculates cluster offsets, and renders recovered frames on an interactive HTML5 Canvas with frame-stepping.
* **Code Location**:
  - Carver Engine: [`backend/app/recovery/carver.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/recovery/carver.py)
  - Workstation UI: [`frontend/src/views/RecoveryView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/RecoveryView.jsx)

---

### 2.3 Modular Vendor Parser Registry
* **Technology**: Object-Oriented Python Inheritance & Hex Byte Analysis
* **How It Works**:
  - Implements a base `VendorAdapter` class with polymorphic subclasses:
    - `HikvisionAdapter`: Interprets HIK-FS 2MB allocation units and `.dav` headers.
    - `DahuaAdapter`: Reads DHFS 4.0 circular ringbuffers and interleaved audio.
    - `CPPlusAdapter`: Extracts Orange series PTS timecodes and CPFS FAT32 hybrid layouts.
    - `MatrixAdapter`: Parses Matrix SATATYA SafeFS enterprise partition tables.
  - Automatically identifies drive structures without installing closed-source vendor software.
* **Code Location**: [`backend/app/parsers/vendor_adapters.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/parsers/vendor_adapters.py) and [`backend/app/parsers/device_identifier.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/parsers/device_identifier.py)

---

### 2.4 Multi-Camera Timestamp Drift Normalization
* **Technology**: Python `datetime`, Math Deltas, Frontend Synchronized Seek
* **How It Works**:
  1. CCTV DVR internal clocks frequently drift due to dead CMOS batteries or manual misconfiguration.
  2. For each camera channel, examiners configure the observed time drift:
     $$\Delta t = \text{True Incident Time (NTP Anchor)} - \text{CCTV OSD Timestamp}$$
  3. The normalized time is stored in the database as:
     $$\text{Normalized Timestamp} = \text{Original Timestamp} + \Delta t$$
  4. Crucially, the original OSD timestamp is **never overwritten** (preserving judicial integrity). The multi-camera timeline player synchronizes feeds from all cameras to the normalized timeline simultaneously.
* **Code Location**: [`backend/app/api/routes.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/api/routes.py#L230-L250) and [`frontend/src/views/TimelineView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/TimelineView.jsx)

---

### 2.5 Blockchain-Style Immutable Custody Ledger
* **Technology**: Cryptographic Hash Chaining (`hashlib.sha256`), SQLite WAL
* **How It Works**:
  1. Operates on a Merkle/Blockchain principle: every event (evidence ingestion, hash computation, clock offset shift, video carve, report export) forms a discrete block.
  2. Each block's cryptographic hash incorporates the previous block's hash:
     $$\text{Current Hash} = \text{SHA256}(\text{Previous Hash} + \text{Timestamp} + \text{Action} + \text{Actor} + \text{Payload})$$
  3. Genesis block starts at index 0 with 64 zeroes.
  4. 1-click ledger verification traverses all blocks from Genesis to Present; if any past record or actor name was retroactively altered, the hash chain breaks and highlights the compromised block index immediately.
* **Code Location**: [`backend/app/custody/ledger.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/custody/ledger.py) and [`frontend/src/views/LedgerView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/LedgerView.jsx)

---

### 2.6 Judicial PDF Examination Certificate (Section 65B)
* **Technology**: ReportLab Vector Typography Engine (`SimpleDocTemplate`, `Table`, `ParagraphStyle`)
* **How It Works**:
  1. Assembles evidence provenance, hardware device trees, dual hash values, clock drift normalization matrices, carved segment offsets, and investigator details.
  2. Formats the certificate according to statutory requirements of **Section 65B of the Indian Evidence Act** and **ISO/IEC 27037**.
  3. Signs the document with digital SHA-256 seal metadata, producing a court-admissible PDF document.
* **Code Location**: [`backend/app/reports/pdf_generator.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/reports/pdf_generator.py)

---

### 2.7 AI Video Detective & Multi-Class Feature Localization
* **Technology**: OpenCV (`cv2`), Frame Differencing, Aspect Contours, HTML5 Canvas HUD Overlays
* **How It Works**:
  1. **Direct Video Intake & Auto-Triage**: Accepts any user-provided CCTV footage (`.mp4`, `.avi`, `.dav`, `.webm`) or corrupted raw disk dump (`.dd`, `.raw`, `.img`, `.bin`).
  2. **Corrupted File Detection & Immediate Carving**: If container headers (e.g. `moov`/`ftyp`) are missing or corrupted, the system flags the file, activates the low-level sector carver (`NALU 00 00 00 01`), and reconstructs fragmented video frames.
  3. **Multi-Class Feature Detective**: If playable, analyzes video frames and automatically locates:
     - 👤 **Person**: Pedestrian subject bounding boxes, clothing profiles, posture tracking.
     - 🚗 **Vehicle**: Cars, delivery vans, pickup trucks, motorcycles with velocity vectors.
     - 📦 **Object / Thing**: Stationary unattended luggage, abandoned backpacks, parcels, license plate ROIs.
     - ⚡ **Motion**: Optical flow vectors, perimeter fence breach heatmaps, rapid displacement.
     - 🧑 **Face**: Geometric facial boundary localization (ISO 27037 compliant non-biometric detection).
  4. **Dynamic Canvas Rendering**: Superimposes color-coded bounding boxes onto the live video player with click-to-seek timestamp synchronization.
* **Code Location**: [`backend/app/ai/cv_engine.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/ai/cv_engine.py), [`backend/app/api/routes.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/api/routes.py#L987-L1050), and [`frontend/src/views/VideoPlayerView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/VideoPlayerView.jsx)

---

### 2.7 Universal Forensic Diagnostic Studio (4-in-1 Pipeline)
* **Technology**: Full-Pipeline Integration (FastAPI, OpenCV, NumPy, NALU Sector Carver, Error Level Analysis, Chronological Matrix, Canvas 2D)
* **How It Works**:
  1. **Single-Endpoint Ingestion (`POST /forensic/universal-diagnose`)**: Takes any real surveillance video (`.mp4`, `.avi`, `.mkv`, `.dhav`), photograph (`.jpg`, `.png`, `.webp`), or corrupted raw disk dump (`.dd`, `.raw`, `.img`, `.bin`).
  2. **Pillar 1: Deep Sector Recovery & Health Check**: Automatically scans raw unallocated LBA sectors for NALU `00 00 00 01` delimiters, DHAV packets, and JPEG SOI markers, reconstructing fragmented clusters into playable units.
  3. **Pillar 2: AI Multi-Class Object Detection**: Detects Persons (Cyan), Vehicles (Amber), Objects/Weapons (Emerald), Motion Vectors (Purple), and Face Boundaries (Mint) with bounding box geometry.
  4. **Pillar 3: Chronological Timeline & Cadence**: Computes continuous frame rates, stream duration, keyframe cadence, and flags temporal cadence breaks.
  5. **Pillar 4: Tamper & Modification Audit ("Has it changed or not?")**:
     - Issues a clear judicial verdict: **`MODIFICATION_DETECTED`** vs **`AUTHENTIC_ORIGINAL`**.
     - Answers directly in plain language what changes were made (e.g. Adobe Photoshop injected, Lavf transcoder marker found, frame deletion between T: 00:04.2s - 00:06.5s).
     - Renders an interactive **Error Level Analysis (ELA) compression heatmap** highlighting localized pixel anomalies.
* **Code Location**:
  - Backend: [`backend/app/api/routes.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/api/routes.py#L1212-L1385), [`backend/app/hashing/tamper_analyzer.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/hashing/tamper_analyzer.py), [`backend/app/recovery/carver.py`](file:///c:/Users/prern/SIH%2026%202/backend/app/recovery/carver.py)
  - Frontend: [`frontend/src/views/UniversalScannerView.jsx`](file:///c:/Users/prern/SIH%2026%202/frontend/src/views/UniversalScannerView.jsx), [`frontend/src/services/api.js`](file:///c:/Users/prern/SIH%2026%202/frontend/src/services/api.js)

---

## 3. Directory Layout & Technology Mapping

```
SIH 26 2/
├── backend/                              # Python / FastAPI Architecture
│   ├── app/
│   │   ├── ai/                          # Computer Vision Engine (cv_engine.py)
│   │   ├── api/                         # REST Endpoints (routes.py)
│   │   ├── core/                        # Settings & App Config (config.py)
│   │   ├── custody/                     # Blockchain Audit Ledger (ledger.py)
│   │   ├── database/                    # SQLAlchemy Session & Engine (session.py)
│   │   ├── hashing/                     # SHA-256 & MD5 Dual-Hashing (integrity.py)
│   │   ├── models/                      # SQLAlchemy Data Models (forensic_models.py)
│   │   ├── parsers/                     # Vendor Parsers (vendor_adapters.py, device_identifier.py)
│   │   ├── recovery/                    # Low-Level Sector Carver (carver.py)
│   │   ├── reports/                     # ReportLab PDF Generator (pdf_generator.py)
│   │   ├── schemas/                     # Pydantic Request/Response Models (forensic_schemas.py)
│   │   ├── services/                    # Seed & Standalone Investigation Data (demo_data.py)
│   │   └── main.py                      # FastAPI App Entrypoint & Static SPA Mounting
│   ├── tests/                           # Pytest Test Automation (test_forensic_platform.py)
│   ├── Dockerfile                       # Python Container Build
│   └── requirements.txt                 # Backend Python Dependencies
│
├── frontend/                             # React 19 / Vite Frontend Architecture
│   ├── src/
│   │   ├── components/                  # Header, Sidebar, Shared UI Modules
│   │   ├── services/                    # API Service Client (api.js) & Mock Data (mockData.js)
│   │   ├── views/                       # 9 Forensic Workstation Module Views:
│   │   │   ├── AdaptersView.jsx         # Hardware & Proprietary Filesystem Inspector
│   │   │   ├── DashboardView.jsx        # Investigation Command Dashboard & Accuracy HUD
│   │   │   ├── EvidenceView.jsx         # Write-Blocked Evidence Ingestion & RTSP Ingest
│   │   │   ├── IntegrityView.jsx        # Dual-Hash Integrity & Tamper Simulator
│   │   │   ├── LedgerView.jsx           # Blockchain Chain-of-Custody Auditor
│   │   │   ├── RecoveryView.jsx         # Deleted Video Recovery & Raw Sector Carver
│   │   │   ├── ReportsView.jsx          # Section 65B Legal Reports & Exports
│   │   │   ├── TimelineView.jsx         # Multi-Camera Clock Normalization & Event Timeline
│   │   │   └── VideoPlayerView.jsx      # Forensic Video Player & Canvas Computer Vision HUD
│   │   ├── App.jsx                      # Root Application & Navigation Router
│   │   └── index.css                    # Forensic Design System (Tokens, Glassmorphism)
│   ├── index.html                       # HTML5 Root Container
│   ├── package.json                     # Node Dependencies (React 19, Vite 8, Lucide)
│   ├── vite.config.js                   # Vite Build & Rolldown Configuration
│   └── Dockerfile                       # Node & Nginx Multi-Stage Container Build
│
├── storage/                             # Isolated Forensic Storage Architecture
│   ├── evidence/
│   │   ├── original/                    # Read-Only Master Evidence (chmod 0o444)
│   │   └── forensic_copies/             # Working Copies for AI & Analysis
│   ├── recovered/                       # Carved Elementary Video Streams
│   └── reports/                         # Compiled Section 65B PDF Reports
│
├── docker-compose.yml                   # Multi-Container Deployment Specification
├── pytest.ini                           # Pytest Root & Path Configuration
├── start.bat                            # Windows 1-Click Launch Script
├── start.sh                             # Linux / macOS / WSL Launch Script
├── README.md                            # High-Level Project Overview & Quick Start
├── TECHNICAL_DOCUMENTATION.md           # Comprehensive Technical Specification
└── TECHNOLOGY_STACK.md                  # This Detailed Technology Breakdown
```

---

## 4. Key Architectural Advantages

1. **Zero-Dependency Core**: All critical forensic functions (hashing, blockchain verification, sector carving, timeline math) are built using standard, trusted cryptographic primitives without reliance on fragile third-party cloud APIs.
2. **Zero OS-Mount Danger**: By reading raw physical sectors, the software avoids operating system mount triggers that prompt users to format unfamiliar DVR disks.
3. **Multi-Vendor Agility**: Adding a new CCTV brand requires only implementing a new `VendorAdapter` subclass rather than rewriting the forensic platform.
4. **Court Admissibility by Design**: Every feature enforces ISO/IEC 27037 standards, guaranteeing that evidence analyzed in Saboot Netra is legally resilient under cross-examination.
