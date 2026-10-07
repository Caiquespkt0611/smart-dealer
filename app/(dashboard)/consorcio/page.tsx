import { consorcioData, calcularConsorcio, nomeModelo, type SituacaoCota } from '@/lib/consorcio-data'
import { passosConsorcio, vantagensConsorcio, vendeMais, caminhos, planosConsorcio, simularConsorcio, CONSORCIO_CONSULTA } from '@/lib/consorcio-yamaha'
import { liberacredTabela } from '@/lib/liberacred-tabela'
import ConsorcioKit from '@/components/consorcio/ConsorcioKit'
import {
  PiggyBank, Award, Trophy, Gavel, AlertTriangle, Wallet, MessageCircle, TrendingUp, Route,
  FileSignature, CalendarClock, Bike,
} from 'lucide-react'

export const metadata = { title: 'Consórcio · Smart Dealer' }

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmtBRL2 = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (iso: string) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a.slice(2)}` }
const fmtDia = (iso: string) => { const [, m, d] = iso.split('-'); return `${d}/${m}` }
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`

const SITUACAO: Record<SituacaoCota, { label: string; c: string; bg: string }> = {
  contemplado: { label: 'Contemplado · chamar', c: 'var(--ok)',     bg: 'var(--ok-bg)' },
  lance:       { label: 'Lance sugerido',       c: 'var(--accent)', bg: 'var(--accent-bg)' },
  emdia:       { label: 'Em dia',               c: 'var(--text-secondary)', bg: 'var(--bg-inset)' },
  atrasada:    { label: 'Em atraso',            c: 'var(--danger)', bg: 'var(--danger-bg)' },
  faturado:    { label: 'Faturado aqui',        c: 'var(--text-secondary)', bg: 'var(--bg-inset)' },
}

export default function ConsorcioPage() {
  const d = consorcioData
  const c = calcularConsorcio()
  const ordem: SituacaoCota[] = ['contemplado', 'lance', 'atrasada', 'emdia', 'faturado']
  const cart = [...c.cart].sort((a, b) => ordem.indexOf(a.situacao) - ordem.indexOf(b.situacao) || b.pagas - a.pagas)
  const exCont = c.contemplados[0]
  const exLance = c.lances[0]
  const exAtraso = c.atrasadas[0]
  const mega = planosConsorcio.find(p => p.id === 'mega')!
  const maxV = Math.max(...d.serie.map(m => m.vendidas))
  const bq = d.bonusQuality.trimestreAtual

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Consórcio Yamaha · Oportunidades</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.grupo} · {d.referencia} · sem entrada e sem juros: o cliente que não tinha como comprar entra hoje
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {d.fonte}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Trophy} accent="var(--ok)" label="Contemplados a faturar" value={`${c.contemplados.length}`} sub={`${fmtBRL(c.creditoContemplado)} em crédito liberado`} />
        <Kpi icon={Gavel} accent="var(--accent)" label="Lances para a assembleia" value={`${c.lances.length}`} sub={`assembleia de ${fmtDia(d.proximaAssembleia)}`} />
        <Kpi icon={AlertTriangle} accent="var(--danger)" label="Cotas em atraso" value={`${c.atrasadas.length}`} sub="3 atrasos e a cota é cancelada" />
        <Kpi icon={Wallet} accent="var(--accent)" label="Carteira ativa" value={`${d.carteiraTotal.cotasAtivas} cotas`} sub={`${pct(c.conversao)} dos contemplados faturaram aqui`} />
      </div>

      {/* Como funciona */}
      <div className="card card-pad" data-cons="como-funciona">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <PiggyBank size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Consórcio Yamaha: o consórcio da própria fábrica</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Dos {d.recusadosSemEntrada} recusados no CDC do trimestre que não tinham como juntar a entrada, {d.ofertadosConsorcio} receberam a proposta do consórcio e {d.aderiramConsorcio} aderiram ({c.adesao}%). Regras conferidas em {CONSORCIO_CONSULTA} no site oficial e no contrato.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {passosConsorcio.map((e, i) => {
            const I = [FileSignature, Wallet, CalendarClock, Bike][i]
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
        <div className="flex flex-wrap gap-1.5 mt-3">
          {vantagensConsorcio.map(v => (
            <span key={v} className="text-[10.5px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--ok-bg)', color: 'var(--ok)' }}>✓ {v}</span>
          ))}
        </div>
      </div>

      {/* Como ajuda a vender mais + qual caminho */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" data-cons="vende-mais">
        <div className="card card-pad lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} style={{ color: 'var(--ok)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Como o consórcio faz a loja vender mais</h2>
          </div>
          <div className="space-y-2.5">
            {vendeMais.map((v, i) => (
              <div key={v.t} className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ backgroundColor: 'var(--ok)', color: '#fff' }}>{i + 1}</span>
                <div className="text-[11.5px] leading-relaxed">
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.t}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>{v.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad lg:col-span-2" data-cons="caminhos">
          <div className="flex items-center gap-2 mb-3">
            <Route size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Qual caminho oferecer</h2>
          </div>
          <div className="space-y-2">
            {caminhos.map(k => {
              const cons = k.oferta.startsWith('Consórcio')
              return (
                <div key={k.oferta} className="rounded-xl p-3" style={{ backgroundColor: cons ? 'var(--accent-bg)' : 'var(--bg-inset)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{k.quando}</p>
                  <p className="text-sm font-bold" style={{ color: cons ? 'var(--accent)' : 'var(--text-primary)' }}>{k.oferta}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{k.obs}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ConsorcioKit />

      {/* Carteira + mensagens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2" data-cons="carteira">
          <h2 className="section-label mb-3">Carteira de cotas · quem chamar agora</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                  {['Cliente', 'Moto', 'Plano', 'Pagas', 'Próximo passo', 'Situação'].map(h => (
                    <th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cart.map(o => {
                  const st = SITUACAO[o.situacao]
                  const prog = Math.min(100, (o.pagas / o.meses) * 100)
                  const passo =
                    o.situacao === 'contemplado' ? `faturar · contemplado ${fmtDia(o.contemplado!)}` :
                    o.situacao === 'lance' ? `lance 25% · ${fmtBRL(o.sim.lance25)}` :
                    o.situacao === 'atrasada' ? `${o.atrasos} parcela${o.atrasos! > 1 ? 's' : ''} em aberto` :
                    o.situacao === 'faturado' ? `moto entregue ${fmtData(o.faturado!)}` :
                    `concorre em ${fmtDia(d.proximaAssembleia)}`
                  return (
                    <tr key={o.cliente} className="border-t" style={{ borderColor: 'var(--border)', opacity: o.situacao === 'faturado' ? 0.6 : 1 }}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{o.cliente}</p>
                        <p className="text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>{o.loja} · {o.vendedor.split(' ')[0]}</p>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{nomeModelo(o.modelo)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        {o.meses}x {fmtBRL(o.sim.parcela)}<span style={{ color: 'var(--text-tertiary)' }}> · {o.planoNome.replace('Contempla + ', '')}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                            <div className="h-full rounded-full" style={{ width: `${prog}%`, backgroundColor: o.situacao === 'atrasada' ? 'var(--danger)' : 'var(--accent)' }} />
                          </div>
                          <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>{o.pagas}/{o.meses}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap font-medium" style={{ color: 'var(--text-primary)' }}>{passo}</td>
                      <td className="px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded-full font-semibold whitespace-nowrap" style={{ backgroundColor: st.bg, color: st.c }}>{st.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            O crédito do contemplado vale em qualquer loja: o sistema avisa o vendedor no dia do resultado da assembleia para a moto sair daqui.
          </p>
        </section>

        <section data-cons="mensagens">
          <h2 className="section-label mb-3">Mensagem em 1 clique</h2>
          <div className="space-y-3">
            {exCont && <Mensagem titulo="Contemplado: a moto sai aqui" destaque texto={d.mensagemContemplado(exCont.cliente.split(' ')[0], nomeModelo(exCont.modelo))} />}
            {exLance && <Mensagem titulo="Antes da assembleia: o lance" texto={d.mensagemLance(exLance.cliente.split(' ')[0], nomeModelo(exLance.modelo), fmtBRL(exLance.sim.lance25), fmtDia(d.proximaAssembleia))} />}
            {exAtraso && <Mensagem titulo="Parcela em aberto: não perder a cota" texto={d.mensagemAtraso(exAtraso.cliente.split(' ')[0])} />}
          </div>
        </section>
      </div>

      {/* Tabela oficial */}
      <section data-cons="tabela">
        <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
          <h2 className="section-label">Tabela Consórcio Yamaha · {mega.nome} · parcela mensal</h2>
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Taxas do contrato Série T, conferidas em {CONSORCIO_CONSULTA}</span>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                <th className="px-4 py-3 font-semibold">Moto</th>
                <th className="px-4 py-3 font-semibold text-right">Crédito</th>
                {mega.prazos.map(p => <th key={p.meses} className="px-4 py-3 font-semibold text-right whitespace-nowrap">{p.meses}x</th>)}
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Lance fixo 25% (60x)</th>
              </tr>
            </thead>
            <tbody>
              {liberacredTabela.map(m => {
                const p60 = mega.prazos.find(p => p.meses === 60)!
                return (
                  <tr key={m.modelo} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-2 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{nomeModelo(m.modelo)}</td>
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{fmtBRL(m.valor)}</td>
                    {mega.prazos.map(p => (
                      <td key={p.meses} className="px-4 py-2 text-right tabular-nums" style={{ color: p.meses === 60 ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: p.meses === 60 ? 700 : 400 }}>
                        {fmtBRL2(simularConsorcio(m.valor, p).parcela)}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmtBRL(simularConsorcio(m.valor, p60).lance25)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Parcela estimada com fundo comum, taxa de administração e seguro obrigatório, sobre o valor de referência da moto. O Contempla + Master tem taxa menor (parcela mais baixa) e menos contemplações por lance fixo. Valor oficial na proposta da Yamaha Consórcio.
        </p>
      </section>

      {/* Vendas de cotas + Bônus Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Cotas vendidas por mês</h2>
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

        <div className="card card-pad" style={{ borderLeft: '4px solid var(--ok)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} style={{ color: 'var(--ok)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Bônus Quality: a carteira saudável paga</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>{d.bonusQuality.regra}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Resumo label="Crédito comercializado (tri)" valor={fmtBRL(bq.creditoComercializado)} />
            <Resumo label="Bônus estimado" valor={fmtBRL(bq.bonusEstimado)} cor="var(--ok)" sub={bq.elegivel ? 'critérios atingidos ✓' : 'em risco'} />
            <Resumo label="Adimplência" valor={pct(bq.adimplencia)} cor={bq.adimplencia >= 90 ? 'var(--ok)' : 'var(--danger)'} sub="critério: ≥ 90%" />
            <Resumo label="Cancelamento da safra" valor={pct(bq.cancelamento)} cor={bq.cancelamento <= 12 ? 'var(--ok)' : 'var(--danger)'} sub="critério: ≤ 12%" />
          </div>
          <p className="text-[11px] mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
            Cada cota em atraso recuperada protege o cliente e o bônus: o sistema manda a 2ª via antes de a cota parar de concorrer.
          </p>
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

function Resumo({ label, valor, sub, cor }: { label: string; valor: string; sub?: string; cor?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="tabular-nums font-bold text-lg" style={{ color: cor ?? 'var(--text-primary)' }}>{valor}</p>
      {sub && <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
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
