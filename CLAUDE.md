# Vídeos de curiosidades — instrucciones para Claude

Canal de vídeos cortos verticales (TikTok / Reels / Shorts) de curiosidades, en español, con narrador en off.
El dueño trabaja **desde el móvil**: responder siempre en español, corto y al grano. Él da una idea; Claude hace el resto.

## Al empezar una sesión
`./setup.sh` (entorno de Python + skills: yt-*, earshot, real-sound, enrutador; copia `canal/voice.md`).

## El flujo de un vídeo (idea → vídeo)
0. **Buscar temas virales** — SIEMPRE que diga "nuevo vídeo" (aunque traiga tema, comprobar si tiene tirón):
   - WebSearch (modo `extended`, varias búsquedas a la vez, en español e inglés): curiosidades/espacio más vistas
     en Shorts/TikTok/Reels este mes, noticias recientes (descubrimientos, lanzamientos, fenómenos en el cielo
     esta semana), rastreadores de hashtags (#space, #curiosidades, #espacio).
   - `/yt-viral` con datos reales de YouTube: `.venv/bin/yt-dlp --flat-playlist -J --playlist-end 40
     "https://www.youtube.com/@CANAL/shorts"` sobre los canales de referencia (`canal/temas.md`) y los que salgan en
     la búsqueda; ranking por múltiplo sobre la mediana de cada canal.
   - Entregarle **5 propuestas** ordenadas: tema, gancho de la primera frase, por qué tiene tirón (con la evidencia
     y los enlaces), y si hay noticia de actualidad que lo empuje. Nada de temas ya hechos (`canal/temas.md`).
     Él elige una; anotarla en `canal/temas.md`.
1. **Guion** — con `/yt-script` y `canal/voice.md`: gancho en el primer segundo, ~200 palabras (55–60 s),
   frases cortas, datos comprobados (nada inventado). Escribir `say` (números en letra, para la voz) y
   `show` (números en cifras, para los subtítulos).
2. **Plan** — `videos/NN-tema/plan.json` (copiar la estructura de `videos/01-venus/plan.json`):
   - `imagenes`: ~18–20 prompts en inglés para SDXL, 2 semillas cada uno; planos variados (gran plano, detalle,
     espacio, superficie), nada de texto ni personas. Formato vertical.
   - `frases`: cada una con `say`, `show`, `planos` (1–3 imágenes, cortes cada 2–3 s) y `textos`
     (cifras grandes: `t` = fracción de la frase, `hasta`, `pos`, `tam`, `color`, `contar`, `golpe`, `flash`).
     4–6 `golpe` en todo el vídeo (el primero arranca la batería, el último es la explosión final).
   - `camara`: por imagen `[movimiento, partículas, calor]`; movimientos: push pull orbitL orbitR crane rush
     drift spin; partículas: embers ash dust acid bubbles sparks none; calor 0–1.
3. **Celda de Colab** — `python3 motor/celda.py videos/NN-tema --solo-imagenes` → `celda_colab.txt`. Mandársela en un
   bloque de código: genera las imágenes + mapas de profundidad (SDXL + Depth Anything) y descarga un zip.
   **La voz se hace aquí**: `./setup.sh voz` y `HF_HUB_DISABLE_XET=1 .venv-voz/bin/python motor/voz_local.py videos/NN-tema`
   (Chatterbox en CPU con `voz/muestra.wav`, ~6 min), mientras él está en Colab. Va SIN sangrías (el editor del móvil las rompe).
   Recordarle: Entorno de ejecución → T4 GPU. Tarda ~20 min.
4. **Elegir imágenes** — con el zip: descomprimir en la carpeta del vídeo, `python3 motor/hojas.py videos/NN-tema`,
   mirar las hojas y poner en `plan.json` → `elegidas` la mejor semilla de cada prompt (`"a03": "a03_20"`).
   Descartar las que no encajan (planetas que parecen otros, objetos imposibles, texto).
5. **Montar** — `motor/montar.sh videos/NN-tema [zip]` → `videos/NN-tema/final.mp4` en 4K (~15 min de escalado + ~25 min de render). Antes, sacar 6–8
   fotogramas de prueba (`node motor/render.js videos/NN-tema t SEGUNDO salida.jpg`) y revisar que los textos no
   tapen lo importante. Medir el audio con earshot (`earshot measure`). Mandar el vídeo con SendUserFile, más
   título, descripción y hashtags (`/yt-package`, `/yt-seo`).
6. Commit del `plan.json` (las imágenes, la voz y el vídeo final NO se suben: están en .gitignore).

## Calidad de imagen (obligatorio)
- Exportar en **4K vertical (2160×3840)**; si no se puede, 2K (1440×2560). Nunca bajar a 1080p voluntariamente
  (`RES=1080` solo para borradores internos). Comprobar con ffprobe la resolución real antes de entregar.
- SDXL en la T4 de Colab genera ~832×1216: **no es 4K nativo**. Las imágenes elegidas se escalan ×4 con IA
  (Real-ESRGAN, `motor/escalar.py`, ~40 s/imagen en CPU) → 3328×4864, y el vídeo se renderiza a 4K a partir de ellas.
  Decirlo así al entregar: "renderizado en 4K a partir de imágenes escaladas ×4 con IA", nunca "4K nativo".
- Prompts: hiperrealistas, iluminación cinematográfica, texturas detalladas, sin texto. Descartar imágenes con
  artefactos, deformaciones o borrosas. Mantener un estilo coherente entre escenas.
- Movimientos suaves; el grano de película va más bajo en 4K para no ensuciar.

## Si la voz viene de ElevenLabs en un solo archivo
Guardarla como `videos/NN-tema/voz/narracion.wav`, `./setup.sh alinear` y
`python motor/alinear.py videos/NN-tema` → `voz/tiempos.json` (alinea cada frase por DTW contra una lectura de
referencia). render.js usa `tiempos.json` si existe.

## Límites de esta máquina
Sin GPU: imágenes y voz se generan en Colab. La red permite YouTube y Hugging Face (desde el 2026-11-19). El render (WebGL por software) va aquí.
