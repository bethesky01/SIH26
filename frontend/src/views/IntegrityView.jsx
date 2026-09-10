import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  RefreshCw,
  Lock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';

export default function IntegrityView({ evidenceList, onRefresh }) {
  const [verifyingId, setVerifyingId] = useState(null);
  const [tamperingId, setTamperingId] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});
  const [banner, setBanner] = useState(null);

  const handleVerify = async (evidenceId) => {
    setVerifyingId(evidenceId);
    try {
      const result = await api.verifyIntegrity(evidenceId);
      setVerificationResults((prev) => ({ ...prev, [evidenceId]: result }));
      if (result.tamper_detected) {
        setBanner({
          type: 'danger',
          title: 'CRYPTOGRAPHIC TAMPER DETECTED!',
          message: `Evidence file ${evidenceId} failed hash verification! SHA-256 hash does not match baseline acquisition ledger.`,
        });
      } else {
        setBanner({
          type: 'success',
          title: 'INTEGRITY VERIFIED',
          message: `Evidence ${evidenceId} verified clean: SHA-256 and MD5 match baseline exactly. Zero bit changes.`,
        });
      }
      if (onRefresh) onRefresh();
    } catch (err) {
      setBanner({ type: 'danger', title: 'Verification Error', message: err.message });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSimulateTamper = async (evidenceId) => {
    if (!window.confirm('Simulate unauthorized evidence tampering by injecting a 1-byte alteration into the forensic working copy?')) {
      return;
    }
    setTamperingId(evidenceId);
    try {
      const res = await api.simulateTamper(evidenceId);
      // Immediately run verification to demonstrate detection to the user
      await handleVerify(evidenceId);
    } catch (err) {
      setBanner({ type: 'danger', title: 'Tamper Simulation Error', message: err.message });
    } finally {
      setTamperingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Cryptographic Integrity Engine & Tamper Detection Lab
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Complies with judicial admissibility standards (ISO/IEC 27037 & Section 65B Indian Evidence Act). Hashes are recalculated live from disk bytes and compared bit-for-bit against acquisition baselines.
            </p>
          </div>
          <div className="status-pill success">
            <ShieldCheck size={14} />
            <span>DUAL SHA-256 / MD5 LOCK</span>
          </div>
        </div>
      </div>

      {banner && (
        <div className={`alert-banner ${banner.type === 'danger' ? 'danger' : 'success'}`}>
          <div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              {banner.type === 'danger' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
              {banner.title}
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: 2 }}>{banner.message}</div>
          </div>
          <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => setBanner(null)}>
            ×
          </button>
        </div>
      )}

      {/* Evidence Integrity Audit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {evidenceList && evidenceList.length > 0 ? (
          evidenceList.map((ev) => {
            const isVerifying = verifyingId === ev.id;
            const isTampering = tamperingId === ev.id;
            const res = verificationResults[ev.id];

            return (
              <div
                key={ev.id}
                className="forensic-card"
                style={{
                  borderLeft: res?.tamper_detected
                    ? '4px solid var(--rose-tamper)'
                    : res?.is_verified
                    ? '4px solid var(--emerald-status)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff' }}>
                        {ev.filename}
                      </span>
                      <span className="hash-badge">{ev.evidence_id}</span>
                      {res ? (
                        res.tamper_detected ? (
                          <span className="status-pill danger">
                            <XCircle size={11} /> TAMPER DETECTED
                          </span>
                        ) : (
                          <span className="status-pill success">
                            <CheckCircle2 size={11} /> HASH VERIFIED 100%
                          </span>
                        )
                      ) : (
                        <span className="status-pill info">BASELINE SEALED</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Acquired: {ev.acquisition_timestamp || 'Initial Ingestion'} • {((ev.file_size || 0) / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleVerify(ev.id)}
                      disabled={isVerifying || isTampering}
                    >
                      <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
                      {isVerifying ? 'Hashing File...' : 'Recalculate & Verify'}
                    </button>

                    {/* Simulate Tampering Button */}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleSimulateTamper(ev.id)}
                      disabled={isVerifying || isTampering}
                      title="Demonstrate how court forensic tools detect byte alterations"
                    >
                      <Flame size={14} />
                      {isTampering ? 'Injecting...' : 'Simulate Tamper'}
                    </button>
                  </div>
                </div>

                {/* Hash Comparison Matrix */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 12,
                    marginTop: 16,
                    background: 'rgba(6, 10, 18, 0.6)',
                    padding: 14,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {/* SHA-256 Card */}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan-primary)', marginBottom: 4 }}>
                      SHA-256 CRYPTOGRAPHIC SIGNATURE
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BASELINE (Acquisition):</div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {ev.hash_sha256}
                    </div>

                    {res && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: res.tamper_detected ? 'var(--rose-tamper)' : 'var(--emerald-status)' }}>
                          CALCULATED NOW FROM DISK:
                        </div>
                        <div
                          className="font-mono"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: res.tamper_detected ? 'var(--rose-tamper)' : 'var(--emerald-status)',
                            wordBreak: 'break-all',
                          }}
                        >
                          {res.calculated_sha256}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MD5 Card */}
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>
                      MD5 CHECKSUM
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BASELINE (Acquisition):</div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {ev.hash_md5}
                    </div>

                    {res && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: res.tamper_detected ? 'var(--rose-tamper)' : 'var(--emerald-status)' }}>
                          CALCULATED NOW FROM DISK:
                        </div>
                        <div
                          className="font-mono"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: res.tamper_detected ? 'var(--rose-tamper)' : 'var(--emerald-status)',
                            wordBreak: 'break-all',
                          }}
                        >
                          {res.calculated_md5}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="forensic-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No evidence available to audit. Ingest evidence or load demo data.
          </div>
        )}
      </div>
    </div>
  );
}
