'use strict';
/* ADR-001: os dois bugs críticos da revisão de 28/10/2026 (docs/revisoes/rodada-2026-10-28.md)
   e o que a correção promete: gravar sem apagar o que outra página fez, e sincronizar por
   perfil dentro da cota de 8 KB, com o resultado visível.
   Rodar: node --test tests/persistencia.test.cjs */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine.cjs');

/* chrome.storage de extensão: local sem limite; sync com 8 KB por item (chave + JSON),
   como o Chrome, e erro devolvido em chrome.runtime.lastError. */
function fakeChrome(opts) {
  const local = {}, sync = (opts && opts.sync) || {};
  const falhas = [];
  const c = { runtime: { lastError: undefined }, storage: {} };
  const area = (mem, limite) => ({
    get(keys, cb) { const r = {}; (keys || Object.keys(mem)).forEach((k) => { if (k in mem) r[k] = JSON.parse(JSON.stringify(mem[k])); }); cb(r); },
    set(obj, cb) {
      c.runtime.lastError = undefined;
      if (limite && opts && opts.syncOffline) { c.runtime.lastError = { message: 'sem rede' }; if (cb) cb(); c.runtime.lastError = undefined; return; }
      for (const k of Object.keys(obj)) {
        const bytes = k.length + JSON.stringify(obj[k]).length;
        if (limite && bytes > limite) { c.runtime.lastError = { message: 'QUOTA_BYTES_PER_ITEM quota exceeded' }; falhas.push({ k, bytes }); }
      }
      if (!c.runtime.lastError) for (const k of Object.keys(obj)) mem[k] = JSON.parse(JSON.stringify(obj[k]));
      if (cb) cb();
      c.runtime.lastError = undefined;
    },
    remove(keys, cb) { [].concat(keys).forEach((k) => delete mem[k]); if (cb) cb(); },
    clear() { Object.keys(mem).forEach((k) => delete mem[k]); },
  });
  c.storage.local = area(local, 0);
  c.storage.sync = area(sync, 8192);
  return { chrome: c, local, sync, falhas };
}

/* perfil de quem já jogou bastante: todos os modos com nível, histórico, revisão, semanas,
   conquistas e figurinhas, nos limites que o próprio engine impõe (24 revisões, 8 semanas) */
const ENCHE_PERFIL = `(function (p) {
  Object.keys(MODES).forEach((m) => {
    p.bestPts[m] = 120; p.levels[m] = 3; p.lvl[m] = 3; p.played[m] = 40;
    p.recent[m] = [true, false, true, true, false];
  });
  for (let i = 0; i < 24; i++) p.review.push({ m: 'somar', lv: 2, f: { a: i, b: i + 1 }, box: 2, due: '2026-10-28' });
  for (let i = 0; i < 8; i++) p.weeks.push({ k: '2026-W' + (30 + i), rounds: 25, rights: 80 });
  for (let i = 1; i <= 17; i++) p.ach['a' + i] = 1;
  for (let i = 0; i < 24; i++) p.stickers.push(i);
  p.stars = 300; p.points = 900; p.rounds = 200; p.rights = 700; p.wrongs = 150; p.playSec = 9000;
})`;

test('bug 1: o painel gravando depois do jogo não pode apagar as estrelas', async () => {
  const store = {};
  /* o jogo e o painel abrem com o mesmo progresso (10 estrelas) */
  const seed = loadEngine({ store });
  await seed.ev('initDB()');
  seed.ev('P().stars = 10; saveState(true)');
  const jogo = loadEngine({ store });
  const painel = loadEngine({ store });
  await jogo.ev('initDB()');
  await painel.ev('initDB()');

  jogo.ev('P().stars = 35; saveState(true)');          // a criança ganha 25 estrelas
  painel.ev('G().sound = !G().sound; saveState(true)'); // o responsável mexe numa opção, com a cópia antiga na memória

  const depois = loadEngine({ store });
  await depois.ev('initDB()');
  assert.equal(depois.ev('P().stars'), 35, 'o progresso do jogo foi sobrescrito pela cópia antiga do painel');
});

test('bug 2: com 4 perfis nenhum item do sync passa de 8 KB e nenhuma gravação falha', async () => {
  const f = fakeChrome();
  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  e.ev("G().sync = true; ['p2','p3','p4'].forEach((id) => DB.profiles.push(newProfile(id, 'Criança ' + id, '🐼')))");
  e.ev('DB.profiles.forEach(' + ENCHE_PERFIL + ')');
  e.ev('saveState(true)');

  assert.equal(e.ev('DB.profiles.length'), 4);
  assert.deepEqual(f.falhas, [], 'o sync estourou a cota por item e o erro foi descartado em silêncio: ' + JSON.stringify(f.falhas));
  assert.deepEqual(Object.keys(f.sync).sort(), ['cc_sync_meta', 'cc_sync_p1', 'cc_sync_p2', 'cc_sync_p3', 'cc_sync_p4']);
  assert.equal(e.ev('syncStatus().ok'), true);
  for (const [k, v] of Object.entries(f.sync)) assert.ok(k.length + JSON.stringify(v).length <= 8192, k);
});

test('sync: outro aparelho monta o banco com os 4 perfis, sem a senha', async () => {
  const f = fakeChrome();
  const a = loadEngine({ chrome: f.chrome });
  await a.ev('initDB()');
  a.ev("G().sync = true; G().passHash = 'segredo'; ['p2','p3','p4'].forEach((id) => DB.profiles.push(newProfile(id, 'Criança ' + id, '🐼')))");
  a.ev('DB.profiles.forEach(' + ENCHE_PERFIL + ')');
  a.ev('saveState(true)');

  const outro = fakeChrome({ sync: f.sync }); // outro computador: mesmo sync, armazenamento local próprio
  const b = loadEngine({ chrome: outro.chrome });
  await b.ev('initDB()');
  assert.equal(b.ev('DB.profiles.length'), 4);
  assert.equal(b.ev('P().stars'), 300);
  assert.equal(b.ev('G().passHash || ""'), '', 'a senha não pode viajar pelo sync');
});

test('sync: lê o formato antigo (cc_state_sync) e o troca pelo novo ao gravar', async () => {
  const f = fakeChrome();
  const velho = loadEngine({ chrome: f.chrome });
  await velho.ev('initDB()');
  velho.ev("P().stars = 42; saveState(true)");
  f.sync.cc_state_sync = JSON.parse(velho.ev('JSON.stringify(shareableDB(DB))'));
  f.sync.cc_state_sync.updatedAt += 10000;

  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  assert.equal(e.ev('P().stars'), 42);
  e.ev('G().sync = true; saveState(true)');
  assert.ok(f.sync.cc_sync_meta, 'gravou no formato novo');
  assert.equal(f.sync.cc_state_sync, undefined, 'o item único antigo foi removido');
});

test('sync: perfil apagado sai do sync', async () => {
  const f = fakeChrome();
  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  e.ev("G().sync = true; DB.profiles.push(newProfile('p2', 'Outra', '🐼')); saveState(true)");
  assert.ok(f.sync.cc_sync_p2);
  e.ev("DB.profiles = DB.profiles.filter((p) => p.id !== 'p2'); saveState(true)");
  assert.equal(f.sync.cc_sync_p2, undefined);
});

test('sync: perfil que não cabe nem cortado não grava nada e o painel sabe o tamanho', async () => {
  const f = fakeChrome();
  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  e.ev("G().sync = true; P().pet = 'x'.repeat(9000); saveState(true)");
  const st = JSON.parse(e.ev('JSON.stringify(syncStatus())'));
  assert.equal(st.ok, false);
  assert.ok(st.kb >= 9);
  assert.deepEqual(f.falhas, []);
  assert.equal(Object.keys(f.sync).length, 0);
});

test('sync: revisões e semanas antigas saem primeiro para caber', async () => {
  const f = fakeChrome();
  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  e.ev("G().sync = true; P().review = Array.from({ length: 24 }, (_, i) => ({ m: 'somar', lv: 2, f: { a: i, b: i, pad: 'y'.repeat(300) }, box: 1, due: '2026-10-28' })); saveState(true)");
  assert.equal(f.falhas.length, 0);
  assert.equal(e.ev('syncStatus().ok'), true);
  assert.ok(f.sync.cc_sync_p1.review.length < 24, 'cortou as revisões mais antigas');
  assert.equal(e.ev('P().review.length'), 24, 'o jogo local não perde nada');
});

test('sync: erro do navegador aparece no status em vez de sumir', async () => {
  const f = fakeChrome({ syncOffline: true });
  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  e.ev('G().sync = true; saveState(true)');
  const st = JSON.parse(e.ev('JSON.stringify(syncStatus())'));
  assert.equal(st.ok, false);
  assert.match(st.err, /sem rede/);
});

test('contador: a nova aba com a cópia velha soma +1 em vez de voltar ao valor antigo', async () => {
  const store = {};
  const seed = loadEngine({ store });
  await seed.ev('initDB()');
  seed.ev('P().stars = 10; saveState(true)');
  const jogo = loadEngine({ store }), aba = loadEngine({ store });
  await jogo.ev('initDB()'); await aba.ev('initDB()');
  jogo.ev('P().stars = 35; saveState(true)');
  aba.ev('P().stars += 1; saveState(true)');
  const depois = loadEngine({ store });
  await depois.ev('initDB()');
  assert.equal(depois.ev('P().stars'), 36);
});

test('perfis: o que uma página cria ou apaga vale mesmo com a outra página desatualizada', async () => {
  const store = {};
  const seed = loadEngine({ store });
  await seed.ev('initDB()');
  seed.ev("DB.profiles.push(newProfile('p2', 'Maria', '🐼')); saveState(true)");
  const painel = loadEngine({ store }), jogo = loadEngine({ store });
  await painel.ev('initDB()'); await jogo.ev('initDB()');
  painel.ev("DB.profiles = DB.profiles.filter((p) => p.id !== 'p2'); saveState(true)");   // apaga a Maria
  jogo.ev("DB.profiles.push(newProfile('p3', 'João', '🦊')); G().sound = !G().sound; saveState(true)"); // cria o João
  const depois = loadEngine({ store });
  await depois.ev('initDB()');
  assert.deepEqual(JSON.parse(depois.ev('JSON.stringify(DB.profiles.map((p) => p.id).sort())')), ['p1', 'p3']);
});

test('storage: adoptLatest traz o que a outra página gravou e flushSave não perde o que está pendente', async () => {
  const store = {};
  const seed = loadEngine({ store });
  await seed.ev('initDB()');
  seed.ev('P().stars = 10; saveState(true)');
  const painel = loadEngine({ store }), jogo = loadEngine({ store });
  await painel.ev('initDB()'); await jogo.ev('initDB()');
  jogo.ev('P().stars = 35; saveState(true)');
  painel.ev("G().sound = false; saveState()");          // pendente no temporizador de 250 ms
  assert.equal(painel.ev('adoptLatest()'), true);
  assert.equal(painel.ev('P().stars'), 35, 'adotou o progresso do jogo');
  assert.equal(painel.ev('G().sound'), false, 'não perdeu a opção pendente');
});

test('replaceDB: importar um backup vale inteiro, sem misturar com a cópia gravada', async () => {
  const store = {};
  const a = loadEngine({ store });
  await a.ev('initDB()');
  a.ev('P().stars = 99; saveState(true)');
  const b = loadEngine({ store });
  await b.ev('initDB()');
  b.ev("replaceDB(Object.assign(JSON.parse(JSON.stringify(DB)), { profiles: [newProfile('x1', 'Importada', '🐼')], activeId: 'x1' })); saveState(true)");
  const c = loadEngine({ store });
  await c.ev('initDB()');
  assert.deepEqual(JSON.parse(c.ev('JSON.stringify(DB.profiles.map((p) => p.id))')), ['x1']);
  assert.equal(c.ev('P().stars'), 0);
});
