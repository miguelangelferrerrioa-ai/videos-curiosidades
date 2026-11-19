# Hojas de contacto para elegir imágenes: videos/<nombre>/hojas/hoja_N.jpg (8 por hoja, con su nombre).
import glob, os, subprocess, sys
D = sys.argv[1]; os.makedirs(D + '/hojas', exist_ok=True)
fs = sorted(f for f in glob.glob(D + '/imagenes/*.jpg'))
lay = '0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0'
for k in range(0, len(fs), 8):
    g = fs[k:k + 8]; g += [g[-1]] * (8 - len(g))
    ins = sum([['-i', f] for f in g], [])
    lab = ''.join(f"[{i}]drawtext=text='{os.path.basename(g[i])[:-4]}':fontsize=60:fontcolor=white:box=1:boxcolor=black[v{i}];" for i in range(8))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ins, '-filter_complex',
                    lab + ''.join(f'[v{i}]' for i in range(8)) + f'xstack=inputs=8:layout={lay},scale=1400:-1',
                    f'{D}/hojas/hoja_{k // 8}.jpg'], check=True)
print(len(fs), 'imágenes ->', D + '/hojas')
