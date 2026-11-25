import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, Easing} from 'remotion';
import D from './sin-dormir.json';

const FPS = 30, W = 1080, H = 1920;
const A = (n: string) => staticFile(`sin-dormir/${n}.png`);
const F = D.frases;
const nz = (s: string) => s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
// momento (s) en que se dice la palabra que contiene `w` en la frase i
const kw = (i: number, w: string) => {const x = F[i].words.find(p => nz(p.w).includes(nz(w))); return x ? x.a : F[i].a;};
const ini = (i: number) => (i === 0 ? 0 : F[i].a - 0.15);
const fin = (i: number) => (i < F.length - 1 ? F[i + 1].a - 0.15 : D.total);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Inter Display", Inter, sans-serif';

// aparición con muelle a partir del segundo t
const useSp = (t: number, damping = 12) => {const f = useCurrentFrame(); return spring({frame: f - t * FPS, fps: FPS, config: {damping, stiffness: 140}});};

const Bg: React.FC<{src: string; t0: number; t1: number; dim?: number}> = ({src, t0, t1, dim = 0.25}) => {
  const s = useCurrentFrame() / FPS; const k = interpolate(s, [t0, t1], [1.08, 1.0], cl);
  return <AbsoluteFill><Img src={A(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${k})`}} />
    <AbsoluteFill style={{background: `rgba(10,12,40,${dim})`}} /></AbsoluteFill>;
};

type SpP = {src: string; x: number; y: number; w: number; t: number; mode?: 'pop' | 'left' | 'right' | 'up'; float?: number; sway?: number; rot?: number; out?: number; flip?: boolean};
const Sprite: React.FC<SpP> = ({src, x, y, w, t, mode = 'pop', float = 10, sway = 0, rot = 0, out, flip}) => {
  const f = useCurrentFrame(), s = f / FPS, p = useSp(t);
  const o = out != null ? interpolate(s, [out, out + 0.25], [1, 0], cl) : 1;
  const dx = mode === 'left' ? (1 - p) * -900 : mode === 'right' ? (1 - p) * 900 : 0;
  const dy = mode === 'up' ? (1 - p) * 700 : 0;
  const sc = mode === 'pop' ? p : 1;
  const fy = Math.sin(s * 2.2) * float, r = Math.sin(s * 3) * sway + rot;
  return <Img src={A(src)} style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, opacity: Math.min(1, p * 1.5) * o,
    transform: `translate(${dx}px,${dy + fy}px) scale(${sc * (flip ? -1 : 1)},${sc}) rotate(${r}deg)`, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.35))'}} />;
};

// etiqueta tipo explainer: pastilla con texto y línea hacia el objeto
const Label: React.FC<{text: string; x: number; y: number; t: number; tx?: number; ty?: number; color?: string; size?: number}> = ({text, x, y, t, tx, ty, color = '#ffd23f', size = 54}) => {
  const p = useSp(t, 14), line = tx != null && ty != null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {line && <svg width={W} height={H} style={{position: 'absolute'}}><line x1={x} y1={y} x2={x + (tx! - x) * p} y2={y + (ty! - y) * p} stroke="white" strokeWidth={4} strokeDasharray="10 10" opacity={0.85} />
      <circle cx={tx} cy={ty} r={12 * p} fill={color} /></svg>}
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, background: 'rgba(15,18,50,.82)', border: `4px solid ${color}`,
      color: 'white', fontFamily: FONT, fontWeight: 800, fontSize: size, padding: '10px 26px', borderRadius: 22, whiteSpace: 'nowrap'}}>{text}</div>
  </AbsoluteFill>;
};

// número grande con contador
const Big: React.FC<{t: number; x?: number; y: number; text?: string; from?: number; to?: number; suf?: string; color?: string; size?: number; dur?: number; out?: number}> = ({t, x = W / 2, y, text, from = 0, to = 0, suf = '', color = '#ffd23f', size = 170, dur = 1, out}) => {
  const s = useCurrentFrame() / FPS, p = useSp(t, 9);
  const v = text ?? Math.round(interpolate(s, [t, t + dur], [from, to], {...cl, easing: Easing.out(Easing.cubic)})) + suf;
  const o = out != null ? interpolate(s, [out, out + 0.2], [1, 0], cl) : 1;
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, opacity: o, fontFamily: FONT, fontWeight: 900, fontSize: size,
    color, WebkitTextStroke: '10px rgba(10,10,30,.95)', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,.5)', whiteSpace: 'nowrap'}}>{v}</div>;
};

// subtítulos arriba: frase en gris claro, palabra actual blanca con caja
const Captions: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const fi = F.findIndex((f, i) => s >= ini(i) && s < fin(i)); if (fi < 0) return null;
  const ws = F[fi].words; const ci = ws.findIndex((w, j) => s >= w.a && (j === ws.length - 1 || s < ws[j + 1].a));
  // páginas de ~4 palabras
  const pages: number[][] = []; let cur: number[] = [];
  ws.forEach((w, j) => {cur.push(j); if (cur.length >= 4 || /[.,?!:…]$/.test(w.w)) {pages.push(cur); cur = [];}}); if (cur.length) pages.push(cur);
  const pg = pages.find(p => p.includes(Math.max(0, ci))) ?? pages[0];
  if (s < ws[0].a - 0.1) return null;
  return <div style={{position: 'absolute', top: 300, left: 70, right: 70, textAlign: 'center', fontFamily: FONT, fontSize: 66, fontWeight: 700, lineHeight: 1.35}}>
    {pg.map(j => {const on = j === ci, said = s >= ws[j].a;
      return <span key={j} style={{display: 'inline-block', margin: '0 10px', padding: '0 12px', borderRadius: 14, color: said ? '#ffffff' : 'rgba(255,255,255,.55)',
        background: on ? 'rgba(40,90,255,.85)' : 'transparent', transform: `scale(${on ? 1.06 : 1})`, textShadow: '0 4px 14px rgba(0,0,0,.7)'}}>{ws[j].w}</span>;})}
  </div>;
};

// barra de alcohol en sangre con línea de límite
const Meter: React.FC<{t: number; tLim: number}> = ({t, tLim}) => {
  const s = useCurrentFrame() / FPS, p = useSp(t, 14);
  const v = interpolate(s, [t, tLim + 0.6], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  return <div style={{position: 'absolute', left: 140, top: 1500, width: 800, opacity: p}}>
    <div style={{fontFamily: FONT, color: 'white', fontWeight: 800, fontSize: 44, marginBottom: 14}}>Alcohol en sangre (equivalente)</div>
    <div style={{height: 54, borderRadius: 27, background: 'rgba(255,255,255,.18)', position: 'relative', overflow: 'visible'}}>
      <div style={{width: `${v * 100}%`, height: '100%', borderRadius: 27, background: 'linear-gradient(90deg,#ffd23f,#ff5a4a)'}} />
      <div style={{position: 'absolute', left: '50%', top: -24, bottom: -24, width: 6, background: 'white'}} />
      <div style={{position: 'absolute', left: '50%', top: 72, transform: 'translateX(-50%)', color: 'white', fontFamily: FONT, fontWeight: 700, fontSize: 36}}>límite</div>
    </div></div>;
};

// calendario que pasa días
const Calendar: React.FC<{t: number; dur: number; to: number; x: number; y: number}> = ({t, dur, to, x, y}) => {
  const s = useCurrentFrame() / FPS, p = useSp(t, 12);
  const d = Math.max(1, Math.round(interpolate(s, [t, t + dur], [1, to], {...cl, easing: Easing.inOut(Easing.quad)})));
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${p})`, width: 330, borderRadius: 28, overflow: 'hidden', background: 'white', boxShadow: '0 20px 40px rgba(0,0,0,.4)'}}>
    <div style={{background: '#ff5a4a', color: 'white', fontFamily: FONT, fontWeight: 800, fontSize: 48, textAlign: 'center', padding: 10}}>DÍA</div>
    <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, textAlign: 'center', color: '#1b1f4a'}}>{d}</div></div>;
};

// líquido azul que limpia (sube y baja) con partículas oscuras arrastradas
const Wash: React.FC<{t: number; t1: number; dirty?: boolean}> = ({t, t1, dirty}) => {
  const s = useCurrentFrame() / FPS; const p = interpolate(s, [t, t + 1.2, t1 - 0.6, t1], [0, 1, 1, 0], cl);
  const lvl = 1250 - p * 520;
  const wave = Array.from({length: 22}, (_, k) => `${k * 52},${lvl + Math.sin(k * 0.7 + s * 4) * 18}`).join(' ');
  const dots = Array.from({length: 26}, (_, k) => {const ph = (s * 0.35 + k / 26) % 1; return {x: 250 + ((k * 137) % 580), y: dirty ? 700 + ((k * 89) % 500) : 650 + ph * 900, o: dirty ? 0.85 : 1 - ph};});
  return <svg width={W} height={H} style={{position: 'absolute'}}>
    {!dirty && <polygon points={`0,${H} ${wave} ${W},${H}`} fill="rgba(70,170,255,.45)" />}
    {dots.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={9 + (k % 3) * 4} fill="#2a1638" opacity={d.o * (dirty ? interpolate(s, [t, t + 0.8], [0, 1], cl) : p)} />)}
  </svg>;
};

// ojos que aparecen en la oscuridad (alucinaciones)
const Eyes: React.FC<{t: number}> = ({t}) => {
  const s = useCurrentFrame() / FPS;
  const E = [[220, 900], [820, 760], [600, 1250], [320, 1400], [880, 1180]];
  return <svg width={W} height={H} style={{position: 'absolute'}}>{E.map(([x, y], k) => {const a = interpolate(s, [t + k * 0.25, t + k * 0.25 + 0.3], [0, 1], cl), bl = Math.abs(Math.sin(s * 2 + k)) > 0.97 ? 0.1 : 1;
    return <g key={k} opacity={a}><ellipse cx={x - 26} cy={y} rx={16} ry={22 * bl} fill="#fff6a8" /><ellipse cx={x + 26} cy={y} rx={16} ry={22 * bl} fill="#fff6a8" /></g>;})}</svg>;
};

const Zzz: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => {
  const s = useCurrentFrame() / FPS;
  return <>{[0, 1, 2].map(k => {const ph = ((s - t) * 0.5 + k / 3) % 1; if (s < t) return null;
    return <div key={k} style={{position: 'absolute', left: x + ph * 120, top: y - ph * 260, opacity: Math.sin(ph * Math.PI), fontFamily: FONT, fontWeight: 900, fontSize: 70 + k * 18, color: 'white'}}>Z</div>;})}</>;
};

// pastel 1/3
const Pie: React.FC<{t: number}> = ({t}) => {
  const s = useCurrentFrame() / FPS, p = useSp(t, 14), k = interpolate(s, [t + 0.3, t + 1.3], [0, 1 / 3], {...cl, easing: Easing.out(Easing.cubic)});
  const a = k * 2 * Math.PI - Math.PI / 2, R = 230, cx = 540, cy = 1050;
  const path = `M${cx},${cy} L${cx},${cy - R} A${R},${R} 0 ${k > 0.5 ? 1 : 0} 1 ${cx + R * Math.cos(a)},${cy + R * Math.sin(a)} Z`;
  return <svg width={W} height={H} style={{position: 'absolute', transform: `scale(${p})`, transformOrigin: `${cx}px ${cy}px`}}>
    <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,.2)" stroke="white" strokeWidth={6} /><path d={path} fill="#5b7cff" /></svg>;
};

// escena: sólo se pinta en su ventana; zoom lento continuo + "punch" en las palabras clave + transición deslizada
const Scene: React.FC<{i: number; j?: number; punch?: number[]; children: React.ReactNode}> = ({i, j, punch = [], children}) => {
  const s = useCurrentFrame() / FPS, a = ini(i), b = fin(j ?? i);
  if (s < a - 0.01 || s >= b) return null;
  let z = interpolate(s, [a, b], [1, 1.06], cl);
  for (const p of punch) z *= 1 + 0.12 * interpolate(s, [p, p + 0.18, p + 1.1, p + 1.4], [0, 1, 1, 0], {...cl, easing: Easing.out(Easing.cubic)});
  const tin = interpolate(s, [a, a + 0.22], [1, 0], {...cl, easing: Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{transform: `translateX(${tin * 160}px) scale(${z})`, opacity: 1 - tin * 0.6}}>{children}</AbsoluteFill>;
};

export const SinDormir: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  return <AbsoluteFill style={{background: '#14163a'}}>
    {/* 0 ¿Qué pasaría si dejaras de dormir? Para siempre. */}
    <Scene i={0} punch={[kw(0, 'siempre')]}>
      <Bg src="f_dormitorio_512" t0={0} t1={fin(0)} />
      <Sprite src="reloj_82" x={540} y={1150} w={520} t={0.1} sway={4} />
      <Big t={kw(0, 'siempre')} y={1560} text="PARA SIEMPRE" size={120} />
    </Scene>
    {/* 1 superpoder: 1/3 de la vida */}
    <Scene i={1} punch={[kw(1, 'tercio')]}>
      <Bg src="f_espacio_532" t0={ini(1)} t1={fin(1)} />
      <Pie t={ini(1) + 0.1} />
      <Big t={kw(1, 'tercio')} y={1050} text="1/3" size={150} color="#ffffff" />
      <Label text="de tu vida, durmiendo" x={540} y={1430} t={kw(1, 'vida')} />
    </Scene>
    {/* 2 primeras 24 horas */}
    <Scene i={2} punch={[kw(2, '24')]}>
      <Bg src="f_dormitorio_511" t0={ini(2)} t1={fin(2)} />
      <Sprite src="chico_cansado_32" x={540} y={1180} w={760} t={ini(2) + 0.05} mode="up" float={6} />
      <Big t={kw(2, '24')} y={640} from={0} to={24} suf=" h" size={150} />
    </Scene>
    {/* 3 como si hubieras bebido: el doble del límite */}
    <Scene i={3} punch={[kw(3, 'doble')]}>
      <Bg src="f_calle_522" t0={ini(3)} t1={fin(3)} />
      <Sprite src="chico_mareado_42" x={430} y={1030} w={700} t={ini(3) + 0.05} mode="left" sway={7} float={4} />
      <Sprite src="copa_142" x={820} y={900} w={300} t={kw(3, 'bebido')} sway={10} />
      <Meter t={kw(3, 'bebido')} tLim={kw(3, 'doble')} />
      <Big t={kw(3, 'doble')} y={1350} text="×2" color="#ff5a4a" size={150} />
    </Scene>
    {/* 4 día 2: microsueños */}
    <Scene i={4} punch={[kw(4, 'abiertos')]}>
      <Bg src="f_calle_521" t0={ini(4)} t1={fin(4)} dim={0.35} />
      <Sprite src="coche_92" x={interpolate(s, [ini(4), fin(4)], [-200, 1300], cl)} y={1450} w={560} t={ini(4)} float={3} />
      <Big t={ini(4) + 0.1} y={720} text="DÍA 2" color="#ffffff" size={130} />
      <Label text="microsueños" x={540} y={1050} t={kw(4, 'microsue')} />
      {/* parpadeo: la pantalla se va a negro un instante (microsueño) */}
      <AbsoluteFill style={{background: 'black', opacity: interpolate(s, [kw(4, 'segundos'), kw(4, 'segundos') + 0.15, kw(4, 'segundos') + 0.55, kw(4, 'segundos') + 0.75], [0, 0.95, 0.95, 0], cl)}} />
    </Scene>
    {/* 5 el cerebro se lava */}
    <Scene i={5} punch={[kw(5, 'lava')]}>
      <Bg src="f_espacio_531" t0={ini(5)} t1={fin(5)} />
      <Sprite src="cerebro_61" x={540} y={1080} w={640} t={ini(5) + 0.05} float={12} />
      <Wash t={kw(5, 'lava')} t1={fin(5) + 0.6} />
    </Scene>
    {/* 6 la basura se queda dentro */}
    <Scene i={6} punch={[kw(6, 'queda')]}>
      <Bg src="f_espacio_531" t0={ini(6)} t1={fin(6)} />
      <Sprite src="cerebro_61" x={540} y={1080} w={640} t={ini(6) - 1} float={12} out={kw(6, 'dormir')} />
      <Sprite src="cerebro_sucio_71" x={540} y={1080} w={640} t={kw(6, 'dormir')} float={12} />
      <Wash t={ini(6)} t1={kw(6, 'dormir')} />
      <Wash t={kw(6, 'dormir')} t1={fin(6) + 1} dirty />
      <Label text="basura" x={300} y={760} tx={480} ty={1000} t={kw(6, 'basura')} color="#c77dff" />
    </Scene>
    {/* 7 día 3: ver cosas que no están */}
    <Scene i={7} punch={[kw(7, 'cosas')]}>
      <Bg src="f_calle_522" t0={ini(7)} t1={fin(7)} dim={0.6} />
      <Big t={ini(7) + 0.1} y={720} text="DÍA 3" color="#ffffff" size={130} />
      <Eyes t={kw(7, 'ver')} />
    </Scene>
    {/* 8 1964, chico de 17 años, 11 días */}
    <Scene i={8} punch={[kw(8, '11')]}>
      <Bg src="f_cocina_561" t0={ini(8)} t1={fin(8)} />
      <Sprite src="chico_1964_51" x={380} y={1250} w={640} t={ini(8) + 0.05} mode="left" float={5} />
      <Label text="1964" x={540} y={650} t={ini(8) + 0.2} />
      <Label text="17 años" x={300} y={880} tx={380} ty={1020} t={kw(8, '17')} color="#9fe0ff" />
      <Calendar t={kw(8, 'aguant')} dur={kw(8, 'dormir') - kw(8, 'aguant') + 0.3} to={11} x={800} y={1050} />
    </Scene>
    {/* 9 Randy Gardner: señal = persona; durmió 14 h */}
    <Scene i={9} punch={[kw(9, 'persona'), kw(9, '14')]}>
      <Bg src="f_calle_521" t0={ini(9)} t1={fin(9)} dim={0.4} />
      <Sprite src="senal_131" x={540} y={1150} w={620} t={ini(9)} float={4} out={kw(9, 'acabar')} />
      <Label text="Randy Gardner" x={540} y={650} t={ini(9) + 0.15} />
      <Label text="¿una persona?" x={540} y={1560} t={kw(9, 'persona')} color="#ff9a8a" />
      <Big t={kw(9, '14')} y={1100} from={0} to={14} suf=" h" size={160} dur={0.8} />
      <Zzz t={kw(9, 'durmi')} x={700} y={900} />
    </Scene>
    {/* 10-11 enfermedad: insomnio familiar fatal, sin cura */}
    <Scene i={10} punch={[kw(10, 'enfermedad')]}>
      <Bg src="f_hospital_542" t0={ini(10)} t1={fin(10)} />
      <Sprite src="cama_hospital_121" x={540} y={1250} w={820} t={ini(10) + 0.05} float={3} />
    </Scene>
    <Scene i={11} punch={[kw(11, 'cura')]}>
      <Bg src="f_hospital_541" t0={ini(11)} t1={fin(11)} dim={0.55} />
      <Sprite src="adn_111" x={540} y={1100} w={620} t={ini(11) + 0.05} sway={5} />
      <Label text="insomnio familiar fatal" x={540} y={1560} t={kw(11, 'insomnio')} color="#ff5a4a" size={50} />
      <Big t={kw(11, 'cura')} y={700} text="SIN CURA" color="#ff5a4a" size={140} />
    </Scene>
    {/* 12 ratas: en unas semanas */}
    <Scene i={12} punch={[kw(12, 'semanas')]}>
      <Bg src="f_lab_551" t0={ini(12)} t1={fin(12)} />
      <Sprite src="rata_102" x={540} y={1180} w={600} t={ini(12) + 0.05} mode="right" float={6} />
      <Label text="experimento" x={540} y={650} t={ini(12) + 0.2} color="#9fe0ff" />
      <Big t={kw(12, 'semanas')} y={1600} text="SEMANAS" color="#ff5a4a" size={130} />
    </Scene>
    {/* 13 dormir te mantiene vivo */}
    <Scene i={13} punch={[kw(13, 'vivo')]}>
      <Bg src="f_dormitorio_512" t0={ini(13)} t1={fin(13)} dim={0.1} />
      <Zzz t={ini(13)} x={560} y={1050} />
      <Big t={kw(13, 'vivo')} y={1500} text="VIVO" color="#7dffb0" size={150} />
    </Scene>
    {/* 14 ¿cuántas horas has dormido hoy? */}
    <Scene i={14} punch={[kw(14, 'horas')]}>
      <Bg src="f_dormitorio_511" t0={ini(14)} t1={fin(14)} />
      <Sprite src="reloj_82" x={540} y={1100} w={480} t={ini(14) + 0.05} sway={4} />
      <Label text="Dímelo abajo 👇" x={540} y={1550} t={kw(14, 'abajo')} />
    </Scene>
    <Captions />
  </AbsoluteFill>;
};
