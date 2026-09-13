import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Check,
  AlertTriangle,
  HelpCircle,
  Info,
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
      if (result.tamper_detected || result.tampered) {
        setBanner({
          type: 'danger',
          title: 'CRYPTOGRAPHIC TAMPER DETECTED!',
          message: `Evidence file failed hash verification! SHA-256 does not match baseline acquisition ledger. ⚠ Evidence changed!`,
        });
      } else {
        setBanner({
          type: 'success',
          title: 'INTEGRITY VERIFIED (0 BIT ALTERATION)',
          message: `Evidence verified authentic: SHA-256 and MD5 match acquisition baseline bit-for-bit. ✓ Evidence unchanged!`,
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
      await api.simulateTamper(evidenceId);
      // Immediately run verification to demonstrate detection to the user
      await handleVerify(evidenceId);
    } catch (err) {
      setBanner({ type: 'danger', title: 'Tamper Simulation Error', message: err.message });
    } finally {
      setTamperingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1300, margin: '0 auto', width: '100%' }}>
      {/* 1. Header Banner */}
      <div
        className="forensic-card"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 22, 42, 0.95) 0%, rgba(8, 13, 25, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '22px 26px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="hash-badge" style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px' }}>
                MODULE 9
              </span>
              <span className="status-pill success">
                <ShieldCheck size={13} />
                CRYPTOGRAPHIC INTEGRITY & DUAL HASHING
              </span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
              Cryptographic Evidence Hashing & Verification
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 840, lineHeight: 1.5 }}>
              Complies with Section 65B of the Indian Evidence Act and ISO/IEC 27037 forensic guidelines. Recalculates cryptographic hashes live from disk bytes and compares them against sealed acquisition baselines.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
            }}
          >
            <ShieldCheck size={20} color="var(--cyan-primary)" />
            <div style={{ fontSize: '0.82rem' }}>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>NIST SP 800-86 Sealed</div>
              <div style={{ color: 'var(--text-muted)' }}>SHA-256 Primary • MD5 Legacy</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Graphic: How Hashing Works (Simple to Understand) */}
      <div
        className="forensic-card"
        style={{
          border: '1px solid var(--border-active)',
          background: 'linear-gradient(135deg, rgba(16, 26, 50, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)',
          padding: '22px 26px',
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="status-pill info" style={{ fontSize: '0.74rem' }}>
              <Info size={12} />
              THE CORE FORENSIC PRINCIPLE
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              How digital forensics mathematically proves evidence has never been tampered with
            </span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Visual Integrity Verification: Same Hash vs. Different Hash
          </h2>
        </div>

        {/* Visual Before & After Graphic */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Authentic Match Case */}
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--emerald-status)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} /> CASE 1: VERIFIED AUTHENTIC
              </span>
              <span className="status-pill success" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                ✓ EVIDENCE UNCHANGED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: '0.78rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ORIGINAL EVIDENCE AT ACQUISITION:</div>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>VIDEO.MP4 &rarr; SHA-256: 9f8a7c2e...</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--emerald-status)', fontWeight: 700 }}>
                &darr; Re-computed before court audit &darr;
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CURRENT EVIDENCE ON DISK:</div>
                <div style={{ color: '#10b981', fontWeight: 700 }}>VIDEO.MP4 &rarr; SHA-256: 9f8a7c2e...</div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: 'var(--emerald-status)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={14} /> Hashes match bit-for-bit: Evidence is identical and admissible in court.
            </div>
          </div>

          {/* Tampered Mismatch Case */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--rose-tamper)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={16} /> CASE 2: TAMPERING DETECTED
              </span>
              <span className="status-pill danger" style={{ fontSize: '0.68rem', fontWeight: 800 }}>
                ⚠ EVIDENCE CHANGED
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: '0.78rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ORIGINAL EVIDENCE AT ACQUISITION:</div>
                <div style={{ color: '#ffffff', fontWeight: 600 }}>VIDEO.MP4 &rarr; SHA-256: 9f8a7c2e...</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--rose-tamper)', fontWeight: 700 }}>
                &darr; 1 single byte modified on disk &darr;
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '8px 12px', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>CURRENT EVIDENCE ON DISK:</div>
                <div style={{ color: 'var(--rose-tamper)', fontWeight: 700 }}>VIDEO.MP4 &rarr; SHA-256: 3b14f8a0... (MISMATCH)</div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: 'var(--rose-tamper)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Avalanche effect alters entire hash: Cryptographic alarm sounds immediately!
            </div>
          </div>
        </div>

        {/* Technical Rationale: Why MD5 + SHA-256? */}
        <div
          style={{
            background: 'rgba(0, 229, 255, 0.04)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: 16,
            marginTop: 16,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--cyan-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HelpCircle size={15} /> Forensic Judge Q&A: Why Calculate Both MD5 and SHA-256?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: '#ffffff' }}>1. SHA-256 (Primary Integrity Seal):</strong>
              <p style={{ margin: '3px 0 0 0', lineHeight: 1.4 }}>
                Treated as the legally unassailable cryptographic hash. SHA-256 has 2^256 possible outputs, making intentional collisions mathematically impossible.
              </p>
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>2. MD5 (Legacy Compatibility):</strong>
              <p style={{ margin: '3px 0 0 0', lineHeight: 1.4 }}>
                Retained for backward-compatibility with traditional police evidence management systems (EnCase, FTK) and quick disk-indexing.
              </p>
            </div>
            <div>
              <strong style={{ color: '#ffffff' }}>3. NIST SP 800-86 Separate Storage:</strong>
              <p style={{ margin: '3px 0 0 0', lineHeight: 1.4 }}>
                NIST guidelines mandate that hashes must be generated immediately upon acquisition and stored separately in a secure ledger (Module 10).
              </p>
            </div>
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

      {/* 3. Evidence Integrity Audit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)', margin: 0 }}>
            Live Evidence Cryptographic Audit Cards ({evidenceList?.length || 0})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click "Recalculate & Verify" or "Simulate Tamper" to test hash comparison in real time
          </span>
        </div>

        {evidenceList && evidenceList.length > 0 ? (
          evidenceList.map((ev) => {
            const isVerifying = verifyingId === ev.id;
            const isTampering = tamperingId === ev.id;
            const res = verificationResults[ev.id];
            const isTampered = res?.tamper_detected || res?.tampered || ev.tampered;

            return (
              <div
                key={ev.id}
                className="forensic-card"
                style={{
                  borderLeft: isTampered
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
                        isTampered ? (
                          <span className="status-pill danger" style={{ fontWeight: 800 }}>
                            <XCircle size={11} /> ⚠ EVIDENCE CHANGED
                          </span>
                        ) : (
                          <span className="status-pill success" style={{ fontWeight: 800 }}>
                            <CheckCircle2 size={11} /> ✓ EVIDENCE UNCHANGED
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
                      title="Demonstrate how court forensic tools immediately detect 1-byte alterations"
                    >
                      <Flame size={14} />
                      {isTampering ? 'Injecting...' : 'Simulate Tamper (+1 Byte)'}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                        SHA-256 CRYPTOGRAPHIC SIGNATURE (NIST)
                      </span>
                      {res && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: isTampered ? 'var(--rose-tamper)' : 'var(--emerald-status)',
                          }}
                        >
                          {isTampered ? 'MISMATCH' : 'MATCH Bit-for-Bit'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BASELINE (Acquisition):</div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {ev.baseline_sha256 || ev.hash_sha256}
                    </div>

                    {res && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: isTampered ? 'var(--rose-tamper)' : 'var(--emerald-status)' }}>
                          CALCULATED NOW FROM DISK:
                        </div>
                        <div
                          className="font-mono"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: isTampered ? 'var(--rose-tamper)' : 'var(--emerald-status)',
                            wordBreak: 'break-all',
                          }}
                        >
                          {res.calculated_sha256 || res.current_sha256}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MD5 Card */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa' }}>
                        MD5 CHECKSUM (LEGACY COMPATIBILITY)
                      </span>
                      {res && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: isTampered ? 'var(--rose-tamper)' : 'var(--emerald-status)',
                          }}
                        >
                          {isTampered ? 'MISMATCH' : 'MATCH'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BASELINE (Acquisition):</div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {ev.baseline_md5 || ev.hash_md5}
                    </div>

                    {res && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: isTampered ? 'var(--rose-tamper)' : 'var(--emerald-status)' }}>
                          CALCULATED NOW FROM DISK:
                        </div>
                        <div
                          className="font-mono"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: isTampered ? 'var(--rose-tamper)' : 'var(--emerald-status)',
                            wordBreak: 'break-all',
                          }}
                        >
                          {res.calculated_md5 || res.current_md5}
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
