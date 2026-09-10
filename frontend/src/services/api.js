const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // ignore fallback to errorMsg
      }
      throw new Error(errorMsg);
    }

    // Return blob if response is binary/download
    const contentType = response.headers.get('content-type');
    if (contentType && (contentType.includes('application/pdf') || contentType.includes('application/octet-stream'))) {
      return response.blob();
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
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
