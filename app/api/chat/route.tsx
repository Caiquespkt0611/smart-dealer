import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { kaizenData } from '@/lib/kaizen-data'
import { treinamentoData } from '@/lib/treinamento-data'
import { getDashboardData, getEstoqueCompleto } from '@/lib/data'
import { getShareData, type ShareData } from '@/lib/dados-vivos'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildShareContext(d: ShareData) {
  const atua = d.segmentosYamahaAtua?.length ? new Set(d.segmentosYamahaAtua) : null
  const disputaveis = [...d.segments].filter(s => !atua || atua.has(s.segmento))
  const fracos = disputaveis.filter(s => s.total >= 30).sort((a, b) => a.shareYamaha - b.shareYamaha).slice(0, 3)
  const fortes = disputaveis.filter(s => s.total >= 20).sort((a, b) => b.shareYamaha - a.shareYamaha).slice(0, 2)
  return `
MARKET SHARE (emplacamentos ${d.areas.join(' + ')}, ${d.referencia} — mercado de ${d.totalMercado2026} motos):
- Share Yamaha: ${d.yamahaShare}% (${d.yamahaQtd} motos) | Honda lidera com ${d.hondaShare}% (${d.hondaQtd}).
- Nippon Motos: ${d.nipponQtd} motos = ${d.nipponShareDoMercado}% do mercado e ${d.nipponShareDaYamaha}% de toda Yamaha regional.
- Segmentos onde a Yamaha está FRACA (oportunidade): ${fracos.map(s => `${s.segmento} (${s.shareYamaha}%, mercado de ${s.total})`).join('; ')}.
- Segmentos onde a Yamaha é FORTE (defender): ${fortes.map(s => `${s.segmento} (${s.shareYamaha}%)`).join('; ')}.
- ${d.numCompetitorCnpj} concessionárias concorrentes mapeadas na região.`
}

function buildKaizenContext() {
  const d = kaizenData
  const max = d.totalPossivel + d.totalExtra
  const recuperar = d.items.filter(i => i.status !== 'OK')
    .map(i => `${i.indicador}/${i.area} (status ${i.status}, ${i.pontosObtidos}/${i.pontosPossiveis} pts)`)
  return `
KAIZEN (${d.competencia}):
- Pontuação atual: ${d.totalObtido} de ${d.totalPossivel} base (máximo possível ${max} com extras).
- Indicadores a recuperar: ${recuperar.join('; ')}.`
}

function buildTreinoContext() {
  const d = treinamentoData
  const pct = Math.round((d.totalOk / d.totalCerts) * 100)
  const fracos = d.porCargo.filter(c => c.pct < 70).map(c => `${c.cargo} (${c.pct}%)`)
  return `
TREINAMENTO (Universidade Yamaha):
- Índice geral: ${pct}% (${d.totalOk}/${d.totalCerts} certificações OK, ${d.totalPend} pendências).
- Setores com baixa cobertura: ${fracos.length ? fracos.join('; ') : 'nenhum crítico'}.`
}

type Dash = Awaited<ReturnType<typeof getDashboardData>>
type Estq = Awaited<ReturnType<typeof getEstoqueCompleto>>

function buildVarejoContext(d: Dash, estoque: Estq) {
  try {
    const criticos = estoque.filter(e => e.status === 'CRITICO').slice(0, 6)
    const varejo = d.modo === 'largada'
      ? `VAREJO — LARGADA DE ${d.nomeMesCorrente.toUpperCase()}/${d.ano} (sem vendas registradas ainda no mês):
- ${d.nomeMesFechado} fechou com ${d.fechamentoAnterior} motos. Carta de ${d.nomeMesCorrente.toLowerCase()}: ${d.meta} (salto de ${d.saltoCarta >= 0 ? '+' : ''}${d.saltoCarta}).
- Ritmo que a carta pede: ${d.ritmoNecessario} un/dia em ${d.diasUteisMes} dias úteis.
- Ritmo de ${d.nomeMesFechado.toLowerCase()} cobriria ${d.pctAtingimento}% da carta.`
      : `VAREJO ${d.nomeMesCorrente.toUpperCase()}/${d.ano} (mês em curso):
- Vendas: ${d.vendasMes} motos | projeção de fechamento: ${d.projecao} | carta: ${d.meta} (${d.pctAtingimento}%).`
    return `${varejo}
- Ranking regional: ${d.rankingPos}º de ${d.rankingTotal} grupos | Prêmio em jogo: R$ ${d.premioPotencial.toLocaleString('pt-BR')}.

ESTOQUE CRÍTICO (posição atual):
${criticos.length ? criticos.map(e => `- ${e.modelo}: ${e.cobertura} dias de cobertura${e.sugestaoCompra > 0 ? ` → comprar ${e.sugestaoCompra} un` : ''}`).join('\n') : '- nenhum modelo crítico'}

LEADS (${d.referenciaLeads}):
- Tempo de atendimento: ${d.tempoAtend} min (meta ≤ 10) | TCA: ${d.tcaPct}% | LCR: ${d.lcrPct}%.

NPS (${d.referenciaNps}):
- Vendas: ${d.npsVendas} (meta 93) | Pós-vendas: ${d.npsPosvenda} (meta 87).`
  } catch {
    return 'VAREJO: dados indisponíveis no momento — diga que precisa verificar.'
  }
}

async function buildSystemPrompt() {
  const [d, estoque, share] = await Promise.all([
    getDashboardData('Grupo Nippon'),
    getEstoqueCompleto('Grupo Nippon').catch(() => [] as Estq),
    getShareData(),
  ])
  return `Você é o Assistente Smart Dealer da Nippon Motos, grupo com lojas em Bragança Paulista, Atibaia, Amparo e Extrema. Consultor inteligente para o titular e gerentes.

DADOS ATUAIS (${d.nomeMesCorrente.toLowerCase()}/${d.ano} · mercado fechado até ${d.nomeMesFechado.toLowerCase()}):

${buildVarejoContext(d, estoque)}

${buildShareContext(share)}
${buildKaizenContext()}
${buildTreinoContext()}

Responda de forma direta e prática. Use no máximo 3 parágrafos curtos.
Quando perguntarem "o que posso melhorar", priorize por impacto: market share em segmentos de alto volume, pontos do Kaizen na mesa e pendências de treinamento.
Use apenas os dados acima. Nunca invente dados que não estão aqui.
Se não souber algo, diga que precisa verificar.`
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ message: 'Mensagem inválida.' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: await buildSystemPrompt(),
      messages: [{ role: 'user', content: message }],
    })

    const text =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ message: text })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { message: 'Erro ao processar sua pergunta. Tente novamente.' },
      { status: 500 }
    )
  }
}
