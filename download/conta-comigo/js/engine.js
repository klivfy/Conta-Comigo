'use strict';
/* ==================== Conta Comigo v2.0 — motor ====================
   S01 faltar · S02 comparar · S03 sequencia · S04 dobrar · S05 historia · S06 dinheiro
   S07 adaptação por habilidade · S08 revisão espaçada · S21 multilíngue · S22 voz
   S27 perfis · S32 sync · migração v1 → v2                     */

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rand(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function fmtDate(d) {
  const x = d || new Date();
  return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
}
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return fmtDate(d); }
function weekKey(d) {
  const x = d || new Date();
  const jan1 = new Date(x.getFullYear(), 0, 1);
  const wk = Math.ceil((((x - jan1) / 86400000) + jan1.getDay() + 1) / 7);
  return x.getFullYear() + '-S' + String(wk).padStart(2, '0');
}

/* ---------- constantes de jogo ---------- */
const MAX_LEVEL = 5;
const QUESTIONS_PER_ROUND = 5;
const BOSS_QUESTIONS = 10;
const REVIEW_INTERVALS = [1, 2, 4, 8, 16]; // dias (S08 — caixas de Leitner)

const ITEMS = [
  { emoji: '🍎', name: 'maçã', plural: 'maçãs', f: true }, { emoji: '🍓', name: 'morango', plural: 'morangos', f: false },
  { emoji: '⭐', name: 'estrela', plural: 'estrelas', f: true }, { emoji: '🎈', name: 'balão', plural: 'balões', f: false },
  { emoji: '🐟', name: 'peixe', plural: 'peixes', f: false }, { emoji: '🦋', name: 'borboleta', plural: 'borboletas', f: true },
  { emoji: '🍪', name: 'biscoito', plural: 'biscoitos', f: false }, { emoji: '🌸', name: 'flor', plural: 'flores', f: true },
  { emoji: '🍇', name: 'uva', plural: 'uvas', f: true }, { emoji: '🐤', name: 'pintinho', plural: 'pintinhos', f: false },
];
const NAMES = { pt: ['Ana', 'Bia', 'João', 'Lia'], en: ['Ana', 'Sam', 'Joe', 'May'], es: ['Ana', 'Lu', 'Juan', 'Mía'] };
const AVATARS = ['🦊', '🐼', '🐨', '🐸', '🐵', '🦁', '🐰', '🐯', '🐧', '🦄'];
const STICKERS = ['🦁','🐸','🐬','🦋','🐢','🦉','🐝','🐧','🦄','🐙','🦕','🐨','🦊','🐼','🐷','🐵','🦒','🐘','🦜','🐳','🐿️','🦩','🐊','🦔'];

const MODES = {
  contar:      { emoji: '🍎', unlock: 0,   color: 'orange' },
  somar:       { emoji: '➕', unlock: 0,   color: 'blue' },
  comparar:    { emoji: '⚖️', unlock: 0,   color: 'pink' },
  faltar:      { emoji: '❓', unlock: 10,  color: 'purple' },
  subtrair:    { emoji: '➖', unlock: 15,  color: 'green' },
  sequencia:   { emoji: '🔢', unlock: 25,  color: 'cyan' },
  dobrar:      { emoji: '2️⃣', unlock: 35,  color: 'yellow' },
  multiplicar: { emoji: '✖️', unlock: 50,  color: 'violet' },
  dividir:     { emoji: '➗', unlock: 65,  color: 'gold' },
  historia:    { emoji: '📖', unlock: 80,  color: 'teal' },
  dinheiro:    { emoji: '🪙', unlock: 100, color: 'brown' },
  mistar:      { emoji: '🎲', unlock: 120, color: 'red' },
};

/* ---------- estado global (perfis S27 + configurações S31) ---------- */
function newProfile(id, name, avatar) {
  return {
    id: id || ('p' + Date.now() + rand(100, 999)), name: name || 'Jogador', avatar: avatar || '🦊',
    stars: 0, points: 0, bestPts: {}, levels: {}, recent: {}, review: [],
    streak: 0, lastPlay: '', rounds: 0, firsts: 0, rights: 0, wrongs: 0, playSec: 0,
    bestCombo: 0, fatigue: 0, ach: {}, missions: { d: '', list: [] }, missionsDone: 0,
    owned: { themes: ['classico'], hats: [] }, hat: '', stickers: [],
    bossReady: false, assessed: false, played: {}, lvl: {}, weeks: [],
    today: { d: '', rounds: 0, done: false }, reviewWins: 0,
  };
}
const DEFAULT_SETTINGS = {
  lang: 'pt', theme: 'classico', hc: false, dys: false, calmo: null,
  mute: false, volume: 0.9, vRate: 0.95, vPitch: 1.15, vVoice: '',
  diffMode: 'auto', goalRounds: 3, sessionLimit: 15, sync: false,
  unlockAll: false, newtabOn: true, timer: true,
};
let DB = { v: 2, updatedAt: 0, activeId: '', profiles: [], settings: Object.assign({}, DEFAULT_SETTINGS) };
function P() { return DB.profiles.find((p) => p.id === DB.activeId) || DB.profiles[0]; }
function G() { return DB.settings; }

/* ---------- armazenamento: local + sync opcional (S32) ---------- */
function migrateV1(old) {
  const p = newProfile(null, 'Jogador', '🦊');
  p.stars = Number(old && old.totalStars) || 0;
  if (old && old.levels && typeof old.levels === 'object') {
    for (const k in old.levels) p.levels[k] = clamp(Number(old.levels[k]) || 1, 1, 3);
  }
  const s = Object.assign({}, DEFAULT_SETTINGS);
  if (old && old.mute) s.mute = true;
  if (old && (old.difficulty === 1 || old.difficulty === 2 || old.difficulty === 3)) s.diffMode = old.difficulty;
  return { v: 2, updatedAt: Date.now(), activeId: p.id, profiles: [p], settings: s };
}
function parseDB(raw) {
  try {
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return null;
    if (d.v === 2 && Array.isArray(d.profiles) && d.profiles.length) {
      d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
      normalizeDB(d);
      return d;
    }
    if (d.totalStars != null || d.levels) return migrateV1(d); // v1 → v2
  } catch (e) { /* ignora */ }
  return null;
}
/* v2.2: garante campos novos de pontos em perfis antigos (migração suave) */
function normalizeDB(d) {
  (d.profiles || []).forEach((p) => {
    p.points = Number(p.points) || 0;
    p.bestPts = (p.bestPts && typeof p.bestPts === 'object') ? p.bestPts : {};
  });
  return d;
}
function loadRaw() {
  try {
    const ls = localStorage.getItem('cc_state');
    if (ls) { const d = parseDB(ls); if (d) return Promise.resolve(d); }
  } catch (e) { /* ignora */ }
  return new Promise((resolve) => {
    let done = false;
    const fin = (v) => { if (!done) { done = true; resolve(v); } };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['cc_state'], (res) => {
          try { fin(res && res.cc_state ? parseDB(JSON.stringify(res.cc_state)) : null); } catch (e) { fin(null); }
        });
        setTimeout(() => { try { fin(parseDB(localStorage.getItem('cc_state') || '')); } catch (e) { fin(null); } }, 800);
      } else fin(null);
    } catch (e) { fin(null); }
  });
}
async function initDB() {
  let d = await loadRaw();
  // S32: se sync habilitado e a cópia sincronizada é mais recente, adota-a
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    const syncData = await new Promise((r) => {
      try {
        chrome.storage.sync.get(['cc_state_sync'], (res) => r(res && res.cc_state_sync));
      } catch (e) { r(null); }
    });
    if (syncData && syncData.updatedAt && (!d || (syncData.updatedAt > (d.updatedAt || 0)))) {
      const parsed = parseDB(JSON.stringify(syncData));
      if (parsed) d = parsed;
    }
  }
  if (!d) d = { v: 2, updatedAt: Date.now(), activeId: '', profiles: [], settings: Object.assign({}, DEFAULT_SETTINGS) };
  if (!d.profiles.length) d.profiles.push(newProfile('p1', 'Jogador', '🦊'));
  if (!d.profiles.find((p) => p.id === d.activeId)) d.activeId = d.profiles[0].id;
  d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
  normalizeDB(d);
  DB = d;
  return DB;
}
let saveTimer = null;
function saveState(immediate) {
  DB.updatedAt = Date.now();
  const json = JSON.stringify(DB);
  const write = () => {
    try { localStorage.setItem('cc_state', json); } catch (e) { /* ignora */ }
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ cc_state: JSON.parse(json) }, () => { void chrome.runtime.lastError; });
      }
      if (G().sync && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ cc_state_sync: JSON.parse(json) }, () => { void chrome.runtime.lastError; });
      }
    } catch (e) { /* ignora */ }
  };
  clearTimeout(saveTimer);
  if (immediate) write(); else saveTimer = setTimeout(write, 250);
}

/* ---------- áudio ---------- */
let actx = null;
function ensureAudio() {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch (e) { /* sem áudio */ }
}
function tone(freq, delay, dur, type, vol) {
  if (G().mute || !actx) return;
  try {
    const t0 = actx.currentTime + delay;
    const o = actx.createOscillator(); const g = actx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime((vol || 0.12) * (G().volume != null ? G().volume : 0.9), t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  } catch (e) { /* ignora */ }
}
const SFX = {
  tap: () => tone(360, 0, 0.06, 'triangle', 0.05),
  correct: () => { tone(659, 0, 0.12, 'triangle', 0.12); tone(880, 0.1, 0.12, 'triangle', 0.12); tone(1175, 0.2, 0.25, 'triangle', 0.12); },
  wrong: () => { tone(233, 0, 0.18, 'sine', 0.09); tone(174, 0.16, 0.25, 'sine', 0.09); },
  star: () => { tone(1568, 0, 0.1, 'triangle', 0.08); tone(2093, 0.08, 0.16, 'triangle', 0.07); },
  fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.28, 'triangle', 0.11)); },
};

/* ---------- voz configurável (S22) + narração por idioma (S21) ---------- */
const TTS = {
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  voices: [],
  init() {
    if (!this.ok) return;
    const upd = () => {
      try { this.voices = window.speechSynthesis.getVoices() || []; } catch (e) { /* ignora */ }
      if (window.CC && window.CC.onVoices) window.CC.onVoices();
    };
    upd();
    try { window.speechSynthesis.addEventListener('voiceschanged', upd); }
    catch (e) { window.speechSynthesis.onvoiceschanged = upd; }
  },
  speak(text) {
    if (!this.ok || G().mute || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const want = TTS_LANG[G().lang] || 'pt-BR';
      u.lang = want;
      const vs = this.voices.filter((v) => v.lang && v.lang.replace('_', '-').indexOf(want.slice(0, 2)) === 0);
      if (G().vVoice) {
        const chosen = vs.find((v) => v.voiceURI === G().vVoice) || vs.find((v) => v.voiceURI === G().vVoice);
        if (chosen) u.voice = chosen;
      } else if (vs.length) u.voice = vs[0];
      u.rate = clamp(G().vRate || 0.95, 0.5, 1.6);
      u.pitch = clamp(G().vPitch || 1.15, 0.5, 2);
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignora */ }
  },
  stop() { if (this.ok) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ } } },
};

/* ---------- visuais de objetos ---------- */
function emojisHTML(item, count, opts) {
  let s = '';
  const crossedFrom = opts && opts.crossedFrom != null ? opts.crossedFrom : -1;
  const small = opts && opts.small;
  const tap = opts && opts.tap;
  for (let i = 0; i < count; i++) {
    const cross = crossedFrom >= 0 && i >= crossedFrom;
    s += '<span class="obj' + (small ? ' small' : '') + (cross ? ' crossed' : '') + (tap ? ' tappable' : '') + '" data-i="' + i + '">' + item.emoji + '</span>';
  }
  return s;
}
function distractors(answer, extras, maxCap) {
  const cap = maxCap || 30;
  const out = new Set();
  const cands = shuffle([answer + 1, answer - 1, answer + 2, answer - 2].concat(extras || []));
  for (const c of cands) {
    if (out.size >= 3) break;
    if (c >= 0 && c !== answer && c <= cap && !out.has(c)) out.add(c);
  }
  let g = 3;
  while (out.size < 3 && g <= 20) {
    const up = answer + g, down = answer - g;
    if (up <= cap && !out.has(up)) out.add(up);
    else if (down >= 0 && !out.has(down)) out.add(down);
    g++;
  }
  return shuffle([answer].concat([...out].slice(0, 3)));
}

/* ==================== geradores (cada um aceita dados "forced" p/ revisão S08) ==================== */
function genContar(level, f) {
  const maxN = [5, 8, 10, 15, 20][level - 1] || 10;
  const it = (f && f.it != null) ? ITEMS[f.it] : pick(ITEMS);
  const n = (f && f.n) || rand(1, maxN);
  const display = LANG === 'pt'
    ? (it.f ? 'Quantas ' + it.plural + '?' : 'Quantos ' + it.plural + '?')
    : t('d_contar');
  return {
    visual: '<div class="grp plain">' + emojisHTML(it, n, { tap: true }) + '</div>',
    display, tts: t('t_see'), answer: n, options: distractors(n, null, maxN), f: { it: ITEMS.indexOf(it), n },
  };
}
function genSomar(level, f) {
  const cap = [10, 12, 20, 30, 50][level - 1] || 10;
  const it = (f && f.it != null) ? ITEMS[f.it] : pick(ITEMS);
  let a = (f && f.a) || rand(1, cap - 1);
  let b = (f && f.b) || rand(1, cap - a);
  a = clamp(a, 1, cap - 1); b = clamp(b, 1, cap - a);
  const n = a + b;
  const small = n > 10;
  return {
    visual: n <= 20 ? '<div class="expr"><span class="grp">' + emojisHTML(it, a, { small }) + '</span><span class="op">+</span><span class="grp">' + emojisHTML(it, b, { small }) + '</span></div>' : '',
    display: a + ' + ' + b + ' = ?', tts: t('t_add', { a: numWord(LANG, a), b: numWord(LANG, b) }),
    answer: n, options: distractors(n, [a, b, Math.abs(a - b)], cap + 2), f: { it: ITEMS.indexOf(it), a, b },
  };
}
function genSubtrair(level, f) {
  const cap = [5, 10, 12, 20, 30][level - 1] || 10;
  const it = (f && f.it != null) ? ITEMS[f.it] : pick(ITEMS);
  let a = (f && f.a) || rand(2, cap);
  let b = (f && f.b) || rand(1, a - 1);
  a = clamp(a, 2, cap); b = clamp(b, 1, a - 1);
  const n = a - b;
  return {
    visual: a <= 20 ? '<div class="grp plain">' + emojisHTML(it, a, { crossedFrom: a - b, small: a > 10, tap: true }) + '</div>' : '',
    display: a + ' − ' + b + ' = ?', tts: t('t_sub', { a: numWord(LANG, a), b: numWord(LANG, b) }),
    answer: n, options: distractors(n, [b], cap), f: { it: ITEMS.indexOf(it), a, b },
  };
}
function genFaltar(level, f) {
  const cap = [10, 12, 20, 30, 50][level - 1] || 10;
  let s = (f && f.s) || rand(3, cap);
  let a = (f && f.a) || rand(1, s - 1);
  s = clamp(s, 3, cap); a = clamp(a, 1, s - 1);
  const b = s - a;
  return {
    visual: '', display: a + ' + ? = ' + s,
    tts: t('t_miss', { a: numWord(LANG, a), s: numWord(LANG, s) }),
    answer: b, options: distractors(b, [a, s], cap), f: { a, s },
  };
}
function genComparar(level, f) {
  const objMax = [5, 10][level - 1] || 5;
  const numMax = [0, 0, 20, 100, 500][level - 1] || 20;
  const useObjects = level <= 2;
  const it = pick(ITEMS);
  let a = (f && f.a) || (useObjects ? rand(1, objMax) : rand(1, numMax));
  let b = (f && f.b) || (useObjects ? rand(1, objMax) : rand(1, numMax));
  if (!f) { if (level >= 3 && Math.random() < 0.25) b = a; while (!f && useObjects && a === b) b = rand(1, objMax); }
  const eq = a === b;
  const options = eq ? ['A', 'B', '='] : (level >= 3 ? ['A', 'B', '='] : ['A', 'B']);
  const answer = eq ? '=' : (a > b ? 'A' : 'B');
  const side = (n, cls) => useObjects
    ? '<div class="cmp-side ' + cls + '"><b>' + (cls === 'a' ? 'A' : 'B') + '</b><div class="grp">' + emojisHTML(it, n, { small: n > 6 }) + '</div></div>'
    : '<div class="cmp-side ' + cls + '"><b>' + (cls === 'a' ? 'A' : 'B') + '</b><div class="bignum">' + n + '</div></div>';
  return {
    visual: '<div class="cmp">' + side(a, 'a') + '<div class="cmp-quest">?</div>' + side(b, 'b') + '</div>',
    display: 'A ⚖️ B', tts: eq ? t('t_eq') : t('t_cmp'),
    answer, options, f: { a, b }, kind: 'cmp',
  };
}
function genSequencia(level, f) {
  let s, d;
  if (f) { s = f.s; d = f.d; }
  else if (level === 1) { s = rand(1, 5); d = 1; }
  else if (level === 2) { s = rand(1, 9); d = rand(1, 2); }
  else if (level === 3) { s = rand(1, 15); d = rand(1, 5); }
  else if (level === 4) { s = rand(2, 30); d = pick([2, 5, 10]); }
  else { s = rand(10, 30); d = -rand(1, 5); }
  const terms = [s, s + d, s + 2 * d, s + 3 * d];
  const answer = s + 4 * d;
  const cap = Math.max(...terms, answer) + 4;
  const chips = terms.map((n) => '<span class="seq-chip">' + n + '</span>').join('') + '<span class="seq-chip q">?</span>';
  return {
    visual: '<div class="seq-row">' + chips + '</div>',
    display: terms.join(', ') + ', ?', tts: t('t_seq'),
    answer, options: distractors(answer, [d, answer - d, answer + d], cap + 6), f: { s, d },
  };
}
function genDobrar(level, f) {
  const half = f ? !!f.half : (level >= 3 ? Math.random() < 0.5 : false);
  const maxN = [5, 10, 10, 25, 50][level - 1] || 10;
  let n;
  if (half) { n = f ? f.n : rand(2, maxN) * 2; }
  else { n = f ? f.n : rand(1, maxN); }
  n = Math.max(half ? 2 : 1, n);
  const answer = half ? n / 2 : n * 2;
  const it = pick(ITEMS);
  const visual = (!half && n <= 10)
    ? '<div class="expr"><span class="grp">' + emojisHTML(it, n, { small: n > 5 }) + '</span><span class="op">+</span><span class="grp">' + emojisHTML(it, n, { small: n > 5 }) + '</span></div>'
    : '';
  return {
    visual, display: half ? ('½ de ' + n + ' = ?') : ('2 × ' + n + ' = ?'),
    tts: half ? t('t_half', { n: numWord(LANG, n) }) : t('t_double', { n: numWord(LANG, n) }),
    answer, options: distractors(answer, [half ? n : n + n + 2, half ? n / 2 + 1 : n * 2 - 2], 120), f: { n, half: half ? 1 : 0 },
  };
}
function genMultiplicar(level, f) {
  const R = [[2, 3], [2, 5], [3, 6], [4, 9], [6, 12]][level - 1] || [2, 3];
  const g = (f && f.g) || rand(R[0], R[0] + 1);
  const k = (f && f.k) || rand(R[0], R[1]);
  const n = g * k;
  const it = pick(ITEMS);
  let rows = '';
  if (n <= 24) for (let r = 0; r < g; r++) rows += '<div class="grp row">' + emojisHTML(it, k, { small: true }) + '</div>';
  return {
    visual: rows ? '<div class="groups">' + rows + '</div>' : '',
    display: g + ' × ' + k + ' = ?', tts: t('t_mul', { a: numWord(LANG, g), b: numWord(LANG, k) }),
    answer: n, options: distractors(n, [g + k, n - g, n - k], 150), f: { g, k },
  };
}
function genDividir(level, f) {
  const R = [[2, 3], [2, 5], [3, 6], [4, 9], [6, 12]][level - 1] || [2, 3];
  const g = (f && f.g) || rand(R[0], R[1]);
  const k = (f && f.k) || rand(R[0], R[1]);
  const total = g * k;
  const it = pick(ITEMS);
  let rows = '';
  if (total <= 24) for (let r = 0; r < g; r++) rows += '<div class="grp row">' + emojisHTML(it, k, { small: true }) + '</div>';
  return {
    visual: rows ? '<div class="groups">' + rows + '</div>' : '',
    display: total + ' ÷ ' + g + ' = ?',
    tts: t('t_div', { a: numWord(LANG, total), b: numWord(LANG, g) }),
    answer: k, options: distractors(k, [g, k + 1, k - 1], 30), f: { g, k },
  };
}
function genHistoria(level, f) {
  const op = f ? f.op : (level <= 2 ? pick(['add', 'sub']) : level <= 4 ? pick(['add', 'sub', 'mul']) : pick(['sub', 'mul', 'div']));
  const it = (f && f.it != null) ? ITEMS[f.it] : pick(ITEMS);
  const name = NAMES[LANG] ? NAMES[LANG][f ? (f.ni || 0) : rand(0, NAMES[LANG].length - 1)] : 'Ana';
  let a, b, g, k, answer, display, tts, extra = '';
  if (op === 'add') {
    const cap = [10, 12, 20, 30, 50][level - 1] || 10;
    a = f ? f.a : rand(1, cap - 2); b = f ? f.b : rand(1, cap - a);
    answer = a + b; display = a + ' + ' + b + ' = ?';
    tts = t('st_1', { name, a: numWord(LANG, a), b: numWord(LANG, b), item: a === 1 ? it.name : it.plural }) + ' ' + display;
  } else if (op === 'sub') {
    const cap = [5, 10, 12, 20, 30][level - 1] || 10;
    a = f ? f.a : rand(2, cap); b = f ? f.b : rand(1, a - 1);
    answer = a - b; display = a + ' − ' + b + ' = ?';
    tts = t('st_2', { name, a: numWord(LANG, a), b: numWord(LANG, b), item: a === 1 ? it.name : it.plural }) + ' ' + display;
  } else if (op === 'mul') {
    g = f ? f.g : rand(2, 5); k = f ? f.k : rand(2, 5);
    answer = g * k; display = g + ' × ' + k + ' = ?';
    tts = t('st_3', { g: numWord(LANG, g), k: numWord(LANG, k), item: k === 1 ? it.name : it.plural }) + ' ' + display;
  } else {
    g = f ? f.g : rand(2, 6); k = f ? f.k : rand(2, 6);
    a = g * k; answer = k; display = a + ' ÷ ' + g + ' = ?';
    tts = t('st_4', { name, a: numWord(LANG, a), g: numWord(LANG, g), item: a === 1 ? it.name : it.plural }) + ' ' + display;
  }
  const itemWord = (op === 'mul') ? (k === 1 ? it.name : it.plural) : (a === 1 ? it.name : it.plural);
  const storyText = op === 'add' ? t('st_1', { name, a, b, item: itemWord })
    : op === 'sub' ? t('st_2', { name, a, b, item: itemWord })
    : op === 'mul' ? t('st_3', { g, k, item: itemWord })
    : t('st_4', { name, a, g, item: itemWord });
  extra = '<div class="story">📖 ' + storyText + '</div>';
  return {
    visual: extra, display, tts,
    answer, options: distractors(answer, [op === 'sub' ? b : a + b], 120),
    f: { op, a: a || 0, b: b || 0, g: g || 0, k: k || 0, it: ITEMS.indexOf(it), ni: NAMES[LANG] ? NAMES[LANG].indexOf(name) : 0 },
  };
}
function genDinheiro(level, f) {
  let answer, display, tts, visual = '', fd;
  const kind = f ? f.kind : (level <= 2 ? 'coins' : level === 3 ? pick(['coins5', 'change']) : 'change');
  if (kind === 'coins') {
    const n = f ? f.n : rand(1, [5, 8][level - 1] || 5);
    answer = n; display = n + ' 🪙 = ?'; tts = t('t_m_coins');
    visual = '<div class="grp plain">' + emojisHTML({ emoji: '🪙' }, n, { small: n > 6 }) + '</div>';
    fd = { kind, n };
  } else if (kind === 'coins5') {
    const c5 = f ? f.c5 : rand(1, 4); const c1 = f ? f.c1 : rand(1, 5);
    answer = c5 * 5 + c1; display = 'R$ ?';
    tts = t('t_2x2');
    visual = '<div class="grp">' + emojisHTML({ emoji: '⭐' }, c5, { small: c5 > 4 }) + '</div><div class="grp">' + emojisHTML({ emoji: '🪙' }, c1, { small: c1 > 4 }) + '</div>';
    fd = { kind, c5, c1 };
  } else {
    const p = f ? f.p : rand(2, [20, 30, 40, 50][level - 3] || 20);
    const v = f ? f.v : p + rand(1, 20);
    answer = v - p; display = v + ' − ' + p + ' = ?';
    tts = t('t_change', { p: numWord(LANG, p), v: numWord(LANG, v) });
    visual = '<div class="story">🛒 ' + display + ' · 💰 ' + v + '</div>';
    fd = { kind, p, v };
  }
  return {
    visual, display, tts, answer,
    options: distractors(answer, [answer + 5, answer - 5, 5, 1].filter((x) => x >= 0), 60), f: fd,
  };
}
function genMistar(level, f) {
  const pool = Object.keys(MODES).filter((m) => m !== 'mistar' && modeUnlocked(m));
  const m = pick(pool.length ? pool : ['contar']);
  const q = GENS[m](level, f);
  q.underlying = m;
  return q;
}
const GENS = {
  contar: genContar, somar: genSomar, subtrair: genSubtrair, faltar: genFaltar,
  comparar: genComparar, sequencia: genSequencia, dobrar: genDobrar, multiplicar: genMultiplicar,
  dividir: genDividir, historia: genHistoria, dinheiro: genDinheiro, mistar: genMistar,
};

/* ---------- nível e desbloqueio (S02 do round 2 + S12 + S07) ---------- */
function modeUnlocked(m) {
  if (G().unlockAll) return true;
  const p = P();
  return p && p.stars >= (MODES[m] ? MODES[m].unlock : 0);
}
function activeLevel(mode) {
  const p = P();
  if (G().diffMode !== 'auto') return clamp(G().diffMode | 0, 1, MAX_LEVEL);
  return clamp((p.levels[mode] || 1) | 0, 1, MAX_LEVEL);
}
/* v2.2: orçamento de tempo por questão (segundos) — generoso p/ pequenos:
   nível 1 = 30s · nível 5 = 22s; modos com muitos visuais/história ganham +6s */
const SLOW_MODES = ['contar', 'historia', 'dinheiro', 'dividir'];
function timeBudget(level, mode) {
  let s = 30 - 2 * (clamp(level, 1, MAX_LEVEL) - 1);
  if (SLOW_MODES.indexOf(mode) >= 0) s += 6;
  return s;
}
/* S07: janela móvel das últimas 5 respostas do modo — sobe/desce por habilidade */
function recordResult(mode, firstTry) {
  const p = P();
  const rec = p.recent[mode] || (p.recent[mode] = []);
  rec.push(!!firstTry);
  while (rec.length > 5) rec.shift();
  let grew = 0;
  if (rec.length === 5) {
    const wins = rec.filter(Boolean).length;
    const lv = p.levels[mode] || 1;
    if (wins >= 4 && lv < MAX_LEVEL) { p.levels[mode] = lv + 1; rec.length = 0; grew = 1; }
    else if (wins <= 1 && lv > 1) { p.levels[mode] = lv - 1; rec.length = 0; grew = -1; }
  }
  return grew;
}
function bumpLvlStat(mode, level, right) {
  const p = P();
  if (!p.lvl[mode]) p.lvl[mode] = {};
  const b = p.lvl[mode][level] || (p.lvl[mode][level] = { r: 0, w: 0 });
  if (right) b.r++; else b.w++;
}

/* ---------- revisão espaçada (S08) ---------- */
function addReviewCard(mode, level, f) {
  const p = P();
  if (mode === 'mistar' || mode === 'comparar' && false) { /* comparar usa f {a,b} ok */ }
  if (!f) return;
  if (p.review.some((c) => c.m === mode && JSON.stringify(c.f) === JSON.stringify(f))) return;
  p.review.push({ m: mode, lv: level, f, box: 1, due: fmtDate() });
  while (p.review.length > 24) p.review.shift();
}
function dueReviews() {
  const p = P();
  const today = fmtDate();
  return p.review.filter((c) => c.due <= today);
}
function gradeReview(card, right) {
  const p = P();
  if (right) {
    card.box = Math.min(5, card.box + 1);
    p.reviewWins++;
    const d = new Date(); d.setDate(d.getDate() + REVIEW_INTERVALS[card.box - 1]);
    card.due = fmtDate(d);
    if (card.box >= 5) p.review = p.review.filter((c) => c !== card);
  } else {
    card.box = 1;
    const d = new Date(); d.setDate(d.getDate() + 1);
    card.due = fmtDate(d);
  }
}

/* ---------- perguntas a partir de cartões de revisão ---------- */
function makeFromCard(card) {
  const gen = GENS[card.m] || genContar;
  return gen(clamp(card.lv, 1, MAX_LEVEL), card.f);
}
