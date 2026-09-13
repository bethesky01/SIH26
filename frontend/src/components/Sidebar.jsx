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
    { id: 'evidence', label: 'Evidence Videos', icon: FolderOpen, badge: stats?.evidence_count },
    { id: 'player', label: 'Video Player & AI', icon: Video },
    { id: 'timeline', label: 'Camera Timeline', icon: Clock, badge: stats?.timeline_events_count },
    { id: 'integrity', label: 'Tamper Verification', icon: ShieldCheck },
    { id: 'ledger', label: 'Audit History', icon: Blocks, badge: stats?.custody_blocks_count },
    { id: 'recovery', label: 'Deleted Video Recovery', icon: FileSearch, badge: stats?.recovery_records_count },
    { id: 'reports', label: 'Court Reports', icon: FileText },
    { id: 'adapters', label: 'Hardware Adapters', icon: Cpu },
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
