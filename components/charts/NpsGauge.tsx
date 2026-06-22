'use client'

interface NpsGaugeProps {
  score: number
  meta: number
  nacional: number
  label: string
  kaizenPts: number
  tipo: 'vendas' | 'pos-vendas'
}

function angleToPoint(angleDeg: number, cx: number, cy: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

export function NpsGauge({ score, meta, nacional, label, kaizenPts }: NpsGaugeProps) {
  const cx = 110, cy = 108, r = 88, rInner = 68
  const isOk = score >= meta
  const color = isOk ? '#10B981' : score >= meta - 3 ? '#F59E0B' : '#EF4444'

  // angles: 180° = esquerda (score 0), 0° = direita (score 100)
  const scoreAngle = (1 - score / 100) * 180
  const metaAngle = (1 - meta / 100) * 180
  const nacionalAngle = (1 - nacional / 100) * 180

  const metaPtOuter = angleToPoint(metaAngle, cx, cy, r + 4)
  const metaPtInner = angleToPoint(metaAngle, cx, cy, rInner)
  const nacPt = angleToPoint(nacionalAngle, cx, cy, r + 8)

  // Para a barra de progresso: pathLength normalizado
  const totalPathLen = 1000
  const fillLen = (score / 100) * totalPathLen
  const metaFillLen = (meta / 100) * totalPathLen

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`

  // Zonas de cor no fundo
  const dangerEnd = metaAngle
  const safeStart = dangerEnd
  const scorePoint = angleToPoint(scoreAngle, cx, cy, r)
  const largeArcScore = (score / 100) > 0.5 ? 1 : 0
  const largeArcMeta = (meta / 100) > 0.5 ? 1 : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold tabular-nums" style={{ color }}>{score}</span>
            <span className="text-sm text-[#6B7280]">/ meta {meta}</span>
          </div>
        </div>
        <div className={`flex flex-col items-center px-3 py-2 rounded-xl ${isOk ? 'bg-[#10B98115] border border-[#10B98130]' : 'bg-[#1F293780] border border-[#374151]'}`}>
          <span className={`text-2xl font-bold tabular-nums ${isOk ? 'text-[#10B981]' : 'text-[#4B5563]'}`}>
            {isOk ? `+${kaizenPts}` : '0'}
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wider ${isOk ? 'text-[#10B98180]' : 'text-[#4B5563]'}`}>
            pts Kaizen
          </span>
        </div>
      </div>

      <svg viewBox="0 0 220 125" className="w-full">
        {/* Fundo zona perigo */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArcMeta} 1 ${angleToPoint(dangerEnd, cx, cy, r).x} ${angleToPoint(dangerEnd, cx, cy, r).y}`}
          fill="none" stroke="#EF444418" strokeWidth={18}
        />
        {/* Fundo zona segura */}
        <path
          d={`M ${angleToPoint(safeStart, cx, cy, r).x} ${angleToPoint(safeStart, cx, cy, r).y} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#10B98118" strokeWidth={18}
        />
        {/* Background arc (contorno) */}
        <path d={arcPath} fill="none" stroke="#1F2937" strokeWidth={20} strokeLinecap="butt" />

        {/* Score arc fill */}
        <path
          d={arcPath}
          fill="none"
          stroke={color}
          strokeWidth={20}
          strokeLinecap="butt"
          pathLength={totalPathLen}
          strokeDasharray={`${fillLen} ${totalPathLen}`}
          style={{ filter: isOk ? `drop-shadow(0 0 6px ${color}60)` : undefined }}
        />

        {/* Marcador Nacional */}
        <circle
          cx={angleToPoint(nacionalAngle, cx, cy, r).x}
          cy={angleToPoint(nacionalAngle, cx, cy, r).y}
          r={3}
          fill="#6B7280"
        />
        <text
          x={nacPt.x}
          y={nacPt.y - 6}
          textAnchor="middle"
          fill="#6B7280"
          fontSize={9}
          fontFamily="monospace"
        >
          {nacional}
        </text>

        {/* Marcador Meta */}
        <line
          x1={metaPtOuter.x} y1={metaPtOuter.y}
          x2={metaPtInner.x} y2={metaPtInner.y}
          stroke="#F59E0B" strokeWidth={2.5}
        />
        <circle
          cx={angleToPoint(metaAngle, cx, cy, r).x}
          cy={angleToPoint(metaAngle, cx, cy, r).y}
          r={3}
          fill="#F59E0B"
        />

        {/* Texto central */}
        <text x={cx} y={cy - 18} textAnchor="middle" fill="white" fontSize={38} fontWeight="bold" fontFamily="ui-monospace, monospace">
          {score}
        </text>
        <text x={cx} y={cy + 2} textAnchor="middle" fill="#4B5563" fontSize={11} fontFamily="sans-serif">
          Nacional: {nacional}
        </text>

        {/* Labels dos extremos */}
        <text x={cx - r - 2} y={cy + 16} textAnchor="end" fill="#374151" fontSize={9}>0</text>
        <text x={cx + r + 2} y={cy + 16} textAnchor="start" fill="#374151" fontSize={9}>100</text>

        {/* Label meta no arco */}
        <text
          x={angleToPoint(metaAngle, cx, cy, r - 32).x}
          y={angleToPoint(metaAngle, cx, cy, r - 32).y + 4}
          textAnchor="middle"
          fill="#F59E0B"
          fontSize={9}
          fontWeight="bold"
        >
          {meta}
        </text>
      </svg>

      <div className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold ${
        isOk
          ? 'bg-[#10B98115] text-[#10B981] border border-[#10B98130]'
          : 'bg-[#EF444415] text-[#EF4444] border border-[#EF444430]'
      }`}>
        {isOk ? '✓ Acima da meta — Kaizen garantido' : '✕ Abaixo da meta'}
      </div>
    </div>
  )
}
