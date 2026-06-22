'use client'

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

const YAMAHA = '#1E5FE8'
const HONDA = '#E40521'
const SHINERAY = '#A855F7'
const MERCADO = '#64748B'

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

interface TrendPoint {
  mes: string; total: number; honda: number; yamaha: number
  shareYamaha: number; shareHonda: number; shareShineray: number
}

const VOL_LABELS: Record<string, string> = { total: 'Mercado total', honda: 'Honda', yamaha: 'Yamaha' }
const SHARE_LABELS: Record<string, string> = { shareYamaha: 'Share Yamaha', shareHonda: 'Share Honda', shareShineray: 'Share Shineray' }
const LEGEND_LABELS: Record<string, string> = { ...VOL_LABELS, ...SHARE_LABELS }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vols = payload.filter((p: any) => p.dataKey in VOL_LABELS)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shares = payload.filter((p: any) => p.dataKey in SHARE_LABELS)
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--chart-axis)' }}>{label}/26</p>
      <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--chart-axis)' }}>Volume (emplacamentos)</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {vols.map((p: any) => (
        <p key={p.dataKey} className="text-xs font-semibold" style={{ color: p.color }}>{VOL_LABELS[p.dataKey]}: {p.value}</p>
      ))}
      <p className="text-[9px] uppercase tracking-wider mt-1.5 mb-0.5 pt-1.5" style={{ color: 'var(--chart-axis)', borderTop: '1px solid var(--border)' }}>Share por montadora</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {shares.map((p: any) => (
        <p key={p.dataKey} className="text-xs font-semibold" style={{ color: p.color }}>{SHARE_LABELS[p.dataKey]}: {p.value}%</p>
      ))}
    </div>
  )
}

export function ShareTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barGap={2} barCategoryGap="22%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-track)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--chart-axis)', fontFamily: 'ui-monospace,monospace' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} width={34} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 80]} tick={{ fontSize: 10, fill: YAMAHA }} axisLine={false} tickLine={false} width={34} unit="%" />
        <Tooltip content={<TrendTooltip />} cursor={{ fill: 'var(--border-strong)', fillOpacity: 0.12 }} />
        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} formatter={(v) => LEGEND_LABELS[v] ?? v} />
        {/* Colunas = volume de emplacamentos */}
        <Bar yAxisId="left" dataKey="total" name="total" fill={MERCADO} fillOpacity={0.45} radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Bar yAxisId="left" dataKey="honda" name="honda" fill={HONDA} fillOpacity={0.7} radius={[3, 3, 0, 0]} maxBarSize={18} />
        <Bar yAxisId="left" dataKey="yamaha" name="yamaha" fill={YAMAHA} fillOpacity={0.85} radius={[3, 3, 0, 0]} maxBarSize={18} />
        {/* Linhas = share % por montadora */}
        <Line yAxisId="right" type="monotone" dataKey="shareYamaha" name="shareYamaha" stroke={YAMAHA} strokeWidth={2.5} dot={{ r: 2.5, fill: YAMAHA }} />
        <Line yAxisId="right" type="monotone" dataKey="shareHonda" name="shareHonda" stroke={HONDA} strokeWidth={2} dot={{ r: 2.5, fill: HONDA }} />
        <Line yAxisId="right" type="monotone" dataKey="shareShineray" name="shareShineray" stroke={SHINERAY} strokeWidth={2} strokeDasharray="4 3" dot={{ r: 2.5, fill: SHINERAY }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
