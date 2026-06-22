export const dynamic = 'force-dynamic'
import { getEstoqueCompleto } from '@/lib/data'
import { AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react'

const GAMA_OFICIAL = [
  'AEROX','CROSSER 150 S ABS','CROSSER 150 Z ABS','FACTOR 150 DX',
  'FACTOR 150 ED','FAZER 250 ABS','FLUO ABS','FAZER FZ15 ABS',
  'LANDER 250 ABS','MT-03 ABS','MT-07 ABS','NMAX','R15 ABS',
  'R3 ABS','TÉNÉRÉ 700','TT-R 230','XMAX 300','YAMAHA ZR',
  'NEOS','R3 ABS 70th','XMAX ABS'
]

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams
  const estoque = await getEstoqueCompleto(loja)

  const criticos = estoque.filter(e => e.status === 'CRITICO')
  const atencao = estoque.filter(e => e.status === 'ATENCAO')
  const ok = estoque.filter(e => e.status === 'OK')

  const modelosPresentes = new Set(estoque.map(e => e.modelo))
  const semMix = GAMA_OFICIAL.filter(m => !modelosPresentes.has(m) || estoque.find(e => e.modelo === m)?.estoqueTotal === 0)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
        <p className="text-sm text-slate-400 mt-0.5">{loja} · Cobertura por modelo · Sugestão de compra</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Críticos', val: criticos.length, color: '#EF4444', Icon: XCircle },
          { label: 'Atenção', val: atencao.length, color: '#F59E0B', Icon: AlertTriangle },
          { label: 'OK', val: ok.length, color: '#10B981', Icon: CheckCircle },
        ].map(item => (
          <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <item.Icon size={20} style={{ color: item.color }} />
            <div>
              <div className="text-2xl font-bold tabular-nums text-slate-900">{item.val}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela completa */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Cobertura por Modelo
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Modelo</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Chão</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Trânsito</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Giro/mês</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Cobertura</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Sugestão</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((e, i) => {
                const color = e.status === 'CRITICO' ? '#EF4444' : e.status === 'ATENCAO' ? '#F59E0B' : '#10B981'
                return (
                  <tr
                    key={e.modelo}
                    className={`border-b border-slate-200 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50'}`}
                  >
                    <td className="px-4 py-3 text-slate-900 font-medium">{e.modelo}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">{e.chao}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">{e.transito}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-900 font-bold">{e.estoqueTotal}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">{e.giroMensal}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="tabular-nums font-bold" style={{ color }}>
                        {e.cobertura === 999 ? '—' : `${e.cobertura}d`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {e.sugestaoCompra > 0 ? (
                        <span className="text-[#EF4444] font-bold tabular-nums">+{e.sugestaoCompra}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {e.status === 'CRITICO' ? '✕ Crítico' : e.status === 'ATENCAO' ? '⚠ Atenção' : '✓ OK'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sem Mix */}
      {semMix.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Sem Mix — Modelos da Gama Oficial Ausentes
          </h2>
          <div className="bg-white border border-[#EF444430] rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {semMix.map(m => (
                <span
                  key={m}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#EF444415] text-[#FCA5A5] border border-[#EF444430]"
                >
                  <Package size={10} className="inline mr-1" />{m}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
