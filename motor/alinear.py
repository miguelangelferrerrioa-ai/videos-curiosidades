# Alinea una narración en un solo archivo (p. ej. ElevenLabs) con las frases del plan.
# Lee videos/<n>/plan.json y videos/<n>/voz/narracion.wav; escribe videos/<n>/voz/tiempos.json ([inicio, fin] por frase).
# Cómo: lee las frases con Kokoro (tiempos conocidos) y alinea esa lectura con la narración por DTW sobre MFCC.
# Necesita: ./setup.sh alinear
import json, os, sys, numpy as np, librosa
from kokoro_onnx import Kokoro
D = sys.argv[1]; M = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.modelos')
F = json.load(open(D + '/plan.json'))['frases']
k = Kokoro(M + '/kokoro-v1.0.onnx', M + '/voices-v1.0.bin')
SR = 16000; ref = []; bounds = []; t = 0
for f in F:
    a, sr = k.create(f['say'], voice='em_alex', speed=1.0, lang='es'); a = librosa.resample(a, orig_sr=sr, target_sr=SR)
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[nz[0]:nz[-1] + 1]
    bounds.append((t, t + len(a) / SR)); ref += [a, np.zeros(int(.25 * SR))]; t += len(a) / SR + .25
ref = np.concatenate(ref); el, _ = librosa.load(D + '/voz/narracion.wav', sr=SR); hop = 160
mf = lambda y: librosa.feature.mfcc(y=y, sr=SR, n_mfcc=20, hop_length=hop)[1:]
A, B = mf(ref), mf(el)
A = (A - A.mean(1, keepdims=True)) / A.std(1, keepdims=True); B = (B - B.mean(1, keepdims=True)) / B.std(1, keepdims=True)
_, wp = librosa.sequence.dtw(X=A, Y=B, metric='cosine'); wp = wp[::-1]
ra, rb = wp[:, 0] * hop / SR, wp[:, 1] * hop / SR
out = [[round(float(np.interp(a, ra, rb)), 3), round(float(np.interp(b, ra, rb)), 3)] for a, b in bounds]
json.dump(out, open(D + '/voz/tiempos.json', 'w')); print(out)
