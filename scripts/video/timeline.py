"""Roteiro (durações da narração) → timeline.json e legenda .srt na pasta de trabalho."""
import json, re, os
G = os.path.dirname(os.path.abspath(__file__))
V = os.environ.get('CC_VIDEO_TRABALHO') or os.path.join(os.path.dirname(os.path.dirname(G)), '.video-trabalho')
r = json.load(open(f'{G}/roteiro.json'))
LEAD, TAIL = 0.8, 1.3
EXTRA = {'abertura': (1.2, 1.0), 'fim': (0.6, 3.6)}  # (lead extra, tail extra)
t = 0.0; scenes = []; srt = []
for s in r:
    le, te = EXTRA.get(s['id'], (0, 0))
    lead = LEAD + le; dur = lead + s['dur'] + TAIL + te
    # legendas: frases ou trechos de até ~70 caracteres, tempo proporcional ao tamanho
    parts = []
    for sent in re.split(r'(?<=[.!?:])\s+', s['txt']):
        while len(sent) > 78:
            cut = sent.rfind(', ', 0, 78)
            cut = cut + 1 if cut > 20 else 78
            parts.append(sent[:cut].strip()); sent = sent[cut:].strip()
        if sent: parts.append(sent)
    total = sum(len(p) for p in parts); c = t + lead; caps = []
    for p in parts:
        d = s['dur'] * len(p) / total
        caps.append({'a': round(c, 3), 'b': round(c + d, 3), 'txt': p}); c += d
    scenes.append({'id': s['id'], 'start': round(t, 3), 'dur': round(dur, 3), 'speech': round(t + lead, 3), 'speechDur': s['dur'], 'caps': caps})
    srt += caps; t += dur
json.dump({'total': round(t, 3), 'fps': 30, 'scenes': scenes}, open(f'{V}/timeline.json', 'w'), ensure_ascii=False, indent=1)
def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
with open(f'{V}/conta-comigo-video-promocional-pt-BR.srt', 'w') as f:
    for i, c in enumerate(srt, 1): f.write(f"{i}\n{ts(c['a'])} --> {ts(c['b'])}\n{c['txt']}\n\n")
print('total', round(t, 1), 's;', len(srt), 'legendas')
for s in scenes: print(s['id'], s['start'], s['dur'])
