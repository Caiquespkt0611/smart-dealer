import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é o Assistente Smart Dealer da Nippon Motos, grupo com lojas em Bragança Paulista e Extrema (SP). Consultor inteligente para o titular e gerentes.

DADOS ATUAIS (junho/2026):

VAREJO JUNHO/2026:
- Grupo total até dia 14: 42 motos (projeção: 104 | meta: 160 | 65.6% da meta)
- Bragança Paulista: 33 vendidas (projeção: 82)
- Extrema: 9 vendidas (projeção: 22)
- Ranking regional: 4º de 9 grupos
- Prêmio em jogo: R$ 15.000 (Junho em Dobro: R$ 30.000 se atingir 176 motos)
- Para bater a meta: precisa de 118 motos nos dias restantes do mês

ESTOQUE CRÍTICO:
- AEROX: 5 dias de cobertura → URGENTE: comprar 33 unidades
- Factor 150 ED: 15 dias → comprar 26 unidades
- NMAX: 16 dias → comprar 13 unidades
- Lander 250 ABS: 20 dias → comprar 18 unidades
- SEM MIX em Bragança Paulista: NEOS, XMAX ABS
- SEM MIX em Extrema: Factor 150 DX, MT-03 ABS, R15 ABS, NEOS, XMAX ABS

LEADS JUNHO/2026:
- Tempo de atendimento: 45 min (meta: até 10 min — CRÍTICO)
- TCA (Taxa de Confirmação de Atendimento): 100% — OK
- LCR (Taxa de Conversão): dados parciais do mês

NPS ATUAL:
- NPS Vendas: 94.5 (meta: 93) — OK | +5 pts Kaizen
- NPS Pós-vendas: 87.7 (meta: 87) — OK | +10 pts Kaizen
- Total Kaizen NPS: 15 pontos garantidos

Responda de forma direta e prática. Use no máximo 3 parágrafos curtos.
Use apenas os dados acima. Nunca invente dados que não estão aqui.
Se não souber algo, diga que precisa verificar.`

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ message: 'Mensagem inválida.' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
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
