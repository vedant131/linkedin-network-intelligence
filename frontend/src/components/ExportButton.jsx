import { useState } from 'react'

export default function ExportButton({ sessionId }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const exportExcel = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      const res = await fetch('/api/export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (!res.ok) throw new Error('Server error')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'my_network.xlsx'; a.style.display = 'none'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDone(true); setTimeout(() => setDone(false), 3000)
    } catch (e) {
      alert('Export failed: ' + e.message)
    } finally { setLoading(false) }
  }

  return (
    <button id="export-excel-btn" onClick={exportExcel} disabled={loading || !sessionId}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px',
        borderRadius: 24,   /* LinkedIn pill button */
        border: `1.5px solid ${done ? 'var(--li-green)' : 'var(--li-blue)'}`,
        background: done ? 'var(--li-green)' : 'var(--li-blue)',
        color: '#fff',
        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
        cursor: loading || !sessionId ? 'not-allowed' : 'pointer',
        opacity: !sessionId ? 0.5 : 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.18s',
      }}
      onMouseEnter={e => { if (!loading && sessionId) e.currentTarget.style.background = done ? 'var(--li-green)' : 'var(--li-blue-hover)' }}
      onMouseLeave={e => { e.currentTarget.style.background = done ? 'var(--li-green)' : 'var(--li-blue)' }}
    >
      {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} /> Exporting…</>
       : done    ? <>✓ my_network.xlsx saved</>
       :           <>↓ Export .xlsx</>}
    </button>
  )
}
