'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E1A]">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#003087] flex items-center justify-center">
              <span className="text-white font-bold text-xl">Y</span>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold text-white">Smart Dealer</div>
              <div className="text-xs text-[#9CA3AF] uppercase tracking-widest">Nippon Motos</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na plataforma</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-[#9CA3AF] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="titular@nippon.com"
                className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded-lg px-4 py-3 text-white placeholder-[#4B5563] focus:outline-none focus:border-[#003087] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-[#9CA3AF] mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0E1A] border border-[#1F2937] rounded-lg px-4 py-3 text-white placeholder-[#4B5563] focus:outline-none focus:border-[#003087] transition-colors"
                required
              />
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-4 py-3 text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#003087] hover:bg-[#004db3] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-[#1F2937]">
            <p className="text-xs text-[#4B5563] mb-3">Credenciais demo:</p>
            <div className="space-y-1 text-xs text-[#6B7280]">
              <div>titular@nippon.com / yamaha2026</div>
              <div>gerente@nippon.com / yamaha2026</div>
              <div>mecanico@nippon.com / yamaha2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
