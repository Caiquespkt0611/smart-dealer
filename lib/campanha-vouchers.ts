// Campanhas de incentivo POR MODELO (vouchers/bônus) — circulares de 31/07/2026,
// vigência 01–31/08/2026. O concessionário recebe da Yamaha um ressarcimento
// por chassi emitido no período. Campanhas equivalentes estavam vigentes em
// julho — por isso o realizado de julho entra como recebível estimado.
// Fonte da receita: VendaMensal (banco). Regras: PDFs em _NOVAS MELHORIAS.
import { createServerClient } from '@/lib/supabase-server'
import { getReferencia } from '@/lib/dados-vivos'

export interface CampanhaVoucher {
  circular: string
  modeloCircular: string
  /** nomes do modelo na base VendaMensal que a campanha cobre */
  modelosBase: string[]
  bonusCliente: number       // desconto total ao cliente
  ressarcimento: number      // o que a Yamaha devolve à CCY por chassi
  custeio: string
}

export const CAMPANHAS_VOUCHER: CampanhaVoucher[] = [
  { circular: 'CA-MTC028-26', modeloCircular: 'FZ25 Connected (Fazer 250)', modelosBase: ['FAZER 250 ABS'], bonusCliente: 2000, ressarcimento: 1000, custeio: '50% Yamaha · 50% CCY' },
  { circular: 'CA-MTC029-26', modeloCircular: 'NMAX', modelosBase: ['NMAX'], bonusCliente: 1000, ressarcimento: 500, custeio: '50% Yamaha · 50% CCY' },
  { circular: 'CA-MTC030-26', modeloCircular: 'MT-07', modelosBase: ['MT-07 ABS'], bonusCliente: 2500, ressarcimento: 2500, custeio: '100% Yamaha' },
  { circular: 'CA-MTC031-26', modeloCircular: 'Lander', modelosBase: ['LANDER 250 ABS'], bonusCliente: 2000, ressarcimento: 1000, custeio: '50% Yamaha · 50% CCY' },
  { circular: 'CA-MTC032-26', modeloCircular: 'XMAX 300 Connected', modelosBase: ['XMAX 300'], bonusCliente: 3000, ressarcimento: 1500, custeio: '50% Yamaha · 50% CCY' },
]

export interface VoucherModeloAnalise {
  circular: string
  modelo: string
  ressarcimento: number
  bonusCliente: number
  custeio: string
  vendasMesFechado: number       // julho realizado
  recebivelMesFechado: number
  vendasMesCorrente: number      // agosto até agora
  projecaoMesCorrente: number    // giro médio 3M como referência de ritmo
  recebivelProjetado: number
}

export interface VouchersAnalise {
  mesFechadoNome: string
  mesCorrenteNome: string
  modelos: VoucherModeloAnalise[]
  totalMesFechado: number
  totalProjetado: number
  regras: string[]
}

const MESES_PT = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export async function getVouchersAnalise(): Promise<VouchersAnalise> {
  const ref = await getReferencia()
  const sb = createServerClient()
  const MESES_GIRO = [ref.mesFechado - 2, ref.mesFechado - 1, ref.mesFechado].filter(m => m >= 1)

  const { data } = await sb
    .from('VendaMensal')
    .select('modelo,mes,quantidade')
    .eq('grupo', 'NIPPON MOTOS')
    .eq('ano', ref.ano)
    .in('mes', [...MESES_GIRO, ref.mesCorrente])

  const soma = (modelos: string[], mes: number) =>
    (data ?? []).filter(v => modelos.includes(v.modelo) && v.mes === mes)
      .reduce((s, v) => s + v.quantidade, 0)

  const modelos: VoucherModeloAnalise[] = CAMPANHAS_VOUCHER.map(c => {
    const vendasMesFechado = soma(c.modelosBase, ref.mesFechado)
    const vendasMesCorrente = soma(c.modelosBase, ref.mesCorrente)
    const giro = MESES_GIRO.reduce((s, m) => s + soma(c.modelosBase, m), 0) / MESES_GIRO.length
    // projeção do mês corrente: o que já vendeu, nunca menos que o ritmo dos 3 meses
    const projecao = Math.max(vendasMesCorrente, Math.round(giro))
    return {
      circular: c.circular, modelo: c.modeloCircular,
      ressarcimento: c.ressarcimento, bonusCliente: c.bonusCliente, custeio: c.custeio,
      vendasMesFechado, recebivelMesFechado: vendasMesFechado * c.ressarcimento,
      vendasMesCorrente, projecaoMesCorrente: projecao,
      recebivelProjetado: projecao * c.ressarcimento,
    }
  })

  return {
    mesFechadoNome: MESES_PT[ref.mesFechado],
    mesCorrenteNome: MESES_PT[ref.mesCorrente],
    modelos,
    totalMesFechado: modelos.reduce((s, m) => s + m.recebivelMesFechado, 0),
    totalProjetado: modelos.reduce((s, m) => s + m.recebivelProjetado, 0),
    regras: [
      'Ressarcimento por chassi emitido dentro do período da campanha (01–31/08), comprovado pelo XML da NF de venda com o desconto aplicado.',
      'XML deve chegar à Yamaha até 04/09 · pagamento do ressarcimento até 20/09.',
      'Não cumulativo com taxas subsidiadas nem com o voucher da campanha nacional (MTC-CIR 075-26) — um benefício por venda. Os valores abaixo assumem o bônus aplicado em todas as vendas do modelo (teto do recebível).',
      'Campanhas equivalentes estavam vigentes em julho — o realizado de julho entra como recebível estimado do mês fechado.',
    ],
  }
}
