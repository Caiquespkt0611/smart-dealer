'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { baixarXlsx, type LinhaXlsx } from '@/lib/xlsx-bonito'
import type { AcaoPDCA } from '@/lib/performance'

// Índices de estilo do xlsx-bonito:
// 0 base · 1 título · 2 subtítulo · 3 cabeçalho · 4 texto · 5 centro
// 6 prioridade Alta · 7 Média · 8 Baixa · 9 faixa zebrada · 10 centro zebrado
const E = { titulo: 1, sub: 2, cab: 3, txt: 4, centro: 5, alta: 6, media: 7, baixa: 8, zebraTxt: 9, zebraCentro: 10 }

export function PdcaButton({ acoes, subtitulo, arquivo }: {
  acoes: AcaoPDCA[]
  subtitulo: string
  arquivo: string
}) {
  const [rotulo, setRotulo] = useState<string | null>(null)

  function gerar() {
    if (!acoes.length) {
      alert('Nada em alerta neste recorte — não há plano de ação a gerar.')
      return
    }
    const prioEstilo = (p: string) => p === 'Alta' ? E.alta : p === 'Média' ? E.media : E.baixa
    const vazio = (n: number) => Array.from({ length: n }, () => ({ v: '', s: E.cab }))

    const linhas: LinhaXlsx[] = [
      { altura: 30, celulas: [{ v: 'PLANO DE AÇÃO — NIPPON MOTOS', s: E.titulo }, ...vazio(8).map(c => ({ ...c, s: E.titulo }))] },
      { altura: 18, celulas: [{ v: subtitulo, s: E.sub }] },
      { altura: 6, celulas: [] },
      // cabeçalho em duas faixas, igual ao template: PRAZO abre em INÍCIO/TÉRMINO.
      // O sub-rótulo vai na MESMA célula, com quebra: numa mesclagem vertical só
      // o valor da célula de cima sobrevive.
      { altura: 20, celulas: [
        { v: 'O QUE FAZER?\n(AÇÃO)', s: E.cab }, { v: 'POR QUÊ?\n(JUSTIFICATIVA)', s: E.cab },
        { v: 'COMO?\n(ATIVIDADES PRINCIPAIS)', s: E.cab },
        { v: 'RESPONSÁVEL', s: E.cab }, { v: 'PRAZO', s: E.cab }, { v: '', s: E.cab },
        { v: 'STATUS', s: E.cab }, { v: 'PRIORIDADE', s: E.cab },
        { v: 'INDICADOR DE ACOMPANHAMENTO\n(Meta / impacto da ação)', s: E.cab }] },
      { altura: 22, celulas: [
        { v: '', s: E.cab }, { v: '', s: E.cab }, { v: '', s: E.cab },
        { v: '', s: E.cab }, { v: 'INÍCIO', s: E.cab }, { v: 'TÉRMINO', s: E.cab },
        { v: '', s: E.cab }, { v: '', s: E.cab }, { v: '', s: E.cab }] },
    ]

    acoes.forEach((l, i) => {
      const zebra = i % 2 === 1
      const t = zebra ? E.zebraTxt : E.txt, c = zebra ? E.zebraCentro : E.centro
      const comoTxt = l.como.map(x => '• ' + x).join('\n')
      const linhasComo = comoTxt.split('\n').reduce((n, x) => n + Math.ceil(x.length / 48), 0)
      const maior = Math.max(l.porque.length / 50, linhasComo, l.indicador.length / 50, l.acao.length / 32)
      linhas.push({ altura: Math.min(150, Math.max(56, Math.ceil(maior) * 13)), celulas: [
        { v: l.acao, s: t }, { v: l.porque, s: t }, { v: comoTxt, s: t },
        { v: l.resp, s: c }, { v: l.ini, s: c }, { v: l.fim, s: c }, { v: '', s: c },
        { v: l.prio, s: prioEstilo(l.prio) }, { v: l.indicador, s: t }] })
    })

    baixarXlsx(`${arquivo}.xlsx`, {
      nome: 'Plano de Ação',
      cols: [30, 46, 46, 15, 9, 9, 22, 11, 44],
      linhas,
      merges: ['A1:I1', 'A2:I2', 'A4:A5', 'B4:B5', 'C4:C5', 'D4:D5',
               'E4:F4', 'G4:G5', 'H4:H5', 'I4:I5'],
    })

    setRotulo(`${acoes.length} ações ✓`)
    setTimeout(() => setRotulo(null), 2400)
  }

  return (
    <button
      onClick={gerar}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
      style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
    >
      <FileSpreadsheet size={15} />
      {rotulo ?? 'Gerar PDCA (.xlsx)'}
    </button>
  )
}
