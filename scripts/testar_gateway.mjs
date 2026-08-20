// Smoke test do gateway WhatsApp: login, unidades e conversa do Ribeiro.
// Rodar da pasta smart-dealer:  node scripts/testar_gateway.mjs
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SD = dirname(dirname(fileURLToPath(import.meta.url)))
const env = Object.fromEntries(
  readFileSync(join(SD, '.env.local'), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]),
)
const BASE = env.ANDRECAR_API_URL

const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: env.ANDRECAR_EMAIL, senha: env.ANDRECAR_SENHA }),
})
if (!login.ok) {
  console.error(`✗ login falhou (${login.status}) — confira ANDRECAR_SENHA no .env.local`)
  process.exit(1)
}
const { accessToken } = await login.json()
console.log('✓ login OK')

const auth = { Authorization: `Bearer ${accessToken}` }
const unidades = await (await fetch(`${BASE}/unidades`, { headers: auth })).json()
for (const u of unidades) {
  console.log(`  unidade: ${u.nome} — sessão: ${u.canalSessao?.status ?? 'nunca pareada'} ${u.canalSessao?.numero ?? ''}`)
}

const conversas = await (await fetch(`${BASE}/conversas`, { headers: auth })).json()
console.log(`  conversas abertas: ${conversas.length}`)
const ribeiro = conversas.find(c => (c.lead?.telefone ?? '').replace(/\D/g, '').includes('981562536'))
console.log(ribeiro
  ? `✓ conversa do Ribeiro EXISTE (unidade ${ribeiro.unidadeId}) — o disparo vai funcionar`
  : '✗ SEM conversa do Ribeiro — ele precisa mandar um "Oi" para o número pareado antes da demo')
