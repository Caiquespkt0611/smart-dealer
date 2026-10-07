/**
 * Leva a leitura semanal da concorrência para o banco do Smart Dealer.
 *
 *   node scripts/concorrencia/subir.mjs <arquivo.json>   confere e grava
 *   node scripts/concorrencia/subir.mjs --anterior       imprime a última leitura gravada (vazio se não houver)
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.loadEnvFile('.env.local')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const GRUPO = 'NIPPON MOTOS'

if (process.argv[2] === '--anterior') {
  const { data, error } = await sb.from('LeituraConcorrencia').select('dados').eq('grupo', GRUPO).order('lidoEm', { ascending: false }).limit(1)
  if (error) { console.error(error.message); process.exit(1) }
  if (data?.[0]) console.log(JSON.stringify(data[0].dados, null, 2))
  process.exit(0)
}

const arquivo = process.argv[2]
if (!arquivo) { console.error('uso: subir.mjs <arquivo.json>'); process.exit(1) }
const dados = JSON.parse(readFileSync(arquivo, 'utf8'))

// confere o mínimo para a tela não quebrar
const erros = []
if (!dados.veredito?.titulo) erros.push('sem veredito')
if (!Array.isArray(dados.concorrentes) || dados.concorrentes.length === 0) erros.push('sem concorrentes')
for (const c of dados.concorrentes ?? []) {
  if (!c.arroba) erros.push('concorrente sem arroba')
  if (!(c.agressividade >= 1 && c.agressividade <= 5)) erros.push(`${c.arroba}: agressividade fora de 1 a 5`)
}
if (!Array.isArray(dados.acoes) || dados.acoes.length === 0) erros.push('sem ações')
if (Number.isNaN(Date.parse(dados.lidoEm))) erros.push('lidoEm inválido')
if (erros.length) { console.error('leitura recusada:', erros.join('; ')); process.exit(1) }

const lidas = dados.concorrentes.filter((c) => c.leituraOk !== false).length
const id = `${GRUPO}|${dados.lidoEm.slice(0, 10)}`
const { error } = await sb.from('LeituraConcorrencia').upsert({ id, grupo: GRUPO, lidoEm: dados.lidoEm, dados })
if (error) { console.error(error.message); process.exit(1) }
console.log(`ok: ${id} gravada (${lidas} de ${dados.concorrentes.length} perfis lidos)`)
