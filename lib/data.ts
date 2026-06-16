import { createServerClient } from '@/lib/supabase-server'

const PESO_DIA14 = 10.0
const PESO_TOTAL_JUN = 24.9
const PESO_RESTANTE = 14.9
const MODELOS_ESPECIAIS = ['MT-07 ABS', 'TÉNÉRÉ 700', 'TT-R 230', 'R3 ABS', 'R3 ABS 70th']

export interface EstoqueAlerta {
  modelo: string
  cobertura: number
  status: 'CRITICO' | 'ATENCAO' | 'OK'
  estoqueTotal: number
  giroMensal: number
  sugestaoCompra: number
}

export interface RankingItem {
  grupo: string
  meta: number
  vendas: number
  pct: number
  pos: number
}

export interface DashboardData {
  vendasMes: number
  meta: number
  projecao: number
  pctAtingimento: number
  estoqueAlertas: EstoqueAlerta[]
  tempoAtend: number
  tcaPct: number
  lcrPct: number
  npsVendas: number
  npsPosvenda: number
  rankingPos: number
  rankingTotal: number
  premioPotencial: number
  junhoEmDobro: boolean
  ranking: RankingItem[]
  vendasPorModelo: Array<{ modelo: string; qtd: number; giro: number; tendencia: 'SUBINDO' | 'ESTAVEL' | 'CAINDO' }>
}

function calcProjecao(vendas14: number): number {
  return Math.round(vendas14 + (vendas14 / PESO_DIA14) * PESO_RESTANTE)
}

function getEstoqueStatus(cobertura: number, modelo: string): 'CRITICO' | 'ATENCAO' | 'OK' {
  if (MODELOS_ESPECIAIS.includes(modelo)) return cobertura > 150 ? 'ATENCAO' : 'OK'
  if (cobertura < 10) return 'CRITICO'
  if (cobertura < 20) return 'ATENCAO'
  return 'OK'
}

function calcPremio(meta: number, projecao: number): { premio: number; junhoEmDobro: boolean } {
  const FAIXAS = [
    { min: 801, premio: 40000 },
    { min: 401, premio: 30000 },
    { min: 151, premio: 15000 },
    { min: 61,  premio: 10000 },
    { min: 29,  premio: 5000 },
  ]
  const faixa = FAIXAS.find(f => meta >= f.min) ?? { premio: 15000 }
  const junhoEmDobro = projecao >= meta * 1.1
  return { premio: faixa.premio, junhoEmDobro }
}

export async function getDashboardData(loja: string): Promise<DashboardData> {
  const sb = createServerClient()
  const lojaFilter = loja === 'Bragança Paulista' ? 'Bragança Paulista'
                   : loja === 'Extrema' ? 'Extrema'
                   : null

  function qVendasJun() {
    const q = sb.from('VendaMensal').select('quantidade,modelo,loja').eq('grupo', 'NIPPON MOTOS').eq('mes', 6).eq('ano', 2026)
    return lojaFilter ? q.eq('loja', lojaFilter) : q
  }
  function qGiro() {
    const q = sb.from('VendaMensal').select('quantidade,modelo,mes').eq('grupo', 'NIPPON MOTOS').in('mes', [3, 4, 5]).eq('ano', 2026)
    return lojaFilter ? q.eq('loja', lojaFilter) : q
  }
  function qEstoque() {
    const q = sb.from('Estoque').select('modelo,chao,transito,loja').eq('grupo', 'NIPPON MOTOS')
    return lojaFilter ? q.eq('loja', lojaFilter) : q
  }
  function qVendasMai() {
    const q = sb.from('VendaMensal').select('quantidade,modelo').eq('grupo', 'NIPPON MOTOS').eq('mes', 5).eq('ano', 2026)
    return lojaFilter ? q.eq('loja', lojaFilter) : q
  }

  const [vendasJunRes, giroRes, estoqueRes, leadsRes, npsRes, metasRes, todasVendasRes, vendasMesAnteriorRes] = await Promise.all([
    qVendasJun(),
    qGiro(),
    qEstoque(),
    sb.from('LeadMensal').select('*').eq('referencia', '2026/06').single(),
    sb.from('NPSMensal').select('*').eq('referencia', '2026/06'),
    sb.from('Meta').select('*'),
    sb.from('VendaMensal').select('grupo,quantidade').eq('mes', 6).eq('ano', 2026),
    qVendasMai(),
  ])

  // Vendas mês
  const vendasJun = vendasJunRes.data ?? []
  const vendasMes = vendasJun.reduce((s: number, v: { quantidade: number }) => s + v.quantidade, 0)

  // Meta Nippon
  const metas = metasRes.data ?? []
  const metaNippon = metas.find((m: { grupo: string }) => m.grupo === 'NIPPON MOTOS')?.carta ?? 160

  // Projeção
  const projecao = calcProjecao(vendasMes)
  const pctAtingimento = Math.round((projecao / metaNippon) * 100)

  // Giro mensal por modelo (média 3 meses)
  const giroMap = new Map<string, number>()
  for (const v of (giroRes.data ?? [])) {
    giroMap.set(v.modelo, (giroMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  giroMap.forEach((total, modelo) => giroMap.set(modelo, total / 3))

  // Estoque total por modelo
  const estoqueMap = new Map<string, number>()
  for (const e of (estoqueRes.data ?? [])) {
    estoqueMap.set(e.modelo, (estoqueMap.get(e.modelo) ?? 0) + e.chao + e.transito)
  }

  // Alertas de estoque
  const estoqueAlertas: EstoqueAlerta[] = []
  for (const [modelo, estoqueTotal] of estoqueMap.entries()) {
    const giroMensal = giroMap.get(modelo) ?? 0.1
    const cobertura = giroMensal > 0 ? (estoqueTotal / giroMensal) * PESO_TOTAL_JUN : 999
    const status = getEstoqueStatus(cobertura, modelo)
    if (status !== 'OK') {
      const sugestaoCompra = !MODELOS_ESPECIAIS.includes(modelo)
        ? Math.max(0, Math.ceil((45 / PESO_TOTAL_JUN * giroMensal) - estoqueTotal))
        : 0
      estoqueAlertas.push({
        modelo, cobertura: Math.round(cobertura), status,
        estoqueTotal, giroMensal: Math.round(giroMensal * 10) / 10, sugestaoCompra,
      })
    }
  }
  estoqueAlertas.sort((a, b) => a.cobertura - b.cobertura)

  // Leads
  const leads = leadsRes.data
  const tempoAtend = leads?.tempoAtendMin ?? 0
  const tcaPct = leads?.tcaPct ?? 0
  const lcrPct = leads?.lcrGrupoPct ?? 0

  // NPS — coluna é "scoremensal" (lowercase)
  const npsData = npsRes.data ?? []
  const npsVendasRec = npsData.find((n: { tipo: string }) => n.tipo === 'vendas')
  const npsPosRec = npsData.find((n: { tipo: string }) => n.tipo === 'pos-vendas')
  const npsVendas = npsVendasRec?.scoremensal ?? 0
  const npsPosvenda = npsPosRec?.scoremensal ?? 0

  // Ranking regional
  const grupoTotais = new Map<string, number>()
  for (const v of (todasVendasRes.data ?? [])) {
    grupoTotais.set(v.grupo, (grupoTotais.get(v.grupo) ?? 0) + v.quantidade)
  }
  const ranking: RankingItem[] = metas
    .map((m: { grupo: string; carta: number }, i: number) => ({
      grupo: m.grupo,
      meta: m.carta,
      vendas: grupoTotais.get(m.grupo) ?? 0,
      pct: ((grupoTotais.get(m.grupo) ?? 0) / m.carta) * 100,
      pos: 0,
    }))
    .sort((a: RankingItem, b: RankingItem) => b.pct - a.pct)
    .map((r: RankingItem, i: number) => ({ ...r, pos: i + 1 }))

  const nipponPos = ranking.find((r: RankingItem) => r.grupo === 'NIPPON MOTOS')?.pos ?? 4
  const { premio, junhoEmDobro } = calcPremio(metaNippon, projecao)

  // Vendas por modelo — junho vs maio (tendência)
  const maiMap = new Map<string, number>()
  for (const v of (vendasMesAnteriorRes.data ?? [])) {
    maiMap.set(v.modelo, (maiMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  const junMap = new Map<string, number>()
  for (const v of vendasJun) {
    junMap.set(v.modelo, (junMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  // Comparação com janela justa: junho até dia 14 (peso 10.0) vs maio proporcional (peso total maio = 24.9)
  const PESO_PROPORCIONAL_MAI = PESO_DIA14 / PESO_TOTAL_JUN // ~0.4016
  const todosModelos = new Set([...junMap.keys(), ...maiMap.keys(), ...giroMap.keys()])
  const vendasPorModelo = Array.from(todosModelos)
    .map(modelo => {
      const qtdJun = junMap.get(modelo) ?? 0
      const qtdMaiTotal = maiMap.get(modelo) ?? 0
      const qtdMaiEquiv = qtdMaiTotal * PESO_PROPORCIONAL_MAI
      const giro = giroMap.get(modelo) ?? 0
      const tendencia: 'SUBINDO' | 'ESTAVEL' | 'CAINDO' =
        qtdJun > qtdMaiEquiv + 0.5 ? 'SUBINDO' :
        qtdJun < qtdMaiEquiv - 0.5 ? 'CAINDO' : 'ESTAVEL'
      return { modelo, qtd: qtdJun, giro: Math.round(giro * 10) / 10, tendencia }
    })
    .filter(m => m.qtd > 0 || m.giro > 0)
    .sort((a, b) => b.qtd - a.qtd)

  return {
    vendasMes, meta: metaNippon, projecao, pctAtingimento,
    estoqueAlertas,
    tempoAtend, tcaPct, lcrPct,
    npsVendas, npsPosvenda,
    rankingPos: nipponPos, rankingTotal: ranking.length || 9,
    premioPotencial: junhoEmDobro ? premio * 2 : premio,
    junhoEmDobro,
    ranking,
    vendasPorModelo,
  }
}

export async function getEstoqueCompleto(loja: string) {
  const sb = createServerClient()
  const lojaFilter = loja === 'Bragança Paulista' ? 'Bragança Paulista'
                   : loja === 'Extrema' ? 'Extrema' : null

  const [estoqueRes, giroRes] = await Promise.all([
    lojaFilter
      ? sb.from('Estoque').select('*').eq('grupo', 'NIPPON MOTOS').eq('loja', lojaFilter)
      : sb.from('Estoque').select('*').eq('grupo', 'NIPPON MOTOS'),
    lojaFilter
      ? sb.from('VendaMensal').select('quantidade,modelo,mes').eq('grupo', 'NIPPON MOTOS').in('mes', [3,4,5]).eq('ano', 2026).eq('loja', lojaFilter)
      : sb.from('VendaMensal').select('quantidade,modelo,mes').eq('grupo', 'NIPPON MOTOS').in('mes', [3,4,5]).eq('ano', 2026),
  ])

  const giroMap = new Map<string, number>()
  for (const v of (giroRes.data ?? [])) {
    giroMap.set(v.modelo, (giroMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  giroMap.forEach((total, modelo) => giroMap.set(modelo, total / 3))

  const estoqueMap = new Map<string, { chao: number; transito: number; lojas: string[] }>()
  for (const e of (estoqueRes.data ?? [])) {
    const cur = estoqueMap.get(e.modelo) ?? { chao: 0, transito: 0, lojas: [] }
    cur.chao += e.chao
    cur.transito += e.transito
    if (!cur.lojas.includes(e.loja)) cur.lojas.push(e.loja)
    estoqueMap.set(e.modelo, cur)
  }

  return Array.from(estoqueMap.entries()).map(([modelo, est]) => {
    const estoqueTotal = est.chao + est.transito
    const giroMensal = giroMap.get(modelo) ?? 0
    const cobertura = giroMensal > 0 ? Math.round((estoqueTotal / giroMensal) * PESO_TOTAL_JUN) : 999
    const status = getEstoqueStatus(cobertura, modelo)
    const sugestaoCompra = status !== 'OK' && !MODELOS_ESPECIAIS.includes(modelo)
      ? Math.max(0, Math.ceil((45 / PESO_TOTAL_JUN * giroMensal) - estoqueTotal))
      : 0
    return {
      modelo, chao: est.chao, transito: est.transito, estoqueTotal,
      giroMensal: Math.round(giroMensal * 10) / 10, cobertura, status, sugestaoCompra,
    }
  }).sort((a, b) => a.cobertura - b.cobertura)
}

export async function getLeadsHistorico() {
  const sb = createServerClient()
  const { data } = await sb.from('LeadMensal').select('*').order('referencia', { ascending: true })
  return data ?? []
}

export async function getNPSHistorico() {
  const sb = createServerClient()
  const { data } = await sb.from('NPSMensal').select('*').order('referencia', { ascending: true })
  return data ?? []
}
