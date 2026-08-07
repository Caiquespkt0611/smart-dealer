/* ═══════════════ ESCRITOR DE .XLSX COM FORMATAÇÃO ══════════════════════
   A build comunitária do SheetJS não escreve estilo de célula (é recurso da
   versão paga), e sem quebra de texto o Plano de Ação fica ilegível. Um .xlsx
   é só um ZIP com uns XMLs dentro, então aqui a gente monta o arquivo inteiro
   à mão — assim dá para ter cabeçalho azul, bordas, wrap e altura de linha,
   e o Excel abre sem nenhum aviso de "formato não confere".

   Uso:  baixarXlsx(nomeArquivo, {nome, cols, linhas, merges})
   ═════════════════════════════════════════════════════════════════════════ */

/* ── ZIP (método "store": sem compressão, que é o que simplifica tudo) ──── */
const CRC32 = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++){
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (buf: Uint8Array) => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

/* `mime` é opcional: um .pptx é o mesmo ZIP com outro conteúdo, e o escritor
   de PowerPoint reaproveita esta função em vez de ter a sua cópia. */
function zipar(arquivos: Array<{nome: string; dados: string | Uint8Array}>, mime?: string){
  const enc = new TextEncoder();
  const partes: Uint8Array<ArrayBuffer>[] = [], central: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;

  arquivos.forEach(f => {
    const nome = enc.encode(f.nome);
    const dados = (typeof f.dados === 'string' ? enc.encode(f.dados) : f.dados) as Uint8Array<ArrayBuffer>;
    const crc = CRC32(dados), n = dados.length;

    const lh = new Uint8Array(new ArrayBuffer(30 + nome.length));
    const d1 = new DataView(lh.buffer);
    d1.setUint32(0, 0x04034b50, true);
    d1.setUint16(4, 20, true);                       // versão necessária
    d1.setUint32(14, crc, true);
    d1.setUint32(18, n, true);                       // tamanho comprimido
    d1.setUint32(22, n, true);                       // tamanho original
    d1.setUint16(26, nome.length, true);
    lh.set(nome, 30);
    partes.push(lh, dados);

    const ch = new Uint8Array(new ArrayBuffer(46 + nome.length));
    const d2 = new DataView(ch.buffer);
    d2.setUint32(0, 0x02014b50, true);
    d2.setUint16(4, 20, true); d2.setUint16(6, 20, true);
    d2.setUint32(16, crc, true);
    d2.setUint32(20, n, true); d2.setUint32(24, n, true);
    d2.setUint16(28, nome.length, true);
    d2.setUint32(42, offset, true);
    ch.set(nome, 46);
    central.push(ch);

    offset += lh.length + n;
  });

  const dirTam = central.reduce((a, c) => a + c.length, 0);
  const eocd = new Uint8Array(new ArrayBuffer(22));
  const d3 = new DataView(eocd.buffer);
  d3.setUint32(0, 0x06054b50, true);
  d3.setUint16(8, arquivos.length, true);
  d3.setUint16(10, arquivos.length, true);
  d3.setUint32(12, dirTam, true);
  d3.setUint32(16, offset, true);

  return new Blob([...partes, ...central, eocd],
    {type: mime || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

/* ── XML ─────────────────────────────────────────────────────────────── */
const xmlEsc = (s: unknown) => String(s ?? '')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/\n/g,'&#10;')
  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');           // o Excel recusa controle

const colLetra = (i: number) => {
  let s = '';
  for (i++; i > 0; i = Math.floor((i-1)/26)) s = String.fromCharCode(65+(i-1)%26) + s;
  return s;
};

/* ── paleta do Plano de Ação (o azul é o do template Yamaha) ──────────── */
const AZUL = '1F3864', AZUL_CLARO = 'D9E2F3', LINHA = 'BFBFBF';

/* Índices de estilo (a ordem aqui é a ordem dentro de cellXfs, abaixo):
   0 base · 1 título · 2 subtítulo · 3 cabeçalho · 4 texto · 5 centro
   6 prioridade Alta · 7 Média · 8 Baixa · 9 faixa zebrada · 10 centro zebrado */
const ESTILOS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="7">
<font><sz val="10"/><name val="Calibri"/></font>
<font><b/><sz val="15"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><i/><sz val="9"/><color rgb="FF595959"/><name val="Calibri"/></font>
<font><b/><sz val="9"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF9C0006"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF9C6500"/><name val="Calibri"/></font>
<font><b/><sz val="10"/><color rgb="FF3F3F3F"/><name val="Calibri"/></font>
</fonts>
<fills count="7">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF${AZUL}"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFBE9E9"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFDF3DE"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF2F2F2"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF${AZUL_CLARO}"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border>
<left style="thin"><color rgb="FF${LINHA}"/></left><right style="thin"><color rgb="FF${LINHA}"/></right>
<top style="thin"><color rgb="FF${LINHA}"/></top><bottom style="thin"><color rgb="FF${LINHA}"/></bottom>
<diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="11">
<xf xfId="0" numFmtId="0" fontId="0" fillId="0" borderId="0"/>
<xf xfId="0" numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
<xf xfId="0" numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyAlignment="1"><alignment vertical="center" indent="1"/></xf>
<xf xfId="0" numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf xfId="0" numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf xfId="0" numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf xfId="0" numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf xfId="0" numFmtId="0" fontId="5" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf xfId="0" numFmtId="0" fontId="6" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf xfId="0" numFmtId="0" fontId="0" fillId="6" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf xfId="0" numFmtId="0" fontId="0" fillId="6" borderId="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
<dxfs count="0"/>
<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;

export interface CelulaXlsx { v?: string; s?: number }
export interface LinhaXlsx { altura?: number; celulas: CelulaXlsx[] }
export interface FolhaXlsx { nome?: string; cols?: number[]; linhas: LinhaXlsx[]; merges?: string[] }


/* ── planilha ─────────────────────────────────────────────────────────
   linhas = [{ altura?, celulas: [{v, s}] }]   ·  s = índice de estilo    */
function folhaXml({cols, linhas, merges}: FolhaXlsx){
  const corpo = linhas.map((ln, r) => {
    const cels = (ln.celulas||[]).map((c, i) => {
      if (c == null || c.v === '' || c.v == null)
        return c && c.s ? `<c r="${colLetra(i)}${r+1}" s="${c.s}"/>` : '';
      return `<c r="${colLetra(i)}${r+1}" s="${c.s||0}" t="inlineStr">`
           + `<is><t xml:space="preserve">${xmlEsc(c.v)}</t></is></c>`;
    }).join('');
    const alt = ln.altura ? ` ht="${ln.altura}" customHeight="1"` : '';
    return `<row r="${r+1}"${alt}>${cels}</row>`;
  }).join('');

  const mg = merges ?? [];
  const mm = mg.length
    ? `<mergeCells count="${mg.length}">`
      + mg.map(m => `<mergeCell ref="${m}"/>`).join('') + `</mergeCells>` : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="5" topLeftCell="A6" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="14"/>
<cols>${(cols||[]).map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')}</cols>
<sheetData>${corpo}</sheetData>${mm}
<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>
<pageSetup orientation="landscape" paperSize="9" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
}

export function baixarXlsx(arquivo: string, folha: FolhaXlsx){
  const partes = [
    {nome:'[Content_Types].xml', dados:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`},
    {nome:'_rels/.rels', dados:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`},
    {nome:'xl/workbook.xml', dados:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${xmlEsc((folha.nome||'Plano').slice(0,31))}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`},
    {nome:'xl/_rels/workbook.xml.rels', dados:
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`},
    {nome:'xl/styles.xml', dados: ESTILOS},
    {nome:'xl/worksheets/sheet1.xml', dados: folhaXml(folha)},
  ];

  const url = URL.createObjectURL(zipar(partes));
  const l = document.createElement('a');
  l.href = url; l.download = arquivo; l.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
