/**
 * Fecha o que ainda não existe.
 *
 * Em 25/08/2026 as 5 tabelas de hoje estavam seguras — RLS ligado, sem policy
 * para anon, e a prova no ar (scripts/provar-rls-no-ar.mjs) devolveu lista
 * vazia. O buraco não era o presente: era o futuro.
 *
 * Os default privileges do Supabase dão a anon e authenticated acesso total a
 * TABELA FUTURA, e o `prisma db push` cria tabela sem RLS. Junte os dois e a
 * proxima tabela nasce lendo e escrevendo pela anon key — que neste projeto é
 * usada de verdade e, por definição, é pública.
 *
 * Revoga o grant do que existe e o default privilege do que virá. O app não
 * sente: ele fala com o banco pela SUPABASE_SERVICE_ROLE_KEY, e service_role
 * ignora RLS.
 *
 * Idempotente. Rodar: node scripts/fechar-rls.mjs
 */
import pg from 'pg'

if (!process.env.DIRECT_URL) process.loadEnvFile('.env.local')
const db = new pg.Pool({ connectionString: process.env.DIRECT_URL, max: 1, connectionTimeoutMillis: 20000 })
const PUBLICOS = 'anon, authenticated'

async function main() {
  const { rows: tabelas } = await db.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  )
  for (const { tablename } of tabelas) {
    await db.query(`ALTER TABLE public."${tablename}" ENABLE ROW LEVEL SECURITY`)
    await db.query(`REVOKE ALL ON public."${tablename}" FROM ${PUBLICOS}`)
  }
  console.log(`ok: RLS garantido e grants revogados em ${tabelas.length} tabelas`)

  await db.query(`REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM ${PUBLICOS}`)
  await db.query(`REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM ${PUBLICOS}`)
  for (const tipo of ['TABLES', 'SEQUENCES', 'FUNCTIONS']) {
    await db.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ${tipo} FROM ${PUBLICOS}`)
  }
  console.log('ok: sequences, funções e default privileges fechados')

  const { rows } = await db.query(
    `SELECT c.relname AS t, has_table_privilege('anon', c.oid, 'SELECT') AS anon
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'`,
  )
  const abertas = rows.filter((r) => r.anon)
  console.log(abertas.length ? `\nAINDA ABERTAS: ${abertas.map((r) => r.t).join(', ')}` : '\nFechado.')
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1) }).finally(() => db.end())
