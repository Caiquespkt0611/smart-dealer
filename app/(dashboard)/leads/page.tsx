export const dynamic = 'force-dynamic'
import { getLeadsHistorico } from '@/lib/data'
import { Clock, CheckCircle, Users } from 'lucide-react'

function statusColor(val: number, tipo: 'tempo' | 'tca' | 'lcr') {
  if (tipo === 'tempo') {
    if (val <= 10) return '#10B981'
    if (val <= 15) return '#F59E0B'
    return '#EF4444'
  }
  if (tipo === 'tca') {
    if (val >= 80) return '#10B981'
    if (val >= 60) return '#F59E0B'
    return '#EF4444'
  }
  if (val >= 9) return '#10B981'
  if (val >= 7) return '#F59E0B'
  return '#EF4444'
}

export default async function LeadsPage() {
  const historico = await getLeadsHistorico()
  const atual = historico[historico.length - 1]
  const kaizenLCR = atual?.lcrGrupoPct >= 9 ? 4 : atual?.lcrGrupoPct >= 7 ? 2 : 0

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Tempo de Atendimento · TCA · LCR · Evolução Histórica
        </p>
      </div>

      {/* KPIs atuais */}
      {atual && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            {
              label: 'Tempo de Atendimento',
              value: `${atual.tempoAtendMin} min`,
              meta: '≤ 10 min',
              sub: 'Média histórica Nippon: 37 min — nunca ficou verde',
              color: statusColor(atual.tempoAtendMin, 'tempo'),
              icon: Clock,
            },
            {
              label: 'TCA — Tx. Confirmação',
              value: `${atual.tcaPct}%`,
              meta: '≥ 80%',
              sub: atual.tcaPct >= 80 ? 'Meta atingida ✓' : 'Abaixo da meta',
              color: statusColor(atual.tcaPct, 'tca'),
              icon: CheckCircle,
            },
            {
              label: 'LCR — Tx. Conversão',
              value: `${atual.lcrGrupoPct}%`,
              meta: '≥ 9% = 4 pts Kaizen',
              sub: `Kaizen: ${kaizenLCR} pontos`,
              color: statusColor(atual.lcrGrupoPct, 'lcr'),
              icon: Users,
            },
          ] as const).map(item => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-slate-400">{item.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon size={15} style={{ color: item.color }} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold tabular-nums" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Meta: {item.meta}</div>
                </div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Evolução histórica */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Evolução Histórica
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Período</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Leads</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Únicos</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Tempo (min)</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">TCA%</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">LCR%</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">Conv. (dias)</th>
              </tr>
            </thead>
            <tbody>
              {[...historico].reverse().map((row, i) => (
                <tr
                  key={row.referencia}
                  className={`border-b border-slate-200 last:border-0 ${
                    i === 0 ? 'bg-[#003087]/10' : i % 2 === 0 ? 'bg-transparent' : 'bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-2.5 text-slate-900 font-medium">
                    {row.referencia}
                    {i === 0 && <span className="ml-2 text-[10px] text-[#60A5FA] uppercase">atual</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">{row.leads}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">{row.leadsUnicos}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: statusColor(row.tempoAtendMin, 'tempo') }}>{row.tempoAtendMin}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: statusColor(row.tcaPct, 'tca') }}>{row.tcaPct}%</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-bold" style={{ color: statusColor(row.lcrGrupoPct, 'lcr') }}>{row.lcrGrupoPct}%</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">{row.diasConversao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Legenda */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Metas e Kaizen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Tempo Atendimento', ok: '≤ 10 min', atencao: '10–15 min', critico: '> 15 min' },
            { label: 'TCA', ok: '≥ 80%', atencao: '60–79%', critico: '< 60%' },
            { label: 'LCR (Kaizen)', ok: '≥ 9% → 4 pts', atencao: '≥ 7% → 2 pts', critico: '< 7% → 0 pts' },
          ].map(l => (
            <div key={l.label} className="space-y-1">
              <div className="text-slate-400 font-medium">{l.label}</div>
              <div className="text-[#10B981]">● {l.ok}</div>
              <div className="text-[#F59E0B]">● {l.atencao}</div>
              <div className="text-[#EF4444]">● {l.critico}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
