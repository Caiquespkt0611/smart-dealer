// Dados vivos gravados pelo upload do DADOS_DE_EMPLACAMENTO.xlsx (Supabase Storage).
// Cada leitura tem fallback para os módulos estáticos — o sistema nunca quebra
// se o bucket ainda não existir ou o upload nunca tiver sido feito.
import { createClient } from '@supabase/supabase-js'
import { shareData as shareEstatico } from '@/lib/share-data'
import { workingDays as calendarioEstatico } from '@/lib/calendario-data'
import { REF as REF_ESTATICA } from '@/lib/referencia'
import type { Referencia } from '@/lib/importar-dados'

export const BUCKET_DADOS = 'dados-sistema'

const MESES_PT = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
export const nomeMes = (m: number) => MESES_PT[m] ?? ''

function storageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function lerJson<T>(arquivo: string): Promise<T | null> {
  try {
    const sb = storageClient()
    const { data, error } = await sb.storage.from(BUCKET_DADOS).download(arquivo)
    if (error || !data) return null
    return JSON.parse(await data.text()) as T
  } catch {
    return null
  }
}

export async function getReferencia(): Promise<Referencia> {
  const ref = await lerJson<Referencia>('referencia.json')
  return ref ?? {
    ano: REF_ESTATICA.ano,
    mesCorrente: REF_ESTATICA.mesCorrente,
    mesFechado: REF_ESTATICA.mesFechado,
    dataEstoque: '',
    atualizadoEm: '',
  }
}

export async function getCalendario(): Promise<Record<string, number>> {
  const cal = await lerJson<Record<string, number>>('calendario.json')
  return cal ?? calendarioEstatico
}

export interface ShareData {
  referencia: string
  ultimoMesFechado: number
  totalMercado2026: number
  yamahaShare: number
  yamahaQtd: number
  hondaShare: number
  hondaQtd: number
  nipponQtd: number
  nipponShareDoMercado: number
  nipponShareDaYamaha: number
  areas: readonly string[]
  brandShare: ReadonlyArray<{ marca: string; qtd: number; pct: number }>
  trend: ReadonlyArray<{ mes: string; yamaha: number; honda: number; outros: number; total: number; shareYamaha: number }>
  segments: ReadonlyArray<{ segmento: string; total: number; yamaha: number; honda: number; shareYamaha: number; shareHonda: number; gap: number }>
  cities: ReadonlyArray<{ cidade: string; area: string; total: number; yamaha: number; shareYamaha: number }>
  competitors: ReadonlyArray<{ cnpj: string; marca: string; qtd: number; cidade: string; nome?: string }>
  numCompetitorCnpj: number
}

export async function getShareData(): Promise<ShareData> {
  const share = await lerJson<ShareData>('share.json')
  return share ?? (shareEstatico as unknown as ShareData)
}
