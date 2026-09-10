import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Brain,
  Search,
  Clock,
  ShieldCheck,
  Maximize,
  Sliders,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function VideoPlayerView({
  evidenceList,
  selectedEvidenceId,
  onSelectEvidence,
}) {
  const [currentEvidence, setCurrentEvidence] = useState(null);
  const [detections, setDetections] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load evidence info and detections when selection changes
  useEffect(() => {
    const ev = evidenceList?.find((e) => e.id === selectedEvidenceId) || evidenceList?.[0];
    if (ev) {
      setCurrentEvidence(ev);
      loadDetections(ev.id);
    }
  }, [selectedEvidenceId, evidenceList]);

  const loadDetections = async (evidenceId) => {
    try {
      const data = await api.getDetections(evidenceId);
      setDetections(data || []);
      setSearchResults(null);
    } catch (err) {
      console.error('Failed to load detections:', err);
    }
  };

  const handleRunAI = async () => {
    if (!currentEvidence) return;
    setIsAnalyzing(true);
    try {
      const results = await api.analyzeEvidenceAI(currentEvidence.id);
      setDetections(results || []);
    } catch (err) {
      alert(`AI analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.searchAIEvents({
        query: searchQuery,
        evidence_id: currentEvidence?.id,
      });
      setSearchResults(res?.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Video playback controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const stepFrame = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
  };

  const changeSpeed = (speed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const seekTo = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    if (!isPlaying) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Render bounding boxes on Canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !showBoundingBoxes) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find detections matching current video time (window of +/- 1.2s)
    const activeDetections = detections.filter(
      (d) => Math.abs(d.timestamp_sec - currentTime) <= 1.2
    );

    activeDetections.forEach((det) => {
      const x = det.bbox_x * canvas.width;
      const y = det.bbox_y * canvas.height;
      const w = det.bbox_w * canvas.width;
      const h = det.bbox_h * canvas.height;

      // Color coding by object class
      let strokeColor = '#00e5ff'; // Person
      if (det.label.toLowerCase().includes('vehicle') || det.label.toLowerCase().includes('car') || det.label.toLowerCase().includes('truck')) {
        strokeColor = '#f59e0b';
      } else if (det.label.toLowerCase().includes('face')) {
        strokeColor = '#10b981';
      } else if (det.label.toLowerCase().includes('motion')) {
        strokeColor = '#a855f7';
      }

      // Draw bounding box
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x, y, w, h);

      // Label background
      ctx.fillStyle = strokeColor;
      const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = '600 11px Inter, sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      ctx.fillRect(x, Math.max(0, y - 18), textWidth + 8, 18);

      // Label text
      ctx.fillStyle = '#050b14';
      ctx.fillText(labelText, x + 4, Math.max(12, y - 5));
    });
  }, [currentTime, detections, showBoundingBoxes]);

  const activeDetectionsList = searchResults !== null ? searchResults : detections;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 20, height: 'calc(100vh - 120px)' }}>
      {/* Left Column: Forensic Player + HUD */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        {/* Evidence Selector Bar */}
        <div className="forensic-card" style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>INSPECTING CLIP:</span>
              <select
                className="form-control font-mono"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '0.82rem' }}
                value={currentEvidence?.id || ''}
                onChange={(e) => {
                  const ev = evidenceList?.find((x) => x.id === e.target.value);
                  if (ev) {
                    setCurrentEvidence(ev);
                    if (onSelectEvidence) onSelectEvidence(ev.id);
                  }
                }}
              >
                {evidenceList?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.evidence_id} - {e.filename} ({e.vendor || 'CCTV'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="status-pill success">FORENSIC WORKING COPY</span>
              <span className="hash-badge" style={{ fontSize: '0.74rem' }}>
                SHA-256: {currentEvidence?.hash_sha256?.substring(0, 12)}...
              </span>
            </div>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div
          style={{
            position: 'relative',
            background: '#040711',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-active)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
          }}
        >
          {/* Dual Timestamp HUD Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              zIndex: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(9, 14, 26, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 12px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Clock size={13} color="var(--cyan-primary)" />
              <div style={{ fontSize: '0.74rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>CCTV OSD: </span>
                <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>
                  {currentEvidence?.original_timestamp || '2026-09-10 22:30:00'} + {currentTime.toFixed(1)}s
                </span>
              </div>
            </div>

            {currentEvidence?.normalized_timestamp && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <ShieldCheck size={13} color="var(--emerald-status)" />
                <div style={{ fontSize: '0.74rem' }}>
                  <span style={{ color: '#a7f3d0' }}>MASTER TIME: </span>
                  <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>
                    {currentEvidence.normalized_timestamp}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Real Video Element */}
          {currentEvidence ? (
            <video
              ref={videoRef}
              src={api.getStreamUrl(currentEvidence.id)}
              style={{ width: '100%', maxHeight: 460, objectFit: 'contain' }}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration);
              }}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No video selected</div>
          )}

          {/* Canvas for dynamic AI bounding boxes overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="forensic-card" style={{ padding: 14 }}>
          {/* Timeline Scrubber */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--cyan-primary)' }}>
              {currentTime.toFixed(1)}s
            </span>
            <input
              type="range"
              min="0"
              max={duration || 10}
              step="0.1"
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: 'var(--cyan-primary)',
                cursor: 'pointer',
              }}
            />
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {duration ? `${duration.toFixed(1)}s` : '0.0s'}
            </span>
          </div>

          {/* Control Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => stepFrame(-1)} title="Step -1 sec">
                <SkipBack size={15} />
              </button>
              <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={togglePlay}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button className="btn btn-secondary" style={{ padding: 8 }} onClick={() => stepFrame(1)} title="Step +1 sec">
                <SkipForward size={15} />
              </button>

              {/* Speed Multiplier */}
              <div style={{ display: 'flex', gap: 4, marginLeft: 10 }}>
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    className={`btn ${playbackSpeed === spd ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    onClick={() => changeSpeed(spd)}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showBoundingBoxes}
                  onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                />
                <span>AI Bounding Boxes</span>
              </label>

              <button
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={handleRunAI}
                disabled={isAnalyzing}
              >
                <Brain size={14} color="var(--cyan-primary)" className={isAnalyzing ? 'animate-spin' : ''} />
                {isAnalyzing ? 'Analyzing Frames...' : 'Run AI Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Detections & Search */}
      <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={18} /> AI Forensic Detections ({activeDetectionsList?.length || 0})
          </h3>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
            Analytical detection tags extracted via OpenCV frame differencing and neural feature matching.
          </p>
        </div>

        {/* Natural Language Search Box */}
        <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 34, fontSize: '0.82rem' }}
              placeholder="Search detections (e.g. Person, Vehicle)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              size={15}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
          </div>
        </form>

        {/* Detections List (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
          {activeDetectionsList && activeDetectionsList.length > 0 ? (
            activeDetectionsList.map((det) => (
              <div
                key={det.id}
                onClick={() => seekTo(det.timestamp_sec)}
                style={{
                  background: 'rgba(12, 20, 36, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--cyan-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#ffffff' }}>
                      {det.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--emerald-status)',
                        fontWeight: 600,
                      }}
                    >
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--cyan-primary)' }}>
                    T: {det.timestamp_sec.toFixed(2)}s • {det.timestamp_str || ''}
                  </div>
                </div>

                <div className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  Seek <Play size={10} style={{ marginLeft: 3 }} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No detections found. Click "Run AI Analysis" to scan frames.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
