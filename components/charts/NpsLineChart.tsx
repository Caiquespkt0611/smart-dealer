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
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--chart-axis)' }}>{label}</p>
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
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-track)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--chart-axis)', fontFamily: 'ui-monospace,monospace' }} axisLine={false} tickLine={false} />
        <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
        <Legend wrapperStyle={{ fontSize: 10, color: 'var(--chart-axis)', paddingTop: 8 }} formatter={(v) => v === 'vendas' ? 'NPS Vendas' : 'NPS Pós-Vendas'} />
        <ReferenceLine y={93} stroke="var(--accent)" strokeDasharray="4 3" strokeWidth={1} label={{ value: 'Meta V 93', fill: 'var(--accent)', fontSize: 9, position: 'insideTopRight' }} />
        <ReferenceLine y={87} stroke="var(--ok)" strokeDasharray="4 3" strokeWidth={1} label={{ value: 'Meta P 87', fill: 'var(--ok)', fontSize: 9, position: 'insideTopRight' }} />
        <Line type="monotone" dataKey="vendas" name="vendas" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--bg-main)', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="posVendas" name="posVendas" stroke="var(--ok)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--ok)', stroke: 'var(--bg-main)', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
