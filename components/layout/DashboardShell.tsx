'use client'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [loja, setLoja] = useState('Grupo Nippon')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar loja={loja} onLojaChange={setLoja} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0E1A]">
          {children}
        </main>
      </div>
    </div>
  )
}
