import React, { useState, useEffect } from 'react';
import {
  Blocks,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowDown,
  User,
  Activity,
  Hash,
} from 'lucide-react';
import { api } from '../services/api';

export default function LedgerView({ activeCase }) {
  const [blocks, setBlocks] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (activeCase?.case_id) {
      loadLedger(activeCase.case_id);
    }
  }, [activeCase]);

  const loadLedger = async (caseId) => {
    try {
      const data = await api.getCustodyLedger(caseId);
      setBlocks(data || []);
      setVerificationResult(null);
    } catch (err) {
      console.error('Error loading ledger:', err);
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Tamper-Evident Chain of Custody (Cryptographic Blockchain Ledger)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Every forensic action, custody transfer, and analytical inference is cryptographically sealed into an immutable block where each block hash depends directly on the preceding block: <code>CurrentHash = SHA256(PreviousHash + Payload)</code>.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleVerifyChain}
            disabled={isVerifying || blocks.length === 0}
          >
            <ShieldCheck size={16} />
            {isVerifying ? 'Verifying Hashes...' : 'Verify Ledger Chain Integrity'}
          </button>
        </div>
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

      {/* Block Explorer Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
    </div>
  );
}
