import { treinamentoData } from '@/lib/treinamento-data'
import { GraduationCap, Award, AlertCircle, Store, Users, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Treinamento · Smart Dealer' }

function cargoCurto(c: string) {
  return c
    .replace(' (Motocicletas)', '')
    .replace('Consultor de vendas/ Vendedor', 'Vendedor')
    .replace('Consultor Técnico/ Recepcionista Serviços', 'Consultor Técnico')
    .replace('Monitor de treinamentos_', 'Monitor de Treinamento')
    .trim()
}

function corPct(pct: number) {
  return pct >= 90 ? 'var(--ok)' : pct >= 60 ? 'var(--warn)' : 'var(--danger)'
}

export default function TreinamentoPage() {
  const d = treinamentoData
  const pctGeral = Math.round((d.totalOk / d.totalCerts) * 100)

  // pessoas agrupadas por loja
  const lojas = [...new Set(d.pessoas.map(p => p.loja))]
  const pessoasPorLoja = lojas.map(loja => ({
    loja,
    pessoas: d.pessoas.filter(p => p.loja === loja),
    resumo: d.porLoja.find(l => l.loja === loja),
  }))

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Treinamento &amp; Certificação</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Universidade Yamaha · {d.totalPessoas} colaboradores · {d.totalCerts} certificações mapeadas
        </p>
      </div>

      {/* ── HERO ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HeroCard icon={GraduationCap} accent="var(--accent)" label="Índice de treinamento" value={`${pctGeral}%`} sub={`${d.totalOk} de ${d.totalCerts} certificações ativas`} />
        <HeroCard icon={Users} accent="var(--text-primary)" label="Colaboradores" value={`${d.totalPessoas}`} sub={`${lojas.length} lojas`} />
        <HeroCard icon={CheckCircle2} accent="var(--ok)" label="Certificações OK" value={`${d.totalOk}`} sub="em conformidade" />
        <HeroCard icon={AlertCircle} accent="var(--danger)" label="Pendências" value={`${d.totalPend}`} sub="precisam atualização" />
      </div>

      {/* ── POR SETOR / CARGO ── */}
      <section>
        <h2 className="section-label mb-3">Cobertura por setor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {d.porCargo.map(c => (
            <div key={c.cargo} className="card card-pad flex flex-col gap-2">
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{cargoCurto(c.cargo)}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums" style={{ color: corPct(c.pct) }}>{c.pct}%</span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>· {c.pessoas} pessoa{c.pessoas > 1 ? 's' : ''}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: corPct(c.pct) }} />
              </div>
              {c.pend > 0 && <p className="text-[10px]" style={{ color: 'var(--danger)' }}>{c.pend} pendência{c.pend > 1 ? 's' : ''}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── POR LOJA + PESSOAS ── */}
      {pessoasPorLoja.map(({ loja, pessoas, resumo }) => (
        <section key={loja}>
          <div className="flex items-center gap-2 mb-3">
            <Store size={14} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{loja}</h2>
            {resumo && (
              <span className="text-xs px-2 py-0.5 rounded-full tabular-nums" style={{ backgroundColor: 'var(--bg-inset)', color: corPct(resumo.pct) }}>
                {resumo.pct}% · {resumo.ok}/{resumo.total}
              </span>
            )}
            {resumo && resumo.pend > 0 && (
              <span className="text-[10px] ml-auto" style={{ color: 'var(--danger)' }}>{resumo.pend} pendência(s)</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pessoas.map(p => (
              <div key={p.nome} className="card card-pad flex items-center gap-3">
                <Ring pct={p.pct} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.nome}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>{cargoCurto(p.cargo)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--ok)' }}>
                      <Award size={10} /> {p.ok} ok
                    </span>
                    {p.pend > 0 && (
                      <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                        <AlertCircle size={10} /> {p.pend} pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function HeroCard({ icon: Icon, accent, label, value, sub }: {
  icon: React.ElementType; accent: string; label: string; value: string; sub: string
}) {
  return (
    <div className="card card-pad flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold tabular-nums" style={{ color: accent }}>{value}</span>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </div>
  )
}

function Ring({ pct }: { pct: number }) {
  const r = 18, c = 2 * Math.PI * r
  const color = pct >= 90 ? 'var(--ok)' : pct >= 60 ? 'var(--warn)' : 'var(--danger)'
  return (
    <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
      <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
        <circle cx={24} cy={24} r={r} fill="none" stroke="var(--chart-track)" strokeWidth={5} />
        <circle cx={24} cy={24} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  )
}
