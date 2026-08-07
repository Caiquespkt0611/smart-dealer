// Ingestão automática: a planilha DADOS_DE_EMPLACAMENTO.xlsx mora no Supabase
// Storage (bucket dados-sistema). A cada acesso o sistema confere se o arquivo
// mudou (etag/updated_at); se mudou, reprocessa e atualiza banco + agregados.
// O concessionário sempre abre o sistema já atualizado — ninguém faz upload em tela.
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { parseWorkbook, type DadosImportados } from '@/lib/importar-dados'
import { BUCKET_DADOS } from '@/lib/dados-vivos'

export const ARQUIVO_PLANILHA = 'DADOS_DE_EMPLACAMENTO.xlsx'

function serviceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

let uid = 0
const novoId = (p: string) => `${p}${Date.now().toString(36)}${(uid++).toString(36).padStart(4, '0')}`

async function chunkedInsert(sb: SupabaseClient, table: string, rows: object[]) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await sb.from(table).insert(rows.slice(i, i + 500))
    if (error) throw new Error(`${table}: ${error.message}`)
  }
}

async function gravarJson(sb: SupabaseClient, nome: string, valor: object) {
  const { error } = await sb.storage.from(BUCKET_DADOS).upload(
    nome,
    new Blob([JSON.stringify(valor)], { type: 'application/json' }),
    { upsert: true, contentType: 'application/json' },
  )
  if (error) throw new Error(`storage ${nome}: ${error.message}`)
}

/** Aplica os dados parseados: substitui tabelas + grava agregados no Storage. */
export async function aplicarDados(dados: DadosImportados, versaoFonte: string) {
  const sb = serviceClient()

  // Metas (upsert por grupo)
  for (const [grupo, carta] of Object.entries(dados.metas)) {
    const { error } = await sb.from('Meta').update({ carta }).eq('grupo', grupo)
    if (error) throw new Error(`Meta ${grupo}: ${error.message}`)
  }
  // grupos novos que ainda não existem na tabela
  const { data: metasExistentes } = await sb.from('Meta').select('grupo')
  const existentes = new Set((metasExistentes ?? []).map((m: { grupo: string }) => m.grupo))
  const novos = Object.entries(dados.metas).filter(([g]) => !existentes.has(g))
  if (novos.length) {
    await chunkedInsert(sb, 'Meta', novos.map(([grupo, carta]) => ({ id: novoId('m'), grupo, carta })))
  }

  // Vendas: substitui todos os meses presentes no arquivo
  const anos = [...new Set(dados.varejo.map(v => v.ano))]
  for (const ano of anos) {
    const meses = [...new Set(dados.varejo.filter(v => v.ano === ano).map(v => v.mes))]
    const { error } = await sb.from('VendaMensal').delete().eq('ano', ano).in('mes', meses)
    if (error) throw new Error(`VendaMensal delete: ${error.message}`)
  }
  await chunkedInsert(sb, 'VendaMensal', dados.varejo.map(v => ({ id: novoId('v'), ...v })))

  // Estoque: substitui tudo (posição do arquivo)
  {
    const { error } = await sb.from('Estoque').delete().neq('id', '')
    if (error) throw new Error(`Estoque delete: ${error.message}`)
    await chunkedInsert(sb, 'Estoque', dados.estoque.map(e => ({ id: novoId('e'), ...e })))
  }

  // Agregados no Storage (lidos por dados-vivos.ts)
  await gravarJson(sb, 'share.json', dados.share)
  await gravarJson(sb, 'calendario.json', dados.calendario)
  await gravarJson(sb, 'referencia.json', { ...dados.referencia, versaoFonte })
}

/** Etag/versão atual da planilha no bucket (null se não existe). */
async function versaoPlanilha(sb: SupabaseClient): Promise<string | null> {
  const { data, error } = await sb.storage.from(BUCKET_DADOS).list('', { search: ARQUIVO_PLANILHA })
  if (error || !data) return null
  const f = data.find(x => x.name === ARQUIVO_PLANILHA)
  if (!f) return null
  const meta = f.metadata as { eTag?: string } | null
  return meta?.eTag ?? f.updated_at ?? null
}

// Cache do check por instância do servidor: evita conferir o Storage em toda requisição.
let ultimoCheck = 0
let checkEmAndamento: Promise<void> | null = null
const INTERVALO_CHECK_MS = 60_000

/**
 * Garante que os dados refletem a última versão da planilha publicada.
 * Chamada no início das páginas de dados; barata (1 list a cada 60s no máximo;
 * reprocessa só quando a planilha realmente mudou).
 */
export async function garantirDadosAtualizados(): Promise<void> {
  const agora = Date.now()
  if (agora - ultimoCheck < INTERVALO_CHECK_MS) return
  if (checkEmAndamento) return checkEmAndamento

  checkEmAndamento = (async () => {
    try {
      const sb = serviceClient()
      const versao = await versaoPlanilha(sb)
      if (!versao) return // planilha ainda não publicada — segue com o que há

      const { data: refBlob } = await sb.storage.from(BUCKET_DADOS).download('referencia.json')
      const refAtual = refBlob ? JSON.parse(await refBlob.text()) as { versaoFonte?: string } : null
      if (refAtual?.versaoFonte === versao) return // já processada

      const { data: arquivo, error } = await sb.storage.from(BUCKET_DADOS).download(ARQUIVO_PLANILHA)
      if (error || !arquivo) return
      const dados = parseWorkbook(await arquivo.arrayBuffer())
      await aplicarDados(dados, versao)
      console.log(`[ingestao] planilha reprocessada (versão ${versao}): ` +
        `${dados.resumo.linhasVarejo} vendas, ${dados.resumo.linhasEstoque} estoque, mercado ${dados.resumo.mercadoTotal}`)
    } catch (e) {
      console.error('[ingestao] falha ao atualizar dados:', e)
    } finally {
      ultimoCheck = Date.now()
      checkEmAndamento = null
    }
  })()
  return checkEmAndamento
}
