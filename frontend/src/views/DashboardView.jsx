import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Cpu,
  Video,
  FileText,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  User,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

export default function DashboardView({
  stats,
  activeCase,
  evidenceList = [],
  onNavigate,
  onInspectEvidence,
}) {
  const isCompromised = stats?.integrity_status === 'COMPROMISED';
  const totalClips = evidenceList?.length || stats?.evidence_count || 0;
  const verifiedClips = stats?.verified_evidence ?? totalClips;
  const custodyBlocks = stats?.custody_blocks_count || 4;
  const timelineEvents = stats?.timeline_events_count || 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1320, margin: '0 auto', width: '100%' }}>
      
      {/* 1. Case Header & Overview Banner */}
      <div className="forensic-card" style={{ padding: '24px 28px', borderLeft: '4px solid var(--cyan-primary)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Badge variant="info">
                {activeCase?.case_id || 'CASE-2026-001'}
              </Badge>
              <Badge variant={isCompromised ? 'danger' : 'success'} icon={isCompromised ? ShieldAlert : ShieldCheck}>
                {isCompromised ? 'INTEGRITY ALERT' : 'SHA-256 VERIFIED'}
              </Badge>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ISO/IEC 27037 Standard
              </span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {activeCase?.name || 'Central Mall Grand Corridor Breach Investigation'}
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: 6, maxWidth: 820 }}>
              {activeCase?.description || 'Forensic acquisition, multi-camera clock synchronization, tamper detection, and Section 65B judicial evidence compilation.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('evidence')}
            >
              <HardDrive size={15} />
              <span>Manage Evidence</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('lab')}
            >
              <Sparkles size={15} />
              <span>Run Diagnostic Lab</span>
            </button>
          </div>
        </div>

        {/* Case Metadata Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={14} color="var(--cyan-primary)" />
            <span>Investigator: <strong style={{ color: 'var(--text-primary)' }}>{activeCase?.investigator_name || 'Insp. R. Verma'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={14} color="var(--cyan-primary)" />
            <span>Agency: <strong style={{ color: 'var(--text-primary)' }}>{activeCase?.organization || 'State Forensic Science Laboratory'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={14} color="var(--cyan-primary)" />
            <span>Incident Date: <strong style={{ color: 'var(--text-primary)' }}>{activeCase?.incident_date ? new Date(activeCase.incident_date).toLocaleDateString() : '2026-03-12'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <StatCard
          icon={HardDrive}
          label="Total Evidence Items"
          value={`${totalClips} Files`}
          subtext={`${verifiedClips} Cryptographically Verified`}
          status="info"
          onClick={() => onNavigate('evidence')}
        />
        <StatCard
          icon={isCompromised ? ShieldAlert : ShieldCheck}
          label="Integrity & Tamper Scan"
          value={isCompromised ? 'COMPROMISED' : '100% INTACT'}
          subtext={isCompromised ? '1 Alteration Detected' : 'Dual SHA-256 / MD5 Match'}
          status={isCompromised ? 'danger' : 'success'}
          onClick={() => onNavigate('lab')}
        />
        <StatCard
          icon={Video}
          label="Multi-Camera Streams"
          value={`${timelineEvents} Events`}
          subtext="Sub-second Drift Corrected"
          status="default"
          onClick={() => onNavigate('video')}
        />
        <StatCard
          icon={Layers}
          label="Chain of Custody"
          value={`${custodyBlocks} Blocks`}
          subtext="Immutable Blockchain Ledger"
          status="default"
          onClick={() => onNavigate('reports')}
        />
      </div>

      {/* 3. Main Operational Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
        
        {/* Left Card: Evidence Stream Preview */}
        <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HardDrive size={18} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Active Evidence Items</h3>
            </div>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              onClick={() => onNavigate('evidence')}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {evidenceList.length > 0 ? (
              evidenceList.slice(0, 4).map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(0, 229, 255, 0.08)',
                        border: '1px solid rgba(0, 229, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--cyan-primary)',
                        flexShrink: 0,
                      }}
                    >
                      {ev.media_type === 'IMAGE' ? <Sparkles size={16} /> : <Video size={16} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.filename}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                        <span>{ev.file_size_formatted || '4.2 MB'}</span>
                        <span>•</span>
                        <span>{ev.codec || 'H.264 / AVC'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge variant={ev.tampered ? 'danger' : 'success'}>
                      {ev.tampered ? 'ALTERED' : 'INTACT'}
                    </Badge>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      onClick={() => onInspectEvidence ? onInspectEvidence(ev.id) : onNavigate('video')}
                    >
                      Examine
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No evidence items attached to this case.
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Quick Actions & Forensic Modules */}
        <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={18} color="var(--cyan-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Forensic Actions</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div
              className="forensic-card"
              style={{ padding: 16, cursor: 'pointer', background: 'var(--bg-surface)' }}
              onClick={() => onNavigate('video')}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Video size={18} color="var(--cyan-primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Video Studio</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Frame-accurate player with multi-camera AI bounding boxes & object tracking.
              </p>
            </div>

            <div
              className="forensic-card"
              style={{ padding: 16, cursor: 'pointer', background: 'var(--bg-surface)' }}
              onClick={() => onNavigate('lab')}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ShieldAlert size={18} color="#f59e0b" />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Forensic Lab</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Deep sector video carving and Error Level Analysis (ELA) tamper heatmap.
              </p>
            </div>

            <div
              className="forensic-card"
              style={{ padding: 16, cursor: 'pointer', background: 'var(--bg-surface)' }}
              onClick={() => onNavigate('evidence')}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <HardDrive size={18} color="#34d399" />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Device Adapters</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Direct physical disk parsing for Hikvision HIK-FS, Dahua DHFS, and CP Plus.
              </p>
            </div>

            <div
              className="forensic-card"
              style={{ padding: 16, cursor: 'pointer', background: 'var(--bg-surface)' }}
              onClick={() => onNavigate('reports')}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <FileText size={18} color="var(--purple-accent)" />
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Court Reports</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Compile Indian Evidence Act Section 65B judicial certificate & audit trail.
              </p>
            </div>
          </div>

          {/* Legal Compliance Footer */}
          <div
            style={{
              marginTop: 'auto',
              padding: '12px 16px',
              background: 'rgba(0, 229, 255, 0.04)',
              border: '1px solid rgba(0, 229, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <CheckCircle2 size={18} color="var(--cyan-primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Compliant with <strong>ISO/IEC 27037</strong> standards and <strong>Section 65B Indian Evidence Act</strong>. Chain of custody is cryptographically sealed.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
