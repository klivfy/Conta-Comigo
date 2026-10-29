'use strict';
/* Reproduz os dois bugs críticos da revisão de 28/10/2026 (docs/revisoes/rodada-2026-10-28.md)
   que o ADR-001 corrige. Enquanto o ADR não entra no código, os testes ficam como `todo`:
   rodam e mostram a falha, mas não deixam o CI vermelho. Ao implementar, tire o `todo`.
   Rodar: node --test tests/persistencia.test.cjs */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine.cjs');

const ADR = 'ADR-001 ainda não implementado';

/* chrome.storage de extensão: local sem limite; sync com 8 KB por item (chave + JSON),
   como o Chrome, e erro devolvido em chrome.runtime.lastError. */
function fakeChrome() {
  const local = {}, sync = {};
  const falhas = [];
  const c = { runtime: { lastError: undefined }, storage: {} };
  const area = (mem, limite) => ({
    get(keys, cb) { const r = {}; (keys || Object.keys(mem)).forEach((k) => { if (k in mem) r[k] = JSON.parse(JSON.stringify(mem[k])); }); cb(r); },
    set(obj, cb) {
      c.runtime.lastError = undefined;
      for (const k of Object.keys(obj)) {
        const bytes = k.length + JSON.stringify(obj[k]).length;
        if (limite && bytes > limite) { c.runtime.lastError = { message: 'QUOTA_BYTES_PER_ITEM quota exceeded' }; falhas.push({ k, bytes }); }
      }
      if (!c.runtime.lastError) for (const k of Object.keys(obj)) mem[k] = JSON.parse(JSON.stringify(obj[k]));
      if (cb) cb();
      c.runtime.lastError = undefined;
    },
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

test('bug 1: o painel gravando depois do jogo não pode apagar as estrelas', { todo: ADR }, async () => {
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

test('bug 2: com 4 perfis nenhum item do sync passa de 8 KB e nenhuma gravação falha', { todo: ADR }, async () => {
  const f = fakeChrome();
  const e = loadEngine({ chrome: f.chrome });
  await e.ev('initDB()');
  e.ev("G().sync = true; ['p2','p3','p4'].forEach((id) => DB.profiles.push(newProfile(id, 'Criança ' + id, '🐼')))");
  e.ev('DB.profiles.forEach(' + ENCHE_PERFIL + ')');
  e.ev('saveState(true)');

  assert.equal(e.ev('DB.profiles.length'), 4);
  assert.deepEqual(f.falhas, [], 'o sync estourou a cota por item e o erro foi descartado em silêncio: ' + JSON.stringify(f.falhas));
  assert.ok(Object.keys(f.sync).length > 0, 'nada foi parar no chrome.storage.sync');
});
