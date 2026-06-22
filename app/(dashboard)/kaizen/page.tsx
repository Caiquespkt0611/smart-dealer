import { kaizenData } from '@/lib/kaizen-data'
import { kaizenAcao } from '@/lib/kaizen-actions'
import { Award, CheckCircle2, AlertTriangle, MinusCircle, Target, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Kaizen · Smart Dealer' }

type St = 'OK' | 'Parcial' | 'Atenção'

const AREAS_ORDER = ['Vendas', 'Universidade Yamaha', 'Pós-vendas', 'Serviços Financeiros']

export default function KaizenPage() {
  const d = kaizenData
  const maxTeorico = d.totalPossivel + d.totalExtra
  const pctBase = Math.round((d.totalObtido / d.totalPossivel) * 100)
  const pontosNaMesa = d.items.reduce((s, i) => s + Math.max(0, i.pontosPossiveis - i.pontosObtidos), 0)

  // agrupar por área
  const porArea = AREAS_ORDER.map(area => {
    const items = d.items.filter(i => i.area === area)
    const obt = items.reduce((s, i) => s + i.pontosObtidos, 0)
    const poss = items.reduce((s, i) => s + i.pontosPossiveis, 0)
    return { area, items, obt, poss, pct: poss ? Math.round((obt / poss) * 100) : 0 }
  }).filter(a => a.items.length)

  const oportunidades = [...d.items]
    .filter(i => i.status !== 'OK')
    .map(i => ({ ...i, perdidos: Math.max(0, i.pontosPossiveis - i.pontosObtidos) }))
    .sort((a, b) => b.perdidos - a.perdidos)

  // gauge geometry (semicircle)
  const pctMax = Math.round((d.totalObtido / maxTeorico) * 100)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Kaizen</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Programa de excelência Yamaha · {d.competencia}
        </p>
      </div>

      {/* ── HERO: score + resumo ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauge */}
        <div className="card card-pad flex flex-col items-center justify-center">
          <ScoreGauge obtido={d.totalObtido} max={maxTeorico} base={d.totalPossivel} pct={pctMax} />
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard icon={Target} accent="var(--accent)" label="Pontuação atual" value={`${d.totalObtido}`} sub={`de ${d.totalPossivel} base · ${pctBase}%`} />
          <StatCard icon={TrendingUp} accent="var(--ok)" label="Máximo possível" value={`${maxTeorico}`} sub={`${d.totalPossivel} base + ${d.totalExtra} extra`} />
          <StatCard icon={AlertTriangle} accent="var(--warn)" label="Pontos na mesa" value={`+${pontosNaMesa}`} sub="recuperáveis neste ciclo" />
          <StatCard icon={Award} accent="var(--danger)" label="Indicadores a recuperar" value={`${oportunidades.length}`} sub={`${d.items.filter(i => i.status === 'OK').length} já OK de ${d.items.length}`} />
        </div>
      </div>

      {/* ── BREAKDOWN POR ÁREA ── */}
      <section>
        <h2 className="section-label mb-3">Desempenho por área</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {porArea.map(a => (
            <div key={a.area} className="card card-pad">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{a.area}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold tabular-nums" style={{ color: a.pct >= 70 ? 'var(--ok)' : a.pct >= 50 ? 'var(--warn)' : 'var(--danger)' }}>{a.obt}</span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/ {a.poss} pts</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                <div className="h-full rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.pct >= 70 ? 'var(--ok)' : a.pct >= 50 ? 'var(--warn)' : 'var(--danger)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIORIDADES — o que fazer ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} style={{ color: 'var(--warn)' }} />
          <h2 className="section-label">Prioridades — como chegar à nota máxima</h2>
          <span className="ml-auto text-[10px]" style={{ color: 'var(--text-tertiary)' }}>+{pontosNaMesa} pts em jogo</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {oportunidades.map(i => (
            <div key={i.indicador + i.area} className="card card-pad flex gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 self-start" style={{ backgroundColor: i.status === 'Atenção' ? 'var(--danger-bg)' : 'var(--warn-bg)' }}>
                <span className="text-sm font-bold tabular-nums" style={{ color: i.status === 'Atenção' ? 'var(--danger)' : 'var(--warn)' }}>+{i.perdidos}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{i.indicador}</p>
                  <StatusChip status={i.status as St} />
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{i.area}</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{kaizenAcao(i.indicador, i.descricao)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TABELA COMPLETA ── */}
      <section>
        <h2 className="section-label mb-3">Todos os indicadores</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Área</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Indicador</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Atingimento</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Pontos</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {AREAS_ORDER.flatMap(area => d.items.filter(i => i.area === area)).map((i, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{i.area}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{i.indicador}</td>
                  <td className="px-4 py-3 text-center text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmtAting(i.atingimento)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: i.pontosObtidos >= i.pontosPossiveis ? 'var(--ok)' : i.pontosObtidos > 0 ? 'var(--warn)' : 'var(--danger)' }}>
                    {i.pontosObtidos}<span className="text-[10px] font-normal" style={{ color: 'var(--text-tertiary)' }}>/{i.pontosPossiveis}{i.pontosExtra > 0 ? `+${i.pontosExtra}` : ''}</span>
                  </td>
                  <td className="px-4 py-3 text-center"><StatusChip status={i.status as St} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function fmtAting(a: string) {
  if (!a || a === 'None' || a === '-') return '—'
  const n = parseFloat(a)
  if (!isNaN(n) && a.match(/^0?\.\d+$/)) return `${Math.round(n * 100)}%`
  return a
}

function StatusChip({ status }: { status: St }) {
  const map = {
    'OK': { c: 'var(--ok)', bg: 'var(--ok-bg)', Icon: CheckCircle2, label: 'OK' },
    'Parcial': { c: 'var(--warn)', bg: 'var(--warn-bg)', Icon: MinusCircle, label: 'Parcial' },
    'Atenção': { c: 'var(--danger)', bg: 'var(--danger-bg)', Icon: AlertTriangle, label: 'Atenção' },
  }[status]
  const Icon = map.Icon
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: map.bg, color: map.c }}>
      <Icon size={11} /> {map.label}
    </span>
  )
}

function StatCard({ icon: Icon, accent, label, value, sub }: {
  icon: React.ElementType; accent: string; label: string; value: string; sub: string
}) {
  return (
    <div className="card card-pad flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <span className="text-2xl font-bold tabular-nums" style={{ color: accent }}>{value}</span>
      <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
}

function ScoreGauge({ obtido, max, base, pct }: { obtido: number; max: number; base: number; pct: number }) {
  const r = 80, cx = 100, cy = 100
  const circ = Math.PI * r // semicircle length
  const fracBase = Math.min(base / max, 1)
  const fracObt = Math.min(obtido / max, 1)
  const color = pct >= 70 ? 'var(--ok)' : pct >= 50 ? 'var(--warn)' : 'var(--danger)'
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-56">
        {/* track */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--chart-track)" strokeWidth={16} strokeLinecap="round" />
        {/* base marker arc (até pontuação base) */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border-strong)" strokeWidth={16} strokeLinecap="round"
          strokeDasharray={`${fracBase * circ} ${circ}`} opacity={0.4} />
        {/* obtido */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round"
          strokeDasharray={`${fracObt * circ} ${circ}`} style={{ filter: `drop-shadow(0 0 6px ${color}66)` }} />
        <text x={cx} y={cy - 18} textAnchor="middle" fill="var(--text-primary)" fontSize={34} fontWeight="800" fontFamily="ui-monospace,monospace">{obtido}</text>
        <text x={cx} y={cy + 2} textAnchor="middle" fill="var(--chart-axis)" fontSize={11}>de {max} pts possíveis</text>
      </svg>
      <p className="text-xs font-semibold -mt-2" style={{ color }}>
        {pct}% do máximo · meta {'>'}100 pts
      </p>
    </div>
  )
}
