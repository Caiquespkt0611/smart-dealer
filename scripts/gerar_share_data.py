#!/usr/bin/env python3
"""Regenera lib/share-data.ts a partir de scripts/dados/share.json.

Mercado das áreas da Nippon (Amparo + Ouro Fino), meses fechados jan–jul/2026.
Produz o MESMO shape que /market-share e /api/chat já consomem
(trend, segments, cities, competitors, numCompetitorCnpj + KPIs).
Rode depois de extrair_dados.py.
"""
import json
from pathlib import Path
from collections import defaultdict

HERE = Path(__file__).parent
share = json.load(open(HERE / 'dados' / 'share.json'))
cache_path = Path('/Users/caiqueoliveira/Documents/MEUS PROJETOS/_Performance Concessionário/cnpj_cache.json')
cnpj_cache = json.load(open(cache_path)) if cache_path.exists() else {}

MESES = [str(m) for m in range(1, 8)]  # jan–jul fechados
MESES_NOME = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']
NIPPON_RAIZ = '33054346'

tot = lambda r: sum(r['meses'][m] for m in MESES)
pct = lambda a, b: round(100 * a / b, 1) if b else 0.0

total_mercado = sum(tot(r) for r in share)
por_marca = defaultdict(int)
trend_acc = defaultdict(lambda: defaultdict(int))          # mes → marca-bucket
por_seg = defaultdict(lambda: defaultdict(int))            # segmento → marca
por_cidade = defaultdict(lambda: defaultdict(int))         # cidade → marca (+ area)
cidade_area = {}
comp = defaultdict(lambda: {'qtd': 0, 'marcas': defaultdict(int), 'cidades': defaultdict(int)})
nippon_qtd = 0

for r in share:
    q = tot(r)
    por_marca[r['marca']] += q
    for i, m in enumerate(MESES):
        v = r['meses'][m]
        trend_acc[i]['total'] += v
        if r['marca'] == 'Yamaha':
            trend_acc[i]['yamaha'] += v
        elif r['marca'] == 'Honda':
            trend_acc[i]['honda'] += v
        else:
            trend_acc[i]['outros'] += v
    por_seg[r['segmento']][r['marca']] += q
    por_cidade[r['cidade']][r['marca']] += q
    cidade_area[r['cidade']] = r['area']
    if r['cnpj'][:8] == NIPPON_RAIZ:
        nippon_qtd += q
    else:
        comp[r['cnpj']]['qtd'] += q
        comp[r['cnpj']]['marcas'][r['marca']] += q
        comp[r['cnpj']]['cidades'][r['cidade']] += q

yam, hon = por_marca.get('Yamaha', 0), por_marca.get('Honda', 0)

brand_share = [{'marca': m, 'qtd': q, 'pct': pct(q, total_mercado)}
               for m, q in sorted(por_marca.items(), key=lambda kv: -kv[1])]

trend = []
for i, nome in enumerate(MESES_NOME):
    t = trend_acc[i]
    trend.append({'mes': nome, 'yamaha': t['yamaha'], 'honda': t['honda'],
                  'outros': t['outros'], 'total': t['total'],
                  'shareYamaha': pct(t['yamaha'], t['total'])})

segments = []
for seg, marcas in sorted(por_seg.items(), key=lambda kv: -sum(kv[1].values())):
    t = sum(marcas.values())
    y, h = marcas.get('Yamaha', 0), marcas.get('Honda', 0)
    segments.append({'segmento': seg, 'total': t, 'yamaha': y, 'honda': h,
                     'shareYamaha': pct(y, t), 'shareHonda': pct(h, t), 'gap': h - y})

cities = []
for cid, marcas in sorted(por_cidade.items(), key=lambda kv: -sum(kv[1].values())):
    t = sum(marcas.values())
    y = marcas.get('Yamaha', 0)
    cities.append({'cidade': cid, 'area': cidade_area[cid], 'total': t,
                   'yamaha': y, 'shareYamaha': pct(y, t)})

def nome_cnpj(cnpj):
    hit = cnpj_cache.get(cnpj) or cnpj_cache.get(cnpj[:8])
    return hit.get('nome') if hit else None

competitors = []
for cnpj, info in sorted(comp.items(), key=lambda kv: -kv[1]['qtd']):
    marca = max(info['marcas'], key=info['marcas'].get)
    cidade = max(info['cidades'], key=info['cidades'].get)
    row = {'cnpj': cnpj, 'marca': marca, 'qtd': info['qtd'], 'cidade': cidade}
    n = nome_cnpj(cnpj)
    if n:
        row['nome'] = n
    competitors.append(row)

data = {
    'referencia': 'Jan–Jul 2026',
    'ultimoMesFechado': 7,
    'totalMercado2026': total_mercado,
    'yamahaShare': pct(yam, total_mercado), 'yamahaQtd': yam,
    'hondaShare': pct(hon, total_mercado), 'hondaQtd': hon,
    'nipponQtd': nippon_qtd,
    'nipponShareDoMercado': pct(nippon_qtd, total_mercado),
    'nipponShareDaYamaha': pct(nippon_qtd, yam),
    'areas': ['Amparo', 'Ouro Fino'],
    'brandShare': brand_share,
    'trend': trend,
    'segments': segments,
    'cities': cities,
    'competitors': competitors,
    'numCompetitorCnpj': len(comp),
}

out = HERE.parent / 'lib' / 'share-data.ts'
ts = ('// AUTO-GERADO por scripts/gerar_share_data.py a partir de DADOS_DE_EMPLACAMENTO.xlsx\n'
      '// Mercado das áreas da Nippon (Amparo + Ouro Fino) · Jan–Jul/2026 fechados. Não editar manualmente.\n'
      f'export const shareData = {json.dumps(data, ensure_ascii=False, indent=2)} as const\n')
out.write_text(ts)
print(f'{out.name}: mercado {total_mercado} · Yamaha {yam} ({pct(yam, total_mercado)}%) · '
      f'Honda {hon} ({pct(hon, total_mercado)}%) · Nippon {nippon_qtd} ({pct(nippon_qtd, yam)}% da Yamaha)')
print('competidores:', len(comp), '· nomeados:', sum(1 for c in competitors if 'nome' in c))
print('trend jul:', trend[-1])
