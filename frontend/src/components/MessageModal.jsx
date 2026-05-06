import { useState } from 'react'

const PURPOSES = [
  { id: 'networking',     emoji: '🤝', label: 'General Networking' },
  { id: 'job',           emoji: '💼', label: 'Job Opportunity' },
  { id: 'internship',    emoji: '🎓', label: 'Internship Ask' },
  { id: 'collaboration', emoji: '🚀', label: 'Collaboration' },
]

export default function MessageModal({ connection, sessionId, onClose }) {
  const [purpose, setPurpose] = useState('networking')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const generate = async () => {
    setLoading(true); setMessage('')
    try {
      const res = await fetch('/api/message', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, connection_id: connection.id, purpose }),
      })
      const data = await res.json()
      setMessage(data.message)
    } catch { setMessage('Failed to generate. Please try again.') }
    finally { setLoading(false) }
  }

  const copy = () => {
    navigator.clipboard.writeText(message)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* LinkedIn-style modal header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--li-border)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--li-text)' }}>New Message</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
            color: 'var(--li-text-2)', lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        {/* To: field */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--li-text-2)', marginBottom: 4 }}>TO</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
            borderBottom: '1px solid var(--li-border)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'var(--li-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 15,
            }}>
              {connection.full_name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--li-text)' }}>{connection.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--li-text-2)' }}>
                {connection.job_title_clean} · {connection.company}
              </div>
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--li-text-2)', marginBottom: 8 }}>MESSAGE PURPOSE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PURPOSES.map(p => (
              <button key={p.id} id={`purpose-${p.id}`} onClick={() => setPurpose(p.id)}
                style={{
                  padding: '9px 12px', borderRadius: 4,
                  border: `1.5px solid ${purpose === p.id ? 'var(--li-blue)' : 'rgba(0,0,0,0.2)'}`,
                  background: purpose === p.id ? 'var(--li-blue-tint)' : 'var(--li-white)',
                  color: purpose === p.id ? 'var(--li-blue)' : 'var(--li-text-2)',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                  textAlign: 'left', transition: 'all 0.13s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        <button id="generate-message-btn" className="btn btn-primary w-full"
          onClick={generate} disabled={loading}
          style={{ justifyContent: 'center', marginBottom: 16, borderRadius: 4 }}>
          {loading ? <><span className="spinner" /> Generating…</> : '✨ Generate Message'}
        </button>

        {message && (
          <div className="anim-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--li-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</span>
              <button onClick={copy} className="btn btn-outline"
                style={{ padding: '4px 12px', fontSize: 12, borderRadius: 4 }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              style={{
                width: '100%', minHeight: 130, padding: 12, borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.2)', color: 'var(--li-text)',
                fontSize: 14, lineHeight: 1.6, resize: 'vertical', outline: 'none',
                fontFamily: 'inherit', background: 'var(--li-white)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--li-blue)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.2)'}
            />
            <div style={{ fontSize: 11, color: 'var(--li-text-3)', marginTop: 4 }}>
              {message.split(' ').filter(Boolean).length} words · edit before sending
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
