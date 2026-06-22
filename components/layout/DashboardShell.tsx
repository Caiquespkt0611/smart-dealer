'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Suspense } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const loja = searchParams.get('loja') ?? 'Grupo Nippon'

  const isDark = theme === 'dark'

  function handleLojaChange(novaLoja: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('loja', novaLoja)
    router.push(pathname + '?' + params.toString())
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar loja={loja} onLojaChange={handleLojaChange} />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: isDark ? '#0A0E1A' : '#F8FAFC' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashboardShellInner>{children}</DashboardShellInner>
    </Suspense>
  )
}
