export const dynamic = 'force-dynamic'

import { getEstoqueCompleto } from '@/lib/data'
import { fotoModelo } from '@/components/layout/nav'
import { EstudioKV, type ModeloVitrine } from '@/components/campanhas/EstudioKV'

export const metadata = { title: 'Campanhas · Smart Dealer' }

// Usada quando o estoque não responde: a vitrine não fica vazia
const RESERVA = ['FAZER FZ15 ABS', 'FACTOR 150 DX', 'CROSSER 150 Z ABS', 'NMAX', 'FLUO ABS', 'LANDER 250 ABS']

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams
  let estoque: Awaited<ReturnType<typeof getEstoqueCompleto>> = []
  try { estoque = await getEstoqueCompleto(loja) } catch { estoque = [] }

  // uma moto por foto, as mais paradas primeiro
  const vistos = new Set<string>()
  const modelos: ModeloVitrine[] = []
  const base = estoque.length
    ? [...estoque].sort((a, b) => b.cobertura - a.cobertura)
    : RESERVA.map(modelo => ({ modelo, estoqueTotal: 0, cobertura: 0, giroMensal: 0 }))
  for (const e of base) {
    const foto = fotoModelo(e.modelo)
    if (!foto || vistos.has(foto)) continue
    vistos.add(foto)
    modelos.push({
      modelo: e.modelo,
      foto,
      estoqueTotal: e.estoqueTotal,
      cobertura: Math.round(e.cobertura),
      encalhado: e.cobertura >= 45 && e.cobertura < 900,
    })
  }

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1>Campanha <span className="text-[var(--text-tertiary)]">no Instagram</span></h1>
        <p className="text-slate-600">
          Escolha a moto, monte a arte no padrão da Yamaha e poste. A IA escreve a legenda.
        </p>
      </div>
      <EstudioKV modelos={modelos.slice(0, 12)} loja={loja} />
    </div>
  )
}
