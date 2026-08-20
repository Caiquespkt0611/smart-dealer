import { NextRequest, NextResponse } from 'next/server'
import { gatewayConfigurado, statusPareamento } from '@/lib/andrecar-gateway'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!gatewayConfigurado()) {
    return NextResponse.json({ erro: 'Gateway não configurado' }, { status: 503 })
  }
  const unidadeId = req.nextUrl.searchParams.get('unidadeId')
  if (!unidadeId) return NextResponse.json({ erro: 'unidadeId obrigatório' }, { status: 400 })
  try {
    return NextResponse.json(await statusPareamento(unidadeId))
  } catch (e) {
    return NextResponse.json({ erro: String(e) }, { status: 502 })
  }
}
