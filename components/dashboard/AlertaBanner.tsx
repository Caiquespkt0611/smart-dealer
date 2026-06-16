interface Props {
  estoqueAlertas: Array<{ modelo: string; cobertura: number }>
  projecaoPct: number
}

export function AlertaBanner({ estoqueAlertas, projecaoPct }: Props) {
  const msgs: string[] = []

  if (estoqueAlertas.length > 0) {
    msgs.push(`${estoqueAlertas[0].modelo}: ${estoqueAlertas[0].cobertura} dias de cobertura`)
    if (estoqueAlertas.length > 1) {
      msgs.push(`+${estoqueAlertas.length - 1} modelo(s) crítico(s)`)
    }
  }
  if (projecaoPct < 80) {
    msgs.push(`Varejo: projeção em ${projecaoPct}% da meta`)
  }

  if (msgs.length === 0) return null

  return (
    <div className="rounded-xl border border-[#EF4444] bg-[#EF444410] px-4 py-3 flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-semibold text-[#EF4444]">ALERTA: </span>
        <span className="text-sm text-[#FCA5A5]">{msgs.join(' · ')}</span>
      </div>
      <span className="text-xs text-[#EF4444] font-medium uppercase tracking-wide shrink-0">
        Ação necessária
      </span>
    </div>
  )
}
