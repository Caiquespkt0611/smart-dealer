import { bancoData, calcularBanco } from '@/lib/banco-data'
import {
  Landmark, Trophy, RefreshCcw, Repeat, MessageCircle,
  TrendingUp, AlertTriangle, Flame, Snowflake, Thermometer,
} from 'lucide-react'

export const metadata = { title: 'Banco Yamaha · Smart Dealer' }

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const fmtData = (iso: string) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a.slice(2)}` }

const STATUS_OP = {
  novo:       { label: 'Novo',       c: 'var(--accent)',  bg: 'var(--accent-bg)' },
  contatado:  { label: 'Contatado',  c: '#A855F7',        bg: '#A855F71A' },
  negociando: { label: 'Negociando', c: 'var(--warn)',    bg: 'var(--warn-bg)' },
  convertido: { label: 'Convertido', c: 'var(--ok)',      bg: 'var(--ok-bg)' },
} as const

const TEMP = {
  quente: { icon: Flame,       c: 'var(--danger)', label: 'Quente' },
  morno:  { icon: Thermometer, c: 'var(--warn)',   label: 'Morno' },
  frio:   { icon: Snowflake,   c: 'var(--accent)', label: 'Frio' },
} as const

export default function BancoPage() {
  const d = bancoData
  const c = calcularBanco()
  const etapas = [
    { rotulo: 'Recusados no CDC (tri)', qtd: d.funil.recusadosTrimestre },
    { rotulo: 'Elegíveis Liberacred', qtd: d.funil.elegiveisLiberacred },
    { rotulo: 'Contatados', qtd: d.funil.contatados },
    { rotulo: 'Convertidos em venda', qtd: d.funil.convertidos },
  ]
  const max = etapas[0].qtd

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Banco Yamaha · Oportunidades</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.grupo} · {d.referencia} · recusado não é fim de linha — é a próxima venda
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {d.fonte}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Trophy} accent="var(--ok)" label="Vendas resgatadas (Liberacred)" value={`${c.convertidos}`} sub={`${fmtBRL(c.receitaRecuperada)} recuperados`} />
        <Kpi icon={TrendingUp} accent="var(--accent)" label="Em jogo agora" value={fmtBRL(c.receitaEmJogo)} sub={`${d.oportunidades.length - c.convertidos} oportunidades abertas`} />
        <Kpi icon={AlertTriangle} accent="var(--warn)" label="Aprovados não pagos" value={fmtBRL(c.naoPagos)} sub={`${d.aprovadosNaoPagos.length} vendas já ganhas paradas`} />
        <Kpi icon={Repeat} accent="#A855F7" label="Quitações chegando" value={`${c.recompra}`} sub="clientes voltando ao mercado" />
      </div>

      {/* Funil Liberacred */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card card-pad lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Landmark size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Funil Liberacred — da recusa à conversão</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
            O sistema cruza a base de recusados CDC com o Liberacred e entrega ao vendedor o cliente já aprovado de novo.
          </p>
          <div className="space-y-2.5">
            {etapas.map((e, i) => (
              <div key={e.rotulo}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{e.rotulo}</span>
                  <span className="font-bold tabular-nums" style={{ color: i === etapas.length - 1 ? 'var(--ok)' : 'var(--text-secondary)' }}>{e.qtd}</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(e.qtd / max) * 100}%`, backgroundColor: i === etapas.length - 1 ? 'var(--ok)' : 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Taxa de resgate: <b style={{ color: 'var(--ok)' }}>{c.taxaResgate}%</b> dos contatados</span>
            <span style={{ color: 'var(--text-secondary)' }}>Ticket médio: <b style={{ color: 'var(--text-primary)' }}>{fmtBRL(d.funil.ticketMedio)}</b></span>
          </div>
        </div>

        {/* Mensagem-prêmio */}
        <div className="card card-pad" style={{ borderColor: '#25D366', borderWidth: 1.5 }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D3661A' }}>
              <MessageCircle size={14} style={{ color: '#25D366' }} />
            </div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Liberacred é prêmio, não recusa</h2>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>Mensagem que o vendedor dispara em 1 clique:</p>
          <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
            {d.mensagemPremio('Letícia', 'NMAX Connected')}
          </div>
        </div>
      </div>

      {/* Oportunidades Liberacred */}
      <section>
        <h2 className="section-label mb-3">Oportunidades Liberacred — fila de trabalho</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                {['Cliente', 'Modelo', 'Loja', 'Vendedor', 'Recusa CDC', 'Aprovado Liberacred', 'Entrada', 'Parcela 48x', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.oportunidades.map(o => {
                const st = STATUS_OP[o.status]
                return (
                  <tr key={o.cliente} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{o.cliente}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{o.modelo}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--text-secondary)' }}>{o.loja}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{o.vendedor}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{fmtData(o.dataRecusa)}</td>
                    <td className="px-4 py-2.5 font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{fmtBRL(o.valorAprovado)}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmtBRL(o.entradaMinima)}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmtBRL(o.parcelaEstimada)}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ backgroundColor: st.bg, color: st.c }}>{st.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Aprovados e não pagos */}
        <section>
          <h2 className="section-label mb-3">Aprovados e não pagos — a venda já estava ganha</h2>
          <div className="space-y-3">
            {d.aprovadosNaoPagos.map(a => {
              const t = TEMP[a.temperatura]
              const TIcon = t.icon
              return (
                <div key={a.cliente} className="card card-pad">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{a.cliente}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{a.modelo} · {a.loja} · {a.vendedor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmtBRL(a.valorFinanciado)}</p>
                      <p className="text-[11px] flex items-center gap-1 justify-end" style={{ color: t.c }}>
                        <TIcon size={11} /> {t.label} · {a.diasParado} dias parado
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t grid sm:grid-cols-2 gap-2 text-xs" style={{ borderColor: 'var(--border)' }}>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Motivo: </span><span style={{ color: 'var(--text-secondary)' }}>{a.motivo}</span></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Ação: </span><span className="font-medium" style={{ color: 'var(--accent)' }}>{a.acao}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Quitações */}
        <section>
          <h2 className="section-label mb-3">Contratos quitando — chame antes do concorrente</h2>
          <div className="space-y-3">
            {d.quitandoContrato.map(q => (
              <div key={q.cliente} className="card card-pad">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{q.cliente}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {q.motoAtual} {q.anoMoto} · quita em {fmtData(q.dataQuitacao)} ({q.parcelasRestantes} parcela{q.parcelasRestantes > 1 ? 's' : ''})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Score de recompra</p>
                    <p className="text-lg font-bold tabular-nums" style={{ color: q.scoreRecompra >= 85 ? 'var(--ok)' : 'var(--warn)' }}>{q.scoreRecompra}</p>
                  </div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t flex items-center justify-between gap-2 text-xs flex-wrap" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Usado na troca: <b style={{ color: 'var(--text-primary)' }}>{fmtBRL(q.valorUsadoEstimado)}</b>
                  </span>
                  <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--accent)' }}>
                    <RefreshCcw size={11} /> Upgrade: {q.sugestaoUpgrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
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
