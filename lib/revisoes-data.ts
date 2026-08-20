// ── Pós-Vendas · Painel de Revisões R1–R4 (Periodic Inspection) ─────────────
// CENÁRIO DEMONSTRATIVO no formato do painel oficial Yamaha (real × target
// diário/mensal + YTD + processos pendentes). Mostra o funil de retenção:
// R1 (1.000 km) → R4, onde cada degrau perdido é um cliente saindo da rede.

export interface RevisaoNivel {
  nivel: 'R1' | 'R2' | 'R3' | 'R4'
  km: string
  real: number            // agosto até agora
  targetDiario: number    // acumulado esperado até hoje
  targetMensal: number
  ytdReal: number
  ytdTarget: number
  pendentes: number       // agendáveis identificados pela régua
}

export const revisoesData = {
  grupo: 'Nippon Motos',
  referencia: 'Agosto/2026 (dia 20) · YTD Jan–Ago',
  fonte: 'Formato Periodic Inspection Yamaha — dados de demonstração',

  niveis: [
    { nivel: 'R1', km: '1.000 km',  real: 46, targetDiario: 52, targetMensal: 78, ytdReal: 318, ytdTarget: 361, pendentes: 26 },
    { nivel: 'R2', km: '5.000 km',  real: 21, targetDiario: 29, targetMensal: 44, ytdReal: 172, ytdTarget: 236, pendentes: 18 },
    { nivel: 'R3', km: '10.000 km', real: 9,  targetDiario: 14, targetMensal: 21, ytdReal: 74,  ytdTarget: 129, pendentes: 9 },
    { nivel: 'R4', km: '20.000 km', real: 5,  targetDiario: 8,  targetMensal: 12, ytdReal: 41,  ytdTarget: 78,  pendentes: 6 },
  ] as RevisaoNivel[],

  ticketMedioRevisao: 289,     // R$ por revisão (peças + MO)
  leitura: 'A cada degrau (R1→R4) o cliente some da oficina: hoje só 52% de quem faz a R1 volta para a R2. A régua automática ataca exatamente essa evasão — cada revisão recuperada alimenta a absorção do K2.',
}

export function calcularRevisoes() {
  const d = revisoesData
  const realMes = d.niveis.reduce((s, n) => s + n.real, 0)
  const targetMes = d.niveis.reduce((s, n) => s + n.targetMensal, 0)
  const targetAteHoje = d.niveis.reduce((s, n) => s + n.targetDiario, 0)
  const ytdReal = d.niveis.reduce((s, n) => s + n.ytdReal, 0)
  const ytdTarget = d.niveis.reduce((s, n) => s + n.ytdTarget, 0)
  const pendentes = d.niveis.reduce((s, n) => s + n.pendentes, 0)
  const atingimento = (realMes / targetMes) * 100
  const receitaPendente = pendentes * d.ticketMedioRevisao
  return { realMes, targetMes, targetAteHoje, ytdReal, ytdTarget, pendentes, atingimento, receitaPendente }
}
