import React, { useState, useRef, useEffect } from 'react';
import {
  searchDocuments,
  searchFaq,
  generateTicketId,
  getPriority,
} from './data/knowledgeBase.js';

const PRIORITY_COLORS = {
  Low: { color: '#68d391', bg: 'rgba(104,211,145,0.12)', border: 'rgba(104,211,145,0.3)' },
  Medium: { color: '#f6ad55', bg: 'rgba(246,173,85,0.12)', border: 'rgba(246,173,85,0.3)' },
  High: { color: '#fc8181', bg: 'rgba(252,129,129,0.12)', border: 'rgba(252,129,129,0.3)' },
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
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      borderLeft: `2px solid ${step.status === 'done' ? '#68d391' : '#63b3ed'}`,
      marginBottom: '6px',
      animation: 'fadeSlide 0.3s ease',
    }}>
      <span style={{ fontSize: '14px' }}>{icons[step.tool]}</span>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#a0aec0', fontFamily: 'monospace' }}>
          {labels[step.tool]}
          <span style={{
            marginLeft: '8px', fontSize: '10px', fontWeight: 700,
            color: step.status === 'done' ? '#68d391' : '#63b3ed',
          }}>
            {step.status === 'done' ? '✓ done' : '⟳ running'}
          </span>
        </div>
        {step.result && (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{step.result}</div>
        )}
      </div>
    </div>
  );
}

function ResponseCard({ msg }) {
  const pColors = msg.ticket ? PRIORITY_COLORS[msg.ticket.priority] : null;

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      animation: 'fadeSlide 0.3s ease',
    }}>
      {/* Tool call trace */}
      {msg.steps?.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Tool Call Sequence
          </div>
          {msg.steps.map((s, i) => <ToolStep key={i} step={s} />)}
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />

      {/* Answer */}
      <div style={{ marginBottom: '12px' }}>
        <Label>Answer</Label>
        <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)' }}>{msg.answer}</p>
      </div>

      {/* Source */}
      <div style={{ marginBottom: msg.ticket ? '12px' : '0' }}>
        <Label>Source</Label>
        {msg.source ? (
          <span style={{
            fontSize: '12px', background: 'rgba(99,179,237,0.1)',
            border: '1px solid rgba(99,179,237,0.3)', borderRadius: '6px',
            padding: '3px 10px', color: '#63b3ed',
          }}>📄 {msg.source}</span>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Ticket */}
      {msg.ticket && (
        <div style={{ marginTop: '12px' }}>
          <Label>Ticket Created</Label>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(104,211,145,0.08)', border: '1px solid rgba(104,211,145,0.25)',
            borderRadius: '8px', padding: '8px 14px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#68d391' }}>✓ {msg.ticket.id}</span>
            <span style={{
              fontSize: '11px', fontWeight: 700,
              background: pColors.bg, border: `1px solid ${pColors.border}`,
              borderRadius: '99px', padding: '2px 8px', color: pColors.color,
            }}>{msg.ticket.priority} Priority</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
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
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(104,211,145,0.1), transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,179,237,0.1), transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Sidebar */}
      <aside style={{
        width: '270px', flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column',
        zIndex: 1, padding: '22px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #63b3ed, #68d391)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', boxShadow: '0 0 16px rgba(99,179,237,0.4)',
          }}>🎧</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>Support Agent</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>AI NOVA · Customer Help</div>
          </div>
        </div>

        {/* Customer name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
            Customer Name (optional)
          </label>
          <input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="e.g. John Doe"
            style={{
              width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: '13px', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Tool pipeline */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Tool Pipeline
          </div>
          {[
            { icon: '📁', label: 'search_documents()', desc: 'Product docs & past tickets' },
            { icon: '❓', label: 'search_faq()', desc: 'FAQs, pricing & policies' },
            { icon: '🎫', label: 'create_support_ticket()', desc: 'Escalate if no answer found' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'var(--bg-panel)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', flexShrink: 0, fontWeight: 700, color: 'var(--text-secondary)',
              }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{t.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Priority legend */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Ticket Priority
          </div>
          {Object.entries(PRIORITY_COLORS).map(([label, c]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 0 0', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#68d391', display: 'inline-block', boxShadow: '0 0 6px #68d391', marginRight: '6px' }} />
          Support agent online
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, minWidth: 0 }}>
        {/* Header */}
        <header style={{
          padding: '16px 28px', borderBottom: '1px solid var(--border)',
          background: 'rgba(13,18,37,0.85)', backdropFilter: 'blur(12px)',
        }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Customer Support</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Searches docs → FAQs → creates ticket if no answer found
          </p>
        </header>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎧</div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>How can we help you?</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                Ask any question. I'll search the knowledge base before escalating.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '560px', margin: '0 auto' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }} style={{
                    background: 'var(--bg-panel)', border: '1px solid var(--border)',
                    borderRadius: '99px', padding: '7px 14px', fontSize: '13px',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(99,179,237,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '20px', animation: 'fadeSlide 0.3s ease' }}>
              {msg.role === 'user' ? (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #4c6ef5, #7950f2)',
                      borderRadius: 'var(--radius) 0 var(--radius) var(--radius)',
                      padding: '12px 16px', fontSize: '14px', lineHeight: 1.6,
                    }}>{msg.text}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>{msg.time}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #63b3ed, #68d391)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                    boxShadow: '0 0 12px rgba(99,179,237,0.35)',
                  }}>🎧</div>
                  <div style={{ flex: 1 }}>
                    <ResponseCard msg={msg} />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{msg.time}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Live steps while processing */}
          {loading && stepsLive.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #63b3ed, #68d391)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
              }}>🎧</div>
              <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  Searching knowledge base…
                </div>
                {stepsLive.map((s, i) => <ToolStep key={i} step={s} />)}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 28px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-end',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '10px 14px',
            transition: 'border-color 0.2s',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(99,179,237,0.4)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a customer support question…"
              rows={1}
              disabled={loading}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '14px', resize: 'none',
                lineHeight: 1.6, fontFamily: 'inherit', maxHeight: '120px',
                opacity: loading ? 0.5 : 1,
              }}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #63b3ed, #68d391)'
                : 'var(--bg-panel-hover)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', transition: 'all 0.2s',
              boxShadow: input.trim() && !loading ? '0 0 14px rgba(99,179,237,0.4)' : 'none',
            }}>➤</button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
            Searches docs → FAQs → escalates to ticket if no answer found
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
