# Vídeos de curiosidades

Fábrica de vídeos cortos verticales (TikTok / Reels / Shorts): una idea → un vídeo de ~1 minuto con imágenes de IA,
cámara en 3D, efectos, subtítulos palabra a palabra, música con ritmo, efectos de sonido y voz clonada.

## Cómo se hace un vídeo
1. Le das una idea a Claude ("curiosidades de Marte").
2. Claude te pasa el guion y una **celda de Colab**. La pegas en colab.research.google.com
   (Entorno de ejecución → T4 GPU), le das a ▶ y esperas ~20 min. Se descarga un zip.
3. Le pasas el zip a Claude y te devuelve el vídeo terminado, con título, descripción y hashtags.

## Qué hay aquí
- `motor/` — el montaje: `scene.html` (cámara 3D con mapas de profundidad, partículas, textos), `render.js`,
  `audio.py` (música + efectos de [earshot](https://github.com/Leonxlnx/earshot) en `motor/sfx`),
  `celda.py` (genera la celda de Colab), `montar.sh`.
- `voz/muestra.wav` — muestra de la voz del canal (diseñada en ElevenLabs) para clonarla.
- `canal/voice.md` — el estilo del canal, para las skills de guion.
- `videos/NN-tema/plan.json` — el plan de cada vídeo (guion, prompts, planos, textos, cámara).
