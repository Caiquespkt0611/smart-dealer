// Testa os botões Gerar PDCA / Gerar Deck de /performance (motor oficial em iframe).
import { chromium } from '@playwright/test'
const BASE = 'http://localhost:3000'
const OUT = process.argv[2]
const browser = await chromium.launch()
const ctx = await browser.newContext({ acceptDownloads: true })
const page = await ctx.newPage()
page.on('dialog', async d => { console.log('DIALOG:', d.message()); await d.dismiss() })
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 200)) })

await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
await page.fill('input[type="email"], input[name="email"]', 'titular@nippon.com')
await page.fill('input[type="password"], input[name="password"]', 'yamaha2026')
await page.click('button[type="submit"]')
await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {})
await page.goto(BASE + '/performance', { waitUntil: 'networkidle' })
await page.waitForTimeout(4000) // pré-carga do iframe

for (const rotulo of ['Gerar PDCA (.xlsx)', 'Gerar Deck (.pptx)']) {
  const dl = page.waitForEvent('download', { timeout: 40000 })
  await page.getByRole('button', { name: rotulo }).first().click()
  try {
    const d = await dl
    const path = `${OUT}/${d.suggestedFilename()}`
    await d.saveAs(path)
    console.log(`✓ ${rotulo} → ${d.suggestedFilename()}`)
  } catch (e) {
    console.log(`✗ ${rotulo} — SEM DOWNLOAD:`, String(e).slice(0, 150))
  }
}
await browser.close()
