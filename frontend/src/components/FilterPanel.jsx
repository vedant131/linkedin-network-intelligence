import { useState, useMemo, useRef, useCallback } from 'react'

/* ── Seniority display order (not alphabetical) ─────────────── */
const SENIORITY_ORDER = ['Intern','Junior','Mid-level','Senior','Lead','Executive']

/* ── Company search dropdown — handles 500+ companies ───────── */
function CompanyDropdown({ companies, selected, onToggle, onClear }) {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef()
  const active = selected.length > 0

  const visible = useMemo(() => {
    const s = search.toLowerCase()
    return companies.filter(([name]) => name.toLowerCase().includes(s)).slice(0, 80)
  }, [companies, search])

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left })
    }
    setOpen(v => !v)
  }

  return (
    <>
      <button ref={btnRef} className={`filter-chip ${active ? 'active' : ''}`} onClick={handleOpen}>
        Company
        {active && (
          <span style={{ background: 'var(--li-blue)', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>
            {selected.length}
          </span>
        )}
        <span style={{ fontSize: 10, opacity: 0.55, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => { setOpen(false); setSearch('') }} />
          <div style={{
            position: 'fixed', top: dropPos.top, left: dropPos.left,
            zIndex: 1000, background: '#fff', borderRadius: 6,
            width: 280, boxShadow: '0 0 0 1px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.16)',
            animation: 'dropIn 0.14s ease', display: 'flex', flexDirection: 'column',
            maxHeight: 380,
          }}>
            {/* Search box */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search companies…"
                style={{
                  width: '100%', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 4,
                  padding: '5px 8px', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--li-blue)'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.15)'}
              />
            </div>

            {/* Company list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {visible.length === 0 && (
                <div style={{ padding: '12px 14px', fontSize: 13, color: 'rgba(0,0,0,0.4)' }}>No companies match</div>
              )}
              {visible.map(([name, count]) => (
                <label key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 14px', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F3F2EF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <input type="checkbox" checked={selected.includes(name)} onChange={() => onToggle(name)}
                    style={{ accentColor: 'var(--li-blue)', width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />
                  <span style={{
                    flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: selected.includes(name) ? 'var(--li-blue)' : 'rgba(0,0,0,0.85)',
                    fontWeight: selected.includes(name) ? 600 : 400,
                  }}>{name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', flexShrink: 0 }}>{count}</span>
                </label>
              ))}
            </div>

            {selected.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '6px 14px' }}>
                <button onClick={() => { onClear(); setOpen(false); setSearch('') }}
                  style={{ fontSize: 13, color: 'var(--li-blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Clear ({selected.length})
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

/* ── Generic multi-select dropdown ──────────────────────────── */
function MultiDropdown({ label, options, selected, onToggle, onClear, showCounts = false }) {
  const [open, setOpen]       = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef()
  const active = selected.length > 0

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left })
    }
    setOpen(v => !v)
  }

  return (
    <>
      <button ref={btnRef} className={`filter-chip ${active ? 'active' : ''}`} onClick={handleOpen}>
        {label}
        {active && (
          <span style={{ background: 'var(--li-blue)', color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px' }}>
            {selected.length}
          </span>
        )}
        <span style={{ fontSize: 10, opacity: 0.55, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'fixed', top: dropPos.top, left: dropPos.left,
            zIndex: 1000, background: '#fff', borderRadius: 6,
            minWidth: 240, maxHeight: 340, overflowY: 'auto',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.16)',
            paddingTop: 6, paddingBottom: 6,
            animation: 'dropIn 0.14s ease',
          }}>
            {options.map(opt => {
              const name    = Array.isArray(opt) ? opt[0] : opt
              const count   = Array.isArray(opt) ? opt[1] : null
              const checked = selected.includes(name)
              return (
                <label key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F3F2EF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <input type="checkbox" checked={checked} onChange={() => onToggle(name)}
                    style={{ accentColor: 'var(--li-blue)', width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />
                  <span style={{
                    flex: 1, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    color: checked ? 'var(--li-blue)' : 'rgba(0,0,0,0.85)',
                    fontWeight: checked ? 600 : 400,
                  }}>{name}</span>
                  {count != null && (
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', flexShrink: 0 }}>{count}</span>
                  )}
                </label>
              )
            })}
            {selected.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '6px 14px 2px' }}>
                <button onClick={() => { onClear(); setOpen(false) }}
                  style={{ fontSize: 13, color: 'var(--li-blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Clear ({selected.length})
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

/* ── Main FilterPanel ────────────────────────────────────────── */
export default function FilterPanel({ connections, onChange }) {
  const [filters, setFilters] = useState({
    categories: [], seniorities: [], domains: [], companies: [], tags: [], keyword: '',
  })

  /* ── Derive all options from real data ── */

  // Categories with counts, sorted by count desc
  const categories = useMemo(() => {
    const counts = {}
    connections.forEach(c => { if (c.category) counts[c.category] = (counts[c.category] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [connections])

  // Seniorities in logical order, only those present in data
  const seniorities = useMemo(() => {
    const counts = {}
    connections.forEach(c => { if (c.seniority) counts[c.seniority] = (counts[c.seniority] || 0) + 1 })
    const ordered = SENIORITY_ORDER.filter(s => counts[s]).map(s => [s, counts[s]])
    // append any unknown seniority types not in order
    Object.entries(counts).forEach(([s, n]) => { if (!SENIORITY_ORDER.includes(s)) ordered.push([s, n]) })
    return ordered
  }, [connections])

  // Companies sorted by count desc
  const companies = useMemo(() => {
    const counts = {}
    connections.forEach(c => { if (c.company) counts[c.company] = (counts[c.company] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [connections])

  // Domains sorted by count
  const domains = useMemo(() => {
    const counts = {}
    connections.forEach(c => { if (c.domain) counts[c.domain] = (counts[c.domain] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [connections])

  // Tags from actual data
  const tags = useMemo(() => {
    const counts = {}
    connections.forEach(c => (c.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [connections])

  const update = useCallback((patch) => {
    const next = { ...filters, ...patch }
    setFilters(next); onChange(next)
  }, [filters, onChange])

  const toggleArr = (field, value) => {
    const arr = filters[field]
    update({ [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] })
  }

  const activeCount = filters.categories.length + filters.seniorities.length +
    filters.domains.length + filters.companies.length + filters.tags.length +
    (filters.keyword ? 1 : 0)

  const clearAll = () => {
    const r = { categories: [], seniorities: [], domains: [], companies: [], tags: [], keyword: '' }
    setFilters(r); onChange(r)
  }

  return (
    <div style={{
      padding: '8px 14px 12px',
      display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap',
      borderTop: '1px solid rgba(0,0,0,0.06)',
    }}>
      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', fontWeight: 500, flexShrink: 0 }}>Filter:</span>

      {/* Keyword */}
      <input
        style={{
          width: 155, fontSize: 13, padding: '5px 9px',
          background: '#EEF3F8', border: '1px solid transparent',
          borderRadius: 4, transition: 'all 0.15s', outline: 'none',
          fontFamily: 'inherit', color: 'rgba(0,0,0,0.85)',
        }}
        placeholder="Name, title…"
        value={filters.keyword}
        onChange={e => update({ keyword: e.target.value })}
        onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--li-blue)' }}
        onBlur={e => { e.target.style.background = '#EEF3F8'; e.target.style.borderColor = 'transparent' }}
      />

      <MultiDropdown label="Category"  options={categories}  selected={filters.categories}
        onToggle={v => toggleArr('categories', v)} onClear={() => update({ categories: [] })} />

      <MultiDropdown label="Seniority" options={seniorities} selected={filters.seniorities}
        onToggle={v => toggleArr('seniorities', v)} onClear={() => update({ seniorities: [] })} />

      <CompanyDropdown companies={companies} selected={filters.companies}
        onToggle={v => toggleArr('companies', v)} onClear={() => update({ companies: [] })} />

      <MultiDropdown label="Domain"    options={domains}     selected={filters.domains}
        onToggle={v => toggleArr('domains', v)} onClear={() => update({ domains: [] })} />

      <MultiDropdown label="Tags"      options={tags}        selected={filters.tags}
        onToggle={v => toggleArr('tags', v)} onClear={() => update({ tags: [] })} />

      {activeCount > 0 && (
        <button onClick={clearAll}
          style={{
            fontSize: 12, padding: '5px 10px', borderRadius: 4,
            background: 'rgba(10,102,194,0.07)', color: 'var(--li-blue)',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}>
          ✕ Clear all ({activeCount})
        </button>
      )}
    </div>
  )
}
