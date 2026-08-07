// YAMAHAWAY 2026 — Grupo 6 (Shogun Riders) · dossiê da banca dentro do produto.
// Fontes: gráficos de aranha da 1ª banca (pptm), Fórmula do Sucesso (pptx) e
// transcrição da 1ª apresentação (docx) em _NOVAS MELHORIAS.

export const radarBanca = [
  { criterio: 'Pesquisa', grupo6: 3.78, media: 2.67, top3: 3.85 },
  { criterio: 'Planejamento', grupo6: 4.0, media: 2.68, top3: 3.94 },
  { criterio: 'Foco no Cliente', grupo6: 3.83, media: 2.85, top3: 3.81 },
  { criterio: 'Inovação', grupo6: 4.33, media: 3.1, top3: 4.19 },
  { criterio: 'Trabalho em Equipe', grupo6: 4.25, media: 3.28, top3: 4.36 },
  { criterio: 'Viabilidade e Impacto', grupo6: 4.17, media: 2.93, top3: 4.21 },
] as const

export interface RespostaBanca {
  pedido: string
  quem: string
  resposta: string
  status: 'entregue' | 'em-andamento' | 'planejado'
  evidencia?: string // rota no sistema
}

export const feedbackRespostas: RespostaBanca[] = [
  {
    pedido: 'Smart Dealer como pilar integrador dos CRMs Yamaha + Dealer (leads, fluxo de loja, não convertidos, agendamentos)',
    quem: 'Banca — Jornada do Cliente',
    resposta: 'O CRM de leads com pipeline por estágio e origem já existe; a régua de revisão dispara WhatsApp. Próximo passo: webhooks reais Meta/Google/site para fechar o "limbo do lead" citado na banca — hoje a montadora gera o lead e perde a visão quando cai na loja.',
    status: 'em-andamento',
    evidencia: '/crm',
  },
  {
    pedido: 'KPIs do ponto de vista do cliente: % atendido em 10 min, tempo de atendimento, conversão, transparência',
    quem: 'Banca — Jornada do Cliente',
    resposta: 'Tempo de atendimento, TCA e LCR já são medidos contra as metas Kaizen (≤10 min · ≥80% · ≥9%) e ficam vermelhos quando estouram. O comparativo com/sem Smart Dealer está descrito abaixo, no business case.',
    status: 'entregue',
    evidencia: '/leads',
  },
  {
    pedido: 'Investimento (implantação + mensal) vs ganhos, com números',
    quem: 'Banca',
    resposta: 'Piloto custa R$ 600/mês pago pela Nippon. Só a campanha Campeões de Vendas tem até R$ 100 mil em jogo no trimestre — e o sistema mostra ao titular exatamente quantas motos faltam para cada degrau de prêmio. Business case detalhado abaixo.',
    status: 'entregue',
    evidencia: '/vouchers',
  },
  {
    pedido: 'Vantagem competitiva pelo "como" (know-how), não pelo software',
    quem: 'Banca',
    resposta: 'O software qualquer um contrata; o que não se copia é o que foi codificado dentro dele: a regra dos dois relógios, a decomposição efeito mercado × share, o PDCA que nasce de números medidos, a leitura do DRE pelo K2 e a circular de campanha traduzida em cenários. É o método do consultor virando produto.',
    status: 'entregue',
    evidencia: '/performance',
  },
  {
    pedido: 'Sair do conceitual: execução, mensuração e aderência às diretrizes',
    quem: 'Banca',
    resposta: 'Cinco módulos novos entregues rodando com dados reais da Nippon: Performance + PDCA, K2 (absorção), Linha de Crédito, Campanhas Yamaha e a atualização automática mensal da base de emplacamento.',
    status: 'entregue',
    evidencia: '/k2',
  },
  {
    pedido: 'IA Claude não é homologada pela Yamaha — governança e segurança',
    quem: 'Banca',
    resposta: 'Reconhecido e endereçado: (1) todos os módulos de dados e regras funcionam SEM IA — a IA é camada opcional e desacoplável; (2) hoje a Yamaha disponibiliza o Copilot, e a orientação recebida foi justificar o uso de um modelo robusto — "isso aqui é mais do que justificativa"; (3) o piloto é SaaS contratado pela Nippon, que só enxerga os próprios dados.',
    status: 'em-andamento',
  },
]

export const businessCase = {
  investimento: {
    mensal: 600,
    descricao: 'SaaS pago pela concessionária (piloto Nippon) · sem custo de implantação para a montadora',
  },
  // ganhos mensuráveis que o próprio sistema acompanha
  ganhos: [
    { rotulo: 'Campanha Campeões de Vendas (trimestre)', detalhe: 'R$ 7,5 mil já garantidos · até R$ 100 mil no cenário 110% — o sistema mostra quantas motos faltam para cada degrau', valorAno: 'até R$ 400 mil/ano' },
    { rotulo: 'PDCA em 1 clique', detalhe: 'Plano de Ação Yamaha que levava horas de consultoria para montar sai do sistema em segundos, com ações medidas', valorAno: '~8h/mês de consultor' },
    { rotulo: 'K2 — absorção do pós-vendas', detalhe: 'Gap para os 65% quantificado (~R$ 41 mil/mês de MC) com as duas alavancas na tela', valorAno: 'alvo: +R$ 490 mil/ano de MC' },
    { rotulo: 'Crédito sem ligação para o financeiro', detalhe: 'Semáforo + simulador respondem "posso comprar?" em 5 segundos', valorAno: 'menos pedidos travados' },
  ],
}

export const comSemSmartDealer = [
  { processo: 'Saber se o mês fecha na carta', sem: 'Planilha manual no fim do mês', com: 'Projeção diária ponderada por dias úteis, com salto da carta na largada' },
  { processo: 'Plano de ação (PDCA)', sem: 'Consultor monta à mão no Excel', com: '1 clique — ações nascem dos números (ritmo, segmentos, praças, invasão)' },
  { processo: 'Entender por que o varejo caiu', sem: 'Achismo ("o mercado está ruim")', com: 'Decomposição exata: efeito mercado × efeito share, por segmento e cidade' },
  { processo: 'Pós-vendas cobrindo a operação', sem: 'DRE lido uma vez por trimestre', com: 'K2 mensal com gap para os 65% e alavancas quantificadas' },
  { processo: 'Limite de crédito', sem: 'Ligação para o financeiro / montadora', com: 'Semáforo + simulador de pedido na tela' },
  { processo: 'Campanhas de incentivo', sem: 'Circular no e-mail, conta de cabeça', com: 'Apuração mês a mês + cenários em R$ do que está em jogo' },
  { processo: 'Atualização dos dados', sem: 'Re-digitação mensal', com: 'Planilha publicada uma vez → sistema atualiza sozinho' },
] as const

export const formulaSucesso = [
  { criterio: 'Pesquisa', evidencia: 'Mercado real de emplacamento (BrasilAPI + base Yamaha), 230 CNPJs concorrentes mapeados e nomeados, análises por segmento e cidade.' },
  { criterio: 'Planejamento e Objetivos', evidencia: 'Objetivo mensurável por módulo: carta do mês, absorção 65%, PE < 50%, prêmio da campanha — todos com número na tela.' },
  { criterio: 'Foco no Cliente', evidencia: 'Régua de revisão com disparo WhatsApp, tempo de atendimento ≤10 min monitorado, CRM por origem — atacando o "limbo do lead".' },
  { criterio: 'Pensar Fora da Caixa', evidencia: 'O método do consultor virou produto: PDCA automático, dois relógios, DRE lido por software. Não é comprar ferramenta — é codificar know-how.' },
  { criterio: 'Trabalho em Equipe', evidencia: 'Concessionária (Nippon paga e usa o piloto) + consultor de campo + orientador — decisões da banca viram release no sistema.' },
  { criterio: 'Viabilidade e Impacto', evidencia: 'R$ 600/mês, SaaS, zero instalação. Escalável para os 9 grupos da regional — o banco já é multi-grupo desde o dia 1.' },
] as const
