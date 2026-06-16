import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL não definida')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter } as never)

// ─── Helpers ───────────────────────────────────────────────────────────────

type ModelDist = { modelo: string; pct: number }

/**
 * Distributes a monthly total across models based on percentages.
 * The largest model absorbs rounding remainder.
 */
function distribute(
  total: number,
  models: ModelDist[]
): Array<{ modelo: string; qty: number }> {
  if (total === 0) return models.map(m => ({ modelo: m.modelo, qty: 0 }))
  const result: Array<{ modelo: string; qty: number }> = []
  let remaining = total
  // Sort by pct desc — largest gets remainder last
  const sorted = [...models].sort((a, b) => b.pct - a.pct)
  for (let i = 0; i < sorted.length - 1; i++) {
    const qty = Math.round((total * sorted[i].pct) / 100)
    result.push({ modelo: sorted[i].modelo, qty })
    remaining -= qty
  }
  result.push({ modelo: sorted[sorted.length - 1].modelo, qty: remaining })
  return result
}

// ─── Model distributions for Nippon Bragança ───────────────────────────────
// Percentages designed so last-3-month giro matches chatbot coverage alerts
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

// ─── Model distributions for Nippon Extrema ───────────────────────────────
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

// ─── Monthly totals: Nippon Bragança Paulista ───────────────────────────────
const NIPPON_BP: Array<{ mes: number; ano: number; total: number }> = [
  { mes: 1, ano: 2025, total: 99 },
  { mes: 2, ano: 2025, total: 100 },
  { mes: 3, ano: 2025, total: 106 },
  { mes: 4, ano: 2025, total: 101 },
  { mes: 5, ano: 2025, total: 115 },
  { mes: 6, ano: 2025, total: 96 },
  { mes: 7, ano: 2025, total: 131 },
  { mes: 8, ano: 2025, total: 131 },
  { mes: 9, ano: 2025, total: 120 },
  { mes: 10, ano: 2025, total: 122 },
  { mes: 11, ano: 2025, total: 68 },
  { mes: 12, ano: 2025, total: 128 },
  { mes: 1, ano: 2026, total: 98 },
  { mes: 2, ano: 2026, total: 84 },
  { mes: 3, ano: 2026, total: 150 },
  { mes: 4, ano: 2026, total: 130 },
  { mes: 5, ano: 2026, total: 130 },
  { mes: 6, ano: 2026, total: 33 }, // parcial até dia 14
]

// ─── Monthly totals: Nippon Extrema ────────────────────────────────────────
const NIPPON_EX: Array<{ mes: number; ano: number; total: number }> = [
  { mes: 12, ano: 2025, total: 9 },
  { mes: 1, ano: 2026, total: 27 },
  { mes: 2, ano: 2026, total: 31 },
  { mes: 3, ano: 2026, total: 24 },
  { mes: 4, ano: 2026, total: 27 },
  { mes: 5, ano: 2026, total: 22 },
  { mes: 6, ano: 2026, total: 9 }, // parcial até dia 14
]

// ─── Regional groups monthly totals (for ranking only) ─────────────────────
// Designed so June 2026 ranking: CELMAR(80%), I9(75%), AVALON(70%), NIPPON(65%), MOTO PRAIA(60%), ACJ(55%), NOBRE(50%), MOTO PINDA(45%)
// Historical months use meta-relative performance with variation

type GroupData = {
  grupo: string
  meta: number
  // monthly performance as fraction of meta (approximate)
  // jan25..jun26 = 18 months
  fracs: number[]
}

const MONTHS_ORDER = [
  { mes: 1, ano: 2025 }, { mes: 2, ano: 2025 }, { mes: 3, ano: 2025 },
  { mes: 4, ano: 2025 }, { mes: 5, ano: 2025 }, { mes: 6, ano: 2025 },
  { mes: 7, ano: 2025 }, { mes: 8, ano: 2025 }, { mes: 9, ano: 2025 },
  { mes: 10, ano: 2025 }, { mes: 11, ano: 2025 }, { mes: 12, ano: 2025 },
  { mes: 1, ano: 2026 }, { mes: 2, ano: 2026 }, { mes: 3, ano: 2026 },
  { mes: 4, ano: 2026 }, { mes: 5, ano: 2026 }, { mes: 6, ano: 2026 },
]

// fracs = monthly multiplier on meta (approx performance relative to meta)
// index 0=jan25, 17=jun26
const REGIONAL_GROUPS: GroupData[] = [
  {
    grupo: 'ACJ',
    meta: 67,
    // Jun26 target: 55% = ~37 units
    fracs: [0.65, 0.60, 0.70, 0.62, 0.68, 0.55, 0.72, 0.70, 0.65, 0.63, 0.40, 0.60, 0.58, 0.52, 0.65, 0.62, 0.60, 0.55],
  },
  {
    grupo: 'AVALON',
    meta: 73,
    // Jun26 target: 70% = ~51 units
    fracs: [0.75, 0.70, 0.80, 0.72, 0.78, 0.65, 0.82, 0.80, 0.75, 0.73, 0.45, 0.70, 0.68, 0.62, 0.78, 0.74, 0.72, 0.70],
  },
  {
    grupo: 'CELMAR',
    meta: 311,
    // Jun26 target: 80% = ~249 units
    fracs: [0.85, 0.80, 0.90, 0.82, 0.88, 0.75, 0.92, 0.90, 0.85, 0.83, 0.55, 0.80, 0.78, 0.72, 0.90, 0.84, 0.82, 0.80],
  },
  {
    grupo: 'I9 MOTOS',
    meta: 210,
    // Jun26 target: 75% = ~158 units
    fracs: [0.80, 0.75, 0.85, 0.77, 0.83, 0.70, 0.87, 0.85, 0.80, 0.78, 0.50, 0.75, 0.73, 0.67, 0.83, 0.79, 0.77, 0.75],
  },
  {
    grupo: 'MOTO PINDA',
    meta: 50,
    // Jun26 target: 45% = ~23 units
    fracs: [0.55, 0.50, 0.60, 0.52, 0.58, 0.45, 0.62, 0.60, 0.55, 0.53, 0.33, 0.50, 0.48, 0.42, 0.55, 0.51, 0.49, 0.45],
  },
  {
    grupo: 'MOTO PRAIA',
    meta: 110,
    // Jun26 target: 60% = ~66 units
    fracs: [0.65, 0.60, 0.70, 0.62, 0.68, 0.55, 0.72, 0.70, 0.65, 0.63, 0.40, 0.60, 0.58, 0.52, 0.65, 0.62, 0.62, 0.60],
  },
  {
    grupo: 'NOBRE MOTOS',
    meta: 188,
    // Jun26 target: 50% = ~94 units
    fracs: [0.58, 0.53, 0.63, 0.55, 0.61, 0.48, 0.65, 0.63, 0.58, 0.56, 0.35, 0.53, 0.51, 0.45, 0.58, 0.54, 0.52, 0.50],
  },
]

// ─── Main seed function ─────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed do Smart Dealer...')

  // ── 1. Clear all tables ───────────────────────────────────────────────────
  console.log('  Limpando tabelas...')
  await prisma.nPSMensal.deleteMany()
  await prisma.leadMensal.deleteMany()
  await prisma.estoque.deleteMany()
  await prisma.meta.deleteMany()
  await prisma.vendaMensal.deleteMany()

  // ── 2. Metas ──────────────────────────────────────────────────────────────
  console.log('  Inserindo metas...')
  const metas = [
    { grupo: 'ACJ', carta: 67 },
    { grupo: 'AVALON', carta: 73 },
    { grupo: 'CELMAR', carta: 311 },
    { grupo: 'I9 MOTOS', carta: 210 },
    { grupo: 'MOTO PINDA', carta: 50 },
    { grupo: 'MOTO PRAIA', carta: 110 },
    { grupo: 'NIPPON MOTOS', carta: 160 },
    { grupo: 'NOBRE MOTOS', carta: 188 },
  ]
  await prisma.meta.createMany({ data: metas })

  // ── 3. Estoque — Bragança Paulista ────────────────────────────────────────
  console.log('  Inserindo estoque...')
  const estoqueBP = [
    { modelo: 'AEROX',             chao: 0, transito: 3 },
    { modelo: 'CROSSER 150 S ABS', chao: 1, transito: 0 },
    { modelo: 'CROSSER 150 Z ABS', chao: 10, transito: 1 },
    { modelo: 'FACTOR 150 DX',     chao: 0, transito: 8 },
    { modelo: 'FACTOR 150 ED',     chao: 0, transito: 10 },
    { modelo: 'FAZER 250 ABS',     chao: 9, transito: 13 },
    { modelo: 'FLUO ABS',          chao: 5, transito: 1 },
    { modelo: 'FAZER FZ15 ABS',    chao: 4, transito: 10 },
    { modelo: 'LANDER 250 ABS',    chao: 6, transito: 2 },
    { modelo: 'MT-03 ABS',         chao: 0, transito: 3 },
    { modelo: 'MT-07 ABS',         chao: 0, transito: 1 },
    { modelo: 'NMAX',              chao: 3, transito: 1 },
    { modelo: 'R15 ABS',           chao: 3, transito: 4 },
    { modelo: 'R3 ABS',            chao: 1, transito: 0 },
    { modelo: 'TÉNÉRÉ 700',        chao: 1, transito: 0 },
    { modelo: 'TT-R 230',          chao: 0, transito: 1 },
    { modelo: 'XMAX 300',          chao: 6, transito: 4 },
    { modelo: 'YAMAHA ZR',         chao: 1, transito: 5 },
  ]
  await prisma.estoque.createMany({
    data: estoqueBP.map(e => ({
      grupo: 'NIPPON MOTOS',
      loja: 'BRAGANÇA PAULISTA',
      ...e,
    })),
  })

  // ── 4. Estoque — Extrema ─────────────────────────────────────────────────
  const estoqueEX = [
    { modelo: 'AEROX',             chao: 1, transito: 0 },
    { modelo: 'CROSSER 150 S ABS', chao: 0, transito: 1 },
    { modelo: 'CROSSER 150 Z ABS', chao: 0, transito: 2 },
    { modelo: 'FACTOR 150 ED',     chao: 1, transito: 1 },
    { modelo: 'FAZER 250 ABS',     chao: 1, transito: 2 },
    { modelo: 'FLUO ABS',          chao: 1, transito: 1 },
    { modelo: 'FAZER FZ15 ABS',    chao: 0, transito: 1 },
    { modelo: 'LANDER 250 ABS',    chao: 3, transito: 3 },
    { modelo: 'NMAX',              chao: 2, transito: 0 },
    { modelo: 'R15 ABS',           chao: 1, transito: 2 },
    { modelo: 'TÉNÉRÉ 700',        chao: 1, transito: 0 },
    { modelo: 'XMAX 300',          chao: 0, transito: 2 },
    { modelo: 'YAMAHA ZR',         chao: 1, transito: 3 },
    { modelo: 'FACTOR 150 DX',     chao: 2, transito: 0 },
  ]
  await prisma.estoque.createMany({
    data: estoqueEX.map(e => ({
      grupo: 'NIPPON MOTOS',
      loja: 'EXTREMA',
      ...e,
    })),
  })

  // ── 5. VendaMensal — Nippon Bragança ─────────────────────────────────────
  console.log('  Inserindo vendas Nippon Bragança...')
  const vendasBP: Array<{
    grupo: string; loja: string; modelo: string; mes: number; ano: number; quantidade: number
  }> = []

  for (const { mes, ano, total } of NIPPON_BP) {
    const dist = distribute(total, DIST_BP)
    for (const { modelo, qty } of dist) {
      if (qty > 0) {
        vendasBP.push({
          grupo: 'NIPPON MOTOS',
          loja: 'BRAGANÇA PAULISTA',
          modelo,
          mes,
          ano,
          quantidade: qty,
        })
      }
    }
  }
  await prisma.vendaMensal.createMany({ data: vendasBP })

  // ── 6. VendaMensal — Nippon Extrema ──────────────────────────────────────
  console.log('  Inserindo vendas Nippon Extrema...')
  const vendasEX: Array<{
    grupo: string; loja: string; modelo: string; mes: number; ano: number; quantidade: number
  }> = []

  for (const { mes, ano, total } of NIPPON_EX) {
    const dist = distribute(total, DIST_EX)
    for (const { modelo, qty } of dist) {
      if (qty > 0) {
        vendasEX.push({
          grupo: 'NIPPON MOTOS',
          loja: 'EXTREMA',
          modelo,
          mes,
          ano,
          quantidade: qty,
        })
      }
    }
  }
  await prisma.vendaMensal.createMany({ data: vendasEX })

  // ── 7. VendaMensal — Regional groups ─────────────────────────────────────
  console.log('  Inserindo vendas regionais...')
  const vendasRegional: Array<{
    grupo: string; loja: string; modelo: string; mes: number; ano: number; quantidade: number
  }> = []

  for (const group of REGIONAL_GROUPS) {
    MONTHS_ORDER.forEach(({ mes, ano }, idx) => {
      const frac = group.fracs[idx] ?? 0.65
      const qty = Math.round(group.meta * frac)
      if (qty > 0) {
        vendasRegional.push({
          grupo: group.grupo,
          loja: group.grupo,
          modelo: 'TOTAL_GRUPO',
          mes,
          ano,
          quantidade: qty,
        })
      }
    })
  }
  await prisma.vendaMensal.createMany({ data: vendasRegional })

  // ── 8. LeadMensal ─────────────────────────────────────────────────────────
  console.log('  Inserindo leads...')
  const leads = [
    { referencia: '2025/01', leads: 68, leadsUnicos: 64, tempoAtendMin: 34.2, tcaPct: 80.0, lcrGrupoPct: 6.2, diasConversao: 18.3 },
    { referencia: '2025/02', leads: 64, leadsUnicos: 60, tempoAtendMin: 37.7, tcaPct: 56.5, lcrGrupoPct: 15.0, diasConversao: 15.7 },
    { referencia: '2025/03', leads: 79, leadsUnicos: 71, tempoAtendMin: 43.5, tcaPct: 68.4, lcrGrupoPct: 8.5, diasConversao: 8.4 },
    { referencia: '2025/04', leads: 61, leadsUnicos: 45, tempoAtendMin: 28.4, tcaPct: 50.0, lcrGrupoPct: 13.3, diasConversao: 11.6 },
    { referencia: '2025/05', leads: 63, leadsUnicos: 57, tempoAtendMin: 45.9, tcaPct: 84.6, lcrGrupoPct: 0.0, diasConversao: 27.3 },
    { referencia: '2025/06', leads: 47, leadsUnicos: 44, tempoAtendMin: 33.4, tcaPct: 60.0, lcrGrupoPct: 9.1, diasConversao: 29.0 },
    { referencia: '2025/07', leads: 50, leadsUnicos: 49, tempoAtendMin: 46.0, tcaPct: 81.2, lcrGrupoPct: 8.2, diasConversao: 25.6 },
    { referencia: '2025/08', leads: 65, leadsUnicos: 59, tempoAtendMin: 33.6, tcaPct: 70.0, lcrGrupoPct: 6.8, diasConversao: 6.8 },
    { referencia: '2025/09', leads: 65, leadsUnicos: 57, tempoAtendMin: 36.1, tcaPct: 68.8, lcrGrupoPct: 7.0, diasConversao: 6.0 },
    { referencia: '2025/10', leads: 72, leadsUnicos: 66, tempoAtendMin: 29.5, tcaPct: 60.0, lcrGrupoPct: 4.5, diasConversao: 31.5 },
    { referencia: '2025/11', leads: 77, leadsUnicos: 72, tempoAtendMin: 43.3, tcaPct: 100.0, lcrGrupoPct: 5.6, diasConversao: 26.6 },
    { referencia: '2025/12', leads: 87, leadsUnicos: 80, tempoAtendMin: 37.0, tcaPct: 30.0, lcrGrupoPct: 12.5, diasConversao: 25.4 },
    { referencia: '2026/01', leads: 88, leadsUnicos: 82, tempoAtendMin: 45.8, tcaPct: 100.0, lcrGrupoPct: 12.2, diasConversao: 23.5 },
    { referencia: '2026/02', leads: 101, leadsUnicos: 93, tempoAtendMin: 28.0, tcaPct: 70.0, lcrGrupoPct: 5.4, diasConversao: 20.5 },
    { referencia: '2026/03', leads: 104, leadsUnicos: 98, tempoAtendMin: 45.4, tcaPct: 73.3, lcrGrupoPct: 8.2, diasConversao: 18.1 },
    { referencia: '2026/04', leads: 87, leadsUnicos: 81, tempoAtendMin: 40.3, tcaPct: 64.7, lcrGrupoPct: 4.9, diasConversao: 7.5 },
    { referencia: '2026/05', leads: 67, leadsUnicos: 64, tempoAtendMin: 30.6, tcaPct: 60.0, lcrGrupoPct: 6.2, diasConversao: 9.2 },
    { referencia: '2026/06', leads: 22, leadsUnicos: 21, tempoAtendMin: 45.0, tcaPct: 100.0, lcrGrupoPct: 0.0, diasConversao: 0.0 },
  ]
  await prisma.leadMensal.createMany({ data: leads })

  // ── 9. NPSMensal ──────────────────────────────────────────────────────────
  console.log('  Inserindo NPS...')
  const npsVendas = [
    { ref: '2025/07', score: 97.4, trim: 97.4 },
    { ref: '2025/08', score: 97.4, trim: 97.4 },
    { ref: '2025/09', score: 97.2, trim: 97.3 },
    { ref: '2025/10', score: 97.0, trim: 97.2 },
    { ref: '2025/11', score: 97.5, trim: 97.2 },
    { ref: '2025/12', score: 96.0, trim: 96.8 },
    { ref: '2026/01', score: 94.4, trim: 95.9 },
    { ref: '2026/02', score: 91.2, trim: 93.9 },
    { ref: '2026/03', score: 93.9, trim: 93.2 },
    { ref: '2026/04', score: 94.4, trim: 93.2 },
    { ref: '2026/05', score: 95.8, trim: 94.7 },
    { ref: '2026/06', score: 94.5, trim: 94.9 },
  ]

  const npsPosVendas = [
    { ref: '2025/07', score: 89.4, trim: 89.4 },
    { ref: '2025/08', score: 90.2, trim: 89.6 },
    { ref: '2025/09', score: 87.7, trim: 89.1 },
    { ref: '2025/10', score: 87.6, trim: 88.5 },
    { ref: '2025/11', score: 86.9, trim: 87.4 },
    { ref: '2025/12', score: 89.0, trim: 87.8 },
    { ref: '2026/01', score: 89.0, trim: 88.3 },
    { ref: '2026/02', score: 90.2, trim: 89.4 },
    { ref: '2026/03', score: 89.8, trim: 89.7 },
    { ref: '2026/04', score: 89.0, trim: 89.7 },
    { ref: '2026/05', score: 88.3, trim: 89.0 },
    { ref: '2026/06', score: 87.7, trim: 88.3 },
  ]

  const npsData: Array<{
    referencia: string; tipo: string; scoreMensal: number; scoreTrimestral: number;
    promotores: number; neutros: number; detratores: number
  }> = []

  for (const n of npsVendas) {
    // Approximate promotores/neutros/detratores from NPS score
    // NPS = promotores% - detratores% → high NPS means high promotores
    const promotores = Math.round(n.score * 0.97)
    const detratores = Math.round((100 - n.score) * 0.3)
    const neutros = 100 - promotores - detratores
    npsData.push({
      referencia: n.ref,
      tipo: 'vendas',
      scoreMensal: n.score,
      scoreTrimestral: n.trim,
      promotores: Math.max(promotores, 0),
      neutros: Math.max(neutros, 0),
      detratores: Math.max(detratores, 0),
    })
  }

  for (const n of npsPosVendas) {
    const promotores = Math.round(n.score * 0.97)
    const detratores = Math.round((100 - n.score) * 0.3)
    const neutros = 100 - promotores - detratores
    npsData.push({
      referencia: n.ref,
      tipo: 'pos-vendas',
      scoreMensal: n.score,
      scoreTrimestral: n.trim,
      promotores: Math.max(promotores, 0),
      neutros: Math.max(neutros, 0),
      detratores: Math.max(detratores, 0),
    })
  }

  await prisma.nPSMensal.createMany({ data: npsData })

  // ── Done ──────────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.vendaMensal.count(),
    prisma.meta.count(),
    prisma.estoque.count(),
    prisma.leadMensal.count(),
    prisma.nPSMensal.count(),
  ])

  console.log('\n✅ Seed concluído:')
  console.log(`   VendaMensal: ${counts[0]} registros`)
  console.log(`   Meta:        ${counts[1]} registros`)
  console.log(`   Estoque:     ${counts[2]} registros`)
  console.log(`   LeadMensal:  ${counts[3]} registros`)
  console.log(`   NPSMensal:   ${counts[4]} registros`)
}

main()
  .catch(e => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
