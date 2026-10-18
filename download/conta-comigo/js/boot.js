'use strict';
/* Conta Comigo v2.1 — boot (anti-CSP)
   MV3 proíbe scripts inline ("script-src 'self'"). Este arquivo externo
   aplica a classe html-page no <html> ANTES do CSS fixar o tamanho,
   liberando as páginas dedicadas (game/options/newtab/demo/web) do
   molde 400x600 do popup. Sem ele, a janela tela-cheia fica espremida
   numa coluna de 400px — exatamente o bug de layout que a v2.1 corrige. */
document.documentElement.classList.add('html-page');
