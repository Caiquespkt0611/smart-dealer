import { getDashboardData } from '@/lib/data'
import { AlertaBanner } from '@/components/dashboard/AlertaBanner'
import { ChatWidget } from '@/components/dashboard/ChatWidget'
import {
  TrendingUp,
  Users,
  Star,
  Trophy,
  CheckCircle,
  Clock,
  Package,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

function statusColor(s: string) {
  const norm = s.toUpperCase()
  if (norm === 'OK')      return { bg: '#10B98120', border: '#10B981', text: '#10B981' }
  if (norm === 'ATENCAO') return { bg: '#F59E0B20', border: '#F59E0B', text: '#F59E0B' }
  return                         { bg: '#EF444420', border: '#EF4444', text: '#EF4444' }
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
      {children}
    </h2>
  )
}

// ─── page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams
  const data = await getDashboardData(loja)

  // Status derivados
  const tempoStatus = data.tempoAtend <= 10 ? 'OK' : data.tempoAtend <= 15 ? 'ATENCAO' : 'CRITICO'
  const tcaStatus   = data.tcaPct >= 80 ? 'OK' : data.tcaPct >= 60 ? 'ATENCAO' : 'CRITICO'
  const lcrStatus   = data.lcrPct >= 9  ? 'OK' : data.lcrPct >= 7  ? 'ATENCAO' : 'CRITICO'
  const npsVStatus  = data.npsVendas >= 93    ? 'OK' : data.npsVendas >= 90    ? 'ATENCAO' : 'CRITICO'
  const npsPStatus  = data.npsPosvenda >= 87  ? 'OK' : data.npsPosvenda >= 85  ? 'ATENCAO' : 'CRITICO'
  const varejoStatus = data.pctAtingimento >= 80 ? 'OK' : data.pctAtingimento >= 60 ? 'ATENCAO' : 'CRITICO'

  const temCritico = data.estoqueAlertas.some(e => e.status === 'CRITICO')

  const kaizen =
    (data.lcrPct >= 9 ? 4 : data.lcrPct >= 7 ? 2 : 0) +
    (data.npsVendas >= 93   ? 5  : 0) +
    (data.npsPosvenda >= 87 ? 10 : 0)

  const critcos = data.estoqueAlertas.filter(e => e.status === 'CRITICO')

  return (
    <div className="space-y-6 pb-24">
      {/* Banner de alerta */}
      {(temCritico || data.pctAtingimento < 80) && (
        <AlertaBanner estoqueAlertas={critcos} projecaoPct={data.pctAtingimento} />
      )}

      {/* Título + Kaizen */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            {loja} · Junho/2026 · Dados até dia 14
          </p>
        </div>
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl px-5 py-3 text-center">
          <div className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-0.5">Kaizen Total</div>
          <div
            className="text-2xl font-bold tabular-nums"
            style={{ color: kaizen >= 15 ? '#10B981' : '#F59E0B' }}
          >
            {kaizen}
            <span className="text-sm font-normal text-[#9CA3AF]">/19</span>
          </div>
        </div>
      </div>

      {/* ── Varejo ── */}
      <section>
        <SectionTitle>Varejo — Junho/2026</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Vendas até dia 14 */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#9CA3AF]">Vendas até Dia 14</span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: statusColor(varejoStatus).bg }}
              >
                <TrendingUp size={15} style={{ color: statusColor(varejoStatus).text }} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold tabular-nums text-white">
                {data.vendasMes}
                <span className="text-lg font-normal text-[#9CA3AF] ml-1">motos</span>
              </div>
              <div className="text-sm text-[#9CA3AF] mt-0.5">
                Projeção: <span className="text-white font-semibold">{data.projecao}</span> motos
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-[#9CA3AF] mb-1">
                <span>Meta: {data.meta}</span>
                <span>{data.pctAtingimento}%</span>
              </div>
              <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(data.pctAtingimento, 100)}%`,
                    backgroundColor:
                      data.pctAtingimento >= 80 ? '#10B981' :
                      data.pctAtingimento >= 60 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
            </div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full w-fit"
              style={{
                backgroundColor: statusColor(varejoStatus).bg,
                color: statusColor(varejoStatus).text,
              }}
            >
              {varejoStatus === 'OK' ? '✓ OK' : varejoStatus === 'ATENCAO' ? '⚠ Atenção' : '✕ Crítico'}
            </span>
          </div>

          {/* Projeção vs Meta */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#9CA3AF]">Projeção vs Meta</span>
              <span className="text-xs text-[#9CA3AF]">Jun/26</span>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <div className="text-3xl font-bold tabular-nums text-white">{data.projecao}</div>
                <div className="text-xs text-[#9CA3AF]">projetado</div>
              </div>
              <div className="text-2xl text-[#374151] pb-0.5">/</div>
              <div>
                <div className="text-3xl font-bold tabular-nums text-[#6B7280]">{data.meta}</div>
                <div className="text-xs text-[#9CA3AF]">meta</div>
              </div>
            </div>
            <div className="text-sm text-[#9CA3AF]">
              Faltam{' '}
              <span className="text-white font-semibold">
                {Math.max(0, data.meta - data.projecao)}
              </span>{' '}
              motos para bater a meta
            </div>
            {data.junhoEmDobro ? (
              <div className="bg-[#10B98115] border border-[#10B98140] rounded-lg px-3 py-1.5 text-xs text-[#10B981] font-medium">
                No ritmo do Junho em Dobro!
              </div>
            ) : (
              <div className="bg-[#EF444415] border border-[#EF444440] rounded-lg px-3 py-1.5 text-xs text-[#FCA5A5]">
                Precisa de {Math.ceil(data.meta * 1.1) - data.projecao} motos extras p/ Junho em Dobro
              </div>
            )}
          </div>

          {/* Ranking Regional */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#9CA3AF]">Ranking Regional</span>
              <Trophy size={15} className="text-[#F59E0B]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold tabular-nums text-white">{data.rankingPos}º</span>
              <span className="text-lg text-[#9CA3AF] pb-1">de {data.rankingTotal}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-[#9CA3AF]">Prêmio em jogo</div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {fmtBRL(data.premioPotencial)}
              </div>
              {data.junhoEmDobro && (
                <div className="text-xs text-[#10B981] font-medium">✓ Junho em Dobro ativado</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Estoque ── */}
      <section>
        <SectionTitle>Estoque — Alertas de Cobertura</SectionTitle>
        {data.estoqueAlertas.length === 0 ? (
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-8 flex flex-col items-center gap-3">
            <CheckCircle size={28} className="text-[#10B981]" />
            <span className="text-[#9CA3AF] text-sm">Todos os modelos com cobertura adequada</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.estoqueAlertas.map(e => {
              const c = statusColor(e.status)
              const pctCobertura = Math.min((e.cobertura / 45) * 100, 100)
              return (
                <div
                  key={e.modelo}
                  className="bg-[#111827] rounded-xl p-4 flex flex-col gap-2.5"
                  style={{ border: `1px solid ${c.border}40` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white leading-tight">{e.modelo}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {e.cobertura}d
                    </span>
                  </div>
                  <div className="h-1 bg-[#1F2937] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pctCobertura}%`, backgroundColor: c.border }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#9CA3AF]">
                    <span>Estoque: <span className="text-white">{e.estoqueTotal}</span> un</span>
                    {e.sugestaoCompra > 0 && (
                      <span style={{ color: c.text }} className="font-medium">
                        Comprar: +{e.sugestaoCompra}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Leads + NPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Leads */}
        <section>
          <SectionTitle>Leads — Junho/2026</SectionTitle>
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-4">
            {([
              {
                label: 'Tempo de Atendimento',
                value: `${data.tempoAtend} min`,
                meta: '≤ 10 min',
                status: tempoStatus,
                icon: Clock,
              },
              {
                label: 'TCA — Tx. Confirmação',
                value: `${data.tcaPct}%`,
                meta: '≥ 80%',
                status: tcaStatus,
                icon: CheckCircle,
              },
              {
                label: 'LCR — Tx. Conversão',
                value: `${data.lcrPct}%`,
                meta: '≥ 9% (4 pts Kaizen)',
                status: lcrStatus,
                icon: Users,
              },
            ] as const).map(item => {
              const c = statusColor(item.status)
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.bg }}
                  >
                    <Icon size={16} style={{ color: c.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm text-[#9CA3AF] truncate">{item.label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold tabular-nums text-white">{item.value}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: c.bg, color: c.text }}
                        >
                          {item.status === 'OK' ? '✓' : item.status === 'ATENCAO' ? '⚠' : '✕'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-[#4B5563] mt-0.5">Meta: {item.meta}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* NPS */}
        <section>
          <SectionTitle>NPS — Junho/2026</SectionTitle>
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-4">
            {([
              {
                label: 'NPS Vendas',
                value: data.npsVendas,
                meta: '≥ 93',
                kaizen: 5,
                status: npsVStatus,
                nacional: 92.6,
              },
              {
                label: 'NPS Pós-vendas',
                value: data.npsPosvenda,
                meta: '≥ 87',
                kaizen: 10,
                status: npsPStatus,
                nacional: 86.2,
              },
            ] as const).map(item => {
              const c = statusColor(item.status)
              return (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#9CA3AF]">{item.label}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#00308720', color: '#60A5FA' }}
                    >
                      +{item.kaizen} pts Kaizen
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold tabular-nums text-white">{item.value}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(item.value, 100)}%`,
                            backgroundColor: c.border,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#4B5563] mt-1">
                        <span>Nacional: {item.nacional}</span>
                        <span style={{ color: c.text }}>
                          {item.status === 'OK' ? '✓ Meta atingida' : '⚠ Atenção'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="border-t border-[#1F2937] pt-3 flex justify-between items-center">
              <span className="text-xs text-[#9CA3AF]">Total Kaizen NPS</span>
              <span className="text-lg font-bold text-[#10B981]">
                {(data.npsVendas >= 93 ? 5 : 0) + (data.npsPosvenda >= 87 ? 10 : 0)}/15 pts
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ChatWidget flutuante */}
      <ChatWidget />
    </div>
  )
}
