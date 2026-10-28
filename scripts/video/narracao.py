"""Narração em pt-BR com o Piper (voz faber, offline) → <trabalho>/narr/<cena>.wav.
Grava a duração de cada fala em roteiro.json, que o timeline.py usa para montar as cenas."""
import json, os, subprocess
G = os.path.dirname(os.path.abspath(__file__))
V = os.environ.get('CC_VIDEO_TRABALHO') or os.path.join(os.path.dirname(os.path.dirname(G)), '.video-trabalho')
MODELO = os.path.join(V, 'voz', 'pt_BR-faber-medium.onnx')
os.makedirs(os.path.join(V, 'narr'), exist_ok=True)
r = json.load(open(os.path.join(G, 'roteiro.json'), encoding='utf-8'))
tot = 0
for s in r:
    out = os.path.join(V, 'narr', s['id'] + '.wav')
    # um pouco mais devagar e com pausa entre frases: o público é criança de 4 a 8 anos
    subprocess.run(['python3', '-m', 'piper', '-m', MODELO, '--length-scale', '1.08', '--sentence-silence', '0.35', '-f', out],
                   input=s['txt'].encode(), check=True, capture_output=True)
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]))
    s['dur'] = round(d, 2); tot += d
json.dump(r, open(os.path.join(G, 'roteiro.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(G, 'roteiro.json'), 'a', encoding='utf-8').write('\n')
for s in r: print(s['id'], s['dur'])
print('total da fala', round(tot, 1), 's')
