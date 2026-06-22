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

  const isDark = theme === 'dark'

  return (
    <header
      className="h-14 border-b flex items-center justify-between px-6 shrink-0"
      style={{
        backgroundColor: isDark ? '#111827' : '#FFFFFF',
        borderColor: isDark ? '#1F2937' : '#E2E8F0',
      }}
    >
      {/* Seletor de loja */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#F1F5F9',
            border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
            color: isDark ? '#F9FAFB' : '#0F172A',
          }}
        >
          <Building2 size={13} style={{ color: isDark ? '#9CA3AF' : '#64748B' }} />
          <span>{loja}</span>
          <ChevronDown
            size={13}
            style={{
              color: isDark ? '#9CA3AF' : '#64748B',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
        {open && (
          <div
            className="absolute top-full left-0 mt-1 rounded-xl shadow-lg overflow-hidden z-50 w-48 border"
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E2E8F0',
            }}
          >
            {LOJAS.map(l => (
              <button
                key={l}
                onClick={() => { onLojaChange(l); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                style={{
                  backgroundColor: l === loja ? (isDark ? '#003087' : '#EFF6FF') : 'transparent',
                  color: l === loja ? (isDark ? '#60A5FA' : '#003087') : isDark ? '#9CA3AF' : '#475569',
                  fontWeight: l === loja ? '600' : '400',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Center - User info + Theme toggle */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div
            className="text-sm font-semibold"
            style={{ color: isDark ? '#F9FAFB' : '#0F172A' }}
          >
            {session?.user?.name}
          </div>
          <div
            className="text-xs capitalize"
            style={{ color: isDark ? '#9CA3AF' : '#64748B' }}
          >
            {((session?.user as { role?: string })?.role ?? '').toLowerCase()}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#F1F5F9',
            color: isDark ? '#F59E0B' : '#003087',
          }}
          title={`Mudar para tema ${isDark ? 'claro' : 'escuro'}`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="transition-colors"
          style={{ color: isDark ? '#9CA3AF' : '#64748B' }}
          title="Sair"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
