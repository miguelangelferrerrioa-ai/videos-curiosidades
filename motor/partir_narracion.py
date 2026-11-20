# Parte una narración de un solo archivo (p. ej. ElevenLabs con el guion entero) en las frases del plan:
# Whisper saca el tiempo de cada palabra, se emparejan con el guion (LCS) y se corta en el silencio entre frases.
# Escribe voz/vo_XX.wav (sin silencios en los bordes) y voz/palabras.json (tiempos de palabra de cada frase).
# Uso: HF_HUB_DISABLE_XET=1 .venv-voz/bin/python motor/partir_narracion.py videos/<n> narracion.wav
# Después, si hay que mantener el montaje: python motor/igualar_ritmo.py videos/<n> videos/<n>/voz_A
import json, os, re, sys, unicodedata, numpy as np, soundfile as sf, soxr
from faster_whisper import WhisperModel
D, NAR = sys.argv[1], sys.argv[2]; P = json.load(open(D + '/plan.json')); F = P['frases']
x, sr = sf.read(NAR); x = x if x.ndim == 1 else x.mean(1)
nz = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
m = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = m.transcribe(soxr.resample(x, sr, 16000).astype(np.float32), language='es', word_timestamps=True, beam_size=5,
                       initial_prompt=' '.join(f['show'] for f in F))  # el guion como pista: cifras y nombres bien escritos
W = [w for s in segs for w in s.words]
# guion (palabras de "say" y "show", que Whisper puede escribir en letra o en cifra) -> frase a la que pertenece
G = [(nz(t), i) for i, f in enumerate(F) for t in f['say'].split()]
a, b = [g[0] for g in G], [nz(w.word) for w in W]; n, k = len(a), len(b)
T = [[0] * (k + 1) for _ in range(n + 1)]
for p in range(n - 1, -1, -1):
    for q in range(k - 1, -1, -1):
        T[p][q] = T[p + 1][q + 1] + 1 if a[p] and a[p] == b[q] else max(T[p + 1][q], T[p][q + 1])
frase = [None] * k; p = q = 0
while p < n and q < k:
    if a[p] and a[p] == b[q]: frase[q] = G[p][1]; p += 1; q += 1
    elif T[p + 1][q] >= T[p][q + 1]: p += 1
    else: q += 1
# palabras sin pareja (cifras, nombres): cada tramo seguido va con la frase de al lado con la que haya menos silencio
q = 0
while q < k:
    if frase[q] is not None: q += 1; continue
    r = q
    while r < k and frase[r] is None: r += 1
    prev = frase[q - 1] if q > 0 else None; nxt = frase[r] if r < k else None
    if prev is None or nxt is None or prev == nxt: v = prev if prev is not None else nxt
    else: v = nxt if W[q].start - W[q - 1].end > W[r].start - W[r - 1].end else prev
    for j in range(q, r): frase[j] = v
    q = r
# cortes: en el centro del silencio entre la última palabra de una frase y la primera de la siguiente
ini = {}; fin = {}
for q, w in enumerate(W): ini.setdefault(frase[q], w.start); fin[frase[q]] = w.end
falta = [i for i in range(len(F)) if i not in ini]; assert not falta, f'frases sin encontrar en el audio: {falta}'
cut = [0.0] + [(fin[i] + ini[i + 1]) / 2 for i in range(len(F) - 1)] + [len(x) / sr]
pal = []
for i in range(len(F)):
    a0, b0 = cut[i], cut[i + 1]; y = x[int(a0 * sr):int(b0 * sr)]
    nzi = np.where(np.abs(y) > 0.01)[0]
    s0 = max(0, nzi[0] - int(.03 * sr)); y = y[s0:min(len(y), nzi[-1] + int(.12 * sr))]
    off = a0 + s0 / sr
    sf.write(f'{D}/voz/vo_{i:02d}.wav', y, sr)
    pal.append([{'w': w.word.strip(), 'a': round(max(0, w.start - off), 3), 'b': round(w.end - off, 3)} for q, w in enumerate(W) if frase[q] == i])
    print(f'{i:02d} {len(y) / sr:5.2f}s', ' '.join(w['w'] for w in pal[-1]))
json.dump(pal, open(D + '/voz/palabras.json', 'w'), ensure_ascii=False)
