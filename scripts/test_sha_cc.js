'use strict';
/* Testa o SHA-256 puro em JS (fallback do portão parental) contra vetores conhecidos. */
const fs = require('fs');
const vm = require('vm');
const src = fs.readFileSync('/home/z/my-project/download/conta-comigo/js/engine.js', 'utf8');
const ctx = {
  console, Math, Date, Array, String, Number, JSON, Uint8Array, TextEncoder,
  crypto: { getRandomValues: (a) => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } },
};
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
