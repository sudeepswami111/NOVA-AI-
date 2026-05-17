import React, { useState } from 'react';

const BRIEFS = [
  { id: 'launch', label: '🚀 Product Launch — AI NOVA v2.0', topic: 'Announcing AI NOVA v2.0 — a modular AI business assistant with 5 specialist agents: Support, Meeting, Research, PDF, and Social Media. Built for teams that need AI that works end-to-end, not just chat.' },
  { id: 'hiring', label: '🤝 Hiring — Senior AI Engineer', topic: 'We are hiring a Senior AI Engineer to help build the next generation of AI agent systems. Remote-first, equity, and a chance to work on real AI products used by businesses daily.' },
  { id: 'insight', label: '💡 Thought Leadership — AI Agents vs Chatbots', topic: 'Most companies think chatbots are AI. They are not. Real AI agents take actions, use tools, and complete tasks autonomously. This post explains the difference and why it matters in 2026.' },
];

const PLATFORMS = ['LinkedIn', 'X / Twitter', 'Instagram', 'Video Script'];

function mockGenerate(brief, platform) {
  const t = brief.topic;
  if (platform === 'LinkedIn') {
    return `Most businesses are still using yesterday's AI.\n\nWe built AI NOVA to change that.\n\n${t}\n\nHere's what that means in practice:\n→ Your support team gets instant answers from a knowledge base\n→ Your sales team books meetings without back-and-forth emails\n→ Your leadership gets competitor intelligence in minutes, not days\n\nAI that actually works isn't magic. It's structured agents with clear tools, clear rules, and a human in the loop.\n\nWe're sharing everything we've learned building this.\n\nWhat's the biggest bottleneck AI could remove from your team right now?\n\n#AIAgents #Productivity #FutureOfWork`;
  }
  if (platform === 'X / Twitter') {
    return `1/ Most "AI tools" are just fancy search boxes.\n\nReal AI agents are different — here's why it matters 🧵\n\n2/ A chatbot answers questions.\n\nAn AI agent:\n• Uses tools\n• Takes actions\n• Handles multi-step tasks\n• Knows when to escalate\n\n3/ We built AI NOVA with 5 specialist agents.\n\nEach one has a defined job, a tool pipeline, and a human approval gate for anything sensitive.\n\n4/ The result?\n\n${t.slice(0, 140)}\n\n5/ We didn't build a product. We built a system.\n\nThe difference is everything.\n\n6/ If you're building with AI agents — what's the hardest part?\n\nReply below. 👇`;
  }
  if (platform === 'Instagram') {
    return `The AI revolution isn't coming. It's already here — and most teams are missing it. ✨\n\n${t.slice(0, 120)}\n\nWe built AI NOVA so your team can:\n✅ Answer support questions instantly\n✅ Book meetings without the back-and-forth\n✅ Get competitor intel in real time\n\nThis is what AI working for you actually looks like.\n\nSave this post if you're building with AI agents 👆\n\n#AIAgents #ProductLaunch #StartupLife #AITools #BuildInPublic #FutureOfWork #TechStartup #SaaSProduct #ArtificialIntelligence #Innovation`;
  }
  if (platform === 'Video Script') {
    return `[HOOK — 0–5s]\n"What if your entire business ops team could be replaced by 5 AI agents?"\n\n[PROBLEM — 5–15s]\nMost companies are drowning in repetitive tasks — answering support tickets, chasing meeting times, doing competitor research manually. AI chatbots don't solve this. They just add another tab.\n\n[SOLUTION — 15–45s]\nAI NOVA is different. Five specialist agents, each with one job: Support answers customer questions from your knowledge base. Meeting reads emails and books slots. Research scans the web for competitor intel. PDF reads and extracts contracts in seconds. Social writes platform-ready content from a brief.\n\nEvery agent runs a transparent tool pipeline — and nothing gets sent without your approval.\n\n[CTA — 45–60s]\nThis is what AI that actually works looks like. Link in bio to try AI NOVA free.`;
  }
  return '';
}

function ToolStep({ tool, status, result }) {
  const icons = { generate_linkedin_post: '💼', generate_twitter_thread: '🐦', generate_instagram_caption: '📸', generate_video_script: '🎬', create_content_calendar: '📅' };
  const done = status === 'done';
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', borderLeft: `3px solid ${done ? '#10b981' : '#3b82f6'}`, marginBottom: '8px' }}>
      <span>{icons[tool]}</span>
      <div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{tool}()</span>
        <span style={{ marginLeft: '8px', fontSize: '11px', fontWeight: 600, color: done ? '#10b981' : '#3b82f6' }}>{done ? '✓ done' : '⟳ running'}</span>
        {result && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{result}</div>}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{children}</div>;
}

const PLATFORM_META = {
  'LinkedIn': { icon: '💼', color: '#0077b5', limit: '150–300 words · max 3 hashtags', chars: null },
  'X / Twitter': { icon: '🐦', color: '#1da1f2', limit: '280 chars/tweet · thread of 3–7', chars: null },
  'Instagram': { icon: '📸', color: '#e1306c', limit: '100–150 words · 5–10 hashtags', chars: null },
  'Video Script': { icon: '🎬', color: '#ff0000', limit: '30–60 seconds · Hook→Problem→Solution→CTA', chars: null },
};

function DraftCard({ platform, content, approved, onApprove, onDiscard }) {
  const [copied, setCopied] = useState(false);
  const meta = PLATFORM_META[platform];
  function copy() { navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '20px', animation: 'fadeSlide 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>{meta.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{platform}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{meta.limit}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={copy} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px' }}>{content}</pre>
      {!approved ? (
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
          <button onClick={onApprove} style={{ padding: '9px 22px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✓ Approve</button>
          <button onClick={onDiscard} style={{ padding: '9px 22px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>✗ Discard</button>
        </div>
      ) : (
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px' }}>
          <span>✅</span>
          <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>Approved — ready to schedule</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>publish_social_post() awaiting calendar confirmation</span>
        </div>
      )}
    </div>
  );
}

export default function SocialAgent() {
  const [mode, setMode] = useState('idle');
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [customBrief, setCustomBrief] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['LinkedIn', 'X / Twitter', 'Instagram']);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [steps, setSteps] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [approved, setApproved] = useState({});
  const [discarded, setDiscarded] = useState({});
  const [tone, setTone] = useState('Professional but approachable');

  const briefText = selectedBrief ? BRIEFS.find(b => b.id === selectedBrief)?.topic : customBrief;

  async function run() {
    if (!briefText?.trim()) return;
    setMode('running'); setSteps([]); setDrafts({}); setApproved({}); setDiscarded({});
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const addStep = (tool, status, res) => setSteps(p => [...p.filter(s => s.tool !== tool), { tool, status, result: res }]);
    const tools = [
      { key: 'LinkedIn', tool: 'generate_linkedin_post' },
      { key: 'X / Twitter', tool: 'generate_twitter_thread' },
      { key: 'Instagram', tool: 'generate_instagram_caption' },
      ...(includeVideo ? [{ key: 'Video Script', tool: 'generate_video_script' }] : []),
    ].filter(t => selectedPlatforms.includes(t.key) || t.key === 'Video Script');

    for (const { key, tool } of tools) {
      addStep(tool, 'running');
      await delay(900 + Math.random() * 400);
      const content = mockGenerate({ topic: briefText }, key);
      addStep(tool, 'done', `${key} draft ready · ${content.split(' ').length} words`);
      setDrafts(p => ({ ...p, [key]: content }));
      await delay(300);
    }
    if (includeVideo) {
      addStep('create_content_calendar', 'running');
      await delay(700);
      addStep('create_content_calendar', 'done', 'Calendar entry created for 5 platforms');
    }
    setMode('done');
  }

  function togglePlatform(p) {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function reset() { setMode('idle'); setSteps([]); setDrafts({}); setApproved({}); setDiscarded({}); setSelectedBrief(null); setCustomBrief(''); }

  const canRun = briefText?.trim() && selectedPlatforms.length > 0;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Sidebar */}
      <aside style={{ width: '300px', flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✍️</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>Social Agent</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI NOVA Workspace</div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Pipeline</div>
          {[
            { icon: '💼', label: 'generate_linkedin_post()', desc: 'Professional insight post' },
            { icon: '🐦', label: 'generate_twitter_thread()', desc: '3–7 tweet thread' },
            { icon: '📸', label: 'generate_instagram_caption()', desc: 'Caption + hashtags' },
            { icon: '🎬', label: 'generate_video_script()', desc: '30–60s hook format' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', opacity: 0.8 }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Rules</div>
          {['🚫 Never auto-publishes', '✍️ Drafts only — approval required', '⚠️ Flags unverified stats', '🎯 Platform-specific formatting'].map((r, i) => (
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
          <h1 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Social Media Content</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Platform-specific drafts from a content brief — approval required before publishing</p>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {mode === 'idle' && (
            <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeSlide 0.3s ease' }}>
              <div style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>New content brief</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Describe what you want to post, or pick a sample brief.</p>

              {/* Sample briefs */}
              <Label>Sample Briefs</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {BRIEFS.map(b => (
                  <button key={b.id} onClick={() => { setSelectedBrief(b.id); setCustomBrief(''); }} style={{
                    background: selectedBrief === b.id ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedBrief === b.id ? 'rgba(139,92,246,0.3)' : 'var(--border)'}`,
                    borderRadius: '14px', padding: '14px 18px', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{b.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.topic.slice(0, 80)}…</div>
                  </button>
                ))}
              </div>

              {/* Custom brief */}
              <Label>Or write your own brief</Label>
              <textarea
                value={customBrief}
                onChange={e => { setCustomBrief(e.target.value); setSelectedBrief(null); }}
                placeholder="Describe what you want to communicate — the topic, key message, and goal of this content."
                rows={4}
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.7, fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: '24px' }}
              />

              {/* Brand tone */}
              <Label>Brand Tone</Label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {['Professional but approachable', 'Bold and direct', 'Warm and educational', 'Witty and sharp'].map(t => (
                  <button key={t} onClick={() => setTone(t)} style={{
                    padding: '7px 16px', borderRadius: '99px', border: `1px solid ${tone === t ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
                    background: tone === t ? 'rgba(139,92,246,0.1)' : 'transparent',
                    color: tone === t ? '#8b5cf6' : 'var(--text-secondary)',
                    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>{t}</button>
                ))}
              </div>

              {/* Platforms */}
              <Label>Platforms</Label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {PLATFORMS.filter(p => p !== 'Video Script').map(p => {
                  const m = PLATFORM_META[p];
                  const active = selectedPlatforms.includes(p);
                  return (
                    <button key={p} onClick={() => togglePlatform(p)} style={{
                      padding: '8px 18px', borderRadius: '99px', border: `1px solid ${active ? `${m.color}50` : 'var(--border)'}`,
                      background: active ? `${m.color}15` : 'transparent',
                      color: active ? m.color : 'var(--text-secondary)',
                      fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    }}>{m.icon} {p}</button>
                  );
                })}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '32px' }}>
                <input type="checkbox" checked={includeVideo} onChange={e => setIncludeVideo(e.target.checked)} style={{ accentColor: '#8b5cf6' }} />
                🎬 Also generate video script (30–60s)
              </label>

              <button onClick={run} disabled={!canRun} style={{
                padding: '12px 32px', borderRadius: '14px', border: 'none',
                background: canRun ? 'var(--text-primary)' : 'var(--bg-panel)',
                color: canRun ? 'var(--bg-deep)' : 'var(--text-muted)',
                fontSize: '14px', fontWeight: 600, cursor: canRun ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              }}>Generate Drafts →</button>
            </div>
          )}

          {(mode === 'running' || mode === 'done') && (
            <div style={{ maxWidth: '860px', margin: '0 auto' }}>
              {/* Steps */}
              <div style={{ marginBottom: '28px' }}>
                <Label>Tool Call Sequence</Label>
                {steps.map((s, i) => <ToolStep key={i} {...s} />)}
                {mode === 'running' && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Writing content…</span>
                  </div>
                )}
              </div>

              {Object.keys(drafts).length > 0 && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '28px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 500 }}>
                      {Object.keys(drafts).length} Draft{Object.keys(drafts).length > 1 ? 's' : ''} Ready
                    </div>
                    {mode === 'done' && (
                      <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'inherit' }}>← New Brief</button>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>🔐 Awaiting approval before scheduling or publishing.</p>
                  {Object.entries(drafts).filter(([k]) => !discarded[k]).map(([platform, content]) => (
                    <DraftCard
                      key={platform} platform={platform} content={content}
                      approved={!!approved[platform]}
                      onApprove={() => setApproved(p => ({ ...p, [platform]: true }))}
                      onDiscard={() => setDiscarded(p => ({ ...p, [platform]: true }))}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
