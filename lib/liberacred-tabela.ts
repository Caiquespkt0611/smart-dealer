// ── Liberacred · tabela oficial ──────────────────────────────────────────────
// Consultada em 07/10/2026 no simulador público do Banco Yamaha
// (liberacredyamaha.com.br → apicore.liberacred.com.br/api/v1/planos/simular).
// Valor de referência da moto, parcela mensal da entrada programada, valor que o
// cliente acumula (vira a entrada do CDC) e quantas parcelas em dia ele precisa
// pagar para poder antecipar o resto e pedir o financiamento.
// Regras do regulamento (Cartão Pré-Pago Yamaha · Programa Liberacred de Recarga Programada):
//  - adesão sem análise de crédito e sem comprovar renda; entrada de 30% a 50%
//  - com as parcelas em dia, o banco PODE conceder CDC de 50% a 70% da moto
//    (proposta na época da compra; exige não ter apontamento interno no banco)
//  - tarifas: adesão R$ 50, ativação R$ 19,90, mensalidade R$ 14,90,
//    19% sobre cada recarga; cancelar antes do fim do plano custa 19% do saldo
// Atualizar quando o banco mudar a tabela (rodar de novo a consulta da API).

export interface PlanoLiberacred {
  parcelas: number      // prazo do plano
  entradaPct: number    // % da moto que o cliente junta
  parcela: number       // parcela mensal
  acumulado: number     // entrada que ele leva para o financiamento
  aptoApos: number      // parcelas em dia para poder antecipar o resto
}

export interface MotoLiberacred {
  modelo: string
  valor: number
  planos: PlanoLiberacred[]
}

export const LIBERACRED_CONSULTA = '07/10/2026'

export const liberacredTabela: MotoLiberacred[] = [
  { modelo: 'ZR HYBRID CONNECTED', valor: 16508.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 1731.15, acumulado: 8254.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1048.21, acumulado: 6603.28, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 535.1, acumulado: 4952.46, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 704.94, acumulado: 6603.28, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 874.77, acumulado: 8254.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 362.86, acumulado: 4952.46, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 476.09, acumulado: 6603.28, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 589.31, acumulado: 8254.1, aptoApos: 6 },
  ] },
  { modelo: 'FLUO ABS HYBRID CONNECTED', valor: 19812.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2071.07, acumulado: 9906.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1252.16, acumulado: 7924.88, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 637.07, acumulado: 5943.66, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 840.9, acumulado: 7924.88, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1044.73, acumulado: 9906.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 430.85, acumulado: 5943.66, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 566.73, acumulado: 7924.88, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 702.62, acumulado: 9906.1, aptoApos: 6 },
  ] },
  { modelo: 'FACTOR 150', valor: 22054.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2301.73, acumulado: 11027.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1390.55, acumulado: 8821.68, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 706.27, acumulado: 6616.26, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 933.17, acumulado: 8821.68, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1160.06, acumulado: 11027.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 476.98, acumulado: 6616.26, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 628.24, acumulado: 8821.68, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 779.51, acumulado: 11027.1, aptoApos: 6 },
  ] },
  { modelo: 'AEROX ABS CONNECTED', valor: 22526.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2350.29, acumulado: 11263.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1419.69, acumulado: 9010.48, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 720.84, acumulado: 6757.86, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 952.59, acumulado: 9010.48, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1184.34, acumulado: 11263.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 486.69, acumulado: 6757.86, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 641.19, acumulado: 9010.48, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 795.69, acumulado: 11263.1, aptoApos: 6 },
  ] },
  { modelo: 'FACTOR 150 DX', valor: 22644.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2362.43, acumulado: 11322.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1426.97, acumulado: 9057.68, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 724.48, acumulado: 6793.26, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 957.45, acumulado: 9057.68, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1190.41, acumulado: 11322.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 489.12, acumulado: 6793.26, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 644.43, acumulado: 9057.68, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 799.74, acumulado: 11322.1, aptoApos: 6 },
  ] },
  { modelo: 'TTR 230', valor: 24178.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2520.25, acumulado: 12089.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1521.66, acumulado: 9671.28, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 771.83, acumulado: 7253.46, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1020.57, acumulado: 9671.28, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1269.32, acumulado: 12089.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 520.68, acumulado: 7253.46, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 686.51, acumulado: 9671.28, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 852.35, acumulado: 12089.1, aptoApos: 6 },
  ] },
  { modelo: 'FZ15 FAZER ABS CONNECTED', valor: 25358.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2641.65, acumulado: 12679.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1594.5, acumulado: 10143.28, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 808.25, acumulado: 7607.46, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1069.13, acumulado: 10143.28, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1330.02, acumulado: 12679.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 544.96, acumulado: 7607.46, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 718.89, acumulado: 10143.28, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 892.81, acumulado: 12679.1, aptoApos: 6 },
  ] },
  { modelo: 'XTZ 150 CROSSER S ABS', valor: 26892.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2799.47, acumulado: 13446.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1689.19, acumulado: 10756.88, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 855.59, acumulado: 8067.66, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1132.26, acumulado: 10756.88, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1408.93, acumulado: 13446.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 576.53, acumulado: 8067.66, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 760.97, acumulado: 10756.88, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 945.42, acumulado: 13446.1, aptoApos: 6 },
  ] },
  { modelo: 'XTZ 150 CROSSER Z ABS', valor: 27128.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2823.74, acumulado: 13564.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1703.76, acumulado: 10851.28, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 862.88, acumulado: 8138.46, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1141.97, acumulado: 10851.28, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1421.07, acumulado: 13564.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 581.38, acumulado: 8138.46, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 767.45, acumulado: 10851.28, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 953.51, acumulado: 13564.1, aptoApos: 6 },
  ] },
  { modelo: 'NMAX CONNECTED 160 ABS', valor: 27482.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2860.16, acumulado: 13741.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1725.61, acumulado: 10992.88, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 873.8, acumulado: 8244.66, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1156.54, acumulado: 10992.88, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1439.28, acumulado: 13741.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 588.67, acumulado: 8244.66, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 777.16, acumulado: 10992.88, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 965.65, acumulado: 13741.1, aptoApos: 6 },
  ] },
  { modelo: 'YZF R15 ABS', valor: 27836.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 2896.58, acumulado: 13918.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1747.47, acumulado: 11134.48, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 884.73, acumulado: 8350.86, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1171.11, acumulado: 11134.48, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1457.49, acumulado: 13918.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 595.95, acumulado: 8350.86, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 786.87, acumulado: 11134.48, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 977.79, acumulado: 13918.1, aptoApos: 6 },
  ] },
  { modelo: 'FZ25 FAZER ABS', valor: 29842.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 3102.96, acumulado: 14921.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 1871.29, acumulado: 11936.88, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 946.64, acumulado: 8952.66, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1253.66, acumulado: 11936.88, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1560.68, acumulado: 14921.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 637.23, acumulado: 8952.66, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 841.91, acumulado: 11936.88, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 1046.58, acumulado: 14921.1, aptoApos: 6 },
  ] },
  { modelo: 'XTZ 250 LANDER ABS CONNECTED', valor: 34562.2, planos: [
    { parcelas: 6, entradaPct: 50, parcela: 3588.56, acumulado: 17281.1, aptoApos: 3 },
    { parcelas: 8, entradaPct: 40, parcela: 2162.65, acumulado: 13824.88, aptoApos: 4 },
    { parcelas: 12, entradaPct: 30, parcela: 1092.32, acumulado: 10368.66, aptoApos: 8 },
    { parcelas: 12, entradaPct: 40, parcela: 1447.9, acumulado: 13824.88, aptoApos: 6 },
    { parcelas: 12, entradaPct: 50, parcela: 1803.48, acumulado: 17281.1, aptoApos: 6 },
    { parcelas: 18, entradaPct: 30, parcela: 734.35, acumulado: 10368.66, aptoApos: 8 },
    { parcelas: 18, entradaPct: 40, parcela: 971.4, acumulado: 13824.88, aptoApos: 6 },
    { parcelas: 18, entradaPct: 50, parcela: 1208.45, acumulado: 17281.1, aptoApos: 6 },
  ] },
]

export function planoLiberacred(modelo: string, parcelas: number, entradaPct: number) {
  const moto = liberacredTabela.find(m => m.modelo === modelo)
  return moto?.planos.find(p => p.parcelas === parcelas && p.entradaPct === entradaPct)
}

// nome da tabela oficial para a fala do vendedor: NMAX CONNECTED 160 ABS → NMAX Connected 160 ABS
export function nomeModelo(m: string) {
  return m.split(' ').map(w => /\d|^(ABS|NMAX|XTZ|YZF|TTR|ZR|DX)$/.test(w) ? w : w[0] + w.slice(1).toLowerCase()).join(' ')
}
