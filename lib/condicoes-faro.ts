// Condições da campanha Faro de Vantagens para setembro e outubro de 2026, da circular
// CA-MTC-093-26 (errata, 31/08/2026). Em cada modelo vale a linha que a Yamaha destacou para
// divulgação em mídias sociais ("Faro de Vantagens" ou a condição 1 com o destaque amarelo).
// Nov e dez saem em circular nova: trocar esta tabela e VALIDADE quando ela chegar.

export const CIRCULAR = 'CA-MTC-093-26'
export const VALIDADE = '2026-10-31'

export interface CondicaoFaro {
  entrada: number          // 0 = sem entrada
  prazo: number            // meses
  parcela: number
  taxaZero: boolean
  carencia: number         // dias para a 1ª parcela
  bonus500: boolean        // voucher de R$ 500 da campanha de varejo (não cumulativo com a taxa subsidiada)
}

const TABELA: [RegExp, CondicaoFaro][] = [
  [/LANDER/,          { entrada: 15469, prazo: 12, parcela: 1396, taxaZero: true,  carencia: 90, bonus500: true }],
  [/FZ25|FAZER 250/,  { entrada: 13462, prazo: 12, parcela: 1228, taxaZero: true,  carencia: 90, bonus500: true }],
  [/FACTOR.*DX/,      { entrada: 0,     prazo: 48, parcela: 837,  taxaZero: false, carencia: 90, bonus500: true }],
  [/FACTOR/,          { entrada: 0,     prazo: 48, parcela: 814,  taxaZero: false, carencia: 90, bonus500: true }],
  [/CROSSER.*Z/,      { entrada: 4999,  prazo: 48, parcela: 745,  taxaZero: false, carencia: 90, bonus500: true }],
  [/CROSSER/,         { entrada: 4999,  prazo: 48, parcela: 737,  taxaZero: false, carencia: 90, bonus500: true }],
  [/FZ15|FAZER FZ15/, { entrada: 4800,  prazo: 36, parcela: 800,  taxaZero: false, carencia: 90, bonus500: false }],
  [/NMAX/,            { entrada: 4999,  prazo: 48, parcela: 766,  taxaZero: false, carencia: 90, bonus500: false }],
  [/XMAX/,            { entrada: 20191, prazo: 12, parcela: 1791, taxaZero: true,  carencia: 90, bonus500: false }],
  [/AEROX/,           { entrada: 0,     prazo: 48, parcela: 795,  taxaZero: false, carencia: 90, bonus500: false }],
  [/FLUO/,            { entrada: 0,     prazo: 48, parcela: 700,  taxaZero: false, carencia: 90, bonus500: false }],
  [/\bZR\b/,          { entrada: 5175,  prazo: 48, parcela: 399,  taxaZero: false, carencia: 90, bonus500: false }],
  [/NEO/,             { entrada: 13359, prazo: 18, parcela: 813,  taxaZero: true,  carencia: 90, bonus500: false }],
  [/MT-03/,           { entrada: 7299,  prazo: 48, parcela: 978,  taxaZero: false, carencia: 90, bonus500: false }],
  [/MT-07/,           { entrada: 28356, prazo: 12, parcela: 2474, taxaZero: true,  carencia: 90, bonus500: false }],
  [/R15/,             { entrada: 5099,  prazo: 48, parcela: 758,  taxaZero: false, carencia: 90, bonus500: false }],
  [/\bR3\b/,          { entrada: 9650,  prazo: 48, parcela: 999,  taxaZero: false, carencia: 90, bonus500: false }],
  [/T[ÉE]N[ÉE]R[ÉE]/, { entrada: 34929, prazo: 12, parcela: 2999, taxaZero: true,  carencia: 90, bonus500: false }],
  [/TRACER/,          { entrada: 18579, prazo: 36, parcela: 1758, taxaZero: false, carencia: 90, bonus500: false }],
  [/TT-?R/,           { entrada: 0,     prazo: 48, parcela: 858,  taxaZero: false, carencia: 90, bonus500: false }],
]

/** Condição da Faro de Vantagens para o modelo, ou null se a circular não traz ou se já venceu. */
export function condicaoFaro(modelo: string, hoje = new Date()): CondicaoFaro | null {
  if (hoje.toISOString().slice(0, 10) > VALIDADE) return null
  const m = modelo.toUpperCase()
  return TABELA.find(([re]) => re.test(m))?.[1] ?? null
}

const reais = (v: number) => 'R$ ' + v.toLocaleString('pt-BR')

/** As linhas da arte, na ordem em que aparecem, e a frase única para a legenda da IA. */
export function textoCondicao(c: CondicaoFaro) {
  const linhas = [
    c.entrada === 0 ? 'Entrada zero' : `Entrada de ${reais(c.entrada)}`,
    `+ ${c.prazo}x de ${reais(c.parcela)}`,
    c.taxaZero ? 'Taxa zero' : '',
    `1ª parcela em ${c.carencia} dias`,
  ].filter(Boolean)
  const frase = `${linhas.join(', ')}${c.bonus500 ? '. Ou bônus de R$ 500 no lugar da taxa subsidiada' : ''}. Condição Banco Yamaha, válida até 31/10/2026, sujeita a análise de crédito.`
  return { linhas, frase }
}
