import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Cpu,
  RefreshCw,
  Binary,
} from 'lucide-react';
import { api } from '../services/api';

export default function RecoveryView({ evidenceList, activeCase }) {
  const [records, setRecords] = useState([]);
  const [scanningId, setScanningId] = useState(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadRecords();
    if (evidenceList && evidenceList.length > 0 && !selectedEvidenceId) {
      setSelectedEvidenceId(evidenceList[0].id);
    }
  }, [activeCase, evidenceList]);

  const loadRecords = async () => {
    try {
      const data = await api.getRecoveryRecords(activeCase?.case_id);
      setRecords(data || []);
    } catch (err) {
      console.error('Error loading recovery records:', err);
    }
  };

  const handleRunScan = async () => {
    if (!selectedEvidenceId) return;
    setScanningId(selectedEvidenceId);
    setStatusMessage(null);
    try {
      const newFragments = await api.scanRecovery(selectedEvidenceId);
      setStatusMessage({
        type: 'success',
        text: `Carving complete! Discovered ${newFragments.length} recoverable video fragments from unallocated clusters.`,
      });
      await loadRecords();
    } catch (err) {
      setStatusMessage({ type: 'danger', text: `Carving failed: ${err.message}` });
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Deleted Footage Carving & Damaged Sector Recovery
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Deep file-signature carving scanner inspecting raw cluster offsets for H.264 NALU start codes (<code>00 00 00 01</code>) and ISO-BMFF container atoms (<code>ftyp</code>, <code>moov</code>, <code>mdat</code>) across deleted/damaged sectors.
            </p>
          </div>
          <div className="status-pill warning">
            <Binary size={14} />
            <span>RAW CLUSTER CARVER</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`alert-banner ${statusMessage.type === 'success' ? 'success' : 'danger'}`}>
          <span>{statusMessage.text}</span>
          <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => setStatusMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Carver Scanner Trigger Box */}
      <div className="forensic-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSearch size={18} /> Run Deep Sector Carving on Disk Image / Video Dump
        </h3>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <select
              className="form-control font-mono"
              value={selectedEvidenceId}
              onChange={(e) => setSelectedEvidenceId(e.target.value)}
              disabled={scanningId !== null}
            >
              {evidenceList?.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.evidence_id} - {ev.filename} ({ev.vendor || 'CCTV Stream'})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRunScan}
            disabled={scanningId !== null || !selectedEvidenceId}
          >
            <RefreshCw size={15} className={scanningId ? 'animate-spin' : ''} />
            {scanningId ? 'Carving Disk Sectors...' : 'Scan & Carve Fragments'}
          </button>
        </div>
      </div>

      {/* Recovered Fragments Grid */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
            Recovered Fragment Catalog ({records?.length || 0})
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Validated against DVR header signatures
          </span>
        </div>

        {records && records.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {records.map((rec) => {
              const isRecovered = rec.recovery_status === 'Recovered';
              const isPartial = rec.recovery_status === 'Partially Recoverable';

              return (
                <div
                  key={rec.id || rec.fragment_id}
                  style={{
                    background: 'rgba(12, 20, 36, 0.75)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="hash-badge" style={{ fontSize: '0.78rem' }}>
                        {rec.fragment_id}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Offset: {rec.cluster_offset}
                      </span>
                    </div>

                    <span
                      className={`status-pill ${
                        isRecovered ? 'success' : isPartial ? 'warning' : 'danger'
                      }`}
                    >
                      {isRecovered ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                      {rec.recovery_status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {rec.details || 'H.264 stream carved from unallocated clusters.'}
                  </div>

                  {/* Hex Signature Preview */}
                  <div
                    style={{
                      background: 'rgba(6, 10, 18, 0.8)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                      HEX SIGNATURE:
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)' }}>
                      {rec.hex_signature}
                    </div>
                  </div>

                  {/* Metrics Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary)',
                      marginTop: 4,
                    }}
                  >
                    <div>
                      Duration:{' '}
                      <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>
                        {rec.estimated_duration_sec}s
                      </span>
                    </div>
                    <div>
                      Confidence:{' '}
                      <span
                        className="font-mono"
                        style={{
                          color: rec.confidence > 0.8 ? 'var(--emerald-status)' : 'var(--amber-status)',
                          fontWeight: 600,
                        }}
                      >
                        {(rec.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No carved fragments cataloged yet. Select a clip above and click "Scan & Carve Fragments".
          </div>
        )}
      </div>
    </div>
  );
}
