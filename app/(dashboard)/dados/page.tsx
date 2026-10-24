import { createClient } from '@supabase/supabase-js'
import { BUCKET_DADOS, getReferencia, nomeMes } from '@/lib/dados-vivos'
import { ARQUIVO_PLANILHA } from '@/lib/ingestao'
import { AtualizarPlanilha } from '@/components/dados/AtualizarPlanilha'

export const metadata = { title: 'Atualizar Dados · Smart Dealer' }
export const dynamic = 'force-dynamic'

async function dataDaPlanilha(): Promise<string | null> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data } = await sb.storage.from(BUCKET_DADOS).list('', { search: ARQUIVO_PLANILHA })
  const f = data?.find(x => x.name === ARQUIVO_PLANILHA)
  return f?.updated_at ?? null
}

export default async function DadosPage() {
  const [atualizada, ref] = await Promise.all([dataDaPlanilha(), getReferencia()])
  const quando = atualizada
    ? new Date(atualizada).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
    : null

  return (
    <div className="space-y-6 pb-24 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Atualizar Dados
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          A planilha de emplacamento alimenta Varejo, Estoque, Market Share, Performance e Distribuição
        </p>
      </div>

      <div className="card card-pad space-y-1">
        <p className="section-label mb-2">Planilha em uso agora</p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{ARQUIVO_PLANILHA}</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {quando ? `Enviada em ${quando}` : 'Nenhuma planilha enviada ainda'}
          {ref.mesFechado ? ` · último mês fechado: ${nomeMes(ref.mesFechado)}/${ref.ano}` : ''}
          {ref.dataEstoque ? ` · estoque de ${ref.dataEstoque}` : ''}
        </p>
      </div>

      <AtualizarPlanilha temPlanilha={Boolean(atualizada)} />

      <div className="card card-pad">
        <p className="section-label mb-2">Como atualizar</p>
        <ol className="text-sm space-y-1 list-decimal pl-5" style={{ color: 'var(--text-secondary)' }}>
          <li>Baixe a planilha atual no botão acima.</li>
          <li>Atualize no Excel sem mudar o nome das abas nem a ordem das colunas.</li>
          <li>Salve como .xlsx e envie aqui. A nova substitui a antiga e o sistema atualiza na hora.</li>
        </ol>
      </div>
    </div>
  )
}
