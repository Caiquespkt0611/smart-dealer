import {
  LayoutDashboard, ShoppingCart, Package, Users, Star, Wrench, PieChart, Award,
  GraduationCap, Megaphone, Contact, CalendarClock, BookOpen, Activity, Percent,
  Wallet, Ticket, MessageCircle, Landmark, Shield, PiggyBank, ClipboardList, Truck, QrCode,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
  group: string
  hint: string
}

export const navItems: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',          icon: LayoutDashboard, roles: ['TITULAR', 'GERENTE', 'MECANICO', 'CONSULTOR'], group: 'Visão Geral',  hint: 'O mês da loja numa tela' },
  { href: '/varejo',       label: 'Varejo',             icon: ShoppingCart,    roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Visão Geral',  hint: 'Projeção e modelo a modelo' },
  { href: '/performance',  label: 'Performance + PDCA', icon: Activity,        roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: 'Mercado × share e plano de ação' },
  { href: '/k2',           label: 'K2 · Absorção',      icon: Percent,         roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: 'Pós-vendas paga a operação?' },
  { href: '/credito',      label: 'Linha de Crédito',   icon: Wallet,          roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: 'Semáforo e simulador de pedido' },
  { href: '/vouchers',     label: 'Campanhas Yamaha',   icon: Ticket,          roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: 'Quanto a campanha vai pagar' },
  { href: '/market-share', label: 'Market Share',       icon: PieChart,        roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: 'Yamaha contra a concorrência' },
  { href: '/kaizen',       label: 'Kaizen',             icon: Award,           roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: '22 indicadores rumo à nota máxima' },
  { href: '/treinamento',  label: 'Treinamento',        icon: GraduationCap,   roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Inteligência', hint: 'Certificações por loja' },
  { href: '/crm',          label: 'CRM de Leads',       icon: Contact,         roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Comercial',    hint: 'Funil de cada vendedor' },
  { href: '/atendimento',  label: 'Atendimento Diário', icon: MessageCircle,   roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Comercial',    hint: 'Quem atendeu, quanto demorou' },
  { href: '/campanhas',    label: 'Campanhas IA',       icon: Megaphone,       roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Comercial',    hint: 'Arte e texto em segundos' },
  { href: '/playbook',     label: 'Playbook de Vendas', icon: BookOpen,        roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Comercial',    hint: 'O roteiro que fecha venda' },
  { href: '/banco',        label: 'Banco Yamaha',       icon: Landmark,        roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Banco',        hint: 'Financiamento e recompra' },
  { href: '/seguros',      label: 'Seguros',            icon: Shield,          roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Banco',        hint: 'Renovação no tempo certo' },
  { href: '/consorcio',    label: 'Consórcio',          icon: PiggyBank,       roles: ['TITULAR', 'GERENTE', 'VENDEDOR', 'CONSULTOR'], group: 'Banco',        hint: 'Cotas e contemplados' },
  { href: '/pos-vendas',   label: 'Pós-Vendas',         icon: CalendarClock,   roles: ['TITULAR', 'GERENTE', 'VENDEDOR'],              group: 'Operação',     hint: 'Revisões que voltam para a loja' },
  { href: '/conexao',      label: 'Conexão WhatsApp',   icon: QrCode,          roles: ['TITULAR', 'GERENTE'],                          group: 'Operação',     hint: 'Parear o número da loja' },
  { href: '/estoque',      label: 'Estoque',            icon: Package,         roles: ['TITULAR', 'GERENTE'],                          group: 'Operação',     hint: 'Cobertura e sugestão de compra' },
  { href: '/distribuicao', label: 'Distribuição',       icon: Truck,           roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Operação',     hint: 'Para onde vai cada moto' },
  { href: '/leads',        label: 'Leads',              icon: Users,           roles: ['TITULAR', 'GERENTE'],                          group: 'Operação',     hint: 'Tempo, TCA e LCR' },
  { href: '/nps',          label: 'NPS',                icon: Star,            roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Operação',     hint: 'Vendas e pós-vendas' },
  { href: '/assistente',   label: 'Assistente Técnico', icon: Wrench,          roles: ['TITULAR', 'GERENTE', 'MECANICO', 'VENDEDOR'],  group: 'Operação',     hint: 'O mecânico pergunta, a IA responde' },
  { href: '/pesquisa',     label: 'Voz do Cliente',     icon: ClipboardList,   roles: ['TITULAR', 'GERENTE', 'CONSULTOR'],             group: 'Yamahaway',    hint: 'O que o cliente disse' },
  { href: '/yamahaway',    label: 'Dossiê da Banca',    icon: Award,           roles: ['TITULAR', 'CONSULTOR'],                        group: 'Yamahaway',    hint: 'A resposta à banca' },
]

export const GROUP_ORDER = ['Visão Geral', 'Inteligência', 'Comercial', 'Banco', 'Operação', 'Yamahaway']

export const LOJAS = ['Grupo Nippon', 'Bragança Paulista', 'Atibaia', 'Amparo', 'Extrema']

/** Foto oficial do modelo (public/yamaha), casada pelo nome que vem da planilha. */
export function fotoModelo(modelo: string): string | null {
  const m = modelo.toUpperCase()
  const tabela: [RegExp, string][] = [
    [/FZ25|FAZER 250/, 'm-fz25'],
    [/FZ15|FAZER FZ15/, 'm-fz15'],
    [/LANDER/, 'm-lander'],
    [/CROSSER.*Z/, 'm-crosser-z'],
    [/CROSSER/, 'm-crosser-s'],
    [/FACTOR.*DX/, 'm-factor-dx'],
    [/FACTOR/, 'm-factor'],
    [/NMAX/, 'm-nmax'],
    [/XMAX|AEROX/, 'm-aerox'],
    [/FLUO/, 'm-fluo'],
    [/NEO/, 'm-neos'],
    [/ZR/, 'm-zr'],
    [/MT-07/, 'm-mt07'],
    [/MT-03/, 'm-mt03'],
    [/R15/, 'm-r15'],
    [/R3/, 'm-r3'],
    [/R7/, 'm-r7'],
    [/T[EÉ]N[EÉ]R[EÉ]/, 'm-tenere'],
    [/TRACER/, 'm-tracer'],
  ]
  const hit = tabela.find(([re]) => re.test(m))
  return hit ? `/yamaha/${hit[1]}.png` : null
}
