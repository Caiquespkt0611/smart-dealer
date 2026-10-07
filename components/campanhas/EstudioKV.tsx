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
  /** condição da Faro de Vantagens para o modelo (circular CA-MTC-093-26): a arte é gerada na hora com ela */
  condicao?: { linhas: string[]; frase: string }
}

export interface CampanhaVigente {
  nome: string
  beneficios: string
}

type Layout = 'faro' | 'vitrine' | 'noite' | 'pista'

const LAYOUTS: { id: Layout; nome: string; dica: string }[] = [
  { id: 'faro', nome: 'Faro de Vantagens', dica: 'Fundo da campanha, com a condição da circular' },
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

// Fundo branco da foto vira transparente: preenche a partir das bordas o que for quase branco,
// para a moto ficar recortada em cima do fundo azul da campanha.
const recorteCache = new Map<string, Promise<HTMLCanvasElement>>()
function recortada(src: string) {
  if (!recorteCache.has(src)) {
    recorteCache.set(src, carrega(src).then(im => {
      const c = document.createElement('canvas')
      c.width = im.width; c.height = im.height
      const x = c.getContext('2d', { willReadFrequently: true })!
      x.drawImage(im, 0, 0)
      const d = x.getImageData(0, 0, c.width, c.height), p = d.data, w = c.width, h = c.height
      // no rodapé da foto entra também o cinza do reflexo no chão de estúdio
      const claro = (i: number) => {
        if (p[i + 3] < 20) return true
        const lim = (i / 4 / w) > h * 0.72 ? 150 : 205
        return p[i] > lim && p[i + 1] > lim && p[i + 2] > lim && Math.max(p[i], p[i + 1], p[i + 2]) - Math.min(p[i], p[i + 1], p[i + 2]) < 22
      }
      const visto = new Uint8Array(w * h), fila: number[] = []
      for (let i = 0; i < w; i++) fila.push(i, (h - 1) * w + i)
      for (let j = 0; j < h; j++) fila.push(j * w, j * w + w - 1)
      while (fila.length) {
        const k = fila.pop()!
        if (visto[k]) continue
        visto[k] = 1
        if (!claro(k * 4)) continue
        p[k * 4 + 3] = 0
        const px = k % w, py = (k / w) | 0
        if (px > 0) fila.push(k - 1); if (px < w - 1) fila.push(k + 1)
        if (py > 0) fila.push(k - w); if (py < h - 1) fila.push(k + w)
      }
      // selo verde e amarelo de outro programa (Move Brasil) e a linha verde embaixo da moto saem da arte;
      // a moto não tem verde nem amarelo puro
      for (let k = 0; k < w * h; k++) {
        const i = k * 4, R = p[i], G = p[i + 1], B = p[i + 2]
        if (p[i + 3] && G > 140 && B < 130 && G > R - 15 && G - B > 70) p[i + 3] = 0
      }
      // fica só o maior pedaço contínuo (a moto); o que sobrou solto do selo some
      const rotulo = new Int32Array(w * h), tam: number[] = [0]
      for (let k = 0; k < w * h; k++) {
        if (!p[k * 4 + 3] || rotulo[k]) continue
        const id = tam.length; let n = 0
        const pilha = [k]; rotulo[k] = id
        while (pilha.length) {
          const q = pilha.pop()!; n++
          const qx = q % w, qy = (q / w) | 0
          for (const v of [qx > 0 ? q - 1 : -1, qx < w - 1 ? q + 1 : -1, qy > 0 ? q - w : -1, qy < h - 1 ? q + w : -1]) {
            if (v >= 0 && p[v * 4 + 3] && !rotulo[v]) { rotulo[v] = id; pilha.push(v) }
          }
        }
        tam.push(n)
      }
      const maior = tam.indexOf(Math.max(...tam.slice(1)))
      for (let k = 0; k < w * h; k++) if (rotulo[k] && rotulo[k] !== maior && tam[rotulo[k]] < tam[maior] * 0.08) p[k * 4 + 3] = 0
      x.putImageData(d, 0, 0)
      return c
    }))
  }
  return recorteCache.get(src)!
}

// Arte no padrão da Faro de Vantagens: corredor azul com neon, selo da campanha no alto,
// condição em amarelo entre setas, a moto embaixo com o nome dela, como nas peças oficiais.
async function desenhaFaro(ctx: CanvasRenderingContext2D, a: Arte, foto: string, COND: string, CORPO: string) {
  const [selo, moto, logo] = await Promise.all([carrega('/campanhas/faro-selo.png'), recortada(foto), carrega('/yamaha/yamaha-logo.png')])
  const AMARELO = '#FFD21F', CIANO = '#3FC8FF'

  // corredor
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#03072E'); g.addColorStop(0.45, '#0A1E86'); g.addColorStop(0.72, '#1D45C9'); g.addColorStop(1, '#0B1A63')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  const chao = ctx.createRadialGradient(W / 2, 1060, 40, W / 2, 1060, 620)
  chao.addColorStop(0, 'rgba(120,170,255,.45)'); chao.addColorStop(1, 'rgba(120,170,255,0)')
  ctx.fillStyle = chao; ctx.fillRect(0, 760, W, H - 760)
  ctx.fillStyle = 'rgba(40,90,255,.22)'; ctx.fillRect(250, 250, W - 500, 560) // o painel do fundo, como a tela atrás do apresentador
  // luzes do teto
  ctx.save(); ctx.shadowColor = '#CFE6FF'; ctx.shadowBlur = 24; ctx.fillStyle = '#EAF4FF'
  for (const [x, y, w] of [[60, 50, 90], [190, 96, 64], [W - 150, 50, 90], [W - 254, 96, 64]] as const) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(x < W / 2 ? 0.35 : -0.35); retRedondo(ctx, 0, 0, w, 16, 8); ctx.fill(); ctx.restore()
  }
  ctx.restore()
  // barras de neon nas laterais, menores para o fundo
  ctx.save(); ctx.shadowColor = '#4FB3FF'; ctx.shadowBlur = 34; ctx.strokeStyle = '#BFE6FF'; ctx.lineCap = 'round'
  const barras = [[38, 230, 980, 7], [104, 280, 930, 6], [160, 320, 880, 5], [206, 350, 850, 4]] as const
  for (const [x, y0, y1, lw] of barras) {
    ctx.lineWidth = lw
    for (const bx of [x, W - x]) { ctx.beginPath(); ctx.moveTo(bx, y0); ctx.lineTo(bx, y1); ctx.stroke() }
  }
  ctx.restore()

  // selo da campanha, com as bordas esfumadas para casar com o fundo
  const sw = 520, sh = selo.height * (sw / selo.width), sx = (W - sw) / 2, sy = 34
  const tmp = document.createElement('canvas'); tmp.width = sw; tmp.height = sh
  const tx = tmp.getContext('2d')!
  tx.drawImage(selo, 0, 0, sw, sh)
  const msk = tx.createRadialGradient(sw / 2, sh / 2, Math.min(sw, sh) * 0.32, sw / 2, sh / 2, sw * 0.56)
  msk.addColorStop(0, 'rgba(0,0,0,1)'); msk.addColorStop(1, 'rgba(0,0,0,0)')
  tx.globalCompositeOperation = 'destination-in'; tx.fillStyle = msk; tx.fillRect(0, 0, sw, sh)
  ctx.drawImage(tmp, sx, sy)

  // a chamada e a condição entre setas, como na peça oficial
  const setas = (y: number, n: number) => {
    ctx.font = `800 34px ${COND}`; ctx.fillStyle = CIANO; ctx.textAlign = 'center'
    ctx.fillText('>'.repeat(n).split('').join(' '), W / 2, y)
  }
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'
  let y = sy + sh + 18
  setas(y, 22); y += 58
  ctx.font = `800 50px ${COND}`; ctx.fillStyle = '#FFFFFF'
  for (const l of quebra(ctx, a.titulo.toUpperCase(), 700).slice(0, 2)) { ctx.fillText(l, W / 2, y); y += 52 }
  y += 14
  const linhas = a.linhas ?? []
  linhas.forEach((l, i) => {
    const forte = i === 1
    ctx.font = `800 ${forte ? 66 : 50}px ${COND}`; ctx.fillStyle = AMARELO
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 10
    ctx.fillText(l.toUpperCase(), W / 2, y + (forte ? 14 : 0))
    ctx.shadowBlur = 0
    y += forte ? 78 : 58
  })
  setas(y, 22)

  // a moto, recortada, com sombra no chão
  const caixa = { x: 60, y: Math.max(y - 10, 740), w: W - 120, h: 1140 - Math.max(y - 10, 740) }
  const esc = Math.min(caixa.w / moto.width, caixa.h / moto.height)
  const mw = moto.width * esc, mh = moto.height * esc, mx = caixa.x + (caixa.w - mw) / 2, my = caixa.y + caixa.h - mh
  const sombra = ctx.createRadialGradient(W / 2, my + mh - 6, 10, W / 2, my + mh - 6, mw * 0.5)
  sombra.addColorStop(0, 'rgba(0,0,30,.55)'); sombra.addColorStop(1, 'rgba(0,0,30,0)')
  ctx.save(); ctx.scale(1, 0.18); ctx.fillStyle = sombra; ctx.fillRect(0, (my + mh - 70) / 0.18, W, 140 / 0.18); ctx.restore()
  ctx.drawImage(moto, mx, my, mw, mh)

  // nome do modelo embaixo à esquerda, com as setas em ciano
  ctx.textAlign = 'left'
  ctx.font = `800 30px ${COND}`; ctx.fillStyle = CIANO; ctx.fillText('> > > > > > >', 56, 1164)
  ctx.font = `800 64px ${COND}`; ctx.fillStyle = '#FFFFFF'
  ctx.fillText(a.modelo.toUpperCase(), 56, 1224)

  // chamada à direita, em pílula branca
  ctx.font = `800 34px ${COND}`
  const cta = a.chamada.toUpperCase(), cw = ctx.measureText(cta).width + 64
  ctx.fillStyle = '#FFFFFF'; retRedondo(ctx, W - 56 - cw, 1168, cw, 70, 35); ctx.fill()
  ctx.fillStyle = NAVY; ctx.textAlign = 'center'; ctx.fillText(cta, W - 56 - cw / 2, 1215)

  // rodapé: logo, loja e o aviso da circular
  ctx.textAlign = 'left'
  const lh = 34, lw = logo.width * (lh / logo.height)
  ctx.fillStyle = '#FFFFFF'; retRedondo(ctx, 56, 1258, lw + 24, lh + 14, 10); ctx.fill()
  ctx.drawImage(logo, 68, 1265, lw, lh)
  ctx.font = `italic 500 26px ${CORPO}`; ctx.fillStyle = '#FFFFFF'
  ctx.fillText(`${a.loja} · Quem tem faro escolhe Yamaha.`, 56 + lw + 44, 1288)
  ctx.font = `400 15px ${CORPO}`; ctx.fillStyle = 'rgba(255,255,255,.72)'
  quebra(ctx, 'Condição Banco Yamaha (circular CA-MTC-093-26), válida até 31/10/2026, sujeita a análise de crédito. Bônus não cumulativo com taxa subsidiada. Imagem ilustrativa.', W - 112)
    .slice(0, 2).forEach((l, i) => ctx.fillText(l, 56, 1322 + i * 19))
}

interface Arte {
  layout: Layout
  modelo: string
  titulo: string
  condicao: string
  chamada: string
  loja: string
  linhas?: string[]
}

async function desenha(cv: HTMLCanvasElement, a: Arte, foto: string) {
  const ctx = cv.getContext('2d')!
  const css = getComputedStyle(document.documentElement)
  const COND = css.getPropertyValue('--font-display').trim() || "'Arial Narrow', sans-serif"
  const CORPO = css.getPropertyValue('--font-body').trim() || 'Roboto, sans-serif'
  await Promise.all([document.fonts.load(`800 100px ${COND}`), document.fonts.load(`500 30px ${CORPO}`)]).catch(() => {})
  if (a.layout === 'faro') {
    ctx.clearRect(0, 0, W, H)
    await desenhaFaro(ctx, a, foto, COND, CORPO)
    return
  }
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
  const [layout, setLayout] = useState<Layout>(modelos[0]?.condicao ? 'faro' : 'vitrine')
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
  const arte: Arte = useMemo(() => ({ layout, modelo: sel, titulo, condicao, chamada, loja: nomeLoja(loja), linhas: atual?.condicao?.linhas }), [layout, sel, titulo, condicao, chamada, loja, atual])
  const layouts = LAYOUTS.filter(l => l.id !== 'faro' || atual?.condicao)

  // trocou a moto: legenda e frase da IA eram da moto anterior
  useEffect(() => {
    setLegenda(''); setTitulo(FRASE_PADRAO); setErro('')
    setLayout(l => (atual?.condicao ? 'faro' : l === 'faro' ? 'vitrine' : l))
  }, [sel]) // eslint-disable-line react-hooks/exhaustive-deps

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
          condicao: !oficial && layout === 'faro' && atual.condicao ? atual.condicao.frase : undefined,
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
        </div>
        {[
          { titulo: 'Mais motos no estoque', dica: 'A arte sai na hora, no fundo da Faro de Vantagens e com a condição da circular.', lista: modelos.filter(m => !m.arte) },
          { titulo: 'Arte oficial da Yamaha', dica: 'A peça da montadora, pronta para postar.', lista: modelos.filter(m => m.arte) },
        ].filter(g => g.lista.length).map(g => (
        <div key={g.titulo} className="mb-6 last:mb-0">
        <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{g.titulo}</p>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-tertiary)' }}>{g.dica}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {g.lista.map(m => {
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
        </div>
        ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {layouts.map(l => {
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
            {layout === 'faro' && atual?.condicao ? (
              <div className="block">
                <span className="text-[13px] font-medium pl-1" style={{ color: 'var(--text-secondary)' }}>Condição da circular</span>
                <p className="mt-1.5 rounded-2xl px-4 py-2.5 text-[14px] font-semibold leading-snug" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                  {atual.condicao.linhas.join(' · ')}
                </p>
              </div>
            ) : (
            <label className="block">
              <span className="text-[13px] font-medium pl-1" style={{ color: 'var(--text-secondary)' }}>Condição</span>
              <input value={condicao} onChange={e => setCondicao(e.target.value)} maxLength={40} placeholder="Entrada de R$ 4.999" className={campo} style={estiloCampo} />
            </label>
            )}
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
