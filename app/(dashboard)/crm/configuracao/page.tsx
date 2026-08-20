import { crmConfigData } from '@/lib/crm-config-data'
import Link from 'next/link'
import {
  Settings2, UserCog, MapPin, BellRing, GitBranch, ShieldCheck,
  Plug, Gauge, ArrowLeft, XCircle, Timer,
} from 'lucide-react'

export const metadata = { title: 'Configuração do CRM · Smart Dealer' }

export default function CrmConfigPage() {
  const d = crmConfigData
  const ef = d.efetividade

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/crm" className="text-xs flex items-center gap-1 mb-1" style={{ color: 'var(--accent)' }}>
            <ArrowLeft size={12} /> Voltar ao CRM
          </Link>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Configuração &amp; Governança do CRM</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {d.grupo} · a efetividade vem da cobrança configurada, não da boa vontade · atualizado em {d.atualizadoEm}
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5" style={{ backgroundColor: 'var(--ok-bg)', color: 'var(--ok)' }}>
          <Settings2 size={12} /> Regras ativas em produção
        </span>
      </div>

      {/* Efetividade — antes × depois */}
      <div className="card card-pad" style={{ borderLeft: '4px solid var(--ok)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={16} style={{ color: 'var(--ok)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>O que a governança mudou — mesma equipe, mesmos leads</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Antes label="Tempo de 1ª resposta" antes={ef.antes.tempoResposta} depois={ef.depois.tempoResposta} />
          <Antes label="Atendidos em ≤10 min" antes={`${ef.antes.sla10min}%`} depois={`${ef.depois.sla10min}%`} />
          <Antes label="Conversão de leads" antes={`${ef.antes.conversao}%`} depois={`${ef.depois.conversao}%`} />
          <Antes label="Leads sem resposta" antes={`${ef.antes.semResposta}%`} depois={`${ef.depois.semResposta}%`} invertido />
          <Antes label="Follow-up cumprido" antes={`${ef.antes.followupFeito}%`} depois={`${ef.depois.followupFeito}%`} />
        </div>
        <p className="text-xs mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{ef.leitura}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hierarquia */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-4">
            <UserCog size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hierarquia de cobrança</h2>
          </div>
          <div className="rounded-xl p-3.5 mb-3" style={{ backgroundColor: 'var(--accent-bg)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{d.hierarquia.gerente.nome}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.hierarquia.gerente.papel}</p>
            <p className="text-[11px] mt-1.5 font-medium" style={{ color: 'var(--accent)' }}>⏱ {d.hierarquia.gerente.rotina}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {d.hierarquia.coordenadores.map(co => (
              <div key={co.nome} className="rounded-xl p-3 border" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{co.nome}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{co.regional}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{co.vendedores} vendedores</p>
              </div>
            ))}
          </div>
        </div>

        {/* Regionalização */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Regionalização — o lead cai na loja certa</h2>
          </div>
          <div className="space-y-2.5">
            {d.regionais.map(r => (
              <div key={r.loja} className="flex items-start justify-between gap-3 pb-2.5 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                <div className="min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{r.loja}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>{r.regiao}</p>
                  <p className="text-[11px]" style={{ color: 'var(--accent)' }}>{r.distribuicao}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{r.leadsMes}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>leads/mês · {r.vendedores} vend.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Régua de cobrança */}
      <div className="card card-pad">
        <div className="flex items-center gap-2 mb-4">
          <BellRing size={15} style={{ color: 'var(--danger)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Régua de cobrança — o coração da efetividade</h2>
        </div>
        <div className="relative pl-5">
          <div className="absolute left-1.5 top-2 bottom-2 w-0.5" style={{ backgroundColor: 'var(--border)' }} />
          <div className="space-y-3">
            {d.regua.map((r, i) => (
              <div key={i} className="relative flex items-start gap-3">
                <span className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2"
                  style={{ backgroundColor: r.quem === 'Gerente' ? 'var(--danger)' : r.quem === 'Sistema' ? 'var(--accent)' : 'var(--warn)', borderColor: 'var(--bg)' }} />
                <span className="text-xs font-bold tabular-nums w-20 shrink-0" style={{ color: 'var(--text-primary)' }}>{r.minuto}</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                  style={{ backgroundColor: r.quem === 'Gerente' ? 'var(--danger-bg)' : r.quem === 'Sistema' ? 'var(--accent-bg)' : 'var(--warn-bg)', color: r.quem === 'Gerente' ? 'var(--danger)' : r.quem === 'Sistema' ? 'var(--accent)' : 'var(--warn)' }}>
                  {r.quem}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.acao}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cadências */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Cadência por origem do lead</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                {['Origem', 'SLA 1º contato', 'Toques', 'Canal'].map(h => <th key={h} className="py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {d.cadencias.map(ca => (
                <tr key={ca.origem} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{ca.origem}</td>
                  <td className="py-2 font-bold" style={{ color: 'var(--accent)' }}>{ca.sla}</td>
                  <td className="py-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{ca.toques}</td>
                  <td className="py-2" style={{ color: 'var(--text-tertiary)' }}>{ca.canal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Motivos de perda */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={15} style={{ color: 'var(--danger)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Motivos de perda — cada perda alimenta uma frente</h2>
          </div>
          <div className="space-y-2.5">
            {d.motivosPerda.map(m => (
              <div key={m.motivo}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.motivo}</span>
                  <span className="tabular-nums font-semibold" style={{ color: 'var(--text-secondary)' }}>{m.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-0.5" style={{ backgroundColor: 'var(--bg-inset)' }}>
                  <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: 'var(--danger)', opacity: 0.7 }} />
                </div>
                <p className="text-[11px]" style={{ color: 'var(--accent)' }}>→ {m.destino}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Permissões */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Permissões por papel</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-tertiary)' }}>
                {['Papel', 'Vê', 'Edita'].map(h => <th key={h} className="py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {d.permissoes.map(p => (
                <tr key={p.papel} className="border-t align-top" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-2 font-bold whitespace-nowrap" style={{ color: 'var(--accent)' }}>{p.papel}</td>
                  <td className="py-2 pr-3" style={{ color: 'var(--text-secondary)' }}>{p.ve}</td>
                  <td className="py-2" style={{ color: 'var(--text-secondary)' }}>{p.edita}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integrações */}
        <div className="card card-pad">
          <div className="flex items-center gap-2 mb-3">
            <Plug size={15} style={{ color: 'var(--ok)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Integrações ativas</h2>
          </div>
          <div className="space-y-2.5">
            {d.integracoes.map(inte => (
              <div key={inte.nome} className="flex items-start justify-between gap-3 pb-2.5 border-b last:border-0 last:pb-0" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{inte.nome}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{inte.uso}</p>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0" style={{ color: 'var(--ok)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--ok)' }} /> ativo
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad flex items-center gap-3" style={{ backgroundColor: 'var(--accent-bg)' }}>
        <GitBranch size={18} style={{ color: 'var(--accent)' }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <b style={{ color: 'var(--text-primary)' }}>Escalável por desenho:</b> as mesmas regras (régua, regionalização, cadências) são parametrizáveis por grupo — replicar para outra CCY é configurar, não reprogramar.
        </p>
      </div>
    </div>
  )
}

function Antes({ label, antes, depois, invertido }: { label: string; antes: string; depois: string; invertido?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-xs line-through" style={{ color: 'var(--text-tertiary)' }}>{antes}</p>
      <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--ok)' }}>{depois}</p>
    </div>
  )
}
