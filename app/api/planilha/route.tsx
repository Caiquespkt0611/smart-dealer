import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getToken } from 'next-auth/jwt'
import { BUCKET_DADOS } from '@/lib/dados-vivos'
import { ARQUIVO_PLANILHA, processarSeMudou } from '@/lib/ingestao'
import { parseWorkbook } from '@/lib/importar-dados'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const ROLES_UPLOAD = ['TITULAR', 'GERENTE', 'CONSULTOR']
const TAMANHO_MAX = 4 * 1024 * 1024 // limite do corpo da requisição na Vercel é 4,5 MB

function storage() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ).storage.from(BUCKET_DADOS)
}

/**
 * Entrega a planilha viva do Storage (Estúdio do Consultor em public/pc e tela /dados).
 * `?baixar=1` força o download com o nome original.
 */
export async function GET(request: NextRequest) {
  const { data, error } = await storage().download(ARQUIVO_PLANILHA)
  if (error || !data) {
    console.error('[planilha] download falhou:', error)
    return NextResponse.json({ erro: `Planilha não disponível: ${error?.message ?? 'sem dados'}` }, { status: 404 })
  }
  const modo = request.nextUrl.searchParams.has('baixar') ? 'attachment' : 'inline'
  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': TIPO_XLSX,
      'Content-Disposition': `${modo}; filename="${ARQUIVO_PLANILHA}"`,
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * Substitui a planilha do bucket pela enviada na tela /dados.
 * Confere o arquivo antes (abas e colunas que o sistema lê), guarda a anterior em
 * historico/ e reprocessa na hora — o sistema já abre com os números novos.
 */
export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET ?? 'smart-dealer-yamaha-2026' })
  if (!token || !ROLES_UPLOAD.includes(String(token.role))) {
    return NextResponse.json({ erro: 'Seu usuário não pode atualizar a planilha.' }, { status: 403 })
  }

  const form = await request.formData().catch(() => null)
  const arquivo = form?.get('arquivo')
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return NextResponse.json({ erro: 'Nenhum arquivo recebido.' }, { status: 400 })
  }
  if (!arquivo.name.toLowerCase().endsWith('.xlsx')) {
    return NextResponse.json({ erro: 'O arquivo precisa ser .xlsx (Excel).' }, { status: 400 })
  }
  if (arquivo.size > TAMANHO_MAX) {
    return NextResponse.json({ erro: 'Arquivo maior que 4 MB.' }, { status: 413 })
  }

  const conteudo = await arquivo.arrayBuffer()
  let resumo
  try {
    resumo = parseWorkbook(conteudo).resumo
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ erro: `Planilha fora do padrão: ${msg}` }, { status: 422 })
  }

  const bucket = storage()
  const carimbo = new Date().toISOString().replace(/[:.]/g, '-')
  const { data: anterior } = await bucket.download(ARQUIVO_PLANILHA)
  if (anterior) {
    const { error } = await bucket.upload(`historico/${carimbo}.xlsx`, anterior, { contentType: TIPO_XLSX })
    if (error) console.error('[planilha] backup da anterior falhou:', error)
  }

  const { error } = await bucket.upload(ARQUIVO_PLANILHA, conteudo, { upsert: true, contentType: TIPO_XLSX })
  if (error) {
    console.error('[planilha] upload falhou:', error)
    return NextResponse.json({ erro: `Não consegui salvar: ${error.message}` }, { status: 500 })
  }

  try {
    await processarSeMudou()
  } catch (e) {
    console.error('[planilha] reprocesso falhou:', e)
    return NextResponse.json({
      erro: 'Arquivo salvo, mas a atualização dos números falhou. Tente abrir o sistema de novo em 1 minuto.',
    }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    linhasVarejo: resumo.linhasVarejo,
    linhasEstoque: resumo.linhasEstoque,
    mercadoTotal: resumo.mercadoTotal,
  })
}
