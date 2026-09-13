import React, { useState, useEffect } from 'react';
import {
  Blocks,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowDown,
  Info,
  Check,
  Table,
} from 'lucide-react';
import { api } from '../services/api';

export default function LedgerView({ activeCase }) {
  const [viewMode, setViewMode] = useState('trail'); // 'trail' (Simple Table) or 'blockchain' (Detailed Blocks)
  const [blocks, setBlocks] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const loadLedger = async (caseId) => {
    try {
      const [ledgerData, trailData] = await Promise.all([
        api.getCustodyLedger(caseId),
        api.getAuditTrail ? api.getAuditTrail(caseId) : Promise.resolve([]),
      ]);
      setBlocks(ledgerData || []);
      setAuditTrail(trailData || []);
      setVerificationResult(null);
    } catch (err) {
      console.error('Error loading ledger:', err);
    }
  };

  useEffect(() => {
    if (activeCase?.case_id) {
      loadLedger(activeCase.case_id);
    }
  }, [activeCase]);

  const handleVerifyChain = async () => {
    if (!activeCase?.case_id) return;
    setIsVerifying(true);
    try {
      const res = await api.verifyCustodyChain(activeCase.case_id);
      setVerificationResult(res);
    } catch (err) {
      setVerificationResult({ is_valid: false, message: err.message });
    } finally {
      setIsVerifying(false);
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
                MODULE 10
              </span>
              <span className="status-pill success">
                <ShieldCheck size={13} />
                TAMPER-EVIDENT CHAIN OF CUSTODY
              </span>
            </div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
              Chain of Custody & Forensic Audit Trail
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 840, lineHeight: 1.5 }}>
              Answers the foundational legal question for court admissibility: <strong>Who touched the evidence, when, and what did they do?</strong> Every physical acquisition, hash calculation, and analysis action is permanently sealed into an immutable record.
            </p>
          </div>

          {/* View Mode Toggle Switcher */}
          <div style={{ display: 'flex', gap: 6, background: 'rgba(6, 11, 22, 0.7)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              className={`btn ${viewMode === 'trail' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem', padding: '6px 14px', gap: 6 }}
              onClick={() => setViewMode('trail')}
            >
              <Table size={14} />
              Simple Audit Trail Table
            </button>
            <button
              className={`btn ${viewMode === 'blockchain' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem', padding: '6px 14px', gap: 6 }}
              onClick={() => setViewMode('blockchain')}
            >
              <Blocks size={14} />
              Blockchain Hash Ledger
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Progression Graphic: Evidence Life-Cycle */}
      <div
        className="forensic-card"
        style={{
          border: '1px solid var(--border-active)',
          background: 'linear-gradient(135deg, rgba(16, 26, 50, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)',
          padding: '20px 24px',
        }}
      >
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--cyan-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={14} /> THE EVIDENCE LIFE-CYCLE CUSTODY FLOW:
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto',
            fontSize: '0.78rem',
            paddingBottom: 4,
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap' }}>
            💾 Evidence Created
          </div>
          <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>&rarr;</span>
          <div style={{ background: 'rgba(0, 229, 255, 0.12)', color: 'var(--cyan-primary)', border: '1px solid rgba(0,229,255,0.3)', padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap', fontWeight: 600 }}>
            👮 Collected by Officer A (10:02)
          </div>
          <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>&rarr;</span>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-status)', border: '1px solid rgba(16,185,129,0.3)', padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap', fontWeight: 600 }}>
            🔒 Hash Sealed & Imaged (10:05 - 10:10)
          </div>
          <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>&rarr;</span>
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--amber-status)', border: '1px solid rgba(245,158,11,0.3)', padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap', fontWeight: 600 }}>
            🔬 Analyzed by Analyst B (11:15 - 11:40)
          </div>
          <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>&rarr;</span>
          <div style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', padding: '8px 12px', borderRadius: 6, whiteSpace: 'nowrap', fontWeight: 600 }}>
            📑 Certified Report Generated (12:20)
          </div>
        </div>
      </div>

      {/* 3A. Simple Audit Trail Table (Default View) */}
      {viewMode === 'trail' && (
        <div className="forensic-card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Investigative Custody Log ("Who, When, What")
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Chronological chain of custody audit records prepared for judicial scrutiny.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleVerifyChain}
              disabled={isVerifying || blocks.length === 0}
            >
              <ShieldCheck size={16} />
              {isVerifying ? 'Verifying Hashes...' : 'Verify Cryptographic Integrity'}
            </button>
          </div>

          {/* Verification Result Banner if run */}
          {verificationResult && (
            <div
              className={`alert-banner ${verificationResult.is_valid ? 'success' : 'danger'}`}
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginBottom: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                {verificationResult.is_valid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>
                  {verificationResult.is_valid ? 'CUSTODY CHAIN INTEGRITY MATHEMATICALLY VERIFIED' : 'CHAIN CORRUPTION DETECTED'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem' }}>{verificationResult.message}</div>
            </div>
          )}

          {/* Tabular View */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--cyan-primary)' }}>EVENT</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--cyan-primary)' }}>PERSON / ACTOR</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--cyan-primary)' }}>TIME</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--cyan-primary)' }}>ACTION / DETAILS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--cyan-primary)', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail && auditTrail.length > 0 ? (
                  auditTrail.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        background: idx % 2 === 0 ? 'rgba(6, 11, 22, 0.4)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap' }}>
                        {item.event}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.person}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.role}</div>
                      </td>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                        <span className="font-mono" style={{ color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: 4 }}>
                          {item.time}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, maxWidth: 440 }}>
                        {item.details}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span className="status-pill success" style={{ fontSize: '0.7rem' }}>
                          <Check size={12} /> SEALED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No custody events found. Load demo data to populate audit records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3B. Cryptographic Blockchain Explorer View */}
      {viewMode === 'blockchain' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="forensic-card" style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cyan-primary)', margin: 0 }}>
                Blockchain Cryptographic Block Chaining (SHA-256)
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Every block contains the cryptographic signature of the preceding block: <code>CurrentHash = SHA256(PreviousHash + Payload)</code>
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleVerifyChain}
              disabled={isVerifying || blocks.length === 0}
            >
              <ShieldCheck size={16} />
              {isVerifying ? 'Recalculating Block Hashes...' : 'Verify Entire Ledger Chain'}
            </button>
          </div>

          {/* Verification Result Banner */}
          {verificationResult && (
            <div
              className={`alert-banner ${verificationResult.is_valid ? 'success' : 'danger'}`}
              style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                {verificationResult.is_valid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span>
                  {verificationResult.is_valid ? 'LEDGER INTEGRITY MATHEMATICALLY VERIFIED' : 'LEDGER CORRUPTION DETECTED'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem' }}>{verificationResult.message}</div>
              {verificationResult.is_valid && (
                <div className="font-mono" style={{ fontSize: '0.74rem', opacity: 0.9 }}>
                  Total Blocks Audited: {verificationResult.total_blocks} • Genesis: {verificationResult.genesis_hash?.substring(0, 16)}... • Tip: {verificationResult.latest_hash?.substring(0, 16)}...
                </div>
              )}
            </div>
          )}

          {/* Blocks Feed */}
          {blocks && blocks.length > 0 ? (
            blocks.map((block, idx) => (
              <React.Fragment key={block.id || block.block_number}>
                <div
                  className="forensic-card"
                  style={{
                    background: 'rgba(12, 20, 36, 0.85)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: block.block_number === 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 229, 255, 0.12)',
                          color: block.block_number === 0 ? 'var(--amber-status)' : 'var(--cyan-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        #{block.block_number}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.94rem', color: '#ffffff' }}>
                            {block.action}
                          </span>
                          {block.block_number === 0 && (
                            <span className="status-pill warning" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                              GENESIS BLOCK
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Actor: {block.actor_name} ({block.actor_role}) • Event ID: {block.event_id}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(block.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 12 }}>
                    {block.description || 'Custody action sealed to case ledger.'}
                  </p>

                  {/* Hashes Chaining Panel */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 8,
                      background: 'rgba(6, 10, 18, 0.7)',
                      padding: 10,
                      borderRadius: 6,
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        PREVIOUS BLOCK HASH:
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        {block.previous_hash}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--cyan-primary)', fontWeight: 700 }}>
                        BLOCK SHA-256 HASH (SEAL):
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)', wordBreak: 'break-all', fontWeight: 600 }}>
                        {block.current_hash}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chaining connector icon between blocks */}
                {idx < blocks.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(9, 14, 26, 0.9)',
                        border: '1px solid var(--border-active)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--cyan-primary)',
                        zIndex: 2,
                      }}
                    >
                      <ArrowDown size={14} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="forensic-card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No chain of custody blocks registered for this case. Load demo data to view a full blockchain ledger.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
