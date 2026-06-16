'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

const CHIPS = [
  'Como está o varejo hoje?',
  'Qual estoque precisa de ação urgente?',
  'Onde estamos no ranking regional?',
  'Quanto posso ganhar de prêmio?',
  'O que fazer para bater a meta?',
]

interface Message {
  role: 'user' | 'ai'
  text: string
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      setMsgs(prev => [...prev, { role: 'ai', text: data.message ?? 'Erro ao processar.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: 'Erro de conexão.' }])
    }
    setLoading(false)
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#003087] hover:bg-[#004db3] shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Abrir assistente"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 w-[420px] h-[560px] bg-[#111827] border border-[#1F2937] rounded-2xl shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#003087] flex items-center justify-center">
                <MessageCircle size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Assistente Smart Dealer</div>
                <div className="text-xs text-[#10B981]">● Online</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[#9CA3AF] hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-[#9CA3AF]">
                  Olá! Sou o assistente da Nippon Motos. Posso ajudar com análises de varejo, estoque e indicadores.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="text-xs bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white px-3 py-1.5 rounded-full transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#003087] text-white'
                      : 'bg-[#1F2937] text-[#E5E7EB]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1F2937] rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#1F2937] shrink-0">
            <div className="flex gap-2">
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
                className="flex-1 bg-[#0A0E1A] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#003087]"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-lg bg-[#003087] hover:bg-[#004db3] disabled:opacity-50 flex items-center justify-center transition-colors shrink-0"
                aria-label="Enviar"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
