import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  CheckCircle2,
  HardDrive,
  Radio,
  Server,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';

export default function AdaptersView({ activeCase }) {
  const [adapters, setAdapters] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    loadAdapters();
  }, [activeCase]);

  const loadAdapters = async () => {
    try {
      const [adapList, devList] = await Promise.all([
        api.getParserAdapters(),
        api.getDevices(activeCase?.case_id),
      ]);
      setAdapters(adapList || []);
      setDevices(devList || []);
    } catch (err) {
      console.error('Failed to load adapter specs:', err);
    }
  };

  const defaultAdapters = [
    {
      vendor: 'Hikvision',
      models: 'DS-7600 / DS-7700 / DS-8600 Series NVR',
      extensions: '.mp4, .dav, .h264, .raw',
      fileSystem: 'Hikvision Ext4 / Proprietary Cluster',
      signature: '0x48 0x49 0x4B ("HIK") / NALU 0x00 0x00 0x00 0x01',
      features: ['Private OSD Timestamp Decryption', 'Multi-channel index demuxing', 'Unallocated frame carving'],
    },
    {
      vendor: 'Dahua',
      models: 'NVR5000 / NVR4000 / XVR Series',
      extensions: '.dav, .dhfs, .raw',
      fileSystem: 'DHFS (Dahua File System v4.0)',
      signature: '0x44 0x41 0x48 0x55 0x41 ("DAHUA") / 0x44 0x48 0x41 0x56',
      features: ['DHFS superblock recovery', 'Raw H.265 stream defragmentation', 'Synchronized audio channel extraction'],
    },
    {
      vendor: 'CP Plus',
      models: 'Orange Series / Indigo DVR & NVR',
      extensions: '.dav, .mp4, .cvr',
      fileSystem: 'CP-FAT / Proprietary DVR Index',
      signature: '0x43 0x50 0x50 0x4C 0x55 0x53 ("CPPLUS")',
      features: ['Channel stream extraction', 'Sector indexing verification', 'Damaged footer repair'],
    },
    {
      vendor: 'Matrix',
      models: 'SATATYA SAMAS / NVRX Multi-Channel',
      extensions: '.mp4, .mat, .avi',
      fileSystem: 'Matrix Proprietary FS',
      signature: '0x4D 0x41 0x54 0x52 0x49 0x58 ("MATRIX")',
      features: ['Enterprise camera mapping', 'Clock skew compensation', 'Cluster header reconstruction'],
    },
    {
      vendor: 'Generic ISO-BMFF',
      models: 'Universal CCTV Exporters (H.264 / H.265 / AVI)',
      extensions: '.mp4, .avi, .mkv, .ts',
      fileSystem: 'Standard FAT32 / NTFS / ExFAT',
      signature: 'ftyp / mdat / moov / RIFF',
      features: ['Atom carving fallback', 'Keyframe index recovery', 'Universal ISO-27037 compliance'],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Multi-Vendor DVR/NVR Architecture & Forensic Parser Registry
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Extensible adapter registry abstracting heterogeneous, proprietary surveillance hardware formats into a unified ISO/IEC 27037 compliant data model.
            </p>
          </div>
          <div className="status-pill info">
            <Cpu size={14} />
            <span>MODULAR PARSERS</span>
          </div>
        </div>
      </div>

      {/* Ingested Hardware Devices Table */}
      <div className="forensic-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Server size={18} /> Ingested Surveillance Hardware Nodes ({devices?.length || 0})
        </h3>

        {devices && devices.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
            {devices.map((dev) => (
              <div
                key={dev.id}
                style={{
                  background: 'rgba(12, 20, 36, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>
                    {dev.device_name}
                  </div>
                  <span className="status-pill info">{dev.vendor}</span>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Model: <span style={{ color: 'var(--text-primary)' }}>{dev.model_name}</span> • Type: {dev.device_type}
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'rgba(6, 10, 18, 0.6)', padding: 8, borderRadius: 6 }}>
                  <div>Firmware: <span className="font-mono">{dev.firmware_version}</span></div>
                  <div>File System: <span className="font-mono">{dev.file_system}</span></div>
                  <div>Channels: <span className="font-mono">{dev.channels_count} CH</span></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No physical devices registered for this case.</div>
        )}
      </div>

      {/* Modular Vendor Adapters Reference */}
      <div className="forensic-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)', marginBottom: 16 }}>
          Modular Hardware Parser Specifications
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {defaultAdapters.map((ad, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(12, 20, 36, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--cyan-primary)' }}>
                  {ad.vendor}
                </span>
                <span className="status-pill success">ACTIVE ADAPTER</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <div><strong>Supported Models:</strong> {ad.models}</div>
                <div><strong>Extensions:</strong> {ad.extensions}</div>
                <div><strong>File System:</strong> {ad.fileSystem}</div>
              </div>

              {/* Hex Signature */}
              <div style={{ background: 'rgba(6, 10, 18, 0.7)', padding: '6px 10px', borderRadius: 6 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAGIC SIGNATURE / NALU:</div>
                <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--emerald-status)' }}>
                  {ad.signature}
                </div>
              </div>

              {/* Features checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  PARSER CAPABILITIES:
                </div>
                {ad.features.map((f, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={12} color="var(--cyan-primary)" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
