'use client'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown, Building2 } from 'lucide-react'
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
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
      {/* Seletor de loja */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 font-medium transition-colors"
        >
          <Building2 size={13} className="text-slate-400" />
          <span>{loja}</span>
          <ChevronDown size={13} className={clsx('text-slate-400 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 w-48">
            {LOJAS.map(l => (
              <button
                key={l}
                onClick={() => { onLojaChange(l); setOpen(false) }}
                className={clsx(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors',
                  l === loja
                    ? 'bg-blue-50 text-[#003087] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
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
          <div className="text-sm font-semibold text-slate-900">{session?.user?.name}</div>
          <div className="text-xs text-slate-400 capitalize">
            {((session?.user as { role?: string })?.role ?? '').toLowerCase()}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
          title="Sair"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
