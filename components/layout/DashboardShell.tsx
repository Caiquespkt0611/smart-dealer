'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { YamahaHeader } from './YamahaHeader'
import { Suspense } from 'react'
import { ChatWidget } from '@/components/dashboard/ChatWidget'

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
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <YamahaHeader loja={loja} onLojaChange={handleLojaChange} />
      <main className="yh-main flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] px-4 md:px-10 py-8">
          {children}
        </div>
      </main>
      <ChatWidget />
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
