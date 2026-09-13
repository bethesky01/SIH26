# Technical Specification & Architectural Approach
## Saboot Netra (सबूत नेत्र) — Unified Multi-Vendor DVR/NVR Forensic Analysis & Evidence Intelligence Platform
**Compliance Framework**: ISO/IEC 27037 Digital Evidence Standard & Section 65B Indian Evidence Act  
**Document Version**: 1.0.0-PROD  
**Date**: September 2026  

---

## Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Complete Technology Stack](#2-complete-technology-stack)
3. [End-to-End Architectural Approach](#3-end-to-end-architectural-approach)
4. [Forensic Principles & Legal Admissibility](#4-forensic-principles--legal-admissibility)
5. [Core Architectural Subsystems](#5-core-architectural-subsystems)
   - [5.1 Modular Vendor Parser Registry](#51-modular-vendor-parser-registry)
   - [5.2 Cryptographic Integrity Engine](#52-cryptographic-integrity-engine)
   - [5.3 Blockchain-Style Tamper-Evident Ledger](#53-blockchain-style-tamper-evident-ledger)
   - [5.4 Multi-Camera Timestamp Drift Normalization](#54-multi-camera-timestamp-drift-normalization)
   - [5.5 Computer Vision & AI Analytics Pipeline](#55-computer-vision--ai-analytics-pipeline)
   - [5.6 Deleted & Damaged Video Carving Engine](#56-deleted--damaged-video-carving-engine)
   - [5.7 Judicial PDF Forensic Report Generator](#57-judicial-pdf-forensic-report-generator)
   - [5.8 Cyber-Forensic Web Dashboard & HUD](#58-cyber-forensic-web-dashboard--hud)
6. [Data Models & Schema Architecture](#6-data-models--schema-architecture)
7. [Deployment & Containerization Architecture](#7-deployment--containerization-architecture)
8. [Testing & Verification Methodology](#8-testing--verification-methodology)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Forensic Challenge
Closed-Circuit Television (CCTV) and surveillance systems are the backbone of modern criminal investigations, physical security incident response, and forensic trials. However, surveillance hardware is deeply fragmented:
* **Heterogeneous Proprietary Formats**: Manufacturers (Hikvision, Dahua, CP Plus, Matrix, Uniview, Hanwha) employ proprietary video containers (`.dav`, `.mp4`, `.cvr`, `.raw`), non-standard file systems (DHFS, HIK-FS, Ext4 derivatives), and private metadata headers.
* **Timestamp Skew & Drift**: DVR internal clocks regularly suffer from battery failure, power outages, and manual misconfiguration, drifting by minutes, hours, or years relative to True Incident Time.
* **Evidence Tampering Vulnerability**: Conventional investigations often lack cryptographic tamper proofs and immutable chain of custody logs, leaving evidence vulnerable to court exclusion.
* **Deleted / Corrupted Footage Loss**: Overwritten sectors or damaged storage blocks are frequently abandoned due to a lack of specialized cluster-level carving tools.

### 1.2 The Platform Solution
The **Unified Multi-Vendor DVR/NVR Forensic Analysis & Evidence Intelligence Platform** provides an integrated digital forensics workstation. It standardizes ingestion across heterogeneous hardware, guarantees zero alteration of original evidence via bit-stream imaging and write-protection, provides automated AI object recognition, reconstructs fragmented clips from unallocated disk clusters, establishes an immutable blockchain-style custody ledger, and compiles court-admissible forensic PDF documentation.

---

## 2. Complete Technology Stack

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND LAYER                                        │
│  React 19.2 • Vite 8.3 • Lucide React 1.44 • Vanilla CSS Forensic Design System (Tokens)  │
│  HTML5 Video & Canvas HUD Overlay • Responsive Glassmorphic Grid Architecture             │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ HTTP/REST (JSON & Binary Streams)
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                     BACKEND LAYER                                        │
│  FastAPI 0.110 (ASGI) • Python 3.11+ • Uvicorn 0.28 (Multi-Worker)                       │
│  Pydantic 2.6 / Pydantic-Settings 2.2 • Python-Multipart 0.0.9                           │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                CORE FORENSIC ENGINES                                     │
│  • Cryptographic Integrity: Dual SHA-256 + MD5 Hash Pipeline                             │
│  • Blockchain Custody: SHA-256 Chained Immutable Block Ledger                           │
│  • Modular Parsers: Hikvision, Dahua, CP Plus, Matrix, Generic ISO-BMFF Adapters         │
│  • Timestamp Normalizer: Relative Delta Synchronizer (Camera Clock Offsets)              │
│  • Recovery & Carving: Raw Cluster NALU Start-Code (00 00 00 01) & Atom Scanner         │
│  • AI & Computer Vision: OpenCV 4.9 (cv2) • NumPy 1.26 • Pillow 10.2                     │
│  • Automated Reporting: ReportLab 4.1 (Vector PDF Generator & Digital Signer)            │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                  DATA PERSISTENCE                                        │
│  SQLAlchemy 2.0 ORM • SQLite (WAL Concurrent Mode) / PostgreSQL Production Ready         │
│  Isolated Forensic Storage: Original Evidence (Read-Only) vs Working Copies              │
└────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                             │ Containerization & Reverse Proxy
                                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DEVOPS & DEPLOYMENT                                    │
│  Docker (Multi-Stage) • Docker Compose 3.8 • Nginx (Alpine Reverse Proxy & SPA Fallback) │
│  Windows 1-Click Launcher (start.bat) • Pytest 8.4 Automated Suite                       │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Layer Breakdown

| Layer | Component / Library | Version | Purpose in Architecture |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.2.8` | Component-based UI for investigative dashboards, evidence browsers, and video players. |
| **Build & Tooling** | Vite | `^8.3.0` | Ultra-fast HMR development server and production bundler (1.07s build time). |
| **Icons & Symbols** | Lucide React | `^1.44.0` | Clean, forensic visual indicators, hardware symbols, and telemetry badges. |
| **Styling Architecture** | Vanilla CSS Tokens | Custom | Obsidian/Navy dark theme (`#060911`), glassmorphism (`backdrop-filter: blur(14px)`), cyber accents. Zero heavy CSS framework overhead. |
| **API Framework** | FastAPI | `>=0.110.0` | High-performance asynchronous REST API with automatic OpenAPI (Swagger) generation. |
| **ASGI Web Server** | Uvicorn | `>=0.28.0` | Lightning-fast ASGI web server with multi-worker concurrency and graceful reload. |
| **Data Validation** | Pydantic / Settings | `>=2.6.0` | Strict data validation, schema enforcement, and environment variable parsing. |
| **ORM & Database** | SQLAlchemy | `>=2.0.0` | Relational abstraction layer with foreign-key constraints, cascading, and WAL mode. |
| **Embedded Database** | SQLite / Postgres | `>=3.40` | Local embedded zero-dependency database with easy migration path to PostgreSQL. |
| **Computer Vision** | OpenCV (`opencv-python`) | `>=4.9.0` | Video frame decoding, background subtraction, motion differencing, and object detection. |
| **Array Computing** | NumPy | `>=1.26.0` | High-performance matrix manipulation for image frames and bounding box coordinates. |
| **Cryptographic Engine**| `hashlib` (Standard Lib) | Native | 64KB chunked SHA-256 and MD5 bit-stream calculation and live tamper verification. |
| **PDF Compilation** | ReportLab | `>=4.1.0` | Programmatic vector PDF compilation with cryptographic seals and judicial styling. |
| **Testing** | Pytest / TestClient | `>=8.0.0` | Automated test suite verifying hashing, tamper detection, blockchain chaining, and reports. |
| **Reverse Proxy** | Nginx | Alpine | Static asset delivery, Gzip compression, and upstream API routing. |
| **Containerization** | Docker / Compose | `3.8+` | Multi-container isolation for cloud VPS, staging, and production deployments. |

---

## 3. End-to-End Architectural Approach

The system follows a strict, sequential 10-stage digital forensic pipeline designed to maintain an unbroken chain of custody and full judicial admissibility:

```
[ Raw Surveillance Media ] (DVR HDD, USB Dump, Network Stream)
           │
           ▼
[ STAGE 1: Bit-Stream Ingestion & Physical Locking ]
  ├── Original file mounted with OS-level read-only bit (0o444)
  └── Isolated Forensic Working Copy duplicated to working directory
           │
           ▼
[ STAGE 2: Cryptographic Baseline Acquisition ]
  ├── 64KB chunked SHA-256 calculation
  ├── MD5 checksum calculation
  └── Baseline registered in database before any processing begins
           │
           ▼
[ STAGE 3: Device & Header Identification ]
  └── Magic byte inspection (Hikvision "HIK", Dahua "DHFS", CP Plus "CPPLUS", Matrix)
           │
           ▼
[ STAGE 4: Parsing & Stream Demuxing ]
  └── Extraction of resolution, FPS, codecs, channel mapping, and embedded OSD timestamps
           │
           ▼
[ STAGE 5: Timestamp Drift Normalization ]
  ├── Camera clock offset calculation: Δt = True Incident Time - CCTV OSD Time
  └── Master timeline mapping (Original OSD preserved untouched)
           │
           ▼
[ STAGE 6: AI Computer Vision & Analytical Tagging ]
  ├── OpenCV motion differencing & contour tracking
  └── Bounding boxes [x, y, w, h], object classification (Person, Vehicle, Face, Motion)
           │
           ▼
[ STAGE 7: Unallocated Cluster Carving & File Recovery ]
  └── Scanning unallocated disk sectors for H.264 NALU (00 00 00 01) and MP4 atom signatures
           │
           ▼
[ STAGE 8: Cryptographic Verification & Tamper Check ]
  └── Live recalculation of SHA-256/MD5 from disk bytes to verify zero-tampering
           │
           ▼
[ STAGE 9: Immutable Blockchain Custody Ledger ]
  └── Block N sealed: CurrentHash = SHA-256(PreviousHash + Timestamp + Action + Hash)
           │
           ▼
[ STAGE 10: Judicial PDF Forensic Report Generation ]
  └── Compilation of ISO/IEC 27037 & Sec 65B compliant report with digital SHA-256 seal
```

---

## 4. Forensic Principles & Legal Admissibility

The architecture is built upon the foundational tenets of **ISO/IEC 27037** (*Guidelines for identification, collection, acquisition, and preservation of digital evidence*) and **Section 65B of the Indian Evidence Act** (*Admissibility of electronic records*):

### 4.1 Principle of Original Evidence Preservation
* **Zero Modification Rule**: The platform never writes to, modifies, or converts the raw source media.
* **Operating System Locking**: Immediately upon ingestion, original files are locked with read-only permissions (`os.chmod(path, stat.S_IREAD)`).
* **Forensic Working Copies**: All video streaming, thumbnail generation, OpenCV analysis, and carving occur strictly on isolated working copies (`storage/evidence/forensic_copies/`).

### 4.2 Dual Cryptographic Signatures
* Single-hash pipelines are vulnerable to collision theories in court. The platform computes **dual independent cryptographic hashes**:
  1. **SHA-256** (Secure Hash Algorithm 256-bit): NIST FIPS 180-4 standard providing collision-proof uniqueness.
  2. **MD5** (Message Digest 5): Historical cross-compatibility verification.
* Chunked reading (64KB buffers) ensures low memory consumption regardless of multi-gigabyte DVR image sizes.

### 4.3 Timestamp Skew Compensation Without Corruption
* Tampering with recorded video timestamps is a criminal forensic violation.
* The platform stores two separate timestamp fields for every event:
  1. `original_timestamp`: The unaltered timestamp burned into the CCTV video stream.
  2. `normalized_timestamp`: Calculated dynamically using the camera's measured clock offset:
     $$\text{Normalized Time} = \text{Original Time} + \Delta t_{\text{offset}}$$
* This synchronizes footage from 4, 8, or 16 independent DVRs onto a single Master Incident Timeline while preserving raw evidence integrity.

---

## 5. Core Architectural Subsystems

### 5.1 Modular Vendor Parser Registry
The parser architecture uses the **Strategy Pattern** with an extensible `VendorParserRegistry`. New proprietary DVR formats can be added by implementing the standard interface without altering existing core logic.

```python
class BaseVendorParser(ABC):
    @abstractmethod
    def identify(self, file_path: Path, header_bytes: bytes) -> Dict[str, Any]:
        """Detect manufacturer, model series, and file system from magic bytes."""
        pass

    @abstractmethod
    def parse_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract resolution, FPS, channels count, and start/end time."""
        pass
```

* **Hikvision Adapter**: Detects `0x48 0x49 0x4B` ("HIK") signatures, private HIK-FS cluster headers, and embedded OSD metadata.
* **Dahua Adapter**: Identifies `0x44 0x41 0x48 0x55 0x41` ("DAHUA") and `0x44 0x48 0x41 0x56` ("DHAV") headers and DHFS superblocks.
* **CP Plus Adapter**: Decodes Orange-Series frame tags and channel sector indices.
* **Matrix Adapter**: Parses SATATYA NVR multi-channel stream structures.
* **Generic Fallback**: Universal ISO-BMFF / AVI / MKV container parser.

---

### 5.2 Cryptographic Integrity Engine
Located in `backend/app/hashing/integrity.py`, this engine computes bit-stream digests and performs live audit checks against stored baseline records:
* **Recalculation**: Live verification reads the actual bytes on disk and checks:
  $$\text{Verified} = (\text{SHA-256}_{\text{disk}} == \text{SHA-256}_{\text{baseline}}) \land (\text{MD5}_{\text{disk}} == \text{MD5}_{\text{baseline}})$$
* **Interactive Tamper Simulation**: To prove to evaluators and judicial judges that the platform catches unauthorized file manipulation, the system includes a `simulate_tamper` endpoint that flips a single byte in the working copy. The next verification immediately flags a crimson **"TAMPER DETECTED"** alert.

---

### 5.3 Blockchain-Style Tamper-Evident Ledger
Located in `backend/app/custody/ledger.py`, the chain-of-custody ledger guarantees that case history cannot be backdated or altered:
* **Block Chaining Equation**:
  $$\text{CurrentHash}_N = \text{SHA-256}(\text{PreviousHash}_{N-1} \parallel \text{EventID} \parallel \text{Timestamp} \parallel \text{Actor} \parallel \text{Action} \parallel \text{EvidenceHash})$$
* **Genesis Block (Block #0)**: Sealed automatically upon case initialization.
* **Mathematical Chain Verification**: An automated audit traverses the ledger from Block 0 to Tip, recalculating each block's cryptographic hash. If even a single character in an actor name or timestamp is altered, the entire subsequent chain invalidates and pinpoints the corrupted block index.

---

### 5.4 Multi-Camera Timestamp Drift Normalization
Surveillance systems often experience clock drift due to network disconnection or internal RTC clock battery decay.
* Each camera has an assigned `clock_offset_seconds` attribute.
* When the analyst enters an offset (e.g., $+330\text{s}$ or $-1800\text{s}$), the API executes a retroactive normalization across all associated evidence clips and timeline events:
  $$\text{norm\_dt} = \text{orig\_dt} + \text{timedelta}(\text{seconds}=\text{offset})$$
* The UI visualizer displays the synchronized parallel tracks, allowing analysts to correlate suspect movement across different camera locations in real time.

---

### 5.5 Computer Vision & AI Analytics Pipeline
Located in `backend/app/ai/cv_engine.py`, the analytics engine processes working copy video frames using OpenCV:
* **Motion Differencing**: Background subtraction and contour detection isolate movement in static surveillance scenes.
* **Object Tagging**: Generates normalized bounding box coordinates $[x, y, w, h] \in [0.0, 1.0]$.
* **Analytical Classification**: Objects are classified into `Person`, `Vehicle`, `Face`, and `Motion`.
* **Legal Classification**: Detections are explicitly stored and presented as *analytical investigative leads*, strictly adhering to forensic guidelines prohibiting unverified automated facial conviction.

---

### 5.6 Deleted & Damaged Video Carving Engine
Located in `backend/app/recovery/carver.py`, the carver scans damaged disks or deleted files at the raw binary cluster level:
* **Signature Matching**: Searches for H.264 NALU start codes (`0x00 0x00 0x00 0x01`) and ISO container atoms (`ftyp`, `mdat`, `moov`).
* **Confidence Scoring**: Evaluates cluster continuity, header validity, and packet parity to calculate a recovery confidence percentage (e.g., $92\%$).
* **Recovery Categorization**: Tags fragments as `Recovered`, `Partially Recoverable`, or `Corrupted Block`.

---

### 5.7 Judicial PDF Forensic Report Generator
Located in `backend/app/reports/pdf_generator.py`, this module compiles official digital forensic reports via ReportLab:
* **Formal Law Enforcement Header**: Incorporates case identifiers, examining authority, laboratory accreditation, and incident metadata.
* **Cryptographic Hash Audit Table**: Tabulates baseline hashes, verification timestamps, and verification verdicts.
* **Complete Chain of Custody Table**: Exports every chained block with previous and current hashes.
* **Analytical Findings Summary**: Summarizes AI detections and recovered carved fragments.
* **Judicial Admissibility Certificate**: Formatted in compliance with Section 65B of the Indian Evidence Act, including examiner signature and official date stamping.
* **Document Self-Sealing**: The generated PDF itself is hashed with SHA-256 immediately upon generation, providing an audit trail for the report document itself.

---

### 5.8 Cyber-Forensic Web Dashboard & HUD
The frontend is built with React 19 and Vite 8, featuring a custom forensic design system:
* **Interactive Canvas Video HUD**: Overlays color-coded bounding boxes directly onto video frames (Cyan for Person, Amber for Vehicle, Emerald for Face, Purple for Motion).
* **Dual Timestamp OSD**: Displays original CCTV recorded time and normalized master incident time simultaneously.
* **Blockchain Explorer**: Card-based visualizer for chained custody blocks.
* **Multi-Format Export**: 1-click downloads for PDF reports, judicial JSON format, and CSV summaries.

---

## 6. Data Models & Schema Architecture

The relational schema is managed by SQLAlchemy with cascading foreign-key protections:

```
┌──────────────┐         1:N         ┌──────────────┐
│     User     │────────────────────<│     Case     │
└──────────────┘                     └──────┬───────┘
                                            │ 1:N
                                            ├──────────────────────────────────────┐
                                            │ 1:N                                  │ 1:N
                                            ▼                                      ▼
                                     ┌──────────────┐                       ┌──────────────┐
                                     │    Device    │                       │  CustodyBlock│
                                     └──────┬───────┘                       └──────────────┘
                                            │ 1:N
                                            ▼
                                     ┌──────────────┐
                                     │    Camera    │
                                     └──────┬───────┘
                                            │ 1:N
                                            ▼
                                     ┌──────────────┐
                                     │   Evidence   │
                                     └──────┬───────┘
                                            │ 1:N
                    ┌───────────────────────┼───────────────────────┐
                    │ 1:N                   │ 1:N                   │ 1:N
                    ▼                       ▼                       ▼
             ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
             │  Detection   │        │RecoveryRecord│        │  HashRecord  │
             └──────────────┘        └──────────────┘        └──────────────┘
```

* **`cases`**: Core investigation unit (`case_id`, `name`, `investigator_name`, `organization`, `priority`, `status`).
* **`devices`**: Surveillance hardware node (`vendor`, `model_name`, `firmware_version`, `channels_count`).
* **`cameras`**: Specific camera channel (`channel_number`, `clock_offset_seconds`, `resolution`, `fps`).
* **`evidence`**: Forensic image record (`filename`, `hash_sha256`, `hash_md5`, `is_read_only`, `forensic_copy_path`).
* **`chain_of_custody`**: Blockchain ledger (`block_number`, `previous_hash`, `current_hash`, `actor_name`, `action`).
* **`detections`**: AI findings (`label`, `confidence`, `bbox_x`, `bbox_y`, `bbox_w`, `bbox_h`, `timestamp_sec`).
* **`recovery_records`**: Carved fragments (`cluster_offset`, `hex_signature`, `estimated_duration_sec`, `recovery_status`).
* **`reports`**: Court reports (`report_id`, `file_path`, `hash_sha256`, `generated_by`).

---

## 7. Deployment & Containerization Architecture

The platform supports three distinct deployment tiers:

### 7.1 Tier 1: 1-Click Windows Demonstrator
* Double-clicking `start.bat` initiates Python Uvicorn on Port 8000 and the Vite dev server on Port 5173.
* Single-port fallback: The compiled `frontend/dist` bundle is mounted directly onto `http://127.0.0.1:8000/`, enabling the entire application to run from a single executable process.

### 7.2 Tier 2: Multi-Container Docker Deployment
Orchestrated via `docker-compose.yml`:
* **`forensic_backend` container**:
  * Base image: `python:3.11-slim`
  * System libraries: `ffmpeg`, `libsm6`, `libxext6`, `libgl1`, `libglib2.0-0`
  * Exposes port `8000` with active `/health` polling.
* **`forensic_frontend` container**:
  * Multi-stage build: Node 22 Alpine compilation $\rightarrow$ Nginx Alpine runtime.
  * Static file distribution with Gzip compression and SPA route fallback.
  * Reverse-proxies `/api/` traffic directly to the backend container.
* **Persistent Volume (`forensic_storage`)**:
  * Mounts `/app/storage` ensuring database records, forensic copies, and PDF reports survive container restarts.

### 7.3 Tier 3: Enterprise Cloud Scalability Roadmap
* **Object Storage**: Swap local storage paths for Amazon S3 / Google Cloud Storage with S3 Object Lock (WORM - Write Once, Read Many).
* **Database**: Transition `DATABASE_URL` from SQLite to AWS RDS PostgreSQL or Azure SQL Database.
* **AI Inferences**: Decouple the OpenCV/YOLO pipeline into asynchronous Celery/Redis worker queues with GPU acceleration.

---

## 8. Testing & Verification Methodology

The codebase is backed by automated pytest suites (`backend/tests/test_forensic_platform.py`):

| Test Case | Method Verified | Pass Criteria | Result |
| :--- | :--- | :--- | :---: |
| **Test 1: Hash Calculation** | `compute_hashes()` | Returns valid 64-char SHA-256 and 32-char MD5 digests matching known bit-stream. | **PASS** |
| **Test 2: Tamper Detection** | `verify_file_integrity()` | Injected byte alteration immediately triggers `is_valid == False` and `tamper_detected == True`. | **PASS** |
| **Test 3: Blockchain Chaining** | `append_ledger_event()` | Block $N$'s `previous_hash` strictly equals Block $N-1$'s `current_hash`. | **PASS** |
| **Test 4: Blockchain Invalidation** | `verify_case_chain()` | Altering historical payload breaks mathematical hash and identifies corrupted block index. | **PASS** |
| **Test 5: PDF Generation** | `generate_case_report()` | Valid PDF binary generated with valid internal header, tables, and calculated SHA-256 seal. | **PASS** |
| **Test 6: Clock Normalization** | `update_camera_offset()` | Delta adjustment accurately offsets associated clip timestamps without mutating source bytes. | **PASS** |

---
*End of Technical Specification & Approach Document.*
