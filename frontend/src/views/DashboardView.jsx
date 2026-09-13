import React from 'react';
import {
  Video,
  Play,
  FileVideo,
  BrainCircuit,
  ShieldCheck,
  FileSearch,
  ArrowRight,
  FolderOpen,
  Clock,
  Blocks,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function DashboardView({
  stats,
  activeCase,
  evidenceList = [],
  onNavigate,
  onInspectEvidence,
}) {
  const isCompromised = stats?.integrity_status === 'COMPROMISED';
  const totalClips = evidenceList?.length || stats?.evidence_count || 0;
  const totalDetections = stats?.detections_count || stats?.total_detections || 0;
  const totalRecovered = stats?.recovery_records_count || stats?.total_recovered || 0;

  // 4 Simple, intuitive core metrics
  const simpleMetrics = [
    {
      id: 'evidence',
      title: 'Evidence Videos',
      value: totalClips,
      sub: `${totalClips} CCTV ${totalClips === 1 ? 'clip' : 'clips'} loaded`,
      icon: Video,
      color: '#00e5ff',
      bgColor: 'rgba(0, 229, 255, 0.1)',
      target: 'evidence',
    },
    {
      id: 'player',
      title: 'AI Detections',
      value: totalDetections,
      sub: 'Persons & vehicles tracked',
      icon: BrainCircuit,
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.1)',
      target: 'player',
    },
    {
      id: 'recovery',
      title: 'Recovered Clips',
      value: totalRecovered,
      sub: 'Restored deleted segments',
      icon: FileSearch,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      target: 'recovery',
    },
    {
      id: 'integrity',
      title: 'Tamper Status',
      value: isCompromised ? 'Tampered' : '100% Verified',
      sub: isCompromised ? 'Integrity alert detected' : 'Zero alterations detected',
      icon: isCompromised ? AlertTriangle : ShieldCheck,
      color: isCompromised ? '#ef4444' : '#10b981',
      bgColor: isCompromised ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      target: 'integrity',
    },
  ];

  // 3-step simple workflow guide
  const workflowSteps = [
    {
      step: '1',
      title: 'Review Evidence Clips',
      desc: 'Check acquired video footage, camera angles, and write-protected hashes.',
      action: 'View Clips',
      target: 'evidence',
      color: '#00e5ff',
    },
    {
      step: '2',
      title: 'Inspect AI & Timeline',
      desc: 'Watch synchronized footage with real-time suspect, vehicle, and face detection.',
      action: 'Open Player',
      target: 'player',
      color: '#38bdf8',
    },
    {
      step: '3',
      title: 'Verify & Export Report',
      desc: 'Verify chain of custody integrity and download an official court-ready report.',
      action: 'Get Report',
      target: 'reports',
      color: '#10b981',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1300, margin: '0 auto', width: '100%' }}>
      {/* 1. Case Overview Card (Clean, Human-Readable) */}
      <div
        className="forensic-card"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 22, 42, 0.95) 0%, rgba(8, 13, 25, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className="hash-badge" style={{ fontSize: '0.85rem', fontWeight: 600, padding: '4px 10px' }}>
                {activeCase?.case_id || 'CASE-2026-001'}
              </span>
              <span className={`status-pill ${activeCase?.priority === 'Critical' || activeCase?.priority === 'High' ? 'danger' : 'info'}`}>
                {activeCase?.priority || 'High'} Priority
              </span>
              <span className="status-pill success">
                <CheckCircle2 size={13} />
                {activeCase?.status || 'Active Investigation'}
              </span>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.01em' }}>
              {activeCase?.name || 'CCTV Forensic Examination'}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, maxWidth: 780 }}>
              {activeCase?.description || 'Investigating security incident footage, synchronized multi-camera timeline, and chain of custody.'}
            </p>
          </div>

          {/* Direct Primary Action Buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.9rem', gap: 8, boxShadow: '0 4px 16px rgba(0, 229, 255, 0.25)' }}
              onClick={() => onNavigate('player')}
            >
              <Play size={16} fill="currentColor" />
              Watch Footage & AI
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.9rem', gap: 8 }}
              onClick={() => onNavigate('reports')}
            >
              <FileText size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Clean Metadata Details Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginTop: 20,
            paddingTop: 18,
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: 'var(--text-muted)' }}><Building2 size={18} /></div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agency</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeCase?.organization || 'State Forensic Science Lab'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: 'var(--cyan-primary)' }}><User size={18} /></div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investigator</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
                {activeCase?.investigator_name || 'Insp. R. Verma'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: 'var(--text-muted)' }}><MapPin size={18} /></div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeCase?.location || 'Central Facility Node'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: 'var(--text-muted)' }}><Calendar size={18} /></div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Incident Date</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {activeCase?.incident_date || '2026-08-22 22:15:00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Clear, Understandable Metric Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Investigation Summary
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any metric to view details
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {simpleMetrics.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="forensic-card"
                style={{
                  cursor: 'pointer',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
                onClick={() => onNavigate(card.target)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {card.title}
                  </span>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {card.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Simple 3-Step Guided Workflow */}
      <div className="forensic-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} /> How to Investigate This Case (3 Easy Steps)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              A straightforward process to examine video evidence and produce court-admissible results.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {workflowSteps.map((step) => (
            <div
              key={step.step}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `${step.color}22`,
                    color: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {step.desc}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-start', fontSize: '0.78rem', padding: '6px 12px', gap: 6 }}
                onClick={() => onNavigate(step.target)}
              >
                {step.action} <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Case Video Footage Showcase (Direct, Visual, No Confusion) */}
      <div className="forensic-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileVideo size={18} color="var(--cyan-primary)" />
              Case Video Evidence
              <span className="nav-badge" style={{ marginLeft: 6 }}>
                {evidenceList.length}
              </span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Click any video to immediately launch the player with AI detection overlay and timeline controls.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
            onClick={() => onNavigate('evidence')}
          >
            <FolderOpen size={14} /> Manage All Files
          </button>
        </div>

        {evidenceList.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {evidenceList.map((ev) => (
              <div
                key={ev.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ev.camera_name || 'Surveillance Camera'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      File: {ev.filename}
                    </div>
                  </div>
                  <span className="hash-badge" style={{ fontSize: '0.72rem' }}>
                    {ev.vendor || 'Generic'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span>⏱ {ev.duration_seconds ? `${ev.duration_seconds}s` : '15s'}</span>
                  <span>📺 {ev.resolution || '1080p'}</span>
                  <span style={{ color: ev.tampered ? 'var(--rose-tamper)' : 'var(--emerald-status)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {ev.tampered ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                    {ev.tampered ? 'Tampered' : 'Verified'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {ev.original_timestamp || '2026-08-22 22:15:00'}
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', gap: 6 }}
                    onClick={() => onInspectEvidence ? onInspectEvidence(ev.id) : onNavigate('player')}
                  >
                    <Play size={12} fill="currentColor" /> Play & Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.88rem', marginBottom: 12 }}>No video files loaded in this case yet.</p>
            <button className="btn btn-secondary" onClick={() => onNavigate('evidence')}>
              Upload Evidence Video
            </button>
          </div>
        )}
      </div>

      {/* 5. Quick Tools & Action Shortcuts */}
      <div className="forensic-card" style={{ padding: '22px 24px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
          Quick Tools & Shortcuts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}
            onClick={() => onNavigate('evidence')}
          >
            <FolderOpen size={18} color="var(--cyan-primary)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Upload Video</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Add new surveillance clip</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}
            onClick={() => onNavigate('timeline')}
          >
            <Clock size={18} color="var(--amber-status)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Sync Cameras</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Multi-camera timeline view</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}
            onClick={() => onNavigate('integrity')}
          >
            <ShieldCheck size={18} color="var(--emerald-status)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Check Tampering</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cryptographic hash audit</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}
            onClick={() => onNavigate('ledger')}
          >
            <Blocks size={18} color="var(--purple-accent)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Audit History</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Chain of custody log</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
