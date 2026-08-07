'use client'

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from 'recharts'

interface Ponto {
  criterio: string
  grupo6: number
  media: number
  top3: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload as Ponto
  return (
    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated-2)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--chart-axis)' }}>{p.criterio}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--accent)' }}>Grupo 6: {String(p.grupo6).replace('.', ',')}</p>
      <p className="text-xs tabular-nums" style={{ color: '#2DD4A7' }}>Top 3: {String(p.top3).replace('.', ',')}</p>
      <p className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>Média geral: {String(p.media).replace('.', ',')}</p>
    </div>
  )
}

export function RadarBanca({ data }: { data: Ponto[] }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--chart-track)" />
          <PolarAngleAxis dataKey="criterio" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Tooltip content={<RadarTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10, color: 'var(--chart-axis)' }}
            formatter={v => v === 'grupo6' ? 'Grupo 6 — Smart Dealer' : v === 'top3' ? 'Média Top 3' : 'Média dos grupos'} />
          <Radar name="media" dataKey="media" stroke="var(--text-tertiary)" fill="var(--text-tertiary)" fillOpacity={0.08} strokeWidth={1.5} />
          <Radar name="top3" dataKey="top3" stroke="#2DD4A7" fill="#2DD4A7" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="5 3" />
          <Radar name="grupo6" dataKey="grupo6" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.22} strokeWidth={2.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
