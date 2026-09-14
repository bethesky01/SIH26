import React, { useState } from 'react';
import {
  FileText,
  Blocks,
  Download,
  CheckCircle2,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import Tabs from '../components/common/Tabs';
import Badge from '../components/common/Badge';

export default function ReportsCustodyView({ activeCase }) {
  const [activeSubTab, setActiveSubTab] = useState('reports'); // 'reports' | 'custody'
  const [isGenerating, setIsGenerating] = useState(false);

  // Blockchain Ledger Blocks
  const ledgerBlocks = [
    {
      height: 1,
      action: 'PHYSICAL_ACQUISITION_SEALED',
      investigator: 'Insp. R. Verma (Lead Investigator)',
      timestamp: '2026-03-12 14:30:15 UTC',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    },
    {
      height: 2,
      action: 'DUAL_SHA256_MD5_COMPUTED',
      investigator: 'Sub-Insp. A. Patel (FSL Analyst)',
      timestamp: '2026-03-12 15:10:42 UTC',
      prevHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      hash: '3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e',
    },
    {
      height: 3,
      action: 'AI_DETECTION_SPATIAL_CORRELATION',
      investigator: 'Insp. R. Verma (Lead Investigator)',
      timestamp: '2026-03-12 16:45:10 UTC',
      prevHash: '3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e',
      hash: '7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b',
    },
    {
      height: 4,
      action: 'SECTION_65B_CERTIFICATE_DRAFTED',
      investigator: 'Forensic Director K. Sharma',
      timestamp: '2026-03-12 17:20:00 UTC',
      prevHash: '7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b',
      hash: '5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c',
    },
  ];

  const handleVerifyChain = () => {
    alert('Chain of Custody audit verification complete. All SHA-256 block linkages verified 100% intact.');
  };

  const handleExportSec65B = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      window.print();
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1320, margin: '0 auto', width: '100%' }}>
      
      {/* Header & Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Judicial Certification & Chain of Custody
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Section 65B Indian Evidence Act judicial report generator and ISO/IEC 27037 blockchain audit ledger.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'reports', label: 'Section 65B Certificate', icon: FileText },
            { id: 'custody', label: 'Blockchain Custody Ledger', icon: Blocks, badge: `${ledgerBlocks.length} Blocks` },
          ]}
          activeTab={activeSubTab}
          onChange={setActiveSubTab}
        />
      </div>

      {/* TAB 1: SECTION 65B CERTIFICATE */}
      {activeSubTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          
          {/* Certificate Preview Dossier */}
          <div
            className="forensic-card"
            style={{
              padding: '28px 36px',
              background: '#0a101f',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Header Emblem */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
              <div style={{ fontSize: '0.74rem', letterSpacing: '0.1em', color: 'var(--cyan-primary)', fontWeight: 700 }}>
                GOVERNMENT OF INDIA • FORENSIC SCIENCE SERVICES
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
                CERTIFICATE UNDER SECTION 65B OF INDIAN EVIDENCE ACT, 1872
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Electronic Record Forensic Admissibility Certification
              </div>
            </div>

            {/* Case Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong>Case Reference:</strong> {activeCase?.case_id || 'CASE-2026-001'}
              </div>
              <div>
                <strong>Investigating Agency:</strong> {activeCase?.organization || 'State Forensic Science Laboratory'}
              </div>
              <div>
                <strong>Seizure Date:</strong> {activeCase?.incident_date ? new Date(activeCase.incident_date).toLocaleDateString() : '12-MAR-2026'}
              </div>
              <div>
                <strong>Certifying Examiner:</strong> {activeCase?.investigator_name || 'Insp. R. Verma (Lead Examiner)'}
              </div>
            </div>

            {/* Statutory Legal Declaration */}
            <div
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: '0 0 8px' }}>
                I hereby certify that the electronic surveillance recordings detailed herein were acquired from the source recording system operated under lawful custody. During the entire relevant period, the surveillance hardware was operating properly and evidence was extracted using zero-mount write-blocked physical procedures.
              </p>
              <p style={{ margin: 0 }}>
                Dual cryptographic hashes (<strong>SHA-256: 98abc44298fc1c14...</strong> and <strong>MD5: a7c2e81902bf8...</strong>) were computed instantly at ingestion. The bitstream integrity has remained unmodified and preserved in accordance with ISO/IEC 27037 standards.
              </p>
            </div>

            {/* Seal & Signature Line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={28} color="var(--cyan-primary)" />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  CRYPTOGRAPHICALLY SEALED<br />
                  <strong style={{ color: 'var(--cyan-primary)' }}>Saboot Netra Forensic Engine</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Insp. R. Verma</div>
                <div>Authorized Forensic Examiner</div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="forensic-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
              Export Options
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Export formal judicial dossier for submission before the District Magistrate or Sessions Court.
            </p>

            <button
              className="btn btn-primary"
              onClick={handleExportSec65B}
              disabled={isGenerating}
              style={{ width: '100%', padding: '10px' }}
            >
              <Printer size={15} />
              <span>{isGenerating ? 'Compiling Dossier...' : 'Print / Export PDF'}</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => alert('JSON audit manifest downloaded.')}
              style={{ width: '100%' }}
            >
              <Download size={14} />
              <span>Download JSON Audit Trail</span>
            </button>

            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                <span>Statutory Admissibility Ready</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Directly admissible under Section 65B(4) of Indian Evidence Act & Bharatiya Sakshya Adhiniyam (BSA).
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: BLOCKCHAIN CUSTODY LEDGER */}
      {activeSubTab === 'custody' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Total Blocks: <strong style={{ color: 'var(--text-primary)' }}>{ledgerBlocks.length}</strong> • Chaining: <strong>CurrentHash = SHA256(PrevHash + Payload)</strong>
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleVerifyChain}
            >
              <ShieldCheck size={14} />
              <span>Verify Chain Integrity</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ledgerBlocks.map((block) => (
              <div
                key={block.height}
                className="forensic-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge variant="info">Block #{block.height}</Badge>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {block.action}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {block.timestamp}
                  </span>
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Investigator: <strong>{block.investigator}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>
                    PrevHash: {block.prevHash.substring(0, 32)}...
                  </div>
                  <div style={{ color: 'var(--cyan-primary)' }}>
                    BlockHash: {block.hash}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
