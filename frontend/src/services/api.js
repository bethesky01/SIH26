import {
  mockCases,
  mockCameras,
  mockEvidence,
  mockDetections,
  mockLedger,
  mockTimelineEvents,
  mockRecoveryRecords,
  mockReports,
  mockAdapters,
  getMockDashboardStats
} from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Reactive demo mode state
let isDemoMode = false;
const listeners = new Set();

export function subscribeDemoMode(callback) {
  listeners.add(callback);
  callback(isDemoMode);
  return () => listeners.delete(callback);
}

function setDemoMode(value) {
  if (isDemoMode !== value) {
    isDemoMode = value;
    listeners.forEach((cb) => cb(isDemoMode));
  }
}

// In-memory state for mock interactivity
let liveCases = [...mockCases];
let liveEvidence = [...mockEvidence];
let liveCameras = [...mockCameras];
let liveLedger = [...mockLedger];
let liveRecovery = [...mockRecoveryRecords];
let liveReports = [...mockReports];

function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(endpoint, 'http://localhost');
  const path = url.pathname;
  const caseId = url.searchParams.get('case_id') || 'CASE-2026-001';

  // 1. Dashboard Stats
  if (path.startsWith('/dashboard/stats')) {
    const stats = getMockDashboardStats(caseId);
    stats.total_evidence = liveEvidence.length;
    stats.verified_evidence = liveEvidence.filter((e) => !e.tampered).length;
    stats.integrity_status = liveEvidence.some((e) => e.tampered) ? 'COMPROMISED' : 'VERIFIED';
    return stats;
  }

  // 2. Cases
  if (path === '/cases') {
    if (method === 'POST') {
      const newCase = JSON.parse(options.body || '{}');
      const created = {
        id: 'case-' + Date.now(),
        case_id: newCase.case_id || `CASE-2026-${String(liveCases.length + 1).padStart(3, '0')}`,
        name: newCase.name || 'New Investigation Case',
        description: newCase.description || 'Forensic CCTV examination',
        investigator_name: newCase.investigator_name || 'Inspector R. Verma',
        organization: newCase.organization || 'Cyber Police & Forensic Science Lab',
        location: newCase.location || 'Central Forensic Lab',
        status: 'Active',
        priority: newCase.priority || 'High',
        incident_date: newCase.incident_date || new Date().toISOString(),
        devices_count: 1,
        evidence_count: 0,
        created_at: new Date().toISOString(),
      };
      liveCases.push(created);
      return created;
    }
    return liveCases;
  }

  if (path.startsWith('/cases/')) {
    const id = decodeURIComponent(path.replace('/cases/', ''));
    const c = liveCases.find((item) => item.case_id === id || item.id === id);
    return c || liveCases[0];
  }

  // 3. Devices & Cameras
  if (path === '/devices') {
    return [
      { id: 'dev-01', vendor: 'Hikvision', model: 'DS-7608NI-K2/8P', ip_address: '192.168.1.100', serial_number: 'DS7608-2026-X99' },
      { id: 'dev-02', vendor: 'Dahua', model: 'NVR4216-4KS2/L', ip_address: '192.168.1.105', serial_number: 'DHAV-4216-B02' },
      { id: 'dev-03', vendor: 'CP Plus', model: 'CP-UNR-408F2', ip_address: '192.168.1.110', serial_number: 'CPPL-UNR-881' },
    ];
  }

  if (path === '/cameras') {
    return liveCameras;
  }

  if (path.includes('/offset')) {
    const parts = path.split('/');
    const cameraId = decodeURIComponent(parts[2]);
    const body = JSON.parse(options.body || '{}');
    const cam = liveCameras.find((c) => c.id === cameraId);
    if (cam) {
      cam.clock_drift_seconds = body.clock_offset_seconds || 0;
    }
    return { status: 'SUCCESS', camera_id: cameraId, new_offset_seconds: body.clock_offset_seconds };
  }

  // 4. Evidence
  if (path === '/evidence') {
    return liveEvidence;
  }

  if (path.startsWith('/evidence/upload')) {
    const newEv = {
      id: 'ev-' + Date.now(),
      evidence_id: `EVD-${String(liveEvidence.length + 124).padStart(6, '0')}`,
      filename: 'uploaded_surveillance_evidence.mp4',
      camera_name: 'CAM-01 Main Gate Entrance',
      file_size: 420000,
      mime_type: 'video/mp4',
      hash_sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      hash_md5: 'e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a',
      baseline_sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      baseline_md5: 'e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a',
      acquisition_timestamp: new Date().toISOString(),
      original_timestamp: '2026-08-22 22:15:00',
      normalized_timestamp: '2026-08-22 22:15:00',
      duration_seconds: 15.0,
      resolution: '1920x1080',
      fps: 25.0,
      codec: 'H.264 / AVC',
      vendor: 'Generic ISO-BMFF',
      status: 'Verified',
      is_read_only: true,
      case_id: caseId,
      tampered: false,
    };
    liveEvidence.unshift(newEv);
    return newEv;
  }

  if (path.startsWith('/evidence/') && !path.includes('/stream')) {
    const id = decodeURIComponent(path.replace('/evidence/', ''));
    return liveEvidence.find((e) => e.id === id || e.evidence_id === id) || liveEvidence[0];
  }

  // 5. Parsers & Adapters
  if (path === '/parsers/adapters') {
    return mockAdapters;
  }

  if (path.startsWith('/parsers/inspect/')) {
    return {
      parser_name: 'ISO-BMFF / AVC Stream Inspector',
      container_format: 'MPEG-4 Part 14 (.mp4)',
      atoms_parsed: [
        { type: 'ftyp', offset: 0, size: 32, details: 'isom/mp42 major brand' },
        { type: 'moov', offset: 32, size: 4820, details: 'Movie header with timescale 25000' },
        { type: 'trak', offset: 4852, size: 2100, details: 'Video track ID 1 (1920x1080 @ 25fps)' },
        { type: 'mdat', offset: 6952, size: 306112, details: 'Compressed AVC/H.264 video NALUs' }
      ],
      compliance: 'ISO/IEC 14496-12 & ISO/IEC 27037 Validated',
      integrity_signature: 'VALID'
    };
  }

  // 6. Carving & Recovery
  if (path === '/recovery') {
    return liveRecovery;
  }

  if (path.startsWith('/recovery/scan/')) {
    const newCarved = {
      id: 'rec-' + Date.now(),
      cluster_offset_hex: '0x021B0000',
      cluster_offset_dec: 35323904,
      recovered_length_bytes: 786432,
      file_format: 'H.264 Carved Sequence',
      codec_signature: '0x00000001 (SPS Keyframe)',
      time_stamp_estimate: '2026-08-22 22:19:50',
      recovery_status: 'Recovered',
      integrity_status: 'Verified SHA-256',
      vendor_signature: 'Hikvision Fragment Reconstructed',
      evidence_filename: 'carved_chunk_0x021B0000_unallocated.h264',
    };
    liveRecovery.push(newCarved);
    return {
      status: 'SUCCESS',
      clusters_scanned: 16384,
      carved_fragments_found: liveRecovery.length,
      new_fragment: newCarved,
    };
  }

  // 7. Timeline
  if (path === '/timeline') {
    return mockTimelineEvents;
  }

  // 8. AI & Computer Vision
  if (path === '/ai/detections') {
    const evidenceId = url.searchParams.get('evidence_id');
    if (evidenceId) {
      const filtered = mockDetections.filter((d) => d.evidence_id === evidenceId);
      return filtered.length > 0 ? filtered : mockDetections.slice(0, 3);
    }
    return mockDetections;
  }

  if (path.startsWith('/ai/analyze/')) {
    return {
      status: 'COMPLETE',
      model: 'YOLOv8-Surveillance-Forensics-v2',
      frames_processed: 375,
      detections_count: 5,
      categories: ['Person', 'Vehicle', 'Face', 'Motion'],
      detections: mockDetections,
    };
  }

  // 9. Integrity Verification & Tamper Simulation
  if (path.startsWith('/integrity/verify/')) {
    const id = decodeURIComponent(path.replace('/integrity/verify/', ''));
    const ev = liveEvidence.find((e) => e.id === id);
    if (!ev) return { verified: true, message: 'Evidence baseline intact' };

    return {
      evidence_id: ev.evidence_id,
      filename: ev.filename,
      is_valid: !ev.tampered,
      tampered: !!ev.tampered,
      baseline_sha256: ev.baseline_sha256,
      current_sha256: ev.hash_sha256,
      baseline_md5: ev.baseline_md5,
      current_md5: ev.hash_md5,
      sha256_match: !ev.tampered,
      md5_match: !ev.tampered,
      status: ev.tampered ? 'TAMPERED / COMPROMISED' : 'VERIFIED / UNALTERED',
      message: ev.tampered
        ? 'ALERT: Cryptographic SHA-256 and MD5 hash mismatch! Unauthorized byte alteration detected.'
        : 'PASS: Dual SHA-256 and MD5 cryptographic integrity hashes match baseline seals perfectly.',
    };
  }

  if (path.startsWith('/integrity/simulate-tamper/')) {
    const id = decodeURIComponent(path.replace('/integrity/simulate-tamper/', ''));
    const ev = liveEvidence.find((e) => e.id === id);
    if (ev) {
      ev.tampered = !ev.tampered;
      if (ev.tampered) {
        ev.hash_sha256 = 'TAMPERED_d41d8cd98f00b204e9800998ecf8427e_BYTE_CORRUPTED_AT_OFFSET_0x3F';
        ev.hash_md5 = 'TAMPERED_d41d8cd9';
        ev.status = 'Compromised';
      } else {
        ev.hash_sha256 = ev.baseline_sha256;
        ev.hash_md5 = ev.baseline_md5;
        ev.status = 'Verified';
      }
    }
    return {
      status: 'SIMULATED',
      evidence_id: ev?.evidence_id,
      tampered: ev?.tampered,
      message: ev?.tampered
        ? 'Byte modification injected! Recalculating hashes will now trigger immediate cryptographic breach detection.'
        : 'Evidence restored to original read-only baseline bitstream.',
    };
  }

  // 10. Custody Blockchain Ledger
  if (path.startsWith('/custody/verify/')) {
    return {
      is_valid: true,
      total_blocks: liveLedger.length,
      genesis_block: liveLedger[0].current_hash,
      head_block: liveLedger[liveLedger.length - 1].current_hash,
      message: `Cryptographic Blockchain Ledger Verified: All ${liveLedger.length} audit blocks sealed with SHA-256 chaining (CurrentHash = SHA256(PrevHash + Payload)). Zero tampering detected.`,
    };
  }

  if (path.startsWith('/custody/')) {
    return liveLedger;
  }

  // 11. Reports
  if (path === '/reports') {
    return liveReports;
  }

  if (path === '/reports/generate') {
    const payload = JSON.parse(options.body || '{}');
    const newRep = {
      id: 'rep-' + Date.now(),
      report_title: payload.title || 'Official Digital Forensic Certificate (Sec 65B Indian Evidence Act)',
      case_id: payload.case_id || caseId,
      examiner_name: payload.examiner_name || 'Inspector R. Verma',
      institution: 'State Cyber Police Cell & Forensic Science Lab',
      generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      file_size: '154 KB',
      hash_sha256: '8f9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      status: 'SEALED & ADMISSIBLE',
      compliance: 'ISO/IEC 27037:2012 & Indian Evidence Act 1872 (Sec 65B)',
    };
    liveReports.unshift(newRep);
    return newRep;
  }

  // 12. Demo Reload
  if (path === '/demo/load') {
    liveCases = [...mockCases];
    liveEvidence = [...mockEvidence];
    liveCameras = [...mockCameras];
    liveLedger = [...mockLedger];
    liveRecovery = [...mockRecoveryRecords];
    liveReports = [...mockReports];
    return { status: 'SUCCESS', message: 'Demo investigation cases re-initialized.' };
  }

  return {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    setDemoMode(false);

    const contentType = response.headers.get('content-type');
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
      return response.blob();
    }

    return await response.json();
  } catch (error) {
    // Network failure / 404 / connection refused ➔ Graceful Standalone Fallback
    console.warn(`[Forensic Platform] Backend offline at ${API_BASE}. Falling back to standalone mock pipeline for: ${endpoint}`);
    setDemoMode(true);
    return handleMockRequest(endpoint, options);
  }
}

export const api = {
  get isDemoMode() {
    return isDemoMode;
  },
  subscribeDemoMode,

  // Dashboard
  getDashboardStats: (caseId) => request(`/dashboard/stats${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),

  // Cases
  getCases: () => request('/cases'),
  getCase: (caseId) => request(`/cases/${encodeURIComponent(caseId)}`),
  createCase: (data) => request('/cases', { method: 'POST', body: JSON.stringify(data) }),

  // Devices & Cameras
  getDevices: (caseId) => request(`/devices${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
  getCameras: (deviceId) => request(`/cameras${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`),
  updateCameraOffset: (cameraId, offsetSeconds) =>
    request(`/cameras/${encodeURIComponent(cameraId)}/offset`, {
      method: 'PUT',
      body: JSON.stringify({ camera_id: cameraId, clock_offset_seconds: offsetSeconds }),
    }),

  // Evidence
  getEvidence: (caseId) => request(`/evidence${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
  getEvidenceDetails: (evidenceId) => request(`/evidence/${encodeURIComponent(evidenceId)}`),
  uploadEvidence: (formData) => request('/evidence/upload', { method: 'POST', body: formData }),
  getStreamUrl: (evidenceId) => `${API_BASE}/evidence/${encodeURIComponent(evidenceId)}/stream`,

  // Parsers & Adapters
  getParserAdapters: () => request('/parsers/adapters'),
  inspectEvidenceParser: (evidenceId) => request(`/parsers/inspect/${encodeURIComponent(evidenceId)}`),

  // Carving / Recovery
  getRecoveryRecords: (caseId) => request(`/recovery${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
  scanRecovery: (evidenceId) => request(`/recovery/scan/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),

  // Timeline
  getTimelineEvents: (caseId) => request(`/timeline${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),

  // AI & Computer Vision
  getDetections: (evidenceId) => request(`/ai/detections${evidenceId ? `?evidence_id=${encodeURIComponent(evidenceId)}` : ''}`),
  analyzeEvidenceAI: (evidenceId) => request(`/ai/analyze/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),
  searchAIEvents: (queryPayload) => request('/ai/search', { method: 'POST', body: JSON.stringify(queryPayload) }),

  // Cryptographic Integrity & Tamper Testing
  verifyIntegrity: (evidenceId) => request(`/integrity/verify/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),
  simulateTamper: (evidenceId) => request(`/integrity/simulate-tamper/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),

  // Blockchain Audit Ledger
  getCustodyLedger: (caseId) => request(`/custody/${encodeURIComponent(caseId)}`),
  verifyCustodyChain: (caseId) => request(`/custody/verify/${encodeURIComponent(caseId)}`, { method: 'POST' }),

  // Reports
  generateReport: (payload) => request('/reports/generate', { method: 'POST', body: JSON.stringify(payload) }),
  getReports: (caseId) => request(`/reports${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
  getReportPdfUrl: (reportId) => `${API_BASE}/reports/download/${encodeURIComponent(reportId)}`,
  getReportJsonUrl: (reportId) => `${API_BASE}/reports/download/${encodeURIComponent(reportId)}/json`,
  getReportCsvUrl: (reportId) => `${API_BASE}/reports/download/${encodeURIComponent(reportId)}/csv`,

  // Demo Initializer
  loadDemoData: () => request('/demo/load', { method: 'POST' }),
};
