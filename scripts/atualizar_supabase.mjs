// Atualiza Supabase do Smart Dealer com os dados do DADOS_DE_EMPLACAMENTO.xlsx (04/08/2026)
// - Meta: carta de agosto por grupo (upsert)
// - VendaMensal: substitui meses 1–7/2026 (todas as 9 CCYs)
// - Estoque: substitui tudo (posição 02/08/2026)
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = join(dirname(fileURLToPath(import.meta.url)), 'dados')
const SD = '/Users/caiqueoliveira/Documents/MEUS PROJETOS/_YamahaWay/smart-dealer'

// env
const env = Object.fromEntries(
  readFileSync(join(SD, '.env.local'), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')])
)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const varejo = JSON.parse(readFileSync(join(here, 'varejo.json'), 'utf8'))
const estoque = JSON.parse(readFileSync(join(here, 'estoque.json'), 'utf8'))
const metas = JSON.parse(readFileSync(join(here, 'metas.json'), 'utf8'))

let seq = 0
const uid = p => `${p}${Date.now().toString(36)}${(seq++).toString(36).padStart(4, '0')}`

async function chunkedInsert(table, rows) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await sb.from(table).insert(rows.slice(i, i + 500))
    if (error) throw new Error(`${table} insert: ${error.message}`)
  }
}

// --- Meta (agosto) ---
for (const [grupo, carta] of Object.entries(metas)) {
  const { error } = await sb.from('Meta').upsert({ id: uid('m'), grupo, carta }, { onConflict: 'grupo', ignoreDuplicates: false })
  if (error) {
    // upsert com id novo conflita no unique grupo → update direto
    const { error: e2 } = await sb.from('Meta').update({ carta }).eq('grupo', grupo)
    if (e2) throw new Error(`Meta ${grupo}: ${e2.message}`)
  }
}
console.log('Meta: cartas de agosto gravadas', metas)

// --- VendaMensal ---
{
  const { error } = await sb.from('VendaMensal').delete().eq('ano', 2026).in('mes', [1, 2, 3, 4, 5, 6, 7])
  if (error) throw new Error('VendaMensal delete: ' + error.message)
  await chunkedInsert('VendaMensal', varejo.map(v => ({ id: uid('v'), ...v })))
  console.log(`VendaMensal: ${varejo.length} linhas (jan–jul/2026, 9 grupos)`)
}

// --- Estoque ---
{
  const { error } = await sb.from('Estoque').delete().neq('id', '')
  if (error) throw new Error('Estoque delete: ' + error.message)
  await chunkedInsert('Estoque', estoque.map(e => ({ id: uid('e'), ...e })))
  console.log(`Estoque: ${estoque.length} linhas (posição 02/08/2026)`)
}

// --- conferência ---
const { data: chk } = await sb.from('VendaMensal').select('mes,quantidade').eq('grupo', 'NIPPON MOTOS').eq('ano', 2026)
const porMes = {}
for (const r of chk ?? []) porMes[r.mes] = (porMes[r.mes] ?? 0) + r.quantidade
console.log('Conferência Nippon por mês:', porMes)
const { data: est } = await sb.from('Estoque').select('chao,transito').eq('grupo', 'NIPPON MOTOS')
console.log('Estoque Nippon: chão', est.reduce((s, r) => s + r.chao, 0), '· trânsito', est.reduce((s, r) => s + r.transito, 0))
