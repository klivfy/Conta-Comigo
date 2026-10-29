'use strict';
/* ==================== Conta Comigo — página de opções (S31) ====================
   Portão parental S25 (v2.3: senha dos responsáveis + lembrete de segurança)
   Painel S26/S09 · Perfis S27 · Exportar/Importar S29 · Segurança (alterar senha) */

let gateTriesTimer = null;
let ppOpen = null; // v2.4: linha de voz por perfil aberta no painel (id do perfil ou null)
/* ícone de cada tema no seletor do painel ('auto' = segue o aparelho) */
const THEME_ICONS = { auto: '🖥️', classico: '☀️', espaco: '🌙', jardim: '🌸', arcoiris: '🌈', oceano: '🌊', doces: '🍬', neve: '❄️' };

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
  if (has) gateEnterIdle(); else gateAdultAsk();
}
/* v2.7.2: antes de criar a senha, uma conta que criança de 4 a 8 anos não resolve sozinha */
let gcAdultAnswer = '', gcAdultOk = false;
function gateAdultAsk() {
  const a = rand(12, 19), b = rand(13, 19);
  gcAdultAnswer = String(a * b); gcAdultOk = false;
  $('#gc-adult').classList.remove('hidden');
  $('#gc-form').classList.add('hidden');
  $('#gc-adult-q').textContent = t('ad_title') + '. ' + t('ad_q', { q: a + ' × ' + b });
  $('#gc-adult-in').value = ''; $('#gc-adult-err').textContent = '';
}
function gateAdultCheck() {
  if ($('#gc-adult-in').value.trim() !== gcAdultAnswer) {
    $('#gc-adult-err').textContent = t('ad_wrong'); $('#gc-adult-in').select(); return;
  }
  gcAdultOk = true;
  $('#gc-adult').classList.add('hidden');
  $('#gc-form').classList.remove('hidden');
  $('#gc-pwd').focus();
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
    // v2.6.2: hash antigo (SHA-256 de uma rodada) vira PBKDF2 no primeiro acesso certo
    if (PASS.needsUpgrade(g.passHash)) { g.passSalt = PASS.salt(); g.passHash = await PASS.hash(v, g.passSalt); }
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
  if (!gcAdultOk) return; // o formulário só existe depois da conferência de adulto
  const a = $('#gc-pwd').value || '';
  const b = $('#gc-pwd2').value || '';
  const hint = ($('#gc-hint').value || '').trim();
  if (a.length < PASS_MIN) { $('#gc-err').textContent = t('sec_short'); SFX.wrong(); return; }
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
  g.passTries = 0; g.passLockUntil = 0;
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
  clearSavedState().then(() => location.reload());
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
  if (a.length < PASS_MIN) { $('#sec-err').textContent = t('sec_short'); return; }
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
  applyI18nLabels(document);
  document.title = t('appName') + ' — ' + t('gate_title');
  document.documentElement.lang = speechLang(g.lang) || 'pt-BR';
  applyTheme(g);
  document.body.classList.toggle('dys', !!g.dys);

  // seletor de jogador do painel
  const dp = $('#dash-prof');
  dp.innerHTML = DB.profiles.map((pf) => '<option value="' + escHtml(pf.id) + '"' + (pf.id === DB.activeId ? ' selected' : '') + '>' + escHtml(pf.avatar + ' ' + pName(pf)) + '</option>').join('');
  renderDash();
  renderProfList();
  paintBackupHint(); // v2.5: estado do backup das conquistas

  $('#set-diff').value = String(g.diffMode);
  $('#set-unlock').checked = !!g.unlockAll;
  $('#set-newtab').checked = !!g.newtabOn;
  $('#set-timer').checked = !!g.timer; // v2.7.2: desligado por padrão
  $('#set-lang').value = g.lang || 'pt';
  $('#set-mute').checked = !!g.mute;
  $('#set-voice-on').checked = g.voiceOn !== false; // v2.4 (A-186)
  $('#set-sfx-on').checked = g.sfxOn !== false; // v2.4 (A-186)
  paintConsent();
  const curSel = $('#set-cur');
  curSel.innerHTML = ['auto'].concat(Object.keys(CURRENCIES)).map((k) => '<option value="' + k + '">' + escHtml(t('cur_' + k)) + '</option>').join('');
  curSel.value = g.currency || 'auto';
  $('#set-tscale').value = String(g.timeScale || 1); // v2.4 (A-047)
  $('#set-tscale').options[0].text = t('ts_1');
  $('#set-tscale').options[1].text = t('ts_15');
  $('#set-tscale').options[2].text = t('ts_2');
  $('#set-rm').checked = !!g.reduceMotion; // v2.4 (A-050)
  $('#set-noshop').checked = !!g.shopOff; // v2.4 (A-101)
  $('#set-vol').value = String(Math.round((g.volume != null ? g.volume : 0.9) * 100));
  $('#set-rate').value = String(Math.round((g.vRate || VOICE_RATE) * 100));
  $('#set-pitch').value = String(Math.round((g.vPitch || VOICE_PITCH) * 100));
  fillVoices();
  const thSel = $('#set-theme');
  // tema comprado na loja (Oceano, Doces, Neve) aparece no seletor para não ficar em branco
  const cur = g.theme || 'auto';
  if (!thSel.querySelector('option[value="' + cur + '"]') && THEME_ICONS[cur]) {
    const o = document.createElement('option'); o.value = cur; thSel.appendChild(o);
  }
  thSel.value = cur;
  $$('#set-theme option').forEach((o) => { o.text = THEME_ICONS[o.value] + ' ' + t('th_' + o.value); });
  $('#set-hc').value = g.contrast || 'auto';
  $('#set-hc').options[0].text = '🖥️ auto';
  $('#set-hc').options[1].text = '🟢 ' + t('on');
  $('#set-hc').options[2].text = '⚪ ' + t('off');
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
  paintSyncStatus();
  renderSec();
  $('#imp-area').placeholder = t('imp_ph');
  $('#opt-version').textContent = t('version') + ': ' + (window.ccVersion ? window.ccVersion() : '2.7.2');
}

/* ---------- painel (S26 + S09) ---------- */
function renderDash() {
  const p = DB.profiles.find((x) => x.id === $('#dash-prof').value) || P();
  const totalQ = p.rights + p.wrongs;
  const acc = totalQ ? Math.round((100 * p.rights) / totalQ) : 0;
  $('#stat-grid').innerHTML = [
    ['⭐', p.stars, t('d_stars')], ['⚡', p.points || 0, t('d_points')], ['🔥', p.streak || 0, t('d_streak')],
    ['🎮', p.rounds, t('d_rounds')], ['⏱️', Math.round(p.playSec / 60) + ' min', t('d_time')],
    ['✅', acc + '%', t('d_acc')], ['🎲', modesPlayed(p).n + '/' + modesPlayed(p).total, t('d_modes')],
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
    ? weeks.map((w) => '<div class="week-bar"><span>' + w.rounds + '</span><i style="height:' + Math.max(6, Math.round(70 * w.rounds / maxR)) + 'px"></i><span>' + escHtml(w.k.replace(/^\d{4}-/, '')) + '</span></div>').join('')
    : '<span class="opt-note">—</span>';
}

/* ---------- perfis (S27) + voz por perfil (v2.4, A-179) ---------- */
/* v2.6: escapa o nome da voz (nomes do SO podem conter aspas/“&”) */
function escVoz(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/* v2.6 (estudo de vozes humanizadas): lista agrupada por camada de qualidade —
   🌟 naturais primeiro, depois ⚡ neurais/rede, por último as padrão. Motores
   básicos/robóticos (tier 0) entram no fim, rotulados. A opção “Auto” continua
   deixando o app escolher sozinho a melhor voz instalada. */
function voiceOptionsHtml(selected) {
  const g = G();
  const want = (TTS_LANG[g.lang] || 'pt-BR').slice(0, 2).toLowerCase();
  const vs = TTS.voices.filter((v) => v.lang && v.lang.replace('_', '-').toLowerCase().indexOf(want) === 0);
  if (!vs.length) return '<option value="">—</option>';
  const opt = (v) => '<option value="' + escVoz(v.voiceURI) + '"' + (selected === v.voiceURI ? ' selected' : '') + '>' + escVoz(v.name) + '</option>';
  const sortS = (a, b) => TTS.scoreVoice(b) - TTS.scoreVoice(a);
  const g3 = vs.filter((v) => TTS.voiceTier(v) === 3).sort(sortS);
  const g2 = vs.filter((v) => TTS.voiceTier(v) === 2).sort(sortS);
  const g1 = vs.filter((v) => TTS.voiceTier(v) === 1).sort(sortS);
  const g0 = vs.filter((v) => TTS.voiceTier(v) === 0).sort(sortS);
  let html = '<option value="">' + t('v_auto') + '</option>';
  if (g3.length) html += '<optgroup label="' + t('v_grp_natural') + '">' + g3.map(opt).join('') + '</optgroup>';
  if (g2.length) html += '<optgroup label="' + t('v_grp_neural') + '">' + g2.map(opt).join('') + '</optgroup>';
  if (g1.length) html += '<optgroup label="' + t('v_grp_std') + '">' + g1.map(opt).join('') + '</optgroup>';
  if (g0.length) html += '<optgroup label="' + t('v_grp_basic') + '">' + g0.map(opt).join('') + '</optgroup>';
  return html;
}
function renderProfList() {
  const g = G();
  $('#prof-list').innerHTML = DB.profiles.map((pf) => {
    const cur = pf.id === DB.activeId;
    const pp = pf.id === ppOpen ? (
      '<div class="pp-row">' +
      '<span class="pp-t">🎙️ ' + t('pp_voice') + '</span>' +
      '<label for="pp-rate">' + t('s_rate') + '</label><input id="pp-rate" type="range" min="60" max="160" step="5" value="' + Math.round((pf.vRate != null ? pf.vRate : (g.vRate || VOICE_RATE)) * 100) + '" data-pprate="' + escHtml(pf.id) + '">' +
      '<label for="pp-pitch">' + t('s_pitch') + '</label><input id="pp-pitch" type="range" min="50" max="200" step="5" value="' + Math.round((pf.vPitch != null ? pf.vPitch : (g.vPitch || VOICE_PITCH)) * 100) + '" data-pppitch="' + escHtml(pf.id) + '">' +
      '<select aria-label="' + escHtml(t('s_voice')) + '" data-ppvoice="' + escHtml(pf.id) + '">' + voiceOptionsHtml(pf.vVoice || '') + '</select>' +
      '<button class="mini-btn" data-ppreset="' + escHtml(pf.id) + '">' + t('pp_default') + '</button>' +
      '</div>'
    ) : '';
    return '<div class="prof-line" data-pid="' + escHtml(pf.id) + '">' +
      '<span style="font-size:24px" aria-hidden="true">' + escHtml(pf.avatar) + '</span>' +
      '<input value="' + escHtml(pName(pf)) + '" maxlength="' + NAME_MAX + '" aria-label="' + escHtml(t('name_ph')) + '" data-name="' + escHtml(pf.id) + '">' +
      '<div class="av-row" role="group" aria-label="' + escHtml(t('a_avatar') + ' — ' + pName(pf)) + '">' + AVATARS.map((a) => '<button class="av' + (a === pf.avatar ? ' sel' : '') + '" aria-pressed="' + (a === pf.avatar) + '" data-av="' + a + '" data-setav="' + escHtml(pf.id) + '">' + a + '</button>').join('') + '</div>' +
      '<button class="mini-btn' + (cur ? ' using' : '') + '" data-use="' + escHtml(pf.id) + '" aria-label="' + escHtml((cur ? t('in_use') : t('equip')) + ' — ' + pName(pf)) + '">' + (cur ? t('in_use') : t('equip')) + '</button>' +
      '<button class="mini-btn" data-pp="' + escHtml(pf.id) + '" title="' + escHtml(t('pp_voice')) + '" aria-label="' + escHtml(t('pp_voice') + ' — ' + pName(pf)) + '" aria-expanded="' + (pf.id === ppOpen) + '">🎙️</button>' +
      (DB.profiles.length > 1 ? '<button class="mini-btn danger-btn" data-del="' + escHtml(pf.id) + '" title="' + escHtml(t('del_prof') + ' — ' + pName(pf)) + '" aria-label="' + escHtml(t('del_prof') + ' — ' + pName(pf)) + '">✕</button>' : '') +
      pp +
      '</div>';
  }).join('');
  $$('#prof-list [data-name]').forEach((inp) => inp.addEventListener('change', () => {
    const pf = DB.profiles.find((x) => x.id === inp.dataset.name);
    if (pf) { pf.name = inp.value.trim() ? cleanName(inp.value) : pf.name; saveState(true); toastOpt('✅'); }
  }));
  $$('#prof-list [data-setav]').forEach((b) => b.addEventListener('click', () => {
    const pf = DB.profiles.find((x) => x.id === b.dataset.setav);
    if (pf) { pf.avatar = b.dataset.av; saveState(true); renderProfList(); } // antes gravava o id do perfil no avatar
  }));
  $$('#prof-list [data-use]').forEach((b) => b.addEventListener('click', () => {
    DB.activeId = b.dataset.use; saveState(true); renderOptions();
  }));
  // v2.4 (A-179): abrir/fechar a linha de voz do perfil
  $$('#prof-list [data-pp]').forEach((b) => b.addEventListener('click', () => {
    ppOpen = (ppOpen === b.dataset.pp) ? null : b.dataset.pp;
    renderProfList();
  }));
  $$('#prof-list [data-pprate]').forEach((inp) => inp.addEventListener('input', () => {
    const pf = DB.profiles.find((x) => x.id === inp.dataset.pprate);
    if (pf) { pf.vRate = Number(inp.value) / 100; saveState(true); }
  }));
  $$('#prof-list [data-pppitch]').forEach((inp) => inp.addEventListener('input', () => {
    const pf = DB.profiles.find((x) => x.id === inp.dataset.pppitch);
    if (pf) { pf.vPitch = Number(inp.value) / 100; saveState(true); }
  }));
  $$('#prof-list [data-ppvoice]').forEach((sel) => sel.addEventListener('change', () => {
    const pf = DB.profiles.find((x) => x.id === sel.dataset.ppvoice);
    if (pf) { pf.vVoice = sel.value; saveState(true); toastOpt('🎙️ ' + t('pp_saved')); }
  }));
  $$('#prof-list [data-ppreset]').forEach((b) => b.addEventListener('click', () => {
    const pf = DB.profiles.find((x) => x.id === b.dataset.ppreset);
    if (pf) {
      delete pf.vRate; delete pf.vPitch; delete pf.vVoice;
      saveState(true); renderProfList(); toastOpt('🎙️ ' + t('pp_default'));
    }
  }));
  $$('#prof-list [data-del]').forEach((b) => b.addEventListener('click', () => {
    if (!confirm(t('confirm_reset'))) return;
    DB.profiles = DB.profiles.filter((x) => x.id !== b.dataset.del);
    if (!DB.profiles.find((x) => x.id === DB.activeId)) DB.activeId = DB.profiles[0].id;
    saveState(true); renderOptions();
  }));
}

/* ---------- canais oficiais e cookies (v2.7) ---------- */
function paintConsent() {
  $('#lnk-privacy').href = LEGAL.privacy; $('#lnk-terms').href = LEGAL.terms; $('#lnk-support').href = LEGAL.support;
  $('#set-ck-stats').checked = Consent.allows('stats');
  $('#set-ck-track').checked = Consent.allows('track');
  paintConsentBanner();
}
/* v2.7.2: o aviso mora no painel (adulto), nunca na tela da criança. Some assim que há escolha. */
function paintConsentBanner() {
  let b = document.getElementById('consent');
  if (Consent.decided() || $('#opt-content').classList.contains('hidden')) { if (b) b.remove(); return; } // atrás da senha não aparece
  if (b) return;
  b = document.createElement('div'); b.id = 'consent'; b.className = 'consent';
  b.setAttribute('role', 'region'); b.setAttribute('aria-label', t('ck_title'));
  b.innerHTML = '<p>' + t('ck_msg') + '</p><div class="consent-actions">' +
    '<button type="button" class="ck-btn ck-link" data-ck="custom">' + t('ck_custom') + '</button>' +
    '<button type="button" class="ck-btn" data-ck="reject">' + t('ck_reject') + '</button>' +
    '<button type="button" class="ck-btn" data-ck="accept">' + t('ck_accept') + '</button></div>';
  document.body.appendChild(b);
  b.addEventListener('click', (e) => {
    const k = e.target.closest ? e.target.closest('[data-ck]') : null;
    if (!k) return;
    if (k.dataset.ck === 'reject') { Consent.rejectAll(); saveState(true); paintConsent(); }
    else if (k.dataset.ck === 'accept') { Consent.acceptAll(); saveState(true); paintConsent(); }
    else { const c = $('#set-ck-stats'); c.scrollIntoView({ block: 'center' }); c.focus(); }
  });
}
function bindConsent() {
  const save = () => { Consent.set($('#set-ck-stats').checked, $('#set-ck-track').checked); saveState(true); paintConsent(); };
  $('#set-ck-stats').addEventListener('change', save);
  $('#set-ck-track').addEventListener('change', save);
  $('#btn-ck-accept').addEventListener('click', () => { Consent.acceptAll(); saveState(true); paintConsent(); });
  $('#btn-ck-reject').addEventListener('click', () => { Consent.rejectAll(); saveState(true); paintConsent(); });
}

/* ---------- vozes (S22 + estudo v2.6) ---------- */
function fillVoices() {
  const g = G();
  const sel = $('#set-voice');
  sel.innerHTML = voiceOptionsHtml(g.vVoice || '');
  paintVoiceTierNote();
}
/* v2.6: diz ao responsável QUAL voz está ativa e com qual qualidade —
   se nada foi escolhido manualmente, mostra a que a heurística seleciona */
function paintVoiceTierNote() {
  const el = $('#voice-tier-note');
  if (!el) return;
  const g = G();
  const want = (TTS_LANG[g.lang] || 'pt-BR').slice(0, 2).toLowerCase();
  const manual = g.vVoice ? TTS.voices.find((v) => v.voiceURI === g.vVoice) : null;
  const v = manual || TTS.pickVoice(want);
  if (!v) { el.textContent = t('v_none'); return; }
  const tier = TTS.voiceTier(v);
  const q = tier === 3 ? t('v_tier_natural') : tier === 2 ? t('v_tier_neural') : tier === 0 ? t('v_tier_basic') : t('v_tier_std');
  el.textContent = t('v_current', { q: q, n: v.name || v.voiceURI || '' }) + (tier <= 1 ? ' ' + t('v_install') : '');
}

/* ---------- exportar / importar (S29) + backup com data (v2.5) ---------- */
/* nos apps (iOS e Android) o arquivo sai pela folha de compartilhar do sistema */
function doExport() {
  saveState(true);
  saveTextFile('conta-comigo-progresso.json', JSON.stringify(shareableDB(DB), null, 2), t('backup_share')).then((ok) => {
    if (!ok) return;
    try { G().lastBackupAt = Date.now(); saveState(true); paintBackupHint(); } catch (e) { /* ignora */ }
  });
}
/* v2.5: backup datado — rede de segurança das conquistas quando a extensão
   é removida e reinstalada (recarregar ↻ preserva; remover apaga) */
function doBackupDownload() {
  saveState(true);
  saveTextFile('conta-comigo-backup-' + fmtDate() + '.json', JSON.stringify(shareableDB(DB), null, 2), t('backup_share')).then((ok) => {
    if (!ok) return;
    try { G().lastBackupAt = Date.now(); saveState(true); paintBackupHint(); toastOpt('💾 ' + t(FILE_VIA_SHARE ? 'backup_saved' : 'backup_done')); } catch (e) { /* ignora */ }
  });
}
function paintBackupHint() {
  const el = $('#bk-hint');
  if (!el) return;
  const last = Number(G().lastBackupAt) || 0;
  const days = last ? Math.floor((Date.now() - last) / 86400000) : null;
  el.textContent = days == null ? t('backup_hint_new')
    : days >= 14 ? '⚠️ ' + t('backup_hint_old', { n: days })
    : '✅ ' + t('backup_hint_ok', { n: days });
  el.style.fontWeight = days != null && days >= 14 ? '800' : '600';
}
function doImport(text) {
  const d = parseDB(text);
  if (!d) { toastOpt('⚠️ ' + t('imp_bad')); return; }
  replaceDB(keepLocalSecrets(d, DB)); // a senha deste aparelho continua valendo; o backup vale inteiro
  if (!DB.profiles.length) DB.profiles = [newProfile('p1', DEFAULT_NAME, '🦊')];
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
    else location.href = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('game.html') : (window.CC_GAME_URL || 'game.html');
  });
  // portão (v2.3)
  $('#ge-go').addEventListener('click', tryGate);
  $('#ge-pwd').addEventListener('keydown', (e) => { if (e.key === 'Enter') tryGate(); });
  $('#ge-forgot').addEventListener('click', forgotPwd);
  $('#ge-reset-show').addEventListener('click', () => { $('#ge-reset-form').classList.remove('hidden'); });
  $('#ge-reset-go').addEventListener('click', tryResetGate);
  $('#gc-go').addEventListener('click', tryCreateGate);
  $('#gc-adult-go').addEventListener('click', gateAdultCheck);
  $('#gc-adult-in').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); gateAdultCheck(); } });
  [['#gc-pwd', '#gc-go'], ['#gc-pwd2', '#gc-go'], ['#gc-hint', '#gc-go']].forEach(([inp, btn]) => {
    $(inp).addEventListener('keydown', (e) => { if (e.key === 'Enter') $(btn).click(); });
  });
  [['#ge-eye', '#ge-pwd'], ['#gc-eye1', '#gc-pwd'], ['#gc-eye2', '#gc-pwd2']].forEach(([b, inp]) => {
    $(b).addEventListener('click', () => { const i = $(inp); i.type = i.type === 'password' ? 'text' : 'password'; $(b).setAttribute('aria-pressed', String(i.type === 'text')); });
  });
  // segurança
  $('#btn-sec-change').addEventListener('click', () => { $('#sec-form').classList.toggle('hidden'); $('#sec-err').textContent = ''; });
  $('#btn-sec-save').addEventListener('click', tryChangePwd);
  $('#dash-prof').addEventListener('change', renderDash);
  $('#btn-new-prof').addEventListener('click', () => {
    if (DB.profiles.length >= 4) { toastOpt(t('max4')); return; }
    DB.profiles.push(newProfile(null, t('default_player') + ' ' + (DB.profiles.length + 1), pick(AVATARS)));
    saveState(true); renderOptions();
  });

  const set = (fn) => { saveState(true); };
  $('#set-diff').addEventListener('change', (e) => { G().diffMode = e.target.value === 'auto' ? 'auto' : Number(e.target.value); set(); });
  $('#set-unlock').addEventListener('change', (e) => { G().unlockAll = e.target.checked; set(); });
  $('#set-newtab').addEventListener('change', (e) => { G().newtabOn = e.target.checked; set(); });
  $('#set-timer').addEventListener('change', (e) => { G().timer = e.target.checked; set(); });
  $('#set-lang').addEventListener('change', (e) => { G().lang = e.target.value; G().vVoice = ''; set(); renderOptions(); });
  $('#set-mute').addEventListener('change', (e) => { G().mute = e.target.checked; set(); });
  // v2.4: narração e efeitos independentes + tempo extra + menos movimento + sem loja
  $('#set-voice-on').addEventListener('change', (e) => { G().voiceOn = e.target.checked; set(); });
  $('#set-sfx-on').addEventListener('change', (e) => { G().sfxOn = e.target.checked; set(); });
  bindConsent();
  $('#set-cur').addEventListener('change', (e) => { G().currency = e.target.value; set(); });
  $('#set-tscale').addEventListener('change', (e) => { G().timeScale = Number(e.target.value); set(); });
  $('#set-rm').addEventListener('change', (e) => { G().reduceMotion = e.target.checked; document.body.classList.toggle('rm', !!e.target.checked); set(); });
  $('#set-noshop').addEventListener('change', (e) => { G().shopOff = e.target.checked; set(); });
  // v2.4 (A-180): ouvir amostra com as configurações atuais da voz
  $('#btn-voice-sample').addEventListener('click', () => { TTS.speak(t('s_sample_txt'), { force: true }); });
  $('#set-vol').addEventListener('input', (e) => { G().volume = Number(e.target.value) / 100; set(); });
  $('#set-rate').addEventListener('input', (e) => { G().vRate = Number(e.target.value) / 100; set(); });
  $('#set-pitch').addEventListener('input', (e) => { G().vPitch = Number(e.target.value) / 100; set(); });
  $('#set-voice').addEventListener('change', (e) => { G().vVoice = e.target.value; set(); });
  $('#set-theme').addEventListener('change', (e) => { G().theme = e.target.value; set(); renderOptions(); });
  $('#set-hc').addEventListener('change', (e) => { G().contrast = e.target.value; set(); renderOptions(); });
  $('#set-dys').addEventListener('change', (e) => { G().dys = e.target.checked; set(); renderOptions(); });
  $('#set-calmo').addEventListener('change', (e) => { G().calmo = e.target.value === 'auto' ? null : e.target.value === 'on'; set(); });
  $('#set-goal').addEventListener('change', (e) => { G().goalRounds = Number(e.target.value); set(); });
  $('#set-limit').addEventListener('change', (e) => { G().sessionLimit = Number(e.target.value); set(); });
  $('#set-sync').addEventListener('change', (e) => { G().sync = e.target.checked; set(); if (G().sync) saveState(true); setTimeout(paintSyncStatus, 800); });

  $('#btn-export').addEventListener('click', doExport);
  $('#btn-backup-dl').addEventListener('click', doBackupDownload); // v2.5: backup datado
  $('#btn-copy').addEventListener('click', async () => {
    saveState(true);
    const txt = JSON.stringify(shareableDB(DB));
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
    replaceDB(DB); // zerar vale inteiro, sem somar com o que outra página gravou
    saveState(true); renderOptions(); toastOpt('🧹');
  });
  $('#btn-reset-all').addEventListener('click', () => {
    if (!confirm(t('confirm_reset'))) return;
    clearSavedState().then(() => location.reload());
  });
}

/* ADR-001: resultado da última sincronização, para os responsáveis saberem se ela funciona */
function paintSyncStatus() {
  const el = $('#sync-status');
  if (!el) return;
  const st = syncStatus();
  let txt = '';
  if (G().sync) {
    if (!st) txt = t('sync_never');
    else if (st.ok) txt = '✅ ' + t('sync_ok', { h: new Date(st.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) + (st.trimmed ? ' ' + t('sync_trimmed') : '');
    else if (st.kb) txt = '⚠️ ' + t('sync_big', { kb: st.kb, max: 7 });
    else txt = '⚠️ ' + t('sync_err', { err: st.err || '?' });
  }
  el.textContent = txt;
}
async function bootOptions() {
  await initDB();
  TTS.init();
  TTS.onVoices = () => { fillVoices(); if (ppOpen) renderProfList(); };
  bindOptions();
  showGate();
  renderOptions();
  /* o jogo gravou em outra aba: traz o progresso novo e redesenha (quando a aba está à vista) */
  let stale = false;
  const refresh = () => { if (document.hidden) { stale = true; return; } stale = false; if (adoptLatest()) renderOptions(); };
  onExternalSave(() => { clearTimeout(refresh.t); refresh.t = setTimeout(refresh, 300); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && stale) refresh(); });
}
window.CC = {};
bootOptions();
