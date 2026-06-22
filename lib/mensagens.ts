// Mensagens de WhatsApp — fonte única (fácil de editar).
// Trocar o texto aqui muda o disparo em todas as telas.

const PRIMEIRO_NOME = (nome: string) => nome.trim().split(' ')[0]

/** Mensagem de chamada para revisão (Pós-Vendas). */
export function mensagemRevisao(nome: string, modelo: string): string {
  return (
    `Olá, ${PRIMEIRO_NOME(nome)}! 🏍️\n` +
    `Aqui é a equipe da *Nippon Motos* (Yamaha).\n\n` +
    `Passando para lembrar que a revisão da sua *${modelo}* está na hora. ` +
    `Manter as revisões em dia garante a *segurança*, a *performance* e a *garantia de fábrica* da sua moto.\n\n` +
    `Podemos agendar o melhor dia e horário para você? Estamos à disposição! 🔧`
  )
}

/** Mensagem de oferta de renovação/upgrade. */
export function mensagemRenovacao(nome: string, modeloAtual: string, ofertaModelo: string, voucher: string): string {
  return (
    `Olá, ${PRIMEIRO_NOME(nome)}! 🏍️\n` +
    `Aqui é a *Nippon Motos* (Yamaha).\n\n` +
    `Temos uma condição especial de upgrade da sua *${modeloAtual}* para a nova *${ofertaModelo}*, ` +
    `com voucher de *${voucher}* na troca.\n\n` +
    `Quer que eu te apresente a proposta? Posso simular agora mesmo! 🚀`
  )
}
