'use strict';
/* ==================== Conta Comigo — página de opções (S31) ====================
   Portão parental S25 (v2.3: senha dos responsáveis + lembrete de segurança)
   Painel S26/S09 · Perfis S27 · Exportar/Importar S29 · Segurança (alterar senha) */

let gateTriesTimer = null;

/* ---------- portão parental (v2.3: senha + lembrete + bloqueio progressivo) ---------- */
function gateHasPass() { return !!G().passHash && !!G().passSalt; }
function gateLockedNow() { return Date.now() < (G().passLockUntil || 0); }
function gateLockLeft() { return Math.max(1, Math.ceil(((G().passLockUntil || 0) - Date.now()) / 1000)); }

function toastOpt(msg) {
  const el = $('#toast');
  el.textContent = msg; el.classList.remove('hidden', 'show'); void el.offsetWidth; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

function showGate() {
  const has = gateHasPass();
  $('#gate-create').classList.toggle('hidden', has);
  $('#gate-enter').classList.toggle('hidden', !has);
  $('#gate').classList.remove('hidden');
  $('#opt-content').classList.add('hidden');
  $('#ge-pwd').placeholder = t('gate_pwd_ph');
  $('#gc-hint').placeholder = t('ob_hint_ph');
  $('#ge-reset-in').placeholder = t('gate_reset_ph');
  if (has) gateEnterIdle();
}
function gateEnterIdle() {
  clearInterval(gateTriesTimer);
  const tries = G().passTries || 0;
  // recuperação sempre acessível a partir da 2ª tentativa (mesmo durante bloqueio)
  $('#ge-forgot-box').classList.toggle('hidden', tries < 2);
  if (tries >= 2) $('#ge-hint').textContent = G().passHint || '—';
  $('#ge-reset-box').classList.toggle('hidden', tries < 5);
  $('#ge-reset-form').classList.add('hidden');
  const go = $('#ge-go');
  if (gateLockedNow()) {
    go.disabled = true;
    $('#ge-err').textContent = t('gate_locked', { n: gateLockLeft() });
    gateTriesTimer = setInterval(() => {
      if (!gateLockedNow()) gateEnterIdle();
      else $('#ge-err').textContent = t('gate_locked', { n: gateLockLeft() });
    }, 1000);
  } else {
    go.disabled = false;
    $('#ge-err').textContent = '';
  }
}
function registerFail() {
  const g = G();
  g.passTries = (g.passTries || 0) + 1;
  const waits = [0, 0, 10, 30, 60, 120]; // segundos de espera progressivos
  const w = waits[Math.min(g.passTries, waits.length - 1)];
  if (w > 0) g.passLockUntil = Date.now() + w * 1000;
  saveState(true);
}
async function tryGate() {
  if (gateLockedNow()) { gateEnterIdle(); return; }
  const v = $('#ge-pwd').value || '';
  const ok = await PASS.verify(v, G().passSalt, G().passHash);
  if (ok) {
    const g = G();
    g.passTries = 0; g.passLockUntil = 0;
    saveState(true);
    showContent();
  } else {
    registerFail();
    SFX.wrong();
    $('#ge-pwd').value = '';
    gateEnterIdle(); // mostra/bloqueia conforme tentativas
    if (!gateLockedNow()) $('#ge-err').textContent = t('gate_wrong_pwd');
  }
}
function forgotPwd() {
  $('#ge-forgot-box').classList.remove('hidden');
  $('#ge-hint').textContent = G().passHint || '—';
}
function showContent() {
  $('#gate').classList.add('hidden');
  $('#opt-content').classList.remove('hidden');
  renderOptions();
}
async function tryCreateGate() {
  const a = $('#gc-pwd').value || '';
  const b = $('#gc-pwd2').value || '';
  const hint = ($('#gc-hint').value || '').trim();
  if (a.length < 4) { $('#gc-err').textContent = t('sec_short'); SFX.wrong(); return; }
  if (a !== b) { $('#gc-err').textContent = t('sec_mismatch'); SFX.wrong(); return; }
  if (!hint) { $('#gc-err').textContent = t('sec_need_hint'); SFX.wrong(); return; }
  await savePassword(a, hint);
  $('#gc-pwd').value = ''; $('#gc-pwd2').value = ''; $('#gc-hint').value = ''; $('#gc-err').textContent = '';
  toastOpt('🔒 ' + t('sec_saved'));
  showContent();
}
async function savePassword(pw, hint) {
  const g = G();
  g.passSalt = PASS.salt();
  g.passHash = await PASS.hash(pw, g.passSalt);
  g.passHint = hint;
  g.passSetAt = Date.now();
  g.passTries = 0; g.passLockUntil = 0; g.passOnboardDone = true;
  saveState(true);
}
function tryResetGate() {
  const word = t('gate_reset_word');
  if (($('#ge-reset-in').value || '').trim().toUpperCase() !== word) {
    $('#ge-reset-err').textContent = t('gate_reset_ph');
    SFX.wrong();
    $('#ge-reset-in').value = '';
    return;
  }
  if (!confirm(t('confirm_reset'))) return;
  try { localStorage.removeItem('cc_state'); } catch (e) { /* ignora */ }
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) { chrome.storage.local.clear(); chrome.storage.sync.clear(); }
  } catch (e) { /* ignora */ }
  location.reload();
}

/* ---------- cartão Segurança (alterar senha) ---------- */
function renderSec() {
  const g = G();
  const on = gateHasPass();
  $('#sec-status').textContent = on ? t('sec_on', { d: g.passSetAt ? new Date(g.passSetAt).toLocaleDateString(TTS_LANG[g.lang] || 'pt-BR') : '—' }) : t('sec_off');
  $('#btn-sec-change').classList.toggle('hidden', !on);
  $('#sec-form').classList.add('hidden');
  $('#sec-hint').placeholder = t('ob_hint_ph');
}
async function tryChangePwd() {
  const cur = $('#sec-cur').value || '';
  const a = $('#sec-new').value || '';
  const b = $('#sec-new2').value || '';
  const hint = ($('#sec-hint').value || '').trim();
  if (!(await PASS.verify(cur, G().passSalt, G().passHash))) { $('#sec-err').textContent = t('sec_bad_cur'); SFX.wrong(); return; }
  if (a.length < 4) { $('#sec-err').textContent = t('sec_short'); return; }
  if (a !== b) { $('#sec-err').textContent = t('sec_mismatch'); return; }
  if (!hint) { $('#sec-err').textContent = t('sec_need_hint'); return; }
  await savePassword(a, hint);
  ['sec-cur', 'sec-new', 'sec-new2', 'sec-hint'].forEach((id) => { $('#' + id).value = ''; });
  $('#sec-err').textContent = '';
  renderSec();
  toastOpt('🔒 ' + t('sec_saved'));
}

/* ---------- preencher controles ---------- */
function renderOptions() {
  const g = G(), p = P();
  LANG = g.lang || 'pt';
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.title = t('appName') + ' — ' + t('gate_title');
  document.documentElement.lang = TTS_LANG[g.lang] || 'pt-BR';
  document.body.dataset.theme = g.theme || 'classico';
  document.body.classList.toggle('hc', !!g.hc);
  document.body.classList.toggle('dys', !!g.dys);

  // seletor de jogador do painel
  const dp = $('#dash-prof');
  dp.innerHTML = DB.profiles.map((pf) => '<option value="' + pf.id + '"' + (pf.id === DB.activeId ? ' selected' : '') + '>' + pf.avatar + ' ' + pf.name + '</option>').join('');
  renderDash();
  renderProfList();

  $('#set-diff').value = String(g.diffMode);
  $('#set-unlock').checked = !!g.unlockAll;
  $('#set-newtab').checked = !!g.newtabOn;
  $('#set-timer').checked = g.timer !== false; // v2.2: ligado por padrão
  $('#set-lang').value = g.lang || 'pt';
  $('#set-mute').checked = !!g.mute;
  $('#set-vol').value = String(Math.round((g.volume != null ? g.volume : 0.9) * 100));
  $('#set-rate').value = String(Math.round((g.vRate || 0.95) * 100));
  $('#set-pitch').value = String(Math.round((g.vPitch || 1.15) * 100));
  fillVoices();
  $('#set-theme').value = g.theme || 'classico';
  $('#set-theme').options[0].text = '☀️ ' + t('th_classico');
  $('#set-theme').options[1].text = '🌙 ' + t('th_espaco');
  $('#set-theme').options[2].text = '🌸 ' + t('th_jardim');
  $('#set-theme').options[3].text = '🌈 ' + t('th_arcoiris');
  $('#set-hc').checked = !!g.hc;
  $('#set-dys').checked = !!g.dys;
  $('#set-calmo').value = g.calmo == null ? 'auto' : (g.calmo ? 'on' : 'off');
  $('#set-calmo').options[0].text = '🖥️ auto';
  $('#set-calmo').options[1].text = '🟢 ' + t('on');
  $('#set-calmo').options[2].text = '⚪ ' + t('off');
  $('#set-goal').value = String(g.goalRounds != null ? g.goalRounds : 3);
  $('#set-goal').options[0].text = t('goal_opt');
  $('#set-limit').value = String(g.sessionLimit != null ? g.sessionLimit : 15);
  $('#set-limit').options[0].text = t('no_limit');
  $('#set-sync').checked = !!g.sync;
  renderSec();
  $('#imp-area').placeholder = t('imp_ph');
  $('#opt-version').textContent = t('version') + ': 2.3.0';
}

/* ---------- painel (S26 + S09) ---------- */
function renderDash() {
  const p = DB.profiles.find((x) => x.id === $('#dash-prof').value) || P();
  const totalQ = p.rights + p.wrongs;
  const acc = totalQ ? Math.round((100 * p.rights) / totalQ) : 0;
  const stage = p.stars >= 100 ? '🦊' : p.stars >= 30 ? '🐣' : '🥚';
  $('#stat-grid').innerHTML = [
    ['⭐', p.stars, t('d_stars')], ['⚡', p.points || 0, t('d_points')], ['🔥', p.streak || 0, t('d_streak')],
    ['🎮', p.rounds, t('d_rounds')], ['⏱️', Math.round(p.playSec / 60) + ' min', t('d_time')],
    ['✅', acc + '%', t('d_acc')], [stage, Object.keys(p.played).length + '/12', t('m_mistar')],
  ].map((s) => '<div class="stat"><b>' + s[1] + '</b><span>' + s[0] + ' ' + s[2] + '</span></div>').join('');

  // mapa de domínio S09
  $('#map-rows').innerHTML = Object.keys(MODES).map((m) => {
    const lv = p.lvl[m] || {};
    let r = 0, w = 0;
    Object.keys(lv).forEach((k) => { r += lv[k].r; w += lv[k].w; });
    const accM = (r + w) ? Math.round(100 * r / (r + w)) : 0;
    const dots = [1, 2, 3, 4, 5].map((l) => {
      const b = lv[l];
      if (!b || (b.r + b.w) === 0) return '<span class="lv-dot">' + l + '</span>';
      const a = b.r / (b.r + b.w);
      return '<span class="lv-dot ' + (a >= 0.8 ? 'g' : a >= 0.5 ? 'y' : 'r') + '">' + l + '</span>';
    }).join('');
    return '<div class="map-row"><div class="map-mode">' + MODES[m].emoji + ' ' + t('m_' + m) + '</div>' +
      '<div class="map-bar"><i style="width:' + accM + '%"></i></div><div class="map-dots">' + dots + '</div></div>';
  }).join('');

  // semanas
  const weeks = p.weeks.slice(-5);
  const maxR = Math.max(1, ...weeks.map((w) => w.rounds));
  $('#week-bars').innerHTML = weeks.length
    ? weeks.map((w) => '<div class="week-bar"><span>' + w.rounds + '</span><i style="height:' + Math.max(6, Math.round(70 * w.rounds / maxR)) + 'px"></i><span>' + w.k.replace(/^\d{4}-/, '') + '</span></div>').join('')
    : '<span class="opt-note">—</span>';
}

/* ---------- perfis (S27) ---------- */
function renderProfList() {
  $('#prof-list').innerHTML = DB.profiles.map((pf) => {
    const cur = pf.id === DB.activeId;
    return '<div class="prof-line" data-pid="' + pf.id + '">' +
      '<span style="font-size:24px">' + pf.avatar + '</span>' +
      '<input value="' + pf.name.replace(/"/g, '&quot;') + '" data-name="' + pf.id + '">' +
      '<div class="av-row">' + AVATARS.map((a) => '<button class="av' + (a === pf.avatar ? ' sel' : '') + '" data-setav="' + pf.id + '">' + a + '</button>').join('') + '</div>' +
      '<button class="mini-btn' + (cur ? ' using' : '') + '" data-use="' + pf.id + '">' + (cur ? t('in_use') : t('equip')) + '</button>' +
      (DB.profiles.length > 1 ? '<button class="mini-btn danger-btn" data-del="' + pf.id + '">✕</button>' : '') +
      '</div>';
  }).join('');
  $$('#prof-list [data-name]').forEach((inp) => inp.addEventListener('change', () => {
    const pf = DB.profiles.find((x) => x.id === inp.dataset.name);
    if (pf) { pf.name = inp.value.trim() || pf.name; saveState(true); toastOpt('✅'); }
  }));
  $$('#prof-list [data-setav]').forEach((b) => b.addEventListener('click', () => {
    const pf = DB.profiles.find((x) => x.id === b.dataset.setav);
    if (pf) { pf.avatar = b.dataset.setav; saveState(true); renderProfList(); }
  }));
  $$('#prof-list [data-use]').forEach((b) => b.addEventListener('click', () => {
    DB.activeId = b.dataset.use; saveState(true); renderOptions();
  }));
  $$('#prof-list [data-del]').forEach((b) => b.addEventListener('click', () => {
    if (!confirm(t('confirm_reset'))) return;
    DB.profiles = DB.profiles.filter((x) => x.id !== b.dataset.del);
    if (!DB.profiles.find((x) => x.id === DB.activeId)) DB.activeId = DB.profiles[0].id;
    saveState(true); renderOptions();
  }));
}

/* ---------- vozes (S22) ---------- */
function fillVoices() {
  const g = G();
  const want = (TTS_LANG[g.lang] || 'pt-BR').slice(0, 2);
  const vs = TTS.voices.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().indexOf(want) === 0);
  const sel = $('#set-voice');
  sel.innerHTML = '<option value="">—</option>' + vs.map((v) => '<option value="' + v.voiceURI + '"' + (g.vVoice === v.voiceURI ? ' selected' : '') + '>' + v.name + '</option>').join('');
}

/* ---------- exportar / importar (S29) ---------- */
function doExport() {
  saveState(true);
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'conta-comigo-progresso.json';
  document.body.appendChild(a); a.click(); a.remove();
}
function doImport(text) {
  const d = parseDB(text);
  if (!d) { toastOpt('⚠️ ' + t('imp_bad')); return; }
  DB = d;
  if (!DB.profiles.length) DB.profiles = [newProfile('p1', 'Jogador', '🦊')];
  if (!DB.profiles.find((x) => x.id === DB.activeId)) DB.activeId = DB.profiles[0].id;
  DB.settings = Object.assign({}, DEFAULT_SETTINGS, DB.settings || {});
  saveState(true);
  toastOpt('✅ ' + t('imp_ok'));
  renderOptions();
}

/* ---------- eventos ---------- */
function bindOptions() {
  $('#opt-back').addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('game.html') : 'game.html';
  });
  // portão (v2.3)
  $('#ge-go').addEventListener('click', tryGate);
  $('#ge-pwd').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryGate(); });
  $('#ge-forgot').addEventListener('click', forgotPwd);
  $('#ge-reset-show').addEventListener('click', () => { $('#ge-reset-form').classList.remove('hidden'); });
  $('#ge-reset-go').addEventListener('click', tryResetGate);
  $('#gc-go').addEventListener('click', tryCreateGate);
  [['#gc-pwd', '#gc-go'], ['#gc-pwd2', '#gc-go'], ['#gc-hint', '#gc-go']].forEach(([inp, btn]) => {
    $(inp).addEventListener('keydown', (e) => { if (e.key === 'Enter') $(btn).click(); });
  });
  [['#ge-eye', '#ge-pwd'], ['#gc-eye1', '#gc-pwd'], ['#gc-eye2', '#gc-pwd2']].forEach(([b, inp]) => {
    $(b).addEventListener('click', () => { const i = $(inp); i.type = i.type === 'password' ? 'text' : 'password'; });
  });
  // segurança
  $('#btn-sec-change').addEventListener('click', () => { $('#sec-form').classList.toggle('hidden'); $('#sec-err').textContent = ''; });
  $('#btn-sec-save').addEventListener('click', tryChangePwd);
  $('#dash-prof').addEventListener('change', renderDash);
  $('#btn-new-prof').addEventListener('click', () => {
    if (DB.profiles.length >= 4) { toastOpt(t('max4')); return; }
    DB.profiles.push(newProfile(null, 'Jogador ' + (DB.profiles.length + 1), pick(AVATARS)));
    saveState(true); renderOptions();
  });

  const set = (fn) => { saveState(true); };
  $('#set-diff').addEventListener('change', (e) => { G().diffMode = e.target.value === 'auto' ? 'auto' : Number(e.target.value); set(); });
  $('#set-unlock').addEventListener('change', (e) => { G().unlockAll = e.target.checked; set(); });
  $('#set-newtab').addEventListener('change', (e) => { G().newtabOn = e.target.checked; set(); });
  $('#set-timer').addEventListener('change', (e) => { G().timer = e.target.checked; set(); });
  $('#set-lang').addEventListener('change', (e) => { G().lang = e.target.value; G().vVoice = ''; set(); renderOptions(); });
  $('#set-mute').addEventListener('change', (e) => { G().mute = e.target.checked; set(); });
  $('#set-vol').addEventListener('input', (e) => { G().volume = Number(e.target.value) / 100; set(); });
  $('#set-rate').addEventListener('input', (e) => { G().vRate = Number(e.target.value) / 100; set(); });
  $('#set-pitch').addEventListener('input', (e) => { G().vPitch = Number(e.target.value) / 100; set(); });
  $('#set-voice').addEventListener('change', (e) => { G().vVoice = e.target.value; set(); });
  $('#set-theme').addEventListener('change', (e) => { G().theme = e.target.value; set(); renderOptions(); });
  $('#set-hc').addEventListener('change', (e) => { G().hc = e.target.checked; set(); renderOptions(); });
  $('#set-dys').addEventListener('change', (e) => { G().dys = e.target.checked; set(); renderOptions(); });
  $('#set-calmo').addEventListener('change', (e) => { G().calmo = e.target.value === 'auto' ? null : e.target.value === 'on'; set(); });
  $('#set-goal').addEventListener('change', (e) => { G().goalRounds = Number(e.target.value); set(); });
  $('#set-limit').addEventListener('change', (e) => { G().sessionLimit = Number(e.target.value); set(); });
  $('#set-sync').addEventListener('change', (e) => { G().sync = e.target.checked; set(); if (G().sync) saveState(true); });

  $('#btn-export').addEventListener('click', doExport);
  $('#btn-copy').addEventListener('click', async () => {
    saveState(true);
    const txt = JSON.stringify(DB);
    try { await navigator.clipboard.writeText(txt); toastOpt('✅ ' + t('copied')); }
    catch (e) { $('#imp-area').value = txt; $('#imp-area').select(); document.execCommand('copy'); toastOpt('✅ ' + t('copied')); }
  });
  $('#btn-import').addEventListener('click', () => doImport($('#imp-area').value));
  $('#imp-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => doImport(String(rd.result));
    rd.readAsText(f);
  });
  $('#btn-reset-p').addEventListener('click', () => {
    if (!confirm(t('confirm_reset'))) return;
    const cur = P();
    const fresh = newProfile(cur.id, cur.name, cur.avatar);
    DB.profiles = DB.profiles.map((x) => (x.id === cur.id ? fresh : x));
    saveState(true); renderOptions(); toastOpt('🧹');
  });
  $('#btn-reset-all').addEventListener('click', () => {
    if (!confirm(t('confirm_reset'))) return;
    try { localStorage.removeItem('cc_state'); } catch (e) { /* ignora */ }
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) { chrome.storage.local.clear(); chrome.storage.sync.clear(); }
    } catch (e) { /* ignora */ }
    location.reload();
  });
}

async function bootOptions() {
  await initDB();
  TTS.init();
  TTS.onVoices = fillVoices;
  bindOptions();
  showGate();
  renderOptions();
}
window.CC = {};
bootOptions();
