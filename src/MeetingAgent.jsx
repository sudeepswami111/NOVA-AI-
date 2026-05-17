import React, { useState, useRef, useEffect } from 'react';

// ─── Mock tool implementations ────────────────────────────────────────────────

function mockReadEmail(emailId) {
  const emails = {
    'email-001': {
      from: 'sarah.chen@acmecorp.com',
      subject: 'Meeting Request — Q2 Partnership Review',
      body: `Hi,\n\nI'd love to schedule a 45-minute call with you and Marcus (marcus@acmecorp.com) sometime next week — ideally Tuesday or Wednesday afternoon.\n\nWe're based in New York (EST). The goal is to review our Q2 partnership metrics and discuss renewal terms.\n\nLet me know what works!\n\nBest,\nSarah Chen\nAcme Corp`,
    },
    'email-002': {
      from: 'dev@startupxyz.io',
      subject: 'Quick intro call?',
      body: `Hey,\n\nWould love to jump on a quick 30 min intro call this week or next. I'm flexible — anytime works for me PST.\n\nCheers,\nAlex`,
    },
  };
  return emails[emailId] || null;
}

function mockExtractDetails(text) {
  const lower = text.toLowerCase();
  const attendees = [];
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const matches = text.match(emailRegex) || [];
  matches.forEach(e => attendees.push(e));

  const duration = lower.includes('45') ? 45 : lower.includes('60') || lower.includes('hour') ? 60 : 30;
  const timezone = lower.includes('pst') ? 'America/Los_Angeles (PST, UTC-8)' :
    lower.includes('cst') ? 'America/Chicago (CST, UTC-6)' :
    lower.includes('est') || lower.includes('new york') ? 'America/New_York (EST, UTC-5)' :
    lower.includes('ist') ? 'Asia/Kolkata (IST, UTC+5:30)' : null;

  const dateRange = lower.includes('next week') ? 'Next week (May 19–23, 2026)' :
    lower.includes('this week') ? 'This week (May 18–23, 2026)' : 'Flexible';

  const purpose = lower.includes('partnership') ? 'Q2 Partnership Review & Renewal Discussion' :
    lower.includes('intro') ? 'Introductory Call' : 'General Meeting';

  return { attendees, duration, timezone, dateRange, purpose };
}

function mockGetAvailability(details) {
  const base = new Date('2026-05-20T09:00:00');
  const slots = [];
  const offsets = [[0, 14, 0], [1, 10, 0], [1, 16, 30]];
  offsets.forEach(([dayOffset, h, m]) => {
    const d = new Date(base);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, m, 0, 0);
    slots.push(d);
  });
  return slots;
}

function formatSlot(date, tz) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[date.getDay()];
  const d = date.getDate();
  const mon = months[date.getMonth()];
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const offset = tz?.includes('PST') ? 'UTC-8' : tz?.includes('CST') ? 'UTC-6' : tz?.includes('EST') ? 'UTC-5' : 'UTC+5:30';
  return `${day}, ${mon} ${d} · ${h12}:${m} ${ampm} ${offset}`;
}

function buildDraftReply(details, slots) {
  const toName = details.attendees[0]?.split('@')[0]?.replace('.', ' ') || 'there';
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  return `Hi ${cap(toName)},

Thank you for reaching out! I'd be happy to connect for a ${details.purpose}.

I've checked availability and have the following slots open:

  1. ${slots[0]}
  2. ${slots[1]}
  3. ${slots[2]}

The call will be ${details.duration} minutes via Google Meet (link to follow upon confirmation).
${details.timezone ? `\nAll times are shown in ${details.timezone}.` : ''}

Please let me know which slot works best for you, and I'll send over a calendar invite.

Looking forward to connecting!

Best regards,
[Your Name]
[Company Name]`;
}

// ─── Tool step component ───────────────────────────────────────────────────────

function ToolStep({ step }) {
  const icons = {
    read_email: '📧', extract_meeting_request: '🔍',
    get_calendar_availability: '📅', draft_email_reply: '✉️',
  };
  const labels = {
    read_email: 'read_email()',
    extract_meeting_request: 'extract_meeting_request()',
    get_calendar_availability: 'get_calendar_availability()',
    draft_email_reply: 'draft_email_reply()',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
      borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)',
      borderLeft: `3px solid ${step.status === 'done' ? '#10b981' : '#3b82f6'}`,
      marginBottom: '8px', animation: 'fadeSlide 0.3s ease',
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

// ─── Draft approval card ───────────────────────────────────────────────────────

function DraftCard({ data, onApprove, onReject, approved }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
      borderRadius: '20px', padding: '28px', animation: 'fadeSlide 0.3s ease',
    }}>
      {/* Extracted details */}
      <Section label="Extracted Details">
        <Grid>
          <GridItem label="Attendees" value={data.details.attendees.join(', ') || '—'} />
          <GridItem label="Purpose" value={data.details.purpose} />
          <GridItem label="Duration" value={`${data.details.duration} minutes`} />
          <GridItem label="Requested Date" value={data.details.dateRange} />
          <GridItem label="Timezone" value={data.details.timezone || 'Not specified — asked in reply'} />
        </Grid>
      </Section>

      <Divider />

      {/* Available slots */}
      <Section label="Available Slots">
        {data.slots.map((slot, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '10px 14px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
            marginBottom: '8px',
          }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#3b82f6', flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{slot}</span>
          </div>
        ))}
      </Section>

      <Divider />

      {/* Draft reply */}
      <Section label="Draft Reply">
        <pre style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '20px', fontSize: '13px',
          color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap',
          fontFamily: 'inherit', margin: 0,
        }}>{data.draft}</pre>
      </Section>

      {/* Approval */}
      {!approved ? (
        <div style={{
          marginTop: '24px', padding: '20px 24px',
          background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '16px',
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '18px', lineHeight: 1.6 }}>
            🔐 <strong>Awaiting your approval.</strong> Shall I send this email and create the calendar event?
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onApprove} style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: '#10b981', color: '#fff', fontSize: '14px', fontWeight: 600,
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}>✓ Approve & Send</button>
            <button onClick={onReject} style={{
              padding: '10px 24px', borderRadius: '12px',
              border: '1px solid var(--border)', cursor: 'pointer',
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>✗ Discard</button>
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: '24px', padding: '16px 20px',
          background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>Email sent & calendar event created</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Invites dispatched to all attendees</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 24px' }} />;
}

function Grid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>{children}</div>;
}

function GridItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

// ─── Emoji quick requests ──────────────────────────────────────────────────────

const QUICK_EMAILS = [
  { id: 'email-001', label: '📧 Q2 Partnership Review (Sarah @ Acme)' },
  { id: 'email-002', label: '📧 Quick intro call (Alex @ StartupXYZ)' },
];

const MANUAL_PLACEHOLDER = `Paste or type a meeting request here…

Example:
"Hi, can we schedule a 30 min call next Wednesday afternoon? I'm in PST. My email is alex@example.com."`;

// ─── Main component ────────────────────────────────────────────────────────────

export default function MeetingAgent() {
  const [mode, setMode] = useState('idle'); // idle | input | running | done
  const [emailMode, setEmailMode] = useState('select'); // select | manual
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [manualText, setManualText] = useState('');
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [approved, setApproved] = useState(false);
  const [discarded, setDiscarded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps, result]);

  async function runPipeline(text, isEmail, emailId) {
    setMode('running');
    setSteps([]);
    setResult(null);
    setApproved(false);
    setDiscarded(false);

    const delay = ms => new Promise(r => setTimeout(r, ms));
    const addStep = (tool, status, res) =>
      setSteps(prev => [...prev.filter(s => s.tool !== tool), { tool, status, result: res }]);

    let emailText = text;

    if (isEmail && emailId) {
      addStep('read_email', 'running');
      await delay(900);
      const email = mockReadEmail(emailId);
      addStep('read_email', 'done', `From: ${email.from} · Subject: "${email.subject}"`);
      emailText = email.body;
      await delay(400);
    }

    addStep('extract_meeting_request', 'running');
    await delay(1100);
    const details = mockExtractDetails(emailText);
    addStep('extract_meeting_request', 'done',
      `${details.duration} min · ${details.attendees.length} attendee(s) · ${details.timezone || 'Timezone TBD'}`);
    await delay(400);

    addStep('get_calendar_availability', 'running');
    await delay(1300);
    const rawSlots = mockGetAvailability(details);
    const formattedSlots = rawSlots.map(s => formatSlot(s, details.timezone));
    addStep('get_calendar_availability', 'done', `${formattedSlots.length} slots found`);
    await delay(400);

    addStep('draft_email_reply', 'running');
    await delay(1000);
    const draft = buildDraftReply(details, formattedSlots);
    addStep('draft_email_reply', 'done', 'Draft ready — awaiting human approval');

    setResult({ details, slots: formattedSlots, draft });
    setMode('done');
  }

  function handleStart() {
    if (emailMode === 'select' && selectedEmail) {
      runPipeline('', true, selectedEmail);
    } else if (emailMode === 'manual' && manualText.trim()) {
      runPipeline(manualText.trim(), false, null);
    }
  }

  function reset() {
    setMode('idle');
    setSteps([]);
    setResult(null);
    setSelectedEmail(null);
    setManualText('');
    setApproved(false);
    setDiscarded(false);
    setEmailMode('select');
  }

  const canStart = (emailMode === 'select' && selectedEmail) || (emailMode === 'manual' && manualText.trim());

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Sidebar */}
      <aside style={{
        width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)',
        background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column',
        padding: '32px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-panel)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>📅</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Meeting Agent</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI NOVA Workspace</div>
          </div>
        </div>

        {/* Pipeline */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Pipeline
          </div>
          {[
            { icon: '📧', label: 'read_email()', desc: 'Fetch original request' },
            { icon: '🔍', label: 'extract_meeting_request()', desc: 'Parse attendees & intent' },
            { icon: '📅', label: 'get_calendar_availability()', desc: 'Check open time slots' },
            { icon: '✉️', label: 'draft_email_reply()', desc: 'Write 2–3 slot options' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', opacity: 0.8 }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0,
              }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
            Rules
          </div>
          {[
            '🔐 Never sends without approval',
            '🕐 Always confirms timezone',
            '📌 Proposes exactly 2–3 slots',
            '📝 Professional reply tone',
          ].map((r, i) => (
            <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>{r}</div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: '8px' }} />
          Online
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', minWidth: 0 }}>
        {/* Header */}
        <header style={{ padding: '24px 40px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Meeting Booking</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Reads email requests, finds open slots, drafts a reply — then waits for your approval
          </p>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>

          {/* Input panel */}
          {mode === 'idle' && (
            <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeSlide 0.3s ease' }}>
              <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>New meeting request</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                Load a sample email or paste a raw request to begin.
              </p>

              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-panel)', padding: '4px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content' }}>
                {[['select', '📧 Load Email'], ['manual', '✏️ Paste Text']].map(([id, label]) => (
                  <button key={id} onClick={() => setEmailMode(id)} style={{
                    padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: emailMode === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: emailMode === id ? '#fff' : 'rgba(255,255,255,0.5)',
                    fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>

              {emailMode === 'select' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {QUICK_EMAILS.map(e => (
                    <button key={e.id} onClick={() => setSelectedEmail(e.id)} style={{
                      background: selectedEmail === e.id ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selectedEmail === e.id ? 'rgba(59,130,246,0.3)' : 'var(--border)'}`,
                      borderRadius: '14px', padding: '16px 20px', cursor: 'pointer',
                      color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit',
                      textAlign: 'left', transition: 'all 0.2s', fontWeight: 500,
                    }}>{e.label}</button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder={MANUAL_PLACEHOLDER}
                  rows={8}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)', borderRadius: '16px',
                    padding: '16px 20px', color: 'var(--text-primary)',
                    fontSize: '14px', lineHeight: 1.7, fontFamily: 'inherit',
                    resize: 'vertical', outline: 'none',
                  }}
                />
              )}

              <button
                onClick={handleStart}
                disabled={!canStart}
                style={{
                  marginTop: '24px', padding: '12px 32px', borderRadius: '14px', border: 'none',
                  background: canStart ? 'var(--text-primary)' : 'var(--bg-panel)',
                  color: canStart ? 'var(--bg-deep)' : 'var(--text-muted)',
                  fontSize: '14px', fontWeight: 600, cursor: canStart ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >
                Run Pipeline →
              </button>
            </div>
          )}

          {/* Running / done */}
          {(mode === 'running' || mode === 'done') && (
            <div style={{ maxWidth: '780px', margin: '0 auto' }}>
              {/* Steps */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
                  Tool Call Sequence
                </div>
                {steps.map((s, i) => <ToolStep key={i} step={s} />)}
                {mode === 'running' && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', marginTop: '4px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Processing…</span>
                  </div>
                )}
              </div>

              {/* Result card */}
              {result && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '28px' }} />
                  {discarded ? (
                    <div style={{
                      padding: '20px 24px', background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)', borderRadius: '16px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <span style={{ fontSize: '18px' }}>🗑️</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Draft discarded</div>
                        <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '13px', padding: 0, marginTop: '4px', fontFamily: 'inherit' }}>← Start over</button>
                      </div>
                    </div>
                  ) : (
                    <DraftCard
                      data={result}
                      approved={approved}
                      onApprove={() => setApproved(true)}
                      onReject={() => setDiscarded(true)}
                    />
                  )}
                  {approved && (
                    <button onClick={reset} style={{
                      marginTop: '20px', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#3b82f6', fontSize: '13px',
                      fontFamily: 'inherit', padding: 0,
                    }}>← Process another request</button>
                  )}
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
