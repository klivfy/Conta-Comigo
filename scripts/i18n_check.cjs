#!/usr/bin/env node
/* Fase 5 — toda chave de texto usada nas páginas e no JS existe em pt, en e es.
   Uso: node scripts/i18n_check.cjs   (sai com código 1 se faltar alguma) */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', 'download', 'conta-comigo');
const I18N = new Function('window', 'document', 'navigator',
  fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8') + ';return I18N')({}, {}, { language: 'pt' });
const used = new Set();
for (const f of ['game.html', 'popup.html', 'web/index.html', 'options.html', 'newtab.html', 'demo.html']) {
  for (const m of fs.readFileSync(path.join(ROOT, f), 'utf8').matchAll(/data-i18n(?:-label|-ph|-title)?="([a-z0-9_]+)"/g)) used.add(m[1]);
}
for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
  // t('chave') literal; prefixos montados em tempo de execução (t('th_' + id)) ficam de fora
  for (const m of fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').matchAll(/\bt\('([a-z0-9_]+)'\s*([+,)])/g)) if (m[2] !== '+') used.add(m[1]);
}
let bad = 0;
for (const lang of Object.keys(I18N)) {
  const miss = [...used].filter((k) => !(k in I18N[lang]));
  if (miss.length) { bad++; console.log(lang + ': faltando ' + miss.join(', ')); }
}
console.log(bad ? 'FALHOU' : 'OK — ' + used.size + ' chaves presentes em ' + Object.keys(I18N).join('/'));
process.exit(bad ? 1 : 0);
