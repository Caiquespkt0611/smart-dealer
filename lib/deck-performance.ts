// O deck da conversa (.pptx) do Smart Dealer — mesmo formato do Performance
// Concessionário: um capítulo por pergunta que o dono faz na call.
//   1) como eu fui?  2) por quê (mercado × share)?  3) segmentos  4) praças e
//   invasão  5) o pós-vendas paga a conta? (K2)  6) o que está em jogo
//   (campanha)  7) o que a gente faz (PDCA)
// Os primitivos de desenho moram em lib/pptx-bonito.ts (porta fiel do original).
// Roda no NAVEGADOR (client component) — os dados chegam prontos da página.
import {
  novoSlide, forma, texto, cabecalho, rodape, kpis, destaque, tabela,
  barrasMeses, slidesDoPDCA, baixarPptxArquivo,
  C, CST, MG, COL, TOPO_Y, BASE_Y, PPT_W, PPT_H,
} from '@/lib/pptx-bonito'
import type { PerformanceAnalise, AcaoPDCA } from '@/lib/performance'
import type { CampanhaAnalise } from '@/lib/campanha-vendas'
import { k2Data } from '@/lib/k2-data'

export interface DeckDados {
  analise: PerformanceAnalise
  acoes: AcaoPDCA[]
  campanha: CampanhaAnalise | null
  dataStr: string   // 'dd/mm/aaaa'
}

const v = (n: number, casas = 1) => Number(n ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: casas })
const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const sinal = (n: number, casas = 1) => `${n >= 0 ? '+' : ''}${v(n, casas)}`
const stDe = (bom: boolean, ruim: boolean) => (bom ? 'bom' : ruim ? 'critico' : 'atencao') as 'bom' | 'atencao' | 'critico'

export function montarDeckSmartDealer(dd: DeckDados) {
  const { analise: a, acoes, campanha } = dd
  const d = a.dash
  const S: object[] = []
  const rodapeBase = `Smart Dealer · Nippon Motos · varejo e emplacamento até ${a.mesFechadoNome} fechado · `
    + `carta de ${d.nomeMesCorrente} · áreas ${a.share.areas.join(' + ')} · gerado em ${dd.dataStr}`

  /* ── capa ─────────────────────────────────────────────────────────────── */
  {
    const sl = novoSlide({})
    forma(sl, { x: 0, y: 0, w: PPT_W, h: PPT_H, fill: C.ink })
    forma(sl, { x: 0, y: PPT_H - 6, w: PPT_W, h: 6, fill: C.s1 })
    texto(sl, { x: MG, y: 180, w: COL, txt: 'PLANO DE PERFORMANCE', sz: 13, b: true, cor: 'A9C4E8', esp: 3 })
    texto(sl, { x: MG, y: 206, w: COL, txt: 'NIPPON MOTOS', sz: 44, b: true, cor: C.branco })
    texto(sl, { x: MG, y: 268, w: COL, txt: `${a.mesFechadoNome} fechado → carta de ${d.nomeMesCorrente}/${d.ano}`, sz: 18, cor: 'D7E3F4' })
    texto(sl, { x: MG, y: 300, w: COL, txt: `Smart Dealer · dados vivos do sistema · ${dd.dataStr}`, sz: 11, cor: 'A9C4E8' })
    sl.notas = ['Abertura: este deck sai do sistema com os mesmos números das telas — nada foi montado à mão.']
    S.push(sl)
  }

  /* ── 1. o mês ─────────────────────────────────────────────────────────── */
  {
    const sl = novoSlide({})
    const stMes = stDe(d.pctAtingimento >= 100, d.pctAtingimento < 80)
    cabecalho(sl, 'o mês', d.modo === 'largada'
      ? `O que ${a.mesFechadoNome.toLowerCase()} diz sobre o que ${d.nomeMesCorrente.toLowerCase()} exige`
      : `Como ${d.nomeMesCorrente.toLowerCase()} está indo`, 'NIPPON MOTOS')
    let y = TOPO_Y + 8
    y = kpis(sl, MG, y, COL, d.modo === 'largada' ? [
      { rot: `CARTA DE ${d.nomeMesCorrente.toUpperCase()}`, val: `${d.meta} un` },
      { rot: `FECHAMENTO ${a.mesFechadoNome.toUpperCase()}`, val: `${d.fechamentoAnterior} un` },
      { rot: 'SALTO QUE A CARTA PEDE', val: `${sinal(d.saltoCarta, 0)} un`, cor: d.saltoCarta > 0 ? C.atencao : C.bom },
      { rot: 'RITMO NECESSÁRIO', val: `${v(d.ritmoNecessario)} un/dia`, sub: `${d.diasUteisMes} dias úteis` },
      { rot: 'POSIÇÃO REGIONAL', val: `${d.rankingPos}º de ${d.rankingTotal}` },
    ] : [
      { rot: 'VENDAS', val: `${d.vendasMes} un` },
      { rot: 'PROJEÇÃO', val: `${d.projecao} un`, cor: CST[stMes] },
      { rot: 'CARTA', val: `${d.meta} un` },
      { rot: 'ATINGIMENTO', val: `${d.pctAtingimento}%`, cor: CST[stMes] },
      { rot: 'POSIÇÃO REGIONAL', val: `${d.rankingPos}º de ${d.rankingTotal}` },
    ], undefined)
    y = destaque(sl, {
      x: MG, y: y + 14, w: COL, status: stMes,
      rot: d.modo === 'largada' ? 'A LARGADA' : 'O RITMO',
      txt: d.modo === 'largada'
        ? `${a.mesFechadoNome} fechou com ${d.fechamentoAnterior} un e a carta de ${d.nomeMesCorrente.toLowerCase()} é de ${d.meta} un `
          + `— ${sinal(d.saltoCarta, 0)} un sobre o que acabou de ser feito, ou ${v(d.ritmoNecessario)} un/dia. `
          + `Ainda não há venda registrada no mês: não há ritmo a corrigir, há ritmo a estabelecer.`
        : `No ritmo atual o mês fecha em ${d.projecao} un (${d.pctAtingimento}% da carta de ${d.meta}). `
          + (d.pctAtingimento >= 100 ? 'Sustentar o ritmo até o fim do mês.' : `Faltam ${Math.max(0, d.meta - d.projecao)} un para a carta.`),
      val: d.modo === 'largada' ? `${sinal(d.saltoCarta, 0)} un` : `${d.pctAtingimento}%`,
    })
    rodape(sl, rodapeBase)
    sl.notas = ['Pergunta 1 da call: "como eu fui?" — responder com a carta e o ritmo, não com opinião.']
    S.push(sl)
  }

  /* ── 2. mercado: por quê ──────────────────────────────────────────────── */
  {
    const sl = novoSlide({})
    const stShare = stDe(a.shareAtual >= a.shareBase, a.shareAtual < a.shareBase - 1)
    cabecalho(sl, 'mercado', 'Por que o varejo está onde está', `áreas ${a.share.areas.join(' + ')}`)
    let y = TOPO_Y + 8
    y = kpis(sl, MG, y, COL, [
      { rot: 'MERCADO DA ÁREA', val: `${v(a.mercadoAtual, 0)} un/mês`, sub: `base ${v(a.mercadoBase, 0)}` },
      { rot: 'SHARE YAMAHA', val: `${v(a.shareAtual)}%`, sub: `${a.baseNome}: ${v(a.shareBase)}%`, cor: CST[stShare] },
      { rot: 'EFEITO MERCADO', val: `${sinal(a.efeitoMercado)} un`, cor: a.efeitoMercado >= 0 ? C.bom : C.critico },
      { rot: 'EFEITO SHARE', val: `${sinal(a.efeitoShare)} un`, cor: a.efeitoShare >= 0 ? C.bom : C.critico },
    ], undefined)
    // série mensal do mercado da área
    const serie: number[] = Array(12).fill(0)
    const mesesGraf: number[] = []
    a.share.trend.forEach((t, i) => {
      const mes = a.share.ultimoMesFechado - (a.share.trend.length - 1 - i)
      if (mes >= 1) { serie[mes - 1] = t.total; mesesGraf.push(mes) }
    })
    texto(sl, { x: MG, y: y + 12, w: COL, txt: 'Mercado da área, mês a mês (un)', sz: 10, b: true, cor: C.ink2, esp: .6 })
    y = barrasMeses(sl, { x: MG, y: y + 30, w: COL, h: 120, serie, meses: mesesGraf.slice(-6), destaqueMes: a.share.ultimoMesFechado, media: a.mercadoBase, status: stShare })
    destaque(sl, { x: MG, y: y + 6, w: COL, status: stShare, rot: 'O VEREDITO', txt: a.veredito, hMax: 84 })
    rodape(sl, rodapeBase)
    sl.notas = ['A decomposição fecha exata: variação real = efeito mercado + efeito share. É ela que separa "o mercado caiu" de "perdemos disputa".']
    S.push(sl)
  }

  /* ── 3. segmentos ─────────────────────────────────────────────────────── */
  {
    const sl = novoSlide({})
    cabecalho(sl, 'segmentos', 'Onde o volume está variando', `vs ${a.baseNome}`)
    const linhas = a.segmentos.slice(0, 7).map(s => [
      { t: s.rotulo, b: true },
      { t: `${s.mktMes} (${sinal(s.mktVar, 0)}%)`, algn: 'r' },
      { t: `${v(s.shareBase)}% → ${v(s.share)}%`, algn: 'r', cor: s.shareDelta >= 0 ? C.bom : C.critico },
      { t: `${sinal(s.impacto)} un/mês`, algn: 'r', b: true, cor: s.impacto >= 0 ? C.bom : C.critico },
      { t: s.veredito === 'disputa' ? `Perda de disputa${s.hondaDelta > 0.3 ? ` — Honda ${sinal(s.hondaDelta)}pp` : ''}`
         : s.veredito === 'demanda' ? 'O bolo encolheu — defender conversão' : 'Estável' },
    ])
    tabela(sl, {
      x: MG, y: TOPO_Y + 10, colsW: [190, 130, 150, 130, COL - 600], sz: 10, hLinha: 24,
      cab: ['SEGMENTO', 'MERCADO/MÊS', 'SHARE (BASE → ATUAL)', 'IMPACTO', 'LEITURA'].map(t => ({ t, algn: 'l' })),
      linhas,
    })
    rodape(sl, rodapeBase)
    sl.notas = ['A causa muda a ação: disputa → retomar terreno; demanda → converter o que ainda entra e ajustar pedido.']
    S.push(sl)
  }

  /* ── 4. praças e invasão ──────────────────────────────────────────────── */
  {
    const sl = novoSlide({})
    cabecalho(sl, 'território', 'Praças com espaço — e quem está invadindo', 'NIPPON MOTOS')
    let y = TOPO_Y + 10
    if (a.cidades.length) {
      texto(sl, { x: MG, y, w: COL, txt: `Cidades abaixo do share do território (${v(a.shareAtual)}%)`, sz: 10.5, b: true, cor: C.ink2 })
      y = tabela(sl, {
        x: MG, y: y + 18, colsW: [200, 150, 130, 160], sz: 10, hLinha: 22,
        cab: ['CIDADE', 'MERCADO (UN/MÊS)', 'SHARE HOJE', 'ESPAÇO A OCUPAR'].map(t => ({ t, algn: 'l' })),
        linhas: a.cidades.slice(0, 4).map(c => [
          { t: c.cidade, b: true },
          { t: v(c.mktMes), algn: 'r' },
          { t: `${v(c.share)}%`, algn: 'r' },
          { t: `+${v(c.gap, 0)} un/mês`, algn: 'r', b: true, cor: C.atencao },
        ]),
      }) + 10
    }
    const stInv = stDe(a.invasaoPct < 25, a.invasaoPct >= 40)
    const quem = a.invasores.slice(0, 2).map(i => i.nome).filter(Boolean).join(' e ')
    destaque(sl, {
      x: MG, y, w: COL, status: stInv, rot: 'INVASÃO DE TERRITÓRIO', val: `${a.invasaoPct}%`,
      txt: `Das ${v(a.yamNoTerrMes, 0)} un/mês de Yamaha emplacadas na área, a Nippon emplaca ${v(a.nipponMes, 0)} — `
        + `${v(a.invasaoMes, 0)} un/mês são de terceiros${quem ? `, principalmente ${quem}` : ''}.`
        + (a.invasaoPct >= 25 ? ' Grande o bastante para virar pauta com a Yamaha.' : ' Dentro do esperado para área compartilhada de mercado.'),
    })
    rodape(sl, rodapeBase)
    sl.notas = ['O resultado da área é do grupo — a invasão é alerta, não placar. Nomear os CNPJs muda a conversa.']
    S.push(sl)
  }

  /* ── 5. K2: o pós-vendas paga a conta? ────────────────────────────────── */
  {
    const meses = [...k2Data.meses]
    const atual = meses[meses.length - 1]
    const ref = k2Data.referencias
    const faltaMC = Math.max(0, (ref.taxaAbsorcaoMin / 100) * atual.despOperacionais - atual.mcPosVendas)
    const stK2 = stDe(atual.taxaAbsorcao >= ref.taxaAbsorcaoMin, atual.taxaAbsorcao < 40)
    const sl = novoSlide({})
    cabecalho(sl, 'k2 · pós-vendas', 'O pós-vendas pagando as despesas da operação', 'DRE Yamaha BMI')
    let y = TOPO_Y + 8
    y = kpis(sl, MG, y, COL, [
      { rot: `ABSORÇÃO — ${['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][atual.mes]}/${String(atual.ano).slice(2)}`, val: `${v(atual.taxaAbsorcao)}%`, sub: `referência > ${ref.taxaAbsorcaoMin}%`, cor: CST[stK2] },
      { rot: 'MC PÓS-VENDAS', val: brl(atual.mcPosVendas) },
      { rot: 'DESPESAS OPERACIONAIS', val: brl(atual.despOperacionais) },
      { rot: 'PONTO DE EQUILÍBRIO', val: `${v(atual.peUnidades, 0)} motos`, sub: `${v(atual.pePctVendas)}% das vendas · ref < ${ref.pePctVendasMax}%` },
    ], undefined)
    const serieK2: number[] = Array(12).fill(0)
    const mesesK2 = meses.map(m => m.mes)
    meses.forEach(m => { serieK2[m.mes - 1] = m.taxaAbsorcao })
    texto(sl, { x: MG, y: y + 12, w: COL, txt: 'Taxa de absorção, mês a mês (%)', sz: 10, b: true, cor: C.ink2, esp: .6 })
    y = barrasMeses(sl, { x: MG, y: y + 30, w: COL, h: 110, serie: serieK2, meses: mesesK2, destaqueMes: atual.mes, media: ref.taxaAbsorcaoMin, status: stK2 })
    destaque(sl, {
      x: MG, y: y + 4, w: COL, status: stK2, rot: 'O GAP',
      txt: `A absorção saiu de ~30% no fim de 2025 para ${v(atual.taxaAbsorcao)}%. Faltam ${brl(faltaMC)} de MC de `
        + `pós-vendas por mês para os ${ref.taxaAbsorcaoMin}% — cada real de margem no balcão e na oficina desafoga a venda de motos.`,
      hMax: 70,
    })
    rodape(sl, `K2 · fonte: ${k2Data.fonte}`)
    sl.notas = ['Linha da média no gráfico = referência 65%. Passagens (nº de O.S.) não constam no DRE — pendente de outra fonte.']
    S.push(sl)
  }

  /* ── 6. campanha: o que está em jogo ──────────────────────────────────── */
  if (campanha) {
    const sl = novoSlide({})
    const stCamp = stDe(campanha.garantido > 0, false)
    cabecalho(sl, 'campeões de vendas', 'O que está em jogo até setembro', 'Circular CA-MTC-080-26')
    let y = TOPO_Y + 8
    y = kpis(sl, MG, y, COL, [
      { rot: 'GARANTIDO ATÉ AGORA', val: brl(campanha.garantido), cor: C.bom },
      { rot: 'RECUPERÁVEL NO TRIMESTRE', val: brl(campanha.recuperavel), sub: 'meta acumulada em 100%' },
      { rot: 'CENÁRIO 100%', val: brl(campanha.cenarios[1].total) },
      { rot: 'CENÁRIO 110%', val: brl(campanha.cenarios[2].total), cor: C.bom },
    ], undefined)
    y = tabela(sl, {
      x: MG, y: y + 16, colsW: [140, 110, 130, 130, COL - 510], sz: 10, hLinha: 22,
      cab: ['MÊS', 'CARTA', 'RESULTADO', 'PRÊMIO', 'REGRA APLICADA'].map(t => ({ t, algn: 'l' })),
      linhas: campanha.meses.map(m => [
        { t: m.nomeMes + (m.metaEstimada ? ' *' : ''), b: true },
        { t: `${m.meta} un`, algn: 'r' },
        { t: m.resultado !== null ? `${m.resultado} un${m.pctAtingimento !== null ? ` (${v(m.pctAtingimento)}%)` : ''}` : '—', algn: 'r' },
        { t: m.premio > 0 ? brl(m.premio) : '—', algn: 'r', b: true, cor: m.premio > 0 ? C.bom : C.muted },
        { t: m.regra },
      ]),
    }) + 8
    destaque(sl, {
      x: MG, y, w: COL, status: stCamp, rot: 'A LEITURA',
      txt: `${a.mesFechadoNome} fechou em 90% exatos — ${brl(campanha.garantido)} garantidos. Bater a carta nos meses `
        + `abertos recupera ${brl(campanha.recuperavel)} no acumulado e destrava o incentivo dos gerentes (R$ 30–50/moto).`,
      hMax: 64,
    })
    rodape(sl, '* carta ainda não informada — estimada igual à atual. ' + rodapeBase)
    sl.notas = ['Traduzir o prêmio em motos: cada degrau da circular tem um número exato de motos de distância.']
    S.push(sl)
  }

  /* ── 7. PDCA ──────────────────────────────────────────────────────────── */
  slidesDoPDCA(S, acoes, 'NIPPON MOTOS', rodapeBase)

  return S
}

export function baixarDeckSmartDealer(dd: DeckDados) {
  const slides = montarDeckSmartDealer(dd)
  const arq = `Deck_NIPPON-MOTOS_${dd.dataStr.replace(/\//g, '-')}.pptx`
  baixarPptxArquivo(arq, slides, {
    titulo: `Plano de Performance — Nippon Motos · ${dd.dataStr}`,
    autor: 'Smart Dealer',
  })
  return slides.length
}
