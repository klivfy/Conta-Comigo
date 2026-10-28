#!/usr/bin/env node
/* Imagens promocionais das lojas nos 3 idiomas (tiles, banners, pôster, ícones).
   Usa as capturas de loja/imagens (rode antes scripts/loja_capturas.cjs).
   Saída: download/conta-comigo/loja/graficos/<idioma>/. Uso: node scripts/loja_graficos.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SRC = path.resolve(__dirname, '..', 'download', 'conta-comigo');
const LOJA = path.join(SRC, 'loja');
const FONT = path.join(SRC, 'css', 'fonts');
const fontFile = fs.readdirSync(FONT).find((f) => /\.woff2$/.test(f));

const T = {
  pt: { name: 'Conta Comigo', tag: 'Matemática de brincadeira para crianças de 4 anos+', chips: ['100% offline', 'Sem anúncios', 'Sem coleta de dados'], short: 'Matemática de brincar' },
  en: { name: 'Count With Me', tag: 'Playful math for kids aged 4 and up', chips: ['100% offline', 'No ads', 'No data collection'], short: 'Playful math' },
  es: { name: 'Cuenta Conmigo', tag: 'Matemática lúdica para niños desde 4 años', chips: ['100 % sin conexión', 'Sin anuncios', 'Sin recopilar datos'], short: 'Matemática lúdica' },
};
/* nome, largura, altura, layout */
const ITEMS = [
  ['promo-pequeno-440x280', 440, 280, 'tile'],
  ['promo-marquee-1400x560', 1400, 560, 'banner'],
  ['play-grafico-de-recursos-1024x500', 1024, 500, 'banner'],
  ['msstore-heroi-1920x1080', 1920, 1080, 'banner'],
  ['msstore-poster-720x1080', 720, 1080, 'poster'],
  ['msstore-caixa-1080x1080', 1080, 1080, 'box'],
];
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const icon = b64(path.join(SRC, '..', 'conta-comigo-pwa', 'icons', 'icon-512.png'));

function html(lang, kind, w, h) {
  const t = T[lang];
  const desk = b64(path.join(LOJA, 'imagens', lang, 'desktop-1280x800', '01-inicio.png'));
  const phone = b64(path.join(LOJA, 'imagens', lang, 'celular-1080x1920', '02-contar.png'));
  const u = Math.min(w, h * 1.4) / 1000; // unidade proporcional
  const chips = t.chips.map((c) => `<i>${c}</i>`).join('');
  const body = {
    tile: `<div class="c" style="flex-direction:column;justify-content:center;text-align:center;gap:${14 * u * 2}px"><img class="ic" src="${icon}" style="width:${h * 0.38}px"><b class="n" style="font-size:${h * 0.15}px">${t.name}</b><span style="font-size:${h * 0.07}px;font-weight:700;color:#5b5b7a">${t.short}</span></div>`,
    banner: `<div class="c" style="gap:${w * 0.03}px;padding:0 ${w * 0.05}px"><div style="flex:1"><img class="ic" src="${icon}" style="width:${h * 0.2}px"><b class="n" style="font-size:${h * 0.115}px;display:block;margin:${h * 0.03}px 0">${t.name}</b><p style="font-size:${h * 0.058}px;margin:0 0 ${h * 0.05}px;color:#46466a;font-weight:700">${t.tag}</p><div class="chips" style="font-size:${h * 0.038}px">${chips}</div></div><img class="shot" src="${desk}" style="width:${w * 0.46}px;border-radius:${h * 0.03}px"></div>`,
    poster: `<div class="c" style="flex-direction:column;align-items:center;text-align:center;padding:${h * 0.06}px ${w * 0.07}px;gap:${h * 0.025}px"><img class="ic" src="${icon}" style="width:${w * 0.28}px"><b class="n" style="font-size:${w * 0.105}px">${t.name}</b><p style="font-size:${w * 0.048}px;margin:0;color:#46466a;font-weight:700">${t.tag}</p><img class="shot" src="${phone}" style="height:${h * 0.55}px;border-radius:${w * 0.05}px;margin-top:${h * 0.02}px"></div>`,
    box: `<div class="c" style="flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:${h * 0.035}px"><img class="ic" src="${icon}" style="width:${h * 0.42}px"><b class="n" style="font-size:${h * 0.115}px">${t.name}</b><p style="font-size:${h * 0.048}px;margin:0;color:#46466a;font-weight:700;max-width:80%">${t.tag}</p></div>`,
  }[kind];
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Conta;src:url("file://${FONT}/${fontFile}");font-weight:200 1000}
*{box-sizing:border-box}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}
body{font-family:Conta,system-ui,sans-serif;background:linear-gradient(135deg,#eaf6ff 0%,#fff3e6 55%,#ffe4ee 100%);color:#2a2a55}
.c{display:flex;align-items:center;width:100%;height:100%}.n{color:#2a2a55;letter-spacing:-.01em;font-weight:900}
.ic{border-radius:22%;box-shadow:0 8px 24px rgba(255,154,61,.35)}.shot{box-shadow:0 12px 40px rgba(42,42,85,.25);border:2px solid #fff}
.chips{display:flex;flex-wrap:wrap;gap:.5em}.chips i{font-style:normal;font-weight:800;background:#fff;border:2px solid #e3e6f5;border-radius:999px;padding:.35em .9em}
</style>${body}`;
}

(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); let n = 0;
  for (const lang of Object.keys(T)) {
    const dir = path.join(LOJA, 'graficos', lang); fs.mkdirSync(dir, { recursive: true });
    for (const [name, w, h, kind] of ITEMS) {
      const p = await ctx.newPage(); await p.setViewportSize({ width: w, height: h });
      const f = path.join(dir, '_tmp.html'); fs.writeFileSync(f, html(lang, kind, w, h));
      await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
      await p.screenshot({ path: path.join(dir, name + '.png') }); await p.close(); fs.unlinkSync(f); n++;
    }
  }
  await b.close();
  // ícones (iguais nos 3 idiomas)
  const { execFileSync } = require('child_process');
  const ico = path.join(LOJA, 'graficos', 'icones'); fs.mkdirSync(ico, { recursive: true });
  const base = path.join(SRC, '..', 'conta-comigo-pwa', 'icons');
  fs.copyFileSync(path.join(base, 'icon-512.png'), path.join(ico, 'play-icone-512x512.png'));
  execFileSync('python3', ['-c', `from PIL import Image;im=Image.open(${JSON.stringify(path.join(base, 'icon-512.png'))}).convert('RGBA')
for n,s in (('edge-logo-300x300',300),('msstore-logo-300x300',300),('chrome-icone-128x128',128)): im.resize((s,s),Image.LANCZOS).save(${JSON.stringify(ico)}+'/'+n+'.png')`]);
  console.log('OK — ' + n + ' imagens + 4 ícones em loja/graficos');
})();
