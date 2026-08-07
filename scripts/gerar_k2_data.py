#!/usr/bin/env python3
"""Gera lib/k2-data.ts a partir dos DRE Yamaha BMI mensais (aba 'Data').

Fonte: smart-dealer/_NOVAS MELHORIAS/K2/NIPPON - *.xlsx
K2 = Taxa de Absorção do pós-vendas: MC (Peças + Serviços) ÷ despesas operacionais.
Referências Yamaha: Taxa de Absorção > 65% · Ponto de Equilíbrio < 50% das vendas 0km.
"""
import json
from pathlib import Path
import openpyxl

K2_DIR = Path(__file__).parent.parent / '_NOVAS MELHORIAS' / 'K2'
OUT = Path(__file__).parent.parent / 'lib' / 'k2-data.ts'

CONTAS = {
    'A1400.1': 'unidadesNovas',       # TOTAL NEW VENDAS - MOTOS - UNIDADES
    'A1400.5': 'receitaNovas',        # venda líquida novos
    'A3500.1': 'mcNovos',             # margem de contribuição novos
    'C1300.4': 'fatPecas',            # TOTAL RECEITA DE PEÇAS E ACESS. - VENDA LÍQUIDA
    'C3500.1': 'mcPecas',             # MC peças
    'D1090.1': 'fatServicos',         # TOTAL RECEITA DE VENDA DE SERVIÇOS (mão de obra)
    'D3500.1': 'mcServicos',          # MC serviços
    'F4090.7': 'despPessoal',         # despesas com pessoal (A)
    'F4170.7': 'despEstrutura',       # estrutura/imóveis (B)
    'F4370.7': 'despGerais',          # gerais (C)
    'F4380.7': 'despOperacionais',    # TOTAL A+B+C
    'F7090.4': 'funcPecas',
    'F7090.5': 'funcServicos',
    'F7090.7': 'funcTotal',
}

meses = []
for arq in sorted(K2_DIR.glob('NIPPON*.xlsx')):
    wb = openpyxl.load_workbook(arq, read_only=True, data_only=True)
    ws = wb['Data']
    rows = list(ws.iter_rows(values_only=True))
    # 'End Month / End Year' na aba Data (a posição da coluna varia entre exports)
    mes = ano = 0
    for r in rows[:15]:
        if not r:
            continue
        for j, c in enumerate(r):
            if str(c or '').startswith('End Month'):
                try:
                    mes, ano = int(r[j + 1]), int(r[j + 2])
                except (TypeError, ValueError, IndexError):
                    pass
                break
        if mes:
            break
    d = {'mes': mes, 'ano': ano, 'arquivo': arq.name}
    for r in rows[13:]:
        if not r or not r[1]:
            continue
        chave = CONTAS.get(str(r[1]))
        if chave:
            v = r[3]
            d[chave] = round(float(v), 2) if isinstance(v, (int, float)) else 0.0
    if mes:
        meses.append(d)
    wb.close()

meses.sort(key=lambda m: (m['ano'], m['mes']))

# métricas derivadas
for m in meses:
    mc_pos = m.get('mcPecas', 0) + m.get('mcServicos', 0)
    desp = m.get('despOperacionais', 0)
    un = m.get('unidadesNovas', 0)
    mc_un = (m.get('mcNovos', 0) / un) if un else 0
    m['mcPosVendas'] = round(mc_pos, 2)
    m['taxaAbsorcao'] = round(100 * mc_pos / desp, 1) if desp else 0
    # PE: motos necessárias p/ cobrir o que o pós-vendas NÃO cobre das despesas
    pe_un = ((desp - mc_pos) / mc_un) if mc_un > 0 else 0
    m['peUnidades'] = round(max(pe_un, 0), 1)
    m['pePctVendas'] = round(100 * pe_un / un, 1) if un else 0

data = {
    'fonte': 'DRE Yamaha BMI mensal (aba Data) — arquivos NIPPON em _NOVAS MELHORIAS/K2',
    'referencias': {'taxaAbsorcaoMin': 65, 'pePctVendasMax': 50},
    'observacoes': [
        'Passagens (nº de O.S.) não constam no DRE — pendente de outra fonte.',
        'Taxa de Absorção = MC (Peças + Serviços) ÷ Total de Despesas Operacionais (A+B+C).',
        'PE = (Despesas Operacionais − MC Pós-Vendas) ÷ MC média por moto 0km.',
    ],
    'meses': meses,
}

ts = ('// AUTO-GERADO por scripts/gerar_k2_data.py a partir dos DRE mensais.\n'
      '// Não editar manualmente — re-rodar o script quando chegar DRE novo.\n'
      f'export const k2Data = {json.dumps(data, ensure_ascii=False, indent=2)} as const\n')
OUT.write_text(ts)

for m in meses:
    print(f"{m['mes']:02d}/{m['ano']}  absorção {m['taxaAbsorcao']:5.1f}%  "
          f"MC pós {m['mcPosVendas']:>10,.0f}  desp {m.get('despOperacionais', 0):>10,.0f}  "
          f"PE {m['peUnidades']:>5.1f} un ({m['pePctVendas']:.1f}% de {m.get('unidadesNovas', 0):.0f})")
