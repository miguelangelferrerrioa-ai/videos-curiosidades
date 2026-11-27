# Mezcla de audio para la animación Remotion: voz unida + música (con ducking) + efectos CC0 reales.
# Uso: python motor/anim_audio.py videos/NN-tema   (eventos en plan.json -> "anim_sfx": {"golpes": [[frase, "palabra"], ...], "etiquetas": [...]})
import json, glob, os, subprocess, sys, unicodedata, re, numpy as np, soundfile as sf, soxr
D = sys.argv[1]; P = json.load(open(D + '/plan.json')); J = json.load(open(f'anim/src/{P["nombre"]}.json')); F = J['frases']
vo, SR = sf.read(D + '/voz_unida.wav'); vo = vo if vo.ndim == 1 else vo.mean(1)
def load(f):
    x, sr = sf.read(f); x = x if x.ndim == 1 else x.mean(1)
    return soxr.resample(x, sr, SR) if sr != SR else x
def cc0(n):
    f = sorted(glob.glob(f'motor/sfx/cc0/{n}.*')); assert f, n
    w = f[0][:-4] + '.wav'
    if f[0].endswith('.mp3') and not os.path.exists(w): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f[0], w], check=True)
    return load(w if f[0].endswith('.mp3') else f[0])
nz = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def kw(i, w):
    for p in F[i]['words']:
        if nz(w) in nz(p['w']): return p['a']
    return F[i]['a']
sfx = np.zeros(len(vo) + SR * 3)
def at(n, t, g):
    x = cc0('sfx-kit/sounds/' + n); x = x / np.abs(x).max() * g; s = max(0, int((t - np.argmax(np.abs(x)) / SR) * SR))
    sfx[s:s + len(x)] += x[:len(sfx) - s]
C = P.get('anim_sfx', {})
for i in range(1, len(F)): at(['whooshes/whoosh-medium-soft', 'swipes/swipe-fast-soft', 'whooshes/whoosh-fast-soft'][i % 3], F[i]['a'] - .12, .35)
for k, (i, w) in enumerate(C.get('golpes', [])): at(['booms-and-bass/boom-hit-soft', 'cinematic-hits/cinematic-drum-big', 'booms-and-bass/bass-808-short'][k % 3], kw(i, w), .55)
for i, w in C.get('etiquetas', []): at('interface/click-tap-soft', kw(i, w), .4)
for i, w, n, d in C.get('ticks', []):
    t0 = kw(i, w)
    for k in range(n): at('interface/click-hover-soft', t0 + k * d / n, .25)
m = load(f'{D}/musica/{P["musica"]["elegida"]}.wav'); xf = int(2 * SR)
while len(m) < len(sfx):  # música más corta que el vídeo: se repite con fundido cruzado de 2 s
    m = np.concatenate([m[:-xf], m[-xf:] * np.linspace(1, 0, xf) + m[:xf] * np.linspace(0, 1, xf), m[xf:]])
bed = m[:len(sfx)].copy()
fo = int(1.5 * SR); bed[len(vo) - fo:len(vo)] *= np.linspace(1, 0, fo); bed[len(vo):] = 0
env = np.convolve((np.abs(np.pad(vo, (0, len(sfx) - len(vo)))) > .02).astype(float), np.ones(int(.3 * SR)) / int(.3 * SR), 'same').clip(0, 1)
mix = np.pad(vo, (0, len(sfx) - len(vo))) + bed / np.abs(bed).max() * (.30 - .20 * env) + sfx * .7
mix = mix[:len(vo)]; mix /= max(1, np.abs(mix).max() / .95)
sf.write(D + '/mezcla_anim.wav', mix, SR); print('mezcla ok', round(len(mix) / SR, 1), 's')
