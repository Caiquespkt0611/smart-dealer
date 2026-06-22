'use client'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown, Building2, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'

const LOJAS = ['Grupo Nippon', 'Bragança Paulista', 'Extrema']

interface TopbarProps {
  loja: string
  onLojaChange: (loja: string) => void
}

export function Topbar({ loja, onLojaChange }: TopbarProps) {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const role = ((session?.user as { role?: string })?.role ?? '').toLowerCase()
  const isDark = theme === 'dark'

  return (
    <header
      className="h-16 border-b flex items-center justify-between px-6 shrink-0"
      style={{ backgroundColor: 'var(--topbar-bg)', borderColor: 'var(--border)', backdropFilter: 'blur(8px)' }}
    >
      {/* Seletor de loja */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <Building2 size={14} style={{ color: 'var(--accent)' }} />
          <span>{loja}</span>
          <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              className="absolute top-full left-0 mt-2 rounded-xl overflow-hidden z-50 w-52"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-card)' }}
            >
              {LOJAS.map(l => (
                <button
                  key={l}
                  onClick={() => { onLojaChange(l); setOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor: l === loja ? 'rgba(91,157,255,0.12)' : 'transparent',
                    color: l === loja ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: l === loja ? 600 : 400,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User + ações */}
      <div className="flex items-center gap-3">
        {/* Toggle de tema */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: isDark ? '#FBBF24' : '#1E5FE8' }}
          title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="text-right ml-1">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {session?.user?.name}
          </div>
          <div className="text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>
            {role}
          </div>
        </div>
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
        >
          {(session?.user?.name ?? '?').charAt(0).toUpperCase()}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          title="Sair"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
