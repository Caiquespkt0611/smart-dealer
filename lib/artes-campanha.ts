// Artes prontas da campanha "Seleção Yamaha — 4 primeiras revisões grátis".
// Fase de teste: usamos as artes finalizadas (em /public/campanhas) para demonstração.
// Depois trocamos por geração dinâmica (foto PNG sem fundo + ImageResponse).
// Match por palavra-chave para funcionar independente do nome exato vindo do estoque.

interface ArteCampanha {
  src: string
  /** preço de entrada exibido na arte, para o texto da IA bater com a peça */
  entrada: string
  parcela: string
}

interface ModeloComArte {
  /** nome canônico exibido no seletor quando o modelo não vem do estoque */
  modelo: string
  match: (m: string) => boolean
  arte: ArteCampanha
  /** valores de demonstração quando o modelo não está na lista de encalhados */
  demo: { estoqueTotal: number; cobertura: number }
}

const MODELOS: ModeloComArte[] = [
  { modelo: 'Crosser 150', match: m => m.includes('CROSSER'), demo: { estoqueTotal: 11, cobertura: 142 }, arte: { src: '/campanhas/crosser.jpeg', entrada: 'R$ 5.999', parcela: 'R$ 641' } },
  { modelo: 'Factor 150 DX', match: m => m.includes('FACTOR') && m.includes('DX'), demo: { estoqueTotal: 8, cobertura: 110 }, arte: { src: '/campanhas/factor-dx.jpeg', entrada: 'R$ 4.999', parcela: 'R$ 572' } },
  { modelo: 'FZ15 ABS', match: m => m.replace(/[\s-]/g, '').includes('FZ15'), demo: { estoqueTotal: 6, cobertura: 72 }, arte: { src: '/campanhas/fz15.jpeg', entrada: 'R$ 6.490', parcela: 'R$ 597' } },
  { modelo: 'NMAX Connected ABS', match: m => m.includes('NMAX'), demo: { estoqueTotal: 5, cobertura: 64 }, arte: { src: '/campanhas/nmax.jpeg', entrada: 'R$ 9.886', parcela: '36x R$ 644' } },
  { modelo: 'R15 ABS', match: m => m.replace(/[\s-]/g, '').includes('R15'), demo: { estoqueTotal: 7, cobertura: 58 }, arte: { src: '/campanhas/r15.jpeg', entrada: 'R$ 4.924', parcela: '48x R$ 729' } },
]

export function getArteCampanha(modelo: string): ArteCampanha | null {
  const m = (modelo ?? '').toUpperCase()
  return MODELOS.find(a => a.match(m))?.arte ?? null
}

/**
 * Garante que todos os modelos com arte pronta apareçam no seletor do gerador,
 * mesmo que não estejam na lista de encalhados (blindagem para o demo).
 * Mantém os encalhados reais e só acrescenta os que faltam.
 */
export function comModelosComArte<T extends { modelo: string; estoqueTotal: number; cobertura: number; severidade: string }>(
  produtos: T[],
): (T | { modelo: string; estoqueTotal: number; cobertura: number; severidade: string })[] {
  const jaTem = new Set(
    produtos.map(p => getArteCampanha(p.modelo)?.src).filter(Boolean) as string[],
  )
  const extras = MODELOS.filter(a => !jaTem.has(a.arte.src)).map(a => ({
    modelo: a.modelo,
    estoqueTotal: a.demo.estoqueTotal,
    cobertura: a.demo.cobertura,
    severidade: 'ALTA',
  }))
  return [...produtos, ...extras]
}
