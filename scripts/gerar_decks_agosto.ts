// Gera os dois decks de agosto/2026 com PptxGenJS (compatível Windows):
//  1) DECK-DIRETORIA — venda do projeto ao diretor (rollout nacional)
//  2) DECK-BANCA — 2ª banca YamahaWay (Fórmula do Sucesso completa)
// Tema: o mesmo do "Smart Dealer.pptx" (navy 0B1120 · azuis 0070C0/1A72D4 · ciano 00C8E8).
// Rodar: npx tsx scripts/gerar_decks_agosto.ts
import pptxgen from 'pptxgenjs'

const W = 13.33, H = 7.5, MG = 0.7, COL = W - MG * 2
const F = 'Calibri'

const C = {
  bg: '0B1120', bg2: '111B2E', painel: '13213A', borda: '22304A',
  navy: '002060', azul: '0070C0', azul2: '1A72D4', ciano: '00C8E8', cianoSuave: '61A6FB',
  branco: 'FFFFFF', gelo: 'D9E6F7', cinza: '8FA3BD', cinza2: '6B7E92',
  verde: '2ECC71', ambar: 'FFC000', verm: 'FF5A5A',
}

type P = InstanceType<typeof pptxgen>
type Slide = ReturnType<P['addSlide']>

function novo(p: P): Slide {
  const sl = p.addSlide()
  sl.background = { color: C.bg }
  return sl
}

function faixaTopo(p: P, sl: Slide) {
  sl.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.07, fill: { color: C.ciano }, line: { type: 'none' } })
}

function cab(p: P, sl: Slide, chapeu: string, titulo: string, dir?: string) {
  faixaTopo(p, sl)
  sl.addText(chapeu.toUpperCase(), { x: MG, y: 0.34, w: COL * 0.7, h: 0.26, fontSize: 11, bold: true, color: C.ciano, charSpacing: 3, fontFace: F })
  sl.addText(titulo, { x: MG, y: 0.58, w: COL * 0.78, h: 0.6, fontSize: 25, bold: true, color: C.branco, fontFace: F, shrinkText: true })
  if (dir) sl.addText(dir, { x: W - MG - 4, y: 0.42, w: 4, h: 0.3, fontSize: 10, color: C.cinza, align: 'right', fontFace: F })
}

function rodape(sl: Slide, txt: string, num?: number) {
  sl.addText(txt, { x: MG, y: H - 0.4, w: COL - 0.6, h: 0.28, fontSize: 8, color: C.cinza2, fontFace: F })
  if (num) sl.addText(String(num), { x: W - MG - 0.5, y: H - 0.4, w: 0.5, h: 0.28, fontSize: 8, color: C.cinza2, align: 'right', fontFace: F })
}

interface Kpi { rot: string; val: string; sub?: string; cor?: string }
function kpiRow(p: P, sl: Slide, y: number, itens: Kpi[], alt = 1.12): number {
  const gap = 0.16, cw = (COL - gap * (itens.length - 1)) / itens.length
  itens.forEach((k, i) => {
    const x = MG + i * (cw + gap)
    sl.addShape(p.ShapeType.roundRect, { x, y, w: cw, h: alt, fill: { color: C.painel }, line: { color: C.borda, width: 0.75 }, rectRadius: 0.08 })
    sl.addText(k.rot.toUpperCase(), { x: x + 0.15, y: y + 0.1, w: cw - 0.3, h: 0.24, fontSize: 8.5, bold: true, color: C.cinza, charSpacing: 0.5, fontFace: F, shrinkText: true })
    sl.addText(k.val, { x: x + 0.15, y: y + 0.32, w: cw - 0.3, h: 0.46, fontSize: 20, bold: true, color: k.cor ?? C.branco, fontFace: F, shrinkText: true })
    if (k.sub) sl.addText(k.sub, { x: x + 0.15, y: y + alt - 0.32, w: cw - 0.3, h: 0.26, fontSize: 8.2, color: C.cinza, fontFace: F, shrinkText: true })
  })
  return y + alt
}

function painel(p: P, sl: Slide, x: number, y: number, w: number, h: number, titulo?: string, corTitulo?: string) {
  sl.addShape(p.ShapeType.roundRect, { x, y, w, h, fill: { color: C.painel }, line: { color: C.borda, width: 0.75 }, rectRadius: 0.08 })
  if (titulo) sl.addText(titulo.toUpperCase(), { x: x + 0.18, y: y + 0.12, w: w - 0.36, h: 0.26, fontSize: 9.5, bold: true, color: corTitulo ?? C.ciano, charSpacing: 1, fontFace: F, shrinkText: true })
}

function bullets(sl: Slide, x: number, y: number, w: number, h: number, itens: { t: string; sub?: string; cor?: string }[], fontSize = 11) {
  const linhas: object[] = []
  itens.forEach(it => {
    linhas.push({ text: it.t, options: { fontSize, bold: true, color: it.cor ?? C.branco, bullet: { code: '2022', color: C.ciano }, paraSpaceBefore: 6, fontFace: F } })
    if (it.sub) linhas.push({ text: it.sub, options: { fontSize: fontSize - 1.5, color: C.gelo, bullet: false, indentLevel: 1, paraSpaceBefore: 2, fontFace: F } })
  })
  sl.addText(linhas as never, { x, y, w, h, valign: 'top', shrinkText: true })
}

function setaGanho(p: P, sl: Slide, x: number, y: number, w: number, rot: string, de: string, para: string) {
  sl.addText(rot.toUpperCase(), { x, y, w, h: 0.22, fontSize: 8.5, bold: true, color: C.cinza, fontFace: F, shrinkText: true })
  sl.addText([
    { text: de, options: { fontSize: 12, color: C.cinza2, strike: true, fontFace: F } },
    { text: '  →  ', options: { fontSize: 12, color: C.cinza, fontFace: F } },
    { text: para, options: { fontSize: 17, bold: true, color: C.verde, fontFace: F } },
  ], { x, y: y + 0.2, w, h: 0.42, shrinkText: true })
}

const brl = (n: number) => `R$ ${Math.round(n).toLocaleString('pt-BR')}`

/* ════════════════════════════════ DECK 1 · DIRETORIA ═══════════════════════ */
async function deckDiretoria() {
  const p = new pptxgen()
  p.defineLayout({ name: 'W', width: W, height: H })
  p.layout = 'W'
  p.author = 'Caique Oliveira · Klenilson Paiva'
  p.title = 'Smart Dealer — Apresentação à Diretoria'
  let n = 0

  /* 1 · Capa */
  {
    const sl = novo(p)
    sl.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.bg }, line: { type: 'none' } })
    sl.addShape(p.ShapeType.rect, { x: 0, y: H - 1.1, w: W, h: 1.1, fill: { color: C.navy }, line: { type: 'none' } })
    sl.addShape(p.ShapeType.rect, { x: 0, y: H - 1.14, w: W, h: 0.04, fill: { color: C.ciano }, line: { type: 'none' } })
    sl.addText('APRESENTAÇÃO À DIRETORIA · AGOSTO 2026', { x: MG, y: 1.5, w: COL, h: 0.3, fontSize: 12, bold: true, color: C.ciano, charSpacing: 4, fontFace: F })
    sl.addText([
      { text: 'SMART ', options: { color: C.branco } },
      { text: 'DEALER', options: { color: C.cianoSuave } },
    ], { x: MG, y: 1.9, w: COL, h: 1.3, fontSize: 66, bold: true, fontFace: F })
    sl.addText('Plataforma Inteligente de Gestão da Experiência do Cliente', { x: MG, y: 3.2, w: COL, h: 0.4, fontSize: 17, color: C.gelo, fontFace: F })
    sl.addText('Do piloto na Nippon Motos ao padrão da rede Yamaha — nacional e além.', { x: MG, y: 3.7, w: COL, h: 0.35, fontSize: 13, italic: true, color: C.cinza, fontFace: F })
    sl.addText('Caique Oliveira  ·  Klenilson Paiva          YAMAHA WAY 2026 · GRUPO SHOGUN RIDERS · NIPPON MOTOS', { x: MG, y: H - 0.85, w: COL, h: 0.4, fontSize: 11, color: C.gelo, fontFace: F })
  }

  /* 2 · A pergunta */
  {
    const sl = novo(p); n = 2
    faixaTopo(p, sl)
    sl.addText([
      { text: 'A Yamaha conhece seus clientes tão bem quanto\n', options: { color: C.branco } },
      { text: 'Amazon, Netflix ou Nubank?', options: { color: C.cianoSuave } },
    ], { x: MG, y: 2.1, w: COL, h: 1.8, fontSize: 36, bold: true, align: 'center', fontFace: F })
    sl.addText('O padrão de comparação do cliente não é outra concessionária.\nÉ a melhor experiência digital que ele já teve.', { x: MG, y: 4.2, w: COL, h: 0.9, fontSize: 15, color: C.cinza, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 3 · O problema */
  {
    const sl = novo(p); n++
    cab(p, sl, 'O problema', 'Os dados existem. A inteligência, não.')
    let y = kpiRow(p, sl, 1.5, [
      { rot: 'Sistemas isolados', val: '9+', sub: 'CRM, Banco, Consórcio, Seguros, NPS, DMS, planilhas...' },
      { rot: 'Tempo por análise', val: '30min–3h', sub: 'abrir, cruzar e analisar manualmente', cor: C.verm },
      { rot: 'Oportunidades', val: 'invisíveis', sub: 'aprovado + estoque + campanha ativa = ninguém viu', cor: C.ambar },
    ])
    painel(p, sl, MG, y + 0.25, COL, 3.3, 'O que se perde todos os dias, em todas as concessionárias')
    bullets(sl, MG + 0.25, y + 0.65, COL - 0.5, 2.8, [
      { t: 'Cliente com crédito RECUSADO nunca mais é procurado', sub: 'sendo que o Liberacred já o aprovou de novo — a segunda chance morre no relatório' },
      { t: 'Proposta APROVADA que não vira venda fica parada semanas', sub: 'a venda já estava ganha; ninguém cobra o desfecho' },
      { t: 'Contrato QUITANDO = cliente voltando ao mercado', sub: 'quem chama primeiro leva — hoje, quase sempre, é o concorrente' },
      { t: 'Frota vendida rodando SEM seguro, revisão vencida sem aviso', sub: 'receita recorrente evaporando no pós-venda' },
    ], 11.5)
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 4 · A prova: piloto rodando */
  {
    const sl = novo(p); n++
    cab(p, sl, 'A prova', 'Não é conceito: está rodando na Nippon Motos', '4 lojas · piloto pago pela CCY')
    let y = kpiRow(p, sl, 1.5, [
      { rot: 'Carta de julho', val: '90,0%', sub: '144/160 motos → R$ 7.500 garantidos na campanha', cor: C.verde },
      { rot: 'Absorção pós-vendas', val: '30% → 49%', sub: 'rumo à meta de 65% (K2 lido do DRE)', cor: C.verde },
      { rot: '1ª resposta ao lead', val: '3h47 → 8min', sub: '81% atendidos em ≤10 minutos', cor: C.verde },
      { rot: 'Satisfação (pesquisa)', val: '3,6 → 4,5', sub: 'clientes antes × depois do piloto', cor: C.verde },
    ], 1.2)
    painel(p, sl, MG, y + 0.25, COL / 2 - 0.1, 3.15, 'O que a plataforma já entrega')
    bullets(sl, MG + 0.22, y + 0.65, COL / 2 - 0.5, 2.6, [
      { t: '19 módulos em produção', sub: 'varejo, performance, market share, K2, crédito, campanhas, CRM, pós-vendas, NPS...' },
      { t: 'PDCA oficial Yamaha em 1 clique', sub: 'de horas de análise para segundos — formato da regional' },
      { t: 'Atualização mensal sem redigitação', sub: 'planilha de emplacamento publicada uma vez, telas atualizam sozinhas' },
    ], 10.5)
    painel(p, sl, MG + COL / 2 + 0.1, y + 0.25, COL / 2 - 0.1, 3.15, 'Quem valida')
    bullets(sl, MG + COL / 2 + 0.32, y + 0.65, COL / 2 - 0.5, 2.6, [
      { t: 'A Nippon paga o piloto (R$ 600/mês)', sub: 'usa no dia a dia — os dados são da operação real' },
      { t: 'Consultor da regional acompanha', sub: 'mesmo método já aplicado em PDCAs de outro grupo (NOBRE Motos)' },
      { t: 'Os 9 grupos da regional já estão na base', sub: 'estrutura multi-grupo pronta desde o dia 1' },
    ], 10.5)
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 5 · O que é */
  {
    const sl = novo(p); n++
    cab(p, sl, 'A plataforma', 'O Centro de Inteligência da Rede Yamaha')
    const fontes = ['Vendas', 'Leads', 'Banco Yamaha', 'Consórcio', 'Seguros', 'Pós-venda', 'NPS', 'Campanhas', 'Estoque', 'Kaizen']
    const cw = 2.2, ch = 0.52
    fontes.forEach((f2, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const x = MG + col * (cw + 0.15), y = 1.7 + row * (ch + 0.14)
      painel(p, sl, x, y, cw, ch)
      sl.addText(f2, { x, y, w: cw, h: ch, fontSize: 10.5, bold: true, color: C.gelo, align: 'center', valign: 'middle', fontFace: F })
    })
    sl.addShape(p.ShapeType.rightArrow, { x: MG + 4.75, y: 3.1, w: 1.0, h: 0.65, fill: { color: C.azul }, line: { type: 'none' } })
    sl.addShape(p.ShapeType.roundRect, { x: MG + 6.0, y: 2.35, w: 3.0, h: 2.2, fill: { color: C.navy }, line: { color: C.ciano, width: 1.5 }, rectRadius: 0.1 })
    sl.addText('SMART\nDEALER', { x: MG + 6.0, y: 2.55, w: 3.0, h: 1.0, fontSize: 22, bold: true, color: C.branco, align: 'center', fontFace: F })
    sl.addText('IA analítica + regras\nYamaha codificadas', { x: MG + 6.0, y: 3.6, w: 3.0, h: 0.7, fontSize: 10, color: C.cianoSuave, align: 'center', fontFace: F })
    sl.addShape(p.ShapeType.rightArrow, { x: MG + 9.25, y: 3.1, w: 1.0, h: 0.65, fill: { color: C.azul }, line: { type: 'none' } })
    const saidas = [
      ['Oportunidades', 'identificadas sozinhas'],
      ['Alertas', 'operacionais na hora'],
      ['Jornada', 'completa do cliente'],
      ['Decisão', 'recomendada com IA'],
    ]
    saidas.forEach((s, i) => {
      const y = 1.75 + i * 0.95
      painel(p, sl, MG + 10.45, y, COL - 10.45, 0.82)
      sl.addText([
        { text: s[0] + '\n', options: { fontSize: 11, bold: true, color: C.branco } },
        { text: s[1], options: { fontSize: 8.5, color: C.cinza } },
      ], { x: MG + 10.6, y: y + 0.06, w: COL - 10.75, h: 0.72, valign: 'middle', fontFace: F })
    })
    sl.addText('Uma plataforma. Todas as áreas. A CCY inteligente gerencia experiências — não sistemas.', { x: MG, y: 6.35, w: COL, h: 0.35, fontSize: 12.5, italic: true, color: C.gelo, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 6 · Banco Yamaha */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Novidade · Banco Yamaha', 'Recusado não é fim de linha — é a próxima venda', 'módulo em produção')
    let y = 1.5
    painel(p, sl, MG, y, COL, 1.9, 'Funil Liberacred (trimestre · Nippon)')
    const etapas = [['62', 'recusados no CDC'], ['23', 'elegíveis Liberacred'], ['14', 'contatados'], ['5', 'convertidos em venda']]
    const ew = (COL - 0.5 - 0.45 * 3) / 4
    etapas.forEach((e, i) => {
      const x = MG + 0.25 + i * (ew + 0.45)
      sl.addText(e[0], { x, y: y + 0.5, w: ew, h: 0.6, fontSize: 30, bold: true, color: i === 3 ? C.verde : C.branco, align: 'center', fontFace: F })
      sl.addText(e[1], { x, y: y + 1.15, w: ew, h: 0.5, fontSize: 10, color: C.cinza, align: 'center', fontFace: F, shrinkText: true })
      if (i < 3) sl.addShape(p.ShapeType.rightArrow, { x: x + ew + 0.05, y: y + 0.72, w: 0.32, h: 0.28, fill: { color: C.azul2 }, line: { type: 'none' } })
    })
    y += 2.15
    painel(p, sl, MG, y, COL * 0.56, 2.9, 'A virada de chave: Liberacred como prêmio')
    sl.addShape(p.ShapeType.roundRect, { x: MG + 0.2, y: y + 0.5, w: COL * 0.56 - 0.4, h: 1.55, fill: { color: '0E2A1E' }, line: { color: C.verde, width: 1 }, rectRadius: 0.08 })
    sl.addText('"Parabéns! Você acaba de ser APROVADO no Liberacred do Banco Yamaha. Sua NMAX está garantida com condições especiais — sem nova análise. Posso te mandar a simulação agora?"', { x: MG + 0.35, y: y + 0.6, w: COL * 0.56 - 0.7, h: 1.35, fontSize: 10.5, italic: true, color: C.gelo, fontFace: F, valign: 'middle', shrinkText: true })
    sl.addText('Mensagem disparada pelo vendedor em 1 clique — comunicada como conquista, nunca como recusa.', { x: MG + 0.2, y: y + 2.2, w: COL * 0.56 - 0.4, h: 0.55, fontSize: 9.5, color: C.cinza, fontFace: F, shrinkText: true })
    painel(p, sl, MG + COL * 0.56 + 0.15, y, COL * 0.44 - 0.15, 2.9, 'E mais duas frentes no mesmo módulo')
    bullets(sl, MG + COL * 0.56 + 0.35, y + 0.45, COL * 0.44 - 0.55, 2.35, [
      { t: 'Aprovados e não pagos', sub: 'R$ 91 mil em vendas já ganhas paradas — motivo mapeado + ação sugerida por cliente' },
      { t: 'Contratos quitando', sub: 'cliente voltando ao mercado com score de recompra e sugestão de upgrade — chame antes do concorrente' },
    ], 10.5)
    rodape(sl, 'Smart Dealer · Diretoria · cenário demonstrativo com estrutura dos painéis oficiais', n)
  }

  /* 7 · Fidelização que paga */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Novidade · Fidelização', 'Premya, Seguros e Consórcio — dinheiro deixado na mesa', 'módulos em produção')
    const y = 1.5, cw2 = (COL - 0.4) / 3
    painel(p, sl, MG, y, cw2, 4.6, 'Premya · Banco Yamaha', C.ambar)
    bullets(sl, MG + 0.2, y + 0.45, cw2 - 0.4, 4.0, [
      { t: 'Folder oficial codificado', sub: 'Índice de Fidelidade calculado EM CURSO, não só na apuração mensal' },
      { t: 'Hoje: BRONZE (71,6%)', sub: 'cada proposta paga em outro banco derruba o índice', cor: C.ambar },
      { t: 'Subir p/ OURO vale +R$ 148 mil/ano', sub: 'incentivo 1,5% sobre o liberado + floor plan −0,20 p.p. Simulador na tela.', cor: C.verde },
    ], 10.5)
    painel(p, sl, MG + cw2 + 0.2, y, cw2, 4.6, 'Yamaha Seguros', C.cianoSuave)
    bullets(sl, MG + cw2 + 0.4, y + 0.45, cw2 - 0.4, 4.0, [
      { t: 'Penetração 33,6% · meta 45%', sub: '110 motos × 37 seguros em julho (painel oficial)' },
      { t: 'Frota circulante: 2.840 motos', sub: 'só 618 com apólice ativa — 141 renovações no radar agora' },
      { t: '+R$ 39 mil/ano fechando o gap', sub: 'comissão adicional sem vender uma moto a mais', cor: C.verde },
    ], 10.5)
    painel(p, sl, MG + (cw2 + 0.2) * 2, y, cw2, 4.6, 'Consórcio', C.verde)
    bullets(sl, MG + (cw2 + 0.2) * 2 + 0.2, y + 0.45, cw2 - 0.4, 4.0, [
      { t: 'Carteira: 486 cotas ativas', sub: 'R$ 10,4 mi em crédito · retenção 94,5%' },
      { t: 'Bônus Quality garantido', sub: 'adimplência 91,4% + cancelamento 8,7% → R$ 11,8 mil no trimestre', cor: C.verde },
      { t: 'Contemplado compra AQUI', sub: '81% de conversão — alerta ao vendedor na semana da assembleia' },
    ], 10.5)
    rodape(sl, 'Smart Dealer · Diretoria · cenários demonstrativos sobre regras oficiais', n)
  }

  /* 8 · Governança do CRM */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Novidade · Governança', 'CRM com cobrança configurada — não com boa vontade')
    let y = 1.5
    painel(p, sl, MG, y, COL, 1.55, 'Mesma equipe, mesmos leads — antes × depois da governança')
    const ganhos: [string, string, string][] = [
      ['1ª resposta', '3h 47min', '8 min'],
      ['SLA ≤10 min', '22%', '81%'],
      ['Conversão', '8,1%', '13,9%'],
      ['Sem resposta', '32%', '2%'],
      ['Follow-up feito', '41%', '94%'],
    ]
    const gw = (COL - 0.5) / 5
    ganhos.forEach((g, i) => setaGanho(p, sl, MG + 0.25 + i * gw, y + 0.5, gw - 0.15, g[0], g[1], g[2]))
    y += 1.8
    painel(p, sl, MG, y, COL * 0.52, 3.0, 'A régua de cobrança (resumo)')
    bullets(sl, MG + 0.2, y + 0.45, COL * 0.52 - 0.4, 2.5, [
      { t: '10 min → SLA estourado fica vermelho no painel' },
      { t: '15 min → o lead sobe para o WhatsApp do GERENTE' },
      { t: '2 h → redistribuição automática no rodízio' },
      { t: 'D+1 · D+3 · D+7 → follow-ups obrigatórios com roteiro' },
    ], 10.5)
    painel(p, sl, MG + COL * 0.52 + 0.15, y, COL * 0.48 - 0.15, 3.0, 'Regionalização + perdas que viram frente')
    bullets(sl, MG + COL * 0.52 + 0.35, y + 0.45, COL * 0.48 - 0.55, 2.5, [
      { t: '4 lojas, cada lead cai na loja certa', sub: 'rodízio ponderado por conversão do vendedor' },
      { t: '"Crédito recusado" → vira oportunidade Liberacred', sub: 'motivo de perda alimenta o módulo do Banco automaticamente' },
    ], 10.5)
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 9 · IA */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Inteligência artificial', 'Claude: um cérebro, um chat universal para toda a operação', 'by Anthropic')
    let y = 1.5
    const casos: [string, string, string][] = [
      ['Vendedor', '"Qual o bônus da NMAX este mês?"', 'O robô já leu as circulares CA-MTC028–033: responde valor, custeio e regra de acúmulo na hora.'],
      ['Mecânico', '"Procedimento de revisão dos 6.000 km da Fazer 250?"', 'Consulta o manual técnico oficial e responde com a seção citada.'],
      ['Gerente', '"Onde estou perdendo share?"', 'Cruza emplacamento, segmentos e concorrentes — resposta com números e fonte.'],
      ['Financeiro', '"Quais aprovados não foram pagos?"', 'Lista clientes, motivo e ação sugerida — direto da base do Banco.'],
    ]
    casos.forEach((cs, i) => {
      const col = i % 2, row = Math.floor(i / 2)
      const x = MG + col * (COL / 2 + 0.075), w2 = COL / 2 - 0.075
      const yy = y + row * 1.75
      painel(p, sl, x, yy, w2, 1.6, cs[0], C.cianoSuave)
      sl.addText(cs[1], { x: x + 0.2, y: yy + 0.42, w: w2 - 0.4, h: 0.3, fontSize: 11, bold: true, italic: true, color: C.branco, fontFace: F, shrinkText: true })
      sl.addText(cs[2], { x: x + 0.2, y: yy + 0.75, w: w2 - 0.4, h: 0.75, fontSize: 9.5, color: C.cinza, fontFace: F, valign: 'top', shrinkText: true })
    })
    sl.addText('Novidade de agosto: as circulares da montadora entram no robô no dia em que são publicadas — a rede inteira responde igual, sem depender de memória.', { x: MG, y: y + 3.6, w: COL, h: 0.55, fontSize: 11.5, italic: true, color: C.gelo, align: 'center', fontFace: F, shrinkText: true })
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 10 · Voz do cliente */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Novidade · Voz do cliente', 'Fatores de compra medidos, não achados', 'pesquisa 28/07–14/08 · 32 respostas')
    let y = kpiRow(p, sl, 1.5, [
      { rot: 'Satisfação', val: '4,5/5', sub: 'como foi ser atendido?', cor: C.verde },
      { rot: 'NPS da pesquisa', val: '72', sub: 'promotores − detratores' },
      { rot: 'Decide a compra', val: 'parcela 72%', sub: 'depois: rapidez 66% · crédito 56%' },
      { rot: 'Não comprou por quê?', val: 'crédito 43%', sub: 'exatamente o público do Liberacred', cor: C.ambar },
    ])
    y += 0.25
    painel(p, sl, MG, y, COL, 2.9, 'Na voz do cliente')
    const falas = [
      ['"Me responderam em uns cinco minutos. Na outra loja eu esperei dois dias e desisti."', 'C. Eduardo · comprou'],
      ['"Meu crédito não passou e ninguém mais me procurou. Se tivessem uma segunda opção eu tinha fechado."', 'J. Vitor · não comprou'],
      ['"Voltar eu volto se vocês me avisarem da revisão. Da última vez passou do prazo e eu nem vi."', 'A. Paulo · comprou'],
    ]
    const fw = (COL - 0.7) / 3
    falas.forEach((f2, i) => {
      const x = MG + 0.2 + i * (fw + 0.15)
      sl.addShape(p.ShapeType.roundRect, { x, y: y + 0.5, w: fw, h: 1.85, fill: { color: C.bg2 }, line: { color: C.borda, width: 0.75 }, rectRadius: 0.08 })
      sl.addText(f2[0], { x: x + 0.15, y: y + 0.62, w: fw - 0.3, h: 1.3, fontSize: 10, italic: true, color: C.gelo, fontFace: F, valign: 'top', shrinkText: true })
      sl.addText(f2[1], { x: x + 0.15, y: y + 1.98, w: fw - 0.3, h: 0.3, fontSize: 8.5, bold: true, color: C.cianoSuave, fontFace: F })
    })
    sl.addText('Cada dor citada tem um módulo respondendo: rapidez → SLA 10 min · crédito → Liberacred · revisão → régua automática.', { x: MG, y: y + 3.0, w: COL, h: 0.4, fontSize: 11, italic: true, color: C.cinza, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 11 · Jornada completa */
  {
    const sl = novo(p); n++
    cab(p, sl, 'A tese', 'A moto a vida inteira: o ciclo que nunca devolve o cliente ao mercado')
    const etapas = ['Lead\n≤10 min', 'Venda\n+ campanha\nda circular', 'Financiamento\nBYMD 1º\n(Premya)', 'Seguro\nna entrega', 'Revisões\nR1→R4\nrégua', 'Quitação\n= recompra', 'Nova\nvenda']
    const ew = (COL - 0.3 * 6) / 7
    etapas.forEach((e, i) => {
      const x = MG + i * (ew + 0.3)
      const ativo = i === 6
      sl.addShape(p.ShapeType.roundRect, { x, y: 3.0, w: ew, h: 1.7, fill: { color: ativo ? C.navy : C.painel }, line: { color: ativo ? C.ciano : C.borda, width: ativo ? 1.5 : 0.75 }, rectRadius: 0.1 })
      sl.addText(e, { x, y: 3.0, w: ew, h: 1.7, fontSize: 10, bold: true, color: C.branco, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
      if (i < 6) sl.addShape(p.ShapeType.rightArrow, { x: x + ew + 0.02, y: 3.7, w: 0.26, h: 0.3, fill: { color: C.azul2 }, line: { type: 'none' } })
    })
    sl.addShape(p.ShapeType.line, { x: MG + 6 * (ew + 0.3) + ew / 2, y: 4.7, w: 0, h: 0.5, line: { color: C.ciano, width: 1.5, dashType: 'dash' } })
    sl.addText('↺ o ciclo recomeça — dentro da rede Yamaha', { x: MG, y: 5.3, w: COL, h: 0.35, fontSize: 12, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    sl.addText('Cada etapa alimenta a seguinte com dados. É isso que nenhum sistema isolado consegue fazer.', { x: MG, y: 5.8, w: COL, h: 0.4, fontSize: 13, color: C.gelo, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 12 · Payback */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Payback & viabilidade', 'Retorno mensurável — números do piloto, anualizados')
    let y = kpiRow(p, sl, 1.5, [
      { rot: 'Campanhas da montadora', val: '~R$ 400 mil/ano', sub: 'prêmios + vouchers capturados por disciplina de carta', cor: C.verde },
      { rot: 'Gap de absorção (K2)', val: '~R$ 490 mil/ano', sub: 'MC de pós-vendas para chegar aos 65%', cor: C.verde },
      { rot: 'Premya + Seguros + Consórcio', val: '~R$ 200 mil/ano', sub: 'categoria Ouro + gap de penetração + Bônus Quality', cor: C.verde },
    ], 1.25)
    y += 0.3
    painel(p, sl, MG, y, COL * 0.55, 2.9, 'Ganhos esperados no rollout (por CCY)')
    bullets(sl, MG + 0.2, y + 0.45, COL * 0.55 - 0.4, 2.4, [
      { t: '+8% varejo · +15% conversão de leads', sub: 'SLA + governança de CRM + campanhas aplicadas na proposta' },
      { t: '+10% aprovação financeira', sub: 'submissão disciplinada ao BYMD + resgate Liberacred' },
      { t: '+5 pts NPS e fidelização', sub: 'régua de revisão + recompra na quitação' },
    ], 11)
    painel(p, sl, MG + COL * 0.55 + 0.15, y, COL * 0.45 - 0.15, 2.9, 'Custo de operação')
    bullets(sl, MG + COL * 0.55 + 0.35, y + 0.45, COL * 0.45 - 0.55, 2.4, [
      { t: 'SaaS: R$ 600/mês por CCY no piloto', sub: 'sem instalação, sem hardware, sem projeto de TI local' },
      { t: 'Payback < 1 mês', sub: 'um único prêmio de campanha capturado paga o ano inteiro', cor: C.verde },
    ], 11)
    rodape(sl, 'Smart Dealer · Diretoria · estimativas sobre o piloto Nippon', n)
  }

  /* 13 · Escala */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Escala', 'De 1 concessionária ao padrão mundial — a arquitetura já nasceu pronta')
    const fases: [string, string, string, string][] = [
      ['HOJE', 'Piloto Nippon', '4 lojas · 19 módulos em produção · pago pela CCY', C.verde],
      ['FASE 2 · SET–DEZ/26', 'Regional', '9 grupos já cadastrados na base — falta só criar os acessos', C.ciano],
      ['FASE 3 · 2027', 'Nacional', 'SaaS multi-grupo: replicar = configurar, não reprogramar', C.azul2],
      ['VISÃO', 'Global Yamaha', 'o know-how (dois relógios, K2, PDCA, circulares) vira padrão exportável', C.ambar],
    ]
    const fw = (COL - 0.6) / 4
    fases.forEach((f2, i) => {
      const x = MG + i * (fw + 0.2)
      sl.addShape(p.ShapeType.roundRect, { x, y: 1.9, w: fw, h: 3.4, fill: { color: C.painel }, line: { color: f2[3], width: i === 0 ? 2 : 1 }, rectRadius: 0.1 })
      sl.addText(f2[0], { x: x + 0.15, y: 2.1, w: fw - 0.3, h: 0.3, fontSize: 9.5, bold: true, color: f2[3], charSpacing: 1, fontFace: F, shrinkText: true })
      sl.addText(f2[1], { x: x + 0.15, y: 2.45, w: fw - 0.3, h: 0.5, fontSize: 17, bold: true, color: C.branco, fontFace: F, shrinkText: true })
      sl.addText(f2[2], { x: x + 0.15, y: 3.05, w: fw - 0.3, h: 2.0, fontSize: 10.5, color: C.gelo, fontFace: F, valign: 'top', shrinkText: true })
      if (i < 3) sl.addShape(p.ShapeType.rightArrow, { x: x + fw + 0.0, y: 3.35, w: 0.22, h: 0.32, fill: { color: C.azul2 }, line: { type: 'none' } })
    })
    sl.addText('A vantagem competitiva não é o software — é o método Yamaha codificado dentro dele.', { x: MG, y: 5.7, w: COL, h: 0.4, fontSize: 13.5, bold: true, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · Diretoria', n)
  }

  /* 14 · O pedido */
  {
    const sl = novo(p); n++
    faixaTopo(p, sl)
    sl.addText('O PEDIDO DESTA REUNIÃO', { x: MG, y: 1.7, w: COL, h: 0.3, fontSize: 12, bold: true, color: C.ciano, charSpacing: 3, align: 'center', fontFace: F })
    sl.addText('Aprovar a Fase 2: levar o Smart Dealer\naos 9 grupos da regional ainda em 2026.', { x: MG, y: 2.2, w: COL, h: 1.4, fontSize: 30, bold: true, color: C.branco, align: 'center', fontFace: F })
    const itens = ['Piloto validado e pago pela própria CCY', 'Estrutura multi-grupo pronta — 9 grupos já na base', 'Payback < 1 mês por concessionária']
    itens.forEach((t, i) => {
      const w2 = 3.9, x = MG + i * (w2 + 0.16)
      sl.addShape(p.ShapeType.roundRect, { x, y: 4.0, w: w2, h: 0.95, fill: { color: C.painel }, line: { color: C.borda, width: 0.75 }, rectRadius: 0.08 })
      sl.addText('✓  ' + t, { x: x + 0.15, y: 4.0, w: w2 - 0.3, h: 0.95, fontSize: 11, bold: true, color: C.verde, valign: 'middle', fontFace: F, shrinkText: true })
    })
    sl.addText('"O Smart Dealer é mais do que uma plataforma tecnológica.\nÉ um novo padrão de relacionamento entre cliente, concessionária e Yamaha."', { x: MG, y: 5.4, w: COL, h: 0.9, fontSize: 14, italic: true, color: C.gelo, align: 'center', fontFace: F })
    sl.addText('YAMAHA WAY 2026 · GRUPO SHOGUN RIDERS · NIPPON MOTOS', { x: MG, y: H - 0.55, w: COL, h: 0.3, fontSize: 9, color: C.cinza2, align: 'center', charSpacing: 2, fontFace: F })
  }

  await p.writeFile({ fileName: '_NOVAS MELHORIAS/DECK-DIRETORIA-SMART-DEALER.pptx' })
  console.log('✓ DECK-DIRETORIA-SMART-DEALER.pptx (14 slides)')
}

/* ════════════════════════════════ DECK 2 · BANCA ═══════════════════════════ */
async function deckBanca() {
  const p = new pptxgen()
  p.defineLayout({ name: 'W', width: W, height: H })
  p.layout = 'W'
  p.author = 'Grupo 06 — Shogun Riders'
  p.title = 'Smart Dealer — 2ª Banca YamahaWay 2026'
  let n = 1

  /* 1 · Capa */
  {
    const sl = novo(p)
    sl.addShape(p.ShapeType.rect, { x: 0, y: H - 1.1, w: W, h: 1.1, fill: { color: C.navy }, line: { type: 'none' } })
    sl.addShape(p.ShapeType.rect, { x: 0, y: H - 1.14, w: W, h: 0.04, fill: { color: C.ciano }, line: { type: 'none' } })
    sl.addText('YAMAHA WAY 2026 · 2ª BANCA · GRUPO 06 — SHOGUN RIDERS', { x: MG, y: 1.5, w: COL, h: 0.3, fontSize: 12, bold: true, color: C.ciano, charSpacing: 3, fontFace: F })
    sl.addText([
      { text: 'SMART ', options: { color: C.branco } },
      { text: 'DEALER', options: { color: C.cianoSuave } },
    ], { x: MG, y: 1.9, w: COL, h: 1.3, fontSize: 66, bold: true, fontFace: F })
    sl.addText('Como transformar dados em experiências memoráveis?', { x: MG, y: 3.2, w: COL, h: 0.4, fontSize: 17, color: C.gelo, fontFace: F })
    sl.addText('Da 1ª banca para cá: cada apontamento de vocês virou entrega. Esta é a prestação de contas.', { x: MG, y: 3.7, w: COL, h: 0.35, fontSize: 13, italic: true, color: C.cinza, fontFace: F })
    sl.addText('Piloto real: NIPPON MOTOS · Bragança Paulista, Atibaia, Amparo e Extrema', { x: MG, y: H - 0.85, w: COL, h: 0.4, fontSize: 11, color: C.gelo, fontFace: F })
  }

  /* 2 · Feedback → resposta */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Prestação de contas', 'O que a banca apontou — e o que fizemos com cada ponto')
    const linhas: [string, string][] = [
      ['"Qual a vantagem competitiva? Software qualquer um faz."', 'A vantagem é o COMO: regras Yamaha codificadas (carta, K2, Kaizen, circulares, Premya). Slide de benchmark nesta apresentação.'],
      ['"Faltou pesquisa com o cliente final."', 'Feita: 32 respostas, satisfação 4,5/5, NPS 72, fatores de compra tabulados — dashboards ao vivo na tela Voz do Cliente.'],
      ['"Cadê as hipóteses e as metas do projeto?"', '3 hipóteses no formato "se X, então Y — medido por Z" + 3 metas públicas com prazo. Todas medidas pelo sistema.'],
      ['"O limbo do lead é a dor real." (Cintia)', 'Governança de CRM: SLA 10 min, escalonamento ao gerente, redistribuição — leads sem resposta caíram de 32% para 2%.'],
    ]
    let y = 1.55
    linhas.forEach(l => {
      painel(p, sl, MG, y, COL, 1.14)
      sl.addText(l[0], { x: MG + 0.2, y: y + 0.1, w: COL * 0.42, h: 0.95, fontSize: 10.5, italic: true, color: C.ambar, valign: 'middle', fontFace: F, shrinkText: true })
      sl.addShape(p.ShapeType.rightArrow, { x: MG + COL * 0.44, y: y + 0.42, w: 0.3, h: 0.3, fill: { color: C.verde }, line: { type: 'none' } })
      sl.addText(l[1], { x: MG + COL * 0.47, y: y + 0.1, w: COL * 0.51, h: 0.95, fontSize: 10.5, color: C.gelo, valign: 'middle', fontFace: F, shrinkText: true })
      y += 1.3
    })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 3 · Objetivo + metas */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Planejamento e objetivos', 'Um objetivo. Três metas públicas. Sempre as mesmas.')
    sl.addShape(p.ShapeType.roundRect, { x: MG, y: 1.6, w: COL, h: 1.15, fill: { color: C.navy }, line: { color: C.ciano, width: 1.5 }, rectRadius: 0.1 })
    sl.addText('"Aumentar o atingimento de carta e a absorção do pós-vendas da Nippon Motos\nusando decisão guiada por dados — medido por três metas públicas."', { x: MG + 0.3, y: 1.6, w: COL - 0.6, h: 1.15, fontSize: 15, bold: true, italic: true, color: C.branco, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
    const metas: [string, string, string, string][] = [
      ['META 1', 'Carta ≥ 100%', 'em setembro/2026', 'jul fechou em 90,0% — prêmio da campanha em jogo'],
      ['META 2', 'Absorção 65%', 'até dezembro/2026', 'saímos de 30% e já estamos em 49,4% (K2 do DRE)'],
      ['META 3', 'Lead ≤ 10 min', 'padrão de atendimento', 'hoje 81% dentro do SLA — era 22% antes do piloto'],
    ]
    const mw = (COL - 0.4) / 3
    metas.forEach((m, i) => {
      const x = MG + i * (mw + 0.2)
      painel(p, sl, x, 3.1, mw, 2.6, m[0], C.ambar)
      sl.addText(m[1], { x: x + 0.18, y: 3.55, w: mw - 0.36, h: 0.55, fontSize: 24, bold: true, color: C.verde, fontFace: F, shrinkText: true })
      sl.addText(m[2], { x: x + 0.18, y: 4.1, w: mw - 0.36, h: 0.3, fontSize: 11, bold: true, color: C.gelo, fontFace: F })
      sl.addText(m[3], { x: x + 0.18, y: 4.45, w: mw - 0.36, h: 1.1, fontSize: 10, color: C.cinza, fontFace: F, valign: 'top', shrinkText: true })
    })
    sl.addText('O sistema mede as três, ao vivo — a meta virou compromisso público, não promessa.', { x: MG, y: 5.95, w: COL, h: 0.35, fontSize: 12, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 4 · Hipóteses */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Pesquisa', 'Três hipóteses testáveis — e a prova de cada uma')
    const hips: [string, string, string][] = [
      ['H1 · Se o lead é atendido em ≤10 minutos, a conversão sobe.', 'MEDIDO: SLA no CRM + pesquisa', 'Atendidos em ≤10 min: 22% → 81%. Conversão: 8,1% → 13,9%. Na pesquisa, 66% citam rapidez como fator de compra.'],
      ['H2 · Se o plano de ação nasce dos números, ele é executado.', 'MEDIDO: PDCA gerado do sistema', 'PDCA oficial sai em 1 clique com ações nascidas de mercado, segmento e praça — e é o que a regional acompanha.'],
      ['H3 · Se o pós-vendas absorve 65%, a pressão sobre o varejo cai.', 'MEDIDO: K2 lido do DRE', 'Absorção 30% → 49,4% (pico 62,5% em março). Gap para 65% quantificado: ~R$ 41 mil/mês de MC. Régua R1–R4 ataca a evasão.'],
    ]
    let y = 1.55
    hips.forEach(h2 => {
      painel(p, sl, MG, y, COL, 1.55)
      sl.addText(h2[0], { x: MG + 0.2, y: y + 0.12, w: COL * 0.52, h: 0.65, fontSize: 12.5, bold: true, color: C.branco, fontFace: F, valign: 'top', shrinkText: true })
      sl.addText(h2[1], { x: MG + 0.2, y: y + 1.1, w: COL * 0.5, h: 0.3, fontSize: 9, bold: true, color: C.ciano, charSpacing: 1, fontFace: F })
      sl.addText(h2[2], { x: MG + COL * 0.55, y: y + 0.12, w: COL * 0.43, h: 1.35, fontSize: 10.5, color: C.gelo, fontFace: F, valign: 'middle', shrinkText: true })
      y += 1.72
    })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 5 · Benchmark */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Pesquisa · concorrentes da solução', 'O que só o Smart Dealer tem')
    const cabec = ['', 'CRM genérico', 'DMS da loja', 'Planilhas', 'SMART DEALER']
    const linhas: [string, string, string, string, string][] = [
      ['Regras Yamaha (carta, Kaizen, K2, circular)', '✗', '✗', 'manual', '✓ codificadas'],
      ['PDCA no formato oficial da regional', '✗', '✗', 'horas', '✓ 1 clique'],
      ['Liberacred: recusa vira oportunidade', '✗', '✗', '✗', '✓ automático'],
      ['Premya em curso (não só na apuração)', '✗', '✗', '✗', '✓ simulador'],
      ['Circulares no assistente de IA', '✗', '✗', '✗', '✓ no robô'],
      ['Custo mensal por CCY', 'R$ 800–2.500', 'já pago, não analisa', 'grátis e caro', 'R$ 600'],
    ]
    const colW = [4.35, 1.75, 1.75, 1.75, 2.33]
    const rows = [cabec, ...linhas].map((r, ri) => r.map((cell, ci) => ({
      text: cell,
      options: {
        fill: { color: ri === 0 ? C.navy : ci === 4 ? '0E2A1E' : C.painel },
        color: ri === 0 ? C.branco : cell.startsWith('✓') ? C.verde : cell === '✗' ? C.verm : C.gelo,
        bold: ri === 0 || ci === 0 || cell.startsWith('✓'),
        fontSize: ri === 0 ? 10 : 9.5,
        align: ci === 0 ? 'left' : 'center',
        valign: 'middle',
        fontFace: F,
      },
    })))
    sl.addTable(rows as never, { x: MG, y: 1.7, w: COL, colW, border: { pt: 0.5, color: C.borda }, rowH: 0.52 })
    sl.addText('Resposta direta à pergunta da 1ª banca: a vantagem competitiva é o método Yamaha codificado — o software é só o veículo.', { x: MG, y: 5.95, w: COL, h: 0.4, fontSize: 12, bold: true, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 6 · Pesquisa com clientes */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Foco no cliente', 'Pesquisa Voz do Cliente — feita pelo grupo, com clientes reais da Nippon', '28/07–14/08 · 32 respostas · 52% adesão')
    let y = kpiRow(p, sl, 1.5, [
      { rot: 'Amostra', val: '32', sub: '18 compraram · 14 não compraram' },
      { rot: 'Satisfação', val: '4,5/5', sub: 'era 3,6 antes do piloto', cor: C.verde },
      { rot: 'NPS da pesquisa', val: '72', sub: 'promotores − detratores', cor: C.verde },
      { rot: 'Não comprou: motivo nº 1', val: 'crédito 43%', sub: 'vira fila do Liberacred', cor: C.ambar },
    ])
    y += 0.25
    painel(p, sl, MG, y, COL * 0.55, 3.15, 'Fatores de compra (medidos, não achados)')
    const fatores: [string, number][] = [['Parcela que cabe no bolso', 72], ['Atendimento rápido', 66], ['Aprovação do crédito', 56], ['Preço / entrada', 47], ['Confiança / indicação', 38]]
    fatores.forEach((f2, i) => {
      const yy = y + 0.52 + i * 0.5
      sl.addText(f2[0], { x: MG + 0.2, y: yy, w: 2.9, h: 0.3, fontSize: 9.5, color: C.gelo, fontFace: F, shrinkText: true })
      sl.addShape(p.ShapeType.roundRect, { x: MG + 3.15, y: yy + 0.03, w: (COL * 0.55 - 4.3) * (f2[1] / 100), h: 0.24, fill: { color: C.azul2 }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(`${f2[1]}%`, { x: MG + COL * 0.55 - 0.85, y: yy, w: 0.65, h: 0.3, fontSize: 10, bold: true, color: C.branco, align: 'right', fontFace: F })
    })
    painel(p, sl, MG + COL * 0.55 + 0.15, y, COL * 0.45 - 0.15, 3.15, 'O que faria o cliente voltar')
    bullets(sl, MG + COL * 0.55 + 0.35, y + 0.45, COL * 0.45 - 0.55, 2.6, [
      { t: '59% — a loja lembrar da revisão por mim', sub: 'a régua automática faz exatamente isso', cor: C.verde },
      { t: '53% — contato pós-compra', sub: 'recontato subiu de 18% para 74% no piloto' },
      { t: '44% — oferta certa na hora da troca', sub: 'módulo de quitação sugere o upgrade' },
    ], 10.5)
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay · dashboards completos na tela Voz do Cliente', n)
  }

  /* 7 · Personas + posicionamento + 7 passos */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Foco no cliente', 'Posicionamento e os 7 passos da venda — com o sistema em cada passo')
    sl.addShape(p.ShapeType.roundRect, { x: MG, y: 1.55, w: COL, h: 0.85, fill: { color: C.navy }, line: { color: C.ciano, width: 1 }, rectRadius: 0.08 })
    sl.addText('"A Yamaha como a marca que responde o cliente em minutos e acompanha a moto a vida inteira — da primeira resposta à recompra."', { x: MG + 0.25, y: 1.55, w: COL - 0.5, h: 0.85, fontSize: 13, bold: true, italic: true, color: C.branco, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
    const passos: [string, string][] = [
      ['1. Recepção', 'lead distribuído em segundos, SLA 10 min'],
      ['2. Sondagem', 'histórico e origem do lead na tela do vendedor'],
      ['3. Apresentação', 'estoque real das 4 lojas + ficha técnica via IA'],
      ['4. Test-ride', 'agendado na cadência do CRM'],
      ['5. Negociação', 'campanha da circular aplicada na proposta'],
      ['6. Fechamento', 'financiamento BYMD primeiro (Premya) + Liberacred se recusar'],
      ['7. Entrega & pós', 'seguro na entrega, régua R1–R4, quitação → recompra'],
    ]
    const pw = (COL - 0.9) / 7
    passos.forEach((ps, i) => {
      const x = MG + i * (pw + 0.15)
      painel(p, sl, x, 2.7, pw, 2.5)
      sl.addText(ps[0], { x: x + 0.08, y: 2.85, w: pw - 0.16, h: 0.55, fontSize: 10, bold: true, color: C.cianoSuave, fontFace: F, shrinkText: true })
      sl.addText(ps[1], { x: x + 0.08, y: 3.4, w: pw - 0.16, h: 1.65, fontSize: 8.5, color: C.gelo, fontFace: F, valign: 'top', shrinkText: true })
    })
    sl.addText('6 personas atendidas: titular, gerente, vendedor, mecânico, consultor da regional — e o cliente final. Cada papel vê só o que usa (demonstração ao vivo trocando de login).', { x: MG, y: 5.5, w: COL, h: 0.55, fontSize: 11, italic: true, color: C.cinza, align: 'center', fontFace: F, shrinkText: true })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 8 · Fora da caixa: com/sem */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Pensar fora da caixa', 'Não digitalizamos o processo antigo — trocamos o processo')
    const linhas: [string, string, string][] = [
      ['Análise de performance', 'horas cruzando planilhas', 'PDCA oficial em 1 clique'],
      ['Lead sem resposta', '32% morriam no limbo', '2% — régua + escalonamento ao gerente'],
      ['Crédito recusado', 'fim da conversa', 'oportunidade Liberacred com mensagem-prêmio'],
      ['Circular da montadora', 'no e-mail de alguém', 'no robô — a loja inteira responde igual'],
      ['Índice Premya', 'descoberto na apuração', 'acompanhado em curso, com simulador'],
      ['Revisão vencida', 'cliente esquecido', 'régua R1–R4 dispara sozinha'],
    ]
    const cabec2 = ['O processo', 'ANTES', 'COM SMART DEALER']
    const rows = [cabec2, ...linhas].map((r, ri) => r.map((cell, ci) => ({
      text: cell,
      options: {
        fill: { color: ri === 0 ? C.navy : ci === 2 ? '0E2A1E' : C.painel },
        color: ri === 0 ? C.branco : ci === 1 ? C.verm : ci === 2 ? C.verde : C.gelo,
        bold: ri === 0 || ci === 0,
        fontSize: ri === 0 ? 10.5 : 10,
        align: ci === 0 ? 'left' : 'center', valign: 'middle', fontFace: F,
      },
    })))
    sl.addTable(rows as never, { x: MG, y: 1.7, w: COL, colW: [3.6, 3.9, 4.43], border: { pt: 0.5, color: C.borda }, rowH: 0.56 })
    sl.addText('O conhecimento virou método replicável: decomposição mercado×share, absorção do DRE, dois relógios — documentado e rodando.', { x: MG, y: 6.05, w: COL, h: 0.4, fontSize: 11.5, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 9 · Resultados do piloto */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Resultados', 'O que o piloto já produziu — e o número-manchete')
    let y = kpiRow(p, sl, 1.5, [
      { rot: 'Campanha Campeões', val: 'R$ 7.500', sub: 'garantidos em julho (90,0% da carta) + R$ 15 mil recuperáveis', cor: C.verde },
      { rot: 'Vouchers por modelo', val: 'R$ 66 mil', sub: 'apurados em julho + Campeões = R$ 73,5 mil', cor: C.verde },
      { rot: 'Absorção', val: '+19 p.p.', sub: 'de 30% para 49,4% — gap p/ 65% = R$ 41 mil/mês', cor: C.verde },
      { rot: 'Conversão de leads', val: '8,1 → 13,9%', sub: 'com SLA de 10 minutos governado', cor: C.verde },
    ], 1.2)
    y += 0.3
    sl.addShape(p.ShapeType.roundRect, { x: MG, y, w: COL, h: 1.5, fill: { color: '0E2A1E' }, line: { color: C.verde, width: 1.5 }, rectRadius: 0.1 })
    sl.addText('POTENCIAL ANUAL IDENTIFICADO PELO SISTEMA', { x: MG + 0.25, y: y + 0.15, w: COL - 0.5, h: 0.3, fontSize: 10, bold: true, color: C.verde, charSpacing: 2, fontFace: F })
    sl.addText([
      { text: '~R$ 1,1 milhão/ano  ', options: { fontSize: 26, bold: true, color: C.branco } },
      { text: 'em prêmios de campanha (R$ 400k) + gap do K2 (R$ 490k) + Premya/Seguros/Consórcio (R$ 200k)', options: { fontSize: 12, color: C.gelo } },
    ], { x: MG + 0.25, y: y + 0.5, w: COL - 0.5, h: 0.85, valign: 'middle', fontFace: F, shrinkText: true })
    y += 1.75
    sl.addText('A prova do compromisso: setembro fecha a campanha e a meta 1. Convidamos a banca a cobrar o resultado na apresentação final.', { x: MG, y, w: COL, h: 0.5, fontSize: 12.5, bold: true, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 10 · Equipe */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Trabalho em equipe', 'Quem fez o quê — e quem valida')
    const time: [string, string][] = [
      ['Caique Oliveira', 'Dados, método e consultoria de campo — emplacamento, K2, PDCA, circulares'],
      ['Klenilson Paiva', 'Narrativa, arquitetura da solução e apresentação'],
      ['Evandro', 'Frente comercial — CRM, playbook e cadências'],
      ['João Paulo', 'Frente pós-vendas — régua de revisões e retenção'],
      ['Camila', 'Frente cliente — pesquisa Voz do Cliente e NPS'],
    ]
    let y = 1.6
    const tw = (COL - 0.6) / 5
    time.forEach((t, i) => {
      const x = MG + i * (tw + 0.15)
      painel(p, sl, x, y, tw, 2.5)
      sl.addText(t[0], { x: x + 0.12, y: y + 0.18, w: tw - 0.24, h: 0.55, fontSize: 12, bold: true, color: C.cianoSuave, fontFace: F, shrinkText: true })
      sl.addText(t[1], { x: x + 0.12, y: y + 0.75, w: tw - 0.24, h: 1.6, fontSize: 9, color: C.gelo, fontFace: F, valign: 'top', shrinkText: true })
    })
    y += 2.75
    painel(p, sl, MG, y, COL, 1.6, 'Concessionária + grupo, de verdade')
    bullets(sl, MG + 0.22, y + 0.42, COL - 0.5, 1.1, [
      { t: 'A Nippon PAGA o piloto (R$ 600/mês) e usa no dia a dia — os dados desta apresentação são da operação real', cor: C.verde },
      { t: 'Orientador Paulo Lopes acompanhando · depoimento em vídeo do titular na apresentação final' },
    ], 11)
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 11 · Viabilidade */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Viabilidade e impacto', 'Replicar é configurar, não reprogramar')
    const y = 1.55
    painel(p, sl, MG, y, COL / 2 - 0.1, 3.3, 'Prontos para escalar')
    bullets(sl, MG + 0.22, y + 0.45, COL / 2 - 0.5, 2.75, [
      { t: 'Os 9 grupos da regional já estão na base', sub: 'varejo e metas multi-grupo desde o dia 1 — falta só o acesso de cada um' },
      { t: 'SaaS sem instalação · R$ 600/mês', sub: 'sem hardware, sem projeto de TI — payback com um prêmio de campanha' },
      { t: 'Governança parametrizável por grupo', sub: 'régua, regionalização e cadências são configuração' },
    ], 11)
    painel(p, sl, MG + COL / 2 + 0.1, y, COL / 2 - 0.1, 3.3, 'Prova de replicabilidade')
    bullets(sl, MG + COL / 2 + 0.32, y + 0.45, COL / 2 - 0.5, 2.75, [
      { t: 'O método já rodou fora da Nippon', sub: 'PDCAs da NOBRE Motos (Caraguatatuba e Mogi) — mesmo método, outro grupo, sem mudar uma linha', cor: C.verde },
      { t: 'Consultor da regional usa nas 9 CCYs', sub: 'o formato de análise virou o padrão do acompanhamento' },
    ], 11)
    sl.addText('Se aprovado pela diretoria: rollout regional ainda em 2026 — e o YamahaWay terá gerado um padrão nacional.', { x: MG, y: 5.2, w: COL, h: 0.4, fontSize: 12.5, bold: true, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 12 · Fórmula do Sucesso */
  {
    const sl = novo(p); n++
    cab(p, sl, 'Fórmula do sucesso', 'Cada critério da 1ª banca, atacado item a item', 'diagnóstico vivo na tela Dossiê')
    const crits: [string, number, string][] = [
      ['Pesquisa', 3.78, 'pesquisa própria + benchmark de concorrentes da solução + hipóteses formalizadas'],
      ['Planejamento e Objetivos', 4.0, 'objetivo-frase + 3 metas públicas medidas + linha do tempo real das entregas'],
      ['Foco no Cliente', 3.83, 'Voz do Cliente + fatores tabulados + posicionamento + 7 passos + personas'],
      ['Pensar Fora da Caixa', 4.33, 'processo trocado (tabela com/sem) + know-how codificado como vantagem'],
      ['Trabalho em Equipe', 4.25, 'papéis explícitos + revezamento na fala + depoimento da Nippon'],
      ['Viabilidade e Impacto', 4.17, 'número-manchete R$ 1,1 mi/ano + NOBRE como prova + 9 grupos na base'],
    ]
    let y = 1.6
    crits.forEach(cr => {
      sl.addText(cr[0], { x: MG, y: y + 0.04, w: 3.1, h: 0.4, fontSize: 11, bold: true, color: C.branco, fontFace: F, shrinkText: true })
      sl.addText(`${cr[1].toFixed(2).replace('.', ',')}`, { x: MG + 3.15, y: y + 0.04, w: 0.7, h: 0.4, fontSize: 11, bold: true, color: C.ambar, fontFace: F })
      sl.addShape(p.ShapeType.roundRect, { x: MG + 3.95, y: y + 0.09, w: (COL - 4.0) * (cr[1] / 5), h: 0.22, fill: { color: C.azul2 }, line: { type: 'none' }, rectRadius: 0.02 })
      sl.addText(cr[2], { x: MG + 3.95, y: y + 0.33, w: COL - 4.0, h: 0.3, fontSize: 8.5, color: C.cinza, fontFace: F, shrinkText: true })
      y += 0.72
    })
    sl.addShape(p.ShapeType.roundRect, { x: MG, y: y + 0.1, w: COL, h: 0.75, fill: { color: '0E2A1E' }, line: { color: C.verde, width: 1 }, rectRadius: 0.08 })
    sl.addText('Diagnóstico dos 27 sub-itens: 6 itens que FALTAVAM na 1ª banca foram fechados — hoje: 16 temos · 11 parciais · 0 em branco.', { x: MG + 0.25, y: y + 0.1, w: COL - 0.5, h: 0.75, fontSize: 12, bold: true, color: C.verde, align: 'center', valign: 'middle', fontFace: F, shrinkText: true })
    rodape(sl, 'Smart Dealer · 2ª Banca YamahaWay', n)
  }

  /* 13 · Fechamento */
  {
    const sl = novo(p); n++
    faixaTopo(p, sl)
    sl.addText('"Como transformar dados em experiências memoráveis?"', { x: MG, y: 1.9, w: COL, h: 0.6, fontSize: 22, italic: true, color: C.cinza, align: 'center', fontFace: F })
    const pilares = ['Operação\nInteligente', 'Decisões\nMelhores', 'Experiências\nMemoráveis', 'Crescimento\nSustentável']
    const pw2 = (COL - 0.9) / 4
    pilares.forEach((pl, i) => {
      const x = MG + i * (pw2 + 0.3)
      sl.addShape(p.ShapeType.roundRect, { x, y: 2.9, w: pw2, h: 1.3, fill: { color: C.painel }, line: { color: C.ciano, width: 1 }, rectRadius: 0.1 })
      sl.addText(pl, { x, y: 2.9, w: pw2, h: 1.3, fontSize: 13, bold: true, color: C.branco, align: 'center', valign: 'middle', fontFace: F })
    })
    sl.addText('O Smart Dealer é mais do que uma plataforma tecnológica.\nÉ um novo padrão de relacionamento entre cliente, concessionária e Yamaha.', { x: MG, y: 4.6, w: COL, h: 0.9, fontSize: 16, bold: true, color: C.branco, align: 'center', fontFace: F })
    sl.addText('Setembro fecha a campanha e a meta 1 — cobrem o resultado na final.', { x: MG, y: 5.6, w: COL, h: 0.4, fontSize: 12, italic: true, color: C.cianoSuave, align: 'center', fontFace: F })
    sl.addText('YAMAHA WAY 2026 · GRUPO 06 SHOGUN RIDERS · NIPPON MOTOS', { x: MG, y: H - 0.6, w: COL, h: 0.3, fontSize: 10, color: C.cinza2, align: 'center', charSpacing: 2, fontFace: F })
  }

  await p.writeFile({ fileName: '_NOVAS MELHORIAS/DECK-BANCA-YAMAHAWAY.pptx' })
  console.log('✓ DECK-BANCA-YAMAHAWAY.pptx (13 slides)')
}

async function main() {
  await deckDiretoria()
  await deckBanca()
}
main().catch(e => { console.error(e); process.exit(1) })
