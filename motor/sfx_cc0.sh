#!/usr/bin/env bash
# Descarga las bibliotecas de efectos CC0 (dominio público: se pueden monetizar sin atribución) de Hugging Face
# a motor/sfx/cc0/ y crea motor/sfx/cc0/indice.txt (ids "cc0:<biblioteca>/<ruta>" para plan.json -> frases[].sfx).
set -uo pipefail
cd "$(dirname "$0")/sfx" && mkdir -p cc0 && cd cc0
for d in flreey/sfxmint-cc0-sound-effects wyzowl/sfx-kit; do
  n=$(basename "$d"); mkdir -p "$n"
  [ -n "$(find "$n" -name '*.mp3' -o -name '*.wav' 2>/dev/null | head -1)" ] && continue
  curl -s "https://huggingface.co/api/datasets/$d/tree/main?recursive=true" | python3 -c "
import json,sys
for x in json.load(sys.stdin):
  if x['type']=='file' and (x['path'].rsplit('.',1)[-1] in ('mp3','wav','md','csv','json','jsonl') or x['path']=='LICENSE'): print(x['path'])" > "$n/.lista"
  (cd "$n" && while read -r p; do mkdir -p "$(dirname "$p")"; curl -sfL -o "$p" "https://huggingface.co/datasets/$d/resolve/main/$p" || echo "fallo $p"; done < .lista)
done
find . -name '*.mp3' -o -name '*.wav' | sed 's|^\./|cc0:|; s|\.[a-z0-9]*$||' | sort > indice.txt
echo "sonidos cc0: $(wc -l < indice.txt)"
