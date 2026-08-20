'use client'

// "Gerar PDCA" e "Gerar Deck" com saída IDÊNTICA ao Performance Concessionário:
// um iframe invisível carrega o app oficial (public/pc/estudio.html, que puxa a
// planilha viva sozinho) e os cliques daqui acionam os botões de lá — mesmo
// código, mesmo arquivo. Nada do estúdio aparece na tela.
import { useRef, useState } from 'react'
import { FileSpreadsheet, Presentation } from 'lucide-react'

const GRUPO = 'NIPPON MOTOS'

type Win = Window & { CARDS?: unknown; MODELO?: unknown }

async function prontoParaGerar(frame: HTMLIFrameElement): Promise<Win> {
  const inicio = Date.now()
  while (Date.now() - inicio < 25000) {
    const win = frame.contentWindow as Win | null
    if (win && win.CARDS) {
      const doc = frame.contentDocument!
      // aponta os seletores do app para a Nippon (ele abre no pior grupo da carteira)
      const selCards = doc.getElementById('selGrupoCards') as HTMLSelectElement | null
      if (selCards && selCards.value !== GRUPO) {
        selCards.value = GRUPO
        selCards.dispatchEvent(new Event('change'))
      }
      const selPainel = doc.getElementById('selGrupo') as HTMLSelectElement | null
      if (selPainel) {
        const op = [...selPainel.options].find(o => o.value === GRUPO)
        if (op && selPainel.value !== GRUPO) {
          selPainel.value = GRUPO
          selPainel.dispatchEvent(new Event('change'))
        }
      }
      return win
    }
    await new Promise(r => setTimeout(r, 400))
  }
  throw new Error('o motor oficial não terminou de carregar a planilha')
}

export function OficialButtons({ apenas }: { apenas?: 'pdca' | 'deck' }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [feito, setFeito] = useState<string | null>(null)

  function frame(): HTMLIFrameElement {
    if (frameRef.current?.isConnected) return frameRef.current
    const f = document.createElement('iframe')
    f.src = '/pc/estudio.html'
    f.style.display = 'none'
    f.setAttribute('aria-hidden', 'true')
    document.body.appendChild(f)
    frameRef.current = f
    return f
  }

  async function gerar(qual: 'pdca' | 'deck') {
    if (ocupado) return
    setOcupado(qual)
    try {
      const win = await prontoParaGerar(frame())
      const botao = win.document.getElementById(qual === 'pdca' ? 'btnPdca' : 'btnCardsPptx')
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
