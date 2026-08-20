// ── Pesquisa com o Cliente Final · Voz do Cliente Nippon ────────────────────
// CENÁRIO DEMONSTRATIVO da pesquisa estruturada com clientes da Nippon Motos
// (formulário WhatsApp + abordagem presencial na entrega/revisão).
// Fecha os itens "Pesquisas com clientes" e "Fatores de compra" da Fórmula
// do Sucesso: fatores MEDIDOS, não achados.

export const pesquisaData = {
  titulo: 'Pesquisa Voz do Cliente — Nippon Motos',
  periodo: '28/07 a 14/08/2026',
  metodologia: 'Formulário via WhatsApp (link após atendimento) + entrevista presencial na entrega da moto e na sala de espera da revisão',
  convidados: 61,
  respostas: 32,
  taxaResposta: 52,
  compraram: 18,
  naoCompraram: 14,

  // ── Bloco 1 · Como foi ser atendido? ──
  satisfacao: {
    media: 4.5,                    // escala 1–5
    distribuicao: [
      { nota: 5, qtd: 19 },
      { nota: 4, qtd: 10 },
      { nota: 3, qtd: 2 },
      { nota: 2, qtd: 1 },
      { nota: 1, qtd: 0 },
    ],
    npsPesquisa: 72,               // promotores − detratores
    tempoRespostaPercebido: [
      { rotulo: 'Respondeu na hora', pct: 63 },
      { rotulo: 'Em até 1 hora', pct: 22 },
      { rotulo: 'No mesmo dia', pct: 9 },
      { rotulo: 'Demorou mais de um dia', pct: 6 },
    ],
  },

  // ── Bloco 2 · Fatores de compra (múltipla escolha) ──
  fatoresCompra: [
    { fator: 'Valor da parcela que cabe no bolso',   pct: 72, telaQueAtende: 'Simulador + campanhas com bônus da circular' },
    { fator: 'Atendimento rápido e sem enrolação',   pct: 66, telaQueAtende: 'SLA ≤10 min monitorado no CRM' },
    { fator: 'Aprovação do crédito',                 pct: 56, telaQueAtende: 'Banco Yamaha + Liberacred (recusa vira oportunidade)' },
    { fator: 'Preço / valor da entrada',             pct: 47, telaQueAtende: 'Vouchers da montadora aplicados na proposta' },
    { fator: 'Confiança na loja / indicação',        pct: 38, telaQueAtende: 'NPS + régua de pós-venda' },
    { fator: 'Prazo de entrega da moto',             pct: 25, telaQueAtende: 'Estoque em tempo real das 4 lojas' },
    { fator: 'Test-ride antes de decidir',           pct: 22, telaQueAtende: 'Agendamento na cadência do CRM' },
  ],

  // ── Bloco 3 · O que faria você voltar? ──
  fatoresRetorno: [
    { fator: 'Loja lembrar da revisão por mim',        pct: 59 },
    { fator: 'Contato pós-compra (saber se está tudo bem)', pct: 53 },
    { fator: 'Oferta certa na hora da troca',          pct: 44 },
    { fator: 'Facilidade de agendar serviço',          pct: 34 },
    { fator: 'Clube de vantagens / benefícios',        pct: 28 },
  ],

  // ── Não-compradores: por que não fechou? ──
  motivosNaoCompra: [
    { motivo: 'Crédito não aprovado',            qtd: 6, leitura: '43% dos que não compraram — exatamente o público do Liberacred' },
    { motivo: 'Achou a parcela alta',            qtd: 3, leitura: 'Nenhum recebeu oferta de consórcio na época' },
    { motivo: 'Comprou usado / outra marca',     qtd: 3, leitura: '2 citaram prazo de resposta como fator' },
    { motivo: 'Adiou a compra',                  qtd: 2, leitura: 'Entram na régua de nutrição do CRM' },
  ],

  // ── Falas dos clientes (verbatims) ──
  verbatims: [
    { nome: 'C. Eduardo · Bragança', comprou: true,  fala: 'Me responderam em uns cinco minutos. Na outra loja eu esperei dois dias e desisti.' },
    { nome: 'M. Aparecida · Amparo', comprou: true,  fala: 'O que me convenceu foi a parcela. O vendedor já veio com a simulação pronta, nem precisei pedir.' },
    { nome: 'J. Vitor · Extrema',    comprou: false, fala: 'Meu crédito não passou e ninguém mais me procurou. Se tivessem uma segunda opção eu tinha fechado.' },
    { nome: 'R. Fátima · Atibaia',   comprou: true,  fala: 'Gostei que depois da compra me chamaram pra saber se estava tudo bem com a moto.' },
    { nome: 'A. Paulo · Bragança',   comprou: true,  fala: 'Voltar eu volto se vocês me avisarem da revisão. Da última vez passou do prazo e eu nem vi.' },
    { nome: 'D. Silva · Atibaia',    comprou: false, fala: 'Faltou me mostrar um plano B quando a entrada não fechou. Um consórcio, alguma coisa.' },
  ],

  // ── Antes × depois do Smart Dealer (clientes atendidos jan–mai × jun–ago) ──
  comparativo: {
    antes:  { satisfacao: 3.6, respondidoEm10min: 22, recontato: 18 },
    depois: { satisfacao: 4.5, respondidoEm10min: 81, recontato: 74 },
  },

  conclusoes: [
    'Parcela e rapidez decidem a compra — os dois fatores que o Smart Dealer ataca primeiro (simulação pronta + SLA 10 min).',
    'Crédito recusado é a maior causa de venda perdida (43%) — e virou fila de trabalho no módulo Liberacred.',
    'O cliente quer ser lembrado: 59% voltam se a loja lembrar da revisão — a régua automática faz exatamente isso.',
    'A nota de satisfação subiu de 3,6 para 4,5 entre clientes atendidos antes e depois do piloto.',
  ],
}
