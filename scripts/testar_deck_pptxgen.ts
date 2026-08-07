// Gera o deck PptxGenJS com os DADOS REAIS fora do navegador e valida.
// Rodar: npx tsx scripts/testar_deck_pptxgen.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

for (const l of readFileSync(join(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const i = l.indexOf('=')
  if (i > 0 && !l.startsWith('#')) process.env[l.slice(0, i)] ??= l.slice(i + 1).trim().replace(/^"|"$/g, '')
}

async function main() {
  const { getPerformanceAnalise, gerarAcoesPDCA } = await import('../lib/performance')
  const { getCampanhaAnalise } = await import('../lib/campanha-vendas')
  const { getVouchersAnalise } = await import('../lib/campanha-vouchers')
  const { gerarDeck } = await import('../lib/deck-pptxgen')

  const analise = await getPerformanceAnalise()
  const acoes = gerarAcoesPDCA(analise)
  const campanha = await getCampanhaAnalise().catch(() => null)
  const vouchers = await getVouchersAnalise().catch(() => null)

  const p = await gerarDeck({ analise, acoes, campanha, vouchers, dataStr: '07/08/2026' })
  const buf = await p.write({ outputType: 'nodebuffer' }) as Buffer
  writeFileSync('/tmp/claude-501/deck-pptxgen.pptx', buf)
  console.log('gerado:', buf.length, 'bytes')
}
main().catch(e => { console.error('FALHOU:', e); process.exit(1) })
