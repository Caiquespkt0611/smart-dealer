// Confere a projeção da Nippon com os dados VIVOS (Supabase) replicando
// exatamente a conta de lib/data.ts. Só leitura — não altera nada.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SD = dirname(dirname(fileURLToPath(import.meta.url)))
const env = Object.fromEntries(
  readFileSync(join(SD, '.env.local'), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const baixar = async (nome) => JSON.parse(await (await sb.storage.from('dados-sistema').download(nome)).data.text())
const ref = await baixar('referencia.json')
const cal = await baixar('calendario.json')
console.log('referencia.json:', JSON.stringify(ref))

const { data: vendas } = await sb.from('VendaMensal').select('quantidade,loja')
  .eq('grupo', 'NIPPON MOTOS').eq('ano', ref.ano).eq('mes', ref.mesCorrente)
const porLoja = {}
for (const v of vendas) porLoja[v.loja] = (porLoja[v.loja] ?? 0) + v.quantidade
const vendasMes = vendas.reduce((s, v) => s + v.quantidade, 0)
console.log('vendas mês corrente por loja:', porLoja, '→ total', vendasMes)

// pesosPonderados de lib/data.ts
const prefix = `${ref.ano}-${String(ref.mesCorrente).padStart(2, '0')}`
const dias = Object.entries(cal).filter(([d]) => d.startsWith(prefix))
  .map(([d, p]) => ({ dia: Number(d.slice(8)), peso: p })).sort((a, b) => a.dia - b.dia)
const uteis = dias.filter(d => d.peso > 0)
const peso = new Map(dias.map(d => [d.dia, d.peso]))
peso.set(uteis[uteis.length - 1].dia, 2.2)
peso.set(uteis[uteis.length - 2].dia, 1.7)
console.log(`calendário ${prefix}: ${dias.length} dias no blob, ${uteis.length} úteis`)

const m = (ref.dataEstoque ?? '').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
const hoje = new Date(); const diaHoje = hoje.getMonth() + 1 === ref.mesCorrente ? hoje.getDate() : 31
const diaCorte = m && Number(m[2]) === ref.mesCorrente && Number(m[1]) <= diaHoje ? Number(m[1]) : diaHoje
let pTotal = 0, pCorrido = 0
peso.forEach((p, dia) => { pTotal += p; if (dia <= diaCorte) pCorrido += p })
const proj = Math.round((vendasMes / pCorrido) * pTotal)
console.log(`diaHoje ${diaHoje} · diaCorte ${diaCorte} · peso corrido ${pCorrido.toFixed(1)}/${pTotal.toFixed(1)}`)
console.log(`PROJEÇÃO NO SITE: ${proj} (esperado 153)`)
