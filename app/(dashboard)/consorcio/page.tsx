import { consorcioData, calcularConsorcio } from '@/lib/consorcio-data'
import { PiggyBank, Award, ShieldCheck, Users, AlertTriangle, Target } from 'lucide-react'

export const metadata = { title: 'Consórcio · Smart Dealer' }

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`

export default function ConsorcioPage() {
  const d = consorcioData
  const c = calcularConsorcio()
  const maxV = Math.max(...d.serie.map(m => m.vendidas))
  const bq = d.bonusQuality

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Consórcio Yamaha</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {d.grupo} · {d.referencia} · volume + retenção + qualidade da carteira = Bônus Quality
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={PiggyBank} accent="var(--accent)" label="Cotas vendidas no ano" value={`${c.vendidasAno}`} sub={`julho: ${c.jul.vendidas} · meta mensal ${d.metaMensalCotas}`} />
        <Kpi icon={Users} accent="var(--ok)" label="Carteira ativa" value={`${d.carteira.cotasAtivas} cotas`} sub={`${fmtBRL(c.creditoAtivo)} em crédito`} />
        <Kpi icon={ShieldCheck} accent={c.retencao >= 88 ? 'var(--ok)' : 'var(--warn)'} label="Retenção da carteira" value={pct(c.retencao)} sub={`${c.canceladasAno} cancelamentos no ano`} />
        <Kpi icon={Award} accent={bq.trimestreAtual.elegivel ? 'var(--ok)' : 'var(--danger)'} label="Bônus Quality (3º tri)" value={fmtBRL(bq.trimestreAtual.bonusEstimado)} sub={bq.trimestreAtual.elegivel ? 'critérios atingidos ✓' : 'em risco'} />
      </div>

      {/* Bônus Quality */}
      <div className="card card-pad" style={{ borderLeft: '4px solid var(--ok)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} style={{ color: 'var(--ok)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Bônus Quality — a carteira saudável paga</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{bq.regra}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3">
          <Resumo label="Crédito comercializado (tri)" valor={fmtBRL(bq.trimestreAtual.creditoComercializado)} />
          <Resumo label="Adimplência" valor={pct(bq.trimestreAtual.adimplencia)} cor={bq.trimestreAtual.adimplencia >= 90 ? 'var(--ok)' : 'var(--danger)'} sub="critério: ≥ 90%" />
          <Resumo label="Cancelamento da safra" valor={pct(bq.trimestreAtual.cancelamento)} cor={bq.trimestreAtual.cancelamento <= 12 ? 'var(--ok)' : 'var(--danger)'} sub="critério: ≤ 12%" />
          <Resumo label="Histórico do ano" valor={fmtBRL(bq.historico.reduce((s, h) => s + h.bonus, 0) + bq.trimestreAtual.bonusEstimado)} destaque cor="var(--ok)" sub={`${bq.historico.length + 1} trimestres elegíveis`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Série mensal */}
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Vendas de cotas por mês</h2>
          <div className="space-y-2.5">
            {d.serie.map((m, i) => (
              <div key={m.mes}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.mes}{i === d.serie.length - 1 ? ' (em curso)' : ''}</span>
                  <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    <b style={{ color: m.vendidas >= d.metaMensalCotas ? 'var(--ok)' : 'var(--text-primary)' }}>{m.vendidas}</b> vendidas · {m.canceladas} canceladas
                  </span>
                </div>
                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="absolute h-full rounded-full" style={{ width: `${(m.vendidas / maxV) * 100}%`, backgroundColor: 'var(--accent)' }} />
                  <div className="absolute top-0 h-full w-0.5" style={{ left: `${(d.metaMensalCotas / maxV) * 100}%`, backgroundColor: 'var(--danger)' }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>Linha vermelha = meta mensal ({d.metaMensalCotas} cotas)</p>
        </div>

        {/* Contemplados + retenção */}
        <div className="space-y-4">
          <div className="card card-pad">
            <div className="flex items-center gap-2 mb-3">
              <Target size={15} style={{ color: 'var(--accent)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Contemplados viram moto na Nippon?</h2>
            </div>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{pct(c.conversaoContemplados)}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{d.carteira.contempladosConverteramMoto} de {d.carteira.contempladosAno} contemplados retiraram a moto aqui</p>
              </div>
            </div>
            <p className="text-xs mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              Cada contemplado que compra fora é uma venda perdida com o cliente já financiado. O sistema avisa o vendedor na semana da assembleia.
            </p>
          </div>

          <div className="card card-pad">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} style={{ color: 'var(--warn)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Retenção — cotas em risco</h2>
            </div>
            <div className="space-y-2.5">
              {d.emRisco.map(r => (
                <div key={r.cota} className="flex items-start justify-between gap-3 text-xs pb-2.5 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.cliente} <span className="font-normal" style={{ color: 'var(--text-tertiary)' }}>· {r.cota}</span></p>
                    <p style={{ color: 'var(--accent)' }}>{r.acao}</p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: r.parcelasAtraso >= 3 ? 'var(--danger-bg)' : 'var(--warn-bg)', color: r.parcelasAtraso >= 3 ? 'var(--danger)' : 'var(--warn)' }}>
                    {r.parcelasAtraso}x atraso
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, accent, label, value, sub }: { icon: React.ElementType; accent: string; label: string; value: string; sub: string }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
          <Icon size={14} style={{ color: accent }} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
}

function Resumo({ label, valor, sub, cor, destaque }: { label: string; valor: string; sub?: string; cor?: string; destaque?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className={`tabular-nums font-bold ${destaque ? 'text-xl' : 'text-lg'}`} style={{ color: cor ?? 'var(--text-primary)' }}>{valor}</p>
      {sub && <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  )
}
