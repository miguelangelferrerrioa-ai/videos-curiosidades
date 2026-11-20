# Celdas de Colab que guardan TODO en Google Drive y retoman si Colab se corta (volver a ejecutar = sigue donde iba).
#   python3 motor/celdas.py videos/<nombre> fase1  -> celda_fase1.txt: imágenes + mapas de profundidad (SDXL + Depth Anything)
#                                                     y música con IA (ACE-Step 1.5) en UNA sola celda. La voz se hace aquí.
#   python3 motor/celdas.py videos/<nombre> clips  -> celda_clips.txt: imagen a vídeo (LTX-Video 2B) SOLO de los planos clave
#                                                     (plan.json -> "clips": ["c18", ...]; si no, gancho + golpes + cierre, máx. 6),
#                                                     usando las imágenes elegidas que ya están en Drive.
# Resultado: Drive/videos-curiosidades/<nombre>_fase1.zip o _clips.zip (además intenta descargarlo si la página sigue abierta).
# Las celdas van SIN sangrías (el editor de Colab en el móvil las rompe): el código con bloques va en scripts escritos a disco.
import json, sys
D, MODO = sys.argv[1], sys.argv[2]
P = json.load(open(D + '/plan.json')); NOM = P.get('nombre', 'video')
O = f'/content/drive/MyDrive/videos-curiosidades/{NOM}'
STYLE = P.get('estilo', 'hyperrealistic, cinematic lighting, ultra detailed textures, sharp focus, high dynamic range, professional photography, 35mm film still')
NEG = P.get('negativo', 'text, letters, watermark, logo, blurry, lowres, jpeg artifacts, noise, oversaturated, cartoon, painting, deformed, people')
ACE = 'ca1e85fe9430179831e6bc6be790c332190a3866'  # versión probada de ACE-Step-1.5

SDXL = '''import json, os, torch
C = json.load(open("/content/cfg.json")); O = C["out"]; os.makedirs(O + "/imagenes", exist_ok=True)
todo = [(n, p, sd, xn) for n, p, seeds, xn in C["imagenes"] for sd in seeds if not os.path.exists(f"{O}/imagenes/{n}_{sd}_d.png")]
print("Imágenes por hacer:", len(todo), flush=True)
if todo:
    from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
    from transformers import pipeline as tpipe
    pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True); pipe.set_progress_bar_config(disable=True)
    dep = tpipe("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device=0)
    for i, (n, p, sd, xn) in enumerate(todo):
        im = pipe(p + ", " + C["style"], negative_prompt=C["neg"] + (", " + xn if xn else ""), width=832, height=1216, num_inference_steps=30, guidance_scale=6.5, generator=torch.Generator("cuda").manual_seed(sd)).images[0]
        im.save(f"{O}/imagenes/{n}_{sd}.jpg", quality=92); dep(im)["depth"].save(f"{O}/imagenes/{n}_{sd}_d.png")  # el mapa, al final: marca de hecho
        print(f"Imagen {i + 1} de {len(todo)}: {n}_{sd}", flush=True)
print("IMÁGENES LISTAS", flush=True)
'''
MUS = '''import json, os
C = json.load(open("/content/cfg.json")); O = C["out"] + "/musica"; M = C["musica"]; os.makedirs(O, exist_ok=True)
if os.path.exists(O + "/m_1.wav"):
    print("Música ya hecha"); raise SystemExit
from acestep.handler import AceStepHandler
from acestep.inference import GenerationParams, GenerationConfig, generate_music
h = AceStepHandler(); print(h.initialize_service(project_root=os.getcwd(), config_path="acestep-v15-turbo", device="cuda")[1])
p = GenerationParams(caption=M["prompt"], lyrics="[Instrumental]", instrumental=True, bpm=M.get("bpm"), duration=M["duracion"], inference_steps=8, shift=3.0,
                     seed=M.get("seed", 7), thinking=False, use_cot_metas=False, use_cot_caption=False, use_cot_language=False)
s = M.get("seed", 7); r = generate_music(h, None, p, GenerationConfig(batch_size=2, use_random_seed=False, seeds=[s, s + 1], audio_format="wav"), save_dir="/content/mus")
assert r.success, r.error
for i, a in enumerate(r.audios):
    os.system(f'cp "{a["path"]}" "{O}/m_{i}.wav"')
print("MÚSICA LISTA:", len(r.audios), "versiones", flush=True)
'''
LTX = '''import json, os, torch, numpy as np
from PIL import Image
C = json.load(open("/content/cfg.json")); O = C["out"]; os.makedirs(O + "/clips", exist_ok=True)
todo = [j for j in C["clips"] if not os.path.exists(f"{O}/clips/{j[0]}.mp4")]
print("Clips por hacer:", len(todo), flush=True)
falta = [j for j in todo if not os.path.exists(f"{O}/imagenes/{j[0]}.jpg")]
if falta:  # imágenes que no están en Drive (p. ej. hechas con la celda antigua): se rehacen con su semilla
    os.makedirs(O + "/imagenes", exist_ok=True)
    from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
    pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True); pipe.set_progress_bar_config(disable=True)
    for k, p, sd, base, xn in falta:
        pipe(base + ", " + C["style"], negative_prompt=C["neg"] + (", " + xn if xn else ""), width=832, height=1216, num_inference_steps=30, guidance_scale=6.5,
             generator=torch.Generator("cuda").manual_seed(sd)).images[0].save(f"{O}/imagenes/{k}.jpg", quality=92)
        print("Imagen rehecha", k, flush=True)
    del pipe; torch.cuda.empty_cache()
if todo:
    from diffusers import LTXImageToVideoPipeline
    from diffusers.utils import export_to_video
    from transformers import T5EncoderModel, BitsAndBytesConfig
    import gc; gc.collect()
    # El codificador de texto (T5-XXL) no cabe en la RAM de Colab gratis junto al resto: va a 8 bits directo a la GPU (~5 GB)
    te = T5EncoderModel.from_pretrained("Lightricks/LTX-Video", subfolder="text_encoder", quantization_config=BitsAndBytesConfig(load_in_8bit=True),
                                        torch_dtype=torch.float16, device_map={"": 0}, low_cpu_mem_usage=True)
    def carga(dt):
        x = LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video", text_encoder=te, torch_dtype=dt, low_cpu_mem_usage=True)
        x.transformer.to("cuda"); x.vae.to("cuda"); x.vae.enable_tiling(); x.set_progress_bar_config(disable=True); return x
    def gen(lt, im, p, sd):
        return lt(image=im, prompt=p, negative_prompt="worst quality, inconsistent motion, blurry, jittery, distorted, morphing, text, watermark",
                  width=512, height=768, num_frames=73, num_inference_steps=30, guidance_scale=3.0, frame_rate=24, decode_timestep=0.05,
                  generator=torch.Generator("cuda").manual_seed(sd)).frames[0]
    lt = carga(torch.float16)  # la T4 no tiene bfloat16 nativo: float16 va mucho más rápido
    for n, (k, p, sd, base, xn) in enumerate(todo):
        im = Image.open(f"{O}/imagenes/{k}.jpg").convert("RGB").resize((512, 768))
        fr = gen(lt, im, p, sd)
        if n == 0 and float(np.asarray(fr[len(fr) // 2], dtype=np.float32).mean()) < 5:
            print("float16 da negro: paso a bfloat16 (más lento)", flush=True)
            del lt; gc.collect(); torch.cuda.empty_cache(); lt = carga(torch.bfloat16); fr = gen(lt, im, p, sd)
        export_to_video(fr, f"/content/{k}.mp4", fps=24); os.system(f"cp /content/{k}.mp4 {O}/clips/{k}.mp4")
        print(f"Clip {n + 1} de {len(todo)}: {k}", flush=True)
print("CLIPS LISTOS", flush=True)
'''
L = ['from google.colab import drive; drive.mount("/content/drive")', 'import os, json, zipfile', f'os.makedirs({O!r}, exist_ok=True)']
if MODO == 'fase1':
    import os
    M = dict(P.get('musica') or {}); assert M.get('prompt'), 'falta "musica": {"prompt": ...} en plan.json'
    TLp = D + '/timeline.json'
    M['duracion'] = round(json.load(open(TLp))['total'] + 3) if os.path.exists(TLp) else round(len(' '.join(f['say'] for f in P['frases']).split()) / 3.2 + 6)
    CFG = {'out': O, 'style': STYLE, 'neg': NEG, 'musica': M,
           'imagenes': [(x['id'], x['prompt'], x.get('seeds', [1, 2]), x.get('neg', '')) for x in P['imagenes']]}
    L += [f'open("/content/cfg.json", "w").write(json.dumps({CFG!r}))',
          f'open("/content/imagenes.py", "w").write({SDXL!r})', f'open("/content/musica.py", "w").write({MUS!r})',
          '!pip -q install -U diffusers "transformers<5" accelerate 2>&1 | tail -2',
          f'!python -u /content/imagenes.py 2>&1 | grep -v AutoencoderKL | tee -a "{O}/log.txt"',
          '!pip -q install uv 2>&1 | tail -2',
          f'!([ -d /content/ace ] || git clone -q https://github.com/ACE-Step/ACE-Step-1.5.git /content/ace); cd /content/ace && git checkout -q {ACE} && uv sync -q 2>&1 | tail -5',
          f'!cd /content/ace && MPLBACKEND=Agg uv run python -u /content/musica.py 2>&1 | grep -v "DEBUG\\|INFO" | tail -15 | tee -a "{O}/log.txt"',
          f'Z = {O + "_fase1.zip"!r}; S = ["imagenes", "musica"]']
    QUE = 'imágenes y música'
elif MODO == 'clips':
    EL = P.get('elegidas') or {}; assert EL, 'primero elige las imágenes (plan.json -> elegidas)'
    IM = {x['id']: x for x in P['imagenes']}; F = P['frases']
    if P.get('clips'): base = P['clips']
    else:  # planos clave: gancho, frases con golpe y cierre (sin repetir), máx. 6
        fr = [F[0]] + [f for f in F if any(t.get('golpe') for t in f.get('textos', []))] + [F[-1]]
        base = list(dict.fromkeys(n for f in fr for n in f['planos']))[:6]
    MOVDEF = 'slow cinematic camera movement, subtle natural motion, realistic physics, smooth, high quality'
    JOBS = []
    for b in base:
        k = EL.get(b, b); i = IM[k.rsplit('_', 1)[0]]
        if k not in [j[0] for j in JOBS]: JOBS.append([k, i['prompt'] + ', ' + i.get('mov', MOVDEF), int(k.rsplit('_', 1)[1]), i['prompt'], i.get('neg', '')])
    CFG = {'out': O, 'clips': JOBS, 'style': STYLE, 'neg': NEG}
    L += [f'open("/content/cfg.json", "w").write(json.dumps({CFG!r}))', f'open("/content/clips.py", "w").write({LTX!r})',
          '!pip -q install -U diffusers "transformers<5" accelerate bitsandbytes sentencepiece imageio imageio-ffmpeg 2>&1 | tail -2',
          f'!python -u /content/clips.py 2>&1 | grep -v AutoencoderKL | tee -a "{O}/log.txt"',
          f'Z = {O + "_clips.zip"!r}; S = ["clips"]']
    QUE = f'{len(JOBS)} clips ({", ".join(j[0] for j in JOBS)})'
else:
    sys.exit('modo: fase1 | clips')
L += [f'z = zipfile.ZipFile(Z, "w"); _ = [z.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), {O!r})) for s in S + [""] for r, _d, fs in os.walk(os.path.join({O!r}, s)) for f in fs if s or f == "log.txt"]; z.close()',
      'print("LISTO. Está en tu Drive:", Z.replace("/content/drive/MyDrive/", "Mi unidad/"))',
      'exec("try:\\n from google.colab import files; files.download(Z)\\nexcept Exception as e: print(e)")']
out = '\n'.join(L) + '\n'
assert not any(l.startswith((' ', '\t')) for l in out.splitlines()), 'la celda no puede llevar sangrías'
compile('\n'.join(l for l in L if not l.startswith('!')), 'celda', 'exec')
for s in (SDXL, MUS, LTX): compile(s, 'script', 'exec')
open(f'{D}/celda_{MODO}.txt', 'w').write(out)
print(f'celda {MODO} ok: {QUE} -> {D}/celda_{MODO}.txt')
