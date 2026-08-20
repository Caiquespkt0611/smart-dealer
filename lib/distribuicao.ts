// Simulação de distribuição de estoque entre os 4 pontos de venda da área
// Amparo. Toda moto chega pela loja de Bragança; o emplacamento por área de
// influência (lib/distribuicao-data.ts) diz onde a demanda está, e o estoque
// de cada modelo é rateado na proporção do mercado do segmento daquele modelo.
import { distribuicaoData } from '@/lib/distribuicao-data'

// Mesmo mapeamento da aba CADASTRO SEGMENTO YAMAHA ATUA, chaveado por
// palavra-chave porque o nome comercial do modelo varia entre as abas
// ('CROSSER 150 Z ABS' no estoque × 'CROSSER 150 Z' no cadastro).
const REGRAS_SEGMENTO: Array<[RegExp, string]> = [
  [/CROSSER/i, 'SMALL - ON/OFF - 150cc-199cc'],
  [/FACTOR|FZ15|R15/i, 'SMALL - STREET - 150cc-199cc'],
  [/NMAX|AEROX|FLUO|\bZR\b/i, 'SMALL - SCOOTER - < 200cc'],
  [/NEOS/i, 'ELECTRIC'],
  [/LANDER/i, 'MIDDLE - ON/OFF - 200cc-500cc'],
  [/MT-?03/i, 'MIDDLE - STREET/N - 300cc-500cc Premium'],
  [/FAZER 250/i, 'MIDDLE - STREET/N - 200cc-399cc'],
  [/T[ÉE]N[ÉE]R[ÉE]|\bT7\b/i, 'BIG - Touring/Adventure - 600cc-799cc'],
  [/MT-?07/i, 'BIG - BIG STREET/N - 501cc-699cc'],
  [/XMAX/i, 'MIDDLE - SCOOTER - 201cc-449cc'],
  [/\bR3\b/i, 'MIDDLE - STREET/F - 200cc-500cc'],
]

export function segmentoDoModelo(modelo: string): string | null {
  for (const [re, seg] of REGRAS_SEGMENTO) {
    if (re.test(modelo)) return seg
  }
  return null
}

export interface LinhaDistribuicao {
  modelo: string
  segmento: string | null
  total: number
  /** unidades sugeridas na ordem de distribuicaoData.pontos */
  porPonto: number[]
}

export interface Simulacao {
  linhas: LinhaDistribuicao[]
  totalPorPonto: number[]
  totalGeral: number
}

/** Rateia `total` na proporção de `pesos`, preservando a soma (maior resto). */
function ratear(total: number, pesos: number[]): number[] {
  const somaPesos = pesos.reduce((s, p) => s + p, 0)
  if (total <= 0 || somaPesos <= 0) return pesos.map(() => 0)
  const exatos = pesos.map(p => (total * p) / somaPesos)
  const base = exatos.map(Math.floor)
  let falta = total - base.reduce((s, v) => s + v, 0)
  const ordem = exatos
    .map((v, i) => ({ i, resto: v - Math.floor(v) }))
    .sort((a, b) => b.resto - a.resto)
  for (const { i } of ordem) {
    if (falta <= 0) break
    base[i] += 1
    falta -= 1
  }
  return base
}

export function simularDistribuicao(
  estoque: Array<{ modelo: string; estoqueTotal: number }>,
): Simulacao {
  const pontos = distribuicaoData.pontos
  const pesoMercado = pontos.map(p => p.mercado)

  const linhas: LinhaDistribuicao[] = estoque
    .filter(e => e.estoqueTotal > 0)
    .map(e => {
      const segmento = segmentoDoModelo(e.modelo)
      // demanda do segmento em cada ponto; sem segmento (ex: TT-R 230),
      // o rateio cai para o mercado total do ponto
      const pesos = segmento
        ? pontos.map(p => (p.porSegmento as Record<string, { mercado: number }>)[segmento]?.mercado ?? 0)
        : pesoMercado
      const somaSeg = pesos.reduce((s, v) => s + v, 0)
      return {
        modelo: e.modelo,
        segmento,
        total: e.estoqueTotal,
        porPonto: ratear(e.estoqueTotal, somaSeg > 0 ? pesos : pesoMercado),
      }
    })
    .sort((a, b) => b.total - a.total)

  const totalPorPonto = pontos.map((_, i) => linhas.reduce((s, l) => s + l.porPonto[i], 0))
  return {
    linhas,
    totalPorPonto,
    totalGeral: totalPorPonto.reduce((s, v) => s + v, 0),
  }
}
