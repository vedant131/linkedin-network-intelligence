import { useState, useRef } from 'react'

export default function UploadZone({ onUpload }) {
  const [isDragging, setDragging] = useState(false)
  const [fileName, setFileName]   = useState(null)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }
  const processFile = (file) => {
    const ok = file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.zip')
    if (!ok) { alert('Please upload the LinkedIn ZIP file or the Connections.csv file.'); return }
    setFileName(file.name); onUpload(file)
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', background: 'var(--li-bg)',
    }}>
      <div className="anim-in" style={{ maxWidth: 620, width: '100%' }}>

        {/* Main card */}
        <div className="li-card" style={{ overflow: 'hidden', marginBottom: 14 }}>
          {/* LinkedIn-blue cover */}
          <div style={{
            background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
            padding: '20px 28px', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0,
            }}>🔗</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>LinkedIn Network Intelligence</h1>
              <p style={{ fontSize: 13, opacity: 0.85 }}>AI classification · Natural-language search · Excel export</p>
            </div>
          </div>

          <div style={{ padding: '24px 28px' }}>
            {/* 2-option instructions */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24,
            }}>
              <OptionCard
                recommended
                icon="📦"
                title="Option 1 — Upload ZIP (recommended)"
                steps={[
                  'LinkedIn → Settings & Privacy',
                  'Data Privacy → Get a copy of your data',
                  'Select "Connections" → Request archive',
                  'Upload the ZIP file directly here ✓',
                ]}
              />
              <OptionCard
                icon="📄"
                title="Option 2 — Upload CSV only"
                steps={[
                  'Extract the ZIP file',
                  'Find the "Connections" file inside',
                  'Upload just that file here',
                  '(less contact data available)',
                ]}
              />
            </div>

            {/* Drop zone */}
            <div
              id="upload-dropzone"
              className={`upload-zone ${isDragging ? 'dragging' : ''}`}
              style={{ padding: '32px 24px', textAlign: 'center', background: 'var(--li-bg)', marginBottom: 16 }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>
                {isDragging ? '📂' : fileName ? '✅' : '📁'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--li-text)', marginBottom: 6 }}>
                {fileName
                  ? <span style={{ color: 'var(--li-green)' }}>{fileName} — processing…</span>
                  : isDragging
                  ? <span style={{ color: 'var(--li-blue)' }}>Release to upload</span>
                  : 'Drop your LinkedIn ZIP or CSV here'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--li-text-2)', marginBottom: 20 }}>
                Accepts: <strong>Complete_LinkedInDataExport_*.zip</strong> or <strong>Connections.csv</strong>
              </div>
              <button
                id="upload-btn"
                className="btn btn-primary"
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                style={{ padding: '9px 24px', fontSize: 14 }}
              >
                📎 Choose File
              </button>
              <input ref={inputRef} type="file" accept=".csv,.zip" hidden
                onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]) }} />
            </div>

            {/* Privacy note */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 14px', borderRadius: 6,
              background: 'rgba(10,102,194,0.06)', border: '1px solid rgba(10,102,194,0.15)',
              fontSize: 13, color: 'var(--li-text-2)',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
              <span>Your data is processed on a <strong>secure private server</strong> — it is never stored permanently, shared, or used for any purpose other than showing you your results.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function OptionCard({ icon, title, steps, recommended }) {
  return (
    <div style={{
      border: `1.5px solid ${recommended ? 'var(--li-blue)' : 'rgba(0,0,0,0.12)'}`,
      borderRadius: 6, padding: '12px 14px',
      background: recommended ? 'rgba(10,102,194,0.04)' : 'var(--li-bg)',
      position: 'relative',
    }}>
      {recommended && (
        <span style={{
          position: 'absolute', top: -10, left: 12,
          background: 'var(--li-blue)', color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
        }}>RECOMMENDED</span>
      )}
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--li-text)', marginBottom: 8 }}>{title}</div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
          <span style={{ color: 'var(--li-blue)', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{i + 1}.</span>
          <span style={{ fontSize: 11, color: 'var(--li-text-2)', lineHeight: 1.4 }}>{s}</span>
        </div>
      ))}
    </div>
  )
}
