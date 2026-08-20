import { pesquisaData } from '@/lib/pesquisa-data'
import {
  ClipboardList, Star, MessageSquareQuote, Target,
  TrendingUp, UserX, Quote, CheckCircle2,
} from 'lucide-react'

export const metadata = { title: 'Voz do Cliente · Smart Dealer' }

export default function PesquisaPage() {
  const d = pesquisaData
  const maxDist = Math.max(...d.satisfacao.distribuicao.map(x => x.qtd))

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pesquisa · Voz do Cliente</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.periodo} · fatores de compra medidos, não achados
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {d.respostas} respostas · {d.taxaResposta}% de adesão
        </span>
      </div>

      {/* Metodologia + KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={ClipboardList} accent="var(--accent)" label="Amostra" value={`${d.respostas}/${d.convidados}`} sub={`${d.compraram} compraram · ${d.naoCompraram} não compraram`} />
        <Kpi icon={Star} accent="var(--warn)" label="Satisfação média" value={`${d.satisfacao.media.toFixed(1).replace('.', ',')}/5`} sub="como foi ser atendido?" />
        <Kpi icon={TrendingUp} accent="var(--ok)" label="NPS da pesquisa" value={`${d.satisfacao.npsPesquisa}`} sub="promotores − detratores" />
        <Kpi icon={Target} accent="#A855F7" label="Respondido em ≤10 min" value={`${d.comparativo.depois.respondidoEm10min}%`} sub={`era ${d.comparativo.antes.respondidoEm10min}% antes do piloto`} />
      </div>

      <p className="text-xs -mt-2" style={{ color: 'var(--text-tertiary)' }}>Metodologia: {d.metodologia}.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Satisfação */}
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Bloco 1 · Como foi ser atendido?</h2>
          <div className="space-y-2">
            {d.satisfacao.distribuicao.map(x => (
              <div key={x.nota} className="flex items-center gap-3">
                <span className="text-xs w-10 shrink-0 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  {x.nota} <Star size={10} style={{ color: 'var(--warn)', fill: 'var(--warn)' }} />
                </span>
                <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded" style={{ width: `${(x.qtd / maxDist) * 100}%`, backgroundColor: x.nota >= 4 ? 'var(--ok)' : x.nota === 3 ? 'var(--warn)' : 'var(--danger)' }} />
                </div>
                <span className="text-xs tabular-nums w-6 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{x.qtd}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>Tempo de resposta percebido</p>
            <div className="flex rounded-full overflow-hidden h-3">
              {d.satisfacao.tempoRespostaPercebido.map((t, i) => (
                <div key={t.rotulo} title={`${t.rotulo}: ${t.pct}%`} style={{ width: `${t.pct}%`, backgroundColor: ['var(--ok)', '#84CC16', 'var(--warn)', 'var(--danger)'][i] }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {d.satisfacao.tempoRespostaPercebido.map((t, i) => (
                <span key={t.rotulo} className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['var(--ok)', '#84CC16', 'var(--warn)', 'var(--danger)'][i] }} />
                  {t.rotulo} · {t.pct}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fatores de compra */}
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Bloco 2 · O que decide a compra?</h2>
          <p className="text-[11px] mb-4" style={{ color: 'var(--text-tertiary)' }}>Múltipla escolha · % dos respondentes · cada fator ligado à tela que o atende</p>
          <div className="space-y-3">
            {d.fatoresCompra.map(f => (
              <div key={f.fator}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.fator}</span>
                  <span className="tabular-nums font-bold" style={{ color: 'var(--accent)' }}>{f.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded-full" style={{ width: `${f.pct}%`, backgroundColor: 'var(--accent)' }} />
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>→ {f.telaQueAtende}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* O que faria voltar */}
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Bloco 3 · O que faria você voltar?</h2>
          <div className="space-y-3">
            {d.fatoresRetorno.map(f => (
              <div key={f.fator}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.fator}</span>
                  <span className="tabular-nums font-bold" style={{ color: 'var(--ok)' }}>{f.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded-full" style={{ width: `${f.pct}%`, backgroundColor: 'var(--ok)' }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            59% voltam se a loja <b>lembrar da revisão</b> — exatamente o que a régua automática do pós-vendas faz.
          </p>
        </div>

        {/* Não compradores */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-4">
            <UserX size={15} style={{ color: 'var(--danger)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Quem não comprou — por quê?</h2>
          </div>
          <div className="space-y-3">
            {d.motivosNaoCompra.map(m => (
              <div key={m.motivo} className="flex items-start justify-between gap-3 pb-2.5 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{m.motivo}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.leitura}</p>
                </div>
                <span className="text-lg font-bold tabular-nums shrink-0" style={{ color: 'var(--danger)' }}>{m.qtd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verbatims */}
      <section>
        <h2 className="section-label mb-3">Na voz do cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.verbatims.map(v => (
            <div key={v.nome} className="card card-pad flex flex-col">
              <Quote size={16} style={{ color: 'var(--accent)', opacity: 0.5 }} />
              <p className="text-sm italic leading-relaxed flex-1 mt-2" style={{ color: 'var(--text-primary)' }}>“{v.fala}”</p>
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{v.nome}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: v.comprou ? 'var(--ok-bg)' : 'var(--danger-bg)', color: v.comprou ? 'var(--ok)' : 'var(--danger)' }}>
                  {v.comprou ? 'comprou' : 'não comprou'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Antes × depois + conclusões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-pad" style={{ borderLeft: '4px solid var(--ok)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Antes × depois do Smart Dealer</h2>
          <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>Clientes atendidos jan–mai (antes) × jun–ago (depois do piloto)</p>
          <div className="grid grid-cols-3 gap-4">
            <Duplo label="Satisfação" antes={`${d.comparativo.antes.satisfacao.toFixed(1).replace('.', ',')}`} depois={`${d.comparativo.depois.satisfacao.toFixed(1).replace('.', ',')}`} />
            <Duplo label="≤10 min" antes={`${d.comparativo.antes.respondidoEm10min}%`} depois={`${d.comparativo.depois.respondidoEm10min}%`} />
            <Duplo label="Recontato pós-venda" antes={`${d.comparativo.antes.recontato}%`} depois={`${d.comparativo.depois.recontato}%`} />
          </div>
        </div>
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareQuote size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>O que a pesquisa nos disse</h2>
          </div>
          <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {d.conclusoes.map((c, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--ok)' }} />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon: Icon, accent, label, value, sub }: { icon: React.ElementType; accent: string; label: string; value: string; sub: string }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}>
          <Icon size={14} style={{ color: accent }} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
}

function Duplo({ label, antes, depois }: { label: string; antes: string; depois: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-xs line-through" style={{ color: 'var(--text-tertiary)' }}>{antes}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{depois}</p>
    </div>
  )
}
