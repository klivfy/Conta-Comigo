'use strict';
/* Conta Comigo v2.1 — boot (anti-CSP)
   MV3 proíbe scripts inline ("script-src 'self'"). Este arquivo externo
   aplica a classe html-page no <html> ANTES do CSS fixar o tamanho,
   liberando as páginas dedicadas (game/options/newtab/demo/web) do
   molde 400x600 do popup. Sem ele, a janela tela-cheia fica espremida
   numa coluna de 400px — exatamente o bug de layout que a v2.1 corrige. */
document.documentElement.classList.add('html-page');

/* v2.4.1 — fonte única da versão exibida na interface (selo no topo do jogo
   e nas opções). Em extensão lê o manifest (verdade absoluta); fora dele
   (demo.html, web/index.html, file://) usa o fallback abaixo. */
window.ccVersion = function () {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      return chrome.runtime.getManifest().version;
    }
  } catch (e) { /* demo/web sem contexto de extensão */ }
  return '2.6.2';
};
