'use strict';
/* ==================== Conta Comigo — motor ====================
   S01 faltar · S02 comparar · S03 sequencia · S04 dobrar · S05 historia · S06 dinheiro
   S07 adaptação por habilidade · S08 revisão espaçada · S21 multilíngue · S22 voz
   S27 perfis · S32 sync · migração v1 → v2
   v2.2 pontos por rapidez · v2.3 portão parental por senha (hash local)
   v2.4 voz cordial Fase 1 do estudo (A-176..A-198): heurística de vozes naturais,
   prosódia por pontuação em fila, biblioteca afetuosa, ducking, fallback local */

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/* v2.6.1: escapa texto antes de ir para innerHTML (nomes vêm do usuário e do backup) */
function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
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
const STICKERS = ['🦁','🐸','🐬','🦋','🐢','🦉','🐝','🐧','🦄','🐙','🦕','🐨','🦊','🐼','🐷','🐵','🦒','🐘','🦜','🐳','🐿️','🦩','🐊','🦔',
  /* v2.5: +12 colecionáveis novos (appended — índices antigos preservados) */
  '🐞','🦗','🐌','🪲','🦭','🦦','🦥','🐈','🐕','🐴','🐑','🐐'];
/* v2.5: mascotes adultas escolhíveis — a fase evolutiva (🥚→🐣) continua;
   aos 100⭐ a mascote vira a forma adulta escolhida pela criança */
const PETS = [
  { id: 'fox',     emoji: '🦊', price: 0,   key: 'pet_fox' },
  { id: 'panda',   emoji: '🐼', price: 40,  key: 'pet_panda' },
  { id: 'dino',    emoji: '🦖', price: 80,  key: 'pet_dino' },
  { id: 'unicorn', emoji: '🦄', price: 120, key: 'pet_unicorn' },
  { id: 'robot',   emoji: '🤖', price: 160, key: 'pet_robot' },
];
/* v2.5: marcos de ofensiva que abrem baú de recompensas (dias) */
const CHEST_MILESTONES = [3, 7, 14, 21, 30];

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
  /* v2.5: desafio Contra o Tempo — sobreviver 60 s respondendo o que der */
  tempo:       { emoji: '⏱️', unlock: 70,  color: 'cyan' },
};

/* ---------- estado global (perfis S27 + configurações S31) ---------- */
function newProfile(id, name, avatar) {
  return {
    id: id || ('p' + Date.now() + rand(100, 999)), name: name || 'Jogador', avatar: avatar || '🦊',
    stars: 0, points: 0, bestPts: {}, levels: {}, recent: {}, review: [],
    streak: 0, lastPlay: '', rounds: 0, firsts: 0, rights: 0, wrongs: 0, playSec: 0,
    bestCombo: 0, fatigue: 0, ach: {}, missions: { d: '', list: [] }, missionsDone: 0,
    owned: { themes: ['classico'], hats: [], pets: ['fox'] }, hat: '', stickers: [],
    pet: '', chests: {}, bestSurvive: 0, firstPet: false, lastPet: 0,
    bossReady: false, assessed: false, played: {}, lvl: {}, weeks: [],
    today: { d: '', rounds: 0, done: false }, reviewWins: 0, persistRounds: 0,
  };
}
/* ---------- tema (Fase 5.4): 'auto' acompanha prefers-color-scheme ao vivo ---------- */
const THEMES = ['auto', 'classico', 'espaco', 'jardim', 'arcoiris', 'oceano', 'doces', 'neve'];
const DARK_QUERY = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function resolvedTheme(g) {
  const th = (g && g.theme) || 'auto';
  if (th !== 'auto') return th;
  return DARK_QUERY && DARK_QUERY.matches ? 'espaco' : 'classico';
}
/* alto contraste: 'auto' liga junto com o "Aumentar contraste" do sistema
   (prefers-contrast: more); 'on'/'off' são a escolha do adulto no painel */
const CONTRAST_QUERY = window.matchMedia ? window.matchMedia('(prefers-contrast: more)') : null;
function contrastOn(g) {
  const c = (g && g.contrast) || 'auto';
  return c === 'on' || (c === 'auto' && !!(CONTRAST_QUERY && CONTRAST_QUERY.matches));
}
function applyTheme(g) {
  document.body.dataset.theme = resolvedTheme(g);
  document.body.classList.toggle('hc', contrastOn(g));
}
if (DARK_QUERY && DARK_QUERY.addEventListener) {
  DARK_QUERY.addEventListener('change', () => { try { if (G().theme === 'auto') applyTheme(G()); } catch (e) { /* antes do boot */ } });
}
if (CONTRAST_QUERY && CONTRAST_QUERY.addEventListener) {
  CONTRAST_QUERY.addEventListener('change', () => { try { applyTheme(G()); } catch (e) { /* antes do boot */ } });
}
/* Idioma inicial: segue o do navegador/sistema (pt, en ou es); se nenhum for
   suportado, usa português do Brasil. Só vale no primeiro uso — depois vale a
   escolha salva nas opções. */
function detectLang() {
  const tags = [];
  try { if (typeof navigator !== 'undefined') tags.push(...(navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language])); } catch (e) { /* sem navigator */ }
  try { if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) tags.push(chrome.i18n.getUILanguage()); } catch (e) { /* sem extensão */ }
  for (const tag of tags) {
    const l = String(tag || '').slice(0, 2).toLowerCase();
    if (l === 'pt' || l === 'en' || l === 'es') return l;
  }
  return 'pt';
}
const DEFAULT_SETTINGS = {
  /* Fase 5: 'auto' segue o sistema (claro = Clássico, escuro = Espaço; ambos grátis) */
  lang: detectLang(), theme: 'auto', contrast: 'auto', dys: false, calmo: null,
  mute: false, volume: 0.9, vRate: 0.95, vPitch: 1.15, vVoice: '',
  diffMode: 'auto', goalRounds: 3, sessionLimit: 15, sync: false,
  unlockAll: false, newtabOn: true, timer: true,
  /* v2.4 — voz cordial: narração e efeitos independentes, tempo extra, menos movimento */
  voiceOn: true, sfxOn: true, timeScale: 1, reduceMotion: false, shopOff: false,
  /* v2.3 — portão parental por senha (tudo fica no dispositivo) */
  passHash: '', passSalt: '', passHint: '', passSetAt: 0,
  passTries: 0, passLockUntil: 0,
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
      // v2.6.2: o antigo hc (sim/não) vira contrast; "não" passa a seguir o sistema
      const old = d.settings && typeof d.settings === 'object' ? d.settings : {};
      if (!('contrast' in old) && 'hc' in old) old.contrast = old.hc === true ? 'on' : 'auto';
      d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
      normalizeDB(d);
      return d;
    }
    if (d.totalStars != null || d.levels) return migrateV1(d); // v1 → v2
  } catch (e) { /* ignora */ }
  return null;
}
/* v2.6.1: o backup importado é entrada não confiável — cada campo volta ao
   tipo do molde (newProfile/DEFAULT_SETTINGS); id, nome e avatar são validados */
const MAX_PROFILES = 4;
const NAME_MAX = 24;
function cleanName(v) {
  const n = typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, NAME_MAX) : '';
  return n || 'Jogador';
}
function coerceLike(tpl, obj) {
  Object.keys(tpl).forEach((k) => {
    const want = tpl[k];
    if (typeof want === 'number') { const n = Number(obj[k]); obj[k] = Number.isFinite(n) ? n : want; }
    else if (typeof want === 'boolean') obj[k] = !!obj[k];
    else if (typeof want === 'string') { if (typeof obj[k] !== 'string') obj[k] = want; }
    else if (Array.isArray(want)) { if (!Array.isArray(obj[k])) obj[k] = want; }
    else if (want && typeof want === 'object') { if (!obj[k] || typeof obj[k] !== 'object' || Array.isArray(obj[k])) obj[k] = want; }
  });
  return obj;
}
/* v2.6.2: mapas por modo (níveis, recordes, conquistas…) — só chaves simples
   (nada de "__proto__") e valores no formato que o jogo grava */
function cleanMap(o, fix) {
  const out = {};
  if (!o || typeof o !== 'object' || Array.isArray(o)) return out;
  Object.keys(o).forEach((k) => {
    if (!/^[A-Za-z0-9]{1,16}$/.test(k)) return;
    const v = fix(o[k]);
    if (v !== undefined) out[k] = v;
  });
  return out;
}
const finiteOr0 = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
/* v2.6.2: cartões de revisão (S08) — cada modo aceita só os campos que o seu
   gerador grava, como inteiros pequenos; op/kind só da lista. Qualquer outra
   coisa (texto, HTML, número enorme) descarta o cartão inteiro. */
const REVIEW_FIELDS = {
  contar: ['it', 'n'], somar: ['it', 'a', 'b'], subtrair: ['it', 'a', 'b'], faltar: ['a', 's'],
  comparar: ['a', 'b'], sequencia: ['s', 'd'], dobrar: ['n', 'half'], multiplicar: ['g', 'k'],
  dividir: ['g', 'k'], historia: ['op', 'a', 'b', 'g', 'k', 'it', 'ni'],
};
const REVIEW_MONEY = { coins: ['n'], coins5: ['c5', 'c1'], change: ['p', 'v'] };
const REVIEW_OPS = ['add', 'sub', 'mul', 'div'];
const REVIEW_NUM_MAX = 500;
function cleanReviewF(m, f) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return null;
  let keys;
  if (m === 'dinheiro') {
    if (!Object.prototype.hasOwnProperty.call(REVIEW_MONEY, f.kind)) return null;
    keys = REVIEW_MONEY[f.kind];
  } else if (Object.prototype.hasOwnProperty.call(REVIEW_FIELDS, m)) keys = REVIEW_FIELDS[m];
  else return null;
  const out = m === 'dinheiro' ? { kind: f.kind } : {};
  for (const k of keys) {
    const v = f[k];
    if (k === 'op') { if (REVIEW_OPS.indexOf(v) < 0) return null; out.op = v; continue; }
    if (typeof v !== 'number' || !Number.isInteger(v) || Math.abs(v) > REVIEW_NUM_MAX) return null;
    if (v < 0 && k !== 'd') return null; // só o passo da sequência pode ser negativo
    out[k] = v;
  }
  if (out.it != null && out.it >= ITEMS.length) return null;
  if (out.ni != null && out.ni > 3) return null;
  return out;
}
function cleanReviewCard(c) {
  if (!c || typeof c !== 'object') return null;
  const f = cleanReviewF(c.m, c.f);
  if (!f) return null;
  return {
    m: c.m, lv: clamp(Math.round(Number(c.lv)) || 1, 1, MAX_LEVEL), f,
    box: clamp(Math.round(Number(c.box)) || 1, 1, 5),
    due: (typeof c.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.due)) ? c.due : fmtDate(),
  };
}
/* v2.2: campos novos de pontos · v2.3: campos da senha dos responsáveis */
function normalizeDB(d) {
  const seen = {};
  d.profiles = (Array.isArray(d.profiles) ? d.profiles : [])
    .filter((p) => p && typeof p === 'object' && !Array.isArray(p)).slice(0, MAX_PROFILES);
  d.profiles.forEach((p, i) => {
    coerceLike(newProfile('x'), p);
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(p.id) || seen[p.id]) p.id = 'p' + (i + 1) + '_' + Date.now();
    seen[p.id] = true;
    p.name = cleanName(p.name);
    if (AVATARS.indexOf(p.avatar) < 0) p.avatar = AVATARS[0];
    if (/[<>&"']/.test(p.hat) || p.hat.length > 8) p.hat = '';
    p.missions.list = (Array.isArray(p.missions.list) ? p.missions.list : [])
      .filter((m) => m && typeof m.id === 'string')
      .map((m) => ({ id: m.id, p: Number(m.p) || 0, done: !!m.done }));
    p.weeks = p.weeks.filter((w) => w && typeof w.k === 'string' && /^[0-9A-Za-z-]{1,12}$/.test(w.k))
      .map((w) => ({ k: w.k, rounds: Number(w.rounds) || 0, rights: Number(w.rights) || 0 }));
    p.points = Number(p.points) || 0;
    p.bestPts = cleanMap(p.bestPts, finiteOr0);
    p.levels = cleanMap(p.levels, (v) => clamp(Math.round(Number(v)) || 1, 1, MAX_LEVEL));
    p.recent = cleanMap(p.recent, (v) => (Array.isArray(v) ? v.slice(-5).map(Boolean) : undefined));
    p.lvl = cleanMap(p.lvl, (byLv) => cleanMap(byLv, (b) => (b && typeof b === 'object' ? { r: finiteOr0(b.r), w: finiteOr0(b.w) } : undefined)));
    p.played = cleanMap(p.played, () => 1);
    p.today.modes = cleanMap(p.today.modes, () => 1);
    p.review = p.review.map(cleanReviewCard).filter(Boolean).slice(-24);
    ['vRate', 'vPitch'].forEach((k) => { if (p[k] != null && !Number.isFinite(p[k])) delete p[k]; });
    if (p.vVoice != null && typeof p.vVoice !== 'string') delete p.vVoice;
    /* v2.5: persistência blindada de conquistas/coleções — nada some em migração */
    p.ach = cleanMap(p.ach, () => 1);
    p.stickers = (Array.isArray(p.stickers) ? p.stickers : [])
      .filter((i, j, a) => Number.isInteger(i) && i >= 0 && i < STICKERS.length && a.indexOf(i) === j);
    p.owned = (p.owned && typeof p.owned === 'object') ? p.owned : { themes: ['classico'], hats: [], pets: ['fox'] };
    const shortStrs = (a) => (Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x.length <= 16) : []);
    p.owned.themes = shortStrs(p.owned.themes); if (!p.owned.themes.length) p.owned.themes = ['classico'];
    p.owned.hats = shortStrs(p.owned.hats);
    p.owned.pets = shortStrs(p.owned.pets); if (!p.owned.pets.length) p.owned.pets = ['fox'];
    p.pet = typeof p.pet === 'string' ? p.pet : '';
    p.chests = cleanMap(p.chests, () => 1);
    p.bestSurvive = Number(p.bestSurvive) || 0;
    p.firstPet = !!p.firstPet;
  });
  if (typeof d.activeId !== 'string') d.activeId = '';
  const s = d.settings = (d.settings && typeof d.settings === 'object') ? d.settings : Object.assign({}, DEFAULT_SETTINGS);
  const diffMode = s.diffMode, calmo = s.calmo;
  coerceLike(DEFAULT_SETTINGS, s);
  s.diffMode = (diffMode === 1 || diffMode === 2 || diffMode === 3) ? diffMode : 'auto';
  s.calmo = (calmo === true || calmo === false) ? calmo : null;
  if (!Object.prototype.hasOwnProperty.call(TTS_LANG, s.lang)) s.lang = detectLang();
  if (THEMES.indexOf(s.theme) < 0) s.theme = 'auto';
  if (['auto', 'on', 'off'].indexOf(s.contrast) < 0) s.contrast = 'auto';
  delete s.hc;
  s.volume = clamp(s.volume, 0, 1);
  s.lastBackupAt = Number(s.lastBackupAt) || 0;
  ['passHash', 'passSalt', 'passHint'].forEach((k) => { if (typeof s[k] !== 'string') s[k] = ''; });
  ['passSetAt', 'passTries', 'passLockUntil'].forEach((k) => { s[k] = Number(s[k]) || 0; });
  return d;
}
/* ---------- casco nativo (Fase 6.1 — "Fase A" do estudo de apps nativos) ----------
   Dentro do app iOS (Capacitor) o jogo usa plugins nativos: Preferences para o
   progresso (o localStorage do WKWebView pode ser recolhido pelo sistema) e
   TextToSpeech para a voz. Sem bundler: plugin nativo instalado aparece em
   Capacitor.Plugins. Fora do app tudo segue pelas APIs web de sempre. */
function capPlugin(name) {
  try {
    const C = typeof window !== 'undefined' && window.Capacitor;
    if (C && typeof C.isNativePlatform === 'function' && C.isNativePlatform() &&
        (typeof C.isPluginAvailable !== 'function' || C.isPluginAvailable(name)) && C.Plugins && C.Plugins[name]) return C.Plugins[name];
  } catch (e) { /* ignora */ }
  return null;
}
const IN_NATIVE_APP = (() => { try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) { return false; } })();
const NATIVE_PREFS = capPlugin('Preferences');
const NATIVE_TTS = capPlugin('TextToSpeech');

/* entre duas cópias válidas, vale a gravada por último */
function newerDB(a, b) { if (!a) return b; if (!b) return a; return (b.updatedAt || 0) > (a.updatedAt || 0) ? b : a; }
async function loadNative() {
  try { const r = await NATIVE_PREFS.get({ key: 'cc_state' }); return r && r.value ? parseDB(r.value) : null; }
  catch (e) { return null; }
}
function loadRaw() {
  let ld = null;
  try { const ls = localStorage.getItem('cc_state'); if (ls) ld = parseDB(ls); } catch (e) { /* ignora */ }
  if (NATIVE_PREFS) return loadNative().then((nd) => newerDB(nd, ld));
  if (ld) return Promise.resolve(ld);
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
      if (parsed) d = keepLocalSecrets(parsed, d);
    }
  }
  if (!d) d = { v: 2, updatedAt: Date.now(), activeId: '', profiles: [], settings: Object.assign({}, DEFAULT_SETTINGS) };
  if (!d.profiles.length) d.profiles.push(newProfile('p1', 'Jogador', '🦊'));
  if (!d.profiles.find((p) => p.id === d.activeId)) d.activeId = d.profiles[0].id;
  d.settings = Object.assign({}, DEFAULT_SETTINGS, d.settings || {});
  normalizeDB(d);
  DB = d;
  askPersistentStorage();
  return DB;
}
/* PWA instalada: pede ao navegador para não recolher o armazenamento sob pouco
   espaço (Chrome concede sem perguntar a apps instalados). Só no modo app, para
   não abrir pergunta de permissão numa aba comum. */
function askPersistentStorage() {
  try {
    if (NATIVE_PREFS || !navigator.storage || !navigator.storage.persist) return;
    if (!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)) return;
    navigator.storage.persisted().then((ok) => { if (!ok) return navigator.storage.persist(); }).catch(() => { /* ignora */ });
  } catch (e) { /* ignora */ }
}
/* apaga o progresso em todas as camadas (reset do painel); resolve quando a
   cópia nativa também saiu — recarregar antes disso traria o progresso de volta */
function clearSavedState() {
  clearTimeout(saveTimer);
  try { localStorage.removeItem('cc_state'); } catch (e) { /* ignora */ }
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) { chrome.storage.local.clear(); chrome.storage.sync.clear(); }
  } catch (e) { /* ignora */ }
  if (!NATIVE_PREFS) return Promise.resolve();
  return NATIVE_PREFS.remove({ key: 'cc_state' }).catch(() => { /* ignora */ });
}
let saveTimer = null;
function saveState(immediate) {
  DB.updatedAt = Date.now();
  const json = JSON.stringify(DB);
  const write = () => {
    try { localStorage.setItem('cc_state', json); } catch (e) { /* ignora */ }
    if (NATIVE_PREFS) { try { NATIVE_PREFS.set({ key: 'cc_state', value: json }).catch(() => { /* ignora */ }); } catch (e) { /* ignora */ } }
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ cc_state: JSON.parse(json) }, () => { void chrome.runtime.lastError; });
      }
      if (G().sync && typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ cc_state_sync: shareableDB(DB) }, () => { void chrome.runtime.lastError; });
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
    // v2.4 (A-185 mixagem clara): efeitos abaixam enquanto a narração fala
    const duck = (typeof TTS !== 'undefined' && TTS.speakingNow) ? 0.35 : 1;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime((vol || 0.12) * (G().volume != null ? G().volume : 0.9) * duck, t0 + 0.02);
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
  /* v2.4 (A-183): vitória com variações — nunca a mesma sequência duas vezes seguidas */
  _fx: 0,
  fanfare: () => {
    const seqs = [[523, 659, 784, 1047], [392, 523, 659, 784], [523, 659, 784, 880, 1047]];
    let i = rand(0, seqs.length - 1);
    if (i === SFX._fx) i = (i + 1) % seqs.length;
    SFX._fx = i;
    seqs[i].forEach((f, j) => tone(f, j * 0.13, 0.28, 'triangle', 0.11));
  },
  /* v2.5: caixa registradora — compras na loja ganham som próprio */
  cash: () => { tone(880, 0, 0.07, 'square', 0.05); tone(1319, 0.08, 0.16, 'triangle', 0.09); tone(1760, 0.18, 0.22, 'triangle', 0.08); },
};

/* ---------- voz cordial (S22 + Fase 1 do estudo de voz, v2.4) ----------
   A-176 heurística de vozes naturais/neurais · A-177 prosódia por pontuação em
   fila com pausas calculadas · A-196 sem duplicatas em rajada · A-179 preferências
   por perfil (pf.vRate/vPitch/vVoice) · fallback silencioso p/ voz local quando
   uma voz Online falha · A-087/A-083 nenhum áudio continua fora de cena */
/* iOS/iPadOS no Safari: a fila de fala às vezes silencia sem um cancel() antes
   de cada speak() (receita da comunidade; estudo de apps nativos, cap. 4) */
const IOS_WEBKIT = typeof navigator !== 'undefined' &&
  (/iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
const TTS = {
  ok: !!NATIVE_TTS || (typeof window !== 'undefined' && 'speechSynthesis' in window),
  native: !!NATIVE_TTS,
  gen: 0,          // muda a cada cancelamento: falas nativas antigas não avançam a fila
  voices: [],
  queue: [],
  runner: null,
  speakingNow: false,
  lastText: '', lastAt: 0,
  init() {
    if (!this.ok) return;
    if (this.native) {
      NATIVE_TTS.getSupportedVoices().then((r) => {
        this.voices = (r && r.voices) || [];
        if (window.CC && window.CC.onVoices) window.CC.onVoices();
      }).catch(() => { /* sem lista: o sistema escolhe a voz do idioma */ });
      try {
        document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); });
        window.addEventListener('pagehide', () => this.stop());
      } catch (e) { /* ignora */ }
      return;
    }
    const upd = () => {
      try { this.voices = window.speechSynthesis.getVoices() || []; } catch (e) { /* ignora */ }
      if (window.CC && window.CC.onVoices) window.CC.onVoices();
    };
    upd();
    try { window.speechSynthesis.addEventListener('voiceschanged', upd); }
    catch (e) { window.speechSynthesis.onvoiceschanged = upd; }
    // A-087/A-083: trocar de aba ou fechar a janela corta a fala — nada "vaza" de cena
    try {
      document.addEventListener('visibilitychange', () => { if (document.hidden) this.stop(); });
      window.addEventListener('pagehide', () => this.stop());
      window.addEventListener('beforeunload', () => this.stop());
    } catch (e) { /* ignora */ }
  },
  /* pontuação de qualidade (A-176 + estudo de vozes humanizadas v2, v2.6):
     camada 🌟 = vozes "Online (Natural)" do Edge / neural / studio / premium /
     enhanced (modelos neurais com entonação humana); camada ⚡ = vozes de rede
     e marcas (Google, Microsoft, Apple/Siri, Samsung); vozes locais estáveis
     ganham bônus; motores robóticos conhecidos (eSpeak, Pico, Festival,
     "Compact" da Apple) são afastados; curadoria por nome soma prioridade.
     A escolha manual do responsável sempre vence a heurística. */
  scoreVoice(v) {
    const n = ((v.name || '') + ' ' + (v.voiceURI || '')).toLowerCase();
    let s = 0;
    if (/online \(natural\)|natural|neural|studio|premium|enhanced|super-?real/.test(n)) s += 46;
    if (/multilingual|siri|eloquence/.test(n)) s += 12;
    if (/(google|microsoft|apple|samsung)/.test(n)) s += 10;
    if (v.localService) s += 6;
    // curadoria (estudo v2): vozes sabidamente calorosas/agradáveis em pt/en/es
    if (/(thalita|francisca|antonio|brenda|elza|giovanni|giovana|leticia|luciana|yara|joana|maria|camila|aria|jenny|emma|michelle|ana online|elvira|dalia|salome|helena|paulina|monica|monica|isabela)/.test(n)) s += 8;
    // penaliza motores notoriamente robóticos
    if (/(espeak|pico|festival|fife|flite|cmu|compact|robosoft)/.test(n)) s -= 30;
    return s;
  },
  /* camada de qualidade para a interface: 3=🌟 natural · 2=⚡ neural/rede ·
     1=padrão · 0=básica/robótica — usada nas opções para agrupar e rotular */
  voiceTier(v) {
    if (!v) return 1;
    const n = ((v.name || '') + ' ' + (v.voiceURI || '')).toLowerCase();
    if (/(espeak|pico|festival|fife|flite|cmu|robosoft)/.test(n)) return 0;
    if (/online \(natural\)|natural|neural|studio|premium|enhanced|super-?real/.test(n)) return 3;
    if (/multilingual|siri|eloquence/.test(n)) return 2;
    if (/(google|microsoft|apple|samsung)/.test(n)) return 2;
    if (/compact/.test(n)) return 0;
    return 1;
  },
  /* voz automaticamente escolhida (para mostrar na UI qual está ativa) */
  bestVoiceInfo(want2) {
    const v = this.pickVoice(want2);
    if (!v) return null;
    return { name: v.name || v.voiceURI || '', tier: this.voiceTier(v) };
  },
  pickVoice(want2) {
    const vs = this.voices.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().indexOf(want2) === 0);
    if (!vs.length) return null;
    const g = G();
    const mine = (g.vVoice || '') || ((typeof P === 'function' && P() && P().vVoice) || '');
    if (mine) { const c = vs.find((v) => v.voiceURI === mine); if (c) return c; }
    return vs.slice().sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a))[0];
  },
  stripEmoji(s) {
    try { return String(s).replace(/\p{Extended_Pictographic}/gu, '').replace(/\s{2,}/g, ' ').trim(); }
    catch (e) { return String(s); }
  },
  /* A-177: divide em segmentos prosódicos; a pausa cresce com a "força" da pontuação */
  segments(text) {
    const parts = String(text).split(/(?<=[.!?…])\s+|(?<=[:;])\s+/).filter(Boolean);
    const out = parts.map((p) => ({
      text: p,
      pause: /…|\.\.\.$/.test(p) ? 420 : /[!?]$/.test(p) ? 300 : /[.]$/.test(p) ? 260 : 140,
    }));
    return out.length ? out : [{ text: String(text), pause: 0 }];
  },
  speak(text, opts) {
    if (!this.ok || !G().voiceOn || G().mute || !text) return;
    const now = Date.now();
    if (!(opts && opts.force) && text === this.lastText && now - this.lastAt < 1800) return; // A-196
    this.lastText = text; this.lastAt = now;
    this.cancelQueue();
    const calm = !!(opts && opts.calm); // A-194: repetir com calma (15% mais devagar)
    this.queue = this.segments(this.stripEmoji(text)).map((s) => ({ text: s.text, pause: s.pause, calm }));
    this.speakingNow = true;
    this.next();
  },
  next() {
    if (!this.ok) return;
    const seg = this.queue.shift();
    if (!seg) { this.speakingNow = false; return; }
    try {
      const g = G();
      const want = TTS_LANG[g.lang] || 'pt-BR';
      const prof = (typeof P === 'function' && P()) || {};
      const rate = (typeof prof.vRate === 'number' ? prof.vRate : (g.vRate || 0.95)) * (seg.calm ? 0.85 : 1);
      const pitch = (typeof prof.vPitch === 'number' ? prof.vPitch : (g.vPitch || 1.15));
      const v = this.pickVoice(want.slice(0, 2).toLowerCase());
      const self = this;
      if (this.native) {
        // AVSpeechSynthesizer (iOS) via plugin: a promessa resolve no fim da fala
        const gen = this.gen;
        const idx = v ? this.voices.indexOf(v) : -1;
        const opt = { text: seg.text, lang: want, rate: clamp(rate, 0.5, 1.6), pitch: clamp(pitch, 0.5, 2), volume: 1, category: 'ambient' };
        if (idx >= 0) opt.voice = idx;
        NATIVE_TTS.speak(opt)
          .then(() => { if (gen === self.gen) self.runner = setTimeout(() => self.next(), seg.pause); })
          .catch(() => { if (gen === self.gen) self.speakingNow = false; });
        return;
      }
      const u = new SpeechSynthesisUtterance(seg.text);
      u.lang = want;
      if (v) u.voice = v;
      u.rate = clamp(rate, 0.5, 1.6);
      u.pitch = clamp(pitch, 0.5, 2);
      u.volume = 1;
      u.onerror = () => {
        // caminho B do estudo: voz Online falhou (sem rede) → cai em silêncio p/ voz local
        if (v && v.localService === false) {
          const local = self.voices.filter((x) => x.localService &&
            x.lang && x.lang.replace('_', '-').toLowerCase().indexOf(want.slice(0, 2).toLowerCase()) === 0)[0];
          if (local) {
            try {
              const u2 = new SpeechSynthesisUtterance(seg.text);
              u2.voice = local; u2.lang = want; u2.rate = u.rate; u2.pitch = u.pitch;
              window.speechSynthesis.speak(u2);
            } catch (e) { /* ignora */ }
          }
        }
      };
      u.onend = () => { self.runner = setTimeout(() => self.next(), seg.pause); };
      if (IOS_WEBKIT) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ } }
      window.speechSynthesis.speak(u);
    } catch (e) { this.speakingNow = false; }
  },
  cancelQueue() {
    this.queue = [];
    this.gen++;
    if (this.runner) { clearTimeout(this.runner); this.runner = null; }
    if (this.native) { try { NATIVE_TTS.stop().catch(() => { /* ignora */ }); } catch (e) { /* ignora */ } return; }
    try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ }
  },
  stop() { if (this.ok) { this.speakingNow = false; this.cancelQueue(); } },
};

/* ---------- portão parental: hash de senha (v2.3 · v2.6.2 PBKDF2) ----------
   A senha NUNCA é guardada em texto puro. Desde a v2.6.2 guardamos
   "pbkdf2$<rodadas>$<hex>" = PBKDF2-HMAC-SHA-256(senha, sal). O formato antigo,
   sha256(sal + ':' + senha) numa rodada só, ainda é aceito e é trocado pelo novo
   no primeiro acesso certo. O lembrete fica em texto (o adulto o lê em "Esqueci
   a senha"). Senha, sal e lembrete ficam só no aparelho: não vão no backup, na
   cópia nem no sync. crypto.subtle quando disponível; fallback puro em JS
   (mesmo algoritmo, menos rodadas, para contextos sem WebCrypto). */
function ccUtf8Bytes(str) {
  try { return Array.from(new TextEncoder().encode(str)); }
  catch (e) {
    const bin = unescape(encodeURIComponent(str));
    const out = [];
    for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i) & 0xff);
    return out;
  }
}
const SHA256_K = new Int32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
const SHA256_H0 = new Int32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
/* um bloco de 64 bytes: W[0..15] já preenchidos; atualiza H no lugar */
function sha256Block(H, W) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a));
  for (let i = 16; i < 64; i++) {
    const s0 = rr(W[i - 15], 7) ^ rr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
    const s1 = rr(W[i - 2], 17) ^ rr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
    W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
  }
  let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
  for (let i = 0; i < 64; i++) {
    const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + SHA256_K[i] + W[i]) | 0;
    const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
    h = g; g = f; f = e; e = (d + t1) | 0;
    d = c; c = b; b = a; a = (t1 + t2) | 0;
  }
  H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
  H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
}
/* SHA-256 de uma lista de bytes → 8 palavras de 32 bits */
function sha256Words(bytes) {
  const msg = bytes.slice();
  msg.push(0x80);
  while (msg.length % 64 !== 56) msg.push(0);
  const bitsHi = Math.floor(bytes.length / 536870912);
  const bitsLo = (bytes.length * 8) >>> 0;
  msg.push((bitsHi >>> 24) & 255, (bitsHi >>> 16) & 255, (bitsHi >>> 8) & 255, bitsHi & 255,
    (bitsLo >>> 24) & 255, (bitsLo >>> 16) & 255, (bitsLo >>> 8) & 255, bitsLo & 255);
  const H = Int32Array.from(SHA256_H0);
  const W = new Int32Array(64);
  for (let off = 0; off < msg.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      const j = off + i * 4;
      W[i] = (msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3];
    }
    sha256Block(H, W);
  }
  return H;
}
const wordsHex = (H) => Array.from(H, (x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
const wordsBytes = (H) => { const out = []; H.forEach((x) => out.push((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255)); return out; };
function ccSha256Hex(input) { return wordsHex(sha256Words(ccUtf8Bytes(input))); }
/* PBKDF2-HMAC-SHA-256 com 32 bytes de saída (um bloco). Cada rodada parte dos
   estados já processados de ipad/opad: duas compressões por rodada. */
function ccPbkdf2Hex(pw, salt, iter) {
  let key = ccUtf8Bytes(pw);
  if (key.length > 64) key = wordsBytes(sha256Words(key));
  const padded = (x) => { const b = []; for (let i = 0; i < 64; i++) b.push((key[i] || 0) ^ x); return b; };
  const ipad = padded(0x36), opad = padded(0x5c);
  const W = new Int32Array(64);
  const stateAfter = (block) => {
    const H = Int32Array.from(SHA256_H0);
    for (let i = 0; i < 16; i++) W[i] = (block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | block[i * 4 + 3];
    sha256Block(H, W);
    return H;
  };
  const iState = stateAfter(ipad), oState = stateAfter(opad);
  const inner1 = sha256Words(ipad.concat(ccUtf8Bytes(salt), [0, 0, 0, 1]));
  const U = sha256Words(opad.concat(wordsBytes(inner1)));
  const T = Int32Array.from(U);
  const H = new Int32Array(8);
  // mensagem de 32 bytes depois de um bloco já processado: 0x80, zeros e 768 bits
  const tail = () => { W[8] = 0x80000000 | 0; W.fill(0, 9, 15); W[15] = 768; };
  for (let j = 1; j < iter; j++) {
    H.set(iState); W.set(U, 0); tail(); sha256Block(H, W);
    W.set(H, 0); H.set(oState); tail(); sha256Block(H, W);
    U.set(H);
    for (let k = 0; k < 8; k++) T[k] ^= H[k];
  }
  return wordsHex(T);
}
const PASS_MIN = 6;            // novas senhas (as antigas, de 4 ou 5, continuam valendo)
const PASS_ITER = 600000;      // WebCrypto — recomendação da OWASP para PBKDF2-HMAC-SHA-256
const PASS_ITER_JS = 100000;   // fallback em JS puro (contexto sem crypto.subtle)
const PASS_ITER_MAX = 2000000;
const PASS_FMT = /^pbkdf2\$(\d{1,7})\$([0-9a-f]{64})$/;
const PASS = {
  salt() {
    try {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const a = new Uint8Array(16);
        crypto.getRandomValues(a);
        return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* cai para o fallback */ }
    return String(Date.now()) + String(Math.random()).slice(2, 12) + String(Math.random()).slice(2, 12);
  },
  subtle() {
    try { return (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.deriveBits) ? crypto.subtle : null; }
    catch (e) { return null; }
  },
  async pbkdf2(pw, salt, iter) {
    const sub = this.subtle();
    if (sub) {
      try {
        const enc = new TextEncoder();
        const key = await sub.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
        const bits = await sub.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: iter }, key, 256);
        return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (e) { /* cai para o fallback */ }
    }
    return ccPbkdf2Hex(pw, salt, iter);
  },
  async hash(pw, salt) {
    const iter = this.subtle() ? PASS_ITER : PASS_ITER_JS;
    return 'pbkdf2$' + iter + '$' + (await this.pbkdf2(pw, salt, iter));
  },
  /* formato v2.3 (uma rodada de SHA-256): só para conferir senhas antigas */
  async legacyHash(pw, salt) {
    const text = salt + ':' + pw;
    const sub = this.subtle();
    try {
      if (sub && sub.digest) {
        const buf = await sub.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* cai para o fallback */ }
    return ccSha256Hex(text);
  },
  async verify(pw, salt, expect) {
    if (!salt || !expect) return false;
    const m = PASS_FMT.exec(expect);
    if (m) {
      const iter = Number(m[1]);
      if (iter < 1 || iter > PASS_ITER_MAX) return false;
      return (await this.pbkdf2(pw, salt, iter)) === m[2];
    }
    return /^[0-9a-f]{64}$/.test(expect) && (await this.legacyHash(pw, salt)) === expect;
  },
  /* hash antigo, ou feito em JS puro onde agora há WebCrypto: refazer no acesso */
  needsUpgrade(expect) {
    const m = PASS_FMT.exec(expect || '');
    return !m || (Number(m[1]) < PASS_ITER && !!this.subtle());
  },
};

/* A senha pertence ao aparelho: backup, cópia e sync levam o progresso sem
   hash, sal, lembrete nem bloqueio, e importar ou adotar uma cópia remota
   mantém a senha que já está aqui. */
const SECRET_KEYS = ['passHash', 'passSalt', 'passHint', 'passSetAt', 'passTries', 'passLockUntil'];
function shareableDB(db) {
  const out = JSON.parse(JSON.stringify(db));
  if (out.settings) SECRET_KEYS.forEach((k) => { delete out.settings[k]; });
  return out;
}
function keepLocalSecrets(incoming, local) {
  const from = (local && local.settings) || DEFAULT_SETTINGS;
  SECRET_KEYS.forEach((k) => { incoming.settings[k] = from[k] != null ? from[k] : DEFAULT_SETTINGS[k]; });
  return incoming;
}
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
  const pool = Object.keys(MODES).filter((m) => m !== 'mistar' && m !== 'tempo' && modeUnlocked(m));
  const m = pick(pool.length ? pool : ['contar']);
  const q = GENS[m](level, f);
  q.underlying = m;
  return q;
}
/* v2.5: Contra o Tempo — sorteia entre os modos liberados, igual ao Mistão */
function genTempo(level, f) {
  return genMistar(level, f);
}
const GENS = {
  contar: genContar, somar: genSomar, subtrair: genSubtrair, faltar: genFaltar,
  comparar: genComparar, sequencia: genSequencia, dobrar: genDobrar, multiplicar: genMultiplicar,
  dividir: genDividir, historia: genHistoria, dinheiro: genDinheiro, mistar: genMistar, tempo: genTempo,
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
/* o cartão passa de novo pela validação: os geradores só recebem inteiros
   conferidos, mesmo que um cartão ruim escape de outro caminho */
function makeFromCard(card) {
  const c = cleanReviewCard(card);
  if (!c) return genContar(1);
  return GENS[c.m](c.lv, c.f);
}

/* ==================== regras de recompensa (sem DOM) ====================
   Estrelas, pontos, missões, metas, chefe, conquistas e baús. Estas funções
   mexem só no perfil recebido e devolvem o que a interface deve comemorar
   (toast, som, confete ficam em ui.js). Testadas em tests/engine.test.cjs. */
const STARS_MISSION = 3, STARS_GOAL = 5, STARS_ACH = 5;
const COMBO_STEP = 5, STARS_COMBO = 2;   // a cada 5 acertos seguidos, +2 ⭐
const BOSS_EVERY = 5, BOSS_WIN = 0.7;    // chefe a cada 5 rodadas; vence com 70% de primeira

/* ---------- missões diárias (S16) ---------- */
const MISSION_DEFS = [
  { id: 'rounds2', key: 'mi_rounds2', goal: 2, ev: 'round' },
  { id: 'first5', key: 'mi_first5', goal: 5, ev: 'first' },
  { id: 'combo3', key: 'mi_combo3', goal: 3, ev: 'combo' },
  { id: 'newmode', key: 'mi_newmode', goal: 1, ev: 'newmode' },
  { id: 'review3', key: 'mi_review3', goal: 3, ev: 'review' },
];
/* avança as missões do dia ligadas ao evento; devolve as que fecharam agora */
function advanceMissions(p, ev, n) {
  const done = [];
  p.missions.list.forEach((m) => {
    const def = MISSION_DEFS.find((d) => d.id === m.id);
    if (!def || m.done || def.ev !== ev) return;
    m.p = Math.min(def.goal, m.p + (n || 1));
    if (m.p >= def.goal) { m.done = true; p.stars += STARS_MISSION; p.missionsDone++; done.push(def); }
  });
  return done;
}

/* ---------- conquistas (S14) ---------- */
const ACHS = [
  { id: 'a1', cond: (p) => p.stars >= 1 },
  { id: 'a2', cond: (p) => p.stars >= 50 },
  { id: 'a3', cond: (p) => p.stars >= 200 },
  { id: 'a4', cond: (p) => p.rounds >= 10 },
  { id: 'a5', cond: (p) => (p.bestCombo || 0) >= 5 },
  { id: 'a6', cond: (p) => !!p.firstDiv },
  { id: 'a7', cond: (p) => !!p.bossWon },
  { id: 'a8', cond: (p) => (p.streak || 0) >= 7 },
  { id: 'a9', cond: (p) => Object.keys(p.played || {}).length >= 12 },
  { id: 'a10', cond: (p) => (p.reviewWins || 0) >= 10 },
  { id: 'a11', cond: (p) => (p.missionsDone || 0) >= 5 },
  { id: 'a12', cond: (p) => !!p.firstBuy },
  /* v2.4 (A-118/A-128): medalhas de persistência — errar faz parte, insistir vale medalha */
  { id: 'a13', cond: (p) => (p.persistRounds || 0) >= 1 },
  { id: 'a14', cond: (p) => (p.persistRounds || 0) >= 5 },
  /* v2.5: conquistas das novidades — duas são SECRETAS (aparecem como ???) */
  { id: 'a15', cond: (p) => !!p.firstPet },
  { id: 'a16', cond: (p) => (p.stickers || []).length >= 10 },
  { id: 'a17', sec: true, cond: (p) => (p.stickers || []).length >= STICKERS.length },
  { id: 'a18', cond: (p) => (p.bestSurvive || 0) >= 10 },
  { id: 'a19', cond: (p) => Object.keys(p.chests || {}).length >= 3 },
  { id: 'a20', sec: true, cond: (p) => (p.owned.themes || []).length >= 4 },
];
/* em ordem: as estrelas de uma conquista já contam para a seguinte */
function unlockAchievements(p) {
  const got = [];
  ACHS.forEach((a) => {
    if (!p.ach[a.id] && a.cond(p)) { p.ach[a.id] = 1; p.stars += STARS_ACH; got.push(a.id); }
  });
  return got;
}

/* ---------- resposta ---------- */
/* Acerto: 2 ⭐ de primeira, 1 depois de errar; chefe dobra. Pontos (v2.2):
   100×nível + até 60×nível pelo tempo que sobrou, ou 40×nível depois de errar;
   chefe dobra; avaliação e duelo não pontuam. a.combo já conta este acerto. */
function answerReward(a) {
  const mult = clamp(a.level || 1, 1, MAX_LEVEL);
  let stars = a.firstTry ? 2 : 1;
  if (a.kind === 'boss') stars *= 2;
  let points = 0;
  if (a.kind !== 'diag' && a.kind !== 'duel') {
    points = a.firstTry ? Math.round(100 * mult + 60 * mult * clamp(a.speedRatio || 0, 0, 1)) : 40 * mult;
    if (a.kind === 'boss') points *= 2;
  }
  const combo = a.firstTry && a.combo > 0 && a.combo % COMBO_STEP === 0 ? STARS_COMBO : 0;
  return { stars, combo, points };
}
/* aplica o acerto ao perfil; devolve o prêmio de answerReward */
function scoreCorrect(p, a) {
  const rw = answerReward(a);
  if (a.firstTry) {
    p.firsts++; p.fatigue = 0;
    if (a.combo > (p.bestCombo || 0)) p.bestCombo = a.combo;
  }
  p.stars += rw.stars + rw.combo;
  p.points = (p.points || 0) + rw.points;
  p.rights++;
  if (a.mode === 'dividir') p.firstDiv = true;
  return rw;
}
/* erro: conta e devolve true quando é hora da pausa para respirar (S10); a
   interface zera p.fatigue quando de fato abre a pausa */
function scoreWrong(p) {
  p.wrongs++; p.fatigue++;
  return p.fatigue >= 3;
}

/* ---------- fim de rodada ----------
   r: { kind, mode, firsts, wrongs, total, points, diagOK }; opts.goalRounds e
   opts.now (Date, para os testes). Ofensiva, semana, missão de rodada, meta
   do dia, chefe, persistência, baú, recordes, nível da avaliação e, por
   último, conquistas — para valerem nesta mesma rodada. */
function finishRound(p, r, opts) {
  const o = opts || {};
  const now = o.now || new Date();
  const today = fmtDate(now);
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const res = { goalStars: 0, boss: '', chest: 0, newRecord: false, survive: null, diagLevel: 0, missions: [], achs: [] };
  // ofensiva (S15)
  if (p.lastPlay !== today) {
    p.streak = (p.lastPlay === fmtDate(yest)) ? (p.streak || 0) + 1 : 1;
    p.lastPlay = today;
  }
  // semanas (S26)
  const wk = weekKey(now);
  let wrow = p.weeks.find((w) => w.k === wk);
  if (!wrow) { wrow = { k: wk, rounds: 0, rights: 0 }; p.weeks.push(wrow); p.weeks = p.weeks.slice(-8); }
  wrow.rounds++; wrow.rights += r.firsts;
  // rodadas, missão de rodada e meta do dia (S11)
  p.rounds++;
  p.today.rounds++;
  res.missions = advanceMissions(p, 'round');
  if (o.goalRounds > 0 && p.today.rounds >= o.goalRounds && !p.today.done) {
    p.today.done = true; p.stars += STARS_GOAL; res.goalStars = STARS_GOAL;
  }
  // chefe (S18)
  if (r.kind === 'boss') {
    const won = r.firsts >= Math.ceil(r.total * BOSS_WIN);
    if (won) p.bossWon = true;
    res.boss = won ? 'boss_win' : 'boss_lose';
  } else if (r.kind === 'normal' && p.rounds % BOSS_EVERY === 0) {
    p.bossReady = true; res.boss = 'boss_ready';
  }
  // persistência (A-118/A-128): venceu a rodada depois de errar
  if (r.kind === 'normal' && r.wrongs >= 1 && r.firsts >= 3) p.persistRounds = (p.persistRounds || 0) + 1;
  // baú (v2.5): marcos de ofensiva 3/7/14/21/30 dias
  const ms = CHEST_MILESTONES.find((m) => p.streak >= m && !p.chests[m]);
  if (ms) { p.chests[ms] = 1; res.chest = ms; }
  // Contra o Tempo (v2.5): recorde de acertos
  if (r.kind === 'tempo') {
    const record = r.firsts > (p.bestSurvive || 0);
    if (record) p.bestSurvive = r.firsts;
    res.survive = { n: r.firsts, record };
  }
  // avaliação (S12): nível sugerido para todos os modos
  if (r.kind === 'diag') {
    const ok = r.diagOK;
    res.diagLevel = ok <= 2 ? 1 : ok <= 4 ? 2 : ok <= 6 ? 3 : ok === 7 ? 4 : 5;
    Object.keys(MODES).forEach((m) => { if (m !== 'mistar') p.levels[m] = res.diagLevel; });
    p.assessed = true;
  }
  // recorde de pontos por modo (v2.2)
  if (r.kind === 'normal' || r.kind === 'boss' || r.kind === 'review') {
    const key = r.kind === 'boss' ? 'chefe' : r.kind === 'review' ? 'revisao' : (r.mode || 'somar');
    res.newRecord = r.points > 0 && r.points > (p.bestPts[key] || 0);
    if (res.newRecord) p.bestPts[key] = r.points;
  }
  res.achs = unlockAchievements(p);
  return res;
}

/* ---------- baú de recompensas (v2.5) ----------
   10 ⭐ por dia do marco e uma figurinha que ainda falta (sorteada) */
function openChestReward(p, ms) {
  const stars = ms * 10;
  const missing = STICKERS.map((s, i) => i).filter((i) => !p.stickers.includes(i));
  const sticker = missing.length ? missing[rand(0, missing.length - 1)] : -1;
  if (sticker >= 0) p.stickers.push(sticker);
  p.stars += stars;
  return { stars, sticker, achs: unlockAchievements(p) };
}
