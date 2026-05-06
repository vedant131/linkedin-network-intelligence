import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  'Find recruiters in my network',
  'Show senior software engineers',
  'Who can help me get an internship?',
  'Data scientists at top companies',
  'Find founders and CEOs',
]

export default function QueryBar({ onQuery, onReset, label }) {
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const inputRef = useRef()
  const wrapRef  = useRef()

  useEffect(() => {
    const down = e => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus() } }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    const click = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [])

  const submit = (q = query) => {
    const t = q.trim(); if (!t) { onReset(); setQuery(''); return }
    setOpen(false)
    onQuery(t)
  }

  return (
    <div style={{
      padding: '12px 16px', borderBottom: '1px solid var(--li-border)',
      display: 'flex', alignItems: 'center', gap: 10, background: 'var(--li-white)',
    }}>

      {/* LinkedIn-style search bar */}
      <div ref={wrapRef} style={{ flex: 1, position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: open ? 'var(--li-white)' : '#EEF3F8',
          border: `1px solid ${open ? 'var(--li-blue)' : 'transparent'}`,
          borderRadius: 4, transition: 'all 0.15s',
          boxShadow: open ? '0 0 0 1px var(--li-blue)' : 'none',
        }}>
          <span style={{ padding: '0 10px', color: 'var(--li-text-2)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🔍'}
          </span>
          <input
            id="ai-query-input"
            ref={inputRef}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              color: 'var(--li-text)', fontSize: 14, padding: '9px 0',
              fontFamily: 'inherit',
            }}
            placeholder='Search connections — "Find recruiters at Google", "Show senior engineers"'
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }}
            onFocus={() => setOpen(true)}
          />
          {query && (
            <button onClick={() => { setQuery(''); onReset() }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 10px', color: 'var(--li-text-2)', fontSize: 16 }}>
              ✕
            </button>
          )}
        </div>

        {/* LinkedIn-style suggestions dropdown */}
        {open && !query && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
            background: 'var(--li-white)', borderRadius: 4,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 12px 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: 'var(--li-text-3)', textTransform: 'uppercase' }}>
              Suggested searches
            </div>
            {SUGGESTIONS.map(s => (
              <div key={s} onMouseDown={() => { setQuery(s); submit(s) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', cursor: 'pointer',
                  transition: 'background 0.1s', fontSize: 14,
                  color: 'var(--li-text)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F3F2EF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--li-text-2)', fontSize: 14 }}>🔍</span>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <button id="query-submit-btn" className="btn btn-primary"
        onClick={() => submit()} disabled={loading}
        style={{ padding: '8px 20px', flexShrink: 0, fontSize: 14 }}>
        Search
      </button>

      {label && (
        <span style={{ fontSize: 12, color: 'var(--li-text-2)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}
        </span>
      )}
    </div>
  )
}
