'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LockKeyhole, CircleAlert, LoaderCircle } from 'lucide-react'

// Cada perfil de demonstração é apresentado como um modelo da linha, igual à vitrine do site.
const DEMO_ACCOUNTS = [
  { label: 'Titular',   email: 'titular@nippon.com',   hint: 'Vê a loja inteira',          foto: '/yamaha/m-r7.png',      chip: 'Gestão' },
  { label: 'Gerente',   email: 'gerente@nippon.com',   hint: 'Toca a operação do dia',     foto: '/yamaha/m-tracer.png',  chip: 'Gestão' },
  { label: 'Vendedor',  email: 'vendedor@nippon.com',  hint: 'Leads, CRM e playbook',      foto: '/yamaha/m-nmax.png',    chip: 'Comercial' },
  { label: 'Consultor', email: 'consultor@yamaha.com', hint: 'A visão da Yamaha na loja',  foto: '/yamaha/m-mt07.png',    chip: 'Yamaha' },
  { label: 'Mecânico',  email: 'mecanico@nippon.com',  hint: 'Assistente técnico com IA',  foto: '/yamaha/m-lander.png',  chip: 'Oficina' },
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
    document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('Email ou senha inválidos')
    else router.push('/')
  }

  const input =
    'w-full h-12 rounded-full px-5 text-[15px] outline-none bg-[#fff] text-[#111] placeholder-[#8A929C] border border-[#D0D0D5] focus:border-[#2C2CFF] focus:ring-[3px] focus:ring-[#2C2CFF]/15'

  return (
    <div className="min-h-[100dvh] bg-[#fff] text-[#111]" data-theme="light">
      {/* Faixa azul-marinho do site */}
      <div className="h-10 bg-[#070633]">
        <div className="mx-auto max-w-[1600px] h-full px-4 md:px-10 flex items-center justify-between text-[13px] text-white/90">
          <span>Um legado de paixão pelo motociclismo, agora com inteligência na gestão</span>
          <span className="hidden md:flex items-center gap-2"><LockKeyhole size={13} /> Acesso restrito à rede</span>
        </div>
      </div>

      {/* Barra branca */}
      <div className="border-b border-[#E4E4E7]">
        <div className="mx-auto max-w-[1600px] h-[88px] px-4 md:px-10 flex items-center gap-3">
          <img src="/yamaha/yamaha-logo.png" alt="Yamaha" className="h-9 w-auto" />
          <span className="h-8 w-px bg-[#D0D0D5]" />
          <span className="yh-display text-[17px] leading-none uppercase tracking-wide">Smart<br /><b>Dealer</b></span>
        </div>
      </div>

      {/* Hero com a foto de corrida */}
      <section className="relative overflow-hidden bg-[#070633]">
        <img src="/yamaha/hero-racing.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(7,6,51,.92) 0%, rgba(7,6,51,.72) 38%, rgba(7,6,51,.10) 70%, rgba(7,6,51,0) 100%)' }} />

        <div className="relative mx-auto max-w-[1600px] px-4 md:px-10 py-14 lg:py-0 lg:min-h-[calc(100dvh-128px)] grid lg:grid-cols-[1fr_440px] gap-10 items-center">
          <div className="text-white yh-reveal">
            <h1 className="yh-title text-[clamp(44px,6.4vw,96px)] text-white">
              A concessionária<br />inteira <span className="text-white/55">numa tela</span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-white/85">
              Varejo, estoque, leads, NPS e pós-vendas com os dados reais da loja.
              A IA lê os números e diz qual é a próxima ação.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-white/85">
              <span><b className="yh-display text-[28px] text-white mr-1.5">25</b>módulos</span>
              <span><b className="yh-display text-[28px] text-white mr-1.5">5</b>perfis de acesso</span>
              <span><b className="yh-display text-[28px] text-white mr-1.5">60 s</b>para ler a planilha nova</span>
            </div>
          </div>

          <div id="login-card" className="yh-reveal rounded-2xl bg-[#fff] p-7 sm:p-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,.55)]" style={{ animationDelay: '80ms' }}>
            <h2 className="yh-title text-[34px]">Entrar no <span className="yh-mute">sistema</span></h2>
            <p className="mt-2 text-[15px] text-[#596573]">Use o acesso da sua concessionária.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block">
                <span className="block text-[13px] font-medium text-[#495461] mb-1.5 pl-1">Email</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="titular@nippon.com" className={input} required />
              </label>
              <label className="block">
                <span className="block text-[13px] font-medium text-[#495461] mb-1.5 pl-1">Senha</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={input} required />
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm bg-[#E40011]/[.07] text-[#C4000F]">
                  <CircleAlert size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#070633] text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#15146B] active:scale-[.98]"
                style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}
              >
                {loading ? <><LoaderCircle size={17} className="animate-spin" /> Entrando</> : <>Entrar <ArrowRight size={17} /></>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#E4E4E7]">
              <p className="text-[13px] text-[#596573] mb-2.5">Demonstração em um clique:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map(d => (
                  <button key={d.email} type="button" onClick={() => fillDemo(d.email)}
                    className="px-3.5 py-1.5 rounded-full text-[13px] font-medium border"
                    style={{
                      borderColor: email === d.email ? '#2C2CFF' : '#D0D0D5',
                      color: email === d.email ? '#2C2CFF' : '#495461',
                      background: email === d.email ? 'rgba(44,44,255,.06)' : '#fff',
                      transition: 'border-color 150ms ease-out, color 150ms ease-out',
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vitrine de perfis, no formato da vitrine de modelos */}
      <section className="mx-auto max-w-[1600px] px-4 md:px-10 py-16">
        <h2 className="yh-title text-center text-[clamp(34px,4vw,56px)]">Escolha o seu <span className="yh-mute">acesso</span></h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {DEMO_ACCOUNTS.map(d => (
            <button key={d.email} type="button" onClick={() => fillDemo(d.email)} className="yh-product group text-left p-4 pb-5">
              <span className="yh-chip">{d.chip}</span>
              <div className="aspect-[4/3] flex items-center justify-center overflow-hidden">
                <img src={d.foto} alt="" className="yh-photo max-h-full w-auto object-contain" />
              </div>
              <p className="yh-display text-[20px] font-bold uppercase tracking-wide">{d.label}</p>
              <div className="mt-1 flex items-center justify-between text-[14px] text-[#596573]">
                <span>{d.hint}</span>
                <ArrowRight size={16} className="text-[#2C2CFF] opacity-0 group-hover:opacity-100" style={{ transition: 'opacity 150ms ease-out' }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="bg-[#070633] text-white/70 text-[13px]">
        <div className="mx-auto max-w-[1600px] px-4 md:px-10 py-6 flex flex-wrap gap-3 justify-between">
          <span>Smart Dealer · Yamahaway 2026</span>
          <span>Conexão segura</span>
        </div>
      </footer>
    </div>
  )
}
