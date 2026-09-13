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
  getMockDashboardStats,
  getMockDeviceIdentification,
  mockMultiCameraCorrelations,
  mockAuditTrail,
  mockValidationMetrics
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

  if (path === '/devices/identify') {
    const body = JSON.parse(options.body || '{}');
    return getMockDeviceIdentification(body.sample_id, body.filename);
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

  if (path === '/evidence/live-stream') {
    const payload = JSON.parse(options.body || '{}');
    const newEv = {
      id: 'ev-rtsp-' + Date.now(),
      evidence_id: `EVD-${String(liveEvidence.length + 124).padStart(6, '0')}`,
      filename: `RTSP_${(payload.stream_name || 'Camera').replace(/\s+/g, '_')}.mp4`,
      camera_name: payload.camera_name || 'RTSP IP Camera',
      file_size: 524288,
      mime_type: 'video/mp4',
      hash_sha256: '9b7a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b',
      hash_md5: 'a8b7c6d5e4f3a2b10987654321fedcba',
      baseline_sha256: '9b7a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b',
      baseline_md5: 'a8b7c6d5e4f3a2b10987654321fedcba',
      acquisition_timestamp: new Date().toISOString(),
      original_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      normalized_timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration_seconds: payload.capture_duration_seconds || 10.0,
      resolution: '1920x1080',
      fps: 25.0,
      codec: 'H.264 / RTSP Stream',
      vendor: payload.vendor || 'Generic RTSP IP Camera',
      status: 'Verified',
      is_read_only: true,
      case_id: payload.case_id || caseId,
      tampered: false,
    };
    liveEvidence.unshift(newEv);
    return newEv;
  }

  if (path.startsWith('/validation/metrics')) {
    return mockValidationMetrics;
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

  if (path === '/recovery/carve-file') {
    const newCarved = {
      id: 'rec-' + Date.now(),
      cluster_offset_hex: '0x00A4F000',
      cluster_offset_dec: 10809344,
      recovered_length_bytes: 524288,
      file_format: 'H.264 / AVC Bitstream',
      codec_signature: '0x00000001 (SPS NALU)',
      time_stamp_estimate: new Date().toISOString().replace('T', ' ').slice(0, 19),
      recovery_status: 'Recovered',
      integrity_status: 'Verified SHA-256',
      vendor_signature: 'Direct Byte Stream Carved',
      evidence_filename: 'carved_fragment_0x00A4F000.h264',
    };
    liveRecovery.unshift(newCarved);
    return {
      status: 'SUCCESS',
      filename: 'uploaded_forensic_source.bin',
      file_size: 524288,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      fragments_found: 3,
      fragments: [newCarved, ...liveRecovery.slice(1, 3)],
    };
  }

  // 7. Timeline & Multi-Camera Correlations
  if (path === '/timeline') {
    return mockTimelineEvents;
  }

  if (path === '/timeline/correlations') {
    return mockMultiCameraCorrelations;
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
      detections_count: mockDetections.length,
      categories: ['Person', 'Vehicle', 'Object', 'Face', 'Motion'],
      detections: mockDetections,
    };
  }

  if (path === '/ai/analyze-video-file') {
    // Check if filename suggests corrupted stream
    const isCorrupted = (options.body && options.body.get && (
      (options.body.get('file')?.name || '').toLowerCase().includes('corrupt') ||
      (options.body.get('file')?.name || '').toLowerCase().endsWith('.raw') ||
      (options.body.get('file')?.name || '').toLowerCase().endsWith('.dd') ||
      (options.body.get('file')?.name || '').toLowerCase().endsWith('.bin') ||
      (options.body.get('file')?.name || '').toLowerCase().endsWith('.img')
    ));

    if (isCorrupted) {
      return {
        status: 'SUCCESS',
        is_corrupted: true,
        filename: options.body?.get?.('file')?.name || 'corrupted_sample.raw',
        file_size: 524288,
        hash_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        hash_md5: 'e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a',
        corruption_type: 'Corrupted Video Bitstream (Header Unallocated / Index Broken)',
        message: 'Corrupted file detected. Low-level sector carving reconstructed unallocated video frames.',
        fragments_found: liveRecovery.length,
        fragments: liveRecovery,
        recommendation: 'Direct extraction available in Recovery Carver module.'
      };
    }

    const uploadedFileName = options.body?.get?.('file')?.name || 'user_cctv_footage.mp4';
    return {
      status: 'SUCCESS',
      is_corrupted: false,
      filename: uploadedFileName,
      file_size: 2048576,
      duration_seconds: 16.0,
      fps: 25.0,
      hash_sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      hash_md5: '8b1a9953c4611296a827abf8c47804d7',
      detections_count: mockDetections.length,
      categories: ['Person', 'Vehicle', 'Object', 'Motion', 'Face'],
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

  if (path === '/integrity/analyze-media') {
    const file = options.body?.get?.('file');
    const baseline = options.body?.get?.('baseline_file');
    const fileName = file?.name || 'suspect_evidence.jpg';
    const isImage = /\.(jpg|jpeg|png|bmp|webp)$/i.test(fileName);
    const isVideo = /\.(mp4|avi|mov|mkv|dav|webm)$/i.test(fileName);
    const hasTamperHint = /tamper|edit|mod|splice|photoshop|cut|changed/i.test(fileName);

    if (baseline) {
      // Comparison Mode
      const isDifferent = hasTamperHint || file?.size !== baseline?.size;
      return {
        status: 'SUCCESS',
        is_comparison: true,
        filename: fileName,
        media_type: isImage ? 'Compared Photo' : (isVideo ? 'Compared Video' : 'Compared Media'),
        original_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        suspect_sha256: isDifferent ? 'd41d8cd98f00b204e9800998ecf8427e0123456789abcdef0123456789abcdef' : '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        original_size: baseline?.size || 1024000,
        suspect_size: file?.size || 1025500,
        size_delta_bytes: isDifferent ? 1500 : 0,
        first_modified_byte_offset: isDifferent ? '0x0001B420' : 'None',
        has_changed: isDifferent,
        tamper_detected: isDifferent,
        verdict: isDifferent ? 'MODIFICATION_DETECTED' : 'AUTHENTIC_IDENTICAL',
        verdict_label: isDifferent ? '⚠ EVIDENCE MODIFIED (DIFF FOUND)' : '✓ 100% BIT-FOR-BIT IDENTICAL',
        summary: isDifferent ? 'Discrepancies found: 3 forensic differences between original and suspect copies.' : 'Files are bit-for-bit identical. 0 byte alterations detected.',
        changes_count: isDifferent ? 3 : 0,
        changes_detected: isDifferent ? [
          {
            category: 'Cryptographic Hash Mismatch',
            severity: 'CRITICAL',
            title: 'SHA-256 Digest Discrepancy',
            details: 'Suspect file digest does not match sealed original baseline. Avalanche effect triggered.'
          },
          {
            category: 'Physical Byte Mutation',
            severity: 'CRITICAL',
            title: 'First Alteration at Offset 0x0001B420',
            details: 'Byte mutation detected at index 111,648 in binary stream.'
          },
          {
            category: 'Allocation Delta',
            severity: 'HIGH',
            title: 'File Size Divergence (+1,500 bytes)',
            details: 'Suspect file contains additional unaligned byte payload.'
          }
        ] : []
      };
    }

    // Single File Mode
    if (hasTamperHint) {
      return {
        status: 'SUCCESS',
        filename: fileName,
        media_type: isImage ? 'Picture / Photo' : (isVideo ? 'CCTV Video Stream' : 'Forensic Media'),
        file_size: file?.size || 2048576,
        hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        hash_md5: 'd41d8cd98f00b204e9800998ecf8427e',
        has_changed: true,
        tamper_detected: true,
        tamper_score: 0.92,
        confidence_percentage: 95.8,
        verdict: 'MODIFICATION_DETECTED',
        verdict_label: isImage ? '⚠ IMAGE MODIFIED / SPLICED' : '⚠ VIDEO ALTERED / SPLICED',
        summary: `Evidence alteration detected! ${isImage ? '3 image manipulation' : '3 video tampering'} anomalies identified.`,
        changes_count: 3,
        changes_detected: isImage ? [
          {
            category: 'Software Editor Signature',
            severity: 'CRITICAL',
            title: 'Commercial Editor: Adobe Photoshop 2024',
            details: 'Binary headers contain Adobe Photoshop software signature. CCTV camera firmware does not inject desktop editor tags.'
          },
          {
            category: 'Pixel Error Level Analysis (ELA)',
            severity: 'HIGH',
            title: 'Compression Discontinuity (Spliced Region)',
            details: 'High-frequency ELA variance (18.4%) localized in quadrant [X: 0.34, Y: 0.22, W: 0.16, H: 0.12]. Inconsistent quantization reveals pasted element.',
            bounding_box: [0.34, 0.22, 0.16, 0.12]
          },
          {
            category: 'Quantization Table Discrepancy',
            severity: 'MEDIUM',
            title: 'Non-Hardware DQT Table Mismatch',
            details: 'Luminance quantization does not match hardware sensor profiles, indicating secondary saving.'
          }
        ] : [
          {
            category: 'Transcoder Software Injected',
            severity: 'CRITICAL',
            title: 'Non-Camera Encoder: Lavf (FFmpeg)',
            details: 'Found encoder marker Lavf in MP4 moov container atom. Camera hardware writes elementary streams directly.'
          },
          {
            category: 'Frame Splicing / Deletion',
            severity: 'HIGH',
            title: 'Temporal Scene Cut at T: 00:04.2s - 00:06.5s',
            details: 'Visual motion flux jump detected across consecutive keyframes. 58 frames deleted or spliced.',
            timestamps_sec: [4.2, 6.5]
          },
          {
            category: 'GOP Cadence Discontinuity',
            severity: 'MEDIUM',
            title: 'Broken I-Frame Cadence at Offset 0x01E400',
            details: 'Surveillance DVR 25fps closed GOP interval violated.'
          }
        ],
        ela_heatmap: {
          localized_bounding_box: [0.34, 0.22, 0.16, 0.12],
          compression_variance_pct: 18.4
        }
      };
    }

    // Authentic Clean File
    return {
      status: 'SUCCESS',
      filename: fileName,
      media_type: isImage ? 'Picture / Photo' : (isVideo ? 'CCTV Video Stream' : 'Forensic Media'),
      file_size: file?.size || 1542000,
      hash_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      hash_md5: 'a7c2e81902bf89c1d04e5a9102c3d4e5',
      has_changed: false,
      tamper_detected: false,
      tamper_score: 0.02,
      confidence_percentage: 97.4,
      verdict: 'AUTHENTIC_ORIGINAL',
      verdict_label: '✓ VERIFIED AUTHENTIC (0 CHANGES)',
      summary: 'Evidence passed all cryptographic, metadata, and pixel ELA integrity checks without alteration. Zero modifications detected.',
      changes_count: 0,
      changes_detected: [],
      ela_heatmap: {
        localized_bounding_box: null,
        compression_variance_pct: 0.8
      }
    };
  }

  // 9.5 Universal Forensic Diagnostic (4 Pillars: Recovery, Detect, Timeline, Tamper)
  if (path === '/forensic/universal-diagnose') {
    let file = null;
    let baselineFile = null;
    if (options.body instanceof FormData) {
      file = options.body.get('file');
      baselineFile = options.body.get('baseline_file');
    }
    const fileName = file?.name || 'forensic_stream.mp4';
    const lowerName = fileName.toLowerCase();
    const isPresetPic1 = lowerName.includes('demo_pic_1');
    const isPresetPic2 = lowerName.includes('demo_pic_2');
    const isPresetVideo1 = lowerName.includes('demo_video_1');
    const isPresetVideo2 = lowerName.includes('demo_video_2');
    const isPresetCorrupt = lowerName.includes('demo_corrupted') || lowerName.includes('corrupt') || lowerName.endsWith('.dd');

    const isImage = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png') || lowerName.endsWith('.webp') || lowerName.includes('photo') || lowerName.includes('pic') || isPresetPic1 || isPresetPic2;
    
    // Determine exact positive or negative case
    let isFatalCorrupt = false;
    let isCorrupted = false;
    let isHeavyTamper = false;
    let isModified = false;
    let isAuthentic = false;

    if (isPresetPic1 || isPresetVideo1 || isPresetVideo2) {
      isAuthentic = true;
      isCorrupted = false;
      isHeavyTamper = false;
      isModified = false;
    } else if (isPresetPic2) {
      isAuthentic = false;
      isCorrupted = false;
      isModified = true;
      isHeavyTamper = false;
    } else if (isPresetCorrupt) {
      isAuthentic = false;
      isCorrupted = true;
      isModified = false;
      isHeavyTamper = false;
    } else {
      isFatalCorrupt = lowerName.includes('fatal') || lowerName.includes('bad_sector') || lowerName.includes('severe');
      isCorrupted = isFatalCorrupt || lowerName.includes('corrupt') || lowerName.endsWith('.dd') || lowerName.endsWith('.raw') || lowerName.endsWith('.img') || lowerName.endsWith('.bin');
      isHeavyTamper = lowerName.includes('splic') || lowerName.includes('heavy') || lowerName.includes('cadence_cut') || lowerName.includes('inaccurate');
      isModified = isHeavyTamper || lowerName.includes('tamper') || lowerName.includes('fake') || lowerName.includes('edited') || lowerName.includes('photoshop') || lowerName.includes('modify') || !!baselineFile;
      isAuthentic = !isCorrupted && !isModified;
    }

    const hasChanges = isModified;
    const hasHeavyChanges = isHeavyTamper;
    const hasSeriousIssues = isCorrupted || isHeavyTamper || isFatalCorrupt;
    const isAccurateForCase = isAuthentic;

    let caseVerdictCategory = 'AUTHENTIC_NO_CHANGES';
    let verdictHeadline = 'THIS FILE HAS NO CHANGES — VERIFIED AUTHENTIC & ACCURATE FOR THE CASE';
    let verdictLabel = '✓ THIS FILE HAS NO CHANGES — VERIFIED AUTHENTIC';
    let caseAccuracyLabel = 'ACCURATE FOR THE CASE';
    let admissibilityStatus = 'ADMISSIBLE';

    if (isFatalCorrupt) {
      caseVerdictCategory = 'FATAL_CORRUPTION';
      verdictHeadline = 'THIS FILE IS CRITICALLY CORRUPTED — FATAL DATA INTEGRITY FAILURE';
      verdictLabel = '⛔ CRITICALLY CORRUPTED (NOT ACCURATE FOR CASE)';
      caseAccuracyLabel = 'NOT ACCURATE FOR THE CASE';
      admissibilityStatus = 'INADMISSIBLE';
    } else if (isCorrupted) {
      caseVerdictCategory = 'CORRUPTED_RECOVERED';
      verdictHeadline = 'THIS FILE IS CORRUPTED — SECTOR DAMAGE & CARVED FRAGMENTS';
      verdictLabel = '💾 THIS FILE IS CORRUPTED (RECOVERED FROM SECTORS)';
      caseAccuracyLabel = 'NOT ACCURATE FOR THE CASE (COMPROMISED BITSTREAM)';
      admissibilityStatus = 'CONDITIONAL_RECOVERY';
    } else if (isHeavyTamper) {
      caseVerdictCategory = 'HEAVY_CHANGES_INACCURATE';
      verdictHeadline = 'THIS FILE CONTAINS SERIOUS ISSUES AND IS NOT ACCURATE FOR THE CASE';
      verdictLabel = '🚨 HEAVY CHANGES DETECTED — FILE CONTAINS SERIOUS ISSUES';
      caseAccuracyLabel = 'NOT ACCURATE FOR THE CASE';
      admissibilityStatus = 'INADMISSIBLE';
    } else if (isModified) {
      caseVerdictCategory = 'MODIFIED_CHANGES';
      verdictHeadline = 'THIS FILE IS MODIFIED — EXTERNAL CHANGES DETECTED';
      verdictLabel = '⚠ THIS FILE IS MODIFIED — CHANGES DETECTED';
      caseAccuracyLabel = 'NOT ACCURATE FOR THE CASE (ALTERED)';
      admissibilityStatus = 'CONDITIONAL_SCRUTINY';
    }

    // Pillar 1: Recovery
    const recoveryPillar = {
      is_corrupted: isCorrupted,
      is_severely_corrupted: isFatalCorrupt,
      corruption_severity: isFatalCorrupt ? 'CRITICAL_UNREADABLE' : (isCorrupted ? 'MODERATE_CARVED' : 'NONE'),
      recovery_status: isFatalCorrupt ? 'FATAL_CORRUPTION_FAILED' : (isCorrupted ? 'RECOVERED_FROM_SECTORS' : 'PRISTINE_BITSTREAM'),
      health_label: isFatalCorrupt ? '⛔ FATAL SECTOR CORRUPTION' : (isCorrupted ? '⚠ THIS FILE IS CORRUPTED' : '✓ HEALTHY STREAM (NOT CORRUPTED)'),
      fragments_found: isFatalCorrupt ? 0 : (isCorrupted ? 4 : 0),
      fragments: isFatalCorrupt ? [] : (isCorrupted ? [
        { fragment_id: 'FRAG-001', codec_format: 'H.264 / AVC Elementary', start_offset: 0x00042000, end_offset: 0x001a4000, byte_length: 1450000, keyframes: 18, resolution: '1920x1080', playable_status: 'RECONSTRUCTED' },
        { fragment_id: 'FRAG-002', codec_format: 'DHAV Container Atom', start_offset: 0x001a4000, end_offset: 0x002c0000, byte_length: 1163264, keyframes: 12, resolution: '1920x1080', playable_status: 'RECONSTRUCTED' },
        { fragment_id: 'FRAG-003', codec_format: 'JPEG EXIF Frame', start_offset: 0x002c0000, end_offset: 0x00320000, byte_length: 393216, keyframes: 1, resolution: '1280x720', playable_status: 'RECONSTRUCTED' },
        { fragment_id: 'FRAG-004', codec_format: 'H.264 NALU Cluster', start_offset: 0x00320000, end_offset: 0x00410000, byte_length: 983040, keyframes: 14, resolution: '1920x1080', playable_status: 'RECONSTRUCTED' }
      ] : []),
      details: isFatalCorrupt
        ? 'Fatal cluster failure: Zero valid NALU or container headers found. Raw sectors corrupted beyond recovery.'
        : (isCorrupted
            ? 'This file is corrupted: Recovered 4 elementary video/image clusters from raw unallocated sectors (NALU 00 00 00 01 carved).'
            : 'Bitstream container intact. Zero sector bad blocks detected. Stream is 100% healthy.')
    };

    // Pillar 2: AI Detection
    const detections = isImage ? [
      { detection_id: 'DET-UNI-001', timestamp_sec: 0.0, timestamp_str: 'Still Photo', detection_type: 'Person', label: 'Person: Suspect in Perimeter', confidence: 0.96, bbox_x: 0.28, bbox_y: 0.22, bbox_w: 0.24, bbox_h: 0.55 },
      { detection_id: 'DET-UNI-002', timestamp_sec: 0.0, timestamp_str: 'Still Photo', detection_type: 'Object', label: 'Object / Thing: Duffle Bag', confidence: 0.91, bbox_x: 0.52, bbox_y: 0.52, bbox_w: 0.16, bbox_h: 0.19 },
      { detection_id: 'DET-UNI-003', timestamp_sec: 0.0, timestamp_str: 'Still Photo', detection_type: 'Face', label: 'Face: Facial Landmark Region', confidence: 0.89, bbox_x: 0.35, bbox_y: 0.26, bbox_w: 0.10, bbox_h: 0.13 }
    ] : [
      { detection_id: 'DET-UNI-001', timestamp_sec: 2.1, timestamp_str: '00:02.1', detection_type: 'Person', label: 'Person: Intruder in Restricted Zone', confidence: 0.95, bbox_x: 0.24, bbox_y: 0.20, bbox_w: 0.22, bbox_h: 0.56 },
      { detection_id: 'DET-UNI-002', timestamp_sec: 4.8, timestamp_str: '00:04.8', detection_type: 'Vehicle', label: 'Vehicle: White SUV (Plate: DL-8C-9021)', confidence: 0.92, bbox_x: 0.50, bbox_y: 0.38, bbox_w: 0.38, bbox_h: 0.32 },
      { detection_id: 'DET-UNI-003', timestamp_sec: 7.4, timestamp_str: '00:07.4', detection_type: 'Object', label: 'Object / Weapon: Metallic Implement', confidence: 0.88, bbox_x: 0.38, bbox_y: 0.50, bbox_w: 0.14, bbox_h: 0.16 },
      { detection_id: 'DET-UNI-004', timestamp_sec: 11.2, timestamp_str: '00:11.2', detection_type: 'Motion', label: 'Motion: Perimeter Gate Breach Vector', confidence: 0.94, bbox_x: 0.10, bbox_y: 0.15, bbox_w: 0.40, bbox_h: 0.65 }
    ];

    const detectionPillar = {
      detections_count: isFatalCorrupt ? 0 : detections.length,
      categories_found: isFatalCorrupt ? [] : Array.from(new Set(detections.map(d => d.detection_type))),
      detections: isFatalCorrupt ? [] : detections,
      summary: isFatalCorrupt
        ? 'No forensic targets detectable due to severe bitstream damage.'
        : `Identified ${detections.length} forensic targets across ${Array.from(new Set(detections.map(d => d.detection_type))).join(', ')} categories.`
    };

    // Pillar 3: Timeline
    const timelineEvents = isImage ? [
      { event_id: 'EVT-001', time_offset_sec: 0.0, osd_timestamp: '2026-08-22 14:15:00', normalized_timestamp: '2026-08-22 14:15:00 UTC', camera_name: 'EXIF Sensor Baseline', event_type: 'Still Snapshot', description: 'Raw pixel matrix acquired with authenticated EXIF timestamp.' }
    ] : [
      { event_id: 'EVT-001', time_offset_sec: 0.0, osd_timestamp: '22:14:10.000', normalized_timestamp: '22:14:10.000 UTC', camera_name: 'CCTV Channel 01', event_type: 'Stream Ingest Start', description: 'Continuous surveillance stream initiation.' },
      { event_id: 'EVT-002', time_offset_sec: 4.8, osd_timestamp: '22:14:14.800', normalized_timestamp: '22:14:14.800 UTC', camera_name: 'CCTV Channel 01', event_type: 'Vehicle Arrival Event', description: 'Vehicle detected entering secondary perimeter corridor.' },
      { event_id: 'EVT-003', time_offset_sec: 11.2, osd_timestamp: '22:14:21.200', normalized_timestamp: '22:14:21.200 UTC', camera_name: 'CCTV Channel 01', event_type: 'Perimeter Motion Event', description: 'Motion spike registered at gate latch zone.' },
      { event_id: 'EVT-004', time_offset_sec: 15.0, osd_timestamp: '22:14:25.000', normalized_timestamp: '22:14:25.000 UTC', camera_name: 'CCTV Channel 01', event_type: 'Stream Segment End', description: 'End of segment. Cryptographic hash recorded to audit trail.' }
    ];

    const timelinePillar = {
      duration_seconds: isImage ? 0.0 : (isFatalCorrupt ? 0.0 : 15.0),
      fps: isImage ? 0.0 : (isFatalCorrupt ? 0.0 : 25.0),
      events_count: isFatalCorrupt ? 0 : timelineEvents.length,
      timeline_events: isFatalCorrupt ? [] : timelineEvents,
      is_continuous: !isHeavyTamper
    };

    // Pillar 4: Tamper / Changes Detection
    const modificationsList = isHeavyTamper ? [
      { category: 'Frame Splicing / Deletion', severity: 'CRITICAL', title: 'Temporal Scene Cut at T: 00:04.2s - 00:06.5s', details: 'Visual motion flux jump detected across keyframes. 58 frames deleted or spliced.', timestamps_sec: [4.2, 6.5] },
      { category: 'Transcoder Software Injected', severity: 'CRITICAL', title: 'Non-Camera Encoder: Lavf (FFmpeg)', details: 'Found encoder marker Lavf in MP4 moov atom. Third-party editor export confirmed.' },
      { category: 'GOP Cadence Discontinuity', severity: 'HIGH', title: 'Broken I-Frame Cadence at Offset 0x01E400', details: 'Surveillance DVR 25fps closed GOP interval violated.' },
      { category: 'Timeline Alteration', severity: 'CRITICAL', title: 'OSD Clock Desynchronization', details: 'OSD burned-in timestamp skips 2.3 seconds between consecutive frames.' }
    ] : (isModified ? (isImage ? [
      { category: 'Software Editor Signature', severity: 'CRITICAL', title: 'Commercial Editor: Adobe Photoshop 2024', details: 'Binary headers contain Adobe Photoshop software signature. CCTV camera firmware does not inject desktop editor tags.' },
      { category: 'Pixel Error Level Analysis (ELA)', severity: 'HIGH', title: 'Compression Discontinuity (Spliced Region)', details: 'High-frequency ELA variance (18.4%) localized in quadrant [X: 0.34, Y: 0.22, W: 0.16, H: 0.12]. Pasted element confirmed.', bounding_box: [0.34, 0.22, 0.16, 0.12] },
      { category: 'Quantization Table Discrepancy', severity: 'MEDIUM', title: 'Non-Hardware DQT Table Mismatch', details: 'Luminance quantization does not match hardware sensor profiles, indicating secondary re-compression.' }
    ] : [
      { category: 'Transcoder Software Injected', severity: 'CRITICAL', title: 'Non-Camera Encoder: Lavf (FFmpeg)', details: 'Found encoder marker Lavf in MP4 moov container atom.' },
      { category: 'Quantization Variance', severity: 'MEDIUM', title: 'Secondary Encoding Re-compression', details: 'Bitrate variability exceeds camera ASIC baseline.' }
    ]) : []);

    const tamperPillar = {
      has_changed: hasChanges,
      tamper_detected: hasChanges,
      has_heavy_changes: hasHeavyChanges,
      has_serious_issues: hasSeriousIssues,
      is_accurate_for_case: isAccurateForCase,
      case_verdict_category: caseVerdictCategory,
      case_accuracy_label: caseAccuracyLabel,
      admissibility_status: admissibilityStatus,
      verdict: hasChanges ? 'MODIFICATION_DETECTED' : 'AUTHENTIC_ORIGINAL',
      verdict_label: verdictLabel,
      verdict_headline: verdictHeadline,
      summary: hasHeavyChanges
        ? 'HEAVY CHANGES DETECTED: This file contains serious tampering issues (spliced frames, Lavf encoder, timeline jump). THIS FILE IS NOT ACCURATE FOR THE CASE.'
        : (hasChanges
            ? 'CHANGES DETECTED: This file is modified. External editor signatures or compression discrepancies detected.'
            : (isCorrupted
                ? 'CORRUPTION DETECTED: Bitstream corrupted with sector bad blocks. Recovered fragments contain serious integrity defects.'
                : 'VERIFIED AUTHENTIC: This file has NO changes. Dual SHA-256 and MD5 hashes match original baseline with 0 modifications.')),
      changes_count: modificationsList.length,
      changes_detected: modificationsList,
      ela_heatmap: {
        localized_bounding_box: (isModified || isHeavyTamper) && isImage ? [0.34, 0.22, 0.16, 0.12] : null,
        compression_variance_pct: hasHeavyChanges ? 28.5 : (hasChanges ? 18.4 : 0.8)
      }
    };

    return {
      status: 'SUCCESS',
      filename: fileName,
      file_size: file?.size || 3412000,
      media_classification: isImage ? 'Picture / Photo' : (isCorrupted ? 'Corrupted Stream / Disk Dump' : 'Surveillance Video'),
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      md5: 'a7c2e81902bf89c1d04e5a9102c3d4e5',
      is_corrupted: isCorrupted,
      is_severely_corrupted: isFatalCorrupt,
      has_changes: hasChanges,
      has_heavy_changes: hasHeavyChanges,
      has_serious_issues: hasSeriousIssues,
      is_accurate_for_case: isAccurateForCase,
      case_verdict_category: caseVerdictCategory,
      verdict_headline: verdictHeadline,
      verdict_label: verdictLabel,
      case_accuracy_label: caseAccuracyLabel,
      admissibility_status: admissibilityStatus,
      pillars: {
        recovery: recoveryPillar,
        detection: detectionPillar,
        timeline: timelinePillar,
        tamper: tamperPillar
      }
    };
  }

  // 10. Custody Blockchain Ledger & Simplified Audit Trail
  if (path === '/custody/audit-trail') {
    return mockAuditTrail;
  }

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

  // 11.5 Batch Ingest Demo Evidence & Cross-Segment Pipeline
  if (path === '/cases/batch-ingest-demo') {
    const payload = JSON.parse(options.body || '{}');
    const selectedCaseId = payload.case_id || caseId || 'CASE-2026-001';

    const demoItems = [
      {
        id: 'evd-demo-vid-1',
        evidence_id: 'EVD-DEMO-001',
        filename: 'demo_video_1_positive_entrance.mp4',
        camera_name: 'CCTV Channel 01 (Main Gate Entrance)',
        file_size: 4194304,
        mime_type: 'video/mp4',
        hash_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        hash_md5: 'a7c2e81902bf89c1d04e5a9102c3d4e5',
        baseline_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        baseline_md5: 'a7c2e81902bf89c1d04e5a9102c3d4e5',
        acquisition_timestamp: '2026-08-22T22:30:00Z',
        original_timestamp: '2026-08-22 22:14:10',
        normalized_timestamp: '2026-08-22 22:14:10 UTC',
        duration_seconds: 15.0,
        resolution: '1920x1080',
        fps: 25.0,
        codec: 'H.264 / AVC (High Profile)',
        vendor: 'Hikvision Digital Technology',
        status: 'Verified',
        is_read_only: true,
        case_id: selectedCaseId,
        tampered: false,
        verdict_positive: true,
        description: 'Authentic CCTV entrance stream — verified 0 cuts, dual hash match, positive case evidence.'
      },
      {
        id: 'evd-demo-vid-2',
        evidence_id: 'EVD-DEMO-002',
        filename: 'demo_video_2_positive_corridor.mp4',
        camera_name: 'CCTV Channel 02 (Ground Corridor)',
        file_size: 3874920,
        mime_type: 'video/mp4',
        hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        hash_md5: '8743b52063cd84097a65d1633f5c74f5',
        baseline_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        baseline_md5: '8743b52063cd84097a65d1633f5c74f5',
        acquisition_timestamp: '2026-08-22T22:35:00Z',
        original_timestamp: '2026-08-22 22:14:12',
        normalized_timestamp: '2026-08-22 22:14:12 UTC',
        duration_seconds: 14.8,
        resolution: '1920x1080',
        fps: 25.0,
        codec: 'H.264 / AVC (Main Profile)',
        vendor: 'Dahua Technology (DHAV)',
        status: 'Verified',
        is_read_only: true,
        case_id: selectedCaseId,
        tampered: false,
        verdict_positive: true,
        description: 'Authentic corridor surveillance stream — verified 0 cuts, positive case evidence.'
      },
      {
        id: 'evd-demo-pic-1',
        evidence_id: 'EVD-DEMO-003',
        filename: 'demo_pic_1_positive.jpg',
        camera_name: 'EXIF Sensor Baseline Snapshot',
        file_size: 1843200,
        mime_type: 'image/jpeg',
        hash_sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        hash_md5: 'c4ca4238a0b923820dcc509a6f75849b',
        baseline_sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        baseline_md5: 'c4ca4238a0b923820dcc509a6f75849b',
        acquisition_timestamp: '2026-08-22T22:40:00Z',
        original_timestamp: '2026-08-22 14:15:00',
        normalized_timestamp: '2026-08-22 14:15:00 UTC',
        duration_seconds: 0.0,
        resolution: '3840x2160',
        fps: 0.0,
        codec: 'JPEG / EXIF Baseline',
        vendor: 'Sony Security Sensor',
        status: 'Verified',
        is_read_only: true,
        case_id: selectedCaseId,
        tampered: false,
        verdict_positive: true,
        description: 'Demo Pic 1 (Positive): Authentic unaltered sensor capture. 0 changes detected, accurate for case.'
      },
      {
        id: 'evd-demo-pic-2',
        evidence_id: 'EVD-DEMO-004',
        filename: 'demo_pic_2_negative_photoshop.jpg',
        camera_name: 'Scene Still (Altered)',
        file_size: 2150400,
        mime_type: 'image/jpeg',
        hash_sha256: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
        hash_md5: 'c81e728d9d4c2f636f067f89cc14862c',
        baseline_sha256: '0000000000000000000000000000000000000000000000000000000000000000',
        baseline_md5: '00000000000000000000000000000000',
        acquisition_timestamp: '2026-08-22T22:45:00Z',
        original_timestamp: '2026-08-22 14:15:00',
        normalized_timestamp: '2026-08-22 14:15:00 UTC',
        duration_seconds: 0.0,
        resolution: '3840x2160',
        fps: 0.0,
        codec: 'JPEG (Photoshop CC 2024)',
        vendor: 'Adobe Photoshop Injection',
        status: 'Tampered',
        is_read_only: true,
        case_id: selectedCaseId,
        tampered: true,
        verdict_positive: false,
        description: 'Demo Pic 2 (Negative): Adobe Photoshop edited. ELA localized variance 18.4%. Not accurate for case.'
      },
      {
        id: 'evd-demo-corrupt',
        evidence_id: 'EVD-DEMO-005',
        filename: 'demo_corrupted_file_negative.dd',
        camera_name: 'Damaged DVR Hard Drive Dump',
        file_size: 5242880,
        mime_type: 'application/octet-stream',
        hash_sha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        hash_md5: 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
        baseline_sha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
        baseline_md5: 'eccbc87e4b5ce2fe28308fd9f2a7baf3',
        acquisition_timestamp: '2026-08-22T22:50:00Z',
        original_timestamp: '2026-08-22 22:10:00',
        normalized_timestamp: '2026-08-22 22:10:00 UTC',
        duration_seconds: 8.5,
        resolution: '1920x1080 (Fragmented)',
        fps: 25.0,
        codec: 'Raw Sectors / AVC Carved',
        vendor: 'Raw Disk Image (.dd)',
        status: 'Recovered',
        is_read_only: true,
        case_id: selectedCaseId,
        tampered: false,
        is_corrupted: true,
        verdict_positive: false,
        description: 'Corrupted File (Negative): Sector damage detected. Reconstructed 4 video clusters via NALU bitstream carving.'
      },
      {
        id: 'evd-demo-doc-1',
        evidence_id: 'EVD-DEMO-006',
        filename: 'case_seizure_memo_sec65b.pdf',
        camera_name: 'Investigative Police Seizure Memo',
        file_size: 412900,
        mime_type: 'application/pdf',
        hash_sha256: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
        hash_md5: 'a87ff679a2f3e71d9181a67b7542122c',
        baseline_sha256: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
        baseline_md5: 'a87ff679a2f3e71d9181a67b7542122c',
        acquisition_timestamp: '2026-08-22T23:00:00Z',
        original_timestamp: '2026-08-22 22:00:00',
        normalized_timestamp: '2026-08-22 22:00:00 UTC',
        duration_seconds: 0.0,
        resolution: 'Document',
        fps: 0.0,
        codec: 'PDF / Court Form 65B',
        vendor: 'Police Station Cyber Cell',
        status: 'Verified',
        is_read_only: true,
        case_id: selectedCaseId,
        tampered: false,
        verdict_positive: true,
        description: 'Official Court Seizure Memo & Section 65B Chain of Custody Declaration.'
      }
    ];

    // Filter out duplicates and add to liveEvidence
    for (const item of demoItems) {
      if (!liveEvidence.some(e => e.evidence_id === item.evidence_id)) {
        liveEvidence.push(item);
      }
    }

    // Seal in liveLedger
    liveLedger.push({
      block_height: liveLedger.length + 1,
      timestamp: new Date().toISOString(),
      action: 'BATCH_DEMO_EVIDENCE_INGESTION',
      performed_by: 'Inspector R. Verma (Cyber Lead)',
      evidence_id: 'BATCH-6-FILES',
      previous_hash: liveLedger[liveLedger.length - 1]?.current_hash || '0000000000000000000000000000000000000000000000000000000000000000',
      current_hash: '7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      details: 'Automated 6-file demo batch ingest across all 8 forensic platform segments.'
    });

    return {
      status: 'SUCCESS',
      ingested_count: demoItems.length,
      evidence_items: demoItems,
      segments_processed: [
        {
          segment_id: 'adapters',
          name: 'Device & Filesystem Adapters',
          status: 'COMPLETED',
          details: 'Identified Hikvision, Dahua DHAV, and RAW Sector formats. Hardware write-blocker verified.'
        },
        {
          segment_id: 'evidence',
          name: 'Forensic Acquisition & Hashes',
          status: 'COMPLETED',
          details: 'Computed SHA-256 + MD5 hashes for all 6 items. Hardware write-block seal applied (Read-Only 0444).'
        },
        {
          segment_id: 'player',
          name: 'Video Extraction & AI Detection',
          status: 'COMPLETED',
          details: 'YOLOv8 forensic model identified 9 targets (Suspect, White SUV, Weapon Implement, Gate Breach).'
        },
        {
          segment_id: 'recovery',
          name: 'Deleted Cluster Recovery',
          status: 'COMPLETED',
          details: 'Scanned 16,384 sectors. Reconstructed 4 fragmented NALU clusters from demo_corrupted_file_negative.dd.'
        },
        {
          segment_id: 'timeline',
          name: 'Multi-Camera Normalization',
          status: 'COMPLETED',
          details: 'Synchronized Entrance Ch-01 and Corridor Ch-02 clocks. Drift corrected to 0.00ms UTC offset.'
        },
        {
          segment_id: 'integrity',
          name: 'Tamper & Integrity Scan',
          status: 'COMPLETED',
          details: 'Analyzed 5 media items: 3 Positive Authentic, 1 Modified (Photoshop ELA 18.4%), 1 Corrupted (Carved).'
        },
        {
          segment_id: 'ledger',
          name: 'Blockchain Audit Ledger',
          status: 'COMPLETED',
          details: 'Minted Block #' + (liveLedger.length) + ' with SHA-256 chained hash. Immutable audit trail locked.'
        },
        {
          segment_id: 'reports',
          name: 'Court Reports & Sec 65B',
          status: 'COMPLETED',
          details: 'Section 65B Indian Evidence Act Forensic Certificate generated and cryptographically sealed.'
        }
      ]
    };
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
  } catch {
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
  ingestDemoEvidenceBatch: (payload) => request('/cases/batch-ingest-demo', { method: 'POST', body: JSON.stringify(payload || {}) }),

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
  identifyDevice: (payload) =>
    request('/devices/identify', { method: 'POST', body: JSON.stringify(payload || {}) }),

  // Carving / Recovery
  getRecoveryRecords: (caseId) => request(`/recovery${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
  scanRecovery: (evidenceId) => request(`/recovery/scan/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),
  carveFile: (formData) => request('/recovery/carve-file', { method: 'POST', body: formData }),

  // Timeline & Multi-Camera Correlation
  getTimelineEvents: (caseId) => request(`/timeline${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
  getMultiCameraCorrelations: (caseId) => request(`/timeline/correlations${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),

  // AI & Computer Vision
  getDetections: (evidenceId) => request(`/ai/detections${evidenceId ? `?evidence_id=${encodeURIComponent(evidenceId)}` : ''}`),
  analyzeEvidenceAI: (evidenceId) => request(`/ai/analyze/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),
  analyzeVideoFile: (formData) => request('/ai/analyze-video-file', { method: 'POST', body: formData }),
  searchAIEvents: (queryPayload) => request('/ai/search', { method: 'POST', body: JSON.stringify(queryPayload) }),

  // Accuracy & Validation Module
  getValidationMetrics: (caseId) => request(`/validation/metrics${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),

  // RTSP Live Stream Ingest
  ingestLiveStream: (payload) => request('/evidence/live-stream', { method: 'POST', body: JSON.stringify(payload) }),

  // Cryptographic Integrity & Tamper Testing
  verifyIntegrity: (evidenceId) => request(`/integrity/verify/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),
  simulateTamper: (evidenceId) => request(`/integrity/simulate-tamper/${encodeURIComponent(evidenceId)}`, { method: 'POST' }),
  analyzeMediaTamper: (formData) => request('/integrity/analyze-media', { method: 'POST', body: formData }),

  // Universal 4-in-1 Diagnostic (Recovery, Detection, Timeline, Tamper Changes)
  universalDiagnose: (formData) => request('/forensic/universal-diagnose', { method: 'POST', body: formData }),

  // Blockchain Audit Ledger & Simplified Custody Trail
  getCustodyLedger: (caseId) => request(`/custody/${encodeURIComponent(caseId)}`),
  getAuditTrail: (caseId) => request(`/custody/audit-trail${caseId ? `?case_id=${encodeURIComponent(caseId)}` : ''}`),
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
