// @ts-nocheck
// Framework de geração de .pptx portado de _Performance Concessionário/src/pptx.js
// (medição de texto Helvetica, formas, tabelas, peças do deck, PDCA com cara de
// Excel e o escritor do arquivo). O conteúdo dos slides do Smart Dealer mora em
// lib/deck-performance.ts — aqui são só os primitivos, mantidos fiéis ao original.
import { zipar } from '@/lib/xlsx-bonito'

/* helpers numéricos/rotulares que no projeto original moram no app.js */
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const fmt = (v, casas) => Number(v ?? 0).toLocaleString('pt-BR', {
  minimumFractionDigits: casas ?? 0, maximumFractionDigits: casas ?? (Math.abs(v) < 10 && v % 1 !== 0 ? 1 : 0),
})

/* ═══════════════ O DECK DA CONVERSA (.pptx) ════════════════════════════
   O terceiro entregável. O slide de uma página é para o consultor ler, os
   cards são para o titular rolar no WhatsApp — e este é para a CALL: o
   consultor abre o PowerPoint no Teams e conduz o dono da concessionária pela
   história do mês, na ordem em que ela convence.

   Nasce editável de propósito. Um deck de imagens não deixa ajustar uma frase
   dez minutos antes da ligação, e é exatamente isso que se faz antes de uma
   conversa com o dono. Texto, tabelas e barras aqui são objetos do PowerPoint.

   Um .pptx é um ZIP de XMLs, igual ao .xlsx — então o escritor reaproveita o
   `zipar()` do xlsx-bonito.js e não traz dependência nenhuma. Nada é baixado,
   nada sai da máquina.

   O deck se adapta ao que está carregado:
     · planilha MENSAL  → a história do mês fechado (régua, modelo, estoque, praça)
     · planilha DIÁRIA  → o capítulo "onde você está agora" (ritmo e carta)
     · as duas juntas    → a narrativa inteira, que é o caso da call semanal
   ═════════════════════════════════════════════════════════════════════════ */

/* ── medida ────────────────────────────────────────────────────────────
   Tudo é escrito em PONTOS sobre uma tela de 960×540 (16:9), que é a mesma
   proporção do PowerPoint widescreen. O EMU só aparece na hora de serializar. */
const PPT_W = 960, PPT_H = 540;
const emu = pt => Math.round(pt * 12700);

/* margens e trilhos: um slide de call se lê a 3 metros, então a caixa útil é
   generosa e o corpo nunca desce abaixo de 492 */
const MG = 54, COL = PPT_W - MG*2, TOPO_Y = 92, BASE_Y = 492;

/* ── paleta: a mesma do painel, para o deck não parecer outro produto ─── */
const C = {
  ink:'0B0B0B', ink2:'52514E', muted:'898781',
  s1:'2A78D6', s2:'EB6834',
  bom:'4B9B3F', atencao:'D98A0B', critico:'D64545',
  bgBom:'EDF5E8', bgAtencao:'FDF3E3', bgCritico:'FBEAEA', bgInfo:'E8EEF9',
  surf:'F7F7F5', borda:'E1E0D9', branco:'FFFFFF',
  /* as cores exatas do Plano de Ação em Excel — o PDCA no slide é o mesmo
     documento, então não pode ter outra identidade (ver xlsx-bonito.js) */
  pdcaAzul:'1F3864', pdcaClaro:'D9E2F3', pdcaLinha:'BFBFBF',
  pdcaAltaBg:'FBE9E9', pdcaAltaTx:'9C0006',
  pdcaMediaBg:'FDF3DE', pdcaMediaTx:'9C6500',
  pdcaBaixaBg:'F2F2F2', pdcaBaixaTx:'3F3F3F',
};
const CST = {bom:C.bom, atencao:C.atencao, critico:C.critico};
const CSTBG = {bom:C.bgBom, atencao:C.bgAtencao, critico:C.bgCritico};

/* o xmlEsc do xlsx troca \n por &#10;, que no PowerPoint vira caractere solto
   em vez de quebra — aqui a quebra vira parágrafo, então o escape é outro */
const esx = s => String(s ?? '')
  .replace(/[\u00A0\u202F]/g, ' ')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');

/* tira o HTML que as frases do painel carregam (<b>, <i>): no slide o negrito
   é atributo do run, não marcação dentro do texto */
const semTags = s => String(s ?? '')
  .replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')
  .replace(/\s+/g,' ').trim();

/* ═══════════ 1. MEDIR O TEXTO ════════════════════════════════════════
   A primeira versão deste arquivo posicionava tudo com altura chutada, e no
   PowerPoint o texto mais longo que a caixa transbordava por cima do bloco de
   baixo. Não dá para acertar isso no olho: ou se mede, ou se sobrepõe.

   As larguras abaixo são as reais da fonte, extraídas do Calibri e do Arial e
   ficando com a MAIOR das duas por caractere. Assim a conta vale para a fonte
   que a gente pede e para a que aparece se a máquina não tiver Calibri — e
   errar para mais só sobra espaço, nunca falta.                            */

const LARG   = {" ": 278, "!": 326, "\"": 401, "#": 556, "$": 556, "%": 889, "&": 682, "'": 221, "(": 333, ")": 333, "*": 498, "+": 584, ",": 278, "-": 333, ".": 278, "/": 386, "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556, "8": 556, "9": 556, ":": 278, ";": 278, "<": 584, "=": 584, ">": 584, "?": 556, "@": 1015, "A": 667, "B": 667, "C": 722, "D": 722, "E": 667, "F": 611, "G": 778, "H": 722, "I": 278, "J": 500, "K": 667, "L": 556, "M": 855, "N": 722, "O": 778, "P": 667, "Q": 778, "R": 722, "S": 667, "T": 611, "U": 722, "V": 667, "W": 944, "X": 667, "Y": 667, "Z": 611, "[": 307, "\\": 386, "]": 307, "^": 498, "_": 556, "`": 333, "a": 556, "b": 556, "c": 500, "d": 556, "e": 556, "f": 305, "g": 556, "h": 556, "i": 230, "j": 239, "k": 500, "l": 230, "m": 833, "n": 556, "o": 556, "p": 556, "q": 556, "r": 349, "s": 500, "t": 335, "u": 556, "v": 500, "w": 722, "x": 500, "y": 500, "z": 500, "{": 334, "|": 460, "}": 334, "~": 584, "\u00e1": 556, "\u00e0": 556, "\u00e2": 556, "\u00e3": 556, "\u00e4": 556, "\u00e9": 556, "\u00e8": 556, "\u00ea": 556, "\u00eb": 556, "\u00ed": 278, "\u00ec": 278, "\u00ee": 278, "\u00ef": 278, "\u00f3": 556, "\u00f2": 556, "\u00f4": 556, "\u00f5": 556, "\u00f6": 556, "\u00fa": 556, "\u00f9": 556, "\u00fb": 556, "\u00fc": 556, "\u00e7": 500, "\u00f1": 556, "\u00c1": 667, "\u00c0": 667, "\u00c2": 667, "\u00c3": 667, "\u00c4": 667, "\u00c9": 667, "\u00c8": 667, "\u00ca": 667, "\u00cb": 667, "\u00cd": 278, "\u00cc": 278, "\u00ce": 278, "\u00cf": 278, "\u00d3": 778, "\u00d2": 778, "\u00d4": 778, "\u00d5": 778, "\u00d6": 778, "\u00da": 722, "\u00d9": 722, "\u00db": 722, "\u00dc": 722, "\u00c7": 722, "\u00d1": 722, "\u2212": 584, "\u2013": 556, "\u2014": 1000, "\u00b7": 333, "\u00d7": 584, "\u00b0": 400, "\u00ba": 422, "\u00aa": 402, "\u00ab": 556, "\u00bb": 556, "\u201c": 418, "\u201d": 418, "\u2018": 250, "\u2019": 250, "\u2026": 1000, "\u00a7": 556, "\u2022": 498};
const LARG_B = {" ": 278, "!": 333, "\"": 474, "#": 556, "$": 556, "%": 889, "&": 722, "'": 238, "(": 333, ")": 333, "*": 498, "+": 584, ",": 278, "-": 333, ".": 278, "/": 430, "0": 556, "1": 556, "2": 556, "3": 556, "4": 556, "5": 556, "6": 556, "7": 556, "8": 556, "9": 556, ":": 333, ";": 333, "<": 584, "=": 584, ">": 584, "?": 611, "@": 975, "A": 722, "B": 722, "C": 722, "D": 722, "E": 667, "F": 611, "G": 778, "H": 722, "I": 278, "J": 556, "K": 722, "L": 611, "M": 874, "N": 722, "O": 778, "P": 667, "Q": 778, "R": 722, "S": 667, "T": 611, "U": 722, "V": 667, "W": 944, "X": 667, "Y": 667, "Z": 611, "[": 333, "\\": 430, "]": 333, "^": 584, "_": 556, "`": 333, "a": 556, "b": 611, "c": 556, "d": 611, "e": 556, "f": 333, "g": 611, "h": 611, "i": 278, "j": 278, "k": 556, "l": 278, "m": 889, "n": 611, "o": 611, "p": 611, "q": 611, "r": 389, "s": 556, "t": 347, "u": 611, "v": 556, "w": 778, "x": 556, "y": 556, "z": 500, "{": 389, "|": 475, "}": 389, "~": 584, "\u00e1": 556, "\u00e0": 556, "\u00e2": 556, "\u00e3": 556, "\u00e4": 556, "\u00e9": 556, "\u00e8": 556, "\u00ea": 556, "\u00eb": 556, "\u00ed": 278, "\u00ec": 278, "\u00ee": 278, "\u00ef": 278, "\u00f3": 611, "\u00f2": 611, "\u00f4": 611, "\u00f5": 611, "\u00f6": 611, "\u00fa": 611, "\u00f9": 611, "\u00fb": 611, "\u00fc": 611, "\u00e7": 556, "\u00f1": 611, "\u00c1": 722, "\u00c0": 722, "\u00c2": 722, "\u00c3": 722, "\u00c4": 722, "\u00c9": 667, "\u00c8": 667, "\u00ca": 667, "\u00cb": 667, "\u00cd": 278, "\u00cc": 278, "\u00ce": 278, "\u00cf": 278, "\u00d3": 778, "\u00d2": 778, "\u00d4": 778, "\u00d5": 778, "\u00d6": 778, "\u00da": 722, "\u00d9": 722, "\u00db": 722, "\u00dc": 722, "\u00c7": 722, "\u00d1": 722, "\u2212": 584, "\u2013": 556, "\u2014": 1000, "\u00b7": 333, "\u00d7": 584, "\u00b0": 400, "\u00ba": 435, "\u00aa": 416, "\u00ab": 556, "\u00bb": 556, "\u201c": 500, "\u201d": 500, "\u2018": 278, "\u2019": 278, "\u2026": 1000, "\u00a7": 556, "\u2022": 498};
const LARG_PAD = 1015, LARG_B_PAD = 1000;

/* altura de uma linha em relação ao corpo da fonte, no espaçamento simples */
const ENTRE = 1.22;

function larguraDe(txt, sz, b){
  const t = b ? LARG_B : LARG, pad = b ? LARG_B_PAD : LARG_PAD;
  let s = 0;
  for (const ch of String(txt||'')) s += (t[ch] !== undefined ? t[ch] : pad);
  return s / 1000 * sz;
}

/* quebra de linha gulosa, como a do PowerPoint: só quebra em espaço, e uma
   palavra maior que a caixa fica sozinha na linha (não parte no meio) */
function quebrarTexto(txt, larg, sz, b){
  const palavras = String(txt||'').split(/\s+/).filter(x => x.length);
  if (!palavras.length) return [''];
  const linhas = [];
  let atual = '';
  palavras.forEach(p => {
    const tentativa = atual ? atual + ' ' + p : p;
    if (atual && larguraDe(tentativa, sz, b) > larg){ linhas.push(atual); atual = p; }
    else atual = tentativa;
  });
  if (atual) linhas.push(atual);
  return linhas;
}

/* normaliza os três formatos que `txt` aceita (string, array de runs, array de
   parágrafos) numa lista de parágrafos — usada tanto para medir quanto para
   serializar, para as duas nunca discordarem */
function _paragrafos(txt){
  if (txt === undefined || txt === null || txt === '') return [{runs:[{t:''}]}];
  if (typeof txt === 'string') return txt.split('\n').map(t => ({runs:[{t}]}));
  return txt.map(p => Array.isArray(p) ? {runs:p} : (p.runs ? p : {runs:[p]}));
}

/* altura que o bloco vai ocupar de fato, na largura dada */
function alturaDe(o){
  const paras = _paragrafos(o.txt);
  const larguraUtil = o.w - (o.pad||0)*2;
  let h = 0;
  paras.forEach(p => {
    const runs = p.runs || [];
    const txt = runs.map(r => r.t).join('');
    const sz = Math.max(o.sz || 12, ...runs.map(r => r.sz || 0));
    const b  = o.b || runs.some(r => r.b);
    const util = larguraUtil - (p.bullet ? 13 : 0);
    const n = Math.max(quebrarTexto(txt, util, sz, b).length, 1);
    h += (p.antes || 0) + n * sz * ENTRE * (p.ln || o.ln || 1);
  });
  return h;
}

/* o maior corpo de fonte que faz o bloco caber na altura disponível. Só desce
   até `min`: abaixo disso é melhor a caixa crescer do que o slide virar letra
   de bula. */
function corpoQueCabe(o, alturaMax, min){
  let sz = o.sz || 12;
  const piso = min || Math.max(7, sz * 0.6);
  while (sz > piso && alturaDe({...o, sz}) > alturaMax) sz -= 0.5;
  return sz;
}

/* ═══════════ 2. FORMAS ═══════════════════════════════════════════════ */

function novoSlide(opts){ return {formas: [], n: 1, notas: [], ...opts}; }

function _run(r, base){
  const b = {...base, ...r};
  const attrs = `lang="pt-BR" sz="${Math.round((b.sz||12)*100)}"`
    + (b.b ? ' b="1"' : '') + (b.i ? ' i="1"' : '')
    + (b.esp !== undefined ? ` spc="${Math.round(b.esp*100)}"` : '');
  return `<a:r><a:rPr ${attrs} dirty="0">`
       + `<a:solidFill><a:srgbClr val="${b.cor||C.ink}"/></a:solidFill>`
       + `<a:latin typeface="Calibri"/><a:cs typeface="Calibri"/></a:rPr>`
       + `<a:t>${esx(b.t)}</a:t></a:r>`;
}

function _para(p, base){
  const runs = p.runs || [];
  const algn = p.algn || base.algn;
  const ln   = p.ln !== undefined ? p.ln : base.ln;
  const bul  = p.bullet;
  const pPr = `<a:pPr${algn ? ` algn="${algn}"` : ''}`
    + (bul ? ` marL="${emu(13)}" indent="${emu(-13)}"` : '') + '>'
    /* spcPct é em MILÉSIMOS DE POR CENTO: 100% se escreve 100000, não 1000.
       Com o fator errado a entrelinha vira 1,25% e todas as linhas do parágrafo
       caem sobre a mesma base — o texto sai embaralhado sem nenhum erro de XML,
       e só aparece quando se abre o arquivo. */
    + (ln ? `<a:lnSpc><a:spcPct val="${Math.round(ln*100000)}"/></a:lnSpc>` : '')
    + (p.antes ? `<a:spcBef><a:spcPts val="${Math.round(p.antes*100)}"/></a:spcBef>` : '')
    + (bul ? `<a:buClr><a:srgbClr val="${base.corBullet||C.s1}"/></a:buClr><a:buChar char="•"/>`
           : '<a:buNone/>')
    + '</a:pPr>';
  return `<a:p>${pPr}${runs.map(r => _run(r, base)).join('')}</a:p>`;
}

/* `ns` existe por um motivo que custa caro descobrir: numa forma o elemento é
   <p:txBody>, mas dentro de uma célula de tabela é <a:txBody>. Trocar um pelo
   outro não dá erro de XML — a tabela simplesmente sai vazia. */
function _txBody(o){
  const ns = o.ns || 'p';
  const base = {sz:o.sz, b:o.b, i:o.i, cor:o.cor, algn:o.algn, ln:o.ln,
                corBullet:o.corBullet};
  const xml = _paragrafos(o.txt).map(p => _para(p, base)).join('');
  /* sem autoajuste: quem decide o tamanho é a medição acima, e deixar o
     PowerPoint reencolher por conta faz o mesmo slide sair diferente em cada
     máquina que abre o arquivo */
  return `<${ns}:txBody><a:bodyPr lIns="${emu(o.pad||0)}" tIns="0" rIns="${emu(o.pad||0)}" `
       + `bIns="0" anchor="${o.anchor||'t'}" wrap="square"><a:noAutofit/></a:bodyPr>`
       + `<a:lstStyle/>${xml}</${ns}:txBody>`;
}

/* uma forma: retângulo (com ou sem preenchimento) que pode conter texto.
   É a peça de que todo o resto do deck é feito — inclusive as barras. */
function forma(sl, o){
  const id = ++sl.n;
  const fill = o.fill ? `<a:solidFill><a:srgbClr val="${o.fill}"/></a:solidFill>` : '<a:noFill/>';
  const ln = o.linha
    ? `<a:ln w="${emu(o.linhaW || 0.75)}"><a:solidFill><a:srgbClr val="${o.linha}"/></a:solidFill></a:ln>`
    : '<a:ln><a:noFill/></a:ln>';
  const geom = o.geom || 'rect';
  const adj = o.raio !== undefined
    ? `<a:avLst><a:gd name="adj" fmla="val ${o.raio}"/></a:avLst>` : '<a:avLst/>';
  sl.formas.push(
    `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${o.nome || 'forma'} ${id}"/>`
    + `<p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr>`
    + `<a:xfrm><a:off x="${emu(o.x)}" y="${emu(o.y)}"/>`
    + `<a:ext cx="${emu(Math.max(o.w, 0.5))}" cy="${emu(Math.max(o.h, 0.5))}"/></a:xfrm>`
    + `<a:prstGeom prst="${geom}">${adj}</a:prstGeom>${fill}${ln}</p:spPr>`
    + _txBody(o) + `</p:sp>`);
  return o.y + o.h;
}

/* Texto solto: a caixa tem exatamente a altura do que foi escrito, medida
   acima. `hMax` encolhe o corpo até caber; `h` só define um piso.
   Devolve o Y do rodapé do bloco — é assim que os slides empilham sem que uma
   frase comprida invada a de baixo. */
function texto(sl, o){
  const sz = o.hMax ? corpoQueCabe(o, o.hMax, o.szMin) : (o.sz || 12);
  const alt = alturaDe({...o, sz});
  const h = Math.max(alt, o.h || 0);
  forma(sl, {...o, sz, fill:null, linha:null, h});
  return o.y + h;
}

/* ── tabela nativa ─────────────────────────────────────────────────────
   Um a:tbl de verdade, não um desenho de retângulos: dá para editar uma célula
   durante a call se o dono questionar um número. A altura de cada linha é
   MEDIDA — no PowerPoint `h` é só um mínimo e a linha cresce com o conteúdo,
   então quem não mede descobre o tamanho real da tabela por cima do rodapé. */
function tabela(sl, o){
  const id = ++sl.n;
  const sz = o.sz || 11;
  const padH = o.padH !== undefined ? o.padH : 5;
  const padV = o.padV !== undefined ? o.padV : 3;

  const alturaCelula = (c, larg, ehCab) => alturaDe({
    txt: c.t, w: larg - padH*2, sz: c.sz || (ehCab ? (o.szCab || sz) : sz),
    b: c.b || ehCab, ln: c.ln || 1.0}) + padV*2;

  /* largura efetiva de uma célula, considerando colunas mescladas */
  const largDe = (i, span) => o.colsW.slice(i, i + (span||1)).reduce((a,b)=>a+b, 0);

  const cel = (c, ehCab, i) => {
    if (c.hMerge) return `<a:tc hMerge="1"><a:txBody><a:bodyPr/><a:lstStyle/>`
      + `<a:p/></a:txBody><a:tcPr/></a:tc>`;
    if (c.vMerge) return `<a:tc vMerge="1"><a:txBody><a:bodyPr/><a:lstStyle/>`
      + `<a:p/></a:txBody><a:tcPr/></a:tc>`;
    const corpo = _txBody({txt: c.t, sz: c.sz || (ehCab ? (o.szCab || sz) : sz),
      b: c.b || ehCab, cor: c.cor || (ehCab ? C.ink2 : C.ink),
      algn: c.algn || 'l', anchor: c.anchor || 'ctr', ln: c.ln || 1.0, ns:'a'});
    const linhaCor = c.borda || (ehCab ? C.ink2 : C.borda);
    const bordas = o.grade
      ? ['L','R','T','B'].map(d => `<a:ln${d} w="${emu(0.75)}"><a:solidFill>`
          + `<a:srgbClr val="${linhaCor}"/></a:solidFill></a:ln${d}>`).join('')
      : `<a:lnB w="${emu(0.75)}"><a:solidFill><a:srgbClr val="${linhaCor}"/>`
        + `</a:solidFill></a:lnB>`;
    /* sem fill explícito → branco: o tableStyleId builtin não existe no pacote
       e o PowerPoint pinta as linhas com o tema (fundo preto). O Keynote tolera;
       o PowerPoint não. Fundo sempre explícito resolve nos dois. */
    const fundo = `<a:solidFill><a:srgbClr val="${c.fill || 'FFFFFF'}"/></a:solidFill>`;
    const spans = (c.gridSpan ? ` gridSpan="${c.gridSpan}"` : '')
                + (c.rowSpan ? ` rowSpan="${c.rowSpan}"` : '');
    return `<a:tc${spans}>${corpo}<a:tcPr marL="${emu(padH)}" marR="${emu(padH)}" `
         + `marT="${emu(padV)}" marB="${emu(padV)}" anchor="${c.anchor || 'ctr'}">`
         + `${bordas}${fundo}</a:tcPr></a:tc>`;
  };

  const monta = (cells, ehCab, hMin) => {
    const norm = cells.map(c => typeof c === 'string' ? {t:c} : c);
    let alt = hMin || 0, i = 0;
    norm.forEach(c => {
      if (!c.hMerge && !c.vMerge && !c.rowSpan)
        alt = Math.max(alt, alturaCelula(c, largDe(i, c.gridSpan), ehCab));
      i += c.gridSpan || 1;
    });
    return {xml: `<a:tr h="${emu(alt)}">` + norm.map((c,j) => cel(c, ehCab, j)).join('')
            + '</a:tr>', alt};
  };

  const trs = [];
  let total = 0;
  (o.cabs || (o.cab ? [o.cab] : [])).forEach(linhaCab => {
    const r = monta(linhaCab, true, o.hCab || 20);
    trs.push(r.xml); total += r.alt;
  });
  o.linhas.forEach(L => {
    const cells = L.cells || L;
    const r = monta(cells.map(c => typeof c === 'string'
      ? {t:c, fill:L.fill} : {fill:L.fill, ...c}), false, L.h || o.hLinha || 19);
    trs.push(r.xml); total += r.alt;
  });

  sl.formas.push(
    `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="${id}" name="tabela ${id}"/>`
    + `<p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr><p:nvPr/>`
    + `</p:nvGraphicFramePr><p:xfrm><a:off x="${emu(o.x)}" y="${emu(o.y)}"/>`
    + `<a:ext cx="${emu(o.colsW.reduce((a,b)=>a+b,0))}" cy="${emu(total)}"/></p:xfrm>`
    + `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">`
    + `<a:tbl><a:tblPr firstRow="1" bandRow="0">`
    + `<a:tableStyleId>{2D5ABB26-0587-4C30-8999-92F81FD0307C}</a:tableStyleId></a:tblPr>`
    + `<a:tblGrid>${o.colsW.map(w => `<a:gridCol w="${emu(w)}"/>`).join('')}</a:tblGrid>`
    + `${trs.join('')}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`);
  return o.y + total;
}

/* mede a tabela sem desenhar — para paginar antes de escolher o slide */
function alturaTabela(o){
  const falso = {formas:[], n:1};
  const y = tabela(falso, {...o, y:0});
  return y;
}

/* ═══════════ 3. PEÇAS DO DECK ════════════════════════════════════════ */

function cabecalho(sl, chapeu, titulo, direita){
  forma(sl, {x:0, y:0, w:PPT_W, h:4, fill:C.s1});
  texto(sl, {x:MG, y:26, w:COL*0.68, h:14, txt: String(chapeu||'').toUpperCase(),
             sz:10, b:true, cor:C.s1, esp:1.2});
  /* nome de ação do PDCA é longo: o corpo encolhe até caber em duas linhas,
     senão a segunda desce por cima do conteúdo do slide */
  texto(sl, {x:MG, y:44, w:COL*0.68, txt:titulo, sz:26, szMin:15, hMax:40,
             b:true, cor:C.ink});
  if (direita)
    texto(sl, {x:PPT_W-MG-300, y:30, w:300, txt:direita, sz:11, cor:C.muted, algn:'r'});
}

function rodape(sl, txt){
  if (!txt) return;
  /* o rodapé é a última coisa do slide: cresce para cima, nunca para baixo */
  const o = {x:MG, y:0, w:COL-70, txt, sz:8.5, cor:C.muted, ln:1.15};
  const alt = alturaDe(o);
  texto(sl, {...o, y: Math.min(BASE_Y + 16, PPT_H - 14 - alt)});
}

/* KPI: rótulo pequeno em cima, número grande embaixo. O dono olha o número
   antes de ouvir a frase. */
function kpis(sl, x, y, w, itens, alt){
  const gap = 10, cw = (w - gap*(itens.length-1)) / itens.length;
  let maior = alt || 62;
  itens.forEach(k => {
    const szV = corpoQueCabe({txt:k.val, w:cw-24, sz: k.sz || 22, b:true}, 30, 12);
    k._sz = szV;
    maior = Math.max(maior, 24 + alturaDe({txt:k.val, w:cw-24, sz:szV, b:true})
                          + (k.sub ? 18 : 10));
  });
  itens.forEach((k,i) => {
    const px = x + i*(cw+gap);
    forma(sl, {x:px, y, w:cw, h:maior, fill: k.fill || C.surf, geom:'roundRect', raio:9000});
    texto(sl, {x:px+12, y:y+9, w:cw-24, txt:k.rot, sz:9.5, cor:C.muted, b:true, esp:.6,
               hMax:13, szMin:7});
    texto(sl, {x:px+12, y:y+24, w:cw-24, txt:k.val, sz:k._sz, b:true, cor: k.cor || C.ink});
    if (k.sub) texto(sl, {x:px+12, y:y+maior-16, w:cw-24, txt:k.sub, sz:8.5, cor:C.muted,
                          hMax:12, szMin:6.5});
  });
  return y + maior;
}

/* destaque: a frase que o consultor lê em voz alta. A altura vem do texto. */
function destaque(sl, o){
  const larguraTxt = (o.val !== undefined && o.val !== null) ? o.w - 200 : o.w - 32;
  const szTxt = o.hMax ? corpoQueCabe({txt:o.txt, w:larguraTxt, sz:o.sz||11.5, ln:1.25},
                                      o.hMax - 40, 8) : (o.sz || 11.5);
  const altTxt = alturaDe({txt:o.txt, w:larguraTxt, sz:szTxt, ln:1.25});
  const h = Math.max(o.h || 0, 30 + altTxt + 12);
  forma(sl, {x:o.x, y:o.y, w:o.w, h, fill: CSTBG[o.status] || C.bgInfo,
             geom:'roundRect', raio:7000});
  forma(sl, {x:o.x, y:o.y, w:4, h, fill: CST[o.status] || C.s1});
  texto(sl, {x:o.x+16, y:o.y+10, w:larguraTxt, txt:o.rot, sz:9.5, b:true, cor:C.ink2,
             esp:.6, hMax:13, szMin:7});
  if (o.val !== undefined && o.val !== null)
    texto(sl, {x:o.x+o.w-184, y:o.y+8, w:168, txt:o.val, algn:'r', b:true,
               sz:26, szMin:12, hMax:34, cor: CST[o.status] || C.s1});
  texto(sl, {x:o.x+16, y:o.y+30, w:larguraTxt, txt:o.txt, sz:szTxt, cor:C.ink, ln:1.25});
  return o.y + h;
}

/* barras de coluna com a linha da média */
function barrasMeses(sl, {x,y,w,h, serie, meses, destaqueMes, media, status}){
  const max = Math.max(...meses.map(m => serie[m-1]||0), media||0) * 1.15 || 1;
  /* calha à direita só para o rótulo da média: quando o último mês fica perto
     dela, os dois números caem no mesmo ponto e um come o outro */
  const calha = media > 0 ? 74 : 0;
  w = w - calha;
  const banda = w / meses.length, larg = Math.min(banda*0.5, 42);
  const yBase = y + h;
  meses.forEach((m,i) => {
    const v = serie[m-1] || 0;
    const alt = Math.max(v / max * h, 2);
    const cx = x + banda*i + (banda-larg)/2;
    const ult = m === destaqueMes;
    forma(sl, {x:cx, y:yBase-alt, w:larg, h:alt, geom:'roundRect', raio:12000,
               fill: ult ? (CST[status]||C.s1) : 'C9D6E8'});
    texto(sl, {x:cx-10, y:yBase-alt-15, w:larg+20, txt:fmt(v), sz:10, b:ult,
               algn:'ctr', cor: ult ? (CST[status]||C.s1) : C.ink2});
    texto(sl, {x:cx-10, y:yBase+4, w:larg+20, txt:MESES[m-1], sz:9, algn:'ctr',
               cor: ult ? C.ink : C.muted, b:ult});
  });
  if (media > 0){
    const ym = yBase - media/max*h;
    forma(sl, {x, y:ym, w: w + 6, h:0.9, fill:C.muted});
    texto(sl, {x:x+w+10, y:ym-6, w:calha-10, txt:`média ${fmt(media)}`, sz:8.5,
               algn:'l', cor:C.muted});
  }
  return yBase + 18;
}

function barraShare(sl, {x,y,w,h, share, ref, status}){
  forma(sl, {x, y, w, h, fill:'ECEBE6', geom:'roundRect', raio:26000});
  const p = Math.min(share / (ref || share || 1), 1);
  forma(sl, {x, y, w: Math.max(w*p, 2), h, fill: CST[status]||C.s1,
             geom:'roundRect', raio:26000});
  if (share < ref) forma(sl, {x: x+w-1, y: y-2.5, w:1.4, h: h+5, fill:C.ink2});
}

/* ═══════════ 4. O PDCA, COM A CARA DO EXCEL ══════════════════════════
   Mesmas colunas, mesmo cabeçalho em duas faixas com PRAZO abrindo em
   INÍCIO/TÉRMINO, mesmo azul, mesma zebra e as mesmas cores de prioridade do
   xlsx-bonito.js. É o mesmo documento em outro meio: se a cara divergir, o
   dono acha que são dois planos diferentes.

   As larguras são as do Excel (30·46·46·15·9·9·22·11·44 caracteres),
   reproporcionadas para a largura útil do slide.                          */
const PDCA_COLS_EXCEL = [30, 46, 46, 15, 9, 9, 22, 11, 44];
const PDCA_COLS = (() => {
  const soma = PDCA_COLS_EXCEL.reduce((a,b)=>a+b, 0);
  const l = PDCA_COLS_EXCEL.map(w => Math.round(COL * w / soma));
  l[l.length-1] += COL - l.reduce((a,b)=>a+b, 0);      /* fecha o arredondamento */
  return l;
})();

const PDCA_CAB = [
  [{t:'O QUE FAZER?\n(AÇÃO)', rowSpan:2}, {t:'POR QUÊ?\n(JUSTIFICATIVA)', rowSpan:2},
   {t:'COMO?\n(ATIVIDADES PRINCIPAIS)', rowSpan:2}, {t:'RESPONSÁVEL', rowSpan:2},
   {t:'PRAZO', gridSpan:2}, {t:'', hMerge:true}, {t:'STATUS', rowSpan:2},
   {t:'PRIORIDADE', rowSpan:2},
   {t:'INDICADOR DE ACOMPANHAMENTO\n(Meta / impacto da ação)', rowSpan:2}],
  [{vMerge:true}, {vMerge:true}, {vMerge:true}, {vMerge:true},
   {t:'INÍCIO'}, {t:'TÉRMINO'}, {vMerge:true}, {vMerge:true}, {vMerge:true}],
];

const PDCA_PRIO = {
  Alta:  {fill:C.pdcaAltaBg,  cor:C.pdcaAltaTx},
  'Média':{fill:C.pdcaMediaBg, cor:C.pdcaMediaTx},
  Baixa: {fill:C.pdcaBaixaBg, cor:C.pdcaBaixaTx},
};

function linhaPDCA(a, zebra, sz){
  const fundo = zebra ? C.pdcaClaro : null;
  const p = PDCA_PRIO[a.prio] || PDCA_PRIO.Baixa;
  const como = (Array.isArray(a.como) ? a.como : [a.como])
    .map(c => ({runs:[{t: '• ' + c}], ln:1.05, antes:2}));
  return {cells:[
    {t:a.acao, fill:fundo, b:true, anchor:'t'},
    {t:a.porque, fill:fundo, anchor:'t', ln:1.05},
    {t:como, fill:fundo, anchor:'t'},
    {t:a.resp, fill:fundo, algn:'ctr'},
    {t:a.ini, fill:fundo, algn:'ctr'},
    {t:a.fim, fill:fundo, algn:'ctr'},
    {t:'', fill:fundo},
    {t:a.prio, fill:p.fill, cor:p.cor, b:true, algn:'ctr'},
    {t:a.indicador, fill:fundo, anchor:'t', ln:1.05},
  ]};
}

/* Quantas ações cabem por slide não é uma constante: depende do tamanho do
   texto de cada uma. Então a paginação MEDE antes de decidir onde cortar. */
function paginarPDCA(acoes, alturaUtil, sz){
  const base = {x:MG, y:0, colsW:PDCA_COLS, sz, szCab:8, hCab:18, hLinha:22,
                grade:true, cabs:PDCA_CAB, padH:4, padV:3};
  const alturaCab = alturaTabela({...base, linhas:[]});
  const alturas = acoes.map((a,i) =>
    alturaTabela({...base, cabs:[], linhas:[linhaPDCA(a, i%2===1, sz)]}));

  /* corta pela altura e, opcionalmente, por um teto de linhas por folha */
  const cortar = (maxLinhas) => {
    const paginas = [];
    let atual = [], altura = alturaCab;
    acoes.forEach((a,i) => {
      const estoura = altura + alturas[i] > alturaUtil
                   || (maxLinhas && atual.length >= maxLinhas);
      if (atual.length && estoura){ paginas.push(atual); atual = []; altura = alturaCab; }
      atual.push(a); altura += alturas[i];
    });
    if (atual.length) paginas.push(atual);
    return paginas;
  };

  /* O corte guloso deixa a última folha com o resto — 12 ações viram 3·2·3·3·1,
     e a folha final com uma linha só parece erro de montagem. Sabendo quantas
     folhas são necessárias, distribui-se o mesmo total por elas. */
  const guloso = cortar(null);
  if (guloso.length < 2) return guloso;
  let paginas = cortar(Math.ceil(acoes.length / guloso.length));
  if (paginas.length > guloso.length) paginas = guloso;

  /* Mesmo equilibrado, o resto costuma sobrar sozinho na última folha — e uma
     folha com uma linha só parece erro de montagem. Puxa-se uma ação da folha
     anterior, conferindo a altura antes de mover. */
  const alturaDaPagina = pag => alturaCab
    + pag.reduce((s,a) => s + alturas[acoes.indexOf(a)], 0);
  for (let i = paginas.length - 1; i > 0; i--){
    while (paginas[i].length === 1 && paginas[i-1].length >= 3){
      const movida = paginas[i-1][paginas[i-1].length-1];
      if (alturaDaPagina([movida, ...paginas[i]]) > alturaUtil) break;
      paginas[i-1].pop();
      paginas[i].unshift(movida);
    }
  }
  return paginas;
}

function slidesDoPDCA(S, acoes, nome, subtitulo){
  const sz = 8;
  const alturaUtil = BASE_Y - (TOPO_Y + 6) - 4;
  const paginas = paginarPDCA(acoes, alturaUtil, sz);
  let n = 0;
  paginas.forEach((pagina, p) => {
    const sl = novoSlide();
    cabecalho(sl, paginas.length > 1
      ? `plano de ação · folha ${p+1} de ${paginas.length}` : 'plano de ação',
      'O que vamos fazer', nome);
    tabela(sl, {x:MG, y:TOPO_Y+6, colsW:PDCA_COLS, sz, szCab:8, hCab:18, hLinha:22,
      grade:true, padH:4, padV:3,
      cabs: PDCA_CAB.map(linha => linha.map(c => ({...c,
        fill: (c.hMerge || c.vMerge) ? null : C.pdcaAzul,
        cor: C.branco, b:true, algn:'ctr', borda:C.pdcaLinha, anchor:'ctr'}))),
      linhas: pagina.map(a => linhaPDCA(a, (n++) % 2 === 1, sz))});
    rodape(sl, subtitulo);
    sl.notas = ['Não ler a tabela inteira em voz alta: ler as linhas de prioridade '
      + 'alta e combinar responsável e data para cada uma. Esta é a mesma tabela '
      + 'que sai no botão "Gerar PDCA", em Excel, para anexar depois da call.'];
    S.push(sl);
  });
}


/* ═══════════ 6. O ARQUIVO ════════════════════════════════════════════ */

const NS_P = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
  + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
  + 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';

const GRUPO_RAIZ = `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>`
  + `<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/>`
  + `<a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>`;

const TEMA = nome => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="${nome}">
<a:themeElements>
<a:clrScheme name="${nome}">
<a:dk1><a:srgbClr val="0B0B0B"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="52514E"/></a:dk2><a:lt2><a:srgbClr val="F4F4F1"/></a:lt2>
<a:accent1><a:srgbClr val="2A78D6"/></a:accent1><a:accent2><a:srgbClr val="EB6834"/></a:accent2>
<a:accent3><a:srgbClr val="4B9B3F"/></a:accent3><a:accent4><a:srgbClr val="D98A0B"/></a:accent4>
<a:accent5><a:srgbClr val="D64545"/></a:accent5><a:accent6><a:srgbClr val="898781"/></a:accent6>
<a:hlink><a:srgbClr val="2A78D6"/></a:hlink><a:folHlink><a:srgbClr val="898781"/></a:folHlink>
</a:clrScheme>
<a:fontScheme name="${nome}">
<a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>
</a:fontScheme>
<a:fmtScheme name="${nome}">
<a:fillStyleLst>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
</a:fillStyleLst>
<a:lnStyleLst>
<a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
<a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
<a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>
</a:lnStyleLst>
<a:effectStyleLst>
<a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle>
</a:effectStyleLst>
<a:bgFillStyleLst>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
</a:bgFillStyleLst>
</a:fmtScheme>
</a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`;

const CLRMAP = 'bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" '
  + 'accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" '
  + 'accent6="accent6" hlink="hlink" folHlink="folHlink"';

const rels = lista => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
  + lista.map(r => `<Relationship Id="${r.id}" Type="http://schemas.openxmlformats.org/`
      + `${r.tipo}" Target="${r.alvo}"/>`).join('') + `</Relationships>`;

function baixarPptx(arquivo, slides, meta){
  const N = slides.length;
  const partes = [], tipos = [];

  slides.forEach((sl,i) => {
    partes.push({nome:`ppt/slides/slide${i+1}.xml`, dados:
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
      + `<p:sld ${NS_P}><p:cSld><p:spTree>${GRUPO_RAIZ}${sl.formas.join('')}</p:spTree></p:cSld>`
      + `<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`});
    const relsSlide = [{id:'rId1', tipo:'officeDocument/2006/relationships/slideLayout',
                        alvo:'../slideLayouts/slideLayout1.xml'}];
    if (sl.notas && sl.notas.length)
      relsSlide.push({id:'rId2', tipo:'officeDocument/2006/relationships/notesSlide',
                      alvo:`../notesSlides/notesSlide${i+1}.xml`});
    partes.push({nome:`ppt/slides/_rels/slide${i+1}.xml.rels`, dados: rels(relsSlide)});
    tipos.push(`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`);

    /* as notas do apresentador: é o roteiro da call, não decoração */
    if (sl.notas && sl.notas.length){
      const corpo = sl.notas.map(t =>
        `<a:p><a:r><a:rPr lang="pt-BR" sz="1200" dirty="0"/><a:t>${esx(t)}</a:t></a:r></a:p>`).join('');
      partes.push({nome:`ppt/notesSlides/notesSlide${i+1}.xml`, dados:
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
        + `<p:notes ${NS_P}><p:cSld><p:spTree>${GRUPO_RAIZ}`
        + `<p:sp><p:nvSpPr><p:cNvPr id="2" name="Espaço Reservado para Anotações 1"/>`
        + `<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>`
        + `<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>`
        + `<p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${corpo}</p:txBody></p:sp>`
        + `</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`});
      partes.push({nome:`ppt/notesSlides/_rels/notesSlide${i+1}.xml.rels`, dados: rels([
        {id:'rId1', tipo:'officeDocument/2006/relationships/notesMaster',
         alvo:'../notesMasters/notesMaster1.xml'},
        {id:'rId2', tipo:'officeDocument/2006/relationships/slide',
         alvo:`../slides/slide${i+1}.xml`}])});
      tipos.push(`<Override PartName="/ppt/notesSlides/notesSlide${i+1}.xml" ContentType="`
        + `application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`);
    }
  });

  partes.push({nome:'ppt/slideMasters/slideMaster1.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<p:sldMaster ${NS_P}><p:cSld><p:bg><p:bgPr><a:solidFill>`
    + `<a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`
    + `<p:spTree>${GRUPO_RAIZ}</p:spTree></p:cSld><p:clrMap ${CLRMAP}/>`
    + `<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>`
    + `</p:sldMaster>`});
  partes.push({nome:'ppt/slideMasters/_rels/slideMaster1.xml.rels', dados: rels([
    {id:'rId1', tipo:'officeDocument/2006/relationships/slideLayout',
     alvo:'../slideLayouts/slideLayout1.xml'},
    {id:'rId2', tipo:'officeDocument/2006/relationships/theme', alvo:'../theme/theme1.xml'}])});

  partes.push({nome:'ppt/slideLayouts/slideLayout1.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<p:sldLayout ${NS_P} type="blank" preserve="1"><p:cSld name="Em branco">`
    + `<p:spTree>${GRUPO_RAIZ}</p:spTree></p:cSld>`
    + `<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`});
  partes.push({nome:'ppt/slideLayouts/_rels/slideLayout1.xml.rels', dados: rels([
    {id:'rId1', tipo:'officeDocument/2006/relationships/slideMaster',
     alvo:'../slideMasters/slideMaster1.xml'}])});

  partes.push({nome:'ppt/notesMasters/notesMaster1.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<p:notesMaster ${NS_P}><p:cSld><p:spTree>${GRUPO_RAIZ}`
    + `<p:sp><p:nvSpPr><p:cNvPr id="2" name="Espaço Reservado para Anotações 1"/>`
    + `<p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>`
    + `<p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>`
    + `<p:spPr><a:xfrm><a:off x="685800" y="4343400"/><a:ext cx="5486400" cy="4114800"/></a:xfrm>`
    + `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>`
    + `<p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="pt-BR"/></a:p></p:txBody></p:sp>`
    + `</p:spTree></p:cSld><p:clrMap ${CLRMAP}/></p:notesMaster>`});
  partes.push({nome:'ppt/notesMasters/_rels/notesMaster1.xml.rels', dados: rels([
    {id:'rId1', tipo:'officeDocument/2006/relationships/theme', alvo:'../theme/theme2.xml'}])});

  partes.push({nome:'ppt/theme/theme1.xml', dados: TEMA('Performance')});
  partes.push({nome:'ppt/theme/theme2.xml', dados: TEMA('Performance Notas')});

  const relsPres = [{id:'rId1', tipo:'officeDocument/2006/relationships/slideMaster',
                     alvo:'slideMasters/slideMaster1.xml'}];
  slides.forEach((_,i) => relsPres.push({id:`rId${i+2}`,
    tipo:'officeDocument/2006/relationships/slide', alvo:`slides/slide${i+1}.xml`}));
  relsPres.push({id:`rId${N+2}`, tipo:'officeDocument/2006/relationships/notesMaster',
                 alvo:'notesMasters/notesMaster1.xml'});
  relsPres.push({id:`rId${N+3}`, tipo:'officeDocument/2006/relationships/theme',
                 alvo:'theme/theme1.xml'});
  /* Partes que todo pptx salvo pelo PowerPoint carrega. O aplicativo normal
     tolera a ausência; o VALIDADOR do Modo de Exibição Protegido (arquivo
     baixado da internet, Mark-of-the-Web) não — pede "reparar" e falha.
     tableStyles.xml também dá corpo ao tableStyleId citado nas tabelas. */
  relsPres.push({id:`rId${N+4}`, tipo:'officeDocument/2006/relationships/presProps',
                 alvo:'presProps.xml'});
  relsPres.push({id:`rId${N+5}`, tipo:'officeDocument/2006/relationships/viewProps',
                 alvo:'viewProps.xml'});
  relsPres.push({id:`rId${N+6}`, tipo:'officeDocument/2006/relationships/tableStyles',
                 alvo:'tableStyles.xml'});
  partes.push({nome:'ppt/presProps.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<p:presentationPr ${NS_P}/>`});
  partes.push({nome:'ppt/viewProps.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<p:viewPr ${NS_P}><p:normalViewPr><p:restoredLeft sz="15620"/>`
    + `<p:restoredTop sz="94660"/></p:normalViewPr><p:gridSpacing cx="72008" cy="72008"/></p:viewPr>`});
  partes.push({nome:'ppt/tableStyles.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" `
    + `def="{2D5ABB26-0587-4C30-8999-92F81FD0307C}"/>`});

  partes.push({nome:'ppt/presentation.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<p:presentation ${NS_P} saveSubsetFonts="1">`
    + `<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>`
    + `<p:notesMasterIdLst><p:notesMasterId r:id="rId${N+2}"/></p:notesMasterIdLst>`
    + `<p:sldIdLst>` + slides.map((_,i) =>
        `<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join('') + `</p:sldIdLst>`
    + `<p:sldSz cx="${emu(PPT_W)}" cy="${emu(PPT_H)}"/>`
    + `<p:notesSz cx="6858000" cy="9144000"/></p:presentation>`});
  partes.push({nome:'ppt/_rels/presentation.xml.rels', dados: rels(relsPres)});

  partes.push({nome:'docProps/core.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" `
    + `xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" `
    + `xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">`
    + `<dc:title>${esx(meta.titulo)}</dc:title>`
    + `<dc:creator>${esx(meta.autor || 'Performance Concessionário')}</dc:creator>`
    + `<cp:lastModifiedBy>${esx(meta.autor || 'Performance Concessionário')}</cp:lastModifiedBy>`
    + `</cp:coreProperties>`});
  partes.push({nome:'docProps/app.xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" `
    + `xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">`
    + `<Application>Performance Concessionário</Application><Slides>${N}</Slides>`
    + `<Company></Company></Properties>`});

  partes.push({nome:'[Content_Types].xml', dados:
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
    + `<Default Extension="xml" ContentType="application/xml"/>`
    + `<Override PartName="/ppt/presentation.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`
    + `<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`
    + `<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`
    + `<Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>`
    + `<Override PartName="/ppt/presProps.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>`
    + `<Override PartName="/ppt/viewProps.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>`
    + `<Override PartName="/ppt/tableStyles.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>`
    + `<Override PartName="/ppt/theme/theme1.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.theme+xml"/>`
    + `<Override PartName="/ppt/theme/theme2.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.theme+xml"/>`
    + `<Override PartName="/docProps/core.xml" ContentType="application/`
      + `vnd.openxmlformats-package.core-properties+xml"/>`
    + `<Override PartName="/docProps/app.xml" ContentType="application/`
      + `vnd.openxmlformats-officedocument.extended-properties+xml"/>`
    + tipos.join('') + `</Types>`});

  partes.push({nome:'_rels/.rels', dados: rels([
    {id:'rId1', tipo:'officeDocument/2006/relationships/officeDocument', alvo:'ppt/presentation.xml'},
    {id:'rId2', tipo:'package/2006/relationships/metadata/core-properties', alvo:'docProps/core.xml'},
    {id:'rId3', tipo:'officeDocument/2006/relationships/extended-properties', alvo:'docProps/app.xml'}])});

  return zipar(partes,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation');
}

/* download no navegador (montarPptx é puro e testável fora dele) */
function baixarPptxArquivo(arquivo, slides, meta){
  const blob = baixarPptx(arquivo, slides, meta);
  const url = URL.createObjectURL(blob);
  const l = document.createElement('a');
  l.href = url; l.download = arquivo; l.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export {
  novoSlide, forma, texto, tabela, alturaTabela, cabecalho, rodape, kpis,
  destaque, barrasMeses, barraShare, linhaPDCA, paginarPDCA, slidesDoPDCA,
  alturaDe, corpoQueCabe, esx, semTags, baixarPptx as montarPptx, baixarPptxArquivo,
  C, CST, CSTBG, MG, COL, TOPO_Y, BASE_Y, PPT_W, PPT_H,
}
