import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Você é o estúdio de marketing da Nippon Motos, concessionária Yamaha (Bragança Paulista, Atibaia, Amparo e Extrema). Cria posts de Instagram para ANÚNCIO PATROCINADO seguindo o padrão da montadora Yamaha.

REGRAS DE MARCA YAMAHA:
- Tom corporativo, premium, porém acessível e regional. Português do Brasil.
- Destacar emoção + razão (preço/condição) sem ser apelativo.
- Nunca inventar preço exato se não fornecido; usar "condições especiais" / "taxa zero" / "entrada facilitada".
- Sempre incluir CTA claro para o cliente chamar no direct/WhatsApp.
- Respeitar identidade Yamaha: confiança, tecnologia, performance, "Revs your Heart".
- Nunca use travessão (—); use vírgula ou ponto.

Responda SOMENTE com um JSON válido (sem markdown, sem comentários) neste formato exato:
{
  "headline": "frase de impacto curta para a arte, até 6 palavras, SEM o nome do modelo (o modelo já aparece grande na arte)",
  "legenda": "legenda completa do post, 3-5 linhas, com quebras de linha \\n e emojis pontuais",
  "hashtags": ["#tag1", "#tag2", ...10 a 14 hashtags relevantes],
  "cta": "chamada de ação final curta",
  "sugestaoArte": "1 frase descrevendo a arte/foto ideal para o post"
}`

export async function POST(req: NextRequest) {
  try {
    const { modelo, objetivo, estoque, cobertura, campanha } = await req.json()
    if (!modelo || typeof modelo !== 'string') {
      return NextResponse.json({ error: 'Modelo inválido.' }, { status: 400 })
    }

    const userMsg = `Gere o post para a campanha:
- Modelo: ${modelo}
- Objetivo: ${objetivo ?? 'girar estoque parado e atrair leads para anúncio pago'}
${typeof campanha === 'string' && campanha ? `- Campanha oficial Yamaha em vigor (a arte já é a peça da montadora): ${campanha.slice(0, 200)}. Escreva o nome da campanha exatamente como está aqui, letra por letra (é "Faro", de faro de quem fareja a vantagem, nunca "Farol"). A legenda tem que anunciar essas vantagens exatamente assim, deixar claro que o cliente escolhe uma delas, e fechar com "Consulte condições. Benefícios não cumulativos e válidos enquanto durarem os estoques."` : ''}
${estoque ? `- Contexto interno (NÃO citar no post): ${estoque} unidades em estoque, ${cobertura} dias de cobertura.` : ''}
O post é para tráfego pago no Instagram da concessionária. Foque em atrair quem está pesquisando moto na região.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    let parsed
    try {
      const clean = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      parsed = { headline: modelo, legenda: text, hashtags: [], cta: 'Chame no direct!', sugestaoArte: '' }
    }

    // o nome da campanha oficial não pode sair trocado (a IA escreveu "Farol de Vantagens" em 07/10)
    if (typeof campanha === 'string' && /Faro de Vantagens/.test(campanha)) {
      for (const k of ['headline', 'legenda', 'cta'] as const) {
        if (typeof parsed[k] === 'string') parsed[k] = parsed[k].replace(/Farol de Vantagens/gi, 'Faro de Vantagens')
      }
      if (Array.isArray(parsed.hashtags)) parsed.hashtags = parsed.hashtags.map((h: string) => h.replace(/FarolDeVantagens/gi, 'FaroDeVantagens'))
    }

    return NextResponse.json({ campanha: parsed })
  } catch (err) {
    console.error('Campanha API error:', err)
    return NextResponse.json({ error: 'Erro ao gerar campanha.' }, { status: 500 })
  }
}
