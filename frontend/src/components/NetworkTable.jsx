import { useState, useMemo } from 'react'

/* ── Badge / Tag / Seniority class maps ──────────────────────── */
const BADGE_CLASS = {
  'Software Engineer':    'badge-swe',
  'Data Scientist':       'badge-ds',
  'Recruiter/HR':         'badge-hr',
  'Founder/Entrepreneur': 'badge-founder',
  'Student':              'badge-student',
  'Marketing/Sales':      'badge-marketing',
  'Other':                'badge-other',
}
const TAG_CLASS = {
  'Hiring Potential':      'tag-hiring',
  'Tech':                  'tag-tech',
  'Business':              'tag-business',
  'High Value Connection': 'tag-hv',
  'Startup':               'tag-startup',
  'Academia':              'tag-academia',
}
const SENIORITY_DOT_CLS = {
  'Intern':    'seniority-dot-intern',
  'Junior':    'seniority-dot-junior',
  'Mid-level': 'seniority-dot-mid',
  'Senior':    'seniority-dot-senior',
  'Lead':      'seniority-dot-lead',
  'Executive': 'seniority-dot-exec',
}
const AVATAR_COLORS = [
  '#0A66C2','#057642','#915907','#B24020','#520091','#0073B1','#7B5E00',
]
function avatarColor(name) {
  return AVATAR_COLORS[(name?.charCodeAt(0) ?? 65) % AVATAR_COLORS.length]
}

const PAGE = 50

/* ── Truncated cell text with native tooltip ─────────────────── */
function Cell({ children, style = {}, title }) {
  return (
    <div title={title || (typeof children === 'string' ? children : undefined)} style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      ...style,
    }}>
      {children}
    </div>
  )
}

export default function NetworkTable({ connections, onContact }) {
  const [sort, setSort] = useState({ key: 'score', dir: -1 })
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    return [...connections].sort((a, b) => {
      const av = a[sort.key] ?? ''
      const bv = b[sort.key] ?? ''
      return (typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))) * sort.dir
    })
  }, [connections, sort])

  const paginated = sorted.slice(0, (page + 1) * PAGE)
  const hasMore   = paginated.length < sorted.length

  const toggleSort = (k) => {
    setSort(s => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: -1 })
    setPage(0)
  }

  function Th({ label, col, width }) {
    const active = sort.key === col
    return (
      <th onClick={() => toggleSort(col)}
        className={active ? 'sorted' : ''}
        style={{ width, minWidth: width }}
      >
        {label}
        {active ? (sort.dir === -1 ? ' ↓' : ' ↑') : ''}
      </th>
    )
  }

  if (!connections.length) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>👥</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.8)', marginBottom: 6 }}>No connections found</div>
      <div style={{ fontSize: 14 }}>Try adjusting your filters or search query.</div>
    </div>
  )

  return (
    <div>
      {/* Meta row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 10px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
          <strong style={{ color: 'rgba(0,0,0,0.9)' }}>{connections.length}</strong> connections
          <span style={{ fontSize: 12, marginLeft: 8, color: 'rgba(0,0,0,0.35)' }}>
            · Click a row to view contact details
          </span>
        </span>
      </div>

      {/* Table with fixed layout — prevents column bleed */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',   /* ← KEY: prevents column overflow bleed */
        }}>
          <colgroup>
            <col style={{ width: 220 }} />  {/* Name */}
            <col style={{ width: 210 }} />  {/* Title */}
            <col style={{ width: 150 }} />  {/* Company */}
            <col style={{ width: 160 }} />  {/* Category */}
            <col style={{ width: 110 }} />  {/* Seniority */}
            <col style={{ width: 220 }} />  {/* Tags */}
            <col style={{ width: 64  }} />  {/* Score */}
          </colgroup>
          <thead>
            <tr>
              <Th label="Name"      col="full_name"       />
              <Th label="Title"     col="job_title_clean" />
              <Th label="Company"   col="company"         />
              <Th label="Category"  col="category"        />
              <Th label="Seniority" col="seniority"       />
              <Th label="Tags"      col="tags"            />
              <Th label="Score"     col="score"           />
            </tr>
          </thead>
          <tbody>
            {paginated.map((c, i) => {
              const title   = c.job_title_clean || c.job_title_raw || ''
              const company = c.company || ''
              const score   = c.score ?? 0
              const scorePct = Math.round(score * 100)
              const scoreClass = score > 0.7 ? 'score-high' : score > 0.4 ? 'score-mid' : 'score-low'

              // Connection freshness
              const ageDays = (() => {
                if (!c.connected_on || c.connected_on === 'nan') return null
                const d = new Date(c.connected_on)
                return isNaN(d) ? null : Math.floor((Date.now() - d) / 86400000)
              })()
              const freshBadge = ageDays !== null && ageDays <= 90
                ? { label: '🆕', color: '#057642', bg: 'rgba(5,118,66,0.1)' }
                : ageDays !== null && ageDays >= 730
                ? { label: '💤', color: '#915907', bg: 'rgba(145,89,7,0.1)' }
                : null

              return (
                <tr key={c.id ?? i}
                  onClick={() => onContact(c)}
                  style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F3F2EF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >

                  {/* ── Name + Avatar ── */}
                  <td style={{ padding: '11px 12px 11px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      {/* Circular LinkedIn-style avatar */}
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                        background: avatarColor(c.full_name),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 15,
                        border: '2px solid #fff', boxShadow: '0 0 0 1.5px rgba(0,0,0,0.12)',
                      }}>
                        {c.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Cell title={c.full_name} style={{ fontWeight: 600, fontSize: 14, color: '#0A66C2' }}>
                            {c.full_name}
                          </Cell>
                          {freshBadge && (
                            <span title={ageDays <= 90 ? `Connected ${ageDays} days ago` : `Connected ${Math.floor(ageDays/365)} year(s) ago`}
                              style={{
                                fontSize: 11, borderRadius: 99, padding: '0 5px', flexShrink: 0,
                                background: freshBadge.bg, color: freshBadge.color, fontWeight: 700,
                              }}>
                              {freshBadge.label}
                            </span>
                          )}
                        </div>
                        {c.email && (
                          <Cell style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', fontFamily: 'monospace' }}>
                            {c.email}
                          </Cell>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ── Title ── strictly contained */}
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', verticalAlign: 'middle' }}>
                    <Cell title={title} style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>
                      {title}
                    </Cell>
                  </td>

                  {/* ── Company ── */}
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', verticalAlign: 'middle' }}>
                    <Cell title={company} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
                      {company}
                    </Cell>
                  </td>

                  {/* ── Category badge ── */}
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', verticalAlign: 'middle' }}>
                    <span className={`badge ${BADGE_CLASS[c.category] || 'badge-other'}`}
                      style={{ fontSize: 11, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', whiteSpace: 'nowrap' }}>
                      {c.category}
                    </span>
                  </td>

                  {/* ── Seniority dot ── */}
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className={`seniority-dot ${SENIORITY_DOT_CLS[c.seniority] || 'seniority-dot-mid'}`} />
                      <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>
                        {c.seniority}
                      </span>
                    </div>
                  </td>

                  {/* ── Tags ── */}
                  <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
                      {(c.tags || []).slice(0, 3).map(t => (
                        <span key={t} className={`tag ${TAG_CLASS[t] || 'tag-tech'}`} style={{ fontSize: 10, flexShrink: 0 }}>
                          {t}
                        </span>
                      ))}
                      {(c.tags || []).length > 3 && (
                        <span style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)', flexShrink: 0, alignSelf: 'center' }}>
                          +{c.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ── Score ── */}
                  <td style={{
                    padding: '11px 12px 11px 4px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    verticalAlign: 'middle', textAlign: 'right',
                  }}>
                    <span className={`score-pill ${scoreClass}`}>{scorePct}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Show more */}
      {hasMore && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(0,0,0,0.07)', textAlign: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => setPage(p => p + 1)}
            style={{ fontSize: 13 }}
          >
            Show {Math.min(PAGE, sorted.length - paginated.length)} more results
          </button>
        </div>
      )}
    </div>
  )
}
