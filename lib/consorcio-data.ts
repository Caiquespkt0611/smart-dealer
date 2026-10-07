// ── Consórcio Yamaha · Carteira de cotas, contemplados e Bônus Quality ──────
// CENÁRIO DEMONSTRATIVO — reproduz o acompanhamento de consórcio da loja para
// mostrar como o Smart Dealer transforma a carteira em venda. Os clientes são
// fictícios; as regras, os planos e as taxas são os oficiais
// (lib/consorcio-yamaha.ts, conferidos em 07/10/2026).
// Quando houver integração oficial, trocar por query mantendo o mesmo shape.
//
// O valor do Smart Dealer aqui: o contemplado faturar AQUI (o crédito vale em
// outra loja), o cliente com reserva dar o lance no mês certo, e a cota com
// parcela atrasada não cair (3 atrasos = cota cancelada).

import { planosConsorcio, simularConsorcio } from './consorcio-yamaha'
import { liberacredTabela } from './liberacred-tabela'
export { nomeModelo } from './liberacred-tabela'

export type SituacaoCota = 'contemplado' | 'lance' | 'emdia' | 'atrasada' | 'faturado'

export interface CotaConsorcio {
  cliente: string            // nome curto, nunca o nome completo
  modelo: string             // como está na tabela oficial
  plano: 'mega' | 'master'
  meses: number
  loja: string
  vendedor: string
  adesao: string
  pagas: number
  atrasos?: number           // parcelas em atraso hoje
  contemplado?: string       // data da assembleia em que foi contemplado
  faturado?: string          // data em que retirou a moto na loja
  reserva?: number           // o que o cliente disse ter guardado para lance
}

export const consorcioData = {
  grupo: 'Nippon Motos',
  referencia: 'Outubro/2026',
  fonte: 'Extrato de cotas Yamaha Consórcio + resultado das assembleias',
  hoje: '2026-10-07',
  proximaAssembleia: '2026-10-20',
  metaMensalCotas: 30,

  recusadosSemEntrada: 31,   // recusados no CDC do trimestre que não aderiram ao Liberacred
  ofertadosConsorcio: 22,    // receberam a proposta do consórcio
  aderiramConsorcio: 9,

  // Mensagens prontas. Nunca prometer data de contemplação.
  mensagemContemplado: (nome: string, modelo: string) =>
    `Parabéns, ${nome}! A sua cota do Consórcio Yamaha foi contemplada. 🎉 ` +
    `A sua ${modelo} está separada aqui na loja: traga RG, CPF e comprovante de residência ` +
    `que a gente cuida da nota e da liberação do crédito. Qual o melhor dia para você vir?`,
  mensagemLance: (nome: string, modelo: string, valor: string, data: string) =>
    `${nome}, a próxima assembleia do seu grupo é dia ${data}. Com um lance fixo de 25% ` +
    `(${valor}, e parte pode sair do próprio crédito com o lance embutido), você aumenta muito a chance de ` +
    `sair com a sua ${modelo} agora. Quer que eu registre o lance para você até a véspera?`,
  mensagemAtraso: (nome: string) =>
    `${nome}, tudo bem? Vi que tem uma parcela do seu consórcio em aberto. Atrasado, a cota não concorre ` +
    `no sorteio deste mês. Te mando a 2ª via agora para você não perder a assembleia?`,

  carteira: [
    { cliente: 'Renata P.',  modelo: 'NMAX CONNECTED 160 ABS',       plano: 'mega',   meses: 60, loja: 'Bragança', vendedor: 'Rafael Lima',   adesao: '2025-11-10', pagas: 11, contemplado: '2026-09-22' },
    { cliente: 'Diego F.',   modelo: 'XTZ 250 LANDER ABS CONNECTED', plano: 'mega',   meses: 72, loja: 'Atibaia',  vendedor: 'Bruna Castro',  adesao: '2026-02-03', pagas: 8,  contemplado: '2026-09-22' },
    { cliente: 'Paulo H.',   modelo: 'FZ25 FAZER ABS',               plano: 'mega',   meses: 60, loja: 'Amparo',   vendedor: 'Paula Mendes',  adesao: '2026-01-15', pagas: 9,  reserva: 6000 },
    { cliente: 'Sandra L.',  modelo: 'FACTOR 150 DX',                plano: 'master', meses: 48, loja: 'Bragança', vendedor: 'Marcos Vieira', adesao: '2026-03-08', pagas: 7,  reserva: 3500 },
    { cliente: 'Thiago R.',  modelo: 'FZ15 FAZER ABS CONNECTED',     plano: 'mega',   meses: 60, loja: 'Extrema',  vendedor: 'Diego Nunes',   adesao: '2026-05-12', pagas: 5 },
    { cliente: 'Aline C.',   modelo: 'XTZ 150 CROSSER Z ABS',        plano: 'master', meses: 60, loja: 'Atibaia',  vendedor: 'Bruna Castro',  adesao: '2026-06-20', pagas: 4 },
    { cliente: 'Everton D.', modelo: 'FACTOR 150',                   plano: 'mega',   meses: 72, loja: 'Amparo',   vendedor: 'Paula Mendes',  adesao: '2026-04-02', pagas: 4,  atrasos: 2 },
    { cliente: 'Marta C.',   modelo: 'FLUO ABS HYBRID CONNECTED',    plano: 'master', meses: 48, loja: 'Bragança', vendedor: 'Rafael Lima',   adesao: '2026-07-11', pagas: 2,  atrasos: 1 },
    { cliente: 'Júlio S.',   modelo: 'YZF R15 ABS',                  plano: 'mega',   meses: 60, loja: 'Extrema',  vendedor: 'Diego Nunes',   adesao: '2025-09-05', pagas: 12, contemplado: '2026-08-25', faturado: '2026-09-02' },
  ] as CotaConsorcio[],

  serie: [
    { mes: 'Mar', vendidas: 27, canceladas: 3 },
    { mes: 'Abr', vendidas: 24, canceladas: 6 },
    { mes: 'Mai', vendidas: 26, canceladas: 4 },
    { mes: 'Jun', vendidas: 23, canceladas: 3 },
    { mes: 'Jul', vendidas: 29, canceladas: 2 },
    { mes: 'Ago', vendidas: 31, canceladas: 2 },
    { mes: 'Set', vendidas: 28, canceladas: 3 },
    { mes: 'Out', vendidas: 9,  canceladas: 0 },   // em curso
  ],

  carteiraTotal: { cotasAtivas: 486, contempladosAno: 38, contempladosFaturaramAqui: 31 },

  // Bônus Quality: remuneração extra atrelada à saúde da carteira
  bonusQuality: {
    regra: 'Adimplência ≥ 90% + cancelamento ≤ 12% na safra → bônus de 0,8% sobre o crédito comercializado no trimestre',
    trimestreAtual: { creditoComercializado: 1478000, adimplencia: 91.4, cancelamento: 8.7, elegivel: true, bonusEstimado: 11824 },
  },
}

export function situacaoCota(c: CotaConsorcio): SituacaoCota {
  if (c.faturado) return 'faturado'
  if (c.contemplado) return 'contemplado'
  if (c.atrasos) return 'atrasada'
  if (c.reserva) return 'lance'
  return 'emdia'
}

export function calcularConsorcio() {
  const d = consorcioData
  const cart = d.carteira.map(c => {
    const moto = liberacredTabela.find(m => m.modelo === c.modelo)!
    const plano = planosConsorcio.find(p => p.id === c.plano)!
    const prazo = plano.prazos.find(p => p.meses === c.meses)!
    const s = simularConsorcio(moto.valor, prazo)
    return { ...c, credito: moto.valor, planoNome: plano.nome, sim: s, situacao: situacaoCota(c) }
  })
  const contemplados = cart.filter(c => c.situacao === 'contemplado')
  const lances = cart.filter(c => c.situacao === 'lance')
  const atrasadas = cart.filter(c => c.situacao === 'atrasada')
  const creditoContemplado = contemplados.reduce((s, c) => s + c.credito, 0)
  const conversao = (d.carteiraTotal.contempladosFaturaramAqui / d.carteiraTotal.contempladosAno) * 100
  const adesao = Math.round((d.aderiramConsorcio / d.ofertadosConsorcio) * 100)
  return { cart, contemplados, lances, atrasadas, creditoContemplado, conversao, adesao }
}
