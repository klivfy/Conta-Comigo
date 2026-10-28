#!/usr/bin/env bash
# Vídeo promocional do Conta Comigo (pt-BR, 1920×1080, ~2:19) de ponta a ponta.
# Saída: download/conta-comigo/loja/video/conta-comigo-video-promocional-pt-BR.{mp4,srt}
# Precisa de: Python 3 com numpy, Pillow e piper-tts; Node com playwright; ffmpeg.
# Os arquivos intermediários ficam em .video-trabalho/ (ou em $CC_VIDEO_TRABALHO), fora do Git.
set -euo pipefail
G="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$G/../.." && pwd)"
export CC_VIDEO_TRABALHO="${CC_VIDEO_TRABALHO:-$ROOT/.video-trabalho}"
V="$CC_VIDEO_TRABALHO"
SAIDA="$ROOT/download/conta-comigo/loja/video"
mkdir -p "$V/voz" "$V/shots" "$SAIDA"

# 1) PWA (as capturas e o ícone saem dela) e capturas extras do jogo
[ -f "$ROOT/download/conta-comigo-pwa/index.html" ] || python3 "$ROOT/scripts/build_pwa.py"
node "$G/capturas.cjs" "$V/shots"

# 2) voz do Piper (uma vez) e narração
for f in pt_BR-faber-medium.onnx pt_BR-faber-medium.onnx.json; do
  [ -f "$V/voz/$f" ] || curl -sSfL -o "$V/voz/$f" "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/$f"
done
python3 "$G/narracao.py"

# 3) cenas e legenda, trilha e mix, quadros
python3 "$G/timeline.py"
python3 "$G/audio.py"
node "$G/render.cjs" full "$V/video-sem-audio.mp4"

# 4) junta vídeo e áudio, com volume normalizado para o YouTube (-16 LUFS)
ffmpeg -y -v error -i "$V/video-sem-audio.mp4" -i "$V/mix.wav" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$SAIDA/conta-comigo-video-promocional-pt-BR.mp4"
cp "$V/conta-comigo-video-promocional-pt-BR.srt" "$SAIDA/"
ffprobe -v error -show_entries format=duration,size -of compact "$SAIDA/conta-comigo-video-promocional-pt-BR.mp4"
