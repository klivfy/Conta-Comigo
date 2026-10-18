'use strict';
/* Gera: Conta-Comigo-Analise-de-Conceito-e-Propostas-de-Melhorias.docx
 * Receita de capa: R1 (Pure Paragraph Left) + paleta WM-1 (educação)
 * Arquitetura: capa (margem 0) -> sumário (romanos) -> corpo (arábicos, reinicia em 1)
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, PageNumber, NumberFormat, AlignmentType, HeadingLevel,
  WidthType, BorderStyle, ShadingType, TableLayoutType, SectionType,
  PageBreak, TableOfContents, LevelFormat,
} = require('docx');
const fs = require('fs');
const D = require('./analise_data.js');

/* ---------- Paleta WM-1 (Warm Teal — educação) ---------- */
const P = {
  bg: 'F4F1E9', primary: '15857A', accent: 'FF6A3B',
  titleColor: '15857A', subtitleColor: '606060', metaColor: '707070', footerColor: 'A0A0A0',
};
const T = { headerBg: '15857A', headerText: 'FFFFFF', accentLine: '15857A', innerLine: 'D5D0C8', surface: 'F0EDE5' };

const F = { ascii: 'Times New Roman', eastAsia: 'SimSun' };
const FH = { ascii: 'Times New Roman', eastAsia: 'SimHei' };

const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const CELL_M = { top: 60, bottom: 60, left: 120, right: 120 };

/* ---------- Larguras de texto (latino) ---------- */
function estimateTextWidth(text, pt) {
  let w = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    const isCJK = (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3000 && code <= 0x303F) || (code >= 0xFF00 && code <= 0xFFEF);
    w += isCJK ? pt * 20 : pt * 11;
  }
  return w;
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([...'，。、；：！？', ...'-_—–·/', ...' \t']);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  let titlePt = preferredPt;
  let lines = [title];
  while (titlePt >= minPt) {
    const cpl = Math.max(2, Math.floor(maxWidthTwips / (titlePt * 11)));
    lines = splitTitleLines(title, cpl);
    const fits = lines.every((l) => estimateTextWidth(l, titlePt) <= maxWidthTwips);
    if (lines.length <= 3 && fits) break;
    titlePt -= 2;
  }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0,
  } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

/* ---------- Capa R1 (Pure Paragraph Left) ---------- */
function buildCoverR1(config) {
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length,
    fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];

  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({
        text: config.englishLabel.split('').join('  '),
        size: 18, color: P.accent, font: { ascii: 'Calibri', eastAsia: 'SimHei' }, characterSpacing: 40,
      })],
    }));
  }

  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: 'atLeast' },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { eastAsia: 'SimHei', ascii: 'Arial' },
      })],
    }));
  }

  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({
        text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { eastAsia: 'Microsoft YaHei', ascii: 'Arial' },
      })],
    }));
  }

  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 24, color: P.metaColor,
        font: { eastAsia: 'Microsoft YaHei', ascii: 'Arial' },
      })],
    }));
  }

  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || '', size: 16, color: P.footerColor, font: { ascii: 'Arial' } }),
      new TextRun({ text: '                                        ' }),
      new TextRun({ text: config.footerRight || '', size: 16, color: P.footerColor, font: { ascii: 'Arial' } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: 'exact' },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        verticalAlign: 'top',
        children,
      })],
    })],
  })];
}

/* ---------- Helpers de corpo ---------- */
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: FH })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 30, color: P.primary, font: FH })],
  });
}

function para(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: '000000', font: F })],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: '000000', font: F })],
  });
}

function numbered(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: '000000', font: F })],
  });
}

function caption(num, text) {
  return new Paragraph({
    keepNext: true,
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 80, line: 312 },
    children: [
      new TextRun({ text: 'Tabela ' + num + ' — ', bold: true, size: 21, color: '404040', font: F }),
      new TextRun({ text, size: 21, color: '404040', font: F }),
    ],
  });
}

function buildTable(spec) {
  const pcts = spec.pcts;
  const centers = spec.centers || [];
  const mkCellPara = (text, isHeader, idx) => new Paragraph({
    alignment: centers.includes(idx) ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { line: 312 },
    children: [new TextRun({
      text, bold: isHeader, size: 21,
      color: isHeader ? T.headerText : '000000', font: F,
    })],
  });
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: spec.headers.map((t, i) => new TableCell({
      width: { size: pcts[i], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: T.headerBg },
      margins: CELL_M,
      children: [mkCellPara(t, true, i)],
    })),
  });
  const rows = spec.rows.map((r) => new TableRow({
    cantSplit: true,
    children: r.map((t, i) => new TableCell({
      width: { size: pcts[i], type: WidthType.PERCENTAGE },
      margins: CELL_M,
      children: [mkCellPara(t, false, i)],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: T.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: T.accentLine },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: T.innerLine },
      insideVertical: NB,
    },
    rows: [headerRow, ...rows],
  });
}

/* ---------- Corpo do documento ---------- */
const body = [];
body.push(h1('1. Sumário Executivo'));
D.execSummary.forEach((t) => body.push(para(t)));

body.push(h1('2. Visão Geral do Produto'));
body.push(h2('2.1 O que é a extensão Conta Comigo'));
D.sec21.forEach((t) => body.push(para(t)));
body.push(h2('2.2 Funcionalidades implementadas na versão 1.1.0'));
D.sec22Intro.forEach((t) => body.push(para(t)));
body.push(caption(1, 'Funcionalidades da extensão por domínio'));
body.push(buildTable(D.featuresTable));
D.sec22Close.forEach((t) => body.push(para(t)));
body.push(h2('2.3 Princípios pedagógicos que sustentam o conceito'));
D.sec23.forEach((t) => body.push(para(t)));

body.push(h1('3. Diagnóstico do Conceito'));
body.push(h2('3.1 Pontos fortes'));
D.sec31Intro.forEach((t) => body.push(para(t)));
D.sec31Bullets.forEach((t) => body.push(bullet(t)));
D.sec31Close.forEach((t) => body.push(para(t)));
body.push(h2('3.2 Limitações atuais'));
D.sec32.forEach((t) => body.push(para(t)));
body.push(h2('3.3 Síntese SWOT'));
D.sec33Intro.forEach((t) => body.push(para(t)));
body.push(caption(2, 'Matriz SWOT da extensão Conta Comigo'));
body.push(buildTable(D.swotTable));
D.sec33Close.forEach((t) => body.push(para(t)));

body.push(h1('4. Metodologia das Propostas'));
D.sec4.slice(0, 2).forEach((t) => body.push(para(t)));
body.push(para(D.sec4[2]));
D.categorias.forEach((t) => body.push(numbered(t, 'categorias-lista')));

body.push(h1('5. Propostas de Melhorias e Novas Funcionalidades'));
D.sec5Intro.forEach((t) => body.push(para(t)));
let tableNo = 3;
for (const cat of D.categories) {
  body.push(h2(cat.title));
  body.push(para(cat.intro));
  body.push(caption(tableNo, 'Propostas de ' + cat.title.replace(/^5\.\d+ /, '').toLowerCase()));
  body.push(buildTable({
    headers: D.sugHeaders, pcts: D.sugPcts, rows: cat.items.map((it) => [it.no, it.name, it.desc, it.impact, it.effort]),
    centers: [0, 3, 4],
  }));
  body.push(para(cat.highlight));
  tableNo++;
}

body.push(h1('6. Priorização e Roadmap'));
body.push(h2('6.1 Matriz de priorização'));
D.sec61Intro.forEach((t) => body.push(para(t)));
body.push(caption(9, 'Quadrantes de decisão por impacto e esforço'));
body.push(buildTable(D.prioritization));
D.sec61Close.forEach((t) => body.push(para(t)));
body.push(h2('6.2 Roadmap sugerido por versão'));
D.sec62Intro.forEach((t) => body.push(para(t)));
body.push(caption(10, 'Distribuição das 36 propostas por onda de versão'));
body.push(buildTable(D.roadmap));
D.sec62Close.forEach((t) => body.push(para(t)));

body.push(h1('7. Conclusões e Próximos Passos'));
D.sec7.forEach((t) => body.push(para(t)));

/* ---------- Sumário (front matter) ---------- */
const tocChildren = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 360, line: 312 },
    children: [new TextRun({ text: 'Sumário', bold: true, size: 32, color: P.primary, font: FH })],
  }),
  new TableOfContents('Sumário', { hyperlink: true, headingStyleRange: '1-2' }),
  new Paragraph({
    spacing: { before: 200, line: 312 },
    children: [new TextRun({
      text: 'Nota: este sumário é gerado por códigos de campo. Após editar o documento, clique com o botão direito sobre o sumário e selecione \u201CAtualizar campo\u201D para recalcular os números de página.',
      italics: true, size: 18, color: '888888', font: F,
    })],
  }),
  // Sem PageBreak aqui: a Seção 3 já é NEXT_PAGE (quebra dupla geraria página em branco)
];

/* ---------- Cabeçalho e rodapé ---------- */
function bodyHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240 },
      children: [new TextRun({
        text: 'Conta Comigo — Análise de Conceito e Propostas de Melhorias',
        size: 18, color: '808080', font: F,
      })],
    })],
  });
}

function pageFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 240 },
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '808080', font: F })],
    })],
  });
}

/* ---------- Documento ---------- */
const PAGE = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
};

const doc = new Document({
  creator: 'Conta Comigo',
  title: 'Conta Comigo — Análise de Conceito e Propostas de Melhorias',
  styles: {
    default: {
      document: {
        run: { font: F, size: 24, color: '000000' },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FH, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: FH, size: 30, bold: true, color: P.primary },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
    },
  },
  numbering: {
    config: [{
      reference: 'categorias-lista',
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: '%1.',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  sections: [
    { // Seção 1: capa — margem 0, sem rodapé, sem numeração
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCoverR1(D.cover),
    },
    { // Seção 2: sumário — romanos i, ii...
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { ...PAGE, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      footers: { default: pageFooter() },
      children: tocChildren,
    },
    { // Seção 3: corpo — arábicos, reinicia em 1
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { ...PAGE, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: { default: bodyHeader() },
      footers: { default: pageFooter() },
      children: body,
    },
  ],
});

const OUT = '/home/z/my-project/download/Conta-Comigo-Analise-de-Conceito-e-Propostas-de-Melhorias.docx';
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('OK: ' + OUT + ' (' + buf.length + ' bytes)');
}).catch((e) => { console.error('FALHA:', e); process.exit(1); });
