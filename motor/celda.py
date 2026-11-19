# Genera la celda de Colab de un vídeo (imágenes + mapas de profundidad + voz clonada) a partir de plan.json.
# Uso: python3 motor/celda.py videos/<nombre>   -> escribe videos/<nombre>/celda_colab.txt
# La celda va SIN sangrías (el editor de Colab en el móvil las rompe al pegar): todo en líneas sueltas.
import json, sys
D = sys.argv[1]; P = json.load(open(D + '/plan.json'))
REPO = 'miguelangelferrerrioa-ai/videos-curiosidades'
MUESTRA = f'https://raw.githubusercontent.com/{REPO}/main/voz/muestra.wav'
STYLE = P.get('estilo', 'cinematic, photorealistic, dramatic lighting, highly detailed, 35mm film still')
NEG = P.get('negativo', 'text, letters, watermark, logo, blurry, lowres, cartoon, deformed, people')
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
solo_voz = '--solo-voz' in sys.argv
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
L += [f'open("frases.json", "w").write(json.dumps({FR!r}))',
      f'urllib.request.urlretrieve({MUESTRA!r}, "muestra.wav")',
      f'open("voz.py", "w").write({VOZ!r})',
      '!pip -q install chatterbox-tts',
      '!python voz.py',
      f'z = zipfile.ZipFile({P.get("nombre", "video") + ".zip"!r}, "w"); _ = [z.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), "out")) for r, _d, fs in os.walk("out") for f in fs]; z.close()',
      f'from google.colab import files; files.download({P.get("nombre", "video") + ".zip"!r})']
out = '\n'.join(L) + '\n'
assert not any(l.startswith((' ', '\t')) for l in out.splitlines()), 'la celda no puede llevar sangrías'
compile('\n'.join(l for l in L if not l.startswith('!')), 'celda', 'exec')  # comprobación de sintaxis
open(D + '/celda_colab.txt', 'w').write(out)
print(f'celda ok: {len(J)} prompts, {sum(len(x[2]) for x in J)} imágenes, {len(FR)} frases -> {D}/celda_colab.txt')
