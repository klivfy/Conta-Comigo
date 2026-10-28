#!/usr/bin/env node
/* Cópias que precisam ficar iguais (E3 da auditoria). Falha quando:
   1. a tela do jogo difere entre game.html, popup.html e web/index.html
      (DESIGN.md: "mantenha a mesma marcação"), além das diferenças previstas;
   2. um workflow do kit (download/kit-fase1/workflows) difere do .github/workflows;
   3. alguma versão gravada no código difere da do manifest.json.
   Uso: node scripts/sync_check.cjs   (sai com código 1 se algo divergir) */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'download', 'conta-comigo');
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');
const bad = [];

/* ---------- 1. tela do jogo nas três páginas ---------- */
/* O que pode mudar de propósito: caminhos "../" da versão web, o selo das
   escolas e, no popup, o espaço no lugar do botão de backup (baixar arquivo
   de dentro do popup da extensão não é confiável). */
const BACKUP_BTN = /<button id="btn-backup"[^>]*>[^<]*<\/button>/;
function body(file) {
  let s = read(SRC, file);
  s = s.slice(s.indexOf('<body'), s.indexOf('</body>'));
  return s
    .replace(/^<body[^>]*>/, '')
    .replace(/(src|href)="\.\.\//g, '$1="')
    .replace(/\s*<div class="web-stamp">[^<]*<\/div>/, '')
    .split('\n').map((l) => l.trimEnd()).filter(Boolean);
}
function firstDiff(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return i;
  return -1;
}
const game = body('game.html');
const web = body('web/index.html');
const popup = body('popup.html').map((l) => l.replace('<div style="width:44px"></div>', (game.find((g) => BACKUP_BTN.test(g)) || '').trim()));
for (const [name, other] of [['web/index.html', web], ['popup.html', popup]]) {
  const i = firstDiff(game.map((l) => l.trim()), other.map((l) => l.trim()));
  if (i >= 0) bad.push('tela do jogo: ' + name + ' difere de game.html na linha ' + (i + 1) + ' do <body>:\n      game.html: ' + (game[i] || '(fim)').trim() + '\n      ' + name + ': ' + (other[i] || '(fim)').trim());
}

/* ---------- 2. workflows do kit ---------- */
const WF = path.join(ROOT, '.github', 'workflows');
const KIT = path.join(ROOT, 'download', 'kit-fase1', 'workflows');
for (const f of fs.readdirSync(WF)) {
  if (!fs.existsSync(path.join(KIT, f))) bad.push('kit: falta download/kit-fase1/workflows/' + f);
  else if (read(WF, f) !== read(KIT, f)) bad.push('kit: download/kit-fase1/workflows/' + f + ' difere de .github/workflows/' + f);
}

/* ---------- 3. versão ---------- */
const V = JSON.parse(read(SRC, 'manifest.json')).version;
const [maj, min, pat] = V.split('.').map(Number);
const CODE = String(maj * 100 + min * 10 + pat);
const want = [
  ['native/windows/package.json', /"version": "([^"]+)"/, V],
  ['native/ios/package.json', /"version": "([^"]+)"/, V],
  ['native/android/twa-manifest.json', /"appVersionName": "([^"]+)"/, V],
  ['native/android/twa-manifest.json', /"appVersionCode": (\d+)/, CODE],
  ['native/android/app/build.gradle', /versionName "([^"]+)"/, V],
  ['native/android/app/build.gradle', /versionCode (\d+)/, CODE],
  ['native/ios/ios/App/App.xcodeproj/project.pbxproj', /MARKETING_VERSION = ([^;]+);/g, V],
  ['download/conta-comigo/js/boot.js', /return '(\d+\.\d+\.\d+)';/, V],
  ['download/conta-comigo/js/ui.js', /ccVersion\(\) : '(\d+\.\d+\.\d+)'/, V],
  ['download/conta-comigo/js/options.js', /ccVersion\(\) : '(\d+\.\d+\.\d+)'/, V],
  ['download/conta-comigo/game.html', /class="cc-ver"[^>]*>v([^<]+)</, V],
  ['download/conta-comigo/popup.html', /class="cc-ver"[^>]*>v([^<]+)</, V],
  ['download/conta-comigo/web/index.html', /class="cc-ver"[^>]*>v([^<]+)</, V],
  ['download/conta-comigo/web/index.html', /versão para escolas · v([^<]+)</, V],
];
for (const [file, re, expect] of want) {
  const txt = read(ROOT, file);
  const found = re.global ? [...txt.matchAll(re)].map((m) => m[1]) : [(txt.match(re) || [])[1]];
  if (!found.length || found.some((x) => x !== expect)) bad.push('versão: ' + file + ' tem ' + (found.join(', ') || 'nada') + ', o manifest tem ' + expect);
}

if (bad.length) { console.log('FALHOU\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — tela do jogo igual nas 3 páginas, ' + fs.readdirSync(WF).length + ' workflows iguais ao kit, versão ' + V + ' em ' + want.length + ' lugares');
