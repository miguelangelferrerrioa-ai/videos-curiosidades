# Mezcla: voz + música con ritmo (sintetizada) + efectos de earshot (motor/sfx).
# Uso: python motor/audio.py videos/<nombre>   (necesita timeline.json, que crea render.js)
import numpy as np, soundfile as sf, json, sys, os
from scipy.signal import butter, sosfilt
V = sys.argv[1]; HERE = os.path.dirname(os.path.abspath(__file__)); SR = 44100
TL = json.load(open(V + '/timeline.json')); D = TL['total']; N = int(SR * D)
rng = np.random.default_rng(3)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def load(f):
    x, sr = sf.read(f); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    return x
def put(buf, x, at):
    a = int(at * SR)
    if a < 0: x = x[-a:]; a = 0
    if a >= N: return
    x = x[:N - a]; buf[a:a + len(x)] += x
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
imp = TL['impacts']; starts = TL['starts']
drop = imp[0] if imp else starts[min(1, len(starts) - 1)]
# fin del ritmo: la frase donde cae el último golpe (el clímax suena sin batería)
if TL.get('beatEnd') is not None: stop = TL['beatEnd'] - .05
elif imp: stop = max([s for s in starts if s <= imp[-1]] or [D]) - .05
else: stop = D - 2
BPM = 105; beat = 60 / BPM; bar = beat * 4
music = np.zeros(N); drums = np.zeros(N); sfx = np.zeros(N)
prog = [[38, 50, 53, 57], [34, 46, 50, 53], [31, 43, 46, 50], [33, 45, 49, 52]]  # Rem - Sib - Solm - La
for k in range(int(D / bar) + 1):
    ch = prog[k % 4]; a = k * bar; Lb = int((bar + 1.0) * SR); tt = np.arange(Lb) / SR
    env = np.minimum(1, tt / .4) * np.exp(-np.maximum(0, tt - bar) * 3); sig = np.zeros(Lb)
    for m in ch:
        for h_, g in ((1, 1), (2, .35), (3, .18), (4, .08)):
            sig += np.sin(2 * np.pi * nt(m) * h_ * tt * (1 + rng.uniform(-.002, .002))) * g
    put(music, lp(sig, 1800) * env * .04, a)
    if drop - .01 <= a < stop:
        for e in range(8):
            tt2 = np.arange(int(beat / 2 * SR)) / SR
            put(music, np.sin(2 * np.pi * nt(ch[0]) * tt2) * np.exp(-tt2 * 6) * .22, a + e * beat / 2)
kt = np.arange(int(.45 * SR)) / SR; kick = np.sin(2 * np.pi * (45 * kt + (120 / 18) * (1 - np.exp(-18 * kt)))) * np.exp(-kt * 7)
ht = np.arange(int(.08 * SR)) / SR; hat = hp(rng.standard_normal(len(ht)), 7000) * np.exp(-ht * 60)
st = np.arange(int(.3 * SR)) / SR
snare = bp(rng.standard_normal(len(st)), 900, 6000) * np.exp(-st * 14) * .8 + np.sin(2 * np.pi * 190 * st) * np.exp(-st * 20) * .5
b = drop; i = 0
while b < stop:
    if i % 4 == 0 or i % 8 == 6: put(drums, kick * .9, b)
    if i % 4 == 2: put(drums, snare * .55, b)
    put(drums, hat * .25, b + beat / 2); put(drums, hat * .15, b); b += beat; i += 1
# ---- efectos ----
# Banco: los 25 de motor/sfx (flac) + los 252 de earshot ("familia/nombre"), que se generan la primera vez y se guardan
# en motor/sfx/banco/ (earshot sfx render; --dur y --pitch opcionales).
EAR = os.path.join(HERE, '..', '.venv-voz', 'bin', 'earshot')
def banco(n, dur=None, pitch=None):
    import subprocess
    tag = n.replace('/', '__') + (f'_d{dur}' if dur else '') + (f'_p{pitch}' if pitch else '')
    f = f'{HERE}/sfx/banco/{tag}.wav'
    if not os.path.exists(f):
        os.makedirs(os.path.dirname(f), exist_ok=True)
        cmd = [EAR, 'sfx', 'render', n, '-o', f] + (['--dur', str(dur)] if dur else []) + (['--pitch', str(pitch)] if pitch else [])
        subprocess.run(cmd, check=True, capture_output=True)
    return f
def cc0(n):  # "cc0:sfx-kit/sounds/appear-and-vanish/appear-burst" -> archivo (mp3 se pasa a wav una vez)
    import glob, subprocess
    f = glob.glob(f'{HERE}/sfx/cc0/{n[4:]}.*'); assert f, f'no está {n} (motor/sfx_cc0.sh)'
    if f[0].endswith('.mp3'):
        w = f[0][:-4] + '.wav'
        if not os.path.exists(w): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f[0], w], check=True)
        return w
    return f[0]
def S(n, g=1.0, dur=None, pitch=None):
    f = cc0(n) if n.startswith('cc0:') else f'{HERE}/sfx/{n}.flac' if '/' not in n else banco(n, dur, pitch)
    x = load(f)
    if dur and n.startswith('cc0:'): x = x[:int(dur * SR)]; k = min(len(x), int(.05 * SR)); x[-k:] *= np.linspace(1, 0, k)
    return x / np.abs(x).max() * g
def at_peak(n, tm, g=1.0, dur=None, pitch=None):
    x = S(n, g, dur, pitch); put(sfx, x, tm - np.argmax(np.abs(x)) / SR)
# cortes: toda la familia de whooshes y swishes del banco, sin repetir seguido
cutw = ['whoosh_fast/whip', 'swish/blade', 'whoosh_fast/crisp', 'swish/zing', 'whoosh_fast/heavy', 'pro_whoosh_big/gritty', 'whoosh_fast/tight',
        'swish/bright', 'whoosh_big/cape', 'swish/flick', 'whoosh_fast/sleeve', 'pro_whoosh_big/windy', 'swish/cane', 'whoosh_big/gust',
        'whoosh_fast/whistle', 'swish/soft', 'pro_whoosh_big/tonal', 'whoosh_big/jet', 'swish/stick', 'pro_whoosh_big/swell']
for j, s_ in enumerate(TL['shots'][1:]):
    near = any(abs(s_['a'] - x) < .5 for x in imp)
    at_peak('whoosh_big_thump_deep' if near else cutw[j % len(cutw)], s_['a'] + .03, .55 if near else .42)
seq = [['impact_deep'], ['impact_punch'], ['sub_drop_808'], ['cut_hit_sub', 'impact_punch'], ['impact_metal', 'glitch_crush']]
for j, tm in enumerate(imp):
    names = ['impact_blast'] if j == len(imp) - 1 and len(imp) > 1 else seq[j % len(seq)]
    for n in names: at_peak(n, tm, 1.0 if n in ('impact_deep', 'impact_blast', 'cut_hit_sub') else .8)
if imp:
    at_peak('riser_tension', imp[0], .55)
    if len(imp) > 1: at_peak('riser_build', imp[-1], .55)
    for tm in imp[1:-1]:
        if rng.random() < .5: at_peak('reverse_swell_dark', tm, .5)
at_peak('shimmer_m3', .6, .35)
for e in TL.get('sfx', []): at_peak(e['id'], e['a'], e['g'], e.get('dur'), e.get('pitch'))  # efectos por frase (plan.json)
for c in TL['calls']:
    if not any(abs(c['a'] - x) < .3 for x in imp): at_peak('ui_pop_blip', c['a'] + .02, .35)
    if c.get('count'):
        n, d = c['count']; k = 0
        while k * .08 < d: at_peak('hover_tick_air', c['a'] + k * .08, .18); k += 1
# ---- voz ----
vo = np.zeros(N); vd = TL['voice']
if 'single' in vd: put(vo, load(V + '/' + vd['single']), vd['offset'])
else:
    for f, s_ in zip(vd['lines'], vd['starts']): put(vo, load(V + '/' + f), s_)
vo = hp(vo, 80); vo /= np.abs(vo).max()
env = np.convolve(np.abs(vo), np.ones(int(.2 * SR)) / (.2 * SR), 'same'); env = np.minimum(1, env * 10)
# Música con IA (ACE-Step, motor/celda.py --musica) si plan.json -> "musica": {"elegida": "m_0"}; si no, la sintetizada
PL = json.load(open(V + '/plan.json')); MU = (PL.get('musica') or {}).get('elegida')
if MU and os.path.exists(f'{V}/musica/{MU}.wav'):
    bed = np.zeros(N); x = load(f'{V}/musica/{MU}.wav')[:N]; bed[:len(x)] = x
    fi = int(.4 * SR); bed[:fi] *= np.linspace(0, 1, fi); bed /= np.abs(bed).max(); hi, lo = .36, .24
    print('música:', MU)
else:
    for dl, g in ((.29, .25), (.53, .15)):
        d = int(dl * SR); music[d:] += music[:-d] * g
    bed = music + drums * .9; bed /= np.abs(bed).max(); hi, lo = .42, .27
mix = vo + bed * (hi - lo * env) + (sfx / np.abs(sfx).max() * .7 if np.abs(sfx).max() > 0 else 0)
mix[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix /= np.abs(mix).max() * 1.03
sf.write(V + '/mezcla.wav', mix, SR); print('mezcla ok', round(D, 1), 's')
