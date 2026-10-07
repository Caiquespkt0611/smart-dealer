import { bancoData, calcularBanco, nomeModelo, nomeCurto, type SituacaoLiberacred } from '@/lib/banco-data'
import { liberacredTabela, LIBERACRED_CONSULTA } from '@/lib/liberacred-tabela'
import LiberacredKit from '@/components/banco/LiberacredKit'
import {
  Landmark, Wallet, RefreshCcw, Repeat, MessageCircle, BellRing,
  AlertTriangle, Flame, Snowflake, Thermometer, CalendarCheck, FileSignature,
} from 'lucide-react'

export const metadata = { title: 'Banco Yamaha · Smart Dealer' }

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmtBRL2 = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso: string) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a.slice(2)}` }
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const fmtMes = (ym: string) => `${MESES[Number(ym.slice(5, 7)) - 1]}/${ym.slice(2, 4)}`

const SITUACAO: Record<SituacaoLiberacred, { label: string; c: string; bg: string }> = {
  apto:     { label: 'Apto · chamar', c: 'var(--ok)',     bg: 'var(--ok-bg)' },
  pagando:  { label: 'Em dia',     c: 'var(--accent)', bg: 'var(--accent-bg)' },
  atrasada: { label: 'Atrasou',  c: 'var(--danger)', bg: 'var(--danger-bg)' },
  faturado: { label: 'Faturado', c: 'var(--text-secondary)', bg: 'var(--bg-inset)' },
}

const TEMP = {
  quente: { icon: Flame,       c: 'var(--danger)', label: 'Quente' },
  morno:  { icon: Thermometer, c: 'var(--warn)',   label: 'Morno' },
  frio:   { icon: Snowflake,   c: 'var(--accent)', label: 'Frio' },
} as const

// colunas da tabela oficial: os planos que o vendedor mais oferece
const COLUNAS = [
  { parcelas: 18, entradaPct: 30, rotulo: '18x · 30%' },
  { parcelas: 12, entradaPct: 30, rotulo: '12x · 30%' },
  { parcelas: 12, entradaPct: 40, rotulo: '12x · 40%' },
  { parcelas: 18, entradaPct: 50, rotulo: '18x · 50%' },
]

export default function BancoPage() {
  const d = bancoData
  const c = calcularBanco()
  const ordem: SituacaoLiberacred[] = ['apto', 'atrasada', 'pagando', 'faturado']
  const cart = [...c.cart].sort((a, b) => ordem.indexOf(a.situacao) - ordem.indexOf(b.situacao) || a.mesesParaApto - b.mesesParaApto)
  const exAp = c.aptos[0]

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Banco Yamaha · Oportunidades</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.grupo} · {d.referencia} · crédito recusado não é fim de linha, é a próxima venda
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {d.fonte}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Wallet} accent="var(--accent)" label="Carteira Liberacred" value={`${c.ativos} clientes`} sub={`${fmtBRL(c.entradaJuntada)} de entrada já juntada`} />
        <Kpi icon={BellRing} accent="var(--ok)" label="Aptos a financiar" value={`${c.aptos.length}`} sub={`+ ${c.proximos.length} ficam aptos nos próximos 2 meses`} />
        <Kpi icon={AlertTriangle} accent="var(--warn)" label="Aprovados não pagos" value={fmtBRL(c.naoPagos)} sub={`${d.aprovadosNaoPagos.length} vendas já ganhas paradas`} />
        <Kpi icon={Repeat} accent="var(--accent)" label="Quitações chegando" value={`${c.recompra}`} sub="clientes voltando ao mercado" />
      </div>

      {/* Como funciona */}
      <div className="card card-pad">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <Landmark size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Liberacred: a entrada programada do Banco Yamaha</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Dos {d.recusadosCdcTrimestre} recusados no CDC no trimestre, {d.ofertadosLiberacred} receberam a proposta e {d.carteira.length} aderiram ({c.adesao}%). O sistema acompanha cada um até o mês em que pode financiar.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: FileSignature, t: 'Recusou no CDC? Adere', s: 'Sem análise de crédito e sem comprovar renda. Escolhe a moto e a entrada, de 30% a 50%.' },
            { icon: CalendarCheck, t: 'Junta a entrada em até 18x', s: 'Paga uma parcela por mês, em qualquer dia útil do mês. O valor acumulado vira a entrada.' },
            { icon: BellRing, t: 'Em dia, pede o financiamento', s: '8 parcelas em dia nos planos de 30%, 6 nos de 40% a 50%. Antecipa o resto e o banco pode financiar de 50% a 70%.' },
          ].map((e, i) => {
            const I = e.icon
            return (
              <div key={e.t} className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-inset)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>{i + 1}</span>
                  <I size={13} style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{e.t}</span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{e.s}</p>
              </div>
            )
          })}
        </div>
        <p className="text-[10.5px] mt-3" style={{ color: 'var(--text-tertiary)' }}>
          Regulamento do Banco Yamaha: o financiamento depende da proposta do banco na hora da compra e de não haver pendência anterior com ele. Tarifas: adesão R$ 50, ativação R$ 19,90, mensalidade R$ 14,90 e 19% sobre cada recarga; cancelar antes do fim do plano custa 19% do saldo.
        </p>
      </div>

      <LiberacredKit hoje={d.hoje} />

      {/* Carteira + mensagens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <h2 className="section-label mb-3">Carteira Liberacred · quem está juntando a entrada</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                  {['Cliente', 'Moto', 'Plano', 'Pagas em dia', 'Apto em', 'Situação'].map(h => (
                    <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cart.map(o => {
                  const st = SITUACAO[o.situacao]
                  const pct = Math.min(100, (o.pagasEmDia / o.plano.aptoApos) * 100)
                  return (
                    <tr key={o.cliente} className="border-t" style={{ borderColor: 'var(--border)', opacity: o.situacao === 'faturado' ? 0.6 : 1 }}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{o.cliente}</p>
                        <p className="text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>{o.loja} · {o.vendedor.split(' ')[0]}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{nomeModelo(o.modelo)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        {o.parcelas}x {fmtBRL(o.plano.parcela)}<span style={{ color: 'var(--text-tertiary)' }}> · {o.entradaPct}%</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: o.situacao === 'atrasada' ? 'var(--danger)' : pct >= 100 ? 'var(--ok)' : 'var(--accent)' }} />
                          </div>
                          <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{Math.min(o.pagasEmDia, o.plano.aptoApos)}/{o.plano.aptoApos}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>
                        {o.situacao === 'faturado' ? fmtData(o.faturado!) : fmtMes(o.aptoEm)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ backgroundColor: st.bg, color: st.c }}>{st.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="section-label mb-3">Mensagem em 1 clique</h2>
          {exAp && <Mensagem titulo="No mês em que fica apto" destaque texto={d.mensagemApto(exAp.cliente.split(' ')[0], nomeModelo(exAp.modelo), exAp.pagasEmDia)} />}
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>O sistema avisa o vendedor no mês em que cada cliente da carteira pode pedir o financiamento.</p>
        </section>
      </div>

      {/* Tabela oficial */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <h2 className="section-label">Tabela oficial Liberacred · parcela da entrada</h2>
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Simulador do Banco Yamaha, consultado em {LIBERACRED_CONSULTA}</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                <th className="px-4 py-3 font-semibold">Moto</th>
                <th className="px-4 py-3 font-semibold text-right">Valor</th>
                {COLUNAS.map(col => <th key={col.rotulo} className="px-4 py-3 font-semibold text-right whitespace-nowrap">{col.rotulo}</th>)}
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Entrada juntada (30%)</th>
              </tr>
            </thead>
            <tbody>
              {liberacredTabela.map(m => {
                const p30 = m.planos.find(p => p.entradaPct === 30)!
                return (
                  <tr key={m.modelo} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{nomeModelo(m.modelo)}</td>
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{fmtBRL(m.valor)}</td>
                    {COLUNAS.map((col, i) => {
                      const p = m.planos.find(x => x.parcelas === col.parcelas && x.entradaPct === col.entradaPct)
                      return <td key={col.rotulo} className="px-4 py-2 text-right tabular-nums" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: i === 0 ? 700 : 400 }}>{p ? fmtBRL2(p.parcela) : '—'}</td>
                    })}
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmtBRL(p30.acumulado)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Também há planos curtos: 8x com 40% de entrada (pode financiar depois de 4 parcelas) e 6x com 50% (depois de 3). Motores de popa seguem a mesma regra.
        </p>
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
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{nomeCurto(a.cliente)}</p>
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
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{nomeCurto(q.cliente)}</p>
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

function Mensagem({ titulo, texto, destaque }: { titulo: string; texto: string; destaque?: boolean }) {
  return (
    <div className="card card-pad" style={{ borderColor: destaque ? '#25D366' : undefined, borderWidth: destaque ? 1.5 : undefined }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D3661A' }}>
          <MessageCircle size={12} style={{ color: '#25D366' }} />
        </div>
        <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{titulo}</h3>
      </div>
      <div className="rounded-xl p-3 text-[11.5px] leading-relaxed" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>{texto}</div>
    </div>
  )
}
