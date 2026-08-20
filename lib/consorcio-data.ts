// ── Consórcio Yamaha · Carteira, Retenção e Bônus Quality ────────────────────
// CENÁRIO DEMONSTRATIVO — estrutura do acompanhamento de consórcio do grupo:
// vendas de cotas por mês, saúde da carteira (retenção/inadimplência) e o
// Bônus Quality, que remunera a QUALIDADE da carteira, não só o volume.
// Trocar por integração oficial mantendo o mesmo shape.

export const consorcioData = {
  grupo: 'Nippon Motos',
  referencia: 'Agosto/2026',
  metaMensalCotas: 30,

  serie: [
    { mes: 'Jan', vendidas: 22, canceladas: 4 },
    { mes: 'Fev', vendidas: 19, canceladas: 5 },
    { mes: 'Mar', vendidas: 27, canceladas: 3 },
    { mes: 'Abr', vendidas: 24, canceladas: 6 },
    { mes: 'Mai', vendidas: 26, canceladas: 4 },
    { mes: 'Jun', vendidas: 23, canceladas: 3 },
    { mes: 'Jul', vendidas: 29, canceladas: 2 },
    { mes: 'Ago', vendidas: 17, canceladas: 1 },   // em curso
  ],

  carteira: {
    cotasAtivas: 486,
    ticketMedioCota: 21400,          // crédito médio
    adimplencia: 91.4,               // % em dia
    contempladosAno: 38,
    contempladosConverteramMoto: 31, // retiraram a moto na Nippon
  },

  // Bônus Quality: remuneração extra atrelada à saúde da carteira
  bonusQuality: {
    regra: 'Adimplência ≥ 90% + cancelamento ≤ 12% na safra → bônus de 0,8% sobre o crédito comercializado no trimestre',
    trimestreAtual: { creditoComercializado: 1478000, adimplencia: 91.4, cancelamento: 8.7, elegivel: true, bonusEstimado: 11824 },
    historico: [
      { tri: '1º Tri/26', bonus: 9860,  atingido: true },
      { tri: '2º Tri/26', bonus: 10740, atingido: true },
    ],
  },

  // Retenção: cota em risco de cancelamento = cliente a resgatar
  emRisco: [
    { cliente: 'Silvana R. Prates',  cota: 'GR-2214', parcelasAtraso: 2, valorParcela: 486, acao: 'Renegociar: pular parcela p/ o fim do plano' },
    { cliente: 'Everton L. Dias',    cota: 'GR-1987', parcelasAtraso: 3, valorParcela: 512, acao: 'Ofertar redução de crédito (reenquadre)' },
    { cliente: 'Marta S. Cunha',     cota: 'GR-2450', parcelasAtraso: 1, valorParcela: 431, acao: 'Contato preventivo — lembrete + Pix copia-e-cola' },
    { cliente: 'Igor F. Antunes',    cota: 'GR-2101', parcelasAtraso: 2, valorParcela: 605, acao: 'Convidar p/ lance com FGTS na assembleia de set' },
  ],
}

export function calcularConsorcio() {
  const d = consorcioData
  const vendidasAno = d.serie.reduce((s, m) => s + m.vendidas, 0)
  const canceladasAno = d.serie.reduce((s, m) => s + m.canceladas, 0)
  const retencao = (1 - canceladasAno / (d.carteira.cotasAtivas + canceladasAno)) * 100
  const jul = d.serie[6]
  const conversaoContemplados = (d.carteira.contempladosConverteramMoto / d.carteira.contempladosAno) * 100
  const creditoAtivo = d.carteira.cotasAtivas * d.carteira.ticketMedioCota
  return { vendidasAno, canceladasAno, retencao, jul, conversaoContemplados, creditoAtivo }
}
