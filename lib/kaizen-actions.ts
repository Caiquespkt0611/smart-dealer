// Ações recomendadas por indicador Kaizen (quando status != OK).
// Texto orientado a "o que fazer para recuperar os pontos".

export function kaizenAcao(indicador: string, descricao: string): string {
  const k = (indicador + ' ' + descricao).toLowerCase()
  if (k.includes('leads')) return 'Reduzir tempo de 1º atendimento e aumentar conversão: ronda diária da fila de leads e follow-up em até 10 min.'
  if (k.includes('estrutura') && k.includes('serviços')) return 'Agendar visita do consultor para reaplicar a pesquisa do bloco "Serviços" e fechar os itens de maturidade pendentes.'
  if (k.includes('estrutura')) return 'Reaplicar a pesquisa presencial de estrutura/processos com o consultor e corrigir os itens abertos antes do fechamento.'
  if (k.includes('vi 2.0') || k.includes('uniforme')) return 'Garantir uniforme em conformidade com a circular CA-MTC-008-26 em vendas e pós-vendas (pontuação extra).'
  if (k.includes('test ride')) return 'Programar e registrar 20 test rides/mês no sistema oficial — escalar agenda de fim de semana.'
  if (k.includes('ytá') || k.includes('yta') || k.includes('técnico')) return 'Concluir os treinamentos obrigatórios YTA da equipe técnica na Universidade Yamaha.'
  if (k.includes('ysa')) return 'Concluir os treinamentos obrigatórios YSA da equipe de vendas.'
  if (k.includes('sell in')) return 'Acelerar retirada de Peças/Acessórios/Yamalube para crescer ≥10% vs semestre anterior — campanha de balcão e oficina.'
  if (k.includes('revis')) return 'Aumentar revisões periódicas: acionar fila ativa de pós-vendas e lembretes de revisão (ver módulo Pós-Vendas).'
  if (k.includes('blu club') || k.includes('garagem')) return 'Cadastrar 0km no app Blu Club / Minha Garagem na entrega técnica — meta ≥80% de instalação.'
  if (k.includes('yamalube')) return 'Manter adesão à Compra Programada do Yamalube em todos os meses do semestre.'
  if (k.includes('yac') || k.includes('consórcio') || k.includes('liberacred')) return 'Aumentar venda de cotas de consórcio/LiberaCred para atingir a faixa Diamante do Quality Performance.'
  if (k.includes('absorção') || k.includes('crédito')) return 'Elevar lucro bruto de peças e serviços para taxa de absorção ≥40%.'
  if (k.includes('nps')) return 'Manter NPS acima da meta com pós-atendimento e pesquisa ativa de satisfação.'
  return 'Revisar o indicador com o consultor Yamaha e definir plano de recuperação dos pontos.'
}
