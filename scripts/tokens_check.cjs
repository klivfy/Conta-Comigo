#!/usr/bin/env node
/* Dívida do design system (plano 7.2 e 8.E4): conta os valores soltos no CSS e falha se algum
   número SUBIR em relação ao teto abaixo. Quando a dívida cair, baixe o teto no mesmo commit.
   Uso: node scripts/tokens_check.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'download', 'conta-comigo');
const semComentario = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '');
const css = semComentario(fs.readFileSync(path.join(SRC, 'css', 'style.css'), 'utf8'));
/* nov/2026: o <style> do painel dos responsáveis (options.html) também entra na conta, com teto próprio */
const cssPainel = semComentario((fs.readFileSync(path.join(SRC, 'options.html'), 'utf8').match(/<style>[\s\S]*?<\/style>/g) || []).join('\n'));
const SP = new Set(['2', '4', '6', '8', '12', '16', '24', '36']); // valores que já têm token --sp-*
const FS_REM = new Set(['.75', '.8125', '.875', '1', '1.1875', '1.5', '1.75', '2.5']); // e --fs-*

function contar(texto) {
  const espaco = /(?<![\w-])((?:padding|margin)[\w-]*|(?:row-|column-)?gap)\s*:\s*([^;{}]+)/g;
  let semToken = 0, comToken = 0, fsRem = 0, m;
  while ((m = espaco.exec(texto))) {
    if (/calc\(|clamp\(|min\(|max\(|env\(/.test(m[2])) continue;
    for (const v of m[2].match(/-?\d*\.?\d+px/g) || []) (SP.has(v.replace('px', '')) ? comToken++ : semToken++);
  }
  const fonte = /font-size\s*:\s*(\d*\.?\d+)rem/g;
  while ((m = fonte.exec(texto))) if (FS_REM.has(m[1].replace(/^0\./, '.'))) fsRem++;
  return { semToken, comToken, fsRem };
}
const jogo = contar(css), painel = contar(cssPainel);
const soltoSemToken = jogo.semToken, soltoComToken = jogo.comToken, fsRemSolto = jogo.fsRem;
/* v2.7.3: toda transition de transform/box-shadow/opacity precisa de curva (var(--ease-*), linear ou ease) */
let semCurva = 0;
for (const t of css.match(/transition\s*:[^;}]+/g) || []) if (!/ease|linear/.test(t) && /transform|box-shadow|opacity/.test(t)) semCurva++;
const usos = { sp: (css.match(/var\(--sp-/g) || []).length, fs: (css.match(/var\(--fs-/g) || []).length };

/* tetos: só podem descer. 29/10/2026: 133 fora da escala no jogo. nov/2026: 7, 9, 11 e 13px viraram
   var(--sp-*) (101 no jogo) e o painel entrou na conta. O 10px (o mais comum) fica para um lote próprio,
   porque mudar 2px em dezenas de lugares aparece na tela. */
const TETO = { soltoComToken: 0, fsRemSolto: 0, soltoSemToken: 101, semCurva: 0,
  painelComToken: 0, painelFsRem: 0, painelSemToken: 26 };
const medido = { soltoComToken, fsRemSolto, soltoSemToken, semCurva,
  painelComToken: painel.comToken, painelFsRem: painel.fsRem, painelSemToken: painel.semToken };
console.log('espaço em px com token disponível, mas sem usar:', soltoComToken, '(teto ' + TETO.soltoComToken + ')');
console.log('font-size em rem com token disponível, mas sem usar:', fsRemSolto, '(teto ' + TETO.fsRemSolto + ')');
console.log('espaço em px fora da escala (10px, 14px…):', soltoSemToken, '(teto ' + TETO.soltoSemToken + ')');
console.log('transições sem curva:', semCurva, '(teto ' + TETO.semCurva + ')');
console.log('painel (options.html): espaço com token sem usar', painel.comToken, '(teto 0) · font-size rem com token sem usar', painel.fsRem,
  '(teto 0) · espaço fora da escala', painel.semToken, '(teto ' + TETO.painelSemToken + ')');
console.log('usos de var(--sp-*):', usos.sp, '· var(--fs-*):', usos.fs);
const ruim = Object.keys(TETO).filter((k) => medido[k] > TETO[k]);
if (ruim.length) { console.error('FALHOU: use var(--sp-*) / var(--fs-*) em vez de valor solto (' + ruim.join(', ') + ')'); process.exit(1); }
console.log('OK');
