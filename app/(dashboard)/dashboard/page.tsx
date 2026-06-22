import { getDashboardData, getVendasHistorico } from '@/lib/data'
import { AlertaBanner } from '@/components/dashboard/AlertaBanner'
import { ChatWidget } from '@/components/dashboard/ChatWidget'
import { MetaRing } from '@/components/charts/MetaRing'
import { VendasHistChart } from '@/components/charts/VendasHistChart'
import {
  TrendingUp, Users, Star, Trophy,
  CheckCircle, Clock, AlertTriangle, Zap,
} from 'lucide-react'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

type Status = 'OK' | 'ATENCAO' | 'CRITICO'

function statusStyle(s: Status) {
  if (s === 'OK')      return { bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-700',  dot: 'bg-emerald-500'  }
  if (s === 'ATENCAO') return { bg: 'bg-amber-50',    border: 'border-amber-200',   text: 'text-amber-700',    dot: 'bg-amber-500'    }
  return                      { bg: 'bg-red-50',      border: 'border-red-200',     text: 'text-red-700',      dot: 'bg-red-500'      }
}

function KpiCard({
  label, value, unit, sub, status, icon: Icon,
}: {
  label: string
  value: string | number
  unit?: string
  sub: string
  status?: Status
  icon: React.ElementType
}) {
  const s = status ? statusStyle(status) : null
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s ? s.bg : 'bg-blue-50'}`}>
          <Icon size={15} className={s ? s.text : 'text-blue-600'} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums text-slate-900">{value}</span>
          {unit && <span className="text-sm text-slate-600">{unit}</span>}
        </div>
        <p className="text-xs text-slate-600 mt-1">{sub}</p>
      </div>
      {status && (
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${s!.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s!.dot}`} />
          {status === 'OK' ? 'OK' : status === 'ATENCAO' ? 'Atenção' : 'Crítico'}
        </div>
      )}
    </div>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams

  const [data, historico] = await Promise.all([
    getDashboardData(loja),
    getVendasHistorico(loja),
  ])

  const tempoStatus: Status = data.tempoAtend <= 10 ? 'OK' : data.tempoAtend <= 15 ? 'ATENCAO' : 'CRITICO'
  const tcaStatus: Status   = data.tcaPct >= 80 ? 'OK' : data.tcaPct >= 60 ? 'ATENCAO' : 'CRITICO'
  const lcrStatus: Status   = data.lcrPct >= 9  ? 'OK' : data.lcrPct >= 7  ? 'ATENCAO' : 'CRITICO'
  const npsVStatus: Status  = data.npsVendas >= 93   ? 'OK' : 'ATENCAO'
  const npsPStatus: Status  = data.npsPosvenda >= 87 ? 'OK' : 'ATENCAO'
  const varejoStatus: Status = data.pctAtingimento >= 80 ? 'OK' : data.pctAtingimento >= 60 ? 'ATENCAO' : 'CRITICO'

  const kaizenLCR  = data.lcrPct >= 9 ? 4 : data.lcrPct >= 7 ? 2 : 0
  const kaizenNpsV = data.npsVendas >= 93   ? 5  : 0
  const kaizenNpsP = data.npsPosvenda >= 87 ? 10 : 0
  const kaizenTotal = kaizenLCR + kaizenNpsV + kaizenNpsP

  const critcos = data.estoqueAlertas.filter(e => e.status === 'CRITICO')

  return (
    <div className="space-y-5 pb-24">

      {(critcos.length > 0 || data.pctAtingimento < 80) && (
        <AlertaBanner estoqueAlertas={critcos} projecaoPct={data.pctAtingimento} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-0.5">{loja} · Junho/2026 · Dados até dia 14</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Vendas até D14"
          value={data.vendasMes}
          unit="motos"
          sub={`Projeção: ${data.projecao} motos`}
          status={varejoStatus}
          icon={TrendingUp}
        />
        <KpiCard
          label="% da Meta"
          value={`${data.pctAtingimento}%`}
          sub={`${data.projecao} de ${data.meta} motos`}
          status={varejoStatus}
          icon={Zap}
        />
        <KpiCard
          label="Ranking Regional"
          value={`${data.rankingPos}º`}
          unit={`de ${data.rankingTotal}`}
          sub={`Prêmio: ${fmtBRL(data.premioPotencial)}`}
          icon={Trophy}
        />
        <KpiCard
          label="Kaizen Junho"
          value={kaizenTotal}
          unit="/19 pts"
          sub={`LCR ${kaizenLCR} · NPS ${kaizenNpsV + kaizenNpsP}`}
          status={kaizenTotal >= 15 ? 'OK' : kaizenTotal >= 10 ? 'ATENCAO' : 'CRITICO'}
          icon={Star}
        />
      </div>

      {/* Meta Ring + Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: 340 }}>
        {/* Ring */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-5">
            Projeção vs Meta
          </p>
          <div className="flex-1 flex items-center justify-center">
            <MetaRing
              pct={data.pctAtingimento}
              projecao={data.projecao}
              meta={data.meta}
              junhoEmDobro={data.junhoEmDobro}
              premioPotencial={data.premioPotencial}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Histórico — últimos 13 meses
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#003087] inline-block rounded" />
                Vendas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 inline-block" style={{ borderTop: '2px dashed #F59E0B' }} />
                Média 3M
              </span>
            </div>
          </div>
          <div className="flex-1">
            <VendasHistChart data={historico} />
          </div>
        </div>
      </div>

      {/* Kaizen Strip */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Kaizen Jun/26</p>
            <p className={`text-2xl font-bold tabular-nums mt-0.5 ${kaizenTotal >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {kaizenTotal}
              <span className="text-sm font-normal text-slate-600">/19</span>
            </p>
          </div>

          <div className="h-10 w-px bg-slate-100 hidden lg:block" />

          {[
            { label: 'LCR Grupo',      detalhe: `${data.lcrPct}% · meta ≥ 9%`,       ganhou: kaizenLCR > 0,  pts: kaizenLCR,  max: 4  },
            { label: 'NPS Vendas',     detalhe: `${data.npsVendas} · meta ≥ 93`,       ganhou: kaizenNpsV > 0, pts: kaizenNpsV, max: 5  },
            { label: 'NPS Pós-Vendas', detalhe: `${data.npsPosvenda} · meta ≥ 87`,    ganhou: kaizenNpsP > 0, pts: kaizenNpsP, max: 10 },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border flex-1 min-w-[170px] ${
                item.ganhou ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                item.ganhou ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {item.ganhou ? '✓' : '○'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{item.label}</p>
                <p className="text-[10px] text-slate-600">{item.detalhe}</p>
              </div>
              <div className="ml-auto text-right shrink-0">
                <p className={`text-lg font-bold tabular-nums ${item.ganhou ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {item.ganhou ? `+${item.pts}` : '0'}
                </p>
                <p className="text-[10px] text-slate-600">/{item.max} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estoque Crítico */}
      {data.estoqueAlertas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-amber-500" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              Estoque — Alertas de Cobertura
            </h2>
            <span className="ml-auto text-[10px] text-slate-600">
              {data.estoqueAlertas.filter(e => e.status === 'CRITICO').length} crítico(s) ·{' '}
              {data.estoqueAlertas.filter(e => e.status === 'ATENCAO').length} atenção
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data.estoqueAlertas.map(e => {
              const s = statusStyle(e.status as Status)
              const pctCob = Math.min((e.cobertura / 45) * 100, 100)
              return (
                <div key={e.modelo} className={`bg-white rounded-xl p-4 flex flex-col gap-2.5 border ${s.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{e.modelo}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${s.bg} ${s.text}`}>
                      {e.cobertura}d
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${e.status === 'CRITICO' ? 'bg-red-400' : e.status === 'ATENCAO' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${pctCob}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">
                      Estoque: <span className="text-slate-700 font-medium">{e.estoqueTotal}</span> un
                    </span>
                    {e.sugestaoCompra > 0 && (
                      <span className={`font-semibold ${s.text}`}>+ comprar {e.sugestaoCompra}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Leads + NPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={13} className="text-slate-600" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">Leads — Junho/2026</h2>
          </div>
          <div className="space-y-2.5">
            {([
              { label: 'Tempo de Atendimento', value: `${data.tempoAtend} min`, meta: '≤ 10 min',         status: tempoStatus, icon: Clock },
              { label: 'TCA — Confirmação',    value: `${data.tcaPct}%`,        meta: '≥ 80%',            status: tcaStatus,  icon: CheckCircle },
              { label: 'LCR — Conversão',      value: `${data.lcrPct}%`,        meta: '≥ 9% (+4 Kaizen)', status: lcrStatus,  icon: TrendingUp },
            ] as const).map(item => {
              const s = statusStyle(item.status)
              const Icon = item.icon
              return (
                <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border ${s.bg} ${s.border}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/70`}>
                    <Icon size={14} className={s.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-600">Meta: {item.meta}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold tabular-nums text-slate-900">{item.value}</p>
                    <p className={`text-[10px] font-semibold ${s.text}`}>
                      {item.status === 'OK' ? '✓ OK' : item.status === 'ATENCAO' ? '⚠ Atenção' : '✕ Crítico'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* NPS */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={13} className="text-slate-600" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">NPS — Junho/2026</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'NPS Vendas',     value: data.npsVendas,   meta: 93, nacional: 92.6, kaizen: 5,  status: npsVStatus },
              { label: 'NPS Pós-Vendas', value: data.npsPosvenda, meta: 87, nacional: 86.2, kaizen: 10, status: npsPStatus },
            ].map(item => {
              const earned = item.status === 'OK'
              const pct = Math.min((item.value / item.meta) * 100, 105)
              return (
                <div key={item.label} className={`p-4 rounded-xl border ${earned ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      earned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {earned ? `✓ +${item.kaizen} pts Kaizen` : `○ ${item.kaizen} pts não ganhos`}
                    </span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className={`text-2xl font-bold tabular-nums ${earned ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {item.value}
                    </span>
                    <div className="flex-1 pb-1">
                      <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${earned ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                        <span>Nacional: {item.nacional}</span>
                        <span>Meta: {item.meta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-600">Total Kaizen NPS</span>
              <span className={`text-lg font-bold tabular-nums ${(kaizenNpsV + kaizenNpsP) >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {kaizenNpsV + kaizenNpsP}
                <span className="text-sm font-normal text-slate-600">/15 pts</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}
