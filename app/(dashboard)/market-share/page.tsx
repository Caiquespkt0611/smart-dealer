import { shareData } from '@/lib/share-data'
import { ShareDonut, ShareTrendChart } from '@/components/charts/ShareCharts'
import {
  TrendingUp, TrendingDown, Target, AlertTriangle,
  Trophy, MapPin, Building2, Lightbulb,
} from 'lucide-react'

export const metadata = { title: 'Market Share · Smart Dealer' }

const YAMAHA = '#1E5FE8'
const HONDA = '#E40521'

export default function MarketSharePage() {
  const d = shareData

  // ── Insights (server-side) ──
  const segmentsByGap = [...d.segments].filter(s => s.total >= 30).sort((a, b) => b.gap - a.gap)
  const perdendo = segmentsByGap.slice(0, 3)
  const fortes = [...d.segments].filter(s => s.total >= 20).sort((a, b) => b.shareYamaha - a.shareYamaha).slice(0, 2)
  const shareTrendDelta = d.trend[d.trend.length - 1].shareYamaha - d.trend[0].shareYamaha

  // ── Mix mensal: colunas (volume) + linhas (share por montadora) ──
  // Shineray não vem mensal (está em "outros"); alocamos o total dela
  // proporcionalmente a "outros" para estimar a linha de share mês a mês.
  const outrosQtdTotal = d.brandShare.filter(b => b.marca !== 'Yamaha' && b.marca !== 'Honda').reduce((a, b) => a + b.qtd, 0)
  const shinerayQtdTotal = d.brandShare.find(b => b.marca === 'Shineray')?.qtd ?? 0
  const kShineray = outrosQtdTotal > 0 ? shinerayQtdTotal / outrosQtdTotal : 0
  const mixData = d.trend.map(t => ({
    mes: t.mes,
    total: t.total,
    honda: t.honda,
    yamaha: t.yamaha,
    shareYamaha: t.shareYamaha,
    shareHonda: +((t.honda / t.total) * 100).toFixed(1),
    shareShineray: +(((t.outros * kShineray) / t.total) * 100).toFixed(1),
  }))

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Market Share</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Emplacamentos {d.areas.join(' + ')} · Jan–Jun 2026 · {d.totalMercado2026.toLocaleString('pt-BR')} motos no mercado
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          <Building2 size={13} /> {d.numCompetitorCnpj} concessionárias mapeadas na região
        </div>
      </div>

      {/* ── KPI HERO ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroCard
          label="Share Yamaha"
          value={`${d.yamahaShare}%`}
          sub={`${d.yamahaQtd.toLocaleString('pt-BR')} de ${d.totalMercado2026.toLocaleString('pt-BR')} motos`}
          accent={YAMAHA}
          icon={Target}
          trend={shareTrendDelta}
        />
        <HeroCard
          label="Share Honda (líder)"
          value={`${d.hondaShare}%`}
          sub={`${d.hondaQtd.toLocaleString('pt-BR')} motos · principal concorrente`}
          accent={HONDA}
          icon={TrendingUp}
        />
        <HeroCard
          label="Nippon na região"
          value={`${d.nipponShareDoMercado}%`}
          sub={`${d.nipponQtd.toLocaleString('pt-BR')} motos · ${d.nipponShareDaYamaha}% de toda Yamaha regional`}
          accent="var(--accent)"
          icon={Trophy}
        />
        <HeroCard
          label="Gap para liderança"
          value={`${(d.hondaShare - d.yamahaShare).toFixed(1)}pp`}
          sub={`${(d.hondaQtd - d.yamahaQtd).toLocaleString('pt-BR')} motos de diferença`}
          accent="var(--warn)"
          icon={TrendingDown}
        />
      </div>

      {/* ── INSIGHTS ESTRATÉGICOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Onde perde */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--danger-bg)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
            </div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Onde estamos perdendo share</h2>
          </div>
          <div className="space-y-2.5">
            {perdendo.map(s => (
              <div key={s.segmento} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-inset)' }}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{segLabel(s.segmento)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    Yamaha {s.shareYamaha}% · Honda {s.shareHonda}% · mercado de {s.total} motos
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--danger)' }}>−{s.gap}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>motos vs Honda</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* O que melhorar */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warn-bg)' }}>
              <Lightbulb size={14} style={{ color: 'var(--warn)' }} />
            </div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Plano de ação — recuperar share</h2>
          </div>
          <ul className="space-y-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-2">
              <span style={{ color: 'var(--accent)' }}>1.</span>
              <span><b style={{ color: 'var(--text-primary)' }}>{segLabel(perdendo[0].segmento)}</b> é a maior oportunidade: mercado de {perdendo[0].total} motos com só {perdendo[0].shareYamaha}% Yamaha. Campanha agressiva de entrada + estoque garantido.</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: 'var(--accent)' }}>2.</span>
              <span>Defender a força em <b style={{ color: 'var(--ok)' }}>{segLabel(fortes[0].segmento)}</b> ({fortes[0].shareYamaha}% de share) — manter disponibilidade e pós-venda impecável.</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: 'var(--accent)' }}>3.</span>
              <span>Segmento <b style={{ color: 'var(--text-primary)' }}>Elétrico</b> ainda é incipiente na região — janela para posicionar a Yamaha como pioneira.</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: 'var(--accent)' }}>4.</span>
              <span>Share Yamaha {shareTrendDelta >= 0 ? 'subiu' : 'recuou'} <b style={{ color: shareTrendDelta >= 0 ? 'var(--ok)' : 'var(--danger)' }}>{Math.abs(shareTrendDelta).toFixed(1)}pp</b> no semestre — {shareTrendDelta >= 0 ? 'manter o ritmo' : 'reagir nos próximos lançamentos'}.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── GRÁFICOS: Donut + Evolução ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 card card-pad flex flex-col">
          <p className="section-label mb-3">Share por marca — 2026</p>
          <ShareDonut data={[...d.brandShare]} />
          <div className="space-y-1.5 mt-2">
            {d.brandShare.filter(b => b.qtd > 0).slice(0, 5).map((b, i) => (
              <div key={b.marca} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: b.marca === 'Yamaha' ? YAMAHA : b.marca === 'Honda' ? HONDA : ['#A855F7', '#F59E0B', '#14B8A6', '#64748B'][i % 4] }} />
                  {b.marca}
                </span>
                <span className="tabular-nums font-semibold" style={{ color: b.marca === 'Yamaha' ? YAMAHA : 'var(--text-primary)' }}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 card card-pad flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <p className="section-label">Evolução mensal — volume e share por montadora</p>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>colunas = volume · linhas = % de share</span>
          </div>
          <ShareTrendChart data={mixData} />
        </div>
      </div>

      {/* ── SEGMENTOS ── */}
      <section>
        <h2 className="section-label mb-3">Share Yamaha por segmento — onde ganhar a próxima moto</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Segmento</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-medium hidden sm:table-cell" style={{ color: 'var(--text-tertiary)' }}>Mercado</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium w-[42%]" style={{ color: 'var(--text-tertiary)' }}>Share Yamaha vs Honda</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Yamaha</th>
              </tr>
            </thead>
            <tbody>
              {[...d.segments].sort((a, b) => b.total - a.total).map(s => (
                <tr key={s.segmento} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{segLabel(s.segmento)}</td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{s.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                      <div style={{ width: `${s.shareYamaha}%`, backgroundColor: YAMAHA }} />
                      <div style={{ width: `${s.shareHonda}%`, backgroundColor: HONDA, opacity: 0.55 }} />
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      <span style={{ color: YAMAHA }}>Y {s.shareYamaha}%</span>
                      <span style={{ color: HONDA }}>H {s.shareHonda}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: s.shareYamaha >= 35 ? 'var(--ok)' : s.shareYamaha >= 20 ? 'var(--warn)' : 'var(--danger)' }}>
                    {s.yamaha}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CIDADES + CONCORRENTES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cidades */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <MapPin size={14} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Share Yamaha por cidade</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {d.cities.slice(0, 12).map(c => (
                <tr key={c.cidade} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{c.cidade}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{c.total} motos · {c.yamaha} Yamaha</p>
                  </td>
                  <td className="px-4 py-2.5 w-1/2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(c.shareYamaha, 100)}%`, backgroundColor: c.shareYamaha >= 25 ? 'var(--ok)' : c.shareYamaha >= 15 ? 'var(--warn)' : 'var(--danger)' }} />
                      </div>
                      <span className="text-xs tabular-nums font-bold w-10 text-right" style={{ color: 'var(--text-primary)' }}>{c.shareYamaha}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Concorrentes */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <Building2 size={14} style={{ color: 'var(--danger)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Concessionárias concorrentes (top volume)</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {d.competitors.filter(c => 'nome' in c && (c as { nome?: string }).nome).slice(0, 12).map((c, i) => {
                const comp = c as { cnpj: string; marca: string; qtd: number; cidade: string; nome?: string }
                return (
                  <tr key={comp.cnpj + i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{comp.nome}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{comp.cidade}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: comp.marca === 'Honda' ? 'var(--danger-bg)' : 'var(--bg-inset)', color: comp.marca === 'Honda' ? 'var(--danger)' : 'var(--text-secondary)' }}>{comp.marca}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: 'var(--text-primary)' }}>{comp.qtd}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[10px]" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
            Razão social via Receita Federal (BrasilAPI) · emplacamentos 2026
          </p>
        </div>
      </div>
    </div>
  )
}

function HeroCard({ label, value, sub, accent, icon: Icon, trend }: {
  label: string; value: string; sub: string; accent: string
  icon: React.ElementType; trend?: number
}) {
  return (
    <div className="card card-pad flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums" style={{ color: accent }}>{value}</span>
          {trend !== undefined && (
            <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: trend >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(trend).toFixed(1)}pp
            </span>
          )}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </div>
  )
}

function segLabel(s: string) {
  return s
    .replace('SMALL - ', '')
    .replace('MIDDLE - ', '')
    .replace('BIG - ', '')
    .replace('STREET/N', 'Street')
    .replace('STREET/F', 'Street F')
    .replace('ON/OFF', 'On/Off')
    .replace('SCOOTER', 'Scooter')
    .replace('STREET', 'Street')
    .replace('ELECTRIC', 'Elétrica')
    .replace('Touring/Adventure', 'Big Trail')
    .replace('BIG STREET/N', 'Big Street')
}
