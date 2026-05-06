/**
 * Client-side natural language query engine.
 * Ports the Python query_engine.py logic to JavaScript so search works
 * instantly without any backend dependency.
 */

const CATEGORY_MAP = {
  'Software Engineer':    ['engineer', 'developer', 'programmer', 'sde', 'swe', 'coder', 'software'],
  'Recruiter/HR':         ['recruiter', 'hr', 'hiring', 'talent', 'headhunter', 'staffing'],
  'Data Scientist':       ['data scientist', 'ml', 'machine learning', 'ai researcher', 'nlp', 'data science'],
  'Founder/Entrepreneur': ['founder', 'ceo', 'startup', 'entrepreneur', 'co-founder'],
  'Student':              ['student', 'intern', 'fresher', 'campus', 'internship'],
  'Marketing/Sales':      ['marketing', 'sales', 'growth', 'seo', 'brand'],
}

const SENIORITY_MAP = {
  Senior:    ['senior', 'sr', 'experienced', 'veteran'],
  Lead:      ['lead', 'manager', 'head', 'director'],
  Executive: ['executive', 'vp', 'cto', 'ceo', 'chief'],
  Intern:    ['intern', 'internship', 'fresher', 'entry level'],
  Junior:    ['junior', 'jr', 'beginner'],
}

const DOMAIN_MAP = {
  'AI/ML':        ['ai', 'machine learning', 'deep learning', 'llm', 'nlp'],
  Backend:        ['backend', 'server side', 'api'],
  Frontend:       ['frontend', 'ui', 'react'],
  'DevOps/Cloud': ['devops', 'cloud', 'aws', 'azure', 'kubernetes'],
  Finance:        ['finance', 'fintech', 'banking'],
}

function extractIntent(query) {
  const q = query.toLowerCase()

  const categories = Object.entries(CATEGORY_MAP)
    .filter(([, kws]) => kws.some(kw => q.includes(kw)))
    .map(([cat]) => cat)

  const seniorities = Object.entries(SENIORITY_MAP)
    .filter(([, kws]) => kws.some(kw => q.includes(kw)))
    .map(([sn]) => sn)

  const domains = Object.entries(DOMAIN_MAP)
    .filter(([, kws]) => kws.some(kw => q.includes(kw)))
    .map(([dm]) => dm)

  // Extract company name after "at", "in", "from", "@"
  const companyMatch = q.match(/\b(?:at|in|from|@)\s+([a-z0-9 ]+?)(?:\s+who|\s+that|$)/i)
  const companyHint = companyMatch ? companyMatch[1].trim() : null

  // General keyword score words (3+ chars)
  const keywords = q.match(/\b\w{3,}\b/g) || []

  return { categories, seniorities, domains, companyHint, keywords }
}

/**
 * Search connections array using natural language query.
 * Returns { results, label }
 */
export function searchConnections(connections, query) {
  if (!query || !query.trim()) return { results: connections, label: `All ${connections.length} connections` }

  const intent = extractIntent(query)
  let filtered = [...connections]

  if (intent.categories.length)
    filtered = filtered.filter(c => intent.categories.includes(c.category))

  if (intent.seniorities.length)
    filtered = filtered.filter(c => intent.seniorities.includes(c.seniority))

  if (intent.domains.length)
    filtered = filtered.filter(c => intent.domains.includes(c.domain))

  if (intent.companyHint)
    filtered = filtered.filter(c =>
      (c.company || '').toLowerCase().includes(intent.companyHint))

  // Full-text keyword fallback — search name, title, company
  if (filtered.length === 0 || (!intent.categories.length && !intent.seniorities.length && !intent.domains.length && !intent.companyHint)) {
    const kq = query.toLowerCase()
    filtered = connections.filter(c =>
      `${c.full_name} ${c.job_title_clean || c.position} ${c.company}`.toLowerCase().includes(kq)
    )
    if (filtered.length === 0) filtered = connections // fallback to all
  }

  // Score: count keyword matches in name+title+company
  filtered = filtered.map(c => {
    const text = `${c.full_name} ${c.job_title_clean || c.position} ${c.company} ${c.tags?.join(' ')}`.toLowerCase()
    const bonus = intent.keywords.filter(kw => text.includes(kw)).length
    return { ...c, _qs: (c.score || 0) + bonus * 5 }
  }).sort((a, b) => b._qs - a._qs)

  // Build human-readable label
  let label = `Showing ${filtered.length} results`
  if (intent.categories.length) {
    label = `Showing ${intent.categories.join(', ')} (${filtered.length})`
    if (intent.seniorities.length) label += ` · ${intent.seniorities.join(', ')}`
    if (intent.companyHint) label += ` · at ${intent.companyHint}`
  } else if (intent.companyHint) {
    label = `People at ${intent.companyHint} (${filtered.length})`
  }

  return { results: filtered, label }
}
