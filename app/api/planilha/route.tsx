import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { BUCKET_DADOS } from '@/lib/dados-vivos'
import { ARQUIVO_PLANILHA } from '@/lib/ingestao'

export const dynamic = 'force-dynamic'

/** Entrega a planilha viva do Storage para o Estúdio do Consultor (public/pc). */
export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data, error } = await sb.storage.from(BUCKET_DADOS).download(ARQUIVO_PLANILHA)
  if (error || !data) {
    console.error('[planilha] download falhou:', error)
    return NextResponse.json({ erro: `Planilha não disponível: ${error?.message ?? 'sem dados'}` }, { status: 404 })
  }
  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `inline; filename="${ARQUIVO_PLANILHA}"`,
      'Cache-Control': 'no-store',
    },
  })
}
