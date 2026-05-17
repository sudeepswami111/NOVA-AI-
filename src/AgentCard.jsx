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
        background: active ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: `1px solid ${active ? 'var(--border-active)' : 'transparent'}`,
        borderRadius: '16px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'var(--bg-panel)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{
        fontSize: '20px',
        width: '32px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-panel)',
        borderRadius: '8px',
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
