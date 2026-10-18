'use strict';
/* ==================== Conta Comigo v2.0 — página de opções (S31) ====================
   Portão parental S25 · Painel S26/S09 · Perfis S27 · Exportar/Importar S29 */

let gateOK = false;
let gateAnswer = 0;

function toastOpt(msg) {
  const el = $('#toast');
  el.textContent = msg; el.classList.remove('hidden', 'show'); void el.offsetWidth; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2400);
}

/* ---------- portão parental (S25) ---------- */
function newGate() {
  const a = rand(6, 9), b = rand(4, 9);
  gateAnswer = a * b;
  $('#gate-q').textContent = a + ' × ' + b;
  $('#gate-in').value = '';
  $('#gate-err').textContent = '';
}
function tryGate() {
  const v = Number($('#gate-in').value);
  if (v === gateAnswer) {
    gateOK = true;
    $('#gate').classList.add('hidden');
    $('#opt-content').classList.remove('hidden');
    renderOptions();
  } else {
    newGate();
    $('#gate-err').textContent = t('gate_wrong');
    SFX.wrong();
  }
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
  $('#imp-area').placeholder = t('imp_ph');
  $('#opt-version').textContent = t('version') + ': 2.0.0';
}

/* ---------- painel (S26 + S09) ---------- */
function renderDash() {
  const p = DB.profiles.find((x) => x.id === $('#dash-prof').value) || P();
  const totalQ = p.rights + p.wrongs;
  const acc = totalQ ? Math.round((100 * p.rights) / totalQ) : 0;
  const stage = p.stars >= 100 ? '🦊' : p.stars >= 30 ? '🐣' : '🥚';
  $('#stat-grid').innerHTML = [
    ['⭐', p.stars, t('d_stars')], ['🔥', p.streak || 0, t('d_streak')],
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
  $('#gate-go').addEventListener('click', tryGate);
  $('#gate-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryGate(); });
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
  newGate();
  bindOptions();
  renderOptions();
}
window.CC = {};
bootOptions();
