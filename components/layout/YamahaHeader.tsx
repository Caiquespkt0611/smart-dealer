'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MapPin, ChevronDown, Search, CircleUserRound, Menu, X, ArrowUpRight, LogOut, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { navItems, GROUP_ORDER, LOJAS, type NavItem } from './nav'

const SUGESTOES = ['Estoque', 'Varejo', 'Leads', 'Kaizen', 'Crédito', 'NPS']

function normaliza(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/* Placeholder que troca a palavra entre aspas, como o "Buscar por Motos" do site. */
function usePlaceholderRotativo() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI(v => (v + 1) % SUGESTOES.length), 2600)
    return () => clearInterval(t)
  }, [])
  return `Buscar por "${SUGESTOES[i]}"`
}

function LojaSelector({ loja, onLojaChange }: { loja: string; onLojaChange: (l: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[13px] text-white/90 hover:text-white"
        style={{ transition: 'color 150ms ease-out' }}
      >
        <MapPin size={14} />
        <span className="hidden sm:inline">Loja:</span>
        <span className="font-semibold">{loja}</span>
        <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease-out' }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="yh-pop absolute right-0 top-full mt-3 z-[61] w-56 rounded-xl overflow-hidden py-1.5"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-pop)' }}>
            {LOJAS.map(l => (
              <button
                key={l}
                onClick={() => { onLojaChange(l); setOpen(false) }}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-[var(--bg-elevated)]"
                style={{ color: l === loja ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: l === loja ? 600 : 400 }}
              >
                {l}
                {l === loja && <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--yh-blue)' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BuscaModulos({ itens }: { itens: NavItem[] }) {
  const router = useRouter()
  const placeholder = usePlaceholderRotativo()
  const [q, setQ] = useState('')
  const [foco, setFoco] = useState(false)
  const [sel, setSel] = useState(0)
  const ref = useRef<HTMLInputElement>(null)

  const resultados = useMemo(() => {
    if (!q.trim()) return []
    const n = normaliza(q)
    return itens.filter(i => normaliza(i.label + ' ' + i.hint + ' ' + i.group).includes(n)).slice(0, 6)
  }, [q, itens])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function ir(item?: NavItem) {
    if (!item) return
    router.push(item.href)
    setQ(''); ref.current?.blur()
  }

  return (
    <div className="relative w-full max-w-[340px] lg:max-w-[230px] 2xl:max-w-[340px]">
      <div className="yh-search flex items-center gap-2.5 h-12 rounded-full px-5">
        <input
          ref={ref}
          value={q}
          onChange={e => { setQ(e.target.value); setSel(0) }}
          onFocus={() => setFoco(true)}
          onBlur={() => setTimeout(() => setFoco(false), 120)}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, resultados.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
            if (e.key === 'Enter') ir(resultados[sel])
            if (e.key === 'Escape') { setQ(''); ref.current?.blur() }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Buscar módulo"
        />
        <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
      </div>
      {foco && resultados.length > 0 && (
        <div className="yh-pop absolute left-0 right-0 top-full mt-2 z-[61] rounded-2xl overflow-hidden py-2"
          style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-pop)' }}>
          {resultados.map((r, i) => {
            const Icon = r.icon
            return (
              <button
                key={r.href}
                onMouseDown={() => ir(r)}
                onMouseEnter={() => setSel(i)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                style={{ background: i === sel ? 'var(--bg-elevated)' : 'transparent' }}
              >
                <Icon size={17} style={{ color: 'var(--yh-blue)' }} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.label}</span>
                  <span className="block text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{r.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MegaMenu({
  itens, grupoInicial, onClose,
}: { itens: NavItem[]; grupoInicial: string; onClose: () => void }) {
  const [grupo, setGrupo] = useState(grupoInicial)
  const pathname = usePathname()
  useEffect(() => setGrupo(grupoInicial), [grupoInicial])
  const grupos = GROUP_ORDER.filter(g => itens.some(i => i.group === g))
  const lista = grupo === 'Todos' ? itens : itens.filter(i => i.group === grupo)

  return (
    <div className="yh-mega absolute left-0 right-0 top-full z-50 border-t"
      style={{ background: 'var(--bg-mega)', borderColor: 'var(--border)', boxShadow: '0 30px 60px -30px rgba(7,6,51,.35)' }}>
      <div className="mx-auto max-w-[1600px] flex max-h-[calc(100dvh-112px)] md:max-h-[calc(100dvh-128px)]">
        <aside className="hidden md:block w-60 shrink-0 py-8 pl-10 pr-6 border-r" style={{ borderColor: 'var(--border)' }}>
          {['Todos', ...grupos].map(g => (
            <button
              key={g}
              onMouseEnter={() => setGrupo(g)}
              onClick={() => setGrupo(g)}
              className="block w-full text-left py-2 yh-display text-[19px] uppercase tracking-wide"
              style={{ color: g === grupo ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: g === grupo ? 700 : 500, transition: 'color 150ms ease-out' }}
            >
              {g === 'Todos' ? <span className="normal-case font-sans text-[18px] font-bold" style={{ color: g === grupo ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>Todos</span> : g}
            </button>
          ))}
        </aside>

        <div className="flex-1 overflow-y-auto px-5 md:px-10 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="yh-display text-[18px] uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                {grupo === 'Todos' ? <>Todos os <b>módulos</b></> : <>{grupo}</>}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{lista.length} {lista.length === 1 ? 'módulo' : 'módulos'} liberados para o seu acesso</p>
            </div>
            <button onClick={onClose} aria-label="Fechar menu" className="p-1" style={{ color: 'var(--text-secondary)' }}>
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* celular: grupos em pílulas */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1">
            {['Todos', ...grupos].map(g => (
              <button key={g} onClick={() => setGrupo(g)} className="shrink-0 px-3.5 py-1.5 rounded-full text-sm"
                style={{ background: g === grupo ? 'var(--yh-navy)' : 'var(--bg-elevated)', color: g === grupo ? '#fff' : 'var(--text-secondary)' }}>
                {g}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {lista.map(item => {
              const Icon = item.icon
              const ativo = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={onClose}
                  className="yh-tile group relative flex flex-col items-center text-center rounded-xl px-4 pt-7 pb-6">
                  <Icon size={44} strokeWidth={1.25} className="yh-tile-icon" style={{ color: ativo ? 'var(--yh-blue)' : 'var(--text-primary)' }} />
                  <span className="mt-4 h-[2px] w-24 rounded-full" style={{ background: 'var(--yh-blue)' }} />
                  <span className="mt-4 text-[14px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                  <span className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{item.hint}</span>
                  <ArrowUpRight size={16} className="absolute right-3 top-3 opacity-0 group-hover:opacity-100" style={{ color: 'var(--yh-blue)', transition: 'opacity 150ms ease-out' }} />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserMenu() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const nome = session?.user?.name ?? ''
  const role = ((session?.user as { role?: string })?.role ?? '').toLowerCase()
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="Minha conta" className="p-1.5" style={{ color: 'var(--text-primary)' }}>
        <CircleUserRound size={30} strokeWidth={1.5} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="yh-pop absolute right-0 top-full mt-3 z-[61] w-64 rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-pop)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nome}</p>
              <p className="text-sm capitalize" style={{ color: 'var(--text-tertiary)' }}>{role}</p>
            </div>
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            </button>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--bg-elevated)]" style={{ color: 'var(--text-secondary)' }}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function YamahaHeader({ loja, onLojaChange }: { loja: string; onLojaChange: (l: string) => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role ?? ''
  const itens = navItems.filter(i => i.roles.includes(role))
  const grupos = GROUP_ORDER.filter(g => itens.some(i => i.group === g))
  const grupoAtual = itens.find(i => i.href === pathname)?.group
  const [mega, setMega] = useState<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMega(null) }, [pathname])
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMega(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function abrirPorHover(g: string) {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setMega(g), 140)
  }
  function cancelarHover() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
  }

  return (
    <header className="relative z-50 shrink-0" onMouseLeave={() => { cancelarHover() }}>
      {/* Faixa azul-marinho */}
      <div className="h-10" style={{ background: 'var(--yh-navy)' }}>
        <div className="mx-auto max-w-[1600px] h-full px-4 md:px-10 flex items-center justify-between">
          <p className="text-[13px] text-white/90 truncate">
            <span className="hidden sm:inline">Inteligência de gestão para a rede Yamaha</span>
            <span className="sm:hidden">Smart Dealer</span>
          </p>
          <LojaSelector loja={loja} onLojaChange={onLojaChange} />
        </div>
      </div>

      {/* Barra principal */}
      <div className="yh-bar border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-[1600px] h-[72px] md:h-[88px] px-4 md:px-10 flex items-center gap-5 2xl:gap-10">
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0" aria-label="Início">
            <img src="/yamaha/yamaha-logo.png" alt="Yamaha" className="h-9 w-auto yh-logo" />
            <span className="hidden sm:block h-8 w-px" style={{ background: 'var(--border-strong)' }} />
            <span className="hidden sm:block yh-display text-[17px] leading-none uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
              Smart<br /><b>Dealer</b>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0 xl:gap-1 2xl:gap-3 flex-1">
            {grupos.map(g => {
              const ativo = grupoAtual === g
              const aberto = mega === g
              return (
                <button
                  key={g}
                  onMouseEnter={() => abrirPorHover(g)}
                  onFocus={() => setMega(g)}
                  onClick={() => setMega(m => (m === g ? null : g))}
                  className="yh-navlink relative px-2 2xl:px-2.5 py-2 yh-display text-[15px] 2xl:text-[16px] uppercase tracking-[0.04em] whitespace-nowrap"
                  data-on={ativo || aberto ? '1' : undefined}
                  aria-expanded={aberto}
                >
                  {g}
                </button>
              )
            })}
          </nav>

          <div className="hidden md:flex flex-1 lg:flex-none justify-end">
            <BuscaModulos itens={itens} />
          </div>

          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <UserMenu />
            <button onClick={() => setMega(m => (m ? null : 'Todos'))} aria-label="Todos os módulos" className="p-1.5" style={{ color: 'var(--text-primary)' }}>
              {mega ? <X size={30} strokeWidth={1.5} /> : <Menu size={30} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {mega && (
        <>
          <div className="fixed inset-0 top-[112px] md:top-[128px] z-40 yh-scrim" onClick={() => setMega(null)} />
          <div onMouseEnter={cancelarHover}>
            <MegaMenu itens={itens} grupoInicial={mega} onClose={() => setMega(null)} />
          </div>
        </>
      )}
    </header>
  )
}
