// Atendimento de Leads — relatório diário no formato do modelo em
// _NOVAS MELHORIAS (PDFs Motoryama / Apex CRM): cobertura de linhas, resumo por
// vendedor, placar da semana, ontem × dia normal, leads quentes e análise
// individual.
//
// ⚠️ DADOS PROJETADOS (simulação): números fictícios da equipe Nippon no formato
// que a implementação real vai entregar quando as linhas de WhatsApp forem
// conectadas (Evolution). Vendedores = os mesmos do CRM demo.

export interface VendedorDia {
  nome: string
  leadsRecebidos: number
  semResposta: number
  tempoMedioMin: number   // mediana da 1ª resposta em horário comercial
  followUpPct: number     // % dos leads do dia que receberam retomada (meta 100%)
  tentouVenderPct: number
  qualificouPct: number
  // médias de um dia normal da semana anterior (para o comparativo)
  mediaDia: {
    leads: number
    semResposta: number
    tempoMedioMin: number
    followUpPct: number
    tentouVenderPct: number
    qualificouPct: number
  }
}

export interface LeadQuente {
  vendedor: string
  cliente: string
  telefone: string
  ultimoContato: string
  ultimaMensagem: string   // última fala do CLIENTE — a venda parou com ele esperando
  motivos: string[]
}

export interface PlacarDia {
  dia: string
  leads: number
  semResposta: number
  tempoMedioMin: number
  followUpPct: number
  qualificouPct: number
  tentouVenderPct: number
}

export const atendimentoData = {
  projetado: true,
  referencia: 'Relatório de ontem — quarta-feira, 06/08/2026',
  preparadoPara: 'Gerente de vendas · Nippon Motos',
  fonte: 'Formato: conversas de WhatsApp (Evolution) com áudios transcritos · comparado à média de um dia normal da semana (30/07–05/08)',

  linhas: { ativas: 4, total: 6, offline: ['Bárbara Cunha', 'Diego Castellani'] },

  vendedores: [
    {
      nome: 'Gisele Medeiros',
      leadsRecebidos: 38, semResposta: 4, tempoMedioMin: 6, followUpPct: 31, tentouVenderPct: 55, qualificouPct: 45,
      mediaDia: { leads: 33.5, semResposta: 6.2, tempoMedioMin: 9, followUpPct: 22, tentouVenderPct: 47, qualificouPct: 38 },
    },
    {
      nome: 'Jadson Conceição',
      leadsRecebidos: 29, semResposta: 9, tempoMedioMin: 14, followUpPct: 12, tentouVenderPct: 41, qualificouPct: 34,
      mediaDia: { leads: 26.8, semResposta: 5.1, tempoMedioMin: 8, followUpPct: 19, tentouVenderPct: 44, qualificouPct: 36 },
    },
    {
      nome: 'Marcos Oliveira',
      leadsRecebidos: 22, semResposta: 8, tempoMedioMin: 19, followUpPct: 9, tentouVenderPct: 32, qualificouPct: 27,
      mediaDia: { leads: 20.4, semResposta: 4.0, tempoMedioMin: 11, followUpPct: 17, tentouVenderPct: 39, qualificouPct: 33 },
    },
    {
      nome: 'Wagner Pinho',
      leadsRecebidos: 31, semResposta: 5, tempoMedioMin: 3, followUpPct: 26, tentouVenderPct: 48, qualificouPct: 39,
      mediaDia: { leads: 28.1, semResposta: 7.4, tempoMedioMin: 5, followUpPct: 24, tentouVenderPct: 45, qualificouPct: 35 },
    },
  ] as VendedorDia[],

  placarSemana: [
    { dia: 'Seg 03/08', leads: 112, semResposta: 21, tempoMedioMin: 8, followUpPct: 23, qualificouPct: 34, tentouVenderPct: 42 },
    { dia: 'Ter 04/08', leads: 105, semResposta: 18, tempoMedioMin: 7, followUpPct: 26, qualificouPct: 36, tentouVenderPct: 45 },
    { dia: 'Qua 05/08', leads: 98,  semResposta: 24, tempoMedioMin: 10, followUpPct: 18, qualificouPct: 31, tentouVenderPct: 40 },
    { dia: 'Qui 06/08', leads: 120, semResposta: 26, tempoMedioMin: 9, followUpPct: 21, qualificouPct: 37, tentouVenderPct: 44 },
  ] as PlacarDia[],

  leadsQuentes: [
    {
      vendedor: 'Gisele Medeiros', cliente: 'Renan', telefone: '+5511987001122', ultimoContato: '06/08 19h42',
      ultimaMensagem: 'Fechando em 36x fica quanto a parcela da Fazer?',
      motivos: ['proposta em aberto', 'já qualificado', 'perguntou parcela e ficou sem resposta'],
    },
    {
      vendedor: 'Gisele Medeiros', cliente: 'Patrícia M.', telefone: '+5511986223344', ultimoContato: '06/08 18h10',
      ultimaMensagem: 'Consigo trazer minha Biz na troca?',
      motivos: ['proposta em aberto', 'usada na troca — avaliar'],
    },
    {
      vendedor: 'Jadson Conceição', cliente: 'Rodrigo', telefone: '+5511985445566', ultimoContato: '06/08 17h55',
      ultimaMensagem: 'Meu nome tá restrito, tem como fazer mesmo assim?',
      motivos: ['já qualificado', 'restrição — sem consórcio oferecido'],
    },
    {
      vendedor: 'Jadson Conceição', cliente: 'Ana Paula', telefone: '+5511984667788', ultimoContato: '06/08 16h30',
      ultimaMensagem: 'Vocês têm a NMAX na cor cinza?',
      motivos: ['proposta em aberto', 'pediu disponibilidade de cor'],
    },
    {
      vendedor: 'Marcos Oliveira', cliente: 'Cléber', telefone: '+5511983889900', ultimoContato: '06/08 15h48',
      ultimaMensagem: 'Manda a simulação com entrada de 3 mil',
      motivos: ['proposta em aberto', 'já qualificado', 'pediu simulação e não recebeu'],
    },
    {
      vendedor: 'Marcos Oliveira', cliente: 'Josi', telefone: '+5511982001133', ultimoContato: '06/08 14h05',
      ultimaMensagem: 'Vou pensar e te falo',
      motivos: ['esfriando — retomar com condição de agosto'],
    },
    {
      vendedor: 'Wagner Pinho', cliente: 'Douglas', telefone: '+5511981224455', ultimoContato: '06/08 19h20',
      ultimaMensagem: 'A taxa zero vale até quando?',
      motivos: ['proposta em aberto', 'já qualificado', 'campanha com prazo — urgência real'],
    },
  ] as LeadQuente[],
} as const

export function totaisDia() {
  const v = atendimentoData.vendedores
  const leads = v.reduce((s, x) => s + x.leadsRecebidos, 0)
  const semResposta = v.reduce((s, x) => s + x.semResposta, 0)
  return { leads, semResposta, pctSemResposta: Math.round((semResposta / leads) * 100) }
}

export function veredito(v: VendedorDia): { texto: string; ok: boolean } {
  const pctLargou = Math.round((v.semResposta / v.leadsRecebidos) * 100)
  const problemas: string[] = []
  if (pctLargou >= 20) problemas.push(`largou ${v.semResposta} leads (${pctLargou}%) — alto`)
  if (v.followUpPct < 15) problemas.push(`follow-up baixo (${v.followUpPct}%)`)
  if (v.tempoMedioMin > 10) problemas.push(`tempo de resposta ${v.tempoMedioMin} min — meta ≤ 10`)
  if (!problemas.length) {
    return { texto: `largou pouco (${pctLargou}%) · qualificou bem (${v.qualificouPct}%)`, ok: true }
  }
  return { texto: problemas.join(' · '), ok: false }
}
