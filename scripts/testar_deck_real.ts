// Gera o deck com os DADOS REAIS (mesmo pipeline da tela) fora do navegador.
// Rodar: npx tsx scripts/testar_deck_real.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// carrega .env.local antes de importar os módulos que leem process.env
for (const l of readFileSync(join(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const i = l.indexOf('=')
  if (i > 0 && !l.startsWith('#')) process.env[l.slice(0, i)] ??= l.slice(i + 1).trim().replace(/^"|"$/g, '')
}

async function main() {
  const { getPerformanceAnalise, gerarAcoesPDCA } = await import('../lib/performance')
  const { getCampanhaAnalise } = await import('../lib/campanha-vendas')
  const { getVouchersAnalise } = await import('../lib/campanha-vouchers')
  const { montarDeckSmartDealer } = await import('../lib/deck-performance')
  const { montarPptx } = await import('../lib/pptx-bonito')

  const analise = await getPerformanceAnalise()
  const acoes = gerarAcoesPDCA(analise)
  const campanha = await getCampanhaAnalise().catch(() => null)
  const vouchers = await getVouchersAnalise().catch(() => null)
  const slides = montarDeckSmartDealer({ analise, acoes, campanha, vouchers, dataStr: '07/08/2026' })
  console.log('slides:', slides.length, '| ações PDCA:', acoes.length)

  const blob = montarPptx('real.pptx', slides, { titulo: 'Plano de Performance — Nippon', autor: 'Smart Dealer' }) as Blob
  const buf = Buffer.from(await blob.arrayBuffer())
  writeFileSync('/tmp/claude-501/deck-real.pptx', buf)
  console.log('gerado:', buf.length, 'bytes')
}
main().catch(e => { console.error('FALHOU:', e); process.exit(1) })
