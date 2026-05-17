import React, { useState, useRef, useEffect } from 'react';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_COMPETITORS = {
  openai: {
    name: 'OpenAI',
    updates: [
      { type: 'Product Launch', text: 'Released GPT-4o with native multimodal capabilities including real-time voice, image, and video understanding.', sources: ['https://openai.com/blog/gpt-4o', 'https://techcrunch.com/2024/05/13/openai-gpt-4o'], confirmed: true },
      { type: 'Pricing Change', text: 'Reduced API pricing by 50% for GPT-4o vs GPT-4 Turbo, aggressively targeting enterprise developers.', sources: ['https://openai.com/pricing', 'https://venturebeat.com/ai/openai-cuts-prices'], confirmed: true },
      { type: 'Partnership', text: 'Deepened Microsoft Azure integration with dedicated OpenAI model deployments in 10 new regions.', sources: ['https://azure.microsoft.com/blog/openai-partnership'], confirmed: false },
      { type: 'Hiring Signal', text: 'Posted 40+ roles in enterprise sales and go-to-market, signaling a B2B push.', sources: ['https://openai.com/careers', 'https://linkedin.com/company/openai/jobs'], confirmed: true },
    ],
    whyItMatters: 'The 50% price cut puts pressure on competitors to match margins. The multimodal push signals OpenAI is targeting workflows beyond text.',
    action: 'Audit your API cost model — if using OpenAI, renegotiate enterprise contracts to capture new pricing immediately.',
    confidence: 'High',
    date: 'May 17, 2026',
  },
  anthropic: {
    name: 'Anthropic',
    updates: [
      { type: 'Product Launch', text: 'Claude 3.5 Sonnet launched with 200K context window and improved coding benchmarks, outperforming GPT-4o on SWE-bench.', sources: ['https://anthropic.com/claude', 'https://theverge.com/anthropic-claude-3-5'], confirmed: true },
      { type: 'Pricing Change', text: 'Introduced Claude Haiku at $0.25/M tokens — the most aggressive pricing in the frontier model space.', sources: ['https://anthropic.com/api', 'https://artificialanalysis.ai/pricing'], confirmed: true },
      { type: 'Marketing Shift', text: 'New brand campaign "AI Safety First" targeting regulated industries (finance, healthcare, legal).', sources: ['https://anthropic.com/news'], confirmed: false },
      { type: 'Funding', text: 'Raised $2.75B Series E led by Google, valuing the company at $18.4B.', sources: ['https://reuters.com/anthropic-funding', 'https://bloomberg.com/anthropic-series-e'], confirmed: true },
    ],
    whyItMatters: 'Haiku pricing undercuts most alternatives for high-volume tasks. The safety positioning gives them differentiated access to compliance-heavy verticals.',
    action: 'Evaluate Claude Haiku for cost-sensitive pipelines and monitor Anthropic\'s enterprise sales motion in regulated sectors.',
    confidence: 'High',
    date: 'May 17, 2026',
  },
  google: {
    name: 'Google DeepMind',
    updates: [
      { type: 'Product Launch', text: 'Gemini 1.5 Pro supports 1M token context — 5x more than any competitor — enabling full codebase or book-length analysis.', sources: ['https://deepmind.google/gemini', 'https://wired.com/gemini-context-window'], confirmed: true },
      { type: 'Integration', text: 'Gemini natively integrated into Google Workspace (Docs, Gmail, Sheets), reaching 3B+ existing users immediately.', sources: ['https://workspace.google.com/blog/gemini', 'https://cnbc.com/google-workspace-ai'], confirmed: true },
      { type: 'Hiring Signal', text: 'Acquired 3 AI safety startups in Q1 2026. [Unconfirmed — single source]', sources: ['https://techcrunch.com/google-acquisitions-2026'], confirmed: false },
      { type: 'Pricing Change', text: 'Gemini API free tier expanded to 15 RPM with 1M context — likely a developer acquisition play.', sources: ['https://ai.google.dev/pricing', 'https://thenewstack.io/google-gemini-free-tier'], confirmed: true },
    ],
    whyItMatters: '1M context and Workspace integration gives Google an insurmountable distribution advantage for enterprise document workflows.',
    action: 'Track customer accounts heavily invested in Google Workspace — they may be targeted for Gemini upsell before your contract renewal.',
    confidence: 'Medium',
    date: 'May 17, 2026',
  },
  mistral: {
    name: 'Mistral AI',
    updates: [
      { type: 'Product Launch', text: 'Mistral Large 2 released as open-weights model, matching GPT-4 on MMLU while being freely deployable on-premise.', sources: ['https://mistral.ai/news/mistral-large-2', 'https://huggingface.co/mistralai'], confirmed: true },
      { type: 'Partnership', text: 'Microsoft invested €15M and added Mistral models to Azure AI catalog alongside OpenAI.', sources: ['https://ft.com/mistral-microsoft', 'https://azure.microsoft.com/mistral'], confirmed: true },
      { type: 'Marketing Shift', text: 'Pivoting messaging to "European AI sovereignty" — targeting EU enterprises wary of US data laws.', sources: ['https://mistral.ai/blog'], confirmed: false },
      { type: 'Hiring Signal', text: 'Headcount grew from 20 to 200+ in 12 months — rapid scaling across engineering and sales.', sources: ['https://linkedin.com/company/mistral-ai', 'https://wired.com/mistral-growth'], confirmed: true },
    ],
    whyItMatters: 'Open-weights + Microsoft distribution is a credible challenger to closed APIs. EU data sovereignty angle is resonating with European customers.',
    action: 'For EU customers, proactively address data residency and sovereignty concerns before Mistral\'s sales team does.',
    confidence: 'Medium',
    date: 'May 17, 2026',
  },
};

const CONFIDENCE_COLORS = {
  High: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  Low: { color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
};

const TYPE_COLORS = {
  'Product Launch': '#3b82f6',
  'Pricing Change': '#10b981',
  'Partnership': '#8b5cf6',
  'Hiring Signal': '#f59e0b',
  'Marketing Shift': '#ec4899',
  'Funding': '#06b6d4',
  'Integration': '#a78bfa',
};

// ─── Tool step ────────────────────────────────────────────────────────────────
function ToolStep({ step }) {
  const icons = { search_web: '🔍', scrape_webpage: '🌐', summarize_research: '📝', save_competitor_report: '💾' };
  const done = step.status === 'done';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
      borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)',
      borderLeft: `3px solid ${done ? '#10b981' : '#3b82f6'}`,
      marginBottom: '8px', animation: 'fadeSlide 0.3s ease',
    }}>
      <span style={{ fontSize: '15px' }}>{icons[step.tool]}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {step.tool}()
          <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 600, color: done ? '#10b981' : '#3b82f6' }}>
            {done ? '✓ done' : '⟳ running'}
          </span>
        </div>
        {step.result && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{step.result}</div>}
      </div>
    </div>
  );
}

// ─── Report card ──────────────────────────────────────────────────────────────
function ReportCard({ data }) {
  const [expanded, setExpanded] = useState(true);
  const conf = CONFIDENCE_COLORS[data.confidence];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
      borderRadius: '20px', marginBottom: '20px', overflow: 'hidden',
      animation: 'fadeSlide 0.3s ease',
    }}>
      {/* Header */}
      <button onClick={() => setExpanded(e => !e)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'inherit',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>{data.name}</div>
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '99px',
            background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color,
          }}>{data.confidence} Confidence</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{data.date}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 24px 24px' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '20px' }} />

          {/* Updates */}
          <SectionLabel>What Changed</SectionLabel>
          <div style={{ marginBottom: '20px' }}>
            {data.updates.map((u, i) => (
              <div key={i} style={{
                display: 'flex', gap: '14px', padding: '14px 16px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '12px', marginBottom: '8px',
              }}>
                <span style={{
                  flexShrink: 0, fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                  borderRadius: '99px', height: 'fit-content', marginTop: '1px',
                  background: `${TYPE_COLORS[u.type] || '#6b7280'}18`,
                  color: TYPE_COLORS[u.type] || '#6b7280',
                  border: `1px solid ${TYPE_COLORS[u.type] || '#6b7280'}30`,
                  whiteSpace: 'nowrap',
                }}>{u.type}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                    {u.text}
                    {!u.confirmed && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                        [Unconfirmed — single source]
                      </span>
                    )}
                  </p>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {u.sources.map((src, j) => (
                      <span key={j} style={{
                        fontSize: '11px', color: '#3b82f6',
                        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: '6px', padding: '2px 10px',
                      }}>🔗 {new URL(src).hostname}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Why it matters */}
          <SectionLabel>Why It Matters</SectionLabel>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '20px' }}>
            {data.whyItMatters}
          </p>

          {/* Action */}
          <SectionLabel>Recommended Action</SectionLabel>
          <div style={{
            padding: '14px 18px', background: 'rgba(59,130,246,0.05)',
            border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', marginBottom: '20px',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
              → {data.action}
            </p>
          </div>

          {/* Sources footer */}
          <SectionLabel>All Sources</SectionLabel>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[...new Set(data.updates.flatMap(u => u.sources))].map((src, i) => (
              <span key={i} style={{
                fontSize: '12px', color: '#3b82f6', background: 'rgba(59,130,246,0.05)',
                border: '1px solid rgba(59,130,246,0.15)', borderRadius: '8px', padding: '4px 12px',
              }}>🔗 {new URL(src).hostname}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const ALL_COMPETITORS = Object.keys(MOCK_COMPETITORS);

export default function ResearchAgent() {
  const [selected, setSelected] = useState([]);
  const [customCompetitor, setCustomCompetitor] = useState('');
  const [mode, setMode] = useState('idle');
  const [steps, setSteps] = useState([]);
  const [reports, setReports] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps, reports]);

  function toggleCompetitor(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function runPipeline() {
    setMode('running');
    setSteps([]);
    setReports([]);
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const addStep = (tool, status, res) =>
      setSteps(prev => [...prev.filter(s => s.tool !== tool), { tool, status, result: res }]);

    const targets = selected.length > 0 ? selected : ALL_COMPETITORS;

    for (let i = 0; i < targets.length; i++) {
      const key = targets[i];
      const name = MOCK_COMPETITORS[key]?.name || key;

      addStep('search_web', 'running', null);
      await delay(800 + i * 100);
      addStep('search_web', 'done', `Found ${4 + i * 2} results for "${name}"`);
      await delay(300);

      addStep('scrape_webpage', 'running', null);
      await delay(900);
      addStep('scrape_webpage', 'done', `Scraped ${2 + i} pages · ${Math.floor(12 + Math.random() * 20)}KB content`);
      await delay(300);

      addStep('summarize_research', 'running', null);
      await delay(1000);
      addStep('summarize_research', 'done', `Condensed into ${MOCK_COMPETITORS[key]?.updates.length || 3} key findings`);
      await delay(300);

      addStep('save_competitor_report', 'running', null);
      await delay(600);
      addStep('save_competitor_report', 'done', `Report saved — ${name} · ${new Date().toLocaleDateString()}`);
      await delay(300);

      if (MOCK_COMPETITORS[key]) {
        setReports(prev => [...prev, MOCK_COMPETITORS[key]]);
      }

      if (i < targets.length - 1) setSteps([]);
    }

    setMode('done');
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', padding: '32px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔎</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Research Agent</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI NOVA Workspace</div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Pipeline</div>
          {[
            { icon: '🔍', label: 'search_web()', desc: 'Targeted competitor queries' },
            { icon: '🌐', label: 'scrape_webpage()', desc: 'Read full source pages' },
            { icon: '📝', label: 'summarize_research()', desc: 'Condense into structured report' },
            { icon: '💾', label: 'save_competitor_report()', desc: 'Persist final findings' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', opacity: 0.8 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Rules</div>
          {[
            '📌 2+ sources per claim',
            '⚠️ Labels unconfirmed data',
            '🚫 No speculative strategy',
            '📊 Confidence score on every report',
          ].map((r, i) => (
            <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{r}</div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '8px' }} />
          Online
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', minWidth: 0 }}>
        <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Competitor Research</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Searches the web, scrapes sources, and delivers structured competitive intelligence
          </p>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {mode === 'idle' && (
            <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeSlide 0.3s ease' }}>
              <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>Run competitor research</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                Select competitors to analyze, or run all at once.
              </p>

              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                Select Competitors
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {ALL_COMPETITORS.map(key => {
                  const c = MOCK_COMPETITORS[key];
                  const active = selected.includes(key);
                  return (
                    <button key={key} onClick={() => toggleCompetitor(key)} style={{
                      background: active ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                      borderRadius: '14px', padding: '14px 18px', cursor: 'pointer',
                      textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.updates.length} signals tracked</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                <input
                  value={customCompetitor}
                  onChange={e => setCustomCompetitor(e.target.value)}
                  placeholder="Add custom competitor name…"
                  style={{
                    flex: 1, background: 'transparent', border: 'none',
                    borderBottom: '1px solid var(--border)', padding: '8px 0',
                    color: 'var(--text-primary)', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--text-secondary)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={runPipeline} style={{
                  padding: '12px 32px', borderRadius: '14px', border: 'none',
                  background: 'var(--text-primary)', color: 'var(--bg-deep)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {selected.length === 0 ? 'Analyze All Competitors' : `Analyze ${selected.length} Selected`} →
                </button>
                {selected.length > 0 && (
                  <button onClick={() => setSelected([])} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'inherit',
                  }}>Clear selection</button>
                )}
              </div>
            </div>
          )}

          {(mode === 'running' || mode === 'done') && (
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              {/* Live steps */}
              {(mode === 'running' || steps.length > 0) && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                    Tool Call Sequence
                  </div>
                  {steps.map((s, i) => <ToolStep key={i} step={s} />)}
                  {mode === 'running' && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Searching the web…</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reports */}
              {reports.length > 0 && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '32px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 500 }}>
                      {reports.length} Competitor Report{reports.length > 1 ? 's' : ''}
                    </div>
                    {mode === 'done' && (
                      <button onClick={() => { setMode('idle'); setReports([]); setSteps([]); setSelected([]); }} style={{
                        background: 'none', border: '1px solid var(--border)', borderRadius: '10px',
                        padding: '8px 18px', cursor: 'pointer', color: 'var(--text-secondary)',
                        fontSize: '13px', fontFamily: 'inherit',
                      }}>← New Research</button>
                    )}
                  </div>
                  {reports.map((r, i) => <ReportCard key={i} data={r} />)}
                </>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
