'use strict';
/* Carrega i18n.js + engine.js num contexto isolado, com stubs mínimos de
   navegador, do mesmo jeito que as páginas fazem (scripts globais, sem bundler).
   opts.subtle: false simula contexto sem WebCrypto (fallback em JS puro). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const nodeCrypto = require('crypto');

const JS = path.join(__dirname, '..', 'download', 'conta-comigo', 'js');

function loadEngine(opts) {
  const o = opts || {};
  const media = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  const store = {};
  const ctx = {
    console, setTimeout, clearTimeout, TextEncoder, Uint8Array, Int32Array,
    crypto: o.subtle === false
      ? { getRandomValues: (a) => nodeCrypto.getRandomValues(a) }
      : nodeCrypto.webcrypto,
    window: { matchMedia: media, Capacitor: null, addEventListener() {}, removeEventListener() {} },
    document: {
      querySelector: () => null, querySelectorAll: () => [],
      body: { dataset: {}, classList: { toggle() {}, contains: () => false } },
      documentElement: {},
    },
    navigator: { language: o.lang || 'pt-BR', languages: [o.lang || 'pt-BR'], userAgent: 'node' },
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['i18n.js', 'engine.js']) {
    vm.runInContext(fs.readFileSync(path.join(JS, f), 'utf8'), ctx, { filename: f });
  }
  /* avalia uma expressão no escopo global dos scripts (alcança const/let) */
  const ev = (code) => vm.runInContext(code, ctx);
  /* passa um valor do teste para dentro do contexto e devolve o nome dele */
  ev('var __in = {};');
  const put = (name, value) => { ctx.__in[name] = value; return '__in.' + name; };
  return { ctx, ev, put };
}

module.exports = { loadEngine };
