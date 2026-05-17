import React from 'react';

const colors = {
  support: '#63b3ed',
  meeting: '#68d391',
  research: '#b794f4',
  pdf: '#f6ad55',
  social: '#fc8181',
};

export default function AgentCard({ agent, active, onClick }) {
  const color = colors[agent.id];

  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}18, ${color}08)`
          : 'var(--bg-panel)',
        border: `1px solid ${active ? color + '60' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        width: '100%',
        boxShadow: active ? `0 0 20px ${color}20` : 'none',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'var(--bg-panel-hover)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'var(--bg-panel)';
      }}
    >
      <span style={{
        fontSize: '22px',
        width: '38px', height: '38px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}18`,
        borderRadius: '10px',
        flexShrink: 0,
      }}>{agent.icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '13px', color: active ? color : 'var(--text-primary)', lineHeight: 1.3 }}>
          {agent.name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.description}
        </div>
      </div>
    </button>
  );
}
