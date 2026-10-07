import { createServerClient } from '@/lib/supabase-server'

// A leitura semanal do Instagram dos concorrentes (scripts/concorrencia/). Um JSON por semana.

export type Movimento = 'NOVO ATAQUE' | 'INTENSIFICOU' | 'TROCOU DE TÁTICA' | 'MANTEVE' | 'RECUOU' | '1ª LEITURA'

export interface PostConcorrente {
  url: string
  data: string
  imagem?: string
  legenda?: string
  curtidas?: number | null
}

export interface Concorrente {
  arroba: string
  nome: string
  cidade: string
  marca: string
  situacao: 'ativo' | 'radar' | 'parado'
  leituraOk: boolean
  seguidores: number | null
  agressividade: number
  movimento: Movimento
  mudou: string | null
  manchete: string
  anunciam: string[]
  elesEmpurram: string
  responderCom: string
  argumento: string
  comoResponder: string[]
  posts?: PostConcorrente[]
}

export interface LeituraConcorrencia {
  grupo: string
  lidoEm: string
  veredito: { titulo: string; texto: string }
  concorrentes: Concorrente[]
  acoes: { titulo: string; texto: string }[]
}

export async function getLeituraConcorrencia(grupo = 'NIPPON MOTOS'): Promise<LeituraConcorrencia | null> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('LeituraConcorrencia')
    .select('dados')
    .eq('grupo', grupo)
    .order('lidoEm', { ascending: false })
    .limit(1)
  if (error || !data?.[0]) return null
  return data[0].dados as LeituraConcorrencia
}

const BRT = -3 * 3600_000 // Brasília, sem horário de verão

/** A próxima segunda às 7h (Brasília) depois da leitura. O servidor roda em UTC. */
export function proximaLeitura(lidoEm: string): Date {
  const local = new Date(new Date(lidoEm).getTime() + BRT)
  const dias = ((8 - local.getUTCDay()) % 7) || 7
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + dias, 7) - BRT)
}

/** Passou da segunda das 7h (com 3h de folga) e não chegou leitura nova. */
export function leituraAtrasada(lidoEm: string, agora = Date.now()): boolean {
  return agora > proximaLeitura(lidoEm).getTime() + 3 * 3600_000
}
