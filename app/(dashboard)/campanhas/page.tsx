export const dynamic = 'force-dynamic'

import { getEstoqueCompleto } from '@/lib/data'
import { fotoModelo } from '@/components/layout/nav'
import { EstudioKV, type ModeloVitrine, type CampanhaVigente } from '@/components/campanhas/EstudioKV'
import { condicaoFaro, textoCondicao } from '@/lib/condicoes-faro'

export const metadata = { title: 'Campanhas · Smart Dealer' }

// Campanha da Yamaha em vigor. O post só sai com moto que tem a arte oficial dela.
const CAMPANHA: CampanhaVigente = {
  nome: 'Faro de Vantagens',
  beneficios: 'Emplacamento grátis ou bônus de R$ 1.000 ou taxa zero',
}
const ARTES: Record<string, string> = {
  '/yamaha/m-lander.png': '/campanhas/faro-lander.jpg',
  '/yamaha/m-fz25.png': '/campanhas/faro-fz25.jpg',
}

// Usada quando o estoque não responde: a vitrine não fica vazia
const RESERVA = ['LANDER 250 ABS', 'FAZER 250 ABS']

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams
  let estoque: Awaited<ReturnType<typeof getEstoqueCompleto>> = []
  try { estoque = await getEstoqueCompleto(loja) } catch { estoque = [] }

  // 1. as motos com mais unidades no estoque, sem arte oficial: a arte sai na hora com a condição da circular
  const vistos = new Set<string>()
  const giro: ModeloVitrine[] = []
  for (const e of [...estoque].sort((a, b) => b.estoqueTotal - a.estoqueTotal)) {
    const foto = fotoModelo(e.modelo)
    const cond = condicaoFaro(e.modelo)
    if (!foto || ARTES[foto] || !cond || vistos.has(foto)) continue
    vistos.add(foto)
    giro.push({
      modelo: e.modelo,
      foto,
      estoqueTotal: e.estoqueTotal,
      cobertura: Math.round(e.cobertura),
      encalhado: e.cobertura >= 45 && e.cobertura < 900,
      condicao: textoCondicao(cond),
    })
    if (giro.length === 4) break
  }

  // 2. as que têm a arte oficial da campanha, uma moto por foto
  const modelos: ModeloVitrine[] = []
  const base = estoque.length
    ? [...estoque].sort((a, b) => b.estoqueTotal - a.estoqueTotal)
    : RESERVA.map(modelo => ({ modelo, estoqueTotal: 0, cobertura: 0, giroMensal: 0 }))
  for (const e of base) {
    const foto = fotoModelo(e.modelo)
    if (!foto || !ARTES[foto] || vistos.has(foto)) continue
    vistos.add(foto)
    modelos.push({
      modelo: e.modelo,
      foto,
      estoqueTotal: e.estoqueTotal,
      cobertura: Math.round(e.cobertura),
      encalhado: e.cobertura >= 45 && e.cobertura < 900,
      arte: ARTES[foto],
    })
  }
  for (const modelo of RESERVA) {
    const foto = fotoModelo(modelo)!
    if (vistos.has(foto)) continue
    vistos.add(foto)
    modelos.push({ modelo, foto, estoqueTotal: 0, cobertura: 0, encalhado: false, arte: ARTES[foto] })
  }

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h1>Campanha <span className="text-[var(--text-tertiary)]">no Instagram</span></h1>
        <p className="text-slate-600">
          Campanha {CAMPANHA.nome} em vigor. As motos com mais estoque ganham a arte na hora, com a condição da circular; a IA escreve a legenda.
        </p>
      </div>
      <EstudioKV modelos={[...giro, ...modelos]} loja={loja} campanha={CAMPANHA} />
    </div>
  )
}
