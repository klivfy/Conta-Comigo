'use strict';
/* Renderiza o vídeo quadro a quadro (1920×1080, 30 fps) a partir de timeline.json.
   Uso: node render.cjs preview t1,t2,... | node render.cjs full saida.mp4 */
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const G = __dirname;
const V = process.env.CC_VIDEO_TRABALHO || path.join(G, '..', '..', '.video-trabalho');
(async () => {
  const tl = JSON.parse(fs.readFileSync(path.join(V, 'timeline.json'), 'utf8'));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  // as capturas extras ficam na pasta de trabalho; o resto vem do repositório (caminhos relativos)
  await p.goto('file://' + path.join(G, 'video.html') + '?shots=' + encodeURIComponent('file://' + path.join(V, 'shots') + '/'));
  const broken = await p.evaluate((t) => init(t), tl);
  if (broken.length) { console.error('imagens que não carregaram:', broken); process.exit(1); }
  if (process.argv[2] === 'preview') {
    for (const t of process.argv[3].split(',').map(Number)) { await p.evaluate((x) => render(x), t); await p.screenshot({ path: path.join(V, 'prev-' + t + '.png') }); }
  } else {
    const fps = tl.fps, n = Math.ceil(tl.total * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', process.argv[3]], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate((x) => render(x), i / fps);
      const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise((ok) => ff.stdin.once('drain', ok));
      if (i % 300 === 0) console.log('quadro', i, '/', n, Math.round((Date.now() - t0) / 1000) + 's');
    }
    ff.stdin.end(); await new Promise((ok) => ff.on('close', ok));
  }
  await b.close();
})();
