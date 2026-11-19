# Escala imágenes x4 con Real-ESRGAN (realesr-general-x4v3, SRVGGNetCompact) en CPU, solo con numpy.
# No es 4K nativo: es superresolución por IA (reconstruye detalle), mucho mejor que un estirado bicúbico.
# Uso: python motor/escalar.py videos/<n>   -> escala las imágenes elegidas en plan.json a videos/<n>/imagenes_x4/
#      python motor/escalar.py entrada.jpg salida.jpg
import json, os, pickle, sys, zipfile, time, numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); W8 = os.path.join(HERE, '..', '.modelos', 'realesr-general-x4v3.pth')

def load_pth(path):  # lee un state_dict de PyTorch sin PyTorch
    z = zipfile.ZipFile(path); root = z.namelist()[0].split('/')[0]
    DT = {'FloatStorage': np.float32, 'HalfStorage': np.float16}
    class U(pickle.Unpickler):
        def find_class(self, mod, name):
            if name == '_rebuild_tensor_v2':
                def rb(st, off, size, stride, *a):
                    arr = st
                    return np.lib.stride_tricks.as_strided(arr[off:], shape=size, strides=[s * arr.itemsize for s in stride]).copy() if size else arr[off:off + 1].reshape(())
                return rb
            if mod == 'collections' and name == 'OrderedDict':
                import collections; return collections.OrderedDict
            if mod.startswith('torch'): return name
            return super().find_class(mod, name)
        def persistent_load(self, pid):
            _, stype, key, _loc, n = pid
            return np.frombuffer(z.read(f'{root}/data/{key}'), dtype=DT[stype if isinstance(stype, str) else stype.__name__])[:n]
    sd = U(z.open(f'{root}/data.pkl')).load()
    return sd.get('params', sd.get('params_ema', sd))

def conv3(x, w, b):  # x: (C,H,W) ya con borde de 1 -> (O,H-2,W-2)
    C, H, Wd = x.shape; s = x.strides
    cols = np.lib.stride_tricks.as_strided(x, (C, 3, 3, H - 2, Wd - 2), (s[0], s[1], s[2], s[1], s[2]))
    out = np.tensordot(w.reshape(w.shape[0], C, 3, 3), cols, axes=([1, 2, 3], [0, 1, 2]))
    return out + b[:, None, None]

class Net:
    def __init__(self):
        sd = load_pth(W8); ks = sorted({int(k.split('.')[1]) for k in sd}, key=int)
        self.L = []
        for i in ks:
            wk = sd[f'body.{i}.weight']
            if wk.ndim == 4: self.L.append(('c', wk.astype(np.float32), sd[f'body.{i}.bias'].astype(np.float32)))
            else: self.L.append(('p', wk.astype(np.float32)))
    def run(self, x):  # x: (3,h,w) float32 0-1
        h = x
        for l in self.L:
            if l[0] == 'c': h = conv3(np.pad(h, ((0, 0), (1, 1), (1, 1)), mode='reflect'), l[1], l[2]).astype(np.float32)
            else: h = np.where(h >= 0, h, h * l[1][:, None, None])
        C, H, Wd = h.shape; r = 4  # pixel shuffle
        h = h.reshape(3, r, r, H, Wd).transpose(0, 3, 1, 4, 2).reshape(3, H * r, Wd * r)
        return h + np.repeat(np.repeat(x, r, 1), r, 2)

def upscale(net, img, tile=192, pad=12):
    a = np.asarray(img.convert('RGB'), np.float32).transpose(2, 0, 1) / 255.; _, H, Wd = a.shape
    out = np.zeros((3, H * 4, Wd * 4), np.float32)
    for y in range(0, H, tile):
        for x in range(0, Wd, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad); y1, x1 = min(H, y + tile + pad), min(Wd, x + tile + pad)
            o = net.run(a[:, y0:y1, x0:x1])
            ty, tx = min(tile, H - y), min(tile, Wd - x)
            out[:, y * 4:(y + ty) * 4, x * 4:(x + tx) * 4] = o[:, (y - y0) * 4:(y - y0 + ty) * 4, (x - x0) * 4:(x - x0 + tx) * 4]
    return Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8).transpose(1, 2, 0))

if __name__ == '__main__':
    net = Net()
    if sys.argv[1].endswith(('.jpg', '.png')):
        t = time.time(); upscale(net, Image.open(sys.argv[1])).save(sys.argv[2], quality=95); print(f'{time.time() - t:.0f}s'); sys.exit()
    D = sys.argv[1]; P = json.load(open(D + '/plan.json')); el = P.get('elegidas', {})
    ks = sorted({el.get(k, k) for f in P['frases'] for k in f['planos']}); os.makedirs(D + '/imagenes_x4', exist_ok=True)
    for i, k in enumerate(ks):
        o = f'{D}/imagenes_x4/{k}.jpg'
        if os.path.exists(o): continue
        t = time.time(); upscale(net, Image.open(f'{D}/imagenes/{k}.jpg')).save(o, quality=94)
        print(f'{i + 1}/{len(ks)} {k} {time.time() - t:.0f}s', flush=True)
