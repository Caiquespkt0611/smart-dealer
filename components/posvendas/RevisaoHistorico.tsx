'use client'

import { useState, useEffect } from 'react'
import { Check, Inbox } from 'lucide-react'

interface Item { nome: string; telefone: string; mensagem: string; quando: string }

export function RevisaoHistorico() {
  const [hist, setHist] = useState<Item[]>([])

  useEffect(() => {
    const load = () => {
      try { setHist(JSON.parse(localStorage.getItem('sd-revisoes-hist') ?? '[]')) } catch { setHist([]) }
    }
    load()
    window.addEventListener('sd-revisao-enviada', load)
    return () => window.removeEventListener('sd-revisao-enviada', load)
  }, [])

  if (!hist.length) {
    return (
      <div className="card card-pad flex flex-col items-center justify-center text-center gap-2 py-8">
        <Inbox size={22} style={{ color: 'var(--text-tertiary)' }} />
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Nenhum disparo ainda.<br />Clique em &ldquo;Chamar para Revisão&rdquo; para registrar.</p>
      </div>
    )
  }

  return (
    <div className="card divide-y" style={{ borderColor: 'var(--border)' }}>
      {hist.map((h, i) => (
        <div key={i} className="px-4 py-2.5 flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--ok-bg)' }}>
            <Check size={13} style={{ color: 'var(--ok)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{h.nome}</p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>&ldquo;{[...h.mensagem].length > 28 ? [...h.mensagem].slice(0, 28).join('') + '…' : h.mensagem}&rdquo;</p>
          </div>
          <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-tertiary)' }}>{h.quando}</span>
        </div>
      ))}
    </div>
  )
}
