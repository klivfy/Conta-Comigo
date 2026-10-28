"""Trilha (gerada), narração e efeitos → mix.wav (48 kHz, estéreo)."""
import json, os, subprocess, numpy as np, wave
G = os.path.dirname(os.path.abspath(__file__))
V = os.environ.get('CC_VIDEO_TRABALHO') or os.path.join(os.path.dirname(os.path.dirname(G)), '.video-trabalho')
SR = 48000
tl = json.load(open(f'{V}/timeline.json')); T = tl['total']; N = int(T * SR) + SR
sc = {s['id']: s for s in tl['scenes']}
t = np.arange(N) / SR

def load(path):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768

# ---------- narração ----------
voz = np.zeros(N, np.float32)
for s in tl['scenes']:
    x = load(f"{V}/narr/{s['id']}.wav"); x = x / (np.abs(x).max() + 1e-9) * 0.82
    i = int(s['speech'] * SR); voz[i:i + len(x)] += x[:N - i]

# ---------- trilha: C – G – Am – F, 100 bpm ----------
bpm = 100; beat = 60 / bpm; bar = 4 * beat
f = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = [[48, 60, 64, 67], [43, 59, 62, 67], [45, 60, 64, 69], [41, 60, 65, 69]]  # baixo + tríade
mus = np.zeros(N, np.float32)
nbars = int(T / bar) + 2
def note(freq, start, dur, amp, kind):
    i0 = int(start * SR); n = int(dur * SR); i1 = min(N, i0 + n)
    if i0 >= N: return
    tt = np.arange(i1 - i0) / SR
    if kind == 'pad':
        env = np.minimum(1, tt / 0.5) * np.minimum(1, (dur - tt) / 0.6).clip(0)
        w = np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(2 * np.pi * freq * 1.003 * tt) + 0.15 * np.sin(4 * np.pi * freq * tt)
    elif kind == 'pluck':
        env = np.exp(-tt * 7) * np.minimum(1, tt / 0.004)
        w = np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * 4 * freq * tt) * np.exp(-tt * 18)
    else:  # baixo
        env = np.exp(-tt * 2.5) * np.minimum(1, tt / 0.01)
        w = np.sin(2 * np.pi * freq * tt) + 0.2 * np.sin(4 * np.pi * freq * tt)
    mus[i0:i1] += (amp * env * w).astype(np.float32)
ARP = [1, 2, 3, 2, 1, 3, 2, 3]
for b in range(nbars):
    c = CH[b % 4]; t0 = b * bar
    for m in c[1:]: note(f(m), t0, bar + 0.4, 0.035, 'pad')
    note(f(c[0]), t0, beat * 2, 0.09, 'bass'); note(f(c[0]), t0 + 2 * beat, beat * 2, 0.07, 'bass')
    if b >= 1:
        for k in range(8): note(f(c[ARP[k]] + 12), t0 + k * beat / 2, 0.5, 0.045, 'pluck')
# fade e ducking pela voz
env = np.convolve(np.abs(voz), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
duck = 1 - 0.6 * np.clip(env / 0.08, 0, 1)
fade = np.minimum(1, t / 1.5) * np.clip((T - t) / 3.0, 0, 1)
mus *= duck * fade

# ---------- efeitos ----------
fx = np.zeros(N, np.float32)
def add(start, x):
    i = int(start * SR); fx[i:i + len(x)] += x[:max(0, N - i)]
def tone(freqs, dur, dec, amp):
    tt = np.arange(int(dur * SR)) / SR
    return (amp * np.exp(-tt * dec) * sum(np.sin(2 * np.pi * q * tt) for q in freqs) / len(freqs)).astype(np.float32)
ding = tone([1318.5, 1975.5, 2637], 0.9, 5, 0.35)
tap = tone([880, 1760], 0.08, 45, 0.25)
def pop():
    tt = np.arange(int(0.09 * SR)) / SR; fr = 420 + 900 * tt / 0.09
    return (0.22 * np.exp(-tt * 30) * np.sin(2 * np.pi * np.cumsum(fr) / SR)).astype(np.float32)
chime = np.concatenate([np.pad(tone([f(m)], 1.2, 3, 0.25), (int(i * 0.11 * SR), 0)) for i, m in enumerate([72, 76, 79, 84])][::-1][:1])
for i, m in enumerate([72, 76, 79, 84]): add(0.35 + i * 0.11, tone([f(m), f(m) * 2], 1.4, 3, 0.22))
for i, m in enumerate([72, 76, 79, 84]): add(sc['fim']['start'] + 0.3 + i * 0.11, tone([f(m), f(m) * 2], 1.6, 2.5, 0.22))
c0 = sc['contar']['start']
for k in [1.6, 2.5, 3.4, 4.3]: add(c0 + k, tap)
add(c0 + 5.6, ding)
add(sc['adapta']['start'] + sc['adapta']['dur'] * 0.45, ding)
add(sc['semler']['start'] + sc['semler']['dur'] * 0.72, ding)
m0, md = sc['modos']['start'], sc['modos']['dur']
for i in range(13): add(m0 + 1.4 + i * (md - 5) / 13, pop() * 0.6)
p0, pd = sc['privacidade']['start'], sc['privacidade']['dur']
for i in range(4): add(p0 + 1.2 + i * (pd - 4.5) / 4, pop())
pl = sc['plataformas']['start']
for i in range(5): add(pl + 1.6 + i * 0.45, pop() * 0.6)
pa = sc['pais']['start']; add(pa + 1.0, tone([660, 990], 0.25, 18, 0.25))

# ---------- mix ----------
L = voz * 1.0 + mus * 1.0 + fx * 0.8; Rr = voz * 1.0 + mus * 0.92 + fx * 0.8
st = np.stack([L, Rr], 1)
st = st / max(1.0, np.abs(st).max() / 0.95)
st = st[:int(T * SR)]
with wave.open(f'{V}/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print('mix.wav', round(len(st) / SR, 2), 's, pico', round(float(np.abs(st).max()), 3))
