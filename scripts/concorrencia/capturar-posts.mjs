/**
 * Traz a arte de cada post citado na leitura: abre o embed público do post
 * (instagram.com/p/<código>/embed/captioned/, não pede login), guarda a imagem
 * no Storage do Supabase e completa legenda e curtidas.
 *
 * Entrada: a leitura com `posts: [{ url, data }]` em cada concorrente.
 *   node scripts/concorrencia/capturar-posts.mjs scripts/concorrencia/saida/AAAA-MM-DD.json
 * Reescreve o mesmo arquivo; depois é só rodar o subir.mjs.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.loadEnvFile('.env.local')
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const BUCKET = 'concorrencia' // público: são posts públicos dos concorrentes

const arquivo = process.argv[2]
if (!arquivo) { console.error('uso: capturar-posts.mjs <leitura.json>'); process.exit(1) }
const leitura = JSON.parse(readFileSync(arquivo, 'utf8'))

const { data: buckets } = await sb.storage.listBuckets()
if (!buckets?.some((b) => b.name === BUCKET)) {
  const { error } = await sb.storage.createBucket(BUCKET, { public: true })
  if (error) { console.error(error.message); process.exit(1) }
}

const codigo = (url) => url.match(/\/(?:p|reel)\/([^/?]+)/)?.[1]
const br = await chromium.launch()
const page = await br.newPage({
  viewport: { width: 540, height: 1000 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
})

let ok = 0, falhou = 0
for (const c of leitura.concorrentes) {
  for (const post of c.posts ?? []) {
    const cod = codigo(post.url)
    if (!cod) continue
    try {
      await page.goto(`https://www.instagram.com/p/${cod}/embed/captioned/`, { waitUntil: 'networkidle', timeout: 60000 })
      const media = page.locator('.EmbeddedMediaImage, .EmbeddedMediaVideo, video').first()
      await media.waitFor({ timeout: 15000 })
      const png = await media.screenshot({ type: 'jpeg', quality: 85 })
      const info = await page.evaluate(() => {
        // a legenda vem com o link do @ de quem postou na frente e o "ver comentários" no fim
        const cap = document.querySelector('.Caption')?.cloneNode(true)
        cap?.querySelector('a.CaptionUsername, a')?.remove()
        cap?.querySelector('.CaptionComments')?.remove()
        cap?.querySelectorAll('br').forEach((b) => b.replaceWith(' '))
        const curt = document.body.innerText.match(/([\d.,]+)\s+(likes|curtidas)/i)
        return { legenda: cap?.textContent?.trim() ?? '', curtidas: curt ? Number(curt[1].replace(/[.,]/g, '')) : null }
      })
      const caminho = `${c.arroba}/${cod}.jpg`
      const { error } = await sb.storage.from(BUCKET).upload(caminho, png, { contentType: 'image/jpeg', upsert: true })
      if (error) throw new Error(error.message)
      post.imagem = sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl
      const legenda = info.legenda.replace(/\s*View all \d+ comments?$/i, '')
      if (legenda) post.legenda = legenda.slice(0, 600)
      if (info.curtidas != null) post.curtidas = info.curtidas
      ok++
      console.log('ok', c.arroba, cod, info.curtidas ?? '')
    } catch (e) {
      falhou++
      console.log('falhou', c.arroba, cod, String(e.message ?? e).slice(0, 80))
    }
  }
}
await br.close()
writeFileSync(arquivo, JSON.stringify(leitura, null, 2) + '\n')
console.log(`artes: ${ok} capturadas, ${falhou} falharam`)
