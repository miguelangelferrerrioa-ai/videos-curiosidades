# Genera la narración con la voz clonada (Chatterbox multilingüe) AQUÍ, en CPU, y la ESCUCHA con Whisper:
# si una frase no se entiende igual que el guion (palabras mal pronunciadas), la repite (hasta 3 intentos) y se queda
# con la mejor. Después recorta silencios y guarda los tiempos reales de cada palabra (voz/palabras.json).
# Uso: HF_HUB_DISABLE_XET=1 .venv-voz/bin/python motor/voz_local.py videos/<n> [--rehacer 3,7,8]
# Instalar una vez: ./setup.sh voz
import difflib, json, os, re, sys, time, unicodedata
import librosa, numpy as np, soundfile as sf, torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel
D = sys.argv[1]; P = json.load(open(D + '/plan.json')); os.makedirs(D + '/voz', exist_ok=True)
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voz', 'muestra.wav')
rehacer = set(int(x) for x in sys.argv[sys.argv.index('--rehacer') + 1].split(',')) if '--rehacer' in sys.argv else set()
torch.set_num_threads(os.cpu_count())
nz = lambda s: [re.sub(r'[^a-z0-9]', '', w) for w in unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode().replace('.', '').split()]
def parecido(texto, oido):
    return difflib.SequenceMatcher(None, [w for w in nz(texto) if w], [w for w in nz(oido) if w]).ratio()
def recortar(x, sr):
    i = np.where(np.abs(x) > 0.012)[0]
    return x[max(0, i[0] - int(.03 * sr)): i[-1] + int(.08 * sr)] if len(i) else x
tts = ChatterboxMultilingualTTS.from_pretrained(device='cpu'); asr = WhisperModel('small', device='cpu', compute_type='int8')
def oir(x, sr):
    segs, _ = asr.transcribe(librosa.resample(x, orig_sr=sr, target_sr=16000), language='es', word_timestamps=True, beam_size=5)
    ws = [w for s in segs for w in s.words]
    return ' '.join(w.word.strip() for w in ws), [{'w': w.word.strip(), 'a': round(w.start, 3), 'b': round(w.end, 3)} for w in ws]
PJ = D + '/voz/palabras.json'; palabras = json.load(open(PJ)) if os.path.exists(PJ) else []
palabras += [[] for _ in range(len(P['frases']) - len(palabras))]
informe = []
for i, f in enumerate(P['frases']):
    o = f'{D}/voz/vo_{i:02d}.wav'
    if os.path.exists(o) and i not in rehacer and palabras[i]: continue
    mejor = None; t = time.time()
    for intento in range(3):
        w = tts.generate(f['say'], language_id='es', audio_prompt_path=REF,
                         exaggeration=P.get('exageracion', 0.5), cfg_weight=P.get('cfg', 0.5))
        x = recortar(w.squeeze(0).cpu().numpy(), tts.sr); texto, ws = oir(x, tts.sr)
        p = max(parecido(f['show'], texto), parecido(f['say'], texto))
        if not mejor or p > mejor[0]: mejor = (p, x, texto, ws)
        if p >= .93: break
    p, x, texto, ws = mejor; sf.write(o, x, tts.sr); palabras[i] = ws
    informe.append((i, round(p, 2), texto))
    print(f'{i + 1}/{len(P["frases"])} parecido {p:.2f} ({intento + 1} intentos, {time.time() - t:.0f}s): {texto}', flush=True)
json.dump(palabras, open(PJ, 'w'), ensure_ascii=False)
malas = [r for r in informe if r[1] < .85]
print('REVISAR (se entienden mal):', malas if malas else 'ninguna')
