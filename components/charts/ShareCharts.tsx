'use client'

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

const YAMAHA = '#1E5FE8'
const HONDA = '#E40521'
const OUTROS = '#94A3B8'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ShareTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: p.payload.fill }}>
        {p.value} <span className="font-normal" style={{ color: 'var(--chart-axis)' }}>emplac. · {p.payload.pct}%</span>
      </p>
    </div>
  )
}

interface BrandSlice { marca: string; qtd: number; pct: number }

export function ShareDonut({ data }: { data: BrandSlice[] }) {
  const top = data.filter(d => d.qtd > 0).slice(0, 6)
  const palette: Record<string, string> = { Yamaha: YAMAHA, Honda: HONDA }
  const others = ['#A855F7', '#F59E0B', '#14B8A6', '#64748B']
  const chartData = top.map((d, i) => ({
    name: d.marca, value: d.qtd, pct: d.pct,
    fill: palette[d.marca] ?? others[i % others.length],
  }))
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="var(--bg-elevated)" strokeWidth={2}>
          {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Pie>
        <Tooltip content={<ShareTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface TrendPoint { mes: string; yamaha: number; honda: number; outros: number; shareYamaha: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const sy = payload.find((p: any) => p.dataKey === 'shareYamaha')
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--chart-axis)' }}>{label}/26</p>
      {payload.filter((p: any) => p.dataKey !== 'shareYamaha').map((p: any) => (
        <p key={p.dataKey} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.dataKey === 'yamaha' ? 'Yamaha' : p.dataKey === 'honda' ? 'Honda' : 'Outros'}: {p.value}
        </p>
      ))}
      {sy && <p className="text-[11px] mt-1 pt-1 font-bold" style={{ color: YAMAHA, borderTop: '1px solid var(--border)' }}>Share Yamaha: {sy.value}%</p>}
    </div>
  )
}

export function ShareTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-yam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={YAMAHA} stopOpacity={0.30} />
            <stop offset="100%" stopColor={YAMAHA} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-track)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--chart-axis)', fontFamily: 'ui-monospace,monospace' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} width={30} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 80]} tick={{ fontSize: 10, fill: YAMAHA }} axisLine={false} tickLine={false} width={30} unit="%" />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />
        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} formatter={(v) => v === 'yamaha' ? 'Yamaha' : v === 'honda' ? 'Honda' : v === 'outros' ? 'Outros' : 'Share Yamaha %'} />
        <Area yAxisId="left" type="monotone" dataKey="yamaha" name="yamaha" stroke={YAMAHA} strokeWidth={2.5} fill="url(#grad-yam)" dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="honda" name="honda" stroke={HONDA} strokeWidth={2} dot={false} />
        <Line yAxisId="left" type="monotone" dataKey="outros" name="outros" stroke={OUTROS} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="shareYamaha" name="shareYamaha" stroke={YAMAHA} strokeWidth={2.5} strokeDasharray="2 2" dot={{ r: 3, fill: YAMAHA }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
