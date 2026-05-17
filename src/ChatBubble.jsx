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
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '20px 24px',
      marginTop: '12px',
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
    <div style={{ marginBottom: '12px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
      <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.5, fontWeight: 500 }}>{value}</p>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{children}</div>;
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
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <BotAvatar />
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px 20px 20px 20px' }}>
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
      gap: '16px',
      marginBottom: '24px',
      animation: 'fadeSlide 0.3s ease',
    }}>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {!isUser && <BotAvatar />}
      <div style={{ maxWidth: '85%' }}>
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: isUser
            ? '20px 20px 4px 20px'
            : '4px 20px 20px 20px',
          padding: '16px 20px',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
        }}>
          {msg.text}
        </div>
        {msg.handoff && <HandoffCard handoff={msg.handoff} />}
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: isUser ? 'right' : 'left' }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
      background: 'var(--bg-deep)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '18px'
    }}>⚡</div>
  );
}
