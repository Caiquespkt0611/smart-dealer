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
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard, roles: ['TITULAR', 'GERENTE', 'MECANICO'] },
  { href: '/varejo',     label: 'Varejo',             icon: ShoppingCart,    roles: ['TITULAR', 'GERENTE'] },
  { href: '/estoque',    label: 'Estoque',            icon: Package,         roles: ['TITULAR', 'GERENTE'] },
  { href: '/leads',      label: 'Leads',              icon: Users,           roles: ['TITULAR', 'GERENTE'] },
  { href: '/nps',        label: 'NPS',                icon: Star,            roles: ['TITULAR', 'GERENTE'] },
  { href: '/assistente', label: 'Assistente Técnico', icon: Wrench,          roles: ['TITULAR', 'GERENTE', 'MECANICO'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role ?? ''
  const visibleItems = navItems.filter(item => item.roles.includes(role))

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-full border-r"
      style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 flex items-center justify-center border-b" style={{ borderColor: 'var(--border)' }}>
        <img
          src="/logo-smart-dealer.png"
          alt="Smart Dealer"
          className="h-12 w-auto object-contain"
          style={{ filter: 'var(--logo-filter)' }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--sidebar-muted)' }}>
          Menu
        </p>
        {visibleItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--sidebar-item)',
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full"
                  style={{ backgroundColor: 'var(--yamaha-blue)' }}
                />
              )}
              <Icon size={17} style={{ color: active ? 'var(--accent)' : 'var(--sidebar-icon)' }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--ok)' }} />
          <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--sidebar-muted)' }}>
            Yamahaway 2026
          </span>
        </div>
      </div>
    </aside>
  )
}
