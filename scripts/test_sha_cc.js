'use strict';
/* Testa o SHA-256 puro em JS (fallback do portão parental) contra vetores conhecidos. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const enginePath = path.join(__dirname, '..', 'download', 'conta-comigo', 'js', 'engine.js');
const src = fs.readFileSync(enginePath, 'utf8');
const matchMediaStub = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const windowStub = {
  matchMedia: matchMediaStub,
  Capacitor: null,
  addEventListener() {},
  removeEventListener() {},
};
const documentStub = {
  querySelector() { return null; },
  querySelectorAll() { return []; },
  body: { dataset: {}, classList: { toggle() {} } },
};
const navigatorStub = { language: 'pt-BR', languages: ['pt-BR'] };
const storageStub = { getItem() { return null; }, setItem() {}, removeItem() {} };
const ctx = {
  console, Math, Date, Array, String, Number, JSON, Uint8Array, TextEncoder,
  crypto: { getRandomValues: (a) => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } },
  window: windowStub,
  document: documentStub,
  navigator: navigatorStub,
  localStorage: storageStub,
  setTimeout,
  clearTimeout,
};
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'engine.js' });
const fn = vm.runInContext('ccSha256Hex', ctx);
const salt = vm.runInContext('PASS.salt()', ctx);
const vecs = [
  ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
  ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ['a:picole', null], // comparado com crypto do node abaixo
  ['faca-ceia:çãõáéíóú123!@#', null],
];
const crypto = require('crypto');
let fail = 0;
for (const [txt, expect] of vecs) {
  const got = fn(txt);
  const want = expect || crypto.createHash('sha256').update(txt, 'utf8').digest('hex');
  const ok = got === want;
  if (!ok) fail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' sha256("' + txt.slice(0, 30) + '") = ' + got.slice(0, 16) + '…');
}
// salt tem 32 hex
console.log('salt:', salt, salt.length === 32 && /^[0-9a-f]{32}$/.test(salt) ? 'OK' : 'FAIL');
if (fail || salt.length !== 32) process.exit(1);
console.log('TODOS OS VETORES SHA-256 OK');
