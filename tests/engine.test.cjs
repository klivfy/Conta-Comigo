'use strict';
/* Testes do motor (download/conta-comigo/js/engine.js): hash da senha,
   validação do backup e geradores de questões. Rodar: node --test tests/*.test.cjs */
const test = require('node:test');
const assert = require('node:assert/strict');
const nodeCrypto = require('crypto');
const { loadEngine } = require('./load-engine.cjs');

const E = loadEngine();
/* resultados cruzam de contexto via JSON (arrays de outro "realm" não são deepEqual) */
const j = (code) => JSON.parse(E.ev('JSON.stringify(' + code + ')'));

test('SHA-256 em JS puro bate com vetores conhecidos e com o node', () => {
  assert.equal(E.ev('ccSha256Hex("")'), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(E.ev('ccSha256Hex("abc")'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  for (const txt of ['a:picole', 'faca-ceia:çãõáéíóú123!@#', 'x'.repeat(200)]) {
    const want = nodeCrypto.createHash('sha256').update(txt, 'utf8').digest('hex');
    assert.equal(E.ev('ccSha256Hex(' + E.put('t', txt) + ')'), want, txt.slice(0, 20));
  }
});

test('PBKDF2 em JS puro bate com o node (inclui senha > 64 bytes e acentos)', () => {
  const cases = [['senha123', 'abc', 1], ['senha123', 'abc', 2], ['pão de queijo', '00ff', 1000], ['p'.repeat(100), 'sal', 50]];
  for (const [pw, salt, iter] of cases) {
    const want = nodeCrypto.pbkdf2Sync(pw, salt, iter, 32, 'sha256').toString('hex');
    assert.equal(E.ev('ccPbkdf2Hex(' + E.put('pw', pw) + ', ' + E.put('s', salt) + ', ' + iter + ')'), want, pw.slice(0, 12) + ' × ' + iter);
  }
});

test('senha nova: PBKDF2 com 600 mil rodadas via WebCrypto, confere certo e errado', async () => {
  const salt = E.ev('PASS.salt()');
  assert.match(salt, /^[0-9a-f]{32}$/);
  const h = await E.ev('PASS.hash("girafa7", ' + E.put('s', salt) + ')');
  assert.match(h, /^pbkdf2\$600000\$[0-9a-f]{64}$/);
  assert.equal(h.split('$')[2], nodeCrypto.pbkdf2Sync('girafa7', salt, 600000, 32, 'sha256').toString('hex'));
  assert.equal(await E.ev('PASS.verify("girafa7", __in.s, ' + E.put('h', h) + ')'), true);
  assert.equal(await E.ev('PASS.verify("girafa8", __in.s, __in.h)'), false);
  assert.equal(E.ev('PASS.needsUpgrade(__in.h)'), false);
});

test('senha antiga (SHA-256 de uma rodada) ainda entra e pede atualização', async () => {
  const legacy = nodeCrypto.createHash('sha256').update('abcd:1234').digest('hex');
  assert.equal(await E.ev('PASS.verify("1234", "abcd", ' + E.put('h', legacy) + ')'), true);
  assert.equal(await E.ev('PASS.verify("1235", "abcd", __in.h)'), false);
  assert.equal(E.ev('PASS.needsUpgrade(__in.h)'), true);
  // formatos estranhos não passam
  assert.equal(await E.ev('PASS.verify("1234", "abcd", "pbkdf2$99999999$' + 'a'.repeat(64) + '")'), false);
  assert.equal(await E.ev('PASS.verify("1234", "abcd", "<b>")'), false);
});

test('sem WebCrypto: fallback em JS com 100 mil rodadas, e o hash vale nos dois lados', async () => {
  const N = loadEngine({ subtle: false });
  const h = await N.ev('PASS.hash("girafa7", "sal1")');
  assert.match(h, /^pbkdf2\$100000\$[0-9a-f]{64}$/);
  assert.equal(h.split('$')[2], nodeCrypto.pbkdf2Sync('girafa7', 'sal1', 100000, 32, 'sha256').toString('hex'));
  assert.equal(await N.ev('PASS.verify("girafa7", "sal1", ' + N.put('h', h) + ')'), true);
  assert.equal(N.ev('PASS.needsUpgrade(__in.h)'), false); // aqui não há WebCrypto para subir
  assert.equal(E.ev('PASS.needsUpgrade(' + E.put('h', h) + ')'), true); // onde há, sobe para 600 mil
});

function backupWith(review, extra) {
  const p = Object.assign({ id: 'p1', name: 'Ana', avatar: '🦊', stars: 10, review }, extra || {});
  return JSON.stringify({ v: 2, updatedAt: 1, activeId: 'p1', profiles: [p], settings: { lang: 'pt' } });
}

test('backup com HTML nos cartões de revisão: o cartão é descartado', () => {
  const evil = '<meta http-equiv="refresh" content="0;url=https://example.com">';
  const review = [
    { m: 'comparar', lv: 3, f: { a: evil, b: 1 }, box: 1, due: '2020-01-01' },
    { m: 'sequencia', lv: 2, f: { s: '<a href=x>', d: 1 }, box: 1, due: '2020-01-01' },
    { m: 'historia', lv: 2, f: { op: '<i>', a: 1, b: 2, g: 0, k: 0, it: 0, ni: 0 }, box: 1, due: '2020-01-01' },
    { m: 'dinheiro', lv: 3, f: { kind: 'change', p: 5, v: '9<br>' }, box: 1, due: '2020-01-01' },
    { m: 'contar', lv: 1, f: { it: 99, n: 3 }, box: 1, due: '2020-01-01' },
    { m: 'contar', lv: 1, f: { it: 0, n: 1e9 }, box: 1, due: '2020-01-01' },
    { m: 'constructor', lv: 1, f: { a: 1 }, box: 1, due: '2020-01-01' },
    { m: 'somar', lv: 2, f: { it: 1, a: 2, b: 3 }, box: 2, due: '2020-01-01' }, // legítimo
  ];
  const d = j('parseDB(' + E.put('raw', backupWith(review)) + ')');
  assert.deepEqual(d.profiles[0].review, [{ m: 'somar', lv: 2, f: { it: 1, a: 2, b: 3 }, box: 2, due: '2020-01-01' }]);
});

test('cartão ruim que escape da validação vira uma questão comum, sem HTML', () => {
  const card = { m: 'comparar', lv: 3, f: { a: '<meta http-equiv="refresh" content="0">', b: 1 } };
  const q = j('makeFromCard(' + E.put('c', card) + ')');
  assert.doesNotMatch(q.visual, /meta|refresh/);
  assert.doesNotMatch(q.display, /</);
});

test('normalizeDB: chaves perigosas, tipos errados, tema e idioma fora da lista', () => {
  const raw = backupWith([], {
    levels: JSON.parse('{"somar": 3, "__proto__": {"x": 1}, "dividir": "<b>"}'),
    recent: { somar: 'abc', contar: [true, 0, 1] },
    lvl: { somar: { 1: { r: '<i>', w: 2 } }, contar: 'x' },
    today: { d: '2099-01-01', rounds: 0, done: false, modes: 'abc' },
    stickers: [0, 0, 3, -1, 999, '<b>'], ach: { a1: 1, 'a b': 1 },
    owned: { themes: ['classico', { x: 1 }], hats: 'x', pets: [] },
  }).replace('"settings":{"lang":"pt"}', '"settings":{"lang":"xx","theme":"x\\"]","volume":50}');
  const d = j('parseDB(' + E.put('raw', raw) + ')');
  const p = d.profiles[0];
  assert.deepEqual(p.levels, { somar: 3, dividir: 1 });
  assert.deepEqual(p.recent, { contar: [true, false, true] });
  assert.deepEqual(p.lvl, { somar: { 1: { r: 0, w: 2 } }, contar: {} });
  assert.deepEqual(p.today.modes, {});
  assert.deepEqual(p.stickers, [0, 3]);
  assert.deepEqual(p.ach, { a1: 1 });
  assert.deepEqual(p.owned, { themes: ['classico'], hats: [], pets: ['fox'] });
  assert.equal(d.settings.lang, 'pt'); // volta ao idioma do navegador simulado
  assert.equal(d.settings.theme, 'auto');
  assert.equal(d.settings.volume, 1);
});

test('backup e sync não levam a senha; importar mantém a senha do aparelho', () => {
  E.ev(`DB = parseDB(JSON.stringify({ v: 2, activeId: 'p1', profiles: [{ id: 'p1' }],
    settings: { passHash: 'pbkdf2$600000$${'a'.repeat(64)}', passSalt: 's', passHint: 'gato', passSetAt: 5, passTries: 1 } }))`);
  const out = j('shareableDB(DB)');
  for (const k of ['passHash', 'passSalt', 'passHint', 'passSetAt', 'passTries', 'passLockUntil']) assert.equal(k in out.settings, false, k);
  assert.equal(E.ev('DB.settings.passHint'), 'gato'); // o original não muda
  // backup antigo trazendo outra senha: vale a local
  const old = backupWith([]).replace('"settings":{"lang":"pt"}', '"settings":{"passHash":"' + 'b'.repeat(64) + '","passSalt":"x","passHint":"outra"}');
  const merged = j('keepLocalSecrets(parseDB(' + E.put('raw', old) + '), DB).settings');
  assert.equal(merged.passHint, 'gato');
  assert.equal(merged.passSalt, 's');
});

test('geradores: resposta entre as opções, opções únicas, e o cartão de revisão passa na validação', () => {
  const modes = ['contar', 'somar', 'subtrair', 'faltar', 'comparar', 'sequencia', 'dobrar', 'multiplicar', 'dividir', 'historia', 'dinheiro'];
  for (const lang of ['pt', 'en', 'es']) {
    E.ev('LANG = "' + lang + '"');
    for (const m of modes) {
      for (let lv = 1; lv <= 5; lv++) {
        for (let i = 0; i < 30; i++) {
          const q = j('GENS.' + m + '(' + lv + ')');
          const opts = q.options.map(String);
          assert.ok(opts.includes(String(q.answer)), m + ' nv' + lv + ': resposta fora das opções');
          assert.equal(new Set(opts).size, opts.length, m + ' nv' + lv + ': opções repetidas');
          assert.ok(opts.length >= 2 && opts.length <= 4, m + ' nv' + lv + ': ' + opts.length + ' opções');
          const back = j('cleanReviewF("' + m + '", ' + E.put('f', q.f) + ')');
          assert.deepEqual(back, q.f, m + ' nv' + lv + ': cartão legítimo recusado ' + JSON.stringify(q.f));
          const again = j('makeFromCard({ m: "' + m + '", lv: ' + lv + ', f: ' + JSON.stringify(q.f) + ' })');
          assert.equal(String(again.answer), String(q.answer), m + ' nv' + lv + ': revisão muda a resposta');
        }
      }
    }
  }
  E.ev('LANG = "pt"');
});
