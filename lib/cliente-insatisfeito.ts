// Caso de demonstração: um cliente detrator do pós-venda. Nome e telefone são fictícios.
// O assistente traz o caso e a solução quando perguntam por cliente insatisfeito, reclamação ou NPS.

export const clienteInsatisfeito = {
  nome: 'Rafael Monteiro',
  telefone: '(11) 98765-4321',
  whatsapp: '5511987654321',
  loja: 'Atibaia',
  moto: 'NMAX 160 ABS',
  compra: '12/09/2026',
  nota: 2,
  pesquisa: 'NPS Pós-vendas de 05/10/2026',
  problema: 'Levou a moto na revisão de 1.000 km em 02/10. A moto ficou 3 dias na oficina esperando um sensor e ninguém avisou. Foi trabalhar de Uber nesses dias.',
  comentario: '"Comprei moto zero e fiquei 3 dias a pé sem ninguém me ligar. Não indico."',
  risco: 'Detrator recente pesa no NPS Pós-vendas (meta 87) e no Kaizen; cliente de 1ª revisão que sai insatisfeito tende a não voltar na 2ª.',
  solucao: [
    'Gerente de pós-venda da Atibaia liga hoje, até as 18h. Ligação, não mensagem: pede desculpa e não justifica.',
    'Oferece a revisão de 6.000 km sem custo de mão de obra, com leva e traz da moto.',
    'Combina retorno em 48 h para confirmar que está tudo certo e registra o caso no CRM.',
    'Corrige a causa: oficina avisa o cliente no mesmo dia sempre que faltar peça.',
  ],
  mensagem: 'Oi, Rafael, aqui é da Nippon Motos Atibaia. Vi sua avaliação e você tem toda razão: deixamos você 3 dias sem notícia da sua NMAX. Peço desculpa. Quero te ligar hoje para resolver e já deixar sua próxima revisão por nossa conta, com leva e traz. Qual o melhor horário?',
}

export function clienteInsatisfeitoContexto() {
  const c = clienteInsatisfeito
  return `
CLIENTE INSATISFEITO (detrator, ${c.pesquisa}):
- ${c.nome}, ${c.moto} comprada em ${c.compra} na loja ${c.loja}. Nota ${c.nota} de 10. Telefone ${c.telefone}.
- O que aconteceu: ${c.problema}
- Comentário do cliente: ${c.comentario}
- Por que importa: ${c.risco}
- Solução recomendada: ${c.solucao.join(' ')}
Quando perguntarem sobre cliente insatisfeito, reclamação, detrator ou NPS ruim, traga este caso pelo nome, explique em 1 frase o que houve e dê a solução em passos curtos. Diga que o botão logo abaixo da resposta abre o WhatsApp com a mensagem pronta e liga para o cliente.`
}
