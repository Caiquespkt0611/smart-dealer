// ── Programa Premya · Banco Yamaha (3ª edição · Jan–Dez 2026) ───────────────
// Regras oficiais do folder "Programa Premya 2026" (MELHORIAS/Yamaha folder
// PREMYA 2026 3.pdf). Classificação mensal do Grupo Econômico pelo Índice de
// Fidelidade com o Banco Yamaha:
//   IF = Participação nas Vendas Financiadas − Fator de Ajuste
//   Participação = vendas varejo financiadas submetidas ao BYMD ÷ vendas varejo financiadas
//   Fator de Ajuste = propostas aprovadas BYMD pagas em OUTRO banco ÷ propostas aprovadas BYMD
// Os números do grupo são CENÁRIO DEMONSTRATIVO; as regras e benefícios são oficiais.

export interface CategoriaPremya {
  nome: 'DIAMANTE' | 'OURO' | 'PRATA' | 'BRONZE'
  faixaMin: number             // IF mínimo (%)
  faixaMax: number
  incentivoComercial: number   // % sobre o Valor Liberado junto ao BYMD
  floorPlanPp: number          // redução em p.p. sobre a taxa normal
  mesaCredito: boolean         // diferenciais junto à Mesa de Crédito
  cor: string
}

export const CATEGORIAS: CategoriaPremya[] = [
  { nome: 'DIAMANTE', faixaMin: 95, faixaMax: 100,  incentivoComercial: 2.0,  floorPlanPp: 0.20, mesaCredito: true,  cor: '#7DD3FC' },
  { nome: 'OURO',     faixaMin: 85, faixaMax: 94.9, incentivoComercial: 1.5,  floorPlanPp: 0.20, mesaCredito: true,  cor: '#FBBF24' },
  { nome: 'PRATA',    faixaMin: 75, faixaMax: 84.9, incentivoComercial: 1.0,  floorPlanPp: 0.10, mesaCredito: false, cor: '#94A3B8' },
  { nome: 'BRONZE',   faixaMin: 60, faixaMax: 74.9, incentivoComercial: 0.5,  floorPlanPp: 0.05, mesaCredito: false, cor: '#D97706' },
]

export function classificar(indice: number): CategoriaPremya | null {
  return CATEGORIAS.find(c => indice >= c.faixaMin && indice <= c.faixaMax + 0.099) ?? null
}

export function calcularIndice(vendasFinanciadas: number, submetidasBymd: number, aprovadasBymd: number, pagasOutroBanco: number) {
  const participacao = vendasFinanciadas > 0 ? (submetidasBymd / vendasFinanciadas) * 100 : 0
  const fatorAjuste = aprovadasBymd > 0 ? (pagasOutroBanco / aprovadasBymd) * 100 : 0
  const indice = Math.max(0, participacao - fatorAjuste)
  return { participacao, fatorAjuste, indice, categoria: classificar(indice) }
}

// ── Cenário atual do grupo (base julho → benefícios de setembro) ────────────
export const premyaData = {
  grupo: 'Nippon Motos',
  referencia: 'Apuração Julho/2026 → benefícios aplicados em Setembro/2026',

  atual: {
    vendasFinanciadas: 86,      // vendas varejo do grupo concretizadas via financiamento
    submetidasBymd: 69,         // submetidas à análise do Banco Yamaha
    aprovadasBymd: 42,
    pagasOutroBanco: 6,         // aprovadas no BYMD mas pagas em outro banco (reduz o IF)
  },

  // Base financeira para converter categoria em R$
  financeiro: {
    valorLiberadoMes: 1180000,        // volume liberado junto ao BYMD/mês (média)
    estoqueFloorPlan: 2400000,        // saldo médio financiado no floor plan
    taxaFloorPlanMes: 1.49,           // % a.m. taxa normal praticada (referência)
  },

  historico: [
    { mes: 'Mar', indice: 62.4 },
    { mes: 'Abr', indice: 66.1 },
    { mes: 'Mai', indice: 69.8 },
    { mes: 'Jun', indice: 72.5 },
    { mes: 'Jul', indice: 71.6 },
  ],
}

export interface CenarioPremya {
  nome: string
  descricao: string
  indice: number
  categoria: CategoriaPremya | null
  incentivoMes: number      // R$ do incentivo comercial
  economiaFloorMes: number  // R$ economizados no floor plan
  ganhoMes: number
  ganhoAno: number
}

export function montarCenario(nome: string, descricao: string, vf: number, sub: number, apr: number, outro: number): CenarioPremya {
  const { indice, categoria } = calcularIndice(vf, sub, apr, outro)
  const f = premyaData.financeiro
  const incentivoMes = categoria ? f.valorLiberadoMes * (categoria.incentivoComercial / 100) : 0
  const economiaFloorMes = categoria ? f.estoqueFloorPlan * (categoria.floorPlanPp / 100) : 0
  const ganhoMes = incentivoMes + economiaFloorMes
  return { nome, descricao, indice, categoria, incentivoMes, economiaFloorMes, ganhoMes, ganhoAno: ganhoMes * 12 }
}

export function cenariosPadrao(): CenarioPremya[] {
  const a = premyaData.atual
  return [
    montarCenario('Hoje', 'Situação atual da apuração', a.vendasFinanciadas, a.submetidasBymd, a.aprovadasBymd, a.pagasOutroBanco),
    montarCenario('Disciplina de submissão', 'Toda venda financiada passa primeiro pelo BYMD (86/86) e o time segura as fugas para outros bancos', a.vendasFinanciadas, 82, 50, 4),
    montarCenario('Rumo ao Diamante', 'Submissão total + zero proposta aprovada paga em outro banco', a.vendasFinanciadas, 84, 52, 1),
  ]
}
