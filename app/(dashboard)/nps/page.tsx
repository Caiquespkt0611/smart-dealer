import { getNPSHistorico } from '@/lib/data'

export default async function NpsPage() {
  const historico = await getNPSHistorico()

  const vendasHist = historico.filter((n: { tipo: string }) => n.tipo === 'vendas')
  const posHist = historico.filter((n: { tipo: string }) => n.tipo === 'pos-vendas')

  const vendasAtual = vendasHist[vendasHist.length - 1]
  const posAtual = posHist[posHist.length - 1]

  const kaizenVendas = (vendasAtual?.scoremensal ?? 0) >= 93 ? 5 : 0
  const kaizenPos = (posAtual?.scoremensal ?? 0) >= 87 ? 10 : 0

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-white">NPS</h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">
          Satisfação · Vendas · Pós-Vendas · Kaizen
        </p>
      </div>

      {/* Cards atuais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'NPS Vendas',
            score: vendasAtual?.scoremensal ?? 0,
            meta: 93,
            kaizen: 5,
            nacional: 92.6,
            referencia: vendasAtual?.referencia ?? '',
          },
          {
            label: 'NPS Pós-Vendas',
            score: posAtual?.scoremensal ?? 0,
            meta: 87,
            kaizen: 10,
            nacional: 86.2,
            referencia: posAtual?.referencia ?? '',
          },
          {
            label: 'Total Kaizen NPS',
            score: kaizenVendas + kaizenPos,
            meta: 15,
            kaizen: null,
            nacional: null,
            referencia: 'Mês atual',
          },
        ].map(item => {
          const ok = item.kaizen !== null ? item.score >= item.meta : item.score >= item.meta
          const color = ok ? '#10B981' : '#F59E0B'
          const pct = Math.min((item.score / (item.kaizen !== null ? item.meta : item.meta)) * 100, 100)
          return (
            <div key={item.label} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase tracking-widest text-[#9CA3AF]">{item.label}</span>
                {item.kaizen !== null && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#00308720] text-[#60A5FA]">
                    +{item.kaizen} Kaizen
                  </span>
                )}
              </div>
              <div>
                <div className="text-4xl font-bold tabular-nums" style={{ color }}>
                  {item.score}
                  {item.kaizen !== null && <span className="text-base font-normal text-[#9CA3AF] ml-1">pts</span>}
                </div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Meta: {item.meta}{item.kaizen !== null ? '' : ' pts'}</div>
              </div>
              <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
              {item.nacional !== null && (
                <div className="text-xs text-[#6B7280]">Nacional: {item.nacional}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Histórico lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Vendas */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
            Histórico NPS Vendas
          </h2>
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Período</th>
                  <th className="text-right px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Score Mensal</th>
                  <th className="text-right px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Score Trim.</th>
                  <th className="text-right px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Meta</th>
                </tr>
              </thead>
              <tbody>
                {[...vendasHist].reverse().map((row, i) => {
                  const ok = row.scoremensal >= 93
                  const color = ok ? '#10B981' : row.scoremensal >= 90 ? '#F59E0B' : '#EF4444'
                  return (
                    <tr
                      key={row.referencia}
                      className={`border-b border-[#1F2937] last:border-0 ${
                        i === 0 ? 'bg-[#003087]/10' : i % 2 === 0 ? 'bg-transparent' : 'bg-[#0F1724]'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-white font-medium">
                        {row.referencia}
                        {i === 0 && <span className="ml-2 text-[10px] text-[#60A5FA] uppercase">atual</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color }}>{row.scoremensal}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[#9CA3AF]">{row.scoreTrimestral}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                          {ok ? '✓' : '✕'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* NPS Pós-Vendas */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
            Histórico NPS Pós-Vendas
          </h2>
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  <th className="text-left px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Período</th>
                  <th className="text-right px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Score Mensal</th>
                  <th className="text-right px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Score Trim.</th>
                  <th className="text-right px-4 py-3 text-[#9CA3AF] font-medium text-xs uppercase tracking-wider">Meta</th>
                </tr>
              </thead>
              <tbody>
                {[...posHist].reverse().map((row, i) => {
                  const ok = row.scoremensal >= 87
                  const color = ok ? '#10B981' : row.scoremensal >= 85 ? '#F59E0B' : '#EF4444'
                  return (
                    <tr
                      key={row.referencia}
                      className={`border-b border-[#1F2937] last:border-0 ${
                        i === 0 ? 'bg-[#003087]/10' : i % 2 === 0 ? 'bg-transparent' : 'bg-[#0F1724]'
                      }`}
                    >
                      <td className="px-4 py-2.5 text-white font-medium">
                        {row.referencia}
                        {i === 0 && <span className="ml-2 text-[10px] text-[#60A5FA] uppercase">atual</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color }}>{row.scoremensal}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[#9CA3AF]">{row.scoreTrimestral}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                          {ok ? '✓' : '✕'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Kaizen resumo */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">Pontuação Kaizen — NPS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'NPS Vendas ≥ 93', atual: vendasAtual?.scoremensal ?? 0, pts: 5, ok: (vendasAtual?.scoremensal ?? 0) >= 93 },
            { label: 'NPS Pós-Vendas ≥ 87', atual: posAtual?.scoremensal ?? 0, pts: 10, ok: (posAtual?.scoremensal ?? 0) >= 87 },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-[#0A0E1A]">
              <div>
                <div className="text-sm text-white font-medium">{item.label}</div>
                <div className="text-xs text-[#9CA3AF] mt-0.5">Score atual: {item.atual}</div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: item.ok ? '#10B981' : '#4B5563' }}
                >
                  {item.ok ? `+${item.pts}` : '0'}
                </div>
                <div className="text-xs text-[#9CA3AF]">pts</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center border-t border-[#1F2937] pt-3">
          <span className="text-sm text-[#9CA3AF]">Total Kaizen NPS</span>
          <span className="text-2xl font-bold tabular-nums text-[#10B981]">
            {kaizenVendas + kaizenPos}<span className="text-base font-normal text-[#9CA3AF]">/15 pts</span>
          </span>
        </div>
      </div>
    </div>
  )
}
