import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Video,
  ShieldAlert,
  FileText,
  Lock,
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, stats }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Case metrics & health',
    },
    {
      id: 'evidence',
      label: 'Evidence & Devices',
      icon: FolderOpen,
      desc: 'Catalog & filesystems',
      badge: stats?.total_evidence,
    },
    {
      id: 'video',
      label: 'Video Studio & AI',
      icon: Video,
      desc: 'Synchronized player & AI',
    },
    {
      id: 'lab',
      label: 'Forensic Lab',
      icon: ShieldAlert,
      desc: 'Tamper audit & carving',
      badge: stats?.integrity_status === 'COMPROMISED' ? 'ALERT' : null,
      badgeVariant: stats?.integrity_status === 'COMPROMISED' ? 'danger' : 'neutral',
    },
    {
      id: 'reports',
      label: 'Custody & Reports',
      icon: FileText,
      desc: 'Chain of custody & Sec 65B',
      badge: stats?.custody_blocks_count,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        <div className="nav-section-title">Forensic Workstation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              role="button"
              tabIndex={0}
            >
              <Icon size={18} />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.86rem', fontWeight: isActive ? 600 : 500 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {item.desc}
                </span>
              </div>
              {item.badge !== undefined && item.badge !== null && (
                <span
                  className="nav-badge"
                  style={
                    item.badgeVariant === 'danger'
                      ? { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 700 }
                      : {}
                  }
                >
                  {item.badge}
                </span>
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
            Write-blocked physical ingestion & dual SHA-256 + MD5 cryptographic validation active.
          </div>
        </div>
      </div>
    </aside>
  );
}
