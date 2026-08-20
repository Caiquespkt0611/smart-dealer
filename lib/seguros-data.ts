// ── Yamaha Seguros · Frota Circulante e Conversão ────────────────────────────
// CENÁRIO DEMONSTRATIVO — espelha o Painel Ranking Indicadores da Yamaha
// Seguros (motor × seguros × cotações × penetração × oferta × conversão).
// Os números de julho seguem o painel oficial do grupo; a série e o ranking
// por vendedor são cenário para demonstração. Trocar por integração mantendo shape.

export interface MesSeguros {
  mes: string
  motos: number       // motos faturadas (motor)
  cotacoes: number    // cotações emitidas
  seguros: number     // seguros fechados
}

export const segurosData = {
  grupo: 'Nippon Motos',
  referencia: 'Julho/2026 (fechado) · Agosto em curso',
  consultor: 'Eduardo (Yamaha Seguros)',
  metaPenetracao: 45,      // % de motos vendidas saindo com seguro
  metaOferta: 100,         // toda venda recebe cotação

  serie: [
    { mes: 'Jan', motos: 96,  cotacoes: 71,  seguros: 21 },
    { mes: 'Fev', motos: 88,  cotacoes: 68,  seguros: 19 },
    { mes: 'Mar', motos: 118, cotacoes: 95,  seguros: 30 },
    { mes: 'Abr', motos: 102, cotacoes: 89,  seguros: 28 },
    { mes: 'Mai', motos: 105, cotacoes: 98,  seguros: 31 },
    { mes: 'Jun', motos: 98,  cotacoes: 101, seguros: 33 },
    { mes: 'Jul', motos: 110, cotacoes: 116, seguros: 37 },   // painel oficial: 33,6% penetração · 105,5% oferta · 31,9% conversão
  ] as MesSeguros[],

  // ── Frota circulante: todo cliente rodando sem seguro é renovação perdida ──
  frota: {
    motosVendidas24m: 2840,        // frota vendida pelo grupo (24 meses)
    segurosAtivos: 618,            // apólices vigentes na frota
    vencendo30dias: 54,            // renovações no radar
    vencidas90dias: 87,            // deixaram de renovar — resgatáveis
    ticketMedioAnual: 1240,        // prêmio médio anual (R$)
    comissaoMedia: 0.22,           // comissão da concessionária
  },

  vendedores: [
    { nome: 'Rafael Lima',   loja: 'Bragança', motos: 31, cotacoes: 34, seguros: 14 },
    { nome: 'Bruna Castro',  loja: 'Atibaia',  motos: 24, cotacoes: 27, seguros: 9 },
    { nome: 'Marcos Vieira', loja: 'Bragança', motos: 27, cotacoes: 25, seguros: 7 },
    { nome: 'Paula Mendes',  loja: 'Amparo',   motos: 16, cotacoes: 18, seguros: 5 },
    { nome: 'Diego Nunes',   loja: 'Extrema',  motos: 12, cotacoes: 12, seguros: 2 },
  ],

  // Vendas de agosto que saíram SEM seguro — a fila de trabalho do dia
  semSeguro: [
    { cliente: 'Elaine R. Nascimento', modelo: 'FZ25 Fazer ABS',       loja: 'Amparo',   diasDaCompra: 9,  cotacao: 1180 },
    { cliente: 'Lucas B. dos Santos',  modelo: 'FZ25 Fazer ABS',       loja: 'Atibaia',  diasDaCompra: 12, cotacao: 1180 },
    { cliente: 'João P. Siqueira',     modelo: 'NMAX Connected 160',   loja: 'Bragança', diasDaCompra: 5,  cotacao: 1350 },
    { cliente: 'Amanda C. Rocha',      modelo: 'XTZ 250 Lander ABS',   loja: 'Extrema',  diasDaCompra: 7,  cotacao: 1520 },
    { cliente: 'Tiago M. Alves',       modelo: 'MT-07 ABS',            loja: 'Bragança', diasDaCompra: 3,  cotacao: 3480 },
  ],
}

export function calcularSeguros() {
  const d = segurosData
  const jul = d.serie[d.serie.length - 1]
  const penetracao = (jul.seguros / jul.motos) * 100
  const oferta = (jul.cotacoes / jul.motos) * 100
  const conversao = (jul.seguros / jul.cotacoes) * 100
  const f = d.frota
  const pctFrotaSegurada = (f.segurosAtivos / f.motosVendidas24m) * 100
  // potencial: levar penetração à meta + resgatar renovações
  const gapMensal = Math.round(jul.motos * (d.metaPenetracao / 100)) - jul.seguros
  const receitaGapAno = gapMensal * 12 * f.ticketMedioAnual * f.comissaoMedia
  const receitaRenovacoes = (f.vencendo30dias + f.vencidas90dias) * f.ticketMedioAnual * f.comissaoMedia
  return { jul, penetracao, oferta, conversao, pctFrotaSegurada, gapMensal, receitaGapAno, receitaRenovacoes }
}
