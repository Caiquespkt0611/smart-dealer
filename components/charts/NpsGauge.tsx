'use client'

interface NpsGaugeProps {
  score: number
  meta: number
  nacional: number
  label: string
  kaizenPts: number
}

function ptOnArc(angleDeg: number, cx: number, cy: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

export function NpsGauge({ score, meta, nacional, label, kaizenPts }: NpsGaugeProps) {
  const cx = 110, cy = 108, r = 86
  const isOk = score >= meta
  const color     = isOk ? '#059669' : score >= meta - 3 ? '#D97706' : '#DC2626'
  const trackOk   = isOk ? '#D1FAE5' : '#FEF3C7'
  const trackFail = isOk ? '#FEF3C7' : '#FEE2E2'

  const scoreAngle   = (1 - score   / 100) * 180
  const metaAngle    = (1 - meta    / 100) * 180
  const nacionalAngle = (1 - nacional / 100) * 180

  const metaPtOuter  = ptOnArc(metaAngle, cx, cy, r + 4)
  const metaPtInner  = ptOnArc(metaAngle, cx, cy, r - 16)
  const metaPtLabel  = ptOnArc(metaAngle, cx, cy, r - 32)
  const nacPt        = ptOnArc(nacionalAngle, cx, cy, r + 14)

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  const totalLen = 1000
  const fillLen  = (score / 100) * totalLen
  const metaFillLen = (meta / 100) * totalLen

  const metaPt = ptOnArc(metaAngle, cx, cy, r)

  // zona abaixo da meta (vermelho/amarelo claro)
  const metaX = metaPt.x, metaY = metaPt.y
  const largeArcMeta = meta > 50 ? 1 : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold tabular-nums" style={{ color }}>{score}</span>
            <span className="text-sm text-slate-400">/ meta {meta}</span>
          </div>
        </div>
        <div className={`flex flex-col items-center px-3 py-2 rounded-xl border ${
          isOk ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'
        }`}>
          <span className={`text-2xl font-bold tabular-nums ${isOk ? 'text-emerald-600' : 'text-slate-400'}`}>
            {isOk ? `+${kaizenPts}` : '0'}
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${isOk ? 'text-emerald-500' : 'text-slate-400'}`}>
            pts Kaizen
          </span>
        </div>
      </div>

      {/* Gauge SVG */}
      <svg viewBox="0 0 220 128" className="w-full">
        {/* Zona de perigo (abaixo da meta) */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArcMeta} 1 ${metaX} ${metaY}`}
          fill="none" stroke={trackFail} strokeWidth={20}
        />
        {/* Zona segura (acima da meta) */}
        <path
          d={`M ${metaX} ${metaY} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={trackOk} strokeWidth={20}
        />
        {/* Background neutro */}
        <path d={arcPath} fill="none" stroke="#F1F5F9" strokeWidth={20} strokeLinecap="butt" />

        {/* Fill do score */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={20}
          strokeLinecap="butt"
          pathLength={totalLen}
          strokeDasharray={`${fillLen} ${totalLen}`}
          style={{ filter: isOk ? `drop-shadow(0 0 4px ${color}40)` : undefined }}
        />

        {/* Marcador Nacional */}
        <circle cx={ptOnArc(nacionalAngle, cx, cy, r).x} cy={ptOnArc(nacionalAngle, cx, cy, r).y} r={3.5} fill="#94A3B8" />
        <text x={nacPt.x} y={nacPt.y - 4} textAnchor="middle" fill="#94A3B8" fontSize={8.5} fontFamily="monospace">
          {nacional}
        </text>

        {/* Marcador Meta */}
        <line x1={metaPtOuter.x} y1={metaPtOuter.y} x2={metaPtInner.x} y2={metaPtInner.y} stroke="#D97706" strokeWidth={2.5} />
        <circle cx={metaPt.x} cy={metaPt.y} r={3} fill="#D97706" />
        <text x={metaPtLabel.x} y={metaPtLabel.y + 4} textAnchor="middle" fill="#D97706" fontSize={9} fontWeight="bold">
          {meta}
        </text>

        {/* Score central */}
        <text x={cx} y={cy - 16} textAnchor="middle" fill="#0F172A" fontSize={36} fontWeight="bold" fontFamily="ui-monospace,monospace">
          {score}
        </text>
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#94A3B8" fontSize={11}>
          Nacional: {nacional}
        </text>

        {/* Extremos */}
        <text x={cx - r - 4} y={cy + 16} textAnchor="end"   fill="#CBD5E1" fontSize={9}>0</text>
        <text x={cx + r + 4} y={cy + 16} textAnchor="start" fill="#CBD5E1" fontSize={9}>100</text>
      </svg>

      {/* Status badge */}
      <div className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold ${
        isOk
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        {isOk
          ? `✓ Acima da meta — +${kaizenPts} pts Kaizen garantidos`
          : `⚠ Abaixo da meta — ${kaizenPts} pts Kaizen em risco`}
      </div>
    </div>
  )
}
