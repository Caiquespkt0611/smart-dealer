'use client'

// Conexão do WhatsApp da loja: pareia um número por QR (mesmo fluxo do CRM
// InnovAdapt — a sessão vive no gateway, com fila anti-ban). Com o número
// conectado, o "Chamar para Revisão" do Pós-Vendas dispara a mensagem REAL
// pelo número da loja, sem abrir o WhatsApp de quem clicou.
import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { CheckCircle2, MessageCircle, QrCode, RefreshCw, Smartphone, Wifi } from 'lucide-react'

interface Unidade {
  id: string
  nome: string
  canalSessao: { status: string; numero: string | null } | null
}

interface StatusCanal {
  status: string
  qr: string | null
}

export default function ConexaoPage() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [configurado, setConfigurado] = useState<boolean | null>(null)
  const [selecionada, setSelecionada] = useState<string>('')
  const [vivo, setVivo] = useState<StatusCanal | null>(null)
  const [pareando, setPareando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/whatsapp/unidades')
      .then(r => r.json())
      .then(d => {
        setConfigurado(Boolean(d.configurado))
        const lista: Unidade[] = d.unidades ?? []
        setUnidades(lista)
        // pré-seleciona a primeira unidade sem sessão conectada (slot livre)
        const livre = lista.find(u => u.canalSessao?.status !== 'CONECTADO')
        setSelecionada((livre ?? lista[0])?.id ?? '')
      })
      .catch(() => setConfigurado(false))
  }, [])

  const pararPoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
  }, [])

  const acompanhar = useCallback((unidadeId: string) => {
    pararPoll()
    pollRef.current = setInterval(async () => {
      try {
        const s: StatusCanal = await fetch(`/api/whatsapp/status?unidadeId=${unidadeId}`).then(r => r.json())
        setVivo(s)
        if (s.status === 'CONECTADO') {
          setPareando(false)
          pararPoll()
        }
      } catch { /* mantém o poll */ }
    }, 2500)
  }, [pararPoll])

  useEffect(() => () => pararPoll(), [pararPoll])

  async function parear(doZero: boolean) {
    if (!selecionada) return
    setErro(null)
    setPareando(true)
    setVivo(null)
    try {
      const r = await fetch('/api/whatsapp/parear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unidadeId: selecionada, doZero }),
      })
      if (!r.ok) throw new Error((await r.json()).erro ?? `HTTP ${r.status}`)
      acompanhar(selecionada)
    } catch (e) {
      setPareando(false)
      setErro(String(e))
    }
  }

  const unidade = unidades.find(u => u.id === selecionada)
  const conectado = vivo?.status === 'CONECTADO' || (!pareando && unidade?.canalSessao?.status === 'CONECTADO')
  const qr = pareando ? vivo?.qr ?? null : null

  return (
    <div className="space-y-6 pb-24 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conexão WhatsApp</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Pareie o número da loja por QR — os disparos do Pós-Vendas passam a sair do WhatsApp da concessionária
        </p>
      </div>

      {configurado === false && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-600">
          O gateway de WhatsApp ainda não está configurado neste ambiente
          (variáveis <code className="text-xs">ANDRECAR_API_URL / ANDRECAR_EMAIL / ANDRECAR_SENHA</code>).
          Enquanto isso, o botão de revisão usa o WhatsApp de quem clica (wa.me).
        </div>
      )}

      {configurado && (
        <>
          {/* Seleção da linha */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
              <Smartphone size={14} /> Linha da loja
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selecionada}
                onChange={e => { setSelecionada(e.target.value); setVivo(null); setPareando(false); pararPoll() }}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
              >
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nome} — {u.canalSessao?.status === 'CONECTADO' ? `conectado (${u.canalSessao.numero ?? 'número ativo'})` : 'sem número pareado'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => parear(false)}
                disabled={pareando && !qr}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: 'var(--yamaha-blue, #003087)' }}
              >
                <QrCode size={15} />
                {pareando && !qr ? 'Gerando QR…' : 'Parear WhatsApp'}
              </button>
              {unidade?.canalSessao?.status === 'CONECTADO' && (
                <button
                  onClick={() => { if (confirm('Você vai escanear um QR novo no celular. Continuar?')) parear(true) }}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 border border-slate-300 hover:bg-slate-50"
                  title="Apaga a sessão salva e gera um QR novo"
                >
                  <RefreshCw size={13} /> Re-parear do zero
                </button>
              )}
            </div>
            {erro && <p className="text-xs text-[#EF4444]">{erro}</p>}
          </div>

          {/* QR */}
          {pareando && qr && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
              {/* QR exige fundo branco de verdade */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <QRCode value={qr} size={220} />
              </div>
              <div className="text-sm text-slate-600 space-y-2">
                <p className="font-semibold text-slate-900">Escaneie com o celular da loja:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Abra o WhatsApp no celular do número da loja</li>
                  <li>Configurações → <span className="font-medium">Aparelhos conectados</span></li>
                  <li>Toque em <span className="font-medium">Conectar aparelho</span> e aponte para o QR</li>
                </ol>
                <p className="text-xs text-slate-500">O QR se renova sozinho a cada ~40s — a tela acompanha.</p>
              </div>
            </div>
          )}

          {/* Conectado */}
          {conectado && !pareando && (
            <div className="rounded-xl p-5 flex items-start gap-3" style={{ backgroundColor: 'var(--ok-bg, #10B98115)', border: '1px solid var(--ok-border, #10B98140)' }}>
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" style={{ color: 'var(--ok, #10B981)' }} />
              <div className="text-sm text-slate-700 space-y-1">
                <p className="font-semibold" style={{ color: 'var(--ok, #10B981)' }}>
                  WhatsApp conectado <Wifi size={13} className="inline ml-1" />
                </p>
                <p>
                  Agora o <span className="font-medium">Chamar para Revisão</span> do Pós-Vendas envia a mensagem
                  direto pelo número da loja — em segundo plano, com fila anti-bloqueio.
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MessageCircle size={12} />
                  Para o primeiro disparo a um cliente novo, ele precisa ter mandado uma mensagem para este número uma vez.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
