# Tiempos REALES de cada palabra de la narración (Whisper), para que subtítulos y textos caigan con la voz.
# Uso: HF_HUB_DISABLE_XET=1 .venv-voz/bin/python motor/palabras.py videos/<n>  -> videos/<n>/voz/palabras.json
#   [[{"w": "Iba", "a": 0.02, "b": 0.21}, ...] por frase]  (tiempos relativos al inicio de cada vo_XX.wav)
import glob, json, sys, librosa
from faster_whisper import WhisperModel
D = sys.argv[1]
m = WhisperModel('small', device='cpu', compute_type='int8')
out = []
for f in sorted(glob.glob(D + '/voz/vo_*.wav')):
    segs, _ = m.transcribe(librosa.load(f, sr=16000)[0], language='es', word_timestamps=True, beam_size=5)
    out.append([{'w': w.word.strip(), 'a': round(w.start, 3), 'b': round(w.end, 3)} for s in segs for w in s.words])
    print(f.split('/')[-1], ' '.join(x['w'] for x in out[-1]), flush=True)
json.dump(out, open(D + '/voz/palabras.json', 'w'), ensure_ascii=False)
