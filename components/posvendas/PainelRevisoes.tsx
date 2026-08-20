import { revisoesData, calcularRevisoes } from '@/lib/revisoes-data'
import { Wrench, TrendingDown, TrendingUp } from 'lucide-react'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export function PainelRevisoes() {
  const d = revisoesData
  const c = calcularRevisoes()

  return (
    <section>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="section-label">Painel de Revisões R1–R4 · formato Periodic Inspection</h2>
        <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {d.referencia}
        </span>
      </div>

      {/* Atingimento geral */}
      <div className="card card-pad mb-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--bg-inset)" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={c.atingimento >= 90 ? 'var(--ok)' : c.atingimento >= 60 ? 'var(--warn)' : 'var(--danger)'}
                  strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={`${c.atingimento} ${100 - c.atingimento}`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {c.atingimento.toFixed(0)}%
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Atingimento R1–R4 no mês</p>
              <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{c.realMes} <span className="text-sm font-normal" style={{ color: 'var(--text-tertiary)' }}>/ {c.targetMes} target</span></p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>YTD: {c.ytdReal} / {c.ytdTarget}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[220px] rounded-xl p-3.5" style={{ backgroundColor: 'var(--warn-bg)' }}>
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--warn)' }}>
              {c.pendentes} revisões pendentes identificadas pela régua = {fmtBRL(c.receitaPendente)} na mesa
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{d.leitura}</p>
          </div>
        </div>
      </div>

      {/* Cards R1–R4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {d.niveis.map(n => {
          const deltaDia = n.real - n.targetDiario
          const pctMes = (n.real / n.targetMensal) * 100
          return (
            <div key={n.nivel} className="card card-pad">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  <Wrench size={13} /> {n.nivel}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{n.km}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{n.real}</p>
              <div className="flex items-center gap-1 text-[11px] mt-0.5" style={{ color: deltaDia >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
                {deltaDia >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {deltaDia >= 0 ? '+' : ''}{deltaDia} vs. target até hoje ({n.targetDiario})
              </div>
              <div className="mt-2.5">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pctMes, 100)}%`, backgroundColor: pctMes >= 90 ? 'var(--ok)' : pctMes >= 55 ? 'var(--warn)' : 'var(--danger)' }} />
                </div>
                <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  <span>meta mensal {n.targetMensal}</span>
                  <span>YTD {n.ytdReal}/{n.ytdTarget}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Pendentes na régua</span>
                <span className="font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>{n.pendentes}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
