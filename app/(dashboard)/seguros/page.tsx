import { segurosData, calcularSeguros } from '@/lib/seguros-data'
import { Shield, ShieldAlert, ShieldCheck, TrendingUp, Bike, RotateCcw } from 'lucide-react'

export const metadata = { title: 'Seguros · Smart Dealer' }

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`

export default function SegurosPage() {
  const d = segurosData
  const c = calcularSeguros()
  const maxMotos = Math.max(...d.serie.map(m => m.motos))

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Yamaha Seguros · Frota Circulante</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.grupo} · {d.referencia} · vendi X motos, fechei X seguros — e a frota que já rodou?
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          Painel Ranking Indicadores · consultor {d.consultor}
        </span>
      </div>

      {/* KPIs julho (números do painel oficial) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Bike} accent="var(--accent)" label="Motos × Seguros (Jul)" value={`${c.jul.motos} × ${c.jul.seguros}`} sub={`${c.jul.cotacoes} cotações emitidas`} />
        <Kpi icon={Shield} accent={c.penetracao >= d.metaPenetracao ? 'var(--ok)' : 'var(--warn)'} label="Penetração" value={pct(c.penetracao)} sub={`meta ${d.metaPenetracao}% das motos com seguro`} />
        <Kpi icon={ShieldCheck} accent="var(--ok)" label="Oferta" value={pct(c.oferta)} sub="cotações ÷ motos — acima de 100% é oferta ativa" />
        <Kpi icon={TrendingUp} accent="var(--warn)" label="Conversão" value={pct(c.conversao)} sub="seguros fechados ÷ cotações" />
      </div>

      {/* Frota circulante — o argumento novo */}
      <div className="card card-pad" style={{ borderLeft: '4px solid var(--warn)' }}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={16} style={{ color: 'var(--warn)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Frota circulante: o seguro não acaba na venda</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-3">
          <Resumo label="Motos vendidas (24m)" valor={`${d.frota.motosVendidas24m.toLocaleString('pt-BR')}`} />
          <Resumo label="Apólices vigentes" valor={`${d.frota.segurosAtivos}`} destaque cor={c.pctFrotaSegurada < 30 ? 'var(--warn)' : 'var(--ok)'} sub={`${pct(c.pctFrotaSegurada)} da frota`} />
          <Resumo label="Renovações em 30 dias" valor={`${d.frota.vencendo30dias}`} />
          <Resumo label="Vencidas (90 dias)" valor={`${d.frota.vencidas90dias}`} cor="var(--danger)" />
          <Resumo label="Receita em renovações" valor={fmtBRL(c.receitaRenovacoes)} cor="var(--ok)" destaque sub="comissão da CCY" />
        </div>
        <p className="text-xs mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          Fechando o gap até a meta de penetração ({c.gapMensal > 0 ? `+${c.gapMensal} seguros/mês` : 'atingida'}), a comissão adicional estimada é de <b style={{ color: 'var(--ok)' }}>{fmtBRL(c.receitaGapAno)}/ano</b> — sem vender uma moto a mais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Série mensal */}
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Evolução mensal — motos × seguros</h2>
          <div className="space-y-2.5">
            {d.serie.map(m => {
              const pen = (m.seguros / m.motos) * 100
              return (
                <div key={m.mes}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.mes}</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {m.motos} motos · <b style={{ color: 'var(--accent)' }}>{m.seguros} seguros</b> · {pct(pen)}
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                    <div className="absolute h-full rounded-full opacity-30" style={{ width: `${(m.motos / maxMotos) * 100}%`, backgroundColor: 'var(--text-tertiary)' }} />
                    <div className="absolute h-full rounded-full" style={{ width: `${(m.seguros / maxMotos) * 100}%`, backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Ranking vendedores */}
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ranking por vendedor (julho)</h2>
          <div className="space-y-3">
            {[...d.vendedores].sort((a, b) => (b.seguros / b.motos) - (a.seguros / a.motos)).map((v, i) => {
              const pen = (v.seguros / v.motos) * 100
              return (
                <div key={v.nome} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: i === 0 ? 'var(--ok-bg)' : 'var(--bg-inset)', color: i === 0 ? 'var(--ok)' : 'var(--text-secondary)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{v.nome} <span style={{ color: 'var(--text-tertiary)' }}>· {v.loja}</span></span>
                      <span className="tabular-nums shrink-0" style={{ color: 'var(--text-secondary)' }}>{v.seguros}/{v.motos} · {pct(pen)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pen / d.metaPenetracao * 100, 100)}%`, backgroundColor: pen >= d.metaPenetracao ? 'var(--ok)' : 'var(--warn)' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>Barra = penetração individual ÷ meta de {d.metaPenetracao}%</p>
        </div>
      </div>

      {/* Fila: vendas sem seguro */}
      <section>
        <h2 className="section-label mb-3">Vendas de agosto sem seguro — fila de oferta do dia</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                {['Cliente', 'Modelo', 'Loja', 'Comprou há', 'Cotação anual', 'Ação'].map(h => <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {d.semSeguro.map(s => (
                <tr key={s.cliente} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{s.cliente}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{s.modelo}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>{s.loja}</td>
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: s.diasDaCompra <= 7 ? 'var(--ok)' : 'var(--warn)' }}>{s.diasDaCompra} dias</td>
                  <td className="px-4 py-2.5 font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmtBRL(s.cotacao)}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--accent)' }}><RotateCcw size={11} /> Ofertar na entrega técnica / 1ª revisão</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
