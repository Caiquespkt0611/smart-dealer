import { getCampanhaAnalise, CAMPANHA } from '@/lib/campanha-vendas'
import { Ticket, Trophy, RotateCcw, Users, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'Campanhas Yamaha · Smart Dealer' }
export const dynamic = 'force-dynamic'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export default async function VouchersPage() {
  const c = await getCampanhaAnalise()
  const pctTri = c.metaTrimestre ? Math.round((c.vendidoTrimestre / c.metaTrimestre) * 100) : 0

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {CAMPANHA.nome} — o que a Nippon vai receber
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Circular {CAMPANHA.circular} · {CAMPANHA.periodo} · faixa {c.faixaGrupo} ({fmtBRL(c.premioFaixa)}/mês de referência)
        </p>
      </div>

      {/* ── HERO ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Hero label="Garantido até agora" valor={fmtBRL(c.garantido)} sub="pelas apurações mensais já fechadas" cor="var(--ok)" icone={Trophy} />
        <Hero label="Recuperável no trimestre" valor={fmtBRL(c.recuperavel)} sub="se a meta acumulada fechar em 100%" cor="var(--warn)" icone={RotateCcw} />
        <Hero label="Meta do trimestre" valor={`${c.vendidoTrimestre} / ${c.metaTrimestre}`} sub={`${pctTri}% do acumulado Jul–Set`} cor="var(--accent)" icone={Ticket} />
        <Hero label="Potencial máximo" valor={fmtBRL(c.cenarios[2].total)} sub="fechando os meses abertos em 110%" cor="var(--text-primary)" icone={Users} />
      </div>

      {/* ── APURAÇÃO MÊS A MÊS ── */}
      <section>
        <h2 className="section-label mb-3">Apuração mês a mês</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {c.meses.map(m => {
            const corStatus = m.status === 'fechado'
              ? (m.premio > 0 ? 'var(--ok)' : 'var(--danger)')
              : m.status === 'em-curso' ? 'var(--accent)' : 'var(--text-tertiary)'
            return (
              <div key={m.mes} className="card card-pad" style={{ borderTop: `3px solid ${corStatus}` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{m.nomeMes}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--bg-inset)', color: corStatus }}>
                    {m.status === 'fechado' ? 'Fechado' : m.status === 'em-curso' ? 'Em curso' : 'Aguardando'}
                  </span>
                </div>

                <div className="flex items-end gap-3 mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      Carta{m.metaEstimada ? ' (estimada)' : ''}
                    </p>
                    <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{m.meta}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                      {m.status === 'fechado' ? 'Resultado' : m.status === 'em-curso' ? 'Vendas · Projeção' : 'Resultado'}
                    </p>
                    <p className="text-lg font-bold tabular-nums" style={{ color: corStatus }}>
                      {m.status === 'fechado' ? m.resultado
                        : m.status === 'em-curso' && m.projecao !== null ? `${m.resultado} · ${m.projecao}`
                        : '—'}
                    </p>
                  </div>
                  {m.pctAtingimento !== null && (
                    <p className="ml-auto text-2xl font-bold tabular-nums" style={{ color: corStatus }}>
                      {String(m.pctAtingimento).replace('.', ',')}%
                    </p>
                  )}
                </div>

                <p className="text-[11px] mb-3" style={{ color: 'var(--text-secondary)' }}>{m.regra}</p>

                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Prêmio do mês</span>
                  <span className="text-base font-bold tabular-nums" style={{ color: m.premio > 0 ? 'var(--ok)' : 'var(--text-tertiary)' }}>
                    {m.premio > 0 ? fmtBRL(m.premio) : '—'}
                  </span>
                </div>
                {m.gerentes > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Incentivo gerentes</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{fmtBRL(m.gerentes)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CENÁRIOS ── */}
      <section>
        <h2 className="section-label mb-3">Cenários — o que está em jogo até setembro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {c.cenarios.map((cen, i) => (
            <div key={cen.rotulo} className="card card-pad" style={i === 2 ? { border: '1px solid var(--ok-border)' } : undefined}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: i === 2 ? 'var(--ok)' : 'var(--text-tertiary)' }}>
                {cen.rotulo}
              </p>
              <p className="text-2xl font-bold tabular-nums mt-2" style={{ color: i === 2 ? 'var(--ok)' : 'var(--text-primary)' }}>
                {fmtBRL(cen.total)}
              </p>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>{cen.condicao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── REGRAS ── */}
      <div className="card card-pad">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} style={{ color: 'var(--warn)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Como a circular apura</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>90–99% da carta paga 50% do valor da faixa — válido apenas no mês.</li>
          <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>100–109% paga 100% · 110% ou mais paga em dobro (válido no mês).</li>
          <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>Se o resultado alcançar faixa superior à da meta, o prêmio sobe de faixa (ex.: vender 401+ paga como faixa B).</li>
          <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>Mês perdido é recuperável ao fechar a meta acumulada do trimestre em 100% (sem parcial).</li>
          <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>Gerentes: R$ 30/moto ao superar 100% da carta · R$ 50/moto acima de 110% — rateio a critério do titular.</li>
          <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>Cartas de setembro ainda não informadas entram como estimativa (igual à carta atual) até a circular chegar.</li>
        </ul>
      </div>
    </div>
  )
}

function Hero({ label, valor, sub, cor, icone: Icon }: {
  label: string; valor: string; sub: string; cor: string; icone: React.ElementType
}) {
  return (
    <div className="card card-pad flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <Icon size={15} style={{ color: cor }} />
        </div>
      </div>
      <div>
        <span className="text-2xl font-bold tabular-nums" style={{ color: cor }}>{valor}</span>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </div>
  )
}
