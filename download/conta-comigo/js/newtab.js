'use strict';
/* ==================== Conta Comigo v2.0 — nova aba (S33) ==================== */
let NTQ = null;

function ntRenderStats() {
  const p = P();
  $('#nt-stars').textContent = String(p.stars);
  $('#nt-streak').textContent = String(p.streak || 0);
  const st = p.stars >= 100 ? { e: '🦊', k: 'st_big' } : p.stars >= 30 ? { e: '🐣', k: 'st_baby' } : { e: '🥚', k: 'st_egg' };
  $('#nt-mascot').textContent = st.e + (p.hat || '');
  $('#nt-stage').textContent = t(st.k);
}

function ntQuestion() {
  const p = P();
  const mode = pick(['contar', 'somar', 'subtrair']);
  const lv = clamp(activeLevel(mode), 1, 2);
  NTQ = GENS[mode](lv);
  $('#nt-q').textContent = NTQ.display;
  $('#nt-done').classList.add('hidden');
  $('#nt-play').classList.remove('hidden');
  const box = $('#nt-ans');
  box.innerHTML = '';
  shuffle(NTQ.options).forEach((o) => {
    const b = document.createElement('button');
    b.textContent = String(o);
    b.addEventListener('click', () => {
      if (Number(b.textContent) === NTQ.answer) {
        b.classList.add('good');
        p.stars += 1; saveState();
        ntRenderStats();
        $('#nt-play').classList.add('hidden');
        const d = $('#nt-done');
        d.textContent = '🎉 +1 ⭐ ' + pick(I18N[LANG].praise);
        d.classList.remove('hidden');
        confetti(18);
        if (p.lastPlay !== fmtDate()) {
          p.streak = (p.lastPlay === yesterdayStr()) ? (p.streak || 0) + 1 : 1;
          p.lastPlay = fmtDate(); saveState();
        }
        setTimeout(ntQuestion, 1800);
      } else {
        b.disabled = true; b.style.opacity = '.4';
        SFX.wrong();
      }
    });
    box.appendChild(b);
  });
}

function ntShowGame() {
  $('#nt-title').textContent = t('appName');
  $('#nt-sub').textContent = t('subtitle');
  ntRenderStats();
  ntQuestion();
}
function ntShowOff() {
  $('#nt-play').classList.add('hidden');
  $('#nt-done').classList.add('hidden');
  $('#nt-sub').textContent = t('off');
  $('#nt-note').textContent = t('s_newtab_note');
  $('#nt-toggle').textContent = '⏻';
}
async function bootNewtab() {
  await initDB();
  applyLang();
  $('#nt-toggle').textContent = G().newtabOn ? '⏻' : '⏻';
  if (G().newtabOn) ntShowGame(); else ntShowOff();
  $('#nt-open').addEventListener('click', () => {
    const url = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL('game.html') : 'game.html';
    location.href = url;
  });
  $('#nt-toggle').addEventListener('click', () => {
    G().newtabOn = !G().newtabOn;
    saveState(true);
    if (G().newtabOn) { $('#nt-note').textContent = ''; ntShowGame(); } else ntShowOff();
  });
}
window.CC = {};
bootNewtab();
