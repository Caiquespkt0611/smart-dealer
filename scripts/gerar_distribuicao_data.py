#!/usr/bin/env python3
"""Regenera lib/distribuicao-data.ts a partir do DADOS_DE_EMPLACAMENTO.xlsx.

Simulação de distribuição de estoque entre os 4 pontos de venda da Nippon na
área Amparo (Bragança Paulista, Atibaia, Amparo, Pedreira). Hoje toda moto
entra pela loja de Bragança; o emplacamento por cidade mostra onde a demanda
realmente está e sugere como repartir o estoque entre os pontos.

Cada cidade da área operacional Amparo é atribuída ao ponto de venda mais
próximo (área de influência). Extrema (área Ouro Fino) fica fora da simulação.
Rode depois de atualizar a planilha canônica; mesmo fluxo dos demais gerar_*.py.
"""
import json
from collections import defaultdict
from pathlib import Path

import openpyxl

SRC = Path('/Users/caiqueoliveira/Documents/MEUS PROJETOS/_Performance Concessionário/DADOS_DE_EMPLACAMENTO.xlsx')
OUT = Path(__file__).parent.parent / 'lib' / 'distribuicao-data.ts'

NIPPON_RAIZ = '33054346'
MES_FECHADO = 7  # jan–jul fechados; agosto entra à parte como parcial

# Área de influência de cada ponto (todas as 18 cidades da área Amparo cobertas)
PONTOS = {
    'braganca': {
        'nome': 'Bragança Paulista',
        'recebe': True,
        'cidades': ['BRAGANCA PAULISTA', 'VARGEM', 'PINHALZINHO', 'PEDRA BELA', 'TUIUTI', 'JOANOPOLIS'],
    },
    'atibaia': {
        'nome': 'Atibaia',
        'recebe': False,
        'cidades': ['ATIBAIA', 'JARINU', 'PIRACAIA', 'BOM JESUS DOS PERDOES', 'NAZARE PAULISTA'],
    },
    'amparo': {
        'nome': 'Amparo',
        'recebe': False,
        'cidades': ['AMPARO', 'SERRA NEGRA', 'LINDOIA', 'AGUAS DE LINDOIA', 'MONTE ALEGRE DO SUL', 'SOCORRO'],
    },
    'pedreira': {
        'nome': 'Pedreira',
        'recebe': False,
        'cidades': ['PEDREIRA'],
    },
}
CIDADE_PONTO = {c: pid for pid, p in PONTOS.items() for c in p['cidades']}

wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
ws = wb['EMPLACAMENTO']
rows = list(ws.iter_rows(values_only=True))
hdr = next(i for i, r in enumerate(rows) if r and str(r[0] or '').strip() == 'CNPJ')

acc = {pid: {'mercado': 0, 'yamaha': 0, 'honda': 0, 'nippon': 0, 'agoParcial': 0,
             'seg': defaultdict(lambda: {'mercado': 0, 'yamaha': 0})}
       for pid in PONTOS}
cidades_fora = set()

for r in rows[hdr + 1:]:
    if not r or not r[0]:
        continue
    if str(r[2] or '').strip() != 'Amparo':
        continue
    cidade = str(r[3] or '').strip().upper()
    pid = CIDADE_PONTO.get(cidade)
    if not pid:
        cidades_fora.add(cidade)
        continue
    marca = str(r[1] or '').strip()
    seg = str(r[4] or '').strip()
    nippon = str(r[0]).strip()[:8] == NIPPON_RAIZ
    a = acc[pid]
    for m in range(1, 9):
        q = r[4 + m]
        q = int(float(q)) if q not in (None, '') else 0
        if not q:
            continue
        if m <= MES_FECHADO:
            a['mercado'] += q
            a['seg'][seg]['mercado'] += q
            if marca == 'Yamaha':
                a['yamaha'] += q
                a['seg'][seg]['yamaha'] += q
            elif marca == 'Honda':
                a['honda'] += q
            if nippon:
                a['nippon'] += q
        else:
            a['agoParcial'] += q

if cidades_fora:
    raise SystemExit(f'Cidades da área Amparo sem ponto atribuído: {sorted(cidades_fora)}')

segmentos = sorted({s for a in acc.values() for s in a['seg']},
                   key=lambda s: -sum(a['seg'][s]['mercado'] for a in acc.values()))

pontos_out = []
for pid, p in PONTOS.items():
    a = acc[pid]
    pontos_out.append({
        'id': pid,
        'nome': p['nome'],
        'recebe': p['recebe'],
        'cidades': [c.title() for c in p['cidades']],
        'mercado': a['mercado'],
        'yamaha': a['yamaha'],
        'honda': a['honda'],
        'nippon': a['nippon'],
        'agoParcial': a['agoParcial'],
        'porSegmento': {s: dict(v) for s, v in a['seg'].items()},
    })

data = {
    'referencia': 'Jan–Jul/2026 (meses fechados)',
    'area': 'Amparo',
    'segmentos': segmentos,
    'pontos': pontos_out,
}

ts = (
    '// AUTO-GERADO por scripts/gerar_distribuicao_data.py — NÃO EDITAR À MÃO.\n'
    '// Emplacamento por área de influência dos 4 pontos de venda (área Amparo).\n'
    f'export const distribuicaoData = {json.dumps(data, ensure_ascii=False, indent=2)} as const\n'
    '\n'
    'export type PontoDistribuicao = (typeof distribuicaoData)[\'pontos\'][number]\n'
)
OUT.write_text(ts, encoding='utf-8')

tot = sum(p['mercado'] for p in pontos_out)
print(f'distribuicao-data.ts: mercado 4 pontos {tot}')
for p in pontos_out:
    print(f"  {p['nome']:20s} mercado {p['mercado']:5d} ({100*p['mercado']/tot:.1f}%) · "
          f"Yamaha {p['yamaha']:4d} · Nippon {p['nippon']:4d} · ago parcial {p['agoParcial']}")
