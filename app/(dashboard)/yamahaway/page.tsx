import { radarBanca, feedbackRespostas, businessCase, comSemSmartDealer, formulaSucesso } from '@/lib/yamahaway-data'
import { getCampanhaAnalise } from '@/lib/campanha-vendas'
import { RadarBanca } from '@/components/charts/RadarBanca'
import { Trophy, MessageSquare, Scale, Sparkles, CheckCircle2, Clock } from 'lucide-react'

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

      {/* ── FÓRMULA DO SUCESSO ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} style={{ color: 'var(--warn)' }} />
          <h2 className="section-label">Fórmula do Sucesso — a evidência de cada critério</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formulaSucesso.map(f => (
            <div key={f.criterio} className="card card-pad">
              <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--accent)' }}>{f.criterio}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.evidencia}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
