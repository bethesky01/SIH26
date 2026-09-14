import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  User,
  Car,
  Crosshair,
} from 'lucide-react';
import Badge from '../components/common/Badge';

export default function VideoStudioView({
  evidenceList = [],
  selectedEvidenceId,
  onSelectEvidence,
}) {
  const activeItem = evidenceList.find((e) => e.id === selectedEvidenceId) || evidenceList[0] || {
    id: 'ev-01',
    filename: 'camera_01_entrance_breach.mp4',
    camera_id: 'CAM-01 (Main Entrance)',
    file_size_formatted: '4.2 MB',
    codec: 'H.264 / AVC',
    tampered: false,
    sha256: '98abc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 45;
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [filterType, setFilterType] = useState('ALL');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  const canvasRef = useRef(null);

  // AI Detections Mock
  const detections = [
    { id: 1, type: 'PERSON', label: 'Suspect #1 (Hooded Jacket)', confidence: 0.94, timestamp: '00:08', x: 22, y: 28, w: 18, h: 48, icon: User },
    { id: 2, type: 'OBJECT', label: 'Metallic Crowbar Tool', confidence: 0.88, timestamp: '00:14', x: 38, y: 52, w: 12, h: 22, icon: Crosshair },
    { id: 3, type: 'VEHICLE', label: 'Dark Sedan (DL-08-AB-4921)', confidence: 0.91, timestamp: '00:22', x: 62, y: 35, w: 30, h: 40, icon: Car },
    { id: 4, type: 'PERSON', label: 'Accomplice #2', confidence: 0.89, timestamp: '00:31', x: 45, y: 25, w: 16, h: 50, icon: User },
  ];

  const filteredDetections = filterType === 'ALL'
    ? detections
    : detections.filter((d) => d.type === filterType);

  // Playback timer simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return +(prev + 0.2 * playbackSpeed).toFixed(1);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, playbackSpeed]);

  // Canvas drawing simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, width, height);

    // Draw CCTV camera grid & background scene
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // CCTV Simulated Horizon & Entrance
    ctx.fillStyle = '#0c1527';
    ctx.fillRect(40, 60, width - 80, height - 100);

    // CCTV Text Overlay (OSD)
    ctx.fillStyle = '#00e5ff';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillText(`CAM-01 [ENTRANCE NORTH] • ${new Date().toISOString().substring(0, 10)} 22:15:${String(Math.floor(currentTime)).padStart(2, '0')} UTC`, 50, 85);
    ctx.fillText(`CODEC: H.264 / AVC 1080p • 25.00 FPS • REC [LOCKED]`, 50, 105);

    // Draw AI Bounding Boxes
    if (showBoundingBoxes) {
      filteredDetections.forEach((det) => {
        const boxX = (det.x / 100) * width;
        const boxY = (det.y / 100) * height;
        const boxW = (det.w / 100) * width;
        const boxH = (det.h / 100) * height;

        ctx.strokeStyle = det.type === 'PERSON' ? '#00e5ff' : det.type === 'VEHICLE' ? '#34d399' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Label tag
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(boxX, boxY - 18, boxW, 18);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(`${det.label} (${Math.round(det.confidence * 100)}%)`, boxX + 4, boxY - 5);
      });
    }
  }, [currentTime, showBoundingBoxes, filterType, filteredDetections]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1320, margin: '0 auto', width: '100%' }}>
      
      {/* Studio Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Video Studio & AI Investigation
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Synchronized multi-camera CCTV inspection with AI multi-class object tracking and frame-accurate scrutiny.
          </p>
        </div>

        {/* Camera Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STREAM:</span>
          <select
            value={activeItem.id}
            onChange={(e) => onSelectEvidence(e.target.value)}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            {evidenceList.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.filename} ({ev.camera_id || 'Ch-01'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        
        {/* Left: Video Player & Controls */}
        <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Canvas Video Viewport */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              aspectRatio: '16/9',
            }}
          >
            <canvas
              ref={canvasRef}
              width={854}
              height={480}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/* Bounding box toggle badge */}
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.74rem', background: 'rgba(9, 14, 26, 0.8)' }}
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              >
                <Eye size={12} /> {showBoundingBoxes ? 'Hide AI Boxes' : 'Show AI Boxes'}
              </button>
            </div>
          </div>

          {/* Scrubber Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-primary)', width: 44 }}>
              00:{String(Math.floor(currentTime)).padStart(2, '0')}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: 44 }}>
              00:{duration}
            </span>
          </div>

          {/* Playback Control Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ padding: '8px 16px' }}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentTime(0)}
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Playback Speed Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speed:</span>
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  className={`btn ${playbackSpeed === speed ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  onClick={() => setPlaybackSpeed(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Cryptographic Hash Bar */}
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>SHA-256:</span>
            <span style={{ color: 'var(--cyan-primary)' }}>{activeItem.sha256 || '98abc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
            <Badge variant={activeItem.tampered ? 'danger' : 'success'}>
              {activeItem.tampered ? 'TAMPERED' : 'CRYPTOGRAPHICALLY SEALED'}
            </Badge>
          </div>
        </div>

        {/* Right: AI Detections & Tracking Log */}
        <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>AI Object Tracking</h3>
            </div>
            <Badge variant="info">{filteredDetections.length} Detected</Badge>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'PERSON', 'VEHICLE', 'OBJECT'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`btn ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 8px', fontSize: '0.7rem', flex: 1 }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Detections List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 380 }}>
            {filteredDetections.map((det) => {
              const Icon = det.icon;
              return (
                <div
                  key={det.id}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
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
                    <Icon size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {det.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>Time: {det.timestamp}</span>
                      <span>•</span>
                      <span>Conf: {Math.round(det.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
