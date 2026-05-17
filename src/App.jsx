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
      {/* Sidebar */}
      <aside style={{
        width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column',
        zIndex: 1, padding: '32px 24px', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Main Router</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI NOVA Workspace</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Available Agents
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

        <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '8px' }} />
          Online · {AGENTS.length} ready
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, minWidth: 0, background: 'var(--bg-surface)' }}>
        {/* Header */}
        <header style={{
          padding: '24px 40px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-surface)',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Main Router</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Routes your requests to the right specialist instantly</p>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          {typing && <ChatBubble typing />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '0 40px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => handleQuickPrompt(q)} style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '99px', padding: '8px 16px', fontSize: '13px',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-panel)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {AGENTS[i]?.icon} {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '16px 40px 40px' }}>
          <div style={{
            display: 'flex', gap: '12px', alignItems: 'flex-end',
            background: 'var(--bg-deep)', border: '1px solid var(--border)',
            borderRadius: '24px', padding: '12px 16px',
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
              placeholder="Describe your task… e.g. 'A customer can't log in' or 'Schedule a meeting'"
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '15px', resize: 'none',
                lineHeight: 1.6, fontFamily: 'inherit', maxHeight: '120px',
                padding: '4px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '40px', height: '40px', borderRadius: '16px', flexShrink: 0,
                background: input.trim() ? 'var(--text-primary)' : 'var(--bg-panel)',
                color: input.trim() ? 'var(--bg-deep)' : 'var(--text-muted)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', transition: 'all 0.2s',
              }}
            >↑</button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
            Press <kbd style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontFamily: 'inherit' }}>Enter</kbd> to send
          </p>
        </div>
      </main>
    </div>
  );
}
