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

test('alto contraste: o antigo hc vira contrast (sim → on, não → segue o sistema)', () => {
  const s = (settings) => j('parseDB(' + E.put('raw', JSON.stringify({ v: 2, activeId: 'p1', profiles: [{ id: 'p1' }], settings })) + ').settings');
  assert.equal(s({ hc: true }).contrast, 'on');
  assert.equal(s({ hc: false }).contrast, 'auto');
  assert.equal(s({}).contrast, 'auto');
  assert.equal(s({ contrast: 'off', hc: true }).contrast, 'off');
  assert.equal(s({ contrast: '<x>' }).contrast, 'auto');
  assert.equal('hc' in s({ hc: true }), false);
});

/* ---------- regras de recompensa ---------- */
const profile = (extra) => j('Object.assign(newProfile("p1", "Ana", "🦊"), ' + JSON.stringify(extra || {}) + ')');
function run(code, p) {
  E.put('p', p);
  const out = JSON.parse(E.ev('JSON.stringify((function (p) { const r = ' + code + '; return { r, p }; })(__in.p))'));
  return out;
}

test('answerReward: estrelas, pontos por rapidez, chefe e combo', () => {
  const rw = (a) => j('answerReward(' + JSON.stringify(a) + ')');
  assert.deepEqual(rw({ firstTry: true, kind: 'normal', level: 2, speedRatio: 1, combo: 1 }), { stars: 2, combo: 0, points: 320 });
  assert.deepEqual(rw({ firstTry: true, kind: 'normal', level: 2, speedRatio: 0, combo: 5 }), { stars: 2, combo: 2, points: 200 });
  assert.deepEqual(rw({ firstTry: false, kind: 'normal', level: 3, speedRatio: 1, combo: 0 }), { stars: 1, combo: 0, points: 120 });
  assert.deepEqual(rw({ firstTry: true, kind: 'boss', level: 1, speedRatio: 0.5, combo: 2 }), { stars: 4, combo: 0, points: 260 });
  assert.equal(rw({ firstTry: true, kind: 'duel', level: 5, speedRatio: 1, combo: 1 }).points, 0);
  assert.equal(rw({ firstTry: true, kind: 'diag', level: 5, speedRatio: 1, combo: 1 }).points, 0);
  assert.equal(rw({ firstTry: true, kind: 'normal', level: 9, speedRatio: 7, combo: 1 }).points, 800); // nível e rapidez limitados
});

test('scoreCorrect / scoreWrong: estatísticas do perfil e pausa a cada 3 erros', () => {
  let o = run('scoreCorrect(p, { firstTry: true, kind: "normal", level: 1, speedRatio: 0, combo: 5, mode: "dividir" })', profile({ fatigue: 2, bestCombo: 3 }));
  assert.equal(o.p.stars, 4); assert.equal(o.p.points, 100); assert.equal(o.p.firsts, 1); assert.equal(o.p.rights, 1);
  assert.equal(o.p.fatigue, 0); assert.equal(o.p.bestCombo, 5); assert.equal(o.p.firstDiv, true);
  o = run('[scoreWrong(p), scoreWrong(p), scoreWrong(p)]', profile());
  assert.deepEqual(o.r, [false, false, true]); assert.equal(o.p.wrongs, 3);
});

test('missões: avançam pelo evento certo e pagam 3 ⭐ uma vez só', () => {
  const p = profile({ missions: { d: 'x', list: [{ id: 'rounds2', p: 1, done: false }, { id: 'first5', p: 0, done: false }] } });
  let o = run('advanceMissions(p, "round").map((d) => d.id)', p);
  assert.deepEqual(o.r, ['rounds2']); assert.equal(o.p.stars, 3); assert.equal(o.p.missionsDone, 1);
  o = run('advanceMissions(p, "round").length', o.p);
  assert.equal(o.r, 0); assert.equal(o.p.stars, 3);
});

test('conquistas: em ordem, e as estrelas de uma já contam para a próxima', () => {
  const o = run('unlockAchievements(p)', profile({ stars: 45, rounds: 10 }));
  assert.deepEqual(o.r, ['a1', 'a2', 'a4']); // 45 + 5 (a1) = 50 libera a2 na mesma passada
  assert.equal(o.p.stars, 60);
});

test('finishRound: ofensiva, meta do dia, chefe, persistência, baú e recordes', () => {
  const now = 'new Date(2026, 9, 28, 12)';
  const base = { lastPlay: '2026-10-27', streak: 2, rounds: 4, today: { d: '2026-10-28', rounds: 2, done: false, modes: {} } };
  let o = run('finishRound(p, { kind: "normal", mode: "somar", firsts: 4, wrongs: 1, total: 5, points: 900 }, { goalRounds: 3, now: ' + now + ' })', profile(base));
  assert.equal(o.p.streak, 3); assert.equal(o.p.lastPlay, '2026-10-28');
  assert.equal(o.r.goalStars, 5); assert.equal(o.p.today.done, true);
  assert.equal(o.r.boss, 'boss_ready'); assert.equal(o.p.bossReady, true);  // 5ª rodada
  assert.equal(o.p.persistRounds, 1);
  assert.equal(o.r.chest, 3); assert.equal(o.p.chests[3], 1);                  // 3 dias seguidos
  assert.equal(o.r.newRecord, true); assert.equal(o.p.bestPts.somar, 900);
  assert.ok(o.r.achs.includes('a13'));                                         // persistência vale na mesma rodada
  assert.equal(o.p.weeks.length, 1); assert.equal(o.p.weeks[0].rights, 4);
  // ofensiva quebrada volta a 1; chefe vencido com 70% de primeira
  o = run('finishRound(p, { kind: "boss", firsts: 7, wrongs: 3, total: 10, points: 50 }, { goalRounds: 0, now: ' + now + ' })', profile({ lastPlay: '2026-10-20', streak: 9 }));
  assert.equal(o.p.streak, 1); assert.equal(o.r.boss, 'boss_win'); assert.equal(o.p.bossWon, true); assert.ok(o.r.achs.includes('a7'));
});

test('finishRound: recorde do Contra o Tempo já libera a medalha de 10 acertos', () => {
  const o = run('finishRound(p, { kind: "tempo", firsts: 12, wrongs: 0, total: 9999, points: 0 }, { goalRounds: 0 })', profile({ bestSurvive: 8 }));
  assert.deepEqual(o.r.survive, { n: 12, record: true });
  assert.equal(o.p.bestSurvive, 12);
  assert.ok(o.r.achs.includes('a18'));
});

test('finishRound: avaliação define o nível de todos os modos', () => {
  const o = run('finishRound(p, { kind: "diag", firsts: 5, wrongs: 3, total: 8, points: 0, diagOK: 5 }, {})', profile());
  assert.equal(o.r.diagLevel, 3); assert.equal(o.p.assessed, true);
  assert.equal(o.p.levels.somar, 3); assert.equal(o.p.levels.mistar, undefined);
});

test('baú: 10 ⭐ por dia do marco e uma figurinha que faltava', () => {
  const o = run('openChestReward(p, 7)', profile({ stickers: [0, 1, 2] }));
  assert.equal(o.r.stars, 70); assert.equal(o.p.stars, 70 + 5 * o.r.achs.length);
  assert.ok(o.r.sticker > 2 && o.p.stickers.includes(o.r.sticker));
});

/* ---------- apps Capacitor (Android e iOS): backup e botão Voltar ---------- */
function fakeCapacitor(opts) {
  const o = opts || {};
  const calls = [];
  const listeners = {};
  const cap = {
    isNativePlatform: () => true,
    isPluginAvailable: (n) => !(o.missing || []).includes(n),
    Plugins: {
      Filesystem: { writeFile: (a) => { calls.push(['writeFile', a]); return Promise.resolve({ uri: 'file:///cache/' + a.path }); } },
      Share: { share: (a) => { calls.push(['share', a]); return o.cancel ? Promise.reject(new Error('Share canceled')) : Promise.resolve({}); } },
      App: {
        addListener: (ev, cb) => { listeners[ev] = cb; return Promise.resolve({ remove() {} }); },
        minimizeApp: () => { calls.push(['minimize']); return Promise.resolve(); },
        exitApp: () => { calls.push(['exit']); return Promise.resolve(); },
      },
    },
  };
  return { cap, calls, listeners };
}

test('backup no app: grava no cache e entrega à folha de compartilhar', async () => {
  const f = fakeCapacitor();
  const E = loadEngine({ capacitor: f.cap });
  const ok = await E.ev('saveTextFile("conta-comigo-backup-2026-10-28.json", "{\\"v\\":2}", "Guardar")');
  assert.equal(ok, true);
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls[0])), ['writeFile', { path: 'conta-comigo-backup-2026-10-28.json', data: '{"v":2}', directory: 'CACHE', encoding: 'utf8' }]);
  assert.equal(f.calls[1][0], 'share');
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls[1][1].files)), ['file:///cache/conta-comigo-backup-2026-10-28.json']);
  assert.equal(f.calls[1][1].dialogTitle, 'Guardar');
});

test('backup no app: cancelar a folha de compartilhar resolve false', async () => {
  const f = fakeCapacitor({ cancel: true });
  const E = loadEngine({ capacitor: f.cap });
  assert.equal(await E.ev('saveTextFile("b.json", "{}")'), false);
});

test('backup no app sem os plugins de arquivo: não usa Share pela metade', () => {
  const f = fakeCapacitor({ missing: ['Share'] });
  const E = loadEngine({ capacitor: f.cap });
  assert.equal(E.ev('!!NATIVE_FS && !NATIVE_SHARE'), true);
  // cai no download comum, que neste contexto sem DOM falha e resolve false
  return E.ev('saveTextFile("b.json", "{}")').then((ok) => { assert.equal(ok, false); assert.equal(f.calls.length, 0); });
});

test('Voltar do Android: a página trata, volta uma página ou minimiza o app', () => {
  const f = fakeCapacitor();
  const E = loadEngine({ capacitor: f.cap });
  let handled = true;
  E.ctx.__handler = () => handled;
  E.ev('onNativeBack(() => __handler())');
  const back = f.listeners.backButton;
  assert.equal(typeof back, 'function');
  back({ canGoBack: false });
  assert.equal(f.calls.length, 0, 'a página tratou: nada mais acontece');
  handled = false;
  back({ canGoBack: true });
  assert.equal(E.ctx.__backs, 1, 'painel → jogo: history.back()');
  back({ canGoBack: false });
  assert.deepEqual(f.calls, [['minimize']], 'no início: minimiza');
});

test('fora do app o Voltar nativo não é registrado', () => {
  const E = loadEngine();
  assert.equal(E.ev('onNativeBack(() => true); IN_NATIVE_APP'), false);
});

test('Contar marca que a quantidade é a pergunta; Comparar mantém A, B, = na ordem', () => {
  const c = j('genContar(2)');
  assert.equal(c.countQuest, true, 'a descrição da cena não pode dar o total');
  for (let i = 0; i < 30; i++) {
    const q = j('genComparar(3)');
    assert.deepEqual(q.options, ['A', 'B', '='], 'o nível 3 mostra os três botões na mesma ordem');
    assert.equal(j('genComparar(1)').options.length, 2);
  }
});

test('modesPlayed: conta só modos que existem e usa o total de MODES (nunca passa de 12)', () => {
  const total = E.ev('Object.keys(MODES).length');
  const p = E.put('pl', { contar: 1, somar: 3, naoExiste: 9, __proto__x: 1 });
  assert.deepEqual(j('modesPlayed({ played: ' + p + ' })'), { n: 2, total });
  assert.deepEqual(j('modesPlayed({ played: {} })'), { n: 0, total });
});

test('balão: fica mais tempo sem voz e respeita o tempo extra dos responsáveis', () => {
  const ms = (g) => E.ev('bubbleMs(' + E.put('g', g) + ')');
  assert.equal(ms({}), 2400, 'com voz: o padrão de sempre');
  assert.equal(ms({ mute: true }), 6000, 'mudo: o balão é a única legenda');
  assert.equal(ms({ voiceOn: false }), 6000);
  assert.equal(ms({ timeScale: 2 }), 4800);
  assert.equal(ms({ mute: true, timeScale: 9 }), 18000, 'o fator para em 3');
});

test('moeda: pela região do aparelho, e só moedas quando não dá para saber', () => {
  const cur = (tags) => E.ev('currencyFromTags(' + E.put('tg', tags) + ')');
  assert.equal(cur(['pt-BR']), 'BRL');
  assert.equal(cur(['pt-PT']), 'EUR');
  assert.equal(cur(['en-US']), 'USD');
  assert.equal(cur(['en-GB']), 'GBP');
  assert.equal(cur(['es-MX']), 'MXN');
  assert.equal(cur(['es-ES']), 'EUR');
  assert.equal(cur(['en-AU']), 'GENERIC', 'região fora da lista: não chuta moeda');
  assert.equal(cur(['en']), 'GENERIC');
  assert.equal(cur(['es']), 'GENERIC');
  assert.equal(cur(['pt']), 'BRL');
  assert.equal(cur(['en', 'pt-BR']), 'BRL', 'a primeira tag com região manda');
});

test('moeda: o texto e a pergunta do modo Dinheiro usam a moeda escolhida, nos três idiomas', () => {
  const dinheiro = (lang, cur, f) => {
    const e = loadEngine({ lang });
    e.ev('DB.settings.lang = ' + JSON.stringify(lang) + '; DB.settings.currency = ' + JSON.stringify(cur) + '; LANG = ' + JSON.stringify(lang));
    return JSON.parse(e.ev('JSON.stringify(genDinheiro(3, ' + JSON.stringify(f) + '))'));
  };
  const c5 = { kind: 'coins5', c5: 2, c1: 3 };
  assert.equal(dinheiro('pt', 'BRL', c5).display, 'R$ ?');
  assert.equal(dinheiro('en', 'USD', c5).display, '$ ?');
  assert.equal(dinheiro('es', 'EUR', c5).display, '€ ?');
  assert.equal(dinheiro('pt', 'GENERIC', c5).display, '🪙 ?');
  assert.match(dinheiro('pt', 'EUR', c5).tts, /5 euros/);
  assert.match(dinheiro('en', 'GBP', { kind: 'coins', n: 3 }).tts, /How many pounds/);
  assert.match(dinheiro('es', 'MXN', { kind: 'change', p: 12, v: 20 }).tts, /pesos/);
  assert.match(dinheiro('pt', 'GENERIC', { kind: 'change', p: 12, v: 20 }).tts, /moedas/);
  for (const l of ['pt', 'en', 'es']) assert.doesNotMatch(dinheiro(l, 'USD', c5).tts, /\{m\}|reais|reales/, 'sem sobra de {m} nem de real fixo');
});

test('moeda: backup com valor estranho volta para automática', () => {
  const bad = E.put('d', { v: 2, activeId: 'p1', profiles: [{ id: 'p1', name: 'A' }], settings: { currency: '<img src=x onerror=alert(1)>' } });
  assert.equal(j('parseDB(JSON.stringify(' + bad + ')).settings.currency'), 'auto');
  const ok = E.put('d2', { v: 2, activeId: 'p1', profiles: [{ id: 'p1', name: 'A' }], settings: { currency: 'EUR' } });
  assert.equal(j('parseDB(JSON.stringify(' + ok + ')).settings.currency'), 'EUR');
});

test('espanhol: região do aparelho, idioma pedido à voz e palavra do troco', () => {
  const reg = (tags) => E.ev('esRegionFromTags(' + E.put('tg', tags) + ')');
  assert.equal(reg(['es-MX']), 'MX');
  assert.equal(reg(['en-US', 'es-419']), '419');
  assert.equal(reg(['es']), '');
  assert.equal(reg(['pt-BR']), '');
  const falar = (lang) => loadEngine({ lang }).ev('speechLang("es")');
  assert.equal(falar('es-ES'), 'es-ES');
  assert.equal(falar('es-MX'), 'es-MX');
  assert.equal(falar('es-AR'), 'es-MX', 'o motor do app não tem es-AR: cai na voz latino-americana');
  assert.equal(falar('es-US'), 'es-US');
  assert.equal(falar('es'), 'es-MX', 'sem região: a maioria dos falantes é latino-americana');
  assert.equal(loadEngine({ lang: 'pt-BR' }).ev('speechLang("pt")'), 'pt-BR');
  assert.equal(loadEngine({ lang: 'en-GB' }).ev('speechLang("en")'), 'en-US');
  const troco = (lang) => loadEngine({ lang }).ev('esChangeWord()');
  assert.equal(troco('es-AR'), 'vuelto');
  assert.equal(troco('es-CL'), 'vuelto');
  assert.equal(troco('es-MX'), 'cambio');
  assert.equal(troco('es-ES'), 'cambio');
});

test('espanhol: a voz da região do aparelho vence, e voz robótica não ganha por região', () => {
  const escolhe = (lang, vozes) => {
    const e = loadEngine({ lang });
    e.ev('DB.settings.lang = "es"; TTS.voices = ' + e.put('v', vozes));
    return e.ev('TTS.pickVoice("es").name');
  };
  const mx = { name: 'Google español de México', lang: 'es-MX', voiceURI: 'mx', localService: false };
  const es = { name: 'Google español', lang: 'es-ES', voiceURI: 'es', localService: false };
  const us = { name: 'Google español de Estados Unidos', lang: 'es-US', voiceURI: 'us', localService: false };
  assert.equal(escolhe('es-MX', [es, mx]), mx.name);
  assert.equal(escolhe('es-ES', [mx, es]), es.name);
  assert.equal(escolhe('es-AR', [es, us]), us.name, 'sem es-AR: a latino-americana mais próxima, não a da Espanha');
  assert.equal(escolhe('es-MX', [es]), es.name, 'sem voz da região: usa a que existe');
  const robo = { name: 'eSpeak es-419', lang: 'es-419', voiceURI: 'e', localService: true };
  assert.equal(escolhe('es-MX', [robo, es]), es.name, 'a voz robótica da região não passa a natural de outra');
});

test('espanhol: a pergunta do troco usa a palavra da região', () => {
  const troco = (lang) => {
    const e = loadEngine({ lang });
    e.ev('DB.settings.lang = "es"; DB.settings.currency = "GENERIC"; LANG = "es"');
    return JSON.parse(e.ev('JSON.stringify(genDinheiro(3, { kind: "change", p: 12, v: 20 }))')).tts;
  };
  assert.match(troco('es-AR'), /¿Cuál es el vuelto\?/);
  assert.match(troco('es-MX'), /¿Cuál es el cambio\?/);
  assert.doesNotMatch(troco('es-ES'), /\{c\}|vuelto/);
});
