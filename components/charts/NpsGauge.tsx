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
  const isOk = score >= meta
  const accent = isOk ? '#2DD4A7' : score >= meta - 3 ? '#FBBF24' : '#FB6B7E'

  // Geometria do arco (semicírculo 180°→0°)
  const cx = 100, cy = 100, r = 80
  const scoreAngle = (1 - score / 100) * 180
  const metaAngle = (1 - meta / 100) * 180
  const nacAngle = (1 - nacional / 100) * 180

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
  const totalLen = 1000
  const fillLen = (score / 100) * totalLen

  const metaOut = ptOnArc(metaAngle, cx, cy, r + 7)
  const metaIn = ptOnArc(metaAngle, cx, cy, r - 13)
  const nacPt = ptOnArc(nacAngle, cx, cy, r)

  return (
    <div className="card card-pad flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="section-label">{label}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Nacional {nacional} · Meta {meta}
          </p>
        </div>
        <div
          className="flex flex-col items-center px-3 py-1.5 rounded-xl"
          style={{
            backgroundColor: isOk ? 'var(--ok-bg)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isOk ? 'var(--ok-border)' : 'var(--border)'}`,
          }}
        >
          <span className="text-xl font-bold tabular-nums" style={{ color: isOk ? 'var(--ok)' : 'var(--text-tertiary)' }}>
            {isOk ? `+${kaizenPts}` : '0'}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isOk ? 'var(--ok)' : 'var(--text-tertiary)' }}>
            Kaizen
          </span>
        </div>
      </div>

      {/* Gauge — largura controlada e centralizado */}
      <div className="flex justify-center">
        <svg viewBox="0 0 200 118" className="w-full" style={{ maxWidth: 240 }}>
          {/* Trilha */}
          <path d={arcPath} fill="none" stroke="#1C2433" strokeWidth={14} strokeLinecap="round" />
          {/* Preenchimento */}
          <path
            d={arcPath}
            fill="none"
            stroke={accent}
            strokeWidth={14}
            strokeLinecap="round"
            pathLength={totalLen}
            strokeDasharray={`${fillLen} ${totalLen}`}
            style={{ filter: `drop-shadow(0 0 5px ${accent}55)` }}
          />
          {/* Marcador da meta */}
          <line x1={metaOut.x} y1={metaOut.y} x2={metaIn.x} y2={metaIn.y} stroke="#FBBF24" strokeWidth={2.5} strokeLinecap="round" />
          {/* Marcador nacional */}
          <circle cx={nacPt.x} cy={nacPt.y} r={3} fill="#94A0B8" stroke="#080B12" strokeWidth={1.5} />

          {/* Score central */}
          <text x={cx} y={cy - 8} textAnchor="middle" fill="#FFFFFF" fontSize={34} fontWeight="800" fontFamily="ui-monospace,monospace">
            {score}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill={accent} fontSize={10} fontWeight="700" letterSpacing="0.05em">
            {isOk ? 'ACIMA DA META' : 'ABAIXO'}
          </text>

          {/* Extremos */}
          <text x={cx - r} y={cy + 18} textAnchor="middle" fill="#5B677E" fontSize={9}>0</text>
          <text x={cx + r} y={cy + 18} textAnchor="middle" fill="#5B677E" fontSize={9}>100</text>
        </svg>
      </div>

      {/* Legenda compacta */}
      <div className="flex items-center justify-center gap-4 mt-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-0.5 rounded-full" style={{ backgroundColor: '#FBBF24' }} /> Meta {meta}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#94A0B8' }} /> Nacional {nacional}
        </span>
      </div>
    </div>
  )
}
