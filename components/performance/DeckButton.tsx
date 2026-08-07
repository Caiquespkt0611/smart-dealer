'use client'

import { useState } from 'react'
import { Presentation } from 'lucide-react'
import { baixarDeckSmartDealer, type DeckDados } from '@/lib/deck-performance'

export function DeckButton({ dados }: { dados: DeckDados }) {
  const [rotulo, setRotulo] = useState<string | null>(null)

  function gerar() {
    const n = baixarDeckSmartDealer(dados)
    setRotulo(`${n} slides ✓`)
    setTimeout(() => setRotulo(null), 2400)
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
