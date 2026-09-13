import React from 'react';
import {
  LayoutDashboard,
  Video,
  Clock,
  ShieldCheck,
  Blocks,
  FileSearch,
  FileText,
  Cpu,
  Lock,
  FolderOpen,
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'adapters', label: 'Device & Filesystem', icon: Cpu, tag: 'Mod 1 & 3' },
    { id: 'evidence', label: 'Forensic Acquisition', icon: FolderOpen, tag: 'Mod 2' },
    { id: 'player', label: 'Video Extraction & AI', icon: Video, tag: 'Mod 4 & 8' },
    { id: 'recovery', label: 'Deleted Video Recovery', icon: FileSearch, tag: 'Mod 5' },
    { id: 'timeline', label: 'Multi-Camera Timeline', icon: Clock, tag: 'Mod 6 & 7', badge: stats?.timeline_events_count },
    { id: 'integrity', label: 'Tamper & Integrity Scan', icon: ShieldCheck, tag: 'Mod 9' },
    { id: 'ledger', label: 'Chain of Custody', icon: Blocks, tag: 'Mod 10', badge: stats?.custody_blocks_count },
    { id: 'reports', label: 'Court Reports', icon: FileText, tag: 'Mod 11' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
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
              {item.tag && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: 'rgba(0, 229, 255, 0.15)',
                    color: 'var(--cyan-primary)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                  }}
                >
                  {item.tag}
                </span>
              )}
              {item.badge !== undefined && item.badge !== null && item.badge > 0 && !item.tag && (
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
            <span>SECURE FORENSIC MODE</span>
          </div>
          <div className="protocol-desc">
            All evidence is read-only locked and verified with SHA-256 cryptographic hashes.
          </div>
        </div>
      </div>
    </aside>
  );
}
