'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'

interface DataPoint {
  label: string
  total: number
  mes: number
  ano: number
}

interface VendasHistChartProps {
  data: DataPoint[]
  meta: number
  projecao: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const isCurrent = label === payload[0]?.payload?.label && payload[0]?.payload?.mes === 6 && payload[0]?.payload?.ano === 2026
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-white tabular-nums">{val} <span className="text-sm font-normal text-[#6B7280]">motos</span></p>
      {isCurrent && <p className="text-[10px] text-[#F59E0B] mt-1">* parcial até dia 14</p>}
    </div>
  )
}

export function VendasHistChart({ data, meta, projecao }: VendasHistChartProps) {
  // Mescla o ponto atual com projeção para mostrar a linha pontilhada
  const chartData = data.map((d, i) => ({
    ...d,
    projecao: i === data.length - 1 ? projecao : undefined,
  }))

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-vendas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#003087" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#003087" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="grad-proj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#4B5563', fontFamily: 'ui-monospace, monospace' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#4B5563' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1F2937', strokeWidth: 1 }} />

          {/* Linha da meta */}
          <ReferenceLine
            y={meta}
            stroke="#F59E0B"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{ value: `Meta ${meta}`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }}
          />

          {/* Área de vendas reais */}
          <Area
            type="monotone"
            dataKey="total"
            stroke="#003087"
            strokeWidth={2.5}
            fill="url(#grad-vendas)"
            dot={false}
            activeDot={{ r: 5, fill: '#60A5FA', stroke: '#111827', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-[#4B5563] text-right mt-1 pr-1">
        * Jun/26 parcial até dia 14
      </p>
    </div>
  )
}
