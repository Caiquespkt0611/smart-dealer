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
   Espinha dorsal = a Fórmula do Sucesso: a agenda são os 6 critérios;
   cada critério abre com sua tabela COMPLETA (todos os sub-itens de
   lib/formula-sucesso) e os slides de conteúdo entram onde cabem. */

// corta no fim de frase mais próximo do limite (célula sem picote)
function ate(txt: string, max: number): string {
  if (txt.length <= max) return txt
  const corte = txt.slice(0, max)
  const fim = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('; '), corte.lastIndexOf(' — '))
  if (fim > max * 0.45) return corte.slice(0, fim + 1).trim()
  return corte.slice(0, corte.lastIndexOf(' ')).trim().replace(/[,;:—-]$/, '') + '…'
}

const ST = {
  temos: { rot: 'TEMOS', cor: C.verde, fill: 'E7F6EE' },
  parcial: { rot: 'PARCIAL', cor: C.ambar, fill: 'FCF3E3' },
  falta: { rot: 'FALTA', cor: C.verm, fill: 'FBEAEA' },
} as const

const porNome = (nome: string) => formulaDiagnostico.find(c => c.criterio === nome)!

function tabelaCriterio(sl: Slide, y: number, cr: typeof formulaDiagnostico[number], maxOnde: number, fontSize: number, rowH: number) {
  const rows: CelDef[][] = cr.itens.map(it => {
    const st = ST[it.status as keyof typeof ST]
    return [
      { t: it.item },
      { t: st.rot, cor: st.cor, bold: true, align: 'center' as const, fill: st.fill },
      { t: ate(it.onde, maxOnde), cor: C.slate, bold: false },
    ]
  })
  tabela(sl, y, ['Sub-item do formulário', 'Status', 'Onde está a prova'], rows, [3.9, 0.95, 6.78], fontSize, rowH)
  return y + (cr.itens.length + 1) * rowH
}

function slideCriterio(p: P, chapeu: string, cr: typeof formulaDiagnostico[number], maxOnde: number, fontSize: number, rowH: number) {
  const sl = slideBranco(p, chapeu, cr.criterio,
    `Nota da 1ª banca: ${cr.nota1aBanca.toFixed(2).replace('.', ',')} · todos os ${cr.itens.length} sub-itens do formulário, um a um.`)
  tabelaCriterio(sl, 2.05, cr, maxOnde, fontSize, rowH)
  return sl
}

async function deckBanca() {
  const p = new pptxgen()
  p.defineLayout({ name: 'W', width: W, height: H })
  p.layout = 'W'
  p.author = 'Grupo 06 — Shogun Riders'
  p.title = 'Smart Dealer — 2ª Banca YamahaWay 2026'
  PAG = 0

  /* 1 · capa */
  capa(p, 'Yamaha Way 2026 · 2ª banca · Grupo 06 — Shogun Riders',
    ['Smart ', 'Dealer'],
    'Como transformar dados em experiências memoráveis?\nA Fórmula do Sucesso, critério a critério — com a prova em cada item.',
    'Piloto real: Nippon Motos · Bragança Paulista, Atibaia, Amparo e Extrema')

  /* 2 · agenda = os 6 critérios */
  {
    const sl = slideBranco(p, 'Agenda', 'A Fórmula do Sucesso é o roteiro',
      'Seis critérios, 27 sub-itens — cada seção abre com o formulário completo e mostra a entrega que o preenche.')
    const itens: Card[] = formulaDiagnostico.map((cr, i) => ({
      tag: String(i + 1).padStart(2, '0'),
      titulo: cr.criterio,
      corpo: `nota 1ª banca ${cr.nota1aBanca.toFixed(2).replace('.', ',')} · ${cr.itens.length} sub-itens`,
      corTag: 'B8CDEA',
    }))
    cardGrid(sl, 2.15, 3, itens, 1.75)
  }

  /* 3 · diagnóstico resumo */
  {
    const r = resumoDiagnostico()
    const sl = slideBranco(p, 'O diagnóstico', 'Onde estamos, critério a critério',
      `Os ${r.total} sub-itens auditados um a um. Da 1ª banca para cá: ${r.temos} fechados · ${r.parcial} parciais · ${r.falta} em branco.`)
    let y = 2.2
    formulaDiagnostico.forEach(cr => {
      const t = cr.itens.filter(i => i.status === 'temos').length
      const pa = cr.itens.filter(i => i.status === 'parcial').length
      const fa = cr.itens.filter(i => i.status === 'falta').length
      sl.addText(cr.criterio, { x: MG, y, w: 3.2, h: 0.34, fontSize: 12, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addText(`nota 1ª banca ${cr.nota1aBanca.toFixed(2).replace('.', ',')}`, { x: MG + 3.25, y: y + 0.02, w: 1.75, h: 0.3, fontSize: 9.5, color: C.slateClaro, fontFace: F })
      const x0 = MG + 5.15, wTot = COL - 5.15 - 1.3, n = cr.itens.length
      let x = x0
      const seg = (qtd: number, cor: string) => {
        if (!qtd) return
        const w2 = wTot * qtd / n
        sl.addShape('roundRect' as never, { x, y: y + 0.05, w: w2 - 0.04, h: 0.26, fill: { color: cor }, line: { type: 'none' }, rectRadius: 0.02 })
        x += w2
      }
      seg(t, C.verde); seg(pa, 'E8B04B'); seg(fa, C.verm)
      sl.addText(`${t} · ${pa} · ${fa}`, { x: W - MG - 1.25, y: y + 0.02, w: 1.25, h: 0.3, fontSize: 10.5, bold: true, color: C.slate, align: 'right', fontFace: F })
      y += 0.56
    })
    y += 0.15
    const legenda: [string, string][] = [['temos', C.verde], ['parcial', 'E8B04B'], ['em branco', C.verm]]
    let lx = MG + 5.15
    legenda.forEach(([rot, cor]) => {
      sl.addShape('roundRect' as never, { x: lx, y: y + 0.05, w: 0.18, h: 0.18, fill: { color: cor }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(rot, { x: lx + 0.24, y, w: 1.1, h: 0.28, fontSize: 10, color: C.slate, fontFace: F })
      lx += 1.35
    })
    callout(sl, y + 0.4, 'Os 6 itens que estavam EM BRANCO na 1ª banca foram fechados',
      'Pesquisa com clientes · fatores de compra · hipóteses · objetivo mensurável · posicionamento · 7 passos. Nas próximas seções, cada critério aberto item a item.', 1.0, C.verdeBg)
  }

  /* 4 · o sistema, ao vivo */
  {
    const sl = p.addSlide()
    sl.background = { color: C.navy }
    sl.addImage({ path: `${ASSETS}/bg-produto.png`, x: 0, y: 0, w: W, h: H })
    sl.addText('O DIAGNÓSTICO', { x: MG, y: 0.55, w: COL, h: 0.26, fontSize: 11, bold: true, color: C.ciano, charSpacing: 1.5, fontFace: F })
    sl.addText('A prova mora no sistema — em produção', { x: MG, y: 0.85, w: COL, h: 0.62, fontSize: 30, bold: true, color: C.branco, fontFace: F, shrinkText: true })
    sl.addText('Telas reais, dados reais da Nippon — na banca, a demonstração é ao vivo, trocando de login por papel.', { x: MG, y: 1.55, w: COL, h: 0.3, fontSize: 13, color: C.azulClaro, fontFace: F })
    browserFrame(p, sl, MG, 2.25, 5.72, 'dashboard.png')
    browserFrame(p, sl, MG + 5.95, 2.25, 5.72, 'pesquisa.png')
    sl.addText('Dashboard do titular — carta, ritmo, ranking e Kaizen', { x: MG, y: 6.05, w: 5.72, h: 0.3, fontSize: 9.5, color: C.slateClaro, fontFace: F })
    sl.addText('Voz do Cliente — a pesquisa própria virou módulo do sistema', { x: MG + 5.95, y: 6.05, w: 5.72, h: 0.3, fontSize: 9.5, color: C.slateClaro, fontFace: F })
    PAG++
    sl.addText(String(PAG).padStart(2, '0'), { x: W - MG - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontSize: 10, bold: true, color: '3D4F61', align: 'right', fontFace: F })
  }

  /* ── 01 · PESQUISA ── */
  slideCriterio(p, '01 · Pesquisa · o formulário', porNome('Pesquisa'), 210, 10, 0.88)

  /* 01 · hipóteses */
  {
    const sl = slideBranco(p, '01 · Pesquisa', 'Três hipóteses testáveis — e a medida de cada uma',
      'Fecha o sub-item "hipóteses claras a partir das análises": formato "se X, então Y — medido por Z".')
    let y = 2.1
    materiaisProntos.hipoteses.itens.forEach(h2 => {
      const [hip, medida] = h2.split(' Medida: ')
      sl.addShape('roundRect' as never, { x: MG, y, w: COL, h: 1.28, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(hip, { x: MG + 0.26, y: y + 0.16, w: COL - 0.52, h: 0.62, fontSize: 12.5, bold: true, color: C.navy, fontFace: F, valign: 'top', lineSpacing: 16, shrinkText: true })
      sl.addText('MEDIDA: ' + (medida ?? ''), { x: MG + 0.26, y: y + 0.85, w: COL - 0.52, h: 0.34, fontSize: 10, bold: true, color: C.azul, fontFace: F, shrinkText: true })
      y += 1.45
    })
    sl.addText('H1 já tem resultado: SLA ≤10 min subiu de 22% para 81% — e a conversão foi de 8,1% para 13,9%.', { x: MG, y: y + 0.15, w: COL, h: 0.32, fontSize: 12, italic: true, color: C.verde, align: 'center', fontFace: F })
  }

  /* 01 · benchmark */
  {
    const sl = slideBranco(p, '01 · Pesquisa', 'Concorrentes da solução: o que só o Smart Dealer tem',
      'Fecha o sub-item "análises dos concorrentes" — a vantagem competitiva é o método Yamaha codificado; o software é o veículo.')
    tabela(sl, 2.2, ['', 'CRM genérico', 'DMS da loja', 'Planilhas', 'Smart Dealer'], [
      [{ t: 'Regras Yamaha (carta, Kaizen, K2, circular)' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'manual', align: 'center' }, { t: 'codificadas', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'PDCA no formato oficial da regional' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'horas', align: 'center' }, { t: 'um clique', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Liberacred: recusa vira oportunidade' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'automático', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Premya acompanhado em curso' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'simulador', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Circulares no assistente de IA' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'no robô', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Custo mensal por concessionária' }, { t: 'R$ 800–2.500', align: 'center' }, { t: 'já pago, não analisa', align: 'center' }, { t: '"grátis" e caro', align: 'center' }, { t: 'R$ 600', cor: C.verde, bold: true, align: 'center' }],
    ], [4.4, 1.75, 1.85, 1.7, 1.93], 10.5, 0.52)
  }

  /* ── 02 · PLANEJAMENTO E OBJETIVOS ── */
  slideCriterio(p, '02 · Planejamento e Objetivos · o formulário', porNome('Planejamento e Objetivos'), 165, 9.5, 0.7)

  /* 02 · objetivo + metas */
  {
    const sl = slideBranco(p, '02 · Planejamento e Objetivos', 'Um objetivo. Três metas públicas. Sempre as mesmas.',
      'Fecha "objetivo claro e definido" e "objetivo mensurável" — o sistema mede as três ao vivo.')
    callout(sl, 2.0, 'O objetivo do trabalho — uma frase, repetida em todo material', materiaisProntos.objetivo.texto, 1.1)
    const metas: [string, string, string][] = [
      ['Meta 1 · Carta', '≥ 100%', 'em setembro/2026 — julho fechou em 90,0% e o prêmio da campanha está em jogo'],
      ['Meta 2 · Absorção', '65%', 'até dezembro/2026 — saímos de 30% e já estamos em 49,4% (K2 lido do DRE)'],
      ['Meta 3 · Lead', '≤ 10 min', 'padrão de atendimento — hoje 81% dentro do SLA; era 22% antes do piloto'],
    ]
    const gap = 0.22, mw = (COL - gap * 2) / 3
    metas.forEach((m, i) => {
      const x = MG + i * (mw + gap)
      sl.addShape('roundRect' as never, { x, y: 3.4, w: mw, h: 2.15, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(m[0].toUpperCase(), { x: x + 0.24, y: 3.6, w: mw - 0.48, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
      sl.addText(m[1], { x: x + 0.24, y: 3.87, w: mw - 0.48, h: 0.6, fontSize: 30, bold: true, color: C.verde, fontFace: F })
      sl.addText(m[2], { x: x + 0.24, y: 4.53, w: mw - 0.48, h: 0.9, fontSize: 10.5, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 14, shrinkText: true })
    })
    sl.addText('A meta virou compromisso público, não promessa — convidamos a banca a cobrar o resultado na final.', { x: MG, y: 5.9, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* ── 03 · FOCO NO CLIENTE ── */
  slideCriterio(p, '03 · Foco no Cliente · o formulário', porNome('Foco no Cliente'), 130, 9, 0.56)

  /* 03 · voz do cliente */
  {
    const sl = slideBranco(p, '03 · Foco no Cliente', 'Pesquisa Voz do Cliente — feita pelo grupo, com clientes reais',
      'Fecha "pesquisas com clientes": 28/07 a 14/08 · WhatsApp + presencial · 32 respostas (52% de adesão).')
    kpiCards(sl, 2.15, [
      { tag: 'Amostra', val: '32', sub: '18 compraram · 14 não compraram' },
      { tag: 'Satisfação', val: '4,5 / 5', sub: 'era 3,6 antes do piloto', cor: C.verde },
      { tag: 'NPS da pesquisa', val: '72', sub: 'promotores − detratores', cor: C.verde },
      { tag: 'Respondido em 10 min', val: '81%', sub: 'era 22% — confirmado pelo cliente', cor: C.verde },
    ], 1.5)
    const falas = [
      ['"Me responderam em uns cinco minutos. Na outra loja eu esperei dois dias e desisti."', 'C. Eduardo · Bragança · comprou'],
      ['"Meu crédito não passou e ninguém mais me procurou. Se tivessem uma segunda opção eu tinha fechado."', 'J. Vitor · Extrema · não comprou'],
      ['"O que me convenceu foi a parcela. O vendedor já veio com a simulação pronta, nem precisei pedir."', 'M. Aparecida · Amparo · comprou'],
    ]
    const fw = (COL - 0.44) / 3
    falas.forEach((f2, i) => {
      const x = MG + i * (fw + 0.22)
      sl.addShape('roundRect' as never, { x, y: 4.05, w: fw, h: 1.95, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(f2[0], { x: x + 0.22, y: 4.25, w: fw - 0.44, h: 1.25, fontSize: 11, italic: true, color: C.navy, fontFace: F, valign: 'top', lineSpacing: 15, shrinkText: true })
      sl.addText(f2[1], { x: x + 0.22, y: 5.6, w: fw - 0.44, h: 0.28, fontSize: 9.5, bold: true, color: C.azul, fontFace: F, shrinkText: true })
    })
    sl.addText('43% dos que não compraram travaram no crédito — exatamente o público que o módulo Liberacred devolve à mesa.', { x: MG, y: 6.25, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 03 · fatores + retorno + posicionamento */
  {
    const sl = slideBranco(p, '03 · Foco no Cliente', 'O que decide a compra — e o que faz o cliente voltar',
      'Fecha "fatores de compra" e "posicionamento": medidos na pesquisa, cada fator ligado ao módulo que o atende.')
    const fatores: [string, number, string][] = [
      ['Parcela que cabe no bolso', 72, 'simulador + bônus da circular na proposta'],
      ['Atendimento rápido', 66, 'SLA de 10 minutos governado no CRM'],
      ['Aprovação do crédito', 56, 'BYMD primeiro + resgate Liberacred'],
      ['Preço / valor da entrada', 47, 'vouchers da montadora aplicados'],
      ['Confiança / indicação', 38, 'NPS + régua de pós-venda'],
    ]
    sl.addText('FATORES DE COMPRA', { x: MG, y: 2.05, w: 6, h: 0.24, fontSize: 10, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
    fatores.forEach((f2, i) => {
      const y = 2.45 + i * 0.62
      sl.addText(f2[0], { x: MG, y, w: 2.75, h: 0.5, fontSize: 10.5, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addShape('roundRect' as never, { x: MG + 2.9, y: y + 0.03, w: 3.4, h: 0.3, fill: { color: C.linha }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addShape('roundRect' as never, { x: MG + 2.9, y: y + 0.03, w: 3.4 * f2[1] / 100, h: 0.3, fill: { color: C.azul }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(`${f2[1]}%`, { x: MG + 6.38, y, w: 0.62, h: 0.34, fontSize: 11, bold: true, color: C.navy, fontFace: F })
      sl.addText(f2[2], { x: MG + 2.9, y: y + 0.36, w: 4.1, h: 0.22, fontSize: 8.5, color: C.slateClaro, fontFace: F, shrinkText: true })
    })
    const xr = MG + 7.45, wr = COL - 7.45
    sl.addText('O QUE FARIA VOCÊ VOLTAR', { x: xr, y: 2.05, w: wr, h: 0.24, fontSize: 10, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
    const volta: [string, string][] = [
      ['59% · a loja lembrar da revisão por mim', 'é a régua automática do pós-vendas'],
      ['53% · contato pós-compra', 'recontato subiu de 18% para 74% no piloto'],
      ['44% · oferta certa na hora da troca', 'módulo de quitação sugere o upgrade'],
    ]
    volta.forEach((v, i) => {
      const y = 2.45 + i * 1.05
      sl.addShape('roundRect' as never, { x: xr, y, w: wr, h: 0.92, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(v[0], { x: xr + 0.2, y: y + 0.12, w: wr - 0.4, h: 0.32, fontSize: 11, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addText(v[1], { x: xr + 0.2, y: y + 0.46, w: wr - 0.4, h: 0.34, fontSize: 9.5, color: C.slate, fontFace: F, shrinkText: true })
    })
    callout(sl, 5.85, 'Posicionamento que nasce da pesquisa', materiaisProntos.posicionamento.texto, 1.05)
  }

  /* 03 · 7 passos */
  {
    const sl = slideBranco(p, '03 · Foco no Cliente', 'Os 7 passos da venda — e onde o sistema atua em cada um',
      'Fecha "os 7 passos foram claramente descritos" — dois passos demonstrados ao vivo na banca.')
    tabela(sl, 2.1,
      ['Passo da venda Yamaha', 'Onde o Smart Dealer atua'],
      materiaisProntos.seteSteps.passos.map(ps => [{ t: ps.passo }, { t: ps.atua, bold: false }]),
      [3.5, 8.13], 10.5, 0.58)
  }

  /* ── 04 · PENSAR FORA DA CAIXA ── */
  slideCriterio(p, '04 · Pensar Fora da Caixa · o formulário', porNome('Pensar Fora da Caixa'), 190, 9.5, 0.82)

  /* 04 · com/sem */
  {
    const sl = slideBranco(p, '04 · Pensar Fora da Caixa', 'Não digitalizamos o processo antigo — trocamos o processo')
    tabela(sl, 2.0, ['O processo', 'Antes', 'Com Smart Dealer'], [
      [{ t: 'Análise de performance' }, { t: 'horas cruzando planilhas', cor: C.verm }, { t: 'PDCA oficial em um clique', cor: C.verde, bold: true }],
      [{ t: 'Lead sem resposta' }, { t: '32% morriam no limbo', cor: C.verm }, { t: '2% — régua + escalonamento ao gerente', cor: C.verde, bold: true }],
      [{ t: 'Crédito recusado' }, { t: 'fim da conversa', cor: C.verm }, { t: 'oportunidade Liberacred com mensagem-prêmio', cor: C.verde, bold: true }],
      [{ t: 'Circular da montadora' }, { t: 'no e-mail de alguém', cor: C.verm }, { t: 'no robô — a loja inteira responde igual', cor: C.verde, bold: true }],
      [{ t: 'Índice Premya' }, { t: 'descoberto na apuração', cor: C.verm }, { t: 'acompanhado em curso, com simulador', cor: C.verde, bold: true }],
      [{ t: 'Revisão vencida' }, { t: 'cliente esquecido', cor: C.verm }, { t: 'régua R1–R4 dispara sozinha', cor: C.verde, bold: true }],
      [{ t: 'Atualização mensal' }, { t: 'redigitação em cada tela', cor: C.verm }, { t: 'planilha publicada uma vez, telas se atualizam', cor: C.verde, bold: true }],
    ], [3.1, 3.6, 4.93], 10.5, 0.5)
    sl.addText('O conhecimento virou método replicável: decomposição mercado × share, absorção lida do DRE, dois relógios.', { x: MG, y: 6.15, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* ── 05 · TRABALHO EM EQUIPE (formulário + quem fez o quê) ── */
  {
    const cr = porNome('Trabalho em Equipe')
    const sl = slideBranco(p, '05 · Trabalho em Equipe · o formulário', cr.criterio,
      `Nota da 1ª banca: ${cr.nota1aBanca.toFixed(2).replace('.', ',')} · os ${cr.itens.length} sub-itens do formulário + a divisão de papéis explícita.`)
    let y = tabelaCriterio(sl, 2.0, cr, 150, 9.5, 0.66) + 0.3
    const time: [string, string][] = [
      ['Caique Oliveira', 'dados, método e consultoria de campo'],
      ['Klenilson Paiva', 'narrativa e arquitetura da solução'],
      ['Evandro', 'frente comercial — CRM e cadências'],
      ['João Paulo', 'frente pós-vendas — régua e retenção'],
      ['Camila', 'frente cliente — pesquisa e NPS'],
    ]
    const gap = 0.18, tw = (COL - gap * 4) / 5
    time.forEach((t, i) => {
      const x = MG + i * (tw + gap)
      sl.addShape('roundRect' as never, { x, y, w: tw, h: 1.35, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(t[0], { x: x + 0.14, y: y + 0.14, w: tw - 0.28, h: 0.5, fontSize: 11, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addText(t[1], { x: x + 0.14, y: y + 0.62, w: tw - 0.28, h: 0.66, fontSize: 9, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 12, shrinkText: true })
    })
    sl.addText('Fala revezada na banca · a Nippon paga o piloto e usa no dia a dia · orientador Paulo Lopes · vídeo do titular na final.', { x: MG, y: y + 1.55, w: COL, h: 0.3, fontSize: 11.5, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* ── 06 · VIABILIDADE E IMPACTO (formulário + escala) ── */
  {
    const cr = porNome('Viabilidade e Impacto')
    const sl = slideBranco(p, '06 · Viabilidade e Impacto · o formulário', cr.criterio,
      `Nota da 1ª banca: ${cr.nota1aBanca.toFixed(2).replace('.', ',')} · os ${cr.itens.length} sub-itens do formulário + a prova de replicabilidade.`)
    let y = tabelaCriterio(sl, 2.0, cr, 150, 9.5, 0.66) + 0.3
    cardGrid(sl, y, 2, [
      { tag: 'Prontos para escalar', titulo: 'Os 9 grupos da regional já estão na base', corpo: 'SaaS sem instalação, R$ 600/mês — replicar é configurar, não reprogramar. Governança parametrizável por grupo.' },
      { tag: 'Prova de replicabilidade', titulo: 'O método já rodou fora da Nippon', corpo: 'PDCAs da NOBRE Motos (Caraguatatuba e Mogi): mesmo método, outro grupo, sem mudar uma linha.', corTag: C.verde },
    ], 1.5)
  }

  /* 06 · resultados do piloto */
  {
    const sl = slideBranco(p, '06 · Viabilidade e Impacto', 'O que o piloto já produziu',
      'Fecha "o trabalho gerou grandes receitas" — números da operação real, com fonte.')
    kpiCards(sl, 2.1, [
      { tag: 'Campanha Campeões', val: 'R$ 7.500', sub: 'garantidos em julho (90,0% da carta) + R$ 15 mil recuperáveis', cor: C.verde },
      { tag: 'Vouchers por modelo', val: 'R$ 66 mil', sub: 'apurados em julho; com Campeões, R$ 73,5 mil', cor: C.verde },
      { tag: 'Absorção', val: '+19 p.p.', sub: 'de 30% para 49,4% — gap para 65% quantificado', cor: C.verde },
      { tag: 'Conversão de leads', val: '8,1 → 13,9%', sub: 'com SLA de 10 minutos governado', cor: C.verde },
    ], 1.6)
    callout(sl, 4.1, 'Potencial anual identificado pelo sistema: cerca de R$ 1,1 milhão',
      'Prêmios de campanha (~R$ 400 mil) + gap de absorção do K2 (~R$ 490 mil) + Premya, Seguros e Consórcio (~R$ 200 mil) — em uma única concessionária.', 1.25, C.verdeBg)
    callout(sl, 5.6, 'A prova do compromisso',
      'Setembro fecha a campanha e a Meta 1. Convidamos a banca a cobrar o resultado na apresentação final — o número estará na tela, ao vivo.', 1.0)
  }

  /* fecho */
  fraseNavy(p, '"Como transformar dados\nem experiências memoráveis?"',
    'O Smart Dealer é mais do que uma plataforma tecnológica.\nÉ um novo padrão de relacionamento entre cliente, concessionária e Yamaha.',
  sl => {
    sl.addText('Setembro fecha a campanha e a Meta 1 — cobrem o resultado na apresentação final.', { x: W * 0.14, y: 5.45, w: W * 0.72, h: 0.4, fontSize: 13, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
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
