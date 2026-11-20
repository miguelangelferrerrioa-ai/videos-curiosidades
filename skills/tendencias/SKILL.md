---
name: tendencias
description: Busca qué vídeos cortos de curiosidades/espacio están funcionando AHORA en el nicho del canal (datos reales de YouTube + noticias) y propone 5 temas para el próximo vídeo. Usar siempre que el usuario diga "nuevo vídeo", "tendencias", "qué subo", "qué está funcionando" o pida ideas de temas.
---

# Tendencias del nicho → 5 temas

1. **Datos de YouTube** (≈30 s, sin claves): en el repositorio `videos-curiosidades`,
   `.venv/bin/python motor/tendencias.py` → `canal/tendencias.md` con tres tablas:
   - **A) Funcionando AHORA**: Shorts recientes (los 12 últimos de cada canal) que multiplican la mediana de su canal.
   - **B) Lo más visto del nicho** en búsquedas en español e inglés.
   - **C) Formatos que destacan** (mayores múltiplos históricos).
   Canales de referencia en `canal/temas.md` → "Canales de referencia"; los nuevos que aparezcan con buenos datos,
   proponer añadirlos ahí.
2. **Actualidad** (en paralelo, WebSearch modo `extended`, español e inglés): noticias de espacio de esta semana
   (descubrimientos, lanzamientos, eclipses, lluvias de estrellas, cometas), y fechas próximas que den tirón.
3. **Cruzar**: un tema es bueno si (a) su FORMATO aparece en A o C (final trágico, "lo más grande/detallado jamás",
   ilusión, "¿y si…?", comparación de escala…) y (b) tiene noticia o interés actual. Adaptar ideas en inglés al
   español: lo que funciona en inglés y aún no está hecho en español es oro.
4. **Filtrar**: nada de temas ya hechos (`canal/temas.md` → "Hechos"); nunca analizar los vídeos antiguos del canal
   del usuario (solo los hechos con este sistema).
5. **Entregar 5 propuestas** ordenadas, cada una con: tema, gancho de la primera frase, por qué (múltiplo / visitas
   con enlace al Short de referencia, y la noticia si la hay). Corto. Él elige; anotar en `canal/temas.md`.

No inventar cifras: cada "por qué" lleva su dato de la tabla o su enlace.
