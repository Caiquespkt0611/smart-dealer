'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

export function SimuladorCredito({ disponivel }: { disponivel: number }) {
  const [valor, setValor] = useState('')

  const num = parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0
  const apos = disponivel - num
  const cabe = num > 0 && apos >= 0

  return (
    <div className="card card-pad">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
          <Calculator size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Simulador de novo pedido</h2>
      </div>

      <label className="block text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        Valor do novo pedido (R$)
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={valor}
        onChange={e => setValor(e.target.value)}
        placeholder="ex.: 180.000,00"
        className="w-full px-3 py-2.5 rounded-xl text-sm tabular-nums outline-none"
        style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Disponível atual</p>
          <p className="text-lg font-bold tabular-nums mt-1" style={{ color: disponivel >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
            {fmtBRL(disponivel)}
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Após o pedido</p>
          <p className="text-lg font-bold tabular-nums mt-1" style={{ color: num === 0 ? 'var(--text-tertiary)' : apos >= 0 ? 'var(--ok)' : 'var(--danger)' }}>
            {num === 0 ? '—' : fmtBRL(apos)}
          </p>
        </div>
      </div>

      {num > 0 && (
        <div className="mt-3 px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{
            backgroundColor: cabe ? 'var(--ok-bg)' : 'var(--danger-bg)',
            color: cabe ? 'var(--ok)' : 'var(--danger)',
            border: `1px solid ${cabe ? 'var(--ok-border)' : 'var(--danger)'}`,
          }}>
          {cabe ? '✅ Pedido dentro do limite disponível' : '❌ Pedido excede o limite de crédito'}
        </div>
      )}
    </div>
  )
}
