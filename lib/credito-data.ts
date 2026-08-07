// Posição da linha de crédito do grupo econômico junto à Yamaha (base do sistema).
// Valores do print da base — atualizar aqui quando chegar posição nova.
// Espec: _NOVAS MELHORIAS/_LIMITE DE CRÉDITO.docx — trabalhar SOMENTE com os
// dados agregados; sem chassi, NF, datas, histórico ou extrato (a base não tem).

export const creditoData = {
  referencia: 'Posição da base do sistema · Ago/2026',
  grupo: 'NIPPON MOTOS',
  limite: 3_200_000.00,
  consumo: [
    { chave: 'motoYA',  rotulo: 'Moto YA',  valor: 33_153.32,
      explica: 'Operações de motocicletas que utilizam a linha de crédito (pedidos em processamento).' },
    { chave: 'outrosYA', rotulo: 'Outros YA', valor: 2_887_405.13,
      explica: 'Operações já realizadas que seguem consumindo a linha até a liquidação (motos faturadas e não liquidadas).' },
    { chave: 'outrosYB', rotulo: 'Outros YB', valor: 264_433.81,
      explica: 'Outras operações vinculadas ao grupo econômico que também consomem a linha de crédito.' },
  ],
  reservas: [
    { chave: 'pedidoLiberado', rotulo: 'Pedido Liberado', valor: 22_186.19,
      explica: 'Pedidos aprovados que já reservaram limite de crédito.' },
    { chave: 'agrupamento', rotulo: 'Agrupamento', valor: 1_878.33,
      explica: 'Valores reservados para operações em processamento.' },
  ],
} as const

export function calcularCredito() {
  const consumoAtual = creditoData.consumo.reduce((s, c) => s + c.valor, 0)
  const compromissos = creditoData.reservas.reduce((s, r) => s + r.valor, 0)
  // Disponível = Limite − Consumo Atual − Pedido Liberado − Agrupamento
  const disponivel = creditoData.limite - consumoAtual - compromissos
  const pctUtilizado = (consumoAtual + compromissos) / creditoData.limite * 100
  const status: 'disponivel' | 'atencao' | 'excedido' =
    disponivel < 0 ? 'excedido' : pctUtilizado >= 90 ? 'atencao' : 'disponivel'
  return { consumoAtual, compromissos, disponivel, pctUtilizado, status }
}
