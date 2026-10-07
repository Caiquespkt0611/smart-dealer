'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, Download, Send, Copy, Check, Loader2 } from 'lucide-react'

export interface ModeloVitrine {
  modelo: string
  foto: string
  estoqueTotal: number
  cobertura: number
  encalhado: boolean
  /** arte oficial da campanha Yamaha em vigor; quando existe, é ela que vai para o post */
  arte?: string
}

export interface CampanhaVigente {
  nome: string
  beneficios: string
}

type Layout = 'vitrine' | 'noite' | 'pista'

const LAYOUTS: { id: Layout; nome: string; dica: string }[] = [
  { id: 'vitrine', nome: 'Vitrine', dica: 'Fundo branco, como a página do modelo no site' },
  { id: 'noite', nome: 'Noite', dica: 'Azul-marinho da Yamaha, moto em destaque' },
  { id: 'pista', nome: 'Pista', dica: 'Foto de corrida no alto, moto embaixo' },
]

const FRASE_PADRAO = 'Sai hoje da loja com a sua'
const W = 1080, H = 1350
const NAVY = '#070633', CINZA = '#F4F4F5', TXT = '#111111', MUTE = '#7C8591', VERDE = '#2E9E52'

const imgCache = new Map<string, Promise<HTMLImageElement>>()
function carrega(src: string) {
  if (!imgCache.has(src)) {
    imgCache.set(src, new Promise((ok, erro) => {
      const im = new Image()
      im.onload = () => ok(im)
      im.onerror = erro
      im.src = src
    }))
  }
  return imgCache.get(src)!
}

function quebra(ctx: CanvasRenderingContext2D, texto: string, larg: number) {
  const palavras = texto.split(/\s+/).filter(Boolean)
  const linhas: string[] = []
  let atual = ''
  for (const p of palavras) {
    const tenta = atual ? atual + ' ' + p : p
    if (ctx.measureText(tenta).width > larg && atual) { linhas.push(atual); atual = p } else atual = tenta
  }
  if (atual) linhas.push(atual)
  return linhas
}

function retRedondo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

// Foto do modelo "contida" na caixa; o fundo branco da foto some no cinza por multiplicação, como no site
function desenhaFoto(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const esc = Math.min(w / im.width, h / im.height)
  const fw = im.width * esc, fh = im.height * esc
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(im, x + (w - fw) / 2, y + (h - fh) / 2, fw, fh)
  ctx.restore()
}

interface Arte {
  layout: Layout
  modelo: string
  titulo: string
  condicao: string
  chamada: string
  loja: string
}

async function desenha(cv: HTMLCanvasElement, a: Arte, foto: string) {
  const ctx = cv.getContext('2d')!
  const css = getComputedStyle(document.documentElement)
  const COND = css.getPropertyValue('--font-display').trim() || "'Arial Narrow', sans-serif"
  const CORPO = css.getPropertyValue('--font-body').trim() || 'Roboto, sans-serif'
  await Promise.all([document.fonts.load(`800 100px ${COND}`), document.fonts.load(`500 30px ${CORPO}`)]).catch(() => {})
  const [moto, logo, pista] = await Promise.all([
    carrega(foto), carrega('/yamaha/yamaha-logo.png'), a.layout === 'pista' ? carrega('/yamaha/hero-racing.jpg') : Promise.resolve(null),
  ])

  const escuro = a.layout === 'noite'
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = escuro ? NAVY : '#FFFFFF'
  ctx.fillRect(0, 0, W, H)

  // faixa azul-marinho do site, com o nome da loja
  ctx.fillStyle = escuro ? '#04031A' : NAVY
  ctx.fillRect(0, 0, W, 84)
  ctx.fillStyle = 'rgba(255,255,255,.92)'
  ctx.font = `500 30px ${CORPO}`
  ctx.textBaseline = 'middle'
  ctx.fillText(`${a.loja} · Concessionária Yamaha`, 64, 43)

  let yTitulo = 330
  if (a.layout === 'pista' && pista) {
    // foto de corrida no alto, véu azul-marinho embaixo para o título
    const hFoto = 640, ar = W / hFoto, arI = pista.width / pista.height
    let sx = 0, sy = 0, sw = pista.width, sh = pista.height
    if (arI > ar) { sw = pista.height * ar; sx = (pista.width - sw) * 0.72 } else { sh = pista.width / ar; sy = (pista.height - sh) / 2 }
    ctx.drawImage(pista, sx, sy, sw, sh, 0, 84, W, hFoto)
    const g = ctx.createLinearGradient(0, 84, 0, 84 + hFoto)
    g.addColorStop(0.25, 'rgba(7,6,51,0)'); g.addColorStop(1, 'rgba(7,6,51,.92)')
    ctx.fillStyle = g; ctx.fillRect(0, 84, W, hFoto)
    yTitulo = 470
  }

  // logo: no claro direto, no escuro e na pista dentro de uma pílula branca
  const lh = 64, lw = logo.width * (lh / logo.height)
  if (a.layout === 'vitrine') ctx.drawImage(logo, 64, 124, lw, lh)
  else {
    ctx.fillStyle = '#FFFFFF'; retRedondo(ctx, 52, 116, lw + 28, lh + 18, 16); ctx.fill()
    ctx.drawImage(logo, 66, 125, lw, lh)
  }

  // título: o modelo em cheio, a frase em cinza (a "última palavra cinza" do site)
  const claroNoTitulo = a.layout !== 'vitrine'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `800 132px ${COND}`
  ctx.fillStyle = claroNoTitulo ? '#FFFFFF' : TXT
  const linhasModelo = quebra(ctx, a.modelo.toUpperCase(), W - 128).slice(0, 2)
  linhasModelo.forEach((l, i) => ctx.fillText(l, 64, yTitulo + i * 118))
  let y = yTitulo + (linhasModelo.length - 1) * 118 + 96
  ctx.font = `800 84px ${COND}`
  ctx.fillStyle = claroNoTitulo ? 'rgba(255,255,255,.62)' : MUTE
  quebra(ctx, a.titulo.toUpperCase(), W - 128).slice(0, 2).forEach((l, i) => ctx.fillText(l, 64, y + i * 80))

  // a moto
  if (a.layout === 'pista') {
    ctx.fillStyle = CINZA; retRedondo(ctx, 64, 760, W - 128, 380, 28); ctx.fill()
    desenhaFoto(ctx, moto, 84, 770, W - 168, 360)
  } else {
    const yP = Math.min(600, y + 80 + 80)
    const hP = 1140 - yP
    ctx.fillStyle = CINZA; retRedondo(ctx, 64, yP, W - 128, hP, 28); ctx.fill()
    desenhaFoto(ctx, moto, 84, yP + 10, W - 168, hP - 20)
  }

  // condição e chamada
  const yBase = 1240
  ctx.font = `800 38px ${COND}`
  const cta = a.chamada.toUpperCase()
  const cw = ctx.measureText(cta).width + 72
  ctx.font = `800 64px ${COND}`
  ctx.fillStyle = escuro ? '#5FD487' : VERDE
  const cond = quebra(ctx, a.condicao, W - 128 - cw - 40).slice(0, 2)
  cond.forEach((l, i) => ctx.fillText(l, 64, yBase - (cond.length - 1 - i) * 62))
  ctx.font = `800 38px ${COND}`
  ctx.fillStyle = escuro ? '#FFFFFF' : NAVY
  retRedondo(ctx, W - 64 - cw, yBase - 62, cw, 84, 42); ctx.fill()
  ctx.fillStyle = escuro ? NAVY : '#FFFFFF'
  ctx.textAlign = 'center'; ctx.fillText(cta, W - 64 - cw / 2, yBase - 7); ctx.textAlign = 'left'

  ctx.font = `400 22px ${CORPO}`
  ctx.fillStyle = escuro ? 'rgba(255,255,255,.55)' : MUTE
  ctx.fillText('Imagem ilustrativa. Condições sujeitas a análise de crédito e à disponibilidade de estoque.', 64, H - 36)
}

function nomeLoja(loja: string) {
  return loja === 'Grupo Nippon' ? 'Nippon Motos' : `Nippon Motos ${loja}`
}

export function EstudioKV({ modelos, loja, campanha }: { modelos: ModeloVitrine[]; loja: string; campanha?: CampanhaVigente }) {
  const [sel, setSel] = useState(modelos[0]?.modelo ?? '')
  const [layout, setLayout] = useState<Layout>('vitrine')
  const [titulo, setTitulo] = useState(FRASE_PADRAO)
  const [condicao, setCondicao] = useState('Condição especial na loja')
  const [chamada, setChamada] = useState('Chame no direct')
  const [legenda, setLegenda] = useState('')
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [copiado, setCopiado] = useState(false)
  const cvRef = useRef<HTMLCanvasElement>(null)

  const atual = modelos.find(m => m.modelo === sel)
  const oficial = atual?.arte
  const arte: Arte = useMemo(() => ({ layout, modelo: sel, titulo, condicao, chamada, loja: nomeLoja(loja) }), [layout, sel, titulo, condicao, chamada, loja])

  // trocou a moto: legenda e frase da IA eram da moto anterior
  useEffect(() => { setLegenda(''); setTitulo(FRASE_PADRAO); setErro('') }, [sel])

  useEffect(() => {
    if (cvRef.current && atual && !atual.arte) desenha(cvRef.current, arte, atual.foto).catch(() => {})
  }, [arte, atual])

  async function gerarLegenda() {
    if (!atual) return
    setGerando(true); setErro('')
    try {
      const r = await fetch('/api/campanha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelo: sel, objetivo: 'girar o estoque e atrair leads pelo direct', estoque: atual.estoqueTotal, cobertura: atual.cobertura,
          campanha: oficial && campanha ? `${campanha.nome}: ${campanha.beneficios}` : undefined,
        }),
      })
      const j = await r.json()
      if (!j.campanha) throw new Error(j.error)
      const c = j.campanha
      if (c.headline) setTitulo(c.headline)
      setLegenda(`${c.legenda}\n\n${(c.hashtags ?? []).join(' ')}`.trim())
    } catch {
      setErro('Não deu para gerar a legenda agora. Tente de novo em instantes.')
    }
    setGerando(false)
  }

  async function arquivo(): Promise<File | null> {
    const nome = `campanha-${sel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    if (oficial) {
      const b = await fetch(oficial).then(r => r.blob()).catch(() => null)
      return b ? new File([b], `${nome}.jpg`, { type: b.type || 'image/jpeg' }) : null
    }
    return new Promise(ok => {
      const cv = cvRef.current
      if (!cv) return ok(null)
      cv.toBlob(b => ok(b ? new File([b], `${nome}.png`, { type: 'image/png' }) : null), 'image/png')
    })
  }

  function baixar(f: File) {
    const url = URL.createObjectURL(f)
    const a = document.createElement('a')
    a.href = url; a.download = f.name; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  async function postar() {
    const f = await arquivo()
    if (!f) return
    // no celular abre o compartilhar do sistema, e o Instagram aparece na lista
    if (navigator.canShare?.({ files: [f] })) {
      try { await navigator.share({ files: [f], text: legenda }); return } catch { /* cancelou */ return }
    }
    baixar(f)
    if (legenda) await navigator.clipboard.writeText(legenda).catch(() => {})
    setAviso(legenda ? 'Arte baixada e legenda copiada. Abra o Instagram e poste.' : 'Arte baixada. Gere a legenda com a IA para postar junto.')
    setTimeout(() => setAviso(''), 5000)
  }

  async function copiar() {
    await navigator.clipboard.writeText(legenda).catch(() => {})
    setCopiado(true); setTimeout(() => setCopiado(false), 2000)
  }

  const campo = 'w-full mt-1.5 h-11 rounded-full px-4 text-[15px] outline-none border'
  const estiloCampo = { background: 'var(--bg-main)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }

  return (
    <div className="space-y-10">
      {/* 1. a moto */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <h2 className="yh-title text-[clamp(28px,3vw,40px)]">Escolha a <span className="yh-mute">moto</span></h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>As que estão paradas há mais tempo aparecem primeiro.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {modelos.map(m => {
            const on = m.modelo === sel
            return (
              <button key={m.modelo} onClick={() => setSel(m.modelo)} aria-pressed={on}
                className="yh-product text-left p-3 pb-4 border-2"
                style={{ borderColor: on ? 'var(--yh-blue)' : 'transparent', transition: 'border-color 150ms ease-out' }}>
                <span className="yh-chip" style={m.encalhado ? { color: 'var(--danger)' } : undefined}>{m.encalhado ? `${m.cobertura} dias parado` : `${m.estoqueTotal} un`}</span>
                <div className="aspect-[4/3] flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.foto} alt="" className="yh-photo max-h-full w-auto object-contain" />
                </div>
                <p className="yh-display text-[16px] font-bold uppercase leading-tight" style={{ color: 'var(--text-primary)' }}>{m.modelo}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* 2. a arte */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,420px)] gap-8 items-start">
        <div className="space-y-6">
          {oficial ? (
            <div>
              <h2 className="yh-title text-[clamp(28px,3vw,40px)]">A arte da <span className="yh-mute">campanha</span></h2>
              <p className="mt-2 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
                Peça oficial da Yamaha{campanha ? `, campanha ${campanha.nome}` : ''}. Vai para o post do jeito que a montadora entregou.
              </p>
              {campanha && (
                <p className="mt-3 inline-block rounded-full px-4 py-2 text-[14px] font-semibold" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                  {campanha.beneficios}
                </p>
              )}
            </div>
          ) : (<>
          <h2 className="yh-title text-[clamp(28px,3vw,40px)]">Monte a <span className="yh-mute">arte</span></h2>

          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Modelo de arte</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LAYOUTS.map(l => {
                const on = l.id === layout
                return (
                  <button key={l.id} onClick={() => setLayout(l.id)} aria-pressed={on}
                    className="rounded-xl p-4 text-left border-2"
                    style={{ background: 'var(--bg-elevated)', borderColor: on ? 'var(--yh-blue)' : 'transparent', transition: 'border-color 150ms ease-out' }}>
                    <span className="block yh-display text-[18px] font-bold uppercase" style={{ color: 'var(--text-primary)' }}>{l.nome}</span>
                    <span className="block text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{l.dica}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-[13px] font-medium pl-1" style={{ color: 'var(--text-secondary)' }}>Frase da arte</span>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={48} className={campo} style={estiloCampo} />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium pl-1" style={{ color: 'var(--text-secondary)' }}>Condição</span>
              <input value={condicao} onChange={e => setCondicao(e.target.value)} maxLength={40} placeholder="Entrada de R$ 4.999" className={campo} style={estiloCampo} />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium pl-1" style={{ color: 'var(--text-secondary)' }}>Chamada</span>
              <input value={chamada} onChange={e => setChamada(e.target.value)} maxLength={22} className={campo} style={estiloCampo} />
            </label>
          </div>
          </>)}

          <div className="rounded-xl p-5" style={{ background: 'var(--bg-elevated)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="yh-display text-[18px] font-bold uppercase" style={{ color: 'var(--text-primary)' }}>Legenda do post</p>
              <div className="flex gap-2">
                {legenda && (
                  <button onClick={copiar} className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-2 border"
                    style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
                    {copiado ? <><Check size={15} /> Copiada</> : <><Copy size={15} /> Copiar</>}
                  </button>
                )}
                <button onClick={gerarLegenda} disabled={gerando || !atual}
                  className="h-10 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-2 text-white disabled:opacity-60"
                  style={{ background: 'var(--yh-blue)' }}>
                  {gerando ? <><Loader2 size={15} className="animate-spin" /> Escrevendo</> : <><Sparkles size={15} /> Gerar legenda com IA</>}
                </button>
              </div>
            </div>
            {legenda
              ? <textarea value={legenda} onChange={e => setLegenda(e.target.value)} rows={7}
                  className="mt-4 w-full rounded-xl p-4 text-[14px] leading-relaxed outline-none border resize-y"
                  style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              : <p className="mt-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>{oficial ? 'A IA escreve a legenda com as vantagens da campanha, chamada para o direct e as hashtags.' : 'A IA escreve a legenda no padrão Yamaha, com chamada para o direct e as hashtags, e ainda sugere a frase da arte.'}</p>}
            {erro && <p className="mt-2 text-sm" style={{ color: 'var(--danger)' }}>{erro}</p>}
          </div>
        </div>

        {/* prévia */}
        <div className="lg:sticky lg:top-6 space-y-4">
          {oficial
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={oficial} alt={`Arte oficial ${sel}`} width={W} height={H} className="w-full h-auto rounded-xl border" style={{ borderColor: 'var(--border)' }} />
            : <canvas ref={cvRef} width={W} height={H} className="w-full h-auto rounded-xl border" style={{ borderColor: 'var(--border)' }} aria-label="Prévia da arte" />}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button onClick={postar} className="h-12 rounded-full font-semibold text-[15px] inline-flex items-center justify-center gap-2 text-white"
              style={{ background: 'var(--yamaha-blue)' }}>
              <Send size={17} /> Postar no Instagram
            </button>
            <button onClick={async () => { const f = await arquivo(); if (f) baixar(f) }} aria-label="Baixar arte"
              className="h-12 w-12 rounded-full inline-flex items-center justify-center border" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
              <Download size={18} />
            </button>
          </div>
          <p className="text-[13px] min-h-[20px]" style={{ color: aviso ? 'var(--ok)' : 'var(--text-tertiary)' }}>
            {aviso || 'No celular abre direto o compartilhar do Instagram. No computador, baixa a arte e copia a legenda.'}
          </p>
        </div>
      </section>
    </div>
  )
}
