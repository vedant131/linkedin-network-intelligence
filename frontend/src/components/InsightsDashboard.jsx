import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const PALETTE = ['#0A66C2','#057642','#0073B1','#915907','#520091','#B24020','#7B5E00','#5B5B5B']

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(0,0,0,0.06)', border: '1px solid var(--li-border-dark)',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: 'var(--li-text)', marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ color: 'var(--li-blue)' }}>{payload[0].value}</div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: 'var(--li-white)', border: '1px solid var(--li-border)', borderRadius: 14, padding: 20 }}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  )
}

export default function InsightsDashboard({ insights }) {
  const catData = Object.entries(insights.by_category || {}).map(([name, value]) => ({ name, value }))
  const senData = Object.entries(insights.by_seniority || {}).map(([name, value]) => ({ name, value }))
  const top10   = (insights.top_companies || []).slice(0, 8)
  const maxCo   = top10[0]?.[1] ?? 1

  return (
    <div className="anim-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>

      {/* Category donut */}
      <SectionCard title="By Category">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={catData} cx="50%" cy="50%" innerRadius={42} outerRadius={66}
                 dataKey="value" paddingAngle={3} stroke="none">
              {catData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip content={<ChartTip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px', marginTop: 8 }}>
          {catData.map((d, i) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
              <span style={{ color: 'var(--li-text-2)' }}>{d.name.split('/')[0]}</span>
              <span style={{ fontWeight: 700, color: 'var(--li-text-2)' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Seniority horizontal bar */}
      <SectionCard title="By Seniority">
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={senData} layout="vertical" barSize={8} margin={{ left: 0, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis type="number" tick={{ fill: 'var(--li-text-2)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--li-text-2)', fontSize: 11 }}
                   axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<ChartTip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {senData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Top companies progress bars */}
      <SectionCard title="Top Companies">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top10.map(([name, count], i) => (
            <div key={name} className="bar-row">
              <div style={{ fontSize: 12, color: 'var(--li-text-2)', fontWeight: 500 }} className="truncate">{name || 'Unknown'}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{
                  width: `${(count / maxCo) * 100}%`,
                  background: PALETTE[i % PALETTE.length],
                }} />
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--li-text-2)', textAlign: 'right' }}>{count}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
