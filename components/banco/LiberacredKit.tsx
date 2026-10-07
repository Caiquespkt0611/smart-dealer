'use client'

// Kit do vendedor na recusa do CDC: escolhe a moto do cliente, a entrada e o prazo,
// e sai a simulação oficial, a mensagem motivadora pronta, o roteiro e as respostas
// para as dúvidas. Números da tabela oficial (lib/liberacred-tabela.ts).
// Regra: motivar sem prometer aprovação — o CDC depende da proposta do banco.

import { useState } from 'react'
import { Copy, Check, Send, Sparkles, ListChecks, HelpCircle, Bike } from 'lucide-react'
import { liberacredTabela, nomeModelo } from '@/lib/liberacred-tabela'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// nome curto do botão: NMAX CONNECTED 160 ABS → NMAX 160
const CURTO: Record<string, string> = {
  'ZR HYBRID CONNECTED': 'ZR Hybrid', 'FLUO ABS HYBRID CONNECTED': 'Fluo', 'FACTOR 150': 'Factor 150',
  'AEROX ABS CONNECTED': 'Aerox', 'FACTOR 150 DX': 'Factor DX', 'TTR 230': 'TTR 230',
  'FZ15 FAZER ABS CONNECTED': 'FZ15', 'XTZ 150 CROSSER S ABS': 'Crosser S', 'XTZ 150 CROSSER Z ABS': 'Crosser Z',
  'NMAX CONNECTED 160 ABS': 'NMAX 160', 'YZF R15 ABS': 'R15', 'FZ25 FAZER ABS': 'FZ25', 'XTZ 250 LANDER ABS CONNECTED': 'Lander 250',
}

const ROTEIRO = [
  'Dê a notícia junto com a saída: "o banco não aprovou agora, mas tem um caminho para a sua Yamaha".',
  'Mostre a parcela da entrada na moto que ele escolheu e quanto ele junta no fim.',
  'Diga quando ele pode pedir o financiamento: o mês, com as parcelas em dia.',
  'Faça a adesão na hora, ainda na loja: o 1º boleto vence em até 5 dias úteis.',
  'Marque o cliente na carteira: o sistema avisa no mês em que ele fica apto.',
]

const DUVIDAS = [
  { p: 'Tem análise de crédito?', r: 'Para entrar, não. Não precisa comprovar renda. A análise é no financiamento, depois das parcelas em dia.' },
  { p: 'Quanto custa?', r: 'Adesão R$ 50 e ativação R$ 19,90. Na parcela entram 19% de tarifa de recarga e R$ 14,90 de mensalidade.' },
  { p: 'E se eu atrasar?', r: 'Pagar em qualquer dia útil do mês do vencimento conta como em dia. Parcela fora do prazo não conta, e o financiamento fica mais longe.' },
  { p: 'E se eu desistir?', r: 'O dinheiro é devolvido, descontados 19% do saldo se cancelar antes do fim do plano.' },
  { p: 'Já sai aprovado?', r: 'Com as parcelas em dia, o banco pode financiar de 50% a 70% da moto. A proposta sai na hora da compra.' },
]

export default function LiberacredKit({ hoje }: { hoje: string }) {
  const [modelo, setModelo] = useState('FZ25 FAZER ABS')
  const [entrada, setEntrada] = useState(30)
  const [prazo, setPrazo] = useState(18)
  const [nome, setNome] = useState('Antônio')
  const [copiado, setCopiado] = useState(false)

  const moto = liberacredTabela.find(m => m.modelo === modelo)!
  const prazos = moto.planos.filter(p => p.entradaPct === entrada).map(p => p.parcelas)
  const plano = moto.planos.find(p => p.entradaPct === entrada && p.parcelas === prazo) ?? moto.planos.find(p => p.entradaPct === entrada)!

  // a 1ª parcela é no mês da adesão; pode pedir o financiamento no mês da parcela aptoApos
  const [ano, mes] = hoje.split('-').map(Number)
  const tApto = ano * 12 + (mes - 1) + plano.aptoApos - 1
  const mesApto = `${MESES[tApto % 12]} de ${Math.floor(tApto / 12)}`

  const primeiro = nome.trim().split(/\s+/)[0] || 'cliente'
  const mensagem =
    `${primeiro}, a sua ${nomeModelo(modelo)} continua de pé! 🏍️\n\n` +
    `O financiamento não saiu agora, mas o Banco Yamaha tem um programa feito para quem quer conquistar a Yamaha 0km: o Liberacred.\n\n` +
    `✅ Você parcela a entrada em ${plano.parcelas}x de ${fmt(plano.parcela)}\n` +
    `✅ Sem comprovar renda e sem análise de crédito para entrar\n` +
    `✅ Pagando ${plano.aptoApos} parcelas em dia, já pode antecipar o restante e pedir o financiamento (a partir de ${mesApto})\n\n` +
    `Você junta ${fmt(plano.acumulado)} de entrada, no seu ritmo. Vamos dar o primeiro passo hoje?`

  const copiar = async () => {
    try { await navigator.clipboard.writeText(mensagem); setCopiado(true); setTimeout(() => setCopiado(false), 1800) } catch { /* sem permissão de área de transferência */ }
  }

  const chip = (ativo: boolean) => ({
    backgroundColor: ativo ? 'var(--accent)' : 'var(--bg-inset)',
    color: ativo ? '#fff' : 'var(--text-secondary)',
  })

  return (
    <section id="kit-liberacred">
      <h2 className="section-label mb-3">Na recusa do CDC · kit do vendedor</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Simulação */}
        <div className="card card-pad lg:col-span-2" data-kit="simulacao">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Bike size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>A moto que o cliente escolheu</h3>
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
              <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Entrada</p>
              <div className="flex gap-1.5">
                {[30, 40, 50].map(e => (
                  <button key={e} type="button" onClick={() => setEntrada(e)} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={chip(e === entrada)}>{e}%</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>Prazo</p>
              <div className="flex gap-1.5 flex-wrap">
                {prazos.map(n => (
                  <button key={n} type="button" onClick={() => setPrazo(n)} className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={chip(n === plano.parcelas)}>{n}x</button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-inset)' }} data-kit="resultado">
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{nomeModelo(modelo)} · {fmt(moto.valor)}</p>
            <p className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: 'var(--accent)' }}>{plano.parcelas}x {fmt(plano.parcela)}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
              <div><span style={{ color: 'var(--text-tertiary)' }}>Junta de entrada</span><p className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{fmt(plano.acumulado)}</p></div>
              <div><span style={{ color: 'var(--text-tertiary)' }}>Pode financiar</span><p className="font-bold" style={{ color: 'var(--ok)' }}>após {plano.aptoApos} em dia · {mesApto.replace(' de ', '/')}</p></div>
            </div>
          </div>
          <label className="block mt-3">
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
          <p className="text-[10.5px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Motiva sem prometer aprovação: o financiamento sai da proposta do banco quando o cliente fica apto.
          </p>
        </div>
      </div>

      {/* Roteiro + dúvidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="card card-pad" data-kit="roteiro">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={15} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Como conduzir, em 5 passos</h3>
          </div>
          <ol className="space-y-2">
            {ROTEIRO.map((r, i) => (
              <li key={r} className="flex gap-2.5 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>{i + 1}</span>
                {r}
              </li>
            ))}
          </ol>
        </div>
        <div className="card card-pad" data-kit="duvidas">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={15} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Se o cliente perguntar</h3>
          </div>
          <div className="space-y-2">
            {DUVIDAS.map(d => (
              <div key={d.p} className="text-[11.5px] leading-relaxed">
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.p}</p>
                <p style={{ color: 'var(--text-secondary)' }}>{d.r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
