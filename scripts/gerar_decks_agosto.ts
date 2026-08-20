// Decks de agosto/2026 no padrão visual InnovAdapt (referência: deck aprovado
// "Efetivo Digital" — capa navy, miolo branco respirado, cards F7F9FC sem
// borda, chapéu azul numerado, tabelas com header navy, uma ideia por slide).
//  1) DECK-DIRETORIA — venda do projeto ao diretor (rollout nacional)
//  2) DECK-BANCA — 2ª banca YamahaWay, com a Fórmula do Sucesso COMPLETA
//     (27 sub-itens importados de lib/formula-sucesso — nada resumido)
// Rodar: npx tsx scripts/gerar_decks_agosto.ts
import pptxgen from 'pptxgenjs'
import { formulaDiagnostico, resumoDiagnostico, materiaisProntos } from '../lib/formula-sucesso'

const W = 13.33, H = 7.5, MG = 0.85, COL = W - MG * 2
const F = 'Calibri'

/* ── paleta InnovAdapt ── */
const C = {
  navy: '091426', navy2: '0E1D36',
  azul: '0365FE', ciano: '04CDFB', roxo: '8B3AE2',
  slate: '4A5568', slateClaro: '8A96A8',
  card: 'F7F9FC', callout: 'EEF4FF', linha: 'E5EAF2',
  azulClaro: 'B8CDEA', azulClaro2: 'C3D6F0',
  branco: 'FFFFFF',
  verde: '1E9E5A', verdeBg: 'E7F6EE',
  ambar: 'B7791F', ambarBg: 'FCF3E3',
  verm: 'D64545', vermBg: 'FBEAEA',
}

type P = InstanceType<typeof pptxgen>
type Slide = ReturnType<P['addSlide']>

/* ── helpers ── */
function capa(p: P, chapeu: string, titulo: [string, string], sub: string, rodape: string) {
  const sl = p.addSlide()
  sl.background = { color: C.navy }
  sl.addImage({ path: `${ASSETS}/bg-capa.png`, x: 0, y: 0, w: W, h: H })
  sl.addText(chapeu.toUpperCase(), { x: MG, y: 2.55, w: COL * 0.62, h: 0.3, fontSize: 12, bold: true, color: C.ciano, charSpacing: 3, fontFace: F })
  sl.addText(titulo[0] + titulo[1], { x: MG, y: 2.9, w: COL * 0.62, h: 1.1, fontSize: 54, bold: true, color: C.branco, fontFace: F })
  sl.addText(sub, { x: MG, y: 4.1, w: COL * 0.56, h: 0.95, fontSize: 16, color: C.azulClaro, fontFace: F, lineSpacing: 24, shrinkText: true })
  sl.addShape(p.ShapeType.line, { x: MG, y: 5.55, w: 4.2, h: 0, line: { color: '3D4F61', width: 1 } })
  sl.addText(rodape, { x: MG, y: 5.75, w: COL * 0.6, h: 0.55, fontSize: 11.5, color: C.slateClaro, fontFace: F, lineSpacing: 17 })
  // hero: o sistema real, sangrando pela borda direita
  sl.addImage({
    path: `${ASSETS}/dashboard.png`, x: 8.35, y: 1.55, w: 6.0, h: 6.0 / ASPECTO, rotate: 3,
    shadow: { type: 'outer', color: '05090F', blur: 22, offset: 8, angle: 90, opacity: 0.6 },
  })
  return sl
}

let PAG = 0
function slideBranco(p: P, chapeu: string, titulo: string, sub?: string): Slide {
  const sl = p.addSlide()
  sl.background = { color: C.branco }
  sl.addText(chapeu.toUpperCase(), { x: MG, y: 0.55, w: COL, h: 0.26, fontSize: 11, bold: true, color: C.azul, charSpacing: 1.5, fontFace: F })
  sl.addText(titulo, { x: MG, y: 0.85, w: COL, h: 0.62, fontSize: 30, bold: true, color: C.navy, fontFace: F, shrinkText: true })
  if (sub) sl.addText(sub, { x: MG, y: 1.58, w: COL, h: 0.32, fontSize: 13.5, color: C.slate, fontFace: F, shrinkText: true })
  PAG++
  sl.addText(String(PAG).padStart(2, '0'), { x: W - MG - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontSize: 10, bold: true, color: C.azulClaro2, align: 'right', fontFace: F })
  return sl
}

function fraseNavy(p: P, frase: string, sub?: string, extra?: (sl: Slide) => void) {
  const sl = p.addSlide()
  sl.background = { color: C.navy }
  sl.addImage({ path: `${ASSETS}/bg-fecho.png`, x: 0, y: 0, w: W, h: H })
  sl.addText(frase, { x: MG, y: 2.35, w: COL, h: 1.8, fontSize: 32, bold: true, color: C.branco, align: 'center', fontFace: F, lineSpacing: 44, shrinkText: true })
  if (sub) sl.addText(sub, { x: W * 0.14, y: 4.35, w: W * 0.72, h: 0.8, fontSize: 14.5, color: C.azulClaro, align: 'center', fontFace: F, lineSpacing: 22 })
  extra?.(sl)
  return sl
}

interface Card { tag?: string; titulo: string; corpo?: string; corTag?: string }
function cardGrid(sl: Slide, y: number, cols: number, itens: Card[], altura: number, gap = 0.22) {
  const cw = (COL - gap * (cols - 1)) / cols
  itens.forEach((c, i) => {
    const col = i % cols, row = Math.floor(i / cols)
    const x = MG + col * (cw + gap), yy = y + row * (altura + gap)
    sl.addShape('roundRect' as never, { x, y: yy, w: cw, h: altura, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
    let ty = yy + 0.22
    if (c.tag) {
      sl.addText(c.tag.toUpperCase(), { x: x + 0.24, y: ty, w: cw - 0.48, h: 0.22, fontSize: 9.5, bold: true, color: c.corTag ?? C.azul, charSpacing: 0.5, fontFace: F, shrinkText: true })
      ty += 0.28
    }
    sl.addText(c.titulo, { x: x + 0.24, y: ty, w: cw - 0.48, h: 0.34, fontSize: 14, bold: true, color: C.navy, fontFace: F, shrinkText: true })
    if (c.corpo) sl.addText(c.corpo, { x: x + 0.24, y: ty + 0.4, w: cw - 0.48, h: yy + altura - (ty + 0.4) - 0.18, fontSize: 11, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 15, shrinkText: true })
  })
  return y + Math.ceil(itens.length / cols) * (altura + gap) - gap
}

interface KpiL { tag: string; val: string; sub?: string; cor?: string }
function kpiCards(sl: Slide, y: number, itens: KpiL[], altura = 1.5) {
  const gap = 0.22, cw = (COL - gap * (itens.length - 1)) / itens.length
  itens.forEach((k, i) => {
    const x = MG + i * (cw + gap)
    sl.addShape('roundRect' as never, { x, y, w: cw, h: altura, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
    sl.addText(k.tag.toUpperCase(), { x: x + 0.24, y: y + 0.2, w: cw - 0.48, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F, shrinkText: true })
    sl.addText(k.val, { x: x + 0.24, y: y + 0.46, w: cw - 0.48, h: 0.55, fontSize: 26, bold: true, color: k.cor ?? C.navy, fontFace: F, shrinkText: true })
    if (k.sub) sl.addText(k.sub, { x: x + 0.24, y: y + altura - 0.48, w: cw - 0.48, h: 0.42, fontSize: 10, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 13, shrinkText: true })
  })
  return y + altura
}

function callout(sl: Slide, y: number, titulo: string, corpo: string, h = 1.15, cor = C.callout) {
  sl.addShape('roundRect' as never, { x: MG, y, w: COL, h, fill: { color: cor }, line: { type: 'none' }, rectRadius: 0.03 })
  sl.addText(titulo, { x: MG + 0.3, y: y + 0.16, w: COL - 0.6, h: 0.3, fontSize: 13.5, bold: true, color: C.navy, fontFace: F, shrinkText: true })
  sl.addText(corpo, { x: MG + 0.3, y: y + 0.5, w: COL - 0.6, h: h - 0.62, fontSize: 11.5, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 16, shrinkText: true })
  return y + h
}

type CelDef = { t: string; cor?: string; bold?: boolean; align?: 'left' | 'center' | 'right'; fill?: string }
function tabela(sl: Slide, y: number, headers: string[], rows: CelDef[][], colW: number[], fontSize = 10, rowH = 0.46) {
  const head = headers.map(h => ({
    text: h.toUpperCase(),
    options: { fill: { color: C.navy2 }, color: C.branco, bold: true, fontSize: fontSize - 0.5, valign: 'middle', align: 'left', fontFace: F, margin: [0.06, 0.1, 0.06, 0.1] },
  }))
  const body = rows.map((r, ri) => r.map((c, ci) => ({
    text: c.t,
    options: {
      fill: { color: c.fill ?? (ri % 2 ? C.card : C.branco) },
      color: c.cor ?? (ci === 0 ? C.navy : C.slate),
      bold: c.bold ?? ci === 0,
      fontSize, valign: 'middle', align: c.align ?? 'left', fontFace: F,
      margin: [0.06, 0.1, 0.06, 0.1],
    },
  })))
  sl.addTable([head, ...body] as never, { x: MG, y, w: COL, colW, border: { pt: 0.75, color: C.branco }, rowH, autoPage: false })
}

const brl = (n: number) => `R$ ${Math.round(n).toLocaleString('pt-BR')}`

/* ── assets (arte gerada + screenshots reais do sistema) ── */
const ASSETS = '_NOVAS MELHORIAS/deck-assets'
const ASPECTO = 1600 / 950   // proporção dos screenshots

// moldura de navegador com sombra em volta de um screenshot real
function browserFrame(p2: P, sl: Slide, x: number, y: number, w: number, img: string): number {
  const hImg = w / ASPECTO, barra = 0.3, h = hImg + barra
  sl.addShape(p2.ShapeType.roundRect, {
    x, y, w, h, fill: { color: '0E1D36' }, line: { color: '22304A', width: 0.75 }, rectRadius: 0.07,
    shadow: { type: 'outer', color: '0A1220', blur: 14, offset: 5, angle: 90, opacity: 0.5 },
  })
  const dots = ['FF5F57', 'FFBD2E', '28C840']
  dots.forEach((cor, i) => sl.addShape(p2.ShapeType.ellipse, { x: x + 0.16 + i * 0.17, y: y + 0.1, w: 0.1, h: 0.1, fill: { color: cor }, line: { type: 'none' } }))
  sl.addText('smart-dealer.vercel.app', { x: x + w / 2 - 1.5, y: y + 0.03, w: 3, h: 0.24, fontSize: 8, color: '8FA3BD', align: 'center', fontFace: F })
  sl.addImage({ path: `${ASSETS}/${img}`, x: x + 0.04, y: y + barra, w: w - 0.08, h: hImg - 0.04 })
  return y + h
}

/* ═══════════════════ DECK 1 · DIRETORIA ═══════════════════
   Segue a narrativa do "Smart Dealer.pptx" original (a apresentação aprovada
   do grupo), slide a slide, no visual novo — enriquecida com as frentes de
   agosto e screenshots reais do sistema. */
async function deckDiretoria() {
  const p = new pptxgen()
  p.defineLayout({ name: 'W', width: W, height: H })
  p.layout = 'W'
  p.author = 'Caique Oliveira · Klenilson Paiva'
  p.title = 'Smart Dealer — Apresentação à Diretoria'
  PAG = 0

  /* 1 · capa */
  capa(p, 'Apresentação à diretoria · Agosto 2026',
    ['Smart ', 'Dealer'],
    'Plataforma inteligente de gestão da experiência do cliente.\nDo piloto na Nippon Motos ao padrão da rede Yamaha.',
    'Caique Oliveira · Klenilson Paiva  ·  Yamaha Way 2026 · Grupo Shogun Riders · Nippon Motos')

  /* 2 · a pergunta */
  fraseNavy(p, 'A Yamaha conhece seus clientes tão bem\nquanto Amazon, Netflix ou Nubank?',
    'O padrão de comparação do cliente não é outra concessionária.\nÉ a melhor experiência digital que ele já teve.')

  /* 3 · 2016 → 2026 */
  {
    const sl = slideBranco(p, 'O contexto', 'O cliente de 2026 não aceita experiências de 2016')
    const meio = (COL - 0.8) / 2
    sl.addShape('roundRect' as never, { x: MG, y: 2.2, w: meio, h: 2.9, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('2016', { x: MG + 0.3, y: 2.5, w: meio - 0.6, h: 0.55, fontSize: 30, bold: true, color: C.slateClaro, fontFace: F })
    sl.addText('ATENDIMENTO', { x: MG + 0.3, y: 3.15, w: meio - 0.6, h: 0.3, fontSize: 13, bold: true, color: C.slate, charSpacing: 1.5, fontFace: F })
    sl.addText('Esperar na loja, esperar no telefone, esperar o retorno que não vem. O cliente se adapta ao processo da concessionária.', { x: MG + 0.3, y: 3.55, w: meio - 0.6, h: 1.3, fontSize: 12, color: C.slate, fontFace: F, lineSpacing: 17 })
    sl.addText('→', { x: MG + meio + 0.14, y: 3.35, w: 0.52, h: 0.55, fontSize: 30, bold: true, color: C.azulClaro, align: 'center', fontFace: F })
    sl.addShape('roundRect' as never, { x: MG + meio + 0.8, y: 2.2, w: meio, h: 2.9, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('2026', { x: MG + meio + 1.1, y: 2.5, w: meio - 0.6, h: 0.55, fontSize: 30, bold: true, color: C.azul, fontFace: F })
    sl.addText('EXPERIÊNCIA', { x: MG + meio + 1.1, y: 3.15, w: meio - 0.6, h: 0.3, fontSize: 13, bold: true, color: C.navy, charSpacing: 1.5, fontFace: F })
    sl.addText('Resposta em minutos, oferta certa, crédito transparente, a loja que lembra dele. O processo se adapta ao cliente.', { x: MG + meio + 1.1, y: 3.55, w: meio - 0.6, h: 1.3, fontSize: 12, color: C.slate, fontFace: F, lineSpacing: 17 })
    sl.addText('Quem entrega experiência ganha o cliente — e o mantém pela vida útil da moto inteira.', { x: MG, y: 5.5, w: COL, h: 0.35, fontSize: 13, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* 4 · o problema */
  {
    const sl = slideBranco(p, 'O problema', 'Os dados existem. A inteligência, não.',
      'O que se perde todos os dias, em todas as concessionárias — porque nenhum sistema conversa com o outro.')
    cardGrid(sl, 2.15, 3, [
      { titulo: 'Crédito recusado', corpo: 'O cliente nunca mais é procurado — mesmo quando o Liberacred já o aprovou de novo.' },
      { titulo: 'Aprovado não pago', corpo: 'A proposta aprovada fica parada semanas. A venda já estava ganha; ninguém cobra o desfecho.' },
      { titulo: 'Contrato quitando', corpo: 'O cliente volta ao mercado em silêncio. Quem chama primeiro leva — hoje é o concorrente.' },
      { titulo: 'Frota sem seguro', corpo: 'Milhares de motos vendidas rodando sem apólice. Renovação é receita que evapora.' },
      { titulo: 'Revisão vencida', corpo: 'O cliente esquece, a oficina não avisa — e a absorção do pós-vendas fica no papel.' },
      { titulo: 'Circular no e-mail', corpo: 'A condição de campanha mora na caixa de entrada de alguém. A loja responde errado ou não responde.' },
    ], 1.62)
    sl.addText('Todos os dados existiam. A oportunidade passou despercebida.', { x: MG, y: 6.15, w: COL, h: 0.3, fontSize: 12.5, bold: true, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* 5 · dados dispersos, ninguém vê o todo */
  {
    const sl = slideBranco(p, 'O problema', 'Dados dispersos — ninguém enxerga o todo',
      'Cada informação vive num sistema. A visão completa não vive em lugar nenhum.')
    const silos = ['Lead', 'Estoque', 'Campanha', 'Banco', 'Cliente', 'Venda']
    const gap = 0.3, sw = (COL - gap * 5) / 6
    silos.forEach((s2, i) => {
      const x = MG + i * (sw + gap)
      sl.addShape('roundRect' as never, { x, y: 2.15, w: sw, h: 0.7, fill: { color: C.card }, line: { color: C.linha, width: 0.75, dashType: 'dash' }, rectRadius: 0.04 })
      sl.addText(s2, { x, y: 2.15, w: sw, h: 0.7, fontSize: 12.5, bold: true, color: C.slate, align: 'center', valign: 'middle', fontFace: F })
    })
    sl.addText('sistemas que não conversam entre si', { x: MG, y: 2.95, w: COL, h: 0.28, fontSize: 10, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
    cardGrid(sl, 3.55, 2, [
      { titulo: 'O vendedor não tem a visão completa do cliente', corpo: 'histórico, crédito e interesse em telas diferentes — quando existem' },
      { titulo: 'O gerente não tem a visão completa da operação', corpo: 'cobra no feeling, descobre o problema no fechamento' },
      { titulo: 'O concessionário não tem a visão do negócio', corpo: 'mercado, share e absorção chegam tarde e fatiados' },
      { titulo: 'O cliente não recebe uma experiência integrada', corpo: 'repete a história a cada contato, espera a cada etapa' },
    ], 1.25)
  }

  /* 6 · patrimônio invisível */
  {
    const sl = slideBranco(p, 'A virada', 'A Yamaha já possui um patrimônio estratégico invisível',
      'Cada moto vendida, revisão feita e proposta analisada gera dado. A rede está sentada numa mina — sem escavadeira.')
    const chips = ['VENDA', 'REVISÃO', 'FINANCIAMENTO', 'NPS', 'LCR', 'KAIZEN', 'ESTOQUE', 'OFICINA', 'CONSÓRCIO', 'SEGUROS', 'LEADS', 'CAMPANHA', 'INTERAÇÃO', 'BLU CLUB', 'EMPLACAMENTO', 'PREMYA', 'CIRCULARES', 'TREINAMENTO']
    const porLinha = 6, cw = (COL - 0.24 * (porLinha - 1)) / porLinha
    chips.forEach((c2, i) => {
      const col = i % porLinha, row = Math.floor(i / porLinha)
      const x = MG + col * (cw + 0.24), y = 2.3 + row * 0.85
      const forte = ['VENDA', 'FINANCIAMENTO', 'REVISÃO', 'NPS'].includes(c2)
      sl.addShape('roundRect' as never, { x, y, w: cw, h: 0.62, fill: { color: forte ? C.callout : C.card }, line: { type: 'none' }, rectRadius: 0.31 })
      sl.addText(c2, { x, y, w: cw, h: 0.62, fontSize: 10.5, bold: true, color: forte ? C.azul : C.slate, align: 'center', valign: 'middle', charSpacing: 0.5, fontFace: F, shrinkText: true })
    })
    callout(sl, 5.15, 'O ativo não é o software — é este patrimônio de dados, que só a Yamaha tem',
      'O Smart Dealer é a escavadeira: transforma o que a rede já produz todos os dias em decisão, oferta e experiência.', 1.1)
  }

  /* 7 · centro de inteligência */
  {
    const sl = slideBranco(p, 'A solução', 'O Centro de Inteligência da Rede Yamaha',
      'A CCY inteligente gerencia experiências — não sistemas.')
    const fontes = ['Vendas', 'Leads', 'Banco Yamaha', 'Consórcio', 'Seguros', 'Pós-venda', 'NPS', 'Campanhas', 'Estoque', 'Kaizen']
    const cw = 2.05, ch = 0.5
    fontes.forEach((f2, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const x = MG + col * (cw + 0.14), y = 2.15 + row * (ch + 0.13)
      sl.addShape('roundRect' as never, { x, y, w: cw, h: ch, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.04 })
      sl.addText(f2, { x, y, w: cw, h: ch, fontSize: 10, bold: true, color: C.slate, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
    })
    sl.addText('→', { x: MG + 4.45, y: 3.9, w: 0.55, h: 0.5, fontSize: 24, bold: true, color: C.azulClaro, align: 'center', fontFace: F })
    sl.addShape('roundRect' as never, { x: MG + 5.15, y: 3.05, w: 2.75, h: 2.2, fill: { color: C.navy }, line: { type: 'none' }, rectRadius: 0.08, shadow: { type: 'outer', color: 'B8CDEA', blur: 16, offset: 0, angle: 90, opacity: 0.55 } })
    sl.addText('SMART\nDEALER', { x: MG + 5.15, y: 3.35, w: 2.75, h: 1.0, fontSize: 21, bold: true, color: C.branco, align: 'center', fontFace: F, lineSpacing: 24 })
    sl.addText('IA + regras Yamaha\ncodificadas', { x: MG + 5.15, y: 4.4, w: 2.75, h: 0.6, fontSize: 9.5, color: C.azulClaro, align: 'center', fontFace: F, lineSpacing: 12 })
    sl.addText('→', { x: MG + 8.05, y: 3.9, w: 0.55, h: 0.5, fontSize: 24, bold: true, color: C.azulClaro, align: 'center', fontFace: F })
    const saidas: [string, string][] = [
      ['Oportunidades', 'identificadas sozinhas'],
      ['Alertas', 'operacionais na hora'],
      ['Jornada', 'completa do cliente'],
      ['Decisão', 'recomendada com IA'],
    ]
    saidas.forEach((s2, i) => {
      const y = 2.15 + i * 1.02
      const x = MG + 8.75, w2 = COL - 8.75
      sl.addShape('roundRect' as never, { x, y, w: w2, h: 0.88, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.04 })
      sl.addText(s2[0], { x: x + 0.2, y: y + 0.12, w: w2 - 0.4, h: 0.3, fontSize: 12.5, bold: true, color: C.navy, fontFace: F })
      sl.addText(s2[1], { x: x + 0.2, y: y + 0.44, w: w2 - 0.4, h: 0.3, fontSize: 10, color: C.slate, fontFace: F })
    })
  }

  /* 8 · ao vivo */
  {
    const sl = p.addSlide()
    sl.background = { color: C.navy }
    sl.addImage({ path: `${ASSETS}/bg-produto.png`, x: 0, y: 0, w: W, h: H })
    sl.addText('A SOLUÇÃO', { x: MG, y: 0.55, w: COL, h: 0.26, fontSize: 11, bold: true, color: C.ciano, charSpacing: 1.5, fontFace: F })
    sl.addText('Não é conceito: está rodando na Nippon Motos', { x: MG, y: 0.85, w: COL, h: 0.62, fontSize: 30, bold: true, color: C.branco, fontFace: F })
    sl.addText('4 lojas · 25 módulos em produção · pago pela própria concessionária (R$ 600/mês) · acompanhado pela regional.', { x: MG, y: 1.55, w: COL, h: 0.3, fontSize: 13, color: C.azulClaro, fontFace: F })
    browserFrame(p, sl, MG + 1.05, 2.15, 9.6, 'performance.png')
    PAG++
    sl.addText(String(PAG).padStart(2, '0'), { x: W - MG - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontSize: 10, bold: true, color: '3D4F61', align: 'right', fontFace: F })
  }

  /* 9 · horas → segundos */
  {
    const sl = slideBranco(p, 'A solução', 'O que antes levava horas agora leva segundos')
    const antes = ['Abrir o CRM', 'Abrir o Banco Yamaha', 'Abrir o Consórcio', 'Abrir as planilhas internas', 'Cruzar as informações', 'Analisar manualmente']
    sl.addText('HOJE — 30 MINUTOS A 3 HORAS POR ANÁLISE', { x: MG, y: 2.05, w: 6, h: 0.26, fontSize: 10, bold: true, color: C.verm, charSpacing: 1, fontFace: F })
    antes.forEach((a, i) => {
      const y = 2.45 + i * 0.6
      sl.addShape('roundRect' as never, { x: MG, y, w: 5.3, h: 0.5, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(`${i + 1}`, { x: MG + 0.18, y: y + 0.1, w: 0.4, h: 0.3, fontSize: 12, bold: true, color: C.azulClaro, fontFace: F })
      sl.addText(a, { x: MG + 0.62, y: y + 0.11, w: 4.5, h: 0.3, fontSize: 11.5, color: C.slate, fontFace: F })
    })
    const xr = MG + 5.95, wr = COL - 5.95
    sl.addText('COM SMART DEALER', { x: xr, y: 2.05, w: wr, h: 0.26, fontSize: 10, bold: true, color: C.verde, charSpacing: 1, fontFace: F })
    sl.addShape('roundRect' as never, { x: xr, y: 2.45, w: wr, h: 3.5, fill: { color: C.verdeBg }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('Resposta em segundos', { x: xr + 0.3, y: 2.85, w: wr - 0.6, h: 0.5, fontSize: 22, bold: true, color: C.navy, fontFace: F })
    sl.addText('Uma pergunta na tela — ou no chat — e a análise vem pronta, cruzada e com fonte. O tempo do gerente vai para a decisão, não para a coleta.', { x: xr + 0.3, y: 3.45, w: wr - 0.6, h: 1.0, fontSize: 12, color: C.slate, fontFace: F, lineSpacing: 17 })
    sl.addText('Exemplo real: o PDCA oficial da regional, que levava horas, sai em um clique.', { x: xr + 0.3, y: 4.7, w: wr - 0.6, h: 0.9, fontSize: 11, italic: true, color: C.verde, fontFace: F, lineSpacing: 15 })
  }

  /* 10 · jornada do gerente */
  {
    const sl = slideBranco(p, 'A solução', 'A jornada do gerente: gestão baseada em dados, não em percepção')
    cardGrid(sl, 2.1, 3, [
      { titulo: 'Conversão por vendedor', corpo: 'Performance individual visível em tempo real' },
      { titulo: 'Gestão da equipe', corpo: 'Metas, resultados e ranking atualizados ao vivo' },
      { titulo: 'Gargalos do funil', corpo: 'Identifica onde os leads estão travando' },
      { titulo: 'NPS em tempo real', corpo: 'Monitora a satisfação e age imediatamente' },
      { titulo: 'Aprovação bancária', corpo: 'Taxa de financiamento e motivos de recusa' },
      { titulo: 'Eficiência operacional', corpo: 'Painel completo da operação da concessionária' },
    ], 1.35)
    callout(sl, 5.15, 'Resultado: previsibilidade operacional e comercial',
      'Governança de CRM comprova: primeira resposta de 3h47 para 8 min · SLA de 10 minutos de 22% para 81% · conversão de 8,1% para 13,9% · leads sem resposta de 32% para 2% — mesma equipe, mesmos leads.', 1.15, C.verdeBg)
  }

  /* 11 · claude, o cérebro */
  {
    const sl = slideBranco(p, 'A inteligência', 'Claude — o cérebro do Smart Dealer', 'by Anthropic')
    const meio = (COL - 0.5) / 2
    sl.addShape('roundRect' as never, { x: MG, y: 2.1, w: meio, h: 3.6, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('O que é Claude?', { x: MG + 0.3, y: 2.35, w: meio - 0.6, h: 0.35, fontSize: 15, bold: true, color: C.navy, fontFace: F })
    sl.addText('Modelo de inteligência artificial da Anthropic — empresa avaliada em mais de US$ 61 bilhões, fundada por ex-pesquisadores da OpenAI. Considerado um dos modelos mais avançados do mundo.', { x: MG + 0.3, y: 2.8, w: meio - 0.6, h: 1.3, fontSize: 11.5, color: C.slate, fontFace: F, lineSpacing: 17 })
    sl.addText('Diferente de um buscador, Claude raciocina: interpreta documentos inteiros, entende contexto e adapta cada resposta — um especialista disponível 24 horas por dia.', { x: MG + 0.3, y: 4.2, w: meio - 0.6, h: 1.2, fontSize: 11.5, color: C.slate, fontFace: F, lineSpacing: 17 })
    const xr = MG + meio + 0.5
    sl.addShape('roundRect' as never, { x: xr, y: 2.1, w: meio, h: 3.6, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('O que ele faz no Smart Dealer', { x: xr + 0.3, y: 2.35, w: meio - 0.6, h: 0.35, fontSize: 15, bold: true, color: C.navy, fontFace: F })
    const usos = [
      'Lê os dados da operação e responde em linguagem de gente',
      'Consulta manual técnico e circulares oficiais, com citação',
      'Sugere a próxima ação: lead, oferta, cobrança, campanha',
      'Escreve o texto pronto: WhatsApp, post, plano de ação',
    ]
    usos.forEach((u, i) => {
      sl.addShape(p.ShapeType.ellipse, { x: xr + 0.32, y: 2.93 + i * 0.68, w: 0.14, h: 0.14, fill: { color: C.verde }, line: { type: 'none' } })
      sl.addText(u, { x: xr + 0.65, y: 2.86 + i * 0.68, w: meio - 1.0, h: 0.6, fontSize: 11.5, color: C.slate, fontFace: F, lineSpacing: 15 })
    })
  }

  /* 12 · chat universal */
  {
    const sl = slideBranco(p, 'A inteligência', 'Um chat universal para toda a operação',
      'Uma única interface inteligente que serve todas as áreas da concessionária — cada papel pergunta no seu idioma.')
    cardGrid(sl, 2.15, 2, [
      { tag: 'Vendedor', titulo: '"Qual o bônus da NMAX este mês?"', corpo: 'O robô já leu as circulares CA-MTC028 a 033: responde valor, custeio e regra de acúmulo na hora.' },
      { tag: 'Mecânico', titulo: '"Procedimento de revisão dos 6.000 km da Fazer 250?"', corpo: 'Consulta o manual técnico oficial e responde com a seção citada.' },
      { tag: 'Pós-venda', titulo: '"Quais clientes têm revisão vencida ou próxima?"', corpo: 'Régua R1–R4 com alertas proativos e mensagem pronta para o disparo.' },
      { tag: 'Financeiro', titulo: '"Quais aprovados não foram pagos?"', corpo: 'Lista clientes, motivo e ação sugerida — direto da base do Banco.' },
    ], 1.55)
    callout(sl, 5.65, 'Novidade de agosto: a circular entra no robô no dia em que é publicada',
      'A rede inteira responde igual, sem depender da memória de ninguém.', 0.95)
  }

  /* 13 · em ação: banco yamaha */
  {
    const sl = slideBranco(p, 'A inteligência em ação', 'Banco Yamaha: recusado não é fim de linha',
      'O sistema cruza a base de recusados do CDC com o Liberacred e devolve ao vendedor um cliente já aprovado de novo.')
    const funil: [string, string, string][] = [
      ['62', 'recusados no CDC', 'no trimestre, no grupo'],
      ['23', 'elegíveis Liberacred', 'cruzamento automático'],
      ['14', 'contatados', 'fila de trabalho do vendedor'],
      ['5', 'convertidos em venda', brl(92300) + ' recuperados'],
    ]
    funil.forEach((f2, i) => {
      const y = 2.1 + i * 0.78
      sl.addShape('roundRect' as never, { x: MG, y, w: 5.35, h: 0.68, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(f2[0], { x: MG + 0.2, y: y + 0.08, w: 0.85, h: 0.52, fontSize: 22, bold: true, color: i === 3 ? C.verde : C.navy, fontFace: F })
      sl.addText(f2[1], { x: MG + 1.15, y: y + 0.09, w: 4.0, h: 0.28, fontSize: 11.5, bold: true, color: C.navy, fontFace: F })
      sl.addText(f2[2], { x: MG + 1.15, y: y + 0.37, w: 4.0, h: 0.24, fontSize: 9.5, color: C.slate, fontFace: F })
      if (i < 3) sl.addText('↓', { x: MG + 0.28, y: y + 0.6, w: 0.3, h: 0.22, fontSize: 11, bold: true, color: C.azulClaro, fontFace: F })
    })
    sl.addShape('roundRect' as never, { x: MG, y: 5.35, w: 5.35, h: 1.5, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.03 })
    sl.addText('Liberacred como prêmio, nunca como recusa', { x: MG + 0.22, y: 5.5, w: 4.9, h: 0.28, fontSize: 11.5, bold: true, color: C.navy, fontFace: F })
    sl.addText('"Parabéns! Você acaba de ser APROVADO no Liberacred do Banco Yamaha — condições especiais, sem nova análise." Disparada pelo vendedor em um clique.', { x: MG + 0.22, y: 5.8, w: 4.9, h: 0.95, fontSize: 10, italic: true, color: C.slate, fontFace: F, lineSpacing: 13.5, shrinkText: true })
    browserFrame(p, sl, MG + 5.75, 2.15, 5.98, 'banco.png')
    sl.addText('Aprovados não pagos e contratos quitando na mesma tela — cada um com ação sugerida.', { x: MG + 5.75, y: 6.1, w: 5.98, h: 0.5, fontSize: 9.5, color: C.slateClaro, fontFace: F, lineSpacing: 13 })
  }

  /* 14 · em ação: premya */
  {
    const sl = slideBranco(p, 'A inteligência em ação', 'Premya: quanto vale a fidelidade, em reais',
      'O folder oficial do Banco Yamaha codificado no sistema — o índice acompanhado em curso, não descoberto na apuração.')
    const cats: [string, string, string, string][] = [
      ['Diamante', '95–100%', '2,00% do liberado', ''],
      ['Ouro', '85–94,9%', '1,50% do liberado', ''],
      ['Prata', '75–84,9%', '1,00% do liberado', ''],
      ['Bronze', '60–74,9%', '0,50% do liberado', '← Nippon hoje (71,6%)'],
    ]
    cats.forEach((c2, i) => {
      const y = 2.1 + i * 0.62
      sl.addShape('roundRect' as never, { x: MG, y, w: 5.35, h: 0.54, fill: { color: i === 3 ? C.ambarBg : C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(c2[0], { x: MG + 0.2, y: y + 0.12, w: 1.35, h: 0.3, fontSize: 11.5, bold: true, color: i === 3 ? C.ambar : C.navy, fontFace: F })
      sl.addText(c2[1], { x: MG + 1.6, y: y + 0.13, w: 1.15, h: 0.28, fontSize: 10, color: C.slate, fontFace: F })
      sl.addText(c2[2], { x: MG + 2.8, y: y + 0.13, w: 1.6, h: 0.28, fontSize: 10, color: C.slate, fontFace: F })
      if (c2[3]) sl.addText(c2[3], { x: MG + 4.05, y: y + 0.13, w: 1.25, h: 0.28, fontSize: 8.5, bold: true, color: C.ambar, fontFace: F, shrinkText: true })
    })
    sl.addShape('roundRect' as never, { x: MG, y: 4.75, w: 5.35, h: 1.7, fill: { color: C.verdeBg }, line: { type: 'none' }, rectRadius: 0.03 })
    sl.addText('Subir para Ouro vale ~R$ 148 mil/ano', { x: MG + 0.22, y: 4.92, w: 4.9, h: 0.3, fontSize: 12.5, bold: true, color: C.navy, fontFace: F })
    sl.addText('Sem vender uma moto a mais: toda venda financiada submetida primeiro ao BYMD e nenhuma proposta aprovada fugindo para outro banco. O sistema alerta cada fuga e simula o ganho.', { x: MG + 0.22, y: 5.24, w: 4.9, h: 1.1, fontSize: 10, color: C.slate, fontFace: F, lineSpacing: 14, shrinkText: true })
    browserFrame(p, sl, MG + 5.75, 2.15, 5.98, 'premya.png')
    sl.addText('Simulador interativo: mexa nos números e veja a categoria — e os reais — mudarem na hora.', { x: MG + 5.75, y: 6.1, w: 5.98, h: 0.5, fontSize: 9.5, color: C.slateClaro, fontFace: F, lineSpacing: 13 })
  }

  /* 15 · em ação: seguros, consórcio, voz do cliente */
  {
    const sl = slideBranco(p, 'A inteligência em ação', 'Seguros, Consórcio e a voz do cliente',
      'Receita recorrente que já é da casa — e a pesquisa que diz onde o cliente decide.')
    cardGrid(sl, 2.15, 3, [
      { tag: 'Yamaha Seguros', titulo: 'Frota circulante: 2.840 motos', corpo: 'Só 618 com apólice ativa · 141 renovações no radar · +R$ 39 mil/ano fechando o gap de penetração (33,6% → 45%).' },
      { tag: 'Consórcio', titulo: 'Bônus Quality garantido', corpo: '486 cotas ativas (R$ 10,4 mi) · retenção 94,5% · adimplência 91,4% → R$ 11,8 mil no trimestre · contemplado avisado compra aqui (81%).' },
      { tag: 'Voz do Cliente', titulo: 'Pesquisa: 32 clientes reais', corpo: 'Decide a compra: parcela 72% · rapidez 66% · crédito 56%. Satisfação 3,6 → 4,5 antes × depois do piloto. NPS 72.' },
    ], 2.3)
    callout(sl, 4.85, '"Meu crédito não passou e ninguém mais me procurou. Se tivessem uma segunda opção eu tinha fechado."',
      'J. Vitor, cliente que não comprou — 43% das vendas perdidas travaram no crédito. É exatamente o público que o Liberacred devolve à mesa.', 1.2)
  }

  /* 16 · arquitetura */
  {
    const sl = slideBranco(p, 'Arquitetura', 'Quatro pilares sustentam a plataforma')
    cardGrid(sl, 2.1, 4, [
      { tag: '01', titulo: 'Plataforma Inteligente', corpo: 'Painel unificado integrando todas as áreas da concessionária' },
      { tag: '02', titulo: 'IA Analítica', corpo: 'Insights, recomendações e predições automáticas em tempo real' },
      { tag: '03', titulo: 'Dashboard Integrado', corpo: 'KPIs ao vivo para vendedor, gerente e concessionário' },
      { tag: '04', titulo: 'Gestão da Experiência', corpo: 'Jornada do cliente centralizada, fluida e sem repetições' },
    ], 2.0)
    sl.addText('INTEGRAÇÕES', { x: MG, y: 4.55, w: COL, h: 0.26, fontSize: 10, bold: true, color: C.azul, charSpacing: 1.5, fontFace: F })
    const ints = ['CRM', 'Banco Yamaha', 'Consórcio', 'Seguros', 'Leads', 'Pós-venda', 'NPS', 'Estoque', 'Emplacamento', 'WhatsApp']
    const iw = (COL - 0.2 * 9) / 10
    ints.forEach((n2, i) => {
      const x = MG + i * (iw + 0.2)
      sl.addShape('roundRect' as never, { x, y: 4.95, w: iw, h: 0.55, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.27 })
      sl.addText(n2, { x: x - 0.06, y: 4.95, w: iw + 0.12, h: 0.55, fontSize: 8.5, bold: true, color: C.slate, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
    })
    callout(sl, 5.85, 'SaaS multi-grupo desde o dia 1', 'Sem instalação, sem hardware, sem projeto de TI local — replicar para outra concessionária é configurar, não reprogramar.', 1.0)
  }

  /* 17 · cronograma */
  {
    const sl = slideBranco(p, 'Cronograma', 'De janeiro ao rollout: o projeto no prazo',
      'Metodologia ágil com PDCA — as fases cumpridas em 2026 e a proposta para a rede.')
    const fases: [string, string, string, boolean][] = [
      ['Jan–Fev', 'Planejamento', 'requisitos e arquitetura', true],
      ['Mar', 'Desenvolvimento', 'construção da plataforma', true],
      ['Mar–Abr', 'Integrações', 'conexões e testes', true],
      ['Abr', 'Treinamento', 'capacitação das equipes', true],
      ['Abr–Mai', 'Piloto', 'implantação Nippon Motos', true],
      ['Jul–Ago', 'PDCA', 'melhoria contínua + novas frentes', true],
      ['Set–Dez', 'Fase 2', 'rollout regional — 9 grupos', false],
    ]
    const gap2 = 0.18, fw = (COL - gap2 * 6) / 7
    sl.addShape(p.ShapeType.line, { x: MG + 0.2, y: 3.0, w: COL - 0.4, h: 0, line: { color: C.linha, width: 1.5 } })
    fases.forEach((f2, i) => {
      const x = MG + i * (fw + gap2)
      sl.addShape(p.ShapeType.ellipse, { x: x + fw / 2 - 0.08, y: 2.92, w: 0.16, h: 0.16, fill: { color: f2[3] ? C.verde : C.azul }, line: { color: C.branco, width: 1.5 } })
      sl.addText(f2[0], { x, y: 2.35, w: fw, h: 0.3, fontSize: 10, bold: true, color: f2[3] ? C.slate : C.azul, align: 'center', fontFace: F })
      sl.addShape('roundRect' as never, { x, y: 3.35, w: fw, h: 1.9, fill: { color: f2[3] ? C.card : C.callout }, line: f2[3] ? { type: 'none' } : { color: C.azul, width: 1 }, rectRadius: 0.04 })
      sl.addText(f2[1], { x: x + 0.1, y: 3.5, w: fw - 0.2, h: 0.32, fontSize: 11.5, bold: true, color: C.navy, align: 'center', fontFace: F, shrinkText: true })
      sl.addText(f2[2], { x: x + 0.1, y: 3.88, w: fw - 0.2, h: 1.2, fontSize: 9, color: C.slate, align: 'center', fontFace: F, valign: 'top', lineSpacing: 12.5, shrinkText: true })
      if (f2[3]) sl.addText('ENTREGUE', { x, y: 4.85, w: fw, h: 0.26, fontSize: 8, bold: true, color: C.verde, align: 'center', charSpacing: 1, fontFace: F })
    })
    sl.addText('Tudo até aqui foi entregue no prazo — a Fase 2 é a decisão desta reunião.', { x: MG, y: 5.6, w: COL, h: 0.32, fontSize: 12.5, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* 18 · payback */
  {
    const sl = slideBranco(p, 'Payback & viabilidade', 'Retorno mensurável para toda a cadeia')
    cardGrid(sl, 2.0, 3, [
      { tag: 'Investimento', titulo: 'R$ 600/mês por CCY', corpo: 'Plataforma, integrações, treinamento e suporte — SaaS sem instalação e sem hardware.' },
      { tag: 'Economia gerada', titulo: 'Horas viram segundos', corpo: 'Menos retrabalho operacional, menor custo de captação, menos perda no funil de vendas.' },
      { tag: 'Ganhos esperados', titulo: '+8% varejo · +15% leads', corpo: '+10% aprovação financeira · +5 pts NPS e fidelização · escalabilidade nacional.' },
    ], 1.9)
    callout(sl, 4.35, 'O piloto já quantificou: cerca de R$ 1,1 milhão por ano em uma única concessionária',
      'Prêmios de campanha (~R$ 400 mil) + gap de absorção do K2 (~R$ 490 mil) + Premya, Seguros e Consórcio (~R$ 200 mil). Um único prêmio de campanha capturado paga o ano inteiro de plataforma.', 1.3, C.verdeBg)
    sl.addText('Modelo com retorno comprovável e escalável para toda a rede Yamaha.', { x: MG, y: 5.95, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* 19 · conclusão + pedido */
  fraseNavy(p, 'O pedido desta reunião: aprovar a Fase 2 —\nos 9 grupos da regional ainda em 2026.',
    'Operação inteligente · decisões melhores · experiências memoráveis · crescimento sustentável.',
  sl => {
    sl.addText('"O Smart Dealer é mais do que uma plataforma tecnológica. É um novo padrão de relacionamento\nentre cliente, concessionária e Yamaha."', { x: W * 0.14, y: 5.35, w: W * 0.72, h: 0.8, fontSize: 13, italic: true, color: C.slateClaro, align: 'center', fontFace: F, lineSpacing: 19 })
    sl.addText('YAMAHA WAY 2026 · GRUPO SHOGUN RIDERS · NIPPON MOTOS', { x: MG, y: H - 0.6, w: COL, h: 0.3, fontSize: 9.5, color: '3D4F61', align: 'center', charSpacing: 2, fontFace: F })
  })

  await p.writeFile({ fileName: '_NOVAS MELHORIAS/DECK-DIRETORIA-SMART-DEALER.pptx' })
  console.log('✓ DECK-DIRETORIA-SMART-DEALER.pptx')
}

/* ═══════════════════ DECK 2 · BANCA ═══════════════════
   Um slide por requisito da Fórmula do Sucesso (27 sub-itens).
   O slide não relata o status — ele É a entrega que preenche o requisito.
   Chapéu = critério + item N de M · subtítulo = o texto exato do formulário. */

function slideItem(p: P, secao: string, item: number, total: number, requisito: string, titulo: string): Slide {
  const sl = slideBranco(p, `${secao} · item ${item} de ${total}`, titulo)
  sl.addText([
    { text: 'FÓRMULA DO SUCESSO:  ', options: { fontSize: 10, bold: true, color: C.azul, charSpacing: 1 } },
    { text: `"${requisito}"`, options: { fontSize: 11.5, italic: true, color: C.slate } },
  ], { x: MG, y: 1.56, w: COL, h: 0.32, fontFace: F, shrinkText: true })
  return sl
}

async function deckBanca() {
  const p = new pptxgen()
  p.defineLayout({ name: 'W', width: W, height: H })
  p.layout = 'W'
  p.author = 'Grupo 06 — Shogun Riders'
  p.title = 'Smart Dealer — 2ª Banca YamahaWay 2026'
  PAG = 0

  /* capa */
  capa(p, 'Yamaha Way 2026 · 2ª banca · Grupo 06 — Shogun Riders',
    ['Smart ', 'Dealer'],
    'Como transformar dados em experiências memoráveis?\nA Fórmula do Sucesso, requisito a requisito — cada slide preenche um item.',
    'Piloto real: Nippon Motos · Bragança Paulista, Atibaia, Amparo e Extrema')

  /* agenda = os 6 critérios */
  {
    const sl = slideBranco(p, 'Agenda', 'A Fórmula do Sucesso é o roteiro',
      'Seis critérios, 27 requisitos — um slide para cada um, com a entrega que o preenche.')
    const itens: Card[] = formulaDiagnostico.map((cr, i) => ({
      tag: String(i + 1).padStart(2, '0'),
      titulo: cr.criterio,
      corpo: `${cr.itens.length} requisitos do formulário`,
      corTag: 'B8CDEA',
    }))
    cardGrid(sl, 2.15, 3, itens, 1.75)
  }

  /* ════ 01 · PESQUISA (4) ════ */

  /* 1.1 análises externas */
  {
    const sl = slideItem(p, '01 · Pesquisa', 1, 4, 'Análises externas foram devidamente realizadas', 'O mercado, medido na fonte')
    kpiCards(sl, 2.1, [
      { tag: 'Mercado Jan–Jul', val: '5.346', sub: 'motos emplacadas nas áreas da Nippon (Amparo + Ouro Fino)' },
      { tag: 'Share Yamaha', val: '20,0%', sub: 'Honda lidera com 63,7% — o tamanho da disputa' },
      { tag: 'Nippon na Yamaha', val: '83,6%', sub: '893 motos — o peso do grupo na marca regional' },
      { tag: 'Áreas mapeadas', val: '13', sub: 'toda a regional, cidade a cidade' },
    ], 1.5)
    browserFrame(p, sl, (W - 5.9) / 2, 3.62, 5.9, 'marketshare.png')
  }

  /* 1.2 concorrentes */
  {
    const sl = slideItem(p, '01 · Pesquisa', 2, 4, 'Análises dos concorrentes foram realizadas', 'Concorrentes do mercado — e da solução')
    const meio = (COL - 0.4) / 2
    sl.addText('DO MERCADO (quem vende moto)', { x: MG, y: 2.1, w: meio, h: 0.26, fontSize: 10, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
    const mkt: [string, string][] = [
      ['230 CNPJs concorrentes mapeados', '175 nomeados via Receita Federal / BrasilAPI'],
      ['Invasão de território por CNPJ', 'quem emplaca dentro da área da Nippon, loja a loja'],
      ['Honda decomposta por segmento', 'onde ela é imbatível e onde a Yamaha disputa de igual'],
    ]
    mkt.forEach((m, i) => {
      const y = 2.45 + i * 1.02
      sl.addShape('roundRect' as never, { x: MG, y, w: meio, h: 0.9, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(m[0], { x: MG + 0.2, y: y + 0.12, w: meio - 0.4, h: 0.32, fontSize: 11.5, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addText(m[1], { x: MG + 0.2, y: y + 0.46, w: meio - 0.4, h: 0.36, fontSize: 10, color: C.slate, fontFace: F, shrinkText: true })
    })
    const xr = MG + meio + 0.4
    sl.addText('DA SOLUÇÃO (quem disputa a gestão da CCY)', { x: xr, y: 2.1, w: meio, h: 0.26, fontSize: 10, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
    const rows: CelDef[][] = [
      [{ t: 'Regras Yamaha codificadas' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'sim', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'PDCA oficial em 1 clique' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'sim', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Liberacred / Premya / circulares' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'sim', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Custo mensal' }, { t: 'R$ 800–2.500', align: 'center' }, { t: 'já pago', align: 'center' }, { t: 'R$ 600', cor: C.verde, bold: true, align: 'center' }],
    ]
    const head = ['', 'CRM genérico', 'DMS', 'Smart Dealer'].map(h => ({
      text: h.toUpperCase(), options: { fill: { color: C.navy2 }, color: C.branco, bold: true, fontSize: 8.5, valign: 'middle', fontFace: F, margin: [0.04, 0.08, 0.04, 0.08] },
    }))
    const body = rows.map((r, ri) => r.map((c2, ci) => ({
      text: c2.t,
      options: { fill: { color: ri % 2 ? C.card : C.branco }, color: c2.cor ?? (ci === 0 ? C.navy : C.slate), bold: c2.bold ?? ci === 0, fontSize: 9, valign: 'middle', align: c2.align ?? 'left', fontFace: F, margin: [0.04, 0.08, 0.04, 0.08] },
    })))
    sl.addTable([head, ...body] as never, { x: xr, y: 2.45, w: meio, colW: [2.15, 1.25, 1.0, 1.32], border: { pt: 0.75, color: C.branco }, rowH: 0.52, autoPage: false })
    callout(sl, 5.75, 'A resposta à pergunta da 1ª banca ("qual a exclusividade?")',
      'A vantagem competitiva é o método Yamaha codificado — o software é só o veículo. Nenhum concorrente carrega carta, Kaizen, K2, Premya e circulares dentro do produto.', 1.05)
  }

  /* 1.3 análises suficientes */
  {
    const sl = slideItem(p, '01 · Pesquisa', 3, 4, 'Pesquisas e análises de mercado foram suficientes', 'Cada análise ancorada numa fonte oficial')
    const linhas: [string, string, string][] = [
      ['Share por segmento e cidade', 'Base de emplacamento Yamaha', 'tela Market Share'],
      ['Decomposição mercado × share', 'Emplacamento + metodologia própria', 'tela Performance + PDCA'],
      ['Absorção do pós-vendas (K2)', 'DRE oficial BMI', 'tela K2 · Absorção'],
      ['Campanhas e prêmios', 'Circulares CA-MTC 028–033 e 080', 'telas Campanhas + robô'],
      ['Fidelidade ao Banco Yamaha', 'Folder oficial Premya 3ª edição', 'tela Premya + simulador'],
      ['Concorrentes nomeados', 'Receita Federal / BrasilAPI', 'tela Market Share'],
      ['Voz do cliente', 'Pesquisa própria (32 respostas)', 'tela Voz do Cliente'],
    ]
    tabela(sl, 2.1, ['A análise', 'A fonte', 'Onde vive no sistema'], linhas.map(l => [{ t: l[0] }, { t: l[1], bold: false }, { t: l[2], cor: C.azul, bold: false }]), [4.3, 4.0, 3.33], 10.5, 0.52)
    sl.addText('Rastreabilidade total: na banca, qualquer número desta apresentação abre ao vivo na tela que o gerou.', { x: MG, y: 6.15, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 1.4 hipóteses */
  {
    const sl = slideItem(p, '01 · Pesquisa', 4, 4, 'As hipóteses do trabalho foram claras a partir das análises realizadas', 'Três hipóteses testáveis — e a medida de cada uma')
    let y = 2.15
    materiaisProntos.hipoteses.itens.forEach(h2 => {
      const [hip, medida] = h2.split(' Medida: ')
      sl.addShape('roundRect' as never, { x: MG, y, w: COL, h: 1.28, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(hip, { x: MG + 0.26, y: y + 0.16, w: COL - 0.52, h: 0.62, fontSize: 12.5, bold: true, color: C.navy, fontFace: F, valign: 'top', lineSpacing: 16, shrinkText: true })
      sl.addText('MEDIDA: ' + (medida ?? ''), { x: MG + 0.26, y: y + 0.85, w: COL - 0.52, h: 0.34, fontSize: 10, bold: true, color: C.azul, fontFace: F, shrinkText: true })
      y += 1.45
    })
    sl.addText('H1 já tem resultado: SLA de 10 min subiu de 22% para 81% — e a conversão foi de 8,1% para 13,9%.', { x: MG, y: y + 0.12, w: COL, h: 0.32, fontSize: 12, italic: true, color: C.verde, align: 'center', fontFace: F })
  }

  /* ════ 02 · PLANEJAMENTO E OBJETIVOS (6) ════ */

  /* 2.1 objetivo claro */
  {
    const sl = slideItem(p, '02 · Planejamento e Objetivos', 1, 6, 'O objetivo do trabalho é claro e definido', 'Um objetivo. Uma frase. Sempre a mesma.')
    sl.addShape('roundRect' as never, { x: MG, y: 2.7, w: COL, h: 1.9, fill: { color: C.navy }, line: { type: 'none' }, rectRadius: 0.06 })
    sl.addText(`"${materiaisProntos.objetivo.texto}"`, { x: MG + 0.5, y: 2.7, w: COL - 1.0, h: 1.9, fontSize: 19, bold: true, italic: true, color: C.branco, align: 'center', valign: 'middle', fontFace: F, lineSpacing: 27, shrinkText: true })
    cardGrid(sl, 5.0, 3, [
      { titulo: 'Com verbo e alvo', corpo: 'aumentar carta e absorção — não "melhorar a gestão"' },
      { titulo: 'Repetida em todo material', corpo: 'slides, sistema, dossiê — a mesma frase' },
      { titulo: 'Medida por 3 metas públicas', corpo: 'o próximo slide as declara com número e prazo' },
    ], 1.15)
  }

  /* 2.2 mensurável */
  {
    const sl = slideItem(p, '02 · Planejamento e Objetivos', 2, 6, 'O objetivo do trabalho é mensurável', 'Três metas públicas, com número e prazo')
    const metas: [string, string, string][] = [
      ['Meta 1 · Carta', '≥ 100%', 'em setembro/2026 — julho fechou em 90,0% e o prêmio da campanha está em jogo'],
      ['Meta 2 · Absorção', '65%', 'até dezembro/2026 — saímos de 30% e já estamos em 49,4% (K2 lido do DRE)'],
      ['Meta 3 · Lead', '≤ 10 min', 'padrão de atendimento — hoje 81% dentro do SLA; era 22% antes do piloto'],
    ]
    const gap = 0.22, mw = (COL - gap * 2) / 3
    metas.forEach((m, i) => {
      const x = MG + i * (mw + gap)
      sl.addShape('roundRect' as never, { x, y: 2.3, w: mw, h: 2.5, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(m[0].toUpperCase(), { x: x + 0.24, y: 2.55, w: mw - 0.48, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
      sl.addText(m[1], { x: x + 0.24, y: 2.85, w: mw - 0.48, h: 0.65, fontSize: 34, bold: true, color: C.verde, fontFace: F })
      sl.addText(m[2], { x: x + 0.24, y: 3.6, w: mw - 0.48, h: 1.05, fontSize: 10.5, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 15, shrinkText: true })
    })
    callout(sl, 5.15, 'O sistema mede as três, ao vivo',
      'A meta virou compromisso público, não promessa — convidamos a banca a cobrar o resultado na apresentação final.', 1.0)
  }

  /* 2.3 no prazo */
  {
    const sl = slideItem(p, '02 · Planejamento e Objetivos', 3, 6, 'O objetivo foi atingido no prazo', 'As entregas, com data — tudo dentro do cronograma')
    const marcos: [string, string, string][] = [
      ['Jun/26', 'Fundação', 'dashboard, varejo, estoque, NPS e leads no ar'],
      ['21/06', 'Inteligência', 'Market Share, Kaizen e Treinamento'],
      ['22/06', 'Comercial', 'CRM, campanhas IA, playbook e pós-vendas'],
      ['06/08', 'Performance', 'decomposição mercado × share + PDCA em 1 clique + K2'],
      ['07/08', 'Campanhas', 'vouchers por modelo + Campeões de Vendas codificados'],
      ['20/08', 'Banco & cliente', 'Liberacred, Premya, Seguros, Consórcio, Voz do Cliente'],
    ]
    const gap2 = 0.18, fw = (COL - gap2 * 5) / 6
    sl.addShape(p.ShapeType.line, { x: MG + 0.2, y: 2.75, w: COL - 0.4, h: 0, line: { color: C.linha, width: 1.5 } })
    marcos.forEach((m, i) => {
      const x = MG + i * (fw + gap2)
      sl.addShape(p.ShapeType.ellipse, { x: x + fw / 2 - 0.08, y: 2.67, w: 0.16, h: 0.16, fill: { color: C.verde }, line: { color: C.branco, width: 1.5 } })
      sl.addText(m[0], { x, y: 2.25, w: fw, h: 0.3, fontSize: 10.5, bold: true, color: C.navy, align: 'center', fontFace: F })
      sl.addShape('roundRect' as never, { x, y: 3.1, w: fw, h: 1.95, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.04 })
      sl.addText(m[1], { x: x + 0.1, y: 3.25, w: fw - 0.2, h: 0.3, fontSize: 11, bold: true, color: C.navy, align: 'center', fontFace: F, shrinkText: true })
      sl.addText(m[2], { x: x + 0.12, y: 3.6, w: fw - 0.24, h: 1.35, fontSize: 9, color: C.slate, align: 'center', fontFace: F, valign: 'top', lineSpacing: 12.5, shrinkText: true })
    })
    sl.addText('25 módulos em produção em 10 semanas — metodologia ágil com PDCA sobre o próprio projeto.', { x: MG, y: 5.5, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* 2.4 KPIs alinhados */
  {
    const sl = slideItem(p, '02 · Planejamento e Objetivos', 4, 6, 'Os KPIs estão alinhados com os objetivos', 'Cada KPI tem meta — e cada meta tem tela')
    tabela(sl, 2.1, ['KPI', 'Meta', 'Hoje', 'Onde vive'], [
      [{ t: 'Atingimento da carta varejo' }, { t: '≥ 100%', bold: false }, { t: '90,0% (jul)', cor: C.ambar, bold: false }, { t: 'Dashboard + Varejo', cor: C.azul, bold: false }],
      [{ t: 'Absorção do pós-vendas (K2)' }, { t: '65%', bold: false }, { t: '49,4%', cor: C.ambar, bold: false }, { t: 'K2 · Absorção', cor: C.azul, bold: false }],
      [{ t: 'Tempo de 1ª resposta ao lead' }, { t: '≤ 10 min', bold: false }, { t: '8 min · 81% no SLA', cor: C.verde, bold: false }, { t: 'Atendimento Diário', cor: C.azul, bold: false }],
      [{ t: 'NPS Vendas / Pós-vendas' }, { t: '93 / 87', bold: false }, { t: '94,5 / 87,7', cor: C.verde, bold: false }, { t: 'NPS', cor: C.azul, bold: false }],
      [{ t: 'Pontos Kaizen' }, { t: '19', bold: false }, { t: '15 (LCR e NPS a recuperar)', cor: C.ambar, bold: false }, { t: 'Kaizen', cor: C.azul, bold: false }],
      [{ t: 'Índice de Fidelidade Premya' }, { t: 'Ouro (85%)', bold: false }, { t: 'Bronze · 71,6%', cor: C.ambar, bold: false }, { t: 'Premya + simulador', cor: C.azul, bold: false }],
    ], [4.6, 1.7, 3.3, 2.73], 10.5, 0.54)
    sl.addText('Verde = meta batida · âmbar = em curso. Nenhum KPI decorativo: todos ligados às 3 metas públicas.', { x: MG, y: 6.05, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 2.5 plano de ação */
  {
    const sl = slideItem(p, '02 · Planejamento e Objetivos', 5, 6, 'O plano de ação está alinhado com os objetivos', 'O plano nasce dos números — PDCA oficial em um clique')
    const passos: [string, string][] = [
      ['1 · O sistema decompõe', 'mercado × share: o desvio é demanda da praça ou execução nossa?'],
      ['2 · Aponta onde agir', 'segmento em disputa, cidade em queda, invasão de território'],
      ['3 · Escreve o PDCA', 'no formato oficial Yamaha, pronto para a regional'],
      ['4 · Cobra a execução', 'ação com dono e prazo — reaberta no mês seguinte'],
    ]
    passos.forEach((ps, i) => {
      const y = 2.15 + i * 1.05
      sl.addShape('roundRect' as never, { x: MG, y, w: 5.3, h: 0.92, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(ps[0], { x: MG + 0.2, y: y + 0.12, w: 4.9, h: 0.3, fontSize: 11.5, bold: true, color: C.navy, fontFace: F })
      sl.addText(ps[1], { x: MG + 0.2, y: y + 0.45, w: 4.9, h: 0.4, fontSize: 10, color: C.slate, fontFace: F, shrinkText: true })
    })
    browserFrame(p, sl, MG + 5.7, 2.15, 6.03, 'performance.png')
    sl.addText('Momento mais forte da demonstração: o PDCA gerado ao vivo, na frente da banca.', { x: MG + 5.7, y: 6.15, w: 6.03, h: 0.4, fontSize: 9.5, color: C.slateClaro, fontFace: F })
  }

  /* 2.6 objetivo ↔ resultados */
  {
    const sl = slideItem(p, '02 · Planejamento e Objetivos', 6, 6, 'O objetivo está relacionado aos resultados', 'O que o piloto já produziu')
    kpiCards(sl, 2.15, [
      { tag: 'Campanha Campeões', val: 'R$ 7.500', sub: 'garantidos em julho (90,0% da carta) + R$ 15 mil recuperáveis', cor: C.verde },
      { tag: 'Vouchers por modelo', val: 'R$ 66 mil', sub: 'apurados em julho; com Campeões, R$ 73,5 mil', cor: C.verde },
      { tag: 'Absorção', val: '+19 p.p.', sub: 'de 30% para 49,4% — a caminho da meta de 65%', cor: C.verde },
      { tag: 'Conversão de leads', val: '8,1 → 13,9%', sub: 'com o SLA de 10 minutos governado', cor: C.verde },
    ], 1.6)
    callout(sl, 4.2, 'Potencial anual identificado pelo sistema: cerca de R$ 1,1 milhão',
      'Prêmios de campanha (~R$ 400 mil) + gap de absorção do K2 (~R$ 490 mil) + Premya, Seguros e Consórcio (~R$ 200 mil) — em uma única concessionária.', 1.25, C.verdeBg)
    sl.addText('Setembro fecha a campanha e a Meta 1 — o resultado estará na tela, ao vivo, na apresentação final.', { x: MG, y: 5.7, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* ════ 03 · FOCO NO CLIENTE (8) ════ */

  /* 3.1 público-alvo */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 1, 8, 'O público alvo (cliente) foi claramente definido', 'Seis personas — cinco dentro da loja, uma na garupa')
    cardGrid(sl, 2.15, 3, [
      { tag: 'Titular', titulo: 'João Paulo Zorzi', corpo: 'vê o negócio inteiro: carta, crédito, absorção, ranking' },
      { tag: 'Gerente', titulo: 'Gerência comercial', corpo: 'funil, SLA, ranking de vendedores, campanhas do mês' },
      { tag: 'Vendedor', titulo: 'Equipe de vendas', corpo: 'seus leads, playbook, estoque e bônus da circular' },
      { tag: 'Mecânico', titulo: 'Oficina', corpo: 'assistente técnico com manual oficial e revisões R1–R4' },
      { tag: 'Consultor', titulo: 'Regional Yamaha', corpo: 'indicadores agregados das CCYs, sem dados pessoais' },
      { tag: 'Cliente final', titulo: 'Quem compra a moto', corpo: 'resposta em minutos, crédito transparente, revisão lembrada', corTag: C.verde },
    ], 1.5)
    sl.addText('Cada persona é um login real do sistema — a prova é a demonstração, trocando de papel em 30 segundos.', { x: MG, y: 5.75, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 3.2 posicionamento */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 2, 8, 'O posicionamento Yamaha foi claramente definido', 'Diferenciação por experiência, não por volume')
    sl.addShape('roundRect' as never, { x: MG, y: 2.25, w: COL, h: 1.7, fill: { color: C.navy }, line: { type: 'none' }, rectRadius: 0.06 })
    sl.addText('"A Yamaha como a marca que responde em minutos, é transparente no crédito\ne acompanha a moto a vida inteira — da primeira mensagem à revisão de 24.000 km."', { x: MG + 0.5, y: 2.25, w: COL - 1.0, h: 1.7, fontSize: 16, bold: true, italic: true, color: C.branco, align: 'center', valign: 'middle', fontFace: F, lineSpacing: 24, shrinkText: true })
    cardGrid(sl, 4.35, 3, [
      { titulo: 'Responde em minutos', corpo: 'SLA de 10 min governado — 81% dos leads dentro do padrão' },
      { titulo: 'Transparente no crédito', corpo: 'BYMD primeiro; recusa vira Liberacred com condições claras' },
      { titulo: 'Acompanha a vida inteira', corpo: 'régua R1–R4 + recompra na quitação — o ciclo nunca solta o cliente' },
    ], 1.3)
  }

  /* 3.3 diferenciada vs concorrentes */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 3, 8, 'A Yamaha ficou claramente posicionada de forma diferenciada em relação aos concorrentes', 'A Honda vende mais motos. A Yamaha atende melhor.')
    tabela(sl, 2.2, ['A experiência do cliente', 'Padrão do mercado', 'Yamaha com Smart Dealer'], [
      [{ t: 'Primeira resposta' }, { t: 'horas ou dias', cor: C.verm, bold: false }, { t: '8 minutos, monitorado', cor: C.verde, bold: true }],
      [{ t: 'Crédito recusado' }, { t: 'fim da conversa', cor: C.verm, bold: false }, { t: 'segunda chance com mensagem-prêmio', cor: C.verde, bold: true }],
      [{ t: 'Depois da compra' }, { t: 'silêncio', cor: C.verm, bold: false }, { t: 'recontato em 74% + régua de revisão', cor: C.verde, bold: true }],
      [{ t: 'Na troca da moto' }, { t: 'cliente procura sozinho', cor: C.verm, bold: false }, { t: 'a loja chama primeiro, com oferta pronta', cor: C.verde, bold: true }],
    ], [3.6, 3.6, 4.43], 11, 0.6)
    callout(sl, 5.35, 'Onde a Honda é imbatível em volume, a disputa muda de campo',
      'O share por segmento mostra onde competir; a experiência define quem ganha o cliente que pesquisou os dois. Diferenciação medida, não declarada.', 1.05)
  }

  /* 3.4 consistência público × atividades */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 4, 8, 'Existe consistência entre o público alvo e as atividades', 'Cada papel vê só o que usa')
    tabela(sl, 2.15, ['Papel', 'O que abre ao logar', 'O que NÃO vê'], [
      [{ t: 'Titular' }, { t: 'tudo: carta, crédito, K2, Premya, ranking', bold: false }, { t: '—', bold: false }],
      [{ t: 'Gerente' }, { t: 'funil, SLA, campanhas, pós-vendas', bold: false }, { t: 'financeiro do grupo', bold: false }],
      [{ t: 'Vendedor' }, { t: 'apenas os próprios leads + playbook + estoque', bold: false }, { t: 'leads dos colegas, DRE', bold: false }],
      [{ t: 'Mecânico' }, { t: 'assistente técnico + revisões do dia', bold: false }, { t: 'todo o comercial', bold: false }],
      [{ t: 'Consultor regional' }, { t: 'indicadores agregados das 9 CCYs', bold: false }, { t: 'dados pessoais de clientes', bold: false }],
    ], [2.6, 5.2, 3.83], 10.5, 0.54)
    sl.addText('Demonstração na banca: logout → login em outro papel — 30 segundos, efeito grande.', { x: MG, y: 5.6, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 3.5 necessidades e desejos */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 5, 8, 'Necessidades e desejos dos clientes foram definidos', 'Cinco necessidades, cada uma com evidência — e com tela')
    tabela(sl, 2.15, ['A necessidade', 'A evidência', 'A tela que atende'], [
      [{ t: 'Resposta rápida' }, { t: '66% citam rapidez · "esperei dois dias e desisti"', bold: false }, { t: 'Atendimento Diário (SLA 10 min)', cor: C.azul, bold: false }],
      [{ t: 'Parcela que cabe no bolso' }, { t: '72% — o fator nº 1 da pesquisa', bold: false }, { t: 'Simulador + bônus da circular', cor: C.azul, bold: false }],
      [{ t: 'Transparência no crédito' }, { t: '56% citam aprovação · 43% das perdas', bold: false }, { t: 'Banco Yamaha + Liberacred', cor: C.azul, bold: false }],
      [{ t: 'Ser lembrado da revisão' }, { t: '59% voltariam por isso', bold: false }, { t: 'Pós-vendas (régua R1–R4)', cor: C.azul, bold: false }],
      [{ t: 'Oferta certa na troca' }, { t: '44% · quitação = janela de recompra', bold: false }, { t: 'Banco Yamaha (quitações)', cor: C.azul, bold: false }],
    ], [3.3, 4.9, 3.43], 10.5, 0.54)
    sl.addText('A dor do "limbo do lead" foi validada pela própria banca (Cintia) — e virou a régua de cobrança do CRM.', { x: MG, y: 5.6, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 3.6 fatores de compra */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 6, 8, 'Os principais fatores de compra dos clientes foram definidos', 'Fatores de compra medidos, não achados')
    const fatores: [string, number, string][] = [
      ['Parcela que cabe no bolso', 72, 'simulador + bônus da circular na proposta'],
      ['Atendimento rápido', 66, 'SLA de 10 minutos governado no CRM'],
      ['Aprovação do crédito', 56, 'BYMD primeiro + resgate Liberacred'],
      ['Preço / valor da entrada', 47, 'vouchers da montadora aplicados'],
      ['Confiança / indicação', 38, 'NPS + régua de pós-venda'],
      ['Prazo de entrega', 25, 'estoque real das 4 lojas na tela'],
      ['Test-ride antes de decidir', 22, 'agendamento na cadência do CRM'],
    ]
    fatores.forEach((f2, i) => {
      const y = 2.2 + i * 0.56
      sl.addText(f2[0], { x: MG, y, w: 3.1, h: 0.4, fontSize: 11, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addShape('roundRect' as never, { x: MG + 3.25, y: y + 0.02, w: 4.6, h: 0.3, fill: { color: C.linha }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addShape('roundRect' as never, { x: MG + 3.25, y: y + 0.02, w: 4.6 * f2[1] / 100, h: 0.3, fill: { color: C.azul }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(`${f2[1]}%`, { x: MG + 7.95, y, w: 0.65, h: 0.34, fontSize: 11.5, bold: true, color: C.navy, fontFace: F })
      sl.addText(f2[2], { x: MG + 8.65, y: y + 0.02, w: COL - 8.65, h: 0.34, fontSize: 9, color: C.slateClaro, fontFace: F, valign: 'middle', shrinkText: true })
    })
    sl.addText('Múltipla escolha sobre os 32 respondentes da pesquisa Voz do Cliente — cada fator já ligado ao módulo que o atende.', { x: MG, y: 6.3, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 3.7 sete passos */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 7, 8, 'Os 7 passos foram claramente descritos', 'Os 7 passos da venda — e onde o sistema atua em cada um')
    tabela(sl, 2.15,
      ['Passo da venda Yamaha', 'Onde o Smart Dealer atua'],
      materiaisProntos.seteSteps.passos.map(ps => [{ t: ps.passo }, { t: ps.atua, bold: false }]),
      [3.5, 8.13], 10.5, 0.56)
    sl.addText('Na banca, dois passos demonstrados ao vivo: a sondagem (CRM) e a entrega/pós (régua de revisão).', { x: MG, y: 6.35, w: COL, h: 0.28, fontSize: 11.5, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 3.8 pesquisa com clientes — o forms, pergunta a pergunta */
  {
    const sl = slideItem(p, '03 · Foco no Cliente', 8, 8, 'Pesquisas com clientes foram realizadas', 'A pesquisa, pergunta a pergunta — 32 clientes reais')
    const meio = (COL - 0.4) / 2
    // P1 satisfação
    sl.addText('P1 · "COMO FOI SER ATENDIDO?" (1–5)', { x: MG, y: 2.05, w: meio, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
    const dist: [string, number][] = [['5', 19], ['4', 10], ['3', 2], ['2', 1], ['1', 0]]
    dist.forEach((d2, i) => {
      const y = 2.38 + i * 0.34
      sl.addText(d2[0], { x: MG, y, w: 0.3, h: 0.26, fontSize: 10, bold: true, color: C.slate, fontFace: F })
      sl.addShape('roundRect' as never, { x: MG + 0.38, y: y + 0.02, w: Math.max((meio - 1.3) * d2[1] / 19, 0.03), h: 0.22, fill: { color: d2[0] >= '4' ? C.verde : d2[0] === '3' ? 'E8B04B' : C.verm }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(String(d2[1]), { x: MG + meio - 0.8, y, w: 0.7, h: 0.26, fontSize: 10, bold: true, color: C.navy, align: 'right', fontFace: F })
    })
    sl.addText('média 4,5 · NPS da pesquisa 72', { x: MG, y: 4.15, w: meio, h: 0.26, fontSize: 10.5, bold: true, color: C.verde, fontFace: F })
    // P2 tempo
    const xr = MG + meio + 0.4
    sl.addText('P2 · "EM QUANTO TEMPO TE RESPONDERAM?"', { x: xr, y: 2.05, w: meio, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
    const tempos: [string, number, string][] = [['Na hora', 63, C.verde], ['Até 1 hora', 22, '84CC16'], ['No mesmo dia', 9, 'E8B04B'], ['Mais de um dia', 6, C.verm]]
    let tx = xr
    tempos.forEach(t => {
      sl.addShape('roundRect' as never, { x: tx, y: 2.42, w: (meio) * t[1] / 100, h: 0.34, fill: { color: t[2] }, line: { type: 'none' }, rectRadius: 0.02 })
      tx += (meio) * t[1] / 100
    })
    tempos.forEach((t, i) => {
      sl.addText(`${t[0]} · ${t[1]}%`, { x: xr + (i % 2) * (meio / 2), y: 2.9 + Math.floor(i / 2) * 0.3, w: meio / 2, h: 0.26, fontSize: 9.5, color: C.slate, fontFace: F })
    })
    sl.addText('81% respondidos em até 10 minutos — era 22% antes do piloto', { x: xr, y: 3.6, w: meio, h: 0.5, fontSize: 10.5, bold: true, color: C.verde, fontFace: F, lineSpacing: 14 })
    // P3 voltar
    sl.addText('P3 · "O QUE FARIA VOCÊ VOLTAR?"', { x: MG, y: 4.6, w: meio, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
    const volta: [string, number][] = [['Loja lembrar da revisão', 59], ['Contato pós-compra', 53], ['Oferta certa na troca', 44]]
    volta.forEach((v, i) => {
      const y = 4.93 + i * 0.42
      sl.addText(v[0], { x: MG, y, w: 2.6, h: 0.3, fontSize: 9.5, color: C.navy, fontFace: F, shrinkText: true })
      sl.addShape('roundRect' as never, { x: MG + 2.7, y: y + 0.03, w: (meio - 3.4) * v[1] / 59, h: 0.2, fill: { color: C.azul }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(`${v[1]}%`, { x: MG + meio - 0.65, y, w: 0.6, h: 0.28, fontSize: 10, bold: true, color: C.navy, align: 'right', fontFace: F })
    })
    // P4 não comprou
    sl.addText('P4 · "POR QUE NÃO FECHOU?" (14 não compradores)', { x: xr, y: 4.6, w: meio, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
    const nc: [string, number][] = [['Crédito não aprovado', 6], ['Parcela alta', 3], ['Comprou usado/outra marca', 3], ['Adiou a compra', 2]]
    nc.forEach((v, i) => {
      const y = 4.93 + i * 0.34
      sl.addText(v[0], { x: xr, y, w: 2.9, h: 0.28, fontSize: 9.5, color: C.navy, fontFace: F, shrinkText: true })
      sl.addShape('roundRect' as never, { x: xr + 3.0, y: y + 0.04, w: (meio - 3.7) * v[1] / 6, h: 0.18, fill: { color: C.verm }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(String(v[1]), { x: xr + meio - 0.5, y, w: 0.45, h: 0.28, fontSize: 10, bold: true, color: C.navy, align: 'right', fontFace: F })
    })
    sl.addText('Metodologia: formulário via WhatsApp após o atendimento + entrevista presencial na entrega e na sala de espera · 28/07–14/08 · 61 convidados, 32 respostas (52%).', { x: MG, y: 6.42, w: COL, h: 0.28, fontSize: 9.5, italic: true, color: C.slateClaro, fontFace: F, shrinkText: true })
  }

  /* ════ 04 · PENSAR FORA DA CAIXA (5) ════ */

  /* 4.1 muda comportamento do cliente */
  {
    const sl = slideItem(p, '04 · Pensar Fora da Caixa', 1, 5, 'O trabalho é revolucionário e capaz de mudar o comportamento do cliente', 'O cliente que voltou sem ninguém ligar para ele')
    sl.addShape('roundRect' as never, { x: MG, y: 2.2, w: COL, h: 1.85, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.05 })
    sl.addText('O caso A. Paulo — Bragança', { x: MG + 0.3, y: 2.4, w: COL - 0.6, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: F })
    sl.addText('Comprou uma Fazer 250 em março. Em julho, a régua identificou a R1 vencendo e disparou o lembrete no WhatsApp — sem nenhum humano na fila. Ele agendou pelo link, fez a revisão (R$ 289 de receita) e respondeu a pesquisa: "voltar eu volto se vocês me avisarem da revisão. Da última vez passou do prazo e eu nem vi."', { x: MG + 0.3, y: 2.75, w: COL - 0.6, h: 1.2, fontSize: 11.5, color: C.slate, fontFace: F, lineSpacing: 17, shrinkText: true })
    kpiCards(sl, 4.35, [
      { tag: 'Recontato pós-venda', val: '18% → 74%', sub: 'clientes contatados após a compra', cor: C.verde },
      { tag: 'Retorno à oficina', val: '+31%', sub: 'agendamentos de revisão vs. semestre anterior', cor: C.verde },
      { tag: 'Comportamento novo', val: '59%', sub: 'dizem que voltam se a loja lembrar — e agora ela lembra', cor: C.verde },
    ], 1.5)
  }

  /* 4.2 mudou o processo */
  {
    const sl = slideItem(p, '04 · Pensar Fora da Caixa', 2, 5, 'O trabalho é revolucionário e mudou drasticamente o processo', 'Não digitalizamos o processo antigo — trocamos o processo')
    tabela(sl, 2.15, ['O processo', 'Antes', 'Com Smart Dealer'], [
      [{ t: 'Análise de performance' }, { t: 'horas cruzando planilhas', cor: C.verm, bold: false }, { t: 'PDCA oficial em um clique', cor: C.verde, bold: true }],
      [{ t: 'Lead sem resposta' }, { t: '32% morriam no limbo', cor: C.verm, bold: false }, { t: '2% — régua + escalonamento ao gerente', cor: C.verde, bold: true }],
      [{ t: 'Crédito recusado' }, { t: 'fim da conversa', cor: C.verm, bold: false }, { t: 'oportunidade Liberacred com mensagem-prêmio', cor: C.verde, bold: true }],
      [{ t: 'Circular da montadora' }, { t: 'no e-mail de alguém', cor: C.verm, bold: false }, { t: 'no robô — a loja inteira responde igual', cor: C.verde, bold: true }],
      [{ t: 'Índice Premya' }, { t: 'descoberto na apuração', cor: C.verm, bold: false }, { t: 'acompanhado em curso, com simulador', cor: C.verde, bold: true }],
      [{ t: 'Revisão vencida' }, { t: 'cliente esquecido', cor: C.verm, bold: false }, { t: 'régua R1–R4 dispara sozinha', cor: C.verde, bold: true }],
      [{ t: 'Atualização mensal' }, { t: 'redigitação em cada tela', cor: C.verm, bold: false }, { t: 'planilha publicada uma vez, telas se atualizam', cor: C.verde, bold: true }],
    ], [3.1, 3.6, 4.93], 10.5, 0.5)
  }

  /* 4.3 vantagem competitiva */
  {
    const sl = slideItem(p, '04 · Pensar Fora da Caixa', 3, 5, 'O trabalho gerou uma vantagem competitiva para a Yamaha', 'A vantagem é o COMO — o método Yamaha codificado')
    const chips = ['DOIS RELÓGIOS', 'CARTA VAREJO', 'DECOMPOSIÇÃO MERCADO × SHARE', 'K2 DO DRE', 'KAIZEN', 'CIRCULARES', 'PREMYA', 'LIBERACRED', 'PDCA OFICIAL', 'RÉGUA R1–R4']
    const porLinha = 5, cw = (COL - 0.24 * (porLinha - 1)) / porLinha
    chips.forEach((c2, i) => {
      const col = i % porLinha, row = Math.floor(i / porLinha)
      const x = MG + col * (cw + 0.24), y = 2.25 + row * 0.85
      sl.addShape('roundRect' as never, { x, y, w: cw, h: 0.62, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.31 })
      sl.addText(c2, { x: x + 0.05, y, w: cw - 0.1, h: 0.62, fontSize: 9, bold: true, color: C.azul, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
    })
    callout(sl, 4.2, 'Qualquer um compra software. Ninguém compra o know-how.',
      'As regras que fazem uma concessionária Yamaha performar — carta, campanha, fidelidade ao banco, absorção — só existem codificadas aqui. Replicá-las exige viver a operação, não contratar um dev. Essa foi a resposta que a 1ª banca pediu.', 1.3)
    sl.addText('E o know-how continua rendendo: cada circular nova entra no robô no dia da publicação.', { x: MG, y: 5.75, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 4.4 conhecimento avançado */
  {
    const sl = slideItem(p, '04 · Pensar Fora da Caixa', 4, 5, 'O trabalho resultou em um conhecimento avançado para nosso segmento', 'Método documentado, replicável — e já em uso pela regional')
    cardGrid(sl, 2.2, 2, [
      { tag: 'Método', titulo: 'Decomposição mercado × share', corpo: 'O desvio do mês é demanda da praça ou execução da loja? A pergunta que toda CCY faz — agora com resposta calculada, não achada.' },
      { tag: 'Método', titulo: 'Absorção lida direto do DRE', corpo: 'O K2 deixou de ser conta de padaria: taxa oficial, mês a mês, com o gap para 65% quantificado em reais.' },
      { tag: 'Método', titulo: 'Dois relógios', corpo: 'Carta e varejo no mês corrente; mercado e share no mês fechado. A régua que evita comparar coisas incomparáveis.' },
      { tag: 'Adoção', titulo: 'O consultor da regional já usa', corpo: 'O formato de análise virou o padrão do acompanhamento das 9 CCYs — o conhecimento saiu do grupo e virou prática de rede.', corTag: C.verde },
    ], 1.7)
  }

  /* 4.5 grandes receitas */
  {
    const sl = slideItem(p, '04 · Pensar Fora da Caixa', 5, 5, 'O trabalho gerou grandes receitas', 'Um número-manchete — e a conta aberta')
    sl.addShape('roundRect' as never, { x: MG, y: 2.25, w: COL, h: 1.6, fill: { color: '0E2A1E' }, line: { color: C.verde, width: 1.5 }, rectRadius: 0.06 })
    sl.addText('~R$ 1,1 milhão/ano', { x: MG + 0.4, y: 2.45, w: COL - 0.8, h: 0.75, fontSize: 40, bold: true, color: C.branco, fontFace: F })
    sl.addText('potencial identificado pelo sistema em UMA concessionária — contra R$ 7.200/ano de custo da plataforma', { x: MG + 0.4, y: 3.25, w: COL - 0.8, h: 0.45, fontSize: 13, color: 'A7F3C9', fontFace: F, shrinkText: true })
    kpiCards(sl, 4.15, [
      { tag: 'Campanhas da montadora', val: 'R$ 400 mil', sub: 'prêmios + vouchers por disciplina de carta · R$ 73,5 mil já apurados em julho', cor: C.verde },
      { tag: 'Gap do K2', val: 'R$ 490 mil', sub: 'margem de pós-vendas entre 49,4% e a meta de 65% de absorção', cor: C.verde },
      { tag: 'Premya + Seguros + Consórcio', val: 'R$ 200 mil', sub: 'categoria Ouro + penetração de seguros + Bônus Quality', cor: C.verde },
    ], 1.6)
  }

  /* ════ 05 · TRABALHO EM EQUIPE (2) ════ */

  /* 5.1 equipe do grupo */
  {
    const sl = slideItem(p, '05 · Trabalho em Equipe', 1, 2, 'O trabalho em equipe realizado pelo grupo foi claramente percebido', 'Cinco pessoas, cinco frentes — e a fala revezada')
    cardGrid(sl, 2.2, 5, [
      { titulo: 'Caique Oliveira', corpo: 'dados, método e consultoria de campo — emplacamento, K2, PDCA, circulares' },
      { titulo: 'Klenilson Paiva', corpo: 'narrativa, arquitetura da solução e apresentação' },
      { titulo: 'Evandro', corpo: 'frente comercial — CRM, playbook e cadências' },
      { titulo: 'João Paulo', corpo: 'frente pós-vendas — régua de revisões e retenção' },
      { titulo: 'Camila', corpo: 'frente cliente — pesquisa Voz do Cliente e NPS' },
    ], 2.1)
    callout(sl, 4.65, 'Na 2ª banca, cada um apresenta a própria frente',
      'Foi o critério com a maior distância para o Top 3 na 1ª banca (−0,11) — a divisão de papéis agora é explícita no material e na fala.', 1.05)
  }

  /* 5.2 concessionária + grupo */
  {
    const sl = slideItem(p, '05 · Trabalho em Equipe', 2, 2, 'O trabalho em equipe entre concessionária e grupo foi percebido', 'A Nippon não apoia o projeto. Ela o paga.')
    const pontos: [string, string][] = [
      ['R$ 600/mês do próprio bolso', 'a concessionária paga o piloto — validação com a régua mais dura que existe'],
      ['Uso diário real', 'os dados desta apresentação são da operação, não de ambiente de teste'],
      ['Orientador acompanhando', 'Paulo Lopes segue o projeto e o formato já circula pela regional'],
      ['Depoimento na final', 'vídeo do titular contando o que mudou — combinado para a apresentação final'],
    ]
    pontos.forEach((pt, i) => {
      const y = 2.2 + i * 1.0
      sl.addShape('roundRect' as never, { x: MG, y, w: 5.4, h: 0.88, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(pt[0], { x: MG + 0.2, y: y + 0.1, w: 5.0, h: 0.3, fontSize: 11.5, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addText(pt[1], { x: MG + 0.2, y: y + 0.42, w: 5.0, h: 0.4, fontSize: 9.5, color: C.slate, fontFace: F, lineSpacing: 13, shrinkText: true })
    })
    browserFrame(p, sl, MG + 5.8, 2.2, 5.93, 'dashboard.png')
    sl.addText('A tela que o titular abre todos os dias — carta, ritmo, ranking e Kaizen do grupo.', { x: MG + 5.8, y: 6.1, w: 5.93, h: 0.4, fontSize: 9.5, color: C.slateClaro, fontFace: F })
  }

  /* ════ 06 · VIABILIDADE E IMPACTO (2) ════ */

  /* 6.1 viável em outras CCYs */
  {
    const sl = slideItem(p, '06 · Viabilidade e Impacto', 1, 2, 'O trabalho é viável para implantação em outras concessionárias', 'Replicar é configurar, não reprogramar')
    cardGrid(sl, 2.2, 3, [
      { tag: 'Arquitetura', titulo: 'Multi-grupo desde o dia 1', corpo: 'Os 9 grupos da regional já estão na base de varejo e metas — falta só criar os acessos de cada um.' },
      { tag: 'Custo', titulo: 'SaaS · R$ 600/mês', corpo: 'Sem instalação, sem hardware, sem projeto de TI local. Um prêmio de campanha capturado paga o ano.' },
      { tag: 'Governança', titulo: 'Parametrizável por grupo', corpo: 'Régua, regionalização e cadências são configuração — cada CCY com suas lojas e suas regras.' },
    ], 2.1)
    callout(sl, 4.65, 'Se a diretoria aprovar: rollout regional ainda em 2026',
      'E o YamahaWay terá gerado um padrão nacional — nascido dentro de uma concessionária, validado por esta banca.', 1.05)
  }

  /* 6.2 bons resultados em outras */
  {
    const sl = slideItem(p, '06 · Viabilidade e Impacto', 2, 2, 'Há possibilidade de bons resultados se o trabalho for implementado em outras concessionárias', 'A prova: o método já rodou fora da Nippon')
    const meio = (COL - 0.4) / 2
    sl.addShape('roundRect' as never, { x: MG, y: 2.2, w: meio, h: 3.3, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('NOBRE MOTOS · Caraguatatuba e Mogi', { x: MG + 0.25, y: 2.45, w: meio - 0.5, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: F, shrinkText: true })
    sl.addText('Os PDCAs da NOBRE foram gerados com o mesmo método — decomposição, segmentos, praças — em outro grupo, sem mudar uma linha do sistema. É o argumento de escala mais barato que existe: já aconteceu.', { x: MG + 0.25, y: 2.85, w: meio - 0.5, h: 1.4, fontSize: 11.5, color: C.slate, fontFace: F, lineSpacing: 17 })
    sl.addText('mesmo método · outro grupo · zero adaptação', { x: MG + 0.25, y: 4.9, w: meio - 0.5, h: 0.3, fontSize: 11, bold: true, color: C.verde, fontFace: F })
    const xr = MG + meio + 0.4
    sl.addShape('roundRect' as never, { x: xr, y: 2.2, w: meio, h: 3.3, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.04 })
    sl.addText('O consultor da regional nas 9 CCYs', { x: xr + 0.25, y: 2.45, w: meio - 0.5, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: F, shrinkText: true })
    sl.addText('O formato de análise do Smart Dealer virou o padrão do acompanhamento mensal da regional — os outros 8 grupos já veem os próprios números lidos pelo método antes mesmo de terem acesso ao sistema.', { x: xr + 0.25, y: 2.85, w: meio - 0.5, h: 1.4, fontSize: 11.5, color: C.slate, fontFace: F, lineSpacing: 17 })
    sl.addText('a demanda já existe — falta só o acesso', { x: xr + 0.25, y: 4.9, w: meio - 0.5, h: 0.3, fontSize: 11, bold: true, color: C.azul, fontFace: F })
    sl.addText('Ganhos esperados por CCY no rollout: +8% varejo · +15% conversão de leads · +10% aprovação financeira · +5 pts NPS.', { x: MG, y: 5.85, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* fecho */
  fraseNavy(p, '"Como transformar dados\nem experiências memoráveis?"',
    'O Smart Dealer é mais do que uma plataforma tecnológica.\nÉ um novo padrão de relacionamento entre cliente, concessionária e Yamaha.',
  sl => {
    sl.addText('27 requisitos da Fórmula do Sucesso · 27 entregas — e setembro fecha a campanha e a Meta 1.', { x: W * 0.14, y: 5.45, w: W * 0.72, h: 0.4, fontSize: 13, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
    sl.addText('YAMAHA WAY 2026 · GRUPO 06 SHOGUN RIDERS · NIPPON MOTOS', { x: MG, y: H - 0.6, w: COL, h: 0.3, fontSize: 9.5, color: '3D4F61', align: 'center', charSpacing: 2, fontFace: F })
  })

  await p.writeFile({ fileName: '_NOVAS MELHORIAS/DECK-BANCA-YAMAHAWAY.pptx' })
  console.log('✓ DECK-BANCA-YAMAHAWAY.pptx')
}

async function main() {
  await deckDiretoria()
  await deckBanca()
}
main().catch(e => { console.error(e); process.exit(1) })
