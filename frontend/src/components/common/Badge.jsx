import React from 'react';

export default function Badge({
  variant = 'info', // 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children,
  icon: Icon,
  className = '',
  style = {},
}) {
  return (
    <span className={`status-pill ${variant} ${className}`} style={style}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
