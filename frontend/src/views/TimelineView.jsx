import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sliders,
  Camera,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';

export default function TimelineView({ activeCase, onInspectEvidence }) {
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOffset, setUpdatingOffset] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeCase]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cams, evts] = await Promise.all([
        api.getCameras(),
        api.getTimelineEvents(activeCase?.case_id),
      ]);
      setCameras(cams || []);
      setEvents(evts || []);
    } catch (err) {
      console.error('Error loading timeline data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOffsetChange = async (cameraId, newOffsetSeconds) => {
    setUpdatingOffset((prev) => ({ ...prev, [cameraId]: true }));
    try {
      const res = await api.updateCameraOffset(cameraId, parseInt(newOffsetSeconds, 10));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Multi-Camera Synchronized Timeline & Clock Drift Normalizer
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Surveillance DVR clocks frequently drift by minutes or hours. Adjusting camera clock offsets creates a single unified Master Incident Timeline without tampering with the original evidence files.
            </p>
          </div>
          <div className="status-pill info">
            <Clock size={12} />
            <span>CROSS-CAMERA RE-ALIGNMENT</span>
          </div>
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

      {/* Camera Clock Offset Adjuster Grid */}
      <div className="forensic-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sliders size={18} /> Camera Clock Drift Offsets
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {cameras && cameras.length > 0 ? (
            cameras.map((cam) => {
              const isUpdating = updatingOffset[cam.id];
              return (
                <div
                  key={cam.id}
                  style={{
                    background: 'rgba(12, 20, 36, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Camera size={16} color="var(--cyan-primary)" />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cam.camera_name}</span>
                    </div>
                    <span className="status-pill success">{cam.status || 'Active'}</span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Channel #{cam.channel_number} • {cam.resolution} • {cam.location || 'Facility'}
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Offset from True Time:</span>
                      <span className="font-mono" style={{ color: cam.clock_offset_seconds === 0 ? 'var(--text-muted)' : 'var(--amber-status)', fontWeight: 600 }}>
                        {cam.clock_offset_seconds > 0 ? `+${cam.clock_offset_seconds}s` : `${cam.clock_offset_seconds}s`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        defaultValue={cam.clock_offset_seconds}
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

      {/* Unified Master Incident Timeline */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
            Synchronized Master Incident Event Stream ({events?.length || 0})
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Chronologically ordered by Normalized Time
          </span>
        </div>

        {events && events.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map((evt, idx) => (
              <div
                key={evt.id || idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                  background: 'rgba(12, 20, 36, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Timestamps Column */}
                <div>
                  <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
                    {evt.normalized_timestamp}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    OSD: <span className="font-mono">{evt.original_timestamp}</span>
                  </div>
                </div>

                {/* Event Details */}
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
                    Confidence: {(evt.confidence * 100).toFixed(0)}% • Severity: {evt.severity}
                  </div>
                </div>

                {/* Action Column */}
                <div>
                  {evt.evidence_id && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => onInspectEvidence(evt.evidence_id)}
                    >
                      <Play size={12} /> Jump to Clip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No timeline events recorded yet. Load demo data or ingest evidence to populate the timeline.
          </div>
        )}
      </div>
    </div>
  );
}
