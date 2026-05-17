import React, { useState, useRef, useEffect } from 'react';
import {
  searchDocuments,
  searchFaq,
  generateTicketId,
  getPriority,
} from './data/knowledgeBase.js';

const PRIORITY_COLORS = {
  Low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  High: { color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
};

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runSupportPipeline(query) {
  const steps = [];

  // Step 1: search_documents
  steps.push({ tool: 'search_documents', query, status: 'running' });
  await sleep(600);
  const docResult = searchDocuments(query);
  steps[0].status = 'done';
  steps[0].result = docResult ? `Found in: ${docResult.section}` : 'No match';

  if (docResult) {
    return { steps, answer: docResult.content, source: docResult.section, ticket: null };
  }

  // Step 2: search_faq
  steps.push({ tool: 'search_faq', query, status: 'running' });
  await sleep(600);
  const faqResult = searchFaq(query);
  steps[1].status = 'done';
  steps[1].result = faqResult ? `Found in: ${faqResult.section}` : 'No match';

  if (faqResult) {
    return { steps, answer: faqResult.content, source: faqResult.section, ticket: null };
  }

  // Step 3: create_support_ticket
  const priority = getPriority(query);
  const ticketId = generateTicketId();
  steps.push({ tool: 'create_support_ticket', query, status: 'running' });
  await sleep(700);
  steps[2].status = 'done';
  steps[2].result = `Ticket ${ticketId} created (${priority} priority)`;

  return {
    steps,
    answer: "I don't have that information in my knowledge base. I'll create a support ticket so the right team can follow up with you.",
    source: null,
    ticket: { id: ticketId, priority },
  };
}

const SUGGESTIONS = [
  'How do I reset my password?',
  'What is your refund policy?',
  'Do you support Slack integration?',
  'How much does the Pro plan cost?',
  'Is my data encrypted?',
  'How do I delete my account?',
];

function ToolStep({ step }) {
  const icons = { search_documents: '📁', search_faq: '❓', create_support_ticket: '🎫' };
  const labels = { search_documents: 'search_documents()', search_faq: 'search_faq()', create_support_ticket: 'create_support_ticket()' };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.04)',
      borderLeft: `3px solid ${step.status === 'done' ? '#10b981' : '#3b82f6'}`,
      marginBottom: '8px',
      animation: 'fadeSlide 0.3s ease',
    }}>
      <span style={{ fontSize: '15px' }}>{icons[step.tool]}</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {labels[step.tool]}
          <span style={{
            marginLeft: '8px', fontSize: '11px', fontWeight: 600,
            color: step.status === 'done' ? '#10b981' : '#3b82f6',
          }}>
            {step.status === 'done' ? '✓ done' : '⟳ running'}
          </span>
        </div>
        {step.result && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{step.result}</div>
        )}
      </div>
    </div>
  );
}

function ResponseCard({ msg }) {
  const pColors = msg.ticket ? PRIORITY_COLORS[msg.ticket.priority] : null;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '24px',
      animation: 'fadeSlide 0.3s ease',
    }}>
      {/* Tool call trace */}
      {msg.steps?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
            Tool Call Sequence
          </div>
          {msg.steps.map((s, i) => <ToolStep key={i} step={s} />)}
        </div>
      )}

      {msg.steps?.length > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />}

      {/* Answer */}
      <div style={{ marginBottom: '16px' }}>
        <Label>Answer</Label>
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 400 }}>{msg.answer}</p>
      </div>

      {/* Source */}
      <div style={{ marginBottom: msg.ticket ? '16px' : '0' }}>
        <Label>Source</Label>
        {msg.source ? (
          <span style={{
            fontSize: '13px', background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px',
            padding: '4px 12px', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>📄 {msg.source}</span>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Ticket */}
      {msg.ticket && (
        <div style={{ marginTop: '16px' }}>
          <Label>Ticket Created</Label>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '12px', padding: '10px 16px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>✓ {msg.ticket.id}</span>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              background: pColors.bg, border: `1px solid ${pColors.border}`,
              borderRadius: '99px', padding: '4px 10px', color: pColors.color,
            }}>{msg.ticket.priority} Priority</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
      {children}
    </div>
  );
}

export default function SupportAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [stepsLive, setStepsLive] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stepsLive]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);
    setStepsLive([]);

    const userMsg = { role: 'user', text, time: now() };
    setMessages(prev => [...prev, userMsg]);

    // Run pipeline step by step, updating stepsLive
    const steps = [];

    // Step 1
    const s1 = { tool: 'search_documents', status: 'running' };
    steps.push(s1); setStepsLive([...steps]);
    await sleep(700);
    const docResult = searchDocuments(text);
    s1.status = 'done';
    s1.result = docResult ? `Found in: ${docResult.section}` : 'No match';
    setStepsLive([...steps]);

    if (docResult) {
      await sleep(300);
      setStepsLive([]);
      setLoading(false);
      setMessages(prev => [...prev, {
        role: 'bot', time: now(), steps: [...steps],
        answer: docResult.content, source: docResult.section, ticket: null,
      }]);
      return;
    }

    // Step 2
    const s2 = { tool: 'search_faq', status: 'running' };
    steps.push(s2); setStepsLive([...steps]);
    await sleep(700);
    const faqResult = searchFaq(text);
    s2.status = 'done';
    s2.result = faqResult ? `Found in: ${faqResult.section}` : 'No match';
    setStepsLive([...steps]);

    if (faqResult) {
      await sleep(300);
      setStepsLive([]);
      setLoading(false);
      setMessages(prev => [...prev, {
        role: 'bot', time: now(), steps: [...steps],
        answer: faqResult.content, source: faqResult.section, ticket: null,
      }]);
      return;
    }

    // Step 3
    const s3 = { tool: 'create_support_ticket', status: 'running' };
    steps.push(s3); setStepsLive([...steps]);
    await sleep(800);
    const priority = getPriority(text);
    const ticketId = generateTicketId();
    s3.status = 'done';
    s3.result = `Ticket ${ticketId} created (${priority} priority)`;
    setStepsLive([...steps]);

    await sleep(300);
    setStepsLive([]);
    setLoading(false);
    setMessages(prev => [...prev, {
      role: 'bot', time: now(), steps: [...steps],
      answer: "I don't have that information in my knowledge base. I'll create a support ticket so the right team can follow up with you.",
      source: null,
      ticket: { id: ticketId, priority },
    }]);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar */}
      <aside style={{
        width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column',
        zIndex: 1, padding: '32px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>🎧</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Support Agent</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI NOVA Workspace</div>
          </div>
        </div>

        {/* Customer name */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
            Customer Name
          </label>
          <input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="e.g. Jane Doe"
            style={{
              width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)',
              padding: '8px 0', color: 'var(--text-primary)',
              fontSize: '14px', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderBottomColor = 'var(--text-secondary)'}
            onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
          />
        </div>

        {/* Tool pipeline */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Pipeline
          </div>
          {[
            { icon: '📁', label: 'search_documents()', desc: 'Docs & Tickets' },
            { icon: '❓', label: 'search_faq()', desc: 'Pricing & Policies' },
            { icon: '🎫', label: 'create_ticket()', desc: 'Escalation' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', opacity: 0.8 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', flexShrink: 0,
              }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Priority legend */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Ticket Priority
          </div>
          {Object.entries(PRIORITY_COLORS).map(([label, c]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '8px' }} />
          Online
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, minWidth: 0, background: 'var(--bg-surface)' }}>
        {/* Header */}
        <header style={{
          padding: '24px 40px', borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Customer Support</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Intelligent routing and knowledge base search
          </p>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.8 }}>👋</div>
              <h2 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-primary)' }}>How can we help?</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
                Ask a question, and I'll search the knowledge base before escalating.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '640px', margin: '0 auto' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: '99px', padding: '10px 20px', fontSize: '14px',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-panel)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '32px', animation: 'fadeSlide 0.3s ease' }}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      background: 'var(--bg-panel)', border: '1px solid var(--border)',
                      borderRadius: '20px 20px 4px 20px',
                      padding: '16px 20px', fontSize: '15px', lineHeight: 1.6,
                      color: 'var(--text-primary)'
                    }}>{msg.text}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>{msg.time}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: 'var(--bg-deep)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>🤖</div>
                  <div style={{ flex: 1, maxWidth: '85%' }}>
                    <ResponseCard msg={msg} />
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{msg.time}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Live steps while processing */}
          {loading && stepsLive.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: 'var(--bg-deep)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>🤖</div>
              <div style={{ flex: 1, maxWidth: '85%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                  Searching knowledge base…
                </div>
                {stepsLive.map((s, i) => <ToolStep key={i} step={s} />)}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '24px 40px 40px', background: 'var(--bg-surface)' }}>
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
              placeholder="Message Support Agent..."
              rows={1}
              disabled={loading}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '15px', resize: 'none',
                lineHeight: 1.6, fontFamily: 'inherit', maxHeight: '120px',
                padding: '4px', opacity: loading ? 0.5 : 1,
              }}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} style={{
              width: '40px', height: '40px', borderRadius: '16px', flexShrink: 0,
              background: input.trim() && !loading ? 'var(--text-primary)' : 'var(--bg-panel)',
              color: input.trim() && !loading ? 'var(--bg-deep)' : 'var(--text-muted)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', transition: 'all 0.2s',
            }}>↑</button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
            Support agent may produce inaccurate information.
          </p>
        </div>
      </main>
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
