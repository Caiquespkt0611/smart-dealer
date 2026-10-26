// ── Referência do mês ─────────────────────────────────────────────────────────
// Dois relógios (regra herdada do Performance Concessionário):
//   carta, varejo, ritmo, projeção  → mês corrente
//   mercado, share, giro, tendência → último mês fechado
// Ao virar o mês: re-rodar scripts/extrair_dados.py + atualizar_supabase.mjs
// e ajustar mesCorrente/mesFechado abaixo.
export const REF = {
  ano: 2026,
  mesCorrente: 8,
  mesFechado: 7,
} as const

const MESES_PT = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
// Meses nas telas. Pedido de 26/10/2026: a base ainda é de agosto, mas o sistema
// se apresenta como outubro — todo mês da base aparece 2 meses à frente
// (julho → setembro, agosto → outubro). Ao subir os dados de outubro, voltar para 0.
export const DESLOCAMENTO_MESES = 2

export function mesTela(mes: number, ano: number = REF.ano) {
  const t = ano * 12 + (mes - 1) + DESLOCAMENTO_MESES
  return { mes: (t % 12) + 1, ano: Math.floor(t / 12) }
}
export const nomeMesTela = (m: number) => (m ? MESES_PT[mesTela(m).mes] : '') ?? ''
export const abrevMesTela = (m: number) => nomeMesTela(m).slice(0, 3)
export const mesAnoTela = (mes: number, ano: number) => {
  const t = mesTela(mes, ano)
  return `${MESES_PT[t.mes].slice(0, 3)}/${String(t.ano).slice(2)}`
}
const ABREV = MESES_PT.map(m => m.slice(0, 3))
/** 'Jul' → 'Set' (rótulos de mês já gravados como texto) */
export const abrevTextoTela = (abrev: string) => {
  const i = ABREV.indexOf(abrev)
  return i > 0 ? abrevMesTela(i) : abrev
}

export const NOME_MES_CORRENTE = nomeMesTela(REF.mesCorrente)
export const NOME_MES_FECHADO = nomeMesTela(REF.mesFechado)
