import { creditoData, calcularCredito } from '@/lib/credito-data'
import { SimuladorCredito } from '@/components/credito/SimuladorCredito'
import { Wallet, HelpCircle, PieChart } from 'lucide-react'

export const metadata = { title: 'Linha de Crédito · Smart Dealer' }

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

export default function CreditoPage() {
  const c = calcularCredito()
  const semaforo = {
    disponivel: { cor: 'var(--ok)', bg: 'var(--ok-bg)', label: '🟢 Crédito disponível' },
    atencao:    { cor: 'var(--warn)', bg: 'var(--warn-bg)', label: '🟡 Próximo do limite' },
    excedido:   { cor: 'var(--danger)', bg: 'var(--danger-bg)', label: '🔴 Limite excedido' },
  }[c.status]

  const todosItens = [...creditoData.consumo, ...creditoData.reservas]
  const CORES = ['#1E5FE8', '#7C3AED', '#0EA5E9', '#F59E0B', '#64748B']

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Consulta de Linha de Crédito
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {creditoData.grupo} · {creditoData.referencia} · posso comprar mais motos ou não?
        </p>
      </div>

      {/* ── 1. RESUMO EXECUTIVO ── */}
      <div className="card card-pad" style={{ borderLeft: `4px solid ${semaforo.cor}` }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 flex-1">
            <Resumo label="Limite de Crédito" valor={fmtBRL(creditoData.limite)} />
            <Resumo label="Consumo Atual" valor={fmtBRL(c.consumoAtual)} />
            <Resumo label="Compromissos Futuros" valor={fmtBRL(c.compromissos)} />
            <Resumo label="Disponível Total" valor={fmtBRL(c.disponivel)} cor={c.disponivel >= 0 ? 'var(--ok)' : 'var(--danger)'} destaque />
          </div>
          <span className="text-sm font-bold px-4 py-2 rounded-full shrink-0" style={{ backgroundColor: semaforo.bg, color: semaforo.cor }}>
            {semaforo.label}
          </span>
        </div>
        {/* barra de utilização */}
        <div className="mt-4">
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(c.pctUtilizado, 100)}%`, backgroundColor: semaforo.cor }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            <span>{c.pctUtilizado.toFixed(1).replace('.', ',')}% do limite comprometido</span>
            <span>{fmtBRL(creditoData.limite)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── 2. COMPOSIÇÃO DO CONSUMO ── */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <PieChart size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Quem está consumindo o crédito</h2>
          </div>
          <div className="space-y-3">
            {todosItens.map((item, i) => {
              const pct = (item.valor / creditoData.limite) * 100
              return (
                <div key={item.chave}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.rotulo}</span>
                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {fmtBRL(item.valor)} <span style={{ color: 'var(--text-tertiary)' }}>({pct.toFixed(1).replace('.', ',')}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 0.5)}%`, backgroundColor: CORES[i % CORES.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] mt-4 pt-3" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border)' }}>
            A maior concentração está em <b>Outros YA</b> ({fmtBRL(creditoData.consumo[1].valor)}) — motos já
            faturadas aguardando liquidação. É a liquidação delas que devolve limite.
          </p>
        </div>

        {/* ── 4. SIMULADOR ── */}
        <SimuladorCredito disponivel={c.disponivel} />
      </div>

      {/* ── 3. EXPLICAÇÃO DOS CONCEITOS ── */}
      <section>
        <h2 className="section-label mb-3">O que significa cada rubrica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {todosItens.map(item => (
            <div key={item.chave} className="card card-pad">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={13} style={{ color: 'var(--accent)' }} />
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.rotulo}</p>
                <span className="ml-auto text-xs tabular-nums font-semibold" style={{ color: 'var(--text-secondary)' }}>{fmtBRL(item.valor)}</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.explica}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NARRATIVA AUTOMÁTICA ── */}
      <div className="card card-pad" style={{ backgroundColor: 'var(--bg-inset)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={14} style={{ color: 'var(--accent)' }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Resumo em uma frase</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Seu limite de crédito é de <b style={{ color: 'var(--text-primary)' }}>{fmtBRL(creditoData.limite)}</b>.
          Atualmente <b style={{ color: 'var(--text-primary)' }}>{fmtBRL(creditoData.consumo[1].valor)}</b> estão
          comprometidos por motocicletas já faturadas e ainda não liquidadas, além de{' '}
          {fmtBRL(creditoData.consumo[0].valor)} em pedidos de motos, {fmtBRL(creditoData.consumo[2].valor)} em outras
          operações do grupo e {fmtBRL(c.compromissos)} em pedidos liberados e agrupamentos. Por esse motivo o grupo
          econômico apresenta saldo disponível de{' '}
          <b style={{ color: c.disponivel >= 0 ? 'var(--ok)' : 'var(--danger)' }}>{fmtBRL(c.disponivel)}</b>
          {c.disponivel < 0 && ' — para voltar a comprar, é preciso liquidar operações em aberto'}.
        </p>
      </div>
    </div>
  )
}

function Resumo({ label, valor, cor, destaque }: { label: string; valor: string; cor?: string; destaque?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className={`tabular-nums font-bold mt-0.5 ${destaque ? 'text-xl' : 'text-base'}`} style={{ color: cor ?? 'var(--text-primary)' }}>
        {valor}
      </p>
    </div>
  )
}
