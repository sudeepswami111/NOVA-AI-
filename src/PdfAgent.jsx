import React, { useState, useRef } from 'react';

const MOCK = {
  title: 'Q2 Partnership Agreement — Acme Corp & Nova Solutions',
  type: 'Contract', pages: 24,
  summary: 'A 24-month service agreement between Acme Corp (Client) and Nova Solutions (Provider) covering enterprise software delivery, SLAs, and payment terms. The agreement commences June 1, 2026 and includes renewal clauses, IP ownership provisions, and termination conditions. Nova Solutions is responsible for delivery of Phase 1 by August 31, 2026.',
  keyPoints: [
    'Contract value: $480,000 over 24 months paid in quarterly installments of $60,000.',
    'SLA uptime guarantee of 99.5% — penalties of 5% monthly fee per 0.1% breach.',
    'Clause 14.3: "All intellectual property developed under this agreement remains the exclusive property of Acme Corp."',
    'Either party may terminate with 60 days written notice after Month 6.',
    'Governing law: State of New York. Disputes resolved via binding arbitration.',
  ],
  actions: [
    { task: 'Sign and return executed agreement', owner: 'Legal — Nova Solutions', deadline: 'May 31, 2026' },
    { task: 'Deliver Phase 1 software build', owner: 'Engineering Lead', deadline: 'Aug 31, 2026' },
    { task: 'Provide security audit documentation', owner: 'CTO — Nova Solutions', deadline: 'Jun 30, 2026' },
    { task: 'Submit Q3 invoice', owner: 'Finance — Nova Solutions', deadline: 'Sep 1, 2026' },
    { task: 'Schedule quarterly review call', owner: 'Account Manager', deadline: 'Not specified' },
  ],
  deadlines: [
    { date: 'May 31, 2026', what: 'Signed agreement returned to Acme Corp' },
    { date: 'Jun 1, 2026', what: 'Contract commencement date' },
    { date: 'Jun 30, 2026', what: 'Security audit documentation due' },
    { date: 'Aug 31, 2026', what: 'Phase 1 delivery deadline' },
  ],
  risks: [
    'SLA penalty clause (§9.2) could result in up to $36,000 annual deductions if uptime targets are missed.',
    'IP ownership clause 14.3 assigns all developed IP to client — review with IP counsel before signing.',
    'No explicit force majeure clause found in document.',
  ],
  openQuestions: [
    'Clause 11 references "Schedule B" (pricing addendum) which is not included in this upload.',
    'Liability cap in §16 is listed as "[TBD]" — not yet agreed.',
    'Data processing agreement (DPA) referenced in §18 but not attached.',
  ],
  tables: ['Table 1: Payment Schedule (p.4)', 'Table 2: SLA Penalty Matrix (p.9)', 'Table 3: Deliverable Milestones (p.12)'],
};

const SAMPLE_PDFS = [
  { id: 'contract', label: '📄 Q2 Partnership Agreement', pages: 24, type: 'Contract' },
  { id: 'report', label: '📊 Annual Performance Report', pages: 38, type: 'Report' },
];

function ToolStep({ tool, status, result }) {
  const icons = { read_pdf: '📖', extract_tables: '📊', summarize_pdf: '📝', extract_action_items: '✅' };
  const done = status === 'done';
  return (
    <div style={{
      display: 'flex', gap: '12px', alignItems: 'flex-start',
      padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
      borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)',
      borderLeft: `3px solid ${done ? '#10b981' : '#3b82f6'}`,
      marginBottom: '8px',
    }}>
      <span style={{ fontSize: '15px' }}>{icons[tool]}</span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {tool}()
          <span style={{ marginLeft: '8px', fontSize: '11px', color: done ? '#10b981' : '#3b82f6', fontWeight: 600 }}>
            {done ? '✓ done' : '⟳ running'}
          </span>
        </div>
        {result && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{result}</div>}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{children}</div>;
}

function Card({ children, style = {} }) {
  return <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', ...style }}>{children}</div>;
}

export default function PdfAgent() {
  const [mode, setMode] = useState('idle');
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  async function run() {
    if (!selected) return;
    setMode('running'); setSteps([]); setResult(null);
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const set = (tool, status, res) => setSteps(p => [...p.filter(s => s.tool !== tool), { tool, status, result: res }]);

    set('read_pdf', 'running');
    await delay(1000);
    set('read_pdf', 'done', `Extracted ${MOCK.pages} pages · ~14,200 words`);
    await delay(400);

    set('extract_tables', 'running');
    await delay(900);
    set('extract_tables', 'done', `${MOCK.tables.length} tables found`);
    await delay(400);

    set('summarize_pdf', 'running');
    await delay(1100);
    set('summarize_pdf', 'done', 'Structured summary generated');
    await delay(400);

    set('extract_action_items', 'running');
    await delay(900);
    set('extract_action_items', 'done', `${MOCK.actions.length} action items extracted`);

    setResult(MOCK);
    setMode('done');
  }

  function reset() { setMode('idle'); setSelected(null); setSteps([]); setResult(null); }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Sidebar */}
      <aside style={{ width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📄</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>PDF Agent</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI NOVA Workspace</div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Pipeline</div>
          {[
            { icon: '📖', label: 'read_pdf()', desc: 'Extract full document text' },
            { icon: '📊', label: 'extract_tables()', desc: 'Parse data tables separately' },
            { icon: '📝', label: 'summarize_pdf()', desc: 'Produce structured output' },
            { icon: '✅', label: 'extract_action_items()', desc: 'Tasks, owners, deadlines' },
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

        <div style={{ marginBottom: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Rules</div>
          {['🚫 No invented content', '📌 Direct quotes preserved', '⚠️ Flags OCR issues', '📋 Tables always extracted'].map((r, i) => (
            <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{r}</div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '8px' }} />Online
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', minWidth: 0 }}>
        <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>PDF Analysis</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Extracts summaries, action items, tables, risks, and deadlines from any document</p>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>

          {/* Idle */}
          {mode === 'idle' && (
            <div style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeSlide 0.3s ease' }}>
              <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>Upload a document</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Choose a sample PDF or upload your own file.</p>

              {/* Upload zone */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: '1px dashed var(--border)', borderRadius: '20px', padding: '40px',
                  textAlign: 'center', cursor: 'pointer', marginBottom: '24px',
                  transition: 'all 0.2s', background: 'rgba(255,255,255,0.01)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>📎</div>
                <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>Drop a PDF here</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>or click to browse — PDF, DOCX up to 50MB</div>
                <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={() => setSelected('upload')} />
              </div>

              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Or load a sample</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {SAMPLE_PDFS.map(p => (
                  <button key={p.id} onClick={() => setSelected(p.id)} style={{
                    background: selected === p.id ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected === p.id ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                    borderRadius: '14px', padding: '16px 20px', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{p.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.pages} pages · {p.type}</div>
                    </div>
                    {selected === p.id && <span style={{ fontSize: '16px' }}>✓</span>}
                  </button>
                ))}
              </div>

              <button onClick={run} disabled={!selected} style={{
                padding: '12px 32px', borderRadius: '14px', border: 'none',
                background: selected ? 'var(--text-primary)' : 'var(--bg-panel)',
                color: selected ? 'var(--bg-deep)' : 'var(--text-muted)',
                fontSize: '14px', fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}>Analyze Document →</button>
            </div>
          )}

          {/* Running / Done */}
          {(mode === 'running' || mode === 'done') && (
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              <div style={{ marginBottom: '28px' }}>
                <Label>Tool Call Sequence</Label>
                {steps.map((s, i) => <ToolStep key={i} {...s} />)}
                {mode === 'running' && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Analyzing document…</span>
                  </div>
                )}
              </div>

              {result && (
                <div style={{ animation: 'fadeSlide 0.3s ease' }}>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '28px' }} />

                  {/* Header meta */}
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>{result.title}</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {[result.type, `${result.pages} pages`, `${result.tables.length} tables`].map((t, i) => (
                            <span key={i} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '99px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit' }}>← New Document</button>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ marginBottom: '24px' }}>
                    <Label>Summary</Label>
                    <Card><p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>{result.summary}</p></Card>
                  </div>

                  {/* Key points */}
                  <div style={{ marginBottom: '24px' }}>
                    <Label>Key Points</Label>
                    {result.keyPoints.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                        <span style={{ color: '#3b82f6', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>·</span>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{p}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action items table */}
                  <div style={{ marginBottom: '24px' }}>
                    <Label>Action Items</Label>
                    <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {['Task', 'Owner', 'Deadline'].map(h => (
                              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.actions.map((a, i) => (
                            <tr key={i} style={{ borderBottom: i < result.actions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <td style={{ padding: '12px 16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{a.task}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{a.owner}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '8px',
                                  background: a.deadline === 'Not specified' ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.08)',
                                  color: a.deadline === 'Not specified' ? 'var(--text-muted)' : '#3b82f6',
                                  border: `1px solid ${a.deadline === 'Not specified' ? 'var(--border)' : 'rgba(59,130,246,0.2)'}`,
                                }}>{a.deadline}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Deadlines */}
                  <div style={{ marginBottom: '24px' }}>
                    <Label>Deadlines</Label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {result.deadlines.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6', flexShrink: 0 }}>{d.date}</span>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{d.what}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risks */}
                  <div style={{ marginBottom: '24px' }}>
                    <Label>Risks &amp; Concerns</Label>
                    {result.risks.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'rgba(236,72,153,0.04)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: '12px', marginBottom: '8px' }}>
                        <span style={{ color: '#ec4899', flexShrink: 0 }}>⚠</span>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{r}</p>
                      </div>
                    ))}
                  </div>

                  {/* Open questions */}
                  <div style={{ marginBottom: '24px' }}>
                    <Label>Open Questions</Label>
                    {result.openQuestions.map((q, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', marginBottom: '8px' }}>
                        <span style={{ color: '#f59e0b', flexShrink: 0 }}>?</span>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{q}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tables extracted */}
                  <div>
                    <Label>Tables Extracted</Label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {result.tables.map((t, i) => (
                        <span key={i} style={{ fontSize: '13px', padding: '6px 14px', borderRadius: '10px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>📊 {t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
