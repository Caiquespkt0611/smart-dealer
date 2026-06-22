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
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#1A2233', border: '1px solid #38435C', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: '#94A0B8' }}>{label}</p>
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
        <CartesianGrid strokeDasharray="3 3" stroke="#1C2433" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94A0B8', fontFamily: 'ui-monospace,monospace' }} axisLine={false} tickLine={false} />
        <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#94A0B8' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#283145', strokeWidth: 1 }} />
        <Legend wrapperStyle={{ fontSize: 10, color: '#94A0B8', paddingTop: 8 }} formatter={(v) => v === 'vendas' ? 'NPS Vendas' : 'NPS Pós-Vendas'} />
        <ReferenceLine y={93} stroke="#5B9DFF" strokeDasharray="4 3" strokeWidth={1} label={{ value: 'Meta V 93', fill: '#5B9DFF', fontSize: 9, position: 'insideTopRight' }} />
        <ReferenceLine y={87} stroke="#2DD4A7" strokeDasharray="4 3" strokeWidth={1} label={{ value: 'Meta P 87', fill: '#2DD4A7', fontSize: 9, position: 'insideTopRight' }} />
        <Line type="monotone" dataKey="vendas" name="vendas" stroke="#5B9DFF" strokeWidth={2.5} dot={{ r: 3, fill: '#5B9DFF', stroke: '#080B12', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="posVendas" name="posVendas" stroke="#2DD4A7" strokeWidth={2.5} dot={{ r: 3, fill: '#2DD4A7', stroke: '#080B12', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
