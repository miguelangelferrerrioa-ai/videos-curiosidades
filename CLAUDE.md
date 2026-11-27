# Vídeos de curiosidades — instrucciones para Claude

Canal de vídeos cortos verticales (TikTok / Reels / Shorts) de curiosidades, en español, con narrador en off.
El dueño trabaja **desde el móvil**: responder siempre en español, **máximo 2 líneas por respuesta** (tiene pocos tokens). Él da una idea; Claude hace el resto.

## Al empezar una sesión
`./setup.sh && ./setup.sh voz` en segundo plano (~10 min): entorno de Python, Node (mapas), 614 efectos CC0, skills (yt-script,
yt-viral, yt-package, yt-seo, earshot, verification-before-completion, systematic-debugging, caveman) y Whisper + earshot
(`.venv-voz`, para partir la voz de ElevenLabs y escuchar el audio). Copia `canal/voice.md`.

## ⭐ FORMATO DEL CANAL (desde 2026-11-25): animación vectorial SVG en Remotion — es EXACTAMENTE lo que él quiere
Referencia aprobada: `videos/05-bostezo` → `anim/src/BostezoSVG.tsx`. Estilo @1mdatos / @NEXO.sciences. Todo vídeo nuevo, así:
1. Temas (`/tendencias`, variados, no solo espacio) → guion escena por escena (`videos/NN/guion.md`: tiempo, visual, voz, palabra clave),
   **MÍNIMO 60 s** (él lo exige; ~185 palabras con Dan a 1.2 → 62–66 s), gancho fuerte en 3 s y cierre en bucle con el gancho. **Fotograma 0 lleno** (protagonista ya en pantalla, `inT="none"`,
   nada de fundidos desde negro): en el 05 la portada/primer fotograma salió vacío y solo el 45 % se quedó a verlo (meta: >70 %). `plan.json`: `frases` con `say`, `show`, `clave` y `color`; `musica`.
2. Ilustraciones **100 % SVG en línea** (`anim/src/vec/arte.tsx`: Persona, Cabeza que bosteza, Perro, Cerebro, CabezaPerfil, Movil,
   Termometro, fondos Metro/Noche/Salon/Abstracto…). Ampliar esa librería con lo que pida cada tema. NADA de imágenes de SDXL ni recortes.
   Reglas visuales: `canal/biblia_estilo.md` (sin contornos negros, paleta nocturna, sombras de contacto, grano).
3. Movimiento: `anim/src/lib/motion.tsx` (nada quieto, easing, transiciones whip/fade/zoomThrough, punch en palabras clave).
   Subtítulos: `anim/src/lib/captions.tsx` (grupos de 2–3 palabras arriba, clave en color al pronunciarse).
4. Colab: solo la **música** (`python3 motor/celdas.py videos/NN fase1` con `"imagenes": []`). Voz: Dan (ElevenLabs) a 1.2, sin acelerar.
5. `partir_narracion.py` → `.venv/bin/python motor/anim_datos.py videos/NN 0.42` (tiempos en `anim/src/<nombre>.json`) →
   componente `anim/src/<Nombre>SVG.tsx` registrado en `anim/src/Root.tsx` → fotogramas de prueba con `npx remotion still`
   (de uno en uno: en paralelo se queda sin memoria) → `anim_sfx` en plan.json + `.venv-voz/bin/python motor/anim_audio.py videos/NN`
   → `npx remotion render src/index.ts <Id> out.mp4 --browser-executable=/opt/pw-browsers/chromium --concurrency=2` + ffmpeg con
   `mezcla_anim.wav` → `videos/NN/final_anim.mp4`. Revisar tira de fotogramas y loudness antes de mandar.
El flujo antiguo de abajo (imágenes SDXL + motor/render.js) queda solo como respaldo.

## Flujo antiguo (respaldo): imágenes SDXL + render.js — objetivo ~1 h, él solo pega 2 celdas y genera la voz en ElevenLabs
0. **Temas** — SIEMPRE que diga "nuevo vídeo" (aunque traiga tema): skill `/tendencias` (`motor/tendencias.py`, datos reales de
   YouTube + noticias con WebSearch) → 5 propuestas con su evidencia. Él elige; anotarla en `canal/temas.md`.
1. **Guion** — gancho con `/viral-hooks` (lote de 6–10 en 3 capas; elegir yo el mejor), resto con `/yt-script` y `canal/voice.md`.
   **61–65 s** (~215 palabras): TikTok solo paga vídeos de más de 1 minuto. Frases cortas, datos comprobados con fuentes.
   `say` (números en letra, para la voz) y `show` (cifras, para subtítulos).
2. **Plan** — `videos/NN-tema/plan.json` (copiar la estructura de `videos/03-voyager/plan.json`, el más completo):
   - `imagenes`: ~18–20 prompts en inglés para SDXL, 2 semillas cada uno; planos variados, nada de texto. **Estilo gráfico SIEMPRE 3D animado estilizado** (`canal/estilo.md`); si salen personas, en ese mismo estilo 3D. Modo animación (Remotion, `anim/`): seguir `canal/biblia_estilo.md`.
     `mov` opcional (movimiento explícito para los clips, en inglés).
   - `frases`: `say`, `show`, `planos` (1–3 imágenes, cortes cada 2–3 s), `textos` (cifras grandes: `t` = fracción de la frase,
     `hasta`, `pos`, `tam`, `color`, `contar`, `golpe`, `flash`; 4–6 `golpe` en todo el vídeo) y `sfx` (ver abajo).
   - `mapa` (opcional, en una frase): globo con países reales sobre la imagen oscurecida (lanzamientos, meteoritos, eclipses…).
     `vuela`: `[lon, lat, zoom]` por los que pasa la cámara (zoom 1 = globo entero, 3 = un país; un solo punto = gira despacio);
     `ruta`: `[[lon, lat], …]` dibujada entre `ruta_t` (`[0.15, 0.85]`); `marcas`: `[{"en": [lon, lat], "texto": "…", "t": 0.6}]`;
     `t`/`hasta`: fracción de la frase; `frases`: cuántas dura. Coordenadas: buscarlas, nunca inventarlas.
   - `sfx` (por frase): `[{"id": "glitch/dropout", "t": 0.6, "g": 0.5}]` (el pico cae en esa fracción de la frase). Ids: 252 del
     banco de earshot (`earshot sfx list`; `dur`/`pitch` opcionales) y 614 CC0 (`motor/sfx/cc0/indice.txt`, `cc0:…`). Elegirlos
     por lo que dice la frase, escucharlos antes con `earshot describe`, y que no tapen palabras clave (Whisper sobre `mezcla.wav`).
   - `camara`: por imagen `[movimiento, partículas, calor]` (push pull orbitL orbitR crane rush drift spin;
     embers ash dust acid bubbles sparks none; calor 0–1).
   - `musica`: `{"prompt": "…en inglés, instrumental…", "bpm": 100, "seed": 7}`; tras elegir, `"elegida": "m_0"`.
3. **Celda fase1** — `python3 motor/celdas.py videos/NN-tema fase1` → `celda_fase1.txt`; mandársela COMPLETA en un bloque de código
   (Colab → Entorno de ejecución → T4 GPU; ~25 min). Imágenes + mapas de profundidad + 2 músicas (ACE-Step 1.5, MIT). Guarda en su
   Drive (`Mi unidad/videos-curiosidades/<nombre>/`) y, si Colab se corta, al volver a ejecutar sigue donde iba. Me pasa
   `<nombre>_fase1.zip`. Las celdas van SIN sangrías (el editor del móvil las rompe).
4. **Voz (a la vez)** — él la genera en **ElevenLabs** (plan de pago: el gratis no permite monetizar). **Voz del canal (elegida
   2026-11-22):** estilo de su referencia (`canal/voz_ref/voz_canal.wav`, no se sube): hombre joven de España, tono medio-grave
   (~120 Hz), cercano, rápido (~3,5 palabras/s), seguro y algo pícaro, pausas antes de revelar. Voz: **Dan - Upbeat Dynamic and
   Friendly** (biblioteca ElevenLabs; a Speed 1.0 va a ~2,4 p/s → acelerar hasta ~3,5 p/s como la referencia),
   Multilingual v2, Speed ~1.15–1.2, **guion entero de una vez** (mandarle el texto de `say` seguido). Guardarla en
   `videos/NN-tema/voz_eleven/narracion.wav` y `HF_HUB_DISABLE_XET=1 .venv-voz/bin/python motor/partir_narracion.py videos/NN-tema
   videos/NN-tema/voz_eleven/narracion.wav` → `voz/vo_XX.wav` + `voz/palabras.json` (subtítulos y efectos al milisegundo).
   Sin ElevenLabs: `motor/voz_local.py` (Chatterbox en CPU, suena más a IA). Cambiar de voz sin tocar el montaje: guardar la vieja
   en `voz_A/` y `python motor/igualar_ritmo.py videos/NN-tema videos/NN-tema/voz_A`.
5. **Elegir (yo, sin preguntarle)** — descomprimir el zip en la carpeta del vídeo, `python3 motor/hojas.py videos/NN-tema`, mirar las
   hojas y poner en `elegidas` la mejor semilla de cada prompt (`"a03": "a03_20"`); descartar texto, deformaciones, planetas que
   parecen otros. Música: `earshot describe` + curva de volumen; la que suba en el clímax.
6. **Clips (opcional)** — `python3 motor/celdas.py videos/NN-tema clips` → imagen a vídeo (LTX-Video 2B) SOLO de planos clave
   (gancho, golpes, cierre; máx. 6, o `"clips": [...]`). **Lección (vídeo 03):** LTX 2B apenas mueve escenas espaciales estáticas
   y a veces se funde a negro o se deforma pasados ~1,7 s: medir el movimiento de cada clip y quedarse con los que se mueven
   (`clip_max`: `{"c18": 40}` fotogramas buenos; `clip_no`: `["c04"]` = foto con cámara 3D). Planos largos: el clip va y vuelve.
7. **Borrador** — `RES=1080 motor/montar.sh videos/NN-tema` (~10 min) → mandárselo. Antes, fotogramas de prueba
   (`node motor/render.js videos/NN-tema t SEGUNDO salida.jpg`): que los textos no tapen lo importante.
8. **Final** — cuando lo apruebe: `RES=2k` (lo que pidió en el vídeo 03) o 4K por defecto, en segundo plano (~30–40 min).
9. **Revisión obligatoria antes de mandar nada** — `motor/revisar.sh videos/NN-tema` → `RESULTADO: OK` + mirar `revision/hoja.jpg`
   (no detecta todo: en el vídeo 03 dio OK con planos sin imagen). `earshot measure` del audio y Whisper sobre la mezcla.
   Skill `verification-before-completion`: nada de "listo" sin esa salida delante. Si algo falla, `systematic-debugging`.
10. **Entregar** — SendUserFile + título, portada, descripción, hashtags y comentario fijado (`/yt-package`, `/yt-seo`,
   `/viral-captions-and-ctas`) en `videos/NN-tema/publicar.md`, recordándole marcar **contenido con IA** al subir.
11. Commit + push de `plan.json`, `publicar.md` y celdas (imágenes, voz, clips, música y vídeo NO se suben: .gitignore).

**Monetizar:** YouTube paga contenido con IA si es original y está declarado; lo que no paga es lo "inauténtico" (vídeos
en serie casi iguales): cada vídeo con tema, guion y montaje propios. Celdas antiguas (`motor/celda.py --solo-imagenes /
--musica / --clips`, sin Drive) siguen valiendo como respaldo.

## Calidad de imagen (obligatorio)
- Exportar en **4K vertical (2160×3840)** o, si él lo pide, 2K (1440×2560). Nunca bajar a 1080p voluntariamente
  (`RES=1080` solo para borradores internos). Comprobar con ffprobe la resolución real antes de entregar.
- SDXL en la T4 de Colab genera ~832×1216: **no es 4K nativo**. Las imágenes elegidas se escalan ×4 con IA
  (Real-ESRGAN, `motor/escalar.py`, ~40 s/imagen en CPU) → 3328×4864, y el vídeo se renderiza a 4K a partir de ellas.
  Decirlo así al entregar: "renderizado en 4K a partir de imágenes escaladas ×4 con IA", nunca "4K nativo".
- Prompts: hiperrealistas, iluminación cinematográfica, texturas detalladas, sin texto. Descartar imágenes con
  artefactos, deformaciones o borrosas. Mantener un estilo coherente entre escenas.
- Movimientos suaves; el grano de película va más bajo en 4K para no ensuciar.

## Límites de esta máquina
Sin GPU: imágenes, música y clips se generan en Colab; la voz, en ElevenLabs. La red permite YouTube y Hugging Face (desde el 2026-11-19). El render (WebGL por software) va aquí.
