// Publica o DADOS_DE_EMPLACAMENTO.xlsx no local X (Supabase Storage).
// O sistema detecta a versão nova sozinho e atualiza tudo no próximo acesso.
//
// Uso:  npm run subir-planilha            (usa o caminho padrão do Mac)
//       npm run subir-planilha -- /caminho/para/arquivo.xlsx
import { createClient } from '@supabase/supabase-js'
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const SD = dirname(dirname(fileURLToPath(import.meta.url)))
const CAMINHO_PADRAO = '/Users/caiqueoliveira/Documents/MEUS PROJETOS/_Performance Concessionário/DADOS_DE_EMPLACAMENTO.xlsx'
const BUCKET = 'dados-sistema'
const DESTINO = 'DADOS_DE_EMPLACAMENTO.xlsx'

const caminho = process.argv[2] ?? CAMINHO_PADRAO

const env = Object.fromEntries(
  readFileSync(join(SD, '.env.local'), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')])
)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// bucket privado; criar se ainda não existe
const { error: bErr } = await sb.storage.createBucket(BUCKET, { public: false })
if (bErr && !/already exists/i.test(bErr.message)) throw new Error('bucket: ' + bErr.message)

const stat = statSync(caminho)
const conteudo = readFileSync(caminho)
const { error } = await sb.storage.from(BUCKET).upload(DESTINO, conteudo, {
  upsert: true,
  contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
})
if (error) throw new Error('upload: ' + error.message)

console.log(`✓ Planilha publicada (${(stat.size / 1024).toFixed(0)} KB, modificada em ${stat.mtime.toLocaleString('pt-BR')})`)
console.log('O sistema atualiza sozinho no próximo acesso (checagem a cada 60s).')
