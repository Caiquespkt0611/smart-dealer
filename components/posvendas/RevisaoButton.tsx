'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Check } from 'lucide-react'

interface RevisaoButtonProps {
  id: number
  nome: string
  telefone: string
  /** Mensagem a enviar. Padrão: "Revisão" (combinado com o Caique). */
  mensagem?: string
  compact?: boolean
}

const STORAGE_KEY = 'sd-revisoes-enviadas'

function lerEnviadas(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}

export function RevisaoButton({ id, nome, telefone, mensagem = 'Revisão', compact }: RevisaoButtonProps) {
  const [enviado, setEnviado] = useState<string | null>(null)

  useEffect(() => {
    setEnviado(lerEnviadas()[id] ?? null)
  }, [id])

  function disparar() {
    // Abre o WhatsApp com a mensagem pré-redigida.
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank', 'noopener')
    // Marca como enviado (persistente) + registra no histórico.
    const agora = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    const map = lerEnviadas()
    map[id] = agora
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    // histórico append
    try {
      const hist = JSON.parse(localStorage.getItem('sd-revisoes-hist') ?? '[]')
      hist.unshift({ nome, telefone, mensagem, quando: agora })
      localStorage.setItem('sd-revisoes-hist', JSON.stringify(hist.slice(0, 50)))
      window.dispatchEvent(new Event('sd-revisao-enviada'))
    } catch { /* noop */ }
    setEnviado(agora)
  }

  if (enviado) {
    return (
      <button
        onClick={disparar}
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'}`}
        style={{ backgroundColor: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid var(--ok-border)' }}
        title={`Enviado ${enviado} — clique para reenviar`}
      >
        <Check size={13} /> Enviado {!compact && `· ${enviado}`}
      </button>
    )
  }

  return (
    <button
      onClick={disparar}
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'}`}
      style={{ backgroundColor: '#25D366' }}
    >
      <MessageCircle size={13} /> {compact ? 'Revisão' : 'Chamar para Revisão'}
    </button>
  )
}
