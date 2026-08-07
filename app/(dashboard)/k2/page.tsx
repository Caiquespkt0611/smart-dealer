import { k2Data } from '@/lib/k2-data'
import { K2Chart } from '@/components/charts/K2Chart'
import { Percent, Target, TrendingUp, TrendingDown, Wrench, Package, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'K2 · Taxa de Absorção · Smart Dealer' }

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const fmtPct = (v: number) => `${String(v).replace('.', ',')}%`

export default function K2Page() {
  const meses = [...k2Data.meses]
  const atual = meses[meses.length - 1]
  const anterior = meses[meses.length - 2]
  const ref = k2Data.referencias

  const chartData = meses.map(m => ({
    label: `${MESES[m.mes]}/${String(m.ano).slice(2)}`,
    mcPosVendas: m.mcPosVendas,
    despOperacionais: m.despOperacionais,
    taxaAbsorcao: m.taxaAbsorcao,
  }))

  // quanto falta de MC pós-vendas/mês para bater 65% com as despesas atuais
  const faltaMC = Math.max(0, (ref.taxaAbsorcaoMin / 100) * atual.despOperacionais - atual.mcPosVendas)
  // ou quanto cortar de despesa mantendo a MC atual
  const cortarDesp = Math.max(0, atual.despOperacionais - atual.mcPosVendas / (ref.taxaAbsorcaoMin / 100))
  const media3 = meses.slice(-3).reduce((s, m) => s + m.taxaAbsorcao, 0) / Math.min(3, meses.length)

  const okAbs = atual.taxaAbsorcao >= ref.taxaAbsorcaoMin
  const okPe = atual.pePctVendas <= ref.pePctVendasMax

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          K2 — Taxa de Absorção do Pós-Vendas
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          O pós-vendas pagando as despesas fixas da operação · DRE Yamaha BMI · {MESES[meses[0].mes]}/{String(meses[0].ano).slice(2)} → {MESES[atual.mes]}/{String(atual.ano).slice(2)}
        </p>
      </div>

      {/* ── HERO KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Hero
          label={`Taxa de Absorção — ${MESES[atual.mes]}/${String(atual.ano).slice(2)}`}
          valor={fmtPct(atual.taxaAbsorcao)}
          sub={`Referência Yamaha: > ${ref.taxaAbsorcaoMin}% · média 3M: ${fmtPct(Math.round(media3 * 10) / 10)}`}
          cor={okAbs ? 'var(--ok)' : atual.taxaAbsorcao >= 50 ? 'var(--warn)' : 'var(--danger)'}
          icone={Percent}
          delta={anterior ? atual.taxaAbsorcao - anterior.taxaAbsorcao : undefined}
        />
        <Hero
          label="MC Pós-Vendas (Peças + Serviços)"
          valor={fmtBRL(atual.mcPosVendas)}
          sub={`Despesas operacionais: ${fmtBRL(atual.despOperacionais)}`}
          cor="var(--accent)"
          icone={Wrench}
        />
        <Hero
          label="Ponto de Equilíbrio"
          valor={`${String(atual.peUnidades).replace('.', ',')} motos`}
          sub={`${fmtPct(atual.pePctVendas)} das ${atual.unidadesNovas} vendidas · ref: < ${ref.pePctVendasMax}%`}
          cor={okPe ? 'var(--ok)' : 'var(--danger)'}
          icone={Target}
        />
        <Hero
          label="Para bater os 65%"
          valor={faltaMC > 0 ? `+${fmtBRL(faltaMC)}` : '✓ atingido'}
          sub={faltaMC > 0
            ? `de MC pós/mês — ou cortar ${fmtBRL(cortarDesp)} de despesa`
            : 'taxa acima da referência'}
          cor={faltaMC > 0 ? 'var(--warn)' : 'var(--ok)'}
          icone={faltaMC > 0 ? TrendingUp : Target}
        />
      </div>

      {/* ── EVOLUÇÃO ── */}
      <div className="card card-pad">
        <p className="section-label mb-3">Evolução mensal — MC do pós-vendas vs despesas operacionais</p>
        <K2Chart data={chartData} />
      </div>

      {/* ── TABELA MENSAL ── */}
      <section>
        <h2 className="section-label mb-3">Mês a mês — o caminho até os 65%</h2>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Mês', 'Faturamento Peças', 'Faturamento M.O.', 'MC Pós-Vendas', 'Despesas Oper.', 'Absorção', 'PE (un · % vendas)'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs uppercase tracking-wider font-medium ${i === 0 ? 'text-left' : 'text-right'}`}
                      style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meses.map(m => {
                  const ok = m.taxaAbsorcao >= ref.taxaAbsorcaoMin
                  return (
                    <tr key={`${m.ano}-${m.mes}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {MESES[m.mes]}/{String(m.ano).slice(2)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmtBRL(m.fatPecas)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmtBRL(m.fatServicos)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtBRL(m.mcPosVendas)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{fmtBRL(m.despOperacionais)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: ok ? 'var(--ok)' : m.taxaAbsorcao >= 50 ? 'var(--warn)' : 'var(--danger)' }}>
                        {fmtPct(m.taxaAbsorcao)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: m.pePctVendas <= ref.pePctVendasMax ? 'var(--text-secondary)' : 'var(--danger)' }}>
                        {String(m.peUnidades).replace('.', ',')} · {fmtPct(m.pePctVendas)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── LEITURA + ALAVANCAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: 'var(--ok)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>A leitura</h2>
          </div>
          <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>
              A absorção saiu de ~30% no fim de 2025 para {fmtPct(atual.taxaAbsorcao)} em {MESES[atual.mes]}/{String(atual.ano).slice(2)} —
              o melhor mês foi {(() => { const m = [...meses].sort((a, b) => b.taxaAbsorcao - a.taxaAbsorcao)[0]; return `${MESES[m.mes]}/${String(m.ano).slice(2)} com ${fmtPct(m.taxaAbsorcao)}` })()}.
            </li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>
              Quando a absorção sobe, o ponto de equilíbrio despenca: em {(() => { const m = [...meses].sort((a, b) => a.pePctVendas - b.pePctVendas)[0]; return `${MESES[m.mes]}/${String(m.ano).slice(2)}` })()} bastavam {(() => { const m = [...meses].sort((a, b) => a.pePctVendas - b.pePctVendas)[0]; return `${fmtPct(m.pePctVendas)}` })()} das vendas de 0km para pagar a operação.
            </li>
            <li className="flex gap-2"><span style={{ color: 'var(--accent)' }}>•</span>
              Faltam {fmtBRL(faltaMC)} de MC de pós-vendas por mês para os 65% — cada R$ 1 de margem no balcão e na oficina desafoga a pressão sobre a venda de motos.
            </li>
          </ul>
        </div>

        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <Package size={14} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Como o K2 é medido</h2>
          </div>
          <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {k2Data.observacoes.map((o, i) => (
              <li key={i} className="flex gap-2">
                {o.includes('pendente')
                  ? <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--warn)' }} />
                  : <span style={{ color: 'var(--accent)' }}>•</span>}
                {o}
              </li>
            ))}
          </ul>
          <p className="text-[10px] mt-3 pt-2" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
            Fonte: {k2Data.fonte}
          </p>
        </div>
      </div>
    </div>
  )
}

function Hero({ label, valor, sub, cor, icone: Icon, delta }: {
  label: string; valor: string; sub: string; cor: string
  icone: React.ElementType; delta?: number
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
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums" style={{ color: cor }}>{valor}</span>
          {delta !== undefined && (
            <span className="text-xs font-semibold flex items-center gap-0.5" style={{ color: delta >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{String(Math.abs(Math.round(delta * 10) / 10)).replace('.', ',')}pp
            </span>
          )}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </div>
  )
}
