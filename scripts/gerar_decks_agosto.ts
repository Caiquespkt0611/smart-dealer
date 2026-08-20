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

/* ═══════════════════ DECK 1 · DIRETORIA ═══════════════════ */
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

  /* 2 · agenda */
  {
    const sl = slideBranco(p, 'Agenda', 'O que vamos ver')
    const itens: Card[] = [
      { tag: '01', titulo: 'O contexto', corpo: 'O cliente mudou; os dados existem, a inteligência não' },
      { tag: '02', titulo: 'O piloto', corpo: 'Smart Dealer rodando de verdade na Nippon Motos' },
      { tag: '03', titulo: 'As novas frentes', corpo: 'Banco Yamaha, Premya, Seguros, Consórcio e CRM governado' },
      { tag: '04', titulo: 'A voz do cliente', corpo: 'Pesquisa com clientes reais: o que decide a compra' },
      { tag: '05', titulo: 'O retorno', corpo: 'Payback mensurável e a jornada completa do cliente' },
      { tag: '06', titulo: 'A escala', corpo: 'Do piloto ao rollout regional, nacional e além' },
    ]
    itens.forEach(i2 => { i2.corTag = 'B8CDEA' })
    cardGrid(sl, 2.15, 3, itens, 1.75)
  }

  /* 3 · a pergunta */
  fraseNavy(p, 'A Yamaha conhece seus clientes tão bem\nquanto Amazon, Netflix ou Nubank?',
    'O padrão de comparação do cliente não é outra concessionária.\nÉ a melhor experiência digital que ele já teve.')

  /* 4 · o problema */
  {
    const sl = slideBranco(p, '01 · O contexto', 'Os dados existem. A inteligência, não.',
      'O que se perde todos os dias, em todas as concessionárias — porque nenhum sistema conversa com o outro.')
    cardGrid(sl, 2.15, 3, [
      { titulo: 'Crédito recusado', corpo: 'O cliente nunca mais é procurado — mesmo quando o Liberacred já o aprovou de novo.' },
      { titulo: 'Aprovado não pago', corpo: 'A proposta aprovada fica parada semanas. A venda já estava ganha; ninguém cobra o desfecho.' },
      { titulo: 'Contrato quitando', corpo: 'O cliente volta ao mercado em silêncio. Quem chama primeiro leva — hoje é o concorrente.' },
      { titulo: 'Frota sem seguro', corpo: 'Milhares de motos vendidas rodando sem apólice. Renovação é receita que evapora.' },
      { titulo: 'Revisão vencida', corpo: 'O cliente esquece, a oficina não avisa — e a absorção do pós-vendas fica no papel.' },
      { titulo: 'Circular no e-mail', corpo: 'A condição de campanha mora na caixa de entrada de alguém. A loja responde errado ou não responde.' },
    ], 1.62)
    sl.addText('Análises que hoje levam de 30 minutos a 3 horas — quando alguém tem tempo de fazer.', { x: MG, y: 6.15, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 5 · o piloto */
  {
    const sl = slideBranco(p, '02 · O piloto', 'Não é conceito: está rodando na Nippon Motos',
      '4 lojas · 25 módulos em produção · pago pela própria concessionária (R$ 600/mês) · acompanhado pela regional')
    kpiCards(sl, 2.15, [
      { tag: 'Carta de julho', val: '90,0%', sub: '144 de 160 motos — R$ 7.500 garantidos na campanha', cor: C.verde },
      { tag: 'Absorção pós-vendas', val: '30 → 49%', sub: 'rumo à meta de 65%, lida direto do DRE', cor: C.verde },
      { tag: '1ª resposta ao lead', val: '3h47 → 8min', sub: '81% dos leads atendidos em até 10 minutos', cor: C.verde },
      { tag: 'Satisfação', val: '3,6 → 4,5', sub: 'pesquisa com clientes antes × depois do piloto', cor: C.verde },
    ], 1.6)
    callout(sl, 4.2, 'O PDCA que levava horas sai em um clique — no formato oficial da Yamaha',
      'Decomposição mercado × share, segmentos, praças e invasão de território viram plano de ação automaticamente. A planilha de emplacamento é publicada uma vez por mês e todas as telas se atualizam sozinhas.', 1.3)
    sl.addText('Os 9 grupos da regional já estão na base de dados — a estrutura multi-grupo existe desde o primeiro dia.', { x: MG, y: 5.85, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 5b · a plataforma, ao vivo */
  {
    const sl = p.addSlide()
    sl.background = { color: C.navy }
    sl.addImage({ path: `${ASSETS}/bg-produto.png`, x: 0, y: 0, w: W, h: H })
    sl.addText('02 · O PILOTO', { x: MG, y: 0.55, w: COL, h: 0.26, fontSize: 11, bold: true, color: C.ciano, charSpacing: 1.5, fontFace: F })
    sl.addText('A plataforma, ao vivo', { x: MG, y: 0.85, w: COL, h: 0.62, fontSize: 30, bold: true, color: C.branco, fontFace: F })
    sl.addText('Telas reais do sistema em produção — o que o titular da Nippon abre todos os dias.', { x: MG, y: 1.55, w: COL, h: 0.3, fontSize: 13, color: C.azulClaro, fontFace: F })
    browserFrame(p, sl, MG + 1.05, 2.15, 9.6, 'performance.png')
    PAG++
    sl.addText(String(PAG).padStart(2, '0'), { x: W - MG - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontSize: 10, bold: true, color: '3D4F61', align: 'right', fontFace: F })
  }

  /* 6 · banco yamaha */
  {
    const sl = slideBranco(p, '03 · As novas frentes', 'Banco Yamaha: recusado não é fim de linha',
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

  /* 7 · premya */
  {
    const sl = slideBranco(p, '03 · As novas frentes', 'Premya: quanto vale a fidelidade, em reais',
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

  /* 8 · seguros e consórcio */
  {
    const sl = slideBranco(p, '03 · As novas frentes', 'Seguros e Consórcio: receita que já é sua',
      'Duas carteiras que rendem sem depender de venda nova — hoje invisíveis para a operação.')
    const meio = COL / 2 - 0.11
    sl.addText('YAMAHA SEGUROS', { x: MG, y: 2.05, w: meio, h: 0.25, fontSize: 10.5, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
    sl.addText('CONSÓRCIO', { x: MG + meio + 0.22, y: 2.05, w: meio, h: 0.25, fontSize: 10.5, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
    const cards = (x: number, itens: Card[]) => itens.forEach((c, i) => {
      const yy = 2.4 + i * 1.32
      sl.addShape('roundRect' as never, { x, y: yy, w: meio, h: 1.18, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(c.titulo, { x: x + 0.24, y: yy + 0.14, w: meio - 0.48, h: 0.3, fontSize: 13, bold: true, color: C.navy, fontFace: F, shrinkText: true })
      sl.addText(c.corpo ?? '', { x: x + 0.24, y: yy + 0.46, w: meio - 0.48, h: 0.62, fontSize: 10.5, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 14, shrinkText: true })
    })
    cards(MG, [
      { titulo: 'Penetração 33,6% · meta 45%', corpo: '110 motos × 37 seguros em julho. A fila de vendas sem seguro vira oferta na entrega técnica.' },
      { titulo: 'Frota circulante: 2.840 motos', corpo: 'Só 618 com apólice ativa. 141 renovações no radar agora — ninguém estava olhando.' },
      { titulo: '+R$ 39 mil/ano fechando o gap', corpo: 'Comissão adicional estimada só de atingir a meta de penetração.' },
    ])
    cards(MG + meio + 0.22, [
      { titulo: 'Carteira: 486 cotas ativas', corpo: 'R$ 10,4 milhões em crédito · retenção de 94,5% · cotas em risco com ação de resgate.' },
      { titulo: 'Bônus Quality garantido', corpo: 'Adimplência 91,4% e cancelamento 8,7% → R$ 11,8 mil no trimestre. O sistema vigia os critérios.' },
      { titulo: 'Contemplado compra aqui', corpo: '81% de conversão — alerta ao vendedor na semana da assembleia.' },
    ])
  }

  /* 9 · CRM governado */
  {
    const sl = slideBranco(p, '03 · As novas frentes', 'CRM com cobrança configurada, não com boa vontade',
      'Mesma equipe, mesmos leads — o que mudou foi a governança: régua, escalonamento ao gerente e redistribuição.')
    const ganhos: [string, string, string][] = [
      ['1ª resposta', '3h 47min', '8 min'],
      ['SLA de 10 minutos', '22%', '81%'],
      ['Conversão de leads', '8,1%', '13,9%'],
      ['Leads sem resposta', '32%', '2%'],
      ['Follow-up cumprido', '41%', '94%'],
    ]
    ganhos.forEach((g, i) => {
      const y = 2.1 + i * 0.62
      sl.addShape('roundRect' as never, { x: MG, y, w: 5.35, h: 0.54, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(g[0], { x: MG + 0.2, y: y + 0.12, w: 2.3, h: 0.3, fontSize: 11, bold: true, color: C.navy, fontFace: F })
      sl.addText(g[1], { x: MG + 2.6, y: y + 0.14, w: 1.15, h: 0.28, fontSize: 11, color: C.slateClaro, strike: true, fontFace: F })
      sl.addText('→', { x: MG + 3.7, y: y + 0.13, w: 0.35, h: 0.28, fontSize: 11, bold: true, color: C.azulClaro, fontFace: F })
      sl.addText(g[2], { x: MG + 4.05, y: y + 0.08, w: 1.15, h: 0.38, fontSize: 15, bold: true, color: C.verde, fontFace: F })
    })
    sl.addShape('roundRect' as never, { x: MG, y: 5.35, w: 5.35, h: 1.15, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.03 })
    sl.addText('A régua que sustenta os números', { x: MG + 0.22, y: 5.48, w: 4.9, h: 0.26, fontSize: 11, bold: true, color: C.navy, fontFace: F })
    sl.addText('10 min: SLA vermelho no painel · 15 min: sobe ao gerente · 2 h: redistribui · D+1/D+3/D+7: follow-ups com roteiro. Cada perda alimenta uma frente (crédito recusado → Liberacred).', { x: MG + 0.22, y: 5.76, w: 4.9, h: 0.66, fontSize: 9.5, color: C.slate, fontFace: F, lineSpacing: 13, shrinkText: true })
    browserFrame(p, sl, MG + 5.75, 2.15, 5.98, 'crmconfig.png')
    sl.addText('Governança publicada: hierarquia de cobrança, régua, regionalização e cadências — parametrizável por grupo.', { x: MG + 5.75, y: 6.1, w: 5.98, h: 0.5, fontSize: 9.5, color: C.slateClaro, fontFace: F, lineSpacing: 13 })
  }

  /* 10 · IA */
  {
    const sl = slideBranco(p, '03 · As novas frentes', 'Um chat universal para toda a operação',
      'Claude (Anthropic) raciocina sobre os dados da concessionária e as regras da Yamaha — cada papel pergunta no seu idioma.')
    cardGrid(sl, 2.15, 2, [
      { tag: 'Vendedor', titulo: '"Qual o bônus da NMAX este mês?"', corpo: 'O robô já leu as circulares CA-MTC028 a 033: responde valor, custeio e regra de acúmulo na hora.' },
      { tag: 'Mecânico', titulo: '"Procedimento de revisão dos 6.000 km da Fazer 250?"', corpo: 'Consulta o manual técnico oficial e responde com a seção citada.' },
      { tag: 'Gerente', titulo: '"Onde estou perdendo share?"', corpo: 'Cruza emplacamento, segmentos e concorrentes — resposta com números e fonte.' },
      { tag: 'Financeiro', titulo: '"Quais aprovados não foram pagos?"', corpo: 'Lista clientes, motivo e ação sugerida — direto da base do Banco.' },
    ], 1.55)
    callout(sl, 5.65, 'Novidade de agosto: a circular entra no robô no dia em que é publicada',
      'A rede inteira responde igual, sem depender da memória de ninguém.', 0.95)
  }

  /* 11 · voz do cliente */
  {
    const sl = slideBranco(p, '04 · A voz do cliente', 'Fatores de compra medidos, não achados',
      'Pesquisa própria com 32 clientes da Nippon (18 compraram, 14 não) · 28/07 a 14/08 · formulário WhatsApp + presencial.')
    kpiCards(sl, 2.15, [
      { tag: 'Satisfação', val: '4,5 / 5', sub: '"como foi ser atendido?"', cor: C.verde },
      { tag: 'NPS da pesquisa', val: '72', sub: 'promotores − detratores' },
      { tag: 'Decide a compra', val: 'parcela 72%', sub: 'depois: rapidez 66% · crédito 56%' },
      { tag: 'Não comprou por quê?', val: 'crédito 43%', sub: 'exatamente o público do Liberacred', cor: C.ambar },
    ], 1.5)
    const falas = [
      ['"Me responderam em uns cinco minutos. Na outra loja eu esperei dois dias e desisti."', 'C. Eduardo · comprou'],
      ['"Meu crédito não passou e ninguém mais me procurou. Se tivessem uma segunda opção eu tinha fechado."', 'J. Vitor · não comprou'],
      ['"Voltar eu volto se vocês me avisarem da revisão. Da última vez passou do prazo e eu nem vi."', 'A. Paulo · comprou'],
    ]
    const fw = (COL - 0.44) / 3
    falas.forEach((f2, i) => {
      const x = MG + i * (fw + 0.22)
      sl.addShape('roundRect' as never, { x, y: 4.05, w: fw, h: 1.9, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(f2[0], { x: x + 0.22, y: 4.25, w: fw - 0.44, h: 1.2, fontSize: 11, italic: true, color: C.navy, fontFace: F, valign: 'top', lineSpacing: 15, shrinkText: true })
      sl.addText(f2[1], { x: x + 0.22, y: 5.55, w: fw - 0.44, h: 0.28, fontSize: 9.5, bold: true, color: C.azul, fontFace: F })
    })
    sl.addText('Cada dor citada tem um módulo respondendo: rapidez → SLA de 10 min · crédito → Liberacred · revisão → régua automática.', { x: MG, y: 6.2, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 12 · retorno */
  {
    const sl = slideBranco(p, '05 · O retorno', 'Payback mensurável — números do piloto, anualizados')
    kpiCards(sl, 2.0, [
      { tag: 'Campanhas da montadora', val: '~R$ 400 mil/ano', sub: 'prêmios e vouchers capturados por disciplina de carta', cor: C.verde },
      { tag: 'Gap de absorção (K2)', val: '~R$ 490 mil/ano', sub: 'margem de pós-vendas para chegar aos 65%', cor: C.verde },
      { tag: 'Premya · Seguros · Consórcio', val: '~R$ 200 mil/ano', sub: 'categoria Ouro + gap de penetração + Bônus Quality', cor: C.verde },
    ], 1.6)
    callout(sl, 4.0, 'Potencial identificado pelo sistema: cerca de R$ 1,1 milhão por ano — em uma única concessionária',
      'Contra um custo de operação de R$ 600/mês (SaaS, sem instalação, sem hardware, sem projeto de TI local). Um único prêmio de campanha capturado paga o ano inteiro.', 1.3, C.verdeBg)
    cardGrid(sl, 5.6, 3, [
      { titulo: '+8% varejo · +15% leads', corpo: 'SLA + governança + campanha aplicada na proposta' },
      { titulo: '+10% aprovação financeira', corpo: 'submissão disciplinada ao BYMD + resgate Liberacred' },
      { titulo: '+5 pts NPS e fidelização', corpo: 'régua de revisão + recompra na quitação' },
    ], 1.15)
  }

  /* 13 · jornada */
  {
    const sl = slideBranco(p, '05 · O retorno', 'A moto a vida inteira',
      'O ciclo completo que nunca devolve o cliente ao mercado — cada etapa alimenta a seguinte com dados.')
    const etapas: [string, string][] = [
      ['Lead', 'resposta em 10 min'],
      ['Venda', 'campanha da circular'],
      ['Financiamento', 'BYMD primeiro (Premya)'],
      ['Seguro', 'ofertado na entrega'],
      ['Revisões', 'régua R1 a R4'],
      ['Quitação', 'score de recompra'],
      ['Nova venda', 'o ciclo recomeça'],
    ]
    const gap = 0.34, ew = (COL - gap * 6) / 7
    etapas.forEach((e, i) => {
      const x = MG + i * (ew + gap)
      const ultima = i === 6
      sl.addShape('roundRect' as never, { x, y: 3.1, w: ew, h: 1.75, fill: { color: ultima ? C.navy : C.card }, line: { type: 'none' }, rectRadius: 0.04 })
      sl.addText(String(i + 1).padStart(2, '0'), { x: x + 0.14, y: 3.28, w: ew - 0.28, h: 0.3, fontSize: 13, bold: true, color: ultima ? C.ciano : C.azulClaro, fontFace: F })
      sl.addText(e[0], { x: x + 0.14, y: 3.62, w: ew - 0.28, h: 0.3, fontSize: 12.5, bold: true, color: ultima ? C.branco : C.navy, fontFace: F, shrinkText: true })
      sl.addText(e[1], { x: x + 0.14, y: 3.95, w: ew - 0.28, h: 0.75, fontSize: 9.5, color: ultima ? C.azulClaro : C.slate, fontFace: F, valign: 'top', lineSpacing: 13, shrinkText: true })
      if (i < 6) sl.addText('→', { x: x + ew - 0.02, y: 3.72, w: 0.38, h: 0.4, fontSize: 16, bold: true, color: C.azulClaro2, align: 'center', fontFace: F })
    })
    sl.addText('É isso que nenhum sistema isolado consegue fazer — e o que transforma dado em experiência.', { x: MG, y: 5.35, w: COL, h: 0.35, fontSize: 13, italic: true, color: C.slateClaro, align: 'center', fontFace: F })
  }

  /* 14 · escala */
  {
    const sl = slideBranco(p, '06 · A escala', 'A arquitetura já nasceu pronta para crescer',
      'Replicar é configurar, não reprogramar — a vantagem competitiva é o método Yamaha codificado dentro do software.')
    cardGrid(sl, 2.15, 4, [
      { tag: 'Hoje', titulo: 'Piloto Nippon', corpo: '4 lojas, 25 módulos em produção, pago pela própria CCY.', corTag: C.verde },
      { tag: 'Fase 2 · set–dez/26', titulo: 'Regional', corpo: 'Os 9 grupos da regional já estão na base — falta só criar os acessos.' },
      { tag: 'Fase 3 · 2027', titulo: 'Nacional', corpo: 'SaaS multi-grupo com governança parametrizável por concessionária.' },
      { tag: 'Visão', titulo: 'Global Yamaha', corpo: 'O know-how (dois relógios, K2, PDCA, circulares) vira padrão exportável.', corTag: C.roxo },
    ], 2.0)
    callout(sl, 4.5, 'Prova de replicabilidade: o método já rodou fora da Nippon',
      'Os PDCAs da NOBRE Motos (Caraguatatuba e Mogi) usam o mesmo método, em outro grupo, sem mudar uma linha. O consultor da regional já acompanha as 9 CCYs neste formato.', 1.2)
  }

  /* 15 · o pedido */
  fraseNavy(p, 'O pedido desta reunião: aprovar a Fase 2 —\nos 9 grupos da regional ainda em 2026.',
    'Piloto validado e pago pela própria concessionária · estrutura multi-grupo pronta · payback menor que um mês.',
  sl => {
    sl.addText('"O Smart Dealer é mais do que uma plataforma tecnológica. É um novo padrão de relacionamento\nentre cliente, concessionária e Yamaha."', { x: W * 0.14, y: 5.35, w: W * 0.72, h: 0.8, fontSize: 13, italic: true, color: C.slateClaro, align: 'center', fontFace: F, lineSpacing: 19 })
    sl.addText('YAMAHA WAY 2026 · GRUPO SHOGUN RIDERS · NIPPON MOTOS', { x: MG, y: H - 0.6, w: COL, h: 0.3, fontSize: 9.5, color: '3D4F61', align: 'center', charSpacing: 2, fontFace: F })
  })

  await p.writeFile({ fileName: '_NOVAS MELHORIAS/DECK-DIRETORIA-SMART-DEALER.pptx' })
  console.log('✓ DECK-DIRETORIA-SMART-DEALER.pptx')
}

/* ═══════════════════ DECK 2 · BANCA ═══════════════════ */

// corta no fim de frase mais próximo do limite (para caber na célula sem picotar)
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

function slideCriterio(p: P, num: string, criterios: typeof formulaDiagnostico[number][], maxOnde: number, fontSize: number, rowH: number) {
  const c0 = criterios[0]
  const titulo = criterios.map(c => c.criterio).join(' + ')
  const notas = criterios.map(c => `${c.criterio.split(' ')[0]}: ${c.nota1aBanca.toFixed(2).replace('.', ',')}`).join(' · ')
  const sl = slideBranco(p, `06 · Fórmula do Sucesso · ${num}`, titulo,
    `Nota da 1ª banca — ${notas} · todos os sub-itens do formulário, um a um.`)
  let y = 2.05
  criterios.forEach(cr => {
    if (criterios.length > 1) {
      sl.addText(cr.criterio.toUpperCase(), { x: MG, y, w: COL, h: 0.24, fontSize: 10, bold: true, color: C.azul, charSpacing: 1, fontFace: F })
      y += 0.3
    }
    const rows: CelDef[][] = cr.itens.map(it => {
      const st = ST[it.status as keyof typeof ST]
      return [
        { t: it.item },
        { t: st.rot, cor: st.cor, bold: true, align: 'center' as const, fill: st.fill },
        { t: ate(it.onde, maxOnde), cor: C.slate, bold: false },
      ]
    })
    tabela(sl, y, ['Sub-item do formulário', 'Status', 'Onde está a prova'], rows, [3.9, 0.95, 6.78], fontSize, rowH)
    y += (cr.itens.length + 1) * rowH + 0.28
  })
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
    'Como transformar dados em experiências memoráveis?\nCada apontamento da 1ª banca virou entrega. Esta é a prestação de contas.',
    'Piloto real: Nippon Motos · Bragança Paulista, Atibaia, Amparo e Extrema')

  /* 2 · agenda */
  {
    const sl = slideBranco(p, 'Agenda', 'O que vamos ver')
    const itens: Card[] = [
      { tag: '01', titulo: 'Prestação de contas', corpo: 'O que a banca apontou e o que fizemos com cada ponto' },
      { tag: '02', titulo: 'Objetivo e hipóteses', corpo: 'Uma frase, três metas públicas, três hipóteses testáveis' },
      { tag: '03', titulo: 'Pesquisa e cliente', corpo: 'Voz do Cliente, fatores de compra e benchmark da solução' },
      { tag: '04', titulo: 'O que mudou', corpo: 'Os 7 passos da venda e o processo trocado, não digitalizado' },
      { tag: '05', titulo: 'Resultados e viabilidade', corpo: 'O que o piloto produziu e como escala para a rede' },
      { tag: '06', titulo: 'Fórmula do Sucesso', corpo: 'Os 27 sub-itens do formulário, um a um, com a prova' },
    ]
    itens.forEach(i2 => { i2.corTag = 'B8CDEA' })
    cardGrid(sl, 2.15, 3, itens, 1.75)
  }

  /* 3 · prestação de contas */
  {
    const sl = slideBranco(p, '01 · Prestação de contas', 'O que vocês apontaram — e o que fizemos',
      'Nenhum feedback da 1ª banca ficou sem resposta construída dentro do sistema.')
    tabela(sl, 2.1, ['O apontamento da banca', 'A resposta do grupo'], [
      [{ t: '"Qual a vantagem competitiva? Software qualquer um faz."' }, { t: 'A vantagem é o COMO: regras Yamaha codificadas (carta, K2, Kaizen, circulares, Premya). Benchmark nesta apresentação.', bold: false }],
      [{ t: '"Faltou pesquisa com o cliente final."' }, { t: 'Feita: 32 respostas, satisfação 4,5/5, NPS 72, fatores de compra tabulados — dashboards ao vivo na tela Voz do Cliente.', bold: false }],
      [{ t: '"Cadê as hipóteses e as metas do projeto?"' }, { t: 'Três hipóteses "se X, então Y — medido por Z" e três metas públicas com prazo. Todas medidas pelo sistema.', bold: false }],
      [{ t: '"O limbo do lead é a dor real." (Cintia)' }, { t: 'Governança de CRM: SLA 10 min, escalonamento ao gerente, redistribuição — leads sem resposta caíram de 32% para 2%.', bold: false }],
    ], [4.6, 7.03], 11, 0.78)
  }

  /* 3b · o sistema, ao vivo */
  {
    const sl = p.addSlide()
    sl.background = { color: C.navy }
    sl.addImage({ path: `${ASSETS}/bg-produto.png`, x: 0, y: 0, w: W, h: H })
    sl.addText('01 · PRESTAÇÃO DE CONTAS', { x: MG, y: 0.55, w: COL, h: 0.26, fontSize: 11, bold: true, color: C.ciano, charSpacing: 1.5, fontFace: F })
    sl.addText('Tudo isso está em produção — o sistema, ao vivo', { x: MG, y: 0.85, w: COL, h: 0.62, fontSize: 30, bold: true, color: C.branco, fontFace: F, shrinkText: true })
    sl.addText('Telas reais, dados reais da Nippon — na banca, a demonstração é ao vivo, trocando de login por papel.', { x: MG, y: 1.55, w: COL, h: 0.3, fontSize: 13, color: C.azulClaro, fontFace: F })
    browserFrame(p, sl, MG, 2.25, 5.72, 'dashboard.png')
    browserFrame(p, sl, MG + 5.95, 2.25, 5.72, 'pesquisa.png')
    sl.addText('Dashboard do titular — carta, ritmo, ranking e Kaizen', { x: MG, y: 6.05, w: 5.72, h: 0.3, fontSize: 9.5, color: C.slateClaro, fontFace: F })
    sl.addText('Voz do Cliente — a pesquisa pedida pela banca, virou módulo', { x: MG + 5.95, y: 6.05, w: 5.72, h: 0.3, fontSize: 9.5, color: C.slateClaro, fontFace: F })
    PAG++
    sl.addText(String(PAG).padStart(2, '0'), { x: W - MG - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontSize: 10, bold: true, color: '3D4F61', align: 'right', fontFace: F })
  }

  /* 4 · objetivo + metas */
  {
    const sl = slideBranco(p, '02 · Objetivo e hipóteses', 'Um objetivo. Três metas públicas. Sempre as mesmas.')
    callout(sl, 1.95, 'O objetivo do trabalho — uma frase, repetida em todo material', materiaisProntos.objetivo.texto, 1.1)
    const metas: [string, string, string][] = [
      ['Meta 1 · Carta', '≥ 100%', 'em setembro/2026 — julho fechou em 90,0% e o prêmio da campanha está em jogo'],
      ['Meta 2 · Absorção', '65%', 'até dezembro/2026 — saímos de 30% e já estamos em 49,4% (K2 lido do DRE)'],
      ['Meta 3 · Lead', '≤ 10 min', 'padrão de atendimento — hoje 81% dentro do SLA; era 22% antes do piloto'],
    ]
    const gap = 0.22, mw = (COL - gap * 2) / 3
    metas.forEach((m, i) => {
      const x = MG + i * (mw + gap)
      sl.addShape('roundRect' as never, { x, y: 3.35, w: mw, h: 2.15, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(m[0].toUpperCase(), { x: x + 0.24, y: 3.55, w: mw - 0.48, h: 0.24, fontSize: 9.5, bold: true, color: C.azul, charSpacing: 0.5, fontFace: F })
      sl.addText(m[1], { x: x + 0.24, y: 3.82, w: mw - 0.48, h: 0.6, fontSize: 30, bold: true, color: C.verde, fontFace: F })
      sl.addText(m[2], { x: x + 0.24, y: 4.48, w: mw - 0.48, h: 0.9, fontSize: 10.5, color: C.slate, fontFace: F, valign: 'top', lineSpacing: 14, shrinkText: true })
    })
    sl.addText('O sistema mede as três ao vivo — a meta virou compromisso público, não promessa.', { x: MG, y: 5.85, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 5 · hipóteses */
  {
    const sl = slideBranco(p, '02 · Objetivo e hipóteses', 'Três hipóteses testáveis — e a medida de cada uma',
      'No formato que a banca pediu: "se X, então Y — medido por Z".')
    let y = 2.1
    materiaisProntos.hipoteses.itens.forEach(h2 => {
      const [hip, medida] = h2.split(' Medida: ')
      sl.addShape('roundRect' as never, { x: MG, y, w: COL, h: 1.28, fill: { color: C.card }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(hip, { x: MG + 0.26, y: y + 0.16, w: COL - 0.52, h: 0.62, fontSize: 12.5, bold: true, color: C.navy, fontFace: F, valign: 'top', lineSpacing: 16, shrinkText: true })
      sl.addText('MEDIDA: ' + (medida ?? ''), { x: MG + 0.26, y: y + 0.85, w: COL - 0.52, h: 0.34, fontSize: 10, bold: true, color: C.azul, fontFace: F, shrinkText: true })
      y += 1.45
    })
  }

  /* 6 · benchmark */
  {
    const sl = slideBranco(p, '03 · Pesquisa e cliente', 'Concorrentes da solução: o que só o Smart Dealer tem',
      'Resposta direta à pergunta da 1ª banca — a vantagem competitiva é o método Yamaha codificado; o software é o veículo.')
    tabela(sl, 2.2, ['', 'CRM genérico', 'DMS da loja', 'Planilhas', 'Smart Dealer'], [
      [{ t: 'Regras Yamaha (carta, Kaizen, K2, circular)' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'manual', align: 'center' }, { t: 'codificadas', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'PDCA no formato oficial da regional' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'horas', align: 'center' }, { t: 'um clique', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Liberacred: recusa vira oportunidade' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'automático', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Premya acompanhado em curso' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'simulador', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Circulares no assistente de IA' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'não', cor: C.verm, align: 'center' }, { t: 'no robô', cor: C.verde, bold: true, align: 'center' }],
      [{ t: 'Custo mensal por concessionária' }, { t: 'R$ 800–2.500', align: 'center' }, { t: 'já pago, não analisa', align: 'center' }, { t: '"grátis" e caro', align: 'center' }, { t: 'R$ 600', cor: C.verde, bold: true, align: 'center' }],
    ], [4.4, 1.75, 1.85, 1.7, 1.93], 10.5, 0.52)
  }

  /* 7 · pesquisa */
  {
    const sl = slideBranco(p, '03 · Pesquisa e cliente', 'Pesquisa Voz do Cliente — feita pelo grupo, com clientes reais',
      '28/07 a 14/08 · formulário WhatsApp + entrevista presencial na entrega e na sala de espera · 32 respostas (52% de adesão).')
    kpiCards(sl, 2.15, [
      { tag: 'Amostra', val: '32', sub: '18 compraram · 14 não compraram' },
      { tag: 'Satisfação', val: '4,5 / 5', sub: 'era 3,6 antes do piloto', cor: C.verde },
      { tag: 'NPS da pesquisa', val: '72', sub: 'promotores − detratores', cor: C.verde },
      { tag: 'Respondido em 10 min', val: '81%', sub: 'era 22% — percepção confirmada pelo cliente', cor: C.verde },
    ], 1.5)
    const falas = [
      ['"Me responderam em uns cinco minutos. Na outra loja eu esperei dois dias e desisti."', 'C. Eduardo · Bragança · comprou'],
      ['"Meu crédito não passou e ninguém mais me procurou. Se tivessem uma segunda opção eu tinha fechado."', 'J. Vitor · Extrema · não comprou'],
      ['"O que me convenceu foi a parcela. O vendedor já veio com a simulação pronta, nem precisei pedir."', 'M. Aparecida · Amparo · comprou'],
    ]
    const fw = (COL - 0.44) / 3
    falas.forEach((f2, i) => {
      const x = MG + i * (fw + 0.22)
      sl.addShape('roundRect' as never, { x, y: 4.0, w: fw, h: 1.95, fill: { color: C.callout }, line: { type: 'none' }, rectRadius: 0.03 })
      sl.addText(f2[0], { x: x + 0.22, y: 4.2, w: fw - 0.44, h: 1.25, fontSize: 11, italic: true, color: C.navy, fontFace: F, valign: 'top', lineSpacing: 15, shrinkText: true })
      sl.addText(f2[1], { x: x + 0.22, y: 5.55, w: fw - 0.44, h: 0.28, fontSize: 9.5, bold: true, color: C.azul, fontFace: F, shrinkText: true })
    })
    sl.addText('43% dos que não compraram travaram no crédito — exatamente o público que o módulo Liberacred devolve à mesa.', { x: MG, y: 6.2, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 8 · fatores de compra */
  {
    const sl = slideBranco(p, '03 · Pesquisa e cliente', 'O que decide a compra — e o que faz o cliente voltar',
      'Múltipla escolha sobre os 32 respondentes · cada fator ligado ao módulo que o atende.')
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

  /* 9 · 7 passos */
  {
    const sl = slideBranco(p, '04 · O que mudou', 'Os 7 passos da venda — e onde o sistema atua em cada um',
      'Item explícito do formulário que estava em branco na 1ª banca. Dois passos demonstrados ao vivo na banca.')
    tabela(sl, 2.1,
      ['Passo da venda Yamaha', 'Onde o Smart Dealer atua'],
      materiaisProntos.seteSteps.passos.map(ps => [{ t: ps.passo }, { t: ps.atua, bold: false }]),
      [3.5, 8.13], 10.5, 0.58)
  }

  /* 10 · com/sem */
  {
    const sl = slideBranco(p, '04 · O que mudou', 'Não digitalizamos o processo antigo — trocamos o processo')
    tabela(sl, 2.0, ['O processo', 'Antes', 'Com Smart Dealer'], [
      [{ t: 'Análise de performance' }, { t: 'horas cruzando planilhas', cor: C.verm }, { t: 'PDCA oficial em um clique', cor: C.verde, bold: true }],
      [{ t: 'Lead sem resposta' }, { t: '32% morriam no limbo', cor: C.verm }, { t: '2% — régua + escalonamento ao gerente', cor: C.verde, bold: true }],
      [{ t: 'Crédito recusado' }, { t: 'fim da conversa', cor: C.verm }, { t: 'oportunidade Liberacred com mensagem-prêmio', cor: C.verde, bold: true }],
      [{ t: 'Circular da montadora' }, { t: 'no e-mail de alguém', cor: C.verm }, { t: 'no robô — a loja inteira responde igual', cor: C.verde, bold: true }],
      [{ t: 'Índice Premya' }, { t: 'descoberto na apuração', cor: C.verm }, { t: 'acompanhado em curso, com simulador', cor: C.verde, bold: true }],
      [{ t: 'Revisão vencida' }, { t: 'cliente esquecido', cor: C.verm }, { t: 'régua R1–R4 dispara sozinha', cor: C.verde, bold: true }],
      [{ t: 'Atualização mensal' }, { t: 'redigitação em cada tela', cor: C.verm }, { t: 'planilha publicada uma vez, telas se atualizam', cor: C.verde, bold: true }],
    ], [3.1, 3.6, 4.93], 10.5, 0.5)
    sl.addText('O conhecimento virou método replicável: decomposição mercado × share, absorção lida do DRE, dois relógios — documentado e rodando.', { x: MG, y: 6.15, w: COL, h: 0.3, fontSize: 12, italic: true, color: C.slateClaro, fontFace: F })
  }

  /* 11 · resultados */
  {
    const sl = slideBranco(p, '05 · Resultados e viabilidade', 'O que o piloto já produziu')
    kpiCards(sl, 2.0, [
      { tag: 'Campanha Campeões', val: 'R$ 7.500', sub: 'garantidos em julho (90,0% da carta) + R$ 15 mil recuperáveis', cor: C.verde },
      { tag: 'Vouchers por modelo', val: 'R$ 66 mil', sub: 'apurados em julho; com Campeões, R$ 73,5 mil', cor: C.verde },
      { tag: 'Absorção', val: '+19 p.p.', sub: 'de 30% para 49,4% — gap para 65% quantificado', cor: C.verde },
      { tag: 'Conversão de leads', val: '8,1 → 13,9%', sub: 'com SLA de 10 minutos governado', cor: C.verde },
    ], 1.6)
    callout(sl, 4.0, 'Potencial anual identificado pelo sistema: cerca de R$ 1,1 milhão',
      'Prêmios de campanha (~R$ 400 mil) + gap de absorção do K2 (~R$ 490 mil) + Premya, Seguros e Consórcio (~R$ 200 mil) — em uma única concessionária.', 1.25, C.verdeBg)
    callout(sl, 5.5, 'A prova do compromisso',
      'Setembro fecha a campanha e a Meta 1. Convidamos a banca a cobrar o resultado na apresentação final — o número estará na tela, ao vivo.', 1.0)
  }

  /* 12 · equipe */
  {
    const sl = slideBranco(p, '05 · Resultados e viabilidade', 'Quem fez o quê — e quem valida',
      'Divisão de papéis explícita (apontamento da 1ª banca) · fala revezada na apresentação.')
    cardGrid(sl, 2.15, 5, [
      { titulo: 'Caique Oliveira', corpo: 'Dados, método e consultoria de campo — emplacamento, K2, PDCA, circulares' },
      { titulo: 'Klenilson Paiva', corpo: 'Narrativa, arquitetura da solução e apresentação' },
      { titulo: 'Evandro', corpo: 'Frente comercial — CRM, playbook e cadências' },
      { titulo: 'João Paulo', corpo: 'Frente pós-vendas — régua de revisões e retenção' },
      { titulo: 'Camila', corpo: 'Frente cliente — pesquisa Voz do Cliente e NPS' },
    ], 2.0)
    callout(sl, 4.5, 'Concessionária + grupo, de verdade',
      'A Nippon paga o piloto (R$ 600/mês) e usa no dia a dia — os dados desta apresentação são da operação real. Orientador Paulo Lopes acompanhando. Depoimento em vídeo do titular na apresentação final.', 1.2)
  }

  /* 13 · viabilidade */
  {
    const sl = slideBranco(p, '05 · Resultados e viabilidade', 'Replicar é configurar, não reprogramar')
    cardGrid(sl, 2.05, 2, [
      { tag: 'Prontos para escalar', titulo: 'Os 9 grupos da regional já estão na base', corpo: 'Varejo e metas multi-grupo desde o dia 1 — falta só criar os acessos. SaaS sem instalação, R$ 600/mês; payback com um único prêmio de campanha. Governança (régua, regionalização, cadências) parametrizável por grupo.' },
      { tag: 'Prova de replicabilidade', titulo: 'O método já rodou fora da Nippon', corpo: 'PDCAs da NOBRE Motos (Caraguatatuba e Mogi): mesmo método, outro grupo, sem mudar uma linha. O consultor da regional já acompanha as 9 CCYs neste formato de análise.', corTag: C.verde },
    ], 2.1)
    callout(sl, 4.5, 'Se aprovado pela diretoria: rollout regional ainda em 2026',
      'E o YamahaWay terá gerado um padrão nacional — nascido dentro de uma concessionária, validado pela banca.', 1.0)
  }

  /* 14 · fórmula resumo */
  {
    const r = resumoDiagnostico()
    const sl = slideBranco(p, '06 · Fórmula do Sucesso', 'O diagnóstico completo — critério a critério',
      `Os ${r.total} sub-itens do formulário auditados um a um. Da 1ª banca para cá, ${r.temos} fechados · ${r.parcial} parciais · ${r.falta} em branco.`)
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
    callout(sl, y + 0.4, `Os 6 itens que estavam EM BRANCO na 1ª banca foram fechados`,
      'Pesquisa com clientes · fatores de compra · hipóteses · objetivo mensurável · posicionamento · 7 passos. Nos próximos slides, cada critério aberto item a item.', 1.0, C.verdeBg)
  }

  /* 15–19 · fórmula completa, todos os itens */
  const porNome = (nome: string) => formulaDiagnostico.find(c => c.criterio === nome)!
  slideCriterio(p, '1 de 5', [porNome('Pesquisa')], 210, 10, 0.88)
  slideCriterio(p, '2 de 5', [porNome('Planejamento e Objetivos')], 165, 9.5, 0.7)
  slideCriterio(p, '3 de 5', [porNome('Foco no Cliente')], 130, 9, 0.56)
  slideCriterio(p, '4 de 5', [porNome('Pensar Fora da Caixa')], 190, 9.5, 0.82)
  slideCriterio(p, '5 de 5', [porNome('Trabalho em Equipe'), porNome('Viabilidade e Impacto')], 185, 9.5, 0.72)

  /* 20 · fechamento */
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
