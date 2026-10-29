#!/usr/bin/env node
/* Dívida do design system (plano 7.2 e 8.E4): conta os valores soltos no CSS e falha se algum
   número SUBIR em relação ao teto abaixo. Quando a dívida cair, baixe o teto no mesmo commit.
   Uso: node scripts/tokens_check.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname, '..', 'download', 'conta-comigo', 'css', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const SP = new Set(['2', '4', '6', '8', '12', '16', '24', '36']); // valores que já têm token --sp-*
const FS_REM = new Set(['.6875', '.78125', '.875', '1', '1.1875', '1.5', '1.75', '2.5']); // e --fs-*

const espaco = /(?<![\w-])((?:padding|margin)[\w-]*|(?:row-|column-)?gap)\s*:\s*([^;{}]+)/g;
let soltoSemToken = 0, soltoComToken = 0, m;
while ((m = espaco.exec(css))) {
  if (/calc\(|clamp\(|min\(|max\(|env\(/.test(m[2])) continue;
  for (const v of m[2].match(/-?\d*\.?\d+px/g) || []) (SP.has(v.replace('px', '')) ? soltoComToken++ : soltoSemToken++);
}
let fsRemSolto = 0;
const fonte = /font-size\s*:\s*(\d*\.?\d+)rem/g;
while ((m = fonte.exec(css))) if (FS_REM.has(m[1].replace(/^0\./, '.'))) fsRemSolto++;
const usos = { sp: (css.match(/var\(--sp-/g) || []).length, fs: (css.match(/var\(--fs-/g) || []).length };

/* tetos: o estado depois da rodada de 29/10/2026. Só podem descer. */
const TETO = { soltoComToken: 0, fsRemSolto: 0, soltoSemToken: 137 };
const medido = { soltoComToken, fsRemSolto, soltoSemToken };
console.log('espaço em px com token disponível, mas sem usar:', soltoComToken, '(teto ' + TETO.soltoComToken + ')');
console.log('font-size em rem com token disponível, mas sem usar:', fsRemSolto, '(teto ' + TETO.fsRemSolto + ')');
console.log('espaço em px fora da escala (10px, 14px…):', soltoSemToken, '(teto ' + TETO.soltoSemToken + ')');
console.log('usos de var(--sp-*):', usos.sp, '· var(--fs-*):', usos.fs);
const ruim = Object.keys(TETO).filter((k) => medido[k] > TETO[k]);
if (ruim.length) { console.error('FALHOU: use var(--sp-*) / var(--fs-*) em vez de valor solto (' + ruim.join(', ') + ')'); process.exit(1); }
console.log('OK');
