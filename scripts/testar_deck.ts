// Smoke test do deck .pptx fora do navegador: monta os slides com dados de
// exemplo, gera o arquivo via montarPptx e valida o ZIP resultante.
// Rodar: npx tsx scripts/testar_deck.ts
import { writeFileSync } from 'node:fs'
import { montarDeckSmartDealer } from '../lib/deck-performance'
import { montarPptx } from '../lib/pptx-bonito'
import type { PerformanceAnalise, AcaoPDCA } from '../lib/performance'
import type { CampanhaAnalise } from '../lib/campanha-vendas'

const dash = {
  modo: 'largada', ano: 2026, mesCorrente: 8, mesFechado: 7,
  nomeMesCorrente: 'Agosto', nomeMesFechado: 'Julho',
  vendasMes: 0, fechamentoAnterior: 144, meta: 160, projecao: 144, pctAtingimento: 90,
  saltoCarta: 16, ritmoNecessario: 7.6, diasUteisMes: 21,
  estoqueAlertas: [], tempoAtend: 45, tcaPct: 100, lcrPct: 8, referenciaLeads: '2026/06',
  npsVendas: 94.5, npsPosvenda: 87.7, referenciaNps: '2026/06',
  rankingPos: 4, rankingTotal: 9, premioPotencial: 15000, metaEmDobro: false,
  ranking: [], vendasPorModelo: [],
}

const analise = {
  dash, baseNome: 'média Abr–Jun', mesFechadoNome: 'Julho',
  mercadoAtual: 791, mercadoBase: 766, shareAtual: 20.4, shareBase: 20.1,
  varReal: 7.3, efeitoMercado: 5, efeitoShare: 2.3, dominante: 'mercado',
  veredito: 'Crescimento puxado pelo mercado da área.',
  segmentos: [
    { segmento: 'SMALL - STREET - 150cc', rotulo: 'Street 150', mktMes: 220, mktBase: 210, mktVar: 4.8, share: 15.2, shareBase: 17.4, shareDelta: -2.2, impacto: -4.8, oport: 4.8, hondaDelta: 2.1, veredito: 'disputa' },
    { segmento: 'SMALL - SCOOTER', rotulo: 'Scooter', mktMes: 90, mktBase: 110, mktVar: -18, share: 31, shareBase: 30.5, shareDelta: 0.5, impacto: -6.1, oport: 0, hondaDelta: -0.4, veredito: 'demanda' },
  ],
  cidades: [
    { cidade: 'Atibaia', area: 'Amparo', mktMes: 189.7, share: 17.2, gap: 6.1 },
    { cidade: 'Piracaia', area: 'Amparo', mktMes: 23.6, share: 7.3, gap: 3.1 },
  ],
  yamNoTerrMes: 152.6, nipponMes: 127.6, invasaoMes: 25, invasaoPct: 16,
  invasores: [{ cnpj: '123', nome: 'Moto Teste', cidade: 'Atibaia', qtdMes: 8.2 }],
  share: {
    referencia: 'Jan–Jul 2026', ultimoMesFechado: 7, totalMercado2026: 5346,
    yamahaShare: 20, yamahaQtd: 1068, hondaShare: 62.3, hondaQtd: 3331,
    nipponQtd: 893, nipponShareDoMercado: 16.7, nipponShareDaYamaha: 83.6,
    areas: ['Amparo', 'Ouro Fino'], brandShare: [],
    trend: [
      { mes: 'Fev', yamaha: 133, honda: 361, outros: 73, total: 567, shareYamaha: 23.5 },
      { mes: 'Mar', yamaha: 188, honda: 432, outros: 71, total: 691, shareYamaha: 27.2 },
      { mes: 'Abr', yamaha: 160, honda: 470, outros: 100, total: 730, shareYamaha: 21.9 },
      { mes: 'Mai', yamaha: 155, honda: 480, outros: 110, total: 745, shareYamaha: 20.8 },
      { mes: 'Jun', yamaha: 148, honda: 460, outros: 105, total: 713, shareYamaha: 20.8 },
      { mes: 'Jul', yamaha: 161, honda: 486, outros: 144, total: 791, shareYamaha: 20.4 },
    ],
    segments: [], cities: [], competitors: [], numCompetitorCnpj: 230,
  },
} as unknown as PerformanceAnalise

const acoes: AcaoPDCA[] = [
  {
    acao: 'Entrar em Agosto no ritmo que a carta exige desde o primeiro dia',
    porque: 'Julho fechou com 144 un e a carta de Agosto é de 160 un — +16 un (11%), ou 7,6 un/dia nos 21 dias úteis.',
    como: ['Distribuir a carta em meta semanal', 'Abrir o mês com as propostas de julho', 'Conferir estoque do ritmo pedido'],
    resp: 'Caique / Nippon Motos', ini: '07/08', fim: '31/08', prio: 'Alta',
    indicador: 'Fechar Agosto com 160 un (100% da carta), sustentando 7,6 un/dia.',
  },
  {
    acao: 'Ocupar a praça de Atibaia',
    porque: 'Atibaia movimenta 189,7 un/mês e a Yamaha tem só 17,2% de share ali, contra 20,4% no território.',
    como: ['Mapear concorrentes que dominam a praça', 'Vendedor externo e prospecção ativa', 'Mídia geolocalizada'],
    resp: 'Caique / Nippon Motos', ini: '07/08', fim: '31/08', prio: 'Alta',
    indicador: 'Chegar a 20,4% de share em Atibaia = +6 un/mês.',
  },
]

const campanha = {
  meses: [
    { mes: 7, nomeMes: 'Julho', meta: 160, resultado: 144, projecao: null, pctAtingimento: 90, faixa: 'C', premioReferencia: 15000, premio: 7500, status: 'fechado', regra: '90–99% da meta — 50% do valor (válido no mês)', gerentes: 0 },
    { mes: 8, nomeMes: 'Agosto', meta: 160, resultado: null, projecao: null, pctAtingimento: null, faixa: 'C', premioReferencia: 15000, premio: 0, status: 'em-curso', regra: 'aguardando primeiras vendas do mês', gerentes: 0 },
    { mes: 9, nomeMes: 'Setembro', meta: 160, resultado: null, projecao: null, pctAtingimento: null, faixa: 'C', premioReferencia: 15000, premio: 0, status: 'aguardando', regra: 'carta ainda não informada — assumida igual à atual', gerentes: 0, metaEstimada: true },
  ],
  faixaGrupo: 'C', premioFaixa: 15000, metaTrimestre: 480, vendidoTrimestre: 144,
  recuperavel: 15000, garantido: 7500,
  cenarios: [
    { rotulo: 'Cenário 90%', condicao: 'fechar em 90–99%', total: 22500 },
    { rotulo: 'Cenário 100%', condicao: 'bater a carta', total: 62100 },
    { rotulo: 'Cenário 110%', condicao: 'superar em 10%', total: 100100 },
  ],
} as unknown as CampanhaAnalise

async function main() {
  const slides = montarDeckSmartDealer({ analise, acoes, campanha, vouchers: null, dataStr: '07/08/2026' })
  console.log('slides montados:', slides.length)

  const blob = montarPptx('teste.pptx', slides, { titulo: 'Teste', autor: 'Smart Dealer' }) as Blob
  const buf = Buffer.from(await blob.arrayBuffer())
  writeFileSync('/tmp/claude-501/deck-teste.pptx', buf)
  console.log('pptx gerado:', buf.length, 'bytes')
}
main()
