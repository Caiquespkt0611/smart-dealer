import { posVendasData } from '@/lib/posvendas-data'
import { renovacaoData } from '@/lib/renovacao-data'
import { RevisaoButton } from '@/components/posvendas/RevisaoButton'
import { RevisaoHistorico } from '@/components/posvendas/RevisaoHistorico'
import {
  CalendarClock, AlertTriangle, CheckCircle2, Bike,
  Gift, Sparkles, MessageCircle, Phone,
} from 'lucide-react'

export const metadata = { title: 'Pós-Vendas · Smart Dealer' }

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}
function fmtData(iso: string) {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a.slice(2)}`
}

const STATUS = {
  VENCIDA: { label: 'Revisão vencida', c: 'var(--danger)', bg: 'var(--danger-bg)' },
  PROXIMA: { label: 'Revisão próxima', c: 'var(--warn)', bg: 'var(--warn-bg)' },
  EM_DIA: { label: 'Em dia', c: 'var(--ok)', bg: 'var(--ok-bg)' },
}

export default function PosVendasPage() {
  const d = posVendasData
  const ribeiro = d.clientes.find(c => c.nome === 'Ribeiro')
  const fila = d.clientes.filter(c => c.status !== 'EM_DIA')
  const emDia = d.clientes.filter(c => c.status === 'EM_DIA')

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pós-Vendas &amp; Relacionamento</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Régua de revisões automática · fila de contato do dia · renovação estratégica
        </p>
      </div>

      {/* ── DISPARO DE TESTE (Ribeiro) ── */}
      {ribeiro && (
        <div className="card card-pad" style={{ borderColor: 'var(--accent)', borderWidth: 1.5 }}>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#25D36622' }}>
              <MessageCircle size={22} style={{ color: '#25D366' }} />
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Disparo de revisão — {ribeiro.nome}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>DEMONSTRAÇÃO AO VIVO</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {ribeiro.modelo} · {ribeiro.kmEstimado.toLocaleString('pt-BR')} km · revisão dos {ribeiro.proximaRevisaoKm.toLocaleString('pt-BR')} km vencida há {Math.abs(ribeiro.diasParaRevisao)} dias.
              </p>
              <p className="text-[11px] mt-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                <Phone size={11} /> +{ribeiro.telefone} · mensagem enviada: <b style={{ color: 'var(--text-primary)' }}>&ldquo;Revisão&rdquo;</b>
              </p>
            </div>
            <div className="self-center">
              <RevisaoButton id={ribeiro.id} nome={ribeiro.nome} telefone={ribeiro.telefone} mensagem="Revisão" />
            </div>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={AlertTriangle} accent="var(--danger)" label="Revisões vencidas" value={d.resumo.vencidas} sub="contato urgente" />
        <Kpi icon={CalendarClock} accent="var(--warn)" label="Próximas (15 dias)" value={d.resumo.proximas} sub="agendar agora" />
        <Kpi icon={CheckCircle2} accent="var(--ok)" label="Em dia" value={d.resumo.emDia} sub="fidelizados" />
        <Kpi icon={Bike} accent="var(--accent)" label="Base ativa" value={d.resumo.total} sub="clientes monitorados" />
      </div>

      {/* ── FILA DO DIA + HISTÓRICO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={14} style={{ color: 'var(--warn)' }} />
            <h2 className="section-label">Fila de contato — quem chamar hoje</h2>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Cliente</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Moto</th>
                  <th className="text-center px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Revisão</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {fila.map(c => {
                  const st = STATUS[c.status as keyof typeof STATUS]
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{c.nome}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{c.loja}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.modelo}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{c.kmEstimado.toLocaleString('pt-BR')} km</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: st.bg, color: st.c }}>
                          {c.status === 'VENCIDA' ? `${Math.abs(c.diasParaRevisao)}d atrás` : c.status === 'PROXIMA' ? `em ${c.diasParaRevisao}d` : 'em dia'}
                        </span>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{c.proximaRevisaoKm.toLocaleString('pt-BR')} km</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RevisaoButton id={c.id} nome={c.nome} telefone={c.telefone} mensagem="Revisão" compact />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            + {emDia.length} clientes em dia (revisões em conformidade) · régua: 1.000 / 6.000 / 12.000 / 18.000 / 24.000 km
          </p>
        </section>

        {/* Histórico */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={14} style={{ color: '#25D366' }} />
            <h2 className="section-label">Histórico de disparos</h2>
          </div>
          <RevisaoHistorico />
        </section>
      </div>

      {/* ── RENOVAÇÃO ESTRATÉGICA ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="section-label">Renovação estratégica — upgrade na hora certa</h2>
          <span className="ml-auto text-[10px]" style={{ color: 'var(--text-tertiary)' }}>clientes com 2–4 anos de moto · ofertas de troca</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {renovacaoData.map((r, i) => (
            <div key={i} className="card card-pad flex flex-col gap-2.5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.nome}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{r.modeloAtual} · há {r.anos} anos</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style={{ backgroundColor: 'var(--warn-bg)', color: 'var(--warn)' }}>
                  <Gift size={11} /> {fmtBRL(r.voucher)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>{r.modeloAtual}</span>
                <span style={{ color: 'var(--accent)' }}>→</span>
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>{r.ofertaModelo}</span>
              </div>
              <RevisaoButton id={1000 + i} nome={r.nome} telefone={r.telefone}
                mensagem={`Olá ${r.nome.split(' ')[0]}! Temos uma condição especial de upgrade da sua ${r.modeloAtual} para a nova ${r.ofertaModelo}, com voucher de ${fmtBRL(r.voucher)}. Posso te apresentar?`}
                compact />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Kpi({ icon: Icon, accent, label, value, sub }: {
  icon: React.ElementType; accent: string; label: string; value: number; sub: string
}) {
  return (
    <div className="card card-pad flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <Icon size={15} style={{ color: accent }} />
      </div>
      <span className="text-3xl font-bold tabular-nums" style={{ color: accent }}>{value}</span>
      <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
}
