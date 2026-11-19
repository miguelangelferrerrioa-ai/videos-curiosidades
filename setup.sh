#!/usr/bin/env bash
# Prepara una sesión nueva: entorno de Python para el motor + las skills de Claude Code que usamos.
#   ./setup.sh            -> entorno + skills
#   ./setup.sh alinear    -> además, lo necesario para alinear una voz de ElevenLabs en un solo archivo
set -uo pipefail
cd "$(dirname "$0")"
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/pip install -q numpy scipy soundfile pillow yt-dlp && echo "entorno ok"
mkdir -p .modelos  # Real-ESRGAN (superresolución x4 de las imágenes, motor/escalar.py)
[ -f .modelos/realesr-general-x4v3.pth ] || curl -fsSL -o .modelos/realesr-general-x4v3.pth https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth
[ -f .modelos/realesr-general-x4v3.pth ] && echo "escalado ok"
if [ "${1:-}" = "alinear" ]; then
  .venv/bin/pip install -q librosa kokoro-onnx
  mkdir -p .modelos && cd .modelos
  for f in kokoro-v1.0.onnx voices-v1.0.bin; do
    [ -f $f ] || curl -fsSL -O "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
  done
  cd .. && echo "alineado ok"
fi
# --- skills ---
SK="${HOME}/.claude/skills"; T=$(mktemp -d); mkdir -p "$SK" "${HOME}/.claude/youtube"
git clone -q --depth 1 https://github.com/Jakeschincariol/youtube-agent-skill.git "$T/yt" && cp -r "$T"/yt/skills/yt-* "$SK/" && echo "skills yt ok"
git clone -q --depth 1 https://github.com/Leonxlnx/earshot.git "$T/ea" && cp -r "$T"/ea/skills/earshot "$T"/ea/skills/real-sound "$SK/" && echo "skills earshot ok"
curl -fsSL -o "$T/e.zip" https://github.com/victorcorralsocial/skills-claude/releases/download/v13/enrutador.zip && unzip -oq "$T/e.zip" -d "$SK" && echo "skill enrutador ok"
cp canal/voice.md "${HOME}/.claude/youtube/voice.md"
rm -rf "$T"
