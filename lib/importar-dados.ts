// Parser do DADOS_DE_EMPLACAMENTO.xlsx (mesmo arquivo do Performance Concessionário).
// Transforma o upload mensal em: varejo, estoque, metas, calendário, referência do mês
// e agregados de market share — sem nenhum passo manual.
import * as XLSX from 'xlsx'
import { cnpjNomes } from '@/lib/cnpj-nomes'

// Áreas de mercado da Nippon (Bragança/Itaquaquecetuba não existem como área — caem em Amparo/Mogi)
const AREAS_NIPPON = ['Amparo', 'Ouro Fino']
const NIPPON_RAIZ = '33054346'
const MESES_NOME = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

type Row = (string | number | Date | null)[]

export interface VarejoRow { grupo: string; loja: string; modelo: string; mes: number; ano: number; quantidade: number }
export interface EstoqueRow { grupo: string; loja: string; modelo: string; chao: number; transito: number }
export interface Referencia {
  ano: number
  mesCorrente: number
  mesFechado: number
  dataEstoque: string
  atualizadoEm: string
}

export interface DadosImportados {
  varejo: VarejoRow[]
  estoque: EstoqueRow[]
  metas: Record<string, number>
  calendario: Record<string, number>
  referencia: Referencia
  share: object
  resumo: {
    varejoPorGrupoMesFechado: Record<string, number>
    linhasVarejo: number
    linhasEstoque: number
    estoqueNippon: { chao: number; transito: number }
    mercadoTotal: number
    shareYamaha: number
    diasUteisMesCorrente: number
  }
}

function sheetRows(wb: XLSX.WorkBook, nome: string): Row[] {
  const key = wb.SheetNames.find(n => n.trim().toUpperCase() === nome.toUpperCase())
    ?? wb.SheetNames.find(n => n.toUpperCase().includes(nome.toUpperCase()))
  if (!key) throw new Error(`Aba "${nome}" não encontrada no arquivo`)
  return XLSX.utils.sheet_to_json<Row>(wb.Sheets[key], { header: 1, defval: null, raw: true })
}

function num(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/\./g, '').replace(',', '.'))
    return isNaN(n) ? 0 : n
  }
  return 0
}

// 'NIPPON MOTOS - BRAGANCA PAULISTA' → 'Bragança Paulista'
function normLoja(abremp: unknown): string {
  let s = String(abremp ?? '').trim()
  if (s.includes(' - ')) {
    s = s.split(' - ').slice(1).join(' - ')
  } else {
    const parts = s.split(/\s+/)
    if (parts.length > 2) s = parts.slice(2).join(' ') // 'NIPPON MOTOS AMPARO' → 'AMPARO'
  }
  s = s.trim().toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())
  const fixes: Record<string, string> = { 'Braganca Paulista': 'Bragança Paulista', 'Braganca': 'Bragança Paulista' }
  return fixes[s] ?? s
}

function acharHeader(rows: Row[], col0: string): number {
  const i = rows.findIndex(r => r && String(r[0] ?? '').trim().toUpperCase() === col0)
  if (i < 0) throw new Error(`Cabeçalho "${col0}" não encontrado`)
  return i
}

export function parseWorkbook(buffer: Buffer | ArrayBuffer): DadosImportados {
  const wb = XLSX.read(buffer, { type: buffer instanceof ArrayBuffer ? 'array' : 'buffer', cellDates: true })

  // ── VAREJO+META ────────────────────────────────────────────────────────────
  const vr = sheetRows(wb, 'VAREJO+META')
  const vHdr = acharHeader(vr, 'GRUPO')
  const header = vr[vHdr]
  // colunas de mês: '1-2026', '2-2026', …
  const colsMes: Array<{ idx: number; mes: number; ano: number }> = []
  header.forEach((c, idx) => {
    const m = String(c ?? '').match(/^(\d{1,2})-(\d{4})$/)
    if (m) colsMes.push({ idx, mes: Number(m[1]), ano: Number(m[2]) })
  })
  if (!colsMes.length) throw new Error('Colunas de mês não encontradas na aba VAREJO+META')
  const ano = colsMes[colsMes.length - 1].ano

  const varejo: VarejoRow[] = []
  for (const r of vr.slice(vHdr + 1)) {
    if (!r?.[0] || String(r[0]).trim().toUpperCase() === 'GRUPO') continue
    for (const c of colsMes) {
      const q = num(r[c.idx])
      if (q > 0) {
        varejo.push({
          grupo: String(r[0]).trim(), loja: normLoja(r[1]), modelo: String(r[2] ?? '').trim(),
          mes: c.mes, ano: c.ano, quantidade: Math.round(q),
        })
      }
    }
  }

  // ── ESTOQUE (regra do Performance Concessionário: chão = coluna CHÃO; total = REDE) ──
  const er = sheetRows(wb, 'ESTOQUE')
  const eHdr = acharHeader(er, 'GRUPO')
  const eHead = er[eHdr].map(c => String(c ?? '').toUpperCase())
  const iChao = eHead.findIndex(c => c.includes('CHÃO') || c.includes('CHAO'))
  const iRede = eHead.findIndex(c => c.includes('REDE'))
  if (iChao < 0 || iRede < 0) throw new Error('Colunas CHÃO/REDE não encontradas na aba ESTOQUE')

  const estoque: EstoqueRow[] = []
  for (const r of er.slice(eHdr + 1)) {
    if (!r?.[0] || String(r[0]).trim().toUpperCase() === 'GRUPO') continue
    const chao = Math.round(num(r[iChao]))
    const rede = Math.round(num(r[iRede]))
    estoque.push({
      grupo: String(r[0]).trim(), loja: normLoja(r[1]), modelo: String(r[2] ?? '').trim(),
      chao, transito: Math.max(rede - chao, 0),
    })
  }

  // ── META MÊS ATUAL ─────────────────────────────────────────────────────────
  const mr = sheetRows(wb, 'META MÊS ATUAL')
  const metas: Record<string, number> = {}
  for (const r of mr.slice(1)) {
    if (r?.[2] && num(r[3]) > 0) metas[String(r[2]).trim()] = Math.round(num(r[3]))
  }
  if (!Object.keys(metas).length) throw new Error('Nenhuma carta encontrada na aba META MÊS ATUAL')

  // ── DIAS DE ESTOQUE → data de referência (define o mês corrente) ───────────
  const dr = sheetRows(wb, 'DIAS DE ESTOQUE')
  let dataEstoque = ''
  for (const r of dr) {
    if (r?.[0] && String(r[0]).toLowerCase().includes('data')) {
      const v = r[1]
      if (v instanceof Date) {
        dataEstoque = `${String(v.getDate()).padStart(2, '0')}/${String(v.getMonth() + 1).padStart(2, '0')}/${v.getFullYear()}`
      } else {
        dataEstoque = String(v ?? '').trim()
      }
      break
    }
  }
  const mData = dataEstoque.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (!mData) throw new Error(`Data do estoque não reconhecida na aba DIAS DE ESTOQUE: "${dataEstoque}"`)
  const mesCorrente = Number(mData[2])
  const anoCorrente = Number(mData[3].length === 2 ? '20' + mData[3] : mData[3])
  const mesFechado = mesCorrente === 1 ? 12 : mesCorrente - 1

  // ── CALENDÁRIO - WORKING DAYS ──────────────────────────────────────────────
  const cr = sheetRows(wb, 'CALENDÁRIO')
  const calendario: Record<string, number> = {}
  for (const r of cr) {
    if (!r?.[0] || r[1] == null) continue
    let key = ''
    if (r[0] instanceof Date) {
      const d = r[0]
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } else {
      const m = String(r[0]).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
      if (m) key = `${m[3].length === 2 ? '20' + m[3] : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
    }
    if (key) calendario[key] = num(r[1])
  }
  if (!Object.keys(calendario).length) throw new Error('Calendário de dias úteis vazio')

  // ── EMPLACAMENTO → agregados de share (áreas da Nippon, meses fechados) ────
  const sr = sheetRows(wb, 'EMPLACAMENTO')
  const sHdr = acharHeader(sr, 'CNPJ')
  const sHead = sr[sHdr]
  const colsMesShare: Array<{ idx: number; mes: number }> = []
  sHead.forEach((c, idx) => {
    if (idx >= 5 && /^\d{1,2}$/.test(String(c ?? '').trim())) colsMesShare.push({ idx, mes: Number(String(c).trim()) })
  })
  const mesesFechados = colsMesShare.filter(c => c.mes <= mesFechado)

  interface Acc { qtd: number; marcas: Record<string, number>; cidades: Record<string, number> }
  const porMarca: Record<string, number> = {}
  const trendAcc: Record<number, { total: number; yamaha: number; honda: number; outros: number }> = {}
  const porSeg: Record<string, Record<string, number>> = {}
  const porCidade: Record<string, Record<string, number>> = {}
  const cidadeArea: Record<string, string> = {}
  const comp: Record<string, Acc> = {}
  let nipponQtd = 0
  let totalMercado = 0
  for (const c of mesesFechados) trendAcc[c.mes] = { total: 0, yamaha: 0, honda: 0, outros: 0 }

  const titleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())

  for (const r of sr.slice(sHdr + 1)) {
    if (!r?.[0]) continue
    const area = String(r[2] ?? '').trim()
    if (!AREAS_NIPPON.includes(area)) continue
    const cnpj = String(r[0]).trim()
    const marca = String(r[1] ?? '').trim()
    const cidade = titleCase(String(r[3] ?? '').trim())
    const segmento = String(r[4] ?? '').trim()
    let qtdTotal = 0
    for (const c of mesesFechados) {
      const q = Math.round(num(r[c.idx]))
      if (!q) continue
      qtdTotal += q
      trendAcc[c.mes].total += q
      if (marca === 'Yamaha') trendAcc[c.mes].yamaha += q
      else if (marca === 'Honda') trendAcc[c.mes].honda += q
      else trendAcc[c.mes].outros += q
    }
    if (!qtdTotal) continue
    totalMercado += qtdTotal
    porMarca[marca] = (porMarca[marca] ?? 0) + qtdTotal
    ;(porSeg[segmento] ??= {})[marca] = (porSeg[segmento]?.[marca] ?? 0) + qtdTotal
    ;(porCidade[cidade] ??= {})[marca] = (porCidade[cidade]?.[marca] ?? 0) + qtdTotal
    cidadeArea[cidade] = area
    if (cnpj.slice(0, 8) === NIPPON_RAIZ) {
      nipponQtd += qtdTotal
    } else {
      const acc = (comp[cnpj] ??= { qtd: 0, marcas: {}, cidades: {} })
      acc.qtd += qtdTotal
      acc.marcas[marca] = (acc.marcas[marca] ?? 0) + qtdTotal
      acc.cidades[cidade] = (acc.cidades[cidade] ?? 0) + qtdTotal
    }
  }

  const pct = (a: number, b: number) => (b ? Math.round((1000 * a) / b) / 10 : 0)
  const yam = porMarca['Yamaha'] ?? 0
  const hon = porMarca['Honda'] ?? 0

  const brandShare = Object.entries(porMarca)
    .sort((a, b) => b[1] - a[1])
    .map(([marca, qtd]) => ({ marca, qtd, pct: pct(qtd, totalMercado) }))

  const trend = mesesFechados.map(c => {
    const t = trendAcc[c.mes]
    return { mes: MESES_NOME[c.mes], yamaha: t.yamaha, honda: t.honda, outros: t.outros, total: t.total, shareYamaha: pct(t.yamaha, t.total) }
  })

  const segments = Object.entries(porSeg)
    .map(([segmento, marcas]) => {
      const total = Object.values(marcas).reduce((s, v) => s + v, 0)
      const y = marcas['Yamaha'] ?? 0, h = marcas['Honda'] ?? 0
      return { segmento, total, yamaha: y, honda: h, shareYamaha: pct(y, total), shareHonda: pct(h, total), gap: h - y }
    })
    .sort((a, b) => b.total - a.total)

  const cities = Object.entries(porCidade)
    .map(([cidade, marcas]) => {
      const total = Object.values(marcas).reduce((s, v) => s + v, 0)
      const y = marcas['Yamaha'] ?? 0
      return { cidade, area: cidadeArea[cidade], total, yamaha: y, shareYamaha: pct(y, total) }
    })
    .sort((a, b) => b.total - a.total)

  const maxKey = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  const competitors = Object.entries(comp)
    .sort((a, b) => b[1].qtd - a[1].qtd)
    .map(([cnpj, acc]) => {
      const nome = cnpjNomes[cnpj] ?? cnpjNomes[cnpj.slice(0, 8)]
      return { cnpj, marca: maxKey(acc.marcas), qtd: acc.qtd, cidade: maxKey(acc.cidades), ...(nome ? { nome } : {}) }
    })

  const share = {
    referencia: `Jan–${MESES_NOME[mesFechado]} ${ano}`,
    ultimoMesFechado: mesFechado,
    totalMercado2026: totalMercado,
    yamahaShare: pct(yam, totalMercado), yamahaQtd: yam,
    hondaShare: pct(hon, totalMercado), hondaQtd: hon,
    nipponQtd,
    nipponShareDoMercado: pct(nipponQtd, totalMercado),
    nipponShareDaYamaha: pct(nipponQtd, yam),
    areas: AREAS_NIPPON,
    brandShare, trend, segments, cities, competitors,
    numCompetitorCnpj: Object.keys(comp).length,
  }

  // ── Referência + resumo ────────────────────────────────────────────────────
  const referencia: Referencia = {
    ano: anoCorrente, mesCorrente, mesFechado,
    dataEstoque, atualizadoEm: new Date().toISOString(),
  }

  const varejoPorGrupoMesFechado: Record<string, number> = {}
  for (const v of varejo) {
    if (v.mes === mesFechado && v.ano === ano) {
      varejoPorGrupoMesFechado[v.grupo] = (varejoPorGrupoMesFechado[v.grupo] ?? 0) + v.quantidade
    }
  }
  const estNippon = estoque.filter(e => e.grupo === 'NIPPON MOTOS')
  const prefixo = `${anoCorrente}-${String(mesCorrente).padStart(2, '0')}`
  const diasUteis = Object.entries(calendario).filter(([d, p]) => d.startsWith(prefixo) && p > 0).length

  return {
    varejo, estoque, metas, calendario, referencia, share,
    resumo: {
      varejoPorGrupoMesFechado,
      linhasVarejo: varejo.length,
      linhasEstoque: estoque.length,
      estoqueNippon: {
        chao: estNippon.reduce((s, e) => s + e.chao, 0),
        transito: estNippon.reduce((s, e) => s + e.transito, 0),
      },
      mercadoTotal: totalMercado,
      shareYamaha: pct(yam, totalMercado),
      diasUteisMesCorrente: diasUteis,
    },
  }
}
