import { crmData } from '@/lib/crm-data'
import {
  Users, Target, DollarSign, TrendingUp,
  Megaphone, Search, Globe, UserPlus, Store, Trophy,
} from 'lucide-react'

export const metadata = { title: 'CRM · Smart Dealer' }

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}
function fmtK(v: number) {
  return v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : fmtBRL(v)
}

const ESTAGIO_COR: Record<string, string> = {
  'Novo': 'var(--accent)',
  'Em contato': '#A855F7',
  'Negociação': 'var(--warn)',
  'Proposta': '#F97316',
  'Fechado': 'var(--ok)',
  'Perdido': 'var(--danger)',
}

const ORIGEM_ICON: Record<string, React.ElementType> = {
  'Meta Ads': Megaphone,
  'Google': Search,
  'Site Yamaha': Globe,
  'Indicação': UserPlus,
  'Showroom': Store,
}

function inicial(nome: string) {
  const p = nome.split(' ')
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

export default function CrmPage() {
  const d = crmData
  const pipelineStages = d.funil.filter(f => f.estagio !== 'Perdido')
  const maxFunil = Math.max(...d.funil.map(f => f.qtd))

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>CRM de Leads</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Pipeline comercial · origem dos leads · performance da equipe
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          <Users size={13} /> {d.totalLeads} leads ativos no mês
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Target} accent="var(--accent)" label="Conversão geral" value={`${d.conversaoGeral}%`} sub={`${d.totalFechados} de ${d.totalLeads} leads`} />
        <Kpi icon={DollarSign} accent="var(--ok)" label="Vendas fechadas" value={fmtK(d.valorFechado)} sub={`${d.totalFechados} negócios`} />
        <Kpi icon={TrendingUp} accent="var(--warn)" label="Pipeline aberto" value={fmtK(d.valorPipeline)} sub="em negociação" />
        <Kpi icon={Users} accent="var(--text-primary)" label="Leads no funil" value={`${d.totalLeads}`} sub={`${d.origens.length} canais`} />
      </div>

      {/* ── FUNIL ── */}
      <section>
        <h2 className="section-label mb-3">Funil de conversão</h2>
        <div className="card card-pad space-y-2">
          {d.funil.map(f => (
            <div key={f.estagio} className="flex items-center gap-3">
              <span className="text-xs w-24 shrink-0" style={{ color: 'var(--text-secondary)' }}>{f.estagio}</span>
              <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                <div className="h-full rounded-lg flex items-center px-2.5 transition-all" style={{ width: `${Math.max((f.qtd / maxFunil) * 100, 8)}%`, backgroundColor: ESTAGIO_COR[f.estagio] }}>
                  <span className="text-[11px] font-bold text-white tabular-nums">{f.qtd}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE KANBAN ── */}
      <section>
        <h2 className="section-label mb-3">Pipeline — leads por estágio</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pipelineStages.map(stage => {
            const leads = d.leads.filter(l => l.estagio === stage.estagio)
            return (
              <div key={stage.estagio} className="shrink-0 w-[230px]">
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ESTAGIO_COR[stage.estagio] }} />
                    {stage.estagio}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{leads.length}</span>
                </div>
                <div className="space-y-2">
                  {leads.map(l => {
                    const Icon = ORIGEM_ICON[l.origem] ?? Globe
                    return (
                      <div key={l.id} className="card card-pad !p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                            {inicial(l.nome)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{l.nome}</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>{l.modelo}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                            <Icon size={10} /> {l.origem}
                          </span>
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{fmtK(l.valor)}</span>
                        </div>
                        <p className="text-[9px] mt-1 truncate" style={{ color: 'var(--text-tertiary)' }}>{l.vendedor} · {l.diasNoFunil}d</p>
                      </div>
                    )
                  })}
                  {!leads.length && <p className="text-[10px] px-1" style={{ color: 'var(--text-tertiary)' }}>—</p>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── PERFORMANCE + ORIGENS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vendedores */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <Trophy size={14} style={{ color: 'var(--warn)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Performance por vendedor</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Vendedor</th>
                <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Leads</th>
                <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Fechados</th>
                <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Conv.</th>
                <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wider font-medium hidden sm:table-cell" style={{ color: 'var(--text-tertiary)' }}>Faturado</th>
              </tr>
            </thead>
            <tbody>
              {d.performance.map((p, i) => (
                <tr key={p.vendedor} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2">
                      {i === 0 && <span>🏆</span>}
                      <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{p.vendedor}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{p.leads}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold" style={{ color: 'var(--ok)' }}>{p.fechados}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: p.conversao >= 20 ? 'var(--ok)' : p.conversao >= 10 ? 'var(--warn)' : 'var(--danger)' }}>{p.conversao}%</td>
                  <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell" style={{ color: 'var(--text-primary)' }}>{fmtK(p.valorFechado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Origens */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <Globe size={14} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Leads por origem</h2>
          </div>
          <div className="p-3 space-y-2">
            {d.origens.map(o => {
              const Icon = ORIGEM_ICON[o.origem] ?? Globe
              return (
                <div key={o.origem} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <Icon size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{o.origem}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{o.total} leads · {o.fechados} fechados</p>
                  </div>
                  <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: o.conversao >= 20 ? 'var(--ok)' : 'var(--text-secondary)' }}>{o.conversao}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, accent, label, value, sub }: {
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
