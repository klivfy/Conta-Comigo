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
/* ADR-001: outra página gravou (evento storage) ou outro computador sincronizou. O banco só é
   trocado com a tela inicial aberta, nunca no meio de uma rodada. */
let externalPending = false, remotePending = null;
function adoptIfSafe() {
  const home = $('#screen-home');
  if ((!externalPending && !remotePending) || !home || !home.classList.contains('active') || overlayOpen()) return;
  const remote = remotePending;
  externalPending = false; remotePending = null;
  const ok = remote ? adoptRemote(remote) : adoptLatest();
  if (ok) { applyLang(); applySettings(); ensureMissions(); renderHome(); }
}
function show(name) {
  if (name !== 'shop') { closeUndo(); if (previewTimer) endPreview(); }
  const prev = document.activeElement;
  $$('.screen').forEach((s) => s.classList.remove('active'));
  const el = $('#screen-' + name);
  if (el) el.classList.add('active');
  // teclado/leitor de tela: se o foco ficou numa tela que sumiu, ele vai para a nova
  if (el && prev && prev.closest && prev.closest('.screen') && !el.contains(prev)) focusScreen(el);
  if (name === 'home') adoptIfSafe();
  if (name !== 'game') setTimeout(flushToasts, 600);
  else { // aviso disparado logo antes da rodada (ex.: missão "modo novo") volta para a fila
    const tEl = $('#toast');
    if (tEl && tEl.classList.contains('show')) { toastQueue.push(tEl.textContent); tEl.classList.remove('show'); clearTimeout(toastTimer); }
  }
}
function focusScreen(el) {
  if (overlayOpen()) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

function applySettings() {
  const g = G();
  applyTheme(g);
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
  /* leitor de tela: "135 estrelas" e "5 dias seguidos", em vez de emoji + número soltos */
  const ns = p ? p.stars : 0, nd = p ? p.streak : 0;
  if (chip) { chip.setAttribute('role', 'img'); chip.setAttribute('aria-label', t(ns === 1 ? 'chip_star1' : 'chip_stars', { n: ns })); }
  if (st) { st.setAttribute('role', 'img'); st.setAttribute('aria-label', t(nd === 1 ? 'chip_streak1' : 'chip_streak', { n: nd })); }
  /* v2.5: moldura do perfil pela quantidade de conquistas — orgulho à vista */
  const bp = $('#btn-profile');
  if (bp && p) {
    const n = Object.keys(p.ach || {}).length;
    bp.classList.toggle('fr-gold', n >= 5 && n < 10);
    bp.classList.toggle('fr-rb', n >= 10);
  }
  /* 4.3: a senha não interrompe a primeira brincadeira — o portão do ⚙️ a cria
     quando o adulto entrar; até lá, um ponto discreto lembra que falta configurar */
  const gear = $('#btn-gear');
  if (gear) {
    const pending = !G().passHash;
    gear.classList.toggle('needs-setup', pending);
    gear.dataset.i18nLabel = pending ? 'a_gate_new' : 'gate_title';
    applyI18nLabels(gear.parentNode);
  }
}

/* ---------- balão, toast e overlays ---------- */
function showBubble(emoji, text) {
  const b = $('#bubble'); if (!b) return;
  // o balão mora na tela ativa (antes ficava preso na do jogo e sumia no início)
  const scr = $('.screen.active'); if (scr && b.parentNode !== scr) scr.appendChild(b);
  $('#bubble-emoji').textContent = emoji;
  $('#bubble-text').textContent = text;
  announce(text);
  b.classList.remove('hidden', 'pop');
  // no jogo, o balão fica abaixo da linha de progresso (antes cobria "Questão 1 de 5" e os pontos)
  b.style.top = '';
  if (scr && scr.id === 'screen-game' && b.offsetParent) {
    const tw = $('#timer-wrap'), anchor = (tw && !tw.classList.contains('hidden')) ? tw : $('#progress');
    if (anchor) b.style.top = Math.round(anchor.getBoundingClientRect().bottom - b.offsetParent.getBoundingClientRect().top + b.offsetParent.scrollTop + 8) + 'px';
  }
  void b.offsetWidth; b.classList.add('pop');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, bubbleMs(G()));
}
function hideBubble() { const b = $('#bubble'); if (b) b.classList.add('hidden'); }
/* v2.8.0: durante a rodada o toast cobria "Ouvir de novo" e tirava o foco da conta.
   Ali ele só vai para o leitor de tela e aparece na tela quando a criança sai do jogo. */
const toastQueue = [];
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  const game = $('#screen-game');
  if (game && game.classList.contains('active')) { announce(msg); toastQueue.push(msg); return; }
  showToastNow(msg, true);
}
function showToastNow(msg, speak) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.remove('hidden', 'show'); void el.offsetWidth; el.classList.add('show');
  if (speak) announce(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function flushToasts() {
  if (!toastQueue.length) return;
  const next = toastQueue.shift();
  showToastNow(next, false); // já foi anunciado no leitor de tela durante a rodada
  if (toastQueue.length) setTimeout(flushToasts, 2900);
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
    } else el.style.background = pick(CONF_THEMES[resolvedTheme(G())] || CONF_COLORS);
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
  if (lbl) lbl.textContent = t(st.key) + ' · ' + pName(p);
  const nx = $('#mascot-next');
  if (nx) nx.textContent = st.next != null ? t('to_next', { n: st.next }) : '⭐ ' + p.stars;
}

/* ---------- ofensiva / semana (S15) ----------
   Nomes dos dias pelo Intl no idioma do app ("Seg", "Ter"… em vez de "S T Q"),
   hoje com anel e dia sem jogo como círculo vazado — legível também em alto contraste. */
function dayName(d, style) {
  const s = new Intl.DateTimeFormat(TTS_LANG[LANG] || 'pt-BR', { weekday: style }).format(d).replace(/\.$/, '');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
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
    const sr = dayName(d, 'long') + (i === 0 ? ' (' + t('wk_today') + ')' : '') + ': ' + t(played ? 'wk_played' : 'wk_missed');
    html += '<span class="wday' + (played ? ' on' : '') + (i === 0 ? ' today' : '') + '">' +
      '<i aria-hidden="true">' + escHtml(dayName(d, 'short')) + '</i>' +
      (played ? '<b aria-hidden="true">🔥</b>' : '<b class="wdot" aria-hidden="true"></b>') +
      '<span class="sr-only">' + escHtml(sr) + '</span></span>';
  }
  el.innerHTML = html;
}

/* ---------- missões diárias (S16) — regras em engine.js (advanceMissions) ---------- */
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
  const done = advanceMissions(P(), ev, n);
  celebrateMissions(done);
  if (done.length) saveState();
}
function celebrateMissions(done) {
  done.forEach((def) => { toast('🎉 ' + t('mission_done_n', { m: t(def.key) })); SFX.star(); });
  if (done.length) refreshChrome();
}
function renderMissions() {
  const el = $('#mission-row'); if (!el) return;
  ensureMissions();
  const p = P();
  el.innerHTML = p.missions.list.map((m) => {
    const def = MISSION_DEFS.find((d) => d.id === m.id);
    if (!def) return '';
    const say = m.done ? t('mi_say_done', { m: t(def.key) }) : t('mi_say', { m: t(def.key), a: m.p, b: def.goal });
    return '<button type="button" class="mission' + (m.done ? ' done' : '') + '" data-say="' + escHtml(say) + '"><span aria-hidden="true">' + (m.done ? '✅ ' : '🔸 ') + '</span>' + escHtml(t(def.key)) + ' ' + m.p + '/' + def.goal + '</button>';
  }).join('');
  $$('#mission-row [data-say]').forEach((b) => b.addEventListener('click', () => { ensureAudio(); SFX.tap(); TTS.speak(b.dataset.say, { calm: true }); }));
}

/* ---------- meta diária (S11) ---------- */
function renderGoal() {
  const el = $('#goal-line'); if (!el) return;
  const p = P(); ensureMissions();
  el.textContent = (G().goalRounds > 0)
    ? t('goal_line', { a: Math.min(p.today.rounds, G().goalRounds), b: G().goalRounds })
    : '⭐ ' + p.stars;
}

/* ---------- metas de estrelas por modo / desbloqueio ----------
   4.2: a grade mostra só o que dá para jogar e um único "próximo prêmio" com a
   barra de estrelas — em vez de 10 cadeados no primeiro uso. */
function nextLockedMode() {
  return Object.keys(MODES).filter((m) => !modeUnlocked(m))
    .sort((a, b) => MODES[a].unlock - MODES[b].unlock)[0] || null;
}
function renderModes() {
  const grid = $('#modes-grid'); if (!grid) return;
  const p = P();
  let html = Object.keys(MODES).filter(modeUnlocked).map((m) => {
    const md = MODES[m];
    return '<button class="mode-card c-' + md.color + '" data-mode="' + m + '">' +
      (m === 'mistar' ? '<span class="badge">' + t('d_mistar') + '</span>' : '') +
      '<span class="mode-emoji">' + md.emoji + '</span>' +
      '<span class="mode-name">' + t('m_' + m) + '</span>' +
      '<span class="mode-desc">' + t('d_' + m) + '</span></button>';
  }).join('');
  const nx = nextLockedMode();
  if (nx) {
    const md = MODES[nx];
    const have = p ? p.stars : 0;
    const pct = Math.max(4, Math.min(100, Math.round(100 * have / md.unlock)));
    html += '<button class="mode-card next-prize c-' + md.color + '" data-next="' + nx + '" aria-label="' +
      escHtml(t('next_prize') + ': ' + t('m_' + nx) + ' — ' + t('next_need', { n: md.unlock - have })) + '">' +
      '<span class="badge">' + t('next_prize') + '</span>' +
      '<span class="mode-emoji">' + md.emoji + '<i aria-hidden="true">🔒</i></span>' +
      '<span class="mode-name">' + t('m_' + nx) + '</span>' +
      '<span class="np-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' +
      '<span class="mode-desc">' + have + ' / ' + md.unlock + ' ⭐</span></button>';
  }
  grid.innerHTML = html;
  $$('#modes-grid .mode-card').forEach((card) => {
    card.addEventListener('click', () => {
      ensureAudio(); SFX.tap();
      if (card.dataset.next) {
        const msg = t('next_say', { n: MODES[card.dataset.next].unlock - (P() ? P().stars : 0), m: t('m_' + card.dataset.next) });
        showBubble('🎁', msg); TTS.speak(msg); return;
      }
      startRound(card.dataset.mode);
    });
  });
  fixModesOrphan();
}
/* v2.8.0 (10.3.2): carta sozinha na última linha vira faixa de largura total (13 modos em 6 colunas deixavam
   "Contra o Tempo" com cinco buracos ao lado). Recalcula quando a largura muda. */
function fixModesOrphan() {
  const grid = $('#modes-grid'); if (!grid) return;
  const cards = [...grid.children]; if (!cards.length) return;
  cards.forEach((c) => c.classList.remove('wide'));
  const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  if (cols > 1 && cards.length % cols === 1) cards[cards.length - 1].classList.add('wide');
}
if (typeof window !== 'undefined') window.addEventListener('resize', () => { clearTimeout(fixModesOrphan.t); fixModesOrphan.t = setTimeout(fixModesOrphan, 120); });

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
  renderPlayNow(); refreshChrome();
}
/* v2.8.0 (N3): um toque grande com a sugestão do dia; os outros modos ficam logo abaixo */
function renderPlayNow() {
  const host = $('#screen-home'); if (!host) return;
  let b = $('#play-now');
  if (!b) {
    b = document.createElement('button'); b.id = 'play-now'; b.type = 'button'; b.className = 'play-now';
    const anchor = host.querySelector('.sec-title'); host.insertBefore(b, anchor || host.firstChild);
    b.addEventListener('click', () => {
      ensureAudio(); SFX.tap();
      const r = recommendNext();
      if (r.kind === 'boss') startBoss(); else if (r.kind === 'review') startReview(); else startRound(r.mode);
    });
  }
  const r = recommendNext();
  const emoji = r.kind === 'boss' ? '⚔️' : r.kind === 'review' ? '📚' : MODES[r.mode].emoji;
  const what = r.kind === 'boss' ? t('sp_boss') : r.kind === 'review' ? t('review_btn', { n: r.n }) : t('m_' + r.mode);
  b.innerHTML = '<span class="pn-emoji" aria-hidden="true">' + emoji + '</span><span class="pn-txt"><b>' + t('play_now') + '</b><small>' + escHtml(what) + '</small></span>';
  b.setAttribute('aria-label', t('play_now') + ': ' + what);
}

/* ==================== rodadas ==================== */
/* Nome acessível da cena: conta os objetos em sequência (🍎🍎🍎 → "3 🍎") e
   mantém textos como sinais, letras A/B e números da sequência */
function describeVisual(root, hideTotal) {
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
  /* quando a quantidade é a pergunta (Contar), o leitor de tela não ganha o total:
     ouve só que há um grupo e que cada objeto se conta pelo toque ou pelo teclado */
  if (hideTotal) {
    const e = root.querySelector('.obj');
    return t('sc_count', { e: e ? e.textContent.trim() : '' });
  }
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
  if (mode === 'tempo') { Timer.startGlobal(60); showBubble('⏱️', t('pr_tempo', { name: pName(p) })); }
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
  const scene = q.visual ? describeVisual(vis, q.countQuest) : '';
  /* com objetos tocáveis o contêiner é grupo (role=img esconderia os botões dos filhos) */
  if (scene) { vis.setAttribute('role', vis.querySelector('.tappable') ? 'group' : 'img'); vis.setAttribute('aria-label', scene); vis.removeAttribute('aria-hidden'); }
  else { vis.removeAttribute('role'); vis.removeAttribute('aria-label'); vis.setAttribute('aria-hidden', 'true'); }
  $('#equation').textContent = q.display;
  $('#equation').classList.toggle('small-text', String(q.display).length > 16);
  bindCounting(q);
  const box = $('#answers');
  box.innerHTML = '';
  box.classList.remove('locked');
  box.classList.toggle('n3', q.options.length === 3 && q.kind === 'cmp');
  /* Comparar: a ordem A, B, = fica sempre igual, como as caixas na tela (embaralhar trocava os botões) */
  let opts = q.kind === 'cmp' ? q.options.slice() : shuffle(q.options);
  // v2.4 (A-163): a resposta certa não cai na mesma posição 2× seguidas
  const ansStr = String(q.answer);
  if (opts.length > 1 && q.kind !== 'cmp') {
    for (let tries = 0; tries < 7 && opts.findIndex((o) => String(o) === ansStr) === R.lastAnsPos; tries++) {
      opts = shuffle(q.options);
    }
    R.lastAnsPos = opts.findIndex((o) => String(o) === ansStr);
  }
  if (q.kind === 'cmp') R.lastAnsPos = -1;
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
  const intro = R.bossIntro ? tpick('pr_boss', { name: pName(p) }) + ' ' + q.tts : q.tts;
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
    } else { chip.innerHTML = escHtml(t('q_of', { a: Math.min(R.qIndex + 1, R.total), b: R.total })) + '<span class="lv-part"> · ' + escHtml(t('level') + ' ' + R.level + (G().diffMode === 'auto' ? '' : ' · ' + t('fixed_lbl'))) + '</span>'; txt = null; }
    if (txt != null) chip.textContent = txt;
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
    if (bar) bar.style.transform = 'scaleX(' + (pct / 100) + ')';
    w.setAttribute('aria-valuenow', String(pct));
  },
  stop() { if (this.global) return; this.active = false; if (this.iv) { clearInterval(this.iv); this.iv = null; } },
  hide() { this.global = false; this.stop(); const w = $('#timer-wrap'); if (w) w.classList.add('hidden'); },
  ratio() { return this.totalMs ? clamp(this.leftMs / this.totalMs, 0, 1) : 0; },
};

/* ---------- pontos por rapidez e precisão (v2.2) ----------
   A conta fica em answerReward (engine.js); aqui só o chip e o "+pontos". */
function showPts(pts) {
  R.points += pts;
  const chip = $('#pts-chip');
  if (chip) {
    chip.classList.remove('hidden');
    chip.querySelector('b').textContent = String(R.points);
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
  }
  ptsPop(pts);
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
  const count = (el) => {
    ensureAudio();
    const i = Number(el.dataset.i);
    el.classList.add('counted');
    el.style.setProperty('--cnt', '"' + (i + 1) + '"');
    SFX.tap();
    // no idioma do jogo (antes falava "um, dois, três" também em inglês e espanhol)
    TTS.speak(numWord(LANG, i + 1), { force: true }); // repetir o mesmo número é intencional
  };
  $$('#visual .obj.tappable').forEach((el) => {
    /* teclado e leitor de tela: cada objeto é um botão ("🍎 3"); Enter e Espaço contam */
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', el.textContent.trim() + ' ' + (Number(el.dataset.i) + 1));
    el.addEventListener('click', () => count(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); count(el); }
    });
  });
}

/* ---------- resposta ---------- */
/* v2.4 (A-178): biblioteca cordial contextual — o elogio cita o nome, reconhece
   rapidez, valoriza a persistência e comemora combos, sem spam de festa */
function cordialPraise(firstTry, speedRatio) {
  const name = P() ? pName(P()) : '';
  if (firstTry && speedRatio >= 0.55 && Math.random() < 0.65) return tpick('pr_fast', { name });
  if (R.combo >= 3 && R.combo % 2 === 1) return tpick('pr_combo', { name, n: R.combo });
  if (!firstTry) return tpick('pr_persist', { name });
  return pick(I18N[LANG].praise);
}
function onAnswer(btn) {
  ensureAudio();
  if (R.locked || !R.current) return;
  const v = btn.dataset.v;
  const correct = R.current.kind === 'cmp' ? v === String(R.current.answer) : Number(v) === R.current.answer;
  if (correct) onCorrect(btn, R.misses === 0);
  else onWrong(btn);
}
function onCorrect(btn, firstTry) {
  R.locked = true;
  const mode = currentMode();
  const speedRatio = Timer.ratio();
  const p = P();
  if (firstTry) {
    R.firsts++; R.combo++;
    if (R.kind === 'diag') R.diagOK++;
  }
  const rw = scoreCorrect(p, { firstTry, kind: R.kind, level: R.level, speedRatio, combo: firstTry ? R.combo : 0, mode });
  R.stars += rw.stars + rw.combo;
  if (firstTry) {
    if (R.combo === 3) missionEvent('combo');
    if (rw.combo) toast('🔥 +' + rw.combo + ' ⭐');
    missionEvent('first');
  }
  bumpLvlStat(mode, R.level, true);
  if (R.kind === 'review') { gradeReview(R.due[R.qIndex], true); missionEvent('review'); }
  if (rw.points) showPts(rw.points);
  Timer.stop();
  saveState(); refreshChrome();

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

  const eM = /class="obj[^"]*"[^>]*>([^<]+)</.exec(R.current.visual || '');
  R.history.push({ txt: R.current.display, ok: firstTry, emo: eM ? eM[1].trim() : '', say: R.current.tts || '' });
  R.qIndex++;
  setTimeout(() => {
    if (R.qIndex >= R.total) endRound();
    else { if (R.kind === 'duel') R.duel.turn = R.duel.turn === 1 ? 2 : 1; nextQuestion(); }
  }, 1600);
}
function onWrong(btn) {
  const mode = currentMode();
  R.misses++; R.wrongs++;
  R.combo = 0; // combo é acerto seguido: o erro zera (antes contava os de primeira da rodada)
  const needBreak = scoreWrong(P());
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
      const itPl = (f && ITEMS[f.it]) ? itemWord(ITEMS[f.it], 2) : '';
      const fem = !!(f && ITEMS[f.it] && itemFem(ITEMS[f.it]));
      const art = fem ? (LANG === 'es' ? 'las' : 'as') : (LANG === 'es' ? 'los' : 'os');
      const r = itPl ? tpick('cm_err_item', { name: pName(P()), item: itPl, art }) : tpick('cm_err_plain', { name: pName(P()) });
      showBubble('🙈', r); TTS.speak(r);
    }
  }
  if (needBreak && !overlayOpen()) { P().fatigue = 0; setTimeout(breathingOverlay, 900); }
  saveState();
}
function levelUpOverlay(mode, lv) {
  SFX.fanfare(); confetti(40);
  showOverlay('<div class="ov-emoji">🎉</div><h3>' + t('lvl_up', { n: lv, m: t('m_' + mode) }) + '</h3>' +
    '<button class="big-btn" data-close="1">' + t('ok') + '</button>');
}
function closeOverlay() { hideOverlay(); }

/* ---------- fim de rodada ----------
   As regras ficam em finishRound (engine.js); aqui só comemoração e tela final */
function endRound() {
  if (R.ended) return; // v2.5: à prova de dupla chamada (tempo global + última questão)
  R.ended = true;
  const res = finishRound(P(), {
    kind: R.kind, mode: R.mode, firsts: R.firsts, wrongs: R.wrongs, total: R.total, points: R.points, diagOK: R.diagOK,
  }, { goalRounds: G().goalRounds });
  R.stars += res.goalStars;
  R.newRecord = res.newRecord;
  saveState(true);
  celebrateMissions(res.missions);
  celebrateAch(res.achs);
  if (res.goalStars) setTimeout(() => toast('🎯 ' + t('goal_done')), 800);
  renderEndScreen(res);
  /* v2.5: baú aparece depois da tela final — momento de recompensa */
  if (res.chest) setTimeout(() => openChest(res.chest), 3200);
  renderHome();
}
function endMessage(res) {
  if (R.kind === 'diag') return t('diag_done', { n: res.diagLevel });
  let msg = R.stars === 1 ? t('end_star1') : t('end_stars', { n: R.stars });
  if (R.kind === 'duel') {
    const d = R.duel;
    msg = (d.s1 === d.s2) ? t('duel_tie') : t('duel_win', { av: d.s1 > d.s2 ? d.a1 : d.a2 }) + ' ' + d.a1 + ' ' + d.s1 + ' × ' + d.s2 + ' ' + d.a2;
  }
  if (res.boss) msg += ' ' + t(res.boss);
  /* v2.5: resultado do Contra o Tempo (com recorde próprio) */
  if (res.survive) {
    msg += ' ' + (res.survive.n >= 10 ? t('survive_great', { n: res.survive.n }) : t('survive_end', { n: res.survive.n }));
    if (res.survive.record) msg += ' 🏆 ' + t('survive_record');
  }
  return msg;
}
function renderEndScreen(res) {
  const p = P();
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
  $('#end-msg').textContent = endMessage(res);
  const endPts = $('#end-pts');
  if (endPts) {
    if (R.points > 0) {
      endPts.classList.remove('hidden');
      endPts.innerHTML = t('end_pts', { n: R.points }) +
        (R.newRecord ? ' <span class="rec">🏆 ' + t('end_record') + '</span>' : '');
    } else endPts.classList.add('hidden');
  }
  const hist = $('#end-history');
  // sem respostas (ex.: tempo esgotado antes da 1ª), nada de rótulo órfão
  hist.innerHTML = R.history.length ? '<b>' + t('history') + '</b><div class="hist-list">' +
    R.history.map((h, i) => {
      const body = (h.ok ? '✅' : '🔁') + ' ' + (h.emo ? '<span class="hemo" aria-hidden="true">' + escHtml(h.emo) + '</span> ' : '') + escHtml(h.txt);
      /* v2.8.0 (N2): a conta que ficou difícil volta por voz, sem a criança precisar ler */
      return h.ok || !h.say ? '<span class="hrow ok">' + body + '</span>'
        : '<button type="button" class="hrow no" data-say="' + i + '" aria-label="' + escHtml(t('repeat') + ': ' + h.txt) + '">' + body + ' 🔊</button>';
    }).join('') + '</div>' : '';
  $$('#end-history [data-say]').forEach((b) => b.addEventListener('click', () => { ensureAudio(); TTS.speak(R.history[Number(b.dataset.say)].say, { calm: true }); }));
  // v2.8.0 (N2): quanto falta para o mascote mudar de fase
  let nx = $('#end-next');
  if (!nx) { nx = document.createElement('div'); nx.id = 'end-next'; const anchor = $('#end-msg'); anchor.parentNode.insertBefore(nx, anchor.nextSibling); }
  const mp = mascotProgress(p.stars);
  nx.classList.toggle('hidden', mp.to == null);
  if (mp.to != null) nx.innerHTML = '<span class="np-bar" aria-hidden="true"><i style="width:' + Math.max(4, mp.pct) + '%"></i></span><span>' + (mp.to === 'baby' ? t('end_hatch', { n: mp.need }) : t('to_next', { n: mp.need })) + '</span>';
  // v2.4 (A-144): parabéns personalizado falado — recorde tem fala própria
  if (R.kind === 'normal' || R.kind === 'review') {
    const spoken = R.newRecord ? tpick('pr_record', { name: pName(p), n: R.points }) : tpick('pr_end', { name: pName(p) });
    setTimeout(() => TTS.speak(spoken), 1100); // após a fanfarra
  }
}

/* ---------- conquistas (S14) — lista e regras em engine.js (ACHS) ---------- */
function celebrateAch(ids) {
  ids.forEach((id) => { toast('🏅 ' + t('ach_unlock', { n: t(id) })); SFX.fanfare(); });
}
function checkAch() { celebrateAch(unlockAchievements(P())); }
function renderAch() {
  const p = P();
  $('#ach-grid').innerHTML = ACHS.map((a) => {
    const got = !!p.ach[a.id];
    const hidden = !got && a.sec; // secreta: só revela depois de conquistada
    const desc = hidden ? t('ach_secret') : t('ad' + a.id.slice(1));
    const say = hidden ? desc : t(got ? 'ach_say_on' : 'ach_say_off', { n: t(a.id), d: desc });
    return '<button type="button" class="ach-card' + (got ? ' got' : '') + (hidden ? ' secret' : '') + '" data-say="' + escHtml(say) + '"><span class="ach-emoji" aria-hidden="true">' + (got ? '🏅' : hidden ? '❓' : '🔒') + '</span>' +
      '<b>' + (hidden ? '???' : escHtml(t(a.id))) + '</b><small>' + escHtml(desc) + '</small></button>';
  }).join('');
  $$('#ach-grid [data-say]').forEach((b) => b.addEventListener('click', () => { ensureAudio(); SFX.tap(); TTS.speak(b.dataset.say, { calm: true }); }));
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
/* v2.8.0: item que ainda não dá para comprar vira um caminho (tem/preço + barra), não um botão que nega */
function buyBtn(kind, id, price, name, stars) {
  if (stars >= price) return '<button class="mini-btn" data-buy' + kind + '="' + id + '"' + itemLbl(t('buy') + ' ' + price + '⭐', name) + '>' + t('buy') + ' ' + price + '⭐</button>';
  const miss = price - stars, txt = stars + '/' + price + '⭐';
  return '<span class="far-bar" aria-hidden="true"><i style="width:' + Math.round(100 * stars / price) + '%"></i></span>' +
    '<button class="mini-btn far" data-far="' + miss + '" data-name="' + escHtml(name) + '" aria-disabled="true"' + itemLbl(t('far', { n: miss }), name) + '>' + txt + '</button>';
}
function renderShop() {
  const p = P();
  $('#shop-stars').textContent = String(p.stars);
  const themeRow = $('#shop-themes');
  themeRow.innerHTML = shopSort(SHOP_THEMES, (x) => x.price === 0 || p.owned.themes.includes(x.id), p.stars).map((th) => {
    const owned = th.price === 0 || p.owned.themes.includes(th.id);
    const inUse = (resolvedTheme(G()) === th.id);
    return '<div class="shop-item th-' + th.id + '"><span class="swatch"></span><b>' + t(th.key) + '</b>' +
      (owned
        ? '<button class="mini-btn' + (inUse ? ' using' : '') + '" data-th="' + th.id + '"' + itemLbl(inUse ? t('in_use') : t('equip'), t(th.key)) + '>' + (inUse ? t('in_use') : t('equip')) + '</button>'
        : '<button class="mini-btn prev" data-prev="' + th.id + '"' + itemLbl(t('preview'), t(th.key)) + '>👁️ ' + t('preview') + '</button>' + buyBtn('th', th.id, th.price, t(th.key), p.stars)) +
      '</div>';
  }).join('');
  const hatRow = $('#shop-hats');
  hatRow.innerHTML = shopSort(SHOP_HATS, (x) => x.price === 0 || p.owned.hats.includes(x.id), p.stars).map((h) => {
    const owned = h.price === 0 || p.owned.hats.includes(h.id);
    const inUse = (p.hat || '') === h.id;
    return '<div class="shop-item"><span class="shop-emoji">' + (h.emoji || '🦊') + '</span><b>' + t(h.key) + '</b>' +
      (owned
        ? '<button class="mini-btn' + (inUse ? ' using' : '') + '" data-hat="' + h.id + '"' + itemLbl(inUse ? t('in_use') : t('equip'), t(h.key)) + '>' + (inUse ? t('in_use') : t('equip')) + '</button>'
        : buyBtn('hat', h.id, h.price, t(h.key), p.stars)) +
      '</div>';
  }).join('');
  /* v2.5: mascotes adultas escolhíveis */
  const petRow = $('#shop-pets');
  if (petRow) {
    petRow.innerHTML = shopSort(PETS, (x) => x.price === 0 || p.owned.pets.includes(x.id), p.stars).map((pt) => {
      const owned = pt.price === 0 || p.owned.pets.includes(pt.id);
      const inUse = (p.pet || 'fox') === pt.id;
      const ready = p.stars >= 100;
      return '<div class="shop-item"><span class="shop-emoji">' + pt.emoji + '</span><b>' + t(pt.key) + '</b>' +
        (owned
          ? '<button class="mini-btn' + (inUse ? ' using' : '') + '" data-pet="' + pt.id + '"' + itemLbl(inUse ? t('in_use') : t('equip'), t(pt.key)) + '>' + (inUse ? t('in_use') : t('equip')) + '</button>'
          : buyBtn('pet', pt.id, pt.price, t(pt.key), p.stars)) +
        (!ready && !owned ? '<small class="pet-note">' + t('pet_note') + '</small>' : '') +
        '</div>';
    }).join('');
  }
  const alb = $('#album-grid');
  alb.innerHTML = STICKERS.map((s, i) => '<span class="stk' + (p.stickers.includes(i) ? ' got' : '') + '">' + (p.stickers.includes(i) ? s : '❔') + '</span>').join('');
  $('#album-count').textContent = t('album', { a: p.stickers.length });
  $$('#shop-themes [data-th]').forEach((b) => b.addEventListener('click', () => { G().theme = b.dataset.th; saveState(); applySettings(); renderShop(); SFX.tap(); }));
  $$('#shop-themes [data-far], #shop-hats [data-far], #shop-pets [data-far]').forEach((b) => b.addEventListener('click', () => { ensureAudio(); SFX.tap(); sayFar(Number(b.dataset.far), b.dataset.name); }));
  $$('#shop-themes [data-prev]').forEach((b) => b.addEventListener('click', () => previewTheme(b.dataset.prev)));
  $$('#shop-themes [data-buyth]').forEach((b) => b.addEventListener('click', () => buyTheme(b.dataset.buyth)));
  $$('#shop-hats [data-hat]').forEach((b) => b.addEventListener('click', () => { P().hat = b.dataset.hat; saveState(); renderShop(); renderMascot(); SFX.tap(); }));
  $$('#shop-hats [data-buyhat]').forEach((b) => b.addEventListener('click', () => buyHat(b.dataset.buyhat)));
  $$('#shop-pets [data-pet]').forEach((b) => b.addEventListener('click', () => { P().pet = b.dataset.pet; saveState(); renderShop(); renderMascot(); SFX.tap(); showBubble(PETS.find((x) => x.id === b.dataset.pet).emoji, tpick('greet', { name: pName(P()) })); }));
  $$('#shop-pets [data-buypet]').forEach((b) => b.addEventListener('click', () => buyPet(b.dataset.buypet)));
}
/* "faltam 12 ⭐ para comprar: Boné": no balão e em voz, para quem ainda não lê */
function sayFar(miss, name) {
  const msg = name ? t('far_item', { n: miss, item: name }) : t('far', { n: miss });
  showBubble('🦊', msg); TTS.speak(msg, { calm: true });
}
/* Prévia do tema antes de comprar: vale por 4 s ou até sair da loja; nada é salvo */
let previewTimer = null;
function previewTheme(id) {
  const th = SHOP_THEMES.find((x) => x.id === id); if (!th) return;
  SFX.tap(); clearTimeout(previewTimer);
  applyTheme(Object.assign({}, G(), { theme: id }));
  showBubble('🎨', t('preview_msg', { n: t(th.key) }));
  previewTimer = setTimeout(endPreview, 4000);
}
function endPreview() { clearTimeout(previewTimer); previewTimer = null; applyTheme(G()); }
/* v2.8.0: "Comprado! Desfazer" por 5 s. Devolve as estrelas e o que estava em uso. */
let undoTimer = null;
function offerUndo(fn) {
  closeUndo();
  const box = document.createElement('div'); box.id = 'undo-buy'; box.setAttribute('role', 'group');
  const msg = document.createElement('span'); msg.textContent = t('bought');
  const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = t('undo');
  btn.addEventListener('click', () => { closeUndo(); fn(); SFX.tap(); });
  box.append(msg, btn); document.body.appendChild(box);
  announce(t('bought'));
  undoTimer = setTimeout(closeUndo, 5000);
}
function closeUndo() { clearTimeout(undoTimer); const b = document.getElementById('undo-buy'); if (b) b.remove(); }
function buyTheme(id) {
  const th = SHOP_THEMES.find((x) => x.id === id); const p = P();
  if (!th || p.owned.themes.includes(id)) return;
  if (p.stars < th.price) { sayFar(th.price - p.stars, t(th.key)); return; }
  endPreview();
  const prevTheme = G().theme, firstBuy = !!p.firstBuy;
  p.stars -= th.price; p.owned.themes.push(id); p.firstBuy = true;
  G().theme = id;
  checkAch(); saveState(); applySettings(); renderShop(); renderMascot(); refreshChrome(); SFX.cash(); confetti(20);
  offerUndo(() => { p.stars += th.price; p.owned.themes = p.owned.themes.filter((x) => x !== id); p.firstBuy = firstBuy; G().theme = prevTheme; saveState(); applySettings(); renderShop(); renderMascot(); refreshChrome(); });
}
function buyHat(id) {
  const h = SHOP_HATS.find((x) => x.id === id); const p = P();
  if (!h || p.owned.hats.includes(id)) return;
  if (p.stars < h.price) { sayFar(h.price - p.stars, t(h.key)); return; }
  const prevHat = p.hat, firstBuy = !!p.firstBuy;
  p.stars -= h.price; p.owned.hats.push(id); p.firstBuy = true; p.hat = id;
  checkAch(); saveState(); renderShop(); renderMascot(); refreshChrome(); SFX.cash(); confetti(20);
  offerUndo(() => { p.stars += h.price; p.owned.hats = p.owned.hats.filter((x) => x !== id); p.firstBuy = firstBuy; p.hat = prevHat; saveState(); renderShop(); renderMascot(); refreshChrome(); });
}
/* v2.5: compra de mascote adulta */
function buyPet(id) {
  const pt = PETS.find((x) => x.id === id); const p = P();
  if (!pt || p.owned.pets.includes(id)) return;
  if (p.stars < pt.price) { sayFar(pt.price - p.stars, t(pt.key)); return; }
  p.stars -= pt.price; p.owned.pets.push(id); p.firstBuy = true; p.firstPet = true; p.pet = id;
  checkAch(); saveState(); renderShop(); renderMascot(); refreshChrome();
  showOverlay('<div class="ov-emoji">' + pt.emoji + '</div><h3>' + t('pet_new', { n: t(pt.key) }) + '</h3><button class="big-btn" data-close="1">' + t('ok') + '</button>');
  SFX.cash(); confetti(30);
}
function buySticker() {
  const p = P();
  if (p.stars < 5) { showBubble('🦊', t('far', { n: 5 - p.stars })); return; }
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
  const res = openChestReward(P(), ms);
  const extra = res.sticker >= 0 ? '<p class="ov-sub">' + t('chest_sticker', { s: STICKERS[res.sticker] }) + '</p>' : '';
  celebrateAch(res.achs); saveState(); refreshChrome();
  showOverlay('<div class="ov-emoji chest-pop">🎁</div><h3>' + t('chest_title') + '</h3><p>' + t('chest_msg', { n: ms }) + '</p>' +
    '<p class="chest-reward">⭐ +' + res.stars + '</p>' + extra +
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
  const data = JSON.stringify(shareableDB(DB), null, 2);
  saveTextFile('conta-comigo-backup-' + fmtDate() + '.json', data, t('backup_share')).then((ok) => {
    if (!ok) return; // cancelado na folha de compartilhar (app) ou falha: nada de "pronto"
    G().lastBackupAt = Date.now();
    saveState();
    toast('💾 ' + t(FILE_VIA_SHARE ? 'backup_saved' : 'backup_done'));
    SFX.cash();
  });
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
  wrap.innerHTML = '<b id="pop-who">' + t('who') + '</b>' + DB.profiles.map((pf) => {
    const cur = pf.id === DB.activeId;
    return '<button class="prof-row' + (cur ? ' cur' : '') + '" data-pid="' + escHtml(pf.id) + '"' + (cur ? ' aria-current="true"' : '') + '>' +
      '<span class="pf-av">' + escHtml(pf.avatar) + '</span><span class="pf-name">' + escHtml(pName(pf)) + '</span>' +
      (cur ? '<span class="pf-cur" aria-hidden="true">✓</span>' : '') +
      '<span class="pf-st">⭐ ' + pf.stars + ' · ⚡ ' + (pf.points || 0) + '</span></button>';
  }).join('') +
    (DB.profiles.length < 4
      ? '<div class="prof-add"><input id="new-prof-name" maxlength="14" placeholder="' + t('name_ph') + '" aria-label="' + t('name_ph') + '">' +
        '<div class="av-row" role="group" aria-label="' + t('a_avatar') + '">' + AVATARS.map((a, i) => '<button class="av' + (i === 0 ? ' sel' : '') + '" aria-pressed="' + (i === 0) + '" data-av="' + a + '">' + a + '</button>').join('') + '</div>' +
        '<button class="mini-btn" id="btn-add-prof">' + t('add_profile') + '</button></div>'
      : '<small class="max-note">' + t('max4') + '</small>');
  $$('#pop-profile .prof-row').forEach((b) => b.addEventListener('click', () => {
    DB.activeId = b.dataset.pid; saveState(true);
    closePopovers(); renderHome(); applyLang(); toast(t('switch_to', { n: pName(P()) })); SFX.tap();
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
  else location.href = url; // PWA/apps/Electron: mesma janela; o “voltar” das opções retorna ao jogo
}

/* ==================== inicialização ==================== */
function bindStatic() {
  $('#btn-home').addEventListener('click', () => { TTS.stop(); SFX.tap(); renderHome(); show('home'); });
  $('#btn-mute').addEventListener('click', () => {
    G().mute = !G().mute; applySettings(); saveState();
    if (G().mute) TTS.stop(); else { ensureAudio(); SFX.tap(); }
  });
  $('#btn-full').addEventListener('click', toggleFullscreen);
  // app nativo (já é tela cheia) ou navegador sem a API (Safari do iPhone): o botão não faria nada
  if (IN_NATIVE_APP || (!HAS_EXT && !document.documentElement.requestFullscreen)) $('#btn-full').classList.add('hidden');
  $('#btn-gear').addEventListener('click', openOptions);
  $('#btn-profile').addEventListener('click', () => { SFX.tap(); toggleProfilePop(); });
  $('#btn-again').addEventListener('click', () => { ensureAudio(); SFX.tap(); R.kind === 'duel' ? startDuelSetup() : startRound(R.mode || 'somar'); });
  $('#btn-menu').addEventListener('click', () => { TTS.stop(); SFX.tap(); renderHome(); show('home'); });
  $('#btn-repeat').addEventListener('click', () => { ensureAudio(); SFX.tap(); if (R.current) TTS.speak(R.current.tts, { calm: true }); });
  $('#btn-shop').addEventListener('click', () => { SFX.tap(); renderShop(); show('shop'); });
  $('#btn-ach').addEventListener('click', () => { SFX.tap(); renderAch(); show('ach'); });
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
  onNativeBack(onBackButton);
}

/* ---------- botão Voltar do Android (app) ----------
   Fecha o balão aberto ou volta da tela para o início, como o botão da própria
   tela; no início, o engine minimiza o app. Com um aviso aberto não faz nada:
   o aviso tem os próprios botões, e a pausa de descanso não pode ser pulada. */
const BACK_BUTTONS = { game: '#btn-home', end: '#btn-menu', shop: '#btn-home', ach: '#btn-home', duel: '#duel-back' };
function onBackButton() {
  if (overlayOpen()) return true;
  if ($$('.popover').some((p) => !p.classList.contains('hidden'))) { closePopovers(); return true; }
  const scr = $('.screen.active');
  const sel = scr && BACK_BUTTONS[scr.id.replace('screen-', '')];
  const btn = sel && $(sel);
  if (btn) { btn.click(); return true; }
  return false;
}

/* ---------- teclado (S20) ---------- */
function onKey(e) {
  if (overlayOpen()) {
    if (e.key === 'Tab') { trapTab(e); return; }
    // botões e campos já tratam o próprio Enter — sem isso, Enter em "Configurar
    // depois" clicava também no primeiro botão do modal
    const tag = e.target && e.target.tagName;
    if (e.key === 'Enter' && tag !== 'BUTTON' && tag !== 'INPUT') { const b = $('#overlay-card .big-btn:not([disabled])'); if (b) b.click(); }
    /* Esc fecha os avisos de um botão só (nível novo, figurinha, mascote); senha e apagar ficam como estão */
    if (e.key === 'Escape') { const cl = $$('#overlay-card [data-close]'); if (cl.length === 1 && $$('#overlay-card button').length === 1) cl[0].click(); }
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

/* ==================== canais oficiais, rodapé e cookies (v2.7) ====================
   Criança não sai do jogo sozinha: todo link externo e toda escolha que LIGA algo
   passam antes por uma conferência para adultos. Recusar é sempre imediato. */
function openExternal(url) {
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); a.remove();
}
function adultCheck(onOk) {
  const a = rand(12, 19), b = rand(13, 19), want = String(a * b);
  showOverlay('<div class="ov-emoji">🔒</div><h3>' + t('ad_title') + '</h3><p>' + t('ad_q', { q: a + ' × ' + b }) + '</p>' +
    '<input id="ad-in" class="ad-input" type="text" inputmode="numeric" autocomplete="off" aria-label="' + t('ad_label') + '">' +
    '<div class="gate-err" id="ad-err" role="alert"></div>' +
    '<div class="ov-actions"><button class="big-btn" id="ad-ok">' + t('ok') + '</button>' +
    '<button class="big-btn alt" data-close="1">' + t('ck_cancel') + '</button></div>');
  const go = () => {
    if ($('#ad-in').value.trim() === want) { hideOverlay(); onOk(); }
    else { $('#ad-err').textContent = t('ad_wrong'); $('#ad-in').select(); }
  };
  $('#ad-ok').addEventListener('click', go);
  $('#ad-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
}
function ckSaved(stats, track) {
  Consent.set(stats, track); saveState(true);
  toast(t('ck_saved'));
}
function openConsentPrefs() {
  const row = (id, title, desc, on, locked) =>
    '<div class="ck-row"><div class="ck-txt"><b>' + title + '</b><span>' + desc + '</span></div>' +
    '<input type="checkbox" class="ck-switch" id="' + id + '" aria-label="' + title + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + '></div>';
  showOverlay('<h3>' + t('ck_title') + '</h3><p class="ck-note">' + t('ck_note') + '</p>' +
    row('ck-ess', t('ck_ess'), t('ck_ess_d'), true, true) +
    row('ck-stats', t('ck_stats'), t('ck_stats_d'), Consent.allows('stats'), false) +
    row('ck-track', t('ck_track'), t('ck_track_d'), Consent.allows('track'), false) +
    '<div class="ov-actions"><button class="big-btn" id="ck-save">' + t('ck_save') + '</button>' +
    '<button class="big-btn alt" data-close="1">' + t('ck_cancel') + '</button></div>');
  $('#ck-save').addEventListener('click', () => {
    const st = $('#ck-stats').checked, tr = $('#ck-track').checked;
    if (!st && !tr) { hideOverlay(); ckSaved(false, false); return; }
    hideOverlay(); adultCheck(() => ckSaved(st, tr));
  });
}
function bindLegal() {
  $$('.legal-link[data-legal]').forEach((btn) => btn.addEventListener('click', () => {
    SFX.tap(); adultCheck(() => openExternal(LEGAL[btn.dataset.legal]));
  }));
  const c = $('#btn-consent');
  if (c) c.addEventListener('click', () => { SFX.tap(); openConsentPrefs(); });
}

/* v2.8.0: som e imagem no mesmo instante. O toque soa quando o dedo desce (o botão afunda nesse frame);
   o SFX.tap() do click, logo depois, é descartado para não soar duas vezes. As respostas têm som próprio. */
let tapDownAt = 0;
(function () {
  const raw = SFX.tap;
  SFX.tap = function () { if (tapDownAt && Date.now() - tapDownAt < 1000) { tapDownAt = 0; return; } return raw.apply(this, arguments); };
  document.addEventListener('pointerdown', (e) => {
    const b = e.target && e.target.closest ? e.target.closest('button, .mode-card, a.mini-btn') : null;
    if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true' || b.closest('#answers') || b.classList.contains('ans')) return;
    ensureAudio(); tapDownAt = 0; raw.call(SFX); tapDownAt = Date.now();
  }, true);
})();

/* ---------- boas-vindas (N1, v2.8.0) ----------
   Primeira abertura: avatar, nome falado e a primeira conta, num cartão só. "Agora não" fecha até a próxima abertura;
   some de vez quando a criança joga uma rodada ou o nome deixa de ser o padrão. */
function needsWelcome() {
  const p = P();
  return !!p && DB.profiles.length === 1 && p.rounds === 0 && p.name === DEFAULT_NAME;
}
function showWelcome() {
  const p = P(); if (!p) return;
  let av = p.avatar || AVATARS[0];
  showOverlay('<div class="ov-emoji" aria-hidden="true">👋</div><h3>' + t('wl_title') + '</h3>' +
    '<div class="av-row" role="group" aria-label="' + escHtml(t('a_avatar')) + '">' + AVATARS.map((a) => '<button type="button" class="av' + (a === av ? ' sel' : '') + '" aria-pressed="' + (a === av) + '" data-wav="' + a + '">' + a + '</button>').join('') + '</div>' +
    '<label class="wl-lbl" for="wl-name">' + t('wl_name') + '</label>' +
    '<input id="wl-name" class="ad-input" type="text" maxlength="20" autocomplete="off">' +
    '<div class="ov-actions"><button type="button" class="big-btn" id="wl-go">' + t('wl_go') + '</button>' +
    '<button type="button" class="big-btn alt" id="wl-hear">🔊 ' + t('wl_hear') + '</button>' +
    '<button type="button" class="ck-btn ck-link" id="wl-skip">' + t('wl_skip') + '</button></div>');
  const nm = () => cleanName(($('#wl-name').value || '').trim());
  $$('#overlay-card [data-wav]').forEach((b) => b.addEventListener('click', () => { av = b.dataset.wav; markPicked($$('#overlay-card [data-wav]'), b); }));
  $('#wl-hear').addEventListener('click', () => { ensureAudio(); const n = nm(); TTS.speak(t('wl_hello', { name: n || pName(P()) })); });
  $('#wl-skip').addEventListener('click', () => { hideOverlay(); });
  $('#wl-go').addEventListener('click', () => {
    ensureAudio(); const n = nm(); const pr = P();
    pr.avatar = av; if (n) pr.name = n;
    saveState(true); hideOverlay(); renderHome(); refreshChrome();
    if (n) TTS.speak(t('wl_hello', { name: n }));
    startRound('contar');
  });
}

/* ---------- boot ---------- */
async function boot() {
  await initDB();
  TTS.init();
  applyLang();
  applySettings();
  bindStatic();
  bindLegal();
  ensureMissions();
  renderHome();
  show('home');
  // v2.8.0: o aviso de cookies não aparece mais para a criança; ele fica no painel (options.js)
  // v2.4.1: selo de versão visível no topo — confirmação instantânea da build
  const vb = $('#cc-ver');
  if (vb) {
    let vv = '';
    try { if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) vv = chrome.runtime.getManifest().version; } catch (e) { /* sem extensão */ }
    if (!vv) { const mt = document.querySelector('meta[name="cc-version"]'); if (mt) vv = mt.content; }
    vb.textContent = 'v' + (vv || (window.ccVersion ? window.ccVersion() : '2.8.0'));
  }
  // v2.4 (A-198): saudação cordial com o nome — o 1º toque libera o áudio no navegador
  const greet = () => {
    const home = $('#screen-home');
    // não atropela um balão que o próprio toque abriu (ex.: próximo prêmio)
    if (!home || !home.classList.contains('active') || overlayOpen() || !$('#bubble').classList.contains('hidden')) return;
    const line = tpick('greet', { name: pName(P()) });
    showBubble(mascotStage().emoji, line);
    TTS.speak(line);
  };
  document.addEventListener('pointerdown', () => setTimeout(greet, 350), { once: true });
  if (HAS_EXT && typeof chrome !== 'undefined' && chrome.tabs) {
    try { chrome.runtime.sendMessage('cc-page-ready', () => void chrome.runtime.lastError); } catch (e) { /* ignora */ }
  }
  // ADR-001: outra página gravou o progresso (painel, nova aba, outra aba da PWA)
  onExternalSave(() => { externalPending = true; adoptIfSafe(); });
  // S32: adotar mudanças remotas
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((ch, area) => {
        if (area !== 'sync' || !G().sync || !Object.keys(ch).some((k) => k === 'cc_state_sync' || k.indexOf('cc_sync_') === 0)) return;
        loadSyncDB().then((remote) => {
          if (remote && remote.updatedAt > DB.updatedAt + 500) { remotePending = remote; adoptIfSafe(); }
        });
      });
    }
  } catch (e) { /* ignora */ }
}
window.CC = { closeOverlay, renderHome, refreshChrome };
boot();
