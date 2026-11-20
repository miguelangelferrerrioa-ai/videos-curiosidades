# Tendencias del nicho con datos reales de YouTube (yt-dlp, solo listados públicos, sin claves ni sesión).
#  A) AHORA: entre los 12 Shorts más recientes de cada canal (referencia + descubiertos en búsquedas), los que
#     superan la mediana de su canal (múltiplo). Es lo que está funcionando esta temporada.
#  B) SIEMPRE: Shorts del nicho con más visitas en las búsquedas (temas que funcionan siempre).
#  C) Los mayores múltiplos históricos de cada canal (formatos que destacan).
# Uso: .venv/bin/python motor/tendencias.py   -> imprime y guarda canal/tendencias.md  (~2 min)
import json, os, re, statistics, subprocess, time, urllib.parse
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'); YT = os.path.join(ROOT, '.venv/bin/yt-dlp')
BUSQUEDAS = ['curiosidades del espacio', 'datos curiosos del universo', 'curiosidades astronomía', 'misterios del universo',
             'space facts', 'mind blowing space facts', 'universe facts', 'NASA']
def yt(url, n):
    r = subprocess.run([YT, '--flat-playlist', '-J', '--playlist-end', str(n), url], capture_output=True, text=True, timeout=180)
    try: return [e for e in json.loads(r.stdout).get('entries', []) if e]
    except Exception: return []
NO = re.compile(r'cbbc|newsround|kids|niñ[oa]s|infantil|blippi|lego|meekah|cocomelon|nursery|toddler|preschool|for children', re.I)
SI = re.compile(r'espacio|universo|planeta|astro|galax|nasa|space|universe|planet|cosmo|marte|mars|luna|moon|sol\b|sun|estrella|star|agujero|black hole|ciencia|science|curios', re.I)
nombres = {}
def handle(e):
    u = e.get('channel_url') or e.get('uploader_url') or ''
    return u.split('youtube.com/')[-1] if 'youtube.com/' in u else None
temas = open(os.path.join(ROOT, 'canal/temas.md')).read()
ref = re.findall(r'@[\w.\-]+', temas.split('## Canales de referencia')[1].split('\n## ')[0]) if '## Canales de referencia' in temas else []
ref = [c for c in ref if 'randomfacts' not in c] or ['@astrumspace', '@astrumespanol', '@QuantumFracture', '@CuriosaMente', '@kurzgesagt']
with ThreadPoolExecutor(4) as ex:
    res = list(ex.map(lambda q: yt('https://www.youtube.com/results?search_query=' + urllib.parse.quote(q + ' #shorts'), 60), BUSQUEDAS))
shorts, nuevos = {}, {}
for E in res:
    for e in E:
        t = e.get('title', '') + ' ' + (e.get('channel') or '')
        if '/shorts/' in e.get('url', '') and e.get('view_count') and not NO.search(t) and SI.search(t):
            shorts[e['id']] = e; h = handle(e)
            if h: nuevos[h] = nuevos.get(h, 0) + e['view_count']; nombres[h] = e.get('channel') or h
canales = ref + [h for h, _ in sorted(nuevos.items(), key=lambda x: -x[1]) if h not in ref][:10]
def analiza(c):
    E = [e for e in yt(f'https://www.youtube.com/{c}/shorts', 40) if e.get('view_count')]
    if len(E) < 6: return []
    m = statistics.median(e['view_count'] for e in E)
    if m < 2000: return []  # canal demasiado pequeño para sacar conclusiones
    if sum(1 for e in E if NO.search(e.get('title', ''))) > len(E) / 4: return []  # canal infantil
    return [(e['view_count'] / m, e['view_count'], nombres.get(c, c), e.get('title', ''), e['id'], i < 12) for i, e in enumerate(E) if not NO.search(e.get('title', '')) and e['view_count'] >= 10000]
with ThreadPoolExecutor(4) as ex: filas = [f for L in ex.map(analiza, canales) for f in L]
ahora = sorted([f for f in filas if f[5] and f[0] >= 2], reverse=True)[:15]
hist = sorted(filas, reverse=True)[:12]
top = sorted([e for e in shorts.values() if e['view_count'] >= 10000], key=lambda e: -e['view_count'])[:15]
fmt = lambda r: f'| {r[0]:.1f}× | {r[1]:,} | {r[2]} | [{r[3][:70]}](https://youtube.com/shorts/{r[4]}) |'
out = [f'# Tendencias del nicho ({time.strftime("%Y-%m-%d")})', f'Canales analizados: {", ".join(nombres.get(c, c) for c in canales)}', '',
       '## A) Funcionando AHORA (entre los 12 Shorts más recientes de cada canal, ≥2× su mediana)',
       '| múltiplo | visitas | canal | título |', '|---|---|---|---|'] + [fmt(r) for r in ahora]
out += ['', '## B) Lo más visto del nicho en búsquedas (cualquier fecha)', '| visitas | canal | título |', '|---|---|---|']
out += [f'| {e["view_count"]:,} | {e.get("channel", "")} | [{e.get("title", "")[:70]}](https://youtube.com/shorts/{e["id"]}) |' for e in top]
out += ['', '## C) Mayores múltiplos históricos por canal', '| múltiplo | visitas | canal | título |', '|---|---|---|---|'] + [fmt(r) for r in hist]
txt = '\n'.join(out) + '\n'; open(os.path.join(ROOT, 'canal/tendencias.md'), 'w').write(txt); print(txt)
