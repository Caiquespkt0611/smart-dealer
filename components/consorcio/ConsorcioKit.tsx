'use client'

// Kit do vendedor do Consórcio Yamaha: escolhe a moto, o plano e o prazo, e sai a
// parcela estimada pela tabela de taxas do contrato, a renda mínima, quanto custa
// o lance fixo e quanto o embutido cobre, a mensagem pronta para o WhatsApp.
// Regra: nunca prometer data de contemplação, só a chance que o lance dá.

import { useState } from 'react'
import { Copy, Check, Send, Sparkles, Calculator, Gavel, CalendarClock, FileCheck2, HelpCircle } from 'lucide-react'
import { liberacredTabela, nomeModelo } from '@/lib/liberacred-tabela'
import {
  planosConsorcio, simularConsorcio, lancesConsorcio, prazosAssembleia, liberacaoCredito, duvidasConsorcio, CONSORCIO_FONTE,
} from '@/lib/consorcio-yamaha'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmt0 = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const pct = (v: number) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const CURTO: Record<string, string> = {
  'ZR HYBRID CONNECTED': 'ZR Hybrid', 'FLUO ABS HYBRID CONNECTED': 'Fluo', 'FACTOR 150': 'Factor 150',
  'AEROX ABS CONNECTED': 'Aerox', 'FACTOR 150 DX': 'Factor DX', 'TTR 230': 'TTR 230',
  'FZ15 FAZER ABS CONNECTED': 'FZ15', 'XTZ 150 CROSSER S ABS': 'Crosser S', 'XTZ 150 CROSSER Z ABS': 'Crosser Z',
  'NMAX CONNECTED 160 ABS': 'NMAX 160', 'YZF R15 ABS': 'R15', 'FZ25 FAZER ABS': 'FZ25', 'XTZ 250 LANDER ABS CONNECTED': 'Lander 250',
}

export default function ConsorcioKit() {
  const [modelo, setModelo] = useState('FZ25 FAZER ABS')
  const [planoId, setPlanoId] = useState<'mega' | 'master'>('mega')
  const [meses, setMeses] = useState(60)
  const [nome, setNome] = useState('Antônio')
  const [copiado, setCopiado] = useState(false)

  const moto = liberacredTabela.find(m => m.modelo === modelo)!
  const plano = planosConsorcio.find(p => p.id === planoId)!
  const prazo = plano.prazos.find(p => p.meses === meses) ?? plano.prazos.find(p => p.meses === 60)!
  const s = simularConsorcio(moto.valor, prazo)

  const primeiro = nome.trim().split(/\s+/)[0] || 'cliente'
  const mensagem =
    `${primeiro}, dá para começar hoje a conquista da sua ${nomeModelo(modelo)}! 🏍️\n\n` +
    `No Consórcio Yamaha, o consórcio da própria fábrica:\n` +
    `✅ Sem entrada e sem juros\n` +
    `✅ Parcelas a partir de ${fmt(s.parcela)}, em ${prazo.meses} meses\n` +
    `✅ Você concorre todo mês, por sorteio ou lance, desde a primeira parcela\n` +
    `✅ Com um lance, dá para antecipar a sua contemplação\n\n` +
    `Quando for contemplado, a sua Yamaha sai aqui na loja. Quer que eu reserve a sua cota?`

  const copiar = async () => {
    try { await navigator.clipboard.writeText(mensagem); setCopiado(true); setTimeout(() => setCopiado(false), 1800) } catch { /* sem permissão de área de transferência */ }
  }

  const chip = (ativo: boolean) => ({
    backgroundColor: ativo ? 'var(--accent)' : 'var(--bg-inset)',
    color: ativo ? '#fff' : 'var(--text-secondary)',
  })

  return (
    <section id="kit-consorcio">
      <h2 className="section-label mb-3">Na negociação · kit do vendedor</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Simulação */}
        <div className="card card-pad lg:col-span-2" data-kit="simulacao">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Calculator size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Simule a cota do cliente</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {liberacredTabela.map(m => (
              <button key={m.modelo} type="button" onClick={() => setModelo(m.modelo)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors" style={chip(m.modelo === modelo)}>
                {CURTO[m.modelo] ?? nomeModelo(m.modelo)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Plano</p>
              <div className="flex gap-1.5 flex-wrap">
                {planosConsorcio.map(p => (
                  <button key={p.id} type="button" onClick={() => setPlanoId(p.id)} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={chip(p.id === planoId)}>
                    {p.nome.replace('Contempla + ', '')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Prazo</p>
              <div className="flex gap-1.5 flex-wrap">
                {plano.prazos.map(p => (
                  <button key={p.meses} type="button" onClick={() => setMeses(p.meses)} className="px-2 py-1 rounded-lg text-xs font-semibold" style={chip(p.meses === prazo.meses)}>{p.meses}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-inset)' }} data-kit="resultado">
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{nomeModelo(modelo)} · crédito de {fmt0(moto.valor)} · {plano.nome}</p>
            <p className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: 'var(--accent)' }}>{prazo.meses}x {fmt(s.parcela)}</p>
            <p className="text-[10.5px]" style={{ color: 'var(--text-tertiary)' }}>sem entrada e sem juros · taxa de administração de {pct(prazo.taxaAdmTotalPct)} no prazo, já na parcela</p>
            <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px]">
              <div><span style={{ color: 'var(--text-tertiary)' }}>Renda mínima</span><p className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt0(s.rendaMinima)} <span className="font-normal" style={{ color: 'var(--text-tertiary)' }}>(3x a parcela)</span></p></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Lance fixo de 25%</span><p className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt0(s.lance25)}</p></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Embutido cobre até</span><p className="font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{fmt0(s.embutido)} <span className="font-normal" style={{ color: 'var(--text-tertiary)' }}>(15%)</span></p></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>25% com embutido, do bolso</span><p className="font-bold tabular-nums" style={{ color: 'var(--ok)' }}>≈ {fmt0(s.lance25DoBolso)}</p></div>
            </div>
          </div>
          <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            Estimativa pela tabela de taxas do contrato Série T, já com o seguro obrigatório. O valor oficial sai na proposta da Yamaha Consórcio.
          </p>
          <label className="block mt-2">
            <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Nome do cliente</span>
            <input value={nome} onChange={e => setNome(e.target.value)} className="mt-1 w-full rounded-lg px-3 py-1.5 text-sm"
              style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </label>
        </div>

        {/* Mensagem */}
        <div className="card card-pad lg:col-span-3 flex flex-col" style={{ borderColor: '#25D366', borderWidth: 1.5 }} data-kit="mensagem">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D3661A' }}>
                <Sparkles size={14} style={{ color: '#25D366' }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Mensagem pronta para o cliente</h3>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={copiar} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}>
                {copiado ? <Check size={12} /> : <Copy size={12} />} {copiado ? 'Copiada' : 'Copiar'}
              </button>
              <a href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: '#25D366', color: '#fff' }}>
                <Send size={12} /> Enviar no WhatsApp
              </a>
            </div>
          </div>
          <div className="rounded-xl p-3.5 text-[12px] leading-relaxed whitespace-pre-line flex-1" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>
            {mensagem}
          </div>
          <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--accent)' }}>{plano.nome}</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plano.resumo} {plano.lances}</p>
          </div>
          <p className="text-[10.5px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Não promete data: a contemplação depende do sorteio ou do lance. A mensagem fala da chance, nunca de prazo.
          </p>
        </div>
      </div>

      {/* Lances + assembleia + liberação + dúvidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="card card-pad" data-kit="lances">
          <div className="flex items-center gap-2 mb-3">
            <Gavel size={15} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Os tipos de lance</h3>
          </div>
          <div className="space-y-2">
            {lancesConsorcio.map(l => (
              <div key={l.t} className="text-[11.5px] leading-relaxed">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{l.t}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{l.s}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card card-pad" data-kit="assembleia">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={15} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Antes da assembleia</h3>
            </div>
            <ul className="space-y-1.5">
              {prazosAssembleia.map(p => (
                <li key={p} className="flex gap-2 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--accent)' }} />{p}
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-pad" data-kit="liberacao">
            <div className="flex items-center gap-2 mb-3">
              <FileCheck2 size={15} style={{ color: 'var(--ok)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Contemplado: para liberar o crédito</h3>
            </div>
            <ul className="space-y-1.5">
              {liberacaoCredito.map(p => (
                <li key={p} className="flex gap-2 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <Check size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--ok)' }} />{p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card card-pad" data-kit="duvidas">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={15} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Se o cliente perguntar</h3>
          </div>
          <div className="space-y-2">
            {duvidasConsorcio.map(d => (
              <div key={d.p} className="text-[11.5px] leading-relaxed">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.p}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{d.r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10.5px] mt-3" style={{ color: 'var(--text-tertiary)' }}>Fonte: {CONSORCIO_FONTE}.</p>
    </section>
  )
}
