'use client'
import { useState, useRef, useEffect } from 'react'
import { Wrench, Send } from 'lucide-react'

const CHIPS = [
  'Folga da válvula Fazer 250',
  'Troca de óleo Fazer 250',
  'Pressão dos pneus',
  'Ajuste da corrente',
  'Sangria do freio ABS',
]

interface Message {
  role: 'user' | 'ai'
  text: string
}

export default function AssistentePage() {
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
      const res = await fetch('/api/assistente-tecnico', {
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
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 8rem)' }}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assistente Técnico</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Especialista em motocicletas Yamaha · Manual de Serviço Oficial
        </p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#003087]/20 flex items-center justify-center">
            <Wrench size={16} className="text-[#60A5FA]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Assistente Técnico Yamaha</div>
            <div className="text-xs text-[#10B981]">● Especializado Fazer 250 ABS</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {msgs.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Olá mecânico! Tenho acesso ao Manual de Serviço oficial Yamaha. Posso responder
                sobre especificações técnicas, procedimentos e torques.
              </p>
              <div className="flex flex-wrap gap-2">
                {CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="text-xs bg-slate-100 hover:bg-[#374151] text-slate-400 hover:text-slate-900 px-3 py-1.5 rounded-full transition-colors"
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
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#003087] text-slate-900'
                    : 'bg-slate-100 text-[#E5E7EB]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-xl px-4 py-3">
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
        <div className="p-4 border-t border-slate-200 shrink-0">
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
              placeholder="Pergunte sobre manutenção, especificações ou procedimentos..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-[#4B5563] focus:outline-none focus:border-[#003087]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-lg bg-[#003087] hover:bg-[#004db3] disabled:opacity-50 flex items-center justify-center transition-colors shrink-0"
              aria-label="Enviar"
            >
              <Send size={14} className="text-slate-900" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
