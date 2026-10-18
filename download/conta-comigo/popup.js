'use strict';

/* ==================== Utilidades ==================== */
const $ = (sel) => document.querySelector(sel);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ONES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
  'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];

function numWord(n) {
  if (n <= 20) return ONES[n];
  if (n < 30) return 'vinte e ' + ONES[n - 20];
  if (n === 30) return 'trinta';
  return String(n);
}

/* ==================== Dados do jogo ==================== */
const ITEMS = [
  { emoji: '🍎', name: 'maçã', plural: 'maçãs', f: true },
  { emoji: '🍓', name: 'morango', plural: 'morangos', f: false },
  { emoji: '⭐', name: 'estrela', plural: 'estrelas', f: true },
  { emoji: '🎈', name: 'balão', plural: 'balões', f: false },
  { emoji: '🐟', name: 'peixe', plural: 'peixes', f: false },
  { emoji: '🦋', name: 'borboleta', plural: 'borboletas', f: true },
  { emoji: '🍪', name: 'biscoito', plural: 'biscoitos', f: false },
  { emoji: '🌸', name: 'flor', plural: 'flores', f: true },
  { emoji: '🍇', name: 'uva', plural: 'uvas', f: true },
  { emoji: '🐤', name: 'pintinho', plural: 'pintinhos', f: false },
];

const PRAISE = [
  { e: '🥳', t: 'Muito bem!' },
  { e: '⭐', t: 'Você consegue!' },
  { e: '🎉', t: 'Isso mesmo!' },
  { e: '💫', t: 'Uau, que legal!' },
  { e: '🦊', t: 'Acertou em cheio!' },
];

const RETRY = [
  { e: '🙈', t: 'Quase! Tenta de novo.' },
  { e: '💪', t: 'Opa! Conta de novo.' },
  { e: '🤔', t: 'Vamos tentar mais uma vez!' },
];

const QUESTIONS_PER_ROUND = 5;
const MAX_LEVEL = 3;

/* ==================== Estado ==================== */
const S = {
  totalStars: 0,
  mute: false,
  difficulty: 'auto', // 'auto' (adaptativo) ou 1 | 2 | 3 (fixo escolhido)
  levels: {},      // progressão orgânica salva por modo
  mode: null,
  qIndex: 0,
  misses: 0,       // erros na pergunta atual
  firstTryWins: 0, // acertos de primeira na rodada
  starsRound: 0,
  current: null,
};

/* ==================== Armazenamento (extensão + demo) ==================== */
function loadState() {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => { if (!settled) { settled = true; resolve(v || {}); } };
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['cc_state'], (res) => {
          try { done(res && res.cc_state); } catch (e) { done(null); }
        });
        // segurança: se o callback não chegar, usa localStorage
        setTimeout(() => {
          try { done(JSON.parse(localStorage.getItem('cc_state') || 'null')); } catch (e) { done(null); }
        }, 900);
      } else {
        done(JSON.parse(localStorage.getItem('cc_state') || 'null'));
      }
    } catch (e) {
      try { done(JSON.parse(localStorage.getItem('cc_state') || 'null')); } catch (e2) { done(null); }
    }
  });
}

function saveState() {
  const data = { totalStars: S.totalStars, mute: S.mute, difficulty: S.difficulty, levels: S.levels };
  let stored = false;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ cc_state: data }, () => { void chrome.runtime.lastError; });
      stored = true;
    }
  } catch (e) { /* ignora */ }
  if (!stored) {
    try { localStorage.setItem('cc_state', JSON.stringify(data)); } catch (e) { /* ignora */ }
  }
}

/* ==================== Efeitos sonoros (Web Audio) ==================== */
let actx = null;
function ensureAudio() {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch (e) { /* sem áudio */ }
}

function tone(freq, delay, dur, type, vol) {
  if (S.mute || !actx) return;
  try {
    const t0 = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(actx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch (e) { /* ignora */ }
}

const SFX = {
  tap: () => tone(360, 0, 0.06, 'triangle', 0.05),
  correct: () => { tone(659, 0, 0.12, 'triangle', 0.12); tone(880, 0.1, 0.12, 'triangle', 0.12); tone(1175, 0.2, 0.25, 'triangle', 0.12); },
  wrong: () => { tone(233, 0, 0.18, 'sine', 0.09); tone(174, 0.16, 0.25, 'sine', 0.09); },
  star: () => { tone(1568, 0, 0.1, 'triangle', 0.08); tone(2093, 0.08, 0.16, 'triangle', 0.07); },
  fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.28, 'triangle', 0.11)); },
};

/* ==================== Voz em português (TTS) ==================== */
const TTS = {
  ok: typeof window !== 'undefined' && 'speechSynthesis' in window,
  voice: null,
  init() {
    if (!this.ok) return;
    const setVoice = () => {
      try {
        const vs = window.speechSynthesis.getVoices() || [];
        this.voice = vs.find((v) => /pt[-_]BR/i.test(v.lang)) || vs.find((v) => /^pt/i.test(v.lang)) || null;
      } catch (e) { /* ignora */ }
    };
    setVoice();
    try { window.speechSynthesis.addEventListener('voiceschanged', setVoice); }
    catch (e) { window.speechSynthesis.onvoiceschanged = setVoice; }
  },
  speak(text) {
    if (!this.ok || S.mute || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR';
      if (this.voice) u.voice = this.voice;
      u.rate = 0.92;
      u.pitch = 1.15;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignora */ }
  },
  stop() { if (this.ok) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignora */ } } },
};

/* ==================== Geradores de perguntas ==================== */
function emojisHTML(item, count, opts) {
  let s = '';
  const crossedFrom = opts && opts.crossedFrom != null ? opts.crossedFrom : -1;
  const small = opts && opts.small;
  for (let i = 0; i < count; i++) {
    const cross = crossedFrom >= 0 && i >= crossedFrom;
    s += '<span class="obj' + (small ? ' small' : '') + (cross ? ' crossed' : '') + '">' + item.emoji + '</span>';
  }
  return s;
}

function distractors(answer, extras, maxCap) {
  const cap = maxCap || 30;
  const out = new Set();
  const cands = shuffle([answer + 1, answer - 1, answer + 2, answer - 2].concat(extras || []));
  for (const c of cands) {
    if (out.size >= 2) break;
    if (c >= 0 && c !== answer && c <= cap && !out.has(c)) out.add(c);
  }
  let g = 3;
  while (out.size < 2 && g <= 12) {
    const up = answer + g;
    const down = answer - g;
    if (up <= cap && !out.has(up)) out.add(up);
    else if (down >= 0 && !out.has(down)) out.add(down);
    g++;
  }
  return shuffle([answer].concat([...out].slice(0, 2)));
}

/* Contar: "Quantas maçãs?" */
function genContar(level) {
  const maxN = [5, 8, 15][level - 1] || 10;
  const item = pick(ITEMS);
  const n = rand(1, maxN);
  const q = n === 1 ? (item.f ? 'Quanta' : 'Quanto') : (item.f ? 'Quantas' : 'Quantos');
  const nome = n === 1 ? item.name : item.plural;
  return {
    visual: '<div class="grp plain">' + emojisHTML(item, n) + '</div>',
    display: q + ' ' + nome + '?',
    tts: q + ' ' + nome + ' você vê?',
    answer: n,
    options: distractors(n, null, maxN),
  };
}

/* Somar: dois grupos juntinhos */
function genSomar(level) {
  const cap = [5, 10, 20][level - 1] || 10;
  const item = pick(ITEMS);
  const a = rand(1, cap - 1);
  const b = rand(1, cap - a);
  const n = a + b;
  const small = n > 10;
  return {
    visual: '<div class="expr"><span class="grp">' + emojisHTML(item, a, { small: small }) + '</span>' +
      '<span class="op">+</span><span class="grp">' + emojisHTML(item, b, { small: small }) + '</span></div>',
    display: a + ' + ' + b + ' = ?',
    tts: 'Quanto é ' + numWord(a) + ' mais ' + numWord(b) + '?',
    answer: n,
    options: distractors(n, [a, b, Math.abs(a - b)], cap + 2),
  };
}

/* Subtrair: itens que "voam" ficam riscados */
function genSubtrair(level) {
  const cap = [5, 10, 20][level - 1] || 10;
  const item = pick(ITEMS);
  const a = rand(2, cap);
  const b = rand(1, a - 1);
  const n = a - b;
  const small = a > 10;
  return {
    visual: '<div class="grp plain">' + emojisHTML(item, a, { crossedFrom: a - b, small: small }) + '</div>',
    display: a + ' − ' + b + ' = ?',
    tts: 'Quanto é ' + numWord(a) + ' menos ' + numWord(b) + '?',
    answer: n,
    options: distractors(n, [b], cap),
  };
}

/* Multiplicar: grupos iguais (repetição de soma) */
function genMultiplicar(level) {
  const ranges = [[3, 3], [4, 5], [5, 5]][level - 1] || [3, 3];
  const g = rand(2, ranges[0]);
  const k = rand(2, ranges[1]);
  const item = pick(ITEMS);
  let rows = '';
  for (let r = 0; r < g; r++) rows += '<div class="grp row">' + emojisHTML(item, k, { small: true }) + '</div>';
  const n = g * k;
  return {
    visual: '<div class="groups">' + rows + '</div>',
    display: g + ' × ' + k + ' = ?',
    tts: 'Quanto é ' + numWord(g) + ' vezes ' + numWord(k) + '?',
    answer: n,
    options: distractors(n, [g + k, n - g, n - k], 25),
  };
}

/* Dividir: repartição em grupos iguais (divisão exata, visual) */
function genDividir(level) {
  const ranges = [[3, 3], [4, 5], [5, 5]][level - 1] || [3, 3];
  const g = rand(2, ranges[0]);
  const k = rand(2, ranges[1]);
  const total = g * k;
  const item = pick(ITEMS);
  let rows = '';
  for (let r = 0; r < g; r++) rows += '<div class="grp row">' + emojisHTML(item, k, { small: true }) + '</div>';
  return {
    visual: '<div class="groups">' + rows + '</div>',
    display: total + ' ÷ ' + g + ' = ?',
    tts: 'Quanto é ' + numWord(total) + ' dividido por ' + numWord(g) + '?',
    answer: k,
    options: distractors(k, [g, k + 1, k - 1], 25),
  };
}

/* Mistão: sorteia operações liberadas conforme a dificuldade */
function genMistar(level) {
  const ops = level >= 3
    ? ['contar', 'somar', 'subtrair', 'multiplicar', 'dividir']
    : level === 2
      ? ['contar', 'somar', 'subtrair']
      : ['contar', 'somar'];
  return MODES[pick(ops)].gen(level);
}

const MODES = {
  contar: { label: 'Contar', gen: genContar },
  somar: { label: 'Somar', gen: genSomar },
  subtrair: { label: 'Subtrair', gen: genSubtrair },
  multiplicar: { label: 'Multiplicar', gen: genMultiplicar },
  dividir: { label: 'Dividir', gen: genDividir },
  mistar: { label: 'Mistão', gen: genMistar },
};

/* Nível ativo: fixo (manual) ou adaptativo (automático) */
function activeLevel() {
  if (S.difficulty !== 'auto') return S.difficulty;
  return S.levels[S.mode] || 1;
}

/* ==================== Interface ==================== */
function show(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = $('#screen-' + name);
  if (el) el.classList.add('active');
}

function updateStarChip(bump) {
  $('#star-total').textContent = String(S.totalStars);
  if (bump) {
    const chip = $('#star-chip');
    chip.classList.remove('bump');
    void chip.offsetWidth;
    chip.classList.add('bump');
  }
}

let bubbleTimer = null;
function showBubble(emoji, text) {
  $('#bubble-emoji').textContent = emoji;
  $('#bubble-text').textContent = text;
  const b = $('#bubble');
  b.classList.remove('hidden', 'pop');
  void b.offsetWidth;
  b.classList.add('pop');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, 2300);
}
function hideBubble() { $('#bubble').classList.add('hidden'); }

function renderProgress() {
  const el = $('#dots');
  if (el) {
    el.innerHTML = '';
    for (let i = 0; i < QUESTIONS_PER_ROUND; i++) {
      const d = document.createElement('i');
      d.className = 'dot' + (i < S.qIndex ? ' done' : i === S.qIndex ? ' now' : '');
      el.appendChild(d);
    }
  }
  const chip = $('#level-chip');
  if (chip) chip.textContent = 'Nível ' + activeLevel() + (S.difficulty === 'auto' ? ' · auto' : ' · fixo');
}

function nextQuestion() {
  S.misses = 0;
  hideBubble();
  const level = activeLevel();
  S.current = MODES[S.mode].gen(level);
  $('#visual').innerHTML = S.current.visual;
  $('#equation').textContent = S.current.display;
  const box = $('#answers');
  box.innerHTML = '';
  box.classList.remove('locked');
  shuffle(S.current.options).forEach((opt) => {
    const b = document.createElement('button');
    b.className = 'ans';
    b.textContent = String(opt);
    b.dataset.v = String(opt);
    b.addEventListener('click', () => onAnswer(b));
    box.appendChild(b);
  });
  renderProgress();
  setTimeout(() => TTS.speak(S.current.tts), 260);
}

function lockAnswers() { $('#answers').classList.add('locked'); }

function onAnswer(btn) {
  ensureAudio();
  if ($('#answers').classList.contains('locked')) return;
  const v = Number(btn.dataset.v);

  if (S.current && v === S.current.answer) {
    const firstTry = S.misses === 0;
    const gained = firstTry ? 2 : 1;
    if (firstTry) S.firstTryWins++;
    S.starsRound += gained;
    S.totalStars += gained;
    saveState();
    updateStarChip(true);

    btn.classList.add('good');
    lockAnswers();
    SFX.correct();
    if (firstTry) SFX.star();
    confetti(firstTry ? 36 : 22);

    const p = pick(PRAISE);
    showBubble(p.e, p.t);
    TTS.speak(p.t);

    S.qIndex++;
    setTimeout(() => {
      if (S.qIndex >= QUESTIONS_PER_ROUND) endRound();
      else nextQuestion();
    }, 1700);
  } else {
    S.misses++;
    SFX.wrong();
    btn.classList.add('bad');
    btn.disabled = true;

    if (S.misses >= 2) {
      const good = document.querySelector('#answers .ans[data-v="' + S.current.answer + '"]');
      if (good) good.classList.add('hint');
      showBubble('👉', 'É este! Tente este!');
      TTS.speak('É este! Tente este!');
    } else {
      const r = pick(RETRY);
      showBubble(r.e, r.t);
      TTS.speak(r.t);
    }
  }
}

const CONF_COLORS = ['#ffc93c', '#ff6b6b', '#2ed573', '#4c7dff', '#9b6bff', '#ff9a3d'];
function confetti(n) {
  const fx = $('#fx');
  for (let i = 0; i < (n || 30); i++) {
    const el = document.createElement('i');
    el.className = 'confetti';
    if (Math.random() < 0.3) {
      el.textContent = pick(['⭐', '✨', '💫']);
      el.style.fontSize = rand(10, 18) + 'px';
      el.style.width = 'auto';
      el.style.height = 'auto';
      el.style.background = 'transparent';
    } else {
      el.style.background = pick(CONF_COLORS);
    }
    el.style.left = (Math.random() * 100) + '%';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.animationDuration = (1.4 + Math.random() * 1.4) + 's';
    el.style.setProperty('--r', rand(-540, 540) + 'deg');
    el.style.setProperty('--x', rand(-60, 60) + 'px');
    el.addEventListener('animationend', () => el.remove());
    fx.appendChild(el);
  }
}

function endRound() {
  const rate = S.firstTryWins / QUESTIONS_PER_ROUND;
  const manual = S.difficulty !== 'auto';
  // progressão orgânica continua sendo registrada (vale ao voltar para automático)
  let org = S.levels[S.mode] || 1;
  if (rate >= 0.8) org = Math.min(MAX_LEVEL, org + 1);
  else if (rate <= 0.4) org = Math.max(1, org - 1);
  S.levels[S.mode] = org;
  saveState();
  const lvl = manual ? S.difficulty : org;

  show('end');
  SFX.fanfare();
  confetti(60);

  $('#end-title').textContent = S.starsRound >= 8 ? 'Incrível! 🏆' : 'Muito bem! 🎊';
  const starsEl = $('#stars-earned');
  starsEl.innerHTML = '';
  for (let i = 0; i < S.starsRound; i++) {
    const sp = document.createElement('span');
    sp.className = 'star-pop';
    sp.textContent = '⭐';
    sp.style.animationDelay = (i * 0.12) + 's';
    starsEl.appendChild(sp);
    if (i < 5) setTimeout(() => SFX.star(), 300 + i * 140);
  }
  $('#end-msg').textContent =
    'Você ganhou ' + S.starsRound + (S.starsRound === 1 ? ' estrela' : ' estrelas') +
    ' nesta rodada! ' + MODES[S.mode].label + ' — nível ' + lvl + ' de ' + MAX_LEVEL +
    (manual ? ' (dificuldade fixa).' : ' (modo automático).');
}

function startRound(mode) {
  if (!MODES[mode]) return;
  TTS.stop();
  S.mode = mode;
  S.qIndex = 0;
  S.misses = 0;
  S.firstTryWins = 0;
  S.starsRound = 0;
  if (!S.levels[mode]) S.levels[mode] = 1;
  show('game');
  nextQuestion();
}

function applyMute() { $('#btn-mute').textContent = S.mute ? '🔇' : '🔊'; }

/* ==================== Dificuldade manual ==================== */
function applyDifficultyUI() {
  document.querySelectorAll('.diff-chip').forEach((c) => {
    c.classList.toggle('active', String(S.difficulty) === c.dataset.d);
  });
}

/* ==================== Tela cheia ==================== */
const IS_PAGE = /game\.html$/.test(location.pathname);
const HAS_EXT = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.getURL &&
  !!chrome.windows && !!chrome.windows.create;

function toggleFullscreen() {
  ensureAudio();
  SFX.tap();
  // No popup da extensão: abre o jogo em janela nativa em tela cheia
  // (popups têm limite de 800x600 e não podem ficar em tela cheia).
  if (!IS_PAGE && HAS_EXT) {
    try {
      chrome.windows.create({
        url: chrome.runtime.getURL('game.html'),
        type: 'popup',
        focused: true,
        state: 'fullscreen',
      }, () => { void chrome.runtime.lastError; });
      return;
    } catch (e) { /* cai para a Fullscreen API */ }
  }
  // Em página própria (game.html) ou na demo: Fullscreen API do navegador
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () {});
    }
  } catch (e) { /* ignora */ }
}

/* ==================== Inicialização ==================== */
async function init() {
  const data = await loadState();
  S.totalStars = Number(data && data.totalStars) || 0;
  S.mute = !!(data && data.mute);
  S.levels = data && data.levels && typeof data.levels === 'object' ? data.levels : {};
  const d = data && data.difficulty;
  S.difficulty = (d === 1 || d === 2 || d === 3) ? d : 'auto';

  applyMute();
  applyDifficultyUI();
  updateStarChip(false);
  TTS.init();

  document.querySelectorAll('.mode-card').forEach((card) => {
    card.addEventListener('click', () => { ensureAudio(); SFX.tap(); startRound(card.dataset.mode); });
  });
  $('#btn-home').addEventListener('click', () => { TTS.stop(); SFX.tap(); show('home'); });
  $('#btn-mute').addEventListener('click', () => {
    S.mute = !S.mute;
    applyMute();
    saveState();
    if (S.mute) TTS.stop();
    else { ensureAudio(); SFX.tap(); }
  });
  $('#btn-repeat').addEventListener('click', () => { ensureAudio(); SFX.tap(); if (S.current) TTS.speak(S.current.tts); });
  $('#btn-again').addEventListener('click', () => { ensureAudio(); SFX.tap(); startRound(S.mode); });
  $('#btn-menu').addEventListener('click', () => { TTS.stop(); SFX.tap(); show('home'); });
  const btnFull = $('#btn-full');
  if (btnFull) btnFull.addEventListener('click', toggleFullscreen);
  const btnClose = $('#btn-close');
  if (btnClose) btnClose.addEventListener('click', () => { try { window.close(); } catch (e) { /* ignora */ } });
  document.querySelectorAll('.diff-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      ensureAudio();
      SFX.tap();
      S.difficulty = chip.dataset.d === 'auto' ? 'auto' : Number(chip.dataset.d);
      saveState();
      applyDifficultyUI();
    });
  });

  document.addEventListener('pointerdown', ensureAudio);
  show('home');
}

init();
