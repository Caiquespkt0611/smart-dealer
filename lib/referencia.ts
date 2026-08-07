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
export const NOME_MES_CORRENTE = MESES_PT[REF.mesCorrente]
export const NOME_MES_FECHADO = MESES_PT[REF.mesFechado]
