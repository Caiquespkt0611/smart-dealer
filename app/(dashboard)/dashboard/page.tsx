export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-[#9CA3AF]">Smart Dealer · Nippon Motos — Fase 2 em construção</p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Varejo Junho/2026', valor: '42 motos', sub: 'Até dia 14', status: 'atencao' },
          { label: 'Projeção vs Meta', valor: '65.6%', sub: 'Proj: 104 | Meta: 160', status: 'atencao' },
          { label: 'NPS Vendas', valor: '94.5', sub: 'Meta: 93 ✓', status: 'ok' },
        ].map(card => (
          <div key={card.label} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
            <div className="text-xs uppercase tracking-wide text-[#9CA3AF] mb-2">{card.label}</div>
            <div className="text-2xl font-bold text-white tabular-nums">{card.valor}</div>
            <div className="text-xs text-[#6B7280] mt-1">{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
