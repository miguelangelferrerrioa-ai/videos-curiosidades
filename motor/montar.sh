#!/usr/bin/env bash
# Monta el vídeo final.
#   motor/montar.sh videos/<nombre> [zip_de_colab]
# 1) si se pasa el zip, lo descomprime (imagenes/ y voz/) en la carpeta del vídeo
# 2) recorta silencios de la voz, crea la línea de tiempo y la mezcla de audio
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
  rm -rf "$T"
fi
$PY motor/recortar_voz.py "$D"
node motor/render.js "$D" solo-timeline
$PY motor/audio.py "$D"
TOTAL=$($PY -c "import json;print(json.load(open('$D/timeline.json'))['total'])")
SEG=$($PY -c "print(round($TOTAL/4+0.01,2))")
for k in 0 1 2 3; do
  A=$($PY -c "print(round($k*$SEG,2))"); B=$($PY -c "print(round(($k+1)*$SEG,2))")
  node motor/render.js "$D" "$A" "$B" "$D/seg$k.mp4" > "$D/seg$k.log" 2>&1 &
done
wait
grep -h ERR "$D"/seg*.log && exit 1 || true
printf "file seg0.mp4\nfile seg1.mp4\nfile seg2.mp4\nfile seg3.mp4\n" > "$D/segs.txt"
ffmpeg -y -loglevel error -f concat -i "$D/segs.txt" -i "$D/mezcla.wav" -map 0:v -map 1:a -c:v libx264 -crf 23 -maxrate 5M -bufsize 10M \
  -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -movflags +faststart -shortest "$D/final.mp4"
rm -f "$D"/seg*.mp4 "$D"/seg*.log "$D/segs.txt"
ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$D/final.mp4"
echo "Listo: $D/final.mp4"
