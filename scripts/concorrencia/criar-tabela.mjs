/**
 * Cria a tabela da leitura semanal da concorrência. Idempotente.
 * Nasce fechada como as outras (RLS ligado, nada para anon): o app lê pela service_role.
 * Rodar: node scripts/concorrencia/criar-tabela.mjs
 */
import pg from 'pg'

if (!process.env.DIRECT_URL) process.loadEnvFile('.env.local')
const db = new pg.Pool({ connectionString: process.env.DIRECT_URL, max: 1, connectionTimeoutMillis: 20000 })

async function main() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public."LeituraConcorrencia" (
      id        text PRIMARY KEY,
      grupo     text NOT NULL,
      "lidoEm"  timestamptz NOT NULL,
      dados     jsonb NOT NULL
    )`)
  await db.query(`CREATE INDEX IF NOT EXISTS leitura_concorrencia_grupo_data ON public."LeituraConcorrencia" (grupo, "lidoEm" DESC)`)
  await db.query(`ALTER TABLE public."LeituraConcorrencia" ENABLE ROW LEVEL SECURITY`)
  await db.query(`REVOKE ALL ON public."LeituraConcorrencia" FROM anon, authenticated`)
  console.log('ok: LeituraConcorrencia pronta e fechada')
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1) }).finally(() => db.end())
