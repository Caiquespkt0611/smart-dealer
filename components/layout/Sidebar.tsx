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
  { href: '/dashboard', label: 'Dashboard',         icon: LayoutDashboard, roles: ['TITULAR', 'GERENTE', 'MECANICO'] },
  { href: '/varejo',    label: 'Varejo',             icon: ShoppingCart,    roles: ['TITULAR', 'GERENTE'] },
  { href: '/estoque',   label: 'Estoque',            icon: Package,         roles: ['TITULAR', 'GERENTE'] },
  { href: '/leads',     label: 'Leads',              icon: Users,           roles: ['TITULAR', 'GERENTE'] },
  { href: '/nps',       label: 'NPS',                icon: Star,            roles: ['TITULAR', 'GERENTE'] },
  { href: '/assistente',label: 'Assistente Técnico', icon: Wrench,          roles: ['TITULAR', 'GERENTE', 'MECANICO'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role ?? ''
  const visibleItems = navItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #002070 0%, #003087 100%)' }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center justify-center">
        <img
          src="/logo-smart-dealer.png"
          alt="Smart Dealer"
          className="h-16 w-auto object-contain brightness-0 invert"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-white/50'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <TrendingUp size={12} className="text-white/30" />
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Yamahaway 2026</span>
        </div>
      </div>
    </aside>
  )
}
