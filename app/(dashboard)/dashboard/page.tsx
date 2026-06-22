import { getDashboardData, getVendasHistorico } from '@/lib/data'
import { AlertaBanner } from '@/components/dashboard/AlertaBanner'
import { ChatWidget } from '@/components/dashboard/ChatWidget'
import { MetaRing } from '@/components/charts/MetaRing'
import { VendasHistChart } from '@/components/charts/VendasHistChart'
import {
  TrendingUp, TrendingDown, Minus,
  Users, Star, Trophy, CheckCircle,
  Clock, Package, AlertTriangle, Zap,
} from 'lucide-react'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function statusColor(s: string) {
  if (s === 'OK')      return { bg: '#10B98115', border: '#10B98140', text: '#10B981' }
  if (s === 'ATENCAO') return { bg: '#F59E0B15', border: '#F59E0B40', text: '#F59E0B' }
  return                      { bg: '#EF444415', border: '#EF444440', text: '#EF4444' }
}

// ─── KPI Card ───────────────────────────────────────────────────────────────

function KpiCard({
  label, value, unit, sub, status, icon: Icon, highlight,
}: {
  label: string
  value: string | number
  unit?: string
  sub: string
  status?: 'OK' | 'ATENCAO' | 'CRITICO'
  icon: React.ElementType
  highlight?: boolean
}) {
  const c = status ? statusColor(status) : { bg: '#00308715', border: '#00308730', text: '#60A5FA' }
  return (
    <div
      className="bg-[#111827] rounded-2xl p-5 flex flex-col gap-3 border"
      style={{ borderColor: highlight ? c.border : '#1F2937' }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg }}>
          <Icon size={15} style={{ color: c.text }} />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums text-white">{value}</span>
          {unit && <span className="text-sm text-[#6B7280]">{unit}</span>}
        </div>
        <p className="text-xs text-[#4B5563] mt-1">{sub}</p>
      </div>
      {status && (
        <div
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full w-fit"
          style={{ backgroundColor: c.bg, color: c.text }}
        >
          {status === 'OK' ? '✓ OK' : status === 'ATENCAO' ? '⚠ Atenção' : '✕ Crítico'}
        </div>
      )}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

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

  const tempoStatus = data.tempoAtend <= 10 ? 'OK' : data.tempoAtend <= 15 ? 'ATENCAO' : 'CRITICO'
  const tcaStatus   = data.tcaPct >= 80 ? 'OK' : data.tcaPct >= 60 ? 'ATENCAO' : 'CRITICO'
  const lcrStatus   = data.lcrPct >= 9  ? 'OK' : data.lcrPct >= 7  ? 'ATENCAO' : 'CRITICO'
  const npsVStatus  = data.npsVendas >= 93   ? 'OK' : 'ATENCAO'
  const npsPStatus  = data.npsPosvenda >= 87 ? 'OK' : 'ATENCAO'
  const varejoStatus = data.pctAtingimento >= 80 ? 'OK' : data.pctAtingimento >= 60 ? 'ATENCAO' : 'CRITICO'

  const kaizenLCR   = data.lcrPct >= 9 ? 4 : data.lcrPct >= 7 ? 2 : 0
  const kaizenNpsV  = data.npsVendas >= 93   ? 5  : 0
  const kaizenNpsP  = data.npsPosvenda >= 87 ? 10 : 0
  const kaizenTotal = kaizenLCR + kaizenNpsV + kaizenNpsP

  const critcos = data.estoqueAlertas.filter(e => e.status === 'CRITICO')
  const temCritico = critcos.length > 0

  return (
    <div className="space-y-5 pb-24">

      {/* Banner de alerta */}
      {(temCritico || data.pctAtingimento < 80) && (
        <AlertaBanner estoqueAlertas={critcos} projecaoPct={data.pctAtingimento} />
      )}

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#4B5563] mt-0.5">
          {loja} · Junho/2026 · Dados até dia 14
        </p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Vendas até D14"
          value={data.vendasMes}
          unit="motos"
          sub={`Projeção: ${data.projecao} motos`}
          status={varejoStatus}
          icon={TrendingUp}
          highlight
        />
        <KpiCard
          label="Meta Jun/26"
          value={`${data.pctAtingimento}%`}
          sub={`${data.projecao} de ${data.meta} motos`}
          status={varejoStatus}
          icon={Zap}
          highlight
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
          highlight={kaizenTotal < 15}
        />
      </div>

      {/* ── Meta + Histórico ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Meta Ring */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280] mb-5">
            Projeção vs Meta
          </p>
          <MetaRing
            pct={data.pctAtingimento}
            projecao={data.projecao}
            meta={data.meta}
            junhoEmDobro={data.junhoEmDobro}
            premioPotencial={data.premioPotencial}
          />
        </div>

        {/* Histórico de Vendas */}
        <div className="lg:col-span-3 bg-[#111827] border border-[#1F2937] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
              Histórico de Vendas — Últimos 13 meses
            </p>
            <div className="flex items-center gap-3 text-[10px] text-[#4B5563]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#003087] inline-block rounded" />
                Vendas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#F59E0B] inline-block rounded border-dashed" style={{ borderTop: '2px dashed #F59E0B', height: 0 }} />
                Meta
              </span>
            </div>
          </div>
          <VendasHistChart
            data={historico}
            meta={data.meta}
            projecao={data.projecao}
          />
        </div>
      </div>

      {/* ── Kaizen Strip ── */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B5563]">Kaizen Jun/26</p>
            <p className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: kaizenTotal >= 15 ? '#10B981' : '#F59E0B' }}>
              {kaizenTotal}
              <span className="text-sm font-normal text-[#4B5563]">/19</span>
            </p>
          </div>

          <div className="h-10 w-px bg-[#1F2937] hidden lg:block" />

          {[
            {
              label: 'LCR Grupo',
              detalhe: `${data.lcrPct}% (meta ≥ 9%)`,
              ganhou: kaizenLCR > 0,
              pts: kaizenLCR,
              max: 4,
            },
            {
              label: 'NPS Vendas',
              detalhe: `${data.npsVendas} (meta ≥ 93)`,
              ganhou: kaizenNpsV > 0,
              pts: kaizenNpsV,
              max: 5,
            },
            {
              label: 'NPS Pós-Vendas',
              detalhe: `${data.npsPosvenda} (meta ≥ 87)`,
              ganhou: kaizenNpsP > 0,
              pts: kaizenNpsP,
              max: 10,
            },
          ].map(item => (
            <div
              key={item.label}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border flex-1 min-w-[180px]"
              style={{
                borderColor: item.ganhou ? '#10B98140' : '#1F2937',
                backgroundColor: item.ganhou ? '#10B98108' : 'transparent',
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  backgroundColor: item.ganhou ? '#10B98120' : '#1F2937',
                  color: item.ganhou ? '#10B981' : '#4B5563',
                }}
              >
                {item.ganhou ? '✓' : '○'}
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-[10px] text-[#4B5563]">{item.detalhe}</p>
              </div>
              <div className="ml-auto text-right">
                <p
                  className="text-lg font-bold tabular-nums"
                  style={{ color: item.ganhou ? '#10B981' : '#4B5563' }}
                >
                  {item.ganhou ? `+${item.pts}` : '0'}
                </p>
                <p className="text-[10px] text-[#4B5563]">/{item.max} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Estoque Crítico ── */}
      {data.estoqueAlertas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-[#F59E0B]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
              Estoque — Alertas de Cobertura
            </h2>
            <span className="ml-auto text-[10px] text-[#4B5563]">
              {data.estoqueAlertas.filter(e => e.status === 'CRITICO').length} crítico(s) ·{' '}
              {data.estoqueAlertas.filter(e => e.status === 'ATENCAO').length} atenção
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data.estoqueAlertas.map(e => {
              const c = statusColor(e.status)
              const pctCob = Math.min((e.cobertura / 45) * 100, 100)
              return (
                <div
                  key={e.modelo}
                  className="bg-[#111827] rounded-xl p-4 flex flex-col gap-2.5 border"
                  style={{ borderColor: c.border }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-white leading-tight">{e.modelo}</p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {e.cobertura}d
                    </span>
                  </div>
                  {/* Barra de cobertura */}
                  <div className="h-1.5 bg-[#0A0E1A] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pctCob}%`, backgroundColor: c.text }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280]">
                      Estoque: <span className="text-white font-medium">{e.estoqueTotal}</span> un
                    </span>
                    {e.sugestaoCompra > 0 && (
                      <span className="font-semibold" style={{ color: c.text }}>
                        + comprar {e.sugestaoCompra}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Leads + NPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leads */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={13} className="text-[#6B7280]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
              Leads — Junho/2026
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                label: 'Tempo de Atendimento',
                value: `${data.tempoAtend} min`,
                meta: '≤ 10 min',
                status: tempoStatus,
                icon: Clock,
              },
              {
                label: 'TCA — Confirmação',
                value: `${data.tcaPct}%`,
                meta: '≥ 80%',
                status: tcaStatus,
                icon: CheckCircle,
              },
              {
                label: 'LCR — Conversão',
                value: `${data.lcrPct}%`,
                meta: `≥ 9% (+4 pts Kaizen)`,
                status: lcrStatus,
                icon: TrendingUp,
              },
            ].map(item => {
              const c = statusColor(item.status)
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: c.bg }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                    <Icon size={14} style={{ color: c.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#9CA3AF] truncate">{item.label}</p>
                    <p className="text-[10px] text-[#4B5563]">Meta: {item.meta}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold tabular-nums text-white">{item.value}</p>
                    <p className="text-[10px] font-semibold" style={{ color: c.text }}>
                      {item.status === 'OK' ? '✓ OK' : item.status === 'ATENCAO' ? '⚠ Atenção' : '✕ Crítico'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* NPS */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={13} className="text-[#6B7280]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
              NPS — Junho/2026
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'NPS Vendas', value: data.npsVendas, meta: 93, nacional: 92.6, kaizen: 5, status: npsVStatus },
              { label: 'NPS Pós-Vendas', value: data.npsPosvenda, meta: 87, nacional: 86.2, kaizen: 10, status: npsPStatus },
            ].map(item => {
              const c = statusColor(item.status)
              const pct = Math.min((item.value / item.meta) * 100, 110)
              const earned = item.status === 'OK'
              return (
                <div key={item.label} className="p-3 rounded-xl border" style={{ borderColor: c.border, backgroundColor: c.bg }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-white">{item.label}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: earned ? '#10B98120' : '#1F2937',
                        color: earned ? '#10B981' : '#4B5563',
                      }}
                    >
                      {earned ? `✓ +${item.kaizen} pts Kaizen` : `○ ${item.kaizen} pts (não ganhos)`}
                    </span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: c.text }}>
                      {item.value}
                    </span>
                    <div className="flex-1 pb-1">
                      <div className="h-1.5 bg-[#0A0E1A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: c.text }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#4B5563] mt-1">
                        <span>Nacional: {item.nacional}</span>
                        <span>Meta: {item.meta}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ChatWidget />
    </div>
  )
}
