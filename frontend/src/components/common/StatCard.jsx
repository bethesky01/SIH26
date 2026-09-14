import React from 'react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  status = 'default', // 'default' | 'success' | 'warning' | 'danger' | 'info'
  onClick,
}) {
  const statusColors = {
    default: { color: 'var(--text-primary)', bg: 'rgba(255, 255, 255, 0.04)', border: 'var(--border-subtle)' },
    success: { color: '#34d399', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)' },
    warning: { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' },
    danger: { color: '#f87171', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' },
    info: { color: 'var(--cyan-primary)', bg: 'rgba(0, 229, 255, 0.08)', border: 'rgba(0, 229, 255, 0.25)' },
  };

  const currentTheme = statusColors[status] || statusColors.default;

  return (
    <div
      className="forensic-card stat-card"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: currentTheme.bg,
            border: `1px solid ${currentTheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentTheme.color,
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.74rem', color: currentTheme.color, marginTop: 2 }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
