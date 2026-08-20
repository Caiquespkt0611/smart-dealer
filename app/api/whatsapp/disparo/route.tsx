import { NextRequest, NextResponse } from 'next/server'
import { dispararTexto, gatewayConfigurado } from '@/lib/andrecar-gateway'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!gatewayConfigurado()) {
    // sem gateway o front cai no wa.me — não é erro do usuário
    return NextResponse.json({ ok: false, motivo: 'nao-configurado' }, { status: 503 })
  }
  const { telefone, texto } = await req.json()
  if (!telefone || !texto) {
    return NextResponse.json({ erro: 'telefone e texto obrigatórios' }, { status: 400 })
  }
  try {
    const r = await dispararTexto(String(telefone), String(texto))
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, motivo: 'sem-conversa', dica: 'O cliente precisa mandar uma mensagem (ex.: "Oi") para o número pareado uma vez — depois disso o disparo sai direto.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, erro: String(e) }, { status: 502 })
  }
}
