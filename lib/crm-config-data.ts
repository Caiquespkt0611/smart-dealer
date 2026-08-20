// ── CRM · Configuração & Governança ─────────────────────────────────────────
// CENÁRIO DEMONSTRATIVO — mostra COMO o CRM da Nippon é governado dentro do
// Smart Dealer (inspirado na parametrização de CRMs de grupo — hierarquia,
// régua de cobrança, regionalização, cadências e motivos de perda).
// A efetividade vem da COBRANÇA CONFIGURADA, não da boa vontade.

export const crmConfigData = {
  grupo: 'Nippon Motos',
  atualizadoEm: '18/08/2026',

  // ── Hierarquia de cobrança ──
  hierarquia: {
    gerente: { nome: 'André Camargo', papel: 'Gerente Comercial do Grupo', rotina: 'Auditoria do funil às 9h · 14h · 18h, todos os dias' },
    coordenadores: [
      { nome: 'Rafael Lima',  regional: 'Regional 1 — Bragança + Extrema', vendedores: 5 },
      { nome: 'Bruna Castro', regional: 'Regional 2 — Atibaia + Amparo',   vendedores: 4 },
    ],
  },

  // ── Regionalização: cada lead cai na loja certa, automaticamente ──
  regionais: [
    { loja: 'Bragança Paulista', regiao: 'Bragança, Piracaia, Joanópolis, Vargem, Pedra Bela', vendedores: 3, leadsMes: 74, distribuicao: 'Rodízio ponderado por conversão' },
    { loja: 'Atibaia',           regiao: 'Atibaia, Bom Jesus dos Perdões, Nazaré Paulista',    vendedores: 2, leadsMes: 51, distribuicao: 'Rodízio ponderado por conversão' },
    { loja: 'Amparo',            regiao: 'Amparo, Serra Negra, Monte Alegre do Sul, Pedreira', vendedores: 2, leadsMes: 38, distribuicao: 'Rodízio simples' },
    { loja: 'Extrema',           regiao: 'Extrema, Itapeva, Camanducaia, Toledo (Sul de MG)',  vendedores: 2, leadsMes: 29, distribuicao: 'Rodízio simples' },
  ],

  // ── Régua de cobrança (o coração da efetividade) ──
  regua: [
    { minuto: 'Lead entra',  quem: 'Sistema',    acao: 'Distribui pela regional + dispara notificação ao vendedor' },
    { minuto: '5 min',       quem: 'Vendedor',   acao: 'Alerta de lead parado no celular do vendedor' },
    { minuto: '10 min',      quem: 'Sistema',    acao: 'SLA estourado — lead marcado em vermelho no painel' },
    { minuto: '15 min',      quem: 'Gerente',    acao: 'Escalonamento: André recebe o lead não atendido no WhatsApp' },
    { minuto: '2 h',         quem: 'Sistema',    acao: 'Redistribuição automática para o próximo vendedor do rodízio' },
    { minuto: 'D+1',         quem: 'Vendedor',   acao: 'Follow-up obrigatório (roteiro do Playbook)' },
    { minuto: 'D+3',         quem: 'Vendedor',   acao: '2º follow-up — oferta da campanha vigente (circular ago/26)' },
    { minuto: 'D+7',         quem: 'Gerente',    acao: 'Revisão do lead em aberto na reunião diária' },
    { minuto: 'D+15',        quem: 'Sistema',    acao: 'Lead esfriou — entra na régua de nutrição mensal' },
  ],

  // ── Cadência por origem ──
  cadencias: [
    { origem: 'Meta Ads',    sla: '10 min', toques: 6, canal: 'WhatsApp → ligação → WhatsApp' },
    { origem: 'Site Yamaha', sla: '10 min', toques: 5, canal: 'WhatsApp → ligação' },
    { origem: 'Google',      sla: '15 min', toques: 5, canal: 'WhatsApp → ligação' },
    { origem: 'Showroom',    sla: 'Imediato', toques: 4, canal: 'Presencial → WhatsApp D+1' },
    { origem: 'Indicação',   sla: '30 min', toques: 3, canal: 'Ligação → WhatsApp' },
  ],

  // ── Motivos de perda padronizados (cada perda alimenta uma nova frente) ──
  motivosPerda: [
    { motivo: 'Crédito recusado',        destino: 'Vai automático p/ Oportunidades Liberacred (Banco Yamaha)', pct: 31 },
    { motivo: 'Comprou concorrente',     destino: 'Pesquisa de perda + análise de preço no Market Share',      pct: 24 },
    { motivo: 'Sem resposta (sumiu)',    destino: 'Régua de nutrição mensal + campanha de resgate',            pct: 18 },
    { motivo: 'Aguardando entrada',      destino: 'Oferta de consórcio como plano B',                          pct: 14 },
    { motivo: 'Preço/condição',          destino: 'Alerta de campanha da montadora quando o modelo entra',     pct: 13 },
  ],

  // ── Permissões por papel ──
  permissoes: [
    { papel: 'TITULAR',  ve: 'Tudo (4 lojas, todos os funis, financeiro)', edita: 'Configuração completa' },
    { papel: 'GERENTE',  ve: 'Funis das lojas + ranking + SLA',            edita: 'Regras de distribuição e cadências' },
    { papel: 'VENDEDOR', ve: 'Apenas os próprios leads',                   edita: 'Estágio e anotações do lead' },
    { papel: 'CONSULTOR', ve: 'Indicadores agregados (sem dados pessoais)', edita: 'Nada' },
  ],

  // ── Integrações ativas ──
  integracoes: [
    { nome: 'WhatsApp (Evolution API)', status: 'ativo',   uso: 'Atendimento + disparos da régua' },
    { nome: 'Meta Ads',                 status: 'ativo',   uso: 'Leads de tráfego pago em tempo real' },
    { nome: 'Site Yamaha (leads)',      status: 'ativo',   uso: 'Formulários oficiais da marca' },
    { nome: 'Banco Yamaha · Liberacred', status: 'ativo',  uso: 'Recusa vira oportunidade automaticamente' },
    { nome: 'Emplacamento (Supabase)',  status: 'ativo',   uso: 'Planilha mensal → metas e share sem digitação' },
  ],

  // ── Efetividade: o que a governança mudou ──
  efetividade: {
    antes: { tempoResposta: '3h 47min', sla10min: 22, conversao: 8.1, semResposta: 32, followupFeito: 41 },
    depois: { tempoResposta: '8 min',   sla10min: 81, conversao: 13.9, semResposta: 2,  followupFeito: 94 },
    leitura: 'Mesma equipe, mesmos leads — o que mudou foi a cobrança: régua automática + escalonamento ao gerente + redistribuição.',
  },
}
