'use strict';
/* PWA: compartilhar o backup no iPhone instalado e conferência estática do pacote gerado por build_pwa.py.
   O teste de navegador (instalar, offline, convite) está em scripts/pwa_check.cjs. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadEngine } = require('./load-engine.cjs');

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

/* ambiente com share/canShare/download simulados; devolve o que foi chamado */
function amb({ ua, standalone = true, canShare = true, shareImpl }) {
  const calls = { share: [], download: 0 };
  const nav = {
    userAgent: ua, standalone,
    canShare: () => canShare,
    share: (d) => { calls.share.push(d); return shareImpl ? shareImpl(d) : Promise.resolve(); },
  };
  const doc = {
    querySelector: () => null, querySelectorAll: () => [],
    body: { dataset: {}, classList: { toggle() {}, contains: () => false }, appendChild() {} },
    documentElement: {},
    createElement: () => ({ click() { calls.download++; }, remove() {} }),
  };
  const E = loadEngine({
    navigator: nav,
    globals: { File, Blob, URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} }, document: doc },
  });
  return { E, calls };
}

test('PWA no iPhone instalada: o backup sai pela folha de compartilhar, e a segunda exportação também', async () => {
  const { E, calls } = amb({ ua: IPHONE });
  assert.strictEqual(await E.ev("saveTextFile('b.json', '{}', 'Backup')"), true);
  assert.strictEqual(calls.share.length, 1);
  assert.strictEqual(calls.share[0].files[0].name, 'b.json');
  assert.strictEqual(calls.share[0].files[0].type, 'application/json');
  assert.strictEqual(calls.download, 0, 'não pode cair em download');
  assert.strictEqual(E.ev('FILE_VIA_SHARE'), true, 'o aviso passa a dizer "guardado"');
  // regressão: FILE_VIA_SHARE ficou true, mas não há plugin nativo; a segunda chamada não pode quebrar
  assert.strictEqual(await E.ev("saveTextFile('c.json', '{}', 'Backup')"), true);
  assert.strictEqual(calls.share.length, 2);
  assert.strictEqual(calls.download, 0);
});

test('PWA no iPhone: cancelar a folha devolve false e não baixa nada', async () => {
  const { E, calls } = amb({ ua: IPHONE, shareImpl: () => Promise.reject(Object.assign(new Error('x'), { name: 'AbortError' })) });
  assert.strictEqual(await E.ev("saveTextFile('b.json', '{}', 'Backup')"), false);
  assert.strictEqual(calls.download, 0);
});

test('PWA no iPhone: falha da folha que não é cancelamento cai no download comum', async () => {
  const { E, calls } = amb({ ua: IPHONE, shareImpl: () => Promise.reject(Object.assign(new Error('x'), { name: 'NotAllowedError' })) });
  assert.strictEqual(await E.ev("saveTextFile('b.json', '{}', 'Backup')"), true);
  assert.strictEqual(calls.download, 1);
});

test('fora do caso (computador, iPhone em aba, canShare sem arquivos): download comum, sem folha', async () => {
  for (const cfg of [{ ua: DESKTOP }, { ua: IPHONE, standalone: false }, { ua: IPHONE, canShare: false }]) {
    const { E, calls } = amb(cfg);
    assert.strictEqual(await E.ev("saveTextFile('b.json', '{}', 'Backup')"), true);
    assert.strictEqual(calls.share.length, 0, JSON.stringify(cfg));
    assert.strictEqual(calls.download, 1, JSON.stringify(cfg));
  }
});

/* ---- pacote gerado (python3 scripts/build_pwa.py) ---- */
const PWA = path.join(__dirname, '..', 'download', 'conta-comigo-pwa');
const gerado = fs.existsSync(path.join(PWA, 'index.html'));
const lerPWA = (f) => fs.readFileSync(path.join(PWA, f), 'utf8');

test('pacote da PWA: Android e iPhone sem bloqueio, com as metas do iOS e o convite de instalar', { skip: !gerado && 'rode python3 scripts/build_pwa.py' }, () => {
  const boot = lerPWA('js/boot.js');
  assert.ok(!/ANDROID_WEB|Android\/i/.test(boot), 'o bloqueio do Android saiu');
  assert.ok(/serviceWorker\.register\('\.\/sw\.js'/.test(boot));
  const html = lerPWA('index.html');
  for (const m of ['apple-mobile-web-app-capable', 'apple-mobile-web-app-title', 'apple-mobile-web-app-status-bar-style', 'rel="manifest"', 'apple-touch-icon-180.png', 'js/pwa.js']) {
    assert.ok(html.includes(m), 'falta ' + m);
  }
  assert.ok(html.indexOf('js/ui.js') < html.indexOf('js/pwa.js'), 'pwa.js carrega depois do ui.js');
  assert.ok(/script-src 'self'/.test(html) && !/unsafe-eval/.test(html));
  const man = JSON.parse(lerPWA('manifest.webmanifest'));
  assert.strictEqual(man.display, 'standalone');
  assert.strictEqual(man.id, 'conta-comigo-pwa', 'trocar o id faria o navegador ver outro app');
  for (const i of man.icons) assert.ok(fs.existsSync(path.join(PWA, i.src)), i.src);
  const sw = lerPWA('sw.js');
  for (const a of ['./js/pwa.js', './icons/apple-touch-icon-180.png']) assert.ok(sw.includes(a), 'sw sem ' + a);
  // todo item do cache existe
  const assets = JSON.parse(sw.match(/const ASSETS = (\[.*?\]);/s)[1]);
  for (const a of assets) assert.ok(fs.existsSync(path.join(PWA, a)), 'cache aponta para arquivo que não existe: ' + a);
});

test('pacote da PWA: ícone do iPhone tem 180 px, sem transparência', { skip: !gerado && 'rode python3 scripts/build_pwa.py' }, () => {
  const png = fs.readFileSync(path.join(PWA, 'icons', 'apple-touch-icon-180.png'));
  assert.strictEqual(png.readUInt32BE(16), 180);
  assert.strictEqual(png.readUInt32BE(20), 180);
  assert.strictEqual(png[25], 2, 'color type 2 = RGB, sem canal alfa (o iOS põe fundo preto no transparente)');
});

test('convite de instalar: todas as chaves existem em pt, en e es e o arquivo não usa innerHTML', () => {
  const E = loadEngine();
  for (const lang of ['pt', 'en', 'es']) {
    for (const k of ['pwa_title', 'pwa_body_android', 'pwa_body_ios', 'pwa_btn_install', 'pwa_btn_later']) {
      const v = E.ev(`I18N.${lang}.${k}`);
      assert.ok(typeof v === 'string' && v.length > 3, lang + '.' + k);
    }
  }
  const src = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'pwa', 'pwa.js'), 'utf8');
  const codigo = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); // sem comentários
  assert.ok(!/innerHTML|outerHTML|insertAdjacentHTML|eval\(|document\.write/.test(codigo));
});
