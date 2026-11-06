'use strict';
/* Conta Comigo PWA: convite para instalar na tela de início.
   Só a PWA carrega este arquivo (build_pwa.py o copia e o capacitor_www o tira): a extensão e os
   apps do Android e do iPhone não o recebem.
   - Android e navegadores com o evento beforeinstallprompt: botão "Instalar" que abre o aviso do sistema.
   - iPhone e iPad: o Safari não tem aviso de instalação, então o cartão ensina Compartilhar > Adicionar à Tela de Início.
   - Já instalada (modo app), dentro de app nativo ou depois de "Agora não": não aparece.
   O cartão vive dentro da tela inicial: some sozinho quando a criança entra num jogo. Só textContent, nunca innerHTML. */
(function () {
  const KEY = 'cc_pwa_hint_off'; // lembra o "Agora não" (preferência de tela, não é progresso nem vai para backup)
  let deferred = null;
  let card = null;

  function nativeApp() {
    try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) { return false; }
  }
  function installed() {
    try {
      return !!((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true);
    } catch (e) { return false; }
  }
  function dismissed() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* ignora */ }
  }
  function isIOS() {
    return /iP(hone|ad|od)/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function tx(key) { return typeof t === 'function' ? t(key) : key; }
  function remove() {
    if (card && card.parentNode) card.parentNode.removeChild(card);
    card = null;
  }
  function el(tag, cls, key, id) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (id) n.id = id;
    if (key) { n.setAttribute('data-i18n', key); n.textContent = tx(key); } // data-i18n: o applyLang troca o idioma depois
    return n;
  }
  function build(mode) {
    const home = document.getElementById('screen-home');
    if (card || !home || nativeApp() || installed() || dismissed()) return;
    card = document.createElement('aside');
    card.className = 'pwa-install';
    card.id = 'pwa-install';
    card.setAttribute('aria-labelledby', 'pwa-install-title');
    card.appendChild(el('p', 'pwa-title', 'pwa_title', 'pwa-install-title'));
    card.appendChild(el('p', 'pwa-body', mode === 'ios' ? 'pwa_body_ios' : 'pwa_body_android'));
    const row = document.createElement('div');
    row.className = 'pwa-actions';
    if (mode === 'android') {
      const go = el('button', 'mini-btn', 'pwa_btn_install', 'pwa-install-btn');
      go.type = 'button';
      go.addEventListener('click', () => {
        const ev = deferred;
        deferred = null;
        remove();
        if (!ev || typeof ev.prompt !== 'function') return;
        try {
          ev.prompt();
          if (ev.userChoice && ev.userChoice.then) ev.userChoice.then((r) => { if (r && r.outcome === 'accepted') remember(); }, () => { /* ignora */ });
        } catch (e) { /* ignora */ }
      });
      row.appendChild(go);
    }
    const later = el('button', 'mini-btn pwa-later', 'pwa_btn_later', 'pwa-install-later');
    later.type = 'button';
    later.addEventListener('click', () => { remember(); remove(); });
    row.appendChild(later);
    card.appendChild(row);
    const foot = home.querySelector('.legal-foot');
    if (foot) home.insertBefore(card, foot); else home.appendChild(card);
  }

  if (nativeApp() || installed() || dismissed()) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // o convite é nosso, no momento certo (tela inicial), e não a barra do navegador
    deferred = e;
    build('android');
  });
  window.addEventListener('appinstalled', () => { remember(); deferred = null; remove(); });
  if (isIOS()) build('ios');
}());
