#!/usr/bin/env python3
"""Figura 1 do estudo — curva de pontos por rapidez (mecânica v2.2.0).
pontos(t) = 100×L + 60×L×(1 − t/T), com T = 30 − 2×(L−1) segundos (modos rápidos).
Após T, o acerto de primeira continua valendo 100×L (sem punição).
Paleta WM-1: teal #15857A, laranja #FF6A3B, dourado #B98A2F.
"""
import matplotlib.font_manager as fm
import glob
for p in (glob.glob('/usr/share/fonts/truetype/chinese/*NotoSans*') +
          glob.glob('/usr/share/fonts/truetype/noto*/**/*NotoSans*', recursive=True) +
          ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
    for f in (p if isinstance(p, list) else [p]):
        try:
            fm.fontManager.addfont(f)
        except Exception:
            pass

import matplotlib.pyplot as plt
import numpy as np

plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Noto Sans SC']
plt.rcParams['axes.unicode_minus'] = False

COLORS = {'1': '#15857A', '3': '#FF6A3B', '5': '#B98A2F'}

fig, ax = plt.subplots(figsize=(9.2, 4.9), dpi=150, constrained_layout=True)

t = np.linspace(0, 30, 400)
for L in (1, 3, 5):
    T = 30 - 2 * (L - 1)
    y = np.where(t <= T, 100 * L + 60 * L * (1 - t / T), 100 * L)
    ax.plot(t[t <= T], y[t <= T], color=COLORS[str(L)], lw=2.6,
            label=f'Nível {L} (barra de {T} s)')
    ax.plot(t[t >= T], y[t >= T], color=COLORS[str(L)], lw=2.0, ls='--')

ax.axhline(160, color='#15857A', lw=0.8, alpha=0.35)
ax.axhline(400, color='#FF6A3B', lw=0.8, alpha=0.35)
ax.axhline(800, color='#B98A2F', lw=0.8, alpha=0.35)

ax.annotate('resposta instantânea:\n100×L + 60×L', xy=(0.4, 838), fontsize=8.5,
            color='#444444', ha='left', va='top')
ax.annotate('barra esgotada: segue valendo 100×L (sem punição)', xy=(13.6, 84), fontsize=8.5,
            color='#444444', ha='left')
ax.annotate('1ª tentativa, modo Somar', xy=(29.8, 838), fontsize=9, color='#666666', ha='right')

ax.set_xlim(0, 30)
ax.set_ylim(60, 860)
ax.set_xlabel('Tempo até acertar (segundos)', fontsize=10)
ax.set_ylabel('Pontos da questão (1ª tentativa)', fontsize=10)
ax.set_title('Curva de pontos por rapidez — Conta Comigo v2.2.0', fontsize=12, fontweight='bold', color='#15857A')
ax.legend(loc='center right', fontsize=9, frameon=True, framealpha=0.95, edgecolor='#D5D0C8', bbox_to_anchor=(0.99, 0.34))
ax.spines[['top', 'right']].set_visible(False)
ax.grid(axis='y', lw=0.4, alpha=0.3)
ax.set_xticks([0, 5, 10, 15, 20, 25, 30])

out = '/home/z/my-project/qa/fig1-curva-pontos.png'
fig.savefig(out, facecolor='white')
print('OK:', out)
