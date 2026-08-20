import { NextResponse } from 'next/server'
import { gatewayConfigurado, listarUnidades } from '@/lib/andrecar-gateway'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!gatewayConfigurado()) {
    return NextResponse.json({ configurado: false, unidades: [] })
  }
  try {
    const unidades = await listarUnidades()
    return NextResponse.json({ configurado: true, unidades })
  } catch (e) {
    return NextResponse.json({ configurado: true, erro: String(e), unidades: [] }, { status: 502 })
  }
}
