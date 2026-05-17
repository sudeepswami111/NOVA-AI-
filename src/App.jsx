import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import { AGENTS, routeMessage, buildHandoff } from './agents.js';
import AgentCard from './AgentCard.jsx';
import ChatBubble from './ChatBubble.jsx';

const WELCOME = {
  role: 'bot',
  text: "👋 Hi! I'm your Business Assistant Router. Describe your task and I'll instantly route it to the right specialist agent — with a structured handoff summary.",
  time: now(),
};

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg = { role: 'user', text, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const agent = routeMessage(text);

      if (!agent) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: "🤔 I couldn't confidently route that request. Could you clarify what you need — are you looking for customer support, scheduling a meeting, doing research, processing a document, or creating social media content?",
          time: now(),
        }]);
        return;
      }

      setActiveAgent(agent.id);
      const handoff = buildHandoff(agent, text);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `Routing to **${agent.name}** ${agent.icon}`,
        handoff,
        time: now(),
      }]);
    }, 1200 + Math.random() * 600);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleQuickPrompt(prompt) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  const QUICK = [
    "A customer can't reset their password",
    "Schedule a team sync next Tuesday",
    "Research our top 3 competitors",
    "Summarize the uploaded contract PDF",
    "Write a LinkedIn post about our launch",
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,110,245,0.12), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(183,148,244,0.1), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Sidebar */}
      <aside style={{
        width: '260px', flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column',
        zIndex: 1, position: 'relative',
      }}>
        <div style={{ padding: '22px 18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #4c6ef5, #b794f4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', boxShadow: '0 0 16px rgba(76,110,245,0.4)',
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.01em' }}>AI NOVA</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Business Router Agent</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>
            Specialist Agents
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {AGENTS.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                active={activeAgent === agent.id}
                onClick={() => handleQuickPrompt(QUICK[AGENTS.findIndex(a => a.id === agent.id)])}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#68d391', display: 'inline-block', boxShadow: '0 0 6px #68d391' }} />
            Router online · 5 agents ready
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, minWidth: 0 }}>
        {/* Header */}
        <header style={{
          padding: '16px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(13,18,37,0.8)', backdropFilter: 'blur(12px)',
        }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Main Router Agent</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Routes your requests to the right specialist instantly</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {AGENTS.map(a => (
              <div key={a.id} title={a.name} style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: activeAgent === a.id ? `${a.color}30` : 'var(--bg-panel)',
                border: `1px solid ${activeAgent === a.id ? a.color + '60' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', transition: 'all 0.2s',
                boxShadow: activeAgent === a.id ? `0 0 10px ${a.color}40` : 'none',
              }}>{a.icon}</div>
            ))}
          </div>
        </header>

        {/* Chat */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {typing && <ChatBubble typing />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '0 28px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => handleQuickPrompt(q)} style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: '99px', padding: '5px 12px', fontSize: '12px',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {AGENTS[i]?.icon} {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 28px 20px' }}>
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-end',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '10px 14px',
            transition: 'border-color 0.2s',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Describe your task… e.g. 'A customer can't log in' or 'Schedule a meeting for Friday'"
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '14px', resize: 'none',
                lineHeight: 1.6, fontFamily: 'inherit', maxHeight: '120px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: input.trim()
                  ? 'linear-gradient(135deg, #4c6ef5, #7950f2)'
                  : 'var(--bg-panel-hover)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', transition: 'all 0.2s',
                boxShadow: input.trim() ? '0 0 14px rgba(76,110,245,0.4)' : 'none',
              }}
            >➤</button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
            Press <kbd style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px' }}>Enter</kbd> to send · <kbd style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px' }}>Shift+Enter</kbd> for new line
          </p>
        </div>
      </main>
    </div>
  );
}
