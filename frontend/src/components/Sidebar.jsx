import React from 'react';
import {
  LayoutDashboard,
  HardDriveDownload,
  Video,
  Clock,
  ShieldCheck,
  Blocks,
  FileSearch,
  FileText,
  Cpu,
  Lock,
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Metrics', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence Ingestion', icon: HardDriveDownload, badge: stats?.evidence_count },
    { id: 'player', label: 'Forensic Video & AI', icon: Video },
    { id: 'timeline', label: 'Unified Timeline', icon: Clock, badge: stats?.timeline_events_count },
    { id: 'integrity', label: 'Cryptographic Integrity', icon: ShieldCheck },
    { id: 'ledger', label: 'Chain of Custody Ledger', icon: Blocks, badge: stats?.custody_blocks_count },
    { id: 'recovery', label: 'Deleted Video Recovery', icon: FileSearch, badge: stats?.recovery_records_count },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
    { id: 'adapters', label: 'Hardware Adapters', icon: Cpu },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <div className="nav-section-title">Forensic Pipeline</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="protocol-card">
          <div className="protocol-header">
            <Lock size={13} />
            <span>ISO/IEC 27037 PROTOCOL</span>
          </div>
          <div className="protocol-desc">
            Dual SHA-256/MD5 hashing. Working copy isolated. Originals write-protected.
          </div>
        </div>
      </div>
    </aside>
  );
}
