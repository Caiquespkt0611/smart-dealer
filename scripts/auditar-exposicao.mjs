/**
 * Varre o que os papéis públicos do Supabase (anon, authenticated) alcançam.
 *
 * Existe porque o `supabase db advisors` não conecta neste projeto pelo pooler
 * — e a pergunta que importa não depende dele. Tabela sem RLS, ou com RLS mas
 * com grant aberto, é porta escancarada na API REST que o Supabase publica
 * sozinha, alcançável com a anon key.
 *
 * Aqui pesa mais que nos outros projetos: este app **usa a anon key**
 * (lib/supabase.ts). Anon key é pública por design.
 *
 * Só relata. Não altera nada. Rodar: node scripts/auditar-exposicao.mjs
 */
import pg from 'pg'

if (!process.env.DIRECT_URL) process.loadEnvFile('.env.local')
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!url) throw new Error('DIRECT_URL/DATABASE_URL ausentes')

const db = new pg.Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 20000 })
const q = async (sql, args = []) => (await db.query(sql, args)).rows
const PUBLICOS = ['anon', 'authenticated']

let achados = 0
const relatar = (titulo, linhas) => {
  if (linhas.length === 0) return console.log(`ok      ${titulo}`)
  achados += linhas.length
  console.log(`ATENCAO ${titulo}`)
  linhas.forEach((l) => console.log(`        ${l}`))
}

async function main() {
  const tabelas = await q(
    `SELECT c.relname AS tabela, c.relrowsecurity AS rls,
            (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid)::int AS policies
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname`,
  )
  relatar(
    `tabelas do public sem RLS (${tabelas.length} no total)`,
    tabelas.filter((t) => !t.rls).map((t) => t.tabela),
  )

  // O teste que vale: has_table_privilege cobre grant direto, herdado e via
  // PUBLIC. Se der falso em tudo, a porta está fechada mesmo sem RLS.
  const leitura = await q(
    `SELECT c.relname AS tabela,
            has_table_privilege('anon', c.oid, 'SELECT') AS anon,
            has_table_privilege('authenticated', c.oid, 'SELECT') AS auth
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'`,
  )
  relatar(
    'anon/authenticated conseguem LER tabela',
    leitura.filter((l) => l.anon || l.auth).map((l) => `${l.tabela}: anon=${l.anon} auth=${l.auth}`),
  )

  const escrita = await q(
    `SELECT c.relname AS tabela,
            has_table_privilege('anon', c.oid, 'INSERT') AS anon
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'`,
  )
  relatar('anon consegue ESCREVER em tabela', escrita.filter((e) => e.anon).map((e) => e.tabela))

  // Policy valendo para todos os papéis com USING(true): o RLS existe no papel
  // e não filtra nada.
  const permissivas = await q(
    `SELECT c.relname AS tabela, p.polname AS policy
       FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND p.polroles = '{0}'`,
  )
  relatar(
    'policy valendo para QUALQUER papel',
    permissivas.map((p) => `${p.tabela}: ${p.policy}`),
  )

  // View não obedece o RLS da tabela de baixo — roda com os direitos do dono.
  const views = await q(
    `SELECT viewname FROM pg_views WHERE schemaname = 'public'`,
  )
  relatar('views no public (view ignora o RLS da tabela base)', views.map((v) => v.viewname))

  // O PostgREST publica função do public como endpoint RPC.
  const funcoes = await q(
    `SELECT p.proname AS nome, r.rolname AS papel
       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace,
            unnest($1::text[]) AS r(rolname)
      WHERE n.nspname = 'public' AND has_function_privilege(r.rolname, p.oid, 'EXECUTE')`,
    [PUBLICOS],
  )
  relatar('funções executáveis por anon/authenticated', funcoes.map((f) => `${f.papel} → ${f.nome}()`))

  const defaults = await q(
    `SELECT d.defaclobjtype AS tipo, d.defaclacl::text AS acl
       FROM pg_default_acl d JOIN pg_namespace n ON n.oid = d.defaclnamespace
      WHERE n.nspname = 'public'
        AND (d.defaclacl::text LIKE '%anon=%' OR d.defaclacl::text LIKE '%authenticated=%')`,
  )
  const nomeTipo = { r: 'tabelas', S: 'sequences', f: 'funcoes' }
  relatar(
    'objetos FUTUROS já nascem abertos (default privileges)',
    defaults.map((d) => `${nomeTipo[d.tipo] ?? d.tipo}: ${d.acl}`),
  )

  console.log(
    achados === 0
      ? '\nNenhuma exposição encontrada.'
      : `\n${achados} ponto(s) para revisar acima.`,
  )
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1) }).finally(() => db.end())
