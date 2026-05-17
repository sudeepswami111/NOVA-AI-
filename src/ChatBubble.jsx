import React from 'react';

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '14px 18px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'var(--accent-blue)',
          display: 'block',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function HandoffCard({ handoff }) {
  const c = handoff.agent.color;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${c}12, ${c}06)`,
      border: `1px solid ${c}40`,
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      marginTop: '12px',
      boxShadow: `0 0 24px ${c}15`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ fontSize: '20px' }}>{handoff.agent.icon}</span>
        <span style={{ fontWeight: 700, color: c, fontSize: '14px' }}>{handoff.agent.name}</span>
        {handoff.requiresApproval && (
          <span style={{
            marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
            background: '#f6ad5520', color: '#f6ad55',
            border: '1px solid #f6ad5540', borderRadius: '99px',
            padding: '2px 10px',
          }}>⚠ Needs Approval</span>
        )}
      </div>

      <Row label="Agent" value={handoff.agent.name} color={c} />
      <Row label="Task Summary" value={handoff.taskSummary} color={c} />
      <div style={{ marginTop: '10px' }}>
        <Label>Key Inputs</Label>
        {handoff.keyInputs.map((inp, i) => (
          <Chip key={i} text={inp} color={c} />
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <Label>Missing Inputs</Label>
        {handoff.missingInputs.map((inp, i) => (
          <Chip key={i} text={inp} color={handoff.missingInputs[0] === 'None — all inputs available' ? '#68d391' : '#f6ad55'} />
        ))}
      </div>
      {handoff.requiresApproval && (
        <div style={{
          marginTop: '14px', padding: '10px 14px',
          background: '#f6ad5510', border: '1px solid #f6ad5530',
          borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#f6ad55',
        }}>
          🔐 {handoff.approvalReason}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{children}</div>;
}

function Chip({ text, color }) {
  return (
    <div style={{
      display: 'inline-block', marginRight: '6px', marginBottom: '6px',
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: '6px', padding: '4px 10px',
      fontSize: '12px', color: 'var(--text-primary)',
    }}>{text}</div>
  );
}

export default function ChatBubble({ msg, typing }) {
  if (typing) {
    return (
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
        <BotAvatar />
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '0 var(--radius) var(--radius) var(--radius)' }}>
          <TypingDots />
        </div>
      </div>
    );
  }

  const isUser = msg.role === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '10px',
      marginBottom: '18px',
      animation: 'fadeSlide 0.3s ease',
    }}>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {!isUser && <BotAvatar />}
      <div style={{ maxWidth: '75%' }}>
        <div style={{
          background: isUser
            ? 'linear-gradient(135deg, #4c6ef5, #7950f2)'
            : 'var(--bg-panel)',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser
            ? 'var(--radius) 0 var(--radius) var(--radius)'
            : '0 var(--radius) var(--radius) var(--radius)',
          padding: '12px 16px',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
        }}>
          {msg.text}
        </div>
        {msg.handoff && <HandoffCard handoff={msg.handoff} />}
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: isUser ? 'right' : 'left' }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div style={{
      width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #4c6ef5, #b794f4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '16px', boxShadow: '0 0 12px rgba(76,110,245,0.4)',
    }}>🤖</div>
  );
}
