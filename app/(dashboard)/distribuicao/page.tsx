export const dynamic = 'force-dynamic'
import { getEstoqueCompleto } from '@/lib/data'
import { distribuicaoData } from '@/lib/distribuicao-data'
import { simularDistribuicao } from '@/lib/distribuicao'
import { MapPin, Truck, ArrowRight } from 'lucide-react'

const CORES_PONTO = ['#003087', '#0365FE', '#10B981', '#F59E0B']

export default async function DistribuicaoPage() {
  // só o estoque que entra por Bragança é redistribuível entre os 4 pontos
  const estoque = await getEstoqueCompleto('Bragança Paulista')
  const sim = simularDistribuicao(estoque)
  const pontos = distribuicaoData.pontos
  const mercadoTotal = pontos.reduce((s, p) => s + p.mercado, 0)
  const pctMercado = pontos.map(p => (100 * p.mercado) / mercadoTotal)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Distribuição de Estoque</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Simulação entre os 4 pontos de venda da região · demanda real por emplacamento · {distribuicaoData.referencia}
        </p>
      </div>

      {/* A tese */}
      <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
        <Truck size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
        <p className="text-sm text-slate-700">
          Hoje <span className="font-bold">100% das motos entram pela loja de Bragança Paulista</span>.
          Mas o emplacamento mostra que <span className="font-bold">{Math.round(100 - pctMercado[0])}% da demanda da região está fora de Bragança</span> —
          Atibaia sozinha responde por {Math.round(pctMercado[1])}% do mercado.
          A simulação abaixo rateia o estoque atual pelo mercado de cada segmento na área de influência de cada ponto.
        </p>
      </div>

      {/* Cards por ponto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pontos.map((p, i) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={15} style={{ color: CORES_PONTO[i] }} />
                <span className="font-semibold text-slate-900 text-sm">{p.nome}</span>
              </div>
              {p.recebe && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  Recebe hoje
                </span>
              )}
            </div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: CORES_PONTO[i] }}>
              {Math.round(pctMercado[i])}%
              <span className="text-sm font-normal text-slate-600 ml-1">do mercado</span>
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <p>{p.mercado.toLocaleString('pt-BR')} emplacamentos na área de influência</p>
              <p>Yamaha: {p.yamaha.toLocaleString('pt-BR')} ({Math.round((100 * p.yamaha) / p.mercado)}% de share)</p>
              <p>Nippon: {p.nippon.toLocaleString('pt-BR')} emplacadas</p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-600">Sugestão:</span>
              <span className="text-lg font-bold tabular-nums text-slate-900">{sim.totalPorPonto[i]}</span>
              <span className="text-xs text-slate-600">de {sim.totalGeral} motos</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hoje vs mercado */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Onde o estoque entra hoje × onde o mercado está
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1.5">
              <span>Hoje — recebimento físico</span>
              <span className="font-semibold text-slate-900">100% Bragança Paulista</span>
            </div>
            <div className="h-5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--bg-inset, #F1F5F9)' }}>
              <div className="h-full" style={{ width: '100%', backgroundColor: CORES_PONTO[0] }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ArrowRight size={13} />
            <span>a demanda real da região se divide assim:</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1.5">
              <span>Mercado — emplacamentos {distribuicaoData.referencia}</span>
              <span className="font-semibold text-slate-900">{mercadoTotal.toLocaleString('pt-BR')} motos</span>
            </div>
            <div className="h-5 rounded-full overflow-hidden flex">
              {pontos.map((p, i) => (
                <div key={p.id} className="h-full" style={{ width: `${pctMercado[i]}%`, backgroundColor: CORES_PONTO[i] }} title={`${p.nome}: ${Math.round(pctMercado[i])}%`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {pontos.map((p, i) => (
                <span key={p.id} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ backgroundColor: CORES_PONTO[i] }} />
                  {p.nome} · {Math.round(pctMercado[i])}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabela modelo × ponto */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">
          Sugestão de Distribuição por Modelo — estoque que entra em Bragança (chão + trânsito)
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">Modelo</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium text-xs uppercase tracking-wider">Estoque</th>
                  {pontos.map((p, i) => (
                    <th key={p.id} className="text-right px-4 py-3 font-medium text-xs uppercase tracking-wider" style={{ color: CORES_PONTO[i] }}>
                      {p.nome.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sim.linhas.map((l, idx) => (
                  <tr key={l.modelo} className={`border-b border-slate-200 last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className="text-slate-900 font-medium">{l.modelo}</span>
                      <span className="block text-[10px] text-slate-500">{l.segmento ?? 'rateio pelo mercado total'}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{l.total}</td>
                    {l.porPonto.map((q, i) => (
                      <td key={i} className="px-4 py-3 text-right tabular-nums" style={{ color: q > 0 ? 'var(--text-primary, #0F172A)' : '#94A3B8', fontWeight: q > 0 ? 600 : 400 }}>
                        {q > 0 ? q : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{sim.totalGeral}</td>
                  {sim.totalPorPonto.map((q, i) => (
                    <td key={i} className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: CORES_PONTO[i] }}>{q}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Método */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Como a simulação é calculada</h2>
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
          <p>
            Cada modelo é rateado na proporção do <span className="font-semibold text-slate-900">mercado do seu segmento</span> na
            área de influência de cada ponto (emplacamentos de todas as marcas, {distribuicaoData.referencia}).
            Modelos sem segmento cadastrado seguem o mercado total.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            {pontos.map((p, i) => (
              <div key={p.id}>
                <p className="font-semibold" style={{ color: CORES_PONTO[i] }}>{p.nome}</p>
                <p>{p.cidades.join(' · ')}</p>
              </div>
            ))}
          </div>
          <p className="pt-1">
            Extrema (área Ouro Fino) fica fora da simulação — o estoque dela é reportado à parte e não passa por Bragança.
          </p>
        </div>
      </section>
    </div>
  )
}
