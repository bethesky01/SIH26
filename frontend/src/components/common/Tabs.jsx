import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 4,
        gap: 4,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isActive ? 'var(--cyan-glow)' : 'transparent',
              color: isActive ? 'var(--cyan-primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
          >
            {Icon && <Icon size={14} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? 'var(--cyan-primary)' : 'var(--text-muted)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
