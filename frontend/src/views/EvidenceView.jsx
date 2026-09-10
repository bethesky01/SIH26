import React, { useState } from 'react';
import {
  FileVideo,
  UploadCloud,
  CheckCircle2,
  Lock,
  Play,
  Brain,
  ShieldCheck,
  Search,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

export default function EvidenceView({
  evidenceList,
  activeCase,
  onRefresh,
  onInspectEvidence,
  onNavigate,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [vendorOverride, setVendorOverride] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [origTimestamp, setOrigTimestamp] = useState('2026-09-10 22:30:00');
  const [message, setMessage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a video file to acquire.');
      return;
    }
    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('case_id', activeCase?.case_id || 'CASE-2026-001');
    formData.append('original_timestamp', origTimestamp);
    if (vendorOverride) {
      formData.append('vendor_override', vendorOverride);
    }

    try {
      const res = await api.uploadEvidence(formData);
      setMessage({
        type: 'success',
        text: `Acquisition successful! Evidence ${res.evidence_id} ingested, read-only locked, and hashed.`,
      });
      setSelectedFile(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: `Acquisition failed: ${err.message}` });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Evidence Ingestion & Physical Media Acquisition
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Enforces ISO/IEC 27037: Bit-stream image ingestion, immediate dual cryptographic hashing, and automated forensic working copy isolation.
            </p>
          </div>
          <div className="status-pill success">
            <Lock size={12} />
            <span>WRITE-PROTECTION ACTIVE</span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert-banner ${message.type === 'success' ? 'success' : 'danger'}`}>
          <span>{message.text}</span>
          <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => setMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Ingestion Dropzone & Form */}
      <div className="forensic-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UploadCloud size={18} /> Acquire New DVR / NVR CCTV Footage
        </h3>

        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Video File / Stream Dump</label>
              <input
                type="file"
                className="form-control"
                accept="video/*,.dav,.mp4,.avi,.mkv,.h264,.raw"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                disabled={isUploading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vendor Format Parser</label>
              <select
                className="form-control"
                value={vendorOverride}
                onChange={(e) => setVendorOverride(e.target.value)}
                disabled={isUploading}
              >
                <option value="">Auto-Detect from Binary Header</option>
                <option value="Hikvision">Hikvision (DAV / MP4 / HikStream)</option>
                <option value="Dahua">Dahua (DHFS / DAV Format)</option>
                <option value="CP Plus">CP Plus (Orange Indexing Stream)</option>
                <option value="Matrix">Matrix (SATATYA NVR Stream)</option>
                <option value="Generic">Generic ISO-BMFF / AVI Container</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Original Recorded Timestamp (CCTV OSD)</label>
              <input
                type="text"
                className="form-control font-mono"
                value={origTimestamp}
                onChange={(e) => setOrigTimestamp(e.target.value)}
                placeholder="YYYY-MM-DD HH:MM:SS"
                disabled={isUploading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <UploadCloud size={16} className="animate-spin" /> Ingesting & Hashing...
                </>
              ) : (
                <>
                  <UploadCloud size={16} /> Acquire & Seal Evidence
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Evidence Repository Table */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
            Acquired Evidence Inventory ({evidenceList?.length || 0})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            All active media mounted read-only
          </span>
        </div>

        {evidenceList && evidenceList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {evidenceList.map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: 'rgba(12, 20, 36, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'rgba(0, 229, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--cyan-primary)',
                      }}
                    >
                      <FileVideo size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                          {ev.filename}
                        </span>
                        <span className="hash-badge">{ev.evidence_id}</span>
                        <span className="status-pill info">{ev.vendor || 'Generic'}</span>
                        <span className="status-pill success">
                          <CheckCircle2 size={11} /> {ev.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {((ev.file_size || 0) / (1024 * 1024)).toFixed(2)} MB • {ev.resolution || '1080p'} • {ev.fps || 25} FPS • Codec: {ev.codec || 'H.264'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => onInspectEvidence(ev.id)}
                    >
                      <Play size={13} /> View & AI Analysis
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => onNavigate('integrity')}
                    >
                      <ShieldCheck size={13} /> Audit Hash
                    </button>
                  </div>
                </div>

                {/* Cryptographic Hashes Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 10,
                    background: 'rgba(6, 10, 18, 0.6)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>SHA-256:</span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ev.hash_sha256}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>MD5:</span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: '#a78bfa', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {ev.hash_md5}
                    </span>
                  </div>
                </div>

                {/* Timestamps & Isolation Paths */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    Original CCTV Time:{' '}
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                      {ev.original_timestamp || 'N/A'}
                    </span>
                    {ev.normalized_timestamp && (
                      <span style={{ marginLeft: 10, color: 'var(--emerald-status)' }}>
                        Normalized: <span className="font-mono">{ev.normalized_timestamp}</span>
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={12} color="var(--emerald-status)" />
                    <span>Forensic Working Copy: Isolated from Raw Original</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <FileVideo size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>No evidence ingested for this case yet.</div>
            <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
              Use the upload box above or click "Load Demo Data" to load realistic evidence.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
