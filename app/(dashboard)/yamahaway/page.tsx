import { radarBanca, feedbackRespostas, businessCase, comSemSmartDealer } from '@/lib/yamahaway-data'
import { formulaDiagnostico, resumoDiagnostico, prioridadesBanca, materiaisProntos, type StatusItem } from '@/lib/formula-sucesso'
import { getCampanhaAnalise } from '@/lib/campanha-vendas'
import { RadarBanca } from '@/components/charts/RadarBanca'
import { Trophy, MessageSquare, Scale, CheckCircle2, Clock, ListChecks, Target } from 'lucide-react'

export const metadata = { title: 'Yamahaway 2026 · Smart Dealer' }
export const dynamic = 'force-dynamic'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export default async function YamahawayPage() {
  const campanha = await getCampanhaAnalise().catch(() => null)
  const acimaTop3 = radarBanca.filter(r => r.grupo6 >= r.top3).length

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Yamahaway 2026 — Grupo 6 · Shogun Riders
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Dossiê vivo da banca: onde estamos na Fórmula do Sucesso e como cada cobrança virou entrega
        </p>
      </div>

      {/* ── RADAR + LEITURA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card card-pad flex flex-col" style={{ minHeight: 360 }}>
          <p className="section-label mb-2">1ª banca — notas por critério (escala 1–5)</p>
          <RadarBanca data={[...radarBanca]} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="card card-pad">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={14} style={{ color: 'var(--warn)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Onde o Grupo 6 está</h2>
            </div>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2"><span style={{ color: 'var(--ok)' }}>•</span>
                Acima da <b>média geral em todos os 6 critérios</b> — em Inovação, 4,33 contra 3,10.</li>
              <li className="flex gap-2"><span style={{ color: 'var(--ok)' }}>•</span>
                No nível do <b>Top 3</b>: {acimaTop3} de 6 critérios acima da média dos três melhores grupos
                (Planejamento, Foco no Cliente e Inovação).</li>
              <li className="flex gap-2"><span style={{ color: 'var(--warn)' }}>•</span>
                Maiores distâncias para o Top 3: Trabalho em Equipe (−0,11) e Pesquisa (−0,07) — margens pequenas,
                fecháveis com a execução desta fase.</li>
              <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>
                A banca: <i>“vocês já subiram a expectativa de toda a banca — agora a responsabilidade é grande”</i>.</li>
            </ul>
          </div>
          {campanha && (
            <div className="card card-pad" style={{ borderLeft: '3px solid var(--ok)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-tertiary)' }}>
                Prova de impacto ao vivo
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                O sistema custa <b style={{ color: 'var(--text-primary)' }}>{fmtBRL(businessCase.investimento.mensal)}/mês</b> e
                acompanha em tempo real <b style={{ color: 'var(--ok)' }}>{fmtBRL(campanha.garantido)}</b> já garantidos na
                campanha Campeões de Vendas, com até <b style={{ color: 'var(--ok)' }}>{fmtBRL(campanha.cenarios[2].total)}</b> em
                jogo no trimestre.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── FEEDBACK → RESPOSTA ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="section-label">O que a banca cobrou → o que foi feito</h2>
        </div>
        <div className="space-y-3">
          {feedbackRespostas.map((f, i) => (
            <div key={i} className="card card-pad">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-sm font-semibold flex-1 min-w-[240px]" style={{ color: 'var(--text-primary)' }}>{f.pedido}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1"
                  style={{
                    backgroundColor: f.status === 'entregue' ? 'var(--ok-bg)' : 'var(--warn-bg)',
                    color: f.status === 'entregue' ? 'var(--ok)' : 'var(--warn)',
                  }}>
                  {f.status === 'entregue' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {f.status === 'entregue' ? 'Entregue' : 'Em andamento'}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{f.resposta}</p>
              {f.evidencia && (
                <a href={f.evidencia} className="inline-block text-[11px] font-semibold mt-2" style={{ color: 'var(--accent)' }}>
                  Ver no sistema: {f.evidencia} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── COM / SEM ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="section-label">A operação com e sem o Smart Dealer</h2>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Processo</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--danger)' }}>Sem</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--ok)' }}>Com</th>
                </tr>
              </thead>
              <tbody>
                {comSemSmartDealer.map(r => (
                  <tr key={r.processo} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{r.processo}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{r.sem}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{r.com}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── BUSINESS CASE ── */}
      <section>
        <h2 className="section-label mb-3">Investimento × ganhos mensuráveis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="card card-pad" style={{ borderTop: '3px solid var(--accent)' }}>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Investimento</p>
            <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: 'var(--text-primary)' }}>
              {fmtBRL(businessCase.investimento.mensal)}<span className="text-sm font-normal">/mês</span>
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>{businessCase.investimento.descricao}</p>
          </div>
          {businessCase.ganhos.slice(0, 3).map(g => (
            <div key={g.rotulo} className="card card-pad" style={{ borderTop: '3px solid var(--ok)' }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{g.rotulo}</p>
              <p className="text-base font-bold mt-1" style={{ color: 'var(--ok)' }}>{g.valorAno}</p>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>{g.detalhe}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIORIDADES PARA A 2ª BANCA ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} style={{ color: 'var(--danger)' }} />
          <h2 className="section-label">As 5 ações que mais movem a nota — fazer antes da 2ª banca</h2>
        </div>
        <div className="space-y-2.5">
          {prioridadesBanca.map((p, i) => (
            <div key={i} className="card card-pad flex items-start gap-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{i + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.acao}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  <b style={{ color: 'var(--accent)' }}>{p.criterio}</b> · {p.porque}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MINUTAS PRONTAS (itens que faltavam) ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={14} style={{ color: 'var(--ok)' }} />
          <h2 className="section-label">Minutas prontas — 4 itens em branco já redigidos para o grupo validar</h2>
        </div>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
          É copiar para o slide depois de ajustar. Cada minuta fecha um item do formulário que estava em branco.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card card-pad">
            <MinutaHeader titulo={materiaisProntos.objetivo.titulo} fecha={materiaisProntos.objetivo.fecha} />
            <p className="text-xs italic mb-2" style={{ color: 'var(--text-primary)' }}>“{materiaisProntos.objetivo.texto}”</p>
            <ul className="space-y-1">
              {materiaisProntos.objetivo.metas.map((m, i) => (
                <li key={i} className="text-[11px] flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent)' }}>{i + 1}.</span>{m}
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-pad">
            <MinutaHeader titulo={materiaisProntos.hipoteses.titulo} fecha={materiaisProntos.hipoteses.fecha} />
            <ul className="space-y-1.5">
              {materiaisProntos.hipoteses.itens.map((h, i) => (
                <li key={i} className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{h}</li>
              ))}
            </ul>
          </div>
          <div className="card card-pad">
            <MinutaHeader titulo={materiaisProntos.seteSteps.titulo} fecha={materiaisProntos.seteSteps.fecha} />
            <div className="space-y-1">
              {materiaisProntos.seteSteps.passos.map((p, i) => (
                <div key={i} className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  <b style={{ color: 'var(--text-primary)' }}>{p.passo}</b> — {p.atua}
                </div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <MinutaHeader titulo={materiaisProntos.posicionamento.titulo} fecha={materiaisProntos.posicionamento.fecha} />
            <p className="text-xs italic" style={{ color: 'var(--text-primary)' }}>“{materiaisProntos.posicionamento.texto}”</p>
            <p className="text-[10px] mt-3 pt-2" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
              Ficam de fora (dependem de campo): pesquisa com clientes reais e tabulação de fatores de compra —
              são as ações 1 do bloco acima.
            </p>
          </div>
        </div>
      </section>

      {/* ── FÓRMULA DO SUCESSO: DIAGNÓSTICO ITEM A ITEM ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <ListChecks size={14} style={{ color: 'var(--warn)' }} />
          <h2 className="section-label">Fórmula do Sucesso — diagnóstico item a item do formulário</h2>
        </div>
        <ResumoStatus />
        <div className="space-y-4 mt-3">
          {formulaDiagnostico.map(c => (
            <div key={c.criterio} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-inset)' }}>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{c.criterio}</h3>
                <span className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
                  1ª banca: <b style={{ color: 'var(--accent)' }}>{String(c.nota1aBanca).replace('.', ',')}</b> / 5
                </span>
              </div>
              <div>
                {c.itens.map((it, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-1 lg:grid-cols-[minmax(220px,1.1fr)_1.4fr_1.4fr] gap-x-4 gap-y-1.5"
                    style={{ borderBottom: i < c.itens.length - 1 ? '1px solid var(--border)' : undefined }}>
                    <div className="flex items-start gap-2">
                      <StatusBadge status={it.status} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{it.item}</p>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {it.onde && <><b style={{ color: 'var(--text-tertiary)' }}>Onde está: </b>{it.onde}</>}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      <b style={{ color: 'var(--accent)' }}>O que fazer: </b>{it.fazer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MinutaHeader({ titulo, fecha }: { titulo: string; fecha: string }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{titulo}</p>
      <p className="text-[10px]" style={{ color: 'var(--ok)' }}>fecha: {fecha}</p>
    </div>
  )
}

function ResumoStatus() {
  const r = resumoDiagnostico()
  return (
    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
      {r.total} itens do formulário de avaliação:{' '}
      <b style={{ color: 'var(--ok)' }}>{r.temos} temos</b> ·{' '}
      <b style={{ color: 'var(--warn)' }}>{r.parcial} parciais</b> ·{' '}
      <b style={{ color: 'var(--danger)' }}>{r.falta} faltam</b> — os que faltam são os que mais movem a nota.
    </p>
  )
}

function StatusBadge({ status }: { status: StatusItem }) {
  const cfg = {
    temos:   { label: '✓', bg: 'var(--ok-bg)', cor: 'var(--ok)' },
    parcial: { label: '~', bg: 'var(--warn-bg)', cor: 'var(--warn)' },
    falta:   { label: '✕', bg: 'var(--danger-bg)', cor: 'var(--danger)' },
  }[status]
  return (
    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-[-1px]"
      style={{ backgroundColor: cfg.bg, color: cfg.cor }} title={status}>
      {cfg.label}
    </span>
  )
}
