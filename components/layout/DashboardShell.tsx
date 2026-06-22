'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Suspense } from 'react'

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const loja = searchParams.get('loja') ?? 'Grupo Nippon'

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
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
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
