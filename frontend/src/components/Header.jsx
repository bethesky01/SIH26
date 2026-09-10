import React from 'react';
import { Shield, RefreshCw, UserCheck, AlertCircle, Database } from 'lucide-react';

export default function Header({
  cases,
  selectedCaseId,
  onSelectCase,
  onReloadDemo,
  isReloading,
  stats,
}) {
  return (
    <header className="top-header">
      <div className="header-left">
        <div className="header-brand">
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <div className="brand-title">
              FORENSIC-NVR <span className="brand-badge">ISO 27037</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Multi-Vendor DVR/NVR Evidence Platform
            </div>
          </div>
        </div>

        {/* Case Switcher */}
        <div className="case-selector">
          <Database size={16} color="var(--cyan-primary)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CASE:</span>
          <select
            value={selectedCaseId || ''}
            onChange={(e) => onSelectCase(e.target.value)}
            disabled={isReloading}
          >
            {cases && cases.length > 0 ? (
              cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_id} - {c.name.substring(0, 32)}...
                </option>
              ))
            ) : (
              <option value="">No Active Cases</option>
            )}
          </select>
        </div>
      </div>

      <div className="header-right">
        {/* Live Integrity Status Indicator */}
        <div
          className={`status-pill ${
            stats?.integrity_status === 'VERIFIED' ? 'success' : stats?.integrity_status === 'COMPROMISED' ? 'danger' : 'info'
          }`}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: stats?.integrity_status === 'VERIFIED' ? '#10b981' : stats?.integrity_status === 'COMPROMISED' ? '#ef4444' : '#00e5ff',
            }}
          />
          {stats?.integrity_status || 'SECURE LOCK'}
        </div>

        {/* Reload Demo Data Button */}
        <button
          className="btn btn-secondary"
          onClick={onReloadDemo}
          disabled={isReloading}
          title="Reset or Reload standard synthetic CCTV cases with realistic evidence"
        >
          <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
          {isReloading ? 'Loading Demo...' : 'Load Demo Data'}
        </button>

        {/* Investigator Persona Badge */}
        <div className="investigator-badge">
          <div className="avatar-circle">VS</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Insp. V. Singh
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--cyan-primary)' }}>
              Forensic Expert #CID-884
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
