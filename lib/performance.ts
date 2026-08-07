// Inteligência de Performance do Concessionário — portada do projeto
// _Performance Concessionário para dentro do Smart Dealer.
//
// Regras herdadas:
// - O resultado da ÁREA é do grupo: share usa toda a bandeira emplacada ali;
//   quem emplacou de fato aparece à parte (invasão é alerta, não placar).
// - Base de comparação = média dos 3 meses fechados anteriores (o ano inteiro
//   achata a tendência; um mês só é ruidoso).
// - Decomposição exata: ΔVendas = efeito mercado + efeito share.
// - Recuperar (segmento) e Espaço (cidade) ancoram no próprio grupo, nunca
//   em benchmark externo.
import { getDashboardData, type DashboardData } from '@/lib/data'
import { getShareData, type ShareData } from '@/lib/dados-vivos'
import { garantirDadosAtualizados } from '@/lib/ingestao'

const MESES_LONGO = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export interface SegmentoAnalise {
  segmento: string
  rotulo: string
  mktMes: number        // mercado do segmento no mês fechado (un)
  mktBase: number       // média 3M anterior
  mktVar: number        // % variação do mercado
  share: number         // share Yamaha no mês fechado (%)
  shareBase: number     // share Yamaha na base (%)
  shareDelta: number    // pp
  impacto: number       // un/mês atribuíveis à variação (mercado+share)
  oport: number         // un/mês se voltar ao share da base
  hondaDelta: number    // pp de variação da Honda (o "ladrão" mais provável)
  veredito: 'disputa' | 'demanda' | 'ok'
}

export interface CidadeAnalise {
  cidade: string
  area: string
  mktMes: number
  share: number
  gap: number           // un/mês se chegar ao share do território
}

export interface InvasorAnalise {
  cnpj: string
  nome: string | null
  cidade: string
  qtdMes: number        // un/mês (média dos meses fechados)
}

export interface PerformanceAnalise {
  dash: DashboardData
  share: ShareData
  baseNome: string          // ex.: 'média Abr–Jun'
  mesFechadoNome: string
  // decomposição da variação da bandeira no território
  mercadoAtual: number
  mercadoBase: number
  shareAtual: number        // % Yamaha no território, mês fechado
  shareBase: number
  varReal: number           // Δ un (Yamaha território): mês fechado vs base
  efeitoMercado: number
  efeitoShare: number
  dominante: 'mercado' | 'share'
  veredito: string
  segmentos: SegmentoAnalise[]
  /** segmentos sem produto Yamaha — fora da análise e do PDCA */
  foraAtuacao: { qtd: number; unMes: number }
  cidades: CidadeAnalise[]
  // invasão
  yamNoTerrMes: number      // Yamaha emplacada no território, un/mês
  nipponMes: number         // emplacada pela própria Nippon, un/mês
  invasaoMes: number        // terceiros, un/mês
  invasaoPct: number
  invasores: InvasorAnalise[]
}

export function segLabel(s: string) {
  return s
    .replace('SMALL - ', '').replace('MIDDLE - ', '').replace('BIG - ', '')
    .replace('STREET/N', 'Street').replace('STREET/F', 'Street F')
    .replace('ON/OFF', 'On/Off').replace('SCOOTER', 'Scooter')
    .replace('STREET', 'Street').replace('ELECTRIC', 'Elétrica')
    .replace('Touring/Adventure', 'Big Trail').replace('BIG Street', 'Big Street')
}

const r1 = (v: number) => Math.round(v * 10) / 10

export async function getPerformanceAnalise(): Promise<PerformanceAnalise> {
  await garantirDadosAtualizados()
  const [dash, share] = await Promise.all([
    getDashboardData('Grupo Nippon'),
    getShareData(),
  ])

  const mesFechado = share.ultimoMesFechado
  const trend = share.trend
  const atualIdx = trend.length - 1
  const baseIdxs = [atualIdx - 3, atualIdx - 2, atualIdx - 1].filter(i => i >= 0)
  const media = (vals: number[]) => vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0

  const mesesBase = baseIdxs.map(i => mesFechado - (atualIdx - i))
  const baseNome = mesesBase.length
    ? `média ${MESES_LONGO[mesesBase[0]].slice(0, 3)}–${MESES_LONGO[mesesBase[mesesBase.length - 1]].slice(0, 3)}`
    : 'sem base'

  // ── Decomposição território (bandeira Yamaha na área) ──────────────────────
  const mercadoAtual = trend[atualIdx]?.total ?? 0
  const mercadoBase = media(baseIdxs.map(i => trend[i].total))
  const yamAtual = trend[atualIdx]?.yamaha ?? 0
  const yamBase = media(baseIdxs.map(i => trend[i].yamaha))
  const shareAtual = mercadoAtual ? (yamAtual / mercadoAtual) * 100 : 0
  const shareBase = mercadoBase ? (yamBase / mercadoBase) * 100 : 0

  const varReal = yamAtual - yamBase
  // ΔV = ΔM×shBase + ΔSh×Matual  (fecha exato com a variação real)
  const efeitoMercado = (mercadoAtual - mercadoBase) * (shareBase / 100)
  const efeitoShare = ((shareAtual - shareBase) / 100) * mercadoAtual
  const dominante: 'mercado' | 'share' = Math.abs(efeitoMercado) >= Math.abs(efeitoShare) ? 'mercado' : 'share'

  let veredito: string
  if (varReal < -0.5 && dominante === 'mercado') {
    veredito = `O mercado da área ${mercadoAtual < mercadoBase ? 'encolheu' : 'variou'} e explica a maior parte da queda`
      + (efeitoShare > 0.5 ? ` — o share até subiu ${r1(shareAtual - shareBase)}pp; o problema não é a loja.` : '.')
  } else if (varReal < -0.5 && dominante === 'share') {
    veredito = `A perda é de disputa: o share caiu ${r1(Math.abs(shareAtual - shareBase))}pp e responde pela maior parte da variação.`
  } else if (varReal > 0.5) {
    veredito = dominante === 'share'
      ? `Crescimento puxado por ganho de share (+${r1(shareAtual - shareBase)}pp) — mérito da operação.`
      : 'Crescimento puxado pelo mercado da área.'
  } else {
    veredito = 'Bandeira estável no território vs a base dos 3 meses anteriores.'
  }

  // ── Segmentos (parser v2: séries mensais) ──────────────────────────────────
  // Só onde a Yamaha TEM produto (aba CADASTRO SEGMENTO YAMAHA ATUA): não há
  // como a Nippon disputar segmento sem moto no catálogo — ex.: big trail
  // acima de 800cc, customs, super sport. Esses ficam fora da análise e do PDCA.
  const atua = share.segmentosYamahaAtua?.length ? new Set(share.segmentosYamahaAtua) : null
  const nMesesTrend = share.trend.length || 1
  let foraQtd = 0, foraUn = 0
  const segmentos: SegmentoAnalise[] = []
  for (const st of share.segmentsTrend ?? []) {
    if (atua && !atua.has(st.segmento)) {
      foraQtd++
      foraUn += st.meses.reduce((s2, m) => s2 + m.total, 0) / nMesesTrend
      continue
    }
    const n = st.meses.length
    if (!n) continue
    const atual = st.meses[n - 1]
    const base = st.meses.slice(Math.max(0, n - 4), n - 1)
    if (!base.length) continue
    const mktBase = media(base.map(m => m.total))
    const shB = mktBase ? media(base.map(m => m.total ? (m.yamaha / m.total) * 100 : 0)) : 0
    const shA = atual.total ? (atual.yamaha / atual.total) * 100 : 0
    const hondaB = mktBase ? media(base.map(m => m.total ? (m.honda / m.total) * 100 : 0)) : 0
    const hondaA = atual.total ? (atual.honda / atual.total) * 100 : 0
    const impacto = (atual.total - mktBase) * (shB / 100) + ((shA - shB) / 100) * atual.total
    const mktVar = mktBase ? ((atual.total - mktBase) / mktBase) * 100 : 0
    const shareDelta = shA - shB
    const veredito: SegmentoAnalise['veredito'] =
      shareDelta < -1 ? 'disputa' : (mktVar < -10 && impacto < -0.5) ? 'demanda' : 'ok'
    if (atual.total < 5 && mktBase < 5) continue // segmento irrelevante na área
    segmentos.push({
      segmento: st.segmento, rotulo: segLabel(st.segmento),
      mktMes: atual.total, mktBase: r1(mktBase), mktVar: r1(mktVar),
      share: r1(shA), shareBase: r1(shB), shareDelta: r1(shareDelta),
      impacto: r1(impacto), oport: r1(Math.max(0, ((shB - shA) / 100) * atual.total)),
      hondaDelta: r1(hondaA - hondaB),
      veredito,
    })
  }
  segmentos.sort((a, b) => a.impacto - b.impacto)

  // ── Cidades com espaço (share da cidade vs share do território) ────────────
  const nMeses = trend.length || 1
  const cidades: CidadeAnalise[] = share.cities
    .map(c => {
      const mktMes = c.total / nMeses
      const gap = Math.max(0, ((shareAtual - c.shareYamaha) / 100) * mktMes)
      return { cidade: c.cidade, area: c.area, mktMes: r1(mktMes), share: c.shareYamaha, gap: r1(gap) }
    })
    .filter(c => c.gap >= 1 && c.share < shareAtual)
    .sort((a, b) => b.gap - a.gap)

  // ── Invasão (Yamaha de terceiros no território) ────────────────────────────
  const yamNoTerrMes = r1(share.yamahaQtd / nMeses)
  const nipponMes = r1((share.nipponTrend?.length
    ? media(share.nipponTrend.slice(-3).map(t => t.qtd))
    : share.nipponQtd / nMeses))
  const invasaoMes = r1(Math.max(0, yamNoTerrMes - nipponMes))
  const invasaoPct = yamNoTerrMes ? Math.round((invasaoMes / yamNoTerrMes) * 100) : 0
  const invasores: InvasorAnalise[] = share.competitors
    .filter(c => c.marca === 'Yamaha')
    .slice(0, 5)
    .map(c => ({ cnpj: c.cnpj, nome: c.nome ?? null, cidade: c.cidade, qtdMes: r1(c.qtd / nMeses) }))

  return {
    dash, share, baseNome,
    mesFechadoNome: MESES_LONGO[mesFechado],
    mercadoAtual, mercadoBase: r1(mercadoBase),
    shareAtual: r1(shareAtual), shareBase: r1(shareBase),
    varReal: r1(varReal), efeitoMercado: r1(efeitoMercado), efeitoShare: r1(efeitoShare),
    dominante, veredito,
    segmentos,
    foraAtuacao: { qtd: foraQtd, unMes: r1(foraUn) },
    cidades,
    yamNoTerrMes, nipponMes, invasaoMes, invasaoPct, invasores,
  }
}

// ═══════════════ PLANO DE AÇÃO (PDCA) ════════════════════════════════════════
// Cada linha nasce de um problema medido, nunca de texto genérico.
// Formato: 9 colunas do Plano de Ação Yamaha. O consultor edita antes de enviar.

export interface AcaoPDCA {
  acao: string
  porque: string
  como: string[]
  resp: string
  ini: string
  fim: string
  prio: 'Alta' | 'Média' | 'Baixa'
  indicador: string
}

const v = (n: number) => String(n).replace('.', ',')

const PRIORIDADE = (un: number): AcaoPDCA['prio'] =>
  Math.abs(un) >= 5 ? 'Alta' : Math.abs(un) >= 2 ? 'Média' : 'Baixa'

export function gerarAcoesPDCA(a: PerformanceAnalise): AcaoPDCA[] {
  const d = a.dash
  const L: AcaoPDCA[] = []
  const resp = 'Caique / Nippon Motos'
  const hoje = new Date()
  const dd = (n: number) => String(n).padStart(2, '0')
  const ini = `${dd(hoje.getDate())}/${dd(d.mesCorrente)}`
  const ultimoDia = new Date(d.ano, d.mesCorrente, 0).getDate()
  const fim = `${dd(ultimoDia)}/${dd(d.mesCorrente)}`
  const mes = d.nomeMesCorrente

  // 1. o mês — largada ou recuperação de ritmo
  if (d.modo === 'largada' && d.meta > 0) {
    const porDia = d.ritmoNecessario
    L.push({
      acao: `Entrar em ${mes} no ritmo que a carta exige desde o primeiro dia`,
      porque: `${d.nomeMesFechado} fechou com ${d.fechamentoAnterior} un e a carta de ${mes} é de ${d.meta} un`
        + (d.fechamentoAnterior > 0 ? ` — ${d.saltoCarta >= 0 ? '+' : ''}${d.saltoCarta} un (${Math.round(d.saltoCarta / d.fechamentoAnterior * 100)}%) sobre o que acabou de ser feito` : '')
        + `, ou ${v(porDia)} un/dia nos ${d.diasUteisMes} dias úteis. Ainda não há venda registrada no mês: `
        + `não há ritmo a corrigir, há ritmo a estabelecer. ${d.rankingPos}º de ${d.rankingTotal} na regional.`,
      como: [
        `Distribuir a carta de ${d.meta} un em meta semanal antes do primeiro dia útil`,
        `Abrir o mês com as propostas e negociações que ficaram de ${d.nomeMesFechado.toLowerCase()}`,
        `Conferir se o estoque cobre o ritmo pedido e antecipar o pedido do que faltar`,
        `Não deixar a recuperação para a última semana: mês que começa devagar fecha no aperto`,
      ],
      resp, ini, fim, prio: 'Alta',
      indicador: `Fechar ${mes} com ${d.meta} un (100% da carta), sustentando ${v(porDia)} un/dia. Medir diariamente.`,
    })
  } else if (d.modo === 'acompanhamento' && d.pctAtingimento < 100) {
    L.push({
      acao: `Recuperar o ritmo de vendas para fechar a carta de ${mes}`,
      porque: `Vendidas ${d.vendasMes} un de uma carta de ${d.meta}. No ritmo atual o mês fecha em `
        + `${d.projecao} un (${d.pctAtingimento}%), ${d.meta - d.projecao} un abaixo da carta. `
        + `${d.rankingPos}º de ${d.rankingTotal} na regional.`,
      como: [
        `Levantar propostas em aberto e negociações paradas`,
        `Força-tarefa de fechamento nos 3 últimos dias úteis, que concentram a venda`,
        `Revisar estoque dos modelos de maior giro`,
      ],
      resp, ini, fim, prio: 'Alta',
      indicador: `Fechar ${mes} com ${d.meta} un (100% da carta). Faltam ${Math.max(0, d.meta - d.vendasMes)} un. Acompanhar diariamente.`,
    })
  }

  // 2. segmentos que estão drenando volume — a CAUSA muda a ação
  a.segmentos
    .filter(s => s.veredito !== 'ok')
    .slice(0, 3)
    .forEach(s => {
      const ladrao = s.hondaDelta > 0.3 ? `Honda ganhou ${v(s.hondaDelta)}pp no mesmo período.` : ''
      if (s.veredito === 'demanda') {
        L.push({
          acao: `Defender o volume de ${s.rotulo} com o mercado em queda`,
          porque: `O segmento movimenta ${s.mktMes} un/mês na área e encolheu ${v(Math.abs(s.mktVar))}% contra a `
            + `${a.baseNome}, o que tira ${v(s.impacto)} un/mês. O share ${s.shareDelta >= 0 ? `subiu para ${v(s.share)}%` : `está em ${v(s.share)}%`} `
            + `— a perda é de demanda, não de disputa. ${ladrao}`,
          como: [
            `Não tratar como perda de venda: a ação é converter o que ainda entra, não retomar terreno`,
            `Ajustar o pedido do segmento à demanda atual para não trocar falta de venda por estoque parado`,
            `Compensar o volume nos segmentos da área que não encolheram`,
          ],
          resp, ini, fim, prio: PRIORIDADE(s.impacto),
          indicador: `Sustentar no mínimo ${v(s.share)}% de share no segmento. Cada ponto vale ${v(r1(s.mktMes / 100))} un/mês. Medir pelo emplacamento.`,
        })
      } else {
        L.push({
          acao: `Recuperar participação em ${s.rotulo}`,
          porque: `Share na área caiu de ${v(s.shareBase)}% para ${v(s.share)}% (${v(s.shareDelta)}pp), o que representa `
            + `${v(s.impacto)} un/mês. O segmento movimenta ${s.mktMes} un/mês. ${ladrao}`,
          como: [
            ladrao
              ? `Montar comparativo de preço, parcela e prazo de entrega contra a Honda, que subiu ${v(s.hondaDelta)}pp`
              : `Revisar oferta e argumento de venda do segmento`,
            `Garantir estoque e exposição dos modelos do segmento no showroom`,
            `Treinar a equipe no comparativo técnico e rodar mídia local com condição específica`,
          ].filter(Boolean),
          resp, ini, fim, prio: PRIORIDADE(s.impacto),
          indicador: s.oport >= 1
            ? `Voltar ao share de ${v(s.shareBase)}% no segmento = +${Math.round(s.oport)} un/mês. Medir pelo emplacamento.`
            : `Estancar a queda e sustentar ${v(s.share)}% de share. Medir pelo emplacamento.`,
        })
      }
    })

  // 3. praças onde há espaço a ocupar
  a.cidades.slice(0, 2).forEach(c => {
    L.push({
      acao: `Ocupar a praça de ${c.cidade}`,
      porque: `${c.cidade} movimenta ${v(c.mktMes)} un/mês e a Yamaha tem só ${v(c.share)}% de share ali, contra `
        + `${v(a.shareAtual)}% no território. A diferença vale ${Math.round(c.gap)} un/mês que hoje ficam com a concorrência.`,
      como: [
        c.share < 1
          ? `A Yamaha praticamente não emplaca aqui — mapear quem domina a praça e por quê`
          : `Mapear os concorrentes que dominam a praça`,
        `Visita de vendedor externo e prospecção ativa na cidade`,
        `Mídia geolocalizada com oferta de entrada`,
      ],
      resp, ini, fim, prio: PRIORIDADE(c.gap),
      indicador: `Chegar a ${v(a.shareAtual)}% de share em ${c.cidade} = +${Math.round(c.gap)} un/mês. Acompanhar o emplacamento mensal.`,
    })
  })

  // 4. invasão — só quando é grande o bastante para virar pauta
  if (a.invasaoPct >= 25 && a.invasaoMes >= 3) {
    const quem = a.invasores.slice(0, 2).map(i => i.nome).filter(Boolean).join(' e ')
    L.push({
      acao: `Reduzir a invasão de Yamaha no território`,
      porque: `Das ${v(a.yamNoTerrMes)} un/mês de Yamaha emplacadas na área, ${v(a.nipponMes)} saíram da Nippon — `
        + `${v(a.invasaoMes)} un/mês (${a.invasaoPct}%) foram de terceiros${quem ? `, principalmente ${quem}` : ''}.`,
      como: [
        `Levantar em quais cidades e modelos a invasão se concentra`,
        `Comparar preço, prazo de entrega e financiamento com quem está emplacando`,
        `Reforçar presença e pós-venda nas praças mais atingidas`,
        `Levar o caso à Yamaha se houver quebra de área`,
      ],
      resp, ini, fim, prio: PRIORIDADE(a.invasaoMes),
      indicador: `Baixar a fatia de terceiros de ${a.invasaoPct}% para ${Math.max(0, a.invasaoPct - 10)}% `
        + `= +${v(r1(a.invasaoMes * 0.33))} un/mês para a Nippon.`,
    })
  }

  return L
}
