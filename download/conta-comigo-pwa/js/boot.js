'use strict';
/* Conta Comigo PWA — boot: molde de página cheia + registro do service worker */
document.documentElement.classList.add('html-page');
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => { /* offline opcional */ });
  });
}
