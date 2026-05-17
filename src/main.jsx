import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SupportAgent from './SupportAgent.jsx'
import MeetingAgent from './MeetingAgent.jsx'
import ResearchAgent from './ResearchAgent.jsx'
import PdfAgent from './PdfAgent.jsx'
import SocialAgent from './SocialAgent.jsx'

function Root() {
  const [tab, setTab] = useState('support');

  const tabs = [
    { id: 'support', label: '🎧 Support' },
    { id: 'router', label: '⚡ Router' },
    { id: 'meeting', label: '📅 Meeting' },
    { id: 'research', label: '🔎 Research' },
    { id: 'pdf', label: '📄 PDF' },
    { id: 'social', label: '✍️ Social' },
  ];

  return (
    <>
      {/* Tab Bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 24px',
        background: 'rgba(0,0,0,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginRight: '16px', letterSpacing: '0.05em' }}>
          AI NOVA
        </span>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-panel)', padding: '4px', borderRadius: '12px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ paddingTop: '44px', height: '100vh', boxSizing: 'border-box' }}>
        {tab === 'support' ? <SupportAgent /> : tab === 'meeting' ? <MeetingAgent /> : tab === 'research' ? <ResearchAgent /> : tab === 'pdf' ? <PdfAgent /> : tab === 'social' ? <SocialAgent /> : <App />}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
)
