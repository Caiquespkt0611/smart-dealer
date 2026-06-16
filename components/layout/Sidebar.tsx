'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Star,
  Wrench,
  TrendingUp,
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['TITULAR', 'GERENTE', 'MECANICO'] },
  { href: '/varejo', label: 'Varejo', icon: ShoppingCart, roles: ['TITULAR', 'GERENTE'] },
  { href: '/estoque', label: 'Estoque', icon: Package, roles: ['TITULAR', 'GERENTE'] },
  { href: '/leads', label: 'Leads', icon: Users, roles: ['TITULAR', 'GERENTE'] },
  { href: '/nps', label: 'NPS', icon: Star, roles: ['TITULAR', 'GERENTE'] },
  { href: '/assistente', label: 'Assistente Técnico', icon: Wrench, roles: ['TITULAR', 'GERENTE', 'MECANICO'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role ?? ''

  const visibleItems = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-60 shrink-0 bg-[#111827] border-r border-[#1F2937] flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center">
            <span className="text-white font-bold text-sm">Y</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Smart Dealer</div>
            <div className="text-[10px] text-[#9CA3AF] uppercase tracking-widest">Nippon Motos</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-[#003087]/20 text-[#60A5FA] font-medium'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]'
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1F2937]">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#003087]" />
          <span className="text-[10px] text-[#4B5563] uppercase tracking-widest">Yamahaway 2026</span>
        </div>
      </div>
    </aside>
  )
}
