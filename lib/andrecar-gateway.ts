// Gateway de WhatsApp: o Smart Dealer usa o backend do CRM InnovAdapt (Railway,
// mesmo motor do Andrecar) para parear um número por QR e disparar mensagens
// reais. O pareamento vive lá (Baileys + fila anti-ban); aqui só orquestramos.
//
// Env necessárias (local e Vercel):
//   ANDRECAR_API_URL   ex.: https://api-production-23da6.up.railway.app
//   ANDRECAR_EMAIL     login de gestão (admin@andrecar.local)
//   ANDRECAR_SENHA     senha do login acima (SEED_ADMIN_SENHA no Railway)

const BASE = process.env.ANDRECAR_API_URL?.replace(/\/$/, '')
const EMAIL = process.env.ANDRECAR_EMAIL
const SENHA = process.env.ANDRECAR_SENHA

export function gatewayConfigurado(): boolean {
  return Boolean(BASE && EMAIL && SENHA)
}

// Login é throttled (5/min) — o token vale 8h, cacheia por instância.
let tokenCache: { token: string; validoAte: number } | null = null

async function token(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.validoAte) return tokenCache.token
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, senha: SENHA }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`login no gateway falhou (${res.status})`)
  const { accessToken } = await res.json()
  tokenCache = { token: accessToken, validoAte: Date.now() + 6 * 60 * 60 * 1000 }
  return accessToken
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const call = async () =>
    fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await token()}`,
        ...init?.headers,
      },
      cache: 'no-store',
    })
  let res = await call()
  if (res.status === 401) {
    tokenCache = null // token expirado/rotacionado — relogar uma vez
    res = await call()
  }
  if (!res.ok) {
    const corpo = await res.text().catch(() => '')
    throw new Error(`gateway ${path} → ${res.status} ${corpo.slice(0, 200)}`)
  }
  return res.json()
}

export interface UnidadeGateway {
  id: string
  nome: string
  slug: string
  canalSessao: { status: string; numero: string | null; atualizadoEm: string } | null
}

export function listarUnidades(): Promise<UnidadeGateway[]> {
  return api<UnidadeGateway[]>('/unidades')
}

export function iniciarPareamento(unidadeId: string, doZero = false) {
  return api(`/canal/unidades/${unidadeId}/${doZero ? 'reparear' : 'iniciar'}`, { method: 'POST' })
}

export function statusPareamento(unidadeId: string): Promise<{ unidadeId: string; status: string; qr: string | null }> {
  return api(`/canal/unidades/${unidadeId}/status`)
}

interface ConversaGateway {
  id: string
  unidadeId: string
  lead: { telefone: string; nome: string | null }
}

const soDigitos = (t: string) => t.replace(/\D/g, '')

/**
 * Dispara um texto para um telefone pelo número pareado. O CRM só envia dentro
 * de conversa existente (pipeline anti-ban) — o destinatário precisa ter mandado
 * uma mensagem para o número pareado ao menos uma vez.
 */
export async function dispararTexto(telefone: string, texto: string): Promise<
  { ok: true; conversaId: string } | { ok: false; motivo: 'sem-conversa' }
> {
  const alvo = soDigitos(telefone)
  const conversas = await api<ConversaGateway[]>('/conversas')
  const conversa = conversas.find(c => soDigitos(c.lead?.telefone ?? '') === alvo)
  if (!conversa) return { ok: false, motivo: 'sem-conversa' }
  await api(`/conversas/${conversa.id}/responder`, {
    method: 'POST',
    body: JSON.stringify({ texto }),
  })
  return { ok: true, conversaId: conversa.id }
}
