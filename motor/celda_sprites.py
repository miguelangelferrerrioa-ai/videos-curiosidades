# Genera la celda de Colab para los SPRITES (personajes y objetos sueltos, fondo transparente) y FONDOS de la animación Remotion.
# Uso: python3 motor/celda_sprites.py videos/NN-tema  -> videos/NN-tema/celda_sprites.txt   (lee plan.json -> "sprites", "fondos")
import json, sys
D = sys.argv[1]; P = json.load(open(D + '/plan.json')); N = P['nombre']
ST = P.get('estilo_anim', 'flat vector illustration, simple geometric shapes, bold flat colors, soft subtle gradients, clean minimal 2D, cute rounded character design, explainer animation style')
cfg = {'out': f'/content/drive/MyDrive/videos-curiosidades/{N}_anim', 'style': ST,
       'sprites': [[s['id'], s['prompt'], s.get('seeds', [1, 2])] for s in P['sprites']],
       'fondos': [[s['id'], s['prompt'], s.get('seeds', [1, 2])] for s in P.get('fondos', [])]}
code = '''import os, json, torch
C = json.load(open("/content/cfg.json")); O = C["out"]; os.makedirs(O, exist_ok=True)
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from rembg import remove, new_session
pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True).to("cuda")
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config, use_karras_sigmas=True); pipe.set_progress_bar_config(disable=True)
ses = new_session("isnet-general-use"); NEG = "text, letters, watermark, logo, blurry, photo, photorealistic, 3d render, deformed, extra fingers, shadow on floor, frame, border"
for kind, L in (("sprite", C["sprites"]), ("fondo", C["fondos"])):
    for n, p, seeds in L:
        for sd in seeds:
            f = f"{O}/{n}_{sd}.png"
            if os.path.exists(f): continue
            if kind == "sprite":
                im = pipe(p + ", isolated on a plain pure white background, centered, full body, " + C["style"], negative_prompt=NEG, width=1024, height=1024, num_inference_steps=30, guidance_scale=7, generator=torch.Generator("cuda").manual_seed(sd)).images[0]
                remove(im, session=ses, post_process_mask=True).save(f)
            else:
                im = pipe(p + ", empty scene, no people, " + C["style"], negative_prompt=NEG + ", people, person", width=832, height=1216, num_inference_steps=30, guidance_scale=6.5, generator=torch.Generator("cuda").manual_seed(sd)).images[0]
                im.save(f)
            print("hecho", n, sd, flush=True)
print("SPRITES LISTOS", flush=True)
'''
cell = f'''from google.colab import drive; drive.mount("/content/drive")
import json, os, zipfile
open("/content/cfg.json", "w").write(json.dumps({json.dumps(cfg, ensure_ascii=False)}))
open("/content/sprites.py", "w").write({json.dumps(code)})
!pip -q install -U diffusers "transformers<5" accelerate "rembg[gpu]" 2>&1 | tail -2
!python -u /content/sprites.py 2>&1 | grep -v Warn
Z = "/content/drive/MyDrive/videos-curiosidades/{N}_anim.zip"; O = "{cfg['out']}"
z = zipfile.ZipFile(Z, "w"); _ = [z.write(os.path.join(O, f), f) for f in sorted(os.listdir(O))]; z.close()
print("LISTO. En tu Drive:", Z.replace("/content/drive/MyDrive/", "Mi unidad/"), round(os.path.getsize(Z) / 1e6), "MB")
exec("try:\\n from google.colab import files; files.download(Z)\\nexcept Exception as e: print(e)")
'''
open(D + '/celda_sprites.txt', 'w').write(cell); print('celda sprites ok ->', D + '/celda_sprites.txt')
