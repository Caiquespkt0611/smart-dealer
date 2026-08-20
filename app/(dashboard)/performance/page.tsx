import { getPerformanceAnalise, gerarAcoesPDCA } from '@/lib/performance'
import { getCampanhaAnalise } from '@/lib/campanha-vendas'
import { getVouchersAnalise } from '@/lib/campanha-vouchers'
import { PdcaButton } from '@/components/performance/PdcaButton'
import { DeckButton } from '@/components/performance/DeckButton'
import {
  TrendingUp, TrendingDown, Target, MapPin, ShieldAlert,
  Activity, Scale,
} from 'lucide-react'

export const metadata = { title: 'Performance · Smart Dealer' }
export const dynamic = 'force-dynamic'

const fmtSinal = (v: number, casas = 1) => `${v >= 0 ? '+' : ''}${v.toFixed(casas).replace('.', ',')}`
const fmt = (v: number, casas = 0) => v.toFixed(casas).replace('.', ',')

export default async function PerformancePage() {
  const a = await getPerformanceAnalise()
  const d = a.dash
  const acoes = gerarAcoesPDCA(a)
  const [campanha, vouchers] = await Promise.all([
    getCampanhaAnalise().catch(() => null),
    getVouchersAnalise().catch(() => null),
  ])
  const hoje = new Date()
  const dataStr = `${String(hoje.getDate()).padStart(2, '0')}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${hoje.getFullYear()}`
  const dataBr = dataStr.replace(/-/g, '/')
  const subtitulo = `Base: varejo e emplacamento até ${a.mesFechadoNome} fechado · carta de ${d.nomeMesCorrente} · `
    + `mercado e share das áreas ${a.share.areas.join(' + ')} · comparação vs ${a.baseNome}`

  const perdendo = a.segmentos.filter(s => s.veredito !== 'ok')
  const cor = (v: number) => v >= 0 ? 'var(--ok)' : 'var(--danger)'

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Performance do Concessionário
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Nippon Motos · {a.mesFechadoNome} fechado + carta de {d.nomeMesCorrente} · o mercado explicando o varejo
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PdcaButton acoes={acoes} subtitulo={subtitulo} arquivo={`PDCA_NIPPON-MOTOS_${dataStr}`} />
          <DeckButton dados={{ analise: a, acoes, campanha, vouchers, dataStr: dataBr }} />
          {/* Motor oficial do Performance Concessionário, verbatim, com a planilha viva */}
          <a
            href="/pc/estudio.html"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--yamaha-blue, #003087)', color: '#fff' }}
          >
            Estúdio do Consultor — deck &amp; PDCA oficiais ↗
          </a>
        </div>
      </div>

      {/* ── O MÊS: carta e ritmo ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label={`Carta de ${d.nomeMesCorrente}`} valor={`${d.meta}`} unidade="motos"
          sub={d.modo === 'largada' ? `${d.nomeMesFechado} fechou com ${d.fechamentoAnterior}` : `vendidas ${d.vendasMes} até agora`} icone={Target} />
        <Kpi label={d.modo === 'largada' ? 'Salto que a carta pede' : 'Projeção de fechamento'}
          valor={d.modo === 'largada' ? fmtSinal(d.saltoCarta, 0) : `${d.projecao}`} unidade="motos"
          sub={d.modo === 'largada' ? `${fmt(d.ritmoNecessario, 1)} un/dia · ${d.diasUteisMes} úteis` : `${d.pctAtingimento}% da carta`}
          icone={Activity} destaque={d.modo === 'largada' ? (d.saltoCarta > 0 ? 'var(--warn)' : 'var(--ok)') : undefined} />
        <Kpi label={`Share Yamaha — ${a.mesFechadoNome}`} valor={`${fmt(a.shareAtual, 1)}%`}
          sub={`${a.baseNome}: ${fmt(a.shareBase, 1)}% (${fmtSinal(a.shareAtual - a.shareBase)}pp)`}
          icone={a.shareAtual >= a.shareBase ? TrendingUp : TrendingDown}
          destaque={cor(a.shareAtual - a.shareBase)} />
        <Kpi label="Ranking regional" valor={`${d.rankingPos}º`} unidade={`de ${d.rankingTotal}`}
          sub={d.modo === 'largada' ? `${d.nomeMesFechado} vs carta de ${d.nomeMesCorrente}` : 'projeção vs carta'} icone={Scale} />
      </div>

      {/* ── DECOMPOSIÇÃO: efeito mercado × efeito share ── */}
      <div className="card card-pad">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Por que o volume variou — {a.mesFechadoNome} vs {a.baseNome}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Decomp label="Variação real (Yamaha na área)" valor={a.varReal} sufixo=" un" />
          <Decomp label="Efeito mercado (o bolo mudou)" valor={a.efeitoMercado} sufixo=" un" fraco={a.dominante !== 'mercado'} />
          <Decomp label="Efeito share (a fatia mudou)" valor={a.efeitoShare} sufixo=" un" fraco={a.dominante !== 'share'} />
        </div>
        <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
          Mercado da área: {fmt(a.mercadoBase)} → {fmt(a.mercadoAtual)} un/mês. {a.veredito}
        </p>
      </div>

      {/* ── SEGMENTOS ── */}
      <section>
        <h2 className="section-label mb-3">Segmentos — onde o volume está variando (vs {a.baseNome})</h2>
        {a.foraAtuacao.qtd > 0 && (
          <p className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Análise restrita aos segmentos onde a Yamaha tem produto. {a.foraAtuacao.qtd} segmentos sem moto no
            catálogo (~{String(a.foraAtuacao.unMes).replace('.', ',')} un/mês do mercado) ficam fora da análise e do PDCA.
          </p>
        )}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Segmento', 'Mercado/mês', 'Share (base → atual)', 'Impacto', 'Leitura'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs uppercase tracking-wider font-medium ${i === 0 || i === 4 ? 'text-left' : 'text-right'} ${i > 0 && i < 4 ? 'hidden sm:table-cell' : ''}`}
                    style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.segmentos.slice(0, 8).map(s => (
                <tr key={s.segmento} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.rotulo}</td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {s.mktMes} <span style={{ color: 'var(--text-tertiary)' }}>({fmtSinal(s.mktVar, 0)}%)</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {fmt(s.shareBase, 1)}% → <b style={{ color: cor(s.shareDelta) }}>{fmt(s.share, 1)}%</b>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: cor(s.impacto) }}>
                    {fmtSinal(s.impacto)} un/mês
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {s.veredito === 'disputa' && <span style={{ color: 'var(--danger)' }}>Perda de disputa{s.hondaDelta > 0.3 ? ` — Honda +${fmt(s.hondaDelta, 1)}pp` : ''}</span>}
                    {s.veredito === 'demanda' && <span style={{ color: 'var(--warn)' }}>O bolo encolheu — defender conversão</span>}
                    {s.veredito === 'ok' && <span style={{ color: 'var(--text-tertiary)' }}>Estável</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CIDADES + INVASÃO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <MapPin size={14} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Espaço a ocupar — cidades abaixo do share do território ({fmt(a.shareAtual, 1)}%)
            </h2>
          </div>
          {a.cidades.length === 0 ? (
            <p className="px-4 py-6 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Nenhuma cidade relevante abaixo do share do território.
            </p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {a.cidades.slice(0, 6).map(c => (
                  <tr key={c.cidade} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{c.cidade}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{fmt(c.mktMes)} un/mês · share {fmt(c.share, 1)}%</p>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: 'var(--warn)' }}>
                      +{fmt(c.gap)} un/mês
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <ShieldAlert size={14} style={{ color: a.invasaoPct >= 25 ? 'var(--danger)' : 'var(--text-tertiary)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Invasão — Yamaha de terceiros no território
            </h2>
          </div>
          <div className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Das <b>{fmt(a.yamNoTerrMes)} un/mês</b> de Yamaha na área, a Nippon emplaca <b>{fmt(a.nipponMes)}</b> —{' '}
            <b style={{ color: a.invasaoPct >= 25 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {fmt(a.invasaoMes)} un/mês ({a.invasaoPct}%)
            </b> são de terceiros.
          </div>
          <table className="w-full text-sm">
            <tbody>
              {a.invasores.map(i => (
                <tr key={i.cnpj} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{i.nome ?? `CNPJ ${i.cnpj}`}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{i.cidade}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: 'var(--text-primary)' }}>
                    {fmt(i.qtdMes, 1)} un/mês
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PRÉVIA DO PDCA ── */}
      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="section-label">Plano de ação sugerido — {acoes.length} ações medidas nos números</h2>
          <PdcaButton acoes={acoes} subtitulo={subtitulo} arquivo={`PDCA_NIPPON-MOTOS_${dataStr}`} />
        </div>
        <div className="space-y-3">
          {acoes.map((ac, i) => (
            <div key={i} className="card card-pad">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{i + 1}. {ac.acao}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{
                  backgroundColor: ac.prio === 'Alta' ? 'var(--danger-bg)' : ac.prio === 'Média' ? 'var(--warn-bg)' : 'var(--bg-inset)',
                  color: ac.prio === 'Alta' ? 'var(--danger)' : ac.prio === 'Média' ? 'var(--warn)' : 'var(--text-secondary)',
                }}>{ac.prio}</span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{ac.porque}</p>
              <ul className="mt-2 space-y-1">
                {ac.como.map((c, j) => (
                  <li key={j} className="text-xs flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent)' }}>•</span>{c}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] mt-2 pt-2" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
                📐 {ac.indicador}
              </p>
            </div>
          ))}
          {acoes.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Nada em alerta neste recorte.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function Kpi({ label, valor, unidade, sub, icone: Icon, destaque }: {
  label: string; valor: string; unidade?: string; sub: string
  icone: React.ElementType; destaque?: string
}) {
  return (
    <div className="card card-pad flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <Icon size={15} style={{ color: destaque ?? 'var(--accent)' }} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums" style={{ color: destaque ?? 'var(--text-primary)' }}>{valor}</span>
          {unidade && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{unidade}</span>}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </div>
  )
}

function Decomp({ label, valor, sufixo, fraco }: { label: string; valor: number; sufixo: string; fraco?: boolean }) {
  const cor = valor >= 0 ? 'var(--ok)' : 'var(--danger)'
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-inset)', opacity: fraco ? 0.65 : 1 }}>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-xl font-bold tabular-nums mt-1" style={{ color: cor }}>
        {valor >= 0 ? '+' : ''}{valor.toFixed(1).replace('.', ',')}{sufixo}
      </p>
    </div>
  )
}
