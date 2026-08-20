// Cliente da demonstração de RECOMPRA ESTRATÉGICA (Pós-Vendas).
// Hélio usa número real para o disparo ao vivo — editar aqui muda a demo.
// História: financiamento no Banco Yamaha quase quitado → o sistema avisa a
// loja ANTES do cliente ir ao mercado, com super avaliação da usada e a campanha
// ativa do modelo de destino já cruzada (CA-MTC028-26: Fazer R$ 1.000).
export const recompraEstrategica = {
  nome: 'Hélio',
  telefone: '5511994797060',
  modeloAtual: 'Factor 150 ED',
  anoCompra: 2023,
  parcelasRestantes: 2,
  ofertaModelo: 'Fazer 250 ABS',
  voucherCampanha: 1000,
} as const
