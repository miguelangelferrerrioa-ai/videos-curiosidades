# Saca los fotogramas de los clips de imagen a vídeo (celda.py --clips) para render.js:
#   videos/<nombre>/clips/<id>_<semilla>.mp4 -> clips/<id>_<semilla>/001.jpg, 002.jpg... (832x1216, como las imágenes)
import glob, os, subprocess, sys
D = sys.argv[1]; n = 0
for f in sorted(glob.glob(D + '/clips/*.mp4')):
    o = f[:-4]
    if os.path.isdir(o) and os.listdir(o): n += 1; continue
    os.makedirs(o, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-vf', 'scale=832:1248:flags=lanczos,crop=832:1216', '-q:v', '2', o + '/%03d.jpg'], check=True)
    n += 1
print('clips:', n)
