'use client'

// "Gerar PDCA" e "Gerar Deck" com saída IDÊNTICA ao Performance Concessionário:
// um iframe invisível carrega o app oficial (public/pc/estudio.html, que puxa a
// planilha viva sozinho) e os cliques daqui acionam os botões de lá — mesmo
// código, mesmo arquivo. Nada do estúdio aparece na tela.
//
// Prontidão é detectada pelo DOM (o app esconde #upload ao terminar de carregar):
// CARDS/MODELO são `let` de script, não viram propriedade do window.
import { useEffect, useRef, useState } from 'react'
import { FileSpreadsheet, Presentation } from 'lucide-react'

const GRUPO = 'NIPPON MOTOS'

function appCarregado(frame: HTMLIFrameElement): boolean {
  try {
    const doc = frame.contentDocument
    const upload = doc?.getElementById('upload')
    const sel = doc?.getElementById('selGrupoCards') as HTMLSelectElement | null
    return Boolean(upload && upload.style.display === 'none' && sel && sel.options.length > 0)
  } catch {
    return false
  }
}

async function prontoParaGerar(frame: HTMLIFrameElement): Promise<Document> {
  const inicio = Date.now()
  while (Date.now() - inicio < 30000) {
    if (appCarregado(frame)) {
      const doc = frame.contentDocument!
      // aponta os seletores do app para a Nippon (ele abre no pior grupo da carteira)
      for (const id of ['selGrupoCards', 'selGrupo']) {
        const sel = doc.getElementById(id) as HTMLSelectElement | null
        if (!sel) continue
        const op = [...sel.options].find(o => o.value === GRUPO)
        if (op && sel.value !== GRUPO) {
          sel.value = GRUPO
          sel.dispatchEvent(new Event('change'))
        }
      }
      return doc
    }
    await new Promise(r => setTimeout(r, 300))
  }
  throw new Error('o motor oficial não terminou de carregar a planilha (recarregue a página e tente de novo)')
}

// iframe único compartilhado entre os dois pontos da tela que usam os botões
function obterFrame(): HTMLIFrameElement {
  const existente = document.getElementById('sd-motor-oficial') as HTMLIFrameElement | null
  if (existente) return existente
  const f = document.createElement('iframe')
  f.id = 'sd-motor-oficial'
  f.src = '/pc/estudio.html'
  f.style.display = 'none'
  f.setAttribute('aria-hidden', 'true')
  document.body.appendChild(f)
  return f
}

export function OficialButtons({ apenas }: { apenas?: 'pdca' | 'deck' }) {
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [feito, setFeito] = useState<string | null>(null)
  const montado = useRef(false)

  // pré-carrega o motor assim que a tela abre — o clique fica instantâneo
  useEffect(() => {
    if (!montado.current) {
      montado.current = true
      obterFrame()
    }
  }, [])

  async function gerar(qual: 'pdca' | 'deck') {
    if (ocupado) return
    setOcupado(qual)
    try {
      const doc = await prontoParaGerar(obterFrame())
      const botao = doc.getElementById(qual === 'pdca' ? 'btnPdca' : 'btnCardsPptx')
      if (!botao) throw new Error('botão do gerador não encontrado')
      botao.click()
      setFeito(qual)
      setTimeout(() => setFeito(null), 2600)
    } catch (e) {
      alert('Não consegui gerar pelo motor oficial: ' + (e as Error).message)
    } finally {
      setOcupado(null)
    }
  }

  const estilo = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60'

  return (
    <>
      {apenas !== 'deck' && (
        <button onClick={() => gerar('pdca')} disabled={ocupado !== null} className={estilo}
          style={{ backgroundColor: 'var(--ok-bg)', color: 'var(--ok)', border: '1px solid var(--ok-border)' }}>
          <FileSpreadsheet size={14} />
          {ocupado === 'pdca' ? 'Montando…' : feito === 'pdca' ? 'PDCA baixado ✓' : 'Gerar PDCA (.xlsx)'}
        </button>
      )}
      {apenas !== 'pdca' && (
        <button onClick={() => gerar('deck')} disabled={ocupado !== null} className={estilo}
          style={{ backgroundColor: 'var(--yamaha-blue, #003087)', color: '#fff' }}>
          <Presentation size={14} />
          {ocupado === 'deck' ? 'Montando…' : feito === 'deck' ? 'Deck baixado ✓' : 'Gerar Deck (.pptx)'}
        </button>
      )}
    </>
  )
}
