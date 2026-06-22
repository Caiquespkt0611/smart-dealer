'use client'

interface MetaRingProps {
  pct: number
  projecao: number
  meta: number
  junhoEmDobro: boolean
  premioPotencial: number
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export function MetaRing({ pct, projecao, meta, junhoEmDobro, premioPotencial }: MetaRingProps) {
  const r = 70, cx = 90, cy = 90
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  const color = pct >= 80 ? '#2DD4A7' : pct >= 60 ? '#FBBF24' : '#FB6B7E'
  const faltam = Math.max(0, meta - projecao)
  const junhoMeta = Math.ceil(meta * 1.1)

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="relative">
        <svg viewBox="0 0 180 180" className="w-40 h-40">
          {/* Trilha */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--chart-track)" strokeWidth={14} />
          {/* Progresso */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 8px ${color}55)`, transition: 'stroke-dasharray .6s ease' }}
          />
          <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-primary)" fontSize={32} fontWeight="800" fontFamily="ui-monospace,monospace">
            {pct}%
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" fill="var(--chart-axis)" fontSize={11}>da meta</text>
          <text x={cx} y={cy + 30} textAnchor="middle" fill={color} fontSize={10} fontWeight="700">
            {pct >= 80 ? 'NO RITMO' : pct >= 60 ? 'ATENÇÃO' : 'CRÍTICO'}
          </text>
        </svg>
      </div>

      <div className="w-full space-y-1">
        <Row label="Projeção" value={`${projecao} motos`} strong />
        <Row label="Meta" value={`${meta} motos`} />
        {faltam > 0 && <Row label="Faltam" value={`${faltam} motos`} color="#FB6B7E" />}
        <Row label="Prêmio" value={fmtBRL(premioPotencial)} color="#FBBF24" />
        {junhoEmDobro ? (
          <div className="mt-2 rounded-lg px-3 py-1.5 text-xs text-center font-semibold"
            style={{ backgroundColor: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid var(--ok-border)' }}>
            ✓ Junho em Dobro ativado!
          </div>
        ) : (
          <p className="text-[10px] text-right pt-1" style={{ color: 'var(--text-tertiary)' }}>
            Junho em Dobro: {junhoMeta} motos
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, strong, color }: { label: string; value: string; strong?: boolean; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
      <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="text-sm tabular-nums" style={{ color: color ?? (strong ? '#FFFFFF' : 'var(--text-secondary)'), fontWeight: strong || color ? 700 : 500 }}>
        {value}
      </span>
    </div>
  )
}
