'use strict';
/* Carrega i18n.js + engine.js num contexto isolado, com stubs mínimos de
   navegador, do mesmo jeito que as páginas fazem (scripts globais, sem bundler).
   opts.subtle: false simula contexto sem WebCrypto (fallback em JS puro).
   opts.capacitor: ponte simulada do app (window.Capacitor) para os caminhos nativos.
   opts.store: objeto que faz de localStorage, para duas "páginas" dividirem o mesmo armazenamento.
   opts.chrome: stub de chrome.* (extensão), para testar chrome.storage.
   opts.navigator / opts.window / opts.globals: acrescentam campos ao navigator, ao window e ao escopo global (PWA no iPhone). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { pathToFileURL } = require('url');
const nodeCrypto = require('crypto');

const JS = path.join(__dirname, '..', 'download', 'conta-comigo', 'js');

function loadEngine(opts) {
  const o = opts || {};
  const media = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const store = o.store || {};
  const ctx = {
    console, setTimeout, clearTimeout, TextEncoder, Uint8Array, Int32Array,
    crypto: o.subtle === false
      ? { getRandomValues: (a) => nodeCrypto.getRandomValues(a) }
      : nodeCrypto.webcrypto,
    chrome: o.chrome,
    window: { matchMedia: media, Capacitor: o.capacitor || null, addEventListener() {}, removeEventListener() {}, ...(o.window || {}) },
    history: { back() { ctx.__backs = (ctx.__backs || 0) + 1; } },
    document: {
      querySelector: () => null, querySelectorAll: () => [],
      body: { dataset: {}, classList: { toggle() {}, contains: () => false } },
      documentElement: {},
    },
    navigator: { language: o.lang || 'pt-BR', languages: [o.lang || 'pt-BR'], userAgent: 'node', ...(o.navigator || {}) },
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
  };
  Object.assign(ctx, o.globals || {}); // File, Blob, URL, document… quando o teste precisa (vale por cima dos stubs)
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['i18n.js', 'engine.js']) {
    const file = path.join(JS, f);
    /* filename como URL de arquivo: assim o node --experimental-test-coverage mede engine.js e i18n.js */
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: pathToFileURL(file).href });
  }
  /* avalia uma expressão no escopo global dos scripts (alcança const/let) */
  const ev = (code) => vm.runInContext(code, ctx);
  /* passa um valor do teste para dentro do contexto e devolve o nome dele */
  ev('var __in = {};');
  const put = (name, value) => { ctx.__in[name] = value; return '__in.' + name; };
  return { ctx, ev, put };
}

module.exports = { loadEngine };
