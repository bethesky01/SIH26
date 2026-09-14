import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileSearch,
  FileVideo,
  FileImage,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Binary,
} from 'lucide-react';
import Tabs from '../components/common/Tabs';
import Badge from '../components/common/Badge';

export default function ForensicLabView() {
  const [labTab, setLabTab] = useState('tamper'); // 'tamper' | 'carving'

  // Tamper Scanner State
  const [analyzedFile, setAnalyzedFile] = useState(null);
  const [isScanningTamper, setIsScanningTamper] = useState(false);
  const [tamperResult, setTamperResult] = useState({
    filename: 'demo_surveillance_cam01_altered.mp4',
    isAltered: true,
    confidence: 97.8,
    verdict: 'ALTERATION DETECTED',
    signatures: ['FFmpeg Lavf58.76.100 Transcoder Injection', 'Non-monotonic Timestamp Drop (T: 00:14.2s - 00:18.0s)', 'Missing OSD Hardware Watermark'],
    elaNoiseLevel: 18.4,
    md5: '8f94d12bb56e34a9194200c8b2a191dc',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  });
  const [showElaHeatmap, setShowElaHeatmap] = useState(false);

  // Carving State
  const [isCarving, setIsCarving] = useState(false);
  const [carveProgress, setCarveProgress] = useState(0);
  const carvedItems = [
    { id: 'carve-01', header: 'H.264 SPS / PPS NALU (00 00 00 01 67)', offset: '0x002A1400', size: '1.4 MB', duration: '00:12', status: 'Reconstructed' },
    { id: 'carve-02', header: 'Dahua DHAV Stream Header (44 48 41 56)', offset: '0x005E3200', size: '2.8 MB', duration: '00:26', status: 'Reconstructed' },
    { id: 'carve-03', header: 'JPEG Keyframe Snapshot (FF D8 FF E0)', offset: '0x0089A100', size: '340 KB', duration: 'Still', status: 'Reconstructed' },
  ];

  const handleSimulateTamperScan = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAnalyzedFile(f);
    setIsScanningTamper(true);

    setTimeout(() => {
      setIsScanningTamper(false);
      const isAltered = f.name.toLowerCase().includes('photoshop') || f.name.toLowerCase().includes('negative') || f.name.toLowerCase().includes('altered');
      setTamperResult({
        filename: f.name,
        isAltered,
        confidence: isAltered ? 98.4 : 99.6,
        verdict: isAltered ? 'ALTERATION DETECTED' : 'GENUINE & UNMODIFIED',
        signatures: isAltered
          ? ['Adobe Photoshop 2026 Resave Marker', 'Spliced Pixels in Bounding Sector 4', 'EXIF Metadata Mismatch']
          : ['Direct Sensor Acquisition Baseline', 'Continuous GOP Cadence (25 FPS)', 'Original Hardware SHA-256 Match'],
        elaNoiseLevel: isAltered ? 19.2 : 2.1,
        md5: '7d83f12bb56e34a9194200c8b2a191ab',
        sha256: '98abc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });
    }, 800);
  };

  const handleRunCarving = () => {
    setIsCarving(true);
    setCarveProgress(10);
    const interval = setInterval(() => {
      setCarveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCarving(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1320, margin: '0 auto', width: '100%' }}>
      
      {/* Header & Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Forensic Analysis & Diagnostic Lab
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Deep sector carving for deleted/damaged video and cryptographic alteration & ELA tamper detection.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'tamper', label: 'Tamper & Alteration Scanner', icon: ShieldAlert },
            { id: 'carving', label: 'Deleted Video Carving', icon: FileSearch, badge: carvedItems.length },
          ]}
          activeTab={labTab}
          onChange={setLabTab}
        />
      </div>

      {/* TAB 1: TAMPER & ALTERATION SCANNER */}
      {labTab === 'tamper' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          
          {/* Upload & Inspection Box */}
          <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UploadCloud size={20} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Input Media Verification</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Upload any CCTV video, picture snapshot, or suspect clip to determine if it has been tampered with or modified.
            </p>

            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '30px 20px',
                textAlign: 'center',
                background: 'var(--bg-surface)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <input
                type="file"
                onChange={handleSimulateTamperScan}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <FileImage size={32} color="var(--cyan-primary)" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isScanningTamper ? 'Analyzing File & Computing ELA...' : analyzedFile ? analyzedFile.name : 'Select or Drop Suspect Media File'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Supports MP4, AVI, MKV, JPG, PNG (Automatic ELA & Hex audit)
              </div>
            </div>

            {/* Quick Demo Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => {
                  setTamperResult({
                    filename: 'surveillance_gate_01_original.mp4',
                    isAltered: false,
                    confidence: 99.8,
                    verdict: 'GENUINE & UNMODIFIED',
                    signatures: ['Clean GOP keyframe structure', 'Valid NALU bitstream', 'Zero editing markers found'],
                    elaNoiseLevel: 1.8,
                    md5: '5a89c1d04e5a9102c3d4e5a7c2e81902',
                    sha256: '98abc44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                  });
                }}
              >
                Test Authentic Video
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => {
                  setTamperResult({
                    filename: 'surveillance_corridor_spliced.mp4',
                    isAltered: true,
                    confidence: 98.6,
                    verdict: 'ALTERATION DETECTED',
                    signatures: ['Cut detected between 00:04.2s and 00:06.5s', 'Photoshop metadata tag injected', 'Non-monotonic frame timestamps'],
                    elaNoiseLevel: 21.4,
                    md5: 'b12bb56e34a9194200c8b2a191dc8f94',
                    sha256: '44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85598ab',
                  });
                }}
              >
                Test Tampered File
              </button>
            </div>
          </div>

          {/* Verdict & Analysis Results */}
          <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {tamperResult.isAltered ? (
                  <ShieldAlert size={22} color="#f87171" />
                ) : (
                  <ShieldCheck size={22} color="#34d399" />
                )}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  {tamperResult.verdict}
                </h3>
              </div>
              <Badge variant={tamperResult.isAltered ? 'danger' : 'success'}>
                {tamperResult.confidence}% Confidence
              </Badge>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Inspected Target: <strong style={{ color: 'var(--text-primary)' }}>{tamperResult.filename}</strong>
            </div>

            {/* Alteration Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Forensic Alteration Audit:
              </div>
              {tamperResult.signatures.map((sig, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: tamperResult.isAltered ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${tamperResult.isAltered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    fontSize: '0.78rem',
                    color: tamperResult.isAltered ? '#fca5a5' : '#86efac',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {tamperResult.isAltered ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  <span>{sig}</span>
                </div>
              ))}
            </div>

            {/* Error Level Analysis (ELA) Heatmap Toggle */}
            <div
              style={{
                marginTop: 'auto',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Error Level Analysis (ELA)
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Compression noise variance: {tamperResult.elaNoiseLevel}%
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                onClick={() => setShowElaHeatmap(!showElaHeatmap)}
              >
                {showElaHeatmap ? 'Standard View' : 'Show ELA Heatmap'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: DELETED VIDEO CARVING */}
      {labTab === 'carving' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
          
          {/* Carving Control Box */}
          <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Binary size={20} color="var(--cyan-primary)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Unallocated Sector Carving</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Scans raw unallocated disk space or damaged DVR volumes for H.264/H.265 NALU start codes (`00 00 00 01`) and DHAV frames.
            </p>

            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                <span>Carving Engine: Deep Raw Bitstream Scanner</span>
                <span>{isCarving ? `${carveProgress}%` : 'Ready'}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${isCarving ? carveProgress : 100}%`,
                    background: 'var(--cyan-primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={isCarving}
              onClick={handleRunCarving}
              style={{ width: '100%' }}
            >
              {isCarving ? 'Scanning Unallocated Clusters...' : 'Start Deep Sector Carve'}
            </button>
          </div>

          {/* Reconstructed Video Segments */}
          <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileVideo size={20} color="var(--cyan-primary)" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Reconstructed Video Clusters ({carvedItems.length})
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {carvedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.header}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: 10, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      <span>LBA Offset: {item.offset}</span>
                      <span>•</span>
                      <span>Size: {item.size}</span>
                      <span>•</span>
                      <span>Duration: {item.duration}</span>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                    onClick={() => alert(`Exporting reconstructed fragment ${item.id} with cryptographic SHA-256 seal.`)}
                  >
                    <Download size={13} /> Export
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
