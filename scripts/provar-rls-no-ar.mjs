/**
 * Prova, no ar, o que a anon key deste projeto realmente alcança.
 *
 * O catálogo do Postgres não responde sozinho: RLS ligado com grant aberto
 * pode tanto barrar tudo (sem policy) quanto liberar tudo (policy permissiva).
 * Quem decide é a API REST. Aqui bate-se nela do jeito que um curioso bateria.
 *
 * A anon key é pública por design — e neste projeto ela é usada de verdade
 * (lib/supabase.ts), então este teste importa mais aqui que nos outros.
 *
 * Rodar: node scripts/provar-rls-no-ar.mjs
 */
process.loadEnvFile('.env.local')
const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`
const CHAVE = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!CHAVE) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY ausente')

const TABELAS = ['VendaMensal', 'Meta', 'Estoque', 'LeadMensal', 'NPSMensal']
const cab = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` }
let vazou = []

for (const t of TABELAS) {
  const r = await fetch(`${BASE}/${t}?select=*&limit=2`, { headers: cab })
  const corpo = await r.text()
  let linhas = null
  try { linhas = JSON.parse(corpo) } catch {}
  const leu = Array.isArray(linhas) && linhas.length > 0
  if (leu) vazou.push(t)
  console.log(`${leu ? 'VAZOU' : 'ok   '} ${t.padEnd(14)} HTTP ${r.status}  ${corpo.slice(0, 90)}`)
}

const w = await fetch(`${BASE}/Meta`, {
  method: 'POST', headers: { ...cab, 'Content-Type': 'application/json' },
  body: JSON.stringify({ teste_rls: 'nao_deveria_entrar' }),
})
console.log(`\n${w.status >= 200 && w.status < 300 ? 'VAZOU' : 'ok   '} escrita anon  HTTP ${w.status}`)

console.log('\n' + '='.repeat(50))
console.log(vazou.length ? `EXPOSTAS: ${vazou.join(', ')}` : 'A porta está fechada para a anon key.')
