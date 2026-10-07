export const dynamic = 'force-dynamic'

import { ArrowRight, CalendarClock, ExternalLink, EyeOff } from 'lucide-react'
import { getLeituraConcorrencia, leituraAtrasada, proximaLeitura, type Concorrente } from '@/lib/concorrencia-data'

export const metadata = { title: 'Concorrência · Smart Dealer' }

const TZ = { timeZone: 'America/Sao_Paulo' } as const
const quando = (d: Date) =>
  `${d.toLocaleDateString('pt-BR', { ...TZ, weekday: 'long' })}, ${d.toLocaleDateString('pt-BR', { ...TZ, day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { ...TZ, hour: '2-digit', minute: '2-digit' }).replace(':00', 'h').replace(':', 'h').replace(/^0/, '')}`
const mil = (n: number | null) => (n == null ? '—' : n >= 10000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : n.toLocaleString('pt-BR'))

const NIVEL = ['', 'Sem ação comercial', 'Vitrine sem gatilho', 'Condição sem desconto', 'Brinde ou fim de linha', 'Desconto com urgência']
const corNivel = (n: number) => (n >= 5 ? 'var(--danger)' : n === 4 ? 'var(--warn)' : n === 3 ? 'var(--yh-blue)' : 'var(--text-tertiary)')
const corMovimento: Record<string, string> = {
  'NOVO ATAQUE': 'var(--danger)', INTENSIFICOU: 'var(--danger)', 'TROCOU DE TÁTICA': 'var(--warn)', RECUOU: 'var(--ok)',
}

function Agressividade({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Agressividade ${n} de 5`}>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className="h-2 w-5 rounded-full" style={{ background: i <= n ? corNivel(n) : 'var(--border)' }} />
        ))}
      </div>
      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{NIVEL[n]}</span>
    </div>
  )
}

function Ficha({ c }: { c: Concorrente }) {
  return (
    <article className="rounded-2xl p-6 md:p-7 space-y-5" style={{ background: 'var(--bg-elevated)' }}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <a href={`https://www.instagram.com/${c.arroba}/`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold hover:underline" style={{ color: 'var(--text-primary)' }}>
            @{c.arroba} <ExternalLink size={13} />
          </a>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {c.nome} · {c.cidade} · {c.marca} · {mil(c.seguidores)} seguidores
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!c.leituraOk && (
            <span className="yh-chip inline-flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <EyeOff size={12} /> Perfil não abriu, vale a leitura anterior
            </span>
          )}
          <span className="yh-chip" style={{ color: corMovimento[c.movimento] ?? 'var(--text-secondary)' }}>{c.movimento}</span>
        </div>
      </header>

      <div className="space-y-3">
        <Agressividade n={c.agressividade} />
        <p className="yh-display text-[clamp(22px,2.4vw,30px)] font-bold uppercase leading-[1.05]" style={{ color: 'var(--text-primary)' }}>
          {c.manchete}
        </p>
        {c.mudou && <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}><b>O que mudou:</b> {c.mudou}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>O que eles anunciam</p>
          <ul className="space-y-1.5 text-[14px] leading-snug" style={{ color: 'var(--text-primary)' }}>
            {c.anunciam.map(a => <li key={a} className="pl-3 border-l-2" style={{ borderColor: 'var(--border-strong)' }}>{a}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Como responder</p>
          <ul className="space-y-1.5 text-[14px] leading-snug" style={{ color: 'var(--text-primary)' }}>
            {c.comoResponder.map(a => <li key={a} className="pl-3 border-l-2" style={{ borderColor: 'var(--yh-blue)' }}>{a}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-xl p-4 md:p-5" style={{ background: 'var(--bg-main)' }}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
          <span style={{ color: 'var(--text-tertiary)' }}>Eles empurram</span>
          <b style={{ color: 'var(--text-primary)' }}>{c.elesEmpurram}</b>
          <ArrowRight size={16} style={{ color: 'var(--yh-blue)' }} />
          <span style={{ color: 'var(--text-tertiary)' }}>responda com</span>
          <b className="yh-display uppercase text-[18px]" style={{ color: 'var(--yh-blue)' }}>{c.responderCom}</b>
        </div>
        <p className="mt-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{c.argumento}</p>
      </div>
    </article>
  )
}

export default async function ConcorrenciaPage() {
  let leitura: Awaited<ReturnType<typeof getLeituraConcorrencia>> = null
  try { leitura = await getLeituraConcorrencia() } catch { leitura = null }

  if (!leitura) {
    return (
      <div className="space-y-4 pb-24">
        <h1>Concorrência <span className="text-[var(--text-tertiary)]">da semana</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>A primeira leitura ainda não foi feita. Ela sai na segunda às 7h.</p>
      </div>
    )
  }

  const lido = new Date(leitura.lidoEm)
  const proxima = proximaLeitura(leitura.lidoEm)
  const atrasada = leituraAtrasada(leitura.lidoEm)
  const lidos = leitura.concorrentes.filter(c => c.leituraOk).length
  const ordem = [...leitura.concorrentes].sort((a, b) => b.agressividade - a.agressividade)
  const ativos = ordem.filter(c => c.situacao === 'ativo')
  const fora = ordem.filter(c => c.situacao !== 'ativo')
  const mudaram = ordem.filter(c => c.movimento !== 'MANTEVE' && c.movimento !== '1ª LEITURA').length
  const topo = ordem[0]

  return (
    <div className="space-y-12 pb-24">
      <div className="space-y-3">
        <h1>Concorrência <span className="text-[var(--text-tertiary)]">da semana</span></h1>
        <p className="text-slate-600 max-w-3xl">
          Toda segunda às 7h o Smart Dealer lê o Instagram dos concorrentes da Nippon, mede quem está atacando e diz o que fazer na semana.
        </p>
        <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]" style={{ color: atrasada ? 'var(--warn)' : 'var(--text-tertiary)' }}>
          <CalendarClock size={14} />
          Lida {quando(lido)} · {lidos} de {leitura.concorrentes.length} perfis abertos ·{' '}
          {atrasada ? `a leitura de ${quando(proxima)} não chegou` : `próxima leitura ${quando(proxima)}`}
        </p>
      </div>

      {/* o veredito */}
      <section className="rounded-2xl p-7 md:p-10 text-white" style={{ background: '#070633' }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">A leitura da semana</p>
        <p className="yh-display mt-3 text-[clamp(28px,3.6vw,48px)] font-bold uppercase leading-[1.02] max-w-4xl">{leitura.veredito.titulo}</p>
        <p className="mt-4 text-[16px] leading-relaxed text-white/80 max-w-3xl">{leitura.veredito.texto}</p>
        <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/15 pt-6">
          {[
            ['Concorrentes', String(leitura.concorrentes.length)],
            ['Com oferta no ar', String(ativos.length)],
            ['Mudaram de jogada', String(mudaram)],
            ['Mais agressivo', topo ? `@${topo.arroba}` : '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12px] uppercase tracking-wider text-white/55">{k}</dt>
              <dd className="mt-1 yh-display text-[clamp(22px,2.4vw,32px)] font-bold tabular-nums break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* o que fazer */}
      <section>
        <h2 className="yh-title text-[clamp(28px,3vw,40px)] mb-5">O que fazer <span className="yh-mute">esta semana</span></h2>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leitura.acoes.map((a, i) => (
            <li key={a.titulo} className="rounded-2xl p-5 flex gap-4" style={{ background: 'var(--bg-elevated)' }}>
              <span className="yh-display text-[34px] font-bold leading-none tabular-nums" style={{ color: 'var(--yh-blue)' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{a.titulo}</p>
                <p className="mt-1 text-[14px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{a.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* fichas */}
      <section>
        <h2 className="yh-title text-[clamp(28px,3vw,40px)] mb-5">Quem está <span className="yh-mute">atacando</span></h2>
        <div className="space-y-4">
          {ativos.map(c => <Ficha key={c.arroba} c={c} />)}
        </div>
      </section>

      {fora.length > 0 && (
        <section>
          <h2 className="yh-title text-[clamp(24px,2.4vw,32px)] mb-4">No <span className="yh-mute">radar</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fora.map(c => (
              <div key={c.arroba} className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)' }}>
                <a href={`https://www.instagram.com/${c.arroba}/`} target="_blank" rel="noreferrer" className="text-[14px] font-semibold hover:underline" style={{ color: 'var(--text-primary)' }}>@{c.arroba}</a>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{c.cidade} · {c.marca} · {c.situacao === 'parado' ? 'perfil parado' : 'sem oferta'}{c.leituraOk ? '' : ' · não abriu'}</p>
                <p className="mt-3 text-[14px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{c.manchete}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
