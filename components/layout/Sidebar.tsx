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
  PieChart,
  Award,
  GraduationCap,
  Megaphone,
  Contact,
  CalendarClock,
  BookOpen,
  Activity,
  Percent,
  Wallet,
  Ticket,
  MessageCircle,
  Landmark,
  Shield,
  PiggyBank,
  Gem,
  ClipboardList,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',          icon: LayoutDashboard, roles: ['TITULAR', 'GERENTE', 'MECANICO', 'CONSULTOR'], group: 'Visão Geral' },
  { href: '/varejo',       label: 'Varejo',             icon: ShoppingCart,    roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Visão Geral' },
  { href: '/performance',  label: 'Performance + PDCA', icon: Activity,        roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/k2',           label: 'K2 · Absorção',      icon: Percent,         roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/credito',      label: 'Linha de Crédito',   icon: Wallet,          roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/vouchers',     label: 'Campanhas Yamaha',   icon: Ticket,          roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/market-share', label: 'Market Share',       icon: PieChart,        roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/kaizen',       label: 'Kaizen',             icon: Award,           roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/treinamento',  label: 'Treinamento',        icon: GraduationCap,   roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência' },
  { href: '/crm',          label: 'CRM de Leads',       icon: Contact,         roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Comercial' },
  { href: '/atendimento',  label: 'Atendimento Diário', icon: MessageCircle,   roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Comercial' },
  { href: '/campanhas',    label: 'Campanhas IA',       icon: Megaphone,       roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Comercial' },
  { href: '/playbook',     label: 'Playbook de Vendas', icon: BookOpen,        roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Comercial' },
  { href: '/banco',        label: 'Banco Yamaha',       icon: Landmark,        roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Banco & Fidelização' },
  { href: '/seguros',      label: 'Seguros',            icon: Shield,          roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Banco & Fidelização' },
  { href: '/consorcio',    label: 'Consórcio',          icon: PiggyBank,       roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Banco & Fidelização' },
  { href: '/premya',       label: 'Premya',             icon: Gem,             roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Banco & Fidelização' },
  { href: '/pos-vendas',   label: 'Pós-Vendas',         icon: CalendarClock,   roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Operação' },
  { href: '/estoque',      label: 'Estoque',            icon: Package,         roles: ['TITULAR', 'GERENTE'],                          group: 'Operação' },
  { href: '/leads',        label: 'Leads',              icon: Users,           roles: ['TITULAR', 'GERENTE'],                          group: 'Operação' },
  { href: '/nps',          label: 'NPS',                icon: Star,            roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Operação' },
  { href: '/assistente',   label: 'Assistente Técnico', icon: Wrench,          roles: ['TITULAR', 'GERENTE', 'MECANICO', 'VENDEDOR'],  group: 'Operação' },
  { href: '/pesquisa',     label: 'Voz do Cliente',     icon: ClipboardList,   roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Yamahaway' },
  { href: '/yamahaway',    label: 'Dossiê da Banca',    icon: Award,           roles: ['TITULAR', 'CONSULTOR'],                        group: 'Yamahaway' },
]

const GROUP_ORDER = ['Visão Geral', 'Inteligência', 'Comercial', 'Banco & Fidelização', 'Operação', 'Yamahaway']

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
      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {GROUP_ORDER.map(group => {
          const items = visibleItems.filter(i => i.group === group)
          if (!items.length) return null
          return (
            <div key={group} className="space-y-1">
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--sidebar-muted)' }}>
                {group}
              </p>
              {items.map(item => {
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
            </div>
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
