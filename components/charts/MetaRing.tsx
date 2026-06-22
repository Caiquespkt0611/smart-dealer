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
  const r = 68, cx = 88, cy = 88
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  const color = pct >= 80 ? '#059669' : pct >= 60 ? '#D97706' : '#DC2626'
  const trackColor = pct >= 80 ? '#D1FAE5' : pct >= 60 ? '#FEF3C7' : '#FEE2E2'
  const faltam = Math.max(0, meta - projecao)
  const junhoMeta = Math.ceil(meta * 1.1)

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Ring */}
      <svg viewBox="0 0 176 176" className="w-44 h-44">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={14} />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
        {/* Center */}
        <text x={cx} y={cy - 10} textAnchor="middle" fill="#0F172A" fontSize={28} fontWeight="bold" fontFamily="ui-monospace,monospace">
          {pct}%
        </text>
        <text x={cx} y={cx + 8} textAnchor="middle" fill="#94A3B8" fontSize={11} fontFamily="sans-serif">
          da meta
        </text>
        <text x={cx} y={cx + 24} textAnchor="middle" fill={color} fontSize={10} fontWeight="600" fontFamily="sans-serif">
          {pct >= 80 ? '✓ No ritmo' : pct >= 60 ? '⚠ Atenção' : '✕ Crítico'}
        </text>
      </svg>

      {/* Stats */}
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Projeção</span>
          <span className="text-sm font-bold text-slate-900 tabular-nums">{projecao} motos</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Meta</span>
          <span className="text-sm text-slate-500 tabular-nums">{meta} motos</span>
        </div>
        {faltam > 0 && (
          <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Faltam</span>
            <span className="text-sm font-bold text-red-600 tabular-nums">{faltam} motos</span>
          </div>
        )}
        <div className="flex justify-between items-center py-1.5">
          <span className="text-xs text-slate-400 uppercase tracking-wide">Prêmio</span>
          <span className="text-sm font-bold text-amber-600 tabular-nums">{fmtBRL(premioPotencial)}</span>
        </div>
        {!junhoEmDobro && (
          <p className="text-[10px] text-slate-400 text-right">
            Junho em Dobro: precisa {junhoMeta} motos
          </p>
        )}
        {junhoEmDobro && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-emerald-700 text-center font-semibold">
            ✓ Junho em Dobro ativado!
          </div>
        )}
      </div>
    </div>
  )
}
