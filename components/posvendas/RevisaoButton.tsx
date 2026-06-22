'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Check, Send, X, RotateCcw } from 'lucide-react'

interface RevisaoButtonProps {
  id: number
  nome: string
  telefone: string
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
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setEnviado(lerEnviadas()[id] ?? null)
  }, [id])

  function confirmar() {
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank', 'noopener')
    const agora = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    const map = lerEnviadas()
    map[id] = agora
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    try {
      const hist = JSON.parse(localStorage.getItem('sd-revisoes-hist') ?? '[]')
      hist.unshift({ nome, telefone, mensagem, quando: agora })
      localStorage.setItem('sd-revisoes-hist', JSON.stringify(hist.slice(0, 50)))
      window.dispatchEvent(new Event('sd-revisao-enviada'))
    } catch { /* noop */ }
    setEnviado(agora)
    setShowPreview(false)
  }

  function resetar() {
    const map = lerEnviadas()
    delete map[id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    setEnviado(null)
    setShowPreview(false)
  }

  if (enviado) {
    return (
      <>
        <button
          onClick={() => setShowPreview(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'}`}
          style={{ backgroundColor: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid var(--ok-border)' }}
          title={`Enviado em ${enviado} — clique para ver detalhes`}
        >
          <Check size={13} />
          Enviado {!compact && `· ${enviado}`}
        </button>

        {showPreview && (
          <PreviewModal
            nome={nome}
            telefone={telefone}
            mensagem={mensagem}
            enviado={enviado}
            onClose={() => setShowPreview(false)}
            onConfirmar={confirmar}
            onResetar={resetar}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className={`inline-flex items-center gap-1.5 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'}`}
        style={{ backgroundColor: '#25D366' }}
        title="Ver mensagem e enviar via WhatsApp"
      >
        <MessageCircle size={13} />
        {compact ? 'Revisão' : 'Chamar para Revisão'}
      </button>

      {showPreview && (
        <PreviewModal
          nome={nome}
          telefone={telefone}
          mensagem={mensagem}
          enviado={null}
          onClose={() => setShowPreview(false)}
          onConfirmar={confirmar}
          onResetar={resetar}
        />
      )}
    </>
  )
}

interface PreviewModalProps {
  nome: string
  telefone: string
  mensagem: string
  enviado: string | null
  onClose: () => void
  onConfirmar: () => void
  onResetar: () => void
}

function PreviewModal({ nome, telefone, mensagem, enviado, onClose, onConfirmar, onResetar }: PreviewModalProps) {
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm mx-4 mb-6 sm:mb-0 rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header estilo WhatsApp */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: '#075E54' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#128C7E' }}>
            <span className="text-base select-none">🏍️</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{nome}</p>
            <p className="text-[10px] text-green-200">+{telefone}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <X size={15} className="text-white/70" />
          </button>
        </div>

        {/* Chat background */}
        <div className="px-4 py-4" style={{ backgroundColor: '#ECE5DD' }}>
          <div
            className="max-w-[85%] ml-auto rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm"
            style={{ backgroundColor: '#DCF8C6' }}
          >
            <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap" style={{ color: '#1a1a1a' }}>
              {mensagem}
            </p>
            <p className="text-[10px] text-right mt-1" style={{ color: '#667781' }}>
              {hora} ✓✓
            </p>
          </div>
        </div>

        {/* Rodapé com ações */}
        <div className="px-4 py-3 flex flex-col gap-2.5" style={{ borderTop: '1px solid var(--border)' }}>
          {enviado && (
            <div className="flex items-center justify-between">
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                Enviada em {enviado}
              </p>
              <button
                onClick={onResetar}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg transition-colors hover:opacity-70"
                style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-bg)' }}
                title="Limpar status para refazer a demo"
              >
                <RotateCcw size={9} /> Resetar
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated-2)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#25D366' }}
            >
              <Send size={12} />
              {enviado ? 'Reenviar no WhatsApp' : 'Abrir no WhatsApp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
