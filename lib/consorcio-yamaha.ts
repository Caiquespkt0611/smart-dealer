// ── Consórcio Yamaha · regras oficiais ───────────────────────────────────────
// Conferido em 07/10/2026 em consorcioyamaha.com.br/compreonline (FAQ oficial),
// yamahaservicosfinanceiros.com.br/consorcio/informacoes-importantes e no contrato
// de adesão Série T (motocicletas, automóveis, motor de popa e caminhões, 09/06/2026).
// As taxas abaixo são do ANEXO II (Tabela de Taxas) do contrato. A parcela que o
// sistema mostra é estimativa: o valor oficial sai na proposta da administradora.

export const CONSORCIO_CONSULTA = '07/10/2026'
export const CONSORCIO_FONTE = 'Contrato Série T (jun/2026) e FAQ oficial do Consórcio Yamaha'

// % mensal do crédito: fundo comum + taxa de administração (iguais em todas as
// parcelas: a taxa maior do 1º ano compensa o fundo comum menor) e a taxa de
// administração total do prazo.
export interface PrazoConsorcio { meses: number; mensalPct: number; taxaAdmTotalPct: number }
export interface PlanoConsorcio {
  id: 'mega' | 'master'
  nome: string
  resumo: string
  lances: string
  prazos: PrazoConsorcio[]
}

const pz = (meses: number, fc1: number, ta1: number, ta2: number): PrazoConsorcio => ({
  meses,
  mensalPct: fc1 + ta1,
  taxaAdmTotalPct: Math.round((12 * ta1 + (meses - 12) * ta2) * 10) / 10,
})

export const planosConsorcio: PlanoConsorcio[] = [
  {
    id: 'mega',
    nome: 'Contempla + Mega',
    resumo: 'Mais contemplações por lance fixo: o ciclo de lances se repete 3 vezes por assembleia.',
    lances: 'Por assembleia: 2 sorteios, depois lance livre, lance limitado, lance fixo de 35% e lance fixo de 25%, 3 vezes seguidas. Aceita lance embutido de até 15%. Não parcela o lance.',
    prazos: [
      pz(36, 2.5578, 0.72, 0.39),
      pz(48, 1.8358, 0.6642, 0.3342),
      pz(60, 1.4027, 0.6307, 0.3007),
      pz(72, 1.1139, 0.6222, 0.2922),
      pz(80, 0.9695, 0.5993, 0.2693),
    ],
  },
  {
    id: 'master',
    nome: 'Contempla + Master',
    resumo: 'Taxa de administração menor, parcela mais baixa. O ciclo de lances roda 1 vez por assembleia.',
    lances: 'Por assembleia: 2 sorteios, depois lance livre, lance limitado, lance fixo de 35% e lance fixo de 25%, e então lances livres. Aceita lance embutido de até 15%.',
    prazos: [
      pz(36, 2.5578, 0.5672, 0.2372),
      pz(48, 1.8358, 0.5288, 0.1988),
      pz(60, 1.4027, 0.514, 0.184),
      pz(72, 1.1139, 0.4972, 0.1672),
    ],
  },
]

// Seguro de quebra de garantia (obrigatório, moto): 0,1107% ao mês sobre o valor
// do bem acrescido da taxa de administração total (ANEXO II).
export const SEGURO_SQG_MOTO = 0.1107
// Seguro de vida (opcional, moto): 0,0114% ao mês, mesma base.
export const SEGURO_VIDA_MOTO = 0.0114
export const LANCE_EMBUTIDO_MAX = 15

export function simularConsorcio(credito: number, prazo: PrazoConsorcio) {
  const base = credito * (1 + prazo.taxaAdmTotalPct / 100)
  const semSeguro = credito * prazo.mensalPct / 100
  const seguro = base * SEGURO_SQG_MOTO / 100
  const parcela = semSeguro + seguro
  const lanceFixo = (pct: number) => base * pct / 100
  const embutido = credito * LANCE_EMBUTIDO_MAX / 100
  return {
    parcela,
    semSeguro,
    seguro,
    rendaMinima: parcela * 3,
    custoTotal: base,
    lance25: lanceFixo(25),
    lance35: lanceFixo(35),
    embutido,
    lance25DoBolso: Math.max(0, lanceFixo(25) - embutido),
  }
}

// ── O essencial, em frases curtas para o vendedor ────────────────────────────
export const passosConsorcio = [
  { t: 'Escolhe a moto e o prazo', s: 'Sem entrada: o crédito inteiro é parcelado no prazo. Planos de 36 a 80 meses.' },
  { t: 'Paga a parcela todo mês', s: 'Sem juros e sem taxa de adesão. A taxa de administração já vem diluída na parcela.' },
  { t: 'Concorre todo mês', s: 'Assembleia mensal, com sorteio pela Loteria Federal e lances. Em dia, concorre desde a 1ª parcela.' },
  { t: 'Contemplado, retira a moto', s: 'Usa o crédito na concessionária e segue pagando até quitar.' },
]

export const vantagensConsorcio = [
  'Consórcio de fábrica: administradora da Yamaha Motor do Brasil, há mais de 39 anos',
  'Sem juros, sem entrada e sem taxa de adesão',
  'Negativado pode entrar: na contemplação, apresenta fiador (não pode ser o cônjuge)',
  'Fiscalizado pelo Banco Central (Lei 11.795/2008)',
  'Desistiu em até 7 dias da assinatura? Recebe tudo de volta, corrigido',
]

export const lancesConsorcio = [
  { t: 'Lance livre', s: 'O cliente oferta o percentual que quiser: de 1 parcela até o saldo devedor do grupo. Ganha o maior.' },
  { t: 'Lance fixo (25% ou 35%)', s: 'Percentual definido pelo grupo. Empate é decidido pela Loteria Federal.' },
  { t: 'Lance limitado', s: 'Ganha o maior percentual, mas pago só com dinheiro do cliente: sem embutido e sem parcelar.' },
  { t: 'Lance embutido', s: `Até ${LANCE_EMBUTIDO_MAX}% do próprio crédito vira lance. Pode somar com o fixo ou o livre.` },
]

export const prazosAssembleia = [
  'Lance pela concessionária ou e-mail: até 24 h antes da assembleia',
  'Lance pelo app Consórcio Online, site ou URA: até 2 h antes',
  'Lance vencedor: pagar em até 3 dias úteis, senão perde a contemplação',
  'Vale só 1 modalidade por mês: o último lance substitui o anterior',
]

export const liberacaoCredito = [
  'Parcelas em dia',
  'RG/CPF ou CNH e comprovante de residência',
  'Renda de pelo menos 3 vezes a parcela (ou fiador)',
  'Nota fiscal da moto: a administradora libera o crédito em até 3 dias úteis',
]

export const duvidasConsorcio = [
  { p: 'Tem juros?', r: 'Não. Só a taxa de administração, que já vem diluída na parcela e fica fixa no contrato.' },
  { p: 'Precisa de entrada?', r: 'Não. O crédito é todo parcelado no prazo escolhido.' },
  { p: 'Estou com nome sujo, posso?', r: 'Pode entrar. Na hora da contemplação, se ainda tiver restrição, apresenta um fiador que não seja o cônjuge.' },
  { p: 'Quando sou contemplado?', r: 'Não dá para prever. Concorre todo mês desde a 1ª parcela, em dia. Com lance, a chance aumenta.' },
  { p: 'A parcela aumenta?', r: 'Na cota ligada a uma moto, acompanha o preço da moto definido pela fábrica. Nos planos IPCA, corrige uma vez por ano.' },
  { p: 'E se eu atrasar?', r: 'Atrasado não concorre. Com 3 parcelas atrasadas, seguidas ou não, a cota é cancelada.' },
  { p: 'E se eu desistir?', r: 'Em até 7 dias da assinatura, devolução total corrigida. Depois, a cota cancelada concorre a sorteio para receber de volta, com os descontos do contrato.' },
  { p: 'Posso usar FGTS?', r: 'Para lance, só no consórcio de imóveis.' },
]

// Como o consórcio faz a concessionária vender mais (ligado às regras acima)
export const vendeMais = [
  { t: 'Ninguém sai sem proposta', s: 'Sem entrada, sem juros, e negativado pode entrar. Atende quem o CDC recusou e não consegue juntar a entrada nem no Liberacred.' },
  { t: 'Venda futura na agenda', s: 'Toda assembleia contempla: 2 sorteios e os lances. Cada cota vendida na loja é uma moto faturada na loja quando sair, com acessório, seguro e revisão.' },
  { t: 'Lance acelera a venda', s: 'Quem tem uma reserva usa o lance fixo de 25% somado ao embutido de 15% e pode sair com a moto nos primeiros meses.' },
  { t: 'Contemplado é cliente quente', s: 'O crédito vale em qualquer concessionária Yamaha. O sistema avisa na semana da assembleia para a moto sair daqui, e não do vizinho.' },
  { t: 'Carteira em dia paga bônus', s: 'Com 3 parcelas atrasadas a cota cai. Retenção ativa (reduzir o crédito, repassar a cota) protege o cliente e o Bônus Quality.' },
]

// Qual caminho oferecer
export const caminhos = [
  { quando: 'Tem entrada e o banco aprovou', oferta: 'CDC do Banco Yamaha', obs: 'Sai com a moto hoje.' },
  { quando: 'Banco recusou, mas consegue juntar 30% em até 18x', oferta: 'Liberacred', obs: 'Em 6 a 8 parcelas em dia, pede o financiamento.' },
  { quando: 'Sem entrada, negativado ou quer parcela sem juros', oferta: 'Consórcio Yamaha', obs: 'Concorre todo mês; com lance, pode sair antes.' },
]
