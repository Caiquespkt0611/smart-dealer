'use client'
import { useState } from 'react'
import { calcularIndice, premyaData, CATEGORIAS } from '@/lib/premya-data'
import { SlidersHorizontal } from 'lucide-react'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

export function SimuladorPremya() {
  const a = premyaData.atual
  const [vf, setVf] = useState(a.vendasFinanciadas)
  const [sub, setSub] = useState(a.submetidasBymd)
  const [apr, setApr] = useState(a.aprovadasBymd)
  const [outro, setOutro] = useState(a.pagasOutroBanco)

  const subOk = Math.min(sub, vf)
  const aprOk = Math.min(apr, subOk)
  const outroOk = Math.min(outro, aprOk)
  const r = calcularIndice(vf, subOk, aprOk, outroOk)
  const f = premyaData.financeiro
  const incentivo = r.categoria ? f.valorLiberadoMes * (r.categoria.incentivoComercial / 100) : 0
  const floor = r.categoria ? f.estoqueFloorPlan * (r.categoria.floorPlanPp / 100) : 0

  return (
    <div className="card card-pad">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Simulador — mexa nos números e veja a categoria mudar</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Slider label="Vendas varejo financiadas no mês" value={vf} min={20} max={120} onChange={setVf} suffix=" motos" />
          <Slider label="Submetidas ao Banco Yamaha" value={subOk} min={0} max={vf} onChange={setSub} suffix={` (${r.participacao.toFixed(0)}% de participação)`} />
          <Slider label="Propostas aprovadas pelo BYMD" value={aprOk} min={0} max={subOk} onChange={setApr} suffix=" propostas" />
          <Slider label="Aprovadas mas pagas em OUTRO banco" value={outroOk} min={0} max={aprOk} onChange={setOutro} suffix={` (fator de ajuste ${r.fatorAjuste.toFixed(1).replace('.', ',')}%)`} danger />
        </div>

        <div className="rounded-2xl p-5 flex flex-col justify-center" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Índice de Fidelidade</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-4xl font-bold tabular-nums" style={{ color: r.categoria?.cor ?? 'var(--danger)' }}>
              {r.indice.toFixed(1).replace('.', ',')}%
            </span>
            <span className="text-lg font-bold" style={{ color: r.categoria?.cor ?? 'var(--danger)' }}>
              {r.categoria?.nome ?? 'SEM CATEGORIA'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {r.participacao.toFixed(1).replace('.', ',')}% participação − {r.fatorAjuste.toFixed(1).replace('.', ',')}% ajuste
          </p>

          {/* régua de categorias */}
          <div className="relative h-3 rounded-full overflow-hidden flex mt-4">
            {[...CATEGORIAS].reverse().map(c => (
              <div key={c.nome} style={{ width: `${(c.faixaMax - c.faixaMin + 0.1) / 0.4}%`, backgroundColor: c.cor, opacity: r.categoria?.nome === c.nome ? 1 : 0.25 }} />
            ))}
          </div>
          <div className="relative h-4">
            {r.indice >= 60 && (
              <span className="absolute -translate-x-1/2 text-[10px] font-bold" style={{ left: `${((r.indice - 60) / 0.4)}%`, color: 'var(--text-primary)' }}>▲</span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t space-y-1.5 text-xs" style={{ borderColor: 'var(--border)' }}>
            <Linha rot="Incentivo comercial/mês" val={r.categoria ? `${fmtBRL(incentivo)} (${r.categoria.incentivoComercial}% do liberado)` : '—'} />
            <Linha rot="Economia floor plan/mês" val={r.categoria ? `${fmtBRL(floor)} (−${r.categoria.floorPlanPp.toFixed(2).replace('.', ',')} p.p.)` : '—'} />
            <Linha rot="Ganho anualizado" val={fmtBRL((incentivo + floor) * 12)} destaque />
          </div>
        </div>
      </div>
    </div>
  )
}

function Slider({ label, value, min, max, onChange, suffix, danger }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; suffix?: string; danger?: boolean
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span className="font-bold tabular-nums" style={{ color: danger ? 'var(--danger)' : 'var(--accent)' }}>{value}{suffix}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#1E5FE8]"
        style={danger ? { accentColor: 'var(--danger)' } : undefined}
      />
    </div>
  )
}

function Linha({ rot, val, destaque }: { rot: string; val: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span style={{ color: 'var(--text-tertiary)' }}>{rot}</span>
      <span className={`tabular-nums font-${destaque ? 'bold' : 'medium'}`} style={{ color: destaque ? 'var(--ok)' : 'var(--text-primary)' }}>{val}</span>
    </div>
  )
}
