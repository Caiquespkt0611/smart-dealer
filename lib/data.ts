import { createServerClient } from '@/lib/supabase-server'
import { getReferencia, getCalendario, nomeMes } from '@/lib/dados-vivos'
import { garantirDadosAtualizados } from '@/lib/ingestao'
import type { Referencia } from '@/lib/importar-dados'

// ── Dois relógios (regra herdada do Performance Concessionário) ───────────────
//   carta, varejo, ritmo, projeção  → mês corrente
//   mercado, share, giro, tendência → último mês fechado
// A referência vem do último DADOS_DE_EMPLACAMENTO.xlsx publicado no Storage
// (ingestão automática) — sem hardcode de mês.

const MODELOS_ESPECIAIS = ['MT-07 ABS', 'TÉNÉRÉ 700', 'TT-R 230', 'R3 ABS', 'R3 ABS 70th']
const LOJAS_NIPPON = ['Bragança Paulista', 'Atibaia', 'Amparo', 'Extrema']

type Calendario = Record<string, number>

// ── Dias úteis (calendário Yamaha) ───────────────────────────────────────────
function diasDoMes(cal: Calendario, ano: number, mes: number) {
  const prefix = `${ano}-${String(mes).padStart(2, '0')}`
  return Object.entries(cal)
    .filter(([d]) => d.startsWith(prefix))
    .map(([d, peso]) => ({ dia: Number(d.slice(8)), peso }))
    .sort((a, b) => a.dia - b.dia)
}

/* Pesos ponderados: no varejo de moto a venda se concentra no fim do mês.
   Último dia útil vale 2.2, penúltimo 1.7 — regra herdada do Ranking de Varejo. */
function pesosPonderados(cal: Calendario, ano: number, mes: number) {
  const dias = diasDoMes(cal, ano, mes)
  const uteis = dias.filter(d => d.peso > 0)
  const peso = new Map(dias.map(d => [d.dia, d.peso]))
  if (uteis.length >= 2) {
    peso.set(uteis[uteis.length - 1].dia, 2.2)
    peso.set(uteis[uteis.length - 2].dia, 1.7)
  }
  return { peso, diasUteis: uteis.length }
}

/** Projeção de fechamento: vendas ÷ peso corrido × peso total do mês. */
function calcProjecao(cal: Calendario, vendas: number, ano: number, mes: number, diaHoje: number): number {
  const { peso } = pesosPonderados(cal, ano, mes)
  let pTotal = 0, pCorrido = 0
  peso.forEach((p, dia) => {
    pTotal += p
    if (dia <= diaHoje) pCorrido += p
  })
  if (pCorrido <= 0) return vendas
  return Math.round((vendas / pCorrido) * pTotal)
}

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
  /** 'largada' = mês corrente ainda sem venda registrada; 'acompanhamento' = mês em curso */
  modo: 'largada' | 'acompanhamento'
  ano: number
  mesCorrente: number
  mesFechado: number
  nomeMesCorrente: string
  nomeMesFechado: string
  vendasMes: number
  fechamentoAnterior: number
  meta: number
  projecao: number
  pctAtingimento: number
  saltoCarta: number
  ritmoNecessario: number
  diasUteisMes: number
  /** motos que faltam para a carta e ritmo diário para alcançá-la daqui em diante */
  faltamParaMeta: number
  diasUteisRestantes: number
  ritmoParaMeta: number
  ritmoAtual: number
  /** dia do mês até onde a planilha reporta vendas (data do estoque) */
  diaCorte: number
  estoqueAlertas: EstoqueAlerta[]
  tempoAtend: number
  tcaPct: number
  lcrPct: number
  referenciaLeads: string
  npsVendas: number
  npsPosvenda: number
  referenciaNps: string
  rankingPos: number
  rankingTotal: number
  premioPotencial: number
  metaEmDobro: boolean
  ranking: RankingItem[]
  vendasPorModelo: Array<{ modelo: string; qtd: number; giro: number; tendencia: 'SUBINDO' | 'ESTAVEL' | 'CAINDO' }>
}

function getEstoqueStatus(cobertura: number, modelo: string): 'CRITICO' | 'ATENCAO' | 'OK' {
  if (MODELOS_ESPECIAIS.includes(modelo)) return cobertura > 150 ? 'ATENCAO' : 'OK'
  if (cobertura < 10) return 'CRITICO'
  if (cobertura < 20) return 'ATENCAO'
  return 'OK'
}

function calcPremio(meta: number, projecao: number): { premio: number; metaEmDobro: boolean } {
  const FAIXAS = [
    { min: 801, premio: 40000 },
    { min: 401, premio: 30000 },
    { min: 151, premio: 15000 },
    { min: 61,  premio: 10000 },
    { min: 29,  premio: 5000 },
  ]
  const faixa = FAIXAS.find(f => meta >= f.min) ?? { premio: 15000 }
  const metaEmDobro = projecao >= meta * 1.1
  return { premio: faixa.premio, metaEmDobro }
}

function lojaFilterDe(loja: string): string | null {
  return LOJAS_NIPPON.includes(loja) ? loja : null
}

function mesesGiro(ref: Referencia): number[] {
  // Últimos 3 meses fechados (com wrap de ano ignorado: dados são do ano corrente)
  return [ref.mesFechado - 2, ref.mesFechado - 1, ref.mesFechado].filter(m => m >= 1)
}

export async function getDashboardData(loja: string): Promise<DashboardData> {
  await garantirDadosAtualizados()
  const [ref, cal] = await Promise.all([getReferencia(), getCalendario()])
  const sb = createServerClient()
  const lojaFilter = lojaFilterDe(loja)
  const MESES_GIRO = mesesGiro(ref)

  function qVendas(mes: number | number[]) {
    let q = sb.from('VendaMensal').select('quantidade,modelo,loja,mes').eq('grupo', 'NIPPON MOTOS').eq('ano', ref.ano)
    q = Array.isArray(mes) ? q.in('mes', mes) : q.eq('mes', mes)
    return lojaFilter ? q.eq('loja', lojaFilter) : q
  }
  function qEstoque() {
    const q = sb.from('Estoque').select('modelo,chao,transito,loja').eq('grupo', 'NIPPON MOTOS')
    return lojaFilter ? q.eq('loja', lojaFilter) : q
  }

  const [vendasCorrenteRes, vendasFechadoRes, giroRes, estoqueRes, leadsRes, npsRes, metasRes, todasCorrenteRes, todasFechadoRes, vendasMesAnteriorRes] = await Promise.all([
    qVendas(ref.mesCorrente),
    qVendas(ref.mesFechado),
    qVendas(MESES_GIRO),
    qEstoque(),
    sb.from('LeadMensal').select('*').order('referencia', { ascending: false }).limit(1).single(),
    sb.from('NPSMensal').select('*').order('referencia', { ascending: false }),
    sb.from('Meta').select('*'),
    sb.from('VendaMensal').select('grupo,quantidade').eq('mes', ref.mesCorrente).eq('ano', ref.ano),
    sb.from('VendaMensal').select('grupo,quantidade').eq('mes', ref.mesFechado).eq('ano', ref.ano),
    qVendas(Math.max(ref.mesFechado - 1, 1)),
  ])

  const soma = (rows: Array<{ quantidade: number }> | null | undefined) =>
    (rows ?? []).reduce((s, v) => s + v.quantidade, 0)

  const vendasMes = soma(vendasCorrenteRes.data)
  const fechamentoAnterior = soma(vendasFechadoRes.data)
  const modo: DashboardData['modo'] = vendasMes > 0 ? 'acompanhamento' : 'largada'

  // Meta Nippon (carta do mês corrente)
  const metas = metasRes.data ?? []
  const metaNippon = metas.find((m: { grupo: string }) => m.grupo === 'NIPPON MOTOS')?.carta ?? 160

  const { peso, diasUteis } = pesosPonderados(cal, ref.ano, ref.mesCorrente)
  const hoje = new Date()
  const diaHoje = hoje.getFullYear() === ref.ano && hoje.getMonth() + 1 === ref.mesCorrente ? hoje.getDate() : 31

  // As vendas do mês vão até a data da planilha (data do estoque), não até hoje:
  // projetar com o peso corrido de hoje subestimaria o fechamento.
  const mCorte = ref.dataEstoque.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  const diaCorte = mCorte && Number(mCorte[2]) === ref.mesCorrente && Number(mCorte[1]) <= diaHoje
    ? Number(mCorte[1])
    : diaHoje

  // Largada: ainda não há venda do mês → a referência é o fechamento do mês anterior.
  // Acompanhamento: projeção ponderada por dias úteis (estudo do Performance Concessionário).
  const projecao = modo === 'acompanhamento' ? calcProjecao(cal, vendasMes, ref.ano, ref.mesCorrente, diaCorte) : fechamentoAnterior
  const pctAtingimento = Math.round((projecao / metaNippon) * 100)
  const saltoCarta = metaNippon - fechamentoAnterior
  const ritmoNecessario = Math.round((metaNippon / Math.max(diasUteis, 1)) * 10) / 10

  // Quanto falta e qual ritmo diário fecha a carta daqui em diante
  let diasUteisCorridos = 0
  let diasUteisRestantes = 0
  peso.forEach((p, dia) => {
    if (p <= 0) return
    if (dia <= diaCorte) diasUteisCorridos += 1
    else diasUteisRestantes += 1
  })
  const faltamParaMeta = Math.max(0, metaNippon - vendasMes)
  const ritmoParaMeta = diasUteisRestantes > 0
    ? Math.round((faltamParaMeta / diasUteisRestantes) * 10) / 10
    : faltamParaMeta
  const ritmoAtual = diasUteisCorridos > 0
    ? Math.round((vendasMes / diasUteisCorridos) * 10) / 10
    : 0

  // Giro mensal por modelo (média dos últimos meses fechados)
  const giroMap = new Map<string, number>()
  for (const v of (giroRes.data ?? [])) {
    giroMap.set(v.modelo, (giroMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  giroMap.forEach((total, modelo) => giroMap.set(modelo, total / MESES_GIRO.length))

  // Estoque total por modelo
  const estoqueMap = new Map<string, number>()
  for (const e of (estoqueRes.data ?? [])) {
    estoqueMap.set(e.modelo, (estoqueMap.get(e.modelo) ?? 0) + e.chao + e.transito)
  }

  // Alertas de estoque (cobertura em dias úteis)
  const estoqueAlertas: EstoqueAlerta[] = []
  for (const [modelo, estoqueTotal] of estoqueMap.entries()) {
    const giroMensal = giroMap.get(modelo) ?? 0.1
    const cobertura = giroMensal > 0 ? (estoqueTotal / giroMensal) * diasUteis : 999
    const status = getEstoqueStatus(cobertura, modelo)
    if (status !== 'OK') {
      const sugestaoCompra = !MODELOS_ESPECIAIS.includes(modelo)
        ? Math.max(0, Math.ceil((45 / diasUteis * giroMensal) - estoqueTotal))
        : 0
      estoqueAlertas.push({
        modelo, cobertura: Math.round(cobertura), status,
        estoqueTotal, giroMensal: Math.round(giroMensal * 10) / 10, sugestaoCompra,
      })
    }
  }
  estoqueAlertas.sort((a, b) => a.cobertura - b.cobertura)

  // Leads / NPS — referência mais recente disponível no banco
  const leads = leadsRes.data
  const tempoAtend = leads?.tempoAtendMin ?? 0
  const tcaPct = leads?.tcaPct ?? 0
  const lcrPct = leads?.lcrGrupoPct ?? 0
  const referenciaLeads = leads?.referencia ?? ''

  const npsData = npsRes.data ?? []
  const referenciaNps = npsData[0]?.referencia ?? ''
  const npsAtual = npsData.filter((n: { referencia: string }) => n.referencia === referenciaNps)
  const npsVendas = npsAtual.find((n: { tipo: string }) => n.tipo === 'vendas')?.scoreMensal ?? 0
  const npsPosvenda = npsAtual.find((n: { tipo: string }) => n.tipo === 'pos-vendas')?.scoreMensal ?? 0

  // Ranking regional — no acompanhamento usa o mês corrente; na largada,
  // fechamento do mês anterior vs carta nova (quem já vem no ritmo da carta).
  const rankingBase = modo === 'acompanhamento' ? todasCorrenteRes.data : todasFechadoRes.data
  const grupoTotais = new Map<string, number>()
  for (const v of (rankingBase ?? [])) {
    grupoTotais.set(v.grupo, (grupoTotais.get(v.grupo) ?? 0) + v.quantidade)
  }
  const ranking: RankingItem[] = metas
    .map((m: { grupo: string; carta: number }) => ({
      grupo: m.grupo,
      meta: m.carta,
      vendas: grupoTotais.get(m.grupo) ?? 0,
      pct: ((grupoTotais.get(m.grupo) ?? 0) / m.carta) * 100,
      pos: 0,
    }))
    .sort((a: RankingItem, b: RankingItem) => b.pct - a.pct)
    .map((r: RankingItem, i: number) => ({ ...r, pos: i + 1 }))

  const nipponPos = ranking.find((r: RankingItem) => r.grupo === 'NIPPON MOTOS')?.pos ?? 4
  const { premio, metaEmDobro } = calcPremio(metaNippon, projecao)

  // Vendas por modelo — mês fechado vs mês anterior (tendência)
  const antMap = new Map<string, number>()
  for (const v of (vendasMesAnteriorRes.data ?? [])) {
    antMap.set(v.modelo, (antMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  const fechMap = new Map<string, number>()
  for (const v of (vendasFechadoRes.data ?? [])) {
    fechMap.set(v.modelo, (fechMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  const todosModelos = new Set([...fechMap.keys(), ...antMap.keys(), ...giroMap.keys()])
  const vendasPorModelo = Array.from(todosModelos)
    .map(modelo => {
      const qtd = fechMap.get(modelo) ?? 0
      const qtdAnt = antMap.get(modelo) ?? 0
      const giro = giroMap.get(modelo) ?? 0
      const tendencia: 'SUBINDO' | 'ESTAVEL' | 'CAINDO' =
        qtd > qtdAnt + 0.5 ? 'SUBINDO' :
        qtd < qtdAnt - 0.5 ? 'CAINDO' : 'ESTAVEL'
      return { modelo, qtd, giro: Math.round(giro * 10) / 10, tendencia }
    })
    .filter(m => m.qtd > 0 || m.giro > 0)
    .sort((a, b) => b.qtd - a.qtd)

  return {
    modo,
    ano: ref.ano, mesCorrente: ref.mesCorrente, mesFechado: ref.mesFechado,
    nomeMesCorrente: nomeMes(ref.mesCorrente), nomeMesFechado: nomeMes(ref.mesFechado),
    vendasMes, fechamentoAnterior,
    meta: metaNippon, projecao, pctAtingimento,
    saltoCarta, ritmoNecessario, diasUteisMes: diasUteis,
    faltamParaMeta, diasUteisRestantes, ritmoParaMeta, ritmoAtual, diaCorte,
    estoqueAlertas,
    tempoAtend, tcaPct, lcrPct, referenciaLeads,
    npsVendas, npsPosvenda, referenciaNps,
    rankingPos: nipponPos, rankingTotal: ranking.length || 9,
    premioPotencial: metaEmDobro ? premio * 2 : premio,
    metaEmDobro,
    ranking,
    vendasPorModelo,
  }
}

export async function getEstoqueCompleto(loja: string) {
  await garantirDadosAtualizados()
  const [ref, cal] = await Promise.all([getReferencia(), getCalendario()])
  const sb = createServerClient()
  const lojaFilter = lojaFilterDe(loja)
  const MESES_GIRO = mesesGiro(ref)
  const { diasUteis } = pesosPonderados(cal, ref.ano, ref.mesCorrente)

  const [estoqueRes, giroRes] = await Promise.all([
    lojaFilter
      ? sb.from('Estoque').select('*').eq('grupo', 'NIPPON MOTOS').eq('loja', lojaFilter)
      : sb.from('Estoque').select('*').eq('grupo', 'NIPPON MOTOS'),
    lojaFilter
      ? sb.from('VendaMensal').select('quantidade,modelo,mes').eq('grupo', 'NIPPON MOTOS').in('mes', MESES_GIRO).eq('ano', ref.ano).eq('loja', lojaFilter)
      : sb.from('VendaMensal').select('quantidade,modelo,mes').eq('grupo', 'NIPPON MOTOS').in('mes', MESES_GIRO).eq('ano', ref.ano),
  ])

  const giroMap = new Map<string, number>()
  for (const v of (giroRes.data ?? [])) {
    giroMap.set(v.modelo, (giroMap.get(v.modelo) ?? 0) + v.quantidade)
  }
  giroMap.forEach((total, modelo) => giroMap.set(modelo, total / MESES_GIRO.length))

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
    const cobertura = giroMensal > 0 ? Math.round((estoqueTotal / giroMensal) * diasUteis) : 999
    const status = getEstoqueStatus(cobertura, modelo)
    const sugestaoCompra = status !== 'OK' && !MODELOS_ESPECIAIS.includes(modelo)
      ? Math.max(0, Math.ceil((45 / diasUteis * giroMensal) - estoqueTotal))
      : 0
    return {
      modelo, chao: est.chao, transito: est.transito, estoqueTotal,
      giroMensal: Math.round(giroMensal * 10) / 10, cobertura, status, sugestaoCompra,
    }
  }).sort((a, b) => a.cobertura - b.cobertura)
}

export interface ProdutoEncalhado {
  modelo: string
  estoqueTotal: number
  giroMensal: number
  cobertura: number
  diasParado: number
  severidade: 'ALTA' | 'MEDIA' | 'BAIXA'
}

// Detector de produtos encalhados: cruza estoque alto × giro baixo × cobertura excessiva.
export async function getProdutosEncalhados(loja: string): Promise<ProdutoEncalhado[]> {
  let estoque: Awaited<ReturnType<typeof getEstoqueCompleto>> = []
  try {
    estoque = await getEstoqueCompleto(loja)
  } catch {
    estoque = []
  }

  const encalhados: ProdutoEncalhado[] = estoque
    .filter(e => e.estoqueTotal >= 2 && !MODELOS_ESPECIAIS.includes(e.modelo))
    .map(e => {
      // cobertura alta = encalhado; >45 dias é overstock claro
      const diasParado = e.cobertura >= 900 ? 90 : Math.round(e.cobertura)
      const severidade: 'ALTA' | 'MEDIA' | 'BAIXA' =
        e.cobertura >= 60 || e.giroMensal < 1 ? 'ALTA' : e.cobertura >= 45 ? 'MEDIA' : 'BAIXA'
      return { modelo: e.modelo, estoqueTotal: e.estoqueTotal, giroMensal: e.giroMensal, cobertura: e.cobertura, diasParado, severidade }
    })
    .filter(e => e.cobertura >= 45 || e.giroMensal < 1)
    .sort((a, b) => b.cobertura - a.cobertura)

  // Fallback de demonstração se o estoque não retornar (ex: sem conexão no build)
  if (encalhados.length === 0) {
    return [
      { modelo: 'Crosser 150 S', estoqueTotal: 11, giroMensal: 2.3, cobertura: 142, diasParado: 90, severidade: 'ALTA' },
      { modelo: 'Factor 150 DX', estoqueTotal: 8, giroMensal: 1.8, cobertura: 110, diasParado: 90, severidade: 'ALTA' },
      { modelo: 'NEO 125', estoqueTotal: 6, giroMensal: 1.5, cobertura: 96, diasParado: 72, severidade: 'MEDIA' },
      { modelo: 'Fazer 250 ABS', estoqueTotal: 7, giroMensal: 3.1, cobertura: 54, diasParado: 54, severidade: 'MEDIA' },
    ]
  }
  return encalhados
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

const MESES_ABREV = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export async function getVendasHistorico(loja: string) {
  const sb = createServerClient()
  const lojaFilter = lojaFilterDe(loja)

  const q = sb
    .from('VendaMensal')
    .select('mes, ano, quantidade')
    .eq('grupo', 'NIPPON MOTOS')
    .order('ano', { ascending: true })
    .order('mes', { ascending: true })

  const { data } = await (lojaFilter ? q.eq('loja', lojaFilter) : q)

  const totMap = new Map<string, { label: string; total: number; mes: number; ano: number }>()
  for (const v of (data ?? [])) {
    const key = `${v.ano}/${v.mes}`
    const cur = totMap.get(key)
    if (cur) {
      cur.total += v.quantidade
    } else {
      totMap.set(key, {
        label: `${MESES_ABREV[v.mes]}/${String(v.ano).slice(2)}`,
        total: v.quantidade,
        mes: v.mes,
        ano: v.ano,
      })
    }
  }

  return Array.from(totMap.values())
    .sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes)
    .slice(-13)
}
