# Prepara una animación Remotion: une la voz (voz/vo_XX.wav, con pausa entre frases) y escribe anim/src/<nombre>.json
# con los tiempos absolutos de cada frase y palabra. Uso: python motor/anim_datos.py videos/NN-tema [pausa=0.28]
import json, sys, numpy as np, soundfile as sf
D = sys.argv[1]; GAP = float(sys.argv[2]) if len(sys.argv) > 2 else .28
P = json.load(open(D + '/plan.json')); PAL = json.load(open(D + '/voz/palabras.json'))
out, t, fr, sr = [], .35, [], None
for i, f in enumerate(P['frases']):
    x, sr = sf.read(f'{D}/voz/vo_{i:02d}.wav'); x = x if x.ndim == 1 else x.mean(1)
    fr.append({'a': round(t, 3), 'b': round(t + len(x) / sr, 3), 'show': f['show'], 'clave': f.get('clave', ''), 'color': f.get('color', 'amarillo'),
               'words': [{'w': w['w'], 'a': round(t + w['a'], 3), 'b': round(t + w['b'], 3)} for w in PAL[i]]})
    ws = fr[-1]['words']; m = []  # une "1" + ".386" (Whisper parte las cifras con punto de miles)
    for w in ws:
        if m and w['w'].startswith('.') and m[-1]['w'][-1:].isdigit(): m[-1]['w'] += w['w']; m[-1]['b'] = w['b']
        else: m.append(w)
    fr[-1]['words'] = m
    out.append((t, x)); t += len(x) / sr + GAP
total = t + 1.6
v = np.zeros(int(total * sr))
for a, x in out: v[int(a * sr):int(a * sr) + len(x)] += x
sf.write(D + '/voz_unida.wav', v, sr)
json.dump({'fps': 30, 'total': round(total, 3), 'frases': fr}, open(f'anim/src/{P["nombre"]}.json', 'w'), ensure_ascii=False)
print('total', round(total, 2), 's')
