# Genera la celda de Colab de un vídeo (imágenes + mapas de profundidad + voz clonada) a partir de plan.json.
# Uso: python3 motor/celda.py videos/<nombre>   -> escribe videos/<nombre>/celda_colab.txt
# La celda va SIN sangrías (el editor de Colab en el móvil las rompe al pegar): todo en líneas sueltas.
import json, sys
D = sys.argv[1]; P = json.load(open(D + '/plan.json'))
REPO = 'miguelangelferrerrioa-ai/videos-curiosidades'
MUESTRA = f'https://raw.githubusercontent.com/{REPO}/main/voz/muestra.wav'
STYLE = P.get('estilo', 'hyperrealistic, cinematic lighting, ultra detailed textures, sharp focus, high dynamic range, professional photography, 35mm film still')
NEG = P.get('negativo', 'text, letters, watermark, logo, blurry, lowres, jpeg artifacts, noise, oversaturated, cartoon, painting, deformed, people')
J = [(x['id'], x['prompt'], x.get('seeds', [1, 2]), x.get('neg', '')) for x in P['imagenes']]
FR = [f['say'] for f in P['frases']]
VOZ = ('import json, soundfile as sf\n'
       'from chatterbox.mtl_tts import ChatterboxMultilingualTTS\n'
       'm = ChatterboxMultilingualTTS.from_pretrained(device="cuda")\n'
       'F = json.load(open("frases.json"))\n'
       'for i, t in enumerate(F):\n'
       f'    w = m.generate(t, language_id="es", audio_prompt_path="muestra.wav", exaggeration={P.get("exageracion", 0.5)}, cfg_weight={P.get("cfg", 0.5)})\n'
       '    sf.write(f"out/voz/vo_{i:02d}.wav", w.squeeze(0).cpu().numpy(), m.sr)\n'
       '    print("Voz lista", i + 1, "de", len(F))\n')
if '--musica' in sys.argv:
    # Música con IA: ACE-Step 1.5 (licencia MIT, uso comercial permitido), modelo turbo 2B, solo instrumental.
    # Celda APARTE (entorno nuevo de Colab): uv crea su propio entorno con la versión de torch que fija ACE-Step.
    # Saca 2 versiones (semillas seguidas) en musica.zip -> descomprimir en la carpeta del vídeo (musica/m_0.wav, m_1.wav)
    # y elegir una en plan.json -> "musica": {"elegida": "m_1"}. audio.py la usa en vez de la música sintetizada.
    import os
    M = P.get('musica') or {}
    assert M.get('prompt'), 'falta "musica": {"prompt": "..."} en plan.json'
    TLp = D + '/timeline.json'
    DUR = round(json.load(open(TLp))['total'] + 3) if os.path.exists(TLp) else 70
    CFG = {'prompt': M['prompt'], 'bpm': M.get('bpm'), 'duracion': DUR, 'seed': M.get('seed', 7)}
    ACE = 'ca1e85fe9430179831e6bc6be790c332190a3866'  # versión probada de ACE-Step-1.5
    MUS = ('import json, os\n'
           'from acestep.handler import AceStepHandler\n'
           'from acestep.inference import GenerationParams, GenerationConfig, generate_music\n'
           'M = json.load(open("/content/musica.json"))\n'
           'h = AceStepHandler()\n'
           'print(h.initialize_service(project_root=os.getcwd(), config_path="acestep-v15-turbo", device="cuda"))\n'
           'os.makedirs("/content/out/musica", exist_ok=True)\n'
           'p = GenerationParams(caption=M["prompt"], lyrics="[Instrumental]", instrumental=True, bpm=M["bpm"], duration=M["duracion"], '
           'inference_steps=8, shift=3.0, seed=M["seed"], thinking=False, use_cot_metas=False, use_cot_caption=False, use_cot_language=False)\n'
           'c = GenerationConfig(batch_size=2, use_random_seed=False, seeds=[M["seed"], M["seed"] + 1], audio_format="wav")\n'
           'r = generate_music(h, None, p, c, save_dir="/content/out/musica")\n'
           'assert r.success, r.error\n'
           'for i, a in enumerate(r.audios): os.rename(a["path"], f"/content/out/musica/m_{i}.wav")\n'
           'print("Musica lista:", len(r.audios), "versiones")\n')
    L = ['import os, json, zipfile',
         f'open("/content/musica.json", "w").write(json.dumps({CFG!r}))',
         f'open("/content/musica.py", "w").write({MUS!r})',
         'os.makedirs("/content/out/musica", exist_ok=True)',
         '!pip -q install uv 2>&1 | tail -3 | tee /content/out/log_musica.txt',
         f'!(git clone -q https://github.com/ACE-Step/ACE-Step-1.5.git /content/ace; cd /content/ace && git checkout -q {ACE} && uv sync) 2>&1 | tail -40 | tee -a /content/out/log_musica.txt',
         '!cd /content/ace && MPLBACKEND=Agg uv run python /content/musica.py 2>&1 | tail -80 | tee -a /content/out/log_musica.txt',
         'print("OK: musica generada" if os.listdir("/content/out/musica") else "FALLO: mándame el zip, lleva el registro del error")',
         'z = zipfile.ZipFile("musica.zip", "w"); _ = [z.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), "/content/out")) for r, _d, fs in os.walk("/content/out") for f in fs]; z.close()',
         'from google.colab import files; files.download("musica.zip")']
    out = '\n'.join(L) + '\n'
    assert not any(l.startswith((' ', '\t')) for l in out.splitlines()), 'la celda no puede llevar sangrías'
    compile('\n'.join(l for l in L if not l.startswith('!')), 'celda', 'exec'); compile(MUS, 'musica', 'exec')
    open(D + '/celda_musica.txt', 'w').write(out)
    print(f'celda de música ok: {DUR} s, "{M["prompt"][:60]}…" -> {D}/celda_musica.txt'); sys.exit()
if '--clips' in sys.argv:
    # Imagen a vídeo: LTX-Video 2B (diffusers) anima cada imagen ELEGIDA en un clip de 3 s (73 fotogramas, 24 fps, 512x768).
    # Rehace las elegidas con su semilla (SDXL es determinista en la misma GPU) para no tener que subirlas a Colab.
    # clips.zip -> descomprimir en la carpeta del vídeo (clips/<id>_<semilla>.mp4). montar.sh los usa en lugar de la foto.
    # Licencia de los pesos LTXV: uso libre salvo empresas con >= 10 M$ de ingresos; marcar el contenido como hecho con IA.
    EL = P.get('elegidas') or {}
    assert EL, 'primero elige las imágenes (plan.json -> elegidas)'
    IM = {x['id']: x for x in P['imagenes']}
    MOVDEF = 'slow cinematic camera movement, subtle natural motion, realistic physics, smooth, high quality'
    JOBS = sorted({v: (IM[v.rsplit('_', 1)[0]]['prompt'], int(v.rsplit('_', 1)[1]), IM[v.rsplit('_', 1)[0]].get('neg', ''),
                       IM[v.rsplit('_', 1)[0]].get('mov', MOVDEF)) for v in EL.values()}.items())
    SCR = '''import json, os, sys, torch, numpy as np
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler, LTXImageToVideoPipeline
from diffusers.utils import export_to_video
C = json.load(open("/content/clips.json")); os.makedirs("/content/out/clips", exist_ok=True)
todo = [j for j in C["jobs"] if not os.path.exists(f"/content/out/clips/{j[0]}.mp4")]
pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True); pipe.set_progress_bar_config(disable=True)
ims = {}
for k, (p, sd, xn, mov) in todo:
    ims[k] = pipe(p + ", " + C["style"], negative_prompt=C["neg"] + (", " + xn if xn else ""), width=832, height=1216, num_inference_steps=30, guidance_scale=6.5, generator=torch.Generator("cuda").manual_seed(sd)).images[0]
    print("Imagen", k, flush=True)
del pipe; torch.cuda.empty_cache()
def gen(lt, im, p, mov, sd):
    return lt(image=im, prompt=p + ", " + mov, negative_prompt="worst quality, inconsistent motion, blurry, jittery, distorted, morphing, text, watermark",
            width=512, height=768, num_frames=73, num_inference_steps=30, guidance_scale=3.0, decode_timestep=0.05, image_cond_noise_scale=0.025,
            generator=torch.Generator("cuda").manual_seed(sd)).frames[0]
def carga(dt):
    x = LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video", torch_dtype=dt)
    x.enable_model_cpu_offload(); x.vae.enable_tiling(); x.set_progress_bar_config(disable=True); return x
lt = carga(torch.float16)  # la T4 no tiene bfloat16 nativo: float16 va mucho más rápido
for n, (k, (p, sd, xn, mov)) in enumerate(todo):
    im = ims[k].resize((512, 768))
    fr = gen(lt, im, p, mov, sd)
    if n == 0 and float(np.asarray(fr[len(fr) // 2], dtype=np.float32).mean()) < 5:
        print("float16 da negro: paso a bfloat16 (más lento)", flush=True)
        del lt; torch.cuda.empty_cache(); lt = carga(torch.bfloat16); fr = gen(lt, im, p, mov, sd)
    m = float(np.asarray(fr[len(fr) // 2], dtype=np.float32).mean())
    export_to_video(fr, f"/content/out/clips/{k}.mp4", fps=24)
    print(f"Clip {n + 1} de {len(todo)}: {k} (brillo medio {m:.0f}{' ¡NEGRO?' if m < 5 else ''})", flush=True)
print("CLIPS LISTOS")
'''
    CFG = {'jobs': [[k, list(v)] for k, v in JOBS], 'style': STYLE, 'neg': NEG}
    L = ['import os, json, zipfile',
         f'open("/content/clips.json", "w").write(json.dumps({CFG!r}))',
         f'open("/content/clips.py", "w").write({SCR!r})',
         'os.makedirs("/content/out/clips", exist_ok=True)',
         '!pip -q install -U diffusers "transformers<5" accelerate sentencepiece imageio imageio-ffmpeg 2>&1 | tail -3',
         '!python -u /content/clips.py 2>&1 | tee /content/out/log_clips.txt',
         'print(f"OK: {len(os.listdir(\'/content/out/clips\'))} clips" if os.listdir("/content/out/clips") else "FALLO: mándame el zip, lleva el registro del error")',
         f'z = zipfile.ZipFile("clips.zip", "w"); _ = [z.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), "/content/out")) for r, _d, fs in os.walk("/content/out") for f in fs]; z.close()',
         'from google.colab import files; files.download("clips.zip")']
    out = '\n'.join(L) + '\n'
    assert not any(l.startswith((' ', '\t')) for l in out.splitlines()), 'la celda no puede llevar sangrías'
    compile('\n'.join(l for l in L if not l.startswith('!')), 'celda', 'exec'); compile(SCR, 'clips', 'exec')
    open(D + '/celda_clips.txt', 'w').write(out)
    print(f'celda de clips ok: {len(JOBS)} clips -> {D}/celda_clips.txt'); sys.exit()
solo_voz = '--solo-voz' in sys.argv; solo_img = '--solo-imagenes' in sys.argv
L = []
if not solo_voz:
    L += ['!pip -q install -U diffusers transformers accelerate',
          'import torch, os, json, zipfile, urllib.request',
          'from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler',
          'from transformers import pipeline as tpipe',
          'pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")',
          'pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True)',
          'dep = tpipe("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device=0)',
          f'STYLE = {STYLE!r}',
          f'NEG = {NEG!r}',
          f'J = {J!r}',
          'os.makedirs("out/imagenes", exist_ok=True); os.makedirs("out/voz", exist_ok=True)',
          'def gen(n, p, sd, xn): im = pipe(p + ", " + STYLE, negative_prompt=NEG + (", " + xn if xn else ""), width=832, height=1216, num_inference_steps=30, guidance_scale=6.5, generator=torch.Generator("cuda").manual_seed(sd)).images[0]; im.save(f"out/imagenes/{n}_{sd}.jpg", quality=92); dep(im)["depth"].save(f"out/imagenes/{n}_{sd}_d.png"); print("Imagen lista", n, sd)',
          '_ = [gen(n, p, sd, xn) for (n, p, seeds, xn) in J for sd in seeds]',
          'del pipe, dep; torch.cuda.empty_cache()']
else:
    L += ['import os, json, zipfile, urllib.request', 'os.makedirs("out/voz", exist_ok=True)']
L += [] if solo_img else [f'open("frases.json", "w").write(json.dumps({FR!r}))',
      f'urllib.request.urlretrieve({MUESTRA!r}, "muestra.wav")',
      f'open("voz.py", "w").write({VOZ!r})',
      '!pip -q install chatterbox-tts',
      '!python voz.py']
L += [f'z = zipfile.ZipFile({P.get("nombre", "video") + ".zip"!r}, "w"); _ = [z.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), "out")) for r, _d, fs in os.walk("out") for f in fs]; z.close()',
      f'from google.colab import files; files.download({P.get("nombre", "video") + ".zip"!r})']
out = '\n'.join(L) + '\n'
assert not any(l.startswith((' ', '\t')) for l in out.splitlines()), 'la celda no puede llevar sangrías'
compile('\n'.join(l for l in L if not l.startswith('!')), 'celda', 'exec')  # comprobación de sintaxis
open(D + '/celda_colab.txt', 'w').write(out)
print(f'celda ok: {len(J)} prompts, {sum(len(x[2]) for x in J)} imágenes, {len(FR)} frases -> {D}/celda_colab.txt')
