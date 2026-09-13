import React from 'react';
import { Shield, RefreshCw, Database, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Header({
  cases,
  selectedCaseId,
  onSelectCase,
  onReloadDemo,
  isReloading,
  stats,
}) {
  const isCompromised = stats?.integrity_status === 'COMPROMISED';

  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-brand">
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <div className="brand-title">
              SABOOT NETRA
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              CCTV Evidence Platform
            </div>
          </div>
        </div>

        {/* Case Switcher */}
        <div className="case-selector">
          <Database size={15} color="var(--cyan-primary)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>CASE:</span>
          <select
            value={selectedCaseId || ''}
            onChange={(e) => onSelectCase(e.target.value)}
            disabled={isReloading}
            style={{ maxWidth: 260 }}
          >
            {cases && cases.length > 0 ? (
              cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_id} — {c.name.substring(0, 28)}...
                </option>
              ))
            ) : (
              <option value="">No Active Cases</option>
            )}
          </select>
        </div>
      </div>

      <div className="header-right">
        {/* Simple Live Integrity Status Indicator */}
        <div
          className={`status-pill ${isCompromised ? 'danger' : 'success'}`}
          title={isCompromised ? 'Integrity alert: Hash mismatch found!' : 'All evidence hashes are cryptographically verified and intact'}
        >
          {isCompromised ? (
            <AlertTriangle size={13} />
          ) : (
            <CheckCircle2 size={13} />
          )}
          <span>{isCompromised ? 'Tampering Alert' : 'Evidence Verified'}</span>
        </div>

        {/* Reload Demo Data Button */}
        <button
          className="btn btn-secondary"
          onClick={onReloadDemo}
          disabled={isReloading}
          title="Reset sample cases and CCTV evidence"
          style={{ fontSize: '0.82rem', padding: '7px 12px' }}
        >
          <RefreshCw size={13} className={isReloading ? 'animate-spin' : ''} />
          {isReloading ? 'Resetting...' : 'Reset Demo'}
        </button>

        {/* Investigator Persona Badge */}
        <div className="investigator-badge">
          <div className="avatar-circle">RV</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Insp. R. Verma
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--cyan-primary)' }}>
              Lead Investigator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
