# Vídeos de curiosidades — instrucciones para Claude

Canal de vídeos cortos verticales (TikTok / Reels / Shorts) de curiosidades, en español, con narrador en off.
El dueño trabaja **desde el móvil**: responder siempre en español, corto y al grano. Él da una idea; Claude hace el resto.

## Al empezar una sesión
`./setup.sh` (entorno de Python + skills: yt-script, yt-viral, yt-package, yt-seo, earshot, verification-before-completion,
systematic-debugging, caveman; copia `canal/voice.md`).

## El flujo de un vídeo (idea → vídeo)
**Rápido y sin perder nada** (objetivo: ~1 h, él solo pega 2 celdas): las celdas de `motor/celdas.py` guardan todo en su
Google Drive (`Mi unidad/videos-curiosidades/<nombre>/`) y, si Colab se corta, al volver a ejecutar siguen donde iban.
- **fase1** (`python3 motor/celdas.py videos/NN-tema fase1`): imágenes + mapas de profundidad + música en UNA celda (~25 min).
  Mientras, la voz se hace aquí. Al llegar `<nombre>_fase1.zip`: elijo YO imágenes y música (sin preguntarle).
- **clips** (`… clips`): imagen a vídeo SOLO de los planos clave (gancho, golpes, cierre; máx. 6, o `"clips": [...]` en plan.json),
  con las imágenes elegidas que ya están en Drive (~15 min + descarga del modelo).
- **Borrador a 1080** (`RES=1080 motor/montar.sh videos/NN-tema zip…`, ~5 min) para que lo vea; el **4K** solo cuando lo apruebe,
  en segundo plano. Las celdas antiguas (`motor/celda.py --solo-imagenes / --musica / --clips`) siguen valiendo.
0. **Buscar temas virales** — SIEMPRE que diga "nuevo vídeo" (aunque traiga tema): skill `/tendencias`
   (`motor/tendencias.py` con datos reales de YouTube + noticias con WebSearch) → 5 propuestas con su evidencia.
   Él elige una; anotarla en `canal/temas.md`.
1. **Guion** — gancho con `/viral-hooks` (lote de 6–10 en 3 capas: imagen, voz y texto en pantalla; elegir el mejor),
   resto con `/yt-script` y `canal/voice.md`: gancho en el primer segundo, ~200 palabras (55–60 s),
   frases cortas, datos comprobados (nada inventado). Escribir `say` (números en letra, para la voz) y
   `show` (números en cifras, para los subtítulos).
2. **Plan** — `videos/NN-tema/plan.json` (copiar la estructura de `videos/01-venus/plan.json`):
   - `imagenes`: ~18–20 prompts en inglés para SDXL, 2 semillas cada uno; planos variados (gran plano, detalle,
     espacio, superficie), nada de texto ni personas. Formato vertical.
   - `frases`: cada una con `say`, `show`, `planos` (1–3 imágenes, cortes cada 2–3 s) y `textos`
     (cifras grandes: `t` = fracción de la frase, `hasta`, `pos`, `tam`, `color`, `contar`, `golpe`, `flash`).
     4–6 `golpe` en todo el vídeo (el primero arranca la batería, el último es la explosión final).
   - `mapa` (opcional, en una frase): globo terráqueo con países reales sobre la imagen oscurecida (para lugares:
     lanzamientos, caídas de meteoritos, eclipses…). `vuela`: puntos `[lon, lat, zoom]` por los que pasa la cámara
     (zoom 1 = globo entero, 3 = un país; un solo punto = gira despacio); `ruta`: `[[lon, lat], …]` que se dibuja
     entre `ruta_t` (fracciones, por defecto `[0.15, 0.85]`); `marcas`: `[{"en": [lon, lat], "texto": "CABO CAÑAVERAL", "t": 0.6}]`;
     `t`/`hasta`: desde/hasta qué fracción de la frase (por defecto la frase entera); `frases`: cuántas frases dura (1). Las etiquetas no salen en la franja de los textos grandes de arriba.
     Coordenadas: buscarlas, nunca inventarlas.
   - `camara`: por imagen `[movimiento, partículas, calor]`; movimientos: push pull orbitL orbitR crane rush
     drift spin; partículas: embers ash dust acid bubbles sparks none; calor 0–1.
   - `sfx` (por frase): `[{"id": "glitch/dropout", "t": 0.6, "g": 0.5}]` → el pico del efecto cae en esa fracción de la frase.
     Ids: los 252 del banco de earshot (`earshot sfx list`, p. ej. `shutter/film`, `logo_sting/spark`; `dur`/`pitch` opcionales) y
     614 CC0 de Hugging Face (`motor/sfx/cc0/indice.txt`, p. ej. `cc0:sfx-kit/sounds/digital/digital-power-down`; los descarga
     `motor/sfx_cc0.sh`). Elegirlos por lo que dice la frase, escucharlos antes con `earshot describe` y no taparle palabras clave
     a la voz (comprobar con Whisper sobre `mezcla.wav`).
   - `musica`: `{"prompt": "…en inglés, instrumental…", "bpm": 100, "seed": 7}` → música con IA (paso 3b). Tras elegir: `"elegida": "m_0"`.
3. **Celda de Colab** — `python3 motor/celda.py videos/NN-tema --solo-imagenes` → `celda_colab.txt`. Mandársela en un
   bloque de código: genera las imágenes + mapas de profundidad (SDXL + Depth Anything) y descarga un zip.
   **La voz se hace aquí**: `./setup.sh voz` y `HF_HUB_DISABLE_XET=1 .venv-voz/bin/python motor/voz_local.py videos/NN-tema`
   (Chatterbox en CPU con `voz/muestra.wav`). Cada frase se ESCUCHA con Whisper: si no se entiende igual que el guion
   se repite (3 intentos) y guarda los tiempos reales de cada palabra en `voz/palabras.json` (subtítulos y textos
   sincronizados al milisegundo). Palabras en inglés: escribir en `say` cómo se pronuncian en español. Va SIN sangrías (el editor del móvil las rompe).
   Recordarle: Entorno de ejecución → T4 GPU. Tarda ~20 min.
3b. **Música con IA** — `python3 motor/celda.py videos/NN-tema --musica` → `celda_musica.txt` (ACE-Step 1.5, licencia MIT: se
   puede monetizar). Va en un entorno de Colab NUEVO (T4), aparte de las imágenes. Saca 2 versiones en `musica.zip`: descomprimir
   en la carpeta del vídeo, escucharlas con earshot y poner la mejor en `musica.elegida`. Sin música elegida, `audio.py` usa la sintetizada.
4. **Elegir imágenes** — con el zip: descomprimir en la carpeta del vídeo, `python3 motor/hojas.py videos/NN-tema`,
   mirar las hojas y poner en `plan.json` → `elegidas` la mejor semilla de cada prompt (`"a03": "a03_20"`).
   Descartar las que no encajan (planetas que parecen otros, objetos imposibles, texto).
4b. **Imagen a vídeo (opcional)** — `python3 motor/celda.py videos/NN-tema --clips` → `celda_clips.txt` (LTX-Video 2B en la T4,
   Colab NUEVO; rehace las elegidas con su semilla y las anima en clips de 3 s, 512×768, ~1–2 min por clip). Movimiento por imagen:
   campo opcional `mov` en `imagenes` (en inglés; si no, uno genérico suave). `clips.zip` → descomprimir en la carpeta del vídeo;
   `montar.sh` extrae los fotogramas (`motor/clips.py`) y el clip sustituye a la foto (sin paralaje 3D). Los clips son de menos
   resolución que las fotos escaladas: revisar nitidez. **Lección (vídeo 03):** LTX 2B apenas mueve paisajes espaciales estáticos
   (estrellas, planetas, antenas: cambio ~1/255) y a veces se funde a negro o se deforma pasados ~1,7 s. Medir el movimiento de cada
   clip y quedarse solo con los que se mueven; en plan.json `clip_max` (`{"c18": 40}` = solo los 40 primeros fotogramas) y
   `clip_no` (`["c04"]` = usar la foto con cámara 3D). Los planos más largos que el clip lo reproducen adelante y atrás. Pedir
   movimiento explícito en `mov` (p. ej. "the probe drifts slowly to the left, antenna rotating"). Licencia LTXV: libre salvo empresas con ≥10 M$/año; declarar contenido IA.
5. **Montar** — `motor/montar.sh videos/NN-tema [zip]` → `videos/NN-tema/final.mp4` en 4K (~15 min de escalado + ~25 min de render). Antes, sacar 6–8
   fotogramas de prueba (`node motor/render.js videos/NN-tema t SEGUNDO salida.jpg`) y revisar que los textos no
   tapen lo importante. Medir el audio con earshot (`earshot measure`). Mandar el vídeo con SendUserFile, más
   título, descripción, hashtags y comentario fijado (`/yt-package`, `/yt-seo`, `/viral-captions-and-ctas`).
5b. **Revisión obligatoria antes de mandar nada** — `motor/revisar.sh videos/NN-tema` tiene que decir
   `RESULTADO: OK` (resolución real, duración = línea de tiempo, sin negros, textos que no se pisan, volumen) y hay que
   mirar `revision/hoja.jpg` (orden de escenas, textos). Con la skill `verification-before-completion`: nada de
   "listo" sin esa salida delante. Si algo falla, `systematic-debugging`: causa raíz antes de parchear.
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
