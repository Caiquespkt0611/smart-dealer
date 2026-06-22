'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Camera, Image as ImageIcon, Loader2, Download, BadgeCheck } from 'lucide-react'
import { getArteCampanha, comModelosComArte } from '@/lib/artes-campanha'

interface Encalhado {
  modelo: string
  estoqueTotal: number
  cobertura: number
  severidade: string
}

interface Campanha {
  headline: string
  legenda: string
  hashtags: string[]
  cta: string
  sugestaoArte: string
}

export function GeradorCampanha({ produtos }: { produtos: Encalhado[] }) {
  const lista = comModelosComArte(produtos)
  const [sel, setSel] = useState(lista[0]?.modelo ?? '')
  const [objetivo, setObjetivo] = useState('Girar estoque parado e atrair leads')
  const [loading, setLoading] = useState(false)
  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)

  const produto = lista.find(p => p.modelo === sel)
  const arte = getArteCampanha(sel)

  async function gerar() {
    setLoading(true); setErro(''); setCampanha(null)
    try {
      const res = await fetch('/api/campanha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelo: sel, objetivo, estoque: produto?.estoqueTotal, cobertura: produto?.cobertura }),
      })
      const data = await res.json()
      if (data.campanha) setCampanha(data.campanha)
      else setErro(data.error ?? 'Não foi possível gerar.')
    } catch {
      setErro('Erro de conexão com a IA.')
    }
    setLoading(false)
  }

  function copiarTudo() {
    if (!campanha) return
    const txt = `${campanha.legenda}\n\n${campanha.hashtags.join(' ')}`
    navigator.clipboard.writeText(txt)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Configuração */}
      <div className="card card-pad space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)' }}>
            <Camera size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Gerador de Post IA</p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Padrão Yamaha · pronto para anúncio</p>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Modelo encalhado</label>
          <select
            value={sel}
            onChange={e => setSel(e.target.value)}
            className="w-full mt-1.5 rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            {lista.map(p => (
              <option key={p.modelo} value={p.modelo}>{p.modelo} — {p.cobertura}d cobertura · {p.estoqueTotal} un</option>
            ))}
          </select>
          {arte && (
            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--ok)' }}>
              <BadgeCheck size={12} /> Arte oficial disponível para este modelo
            </p>
          )}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Objetivo da campanha</label>
          <input
            value={objetivo}
            onChange={e => setObjetivo(e.target.value)}
            className="w-full mt-1.5 rounded-lg px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
        </div>

        <button
          onClick={gerar}
          disabled={loading || !sel}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--yamaha-blue)' }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Gerando…</> : <><Sparkles size={15} /> Gerar post com IA</>}
        </button>
        {erro && <p className="text-xs" style={{ color: 'var(--danger)' }}>{erro}</p>}
      </div>

      {/* Resultado */}
      <div className="card card-pad">
        {!campanha && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10">
            <Sparkles size={24} style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Selecione um modelo e gere<br />um post profissional pronto para patrocinar.</p>
          </div>
        )}
        {loading && (
          <div className="h-full flex flex-col items-center justify-center gap-2 py-10">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>A IA está escrevendo o post…</p>
          </div>
        )}
        {campanha && (
          <div className="space-y-3">
            {arte && (
              <figure className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--ok)' }}>
                    <ImageIcon size={12} /> Arte pronta para publicar
                  </span>
                  <a
                    href={arte.src}
                    download
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                    style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
                  >
                    <Download size={12} /> Baixar arte
                  </a>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={arte.src}
                  alt={`Arte da campanha ${sel}`}
                  className="w-full rounded-xl border"
                  style={{ borderColor: 'var(--border)' }}
                />
                <figcaption className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  Entrada {arte.entrada} · parcelas {arte.parcela} · campanha Seleção Yamaha
                </figcaption>
              </figure>
            )}
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{campanha.headline}</p>
              <button onClick={copiarTudo} className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: copiado ? 'var(--ok-bg)' : 'var(--accent-bg)', color: copiado ? 'var(--ok)' : 'var(--accent)' }}>
                {copiado ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{campanha.legenda}</p>
            <div className="flex flex-wrap gap-1.5">
              {campanha.hashtags.map((h, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--accent)' }}>{h}</span>
              ))}
            </div>
            <div className="pt-2 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>📣 {campanha.cta}</p>
              {campanha.sugestaoArte && (
                <p className="text-[11px] flex items-start gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <ImageIcon size={12} className="mt-0.5 shrink-0" /> {campanha.sugestaoArte}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
