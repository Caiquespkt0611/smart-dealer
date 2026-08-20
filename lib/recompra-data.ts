// Cliente da demonstração de RECOMPRA ESTRATÉGICA (Pós-Vendas).
// Hélio usa número real para o disparo ao vivo — editar aqui muda a demo.
// História: financiamento no Banco Yamaha quase quitado → o sistema avisa a
// loja ANTES do cliente ir ao mercado, com a usada avaliada e a campanha
// ativa do modelo de destino já cruzada (CA-MTC030-26: MT-07 R$ 2.500).
export const recompraEstrategica = {
  nome: 'Hélio',
  telefone: '5511994797060',
  modeloAtual: 'Fazer 250 ABS',
  anoCompra: 2023,
  parcelasRestantes: 2,
  avaliacaoUsada: 16900,
  ofertaModelo: 'MT-07 ABS',
  voucherCampanha: 2500,
} as const
