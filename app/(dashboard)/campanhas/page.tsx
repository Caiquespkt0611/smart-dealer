export const dynamic = 'force-dynamic'

import { getProdutosEncalhados } from '@/lib/data'
import { GeradorCampanha } from '@/components/campanhas/GeradorCampanha'
import { AlertTriangle, PackageX, Megaphone, TrendingDown } from 'lucide-react'

export const metadata = { title: 'Campanhas IA · Smart Dealer' }

const SEV = {
  ALTA: { c: 'var(--danger)', bg: 'var(--danger-bg)', label: 'Encalhado' },
  MEDIA: { c: 'var(--warn)', bg: 'var(--warn-bg)', label: 'Girando devagar' },
  BAIXA: { c: 'var(--text-tertiary)', bg: 'var(--bg-inset)', label: 'Atenção' },
}

export default async function CampanhasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>
}) {
  const { loja = 'Grupo Nippon' } = await searchParams
  const encalhados = await getProdutosEncalhados(loja)
  const alta = encalhados.filter(e => e.severidade === 'ALTA').length

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Campanhas Inteligentes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            A IA detecta o estoque parado e gera o anúncio perfeito para girar
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
          <AlertTriangle size={13} /> {alta} modelo(s) encalhado(s)
        </div>
      </div>

      {/* ── DETECTOR ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <PackageX size={14} style={{ color: 'var(--danger)' }} />
          <h2 className="section-label">Detector de produtos parados — estoque × giro × cobertura</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {encalhados.slice(0, 8).map(e => {
            const sev = SEV[e.severidade as keyof typeof SEV]
            return (
              <div key={e.modelo} className="card card-pad flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{e.modelo}</p>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: sev.bg, color: sev.c }}>{sev.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: sev.c }}>{e.cobertura}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>dias de cobertura</span>
                </div>
                <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{e.estoqueTotal} un em estoque</span>
                  <span className="flex items-center gap-0.5"><TrendingDown size={10} /> {e.giroMensal}/mês</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── GERADOR IA ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Megaphone size={14} style={{ color: 'var(--accent)' }} />
          <h2 className="section-label">Gerar campanha com IA — post pronto para Instagram</h2>
        </div>
        <GeradorCampanha produtos={encalhados.map(e => ({ modelo: e.modelo, estoqueTotal: e.estoqueTotal, cobertura: e.cobertura, severidade: e.severidade }))} />
      </section>

      {/* Como funciona */}
      <div className="card card-pad">
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Como funciona o fluxo</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex gap-2"><span style={{ color: 'var(--accent)' }}>1.</span> A IA cruza estoque + giro + tendência e aponta o que está parado.</div>
          <div className="flex gap-2"><span style={{ color: 'var(--accent)' }}>2.</span> Você escolhe o modelo e o objetivo; a IA escreve o post no padrão Yamaha.</div>
          <div className="flex gap-2"><span style={{ color: 'var(--accent)' }}>3.</span> Copia, sobe como anúncio patrocinado e o lead cai no CRM.</div>
        </div>
      </div>
    </div>
  )
}
