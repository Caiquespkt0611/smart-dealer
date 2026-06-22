'use client'

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
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
  const media  = payload.find((p: any) => p.dataKey === 'media3m')
  const isCurrent = payload[0]?.payload?.mes === 6 && payload[0]?.payload?.ano === 2026
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      {vendas && (
        <p className="text-base font-bold text-slate-900 tabular-nums">
          {vendas.value} <span className="text-sm font-normal text-slate-400">motos</span>
        </p>
      )}
      {media && (
        <p className="text-xs text-amber-600 mt-0.5">
          Média 3M: <span className="font-semibold">{media.value}</span>
        </p>
      )}
      {isCurrent && (
        <p className="text-[10px] text-amber-500 mt-1 border-t border-slate-100 pt-1">
          * parcial até dia 14
        </p>
      )}
    </div>
  )
}

export function VendasHistChart({ data }: VendasHistChartProps) {
  // Calcula média móvel de 3 meses (trailing)
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
            <linearGradient id="grad-vendas-light" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003087" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#003087" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'ui-monospace, monospace' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />

          <Legend
            wrapperStyle={{ fontSize: 10, color: '#94A3B8', paddingTop: 8 }}
            formatter={(v) => v === 'total' ? 'Vendas' : 'Média 3 meses'}
          />

          {/* Área de vendas */}
          <Area
            type="monotone"
            dataKey="total"
            name="total"
            stroke="#003087"
            strokeWidth={2.5}
            fill="url(#grad-vendas-light)"
            dot={false}
            activeDot={{ r: 5, fill: '#003087', stroke: '#fff', strokeWidth: 2 }}
          />

          {/* Linha de média móvel 3 meses */}
          <Line
            type="monotone"
            dataKey="media3m"
            name="media3m"
            stroke="#F59E0B"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
