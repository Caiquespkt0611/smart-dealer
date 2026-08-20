import { premyaData, CATEGORIAS, cenariosPadrao, calcularIndice } from '@/lib/premya-data'
import { SimuladorPremya } from '@/components/premya/SimuladorPremya'
import { Gem, TrendingUp, Landmark, BadgeCheck } from 'lucide-react'

export const metadata = { title: 'Premya · Smart Dealer' }

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const pct1 = (v: number) => `${v.toFixed(1).replace('.', ',')}%`

export default function PremyaPage() {
  const d = premyaData
  const atual = calcularIndice(d.atual.vendasFinanciadas, d.atual.submetidasBymd, d.atual.aprovadasBymd, d.atual.pagasOutroBanco)
  const cenarios = cenariosPadrao()
  const maxHist = 100

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Programa Premya · Banco Yamaha</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.grupo} · {d.referencia} · 3ª edição · quanto vale a fidelidade ao Banco Yamaha, em reais
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
          Folder oficial Premya 2026 codificado
        </span>
      </div>

      {/* Status atual + fórmula */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card card-pad lg:col-span-1" style={{ borderLeft: `4px solid ${atual.categoria?.cor ?? 'var(--danger)'}` }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Classificação atual (apuração julho)</p>
          <div className="flex items-center gap-3 mt-2">
            <Gem size={28} style={{ color: atual.categoria?.cor ?? 'var(--danger)' }} />
            <div>
              <p className="text-2xl font-bold" style={{ color: atual.categoria?.cor ?? 'var(--danger)' }}>{atual.categoria?.nome ?? '—'}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Índice de Fidelidade: <b>{pct1(atual.indice)}</b></p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t text-xs space-y-1.5" style={{ borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Participação: <b style={{ color: 'var(--text-primary)' }}>{pct1(atual.participacao)}</b> ({d.atual.submetidasBymd}/{d.atual.vendasFinanciadas} financiadas submetidas ao BYMD)
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Fator de ajuste: <b style={{ color: 'var(--danger)' }}>−{pct1(atual.fatorAjuste)}</b> ({d.atual.pagasOutroBanco} aprovadas pagas em outro banco)
            </p>
          </div>
        </div>

        {/* Tabela de categorias */}
        <div className="card card-pad lg:col-span-2">
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>As 4 categorias e o que cada uma paga</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                  {['Categoria', 'Índice de Fidelidade', 'Incentivo comercial¹', 'Floor plan', 'Mesa de crédito'].map(h => <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.map(c => {
                  const ativa = atual.categoria?.nome === c.nome
                  return (
                    <tr key={c.nome} className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: ativa ? 'var(--accent-bg)' : 'transparent' }}>
                      <td className="px-3 py-2.5 font-bold whitespace-nowrap" style={{ color: c.cor }}>
                        {c.nome}{ativa ? ' ← hoje' : ''}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{c.faixaMin}% a {c.faixaMax}%</td>
                      <td className="px-3 py-2.5 font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>{c.incentivoComercial.toFixed(2).replace('.', ',')}% sobre o liberado</td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-secondary)' }}>−{c.floorPlanPp.toFixed(2).replace('.', ',')} p.p.</td>
                      <td className="px-3 py-2.5">{c.mesaCredito ? <span style={{ color: 'var(--ok)' }}>✓ diferenciais</span> : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>¹ Sobre o Valor Liberado junto ao BYMD · Diamante/Ouro recebem certificação para expor na concessionária · classificação mensal</p>
        </div>
      </div>

      {/* Cenários */}
      <section>
        <h2 className="section-label mb-3">Três cenários — o mesmo mês, três resultados</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cenarios.map((cen, i) => (
            <div key={cen.nome} className="card card-pad" style={i === 2 ? { borderColor: cen.categoria?.cor, borderWidth: 1.5 } : undefined}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{cen.nome}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `color-mix(in srgb, ${cen.categoria?.cor ?? '#999'} 15%, transparent)`, color: cen.categoria?.cor }}>
                  {cen.categoria?.nome} · {pct1(cen.indice)}
                </span>
              </div>
              <p className="text-[11px] mb-3 min-h-8" style={{ color: 'var(--text-tertiary)' }}>{cen.descricao}</p>
              <div className="space-y-1.5 text-xs">
                <Linha rot="Incentivo comercial/mês" val={fmtBRL(cen.incentivoMes)} />
                <Linha rot="Economia floor plan/mês" val={fmtBRL(cen.economiaFloorMes)} />
                <div className="pt-1.5 mt-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Linha rot="Ganho no ano" val={fmtBRL(cen.ganhoAno)} destaque />
                  {i > 0 && <Linha rot="vs. hoje" val={`+${fmtBRL(cen.ganhoAno - cenarios[0].ganhoAno)}/ano`} verde />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simulador interativo */}
      <SimuladorPremya />

      {/* Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-pad">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Evolução do Índice de Fidelidade</h2>
          <div className="space-y-2.5">
            {d.historico.map(h => (
              <div key={h.mes}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{h.mes}</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--text-secondary)' }}>{pct1(h.indice)}</span>
                </div>
                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(h.indice / maxHist) * 100}%`, backgroundColor: '#D97706' }} />
                  {[75, 85, 95].map(m => (
                    <div key={m} className="absolute top-0 h-full w-0.5 opacity-60" style={{ left: `${m}%`, backgroundColor: 'var(--text-tertiary)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>Marcas verticais = cortes de Prata (75) · Ouro (85) · Diamante (95)</p>
        </div>

        <div className="card card-pad" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Como o Smart Dealer sobe a categoria</h2>
          </div>
          <ul className="space-y-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex gap-2"><Landmark size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} /> Toda proposta nasce no CRM já submetida ao BYMD primeiro — participação sobe sem esforço do vendedor.</li>
            <li className="flex gap-2"><TrendingUp size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} /> Alerta quando uma proposta aprovada está indo para outro banco — cada fuga custa fator de ajuste.</li>
            <li className="flex gap-2"><Gem size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} /> O gerente vê o índice do mês EM CURSO, não só na apuração — dá tempo de corrigir antes de fechar.</li>
          </ul>
          <p className="text-xs mt-3 pt-3 border-t font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            Subir de {atual.categoria?.nome} para OURO vale <b style={{ color: 'var(--ok)' }}>{fmtBRL(cenarios[1].ganhoAno - cenarios[0].ganhoAno)}/ano</b> — sem vender uma moto a mais.
          </p>
        </div>
      </div>
    </div>
  )
}

function Linha({ rot, val, destaque, verde }: { rot: string; val: string; destaque?: boolean; verde?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span style={{ color: 'var(--text-tertiary)' }}>{rot}</span>
      <span className="tabular-nums" style={{ color: verde ? 'var(--ok)' : destaque ? 'var(--ok)' : 'var(--text-primary)', fontWeight: destaque || verde ? 700 : 500 }}>{val}</span>
    </div>
  )
}
