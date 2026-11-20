#!/usr/bin/env bash
# Monta el vídeo final.
#   motor/montar.sh videos/<nombre> [zip_de_colab]
# 1) si se pasa el zip, lo descomprime (imagenes/ y voz/) en la carpeta del vídeo
# 2) recorta silencios de la voz, crea la línea de tiempo y la mezcla de audio
# Resolución: RES=4k (por defecto, 2160x3840) | 2k (1440x2560) | 1080 (borrador)
# 3) renderiza en 4 trozos en paralelo, une, añade el audio y comprime -> videos/<nombre>/final.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
D="$1"; PY=.venv/bin/python
[ -x "$PY" ] || { echo "Falta el entorno: ejecuta ./setup.sh"; exit 1; }
if [ "${2:-}" != "" ]; then
  T=$(mktemp -d); unzip -o -q "$2" -d "$T"
  mkdir -p "$D/imagenes" "$D/voz"
  [ -d "$T/imagenes" ] && cp "$T"/imagenes/* "$D/imagenes/"
  [ -d "$T/voz" ] && cp "$T"/voz/* "$D/voz/"
  [ -d "$T/clips" ] && mkdir -p "$D/clips" && cp "$T"/clips/*.mp4 "$D/clips/"
  rm -rf "$T"
fi
$PY motor/recortar_voz.py "$D"
[ -d "$D/clips" ] && $PY motor/clips.py "$D"  # clips de imagen a vídeo (si los hay)
# Superresolución x4 por IA de las imágenes elegidas (no es 4K nativo: SDXL genera ~832x1216)
[ "${RES:-4k}" = "1080" ] || $PY motor/escalar.py "$D"
node motor/render.js "$D" solo-timeline
$PY motor/audio.py "$D"
TOTAL=$($PY -c "import json;print(json.load(open('$D/timeline.json'))['total'])")
SEG=$($PY -c "print(round($TOTAL/4+0.01,2))")
for k in 0 1 2 3; do
  A=$($PY -c "print(round($k*$SEG,2))"); B=$($PY -c "print(round(($k+1)*$SEG,2))")
  node motor/render.js "$D" "$A" "$B" "$D/seg$k.mp4" > "$D/seg$k.log" 2>&1 &
  # Como mucho PAR renders a la vez: con 4 en paralelo en 4K el WebGL por software pierde las texturas
  # (fondo negro y estelas en los últimos trozos, sin error ni duración corta). Por defecto 2.
  [ $(( (k+1) % ${PAR:-2} )) -eq 0 ] && wait
done
wait
grep -h ERR "$D"/seg*.log && exit 1 || true
# Comprobar cada trozo: si uno sale corto (p. ej. el proceso murió por memoria en 4K), repetirlo solo
for k in 0 1 2 3; do
  A=$($PY -c "print(round($k*$SEG,2))"); B=$($PY -c "print(round(min(($k+1)*$SEG,$TOTAL),2))")
  for intento in 1 2; do
    DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/seg$k.mp4" 2>/dev/null || echo 0)
    $PY -c "import sys;sys.exit(0 if float('${DUR:-0}')>=$B-$A-0.1 else 1)" && break
    echo "trozo $k corto ($DUR s), repitiendo..."; node motor/render.js "$D" "$A" "$B" "$D/seg$k.mp4" > "$D/seg$k.log" 2>&1
  done
done
printf "file seg0.mp4\nfile seg1.mp4\nfile seg2.mp4\nfile seg3.mp4\n" > "$D/segs.txt"
case "${RES:-4k}" in 4k) Q="-crf 19 -maxrate 35M -bufsize 70M";; 2k) Q="-crf 19 -maxrate 20M -bufsize 40M";; *) Q="-crf 23 -maxrate 5M -bufsize 10M";; esac
ffmpeg -y -loglevel error -f concat -i "$D/segs.txt" -i "$D/mezcla.wav" -map 0:v -map 1:a -c:v libx264 $Q -profile:v high \
  -preset medium -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -af loudnorm=I=-14:TP=-1.5 -movflags +faststart -shortest "$D/final.mp4"
rm -f "$D"/seg*.mp4 "$D"/seg*.log "$D/segs.txt"
echo "Comprobación (ancho,alto,fps / duración,tamaño):"
ffprobe -v error -select_streams v -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$D/final.mp4"
ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$D/final.mp4"
echo "Listo: $D/final.mp4"
