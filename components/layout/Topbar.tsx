'use client'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const LOJAS = ['Grupo Nippon', 'Bragança Paulista', 'Extrema']

interface TopbarProps {
  loja: string
  onLojaChange: (loja: string) => void
}

export function Topbar({ loja, onLojaChange }: TopbarProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="h-14 border-b border-[#1F2937] bg-[#111827] flex items-center justify-between px-6 shrink-0">
      {/* Seletor de loja */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-[#1F2937] hover:bg-[#374151] rounded-lg px-4 py-2 text-sm text-white transition-colors"
        >
          <span>{loja}</span>
          <ChevronDown size={14} className={clsx('transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 bg-[#1F2937] border border-[#374151] rounded-lg shadow-xl overflow-hidden z-50">
            {LOJAS.map(l => (
              <button
                key={l}
                onClick={() => { onLojaChange(l); setOpen(false) }}
                className={clsx(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors',
                  l === loja
                    ? 'bg-[#003087]/20 text-[#60A5FA]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[#374151]'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-white">{session?.user?.name}</div>
          <div className="text-xs text-[#9CA3AF] capitalize">
            {((session?.user as { role?: string })?.role ?? '').toLowerCase()}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-[#9CA3AF] hover:text-white transition-colors"
          title="Sair"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
