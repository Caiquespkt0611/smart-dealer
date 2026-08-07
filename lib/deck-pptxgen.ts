// Deck da conversa (.pptx) gerado com PptxGenJS — biblioteca padrão de mercado
// cujos arquivos abrem direto do download no Windows (Protected View incluso).
// Substitui o escritor manual (lib/pptx-bonito) na geração do deck; o conteúdo
// e a ordem dos capítulos são os mesmos: capa → o mês → mercado → segmentos →
// território → K2 → campanha → PDCA.
import pptxgen from 'pptxgenjs'
import type { PerformanceAnalise, AcaoPDCA } from '@/lib/performance'
import type { CampanhaAnalise } from '@/lib/campanha-vendas'
import type { VouchersAnalise } from '@/lib/campanha-vouchers'
import { k2Data } from '@/lib/k2-data'

export interface DeckDados {
  analise: PerformanceAnalise
  acoes: AcaoPDCA[]
  campanha: CampanhaAnalise | null
  vouchers: VouchersAnalise | null
  dataStr: string // 'dd/mm/aaaa'
}

/* ── medidas (polegadas, layout 16:9 = 13,33 × 7,5) ─────────────────────── */
const W = 13.33, H = 7.5, MG = 0.6, COL = W - MG * 2
const TOPO = 1.28

/* ── paleta (a mesma do painel e do PDCA em Excel) ──────────────────────── */
const C = {
  ink: '0B0B0B', ink2: '52514E', muted: '898781',
  s1: '2A78D6',
  bom: '4B9B3F', atencao: 'D98A0B', critico: 'D64545',
  bgBom: 'EDF5E8', bgAtencao: 'FDF3E3', bgCritico: 'FBEAEA',
  surf: 'F7F7F5', borda: 'E1E0D9', branco: 'FFFFFF',
  pdcaAzul: '1F3864', pdcaClaro: 'D9E2F3', pdcaLinha: 'BFBFBF',
  pdcaAltaBg: 'FBE9E9', pdcaAltaTx: '9C0006',
  pdcaMediaBg: 'FDF3DE', pdcaMediaTx: '9C6500',
  pdcaBaixaBg: 'F2F2F2', pdcaBaixaTx: '3F3F3F',
}
const CST = { bom: C.bom, atencao: C.atencao, critico: C.critico } as const
const CSTBG = { bom: C.bgBom, atencao: C.bgAtencao, critico: C.bgCritico } as const
type Status = keyof typeof CST

const F = 'Calibri'
const v = (n: number, casas = 1) => Number(n ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: casas }).replace(/ /g, ' ')
const brl = (n: number) => `R$ ${Math.round(n).toLocaleString('pt-BR')}`.replace(/ /g, ' ')
const sinal = (n: number, casas = 1) => `${n >= 0 ? '+' : ''}${v(n, casas)}`
const stDe = (bom: boolean, ruim: boolean): Status => (bom ? 'bom' : ruim ? 'critico' : 'atencao')

type Slide = ReturnType<InstanceType<typeof pptxgen>['addSlide']>

function cabecalho(p: InstanceType<typeof pptxgen>, sl: Slide, chapeu: string, titulo: string, direita?: string) {
  sl.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.06, fill: { color: C.s1 }, line: { type: 'none' } })
  sl.addText(chapeu.toUpperCase(), { x: MG, y: 0.3, w: COL * 0.66, h: 0.25, fontSize: 11, bold: true, color: C.s1, charSpacing: 2, fontFace: F })
  sl.addText(titulo, { x: MG, y: 0.52, w: COL * 0.66, h: 0.55, fontSize: 24, bold: true, color: C.ink, fontFace: F })
  if (direita) sl.addText(direita, { x: W - MG - 4.2, y: 0.36, w: 4.2, h: 0.3, fontSize: 10.5, color: C.muted, align: 'right', fontFace: F })
}

function rodape(sl: Slide, txt: string) {
  sl.addText(txt, { x: MG, y: H - 0.42, w: COL, h: 0.3, fontSize: 8, color: C.muted, fontFace: F })
}

interface Kpi { rot: string; val: string; sub?: string; cor?: string }
function kpis(p: InstanceType<typeof pptxgen>, sl: Slide, y: number, itens: Kpi[], alt = 1.06): number {
  const gap = 0.14, cw = (COL - gap * (itens.length - 1)) / itens.length
  itens.forEach((k, i) => {
    const x = MG + i * (cw + gap)
    sl.addShape(p.ShapeType.roundRect, { x, y, w: cw, h: alt, fill: { color: C.surf }, line: { type: 'none' }, rectRadius: 0.07 })
    sl.addText(k.rot.toUpperCase(), { x: x + 0.14, y: y + 0.1, w: cw - 0.28, h: 0.22, fontSize: 8.5, bold: true, color: C.muted, charSpacing: 0.5, fontFace: F, shrinkText: true })
    sl.addText(k.val, { x: x + 0.14, y: y + 0.3, w: cw - 0.28, h: 0.42, fontSize: 19, bold: true, color: k.cor ?? C.ink, fontFace: F, shrinkText: true })
    if (k.sub) sl.addText(k.sub, { x: x + 0.14, y: y + alt - 0.3, w: cw - 0.28, h: 0.24, fontSize: 8, color: C.muted, fontFace: F, shrinkText: true })
  })
  return y + alt
}

function destaque(p: InstanceType<typeof pptxgen>, sl: Slide, y: number, o: { rot: string; txt: string; status: Status; val?: string; alt?: number }): number {
  const alt = o.alt ?? 1.05
  sl.addShape(p.ShapeType.roundRect, { x: MG, y, w: COL, h: alt, fill: { color: CSTBG[o.status] }, line: { type: 'none' }, rectRadius: 0.05 })
  sl.addShape(p.ShapeType.rect, { x: MG, y, w: 0.05, h: alt, fill: { color: CST[o.status] }, line: { type: 'none' } })
  const wTxt = o.val ? COL - 2.6 : COL - 0.44
  sl.addText(o.rot.toUpperCase(), { x: MG + 0.22, y: y + 0.1, w: wTxt, h: 0.22, fontSize: 8.5, bold: true, color: C.ink2, charSpacing: 0.5, fontFace: F })
  sl.addText(o.txt, { x: MG + 0.22, y: y + 0.3, w: wTxt, h: alt - 0.4, fontSize: 10.5, color: C.ink, fontFace: F, valign: 'top', shrinkText: true })
  if (o.val) sl.addText(o.val, { x: W - MG - 2.3, y: y + 0.16, w: 2.1, h: 0.55, fontSize: 24, bold: true, color: CST[o.status], align: 'right', fontFace: F, shrinkText: true })
  return y + alt
}

type Cel = { text: string; options?: object }
const cab = (t: string, extra: object = {}) => ({
  text: t, options: { fill: { color: C.pdcaAzul }, color: C.branco, bold: true, fontSize: 9, valign: 'middle', ...extra },
})
const cel = (t: string, extra: object = {}) => ({
  text: t, options: { color: C.ink, fontSize: 9.5, valign: 'middle', ...extra },
})

const bordas = { pt: 0.5, color: C.pdcaLinha }

export async function gerarDeck(dd: DeckDados): Promise<InstanceType<typeof pptxgen>> {
  const { analise: a, acoes, campanha, vouchers } = dd
  const d = a.dash
  const p = new pptxgen()
  p.defineLayout({ name: 'SD', width: W, height: H })
  p.layout = 'SD'
  p.author = 'Smart Dealer'
  p.title = `Plano de Performance — Nippon Motos · ${dd.dataStr}`

  const rodapeBase = `Smart Dealer · Nippon Motos · varejo e emplacamento até ${a.mesFechadoNome} fechado · carta de ${d.nomeMesCorrente} · áreas ${a.share.areas.join(' + ')} · gerado em ${dd.dataStr}`

  /* ── capa ─────────────────────────────────────────────────────────────── */
  {
    const sl = p.addSlide()
    sl.background = { color: C.ink }
    sl.addShape(p.ShapeType.rect, { x: 0, y: H - 0.08, w: W, h: 0.08, fill: { color: C.s1 }, line: { type: 'none' } })
    sl.addText('PLANO DE PERFORMANCE', { x: MG, y: 2.4, w: COL, h: 0.35, fontSize: 13, bold: true, color: 'A9C4E8', charSpacing: 4, fontFace: F })
    sl.addText('NIPPON MOTOS', { x: MG, y: 2.75, w: COL, h: 0.85, fontSize: 44, bold: true, color: C.branco, fontFace: F })
    sl.addText(`${a.mesFechadoNome} fechado → carta de ${d.nomeMesCorrente}/${d.ano}`, { x: MG, y: 3.65, w: COL, h: 0.4, fontSize: 18, color: 'D7E3F4', fontFace: F })
    sl.addText(`Smart Dealer · dados vivos do sistema · ${dd.dataStr}`, { x: MG, y: 4.1, w: COL, h: 0.3, fontSize: 11, color: 'A9C4E8', fontFace: F })
    sl.addNotes('Abertura: este deck sai do sistema com os mesmos números das telas — nada foi montado à mão.')
  }

  /* ── 1. o mês ─────────────────────────────────────────────────────────── */
  {
    const sl = p.addSlide()
    const st = stDe(d.pctAtingimento >= 100, d.pctAtingimento < 80)
    cabecalho(p, sl, 'o mês', d.modo === 'largada'
      ? `O que ${a.mesFechadoNome.toLowerCase()} diz sobre o que ${d.nomeMesCorrente.toLowerCase()} exige`
      : `Como ${d.nomeMesCorrente.toLowerCase()} está indo`, 'NIPPON MOTOS')
    let y = TOPO
    y = kpis(p, sl, y, d.modo === 'largada' ? [
      { rot: `Carta de ${d.nomeMesCorrente}`, val: `${d.meta} un` },
      { rot: `Fechamento ${a.mesFechadoNome}`, val: `${d.fechamentoAnterior} un` },
      { rot: 'Salto que a carta pede', val: `${sinal(d.saltoCarta, 0)} un`, cor: d.saltoCarta > 0 ? C.atencao : C.bom },
      { rot: 'Ritmo necessário', val: `${v(d.ritmoNecessario)} un/dia`, sub: `${d.diasUteisMes} dias úteis` },
      { rot: 'Posição regional', val: `${d.rankingPos}º de ${d.rankingTotal}` },
    ] : [
      { rot: 'Vendas', val: `${d.vendasMes} un` },
      { rot: 'Projeção', val: `${d.projecao} un`, cor: CST[st] },
      { rot: 'Carta', val: `${d.meta} un` },
      { rot: 'Atingimento', val: `${d.pctAtingimento}%`, cor: CST[st] },
      { rot: 'Posição regional', val: `${d.rankingPos}º de ${d.rankingTotal}` },
    ])
    destaque(p, sl, y + 0.25, {
      status: st, rot: d.modo === 'largada' ? 'A largada' : 'O ritmo', alt: 1.25,
      txt: d.modo === 'largada'
        ? `${a.mesFechadoNome} fechou com ${d.fechamentoAnterior} un e a carta de ${d.nomeMesCorrente.toLowerCase()} é de ${d.meta} un — ${sinal(d.saltoCarta, 0)} un sobre o que acabou de ser feito, ou ${v(d.ritmoNecessario)} un/dia. Ainda não há venda registrada no mês: não há ritmo a corrigir, há ritmo a estabelecer.`
        : `No ritmo atual o mês fecha em ${d.projecao} un (${d.pctAtingimento}% da carta de ${d.meta}). ${d.pctAtingimento >= 100 ? 'Sustentar o ritmo até o fim do mês.' : `Faltam ${Math.max(0, d.meta - d.projecao)} un para a carta.`}`,
      val: d.modo === 'largada' ? `${sinal(d.saltoCarta, 0)} un` : `${d.pctAtingimento}%`,
    })
    rodape(sl, rodapeBase)
    sl.addNotes('Pergunta 1 da call: "como eu fui?" — responder com a carta e o ritmo, não com opinião.')
  }

  /* ── 2. mercado ───────────────────────────────────────────────────────── */
  {
    const sl = p.addSlide()
    const st = stDe(a.shareAtual >= a.shareBase, a.shareAtual < a.shareBase - 1)
    cabecalho(p, sl, 'mercado', 'Por que o varejo está onde está', `áreas ${a.share.areas.join(' + ')}`)
    let y = TOPO
    y = kpis(p, sl, y, [
      { rot: 'Mercado da área', val: `${v(a.mercadoAtual, 0)} un/mês`, sub: `base ${v(a.mercadoBase, 0)}` },
      { rot: 'Share Yamaha', val: `${v(a.shareAtual)}%`, sub: `${a.baseNome}: ${v(a.shareBase)}%`, cor: CST[st] },
      { rot: 'Efeito mercado', val: `${sinal(a.efeitoMercado)} un`, cor: a.efeitoMercado >= 0 ? C.bom : C.critico },
      { rot: 'Efeito share', val: `${sinal(a.efeitoShare)} un`, cor: a.efeitoShare >= 0 ? C.bom : C.critico },
    ])
    // gráfico nativo do PowerPoint: mercado da área mês a mês
    const labels = a.share.trend.map(t => t.mes)
    sl.addChart(p.ChartType.bar, [
      { name: 'Mercado da área (un)', labels, values: a.share.trend.map(t => t.total) },
      { name: 'Yamaha (un)', labels, values: a.share.trend.map(t => t.yamaha) },
    ], {
      x: MG, y: y + 0.2, w: COL, h: 2.55, barDir: 'col', barGapWidthPct: 60,
      chartColors: ['C9D6E8', C.s1], showLegend: true, legendPos: 'b', legendFontSize: 9,
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9, dataLabelFontSize: 8,
      showValue: true, valGridLine: { style: 'none' }, fontFace: F,
    })
    destaque(p, sl, y + 2.95, { status: st, rot: 'O veredito', txt: a.veredito, alt: 0.95 })
    rodape(sl, rodapeBase)
    sl.addNotes('A decomposição fecha exata: variação real = efeito mercado + efeito share. É ela que separa "o mercado caiu" de "perdemos disputa".')
  }

  /* ── 3. segmentos ─────────────────────────────────────────────────────── */
  {
    const sl = p.addSlide()
    cabecalho(p, sl, 'segmentos', 'Onde o volume está variando', `vs ${a.baseNome} · só onde a Yamaha tem produto`)
    const rows: Cel[][] = [[
      cab('SEGMENTO'), cab('MERCADO/MÊS', { align: 'right' }), cab('SHARE (BASE → ATUAL)', { align: 'right' }),
      cab('IMPACTO', { align: 'right' }), cab('LEITURA'),
    ]]
    a.segmentos.slice(0, 7).forEach(s => rows.push([
      cel(s.rotulo, { bold: true }),
      cel(`${s.mktMes} (${sinal(s.mktVar, 0)}%)`, { align: 'right' }),
      cel(`${v(s.shareBase)}% → ${v(s.share)}%`, { align: 'right', color: s.shareDelta >= 0 ? C.bom : C.critico }),
      cel(`${sinal(s.impacto)} un/mês`, { align: 'right', bold: true, color: s.impacto >= 0 ? C.bom : C.critico }),
      cel(s.veredito === 'disputa' ? `Perda de disputa${s.hondaDelta > 0.3 ? ` — Honda ${sinal(s.hondaDelta)}pp` : ''}`
        : s.veredito === 'demanda' ? 'O bolo encolheu — defender conversão' : 'Estável'),
    ]))
    sl.addTable(rows as never, {
      x: MG, y: TOPO + 0.1, w: COL, colW: [2.6, 1.8, 2.1, 1.8, COL - 8.3],
      border: bordas, fontFace: F, rowH: 0.34, valign: 'middle', fill: { color: C.branco },
    })
    if (a.foraAtuacao.qtd > 0) {
      sl.addText(`Análise restrita aos segmentos onde a Yamaha tem produto — ${a.foraAtuacao.qtd} segmentos sem moto no catálogo (~${v(a.foraAtuacao.unMes, 0)} un/mês) ficam fora do plano.`,
        { x: MG, y: H - 0.85, w: COL, h: 0.3, fontSize: 8.5, italic: true, color: C.muted, fontFace: F })
    }
    rodape(sl, rodapeBase)
    sl.addNotes('A causa muda a ação: disputa → retomar terreno; demanda → converter o que ainda entra e ajustar pedido.')
  }

  /* ── 4. território ────────────────────────────────────────────────────── */
  {
    const sl = p.addSlide()
    cabecalho(p, sl, 'território', 'Praças com espaço — e quem está invadindo', 'NIPPON MOTOS')
    let y = TOPO + 0.05
    if (a.cidades.length) {
      const rows: Cel[][] = [[
        cab('CIDADE'), cab('MERCADO (UN/MÊS)', { align: 'right' }), cab('SHARE HOJE', { align: 'right' }), cab('ESPAÇO A OCUPAR', { align: 'right' }),
      ]]
      a.cidades.slice(0, 4).forEach(c2 => rows.push([
        cel(c2.cidade, { bold: true }),
        cel(v(c2.mktMes), { align: 'right' }),
        cel(`${v(c2.share)}%`, { align: 'right' }),
        cel(`+${v(c2.gap, 0)} un/mês`, { align: 'right', bold: true, color: C.atencao }),
      ]))
      sl.addTable(rows as never, {
        x: MG, y, w: COL * 0.72, colW: [2.6, 2.4, 1.9, (COL * 0.72) - 6.9],
        border: bordas, fontFace: F, rowH: 0.34, valign: 'middle', fill: { color: C.branco },
      })
      y += 0.42 * (Math.min(a.cidades.length, 4) + 1) + 0.35
    }
    const stInv = stDe(a.invasaoPct < 25, a.invasaoPct >= 40)
    const quem = a.invasores.slice(0, 2).map(i => i.nome).filter(Boolean).join(' e ')
    destaque(p, sl, Math.max(y, 3.6), {
      status: stInv, rot: 'Invasão de território', val: `${a.invasaoPct}%`, alt: 1.3,
      txt: `Das ${v(a.yamNoTerrMes, 0)} un/mês de Yamaha emplacadas na área, a Nippon emplaca ${v(a.nipponMes, 0)} — ${v(a.invasaoMes, 0)} un/mês são de terceiros${quem ? `, principalmente ${quem}` : ''}.${a.invasaoPct >= 25 ? ' Grande o bastante para virar pauta com a Yamaha.' : ' Dentro do esperado para área compartilhada de mercado.'}`,
    })
    rodape(sl, rodapeBase)
    sl.addNotes('O resultado da área é do grupo — a invasão é alerta, não placar. Nomear os CNPJs muda a conversa.')
  }

  /* ── 5. K2 ────────────────────────────────────────────────────────────── */
  {
    const meses = [...k2Data.meses]
    const atual = meses[meses.length - 1]
    const ref = k2Data.referencias
    const faltaMC = Math.max(0, (ref.taxaAbsorcaoMin / 100) * atual.despOperacionais - atual.mcPosVendas)
    const st = stDe(atual.taxaAbsorcao >= ref.taxaAbsorcaoMin, atual.taxaAbsorcao < 40)
    const MA = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const sl = p.addSlide()
    cabecalho(p, sl, 'k2 · pós-vendas', 'O pós-vendas pagando as despesas da operação', 'DRE Yamaha BMI')
    let y = TOPO
    y = kpis(p, sl, y, [
      { rot: `Absorção — ${MA[atual.mes]}/${String(atual.ano).slice(2)}`, val: `${v(atual.taxaAbsorcao)}%`, sub: `referência > ${ref.taxaAbsorcaoMin}%`, cor: CST[st] },
      { rot: 'MC pós-vendas', val: brl(atual.mcPosVendas) },
      { rot: 'Despesas operacionais', val: brl(atual.despOperacionais) },
      { rot: 'Ponto de equilíbrio', val: `${v(atual.peUnidades, 0)} motos`, sub: `${v(atual.pePctVendas)}% das vendas · ref < ${ref.pePctVendasMax}%` },
    ])
    sl.addChart(p.ChartType.bar, [
      { name: 'Taxa de absorção (%)', labels: meses.map(m => `${MA[m.mes]}/${String(m.ano).slice(2)}`), values: meses.map(m => m.taxaAbsorcao) },
    ], {
      x: MG, y: y + 0.2, w: COL, h: 2.5, barDir: 'col', barGapWidthPct: 55,
      chartColors: [C.s1], showValue: true, dataLabelFontSize: 8.5,
      catAxisLabelFontSize: 9, valAxisLabelFontSize: 9, valAxisMaxVal: 100,
      showLegend: false, valGridLine: { style: 'none' }, fontFace: F,
    })
    destaque(p, sl, y + 2.9, {
      status: st, rot: 'O gap', alt: 1.0,
      txt: `A absorção saiu de ~30% no fim de 2025 para ${v(atual.taxaAbsorcao)}%. Faltam ${brl(faltaMC)} de MC de pós-vendas por mês para os ${ref.taxaAbsorcaoMin}% — cada real de margem no balcão e na oficina desafoga a venda de motos.`,
    })
    rodape(sl, `K2 · fonte: ${k2Data.fonte}`)
    sl.addNotes('Referência da Yamaha: absorção acima de 65%. Passagens (nº de O.S.) não constam no DRE — pendente de outra fonte.')
  }

  /* ── 6. campanhas ─────────────────────────────────────────────────────── */
  if (campanha) {
    const sl = p.addSlide()
    const vchFechado = vouchers?.totalMesFechado ?? 0
    const vchProj = vouchers?.totalProjetado ?? 0
    cabecalho(p, sl, 'campanhas yamaha', 'O que a Nippon tem a receber', 'Campeões de Vendas + incentivo por modelo')
    let y = TOPO
    y = kpis(p, sl, y, [
      { rot: 'Já apurado (2 fontes)', val: brl(campanha.garantido + vchFechado), sub: `Campeões ${brl(campanha.garantido)} + vouchers ${brl(vchFechado)}`, cor: C.bom },
      { rot: 'Vouchers — projeção do mês', val: brl(vchProj), sub: 'ritmo dos últimos 3 meses' },
      { rot: 'Recuperável no trimestre', val: brl(campanha.recuperavel), sub: 'meta acumulada em 100%' },
      { rot: 'Potencial total', val: brl(campanha.cenarios[2].total + vchFechado + vchProj), cor: C.bom },
    ])
    const rows: Cel[][] = [[
      cab('MÊS'), cab('CARTA', { align: 'right' }), cab('RESULTADO', { align: 'right' }), cab('PRÊMIO', { align: 'right' }), cab('REGRA APLICADA'),
    ]]
    campanha.meses.forEach(m => rows.push([
      cel(m.nomeMes + (m.metaEstimada ? ' *' : ''), { bold: true }),
      cel(`${m.meta} un`, { align: 'right' }),
      cel(m.resultado !== null ? `${m.resultado} un${m.pctAtingimento !== null ? ` (${v(m.pctAtingimento)}%)` : ''}` : '—', { align: 'right' }),
      cel(m.premio > 0 ? brl(m.premio) : '—', { align: 'right', bold: true, color: m.premio > 0 ? C.bom : C.muted }),
      cel(m.regra, { fontSize: 8.5 }),
    ]))
    sl.addTable(rows as never, {
      x: MG, y: y + 0.2, w: COL, colW: [1.5, 1.2, 1.8, 1.6, COL - 6.1],
      border: bordas, fontFace: F, rowH: 0.34, valign: 'middle', fill: { color: C.branco },
    })
    destaque(p, sl, y + 2.15, {
      status: 'bom', rot: 'A leitura', alt: 1.15,
      txt: `Duas fontes: Campeões de Vendas (${brl(campanha.garantido)} garantidos em ${a.mesFechadoNome.toLowerCase()}; ${brl(campanha.recuperavel)} recuperáveis no acumulado) + incentivo por modelo (${brl(vchFechado)} de ${a.mesFechadoNome.toLowerCase()}, projeção ${brl(vchProj)} no mês — Fazer, NMAX, MT-07, Lander e XMAX). Bônus não cumulativo com taxas subsidiadas: valores de voucher são o teto.`,
    })
    rodape(sl, '* carta ainda não informada — estimada igual à atual. ' + rodapeBase)
    sl.addNotes('Traduzir o prêmio em motos: cada degrau da circular tem um número exato de motos de distância.')
  }

  /* ── 7. PDCA (tabela com paginação automática) ────────────────────────── */
  {
    const sl = p.addSlide()
    cabecalho(p, sl, 'plano de ação', 'O que vamos fazer', 'NIPPON MOTOS')
    const prioCfg = {
      Alta: { fill: C.pdcaAltaBg, color: C.pdcaAltaTx },
      Média: { fill: C.pdcaMediaBg, color: C.pdcaMediaTx },
      Baixa: { fill: C.pdcaBaixaBg, color: C.pdcaBaixaTx },
    } as const
    const rows: Cel[][] = [[
      cab('O QUE FAZER? (AÇÃO)'), cab('POR QUÊ? (JUSTIFICATIVA)'), cab('COMO? (ATIVIDADES)'),
      cab('RESP.'), cab('INÍCIO'), cab('TÉRMINO'), cab('PRIOR.'), cab('INDICADOR (META/IMPACTO)'),
    ]]
    acoes.forEach((ac2, i) => {
      const zebra = i % 2 === 1 ? { fill: { color: C.pdcaClaro } } : {}
      const pr = prioCfg[ac2.prio]
      rows.push([
        cel(ac2.acao, { bold: true, valign: 'top', fontSize: 8.5, ...zebra }),
        cel(ac2.porque, { valign: 'top', fontSize: 8, ...zebra }),
        cel(ac2.como.map(x => '• ' + x).join('\n'), { valign: 'top', fontSize: 8, ...zebra }),
        cel(ac2.resp, { align: 'center', fontSize: 8, ...zebra }),
        cel(ac2.ini, { align: 'center', fontSize: 8, ...zebra }),
        cel(ac2.fim, { align: 'center', fontSize: 8, ...zebra }),
        cel(ac2.prio, { align: 'center', bold: true, fontSize: 8.5, fill: { color: pr.fill }, color: pr.color }),
        cel(ac2.indicador, { valign: 'top', fontSize: 8, ...zebra }),
      ])
    })
    sl.addTable(rows as never, {
      x: MG, y: TOPO + 0.05, w: COL, colW: [1.9, 2.6, 2.6, 0.95, 0.7, 0.8, 0.7, COL - 10.25],
      border: bordas, fontFace: F, valign: 'top', fill: { color: C.branco },
      autoPage: true, autoPageRepeatHeader: true, autoPageSlideStartY: TOPO + 0.05,
    })
    rodape(sl, rodapeBase)
    sl.addNotes('Não ler a tabela inteira em voz alta: ler as linhas de prioridade alta e combinar responsável e data para cada uma. É a mesma tabela do botão "Gerar PDCA", em Excel.')
  }

  return p
}

/** Download no navegador. Retorna o nº de slides. */
export async function baixarDeck(dd: DeckDados): Promise<number> {
  const p = await gerarDeck(dd)
  const arq = `Deck_NIPPON-MOTOS_${dd.dataStr.replace(/\//g, '-')}.pptx`
  await p.writeFile({ fileName: arq })
  // @ts-expect-error acesso interno só para o rótulo do botão
  return p.slides?.length ?? 0
}
