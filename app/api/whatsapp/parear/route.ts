import { NextRequest, NextResponse } from 'next/server'
import { gatewayConfigurado, iniciarPareamento } from '@/lib/andrecar-gateway'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!gatewayConfigurado()) {
    return NextResponse.json({ erro: 'Gateway não configurado' }, { status: 503 })
  }
  const { unidadeId, doZero } = await req.json()
  if (!unidadeId) return NextResponse.json({ erro: 'unidadeId obrigatório' }, { status: 400 })
  try {
    await iniciarPareamento(unidadeId, Boolean(doZero))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ erro: String(e) }, { status: 502 })
  }
}
