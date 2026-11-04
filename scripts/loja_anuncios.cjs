#!/usr/bin/env node
/* Anúncios com legenda para as lojas (Firefox AMO, Chrome, Edge e Microsoft Store), nos 3 idiomas.
   Cada anúncio é uma captura real do jogo (loja/imagens, rode antes scripts/loja_capturas.cjs)
   com título, frase de apoio e os três selos de privacidade. Não leva o nome de nenhum navegador,
   então o mesmo arquivo vale para todas as lojas.
   Saída: download/conta-comigo/loja/anuncios/<idioma>/<formato>/NN-cena.png
   Formatos: desktop-1280x800 (Firefox, Chrome, Edge) e desktop-1920x1080 (Microsoft Store).
   Uso: node scripts/loja_anuncios.cjs   (precisa de playwright) */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SRC = path.resolve(__dirname, '..', 'download', 'conta-comigo');
const LOJA = path.join(SRC, 'loja');
const FONT = path.join(SRC, 'css', 'fonts');
const fontFile = fs.readdirSync(FONT).find((f) => /\.woff2$/.test(f));
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
const icon = b64(path.join(SRC, '..', 'conta-comigo-pwa', 'icons', 'icon-512.png'));

const NAME = { pt: 'Conta Comigo', en: 'Count With Me', es: 'Cuenta Conmigo' };
const CHIPS = {
  pt: ['100% offline', 'Sem anúncios', 'Sem coleta de dados'],
  en: ['100% offline', 'No ads', 'No data collection'],
  es: ['100 % sin conexión', 'Sin anuncios', 'Sin recopilar datos'],
};
/* cena (arquivo em loja/imagens/<idioma>/<formato>/), rótulo, título e frase de apoio */
const SCENES = [
  ['01-inicio', {
    pt: ['Hoje', 'Matemática que parece brincadeira', 'Um botão Jogar com a sugestão do dia e a raposa que narra cada pergunta em voz alta.'],
    en: ['Today', 'Math that feels like play', 'A Play button with today’s suggestion, and a fox that reads every question out loud.'],
    es: ['Hoy', 'Matemática que parece un juego', 'Un botón Jugar con la sugerencia del día y una zorra que narra cada pregunta en voz alta.'],
  }],
  ['02-contar', {
    pt: ['Modo Contar', 'Conte de um em um', 'Arraste o objeto para a cesta e escolha a resposta. A narração acompanha cada passo.'],
    en: ['Count mode', 'Count one by one', 'Drag the object to the basket and pick the answer. The narration follows every step.'],
    es: ['Modo Contar', 'Cuenta de uno en uno', 'Arrastra el objeto a la cesta y elige la respuesta. La narración acompaña cada paso.'],
  }],
  ['03-comparar', {
    pt: ['Comparar', 'Maior, menor ou igual?', 'Comparar quantidades com figuras, sem precisar saber ler.'],
    en: ['Compare', 'Greater, smaller or equal?', 'Compare quantities with pictures, no reading needed.'],
    es: ['Comparar', '¿Mayor, menor o igual?', 'Compara cantidades con figuras, sin necesidad de leer.'],
  }],
  ['06-fim-de-rodada', {
    pt: ['Fim de rodada', 'Estrelas, pontos e recordes', 'No fim de cada rodada, quantas estrelas faltam para o mascote mudar.'],
    en: ['End of round', 'Stars, points and records', 'At the end of each round, how many stars are left until the mascot changes.'],
    es: ['Fin de ronda', 'Estrellas, puntos y récords', 'Al final de cada ronda, cuántas estrellas faltan para que cambie la mascota.'],
  }],
  ['07-loja', {
    pt: ['Loja do jogo', 'Personalize com as estrelas', 'Temas, acessórios e mascotes comprados só com estrelas ganhas jogando. Sem compras reais.'],
    en: ['Game shop', 'Customize with your stars', 'Themes, accessories and mascots bought only with stars earned by playing. No real purchases.'],
    es: ['Tienda del juego', 'Personaliza con tus estrellas', 'Temas, accesorios y mascotas comprados solo con estrellas ganadas jugando. Sin compras reales.'],
  }],
  ['08-conquistas', {
    pt: ['Conquistas', '20 conquistas para desbloquear', 'Cada objetivo cumprido vira uma conquista e uma figurinha no álbum.'],
    en: ['Achievements', '20 achievements to unlock', 'Every goal reached becomes an achievement and a sticker in the album.'],
    es: ['Logros', '20 logros por desbloquear', 'Cada objetivo cumplido se convierte en un logro y una figurita en el álbum.'],
  }],
  ['09-painel-responsaveis', {
    pt: ['Para os responsáveis', 'Acompanhe o progresso', 'Área protegida por senha, com resumo da semana, metas e backup. Os dados ficam no aparelho.'],
    en: ['For parents and carers', 'Follow the progress', 'A password-protected area with the weekly summary, goals and backup. Data stays on the device.'],
    es: ['Para los responsables', 'Sigue el progreso', 'Área protegida con contraseña, con resumen de la semana, metas y copia de seguridad. Los datos se quedan en el dispositivo.'],
  }],
];
/* formato -> tamanho final do anúncio */
const FORMATS = { 'desktop-1280x800': [1280, 800], 'desktop-1920x1080': [1920, 1080] };

function html(lang, shot, w, h, [tag, title, sub]) {
  const u = h / 800; // tudo proporcional à altura, para valer nos dois formatos
  const chips = CHIPS[lang].map((c) => `<i>${c}</i>`).join('');
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Conta;src:url("file://${FONT}/${fontFile}");font-weight:200 1000}
*{box-sizing:border-box}html,body{margin:0;width:${w}px;height:${h}px;overflow:hidden}
body{font-family:Conta,system-ui,sans-serif;color:#2a2a55;background:linear-gradient(135deg,#eaf6ff 0%,#fff3e6 55%,#ffe4ee 100%)}
.c{display:flex;align-items:center;gap:${48 * u}px;width:100%;height:100%;padding:0 ${72 * u}px}
.t{flex:0 0 ${w * 0.37}px;display:flex;flex-direction:column;gap:${22 * u}px}
.b{display:flex;align-items:center;gap:${16 * u}px;font-weight:900;font-size:${26 * u}px}.b img{width:${56 * u}px;border-radius:22%;box-shadow:0 6px 18px rgba(255,154,61,.35)}
.tag{align-self:flex-start;background:#ffe9d2;color:#b44a00;font-weight:800;font-size:${20 * u}px;padding:${6 * u}px ${16 * u}px;border-radius:999px}
h1{margin:0;font-size:${50 * u}px;line-height:1.08;font-weight:900;letter-spacing:-.01em;text-wrap:balance}
p{margin:0;font-size:${23 * u}px;line-height:1.4;color:#46466a;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:${10 * u}px}.chips i{font-style:normal;font-weight:800;font-size:${18 * u}px;background:#fff;border:2px solid #e3e6f5;border-radius:999px;padding:${8 * u}px ${16 * u}px}
.s{flex:1;min-width:0;display:flex;justify-content:flex-end}.s img{width:100%;border-radius:${22 * u}px;border:2px solid #fff;box-shadow:0 14px 44px rgba(42,42,85,.25)}
</style><div class="c"><div class="t"><div class="b"><img src="${icon}">${NAME[lang]}</div><span class="tag">${tag}</span><h1>${title}</h1><p>${sub}</p><div class="chips">${chips}</div></div><div class="s"><img src="${shot}"></div></div>`;
}

(async () => {
  const b = await chromium.launch(); let n = 0;
  for (const lang of Object.keys(NAME)) {
    for (const [fmt, [w, h]] of Object.entries(FORMATS)) {
      const dir = path.join(LOJA, 'anuncios', lang, fmt); fs.mkdirSync(dir, { recursive: true });
      for (const [scene, texts] of SCENES) {
        const shotFile = path.join(LOJA, 'imagens', lang, fmt, scene + '.png');
        if (!fs.existsSync(shotFile)) { console.error('FALTA ' + shotFile); process.exit(1); }
        const p = await b.newPage({ viewport: { width: w, height: h } });
        const f = path.join(dir, '_tmp.html');
        fs.writeFileSync(f, html(lang, b64(shotFile), w, h, texts[lang]));
        await p.goto('file://' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
        await p.screenshot({ path: path.join(dir, scene + '.png') }); await p.close(); fs.unlinkSync(f); n++;
      }
    }
  }
  await b.close();
  console.log('OK — ' + n + ' anúncios em loja/anuncios');
})();
