'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, X, ArrowUp, MessageCircle, Phone } from 'lucide-react'

const CHIPS = [
  'Tem algum cliente insatisfeito?',
  'Como está o varejo hoje?',
  'Qual estoque precisa de ação urgente?',
  'Onde estamos no ranking regional?',
  'O que fazer para bater a meta?',
]

interface Contato {
  nome: string; telefone: string; loja: string; moto: string; nota: number; whatsapp: string; tel: string
}
interface Message {
  role: 'user' | 'ai'
  text: string
  contato?: Contato | null
}

// Fica no body (portal) para flutuar no canto em qualquer tela, sem depender do scroll da página.
export function ChatWidget() {
  const [montado, setMontado] = useState(false)
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMontado(true), [])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [msgs, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setMsgs(prev => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, { role: 'ai', text: data.message ?? 'Erro ao processar.', contato: data.contato }])
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Erro de conexão.' }])
    }
    setLoading(false)
  }

  if (!montado) return null

  return createPortal(
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 rounded-full py-2 pl-2 pr-5 text-white hover:-translate-y-0.5"
          style={{ background: 'var(--yh-navy)', boxShadow: 'var(--shadow-pop)', transition: 'transform 200ms ease-out' }}
          aria-label="Abrir assistente"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: 'var(--yh-blue)' }}>
            <Sparkles size={17} />
          </span>
          <span className="yh-display text-[15px] font-bold uppercase tracking-wide">Assistente IA</span>
        </button>
      )}

      {open && (
        <div
          className="yh-pop fixed bottom-0 right-0 z-[70] flex h-[100dvh] w-full flex-col overflow-hidden sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[calc(100dvh-40px)] sm:w-[420px] sm:rounded-2xl"
          style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-pop)', transformOrigin: 'bottom right' }}
        >
          {/* Faixa azul-marinho, como o topo do site Yamaha */}
          <div className="flex shrink-0 items-center gap-3 px-5 py-4 text-white" style={{ background: 'var(--yh-navy)' }}>
            <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: 'var(--yh-blue)' }}>
              <Sparkles size={17} />
            </span>
            <div className="min-w-0">
              <div className="yh-display text-[17px] font-bold uppercase leading-tight tracking-wide">Assistente Smart Dealer</div>
              <div className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--yh-green)' }} /> Lendo os números da Nippon Motos
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Fechar">
              <X size={18} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-xl px-4 py-3 text-sm leading-relaxed" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                  Olá! Sou o assistente da Nippon Motos. Pergunte sobre varejo, estoque, clientes, NPS, Kaizen ou campanhas.
                </div>
                <div className="flex flex-wrap gap-2">
                  {CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="rounded-full px-3 py-1.5 text-left text-xs hover:border-[var(--yh-blue)] hover:text-[var(--yh-blue)]"
                      style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', transition: 'color 150ms ease-out, border-color 150ms ease-out' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className="max-w-[88%] whitespace-pre-wrap rounded-xl px-4 py-2.5 text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: 'var(--yh-blue)', color: '#fff' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                >
                  {m.text}
                </div>
                {m.contato && (
                  <div className="mt-2 w-[88%] rounded-xl p-3" style={{ border: '1px solid var(--danger-border)', background: 'var(--danger-bg)' }}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.contato.nome}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.contato.moto} · {m.contato.loja} · {m.contato.telefone}</div>
                      </div>
                      <span className="shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums text-white" style={{ background: 'var(--danger)' }}>Nota {m.contato.nota}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a href={m.contato.whatsapp} target="_blank" rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white hover:brightness-110"
                        style={{ background: 'var(--yh-green)' }}>
                        <MessageCircle size={14} /> WhatsApp com mensagem pronta
                      </a>
                      <a href={m.contato.tel}
                        className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white hover:brightness-110"
                        style={{ background: 'var(--yh-navy)' }}>
                        <Phone size={14} /> Ligar
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-xl px-4 py-3.5" style={{ background: 'var(--bg-elevated)' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: 'var(--text-tertiary)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Campo de pergunta */}
          <div className="shrink-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="yh-search flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5" style={{ border: '1px solid var(--border-strong)', background: 'var(--bg-main)' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder="Pergunte sobre o negócio..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
                style={{ background: 'var(--yh-blue)' }}
                aria-label="Enviar"
              >
                <ArrowUp size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
