# Quita el silencio del principio y del final de cada vo_XX.wav (el clon de voz suele dejar colas).
# El clon (Chatterbox) deja a veces 1-3 s de respiraciones/ruido tras la última palabra, por encima del umbral
# de silencio: si hay voz/palabras.json (Whisper), el final se corta 0,25 s después de la última palabra oída.
import glob, json, os, sys, numpy as np, soundfile as sf
D = sys.argv[1]
PJ = D + '/voz/palabras.json'
PAL = json.load(open(PJ)) if os.path.exists(PJ) else None
for f in sorted(glob.glob(D + '/voz/vo_*.wav')):
    x, sr = sf.read(f); m = x if x.ndim == 1 else x.mean(1)
    nz = np.where(np.abs(m) > 0.012)[0]
    if len(nz) == 0: continue
    a = max(0, nz[0] - int(.03 * sr)); b = min(len(x), nz[-1] + int(.08 * sr))
    i = int(os.path.basename(f)[3:5])
    if PAL and i < len(PAL) and PAL[i]:
        b = min(b, int((PAL[i][-1]['b'] + .25) * sr))
    if a > 0 or b < len(x):
        y = x[a:b].copy(); n = min(len(y), int(.06 * sr))  # fundido de 60 ms para que el corte no haga clic
        y[-n:] = (y[-n:].T * np.linspace(1, 0, n)).T
        sf.write(f, y, sr)
print('voz recortada')
