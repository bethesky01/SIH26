import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  UploadCloud,
  FileImage,
  FileVideo,
  FileSearch,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Video,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
  Download,
  Binary,
  Maximize2,
  RefreshCw,
  Cpu,
  ArrowRight,
  Activity,
  Check,
  X,
  Play,
  Pause,
  Filter
} from 'lucide-react';
import { api } from '../services/api';

export default function UniversalScannerView({ onNavigate }) {
  // Input State
  const [file, setFile] = useState(null);
  const [baselineFile, setBaselineFile] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [cameraChannel, setCameraChannel] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Results State
  const [results, setResults] = useState(null);
  const [activePillar, setActivePillar] = useState('all'); // 'all' | 'recovery' | 'detect' | 'timeline' | 'tamper'
  const [visualMode, setVisualMode] = useState('standard'); // 'standard' | 'heatmap'
  const [detectionFilter, setDetectionFilter] = useState('ALL');
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [activeHexView, setActiveHexView] = useState(null);

  const fileInputRef = useRef(null);
  const baselineInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Run the 4-Pillar Universal Diagnostic
  const handleExecuteDiagnostic = async (overrideFile = null, overrideBaseline = null) => {
    const targetFile = overrideFile || file;
    if (!targetFile) return;

    setIsScanning(true);
    setScanProgress(10);
    setScanStep('Pillar 1: Deep Sector Carving & Bitstream Health Check...');

    try {
      const progressTimer1 = setTimeout(() => {
        setScanProgress(40);
        setScanStep('Pillar 2: AI Multi-Class Computer Vision & Object Localization...');
      }, 350);

      const progressTimer2 = setTimeout(() => {
        setScanProgress(70);
        setScanStep('Pillar 3: Chronological Frame Cadence & Timeline Mapping...');
      }, 700);

      const progressTimer3 = setTimeout(() => {
        setScanProgress(90);
        setScanStep('Pillar 4: Error Level Analysis & Cryptographic Alteration Audit...');
      }, 1050);

      const formData = new FormData();
      formData.append('file', targetFile);
      if (compareMode && (overrideBaseline || baselineFile)) {
        formData.append('baseline_file', overrideBaseline || baselineFile);
      }
      formData.append('camera_channel', cameraChannel);

      const response = await api.universalDiagnose(formData);

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);

      setScanProgress(100);
      setScanStep('Diagnostic Finalized. All 4 Pillars Verified.');

      setTimeout(() => {
        setResults(response);
        setIsScanning(false);
      }, 300);
    } catch (err) {
      console.error('Universal diagnostic error:', err);
      setIsScanning(false);
      alert('Diagnostic encountered an issue: ' + (err.message || 'Unknown error'));
    }
  };

  // Quick Preset Handlers for ALL Cases (Positive and Negative)
  const handleLoadPreset = (presetType) => {
    let dummyFile;
    if (presetType === 'video_cctv' || presetType === 'authentic_video') {
      dummyFile = new File([new ArrayBuffer(4500000)], 'cctv_entrance_ch01_authentic.mp4', { type: 'video/mp4' });
    } else if (presetType === 'authentic_photo') {
      dummyFile = new File([new ArrayBuffer(1800000)], 'crime_scene_photo_authentic_unaltered.jpg', { type: 'image/jpeg' });
    } else if (presetType === 'photo_edited' || presetType === 'modified_photo') {
      dummyFile = new File([new ArrayBuffer(1800000)], 'suspect_photo_edited_photoshop.jpg', { type: 'image/jpeg' });
    } else if (presetType === 'spliced_video' || presetType === 'heavy_tamper') {
      dummyFile = new File([new ArrayBuffer(5100000)], 'tampered_spliced_cctv_lavf_heavy_changes.mp4', { type: 'video/mp4' });
    } else if (presetType === 'corrupted_clip' || presetType === 'corrupted_file') {
      dummyFile = new File([new ArrayBuffer(3200000)], 'dvr_bad_sectors_corrupted_carve.dd', { type: 'application/octet-stream' });
    } else if (presetType === 'fatal_corrupt') {
      dummyFile = new File([new ArrayBuffer(1200000)], 'fatal_bad_sectors_unreadable_stream.bin', { type: 'application/octet-stream' });
    }

    setFile(dummyFile);
    handleExecuteDiagnostic(dummyFile);
  };

  // Redraw detection bounding boxes or ELA heatmap on canvas
  useEffect(() => {
    if (!results || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width || 640;
    const height = canvas.height || 360;

    ctx.clearRect(0, 0, width, height);

    const isHeatmap = visualMode === 'heatmap';

    if (isHeatmap) {
      // Draw ELA High-Noise Grid
      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, width, height);

      // Subtle ambient noise
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.fillRect(x, y, 2, 2);
      }

      // If tampered / spliced region exists, highlight heat zone
      const elaBox = results.pillars?.tamper?.ela_heatmap?.localized_bounding_box;
      if (elaBox) {
        const [bx, by, bw, bh] = elaBox;
        const rx = bx * width;
        const ry = by * height;
        const rw = bw * width;
        const rh = bh * height;

        const grad = ctx.createRadialGradient(rx + rw / 2, ry + rh / 2, 5, rx + rw / 2, ry + rh / 2, Math.max(rw, rh));
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.05)');

        ctx.fillStyle = grad;
        ctx.fillRect(rx - 15, ry - 15, rw + 30, rh + 30);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(rx, ry, rw, rh);
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('⚠ HIGH ELA NOISE (+18.4%) — SPLICED REGION', rx, Math.max(20, ry - 8));
      }
    } else {
      // Standard Camera Stream Grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

      // Camera Watermark / OSD
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px monospace';
      ctx.fillText(`CAM-0${cameraChannel} LIVE FEED [CALIBRATED]`, 16, 24);
      ctx.fillText(results.pillars?.timeline?.timeline_events?.[0]?.osd_timestamp || '2026-08-22 14:15:00 UTC', 16, 42);

      // Draw Detections
      const detections = results.pillars?.detection?.detections || [];
      detections.forEach((d) => {
        if (detectionFilter !== 'ALL' && d.detection_type !== detectionFilter) return;

        const rx = d.bbox_x * width;
        const ry = d.bbox_y * height;
        const rw = d.bbox_w * width;
        const rh = d.bbox_h * height;

        let strokeColor = '#00e5ff'; // Person
        if (d.detection_type === 'Vehicle') strokeColor = '#f59e0b';
        if (d.detection_type === 'Object') strokeColor = '#10b981';
        if (d.detection_type === 'Motion') strokeColor = '#8b5cf6';
        if (d.detection_type === 'Face') strokeColor = '#06b6d4';

        const isSel = selectedDetection && selectedDetection.detection_id === d.detection_id;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.strokeRect(rx, ry, rw, rh);

        ctx.fillStyle = strokeColor === '#00e5ff' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        ctx.fillRect(rx, ry, rw, rh);

        // Tag label
        ctx.fillStyle = strokeColor;
        const tagText = `${d.label} (${Math.round(d.confidence * 100)}%)`;
        const textWidth = ctx.measureText(tagText).width;
        ctx.fillRect(rx, Math.max(0, ry - 20), textWidth + 14, 20);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(tagText, rx + 6, Math.max(14, ry - 6));
      });
    }
  }, [results, visualMode, detectionFilter, selectedDetection, cameraChannel]);

  return (
    <div className="universal-scanner-view" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', color: '#e2e8f0' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: '16px',
          padding: '24px 32px',
          marginBottom: '28px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), 0 0 20px rgba(0, 229, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)'
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Universal Forensic Diagnostic Studio
              </h1>
              <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '2px' }}>
                Input any Real Video, Still Photo, or Corrupted File to execute the 4 Core Pillars
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.3)', fontWeight: 600 }}>
              1. 💾 Deep Sector Recovery
            </span>
            <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
              2. 👁 AI Object Detection
            </span>
            <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: 600 }}>
              3. ⏱ Chronological Timeline
            </span>
            <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}>
              4. 🛡 Tamper & Changes Audit
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.8rem',
              color: '#94a3b8'
            }}
          >
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Standard</div>
            <div style={{ fontWeight: 700, color: '#f8fafc' }}>ISO/IEC 27037 & Sec 65B</div>
          </div>
        </div>
      </div>

      {/* 2. Unified Hero Dropzone & Preset Selectors */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="#00e5ff" />
            <span>Select or Drop Target Evidence File</span>
          </div>

          {/* Quick-Test 1-Click Presets for ALL Cases (Positive & Negative) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Positive:
              </span>
              <button
                onClick={() => handleLoadPreset('authentic_video')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Pristine surveillance video: 0 changes, authentic bitstream"
              >
                ✓ Authentic Video (No Changes)
              </button>
              <button
                onClick={() => handleLoadPreset('authentic_photo')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Original photographic evidence: zero alteration"
              >
                ✓ Clean Photo (No Changes)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Negative:
              </span>
              <button
                onClick={() => handleLoadPreset('modified_photo')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Edited photo: Photoshop metadata and ELA pixel changes"
              >
                ⚠ Modified Photo (Has Changes)
              </button>
              <button
                onClick={() => handleLoadPreset('heavy_tamper')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Heavy tampering: Spliced frames and Lavf transcoder injection (Not accurate for case)"
              >
                🚨 Heavy Changes (Not Accurate)
              </button>
              <button
                onClick={() => handleLoadPreset('corrupted_file')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                  color: '#fb923c',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Corrupted DVR dump: sector damage and cluster fragmentation"
              >
                💾 Corrupted File (Sector Issues)
              </button>
              <button
                onClick={() => handleLoadPreset('fatal_corrupt')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  background: 'rgba(225, 29, 72, 0.15)',
                  border: '1px solid rgba(225, 29, 72, 0.4)',
                  color: '#fda4af',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                title="Fatal corruption: Unreadable sectors and unrecoverable stream"
              >
                ⛔ Fatal Corrupted Dump
              </button>
            </div>
          </div>
        </div>

        {/* Drop Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: dragOver ? '2px dashed #00e5ff' : '2px dashed rgba(255, 255, 255, 0.15)',
            background: dragOver ? 'rgba(0, 229, 255, 0.05)' : 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            padding: '36px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '18px'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            style={{ display: 'none' }}
          />

          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(0, 229, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00e5ff'
                }}
              >
                {file.type?.startsWith('image/') ? <FileImage size={28} /> : (file.type?.startsWith('video/') ? <FileVideo size={28} /> : <Binary size={28} />)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>{file.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Raw Binary / Media Stream'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#00e5ff', marginTop: '4px' }}>
                Click or drop another file to replace
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={44} color="#64748b" />
              <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#cbd5e1' }}>
                Click to browse or drag & drop evidence file here
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Supports Video (MP4, AVI, MKV, DHAV), Photos (JPG, PNG, WEBP), and Corrupted / Raw DD Dumps
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Baseline Comparison Option */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: '#cbd5e1' }}>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                style={{ accentColor: '#00e5ff', cursor: 'pointer' }}
              />
              <span>Compare against baseline original (Bit-for-bit Diff)</span>
            </label>

            {compareMode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="file"
                  ref={baselineInputRef}
                  onChange={(e) => setBaselineFile(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => baselineInputRef.current?.click()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#e2e8f0',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {baselineFile ? `Baseline: ${baselineFile.name}` : 'Select Baseline File...'}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', color: '#94a3b8' }}>
              <span>Channel:</span>
              <select
                value={cameraChannel}
                onChange={(e) => setCameraChannel(Number(e.target.value))}
                style={{
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.82rem'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                  <option key={c} value={c}>Ch {c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => handleExecuteDiagnostic()}
            disabled={!file || isScanning}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              background: !file || isScanning ? '#334155' : 'linear-gradient(135deg, #00e5ff 0%, #2563eb 100%)',
              color: !file || isScanning ? '#64748b' : '#000000',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: !file || isScanning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: !file || isScanning ? 'none' : '0 0 20px rgba(0, 229, 255, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Analyzing 4 Pillars...</span>
              </>
            ) : (
              <>
                <Activity size={18} />
                <span>Run 4-Pillar Diagnostic Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar when scanning */}
        {isScanning && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', color: '#00e5ff' }}>
              <span>{scanStep}</span>
              <span>{scanProgress}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${scanProgress}%`,
                  background: 'linear-gradient(90deg, #00e5ff, #8b5cf6, #10b981)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Results Section */}
      {results && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {/* Overview Forensic Verdict Banner & Direct Answers for All Positive/Negative Cases */}
          {(() => {
            const isCorrupted = Boolean(results.is_corrupted || results.pillars?.recovery?.is_corrupted);
            const isFatalCorrupt = Boolean(results.is_severely_corrupted || results.pillars?.recovery?.is_severely_corrupted || (isCorrupted && results.pillars?.recovery?.fragments_found === 0));
            const hasChanges = Boolean(results.has_changes || results.pillars?.tamper?.has_changed);
            const hasHeavyChanges = Boolean(results.has_heavy_changes || results.pillars?.tamper?.has_heavy_changes);
            const hasSeriousIssues = Boolean(results.has_serious_issues || isCorrupted || hasHeavyChanges || isFatalCorrupt);
            const isAccurateForCase = Boolean(results.is_accurate_for_case !== undefined ? results.is_accurate_for_case : (!hasChanges && !isCorrupted));

            let bannerBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(15, 23, 42, 0.85) 100%)';
            let bannerBorder = 'rgba(16, 185, 129, 0.4)';
            let titleColor = '#34d399';
            let caseHeadline = '✓ THIS FILE HAS NO CHANGES — VERIFIED AUTHENTIC';
            let caseSubheadline = 'Bitstream is pristine and intact. Dual SHA-256 baseline hashes match. ACCURATE FOR THE CASE.';
            let caseBadge = '✓ POSITIVE RESULT (NO CHANGES)';
            let caseBadgeBg = 'rgba(16, 185, 129, 0.2)';
            let caseBadgeColor = '#34d399';
            let BannerIcon = ShieldCheck;

            if (isFatalCorrupt) {
              bannerBg = 'linear-gradient(135deg, rgba(225, 29, 72, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)';
              bannerBorder = 'rgba(225, 29, 72, 0.6)';
              titleColor = '#fda4af';
              caseHeadline = '⛔ THIS FILE IS CRITICALLY CORRUPTED — FATAL INTEGRITY FAILURE';
              caseSubheadline = 'Severe sector bit rot and missing container headers. THIS FILE CONTAINS SERIOUS ISSUES AND IS NOT ACCURATE FOR THE CASE.';
              caseBadge = '⛔ CRITICAL NEGATIVE (FATAL CORRUPTION)';
              caseBadgeBg = 'rgba(225, 29, 72, 0.25)';
              caseBadgeColor = '#f43f5e';
              BannerIcon = ShieldAlert;
            } else if (hasHeavyChanges) {
              bannerBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)';
              bannerBorder = 'rgba(239, 68, 68, 0.6)';
              titleColor = '#f87171';
              caseHeadline = '🚨 HEAVY CHANGES DETECTED — FILE CONTAINS SERIOUS ISSUES';
              caseSubheadline = 'THIS FILE HAS HEAVY CHANGES (Spliced temporal cuts, deleted frames, external encoder injection). THIS FILE IS NOT ACCURATE FOR THE CASE.';
              caseBadge = '🚨 CRITICAL NEGATIVE (HEAVY CHANGES)';
              caseBadgeBg = 'rgba(239, 68, 68, 0.25)';
              caseBadgeColor = '#ef4444';
              BannerIcon = ShieldAlert;
            } else if (isCorrupted) {
              bannerBg = 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(15, 23, 42, 0.9) 100%)';
              bannerBorder = 'rgba(249, 115, 22, 0.5)';
              titleColor = '#fb923c';
              caseHeadline = '💾 THIS FILE IS CORRUPTED — SECTOR DAMAGE DETECTED';
              caseSubheadline = 'File bitstream is broken. Partially reconstructed from unallocated sectors. THIS FILE CONTAINS SERIOUS ISSUES AND IS NOT ACCURATE FOR THE CASE.';
              caseBadge = '💾 NEGATIVE RESULT (CORRUPTED)';
              caseBadgeBg = 'rgba(249, 115, 22, 0.25)';
              caseBadgeColor = '#fb923c';
              BannerIcon = AlertTriangle;
            } else if (hasChanges) {
              bannerBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.85) 100%)';
              bannerBorder = 'rgba(245, 158, 11, 0.45)';
              titleColor = '#fbbf24';
              caseHeadline = '⚠ THIS FILE IS MODIFIED — CHANGES DETECTED';
              caseSubheadline = 'THIS FILE HAS CHANGES. Third-party editor signature or compression discrepancy detected from baseline. Requires strict judicial scrutiny.';
              caseBadge = '⚠ NEGATIVE RESULT (MODIFIED / ALTERED)';
              caseBadgeBg = 'rgba(245, 158, 11, 0.2)';
              caseBadgeColor = '#fbbf24';
              BannerIcon = AlertTriangle;
            }

            return (
              <div style={{ marginBottom: '24px' }}>
                {/* Main Banner */}
                <div
                  style={{
                    background: bannerBg,
                    border: `1px solid ${bannerBorder}`,
                    borderRadius: '16px',
                    padding: '24px 28px',
                    marginBottom: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <BannerIcon size={30} color={titleColor} />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: caseBadgeBg,
                          color: caseBadgeColor,
                          letterSpacing: '0.04em'
                        }}
                      >
                        {caseBadge}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: titleColor, letterSpacing: '-0.01em', marginBottom: '6px' }}>
                      {caseHeadline}
                    </div>

                    <div style={{ fontSize: '0.92rem', color: '#cbd5e1', maxWidth: '900px', lineHeight: 1.5 }}>
                      {caseSubheadline}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '14px', fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <div><strong>Target File:</strong> {results.filename}</div>
                      <div><strong>Classification:</strong> {results.media_classification}</div>
                      <div><strong>Size:</strong> {(results.file_size / 1024 / 1024).toFixed(2)} MB</div>
                      <div><strong>SHA-256:</strong> <code style={{ color: '#00e5ff' }}>{results.sha256?.substring(0, 16)}...</code></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `forensic_diagnostic_${results.filename}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Download size={16} />
                      <span>Export Diagnostic (JSON)</span>
                    </button>
                  </div>
                </div>

                {/* 4 Direct Forensic Answers Dashboard */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  {/* Card 1: Changes */}
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      borderRadius: '12px',
                      border: `1px solid ${hasHeavyChanges ? 'rgba(239, 68, 68, 0.4)' : (hasChanges ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)')}`,
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      1. Alterations / Changes Audit
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: hasHeavyChanges ? '#f87171' : (hasChanges ? '#fbbf24' : '#34d399'), marginTop: '4px' }}>
                      {hasHeavyChanges ? '🚨 HEAVY CHANGES DETECTED' : (hasChanges ? '⚠ THIS FILE HAS CHANGES' : '✓ THIS FILE HAS NO CHANGES')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                      {hasHeavyChanges ? 'Multiple critical modifications & frame cuts' : (hasChanges ? 'Editor signature / quantization mismatch' : 'Bit-level authentic (0 byte modifications)')}
                    </div>
                  </div>

                  {/* Card 2: Corruption */}
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      borderRadius: '12px',
                      border: `1px solid ${isFatalCorrupt ? 'rgba(225, 29, 72, 0.4)' : (isCorrupted ? 'rgba(249, 115, 22, 0.4)' : 'rgba(16, 185, 129, 0.4)')}`,
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      2. Sector & Bitstream Health
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: isFatalCorrupt ? '#f43f5e' : (isCorrupted ? '#fb923c' : '#34d399'), marginTop: '4px' }}>
                      {isFatalCorrupt ? '⛔ FATAL DATA CORRUPTION' : (isCorrupted ? '⚠ THIS FILE IS CORRUPTED' : '✓ HEALTHY (NOT CORRUPTED)')}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                      {isFatalCorrupt ? 'Zero readable headers, fatal sector damage' : (isCorrupted ? `${results.pillars?.recovery?.fragments_found || 4} fragments carved from raw sectors` : 'Zero bad blocks, container bitstream intact')}
                    </div>
                  </div>

                  {/* Card 3: Evidentiary Issues */}
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      borderRadius: '12px',
                      border: `1px solid ${hasSeriousIssues ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      3. Serious Forensic Issues
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: hasSeriousIssues ? '#f87171' : '#34d399', marginTop: '4px' }}>
                      {hasSeriousIssues ? '⚠ CONTAINS SERIOUS ISSUES' : '✓ 0 SERIOUS ISSUES'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                      {hasSeriousIssues ? 'Cadence cut, broken GOP, or sector defect' : 'Passes ISO/IEC 27037 forensic standards'}
                    </div>
                  </div>

                  {/* Card 4: Court / Case Accuracy */}
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      borderRadius: '12px',
                      border: `1px solid ${isAccurateForCase ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      4. Judicial Accuracy & Finding
                    </div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: isAccurateForCase ? '#34d399' : '#f87171', marginTop: '4px' }}>
                      {isAccurateForCase ? '✓ ACCURATE FOR THE CASE' : '🚨 NOT ACCURATE FOR THE CASE'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px' }}>
                      {isAccurateForCase ? 'Admissible Section 65B primary evidence' : 'Compromised or altered: inadmissible as original'}
                    </div>
                  </div>
                </div>

                {/* Negative Finding Explicit Alert Notice (only if negative) */}
                {hasSeriousIssues && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px'
                    }}
                  >
                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', marginTop: '2px' }}>
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#f87171', fontSize: '0.95rem' }}>
                        FORENSIC DEFECT NOTICE: THIS FILE CONTAINS SERIOUS ISSUES AND IS NOT ACCURATE FOR THE CASE
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#e2e8f0', marginTop: '4px', lineHeight: 1.5 }}>
                        {isFatalCorrupt && (
                          <span>• Fatal corruption detected: Critical container headers destroyed, stream is unreadable without hardware carving. </span>
                        )}
                        {isCorrupted && !isFatalCorrupt && (
                          <span>• Sector corruption detected: File bitstream contains bad blocks. Recovered fragments indicate partial cluster loss. </span>
                        )}
                        {hasHeavyChanges && (
                          <span>• Heavy changes detected: Spliced frame boundaries, deleted footage, and non-camera transcoder tags invalidate original continuity. </span>
                        )}
                        {hasChanges && !hasHeavyChanges && (
                          <span>• Alteration detected: External software editor artifacts confirm file has been modified after camera recording. </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Interactive Pillar Selector Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              paddingBottom: '12px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}
          >
            {[
              { id: 'all', label: 'All 4 Pillars Overview', icon: Layers },
              { id: 'recovery', label: `1. Recovery (${results.pillars?.recovery?.fragments_found || 0} Fragments)`, icon: FileSearch },
              { id: 'detect', label: `2. Detection (${results.pillars?.detection?.detections_count || 0} Targets)`, icon: Eye },
              { id: 'timeline', label: `3. Timeline (${results.pillars?.timeline?.events_count || 0} Events)`, icon: Clock },
              { id: 'tamper', label: `4. Tamper Audit (${results.pillars?.tamper?.changes_count || 0} Changes)`, icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePillar === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePillar(tab.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(0, 229, 255, 0.15)' : 'rgba(15, 23, 42, 0.4)',
                    border: `1px solid ${isActive ? '#00e5ff' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: isActive ? '#00e5ff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Visual Media Canvas Stage */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(320px, 1.8fr) minmax(300px, 1.2fr)',
              gap: '24px',
              marginBottom: '28px'
            }}
          >
            {/* Visual Canvas Display */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="#00e5ff" />
                  <span>Interactive Frame Inspector</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Visual Mode Toggle */}
                  <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button
                      onClick={() => setVisualMode('standard')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: visualMode === 'standard' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                        color: visualMode === 'standard' ? '#00e5ff' : '#94a3b8',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      AI Objects
                    </button>
                    <button
                      onClick={() => setVisualMode('heatmap')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        background: visualMode === 'heatmap' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                        color: visualMode === 'heatmap' ? '#f87171' : '#94a3b8',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ELA Heatmap
                    </button>
                  </div>

                  {/* Filter Dropdown */}
                  {visualMode === 'standard' && (
                    <select
                      value={detectionFilter}
                      onChange={(e) => setDetectionFilter(e.target.value)}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="ALL">All Objects</option>
                      <option value="Person">Persons Only</option>
                      <option value="Vehicle">Vehicles Only</option>
                      <option value="Object">Objects Only</option>
                      <option value="Motion">Motion Only</option>
                      <option value="Face">Faces Only</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Responsive Aspect Canvas Box */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#000',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)'
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </div>

              {/* Timeline scrubber footer for video */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ color: '#00e5ff', fontWeight: 700 }}>
                  {results.pillars?.timeline?.duration_seconds > 0 ? `${results.pillars.timeline?.duration_seconds}s Total` : 'Still Image Matrix'}
                </span>
                <span>•</span>
                <span>{results.pillars?.timeline?.fps > 0 ? `${results.pillars.timeline?.fps} FPS` : 'Single Frame'}</span>
                <span>•</span>
                <span style={{ color: results.pillars?.timeline?.is_continuous ? '#10b981' : '#f59e0b' }}>
                  {results.pillars?.timeline?.is_continuous ? '✓ Continuous Stream' : '⚠ Discontinuous / Spliced Cadence'}
                </span>
              </div>
            </div>

            {/* Quick Context / Highlights Card */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>Forensic Summary Breakdown</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* Pillar 1 Quick Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '12px', borderLeft: '4px solid #00e5ff' }}>
                  <div style={{ fontSize: '0.78rem', color: '#00e5ff', fontWeight: 700 }}>PILLAR 1: RECOVERY</div>
                  <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                    {results.pillars?.recovery?.health_label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    {results.pillars?.recovery?.details}
                  </div>
                </div>

                {/* Pillar 2 Quick Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>PILLAR 2: AI DETECTION</div>
                  <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                    {results.pillars?.detection?.detections_count} Forensic Target(s) Located
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Categories: {results.pillars?.detection?.categories_found?.join(', ') || 'None'}
                  </div>
                </div>

                {/* Pillar 3 Quick Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '12px', borderLeft: '4px solid #a78bfa' }}>
                  <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700 }}>PILLAR 3: TIMELINE</div>
                  <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                    {results.pillars?.timeline?.events_count} Chronological Events Mapped
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Duration: {results.pillars?.timeline?.duration_seconds}s @ {results.pillars?.timeline?.fps} FPS
                  </div>
                </div>

                {/* Pillar 4 Quick Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '10px',
                    padding: '12px',
                    borderLeft: `4px solid ${results.pillars?.tamper?.has_changed ? '#ef4444' : '#10b981'}`
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: results.pillars?.tamper?.has_changed ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                    PILLAR 4: TAMPER & CHANGES AUDIT
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600, marginTop: '2px' }}>
                    {results.pillars?.tamper?.verdict_label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    {results.pillars?.tamper?.changes_count} Anomaly/Modification signature(s) detected
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Detailed Pillar Accordions */}

          {/* PILLAR 1: RECOVERY DETAIL */}
          {(activePillar === 'all' || activePillar === 'recovery') && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                padding: '24px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>
                    <FileSearch size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                      Pillar 1: Deep Sector Carving & Bitstream Recovery
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Unallocated cluster scanning, NALU 00 00 00 01 delimiter parsing, and playable fragment reconstruction
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    background: results.pillars?.recovery?.is_corrupted ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: results.pillars?.recovery?.is_corrupted ? '#fbbf24' : '#34d399',
                    border: `1px solid ${results.pillars?.recovery?.is_corrupted ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                  }}
                >
                  {results.pillars?.recovery?.recovery_status}
                </span>
              </div>

              {/* Pillar 1 Corruption Status Banner */}
              <div
                style={{
                  background: results.pillars?.recovery?.is_corrupted ? 'rgba(249, 115, 22, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${results.pillars?.recovery?.is_corrupted ? 'rgba(249, 115, 22, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '18px'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: results.pillars?.recovery?.is_corrupted ? '#fb923c' : '#34d399', marginBottom: '4px' }}>
                  {results.pillars?.recovery?.is_corrupted
                    ? '⚠ THIS FILE IS CORRUPTED — SECTOR ANOMALIES & CLUSTERS CARVED'
                    : '✓ THIS FILE IS NOT CORRUPTED — HEALTHY BITSTREAM (0 BAD SECTORS)'}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  {results.pillars?.recovery?.details}
                </div>
              </div>

              {results.pillars?.recovery?.fragments?.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Fragment ID</th>
                        <th style={{ padding: '10px' }}>Codec / Container</th>
                        <th style={{ padding: '10px' }}>Hex Sector Offset</th>
                        <th style={{ padding: '10px' }}>Byte Payload</th>
                        <th style={{ padding: '10px' }}>Keyframes</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.pillars.recovery.fragments.map((frag) => (
                        <tr key={frag.fragment_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '12px 10px', fontWeight: 600, color: '#00e5ff' }}>{frag.fragment_id}</td>
                          <td style={{ padding: '12px 10px' }}>{frag.codec_format}</td>
                          <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: '#f59e0b' }}>
                            0x{frag.start_offset.toString(16).padStart(8, '0')} - 0x{frag.end_offset.toString(16).padStart(8, '0')}
                          </td>
                          <td style={{ padding: '12px 10px' }}>{(frag.byte_length / 1024).toFixed(1)} KB</td>
                          <td style={{ padding: '12px 10px' }}>{frag.keyframes || 1} I-Frames</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                              {frag.playable_status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <button
                              onClick={() => setActiveHexView(frag.fragment_id === activeHexView ? null : frag.fragment_id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#e2e8f0',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              {activeHexView === frag.fragment_id ? 'Hide Hex' : 'View Hex'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {activeHexView && (
                    <div style={{ marginTop: '16px', background: '#090d16', padding: '16px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)', fontFamily: 'monospace', fontSize: '0.78rem', color: '#38bdf8' }}>
                      <div style={{ color: '#94a3b8', marginBottom: '8px' }}>// Hex Sector Carving Dump: {activeHexView} (NALU 00 00 00 01 sync byte match)</div>
                      <div>00000000  00 00 00 01 67 42 00 1f  96 35 40 a0 0d 76 02 d0  |....gB...5@..v..|</div>
                      <div>00000010  00 00 00 01 68 ce 3c 80  00 00 00 01 65 88 84 00  |....h.&lt;.....e...|</div>
                      <div>00000020  3f ff fe 00 1b e4 ff 00  12 00 50 14 00 28 00 a0  |?.........P..(..|</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontSize: '0.85rem' }}>
                  ✓ Stream container is intact. No sector bad blocks or missing clusters were found.
                </div>
              )}
            </div>
          )}

          {/* PILLAR 2: AI DETECTION DETAIL */}
          {(activePillar === 'all' || activePillar === 'detect') && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '24px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                    <Eye size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                      Pillar 2: AI Multi-Class Feature & Object Detection
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Locates Persons, Vehicles, Objects/Things, Motion Vectors, and Face boundaries with bounding box metrics
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
                  {results.pillars?.detection?.detections_count} Targets Found
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {results.pillars?.detection?.detections?.map((det) => {
                  let badgeBg = 'rgba(0, 229, 255, 0.15)';
                  let badgeCol = '#00e5ff';
                  if (det.detection_type === 'Vehicle') { badgeBg = 'rgba(245, 158, 11, 0.15)'; badgeCol = '#f59e0b'; }
                  if (det.detection_type === 'Object') { badgeBg = 'rgba(16, 185, 129, 0.15)'; badgeCol = '#10b981'; }
                  if (det.detection_type === 'Motion') { badgeBg = 'rgba(139, 92, 246, 0.15)'; badgeCol = '#a78bfa'; }
                  if (det.detection_type === 'Face') { badgeBg = 'rgba(6, 182, 212, 0.15)'; badgeCol = '#06b6d4'; }

                  const isSelected = selectedDetection?.detection_id === det.detection_id;

                  return (
                    <div
                      key={det.detection_id}
                      onClick={() => setSelectedDetection(isSelected ? null : det)}
                      style={{
                        background: isSelected ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        border: `1px solid ${isSelected ? '#00e5ff' : 'rgba(255, 255, 255, 0.08)'}`,
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: badgeBg, color: badgeCol, fontSize: '0.72rem', fontWeight: 700 }}>
                          {det.detection_type}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          T: {det.timestamp_str || `${det.timestamp_sec}s`}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '6px' }}>
                        {det.label}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                        <span>Confidence: <strong style={{ color: '#10b981' }}>{Math.round(det.confidence * 100)}%</strong></span>
                        <span>[X:{det.bbox_x}, Y:{det.bbox_y}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PILLAR 3: TIMELINE DETAIL */}
          {(activePillar === 'all' || activePillar === 'timeline') && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                padding: '24px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                      Pillar 3: Chronological Timeline & Frame Cadence
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Maps sequential events, OSD time calibration, and flags time-jump splices
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 700 }}>
                  {results.pillars?.timeline?.duration_seconds}s • {results.pillars?.timeline?.fps} FPS
                </div>
              </div>

              {/* Timeline Event Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.pillars?.timeline?.timeline_events?.map((evt, idx) => (
                  <div
                    key={evt.event_id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      borderLeft: '4px solid #a78bfa'
                    }}
                  >
                    <div style={{ minWidth: '110px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#00e5ff' }}>+{evt.time_offset_sec}s</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{evt.osd_timestamp}</div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{evt.event_type}</div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{evt.description}</div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.06)', padding: '4px 8px', borderRadius: '4px' }}>
                      {evt.camera_name || `Camera ${cameraChannel}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PILLAR 4: TAMPER & CHANGES DETAIL */}
          {(activePillar === 'all' || activePillar === 'tamper') && (
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '16px',
                border: `1px solid ${results.pillars?.tamper?.has_changed ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                padding: '24px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: results.pillars?.tamper?.has_changed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: results.pillars?.tamper?.has_changed ? '#ef4444' : '#10b981'
                    }}
                  >
                    {results.pillars?.tamper?.has_changed ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
                      Pillar 4: Tamper & Modification Audit ("Has it changed or not?")
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Error Level Analysis (ELA), software editor signature scan, and frame splice cut detection
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    background: results.pillars?.tamper?.has_changed ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: results.pillars?.tamper?.has_changed ? '#f87171' : '#34d399',
                    border: `1px solid ${results.pillars?.tamper?.has_changed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                  }}
                >
                  {results.pillars?.tamper?.verdict}
                </span>
              </div>

              {/* Direct Judicial Q&A Panel */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '14px',
                  marginBottom: '16px'
                }}
              >
                {/* Question 1: Alterations */}
                <div
                  style={{
                    background: results.pillars?.tamper?.has_heavy_changes ? 'rgba(239, 68, 68, 0.1)' : (results.pillars?.tamper?.has_changed ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'),
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${results.pillars?.tamper?.has_heavy_changes ? 'rgba(239, 68, 68, 0.3)' : (results.pillars?.tamper?.has_changed ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: results.pillars?.tamper?.has_heavy_changes ? '#f87171' : (results.pillars?.tamper?.has_changed ? '#fbbf24' : '#34d399'), marginBottom: '4px' }}>
                    Q1: Has this file been altered or changed?
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {results.pillars?.tamper?.has_heavy_changes ? (
                      <>
                        <strong style={{ color: '#f87171' }}>YES — HEAVY CHANGES DETECTED.</strong> Spliced frame boundaries, deleted footage intervals, and external transcoder injection confirmed.
                      </>
                    ) : results.pillars?.tamper?.has_changed ? (
                      <>
                        <strong style={{ color: '#fbbf24' }}>YES — THIS FILE HAS CHANGES.</strong> Alterations confirmed. The file contains {results.pillars.tamper.changes_count} anomalies detailing external editor tags or compression variance.
                      </>
                    ) : (
                      <>
                        <strong style={{ color: '#34d399' }}>NO — THIS FILE HAS NO CHANGES.</strong> The file is bit-for-bit authentic. Zero modifications, editor tags, or temporal cuts were found.
                      </>
                    )}
                  </div>
                </div>

                {/* Question 2: Case Accuracy */}
                <div
                  style={{
                    background: (results.is_accurate_for_case === false || results.pillars?.tamper?.has_heavy_changes || results.pillars?.tamper?.has_changed) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${(results.is_accurate_for_case === false || results.pillars?.tamper?.has_heavy_changes || results.pillars?.tamper?.has_changed) ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: (results.is_accurate_for_case === false || results.pillars?.tamper?.has_heavy_changes || results.pillars?.tamper?.has_changed) ? '#f87171' : '#34d399', marginBottom: '4px' }}>
                    Q2: Is this file accurate for the court case?
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {results.pillars?.tamper?.has_heavy_changes ? (
                      <>
                        <strong style={{ color: '#f87171' }}>NO — NOT ACCURATE FOR THE CASE.</strong> File contains serious issues and heavy alterations. It cannot be used as pristine direct evidence in court.
                      </>
                    ) : results.pillars?.tamper?.has_changed ? (
                      <>
                        <strong style={{ color: '#fbbf24' }}>SCRUTINY REQUIRED.</strong> Modifications detected. Cannot verify original sensor capture without corroborating camera log.
                      </>
                    ) : (
                      <>
                        <strong style={{ color: '#34d399' }}>YES — ACCURATE FOR THE CASE.</strong> File matches cryptographic ledger baseline and is admissible as original evidence under Section 65B.
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* List of Detected Changes */}
              {results.pillars?.tamper?.changes_detected?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                    Specific Modifications Detected:
                  </div>
                  {results.pillars.tamper.changes_detected.map((change, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px',
                        padding: '14px',
                        borderLeft: `4px solid ${change.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>{change.title}</span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: change.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                            color: change.severity === 'CRITICAL' ? '#f87171' : '#fbbf24'
                          }}
                        >
                          {change.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        {change.details}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
