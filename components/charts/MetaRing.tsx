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
  const clampedPct = Math.min(pct, 100)
  const dash = (clampedPct / 100) * circ
  const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444'
  const faltam = Math.max(0, meta - projecao)
  const junhoMeta = Math.ceil(meta * 1.1)

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Ring */}
      <div className="relative">
        <svg viewBox="0 0 176 176" className="w-44 h-44">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1F2937" strokeWidth={15} />
          {/* Junho em Dobro track (110% target) */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#F59E0B18"
            strokeWidth={15}
            strokeDasharray={`${(1) * circ} ${circ}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={15}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 10px ${color}50)`, transition: 'stroke-dasharray 0.6s ease' }}
          />
          {/* Center */}
          <text x={cx} y={cy - 12} textAnchor="middle" fill="white" fontSize={28} fontWeight="bold" fontFamily="ui-monospace,monospace">
            {pct}%
          </text>
          <text x={cx} y={cx + 8} textAnchor="middle" fill="#6B7280" fontSize={11} fontFamily="sans-serif">
            da meta
          </text>
          <text x={cx} y={cx + 24} textAnchor="middle" fill={color} fontSize={10} fontWeight="600" fontFamily="sans-serif">
            {pct >= 80 ? '✓ No ritmo' : pct >= 60 ? '⚠ Atenção' : '✕ Crítico'}
          </text>
        </svg>
      </div>

      {/* Stats */}
      <div className="w-full space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#6B7280] uppercase tracking-wide">Projeção</span>
          <span className="text-sm font-bold text-white tabular-nums">{projecao} motos</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#6B7280] uppercase tracking-wide">Meta</span>
          <span className="text-sm text-[#9CA3AF] tabular-nums">{meta} motos</span>
        </div>
        {faltam > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6B7280] uppercase tracking-wide">Faltam</span>
            <span className="text-sm font-bold text-[#EF4444] tabular-nums">{faltam} motos</span>
          </div>
        )}

        <div className="border-t border-[#1F2937] pt-2.5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#6B7280] uppercase tracking-wide">Prêmio</span>
            <span className="text-sm font-bold text-[#F59E0B] tabular-nums">{fmtBRL(premioPotencial)}</span>
          </div>
          {!junhoEmDobro && (
            <div className="text-[10px] text-[#4B5563] text-right">
              Junho em Dobro: {junhoMeta} motos
            </div>
          )}
          {junhoEmDobro && (
            <div className="bg-[#10B98112] border border-[#10B98130] rounded-lg px-3 py-1.5 text-xs text-[#10B981] text-center font-semibold">
              ✓ Junho em Dobro ativado!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
