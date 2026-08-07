// Gera variantes do deck para isolar o problema do PowerPoint Windows.
// Rodar: npx tsx scripts/gerar_variantes_teste.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

for (const l of readFileSync(join(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const i = l.indexOf('=')
  if (i > 0 && !l.startsWith('#')) process.env[l.slice(0, i)] ??= l.slice(i + 1).trim().replace(/^"|"$/g, '')
}

const DEST = join(process.cwd(), '_NOVAS MELHORIAS')

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
  const slides = montarDeckSmartDealer({ analise, acoes, campanha, vouchers, dataStr: '07/08/2026' }) as Array<{ formas: string[] }>

  const salvar = async (nome: string, sls: object[]) => {
    const blob = montarPptx(nome, sls, { titulo: 'Teste', autor: 'Smart Dealer' }) as Blob
    writeFileSync(join(DEST, nome), Buffer.from(await blob.arrayBuffer()))
    console.log(nome, '→', sls.length, 'slides')
  }

  const temTabela = (sl: { formas: string[] }) => sl.formas.some(f => f.includes('graphicFrame'))

  await salvar('TESTE-A-completo.pptx', slides)                       // com o fix do NBSP
  await salvar('TESTE-C-sem-tabelas.pptx', slides.filter(s => !temTabela(s)))
  await salvar('TESTE-D-so-tabelas.pptx', slides.filter(temTabela))
}
main().catch(e => { console.error(e); process.exit(1) })
