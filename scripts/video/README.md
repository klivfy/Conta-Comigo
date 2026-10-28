# Vídeo promocional

O vídeo pronto fica em `download/conta-comigo/loja/video/`: `conta-comigo-video-promocional-pt-BR.mp4` (2:19, 1920×1080, 30 fps) e a legenda `.srt`. Título, descrição e tags do YouTube estão em `download/conta-comigo/loja/lojas/video-youtube.md`.

Para refazer:

```bash
pip install numpy pillow piper-tts      # e ffmpeg + Node com playwright
bash scripts/video/fazer_video.sh
```

| Arquivo | O que faz |
|---|---|
| `roteiro.json` | Texto de cada cena e a duração da fala (o `narracao.py` atualiza) |
| `narracao.py` | Narração com o Piper, voz `pt_BR-faber-medium`, sem internet depois do download da voz |
| `capturas.cjs` | Telas extras do jogo (contagem por toque, temas, alto contraste, dislexia, senha) |
| `timeline.py` | Monta as cenas a partir das falas e escreve a legenda `.srt` |
| `audio.py` | Trilha gerada (C–G–Am–F, 100 bpm), efeitos e mix com a voz em destaque |
| `video.html` + `render.cjs` | Desenha cada quadro no Chromium e manda para o ffmpeg |
| `fazer_video.sh` | Roda tudo e junta vídeo e áudio com `loudnorm` (-16 LUFS) |

Para conferir um quadro sem renderizar tudo: `node scripts/video/render.cjs preview 12,50,126` (grava `prev-<s>.png` na pasta de trabalho).

Os intermediários (voz, narração, capturas, mix, vídeo sem áudio) ficam em `.video-trabalho/`, fora do Git. Mudou o texto de uma cena? Edite `roteiro.json` e rode o script de novo: as durações e a legenda se ajustam sozinhas.
