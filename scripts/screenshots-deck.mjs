// Captura telas reais do Smart Dealer logado, em alta resolução.
import { chromium } from '@playwright/test'
const OUT = '_NOVAS MELHORIAS/deck-assets'
const BASE = 'http://localhost:3000'
const PAGES = [
  ['dashboard', '/dashboard'],
  ['performance', '/performance'],
  ['premya', '/premya'],
  ['banco', '/banco'],
  ['pesquisa', '/pesquisa'],
  ['crmconfig', '/crm/configuracao'],
  ['posvendas', '/pos-vendas'],
  ['marketshare', '/market-share'],
  ['seguros', '/seguros'],
]
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
await page.fill('input[type="email"], input[name="email"]', 'titular@nippon.com')
await page.fill('input[type="password"], input[name="password"]', 'yamaha2026')
await page.click('button[type="submit"]')
await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {})
for (const [nome, rota] of PAGES) {
  await page.goto(BASE + rota, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${OUT}/${nome}.png` })
  console.log('✓', nome)
}
await browser.close()
