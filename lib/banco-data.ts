// ── Banco Yamaha · Oportunidades de Crédito ──────────────────────────────────
// CENÁRIO DEMONSTRATIVO — reproduz o fluxo dos painéis reais do Banco Yamaha
// (Liberacred / Aprovados / Quitações) para mostrar como o Smart Dealer
// transforma as bases em ação de venda. Os clientes são fictícios; a tabela
// do Liberacred é a oficial (lib/liberacred-tabela.ts, consultada em 07/10/2026).
// Quando houver integração oficial, trocar por query mantendo o mesmo shape.
//
// Liberacred NÃO é aprovação: é a entrada programada do Banco Yamaha. O cliente
// recusado no CDC adere sem análise de crédito, junta de 30% a 50% da moto em
// 6 a 18 parcelas e, com 8 parcelas em dia (planos de 30-35%) ou 6 (40-50%),
// pode antecipar o resto e pedir o CDC. O valor do Smart Dealer é não deixar
// esse cliente sumir nos meses em que ele está pagando: chamar no mês certo.

import { planoLiberacred } from './liberacred-tabela'

export interface ClienteLiberacred {
  cliente: string             // nome curto, nunca o nome completo
  modelo: string              // como está na tabela oficial
  loja: string
  vendedor: string
  adesao: string              // data de adesão ao programa
  parcelas: number            // prazo do plano
  entradaPct: number
  pagasEmDia: number
  atrasada?: boolean          // perdeu a pontualidade de alguma parcela
  faturado?: string           // data em que financiou e levou a moto
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
  referencia: 'Outubro/2026',
  fonte: 'Base Recusados CDC + Liberacred + Portal de Propostas Banco Yamaha',
  hoje: '2026-10-07',

  recusadosCdcTrimestre: 62,  // jul + ago + set
  ofertadosLiberacred: 31,    // recusados que receberam a proposta do Liberacred

  // Mensagens que o vendedor dispara em 1 clique. Nunca prometer aprovação:
  // o financiamento depende da proposta do banco quando o cliente fica apto.
  mensagemOferta: (nome: string, modelo: string, parcelas: number, parcela: string, aptoApos: number) =>
    `Oi, ${nome}! O financiamento da sua ${modelo} não saiu agora, mas o Banco Yamaha tem um caminho para você: o Liberacred. ` +
    `Você parcela a entrada em ${parcelas}x de ${parcela}, sem comprovar renda, e com ${aptoApos} parcelas pagas em dia ` +
    `já pode antecipar o restante e pedir o financiamento. Te mando a simulação?`,
  mensagemApto: (nome: string, modelo: string, pagas: number) =>
    `Parabéns, ${nome}! Você pagou ${pagas} parcelas do Liberacred em dia e já pode antecipar o restante ` +
    `e pedir o financiamento da sua ${modelo}. Vamos marcar a sua visita para montar a proposta?`,

  carteira: [
    { cliente: 'Letícia M.', modelo: 'NMAX CONNECTED 160 ABS',     loja: 'Amparo',   vendedor: 'Paula Mendes',  adesao: '2026-02-10', parcelas: 18, entradaPct: 30, pagasEmDia: 8 },
    { cliente: 'Lucas B.',   modelo: 'FZ25 FAZER ABS',             loja: 'Atibaia',  vendedor: 'Bruna Castro',  adesao: '2026-04-08', parcelas: 12, entradaPct: 40, pagasEmDia: 6 },
    { cliente: 'Camila S.',  modelo: 'FZ15 FAZER ABS CONNECTED',   loja: 'Atibaia',  vendedor: 'Bruna Castro',  adesao: '2026-03-15', parcelas: 18, entradaPct: 30, pagasEmDia: 7 },
    { cliente: 'Márcio R.',  modelo: 'FACTOR 150 DX',              loja: 'Amparo',   vendedor: 'Paula Mendes',  adesao: '2026-05-05', parcelas: 18, entradaPct: 40, pagasEmDia: 5 },
    { cliente: 'Jonas A.',   modelo: 'XTZ 250 LANDER ABS CONNECTED', loja: 'Extrema', vendedor: 'Diego Nunes',  adesao: '2026-06-02', parcelas: 18, entradaPct: 50, pagasEmDia: 4 },
    { cliente: 'Elaine R.',  modelo: 'FLUO ABS HYBRID CONNECTED',  loja: 'Bragança', vendedor: 'Rafael Lima',   adesao: '2026-04-20', parcelas: 12, entradaPct: 30, pagasEmDia: 4, atrasada: true },
    { cliente: 'Antônio C.', modelo: 'FZ25 FAZER ABS',             loja: 'Bragança', vendedor: 'Rafael Lima',   adesao: '2026-08-12', parcelas: 18, entradaPct: 30, pagasEmDia: 2 },
    { cliente: 'Mateus A.',  modelo: 'XTZ 150 CROSSER S ABS',      loja: 'Bragança', vendedor: 'Marcos Vieira', adesao: '2026-09-05', parcelas: 12, entradaPct: 40, pagasEmDia: 1 },
    { cliente: 'Bianca F.',  modelo: 'ZR HYBRID CONNECTED',        loja: 'Extrema',  vendedor: 'Diego Nunes',   adesao: '2026-01-14', parcelas: 18, entradaPct: 30, pagasEmDia: 8, faturado: '2026-09-18' },
  ] as ClienteLiberacred[],

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

// nome da tabela oficial para a fala do vendedor: NMAX CONNECTED 160 ABS → NMAX Connected 160 ABS
export function nomeModelo(m: string) {
  return m.split(' ').map(w => /\d|^(ABS|NMAX|XTZ|YZF|TTR|ZR|DX)$/.test(w) ? w : w[0] + w.slice(1).toLowerCase()).join(' ')
}

// nome curto para a tela (Fernando de A. Caetano → Fernando C.)
export function nomeCurto(n: string) {
  const p = n.trim().split(/\s+/)
  return p.length < 2 || /^[A-ZÀ-Ú]\.$/.test(p[p.length - 1]) ? n : `${p[0]} ${p[p.length - 1][0]}.`
}

const somaMeses = (iso: string, n: number) => {
  const [a, m] = iso.split('-').map(Number)
  const t = a * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`
}

export type SituacaoLiberacred = 'apto' | 'pagando' | 'atrasada' | 'faturado'

export function carteiraLiberacred() {
  const d = bancoData
  const mesHoje = d.hoje.slice(0, 7)
  return d.carteira.map(c => {
    const plano = planoLiberacred(c.modelo, c.parcelas, c.entradaPct)!
    const situacao: SituacaoLiberacred = c.faturado ? 'faturado' : c.atrasada ? 'atrasada' : c.pagasEmDia >= plano.aptoApos ? 'apto' : 'pagando'
    // a 1ª parcela vence no mês da adesão; fica apto quando paga a de número aptoApos
    const aptoEm = somaMeses(c.adesao, plano.aptoApos - 1)
    const juntado = Math.round((plano.acumulado / c.parcelas) * c.pagasEmDia)
    return { ...c, plano, situacao, aptoEm, juntado, mesesParaApto: Math.max(0, (Number(aptoEm.slice(0, 4)) * 12 + Number(aptoEm.slice(5))) - (Number(mesHoje.slice(0, 4)) * 12 + Number(mesHoje.slice(5)))) }
  })
}

export function calcularBanco() {
  const d = bancoData
  const cart = carteiraLiberacred()
  const ativos = cart.filter(c => c.situacao !== 'faturado')
  const aptos = cart.filter(c => c.situacao === 'apto')
  const proximos = cart.filter(c => c.situacao === 'pagando' && c.mesesParaApto <= 2)
  const entradaJuntada = ativos.reduce((s, c) => s + c.juntado, 0)
  const naoPagos = d.aprovadosNaoPagos.reduce((s, a) => s + a.valorFinanciado, 0)
  return {
    cart, ativos: ativos.length, aptos, proximos, entradaJuntada, naoPagos,
    faturados: cart.filter(c => c.situacao === 'faturado').length,
    adesao: Math.round((d.carteira.length / d.ofertadosLiberacred) * 100),
    recompra: d.quitandoContrato.length,
  }
}
