import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sliders,
  Camera,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
  Share2,
} from 'lucide-react';
import { api } from '../services/api';

export default function TimelineView({ activeCase, onInspectEvidence }) {
  const [activeSubTab, setActiveSubTab] = useState('correlation'); // 'correlation' (Mod 7) or 'normalization' (Mod 6)
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('EVENT #1032');
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [_loading, setLoading] = useState(false);
  const [updatingOffset, setUpdatingOffset] = useState({});
  const [notification, setNotification] = useState(null);

  // Module 6 Interactive Demo State
  const [isNormalized, setIsNormalized] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cams, evts, corrs] = await Promise.all([
        api.getCameras(),
        api.getTimelineEvents(activeCase?.case_id),
        api.getMultiCameraCorrelations ? api.getMultiCameraCorrelations(activeCase?.case_id) : Promise.resolve([]),
      ]);
      setCameras(cams || []);
      setEvents(evts || []);
      if (corrs && corrs.length > 0) {
        setCorrelations(corrs);
        setSelectedIncidentId(corrs[0].incident_id);
      }
    } catch (err) {
      console.error('Error loading timeline data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCase]);

  const handleOffsetChange = async (cameraId, newOffsetSeconds) => {
    setUpdatingOffset((prev) => ({ ...prev, [cameraId]: true }));
    try {
      await api.updateCameraOffset(cameraId, parseInt(newOffsetSeconds, 10));
      setNotification({
        type: 'success',
        text: `Camera clock offset adjusted to ${newOffsetSeconds}s. Associated video timestamps normalized!`,
      });
      await loadData();
    } catch (err) {
      setNotification({ type: 'danger', text: `Failed to update offset: ${err.message}` });
    } finally {
      setUpdatingOffset((prev) => ({ ...prev, [cameraId]: false }));
    }
  };

  const formatOffset = (sec) => {
    if (sec === 0) return '±0s (Reference)';
    const sign = sec > 0 ? '+' : '-';
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    if (m > 0) {
      return `${sign}${m}m ${s}s (${sign}${abs}s)`;
    }
    return `${sign}${abs}s`;
  };

  const selectedIncident = correlations?.find((c) => c.incident_id === selectedIncidentId) || correlations?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1320, margin: '0 auto', width: '100%' }}>
      {/* Top Module Navigation Bar */}
      <div
        className="forensic-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          padding: '14px 20px',
          background: 'linear-gradient(135deg, rgba(13, 22, 42, 0.95) 0%, rgba(8, 13, 25, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'rgba(0, 229, 255, 0.12)',
              color: 'var(--cyan-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Share2 size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Multi-Camera Timeline & Activity Correlation
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Spatial & temporal handoff reconstruction across surveillance camera feeds
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(6, 11, 22, 0.7)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className={`btn ${activeSubTab === 'correlation' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '6px 14px', gap: 6 }}
            onClick={() => setActiveSubTab('correlation')}
          >
            <span className="hash-badge" style={{ padding: '1px 5px', fontSize: '0.66rem' }}>MOD 7</span>
            Multi-Camera Correlation
          </button>
          <button
            className={`btn ${activeSubTab === 'normalization' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.8rem', padding: '6px 14px', gap: 6 }}
            onClick={() => setActiveSubTab('normalization')}
          >
            <span className="hash-badge" style={{ padding: '1px 5px', fontSize: '0.66rem' }}>MOD 6</span>
            Clock Normalization & Skew
          </button>
        </div>
      </div>

      {notification && (
        <div className={`alert-banner ${notification.type === 'success' ? 'success' : 'danger'}`}>
          <span>{notification.text}</span>
          <button className="btn btn-ghost" style={{ padding: '2px 8px' }} onClick={() => setNotification(null)}>
            ×
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 7: MULTI-CAMERA EVENT CORRELATION                            */}
      {/* =================================================================== */}
      {activeSubTab === 'correlation' && (
        <>
          {/* Concept Explanation Card */}
          <div
            className="forensic-card"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 26, 50, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)',
              border: '1px solid var(--border-active)',
              padding: '22px 26px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="status-pill info" style={{ fontSize: '0.74rem' }}>
                    <Zap size={12} />
                    CORE FORENSIC INNOVATION
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Linking activity across multiple cameras using spatial and temporal relationships
                  </span>
                </div>
                <h2 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Why Examine Four Videos Separately When You Can Correlate an Incident Timeline?
                </h2>
              </div>
            </div>

            {/* Side-by-Side Comparison: Traditional vs Our Platform */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {/* Traditional Disconnected Examination */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: '#f87171' }}>
                    Traditional Method: 4 Disjointed Feeds
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                  Examiner opens Camera 1, Camera 2, Camera 5, and Camera 7 in separate standalone players. Because internal clocks drift, subject appears to enter room 4 minutes after leaving! Hours wasted scrubbing disconnected footage.
                </p>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace',
                  }}
                >
                  Cam 1 (10:31:02) ⤹ Cam 2 (09:57:41?) ⤹ Cam 5 (10:04:10?) ⤹ Cam 7 (10:35:42)
                </div>
              </div>

              {/* Our Automated Multi-Camera Incident Timeline */}
              <div
                style={{
                  background: 'rgba(0, 229, 255, 0.04)',
                  border: '1px solid rgba(0, 229, 255, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <CheckCircle2 size={16} color="var(--cyan-primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--cyan-primary)' }}>
                    Our Platform: Unified Incident Timeline (EVENT #1032)
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                  The engine models the physical facility layout (spatial topology) and applies calibrated clock deltas (&Delta;t). It automatically links detections into a continuous cross-camera subject journey.
                </p>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: '0.74rem',
                    color: '#10b981',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  10:31:02 Cam 1 &rarr; 10:31:17 Cam 2 &rarr; 10:32:01 Cam 5 &rarr; 10:35:42 Cam 7 [SYNCHRONIZED]
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Incident Trajectory Explorer */}
          {selectedIncident && (
            <div className="forensic-card" style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, var(--cyan-primary), #3b82f6)',
                        color: '#050b14',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        padding: '3px 10px',
                        borderRadius: 6,
                      }}
                    >
                      {selectedIncident.incident_id}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      {selectedIncident.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Target: <strong style={{ color: 'var(--cyan-primary)' }}>{selectedIncident.suspect_tag}</strong> • Total Cameras: {selectedIncident.total_cameras} • Time Window: {selectedIncident.start_time} - {selectedIncident.end_time} ({selectedIncident.duration})
                  </p>
                </div>

                {/* Incident Selector Switcher if multiple */}
                {correlations.length > 1 && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {correlations.map((inc) => (
                      <button
                        key={inc.incident_id}
                        className={`btn ${selectedIncidentId === inc.incident_id ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ fontSize: '0.76rem', padding: '6px 12px' }}
                        onClick={() => {
                          setSelectedIncidentId(inc.incident_id);
                          setSelectedStepIndex(0);
                        }}
                      >
                        {inc.incident_id}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cross-Camera Progression Graphic / Flow Pipeline */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${selectedIncident.steps.length}, 1fr)`,
                  gap: 12,
                  marginBottom: 20,
                  overflowX: 'auto',
                }}
              >
                {selectedIncident.steps.map((step, idx) => {
                  const isSelected = selectedStepIndex === idx;
                  return (
                    <div
                      key={step.step}
                      onClick={() => setSelectedStepIndex(idx)}
                      style={{
                        background: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'rgba(6, 11, 22, 0.65)',
                        border: isSelected ? '2px solid var(--cyan-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        padding: 14,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isSelected ? '0 0 15px rgba(0, 229, 255, 0.2)' : 'none',
                      }}
                    >
                      {/* Step Indicator Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: step.badge_color || 'var(--cyan-primary)',
                            color: '#050b14',
                          }}
                        >
                          STEP {step.step} OF {selectedIncident.steps.length}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                          {step.time}
                        </span>
                      </div>

                      {/* Camera Name */}
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Camera size={14} color="var(--cyan-primary)" />
                        {step.camera_name.split('(')[0]}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                        {step.zone}
                      </div>

                      {/* Action */}
                      <div style={{ background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4 }}>
                        {step.action}
                      </div>

                      {/* Meta Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>Confidence: {(step.confidence * 100).toFixed(0)}%</span>
                        <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>Offset: {step.osd_drift}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Step Deep Dive */}
              {selectedIncident.steps[selectedStepIndex] && (
                <div
                  style={{
                    background: 'rgba(6, 11, 22, 0.85)',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'rgba(0, 229, 255, 0.12)',
                        border: '2px solid var(--cyan-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: 'var(--cyan-primary)',
                      }}
                    >
                      #{selectedIncident.steps[selectedStepIndex].step}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981' }}>
                          {selectedIncident.steps[selectedStepIndex].time}
                        </span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                          {selectedIncident.steps[selectedStepIndex].camera_name}
                        </span>
                        <span className="status-pill success" style={{ fontSize: '0.68rem' }}>
                          AI CONFIDENCE: {(selectedIncident.steps[selectedStepIndex].confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {selectedIncident.steps[selectedStepIndex].action}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                      disabled={selectedStepIndex === 0}
                      onClick={() => setSelectedStepIndex((prev) => Math.max(0, prev - 1))}
                    >
                      Previous Step
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                      disabled={selectedStepIndex === selectedIncident.steps.length - 1}
                      onClick={() => setSelectedStepIndex((prev) => Math.min(selectedIncident.steps.length - 1, prev + 1))}
                    >
                      Next Step
                    </button>
                    {onInspectEvidence && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.78rem', gap: 6 }}
                        onClick={() => onInspectEvidence('9e3aa2a1-bfa9-4f58-809c-11d78b9eda79')}
                      >
                        <Play size={12} fill="currentColor" /> Jump to Video Clip
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Master Incident Event Feed */}
          <div className="forensic-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)', margin: 0 }}>
                  Chronological Unified Multi-Camera Stream ({events?.length || 0})
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  All disparate camera feeds consolidated into Master Incident Time
                </p>
              </div>
              <span className="hash-badge" style={{ fontSize: '0.74rem' }}>
                SPATIAL & TEMPORAL CORRELATION ACTIVE
              </span>
            </div>

            {events && events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {events.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '200px 1fr auto',
                      gap: 16,
                      alignItems: 'center',
                      background: 'rgba(6, 11, 22, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                    }}
                  >
                    <div>
                      <div className="font-mono" style={{ fontSize: '0.86rem', fontWeight: 700, color: '#10b981' }}>
                        {evt.normalized_timestamp}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        OSD Raw: <span className="font-mono">{evt.original_timestamp}</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="status-pill info" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          {evt.event_type}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                          {evt.description}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Severity: {evt.severity} • Confidence: {(evt.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div>
                      {evt.evidence_id && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.76rem', gap: 6 }}
                          onClick={() => onInspectEvidence(evt.evidence_id)}
                        >
                          <Play size={11} fill="currentColor" /> Jump to Clip
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No timeline events recorded yet. Load demo data to populate timeline.
              </div>
            )}
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* MODULE 6: TIMESTAMP NORMALIZATION & CLOCK SKEW CALIBRATION           */}
      {/* =================================================================== */}
      {activeSubTab === 'normalization' && (
        <>
          {/* Header Banner */}
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
                    MODULE 6
                  </span>
                  <span className="status-pill success">
                    <Clock size={13} />
                    TIMESTAMP NORMALIZATION & CLOCK SKEW SYNC
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                  Multi-Camera Timestamp Normalization
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 840, lineHeight: 1.5 }}>
                  Surveillance DVR internal clocks frequently drift by minutes or hours due to dead RTC batteries, power cuts, or manual error. Timestamp normalization aligns disparate recorded camera times to True Incident Time without altering original file bytes.
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
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>Non-Destructive Offset</div>
                  <div style={{ color: 'var(--text-muted)' }}>True Time = OSD Time + &Delta;t (0 bit alteration)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Demonstration */}
          <div
            className="forensic-card"
            style={{
              border: '1px solid var(--border-active)',
              background: 'linear-gradient(135deg, rgba(16, 26, 50, 0.95) 0%, rgba(8, 14, 28, 0.98) 100%)',
              padding: '22px 26px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="status-pill info" style={{ fontSize: '0.74rem' }}>
                    <Zap size={12} />
                    THE REAL-WORLD PROBLEM
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    3 cameras recording the exact same physical incident at disparate clock times
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Incident Case: Synchronizing Cameras A, B, and C
                </h3>
              </div>

              {/* Toggle Button */}
              <div style={{ display: 'flex', gap: 6, background: 'rgba(6, 11, 22, 0.7)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  className={`btn ${!isNormalized ? 'btn-danger' : 'btn-ghost'}`}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => setIsNormalized(false)}
                >
                  Raw Desynced OSD Clocks
                </button>
                <button
                  className={`btn ${isNormalized ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => setIsNormalized(true)}
                >
                  <CheckCircle2 size={13} /> Normalized True Time (10:00:05 UTC)
                </button>
              </div>
            </div>

            {/* 3 Cameras Grid Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {/* Camera A */}
              <div
                style={{
                  background: 'rgba(6, 11, 22, 0.7)',
                  border: `1px solid ${isNormalized ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--cyan-primary)' }}>
                    Camera A (Main Entrance Gate)
                  </span>
                  <span className="status-pill success" style={{ fontSize: '0.68rem' }}>MASTER REFERENCE</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Recorded OSD Clock: <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>10:00:05 UTC</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 6, marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isNormalized ? 'NORMALIZED TRUE TIME:' : 'EFFECTIVE TIMELINE DISPLAY:'}
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                    10:00:05 UTC
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Clock Skew: <span className="font-mono">{formatOffset(0)}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Accurate anchor camera aligned with atomic time reference.
                </div>
              </div>

              {/* Camera B */}
              <div
                style={{
                  background: 'rgba(6, 11, 22, 0.7)',
                  border: `1px solid ${isNormalized ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                    Camera B (Loading Dock 4)
                  </span>
                  <span className={`status-pill ${isNormalized ? 'success' : 'danger'}`} style={{ fontSize: '0.68rem' }}>
                    {isNormalized ? 'SYNCHRONIZED' : '-2m 24s BEHIND'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Recorded OSD Clock: <span className="font-mono" style={{ color: '#ef4444', fontWeight: 600 }}>09:57:41 UTC</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 6, marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isNormalized ? 'NORMALIZED TRUE TIME:' : 'EFFECTIVE TIMELINE DISPLAY:'}
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: isNormalized ? '#10b981' : '#ef4444' }}>
                    {isNormalized ? '10:00:05 UTC' : '09:57:41 UTC'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Clock Skew: <span className="font-mono">{isNormalized ? '+144s (+2m 24s)' : '-144s behind'}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: isNormalized ? 'var(--emerald-status)' : 'var(--text-muted)' }}>
                  {isNormalized
                    ? '✓ Normalized by adding +144 seconds (Δt) to match True Incident Time.'
                    : '⚠️ Without normalization, court defense argues event occurred 2m 24s earlier!'}
                </div>
              </div>

              {/* Camera C */}
              <div
                style={{
                  background: 'rgba(6, 11, 22, 0.7)',
                  border: `1px solid ${isNormalized ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                    Camera C (Perimeter Gate West)
                  </span>
                  <span className={`status-pill ${isNormalized ? 'success' : 'danger'}`} style={{ fontSize: '0.68rem' }}>
                    {isNormalized ? 'SYNCHRONIZED' : '+4m 05s AHEAD'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  Recorded OSD Clock: <span className="font-mono" style={{ color: '#f59e0b', fontWeight: 600 }}>10:04:10 UTC</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 6, marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isNormalized ? 'NORMALIZED TRUE TIME:' : 'EFFECTIVE TIMELINE DISPLAY:'}
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: isNormalized ? '#10b981' : '#f59e0b' }}>
                    10:00:05 UTC
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Clock Skew: <span className="font-mono">{isNormalized ? '-245s (-4m 05s)' : '+245s ahead'}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: isNormalized ? 'var(--emerald-status)' : 'var(--text-muted)' }}>
                  {isNormalized
                    ? '✓ Normalized by subtracting 245 seconds (Δt) to align with Camera A.'
                    : '⚠️ Without normalization, suspect appears at Gate C 4m AFTER leaving it!'}
                </div>
              </div>
            </div>
          </div>

          {/* The Golden Forensic Rule */}
          <div
            className="forensic-card"
            style={{
              background: 'rgba(0, 229, 255, 0.03)',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              padding: '20px 24px',
            }}
          >
            <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Info size={17} /> The Golden Forensic Rule: Never Alter Original Video Bytes
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              <div style={{ background: 'rgba(6, 11, 22, 0.6)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  1. Do We Rewrite the Video OSD?
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong>NO!</strong> Modifying burned-in video frames or re-encoding changes the raw SHA-256 hash, immediately rendering evidence inadmissible under ISO/IEC 27037.
                </div>
              </div>

              <div style={{ background: 'rgba(6, 11, 22, 0.6)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  2. How Does Normalization Work?
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Normalization is applied purely as a <strong>presentation offset matrix (&Delta;t)</strong> in software:
                  <div className="font-mono" style={{ color: 'var(--cyan-primary)', marginTop: 4 }}>
                    True Incident Time = Recorded OSD Time + &Delta;t
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(6, 11, 22, 0.6)', padding: 14, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  3. Court Evidence Report
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Judicial reports display both the <strong>raw recorded timestamp</strong> and the <strong>mathematical delta justification</strong> (e.g. synchronized physical flash, door strike, or NTP audit).
                </div>
              </div>
            </div>
          </div>

          {/* Active Case Camera Clock Skew Controls */}
          <div className="forensic-card" style={{ padding: '22px 24px' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sliders size={18} color="var(--cyan-primary)" />
                Active Case Camera Clock Drift Controls
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Calibrate individual camera offsets (&Delta;t) to align multi-camera footage across the incident timeline.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {cameras && cameras.length > 0 ? (
                cameras.map((cam) => {
                  const isUpdating = updatingOffset[cam.id];
                  return (
                    <div
                      key={cam.id}
                      style={{
                        background: 'rgba(6, 11, 22, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Camera size={16} color="var(--cyan-primary)" />
                          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>{cam.camera_name}</span>
                        </div>
                        <span className="status-pill info" style={{ fontSize: '0.68rem' }}>CH-{cam.channel_number || 1}</span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Location: {cam.location || 'Facility'} • {cam.resolution}
                      </div>

                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Offset (&Delta;t):</span>
                          <span className="font-mono" style={{ color: cam.clock_offset_seconds === 0 ? 'var(--emerald-status)' : 'var(--amber-status)', fontWeight: 600 }}>
                            {formatOffset(cam.clock_offset_seconds || 0)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type="number"
                            defaultValue={cam.clock_offset_seconds || 0}
                            id={`offset-input-${cam.id}`}
                            className="form-control font-mono"
                            style={{ padding: '4px 8px', fontSize: '0.8rem', width: 90 }}
                            disabled={isUpdating}
                          />
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                            disabled={isUpdating}
                            onClick={() => {
                              const input = document.getElementById(`offset-input-${cam.id}`);
                              if (input) handleOffsetChange(cam.id, input.value);
                            }}
                          >
                            {isUpdating ? 'Saving...' : 'Apply Offset'}
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                            disabled={isUpdating}
                            title="Reset to 0s"
                            onClick={() => handleOffsetChange(cam.id, 0)}
                          >
                            <RotateCcw size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No cameras registered in this case.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
