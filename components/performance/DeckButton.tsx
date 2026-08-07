'use client'

import { useState } from 'react'
import { Presentation } from 'lucide-react'
import type { DeckDados } from '@/lib/deck-pptxgen'

export function DeckButton({ dados }: { dados: DeckDados }) {
  const [rotulo, setRotulo] = useState<string | null>(null)

  async function gerar() {
    setRotulo('gerando…')
    try {
      // import dinâmico: a pptxgenjs só carrega quando o botão é clicado
      const { baixarDeck } = await import('@/lib/deck-pptxgen')
      const n = await baixarDeck(dados)
      setRotulo(`${n || ''} slides ✓`)
    } catch (e) {
      console.error('[deck] falha ao gerar:', e)
      alert(`Erro ao gerar o deck: ${e instanceof Error ? e.message : String(e)}\n\nRecarregue a página (Cmd+Shift+R) e tente de novo.`)
      setRotulo('erro — ver console')
    }
    setTimeout(() => setRotulo(null), 3200)
  }

  return (
    <button
      onClick={gerar}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
      style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}
    >
      <Presentation size={15} />
      {rotulo ?? 'Gerar Deck (.pptx)'}
    </button>
  )
}
