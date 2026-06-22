'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Legend,
} from 'recharts'

interface NpsDataPoint {
  referencia: string
  vendas?: number
  posVendas?: number
}

interface NpsLineChartProps {
  data: NpsDataPoint[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.color }}>
          {p.dataKey === 'vendas' ? 'Vendas' : 'Pós-Vendas'}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function NpsLineChart({ data }: NpsLineChartProps) {
  const shortLabel = (ref: string) => {
    const [ano, mes] = ref.split('/')
    const meses = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mes)]}/${ano.slice(2)}`
  }

  const chartData = data.map(d => ({ ...d, label: shortLabel(d.referencia) }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'ui-monospace,monospace' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          domain={[80, 100]}
          tick={{ fontSize: 10, fill: '#94A3B8' }}
          axisLine={false} tickLine={false} width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#F1F5F9', strokeWidth: 1 }} />
        <Legend
          wrapperStyle={{ fontSize: 10, color: '#94A3B8', paddingTop: 8 }}
          formatter={(v) => v === 'vendas' ? 'NPS Vendas' : 'NPS Pós-Vendas'}
        />
        {/* Metas */}
        <ReferenceLine y={93} stroke="#003087" strokeDasharray="4 3" strokeWidth={1}
          label={{ value: 'Meta V 93', fill: '#003087', fontSize: 9, position: 'insideTopRight' }} />
        <ReferenceLine y={87} stroke="#059669" strokeDasharray="4 3" strokeWidth={1}
          label={{ value: 'Meta P 87', fill: '#059669', fontSize: 9, position: 'insideTopRight' }} />

        <Line type="monotone" dataKey="vendas"    name="vendas"    stroke="#003087" strokeWidth={2.5}
          dot={{ r: 3, fill: '#003087', stroke: '#fff', strokeWidth: 1.5 }}
          activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="posVendas" name="posVendas" stroke="#059669" strokeWidth={2.5}
          dot={{ r: 3, fill: '#059669', stroke: '#fff', strokeWidth: 1.5 }}
          activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
