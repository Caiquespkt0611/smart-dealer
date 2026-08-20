// ── Banco Yamaha · Oportunidades de Crédito ──────────────────────────────────
// CENÁRIO DEMONSTRATIVO — reproduz o fluxo dos painéis reais do Banco Yamaha
// (Oportunidades Liberacred / Aprovados / Quitações) para mostrar como o
// Smart Dealer transforma as bases em ação de venda. Estrutura espelha os
// relatórios BASE RECUSADOS CDC e o portal de propostas aprovadas.
// Quando houver integração oficial, trocar por query mantendo o mesmo shape.

export interface OportunidadeLiberacred {
  cliente: string
  telefone: string
  modelo: string
  loja: string
  vendedor: string
  dataRecusa: string          // recusa no CDC convencional
  valorAprovado: number       // limite pré-aprovado no Liberacred
  entradaMinima: number
  parcelaEstimada: number     // 48x referência
  status: 'novo' | 'contatado' | 'negociando' | 'convertido'
}

export interface AprovadoNaoPago {
  cliente: string
  modelo: string
  loja: string
  vendedor: string
  valorFinanciado: number
  dataAprovacao: string
  diasParado: number
  motivo: string
  acao: string
  temperatura: 'quente' | 'morno' | 'frio'
}

export interface ContratoQuitando {
  cliente: string
  telefone: string
  motoAtual: string
  anoMoto: number
  parcelasRestantes: number
  dataQuitacao: string        // previsão
  valorUsadoEstimado: number  // avaliação da moto atual na troca
  sugestaoUpgrade: string
  scoreRecompra: number       // 0-100: histórico de revisão + NPS + pontualidade
}

export const bancoData = {
  grupo: 'Nippon Motos',
  referencia: 'Agosto/2026',
  fonte: 'Base Recusados CDC + Portal de Propostas Banco Yamaha (Move Brasil)',

  // ── Funil Liberacred (recusado não é fim de linha — é segunda chance) ──
  funil: {
    recusadosCdc12m: 214,        // recusas CDC do grupo (12 meses)
    recusadosTrimestre: 62,      // jun + jul + ago
    elegiveisLiberacred: 23,     // cruzamento com a base Liberacred
    contatados: 14,
    convertidos: 5,
    ticketMedio: 18400,
  },
  recusadosPorMes: [
    { mes: 'Junho', qtd: 21 },
    { mes: 'Julho', qtd: 27 },
    { mes: 'Agosto', qtd: 14 },
  ],

  // Mensagem-prêmio: o Liberacred comunicado como CONQUISTA, nunca como recusa.
  mensagemPremio: (nome: string, modelo: string) =>
    `🏆 Parabéns, ${nome}! Você acaba de ser APROVADO no programa Liberacred do Banco Yamaha. ` +
    `Sua ${modelo} está garantida com condições especiais: entrada facilitada, parcelas que cabem no bolso ` +
    `e aprovação já confirmada — sem nova análise. É só escolher a cor e agendar a retirada. ` +
    `Posso te mandar a simulação agora?`,

  oportunidades: [
    { cliente: 'Antonio Carlos J. Oliveira', telefone: '(11) 99109-1590', modelo: 'FZ25 Fazer ABS',        loja: 'Bragança',  vendedor: 'Rafael Lima',    dataRecusa: '2026-08-06', valorAprovado: 19500, entradaMinima: 2900, parcelaEstimada: 612, status: 'novo' },
    { cliente: 'Camila S. Felix',            telefone: '(11) 98232-4414', modelo: 'FZ15 Fazer Connected',  loja: 'Atibaia',   vendedor: 'Bruna Castro',   dataRecusa: '2026-08-06', valorAprovado: 16800, entradaMinima: 2500, parcelaEstimada: 528, status: 'contatado' },
    { cliente: 'Carolina Salvador B.',       telefone: '(11) 99214-6280', modelo: 'Fluo ABS Hybrid',       loja: 'Bragança',  vendedor: 'Rafael Lima',    dataRecusa: '2026-08-05', valorAprovado: 15200, entradaMinima: 2200, parcelaEstimada: 478, status: 'negociando' },
    { cliente: 'Crisneyan A. da Silva',      telefone: '(11) 99738-8293', modelo: 'XTZ 250 Lander ABS',    loja: 'Extrema',   vendedor: 'Diego Nunes',    dataRecusa: '2026-08-04', valorAprovado: 24300, entradaMinima: 3600, parcelaEstimada: 765, status: 'novo' },
    { cliente: 'Elaine R. Nascimento',       telefone: '(11) 99766-4262', modelo: 'FZ25 Fazer ABS',        loja: 'Amparo',    vendedor: 'Paula Mendes',   dataRecusa: '2026-08-04', valorAprovado: 19500, entradaMinima: 2900, parcelaEstimada: 612, status: 'convertido' },
    { cliente: 'Elisama da S. Gomes',        telefone: '(11) 99190-5269', modelo: 'FZ15 Fazer Connected',  loja: 'Bragança',  vendedor: 'Marcos Vieira',  dataRecusa: '2026-08-03', valorAprovado: 16800, entradaMinima: 2500, parcelaEstimada: 528, status: 'contatado' },
    { cliente: 'Leticia M. Elias',           telefone: '(19) 96613-4691', modelo: 'NMAX Connected 160',    loja: 'Amparo',    vendedor: 'Paula Mendes',   dataRecusa: '2026-08-02', valorAprovado: 21700, entradaMinima: 3200, parcelaEstimada: 682, status: 'novo' },
    { cliente: 'Lucas B. dos Santos',        telefone: '(11) 99115-4980', modelo: 'FZ25 Fazer ABS',        loja: 'Atibaia',   vendedor: 'Bruna Castro',   dataRecusa: '2026-08-01', valorAprovado: 19500, entradaMinima: 2900, parcelaEstimada: 612, status: 'convertido' },
    { cliente: 'Marcio R. Doval',            telefone: '(19) 99908-6735', modelo: 'Factor 150 ED',         loja: 'Amparo',    vendedor: 'Paula Mendes',   dataRecusa: '2026-07-30', valorAprovado: 14100, entradaMinima: 2000, parcelaEstimada: 445, status: 'negociando' },
    { cliente: 'Mateus A. da Silva',         telefone: '(11) 99738-8293', modelo: 'XTZ 250 Lander ABS',    loja: 'Bragança',  vendedor: 'Marcos Vieira',  dataRecusa: '2026-07-29', valorAprovado: 24300, entradaMinima: 3600, parcelaEstimada: 765, status: 'contatado' },
  ] as OportunidadeLiberacred[],

  // ── Aprovados e não pagos (a venda que já estava ganha) ──
  aprovadosNaoPagos: [
    { cliente: 'Fernando de A. Caetano', modelo: 'NMAX Connected 160', loja: 'Bragança', vendedor: 'Rafael Lima',   valorFinanciado: 16449, dataAprovacao: '2026-08-06', diasParado: 14, motivo: 'Aguardando valor da entrada',        acao: 'Ofertar entrada parcelada no cartão em 3x',            temperatura: 'quente' },
    { cliente: 'Vitorio Bovi',           modelo: 'FZ25 Fazer ABS',     loja: 'Atibaia',  vendedor: 'Bruna Castro',  valorFinanciado: 22903, dataAprovacao: '2026-08-03', diasParado: 17, motivo: 'Esposa quer avaliar outra cor',       acao: 'Enviar fotos Racing Blue disponível em estoque',       temperatura: 'quente' },
    { cliente: 'Rosana P. Duarte',       modelo: 'Fluo ABS',           loja: 'Amparo',   vendedor: 'Paula Mendes',  valorFinanciado: 14890, dataAprovacao: '2026-07-28', diasParado: 23, motivo: 'Sem retorno após aprovação',          acao: 'Régua de resgate: WhatsApp + ligação do gerente',      temperatura: 'morno' },
    { cliente: 'Josué T. Ferreira',      modelo: 'Crosser 150 S',      loja: 'Extrema',  vendedor: 'Diego Nunes',   valorFinanciado: 19750, dataAprovacao: '2026-07-25', diasParado: 26, motivo: 'Comparando com concorrente (CG 160)', acao: 'Aplicar bônus circular ago/26 + test-ride agendado',   temperatura: 'morno' },
    { cliente: 'Ana Beatriz Ramos',      modelo: 'NMAX Connected 160', loja: 'Bragança', vendedor: 'Marcos Vieira', valorFinanciado: 17200, dataAprovacao: '2026-07-18', diasParado: 33, motivo: 'Mudou de cidade',                      acao: 'Transferir atendimento para loja Extrema',             temperatura: 'frio' },
  ] as AprovadoNaoPago[],

  // ── Contratos quitando (o cliente volta ao mercado — chame antes do concorrente) ──
  quitandoContrato: [
    { cliente: 'Roberto Salles',    telefone: '(11) 99621-8874', motoAtual: 'Factor 125i',   anoMoto: 2023, parcelasRestantes: 2, dataQuitacao: '2026-10-05', valorUsadoEstimado: 9800,  sugestaoUpgrade: 'Fazer FZ15 Connected', scoreRecompra: 92 },
    { cliente: 'Mariana Lopes',     telefone: '(11) 98450-2211', motoAtual: 'Fazer 250',     anoMoto: 2022, parcelasRestantes: 1, dataQuitacao: '2026-09-12', valorUsadoEstimado: 15400, sugestaoUpgrade: 'MT-03 ABS',            scoreRecompra: 88 },
    { cliente: 'Carlos H. Prado',   telefone: '(19) 99118-7345', motoAtual: 'NMAX 160',      anoMoto: 2023, parcelasRestantes: 3, dataQuitacao: '2026-11-02', valorUsadoEstimado: 13900, sugestaoUpgrade: 'XMAX 300 Connected',   scoreRecompra: 85 },
    { cliente: 'Fernanda Queiroz',  telefone: '(11) 97733-9012', motoAtual: 'Crosser 150',   anoMoto: 2022, parcelasRestantes: 2, dataQuitacao: '2026-10-19', valorUsadoEstimado: 12300, sugestaoUpgrade: 'Lander 250 ABS',       scoreRecompra: 90 },
    { cliente: 'Paulo E. Martins',  telefone: '(11) 99244-5566', motoAtual: 'Fluo 125',      anoMoto: 2024, parcelasRestantes: 4, dataQuitacao: '2026-12-08', valorUsadoEstimado: 10600, sugestaoUpgrade: 'NMAX Connected 160',   scoreRecompra: 79 },
  ] as ContratoQuitando[],
}

export function calcularBanco() {
  const d = bancoData
  const ops = d.oportunidades
  const convertidos = ops.filter(o => o.status === 'convertido')
  const emJogo = ops.filter(o => o.status !== 'convertido')
  const receitaRecuperada = convertidos.reduce((s, o) => s + o.valorAprovado, 0)
  const receitaEmJogo = emJogo.reduce((s, o) => s + o.valorAprovado, 0)
  const naoPagos = d.aprovadosNaoPagos.reduce((s, a) => s + a.valorFinanciado, 0)
  const recompra = d.quitandoContrato.length
  const taxaResgate = Math.round((d.funil.convertidos / d.funil.contatados) * 100)
  return { convertidos: convertidos.length, receitaRecuperada, receitaEmJogo, naoPagos, recompra, taxaResgate }
}
