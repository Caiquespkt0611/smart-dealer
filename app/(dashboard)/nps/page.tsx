export const dynamic = 'force-dynamic'

import { getNPSHistorico } from '@/lib/data'
import { NpsGauge } from '@/components/charts/NpsGauge'
import { NpsLineChart } from '@/components/charts/NpsLineChart'

export default async function NpsPage() {
  const historico = await getNPSHistorico()

  const vendasHist   = historico.filter((n: { tipo: string }) => n.tipo === 'vendas')
  const posHist      = historico.filter((n: { tipo: string }) => n.tipo === 'pos-vendas')

  const vendasAtual  = vendasHist[vendasHist.length - 1]
  const posAtual     = posHist[posHist.length - 1]

  const scoreV  = vendasAtual?.scoreMensal  ?? 0
  const scoreP  = posAtual?.scoreMensal     ?? 0

  const kaizenVendas = scoreV >= 93 ? 5  : 0
  const kaizenPos    = scoreP >= 87 ? 10 : 0
  const kaizenTotal  = kaizenVendas + kaizenPos

  // Mescla séries para o gráfico de linha
  const refSet = new Set([...vendasHist.map((n: any) => n.referencia), ...posHist.map((n: any) => n.referencia)])
  const vendasMap   = new Map(vendasHist.map((n: any) => [n.referencia, n.scoreMensal]))
  const posMap      = new Map(posHist.map((n: any)   => [n.referencia, n.scoreMensal]))
  const lineData = Array.from(refSet)
    .sort()
    .map(ref => ({ referencia: ref, vendas: vendasMap.get(ref), posVendas: posMap.get(ref) }))

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NPS</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Satisfação do Cliente · Vendas · Pós-Vendas · Kaizen
        </p>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NpsGauge
          label="NPS Vendas"
          score={scoreV}
          meta={93}
          nacional={92.6}
          kaizenPts={5}
        />
        <NpsGauge
          label="NPS Pós-Vendas"
          score={scoreP}
          meta={87}
          nacional={86.2}
          kaizenPts={10}
        />
      </div>

      {/* Kaizen NPS */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Total Kaizen NPS</p>
            <p className={`text-3xl font-bold tabular-nums mt-0.5 ${kaizenTotal >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {kaizenTotal}
              <span className="text-base font-normal text-slate-600">/15 pts</span>
            </p>
          </div>

          <div className="h-10 w-px bg-slate-100 hidden lg:block" />

          {[
            {
              label: 'NPS Vendas ≥ 93',
              detalhe: `Score atual: ${scoreV}`,
              ganhou: kaizenVendas > 0,
              pts: 5,
            },
            {
              label: 'NPS Pós-Vendas ≥ 87',
              detalhe: `Score atual: ${scoreP}`,
              ganhou: kaizenPos > 0,
              pts: 10,
            },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-[200px] ${
                item.ganhou ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                item.ganhou ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {item.ganhou ? '✓' : '○'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-600">{item.detalhe}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-2xl font-bold tabular-nums ${item.ganhou ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {item.ganhou ? `+${item.pts}` : '0'}
                </p>
                <p className="text-xs text-slate-600">/ {item.pts} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico histórico */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Evolução Histórica
            </p>
            <p className="text-xs text-slate-600 mt-0.5">Jul/2025 → Jun/2026 · score mensal</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#003087] inline-block rounded" />
              Vendas (meta 93)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block rounded" />
              Pós-Vendas (meta 87)
            </span>
          </div>
        </div>
        <NpsLineChart data={lineData} />
      </div>

      {/* Tabelas históricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* NPS Vendas */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Histórico NPS Vendas
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Período</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Mensal</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Trimestral</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Meta</th>
              </tr>
            </thead>
            <tbody>
              {[...vendasHist].reverse().map((row: any, i: number) => {
                const ok    = row.scoreMensal >= 93
                const color = ok ? 'text-emerald-600' : row.scoreMensal >= 90 ? 'text-amber-600' : 'text-red-600'
                return (
                  <tr
                    key={row.referencia}
                    className={`border-b border-slate-50 last:border-0 ${i === 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-5 py-2.5 text-sm font-medium text-slate-700">
                      {row.referencia}
                      {i === 0 && <span className="ml-2 text-[10px] text-blue-500 font-bold uppercase">atual</span>}
                    </td>
                    <td className={`px-5 py-2.5 text-right tabular-nums font-bold ${color}`}>
                      {row.scoreMensal}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-slate-600">
                      {row.scoreTrimestral}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                        ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {ok ? '✓' : '✕'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* NPS Pós-Vendas */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Histórico NPS Pós-Vendas
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Período</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Mensal</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Trimestral</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Meta</th>
              </tr>
            </thead>
            <tbody>
              {[...posHist].reverse().map((row: any, i: number) => {
                const ok    = row.scoreMensal >= 87
                const color = ok ? 'text-emerald-600' : row.scoreMensal >= 85 ? 'text-amber-600' : 'text-red-600'
                return (
                  <tr
                    key={row.referencia}
                    className={`border-b border-slate-50 last:border-0 ${i === 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-5 py-2.5 text-sm font-medium text-slate-700">
                      {row.referencia}
                      {i === 0 && <span className="ml-2 text-[10px] text-blue-500 font-bold uppercase">atual</span>}
                    </td>
                    <td className={`px-5 py-2.5 text-right tabular-nums font-bold ${color}`}>
                      {row.scoreMensal}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-slate-600">
                      {row.scoreTrimestral}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                        ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {ok ? '✓' : '✕'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
