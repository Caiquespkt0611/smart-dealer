'use client'

import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'

interface DataPoint {
  label: string
  total: number
  mes: number
  ano: number
}

interface VendasHistChartProps {
  data: DataPoint[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const vendas = payload.find((p: any) => p.dataKey === 'total')
  const media = payload.find((p: any) => p.dataKey === 'media3m')
  const isCurrent = payload[0]?.payload?.mes === 6 && payload[0]?.payload?.ano === 2026
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#1A2233', border: '1px solid #38435C', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#94A0B8' }}>{label}</p>
      {vendas && <p className="text-base font-bold tabular-nums text-white">{vendas.value} <span className="text-sm font-normal" style={{ color: '#94A0B8' }}>motos</span></p>}
      {media && <p className="text-xs mt-0.5" style={{ color: '#FBBF24' }}>Média 3M: <span className="font-semibold">{media.value}</span></p>}
      {isCurrent && <p className="text-[10px] mt-1 pt-1" style={{ color: '#FBBF24', borderTop: '1px solid #283145' }}>* parcial até dia 14</p>}
    </div>
  )
}

export function VendasHistChart({ data }: VendasHistChartProps) {
  const chartData = data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 2), i + 1)
    const media3m = Math.round(window.reduce((s, p) => s + p.total, 0) / window.length)
    return { ...d, media3m }
  })

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-vendas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B9DFF" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5B9DFF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1C2433" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A0B8', fontFamily: 'ui-monospace,monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#94A0B8' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#38435C', strokeWidth: 1 }} />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94A0B8', paddingTop: 8 }} formatter={(v) => v === 'total' ? 'Vendas' : 'Média 3 meses'} />
          <Area type="monotone" dataKey="total" name="total" stroke="#5B9DFF" strokeWidth={2.5} fill="url(#grad-vendas)" dot={false} activeDot={{ r: 5, fill: '#5B9DFF', stroke: '#080B12', strokeWidth: 2 }} />
          <Line type="monotone" dataKey="media3m" name="media3m" stroke="#FBBF24" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4, fill: '#FBBF24', stroke: '#080B12', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
