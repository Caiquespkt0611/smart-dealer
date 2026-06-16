import * as fs from 'fs'
import * as path from 'path'

// ── Helpers ────────────────────────────────────────────────────────────────
function q(v: string | number | null): string {
  if (v === null) return 'NULL'
  if (typeof v === 'number') return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

function cuid(): string {
  return 'c' + Math.random().toString(36).substring(2, 17) + Math.random().toString(36).substring(2, 10)
}

type ModelDist = { modelo: string; pct: number }

function distribute(total: number, models: ModelDist[]): Array<{ modelo: string; qty: number }> {
  if (total === 0) return models.map(m => ({ modelo: m.modelo, qty: 0 }))
  const result: Array<{ modelo: string; qty: number }> = []
  let remaining = total
  const sorted = [...models].sort((a, b) => b.pct - a.pct)
  for (let i = 0; i < sorted.length - 1; i++) {
    const qty = Math.round((total * sorted[i].pct) / 100)
    result.push({ modelo: sorted[i].modelo, qty })
    remaining -= qty
  }
  result.push({ modelo: sorted[sorted.length - 1].modelo, qty: remaining })
  return result
}

// ── Model distributions ────────────────────────────────────────────────────
const DIST_BP: ModelDist[] = [
  { modelo: 'FAZER 250 ABS', pct: 20 },
  { modelo: 'FACTOR 150 ED', pct: 12 },
  { modelo: 'AEROX', pct: 11 },
  { modelo: 'FACTOR 150 DX', pct: 9 },
  { modelo: 'FAZER FZ15 ABS', pct: 9 },
  { modelo: 'LANDER 250 ABS', pct: 8 },
  { modelo: 'FLUO ABS', pct: 7 },
  { modelo: 'CROSSER 150 Z ABS', pct: 6 },
  { modelo: 'NMAX', pct: 5 },
  { modelo: 'R15 ABS', pct: 5 },
  { modelo: 'MT-03 ABS', pct: 3 },
  { modelo: 'XMAX 300', pct: 2 },
  { modelo: 'YAMAHA ZR', pct: 2 },
  { modelo: 'TT-R 230', pct: 1 },
]

const DIST_EX: ModelDist[] = [
  { modelo: 'FAZER 250 ABS', pct: 20 },
  { modelo: 'LANDER 250 ABS', pct: 16 },
  { modelo: 'FACTOR 150 ED', pct: 10 },
  { modelo: 'NMAX', pct: 10 },
  { modelo: 'AEROX', pct: 8 },
  { modelo: 'FACTOR 150 DX', pct: 8 },
  { modelo: 'R15 ABS', pct: 8 },
  { modelo: 'FLUO ABS', pct: 7 },
  { modelo: 'FAZER FZ15 ABS', pct: 6 },
  { modelo: 'CROSSER 150 Z ABS', pct: 5 },
  { modelo: 'XMAX 300', pct: 2 },
]

const NIPPON_BP = [
  { mes: 1, ano: 2025, total: 99 }, { mes: 2, ano: 2025, total: 100 },
  { mes: 3, ano: 2025, total: 106 }, { mes: 4, ano: 2025, total: 101 },
  { mes: 5, ano: 2025, total: 115 }, { mes: 6, ano: 2025, total: 96 },
  { mes: 7, ano: 2025, total: 131 }, { mes: 8, ano: 2025, total: 131 },
  { mes: 9, ano: 2025, total: 120 }, { mes: 10, ano: 2025, total: 122 },
  { mes: 11, ano: 2025, total: 68 }, { mes: 12, ano: 2025, total: 128 },
  { mes: 1, ano: 2026, total: 98 }, { mes: 2, ano: 2026, total: 84 },
  { mes: 3, ano: 2026, total: 150 }, { mes: 4, ano: 2026, total: 130 },
  { mes: 5, ano: 2026, total: 130 }, { mes: 6, ano: 2026, total: 33 },
]

const NIPPON_EX = [
  { mes: 12, ano: 2025, total: 9 }, { mes: 1, ano: 2026, total: 27 },
  { mes: 2, ano: 2026, total: 31 }, { mes: 3, ano: 2026, total: 24 },
  { mes: 4, ano: 2026, total: 27 }, { mes: 5, ano: 2026, total: 22 },
  { mes: 6, ano: 2026, total: 9 },
]

const lines: string[] = [
  '-- Smart Dealer · Seed SQL',
  '-- Execute no Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor',
  '',
  '-- 1. Criar tabelas',
  `CREATE TABLE IF NOT EXISTS "VendaMensal" ("id" TEXT NOT NULL PRIMARY KEY, "grupo" TEXT NOT NULL, "loja" TEXT NOT NULL, "modelo" TEXT NOT NULL, "mes" INTEGER NOT NULL, "ano" INTEGER NOT NULL, "quantidade" INTEGER NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "Meta" ("id" TEXT NOT NULL PRIMARY KEY, "grupo" TEXT NOT NULL UNIQUE, "carta" DOUBLE PRECISION NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "Estoque" ("id" TEXT NOT NULL PRIMARY KEY, "grupo" TEXT NOT NULL, "loja" TEXT NOT NULL, "modelo" TEXT NOT NULL, "chao" INTEGER NOT NULL DEFAULT 0, "transito" INTEGER NOT NULL DEFAULT 0);`,
  `CREATE TABLE IF NOT EXISTS "LeadMensal" ("id" TEXT NOT NULL PRIMARY KEY, "referencia" TEXT NOT NULL UNIQUE, "leads" INTEGER NOT NULL, "leadsUnicos" INTEGER NOT NULL, "tempoAtendMin" DOUBLE PRECISION NOT NULL, "tcaPct" DOUBLE PRECISION NOT NULL, "lcrGrupoPct" DOUBLE PRECISION NOT NULL, "diasConversao" DOUBLE PRECISION NOT NULL);`,
  `CREATE TABLE IF NOT EXISTS "NPSMensal" ("id" TEXT NOT NULL PRIMARY KEY, "referencia" TEXT NOT NULL, "tipo" TEXT NOT NULL, "scoreMensal" DOUBLE PRECISION NOT NULL, "scoreTrimestral" DOUBLE PRECISION NOT NULL, "promotores" DOUBLE PRECISION NOT NULL, "neutros" DOUBLE PRECISION NOT NULL, "detratores" DOUBLE PRECISION NOT NULL);`,
  '',
  '-- 2. Metas',
]

const metas = [
  { grupo: 'ACJ', carta: 67 }, { grupo: 'AVALON', carta: 73 },
  { grupo: 'CELMAR', carta: 311 }, { grupo: 'I9 MOTOS', carta: 210 },
  { grupo: 'MOTO PINDA', carta: 50 }, { grupo: 'MOTO PRAIA', carta: 110 },
  { grupo: 'NIPPON MOTOS', carta: 160 }, { grupo: 'NOBRE MOTOS', carta: 188 },
]
for (const m of metas) {
  lines.push(`INSERT INTO "Meta" ("id","grupo","carta") VALUES (${q(cuid())},${q(m.grupo)},${q(m.carta)}) ON CONFLICT ("grupo") DO NOTHING;`)
}

lines.push('', '-- 3. Vendas Nippon Bragança Paulista')
for (const { mes, ano, total } of NIPPON_BP) {
  const dist = distribute(total, DIST_BP)
  for (const { modelo, qty } of dist) {
    if (qty > 0) {
      lines.push(`INSERT INTO "VendaMensal" ("id","grupo","loja","modelo","mes","ano","quantidade") VALUES (${q(cuid())},${q('NIPPON MOTOS')},${q('Bragança Paulista')},${q(modelo)},${q(mes)},${q(ano)},${q(qty)});`)
    }
  }
}

lines.push('', '-- 4. Vendas Nippon Extrema')
for (const { mes, ano, total } of NIPPON_EX) {
  const dist = distribute(total, DIST_EX)
  for (const { modelo, qty } of dist) {
    if (qty > 0) {
      lines.push(`INSERT INTO "VendaMensal" ("id","grupo","loja","modelo","mes","ano","quantidade") VALUES (${q(cuid())},${q('NIPPON MOTOS')},${q('Extrema')},${q(modelo)},${q(mes)},${q(ano)},${q(qty)});`)
    }
  }
}

lines.push('', '-- 5. Vendas regionais (totais por grupo)')
const GRUPOS_REGIONAL = [
  { grupo: 'ACJ', meta: 67 },
  { grupo: 'AVALON', meta: 73 },
  { grupo: 'CELMAR', meta: 311 },
  { grupo: 'I9 MOTOS', meta: 210 },
  { grupo: 'MOTO PINDA', meta: 50 },
  { grupo: 'MOTO PRAIA', meta: 110 },
  { grupo: 'NOBRE MOTOS', meta: 188 },
]

// Historical months jan/2025 to mai/2026
const MONTHS_HIST = [
  {mes:1,ano:2025},{mes:2,ano:2025},{mes:3,ano:2025},{mes:4,ano:2025},
  {mes:5,ano:2025},{mes:6,ano:2025},{mes:7,ano:2025},{mes:8,ano:2025},
  {mes:9,ano:2025},{mes:10,ano:2025},{mes:11,ano:2025},{mes:12,ano:2025},
  {mes:1,ano:2026},{mes:2,ano:2026},{mes:3,ano:2026},{mes:4,ano:2026},
  {mes:5,ano:2026},
]

// Pcts for each group to make Nippon rank 4th in June 2026
const GROUP_PCTS: Record<string, number> = {
  'CELMAR': 0.81, 'I9 MOTOS': 0.76, 'AVALON': 0.72,
  'MOTO PRAIA': 0.62, 'ACJ': 0.58, 'NOBRE MOTOS': 0.50, 'MOTO PINDA': 0.48,
}

for (const { grupo, meta } of GRUPOS_REGIONAL) {
  const pct = GROUP_PCTS[grupo] ?? 0.65
  for (const { mes, ano } of MONTHS_HIST) {
    const variation = 0.9 + Math.sin(mes * 0.5 + ano * 0.1) * 0.15
    const qty = Math.round(meta * pct * variation)
    if (qty > 0) {
      lines.push(`INSERT INTO "VendaMensal" ("id","grupo","loja","modelo","mes","ano","quantidade") VALUES (${q(cuid())},${q(grupo)},${q(grupo)},${q('TOTAL')},${q(mes)},${q(ano)},${q(qty)});`)
    }
  }
  // June 2026 partial
  const junQty = Math.round(meta * pct * 0.27)
  if (junQty > 0) {
    lines.push(`INSERT INTO "VendaMensal" ("id","grupo","loja","modelo","mes","ano","quantidade") VALUES (${q(cuid())},${q(grupo)},${q(grupo)},${q('TOTAL')},${q(6)},${q(2026)},${q(junQty)});`)
  }
}

lines.push('', '-- 6. Estoque Nippon Bragança Paulista')
const ESTOQUE_BP = [
  { modelo: 'AEROX', chao: 0, transito: 3 },
  { modelo: 'CROSSER 150 S ABS', chao: 1, transito: 0 },
  { modelo: 'CROSSER 150 Z ABS', chao: 10, transito: 1 },
  { modelo: 'FACTOR 150 DX', chao: 0, transito: 8 },
  { modelo: 'FACTOR 150 ED', chao: 0, transito: 10 },
  { modelo: 'FAZER 250 ABS', chao: 9, transito: 13 },
  { modelo: 'FLUO ABS', chao: 5, transito: 1 },
  { modelo: 'FAZER FZ15 ABS', chao: 4, transito: 10 },
  { modelo: 'LANDER 250 ABS', chao: 6, transito: 2 },
  { modelo: 'MT-03 ABS', chao: 0, transito: 3 },
  { modelo: 'MT-07 ABS', chao: 0, transito: 1 },
  { modelo: 'NMAX', chao: 3, transito: 1 },
  { modelo: 'R15 ABS', chao: 3, transito: 4 },
  { modelo: 'R3 ABS', chao: 1, transito: 0 },
  { modelo: 'TÉNÉRÉ 700', chao: 1, transito: 0 },
  { modelo: 'TT-R 230', chao: 0, transito: 1 },
  { modelo: 'XMAX 300', chao: 6, transito: 4 },
  { modelo: 'YAMAHA ZR', chao: 1, transito: 5 },
]
for (const e of ESTOQUE_BP) {
  lines.push(`INSERT INTO "Estoque" ("id","grupo","loja","modelo","chao","transito") VALUES (${q(cuid())},${q('NIPPON MOTOS')},${q('Bragança Paulista')},${q(e.modelo)},${q(e.chao)},${q(e.transito)});`)
}

lines.push('', '-- 7. Estoque Nippon Extrema')
const ESTOQUE_EX = [
  { modelo: 'AEROX', chao: 1, transito: 0 },
  { modelo: 'CROSSER 150 S ABS', chao: 0, transito: 1 },
  { modelo: 'CROSSER 150 Z ABS', chao: 0, transito: 2 },
  { modelo: 'FACTOR 150 ED', chao: 1, transito: 1 },
  { modelo: 'FAZER 250 ABS', chao: 1, transito: 2 },
  { modelo: 'FLUO ABS', chao: 1, transito: 1 },
  { modelo: 'FAZER FZ15 ABS', chao: 0, transito: 1 },
  { modelo: 'LANDER 250 ABS', chao: 3, transito: 3 },
  { modelo: 'NMAX', chao: 2, transito: 0 },
  { modelo: 'R15 ABS', chao: 1, transito: 2 },
  { modelo: 'TÉNÉRÉ 700', chao: 1, transito: 0 },
  { modelo: 'XMAX 300', chao: 0, transito: 2 },
  { modelo: 'YAMAHA ZR', chao: 1, transito: 3 },
  { modelo: 'FACTOR 150 DX', chao: 2, transito: 0 },
]
for (const e of ESTOQUE_EX) {
  lines.push(`INSERT INTO "Estoque" ("id","grupo","loja","modelo","chao","transito") VALUES (${q(cuid())},${q('NIPPON MOTOS')},${q('Extrema')},${q(e.modelo)},${q(e.chao)},${q(e.transito)});`)
}

lines.push('', '-- 8. Leads Nippon')
const LEADS = [
  { ref: '2025/01', leads: 68, unicos: 64, tempo: 34.2, tca: 80.0, lcr: 6.2, dias: 18.3 },
  { ref: '2025/02', leads: 64, unicos: 60, tempo: 37.7, tca: 56.5, lcr: 15.0, dias: 15.7 },
  { ref: '2025/03', leads: 79, unicos: 71, tempo: 43.5, tca: 68.4, lcr: 8.5, dias: 8.4 },
  { ref: '2025/04', leads: 61, unicos: 45, tempo: 28.4, tca: 50.0, lcr: 13.3, dias: 11.6 },
  { ref: '2025/05', leads: 63, unicos: 57, tempo: 45.9, tca: 84.6, lcr: 0.0, dias: 27.3 },
  { ref: '2025/06', leads: 47, unicos: 44, tempo: 33.4, tca: 60.0, lcr: 9.1, dias: 29.0 },
  { ref: '2025/07', leads: 50, unicos: 49, tempo: 46.0, tca: 81.2, lcr: 8.2, dias: 25.6 },
  { ref: '2025/08', leads: 65, unicos: 59, tempo: 33.6, tca: 70.0, lcr: 6.8, dias: 6.8 },
  { ref: '2025/09', leads: 65, unicos: 57, tempo: 36.1, tca: 68.8, lcr: 7.0, dias: 6.0 },
  { ref: '2025/10', leads: 72, unicos: 66, tempo: 29.5, tca: 60.0, lcr: 4.5, dias: 31.5 },
  { ref: '2025/11', leads: 77, unicos: 72, tempo: 43.3, tca: 100.0, lcr: 5.6, dias: 26.6 },
  { ref: '2025/12', leads: 87, unicos: 80, tempo: 37.0, tca: 30.0, lcr: 12.5, dias: 25.4 },
  { ref: '2026/01', leads: 88, unicos: 82, tempo: 45.8, tca: 100.0, lcr: 12.2, dias: 23.5 },
  { ref: '2026/02', leads: 101, unicos: 93, tempo: 28.0, tca: 70.0, lcr: 5.4, dias: 20.5 },
  { ref: '2026/03', leads: 104, unicos: 98, tempo: 45.4, tca: 73.3, lcr: 8.2, dias: 18.1 },
  { ref: '2026/04', leads: 87, unicos: 81, tempo: 40.3, tca: 64.7, lcr: 4.9, dias: 7.5 },
  { ref: '2026/05', leads: 67, unicos: 64, tempo: 30.6, tca: 60.0, lcr: 6.2, dias: 9.2 },
  { ref: '2026/06', leads: 22, unicos: 21, tempo: 45.0, tca: 100.0, lcr: 0.0, dias: 0.0 },
]
for (const l of LEADS) {
  lines.push(`INSERT INTO "LeadMensal" ("id","referencia","leads","leadsUnicos","tempoAtendMin","tcaPct","lcrGrupoPct","diasConversao") VALUES (${q(cuid())},${q(l.ref)},${q(l.leads)},${q(l.unicos)},${q(l.tempo)},${q(l.tca)},${q(l.lcr)},${q(l.dias)}) ON CONFLICT ("referencia") DO NOTHING;`)
}

lines.push('', '-- 9. NPS Vendas')
const NPS_VENDAS = [
  { ref: '2025/07', score: 97.4, trim: 97.4 }, { ref: '2025/08', score: 97.4, trim: 97.4 },
  { ref: '2025/09', score: 97.2, trim: 97.3 }, { ref: '2025/10', score: 97.0, trim: 97.2 },
  { ref: '2025/11', score: 97.5, trim: 97.2 }, { ref: '2025/12', score: 96.0, trim: 96.8 },
  { ref: '2026/01', score: 94.4, trim: 95.9 }, { ref: '2026/02', score: 91.2, trim: 93.9 },
  { ref: '2026/03', score: 93.9, trim: 93.2 }, { ref: '2026/04', score: 94.4, trim: 93.2 },
  { ref: '2026/05', score: 95.8, trim: 94.7 }, { ref: '2026/06', score: 94.5, trim: 94.9 },
]
const NPS_POS = [
  { ref: '2025/07', score: 89.4, trim: 89.4 }, { ref: '2025/08', score: 90.2, trim: 89.6 },
  { ref: '2025/09', score: 87.7, trim: 89.1 }, { ref: '2025/10', score: 87.6, trim: 88.5 },
  { ref: '2025/11', score: 86.9, trim: 87.4 }, { ref: '2025/12', score: 89.0, trim: 87.8 },
  { ref: '2026/01', score: 89.0, trim: 88.3 }, { ref: '2026/02', score: 90.2, trim: 89.4 },
  { ref: '2026/03', score: 89.8, trim: 89.7 }, { ref: '2026/04', score: 89.0, trim: 89.7 },
  { ref: '2026/05', score: 88.3, trim: 89.0 }, { ref: '2026/06', score: 87.7, trim: 88.3 },
]
for (const n of [...NPS_VENDAS.map(x => ({...x, tipo: 'vendas'})), ...NPS_POS.map(x => ({...x, tipo: 'pos-vendas'}))]) {
  const prom = Math.round(n.score * 0.97)
  const det = Math.round((100 - n.score) * 0.3)
  const neut = 100 - prom - det
  lines.push(`INSERT INTO "NPSMensal" ("id","referencia","tipo","scoreMensal","scoreTrimestral","promotores","neutros","detratores") VALUES (${q(cuid())},${q(n.ref)},${q(n.tipo)},${q(n.score)},${q(n.trim)},${q(Math.max(prom,0))},${q(Math.max(neut,0))},${q(Math.max(det,0))});`)
}

lines.push('', "SELECT 'Seed concluído com sucesso!' as status;")

const out = path.join(process.cwd(), 'supabase-seed.sql')
fs.writeFileSync(out, lines.join('\n'))
console.log('Generated:', out, '(' + lines.length + ' lines)')
