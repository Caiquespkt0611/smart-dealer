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
    <div className="rounded-xl px-5 py-3.5 flex items-center gap-3" style={{ background: 'var(--danger-bg)' }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--yh-red)' }} />
      <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
        <b style={{ color: 'var(--danger)' }}>Ação necessária.</b> {msgs.join(' · ')}
      </p>
    </div>
  )
}
