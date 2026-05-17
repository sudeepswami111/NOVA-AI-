import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SupportAgent from './SupportAgent.jsx'

function Root() {
  const [tab, setTab] = useState('support');

  const tabs = [
    { id: 'support', label: '🎧 Support Agent' },
    { id: 'router', label: '⚡ Router Agent' },
  ];

  return (
    <>
      {/* Tab Bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '6px 16px',
        background: 'rgba(8,12,26,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginRight: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AI NOVA
        </span>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '5px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ paddingTop: '44px', height: '100vh', boxSizing: 'border-box' }}>
        {tab === 'support' ? <SupportAgent /> : <App />}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
)
