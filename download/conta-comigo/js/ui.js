'use strict';
/* ==================== Conta Comigo v2.4 — interface ====================
   S07 adaptação · S08 revisão · S10 fadiga · S11 metas · S12 avaliação
   S13 mascote evolutiva · S14 conquistas · S15 ofensiva · S16 missões
   S17 loja · S18 chefe · S20 teclado · S24 calmo · S28 limite de sessão · S30 duelo
   v2.1: sem scripts/handlers inline (CSP MV3), ✕ fecha a janela dedicada
   v2.4: biblioteca cordial contextual, saudação com nome, medalhas de persistência,
   tempo extra, anti-repetição de posição, menos movimento (estudo de voz Fase 1) */

const IS_PAGE = document.body.classList.contains('page-mode');
const HAS_EXT = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.getURL && !!chrome.windows && !!chrome.windows.create;

/* ---------- estado da rodada ---------- */
let R = {
  kind: 'normal', mode: null, total: QUESTIONS_PER_ROUND, qIndex: 0, misses: 0, wrongs: 0,
  firsts: 0, stars: 0, points: 0, newRecord: false, combo: 0, history: [], due: [], diagI: 0, diagOK: 0,
  duel: null, unlockedShown: [], locked: false, lastAnsPos: -1, bossIntro: false, ended: false,
};
let sessionSec = 0;
let bubbleTimer = null, toastTimer = null;

/* ---------- navegação de telas ---------- */
function show(name) {
  const prev = document.activeElement;
  $$('.screen').forEach((s) => s.classList.remove('active'));
  const el = $('#screen-' + name);
  if (el) el.classList.add('active');
  // teclado/leitor de tela: se o foco ficou numa tela que sumiu, ele vai para a nova
  if (el && prev && prev.closest && prev.closest('.screen') && !el.contains(prev)) focusScreen(el);
}
function focusScreen(el) {
  if (overlayOpen()) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

function applySettings() {
  const g = G();
  document.body.dataset.theme = g.theme || 'classico';
  document.body.classList.toggle('hc', !!g.hc);
  document.body.classList.toggle('dys', !!g.dys);
  // v2.4 (A-050): menos movimento — também respeitado nas confetes em JS
  document.body.classList.toggle('rm', !!g.reduceMotion);
  // v2.4 (A-101): modo sem loja — esconde o botão das crianças
  const bs = $('#btn-shop'); if (bs) bs.classList.toggle('hidden', !!g.shopOff);
  const calm = g.calmo == null ? sysReducedMotion() : !!g.calmo;
  document.body.classList.toggle('calmo', !!calm);
  // calmo desligado de propósito pelo adulto: o CSS de prefers-reduced-motion não interfere
  document.body.classList.toggle('motion-ok', g.calmo === false && !g.reduceMotion);
  const bm = $('#btn-mute'); if (bm) { bm.textContent = g.mute ? '🔇' : '🔊'; bm.setAttribute('aria-pressed', String(!!g.mute)); }
}
const RM_QUERY = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function sysReducedMotion() { return !!(RM_QUERY && RM_QUERY.matches); }
// segue a preferência do sistema ao vivo (sem recarregar)
if (RM_QUERY && RM_QUERY.addEventListener) RM_QUERY.addEventListener('change', () => { try { applySettings(); } catch (e) { /* antes do boot */ } });
function refreshChrome() {
  const p = P();
  $('#star-total').textContent = String(p ? p.stars : 0);
  const chip = $('#star-chip'); if (chip) { chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); }
  const st = $('#chip-streak'); if (st) st.querySelector('b').textContent = String(p ? p.streak : 0);
  /* v2.5: moldura do perfil pela quantidade de conquistas — orgulho à vista */
  const bp = $('#btn-profile');
  if (bp && p) {
    const n = Object.keys(p.ach || {}).length;
    bp.classList.toggle('fr-gold', n >= 5 && n < 10);
    bp.classList.toggle('fr-rb', n >= 10);
  }
}

/* ---------- balão, toast e overlays ---------- */
function showBubble(emoji, text) {
  const b = $('#bubble'); if (!b) return;
  $('#bubble-emoji').textContent = emoji;
  $('#bubble-text').textContent = text;
  announce(text);
  b.classList.remove('hidden', 'pop'); void b.offsetWidth; b.classList.add('pop');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, 2400);
}
function hideBubble() { const b = $('#bubble'); if (b) b.classList.add('hidden'); }
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.remove('hidden', 'show'); void el.offsetWidth; el.classList.add('show');
  announce(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
/* Região viva (#sr-live): frases ditas no mesmo instante saem juntas, numa
   única leitura — p.ex. "vez do jogador 2" + a pergunta no duelo */
let liveBuf = [], liveTimer = null;
function announce(text) {
  const el = $('#sr-live'); if (!el || !text) return;
  if (!liveBuf.length) el.textContent = '';
  liveBuf.push(String(text));
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { el.textContent = liveBuf.join(' '); liveBuf = []; }, 100);
}
/* Modal: título vira o nome do diálogo, o fundo fica inerte (sem foco nem
   clique), o foco entra no modal e volta ao botão de origem ao fechar */
let overlayReturn = null;
function setBackgroundInert(on) {
  ['#topbar', '#screens', '#pop-profile'].forEach((sel) => { const el = $(sel); if (el) el.inert = on; });
}
function showOverlay(html) {
  const o = $('#overlay'), card = $('#overlay-card');
  if (o.classList.contains('hidden')) overlayReturn = document.activeElement;
  card.innerHTML = html;
  const h = card.querySelector('h3');
  if (h) { h.id = 'overlay-title'; card.setAttribute('aria-labelledby', 'overlay-title'); }
  else card.removeAttribute('aria-labelledby');
  o.classList.remove('hidden');
  setBackgroundInert(true);
  (card.querySelector('input, button:not([disabled])') || card).focus();
}
/* Tab no modal dá a volta (último → primeiro) em vez de sair para o navegador */
function trapTab(e) {
  const els = $$('#overlay-card input, #overlay-card button:not([disabled])');
  if (!els.length) { e.preventDefault(); return; }
  const first = els[0], last = els[els.length - 1], a = document.activeElement;
  if (e.shiftKey && (a === first || !$('#overlay-card').contains(a))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (a === last || !$('#overlay-card').contains(a))) { e.preventDefault(); first.focus(); }
}
function hideOverlay() {
  $('#overlay').classList.add('hidden');
  setBackgroundInert(false);
  const back = overlayReturn; overlayReturn = null;
  if (back && back !== document.body && document.contains(back) && back.offsetParent !== null) back.focus();
  else { const scr = $('.screen.active'); if (scr) focusScreen(scr); }
}
function overlayOpen() { return !$('#overlay').classList.contains('hidden'); }

/* ---------- confetes (respeitam modo calmo S24) ---------- */
const CONF_COLORS = ['#ffc93c', '#ff6b6b', '#2ed573', '#4c7dff', '#9b6bff', '#ff9a3d'];
/* v2.5: confete na paleta do tema ativo — cada mundo celebra com suas cores */
const CONF_THEMES = {
  classico: null, arcoiris: null,
  espaco: ['#8fb3ff', '#c9d8ff', '#5c6bff', '#ffd66b', '#9b6bff', '#4cc9ff'],
  jardim: ['#8fd97a', '#d6ff9e', '#2ed573', '#ffb3d9', '#fff28f', '#7ce0c3'],
  oceano: ['#4cc9ff', '#2bb3a3', '#9fe8ff', '#3f7dff', '#7ce0c3', '#b3fff0'],
  doces: ['#ff8fc7', '#ffd1e8', '#ff6b9d', '#ffb86b', '#fff3a3', '#c98fff'],
  neve: ['#cfe8ff', '#a8d4ff', '#ffffff', '#7fa8d9', '#b3e0f5', '#e8f6ff'],
};
function confetti(n) {
  if (G().reduceMotion) return; // v2.4 (A-050): sem movimentos, sem confetes
  if (sysReducedMotion() && G().calmo !== false) return; // sistema pediu menos movimento
  if (document.body.classList.contains('calmo')) n = Math.min(n, 8);
  const fx = $('#fx');
  for (let i = 0; i < n; i++) {
    const el = document.createElement('i');
    el.className = 'confetti';
    if (Math.random() < 0.3) {
      el.textContent = pick(['⭐', '✨', '💫']);
      el.style.fontSize = rand(10, 18) + 'px';
      el.style.width = 'auto'; el.style.height = 'auto'; el.style.background = 'transparent';
    } else el.style.background = pick(CONF_THEMES[G().theme] || CONF_COLORS);
    el.style.left = (Math.random() * 100) + '%';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    el.style.animationDuration = (1.4 + Math.random() * 1.4) + 's';
    el.style.setProperty('--r', rand(-540, 540) + 'deg');
    el.style.setProperty('--x', rand(-60, 60) + 'px');
    el.addEventListener('animationend', () => el.remove());
    fx.appendChild(el);
  }
}

/* ---------- mascote evolutiva (S13) + mascote adulta escolhida (v2.5) ----------
   A fase evolutiva continua: 🥚 (<30⭐) → 🐣 (30–99⭐) → forma adulta (100⭐+).
   Na fase adulta, a criança escolhe qual companheira quer (loja: Mascotes). */
function mascotStage() {
  const p = P(); const s = p ? p.stars : 0;
  if (s >= 100) {
    const pet = PETS.find((x) => x.id === (p.pet || 'fox')) || PETS[0];
    return { emoji: pet.emoji, key: 'st_big', next: null };
  }
  if (s >= 30) return { emoji: '🐣', key: 'st_baby', next: 100 - s };
  return { emoji: '🥚', key: 'st_egg', next: 30 - s };
}
function renderMascot() {
  const p = P(); if (!p) return;
  const st = mascotStage();
  const m = $('#mascot-home');
  if (m) m.innerHTML = '<span class="mascot-main">' + st.emoji + '</span>' + (p.hat ? '<span class="mascot-hat">' + escHtml(p.hat) + '</span>' : '');
  const ms = $('#mascot-side');
  if (ms) ms.textContent = st.emoji;
  const lbl = $('#mascot-stage');
  if (lbl) lbl.textContent = t(st.key) + ' · ' + p.name;
  const nx = $('#mascot-next');
  if (nx) nx.textContent = st.next != null ? t('to_next', { n: st.next }) : '⭐ ' + p.stars;
}

/* ---------- ofensiva / semana (S15) ---------- */
function renderWeekStrip() {
  const el = $('#week-strip'); if (!el) return;
  const p = P();
  const today = new Date();
  let html = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = fmtDate(d);
    let played = false;
    if (p && p.streak > 0 && p.lastPlay) {
      const end = (p.lastPlay === fmtDate(today)) ? new Date(today) : new Date(p.lastPlay + 'T12:00:00');
      if (ds <= p.lastPlay) {
        const diffDays = Math.round((end - d) / 86400000);
        played = diffDays >= 0 && diffDays < p.streak;
      }
    }
    html += '<span class="wday' + (played ? ' on' : '') + '" title="' + ds + '"><i>' + 'DSTQQSS'[d.getDay()] + '</i>' + (played ? '🔥' : '·') + '</span>';
  }
  el.innerHTML = html;
}

/* ---------- missões diárias (S16) ---------- */
const MISSION_DEFS = [
  { id: 'rounds2', key: 'mi_rounds2', goal: 2, ev: 'round' },
  { id: 'first5', key: 'mi_first5', goal: 5, ev: 'first' },
  { id: 'combo3', key: 'mi_combo3', goal: 3, ev: 'combo' },
  { id: 'newmode', key: 'mi_newmode', goal: 1, ev: 'newmode' },
  { id: 'review3', key: 'mi_review3', goal: 3, ev: 'review' },
];
function ensureMissions() {
  const p = P(); const today = fmtDate();
  if (!p.today || p.today.d !== today) p.today = { d: today, rounds: 0, done: false, modes: {} };
  if (p.missions.d !== today) {
    let seed = 0; for (const ch of today) seed += ch.charCodeAt(0);
    const idx = shuffle([0, 1, 2, 3, 4].map((x) => x)).sort((a, b) => ((seed * (a + 3)) % 7) - ((seed * (b + 3)) % 7)).slice(0, 3);
    p.missions = { d: today, list: idx.map((i) => ({ id: MISSION_DEFS[i].id, p: 0, done: false })) };
    saveState();
  }
}
function missionEvent(ev, n) {
  const p = P(); const defs = { rounds2: 'round', first5: 'first', combo3: 'combo', newmode: 'newmode', review3: 'review' };
  let changed = false;
  p.missions.list.forEach((m) => {
    const def = MISSION_DEFS.find((d) => d.id === m.id);
    if (!def || m.done || defs[m.id] !== ev) return;
    m.p = Math.min(def.goal, m.p + (n || 1));
    if (m.p >= def.goal) {
      m.done = true; changed = true;
      p.stars += 3; p.missionsDone++;
      toast('🎉 ' + t('mission_done'));
      SFX.star(); refreshChrome();
    }
  });
  if (changed) saveState();
}
function renderMissions() {
  const el = $('#mission-row'); if (!el) return;
  ensureMissions();
  const p = P();
  el.innerHTML = p.missions.list.map((m) => {
    const def = MISSION_DEFS.find((d) => d.id === m.id);
    if (!def) return '';
    return '<span class="mission' + (m.done ? ' done' : '') + '">' + (m.done ? '✅ ' : '🔸 ') + t(def.key) + ' ' + m.p + '/' + def.goal + '</span>';
  }).join('');
}

/* ---------- meta diária (S11) ---------- */
function renderGoal() {
  const el = $('#goal-line'); if (!el) return;
  const p = P(); ensureMissions();
  el.textContent = (G().goalRounds > 0)
    ? t('goal_line', { a: Math.min(p.today.rounds, G().goalRounds), b: G().goalRounds })
    : '⭐ ' + p.stars;
}

/* ---------- metas de estrelas por modo / desbloqueio ---------- */
function renderModes() {
  const grid = $('#modes-grid'); if (!grid) return;
  const p = P();
  grid.innerHTML = Object.keys(MODES).map((m) => {
    const md = MODES[m];
    const ok = modeUnlocked(m);
    return '<button class="mode-card c-' + md.color + '" data-mode="' + m + '" ' + (ok ? '' : 'data-locked="' + md.unlock + '"') + '>' +
      (m === 'mistar' ? '<span class="badge">' + t('d_mistar') + '</span>' : '') +
      '<span class="mode-emoji">' + (ok ? md.emoji : '🔒') + '</span>' +
      '<span class="mode-name">' + t('m_' + m) + '</span>' +
      '<span class="mode-desc">' + (ok ? t('d_' + m) : t('locked', { n: md.unlock })) + '</span></button>';
  }).join('');
  $$('.mode-card').forEach((card) => {
    card.addEventListener('click', () => {
      ensureAudio(); SFX.tap();
      if (card.dataset.locked) { showBubble('🔒', t('locked', { n: card.dataset.locked })); return; }
      startRound(card.dataset.mode);
    });
  });
}

/* ---------- tela inicial completa ---------- */
function renderHome() {
  Timer.hide();
  renderMascot(); renderWeekStrip(); renderMissions(); renderGoal(); renderModes();
  const p = P();
  const due = dueReviews().length;
  const btnReview = $('#sp-review');
  if (btnReview) {
    btnReview.classList.toggle('hidden', due === 0);
    btnReview.querySelector('span').textContent = t('review_btn', { n: due });
  }
  const btnBoss = $('#sp-boss');
  if (btnBoss) btnBoss.classList.toggle('hidden', !p.bossReady);
  const btnDiag = $('#sp-diag');
  if (btnDiag) btnDiag.classList.toggle('attention', !p.assessed);
  renderDiffChips(); refreshChrome();
}

/* ---------- dificuldade manual (chips auto + 1..5) ---------- */
function renderDiffChips() {
  $$('.diff-chip').forEach((c) => {
    const on = String(G().diffMode) === c.dataset.d;
    c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on));
  });
}

/* ==================== rodadas ==================== */
/* Nome acessível da cena: conta os objetos em sequência (🍎🍎🍎 → "3 🍎") e
   mantém textos como sinais, letras A/B e números da sequência */
function describeVisual(root) {
  const out = []; let run = null;
  const flush = () => {
    if (run) out.push(run.n + ' ' + run.e + (run.x ? ' (' + t('sc_crossed', { n: run.x }) + ')' : ''));
    run = null;
  };
  (function walk(node) {
    node.childNodes.forEach((c) => {
      if (c.nodeType === 1 && c.classList.contains('obj')) {
        const e = c.textContent.trim();
        if (!run || run.e !== e) { flush(); run = { e, n: 0, x: 0 }; }
        run.n++; if (c.classList.contains('crossed')) run.x++;
      } else if (c.nodeType === 1) { flush(); walk(c); flush(); }
      else if (c.nodeType === 3 && c.textContent.trim()) { flush(); out.push(c.textContent.trim()); }
    });
  })(root);
  flush();
  return out.join(' ');
}
/* botões de escolha única (avatares): classe .sel + aria-pressed */
function markPicked(all, b) {
  all.forEach((x) => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
  b.classList.add('sel'); b.setAttribute('aria-pressed', 'true');
}
function resetRound(kind, mode, total) {
  R = {
    kind, mode: mode || null, total: total || QUESTIONS_PER_ROUND, qIndex: 0, misses: 0, wrongs: 0,
    firsts: 0, stars: 0, points: 0, newRecord: false, combo: 0, history: [], due: [], diagI: 0, diagOK: 0,
    duel: R.duel, unlockedShown: [], locked: false, lastAnsPos: -1, bossIntro: false, ended: false,
  };
  Timer.hide();
  const chip = $('#pts-chip'); if (chip) chip.classList.add('hidden');
}
function startRound(mode) {
  TTS.stop();
  const p = P();
  ensureMissions();
  if (p.today.modes[mode] == null) {
    p.today.modes[mode] = 1;
    if (Object.keys(p.today.modes).length <= Object.keys(MODES).length) missionEvent('newmode');
  }
  if (!p.played[mode]) { p.played[mode] = 1; }
  resetRound('normal', mode);
  /* v2.5: Contra o Tempo — 60 s globais de fôlego; responde o máximo que der */
  if (mode === 'tempo') { R.kind = 'tempo'; R.total = 9999; }
  show('game');
  if (mode === 'tempo') { Timer.startGlobal(60); showBubble('⏱️', t('pr_tempo', { name: p.name })); }
  nextQuestion(); saveState();
}
function startReview() {
  const due = dueReviews();
  if (!due.length) { renderHome(); return; }
  TTS.stop();
  resetRound('review', null, Math.min(5, due.length));
  R.due = shuffle(due).slice(0, 5);
  show('game'); nextQuestion();
}
function startBoss() {
  TTS.stop();
  const p = P();
  resetRound('boss', null, BOSS_QUESTIONS);
  R.mode = 'mistar';
  p.bossReady = false; saveState();
  showBubble('⚔️', t('boss_title'));
  R.bossIntro = true; // v2.4: incentivo cordial falado junto da 1ª questão do chefe
  show('game'); nextQuestion();
}
const DIAG_LADDER = [['contar',1],['somar',1],['somar',2],['subtrair',2],['subtrair',3],['multiplicar',3],['dividir',3],['multiplicar',4]];
function startDiag() {
  TTS.stop();
  resetRound('diag', null, DIAG_LADDER.length);
  show('game'); nextQuestion();
}
function startDuelSetup() {
  TTS.stop(); SFX.tap();
  const mk = (sel, defIdx) => {
    const el = $(sel); if (!el) return;
    el.innerHTML = '';
    AVATARS.forEach((a, i) => {
      const b = document.createElement('button');
      b.className = 'av' + (i === defIdx ? ' sel' : '');
      b.textContent = a;
      b.setAttribute('aria-pressed', String(i === defIdx));
      b.addEventListener('click', () => { markPicked($$(sel + ' .av'), b); SFX.tap(); });
      el.appendChild(b);
    });
  };
  mk('#duel-av1', 0); mk('#duel-av2', 1);
  show('duel');
}
function startDuel(a1, a2) {
  resetRound('duel', null, 10);
  R.duel = { a1, a2, s1: 0, s2: 0, turn: 1 };
  show('game'); nextQuestion();
}

/* ---------- geração da próxima questão ---------- */
function currentMode() {
  if (R.kind === 'review') return R.due[R.qIndex] ? R.due[R.qIndex].m : 'somar';
  if (R.kind === 'diag') return DIAG_LADDER[R.qIndex][0];
  return R.mode;
}
function nextQuestion() {
  R.misses = 0; R.locked = false;
  hideBubble();
  const p = P();
  let q, level;
  if (R.kind === 'review') {
    const card = R.due[R.qIndex];
    q = makeFromCard(card); level = card.lv;
  } else if (R.kind === 'diag') {
    const [m, lv] = DIAG_LADDER[R.qIndex];
    q = GENS[m](lv); level = lv;
  } else if (R.kind === 'duel') {
    const pool = Object.keys(MODES).filter((m) => m !== 'mistar' && modeUnlocked(m));
    R.mode = pick(pool.length ? pool : ['contar']);
    level = activeLevel(R.mode);
    q = GENS[R.mode](level);
  } else {
    level = activeLevel(currentMode());
    q = GENS[R.mode === 'mistar' ? 'mistar' : R.mode](level);
    if (R.kind === 'boss') q = GENS[pick(Object.keys(MODES).filter((m) => m !== 'mistar' && modeUnlocked(m)))](Math.min(MAX_LEVEL, level + 1));
  }
  R.current = q; R.level = level;
  const vis = $('#visual');
  vis.innerHTML = q.visual || '';
  vis.classList.toggle('naked', !q.visual);
  const scene = q.visual ? describeVisual(vis) : '';
  if (scene) { vis.setAttribute('role', 'img'); vis.setAttribute('aria-label', scene); vis.removeAttribute('aria-hidden'); }
  else { vis.removeAttribute('role'); vis.removeAttribute('aria-label'); vis.setAttribute('aria-hidden', 'true'); }
  $('#equation').textContent = q.display;
  $('#equation').classList.toggle('small-text', String(q.display).length > 16);
  bindCounting(q);
  const box = $('#answers');
  box.innerHTML = '';
  box.classList.remove('locked');
  box.classList.toggle('n3', q.options.length === 3 && q.kind === 'cmp');
  let opts = shuffle(q.options);
  // v2.4 (A-163): a resposta certa não cai na mesma posição 2× seguidas
  const ansStr = String(q.answer);
  if (opts.length > 1) {
    for (let tries = 0; tries < 7 && opts.findIndex((o) => String(o) === ansStr) === R.lastAnsPos; tries++) {
      opts = shuffle(q.options);
    }
    R.lastAnsPos = opts.findIndex((o) => String(o) === ansStr);
  }
  opts.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'ans';
    b.textContent = String(opt);
    b.dataset.v = String(opt);
    b.dataset.idx = i;
    b.addEventListener('click', () => onAnswer(b));
    box.appendChild(b);
  });
  const hadFocus = document.activeElement === document.body || box.contains(document.activeElement);
  renderProgress();
  // leitor de tela: progresso + pergunta + o que a cena mostra, numa leitura só
  const chipTxt = $('#level-chip') ? $('#level-chip').textContent : '';
  announce((chipTxt ? chipTxt + '. ' : '') + q.tts + (scene ? ' ' + scene : ''));
  if (hadFocus && $('#screen-game').classList.contains('active')) focusScreen($('#screen-game'));
  if (R.kind !== 'tempo') Timer.start(timeBudget(level, currentMode()));
  // v2.4: incentivo do chefe falado na 1ª questão (fila prosódica junta as duas frases)
  const intro = R.bossIntro ? tpick('pr_boss', { name: p.name }) + ' ' + q.tts : q.tts;
  R.bossIntro = false;
  setTimeout(() => TTS.speak(intro), 260);
}
function renderProgress() {
  const p = P();
  const dots = $('#dots');
  if (dots) {
    dots.innerHTML = '';
    if (R.kind !== 'tempo') {
      for (let i = 0; i < Math.min(R.total, 12); i++) {
        const d = document.createElement('i');
        d.className = 'dot' + (i < R.qIndex ? ' done' : i === R.qIndex ? ' now' : '');
        dots.appendChild(d);
      }
    }
  }
  const chip = $('#level-chip');
  if (chip) {
    let txt;
    if (R.kind === 'tempo') txt = '⏱️ ' + t('survive_hits', { n: R.firsts });
    else if (R.kind === 'review') txt = '📚 ' + t('review_btn', { n: R.total }) + ' · ' + (R.qIndex + 1) + '/' + R.total;
    else if (R.kind === 'boss') txt = '⚔️ ' + (R.qIndex + 1) + '/' + R.total;
    else if (R.kind === 'diag') txt = '🎯 ' + (R.qIndex + 1) + '/' + R.total;
    else if (R.kind === 'duel') {
      const d = R.duel;
      txt = d.a1 + ' ' + d.s1 + ' × ' + d.s2 + ' ' + d.a2 + ' · ' + (R.qIndex + 1) + '/' + R.total;
    } else txt = t('q_of', { a: Math.min(R.qIndex + 1, R.total), b: R.total }) + ' · ' + t('level') + ' ' + R.level + (G().diffMode === 'auto' ? '' : ' · ' + t('fixed_lbl'));
    chip.textContent = txt;
  }
  const combo = $('#combo-chip');
  if (combo) {
    combo.classList.toggle('hidden', R.combo < 2);
    combo.textContent = t('combo', { n: R.combo });
  }
  if (R.kind === 'duel') showBubble(R.duel.turn === 1 ? R.duel.a1 : R.duel.a2, t('duel_turn', { av: R.duel.turn === 1 ? R.duel.a1 : R.duel.a2 }));
}

/* ---------- cronômetro de pontos (v2.2) ----------
   Barra suave por questão: pausa em overlays/aba oculta/tela inativa,
   NUNCA pune — ao esgotar só zera o bônus de rapidez. Avaliação (diag)
   e duelo ficam sem cronômetro (menos pressão). */
const Timer = {
  iv: null, totalMs: 0, leftMs: 0, last: 0, active: false, global: false,
  allowed() { return !!G().timer && R.kind !== 'diag' && R.kind !== 'duel'; },
  start(sec) {
    this.stop();
    const wrap = $('#timer-wrap');
    if (!wrap) return;
    if (!this.allowed()) { wrap.classList.add('hidden'); this.totalMs = 0; this.leftMs = 0; return; }
    const ts = clamp(Number(G().timeScale) || 1, 1, 3); // v2.4 (A-047): tempo extra configurável
    this.totalMs = Math.round(sec * 1000 * ts); this.leftMs = this.totalMs; this.last = Date.now(); this.active = true; this.global = false;
    wrap.classList.remove('hidden', 'warn', 'low', 'out');
    wrap.setAttribute('aria-label', t('s_timer'));
    this.paint();
    this.iv = setInterval(() => this.tick(), 200);
  },
  /* v2.5: cronômetro GLOBAL do Contra o Tempo — corre entre as questões e
     encerra a rodada ao esgotar; respeita timeScale e pausa em overlays */
  startGlobal(sec) {
    this.stop(); this.global = false;
    const wrap = $('#timer-wrap');
    if (!wrap || !this.allowed()) { if (wrap) wrap.classList.add('hidden'); return; }
    const ts = clamp(Number(G().timeScale) || 1, 1, 3);
    this.totalMs = Math.round(sec * 1000 * ts); this.leftMs = this.totalMs; this.last = Date.now(); this.active = true; this.global = true;
    wrap.classList.remove('hidden', 'warn', 'low', 'out');
    wrap.setAttribute('aria-label', t('s_timer'));
    this.paint();
    this.iv = setInterval(() => this.tick(), 200);
  },
  paused() {
    const scr = $('#screen-game');
    return !scr || !scr.classList.contains('active') || overlayOpen() || document.hidden ||
      $('#answers').classList.contains('locked');
  },
  tick() {
    if (!this.active) return;
    const now = Date.now(); const dt = now - this.last; this.last = now;
    if (!this.paused()) this.leftMs = Math.max(0, this.leftMs - dt);
    this.paint();
    if (this.leftMs <= 0) {
      this.active = false; clearInterval(this.iv); this.iv = null;
      const w = $('#timer-wrap'); if (w) w.classList.add('out');
      if (this.global) {
        this.global = false;
        if (R.kind === 'tempo' && !R.ended) { showBubble('⏰', t('time_over')); setTimeout(endRound, 500); }
        return;
      }
      if (!R.locked && R.current) showBubble('⏰', t('time_over'));
    }
  },
  paint() {
    const w = $('#timer-wrap'); if (!w) return;
    const pct = this.totalMs ? Math.round(100 * this.leftMs / this.totalMs) : 0;
    const bar = $('#timer-bar');
    if (bar) bar.style.width = pct + '%';
    w.setAttribute('aria-valuenow', String(pct));
    w.classList.toggle('warn', pct < 50 && pct >= 25);
    w.classList.toggle('low', pct < 25 && pct > 0);
  },
  stop() { if (this.global) return; this.active = false; if (this.iv) { clearInterval(this.iv); this.iv = null; } },
  hide() { this.global = false; this.stop(); const w = $('#timer-wrap'); if (w) w.classList.add('hidden'); },
  ratio() { return this.totalMs ? clamp(this.leftMs / this.totalMs, 0, 1) : 0; },
};

/* ---------- pontos por rapidez e precisão (v2.2) ----------
   Acerto de primeira: 100×nível + até 60×nível conforme o tempo restante.
   Acerto após errar: 40×nível (precisão conta, rapidez não). Chefe: dobro. */
function grantPts(pts) {
  R.points += pts;
  const p = P();
  p.points = (p.points || 0) + pts;
  const chip = $('#pts-chip');
  if (chip) {
    chip.classList.remove('hidden');
    chip.querySelector('b').textContent = String(R.points);
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
  }
  ptsPop(pts);
  saveState();
}
function ptsPop(pts) {
  const host = $('#screen-game'); if (!host) return;
  const el = document.createElement('span');
  el.className = 'pts-pop';
  el.textContent = '+' + pts + ' ⚡';
  el.addEventListener('animationend', () => el.remove());
  host.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 1400);
}

/* ---------- contagem tocável ---------- */
function bindCounting(q) {
  $$('#visual .obj.tappable').forEach((el) => {
    el.addEventListener('click', () => {
      ensureAudio();
      const i = Number(el.dataset.i);
      el.classList.add('counted');
      el.style.setProperty('--cnt', '"' + (i + 1) + '"');
      SFX.tap();
      const words = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];
      TTS.speak(words[i] || String(i + 1), { force: true }); // repetir o mesmo número é intencional
    });
  });
}

/* ---------- resposta ---------- */
/* v2.4 (A-178): biblioteca cordial contextual — o elogio cita o nome, reconhece
   rapidez, valoriza a persistência e comemora combos, sem spam de festa */
function cordialPraise(firstTry, speedRatio) {
  const name = P() ? P().name : '';
  if (firstTry && speedRatio >= 0.55 && Math.random() < 0.65) return tpick('pr_fast', { name });
  if (R.combo >= 3 && R.combo % 2 === 1) return tpick('pr_combo', { name, n: R.combo });
  if (!firstTry) return tpick('pr_persist', { name });
  return pick(I18N[LANG].praise);
}
function grantStars(n) {
  const p = P();
  p.stars += n; R.stars += n;
  saveState(); refreshChrome();
}
function onAnswer(btn) {
  ensureAudio();
  if (R.locked || !R.current) return;
  const v = btn.dataset.v;
  const correct = R.current.kind === 'cmp' ? v === String(R.current.answer) : Number(v) === R.current.answer;
  const mode = currentMode();
  const firstTry = R.misses === 0;

  if (correct) {
    R.locked = true;
    const speedRatio = Timer.ratio();
    const p = P();
    let gained = firstTry ? 2 : 1;
    if (R.kind === 'boss') gained *= 2;
    if (firstTry) {
      R.firsts++;
      p.firsts++;
      R.combo++;
      if (R.kind === 'diag') R.diagOK++;
      p.fatigue = 0;
      if (R.combo > (p.bestCombo || 0)) p.bestCombo = R.combo;
      if (R.combo === 3) missionEvent('combo');
      if (R.combo > 0 && R.combo % 5 === 0) { grantStars(2); toast('🔥 +2 ⭐'); }
      missionEvent('first');
    }
    grantStars(gained);
    p.rights++;
    bumpLvlStat(mode, R.level, true);
    if (mode === 'dividir') p.firstDiv = true;
    if (R.kind === 'review') { gradeReview(R.due[R.qIndex], true); missionEvent('review'); }

    // v2.2: pontos por rapidez + precisão (fora de diagnóstico e duelo)
    if (R.kind !== 'diag' && R.kind !== 'duel') {
      const mult = clamp(R.level || 1, 1, MAX_LEVEL);
      let pts = firstTry ? Math.round(100 * mult + 60 * mult * speedRatio) : 40 * mult;
      if (R.kind === 'boss') pts *= 2;
      grantPts(pts);
    }
    Timer.stop();

    btn.classList.add('good');
    $('#answers').classList.add('locked');
    SFX.correct(); if (firstTry) SFX.star();
    confetti(firstTry ? 30 : 18);
    const pr = cordialPraise(firstTry, speedRatio);
    showBubble(mascotStage().emoji, pr);
    TTS.speak(pr);

    // S07: adaptação por habilidade (fora de diagnóstico/duelo)
    if (R.kind === 'normal' || R.kind === 'boss') {
      const grew = recordResult(mode, firstTry);
      if (grew > 0) setTimeout(() => levelUpOverlay(mode, p.levels[mode]), 1500);
    }
    if (R.kind === 'duel' && firstTry) { if (R.duel.turn === 1) R.duel.s1++; else R.duel.s2++; }

    R.history.push({ txt: R.current.display, ok: firstTry });
    R.qIndex++;
    setTimeout(() => {
      if (R.qIndex >= R.total) endRound();
      else { if (R.kind === 'duel') R.duel.turn = R.duel.turn === 1 ? 2 : 1; nextQuestion(); }
    }, 1600);
  } else {
    R.misses++; R.wrongs++;
    P().wrongs++;
    P().fatigue++;
    bumpLvlStat(mode, R.level, false);
    if ((R.kind === 'normal' || R.kind === 'duel') && R.current.f) {
      addReviewCard(mode === 'mistar' ? R.current.underlying || mode : mode, R.level, R.current.f);
    }
    SFX.wrong();
    btn.classList.add('bad'); btn.disabled = true;
    if (R.kind !== 'boss') {
      if (R.misses >= 2) {
        const good = $('#answers .ans[data-v="' + CSS.escape(String(R.current.answer)) + '"]');
        if (good) good.classList.add('hint');
        showBubble('👉', t('hint'));
        TTS.speak(t('hint'));
      } else {
        // v2.4 (A-178): acolhimento sem julgamento, citando os objetos da questão
        // com artigo concordado (as maçãs / os morangos · pt/es; "the" no en)
        const f = R.current && R.current.f;
        const itPl = (f && ITEMS[f.it]) ? ITEMS[f.it].plural : '';
        const fem = !!(f && ITEMS[f.it] && ITEMS[f.it].f);
        const art = fem ? (LANG === 'es' ? 'las' : 'as') : (LANG === 'es' ? 'los' : 'os');
        const r = itPl ? tpick('cm_err_item', { name: P().name, item: itPl, art }) : tpick('cm_err_plain', { name: P().name });
        showBubble('🙈', r); TTS.speak(r);
      }
    }
    if (P().fatigue >= 3 && !overlayOpen()) { P().fatigue = 0; setTimeout(breathingOverlay, 900); }
    saveState();
  }
}
function levelUpOverlay(mode, lv) {
  SFX.fanfare(); confetti(40);
  showOverlay('<div class="ov-emoji">🎉</div><h3>' + t('lvl_up', { n: lv, m: t('m_' + mode) }) + '</h3>' +
    '<button class="big-btn" data-close="1">' + t('ok') + '</button>');
}
function closeOverlay() { hideOverlay(); }

/* ---------- fim de rodada ---------- */
function endRound() {
  if (R.ended) return; // v2.5: à prova de dupla chamada (tempo global + última questão)
  R.ended = true;
  const p = P();
  const today = fmtDate();
  // ofensiva S15
  if (p.lastPlay !== today) {
    p.streak = (p.lastPlay === yesterdayStr()) ? (p.streak || 0) + 1 : 1;
    p.lastPlay = today;
  }
  // semanas (S26)
  const wk = weekKey();
  let wrow = p.weeks.find((w) => w.k === wk);
  if (!wrow) { wrow = { k: wk, rounds: 0, rights: 0 }; p.weeks.push(wrow); p.weeks = p.weeks.slice(-8); }
  wrow.rounds++; wrow.rights += R.firsts;
  // rodadas e meta S11
  p.rounds++;
  if (!p.today) ensureMissions();
  p.today.rounds++;
  missionEvent('round');
  if (G().goalRounds > 0 && p.today.rounds >= G().goalRounds && !p.today.done) {
    p.today.done = true; grantStars(5); setTimeout(() => toast('🎯 ' + t('goal_done')), 800);
  }
  // chefe S18
  let bossMsg = '';
  if (R.kind === 'boss') {
    const won = R.firsts >= Math.ceil(R.total * 0.7);
    if (won) { p.bossWon = true; bossMsg = t('boss_win'); } else bossMsg = t('boss_lose');
  } else if (R.kind === 'normal' && p.rounds % 5 === 0) {
    p.bossReady = true; bossMsg = t('boss_ready');
  }
  // v2.4 (A-118/A-128): rodada vencida depois de errar alimenta as medalhas de
  // persistência — ANTES do checkAch, para a medalha sair nesta própria rodada
  if (R.kind === 'normal' && R.wrongs >= 1 && R.firsts >= 3) {
    p.persistRounds = (p.persistRounds || 0) + 1;
  }
  /* v2.5: baú de recompensas — marcos de ofensiva (3/7/14/21/30 dias) abrem
     um baú com estrelas e uma figurinha garantida */
  let chestMs = 0;
  const cms = CHEST_MILESTONES.find((m) => p.streak >= m && !p.chests[m]);
  if (cms) { p.chests[cms] = 1; chestMs = cms; }
  checkAch();
  saveState(true);

  show('end');
  SFX.fanfare();
  confetti(60);
  Timer.hide();
  $('#end-title').textContent = R.stars >= 8 ? t('end_great') : t('end_good');
  const starsEl = $('#stars-earned');
  starsEl.innerHTML = '';
  for (let i = 0; i < Math.min(R.stars, 20); i++) {
    const sp = document.createElement('span');
    sp.className = 'star-pop'; sp.textContent = '⭐';
    sp.style.animationDelay = (i * 0.1) + 's';
    starsEl.appendChild(sp);
    if (i < 5) setTimeout(() => SFX.star(), 300 + i * 140);
  }
  let msg = R.stars === 1 ? t('end_star1') : t('end_stars', { n: R.stars });
  if (R.kind === 'duel') {
    const d = R.duel;
    msg = (d.s1 === d.s2) ? t('duel_tie') : t('duel_win', { av: d.s1 > d.s2 ? d.a1 : d.a2 }) + ' ' + d.a1 + ' ' + d.s1 + ' × ' + d.s2 + ' ' + d.a2;
  }
  if (bossMsg) msg += ' ' + bossMsg;
  /* v2.5: resultado do Contra o Tempo (com recorde próprio) */
  let endExtra = '';
  if (R.kind === 'tempo') {
    const prevS = p.bestSurvive || 0;
    endExtra = R.firsts >= 10 ? t('survive_great', { n: R.firsts }) : t('survive_end', { n: R.firsts });
    if (R.firsts > prevS) { p.bestSurvive = R.firsts; endExtra += ' 🏆 ' + t('survive_record'); saveState(true); }
  }
  if (endExtra) msg += ' ' + endExtra;
  if (R.kind === 'diag') {
    const sug = R.diagOK <= 2 ? 1 : R.diagOK <= 4 ? 2 : R.diagOK <= 6 ? 3 : R.diagOK === 7 ? 4 : 5;
    Object.keys(MODES).forEach((m) => { if (m !== 'mistar') p.levels[m] = sug; });
    p.assessed = true;
    msg = t('diag_done', { n: sug });
    saveState();
  }
  $('#end-msg').textContent = msg;

  // v2.2: recorde de pontos por modo + destaque na tela final
  if (R.kind === 'normal' || R.kind === 'boss' || R.kind === 'review') {
    const key = R.kind === 'boss' ? 'chefe' : R.kind === 'review' ? 'revisao' : (R.mode || 'somar');
    const prev = (p.bestPts || {})[key] || 0;
    R.newRecord = R.points > 0 && R.points > prev;
    if (R.newRecord) { p.bestPts = p.bestPts || {}; p.bestPts[key] = R.points; }
    saveState(true); // grava o recorde imediatamente (saveState anterior acontece antes dele)
  }
  // v2.4 (A-144): parabéns personalizado falado — recorde tem fala própria
  let spoken = '';
  if (R.kind === 'normal' || R.kind === 'review') {
    spoken = R.newRecord && R.points > 0
      ? tpick('pr_record', { name: p.name, n: R.points })
      : tpick('pr_end', { name: p.name });
  }
  const endPts = $('#end-pts');
  if (endPts) {
    if (R.points > 0) {
      endPts.classList.remove('hidden');
      endPts.innerHTML = t('end_pts', { n: R.points }) +
        (R.newRecord ? ' <span class="rec">🏆 ' + t('end_record') + '</span>' : '');
    } else endPts.classList.add('hidden');
  }

  const hist = $('#end-history');
  hist.innerHTML = '<b>' + t('history') + '</b><div class="hist-list">' +
    R.history.map((h) => '<span class="hrow' + (h.ok ? ' ok' : ' no') + '">' + (h.ok ? '✅' : '🔁') + ' ' + h.txt + '</span>').join('') + '</div>';
  if (spoken) setTimeout(() => TTS.speak(spoken), 1100); // após a fanfarra
  /* v2.5: baú aparece depois da tela final — momento de recompensa */
  if (chestMs) setTimeout(() => openChest(chestMs), 3200);
  renderHome();
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
function checkAch() {
  const p = P();
  ACHS.forEach((a) => {
    if (!p.ach[a.id] && a.cond(p)) {
      p.ach[a.id] = 1;
      p.stars += 5;
      toast('🏅 ' + t('ach_unlock', { n: t(a.id) }));
      SFX.fanfare();
    }
  });
}
function renderAch() {
  const p = P();
  $('#ach-grid').innerHTML = ACHS.map((a) => {
    const got = !!p.ach[a.id];
    const hidden = !got && a.sec; // secreta: só revela depois de conquistada
    return '<div class="ach-card' + (got ? ' got' : '') + (hidden ? ' secret' : '') + '"><span class="ach-emoji">' + (got ? '🏅' : hidden ? '❓' : '🔒') + '</span>' +
      '<b>' + (hidden ? '???' : t(a.id)) + '</b><small>' + (hidden ? t('ach_secret') : t('ad' + a.id.slice(1))) + '</small></div>';
  }).join('');
  const bk = $('#btn-backup');
  if (bk) bk.classList.toggle('hidden', Object.keys(p.ach || {}).length === 0);
}

/* ---------- loja (S17) ---------- */
const SHOP_THEMES = [
  { id: 'classico', price: 0, key: 'th_classico' },
  { id: 'espaco', price: 0, key: 'th_espaco' },
  { id: 'jardim', price: 0, key: 'th_jardim' },
  { id: 'arcoiris', price: 60, key: 'th_arcoiris' },
  /* v2.5: três mundos novos */
  { id: 'oceano', price: 60, key: 'th_oceano' },
  { id: 'doces', price: 60, key: 'th_doces' },
  { id: 'neve', price: 60, key: 'th_neve' },
];
const SHOP_HATS = [
  { id: '', price: 0, emoji: '', key: 'hat_none_d' },
  { id: '🧢', price: 30, emoji: '🧢', key: 'hat_bone' },
  { id: '🎀', price: 30, emoji: '🎀', key: 'hat_laco' },
  { id: '👑', price: 60, emoji: '👑', key: 'hat_coroa' },
  /* v2.5: acessórios novos */
  { id: '🎩', price: 40, emoji: '🎩', key: 'hat_cartola' },
  { id: '🕶️', price: 45, emoji: '🕶️', key: 'hat_oculos' },
  { id: '🎓', price: 50, emoji: '🎓', key: 'hat_formatura' },
];
/* "Usar", "Comprar 60⭐"... repetem em todo cartão: o leitor de tela ouve também o item */
function itemLbl(action, item) { return ' aria-label="' + escHtml(action + ' — ' + item) + '"'; }
function renderShop() {
  const p = P();
  $('#shop-stars').textContent = String(p.stars);
  const themeRow = $('#shop-themes');
  themeRow.innerHTML = SHOP_THEMES.map((th) => {
    const owned = th.price === 0 || p.owned.themes.includes(th.id);
    const inUse = (G().theme === th.id);
    return '<div class="shop-item th-' + th.id + '"><span class="swatch"></span><b>' + t(th.key) + '</b>' +
      (owned
        ? '<button class="mini-btn' + (inUse ? ' using' : '') + '" data-th="' + th.id + '"' + itemLbl(inUse ? t('in_use') : t('equip'), t(th.key)) + '>' + (inUse ? t('in_use') : t('equip')) + '</button>'
        : '<button class="mini-btn" data-buyth="' + th.id + '"' + itemLbl(t('buy') + ' ' + th.price + '⭐', t(th.key)) + '>' + t('buy') + ' ' + th.price + '⭐</button>') +
      '</div>';
  }).join('');
  const hatRow = $('#shop-hats');
  hatRow.innerHTML = SHOP_HATS.map((h) => {
    const owned = h.price === 0 || p.owned.hats.includes(h.id);
    const inUse = (p.hat || '') === h.id;
    return '<div class="shop-item"><span class="shop-emoji">' + (h.emoji || '🦊') + '</span><b>' + t(h.key) + '</b>' +
      (owned
        ? '<button class="mini-btn' + (inUse ? ' using' : '') + '" data-hat="' + h.id + '"' + itemLbl(inUse ? t('in_use') : t('equip'), t(h.key)) + '>' + (inUse ? t('in_use') : t('equip')) + '</button>'
        : '<button class="mini-btn" data-buyhat="' + h.id + '"' + itemLbl(t('buy') + ' ' + h.price + '⭐', t(h.key)) + '>' + t('buy') + ' ' + h.price + '⭐</button>') +
      '</div>';
  }).join('');
  /* v2.5: mascotes adultas escolhíveis */
  const petRow = $('#shop-pets');
  if (petRow) {
    petRow.innerHTML = PETS.map((pt) => {
      const owned = pt.price === 0 || p.owned.pets.includes(pt.id);
      const inUse = (p.pet || 'fox') === pt.id;
      const ready = p.stars >= 100;
      return '<div class="shop-item"><span class="shop-emoji">' + pt.emoji + '</span><b>' + t(pt.key) + '</b>' +
        (owned
          ? '<button class="mini-btn' + (inUse ? ' using' : '') + '" data-pet="' + pt.id + '"' + itemLbl(inUse ? t('in_use') : t('equip'), t(pt.key)) + '>' + (inUse ? t('in_use') : t('equip')) + '</button>'
          : '<button class="mini-btn" data-buypet="' + pt.id + '"' + itemLbl(t('buy') + ' ' + pt.price + '⭐', t(pt.key)) + '>' + t('buy') + ' ' + pt.price + '⭐</button>') +
        (!ready && !owned ? '<small class="pet-note">' + t('pet_note') + '</small>' : '') +
        '</div>';
    }).join('');
  }
  const alb = $('#album-grid');
  alb.innerHTML = STICKERS.map((s, i) => '<span class="stk' + (p.stickers.includes(i) ? ' got' : '') + '">' + (p.stickers.includes(i) ? s : '❔') + '</span>').join('');
  $('#album-count').textContent = t('album', { a: p.stickers.length });
  $$('#shop-themes [data-th]').forEach((b) => b.addEventListener('click', () => { G().theme = b.dataset.th; saveState(); applySettings(); renderShop(); SFX.tap(); }));
  $$('#shop-themes [data-buyth]').forEach((b) => b.addEventListener('click', () => buyTheme(b.dataset.buyth)));
  $$('#shop-hats [data-hat]').forEach((b) => b.addEventListener('click', () => { P().hat = b.dataset.hat; saveState(); renderShop(); renderMascot(); SFX.tap(); }));
  $$('#shop-hats [data-buyhat]').forEach((b) => b.addEventListener('click', () => buyHat(b.dataset.buyhat)));
  $$('#shop-pets [data-pet]').forEach((b) => b.addEventListener('click', () => { P().pet = b.dataset.pet; saveState(); renderShop(); renderMascot(); SFX.tap(); showBubble(PETS.find((x) => x.id === b.dataset.pet).emoji, tpick('greet', { name: P().name })); }));
  $$('#shop-pets [data-buypet]').forEach((b) => b.addEventListener('click', () => buyPet(b.dataset.buypet)));
}
function buyTheme(id) {
  const th = SHOP_THEMES.find((x) => x.id === id); const p = P();
  if (!th || p.owned.themes.includes(id)) return;
  if (p.stars < th.price) { showBubble('😢', t('locked', { n: th.price - p.stars })); return; }
  p.stars -= th.price; p.owned.themes.push(id); p.firstBuy = true;
  G().theme = id;
  checkAch(); saveState(); applySettings(); renderShop(); renderMascot(); refreshChrome(); SFX.cash(); confetti(20);
}
function buyHat(id) {
  const h = SHOP_HATS.find((x) => x.id === id); const p = P();
  if (!h || p.owned.hats.includes(id)) return;
  if (p.stars < h.price) { showBubble('😢', t('locked', { n: h.price - p.stars })); return; }
  p.stars -= h.price; p.owned.hats.push(id); p.firstBuy = true; p.hat = id;
  checkAch(); saveState(); renderShop(); renderMascot(); refreshChrome(); SFX.cash(); confetti(20);
}
/* v2.5: compra de mascote adulta */
function buyPet(id) {
  const pt = PETS.find((x) => x.id === id); const p = P();
  if (!pt || p.owned.pets.includes(id)) return;
  if (p.stars < pt.price) { showBubble('😢', t('locked', { n: pt.price - p.stars })); return; }
  p.stars -= pt.price; p.owned.pets.push(id); p.firstBuy = true; p.firstPet = true; p.pet = id;
  checkAch(); saveState(); renderShop(); renderMascot(); refreshChrome();
  showOverlay('<div class="ov-emoji">' + pt.emoji + '</div><h3>' + t('pet_new', { n: t(pt.key) }) + '</h3><button class="big-btn" data-close="1">' + t('ok') + '</button>');
  SFX.cash(); confetti(30);
}
function buySticker() {
  const p = P();
  if (p.stars < 5) { showBubble('😢', t('locked', { n: 5 - p.stars })); return; }
  p.stars -= 5;
  const i = rand(0, STICKERS.length - 1);
  let msg;
  if (p.stickers.includes(i)) { p.stars += 2; msg = t('dup'); }
  else { p.stickers.push(i); msg = STICKERS[i] + '!'; }
  p.firstBuy = true;
  checkAch(); saveState(); renderShop(); refreshChrome();
  showOverlay('<div class="ov-emoji">' + STICKERS[i] + '</div><h3>' + msg + '</h3><button class="big-btn" data-close="1">' + t('ok') + '</button>');
  SFX.fanfare(); confetti(24);
}

/* ---------- v2.5: baú de recompensas da ofensiva ---------- */
function openChest(ms) {
  const p = P();
  const reward = ms * 10;
  let extra = '';
  const missing = STICKERS.map((s, i) => i).filter((i) => !p.stickers.includes(i));
  if (missing.length) {
    const idx = missing[rand(0, missing.length - 1)];
    p.stickers.push(idx);
    extra = '<p class="ov-sub">' + t('chest_sticker', { s: STICKERS[idx] }) + '</p>';
  }
  grantStars(reward);
  checkAch(); saveState(); refreshChrome();
  showOverlay('<div class="ov-emoji chest-pop">🎁</div><h3>' + t('chest_title') + '</h3><p>' + t('chest_msg', { n: ms }) + '</p>' +
    '<p class="chest-reward">⭐ +' + reward + '</p>' + extra +
    '<button class="big-btn" id="btn-chest-claim">' + t('chest_claim') + '</button>');
  const b = $('#btn-chest-claim');
  if (b) b.addEventListener('click', () => { SFX.fanfare(); confetti(50); hideOverlay(); });
  SFX.fanfare(); confetti(30);
}

/* ---------- v2.5: backup das conquistas e do progresso (persistência) ----------
   Conquistas/estrelas/figurinhas ficam no armazenamento da extensão. Recarregar
   (↻) preserva tudo; REMOVER e reinstalar apaga. O backup em arquivo é a rede
   de segurança — um clique baixa um .json que pode ser reimportado nas opções. */
function downloadBackup() {
  try {
    const data = JSON.stringify(DB, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conta-comigo-backup-' + fmtDate() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    G().lastBackupAt = Date.now();
    saveState();
    toast('💾 ' + t('backup_done'));
    SFX.cash();
  } catch (e) { /* silencioso */ }
}

/* ---------- overlays de fadiga (S10) e pausa (S28) ---------- */
let breatheTimer = null;
function breathingOverlay() {
  showOverlay('<div class="ov-emoji breathe-ball" id="ball">🫧</div><h3>' + t('breathe') + '</h3>' +
    '<p id="breathe-lbl">' + t('breathe_in') + '</p>' +
    '<button class="big-btn" id="btn-breathe-done" disabled>' + t('breathe_done') + '</button>');
  let phase = 0, cycles = 0;
  const ball = $('#ball');
  if (!document.body.classList.contains('calmo')) ball.classList.add('anim');
  breatheTimer = setInterval(() => {
    phase = 1 - phase;
    $('#breathe-lbl').textContent = phase ? t('breathe_out') : t('breathe_in');
    if (!phase) { cycles++; if (cycles >= 2) { clearInterval(breatheTimer); const b = $('#btn-breathe-done'); if (b) b.disabled = false; } }
  }, 4000);
  $('#btn-breathe-done').addEventListener('click', () => { clearInterval(breatheTimer); hideOverlay(); TTS.speak(t('breathe_done')); });
}
function breakOverlay() {
  TTS.stop();
  showOverlay('<div class="ov-emoji">💤🦊</div><h3>' + t('break_time') + '</h3><p>' + t('break_msg') + '</p>' +
    '<button class="big-btn" id="btn-break-done">' + t('break_done') + '</button>');
  $('#btn-break-done').addEventListener('click', () => { sessionSec = 0; hideOverlay(); });
}

/* ---------- perfis (S27) ---------- */
function renderProfilePop() {
  const wrap = $('#pop-profile');
  wrap.setAttribute('aria-labelledby', 'pop-who');
  wrap.innerHTML = '<b id="pop-who">' + t('who') + '</b>' + DB.profiles.map((pf) =>
    '<button class="prof-row' + (pf.id === DB.activeId ? ' cur' : '') + '" data-pid="' + escHtml(pf.id) + '">' +
    '<span class="pf-av">' + escHtml(pf.avatar) + '</span><span class="pf-name">' + escHtml(pf.name) + '</span><span class="pf-st">⭐ ' + pf.stars + ' · ⚡ ' + (pf.points || 0) + '</span></button>').join('') +
    (DB.profiles.length < 4
      ? '<div class="prof-add"><input id="new-prof-name" maxlength="14" placeholder="' + t('name_ph') + '" aria-label="' + t('name_ph') + '">' +
        '<div class="av-row" role="group" aria-label="' + t('a_avatar') + '">' + AVATARS.map((a, i) => '<button class="av' + (i === 0 ? ' sel' : '') + '" aria-pressed="' + (i === 0) + '" data-av="' + a + '">' + a + '</button>').join('') + '</div>' +
        '<button class="mini-btn" id="btn-add-prof">' + t('add_profile') + '</button></div>'
      : '<small class="max-note">' + t('max4') + '</small>');
  $$('#pop-profile .prof-row').forEach((b) => b.addEventListener('click', () => {
    DB.activeId = b.dataset.pid; saveState(true);
    closePopovers(); renderHome(); applyLang(); toast(t('switch_to', { n: P().name })); SFX.tap();
  }));
  $$('#pop-profile .av').forEach((b) => b.addEventListener('click', () => { markPicked($$('#pop-profile .av'), b); SFX.tap(); }));
  const add = $('#btn-add-prof');
  if (add) add.addEventListener('click', () => {
    const raw = ($('#new-prof-name').value || '').trim();
    const name = raw ? cleanName(raw) : ('Jogador ' + (DB.profiles.length + 1));
    const av = ($('#pop-profile .av.sel') || { dataset: { av: '🦊' } }).dataset.av;
    DB.profiles.push(newProfile(null, name, av));
    DB.activeId = DB.profiles[DB.profiles.length - 1].id;
    saveState(true);
    closePopovers(); renderHome(); refreshChrome(); SFX.fanfare();
  });
}
function closePopovers() {
  const pop = $('#pop-profile'), was = pop && !pop.classList.contains('hidden');
  $$('.popover').forEach((p) => p.classList.add('hidden'));
  const bp = $('#btn-profile'); if (bp) bp.setAttribute('aria-expanded', 'false');
  if (was && pop.contains(document.activeElement)) bp.focus();
}
function toggleProfilePop() {
  const pop = $('#pop-profile');
  if (!pop.classList.contains('hidden')) { closePopovers(); return; }
  renderProfilePop(); pop.classList.remove('hidden');
  $('#btn-profile').setAttribute('aria-expanded', 'true');
  const first = pop.querySelector('.prof-row.cur') || pop.querySelector('button');
  if (first) first.focus();
}

/* ---------- tela cheia (popup → janela nativa; página → Fullscreen API) ---------- */
function toggleFullscreen() {
  ensureAudio(); SFX.tap();
  if (!IS_PAGE && HAS_EXT) {
    try {
      chrome.windows.create({ url: chrome.runtime.getURL('game.html'), type: 'popup', focused: true, state: 'fullscreen' }, () => { void chrome.runtime.lastError; });
      return;
    } catch (e) { /* cai para a API */ }
  }
  try {
    if (document.fullscreenElement) { if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); }
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  } catch (e) { /* ignora */ }
}
function openOptions() {
  ensureAudio(); SFX.tap();
  const url = HAS_EXT ? chrome.runtime.getURL('options.html') : 'options.html';
  if (HAS_EXT) chrome.tabs ? chrome.tabs.create({ url }) : window.open(url, '_blank');
  else location.href = url; // PWA/TWA/Electron: mesma janela; o “voltar” das opções retorna ao jogo
}

/* ---------- onboarding da senha dos responsáveis (v2.3) ----------
   Aparece uma única vez na sessão inicial do app (game/popup/web).
   O adulto cria a senha + lembrete de segurança; pode adiar com "Configurar depois"
   (neste caso a criação continua disponível no portão da área dos responsáveis). */
function showOnboarding() {
  showOverlay('<div class="ov-emoji">👨‍👩‍👧</div><h3>' + t('ob_title') + '</h3><p>' + t('ob_msg') + '</p>' +
    '<div class="ob-form">' +
    '<label class="pwd-lbl" for="ob-pwd">' + t('ob_pwd') + '</label>' +
    '<div class="pwd-box"><input id="ob-pwd" type="password" autocomplete="new-password"><button id="ob-eye1" class="eye-btn" type="button" aria-label="' + t('a_show_pwd') + '" aria-pressed="false">👁</button></div>' +
    '<label class="pwd-lbl" for="ob-pwd2">' + t('ob_pwd2') + '</label>' +
    '<div class="pwd-box"><input id="ob-pwd2" type="password" autocomplete="new-password"><button id="ob-eye2" class="eye-btn" type="button" aria-label="' + t('a_show_pwd') + '" aria-pressed="false">👁</button></div>' +
    '<label class="pwd-lbl" for="ob-hint">' + t('ob_hint_lbl') + '</label>' +
    '<input id="ob-hint" type="text" maxlength="80">' +
    '<div class="gate-err" id="ob-err" role="alert"></div>' +
    '<button class="big-btn" id="btn-ob-create">' + t('ob_create') + '</button>' +
    '<button class="big-btn alt" id="btn-ob-later">' + t('ob_later') + '</button>' +
    '</div>');
  $('#ob-hint').placeholder = t('ob_hint_ph');
  $('#btn-ob-create').addEventListener('click', createObPwd);
  $('#btn-ob-later').addEventListener('click', () => {
    G().passOnboardDone = true; saveState(true); SFX.tap(); hideOverlay();
  });
  [['#ob-eye1', '#ob-pwd'], ['#ob-eye2', '#ob-pwd2']].forEach(([b, inp]) => {
    $(b).addEventListener('click', () => { const i = $(inp); i.type = i.type === 'password' ? 'text' : 'password'; $(b).setAttribute('aria-pressed', String(i.type === 'text')); });
  });
  ['#ob-pwd', '#ob-pwd2', '#ob-hint'].forEach((id) => {
    $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btn-ob-create').click(); });
  });
}
async function createObPwd() {
  const a = $('#ob-pwd').value || '';
  const b = $('#ob-pwd2').value || '';
  const hint = ($('#ob-hint').value || '').trim();
  if (a.length < 4) { $('#ob-err').textContent = t('sec_short'); SFX.wrong(); return; }
  if (a !== b) { $('#ob-err').textContent = t('sec_mismatch'); SFX.wrong(); return; }
  if (!hint) { $('#ob-err').textContent = t('sec_need_hint'); SFX.wrong(); return; }
  const btn = $('#btn-ob-create');
  btn.disabled = true;
  const g = G();
  g.passSalt = PASS.salt();
  g.passHash = await PASS.hash(a, g.passSalt);
  g.passHint = hint; g.passSetAt = Date.now();
  g.passOnboardDone = true; g.passTries = 0; g.passLockUntil = 0;
  saveState(true);
  hideOverlay();
  showBubble('🔒', t('ob_saved'));
  TTS.speak(t('ob_saved'));
  confetti(20); SFX.fanfare();
}

/* ==================== inicialização ==================== */
function bindStatic() {
  $('#btn-home').addEventListener('click', () => { TTS.stop(); SFX.tap(); renderHome(); show('home'); });
  $('#btn-mute').addEventListener('click', () => {
    G().mute = !G().mute; applySettings(); saveState();
    if (G().mute) TTS.stop(); else { ensureAudio(); SFX.tap(); }
  });
  $('#btn-full').addEventListener('click', toggleFullscreen);
  $('#btn-gear').addEventListener('click', openOptions);
  $('#btn-profile').addEventListener('click', () => { SFX.tap(); toggleProfilePop(); });
  $('#btn-again').addEventListener('click', () => { ensureAudio(); SFX.tap(); R.kind === 'duel' ? startDuelSetup() : startRound(R.mode || 'somar'); });
  $('#btn-menu').addEventListener('click', () => { TTS.stop(); SFX.tap(); renderHome(); show('home'); });
  $('#btn-repeat').addEventListener('click', () => { ensureAudio(); SFX.tap(); if (R.current) TTS.speak(R.current.tts, { calm: true }); });
  $('#btn-shop').addEventListener('click', () => { SFX.tap(); renderShop(); show('shop'); });
  $('#btn-ach').addEventListener('click', () => { SFX.tap(); renderAch(); show('ach'); });
  $('#shop-back').addEventListener('click', () => { SFX.tap(); renderHome(); show('home'); });
  $('#ach-back').addEventListener('click', () => { SFX.tap(); renderHome(); show('home'); });
  $('#btn-sticker').addEventListener('click', () => { ensureAudio(); buySticker(); });
  $('#sp-review').addEventListener('click', () => { ensureAudio(); SFX.tap(); startReview(); });
  $('#sp-boss').addEventListener('click', () => { ensureAudio(); SFX.tap(); startBoss(); });
  $('#sp-diag').addEventListener('click', () => { ensureAudio(); SFX.tap(); startDiag(); });
  $('#sp-duel').addEventListener('click', startDuelSetup);
  $('#btn-duel-go').addEventListener('click', () => {
    ensureAudio(); SFX.tap();
    const a1 = ($('#duel-av1 .av.sel') || { textContent: '🦊' }).textContent;
    const a2 = ($('#duel-av2 .av.sel') || { textContent: '🐼' }).textContent;
    startDuel(a1, a2);
  });
  $('#duel-back').addEventListener('click', () => { SFX.tap(); renderHome(); show('home'); });
  $$('.diff-chip').forEach((chip) => chip.addEventListener('click', () => {
    ensureAudio(); SFX.tap();
    G().diffMode = chip.dataset.d === 'auto' ? 'auto' : Number(chip.dataset.d);
    saveState(); renderDiffChips();
  }));
  // CSP: overlays usam data-close em vez de onclick inline
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('[data-close]') : null;
    if (b) closeOverlay();
  });
  // v2.5: backup das conquistas (botão da vitrine) — persistência em arquivo
  const bb = $('#btn-backup');
  if (bb) bb.addEventListener('click', () => { ensureAudio(); SFX.tap(); downloadBackup(); });
  const bc = $('#btn-close');
  if (bc) {
    if (IS_PAGE && HAS_EXT) bc.classList.remove('hidden');
    bc.addEventListener('click', () => {
      SFX.tap();
      try { window.close(); } catch (e) { /* ignora */ }
      setTimeout(() => {
        try { if (HAS_EXT && chrome.windows) chrome.windows.remove(chrome.windows.WINDOW_ID_CURRENT, () => void chrome.runtime.lastError); } catch (e) { /* ignora */ }
      }, 160);
    });
  }
  document.addEventListener('pointerdown', ensureAudio);
  document.addEventListener('keydown', onKey);
}

/* ---------- teclado (S20) ---------- */
function onKey(e) {
  if (overlayOpen()) {
    if (e.key === 'Tab') { trapTab(e); return; }
    // botões e campos já tratam o próprio Enter — sem isso, Enter em "Configurar
    // depois" clicava também no primeiro botão do modal
    const tag = e.target && e.target.tagName;
    if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'INPUT') { const b = $('#overlay-card .big-btn:not([disabled])'); if (b) b.click(); }
    return;
  }
  if ($('#screen-game').classList.contains('active')) {
    if (e.key >= '1' && e.key <= '4') { const b = $$('#answers .ans')[Number(e.key) - 1]; if (b) b.click(); }
    else if (e.key === 'Enter' || e.key.toLowerCase() === 'r') { if (R.current) TTS.speak(R.current.tts, { calm: true }); }
    else if (e.key.toLowerCase() === 'h') $('#btn-home').click();
  } else if (e.key.toLowerCase() === 'm') $('#btn-mute').click();
  if (e.key === 'Escape') closePopovers();
}

/* ---------- relógio de sessão (S28) ---------- */
setInterval(() => {
  if (document.hidden || overlayOpen()) return;
  const active = $('#screen-game') && $('#screen-game').classList.contains('active');
  if (!active) return;
  sessionSec++;
  const p = P(); if (p) p.playSec++;
  if (sessionSec % 30 === 0) saveState();
  const lim = G().sessionLimit;
  if (lim > 0 && sessionSec >= lim * 60) breakOverlay();
}, 1000);

/* ---------- boot ---------- */
async function boot() {
  await initDB();
  TTS.init();
  applyLang();
  applySettings();
  bindStatic();
  ensureMissions();
  renderHome();
  show('home');
  // v2.4.1: selo de versão visível no topo — confirmação instantânea da build
  const vb = $('#cc-ver');
  if (vb) {
    let vv = '';
    try { if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) vv = chrome.runtime.getManifest().version; } catch (e) { /* sem extensão */ }
    if (!vv) { const mt = document.querySelector('meta[name="cc-version"]'); if (mt) vv = mt.content; }
    vb.textContent = 'v' + (vv || (window.ccVersion ? window.ccVersion() : '2.6.0'));
  }
  // v2.4 (A-198): saudação cordial com o nome — o 1º toque libera o áudio no navegador
  const greet = () => {
    const home = $('#screen-home');
    if (!home || !home.classList.contains('active') || overlayOpen()) return;
    const line = tpick('greet', { name: P().name });
    showBubble(mascotStage().emoji, line);
    TTS.speak(line);
  };
  document.addEventListener('pointerdown', () => setTimeout(greet, 350), { once: true });
  // v2.3: onboarding da senha dos responsáveis na sessão inicial (uma única vez)
  if (!G().passHash && !G().passOnboardDone) setTimeout(showOnboarding, 700);
  if (HAS_EXT && typeof chrome !== 'undefined' && chrome.tabs) {
    try { chrome.runtime.sendMessage('cc-page-ready', () => void chrome.runtime.lastError); } catch (e) { /* ignora */ }
  }
  // S32: adotar mudanças remotas
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged && G().sync) {
      chrome.storage.onChanged.addListener((ch, area) => {
        if (area === 'sync' && ch.cc_state_sync) {
          const remote = parseDB(JSON.stringify(ch.cc_state_sync.newValue));
          if (remote && remote.updatedAt > DB.updatedAt + 500) { DB = remote; renderHome(); }
        }
      });
    }
  } catch (e) { /* ignora */ }
}
window.CC = { closeOverlay, renderHome, refreshChrome };
boot();
