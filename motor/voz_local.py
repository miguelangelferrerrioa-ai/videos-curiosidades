# Genera la narración con la voz clonada (Chatterbox multilingüe) AQUÍ, en CPU, sin Colab.
# Uso: .venv-voz/bin/python motor/voz_local.py videos/<n>   -> videos/<n>/voz/vo_XX.wav (una por frase)
# Instalar una vez: ./setup.sh voz   (~13 frases x ~26 s en CPU; la red debe permitir los hosts de Hugging Face)
import json, os, sys, time, torch, soundfile as sf
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
D = sys.argv[1]; P = json.load(open(D + '/plan.json')); os.makedirs(D + '/voz', exist_ok=True)
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'voz', 'muestra.wav')
torch.set_num_threads(os.cpu_count())
m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
for i, f in enumerate(P['frases']):
    o = f'{D}/voz/vo_{i:02d}.wav'
    if os.path.exists(o): continue
    t = time.time()
    w = m.generate(f['say'], language_id='es', audio_prompt_path=REF,
                   exaggeration=P.get('exageracion', 0.5), cfg_weight=P.get('cfg', 0.5))
    sf.write(o, w.squeeze(0).cpu().numpy(), m.sr)
    print(f'{i + 1}/{len(P["frases"])} {time.time() - t:.0f}s', flush=True)
