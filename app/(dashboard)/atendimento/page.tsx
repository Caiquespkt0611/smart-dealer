import { atendimentoData, totaisDia, veredito } from '@/lib/atendimento-data'
import { MessageCircle, AlertTriangle, Flame, PhoneCall, WifiOff } from 'lucide-react'

export const metadata = { title: 'Atendimento de Leads · Smart Dealer' }

export default function AtendimentoPage() {
  const d = atendimentoData
  const tot = totaisDia()

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Atendimento de Leads — relatório diário
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.referencia} · {d.preparadoPara}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{d.fonte}</p>
        </div>
        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shrink-0"
          style={{ backgroundColor: 'var(--warn-bg)', color: 'var(--warn)', border: '1px solid var(--warn)' }}>
          Dados projetados · simulação de implantação
        </span>
      </div>

      {/* ── COBERTURA DE LINHAS ── */}
      <div className="card card-pad flex items-start gap-3" style={{ borderLeft: '4px solid var(--warn)' }}>
        <WifiOff size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--warn)' }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <b style={{ color: 'var(--text-primary)' }}>Cobertura: {d.linhas.ativas} das {d.linhas.total} linhas trabalharam ontem.</b>{' '}
          Seguem offline: <b style={{ color: 'var(--warn)' }}>{d.linhas.offline.join(', ')}</b> — todo lead que cai
          nessas linhas se perde sem registro. Reconectar é prioridade.
        </p>
      </div>

      {/* ── RESUMO EXECUTIVO ── */}
      <section>
        <h2 className="section-label mb-3">Resumo executivo</h2>
        <div className="card card-pad mb-3" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <b>{tot.semResposta} negociações ficaram sem resposta ontem</b>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              nas {d.linhas.ativas} linhas ativas (de {tot.leads} leads atendidos). Cada uma é uma venda esfriando —
              a lista de leads quentes abaixo traz quem chamar AGORA.
            </span>
          </p>
        </div>
        <div className="space-y-2.5">
          {d.vendedores.map(v => {
            const ver = veredito(v)
            return (
              <div key={v.nome} className="card card-pad" style={{ borderLeft: `4px solid ${ver.ok ? 'var(--ok)' : 'var(--danger)'}` }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <b style={{ color: 'var(--text-primary)' }}>{v.nome}:</b>{' '}
                  {v.leadsRecebidos} leads recebidos, {v.semResposta} sem resposta ({Math.round(v.semResposta / v.leadsRecebidos * 100)}%),
                  tempo médio de resposta {v.tempoMedioMin} min, follow-up {v.followUpPct}%, tentou vender {v.tentouVenderPct}%,
                  qualificou {v.qualificouPct}%. — <span style={{ color: ver.ok ? 'var(--ok)' : 'var(--danger)' }}>{ver.texto}</span>
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── PLACAR DA SEMANA ── */}
      <section>
        <h2 className="section-label mb-1">Placar da semana</h2>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Número exato de cada dia (loja consolidada). “Tempo médio de resposta” = mediana da 1ª resposta em horário
          comercial; “Follow-up” = % dos leads do dia que receberam retomada (meta 100%).
        </p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Dia', 'Leads', 'Sem resposta', 'Tempo médio', 'Follow-up (meta 100%)', 'Qualif.', 'Tentou vender'].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-xs uppercase tracking-wider font-medium ${i === 0 ? 'text-left' : 'text-right'}`}
                      style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.placarSemana.map(p => (
                  <tr key={p.dia} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{p.dia}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{p.leads}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: p.semResposta / p.leads > 0.2 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                      {p.semResposta} ({Math.round(p.semResposta / p.leads * 100)}%)
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{p.tempoMedioMin} min</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{p.followUpPct}%</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{p.qualificouPct}%</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{p.tentouVenderPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── ONTEM × DIA NORMAL ── */}
      <section>
        <h2 className="section-label mb-3">Ontem × seu dia normal</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ComparativoCard titulo="Leads atendidos" itens={d.vendedores.map(v => ({
            nome: v.nome.split(' ')[0], media: v.mediaDia.leads, ontem: v.leadsRecebidos, sufixo: '', melhorMaior: true,
          }))} />
          <ComparativoCard titulo="Taxa de follow-up (%)" itens={d.vendedores.map(v => ({
            nome: v.nome.split(' ')[0], media: v.mediaDia.followUpPct, ontem: v.followUpPct, sufixo: '%', melhorMaior: true,
          }))} />
          <ComparativoCard titulo="Largados (%) — quanto menor, melhor" itens={d.vendedores.map(v => ({
            nome: v.nome.split(' ')[0],
            media: Math.round(v.mediaDia.semResposta / v.mediaDia.leads * 100),
            ontem: Math.round(v.semResposta / v.leadsRecebidos * 100),
            sufixo: '%', melhorMaior: false,
          }))} />
        </div>
      </section>

      {/* ── LEADS QUENTES ── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <Flame size={14} style={{ color: 'var(--danger)' }} />
          <h2 className="section-label">Leads quentes — chamar HOJE</h2>
        </div>
        <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Negociações de ontem que pararam sem resposta do vendedor. Clique e chame agora, ainda está quente.
        </p>
        <div className="space-y-4">
          {d.vendedores.map(v => {
            const quentes = d.leadsQuentes.filter(l => l.vendedor === v.nome)
            if (!quentes.length) return null
            return (
              <div key={v.nome}>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{v.nome}</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {quentes.map((l, i) => (
                    <div key={i} className="card card-pad">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {l.cliente} <span className="text-[10px] font-normal" style={{ color: 'var(--text-tertiary)' }}>{l.telefone} · último contato {l.ultimoContato}</span>
                          </p>
                        </div>
                        <a href={`https://wa.me/${l.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#22C55E', color: '#fff' }}>
                          <PhoneCall size={12} /> Chamar agora
                        </a>
                      </div>
                      <p className="text-xs mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
                        “{l.ultimaMensagem}”
                      </p>
                      <p className="text-[10px] mt-2 font-semibold" style={{ color: 'var(--warn)' }}>
                        Por que ligar: {l.motivos.join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── ANÁLISE POR VENDEDOR ── */}
      <section>
        <h2 className="section-label mb-3">Análise por vendedor</h2>
        <div className="space-y-4">
          {d.vendedores.map(v => (
            <div key={v.nome} className="card card-pad">
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{v.nome}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Tile valor={`${v.leadsRecebidos}`} rotulo="Leads recebidos" media={v.mediaDia.leads} atual={v.leadsRecebidos} melhorMaior />
                <Tile valor={`${v.semResposta}`} rotulo="Sem resposta" media={v.mediaDia.semResposta} atual={v.semResposta} melhorMaior={false} />
                <Tile valor={`${v.tempoMedioMin} min`} rotulo="Tempo de resposta" media={v.mediaDia.tempoMedioMin} atual={v.tempoMedioMin} melhorMaior={false} />
                <Tile valor={`${v.followUpPct}%`} rotulo="Follow-up (meta 100%)" media={v.mediaDia.followUpPct} atual={v.followUpPct} melhorMaior />
                <Tile valor={`${v.qualificouPct}%`} rotulo="Qualificou" media={v.mediaDia.qualificouPct} atual={v.qualificouPct} melhorMaior />
                <Tile valor={`${v.tentouVenderPct}%`} rotulo="Tentou vender" media={v.mediaDia.tentouVenderPct} atual={v.tentouVenderPct} melhorMaior />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* rodapé */}
      <div className="card card-pad flex items-start gap-3" style={{ backgroundColor: 'var(--bg-inset)' }}>
        <MessageCircle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          <b style={{ color: 'var(--text-primary)' }}>Implementação real:</b> este relatório passa a ser gerado
          automaticamente a partir das conversas de WhatsApp das linhas conectadas (Evolution), com resumo diário
          enviado ao gerente às 9h e PDF individual por vendedor — exatamente o formato desta simulação.
        </p>
      </div>
    </div>
  )
}

function ComparativoCard({ titulo, itens }: {
  titulo: string
  itens: Array<{ nome: string; media: number; ontem: number; sufixo: string; melhorMaior: boolean }>
}) {
  const max = Math.max(...itens.flatMap(i => [i.media, i.ontem]), 1)
  return (
    <div className="card card-pad">
      <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{titulo}</p>
      <div className="space-y-3">
        {itens.map(i => {
          const melhorou = i.melhorMaior ? i.ontem >= i.media : i.ontem <= i.media
          return (
            <div key={i.nome}>
              <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{i.nome}</p>
              <Barra rotulo="Méd dia" valor={i.media} max={max} cor="var(--chart-track)" sufixo={i.sufixo} corTexto="var(--text-tertiary)" />
              <Barra rotulo="Ontem" valor={i.ontem} max={max} cor={melhorou ? 'var(--accent)' : 'var(--danger)'} sufixo={i.sufixo} corTexto="var(--text-primary)" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Barra({ rotulo, valor, max, cor, sufixo, corTexto }: {
  rotulo: string; valor: number; max: number; cor: string; sufixo: string; corTexto: string
}) {
  return (
    <div className="flex items-center gap-2 mb-0.5">
      <span className="text-[9px] w-11 shrink-0" style={{ color: 'var(--text-tertiary)' }}>{rotulo}</span>
      <div className="flex-1 h-3.5 rounded overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
        <div className="h-full rounded flex items-center justify-end pr-1.5"
          style={{ width: `${Math.max((valor / max) * 100, 8)}%`, backgroundColor: cor }}>
          <span className="text-[9px] font-bold tabular-nums" style={{ color: corTexto }}>
            {String(Math.round(valor * 10) / 10).replace('.', ',')}{sufixo}
          </span>
        </div>
      </div>
    </div>
  )
}

function Tile({ valor, rotulo, media, atual, melhorMaior }: {
  valor: string; rotulo: string; media: number; atual: number; melhorMaior: boolean
}) {
  const deltaPct = media > 0 ? Math.round(((atual - media) / media) * 100) : 0
  const melhorou = melhorMaior ? deltaPct >= 0 : deltaPct <= 0
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-inset)' }}>
      <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{valor}</p>
      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{rotulo}</p>
      <p className="text-[10px] font-semibold mt-1" style={{ color: melhorou ? 'var(--ok)' : 'var(--danger)' }}>
        méd {String(media).replace('.', ',')} {deltaPct >= 0 ? '↑' : '↓'} {Math.abs(deltaPct)}%
      </p>
    </div>
  )
}
