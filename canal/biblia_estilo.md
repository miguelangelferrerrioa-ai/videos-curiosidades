# Biblia de estilo visual — animaciones flat (vídeos modo "anim")

## 1. Línea
- **Cero contornos negros.** Formas definidas solo por planos de color: luz (base +12 % de luminosidad), base y sombra (base −18 %, un poco más fría).
- Bordes limpios y redondeados (radio mínimo ~6 px a 1080p). Nada de lineart, ni de trazos interiores oscuros.
- SDXL: positivo `no outlines, no line art, shapes defined by color only`; negativo `black outlines, thick lines, stroke, lineart, ink, sketch, comic`.

## 2. Paleta (noche sofisticada)
| Uso | Color |
|---|---|
| Fondo base (medianoche) | #14163A → #2A1B4F (degradado lineal de arriba abajo) |
| Púrpura profundo | #3B2470 · #5B3A9E |
| Azul medio | #3F5BD9 · #6C8BFF |
| Rosa neón (acentos, momento clave) | #FF5FA2 |
| Verde médico suave (cerebro, salud, hospital) | #6EE7B7 · #2F9E7E |
| Piel | #F2B48C (luz #F8C9A6, sombra #D98E6C) |
| Texto y etiquetas | #FFFFFF sobre pastilla #0F1232 al 82 % |
| Cifras clave | amarillo #FFD23F; peligro #FF5A4A |
- Cada escena tiene un color dominante, un secundario y **un solo acento**.
- Degradados lineales suaves (máx. 2 colores, diferencia ≤ 20 % de luminosidad); nada de degradados arcoíris.

## 3. Luz y sombras
- Una sola fuente de luz: arriba a la izquierda (≈ 10 h). Todas las sombras caen abajo a la derecha.
- **Sombra de contacto** bajo cada objeto o personaje apoyado: elipse #0A0820 al 35 %, desenfoque 24 px, ancho = 80 % del objeto. Objetos que flotan (cerebro, iconos): elipse más pequeña y más tenue, y se mueve con el balanceo.
- Luz de borde (rim light) del color del acento de la escena, al 25 %, en el lado contrario a la luz: integra el objeto en el ambiente.
- Viñeta suave en el fondo (bordes −15 %) para centrar la mirada.

## 4. Cohesión
- Mismo nivel de detalle en todo: máx. 3 tonos por superficie y rasgos faciales simples (ojos de punto u ovalados, boca de una forma, sin nariz detallada).
- Personajes: cabeza grande (1/5 del cuerpo), proporciones redondeadas, manos simplificadas (4 dedos).
- **Grano** igual en todos los elementos: ruido monocromo al 4–6 % sobre el fotograma entero (no por objeto), para que todo parezca del mismo ilustrador.
- Escala relativa coherente: en el mismo plano, una persona ≈ 45 % del alto de la pantalla, objetos de mano ≈ 12 %.

## 5. Elementos del vídeo 05 (bostezo)
- **Fondo del metro:** vagón en perspectiva frontal; asientos #3B2470, ventanas #14163A con luces de túnel pasando (#6C8BFF difuminado), suelo con degradado #2A1B4F→#1A1440, viñeta.
- **Cara del gancho:** primer plano frontal, piel con 3 tonos, boca abierta #5A1E3C con lengua #FF8FA8, ojos cerrados como arcos del tono de la piel en sombra; fondo azul medianoche liso con brillo rosa detrás.
- **Pasajeros (4):** sentados, misma altura de cabeza; ropa en púrpura, azul y verde de la paleta; al bostezar, un anillo de aura amarillo (#FFD23F al 40 %) que crece y se apaga.
- **Móvil en mano:** carcasa #1A1440, pantalla #F4F1FF con la palabra "bostezo" en #3F5BD9; brillo de la pantalla en la mano.
- **Cabeza con cerebro:** perfil de piel al 70 % de opacidad; cerebro rosa #FF8FB8 con sombras #D45C8E; el aire frío entra como 3 cintas curvas #6EE7B7 animadas.
- **Termómetro:** cuerpo #F4F1FF y líquido que baja de #FF5A4A a #6C8BFF.
- **Grupo (familia, amigos, desconocido):** colocados en arco; líneas de conexión punteadas, gruesas (8 px, #FF5FA2) hacia la familia y finas (2 px, blancas al 40 %) hacia el desconocido.
- **Perro:** marrón cálido #C9824E (sombra #9E5F36), boca abierta igual que la cara humana; sombra de contacto.
- **Cierre:** vuelve la cara del gancho (bucle) con el fondo rosa neón más intenso.

## 6. Cómo se aplica en el código
- Sprites: el prompt de SDXL lleva el bloque de estilo de abajo; recorte con rembg; el sprite **no** lleva sombra propia (se añade en Remotion).
- Remotion: `<Shadow>` elíptica bajo cada sprite, rim light con `drop-shadow` del color del acento al 25 %, viñeta y grano SVG (feTurbulence) sobre el fotograma.
- Bloque de estilo SDXL: `flat vector illustration, no outlines, no line art, shapes defined by color only, soft cel shading with 3 tones, simple rounded shapes, cute minimal character design, deep purple and midnight blue palette, subtle neon pink accents, clean edges, motion graphics explainer style`.
