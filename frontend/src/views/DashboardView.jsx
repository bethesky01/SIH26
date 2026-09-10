import React from 'react';
import {
  FileVideo,
  Cpu,
  BrainCircuit,
  Blocks,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Camera,
  ArrowRight,
} from 'lucide-react';

export default function DashboardView({ stats, activeCase, onNavigate }) {
  const statCards = [
    {
      title: 'Acquired Evidence',
      value: stats?.evidence_count ?? 0,
      sub: 'Forensically Isolated',
      icon: FileVideo,
      color: 'var(--cyan-primary)',
      target: 'evidence',
    },
    {
      title: 'DVR/NVR Devices',
      value: stats?.devices_count ?? 0,
      sub: 'Multi-Vendor Ingested',
      icon: Cpu,
      color: 'var(--purple-accent)',
      target: 'adapters',
    },
    {
      title: 'AI Detections',
      value: stats?.detections_count ?? 0,
      sub: 'Persons, Vehicles, Faces',
      icon: BrainCircuit,
      color: '#38bdf8',
      target: 'player',
    },
    {
      title: 'Carved Fragments',
      value: stats?.recovery_records_count ?? 0,
      sub: 'Deleted Clips Recovered',
      icon: AlertTriangle,
      color: 'var(--amber-status)',
      target: 'recovery',
    },
    {
      title: 'Ledger Audit Blocks',
      value: stats?.custody_blocks_count ?? 0,
      sub: 'SHA-256 Chained',
      icon: Blocks,
      color: 'var(--emerald-status)',
      target: 'ledger',
    },
    {
      title: 'Integrity Verdict',
      value: stats?.integrity_status || 'VERIFIED',
      sub: 'Zero Bit Flips Detected',
      icon: ShieldCheck,
      color: stats?.integrity_status === 'COMPROMISED' ? 'var(--rose-tamper)' : 'var(--emerald-status)',
      target: 'integrity',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner / Case Overview Card */}
      <div className="forensic-card" style={{ background: 'linear-gradient(135deg, rgba(16, 26, 48, 0.9) 0%, rgba(9, 14, 26, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="hash-badge" style={{ fontSize: '0.82rem' }}>
                {activeCase?.case_id || 'CASE-2026-001'}
              </span>
              <span className={`status-pill ${activeCase?.priority === 'High' ? 'danger' : 'info'}`}>
                {activeCase?.priority || 'High'} Priority
              </span>
              <span className="status-pill success">{activeCase?.status || 'Active Investigation'}</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
              {activeCase?.name || 'Multi-Vendor CCTV Forensic Examination'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 850 }}>
              {activeCase?.description || 'Investigating unauthorized breach and timeline synchronization across multi-vendor surveillance nodes.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => onNavigate('player')}>
              Inspect Evidence <ArrowRight size={15} />
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('reports')}>
              Export Report
            </button>
          </div>
        </div>

        {/* Case Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ORGANIZATION / AGENCY</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeCase?.organization || 'State Forensic Science Laboratory'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LEAD INVESTIGATOR</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
              {activeCase?.investigator_name || 'Insp. Vikramaditya Singh'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>INCIDENT LOCATION</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeCase?.location || 'Central Facility Node'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>INCIDENT TIMESTAMP</div>
            <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {activeCase?.incident_date || '2026-09-10 22:30:00 UTC'}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="forensic-card"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate(card.target)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {card.title}
                </span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Launch & Workflow Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Workflow Guide */}
        <div className="forensic-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14, color: 'var(--cyan-primary)' }}>
            Surveillance Forensic Pipeline (ISO/IEC 27037)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 255, 0.15)',
                  color: 'var(--cyan-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Evidence Ingestion & Dual-Hashing</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Write-protection applied. SHA-256 and MD5 computed immediately before handling.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 255, 0.15)',
                  color: 'var(--cyan-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Camera Timestamp Normalization</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Align unsynced DVR clocks to True Incident Time without altering original file bytes.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 255, 0.15)',
                  color: 'var(--cyan-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Vision & Deleted Video Carving</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Run YOLO/OpenCV bounding box analysis and recover unallocated disk sectors.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald-status)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Immutable Ledger & Court Report</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  All analyst actions recorded in a hash-chained ledger and exported to judicial PDF.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="forensic-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14, color: 'var(--cyan-primary)' }}>
            Quick Action Workflows
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: 14 }}
              onClick={() => onNavigate('evidence')}
            >
              <FolderOpen size={18} color="var(--cyan-primary)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Acquire Clip</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Upload raw video</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: 14 }}
              onClick={() => onNavigate('integrity')}
            >
              <ShieldCheck size={18} color="var(--emerald-status)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Audit Hashes</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verify integrity</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: 14 }}
              onClick={() => onNavigate('timeline')}
            >
              <Camera size={18} color="var(--amber-status)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sync Cameras</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Offset timeline</div>
              </div>
            </button>

            <button
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: 14 }}
              onClick={() => onNavigate('ledger')}
            >
              <Blocks size={18} color="var(--purple-accent)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chain Ledger</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verify custody</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
