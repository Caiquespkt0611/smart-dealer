import {
  Handshake, Search, MessageSquareQuote, ShieldCheck,
  Trophy, Bike, Lightbulb, Target,
} from 'lucide-react'

export const metadata = { title: 'Playbook de Vendas · Smart Dealer' }

const ETAPAS = [
  {
    icon: Handshake, cor: 'var(--accent)', titulo: '1. Abordagem',
    itens: [
      'Cumprimente pelo nome e ofereça água/café — quebre o gelo antes de falar de moto.',
      'Pergunte o uso (trabalho, lazer, primeira moto) antes de mostrar modelo.',
      'Nunca julgue pela aparência: todo cliente é um comprador em potencial.',
    ],
  },
  {
    icon: Search, cor: '#A855F7', titulo: '2. Descoberta (sondagem)',
    itens: [
      'Qual a faixa de parcela que cabe no orçamento? (abre consórcio/financiamento)',
      'Já tem CNH? Vai usar todo dia? Quantos km por dia?',
      'O que mais importa: economia, conforto, esportividade ou status?',
    ],
  },
  {
    icon: Bike, cor: 'var(--warn)', titulo: '3. Demonstração',
    itens: [
      'Convide para o Test Ride — quem senta na moto, compra. (e ainda pontua no Kaizen)',
      'Mostre tecnologia Yamaha: injeção Blue Core, freio ABS, painel digital, consumo.',
      'Conte um caso real de cliente satisfeito com o mesmo modelo.',
    ],
  },
  {
    icon: ShieldCheck, cor: 'var(--ok)', titulo: '4. Quebra de objeções',
    itens: [
      '"Está caro" → mostre o valor da parcela e o custo-benefício de revenda Yamaha.',
      '"Vou pensar" → "O que falta para você decidir hoje? Posso simular agora."',
      '"A Honda é mais barata" → reforce pós-venda, rede, valor de revenda e tecnologia.',
    ],
  },
  {
    icon: Trophy, cor: '#F97316', titulo: '5. Fechamento',
    itens: [
      'Fechamento por escolha: "Prefere a preta ou a azul?" (assume a venda).',
      'Crie urgência real: condição do mês, últimas unidades, taxa especial.',
      'Ofereça acessórios e Yamalube no ato — aumenta ticket e fideliza.',
    ],
  },
]

const GATILHOS = [
  { t: 'Consórcio Yamaha', d: 'Sem juros, parcela menor — ideal para quem não tem pressa.' },
  { t: 'Test Ride', d: 'Experiência fecha venda e pontua no Kaizen (meta 20/mês).' },
  { t: 'Entrega técnica', d: 'Cadastre no App Blu Club na entrega — fideliza e pontua.' },
  { t: 'Voucher de troca', d: 'Cliente com 2–4 anos de moto: oferta de upgrade (ver Pós-Vendas).' },
]

const PERFIS = [
  { p: 'Primeira moto', arg: 'Segurança (ABS), facilidade de pilotagem e baixo consumo. Factor 150, Crosser.' },
  { p: 'Trabalho/entrega', arg: 'Durabilidade, economia e rede de assistência. Factor, Fazer 250.' },
  { p: 'Lazer/esportivo', arg: 'Performance e design. MT-03, R15, MT-07.' },
  { p: 'Urbano/conforto', arg: 'Scooters: praticidade, porta-objetos, automático. NMAX, XMAX.' },
]

export default function PlaybookPage() {
  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Playbook de Vendas</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Roteiro de abordagem e persuasão · padrão Yamaha · do primeiro &ldquo;oi&rdquo; ao fechamento
        </p>
      </div>

      {/* Etapas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ETAPAS.map(e => {
          const Icon = e.icon
          return (
            <div key={e.titulo} className="card card-pad">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <Icon size={17} style={{ color: e.cor }} />
                </div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{e.titulo}</h2>
              </div>
              <ul className="space-y-2">
                {e.itens.map((it, i) => (
                  <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: e.cor }}>›</span> {it}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Perfis */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="section-label">Argumento certo por perfil de cliente</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERFIS.map(p => (
            <div key={p.p} className="card card-pad flex gap-3">
              <MessageSquareQuote size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.p}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.arg}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gatilhos */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} style={{ color: 'var(--warn)' }} />
          <h2 className="section-label">Gatilhos que aumentam ticket e fidelizam</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {GATILHOS.map(g => (
            <div key={g.t} className="card card-pad">
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>{g.t}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{g.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
