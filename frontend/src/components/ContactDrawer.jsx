import React, { useState } from 'react'

/**
 * ContactDrawer — LinkedIn-style contact panel.
 *
 * Key fixes + features:
 *  - Email shows ONLY the connection's own email (never account email)
 *  - Quick-copy for email + LinkedIn URL
 *  - Connection freshness (age + badge)
 *  - "Find Similar" — filter network to similar people
 *  - "People at same company" count
 */

const CATEGORY_EMOJI = {
  'Software Engineer':    '💻',
  'Data Scientist':       '📊',
  'Recruiter/HR':         '🤝',
  'Founder/Entrepreneur': '🚀',
  'Student':              '🎓',
  'Marketing/Sales':      '📣',
  'Other':                '👤',
}
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
const SENIORITY_DOT = {
  'Intern':    'seniority-dot-intern',
  'Junior':    'seniority-dot-junior',
  'Mid-level': 'seniority-dot-mid',
  'Senior':    'seniority-dot-senior',
  'Lead':      'seniority-dot-lead',
  'Executive': 'seniority-dot-exec',
}
const LI_AVATAR_COLORS = [
  '#0A66C2','#057642','#915907','#B24020','#520091','#0073B1','#7B5E00',
]
function avatarColor(name) {
  return LI_AVATAR_COLORS[(name?.charCodeAt(0) ?? 65) % LI_AVATAR_COLORS.length]
}

/* ── Connection age utilities ───────────────────────────────── */
function parseConnectionAge(dateStr) {
  if (!dateStr || dateStr === 'nan' || dateStr === '') return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  const days = Math.floor((Date.now() - d) / 86400000)
  return { days, date: d }
}

function formatAge(days) {
  if (days < 1)   return 'Today'
  if (days < 7)   return `${days}d ago`
  if (days < 30)  return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  const yrs = Math.floor(days / 365)
  return `${yrs} yr${yrs > 1 ? 's' : ''} ago`
}

function FreshnessBadge({ connected_on }) {
  const age = parseConnectionAge(connected_on)
  if (!age) return null
  if (age.days <= 90) return (
    <span style={{
      background: 'rgba(5,118,66,0.1)', color: '#057642',
      borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '2px 7px',
    }}>🆕 NEW</span>
  )
  if (age.days >= 730) return (
    <span style={{
      background: 'rgba(145,89,7,0.1)', color: '#915907',
      borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '2px 7px',
    }}>💤 RECONNECT</span>
  )
  return null
}

/* ── Quick Copy button ──────────────────────────────────────── */
function CopyBtn({ value, label }) {
  const [copied, setCopied] = useState(false)
  if (!value || value === 'nan' || value === '') return null
  const copy = (e) => {
    e.preventDefault(); e.stopPropagation()
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={copy} title={`Copy ${label}`} style={{
      border: 'none', background: copied ? 'rgba(5,118,66,0.1)' : 'rgba(0,0,0,0.06)',
      color: copied ? '#057642' : 'rgba(0,0,0,0.5)',
      borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600,
      padding: '2px 7px', fontFamily: 'inherit', transition: 'all 0.15s',
    }}>
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  )
}

/* ── Score bar ──────────────────────────────────────────────── */
function ScoreBar({ score }) {
  const pct   = Math.round((score ?? 0) * 100)
  const color = score > 0.7 ? 'var(--li-green)' : score > 0.4 ? 'var(--li-gold)' : 'rgba(0,0,0,0.2)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,0.07)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 0.8s ease' }} />
      </div>
      <span style={{
        fontFamily: 'monospace', fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'right',
        color: score > 0.7 ? 'var(--li-green)' : score > 0.4 ? 'var(--li-gold)' : 'rgba(0,0,0,0.4)',
      }}>{pct}</span>
    </div>
  )
}

/* ── Field row ──────────────────────────────────────────────── */
function Field({ icon, label, children, action }) {
  return (
    <div className="contact-field">
      <div className="contact-field-icon">{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <div className="contact-field-label">{label}</div>
          {action}
        </div>
        <div className="contact-field-value">{children}</div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────────── */
export default function ContactDrawer({
  connection: c, onClose, onMessage, onFindSimilar, allConnections = [],
}) {
  if (!c) return null

  const hasRealUrl = c.linkedin_url && c.linkedin_url !== '' && c.linkedin_url !== 'nan'
  const profileUrl = hasRealUrl
    ? c.linkedin_url
    : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(c.full_name)}`
  const googleUrl  = `https://www.google.com/search?q=${encodeURIComponent(`${c.full_name} ${c.company} LinkedIn`)}`

  // ── Connection's own email ONLY — never account email ──
  const connEmail = (c.email && c.email !== '' && c.email !== 'nan') ? c.email : null

  const age = parseConnectionAge(c.connected_on)
  const score = c.score ?? 0

  // People at same company
  const sameCompany = allConnections.filter(
    x => x.id !== c.id && x.company && x.company === c.company
  )

  // Profile summary for clipboard
  const profileSummary = [
    c.full_name,
    `${c.job_title_clean || c.job_title_raw} at ${c.company}`,
    connEmail ? `Email: ${connEmail}` : '',
    hasRealUrl ? c.linkedin_url : '',
  ].filter(Boolean).join('\n')

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer" id="contact-drawer">

        {/* ── Sticky header ── */}
        <div className="drawer-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span className="eyebrow">Contact Details</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <CopyBtn value={profileSummary} label="Profile" />
              <button onClick={onClose} style={{
                background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
                color: 'rgba(0,0,0,0.4)', lineHeight: 1, padding: '2px 4px',
              }}>✕</button>
            </div>
          </div>

          {/* Avatar + name */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: avatarColor(c.full_name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff',
              border: '3px solid white', boxShadow: '0 0 0 2px rgba(0,0,0,0.1)',
            }}>
              {c.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'rgba(0,0,0,0.9)', marginBottom: 4, lineHeight: 1.2 }}>
                {c.full_name}
              </h2>
              <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', marginBottom: 8, lineHeight: 1.4 }}>
                {c.job_title_clean || c.job_title_raw}
                {c.company && <> · <strong style={{ color: 'rgba(0,0,0,0.85)' }}>{c.company}</strong></>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className={`badge ${BADGE_CLASS[c.category] || 'badge-other'}`} style={{ fontSize: 11 }}>
                  {CATEGORY_EMOJI[c.category]} {c.category}
                </span>
                <FreshnessBadge connected_on={c.connected_on} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <a href={profileUrl} target="_blank" rel="noreferrer" id="view-linkedin-btn"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 20,
                background: 'var(--li-blue)', color: '#fff',
                fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}>
              <LinkedInIcon /> LinkedIn
            </a>
            <button id="drawer-message-btn" onClick={() => onMessage(c)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 20,
                background: 'white', color: 'var(--li-blue)',
                border: '1.5px solid var(--li-blue)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
              ✉️ Message
            </button>
            <a href={googleUrl} target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px 12px', borderRadius: 20,
                border: '1.5px solid rgba(0,0,0,0.15)',
                color: 'rgba(0,0,0,0.5)', textDecoration: 'none', fontSize: 16,
              }}>🔍</a>
            {onFindSimilar && (
              <button title="Find similar people in your network" onClick={() => { onClose(); onFindSimilar(c) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 12px', borderRadius: 20,
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  background: 'white', color: 'rgba(0,0,0,0.5)',
                  fontSize: 16, cursor: 'pointer',
                }}>👥</button>
            )}
          </div>
        </div>

        {/* ── Contact Info ── */}
        <Section title="Contact Info · LinkedIn Fields">

          {/* LinkedIn Profile */}
          <Field icon="🔗" label="LinkedIn Profile"
            action={hasRealUrl ? <CopyBtn value={c.linkedin_url} label="URL" /> : null}>
            <a href={profileUrl} target="_blank" rel="noreferrer">
              {hasRealUrl ? 'Open Profile ↗' : 'Search on LinkedIn ↗'}
            </a>
            {hasRealUrl && (
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', marginTop: 2, wordBreak: 'break-all' }}>
                {c.linkedin_url.replace('https://', '')}
              </div>
            )}
          </Field>

          {/* Email — ONLY the connection's email, never account email */}
          <Field icon="📧" label="Email Address"
            action={connEmail ? <CopyBtn value={connEmail} label="Email" /> : null}>
            {connEmail ? (
              <a href={`mailto:${connEmail}`}>{connEmail}</a>
            ) : (
              <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>
                Not shared in LinkedIn export
              </span>
            )}
          </Field>

          {/* Phone */}
          <Field icon="📱" label="Phone Number">
            <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Not included in LinkedIn export</span>
          </Field>

          {/* Website */}
          <Field icon="🌐" label="Website / Portfolio">
            <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Not included in LinkedIn export</span>
          </Field>

          {/* Address */}
          <Field icon="🏠" label="Address">
            <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Not included in LinkedIn export</span>
          </Field>

          {/* Twitter */}
          <Field icon="𝕏" label="Twitter / X">
            <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Not included in LinkedIn export</span>
          </Field>

          {/* Birthday */}
          <Field icon="🎂" label="Birthday">
            <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Not included in LinkedIn export</span>
          </Field>

          {/* Connected On — with age */}
          <Field icon="📅" label="Connected On">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.connected_on || '—'}</span>
              {age && (
                <span style={{
                  fontSize: 11, color: 'rgba(0,0,0,0.4)',
                  background: 'rgba(0,0,0,0.05)', borderRadius: 4, padding: '1px 6px',
                }}>{formatAge(age.days)}</span>
              )}
            </div>
          </Field>
        </Section>

        {/* ── Current Position ── */}
        <Section title="Current Position">
          <Field icon="💼" label="Job Title">
            <div>{c.job_title_clean || c.job_title_raw || '—'}</div>
            {c.job_title_clean && c.job_title_raw && c.job_title_clean !== c.job_title_raw && (
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 2 }}>Raw: {c.job_title_raw}</div>
            )}
          </Field>
          <Field icon="🏢" label="Company">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{c.company || '—'}</span>
              {sameCompany.length > 0 && (
                <span style={{
                  fontSize: 11, background: 'rgba(10,102,194,0.1)', color: 'var(--li-blue)',
                  borderRadius: 99, padding: '1px 7px', fontWeight: 600, cursor: 'default',
                }} title={sameCompany.slice(0,5).map(x=>x.full_name).join(', ')}>
                  +{sameCompany.length} in network
                </span>
              )}
            </div>
          </Field>
        </Section>

        {/* ── AI Analysis ── */}
        <Section title="AI Analysis">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Category">
              <span className={`badge ${BADGE_CLASS[c.category] || 'badge-other'}`}>
                {CATEGORY_EMOJI[c.category]} {c.category}
              </span>
            </Row>
            <Row label="Seniority">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={`seniority-dot ${SENIORITY_DOT[c.seniority] || 'seniority-dot-mid'}`} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>{c.seniority || 'Unknown'}</span>
              </div>
            </Row>
            <Row label="Domain">
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.domain || 'General'}</span>
            </Row>
            <div>
              <Row label="Relevance Score" />
              <div style={{ marginTop: 6 }}><ScoreBar score={score} /></div>
            </div>
            {(c.tags?.length > 0) && (
              <div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginBottom: 6 }}>Tags</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {c.tags.map(t => (
                    <span key={t} className={`tag ${TAG_CLASS[t] || 'tag-tech'}`}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ── Why reach out ── */}
        <Section title="Why Reach Out">
          <OutreachReason connection={c} />
        </Section>

        {/* Footer note */}
        <div style={{ padding: '12px 20px 32px' }}>
          <div style={{
            background: 'rgba(10,102,194,0.05)', border: '1px solid rgba(10,102,194,0.15)',
            borderRadius: 6, padding: '9px 12px', fontSize: 12, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5,
          }}>
            <strong style={{ color: 'var(--li-blue)' }}>ℹ️ LinkedIn Privacy</strong><br/>
            Phone, address, website and birthday require viewing the full LinkedIn profile.
          </div>
        </div>
      </aside>
    </>
  )
}

/* ── Small helper components ────────────────────────────────── */
function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 24 }}>
      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>{label}</span>
      {children}
    </div>
  )
}

function OutreachReason({ connection: c }) {
  const age = parseConnectionAge(c.connected_on)
  const reasons = []

  if (c.category === 'Recruiter/HR') reasons.push({ icon: '🎯', text: 'Recruiter — great for job leads & referrals' })
  if (c.category === 'Founder/Entrepreneur') reasons.push({ icon: '🚀', text: 'Founder — potential collaboration or investment' })
  if (c.tags?.includes('Hiring Potential')) reasons.push({ icon: '💼', text: 'Likely hiring — ask about open roles' })
  if (c.tags?.includes('High Value Connection')) reasons.push({ icon: '⭐', text: 'High-value — priority for networking' })
  if (age && age.days <= 30) reasons.push({ icon: '🆕', text: 'Recently connected — perfect time to say hi' })
  if (age && age.days >= 730) reasons.push({ icon: '💤', text: 'Haven\'t interacted in 2+ years — reconnect!' })
  if (c.score > 0.8) reasons.push({ icon: '🔥', text: 'Top-ranked in your network — high priority' })

  if (reasons.length === 0) {
    reasons.push({ icon: '🤝', text: 'Stay in touch — strong networks take consistency' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {reasons.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>
          <span style={{ fontSize: 15, flexShrink: 0 }}>{r.icon}</span>
          <span style={{ lineHeight: 1.45 }}>{r.text}</span>
        </div>
      ))}
    </div>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}
