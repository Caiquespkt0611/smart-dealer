import { getDashboardData } from '@/lib/data'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export default async function VarejoPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams
  const data = await getDashboardData(loja)

  const parejoStatus =
    data.pctAtingimento >= 80 ? 'ok' : data.pctAtingimento >= 60 ? 'atencao' : 'critico'

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Varejo</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          {loja} · {data.nomeMesCorrente}/{data.ano}
          {data.modo === 'largada'
            ? ` · o que ${data.nomeMesFechado.toLowerCase()} diz sobre o que ${data.nomeMesCorrente.toLowerCase()} exige`
            : ' · mês em curso'}
        </p>
      </div>

      {/* ── Projeção / Largada ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
          {data.modo === 'largada' ? `Carta de ${data.nomeMesCorrente} vs Fechamento de ${data.nomeMesFechado}` : 'Projeção de Fechamento'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(data.modo === 'largada' ? [
            { label: `Fechamento ${data.nomeMesFechado}`, val: data.fechamentoAnterior, unit: 'motos', color: 'var(--text-primary)' },
            { label: `Carta ${data.nomeMesCorrente}`, val: data.meta, unit: 'motos', color: 'var(--accent)' },
            { label: 'Salto que a carta pede', val: `${data.saltoCarta >= 0 ? '+' : ''}${data.saltoCarta}`, unit: 'motos', color: data.saltoCarta > 0 ? '#F59E0B' : '#10B981' },
            { label: `Ritmo necessário`, val: data.ritmoNecessario, unit: `un/dia · ${data.diasUteisMes} úteis`, color: 'var(--text-primary)' },
          ] : [
            { label: `Vendas ${data.nomeMesCorrente}`, val: data.vendasMes, unit: 'motos', color: 'var(--text-primary)' },
            { label: 'Projeção de fechamento', val: data.projecao, unit: 'motos', color: 'var(--accent)' },
            { label: 'Meta do mês', val: data.meta, unit: 'motos', color: '#9CA3AF' },
            { label: '% Atingimento', val: `${data.pctAtingimento}%`, unit: '', color: data.pctAtingimento >= 80 ? '#10B981' : data.pctAtingimento >= 60 ? '#F59E0B' : '#EF4444' },
          ]).map(item => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs uppercase tracking-widest text-slate-600 mb-2">{item.label}</div>
              <div className="text-3xl font-bold tabular-nums" style={{ color: item.color }}>
                {item.val}
                {item.unit && <span className="text-base font-normal text-slate-600 ml-1">{item.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Barra de progresso grande */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-600">{data.modo === 'largada' ? `Fech. ${data.nomeMesFechado}` : 'Projeção'}: <span className="text-slate-900 font-bold">{data.projecao}</span></span>
            <span className="text-slate-600">Carta: <span className="text-slate-900 font-bold">{data.meta}</span></span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 relative"
              style={{
                width: `${Math.min(data.pctAtingimento, 100)}%`,
                backgroundColor: data.pctAtingimento >= 80 ? '#10B981' : data.pctAtingimento >= 60 ? '#F59E0B' : '#EF4444',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            <span>0</span>
            <span style={{ color: data.pctAtingimento >= 80 ? '#10B981' : '#F59E0B' }}>
              {data.pctAtingimento}% da meta
            </span>
            <span>{data.meta}</span>
          </div>

          {!data.metaEmDobro && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-[#F59E0B]" />
              <span className="text-slate-600">
                {data.modo === 'largada'
                  ? <>A carta pede <span className="text-slate-900 font-bold">{Math.max(0, data.saltoCarta)}</span> motos a mais que {data.nomeMesFechado.toLowerCase()} · Supermeta 110%: <span className="text-[#F59E0B]">{Math.ceil(data.meta * 1.1)} motos</span></>
                  : <>Precisa de <span className="text-slate-900 font-bold">{Math.max(0, data.meta - data.projecao)}</span> motos para bater a carta · <span className="text-[#F59E0B]">{Math.ceil(data.meta * 1.1) - data.projecao} motos</span> para a Supermeta 110%</>}
              </span>
            </div>
          )}
          {data.metaEmDobro && (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#10B981]">
              No ritmo da Supermeta 110% — prêmio dobra para {fmtBRL(data.premioPotencial)}!
            </div>
          )}
        </div>

        {/* O dia a dia até a carta (estudo de projeção do Performance Concessionário) */}
        {data.modo === 'acompanhamento' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mt-4">
            <div className="text-xs uppercase tracking-widest text-slate-600 mb-3">
              O dia a dia até a carta · vendas registradas até {String(data.diaCorte).padStart(2, '0')}/{String(data.mesCorrente).padStart(2, '0')}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold tabular-nums text-slate-900">{data.faltamParaMeta}</div>
                <div className="text-xs text-slate-600">motos faltando para a carta</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums text-slate-900">{data.diasUteisRestantes}</div>
                <div className="text-xs text-slate-600">dias úteis restantes</div>
              </div>
              <div>
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: data.ritmoParaMeta <= data.ritmoAtual ? '#10B981' : data.ritmoParaMeta <= data.ritmoAtual * 1.3 ? '#F59E0B' : '#EF4444' }}
                >
                  {data.ritmoParaMeta}
                </div>
                <div className="text-xs text-slate-600">motos/dia para bater a carta</div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums text-slate-900">{data.ritmoAtual}</div>
                <div className="text-xs text-slate-600">motos/dia no ritmo atual</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              {data.ritmoParaMeta <= data.ritmoAtual
                ? 'O ritmo atual já fecha a carta — a disputa agora é a Supermeta 110%.'
                : <>Para virar o mês é preciso subir de <span className="font-semibold text-slate-900">{data.ritmoAtual}</span> para{' '}
                  <span className="font-semibold text-slate-900">{data.ritmoParaMeta} motos/dia</span> nos {data.diasUteisRestantes} dias úteis que restam
                  — os dois últimos dias úteis pesam mais (2,2× e 1,7×) e podem decidir o fechamento.</>}
            </p>
          </div>
        )}
      </section>

      {/* ── Modelo a Modelo ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Vendas por Modelo — {data.nomeMesFechado} fechado (tendência vs mês anterior)
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">Modelo</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">{data.nomeMesFechado.slice(0, 3)}/{String(data.ano).slice(2)}</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">Giro/mês</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {data.vendasPorModelo.map((m, i) => (
                <tr
                  key={m.modelo}
                  className={`border-b border-slate-200 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50'}`}
                >
                  <td className="px-4 py-3 text-slate-900 font-medium">{m.modelo}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{m.qtd}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-600">{m.giro}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: m.tendencia === 'SUBINDO' ? '#10B98120' : m.tendencia === 'CAINDO' ? '#EF444420' : '#1F2937',
                        color: m.tendencia === 'SUBINDO' ? '#10B981' : m.tendencia === 'CAINDO' ? '#EF4444' : '#9CA3AF',
                      }}
                    >
                      {m.tendencia === 'SUBINDO' ? <TrendingUp size={11} /> : m.tendencia === 'CAINDO' ? <TrendingDown size={11} /> : <Minus size={11} />}
                      {m.tendencia === 'SUBINDO' ? 'Crescendo' : m.tendencia === 'CAINDO' ? 'Caindo' : 'Estável'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Ranking Regional ── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Ranking Regional — {data.modo === 'largada'
            ? `Fechamento de ${data.nomeMesFechado} vs carta de ${data.nomeMesCorrente}`
            : '% Atingimento da Carta'}
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider w-12">Pos.</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">Grupo</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">% Atingimento</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Prêmio em jogo</th>
              </tr>
            </thead>
            <tbody>
              {data.ranking.map((r, i) => {
                const isNippon = r.grupo === 'NIPPON MOTOS'
                const pct = Math.round(r.pct)
                const faixaFn = (meta: number) => {
                  if (meta >= 801) return 40000
                  if (meta >= 401) return 30000
                  if (meta >= 151) return 15000
                  if (meta >= 61) return 10000
                  return 5000
                }
                const medalha = ['🥇', '🥈', '🥉'][i]
                const maxPct = Math.max(...data.ranking.map(x => x.pct))
                return (
                  <tr
                    key={r.grupo}
                    className="border-b border-slate-200 last:border-0"
                    style={isNippon ? { backgroundColor: 'var(--accent-bg)' } : undefined}
                  >
                    <td className="px-4 py-3">
                      <span className="text-base font-bold tabular-nums" style={{ color: i === 0 ? 'var(--warn)' : 'var(--text-tertiary)' }}>
                        {medalha ?? `${r.pos}º`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: isNippon ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {isNippon ? '▶ ' : ''}{r.grupo}
                        {isNippon && <span className="text-xs ml-2" style={{ color: 'var(--text-tertiary)' }}>(você)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-28 h-2 rounded-full overflow-hidden hidden sm:block" style={{ backgroundColor: 'var(--bg-inset)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(r.pct / maxPct) * 100}%`,
                              backgroundColor: isNippon ? 'var(--accent)' : 'var(--border-strong)',
                            }}
                          />
                        </div>
                        <span className="tabular-nums font-bold text-sm w-12 text-right" style={{ color: isNippon ? 'var(--accent)' : 'var(--text-secondary)' }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell" style={{ color: isNippon ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {fmtBRL(faixaFn(r.meta))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-slate-200 text-xs text-slate-600">
            * Valores absolutos dos outros grupos ocultos por privacidade de dados regionais
          </div>
        </div>
      </section>
    </div>
  )
}
