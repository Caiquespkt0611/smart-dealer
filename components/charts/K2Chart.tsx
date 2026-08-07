'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, ReferenceLine,
} from 'recharts'

interface Ponto {
  label: string
  mcPosVendas: number
  despOperacionais: number
  taxaAbsorcao: number
}

const fmtMil = (v: number) => `${Math.round(v / 1000)}k`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function K2Tooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload as Ponto
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: 'var(--chart-axis)' }}>{label}</p>
      <p className="text-base font-bold tabular-nums" style={{ color: p.taxaAbsorcao >= 65 ? '#2DD4A7' : '#FBBF24' }}>
        Absorção {String(p.taxaAbsorcao).replace('.', ',')}%
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
        MC pós-vendas: R$ {p.mcPosVendas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        Despesas operacionais: R$ {p.despOperacionais.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
      </p>
    </div>
  )
}

export function K2Chart({ data }: { data: Ponto[] }) {
  return (
    <div className="w-full h-full min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-track)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--chart-axis)', fontFamily: 'ui-monospace,monospace' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="rs" tickFormatter={fmtMil} tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} width={42} />
          <YAxis yAxisId="pct" orientation="right" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} axisLine={false} tickLine={false} width={38} />
          <Tooltip content={<K2Tooltip />} cursor={{ fill: 'var(--bg-inset)' }} />
          <Legend wrapperStyle={{ fontSize: 10, color: 'var(--chart-axis)', paddingTop: 8 }}
            formatter={v => v === 'mcPosVendas' ? 'MC Pós-Vendas (R$)' : v === 'despOperacionais' ? 'Despesas Operacionais (R$)' : 'Taxa de Absorção (%)'} />
          <Bar yAxisId="rs" dataKey="despOperacionais" name="despOperacionais" fill="var(--chart-track)" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="rs" dataKey="mcPosVendas" name="mcPosVendas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          <ReferenceLine yAxisId="pct" y={65} stroke="#2DD4A7" strokeDasharray="6 3" label={{ value: 'meta 65%', position: 'insideTopRight', fontSize: 10, fill: '#2DD4A7' }} />
          <Line yAxisId="pct" type="monotone" dataKey="taxaAbsorcao" name="taxaAbsorcao" stroke="#FBBF24" strokeWidth={2.5} dot={{ r: 3, fill: '#FBBF24' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
