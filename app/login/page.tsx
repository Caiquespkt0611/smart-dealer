'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const TERMINAL_LINES = [
  'Iniciando Smart Dealer...',
  'Conectando ao banco de dados...',
  'Sincronizando indicadores de varejo...',
  'Carregando análise de estoque...',
  'Processando dados de leads...',
  'Atualizando métricas de NPS...',
  'Analisando desempenho regional...',
  'IA pronta. Bem-vindo.',
]

function TerminalTypewriter() {
  const [displayed, setDisplayed] = useState('')
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const blinkTimer = setInterval(() => setBlink(b => !b), 530)
    return () => clearInterval(blinkTimer)
  }, [])

  useEffect(() => {
    const current = TERMINAL_LINES[lineIndex]
    let delay: number

    if (!deleting && charIndex < current.length) {
      delay = 38 + Math.random() * 28
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex + 1))
        setCharIndex(c => c + 1)
      }, delay)
      return () => clearTimeout(t)
    }

    if (!deleting && charIndex === current.length) {
      const t = setTimeout(() => setDeleting(true), 1800)
      return () => clearTimeout(t)
    }

    if (deleting && charIndex > 0) {
      delay = 18
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIndex - 1))
        setCharIndex(c => c - 1)
      }, delay)
      return () => clearTimeout(t)
    }

    if (deleting && charIndex === 0) {
      setDeleting(false)
      setLineIndex(i => (i + 1) % TERMINAL_LINES.length)
    }
  }, [charIndex, deleting, lineIndex])

  return (
    <div
      className="rounded-xl px-4 py-3 font-mono text-[13px] leading-relaxed"
      style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60" />
        <span className="text-[#4B5563] text-[10px] ml-1 uppercase tracking-wider">smart-dealer · sistema</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[#0066ff] select-none">›</span>
        <span className="text-[#93c5fd]">{displayed}</span>
        <span
          className="inline-block w-[7px] h-[14px] ml-0.5"
          style={{
            background: '#60a5fa',
            opacity: blink ? 1 : 0,
            transition: 'opacity 0.1s',
          }}
        />
      </div>
    </div>
  )
}


const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    text: 'KPIs e projeção de varejo em tempo real',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    text: 'IA analítica com recomendações automáticas',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    text: 'Controle de estoque e alertas de cobertura',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    text: 'Assistente técnico especializado em Yamaha',
  },
]

const DEMO_ACCOUNTS = [
  { label: 'Titular', email: 'titular@nippon.com', hint: 'vê tudo' },
  { label: 'Gerente', email: 'gerente@nippon.com', hint: 'gestão' },
  { label: 'Vendedor', email: 'vendedor@nippon.com', hint: 'comercial' },
  { label: 'Consultor', email: 'consultor@yamaha.com', hint: 'analítico' },
  { label: 'Mecânico', email: 'mecanico@nippon.com', hint: 'técnico' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail)
    setPassword('yamaha2026')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('Email ou senha inválidos')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex bg-[#070A10]">
      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col justify-center p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #001a52 0%, #003087 45%, #0a1a3a 100%)',
        }}
      >
        {/* Decorative glow circles */}
        <div
          className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0066ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0044c8 0%, transparent 70%)' }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Headline */}
        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            Gestão inteligente{' '}
            <span className="text-[#60a5fa]">começa</span>
            <br />
            com dados reais.
          </h1>
          <p className="text-[#93bce8] text-base leading-relaxed mb-10 max-w-sm">
            Varejo, estoque, leads e NPS em um único cockpit. Com IA que interpreta
            e recomenda ações concretas.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#60a5fa' }}
                >
                  {f.icon}
                </span>
                <span className="text-[#c6ddf5] text-sm">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Terminal typewriter */}
          <TerminalTypewriter />

          {/* Quote */}
          <div className="mt-8">
            <div className="h-px w-12 bg-[#0066ff] mb-4" />
            <p className="text-[#5a82b0] text-xs italic leading-relaxed max-w-xs">
              "Quem controla os dados, controla o resultado."
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
        {/* Profundidade: glows + grid sutil (espelha o lado esquerdo) */}
        <div
          className="absolute top-[-140px] right-[-100px] w-[460px] h-[460px] rounded-full opacity-[0.12] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0066ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-120px] left-[-100px] w-[380px] h-[380px] rounded-full opacity-[0.08] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #003087 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/logo-smart-dealer.png"
              alt="Smart Dealer"
              className="h-24 w-auto object-contain"
            />
          </div>

          {/* Card glass */}
          <div
            className="rounded-2xl p-7 sm:p-8"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h2>
            <p className="text-[#7B8AA0] text-sm mb-7">
              Entre para acompanhar sua concessionária
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="titular@nippon.com"
                  className="w-full bg-[#0B0F18] border border-[#212B3D] rounded-xl px-4 py-3 text-white placeholder-[#374151] text-sm focus:outline-none focus:border-[#3B6FE0] focus:ring-2 focus:ring-[#003087]/40 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#9CA3AF] mb-1.5 font-medium">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0F18] border border-[#212B3D] rounded-xl px-4 py-3 text-white placeholder-[#374151] text-sm focus:outline-none focus:border-[#3B6FE0] focus:ring-2 focus:ring-[#003087]/40 transition-all"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-[#F87171] text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-xl text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group mt-1"
                style={{ background: 'linear-gradient(135deg, #003087, #0044c8)', boxShadow: '0 8px 24px -6px rgba(0,68,200,0.5)' }}
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #0044c8, #0055e0)' }}
                />
                <span className="relative">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 00-9-9" />
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    'Entrar'
                  )}
                </span>
              </button>
            </form>

            {/* Acesso de demonstração */}
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-wider text-[#5A6B85] mb-2.5 text-center">
                Acesso de demonstração · 1 clique
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {DEMO_ACCOUNTS.map(d => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => fillDemo(d.email)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)' }}
                  >
                    <span className="font-medium text-[#cfe0f5]">{d.label}</span>
                    <span className="text-[10px] text-[#5A6B85] group-hover:text-[#93bce8]">{d.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer seguro */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5A6B85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span className="text-[11px] text-[#5A6B85]">Conexão segura · Yamahaway 2026</span>
          </div>
        </div>
      </div>
    </div>
  )
}

