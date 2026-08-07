// Campanha Campeões de Vendas — Jul a Set/2026 (Circular CA-MTC-080-26, 08/07/2026).
// Premiação mensal em dinheiro por atingimento da Carta Varejo + incentivo aos
// gerentes. Este módulo codifica as regras da circular; os números do grupo
// vêm do banco (vendas/carta) via getDashboardData.
import { getDashboardData } from '@/lib/data'

export const CAMPANHA = {
  circular: 'CA-MTC-080-26',
  nome: 'Campeões de Vendas',
  periodo: 'Julho a Setembro/2026',
  meses: [7, 8, 9],
  ano: 2026,
} as const

// Faixas por meta varejo mensal (qtd de motos 0km)
const FAIXAS = [
  { faixa: 'A', min: 801, max: Infinity, premio: 40000 },
  { faixa: 'B', min: 401, max: 800, premio: 30000 },
  { faixa: 'C', min: 151, max: 400, premio: 15000 },
  { faixa: 'D', min: 61, max: 150, premio: 10000 },
  { faixa: 'E', min: 29, max: 60, premio: 5000 },
] as const

export function faixaDe(qtd: number) {
  return FAIXAS.find(f => qtd >= f.min && qtd <= f.max) ?? null
}

export interface ApuracaoMes {
  mes: number
  nomeMes: string
  meta: number
  resultado: number | null      // null = mês ainda sem resultado
  projecao: number | null       // projeção viva quando em curso
  pctAtingimento: number | null
  faixa: string
  premioReferencia: number      // 100% da faixa aplicável
  premio: number                // o que ficou garantido pela regra do mês
  status: 'fechado' | 'em-curso' | 'aguardando'
  regra: string                 // qual degrau pagou (90–99 / 100–109 / ≥110 / nenhum)
  gerentes: number              // incentivo aos gerentes de vendas no mês
  metaEstimada?: boolean        // carta ainda não informada — assumida
}

export interface CampanhaAnalise {
  meses: ApuracaoMes[]
  faixaGrupo: string
  premioFaixa: number
  // recuperação retroativa: meta acumulada do trimestre em 100%
  metaTrimestre: number
  vendidoTrimestre: number
  recuperavel: number           // R$ dos meses perdidos, recuperáveis no acumulado
  garantido: number             // já assegurado pelas regras mensais
  cenarios: Array<{ rotulo: string; condicao: string; total: number }>
}

const MESES_NOME = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

/** Aplica o escalonamento da circular a um resultado fechado. */
function apurarMes(meta: number, resultado: number): { premio: number; regra: string; faixa: string; referencia: number; gerentes: number } {
  const faixaMeta = faixaDe(meta)
  // upgrade de faixa: se o RESULTADO se posiciona numa faixa superior, o prêmio é o dela (Exemplo 1 da circular)
  const faixaResultado = faixaDe(resultado)
  const faixaAplicavel = faixaResultado && faixaMeta && faixaResultado.premio > faixaMeta.premio ? faixaResultado : faixaMeta
  if (!faixaAplicavel) return { premio: 0, regra: 'fora das faixas', faixa: '—', referencia: 0, gerentes: 0 }
  const pct = meta > 0 ? (resultado / meta) * 100 : 0
  let premio = 0
  let regra = 'abaixo de 90% — sem prêmio no mês'
  if (pct >= 110) { premio = faixaAplicavel.premio * 2; regra = '≥110% da meta — 200% do valor (válido no mês)' }
  else if (pct >= 100) { premio = faixaAplicavel.premio; regra = '100–109% da meta — 100% do valor' }
  else if (pct >= 90) { premio = faixaAplicavel.premio * 0.5; regra = '90–99% da meta — 50% do valor (válido no mês)' }
  const gerentes = pct >= 110 ? resultado * 50 : pct >= 100 ? resultado * 30 : 0
  return { premio, regra, faixa: faixaAplicavel.faixa, referencia: faixaAplicavel.premio, gerentes }
}

export async function getCampanhaAnalise(): Promise<CampanhaAnalise> {
  const d = await getDashboardData('Grupo Nippon')
  const sbMeta = d.meta // carta do mês corrente (agosto)

  const meses: ApuracaoMes[] = []
  for (const mes of CAMPANHA.meses) {
    const nomeMes = MESES_NOME[mes]
    if (mes < d.mesCorrente) {
      // mês fechado — resultado veio do banco (fechamentoAnterior é o mês fechado imediatamente anterior)
      const resultado = mes === d.mesFechado ? d.fechamentoAnterior : null
      const meta = sbMeta // cartas passadas não ficam no banco; carta de julho = 160 (igual agosto)
      if (resultado === null) continue
      const ap = apurarMes(meta, resultado)
      meses.push({
        mes, nomeMes, meta, resultado, projecao: null,
        pctAtingimento: Math.round((resultado / meta) * 1000) / 10,
        faixa: ap.faixa, premioReferencia: ap.referencia, premio: ap.premio,
        status: 'fechado', regra: ap.regra, gerentes: ap.gerentes,
      })
    } else if (mes === d.mesCorrente) {
      const emCurso = d.modo === 'acompanhamento'
      const ap = emCurso ? apurarMes(sbMeta, d.projecao) : null
      meses.push({
        mes, nomeMes, meta: sbMeta,
        resultado: emCurso ? d.vendasMes : null,
        projecao: emCurso ? d.projecao : null,
        pctAtingimento: emCurso ? Math.round((d.projecao / sbMeta) * 1000) / 10 : null,
        faixa: faixaDe(sbMeta)?.faixa ?? '—',
        premioReferencia: faixaDe(sbMeta)?.premio ?? 0,
        premio: 0, // nada garantido até fechar
        status: 'em-curso',
        regra: emCurso ? `projeção indica: ${ap!.regra}` : 'aguardando primeiras vendas do mês',
        gerentes: 0,
      })
    } else {
      meses.push({
        mes, nomeMes, meta: sbMeta, resultado: null, projecao: null, pctAtingimento: null,
        faixa: faixaDe(sbMeta)?.faixa ?? '—', premioReferencia: faixaDe(sbMeta)?.premio ?? 0,
        premio: 0, status: 'aguardando', regra: 'carta ainda não informada — assumida igual à atual',
        gerentes: 0, metaEstimada: true,
      })
    }
  }

  const faixaGrupo = faixaDe(sbMeta)
  const metaTrimestre = meses.reduce((s, m) => s + m.meta, 0)
  const vendidoTrimestre = meses.reduce((s, m) => s + (m.resultado ?? 0), 0)

  // recuperação retroativa: meses fechados abaixo de 100% recuperam o valor cheio
  // da faixa se a meta ACUMULADA do trimestre fechar em 100%
  const recuperavel = meses
    .filter(m => m.status === 'fechado' && (m.pctAtingimento ?? 0) < 100)
    .reduce((s, m) => s + m.premioReferencia, 0)

  const garantido = meses.reduce((s, m) => s + m.premio + m.gerentes, 0)

  // cenários de agosto + setembro (metas atuais), para o titular ver o que está em jogo
  const premioRef = faixaGrupo?.premio ?? 0
  const abertos = meses.filter(m => m.status !== 'fechado')
  const nAbertos = abertos.length
  const cen = (mult: number, gerentePorMoto: number, pctAlvo: number) => {
    const premios = nAbertos * premioRef * mult
    const gerentes = abertos.reduce((s, m) => s + Math.ceil(m.meta * pctAlvo) * gerentePorMoto, 0)
    return premios + gerentes
  }
  const cenarios = [
    { rotulo: 'Cenário 90%', condicao: `fechar os meses abertos em 90–99% da carta`, total: garantido + cen(0.5, 0, 0.9) },
    { rotulo: 'Cenário 100%', condicao: `bater a carta nos meses abertos (recupera retroativo)`, total: garantido + cen(1, 30, 1.0) + recuperavel },
    { rotulo: 'Cenário 110%', condicao: `superar a carta em 10% (prêmio em dobro + R$50/moto)`, total: garantido + cen(2, 50, 1.1) + recuperavel },
  ]

  return {
    meses,
    faixaGrupo: faixaGrupo?.faixa ?? '—',
    premioFaixa: premioRef,
    metaTrimestre, vendidoTrimestre,
    recuperavel, garantido, cenarios,
  }
}
