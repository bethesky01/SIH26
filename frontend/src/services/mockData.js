// Unified DVR/NVR Forensic Analysis Platform - Standalone Mock & Offline Demo Dataset
// ISO/IEC 27037 Compliant Synthetic Data

export const mockCases = [
  {
    id: "73d45457-4c41-4e13-8a1e-4f19b621fdfd",
    case_id: "CASE-2026-001",
    name: "Industrial Warehouse Security Incident — Bhopal",
    description: "Unauthorized nocturnal perimeter breach, warehouse loading dock infiltration, and DVR tampering attempt.",
    investigator_name: "Inspector R. Verma",
    organization: "State Cyber Police Cell & Forensic Science Lab",
    location: "Industrial Area Sector 3, Govindpura, Bhopal",
    status: "Active",
    priority: "Critical",
    incident_date: "2026-08-22 22:15:00",
    devices_count: 4,
    evidence_count: 4,
    created_at: "2026-08-23T04:15:00Z",
    updated_at: "2026-08-23T09:30:00Z"
  },
  {
    id: "9ee58f6e-1084-4ab9-90e4-93f393605c96",
    case_id: "CASE-2026-002",
    name: "Perimeter Breach & Commercial Fleet Theft — Indore",
    description: "Theft of commercial transport vehicles from distribution depot involving multi-camera synchronization.",
    investigator_name: "Sub-Inspector A. Sharma",
    organization: "Special Investigation Team",
    location: "Transport Hub, Dewas Naka, Indore",
    status: "Active",
    priority: "High",
    incident_date: "2026-08-20 03:30:00",
    devices_count: 2,
    evidence_count: 3,
    created_at: "2026-08-21T06:00:00Z",
    updated_at: "2026-08-21T11:45:00Z"
  },
  {
    id: "af682dc1-d701-4e0d-bbaa-9f72daa41c77",
    case_id: "CASE-2026-003",
    name: "Retail ATM Cash Logistics Discrepancy — Jabalpur",
    description: "Forensic examination of DVR vault camera footage during cash replenishment audit.",
    investigator_name: "Inspector R. Verma",
    organization: "Economic Offences Unit",
    location: "Civic Centre Branch, Jabalpur",
    status: "Closed",
    priority: "Medium",
    incident_date: "2026-08-15 14:10:00",
    devices_count: 1,
    evidence_count: 2,
    created_at: "2026-08-16T08:20:00Z",
    updated_at: "2026-08-18T16:00:00Z"
  }
];

export const mockCameras = [
  {
    id: "af4ee228-1bd3-4e66-ad67-e96c0618850a",
    camera_name: "CAM-01 Main Gate Entrance",
    channel_number: 1,
    location: "North Perimeter Gate",
    clock_drift_seconds: -330, // -5m 30s drift
    resolution: "1920x1080",
    fps: 25.0,
    vendor: "Hikvision",
    status: "Active"
  },
  {
    id: "76eecb54-b964-44be-87d6-5329552c6e8c",
    camera_name: "CAM-02 Loading Bay 4 North",
    channel_number: 2,
    location: "Loading Dock 4",
    clock_drift_seconds: -330,
    resolution: "1920x1080",
    fps: 25.0,
    vendor: "Hikvision",
    status: "Active"
  },
  {
    id: "f1ec4cc2-d259-4300-9612-2a6c35dfefa5",
    camera_name: "CAM-03 Perimeter Fence West",
    channel_number: 3,
    location: "West Boundary Wall",
    clock_drift_seconds: 0,
    resolution: "1920x1080",
    fps: 25.0,
    vendor: "Dahua",
    status: "Active"
  },
  {
    id: "e05ac84a-4f10-47be-bcf6-06c6c242a5ec",
    camera_name: "CAM-04 Cash Vault & Dispatch",
    channel_number: 4,
    location: "Secure Administration Vault",
    clock_drift_seconds: 180, // +3m drift
    resolution: "1920x1080",
    fps: 25.0,
    vendor: "CP Plus",
    status: "Active"
  },
  {
    id: "b21dc84a-4f10-47be-bcf6-06c6c242a5ef",
    camera_name: "CAM-05 Rear Parking & Alleyway",
    channel_number: 5,
    location: "Rear Staff Parking",
    clock_drift_seconds: 0,
    resolution: "1920x1080",
    fps: 20.0,
    vendor: "Matrix",
    status: "Active"
  },
  {
    id: "c32dc84a-4f10-47be-bcf6-06c6c242a5e0",
    camera_name: "CAM-06 Inbound Logistics Dock",
    channel_number: 6,
    location: "Warehouse Inbound Bay",
    clock_drift_seconds: -60,
    resolution: "1920x1080",
    fps: 25.0,
    vendor: "Generic ISO-BMFF",
    status: "Active"
  }
];

export const mockEvidence = [
  {
    id: "9e3aa2a1-bfa9-4f58-809c-11d78b9eda79",
    evidence_id: "EVD-000124",
    filename: "camera_01_main_gate_2026-08-22.mp4",
    camera_name: "CAM-01 Main Gate Entrance",
    file_size: 313064,
    mime_type: "video/mp4",
    hash_sha256: "6f4f9ab3b3acfe8afe84694b02da6df4a4ba5cbf5ec07c96ab63eba96777b7c9",
    hash_md5: "9285db19565d10a0bef52e4691b4a37d",
    baseline_sha256: "6f4f9ab3b3acfe8afe84694b02da6df4a4ba5cbf5ec07c96ab63eba96777b7c9",
    baseline_md5: "9285db19565d10a0bef52e4691b4a37d",
    acquisition_timestamp: "2026-08-23T04:30:00Z",
    original_timestamp: "2026-08-22 22:10:00",
    normalized_timestamp: "2026-08-22 22:15:30",
    duration_seconds: 15.0,
    resolution: "1920x1080",
    fps: 25.0,
    codec: "H.264 / AVC (High Profile)",
    vendor: "Hikvision",
    status: "Verified",
    is_read_only: true,
    case_id: "73d45457-4c41-4e13-8a1e-4f19b621fdfd",
    tampered: false,
    notes: "Ingested via write-blocking USB 3.0 bridge. Pristine baseline integrity seal verified."
  },
  {
    id: "3d3cb364-6e29-4343-9c63-6cee7ef10185",
    evidence_id: "EVD-000125",
    filename: "camera_02_loading_bay_2026-08-22.mp4",
    camera_name: "CAM-02 Loading Bay 4 North",
    file_size: 317035,
    mime_type: "video/mp4",
    hash_sha256: "007680d30abffc348ececaf4305a469ef3a146acce24c8ae15ba8af088d7007c",
    hash_md5: "c6589c001a93166322aa13aef5783cf0",
    baseline_sha256: "007680d30abffc348ececaf4305a469ef3a146acce24c8ae15ba8af088d7007c",
    baseline_md5: "c6589c001a93166322aa13aef5783cf0",
    acquisition_timestamp: "2026-08-23T04:32:00Z",
    original_timestamp: "2026-08-22 22:10:15",
    normalized_timestamp: "2026-08-22 22:15:45",
    duration_seconds: 15.0,
    resolution: "1920x1080",
    fps: 25.0,
    codec: "H.264 / AVC (High Profile)",
    vendor: "Hikvision",
    status: "Verified",
    is_read_only: true,
    case_id: "73d45457-4c41-4e13-8a1e-4f19b621fdfd",
    tampered: false,
    notes: "Footage captures loading dock shutter manipulation. Unsynced DVR clock normalized."
  },
  {
    id: "485cf3d3-7694-4256-a53e-126bc614d748",
    evidence_id: "EVD-000126",
    filename: "camera_03_perimeter_west_2026-08-22.mp4",
    camera_name: "CAM-03 Perimeter Fence West",
    file_size: 319615,
    mime_type: "video/mp4",
    hash_sha256: "056e511ffb058fdaac3f503c55d07dffe57f4ec70cc4a0fff81c0a6a0e5f218b",
    hash_md5: "86f3d1f912f5221319e7dd4e5bb7df5e",
    baseline_sha256: "056e511ffb058fdaac3f503c55d07dffe57f4ec70cc4a0fff81c0a6a0e5f218b",
    baseline_md5: "86f3d1f912f5221319e7dd4e5bb7df5e",
    acquisition_timestamp: "2026-08-23T04:35:00Z",
    original_timestamp: "2026-08-22 22:15:30",
    normalized_timestamp: "2026-08-22 22:15:30",
    duration_seconds: 15.0,
    resolution: "1920x1080",
    fps: 25.0,
    codec: "H.264 / AVC",
    vendor: "Dahua",
    status: "Verified",
    is_read_only: true,
    case_id: "73d45457-4c41-4e13-8a1e-4f19b621fdfd",
    tampered: false,
    notes: "NTP synchronized camera. Shows suspect scaling western chain-link perimeter."
  },
  {
    id: "d33b7ea3-fe7a-4ab1-bb07-6628e45da761",
    evidence_id: "EVD-000127",
    filename: "camera_04_cash_vault_2026-08-22.mp4",
    camera_name: "CAM-04 Cash Vault & Dispatch",
    file_size: 330240,
    mime_type: "video/mp4",
    hash_sha256: "4e6bca957bf9fd3ad72d3d65fd532c2991965d0bbeb990457aee10abcb7b7886",
    hash_md5: "60f9245128cf3926d3d83fe1df13f5d6",
    baseline_sha256: "4e6bca957bf9fd3ad72d3d65fd532c2991965d0bbeb990457aee10abcb7b7886",
    baseline_md5: "60f9245128cf3926d3d83fe1df13f5d6",
    acquisition_timestamp: "2026-08-23T04:38:00Z",
    original_timestamp: "2026-08-22 22:18:30",
    normalized_timestamp: "2026-08-22 22:15:30",
    duration_seconds: 15.0,
    resolution: "1920x1080",
    fps: 25.0,
    codec: "H.264 / AVC",
    vendor: "CP Plus",
    status: "Verified",
    is_read_only: true,
    case_id: "73d45457-4c41-4e13-8a1e-4f19b621fdfd",
    tampered: false,
    notes: "Fast clock (+3 mins) corrected. Shows unauthorized presence in dispatch foyer."
  }
];

export const mockDetections = [
  {
    id: "det-01",
    evidence_id: "9e3aa2a1-bfa9-4f58-809c-11d78b9eda79",
    timestamp_sec: 3.5,
    label: "Person (Suspicious Subject)",
    confidence: 0.94,
    bbox_x: 0.18,
    bbox_y: 0.42,
    bbox_w: 0.15,
    bbox_h: 0.45,
    cctv_time: "2026-08-22 22:10:03.50",
    normalized_time: "2026-08-22 22:15:33.50"
  },
  {
    id: "det-02",
    evidence_id: "9e3aa2a1-bfa9-4f58-809c-11d78b9eda79",
    timestamp_sec: 6.2,
    label: "Vehicle (Unmarked Van)",
    confidence: 0.89,
    bbox_x: 0.52,
    bbox_y: 0.50,
    bbox_w: 0.32,
    bbox_h: 0.35,
    cctv_time: "2026-08-22 22:10:06.20",
    normalized_time: "2026-08-22 22:15:36.20"
  },
  {
    id: "det-03",
    evidence_id: "9e3aa2a1-bfa9-4f58-809c-11d78b9eda79",
    timestamp_sec: 9.0,
    label: "Face (Partial Masking)",
    confidence: 0.78,
    bbox_x: 0.22,
    bbox_y: 0.44,
    bbox_w: 0.07,
    bbox_h: 0.10,
    cctv_time: "2026-08-22 22:10:09.00",
    normalized_time: "2026-08-22 22:15:39.00"
  },
  {
    id: "det-04",
    evidence_id: "485cf3d3-7694-4256-a53e-126bc614d748",
    timestamp_sec: 4.8,
    label: "Person (Intruder)",
    confidence: 0.92,
    bbox_x: 0.30,
    bbox_y: 0.38,
    bbox_w: 0.12,
    bbox_h: 0.48,
    cctv_time: "2026-08-22 22:15:34.80",
    normalized_time: "2026-08-22 22:15:34.80"
  },
  {
    id: "det-05",
    evidence_id: "485cf3d3-7694-4256-a53e-126bc614d748",
    timestamp_sec: 11.4,
    label: "Motion (Perimeter Fence Breach)",
    confidence: 0.88,
    bbox_x: 0.25,
    bbox_y: 0.30,
    bbox_w: 0.25,
    bbox_h: 0.60,
    cctv_time: "2026-08-22 22:15:41.40",
    normalized_time: "2026-08-22 22:15:41.40"
  }
];

export const mockLedger = [
  {
    block_number: 0,
    timestamp: "2026-08-23T04:15:00Z",
    action: "GENESIS_BLOCK: Investigation Case Initialized",
    actor: "System Forensic Engine",
    role: "System Authority",
    device: "Forensic Acquisition Workstation #01",
    previous_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    current_hash: "1fdfdfbe73d454574c414e138a1e4f19b621fdfd53e94d24a0b2c1d3e4f5a6b7",
    payload_summary: "Case CASE-2026-001 opened under ISO/IEC 27037 protocol guidelines.",
    status: "VALID"
  },
  {
    block_number: 1,
    timestamp: "2026-08-23T04:30:12Z",
    action: "EVIDENCE_INGESTION: Raw DVR Bitstream Mounted Write-Blocked",
    actor: "Inspector R. Verma",
    role: "Lead Digital Forensics Examiner",
    device: "Hardware Write-Blocker CRU WiebeTech UltraDock v5",
    previous_hash: "1fdfdfbe73d454574c414e138a1e4f19b621fdfd53e94d24a0b2c1d3e4f5a6b7",
    current_hash: "3a948cf1092e4b3a88b7c6e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
    payload_summary: "Acquired 4 channels of CCTV video evidence. Raw files locked read-only.",
    status: "VALID"
  },
  {
    block_number: 2,
    timestamp: "2026-08-23T04:35:45Z",
    action: "CRYPTOGRAPHIC_HASH_SEAL: Dual SHA-256 and MD5 Computed",
    actor: "Automated Integrity Daemon",
    role: "Cryptographic Subsystem",
    device: "Hardware Security Module (HSM) FIPS 140-2",
    previous_hash: "3a948cf1092e4b3a88b7c6e1d2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
    current_hash: "7f6e5d4c3b2a190887766554433221100ffeeddccbbaa9988776655443322110",
    payload_summary: "Computed and anchored SHA-256 and MD5 hash baselines across all 4 evidence files.",
    status: "VALID"
  },
  {
    block_number: 3,
    timestamp: "2026-08-23T04:42:10Z",
    action: "TIMESTAMP_DRIFT_NORMALIZATION: Master Clock Incident Matrix Applied",
    actor: "Inspector R. Verma",
    role: "Lead Digital Forensics Examiner",
    device: "Forensic Analysis Terminal (Bhopal Cyber Lab)",
    previous_hash: "7f6e5d4c3b2a190887766554433221100ffeeddccbbaa9988776655443322110",
    current_hash: "b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    payload_summary: "Re-aligned CAM-01 (-330s) and CAM-04 (+180s) to Master Timeline 22:15:30.",
    status: "VALID"
  },
  {
    block_number: 4,
    timestamp: "2026-08-23T05:00:30Z",
    action: "AI_COMPUTER_VISION_INFERENCE: Object Classification & Spatial Tracking",
    actor: "YOLOv8-Forensics Inference Worker",
    role: "AI Model Execution Worker",
    device: "NVIDIA RTX 4090 GPU Accelerator",
    previous_hash: "b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
    current_hash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    payload_summary: "Detected 5 spatial entities (2 Persons, 1 Vehicle, 1 Masked Face, 1 Perimeter Motion).",
    status: "VALID"
  }
];

export const mockTimelineEvents = [
  {
    id: "evt-01",
    timestamp: "2026-08-22 22:15:30",
    raw_osd_timestamp: "2026-08-22 22:10:00",
    camera_name: "CAM-01 Main Gate Entrance",
    channel: 1,
    vendor: "Hikvision",
    event_type: "Motion Detection",
    description: "Subject in dark clothing approaches gate keypad on foot.",
    severity: "Medium",
    evidence_id: "9e3aa2a1-bfa9-4f58-809c-11d78b9eda79"
  },
  {
    id: "evt-02",
    timestamp: "2026-08-22 22:15:32",
    raw_osd_timestamp: "2026-08-22 22:15:32",
    camera_name: "CAM-03 Perimeter Fence West",
    channel: 3,
    vendor: "Dahua",
    event_type: "Perimeter Alert",
    description: "Secondary subject climbs over western wall perimeter barbed wire.",
    severity: "Critical",
    evidence_id: "485cf3d3-7694-4256-a53e-126bc614d748"
  },
  {
    id: "evt-03",
    timestamp: "2026-08-22 22:15:45",
    raw_osd_timestamp: "2026-08-22 22:10:15",
    camera_name: "CAM-02 Loading Bay 4 North",
    channel: 2,
    vendor: "Hikvision",
    event_type: "Loading Shutter Sensor",
    description: "Loading dock roller shutter forcibly propped open with metal crowbar.",
    severity: "Critical",
    evidence_id: "3d3cb364-6e29-4343-9c63-6cee7ef10185"
  },
  {
    id: "evt-04",
    timestamp: "2026-08-22 22:16:10",
    raw_osd_timestamp: "2026-08-22 22:19:10",
    camera_name: "CAM-04 Cash Vault & Dispatch",
    channel: 4,
    vendor: "CP Plus",
    event_type: "Access Violation",
    description: "Unauthorized entrance into dispatch room and attempted DVR cabinet breach.",
    severity: "Critical",
    evidence_id: "d33b7ea3-fe7a-4ab1-bb07-6628e45da761"
  }
];

export const mockRecoveryRecords = [
  {
    id: "rec-001",
    cluster_offset_hex: "0x004A2000",
    cluster_offset_dec: 4857856,
    recovered_length_bytes: 524288,
    file_format: "H.264 NALU Bitstream",
    codec_signature: "0x00000001 (SPS/PPS Sequence Header)",
    time_stamp_estimate: "2026-08-22 22:17:40",
    recovery_status: "Recovered",
    integrity_status: "Verified SHA-256",
    vendor_signature: "Hikvision Hik-Storage Header",
    evidence_filename: "carved_chunk_0x004A2000_loadingbay.h264"
  },
  {
    id: "rec-002",
    cluster_offset_hex: "0x009B8400",
    cluster_offset_dec: 10191872,
    recovered_length_bytes: 1048576,
    file_format: "DHAV Container Frame",
    codec_signature: "0x44484156 (Dahua DHAV Magic)",
    time_stamp_estimate: "2026-08-22 22:16:15",
    recovery_status: "Recovered",
    integrity_status: "Verified SHA-256",
    vendor_signature: "Dahua Proprietary Tag",
    evidence_filename: "carved_chunk_0x009B8400_perimeter.dav"
  },
  {
    id: "rec-003",
    cluster_offset_hex: "0x012F4000",
    cluster_offset_dec: 19873792,
    recovered_length_bytes: 262144,
    file_format: "Fragmented NALU Slice",
    codec_signature: "0x00000165 (IDR Keyframe)",
    time_stamp_estimate: "2026-08-22 22:18:02",
    recovery_status: "Partially Recoverable",
    integrity_status: "Partial Checksum Match",
    vendor_signature: "CP Plus Stream Index",
    evidence_filename: "carved_chunk_0x012F4000_vault_partial.h264"
  },
  {
    id: "rec-004",
    cluster_offset_hex: "0x018C1000",
    cluster_offset_dec: 25956352,
    recovered_length_bytes: 131072,
    file_format: "Corrupted Header Block",
    codec_signature: "0x00000000 (Overwritten Zero Fill)",
    time_stamp_estimate: "Unknown (Missing Index)",
    recovery_status: "Corrupted",
    integrity_status: "Checksum Failed",
    vendor_signature: "Unrecognized Vendor",
    evidence_filename: "carved_chunk_0x018C1000_unallocated.bin"
  }
];

export const mockReports = [
  {
    id: "rep-001",
    report_title: "Official Digital Forensic Certificate (Sec 65B Indian Evidence Act)",
    case_id: "CASE-2026-001",
    examiner_name: "Inspector R. Verma",
    institution: "State Cyber Police Cell & Forensic Science Lab",
    generated_at: "2026-08-23 09:30:00 UTC",
    file_size: "142 KB",
    hash_sha256: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    status: "SEALED & ADMISSIBLE",
    compliance: "ISO/IEC 27037:2012 & Indian Evidence Act 1872 (Sec 65B)"
  },
  {
    id: "rep-002",
    report_title: "Cryptographic Chain of Custody & Hash Audit Ledger Export",
    case_id: "CASE-2026-001",
    examiner_name: "Inspector R. Verma",
    institution: "State Cyber Police Cell & Forensic Science Lab",
    generated_at: "2026-08-23 10:15:00 UTC",
    file_size: "88 KB",
    hash_sha256: "1f2e3d4c5b6a70899887766554433221100ffeeddccbbaa99887766554433221",
    status: "SEALED & ADMISSIBLE",
    compliance: "Tamper-Evident Hash Chain Audit"
  }
];

export const mockAdapters = [
  {
    vendor: "Hikvision",
    status: "Active / Parsed",
    container_formats: [".mp4", ".dav", ".h264", ".hik"],
    description: "Proprietary Hikvision Hik-Storage index parsing, encrypted stream demuxing, and metadata recovery.",
    supported_codecs: ["H.264 (AVC)", "H.265 (HEVC)", "MPEG-4"],
    timestamp_format: "OSD burned-in clock + SEI NALU metadata",
    signature_hex: "0x48494B56 ('HIKV')",
    success_rate: "99.4%"
  },
  {
    vendor: "Dahua Technology",
    status: "Active / Parsed",
    container_formats: [".dav", ".dhav", ".mp4"],
    description: "Direct Dahua DHAV atom carving, index table synchronization, and audio/video demultiplexing.",
    supported_codecs: ["H.264", "H.265", "DHAV Proprietary"],
    timestamp_format: "DHAV header frame millisecond counter",
    signature_hex: "0x44484156 ('DHAV')",
    success_rate: "99.1%"
  },
  {
    vendor: "CP Plus (Aditya Infotech)",
    status: "Active / Parsed",
    container_formats: [".dav", ".mp4", ".asf"],
    description: "CP Plus Orange/Ruby series container reconstruction and fragmented cluster header alignment.",
    supported_codecs: ["H.264 Baseline/High", "H.265"],
    timestamp_format: "Channel OSD watermark + System stream index",
    signature_hex: "0x4350504C ('CPPL')",
    success_rate: "98.7%"
  },
  {
    vendor: "Matrix Telecom Solutions",
    status: "Active / Ready",
    container_formats: [".mkv", ".mp4", ".avi"],
    description: "Matrix SATATYA IP/DVR multi-channel stream demuxer with audio synchronization.",
    supported_codecs: ["H.264", "H.265", "MJPEG"],
    timestamp_format: "MKV UTC timeline track metadata",
    signature_hex: "0x1A45DFA3 (EBML)",
    success_rate: "99.8%"
  },
  {
    vendor: "Generic ISO-BMFF / MP4",
    status: "Active / Baseline",
    container_formats: [".mp4", ".mov", ".m4v", ".3gp"],
    description: "Universal ISO/IEC 14496-12 standard box parser (ftyp, moov, mdat) with fragmented movie support.",
    supported_codecs: ["All ISO standard codecs"],
    timestamp_format: "mvhd/tkhd duration matrix",
    signature_hex: "0x66747970 ('ftyp')",
    success_rate: "100.0%"
  }
];

export function getMockDashboardStats(caseId = "CASE-2026-001") {
  const currentCase = mockCases.find((c) => c.case_id === caseId) || mockCases[0];
  return {
    active_case: {
      id: currentCase.id,
      case_id: currentCase.case_id,
      name: currentCase.name,
      investigator: currentCase.investigator_name,
      organization: currentCase.organization
    },
    total_cases: mockCases.length,
    total_evidence: mockEvidence.length,
    verified_evidence: mockEvidence.filter((e) => !e.tampered).length,
    total_recovered: mockRecoveryRecords.length,
    total_detections: mockDetections.length,
    ledger_status: "VERIFIED",
    integrity_status: "VERIFIED",
    vendor_counts: [
      { name: "Hikvision", value: 2 },
      { name: "Dahua", value: 1 },
      { name: "CP Plus", value: 1 }
    ],
    camera_events: [
      { camera_name: "CAM-01 Main Gate Entrance", channel: 1, evidence_count: 1, detections_count: 3 },
      { camera_name: "CAM-02 Loading Bay 4 North", channel: 2, evidence_count: 1, detections_count: 0 },
      { camera_name: "CAM-03 Perimeter Fence West", channel: 3, evidence_count: 1, detections_count: 2 },
      { camera_name: "CAM-04 Cash Vault & Dispatch", channel: 4, evidence_count: 1, detections_count: 0 },
      { camera_name: "CAM-05 Rear Parking & Alleyway", channel: 5, evidence_count: 0, detections_count: 0 },
      { camera_name: "CAM-06 Inbound Logistics Dock", channel: 6, evidence_count: 0, detections_count: 0 }
    ],
    detection_categories: [
      { name: "Person", count: 2 },
      { name: "Vehicle", count: 1 },
      { name: "Face", count: 1 },
      { name: "Motion", count: 1 }
    ],
    recovery_status_counts: [
      { name: "Recovered", value: 2 },
      { name: "Partially Recoverable", value: 1 },
      { name: "Corrupted", value: 1 }
    ],
    recent_activity: [
      {
        block_number: 4,
        action: "AI_COMPUTER_VISION_INFERENCE: Object Classification & Spatial Tracking",
        actor: "YOLOv8-Forensics Inference Worker",
        time: "05:00:30 UTC",
        current_hash: "e5f6a7b8...3d4e5f6"
      },
      {
        block_number: 3,
        action: "TIMESTAMP_DRIFT_NORMALIZATION: Master Clock Incident Matrix Applied",
        actor: "Inspector R. Verma",
        time: "04:42:10 UTC",
        current_hash: "b0c1d2e3...8a9b0c1"
      },
      {
        block_number: 2,
        action: "CRYPTOGRAPHIC_HASH_SEAL: Dual SHA-256 and MD5 Computed",
        actor: "Automated Integrity Daemon",
        time: "04:35:45 UTC",
        current_hash: "7f6e5d4c...43322110"
      },
      {
        block_number: 1,
        action: "EVIDENCE_INGESTION: Raw DVR Bitstream Mounted Write-Blocked",
        actor: "Inspector R. Verma",
        time: "04:30:12 UTC",
        current_hash: "3a948cf1...c8d9e0f1"
      },
      {
        block_number: 0,
        action: "GENESIS_BLOCK: Investigation Case Initialized",
        actor: "System Forensic Engine",
        time: "04:15:00 UTC",
        current_hash: "1fdfdfbe...53e94d24"
      }
    ]
  };
}
