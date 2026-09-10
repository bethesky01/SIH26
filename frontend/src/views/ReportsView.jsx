import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';

export default function ReportsView({ activeCase }) {
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [includeAI, setIncludeAI] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [includeRecovery, setIncludeRecovery] = useState(true);
  const [includeCustody, setIncludeCustody] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (activeCase) {
      setReportTitle(`Forensic Examination Report - ${activeCase.case_id}: ${activeCase.name}`);
      loadReports(activeCase.case_id);
    }
  }, [activeCase]);

  const loadReports = async (caseId) => {
    try {
      const data = await api.getReports(caseId);
      setReports(data || []);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!activeCase?.case_id) return;

    setIsGenerating(true);
    setNotification(null);

    try {
      const res = await api.generateReport({
        case_id: activeCase.case_id,
        title: reportTitle,
        include_ai_findings: includeAI,
        include_timeline: includeTimeline,
        include_recovery: includeRecovery,
        include_custody_ledger: includeCustody,
      });

      setNotification({
        type: 'success',
        text: `Official Digital Forensic PDF Report ${res.report_id} successfully compiled and sealed with SHA-256 hash!`,
      });
      await loadReports(activeCase.case_id);
    } catch (err) {
      setNotification({ type: 'danger', text: `Failed to generate report: ${err.message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              Automated Forensic Report Generation & Judicial Export Center
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
              Produces court-ready digital forensic PDF documentation (ISO/IEC 27037 & Section 65B Indian Evidence Act compliant), featuring cryptographic hash audits, chain-of-custody blocks, and verified examiner signatures.
            </p>
          </div>
          <div className="status-pill success">
            <FileText size={14} />
            <span>COURT ADMISSIBLE</span>
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

      {/* Report Generator Form */}
      <div className="forensic-card">
        <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--cyan-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} /> Compile New Judicial Examination Report
        </h3>

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Report Title</label>
            <input
              type="text"
              className="form-control"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              disabled={isGenerating}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, margin: '14px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeCustody}
                onChange={(e) => setIncludeCustody(e.target.checked)}
                disabled={isGenerating}
              />
              <span>Chain of Custody Ledger</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeTimeline}
                onChange={(e) => setIncludeTimeline(e.target.checked)}
                disabled={isGenerating}
              />
              <span>Synchronized Timeline</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeAI}
                onChange={(e) => setIncludeAI(e.target.checked)}
                disabled={isGenerating}
              />
              <span>AI Analytical Findings</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeRecovery}
                onChange={(e) => setIncludeRecovery(e.target.checked)}
                disabled={isGenerating}
              />
              <span>Carved Fragments Catalog</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button type="submit" className="btn btn-primary" disabled={isGenerating}>
              <Printer size={16} />
              {isGenerating ? 'Compiling PDF via ReportLab...' : 'Generate Official Forensic PDF Report'}
            </button>
          </div>
        </form>
      </div>

      {/* Available Reports List */}
      <div className="forensic-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cyan-primary)' }}>
            Sealed Forensic Reports Catalog ({reports?.length || 0})
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Each PDF sealed with cryptographic SHA-256 hash upon creation
          </span>
        </div>

        {reports && reports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reports.map((rep) => (
              <div
                key={rep.id || rep.report_id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <FileText size={18} color="var(--cyan-primary)" />
                      <span style={{ fontWeight: 700, fontSize: '0.96rem', color: '#ffffff' }}>
                        {rep.title}
                      </span>
                      <span className="hash-badge">{rep.report_id}</span>
                      <span className="status-pill success">SEALED</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Author: {rep.generated_by} • Timestamp: {new Date(rep.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Export and Download Actions */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <a
                      href={api.getReportPdfUrl(rep.report_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.78rem', textDecoration: 'none' }}
                    >
                      <Download size={14} /> Download PDF
                    </a>
                    <a
                      href={api.getReportJsonUrl(rep.report_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                    >
                      <FileCode size={14} /> JSON
                    </a>
                    <a
                      href={api.getReportCsvUrl(rep.report_id)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
                    >
                      <FileSpreadsheet size={14} /> CSV
                    </a>
                  </div>
                </div>

                {/* Report Hash Bar */}
                <div
                  style={{
                    background: 'rgba(6, 10, 18, 0.7)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    PDF INTEGRITY SHA-256:
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--cyan-primary)',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rep.hash_sha256}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No reports generated for this case yet. Click "Generate Official Forensic PDF Report" above.
          </div>
        )}
      </div>
    </div>
  );
}
