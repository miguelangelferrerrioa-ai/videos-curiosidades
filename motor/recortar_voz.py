# Quita el silencio del principio y del final de cada vo_XX.wav (el clon de voz suele dejar colas).
import glob, sys, numpy as np, soundfile as sf
D = sys.argv[1]
for f in sorted(glob.glob(D + '/voz/vo_*.wav')):
    x, sr = sf.read(f); m = x if x.ndim == 1 else x.mean(1)
    nz = np.where(np.abs(m) > 0.012)[0]
    if len(nz) == 0: continue
    a = max(0, nz[0] - int(.03 * sr)); b = min(len(x), nz[-1] + int(.08 * sr))
    if a > 0 or b < len(x): sf.write(f, x[a:b], sr)
print('voz recortada')
