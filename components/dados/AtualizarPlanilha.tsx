'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Upload, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

type Estado =
  | { tipo: 'parado' }
  | { tipo: 'enviando'; nome: string }
  | { tipo: 'ok'; texto: string }
  | { tipo: 'erro'; texto: string }

export function AtualizarPlanilha({ temPlanilha }: { temPlanilha: boolean }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [estado, setEstado] = useState<Estado>({ tipo: 'parado' })

  async function enviar(arquivo: File) {
    if (!confirm(`Substituir a planilha atual por "${arquivo.name}"?`)) return
    setEstado({ tipo: 'enviando', nome: arquivo.name })
    const form = new FormData()
    form.append('arquivo', arquivo)
    try {
      const resp = await fetch('/api/planilha', { method: 'POST', body: form })
      const json = await resp.json().catch(() => ({}))
      if (!resp.ok) {
        setEstado({ tipo: 'erro', texto: json.erro ?? `Falha no envio (erro ${resp.status}).` })
        return
      }
      setEstado({
        tipo: 'ok',
        texto: `Planilha atualizada: ${json.linhasVarejo} linhas de varejo e ${json.linhasEstoque} de estoque.`,
      })
      router.refresh()
    } catch {
      setEstado({ tipo: 'erro', texto: 'Sem conexão. Confira a internet e tente de novo.' })
    } finally {
      if (input.current) input.current.value = ''
    }
  }

  const enviando = estado.tipo === 'enviando'

  return (
    <div className="card card-pad space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={temPlanilha ? '/api/planilha?baixar=1' : undefined}
          aria-disabled={!temPlanilha}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold"
          style={{
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            opacity: temPlanilha ? 1 : 0.5,
            pointerEvents: temPlanilha ? 'auto' : 'none',
          }}
        >
          <Download size={18} /> Baixar planilha atual
        </a>
        <button
          type="button"
          disabled={enviando}
          onClick={() => input.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--accent)' }}
        >
          {enviando ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
          {enviando ? 'Enviando e atualizando…' : 'Enviar planilha atualizada'}
        </button>
        <input
          ref={input}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) enviar(f) }}
        />
      </div>

      {estado.tipo === 'enviando' && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Conferindo “{estado.nome}” e atualizando os números. Pode levar até 1 minuto, não feche a tela.
        </p>
      )}
      {estado.tipo === 'ok' && (
        <p className="text-sm flex items-start gap-2 rounded-lg p-3"
          style={{ color: 'var(--ok)', background: 'var(--ok-bg)', border: '1px solid var(--ok-border)' }}>
          <CheckCircle2 size={18} className="shrink-0" /> {estado.texto}
        </p>
      )}
      {estado.tipo === 'erro' && (
        <p className="text-sm flex items-start gap-2 rounded-lg p-3"
          style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)' }}>
          <AlertTriangle size={18} className="shrink-0" /> {estado.texto}
        </p>
      )}
    </div>
  )
}
