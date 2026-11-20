#!/usr/bin/env bash
# Revisión obligatoria antes de entregar un vídeo. Uso: motor/revisar.sh videos/NN-tema
# Comprueba: resolución 4K/2K real, duración = línea de tiempo, sin negros, textos que no se pisan,
# volumen correcto, y saca una hoja con 10 fotogramas repartidos (revisarla a ojo: orden de escenas, textos).
set -uo pipefail
cd "$(dirname "$0")/.."
D="$1"; F="$D/final.mp4"; PY=.venv/bin/python; OK=1
fallo(){ echo "❌ $1"; OK=0; }
[ -f "$F" ] || { echo "❌ no existe $F"; exit 1; }
WH=$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$F")
case "$WH" in 2160,3840) echo "✅ resolución 4K vertical ($WH)";; 1440,2560) echo "⚠️  resolución 2K ($WH)";; *) fallo "resolución $WH (debe ser 2160,3840)";; esac
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F")
TOT=$($PY -c "import json;print(json.load(open('$D/timeline.json'))['total'])")
$PY -c "import sys;sys.exit(0 if abs($DUR-$TOT)<0.3 else 1)" && echo "✅ duración ${DUR}s = línea de tiempo" || fallo "duración ${DUR}s ≠ línea de tiempo ${TOT}s (falta o sobra un trozo)"
NB=$(ffmpeg -i "$F" -vf "scale=270:-1,blackdetect=d=0.3" -an -f null - 2>&1 | grep -c black_start)
[ "$NB" = "0" ] && echo "✅ sin tramos negros" || fallo "$NB tramos negros"
$PY - "$D" <<'EOF' && echo "✅ ningún texto grande se pisa con otro" || OK=0
import json,sys
C=json.load(open(sys.argv[1]+'/timeline.json'))['calls'];bad=0
for i,a in enumerate(C):
  for b in C[i+1:]:
    if abs(a['y']-b['y'])<(a['size']+b['size'])*.45 and a['a']<b['b'] and b['a']<a['b']:
      print(f"❌ se pisan en {max(a['a'],b['a']):.1f}s: {a['text']!r} y {b['text']!r}");bad=1
sys.exit(bad)
EOF
LU=$(ffmpeg -i "$F" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | grep -oE "\-?[0-9.]+")
$PY -c "import sys;sys.exit(0 if -16<=float('$LU')<=-9 else 1)" && echo "✅ volumen ${LU} LUFS" || fallo "volumen ${LU} LUFS (debe estar entre -16 y -9)"
mkdir -p "$D/revision"; for i in 0 1 2 3 4 5 6 7 8 9; do
  T=$($PY -c "print(round($DUR*($i+.5)/10,2))"); ffmpeg -y -loglevel error -ss $T -i "$F" -frames:v 1 -vf scale=240:-1 "$D/revision/f$i.jpg"; done
ffmpeg -y -loglevel error $(for i in 0 1 2 3 4 5 6 7 8 9; do echo -i "$D/revision/f$i.jpg"; done) -filter_complex hstack=inputs=10 "$D/revision/hoja.jpg"
echo "👀 mirar $D/revision/hoja.jpg (orden de escenas y textos) antes de entregar"
[ $OK = 1 ] && echo "RESULTADO: OK" || { echo "RESULTADO: HAY FALLOS — no entregar"; exit 1; }
