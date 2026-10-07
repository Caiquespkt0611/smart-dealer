export const dynamic = 'force-dynamic'

import { ArrowRight, CalendarClock, ExternalLink, EyeOff, Heart } from 'lucide-react'
import { getLeituraConcorrencia, leituraAtrasada, proximaLeitura, type Concorrente } from '@/lib/concorrencia-data'

export const metadata = { title: 'Concorrência · Smart Dealer' }

const TZ = { timeZone: 'America/Sao_Paulo' } as const
const quando = (d: Date) =>
  `${d.toLocaleDateString('pt-BR', { ...TZ, weekday: 'long' })}, ${d.toLocaleDateString('pt-BR', { ...TZ, day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { ...TZ, hour: '2-digit', minute: '2-digit' }).replace(':00', 'h').replace(':', 'h').replace(/^0/, '')}`
const diaMes = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7)
const mil = (n: number | null) => (n == null ? '—' : n >= 10000 ? `${(n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : n.toLocaleString('pt-BR'))

const NIVEL = ['', 'Sem ação comercial', 'Vitrine sem gatilho', 'Condição sem desconto', 'Brinde ou fim de linha', 'Desconto com urgência']
const corNivel = (n: number) => (n >= 5 ? 'var(--danger)' : n === 4 ? 'var(--warn)' : n === 3 ? 'var(--yh-blue)' : 'var(--text-tertiary)')
const corMovimento: Record<string, string> = {
  'NOVO ATAQUE': 'var(--danger)', INTENSIFICOU: 'var(--danger)', 'TROCOU DE TÁTICA': 'var(--warn)', RECUOU: 'var(--ok)',
}
const rotulo = 'text-[12px] font-semibold uppercase tracking-wider'

function Nivel({ n, legenda = true }: { n: number; legenda?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`Nível ${n} de 5: ${NIVEL[n]}`}>
      <span className="flex gap-[3px]">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i} className="h-2 w-4 rounded-full" style={{ background: i <= n ? corNivel(n) : 'var(--border)' }} />
        ))}
      </span>
      {legenda && <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{NIVEL[n]}</span>}
    </span>
  )
}

function Movimento({ m }: { m: string }) {
  return <span className="yh-chip whitespace-nowrap" style={{ color: corMovimento[m] ?? 'var(--text-secondary)' }}>{m}</span>
}

function Ficha({ c }: { c: Concorrente }) {
  const posts = (c.posts ?? []).filter(p => p.imagem)
  return (
    <article id={c.arroba} className="scroll-mt-28 rounded-2xl p-6 md:p-8 space-y-6" style={{ background: 'var(--bg-elevated)' }}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <a href={`https://www.instagram.com/${c.arroba}/`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[17px] font-semibold hover:underline" style={{ color: 'var(--text-primary)' }}>
            @{c.arroba} <ExternalLink size={14} />
          </a>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {c.nome} · {c.cidade} · {c.marca} · {mil(c.seguidores)} seguidores
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Nivel n={c.agressividade} />
          <Movimento m={c.movimento} />
        </div>
      </header>

      <p className="yh-display text-[clamp(24px,2.6vw,34px)] font-bold uppercase leading-[1.04] max-w-4xl" style={{ color: 'var(--text-primary)' }}>
        {c.manchete}
      </p>

      {!c.leituraOk && (
        <p className="inline-flex items-center gap-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
          <EyeOff size={15} /> {c.anunciam[0]}
        </p>
      )}

      {/* o que eles postaram: a própria arte */}
      {posts.length > 0 && (
        <div>
          <p className={`${rotulo} mb-3`} style={{ color: 'var(--text-tertiary)' }}>O que eles postaram</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
            {posts.map(p => (
              <a key={p.url} href={p.url} target="_blank" rel="noreferrer" className="snap-start shrink-0 w-[180px] md:w-[200px] group">
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imagem} alt={p.legenda?.slice(0, 120) ?? `Post de @${c.arroba}`} loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-[1.02]" style={{ transition: 'transform 200ms ease-out' }} />
                </div>
                <p className="mt-2 flex items-center justify-between text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{diaMes(p.data)}</span>
                  {p.curtidas != null && <span className="inline-flex items-center gap-1"><Heart size={11} /> {p.curtidas}</span>}
                </p>
                {p.legenda && <p className="mt-1 text-[12px] leading-snug line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{p.legenda}</p>}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-main)' }}>
          <p className={rotulo} style={{ color: 'var(--text-tertiary)' }}>O que eles estão fazendo</p>
          <p className="mt-2 text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{c.elesEmpurram}</p>
          {c.mudou && <p className="mt-2 text-[14px] leading-snug" style={{ color: 'var(--text-secondary)' }}><b>Mudou:</b> {c.mudou}</p>}
          {posts.length === 0 && c.leituraOk && (
            <ul className="mt-3 space-y-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              {c.anunciam.map(a => <li key={a}>· {a}</li>)}
            </ul>
          )}
        </div>
        <div className="rounded-xl p-5 border-2" style={{ background: 'var(--bg-main)', borderColor: 'var(--yh-blue)' }}>
          <p className={rotulo} style={{ color: 'var(--yh-blue)' }}>Como a Nippon responde</p>
          <p className="mt-2 yh-display text-[22px] font-bold uppercase leading-tight" style={{ color: 'var(--text-primary)' }}>{c.responderCom}</p>
          <p className="mt-1 text-[14px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{c.argumento}</p>
          <ul className="mt-3 space-y-1.5 text-[14px] leading-snug" style={{ color: 'var(--text-primary)' }}>
            {c.comoResponder.map(a => (
              <li key={a} className="flex gap-2"><ArrowRight size={15} className="mt-[3px] shrink-0" style={{ color: 'var(--yh-blue)' }} />{a}</li>
            ))}
          </ul>
        </div>
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

  return (
    <div className="space-y-14 pb-24">
      {/* 1. a semana numa olhada */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1>Concorrência <span className="text-[var(--text-tertiary)]">da semana</span></h1>
          <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]" style={{ color: atrasada ? 'var(--warn)' : 'var(--text-tertiary)' }}>
            <CalendarClock size={14} />
            Instagram lido {quando(lido)} · {lidos} de {leitura.concorrentes.length} perfis ·{' '}
            {atrasada ? `a leitura de ${quando(proxima)} não chegou` : `próxima leitura ${quando(proxima)}`}
          </p>
        </div>

        <section className="rounded-2xl p-7 md:p-10 text-white" style={{ background: '#070633' }}>
          <p className="yh-display text-[clamp(28px,3.6vw,46px)] font-bold uppercase leading-[1.02] max-w-4xl">{leitura.veredito.titulo}</p>
          <p className="mt-4 text-[16px] leading-relaxed text-white/80 max-w-3xl">{leitura.veredito.texto}</p>
        </section>

        <section>
          <h2 className="yh-title text-[clamp(26px,2.8vw,36px)] mb-4">O que fazer <span className="yh-mute">esta semana</span></h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {leitura.acoes.map((a, i) => (
              <li key={a.titulo} className="rounded-2xl p-5 flex gap-4" style={{ background: 'var(--bg-elevated)' }}>
                <span className="yh-display text-[34px] font-bold leading-none tabular-nums" style={{ color: 'var(--yh-blue)' }}>{i + 1}</span>
                <div>
                  <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{a.titulo}</p>
                  <p className="mt-1 text-[14px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{a.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* 2. o placar: um concorrente por linha */}
      <section>
        <h2 className="yh-title text-[clamp(26px,2.8vw,36px)] mb-1">Placar <span className="yh-mute">da praça</span></h2>
        <p className="text-[14px] mb-4" style={{ color: 'var(--text-secondary)' }}>Do mais agressivo para o menos. Clique para ver as artes e a resposta.</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <div className="hidden md:grid grid-cols-[1.3fr_0.9fr_1.8fr_1fr] gap-4 px-5 py-3 border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
            {['Concorrente', 'Nível', 'O que estão fazendo', 'Nippon responde com'].map(h => <span key={h} className={rotulo}>{h}</span>)}
          </div>
          {ordem.map(c => (
            <a key={c.arroba} href={c.situacao === 'ativo' ? `#${c.arroba}` : `https://www.instagram.com/${c.arroba}/`}
              {...(c.situacao === 'ativo' ? {} : { target: '_blank', rel: 'noreferrer' })}
              className="grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr_1.8fr_1fr] gap-x-4 gap-y-1.5 px-5 py-4 border-b last:border-b-0 hover:bg-[var(--bg-main)]"
              style={{ borderColor: 'var(--border)', transition: 'background-color 150ms ease-out' }}>
              <span>
                <span className="block text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>@{c.arroba}</span>
                <span className="block text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{c.cidade} · {c.marca}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <Nivel n={c.agressividade} legenda={false} />
                {c.movimento !== 'MANTEVE' && <Movimento m={c.movimento} />}
              </span>
              <span className="text-[14px] leading-snug" style={{ color: c.situacao === 'ativo' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                {c.situacao === 'ativo' ? c.elesEmpurram : c.manchete}
                {!c.leituraOk && <span className="block text-[12px]" style={{ color: 'var(--text-tertiary)' }}>perfil não abriu nesta semana</span>}
              </span>
              <span className="yh-display text-[17px] font-bold uppercase" style={{ color: c.situacao === 'ativo' ? 'var(--yh-blue)' : 'var(--text-tertiary)' }}>
                {c.situacao === 'ativo' ? c.responderCom : '—'}
              </span>
            </a>
          ))}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          {[1, 2, 3, 4, 5].map(n => <span key={n} className="inline-flex items-center gap-1.5"><Nivel n={n} legenda={false} /> {NIVEL[n]}</span>)}
        </p>
      </section>

      {/* 3. concorrente por concorrente */}
      <section>
        <h2 className="yh-title text-[clamp(26px,2.8vw,36px)] mb-4">Concorrente <span className="yh-mute">por concorrente</span></h2>
        <div className="space-y-5">
          {ativos.map(c => <Ficha key={c.arroba} c={c} />)}
        </div>
        {fora.length > 0 && (
          <p className="mt-5 text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
            Sem oferta nesta semana: {fora.map(c => `@${c.arroba} (${c.situacao === 'parado' ? 'perfil parado' : c.manchete.toLowerCase().replace(/\.$/, '')})`).join(' · ')}.
          </p>
        )}
      </section>
    </div>
  )
}
