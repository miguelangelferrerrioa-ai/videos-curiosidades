# Iguala el ritmo de una voz nueva al de otra (p. ej. cambiar de voz sin cambiar el montaje):
# cada vo_XX.wav se acelera o frena (sin cambiar el tono: ffmpeg rubberband, o atempo si no está) hasta durar lo mismo que la de referencia,
# y se escalan sus tiempos de palabra en voz/palabras.json.
# Uso: python motor/igualar_ritmo.py videos/<n> videos/<n>/voz_A     (factor limitado a 0,8–1,35 para que no suene raro)
import glob, json, os, subprocess, sys, numpy as np, soundfile as sf
D, REF = sys.argv[1], sys.argv[2]
PJ = D + '/voz/palabras.json'; pal = json.load(open(PJ))
dur = lambda f: sf.info(f).frames / sf.info(f).samplerate
RB = 'rubberband' in subprocess.run(['ffmpeg', '-hide_banner', '-filters'], capture_output=True, text=True).stdout
for f in sorted(glob.glob(D + '/voz/vo_*.wav')):
    i = int(os.path.basename(f)[3:5]); r = f'{REF}/{os.path.basename(f)}'
    if not os.path.exists(r): continue
    k = float(np.clip(dur(f) / dur(r), .8, 1.35))  # >1: la nueva es más lenta -> acelerar
    if abs(k - 1) < .02: print(i, 'igual'); continue
    tmp = f[:-4] + '_t.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', f'rubberband=tempo={k:.4f}:formant=preserved' if RB else f'atempo={k:.4f}', tmp], check=True); os.replace(tmp, f)
    pal[i] = [{**w, 'a': round(w['a'] / k, 3), 'b': round(w['b'] / k, 3)} for w in pal[i]]
    print(i, f'x{k:.2f}', round(dur(f), 2), 's (ref', round(dur(r), 2), ')')
json.dump(pal, open(PJ, 'w'), ensure_ascii=False)
