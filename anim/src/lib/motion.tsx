// Sistema de movimiento para los Shorts animados (Remotion). Reglas: nada quieto, nada lineal, nada de cortes secos.
// Todos los tiempos en MILISEGUNDOS (ms) y se convierten a fotogramas con fps=30.
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, interpolate, spring, Easing, staticFile} from 'remotion';

export const FPS = 30, W = 1080, H = 1920;
const f2ms = (f: number) => (f / FPS) * 1000;
export const useMs = () => f2ms(useCurrentFrame());
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- 1. curvas (easing): nunca lineal ----------
export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),        // entradas: rápido y aterriza suave (expo-out)
  inOut: Easing.bezier(0.65, 0, 0.35, 1),     // desplazamientos de cámara
  in: Easing.bezier(0.7, 0, 0.84, 0),         // salidas: se va acelerando
  back: Easing.bezier(0.34, 1.56, 0.64, 1),   // rebote sutil (sobrepasa ~6 %)
};
// muelles: "pesado" para objetos grandes, "elástico" para iconos y etiquetas
export const SPRING = {pesado: {damping: 18, stiffness: 90, mass: 1.4}, elastico: {damping: 11, stiffness: 160, mass: 0.8}, texto: {damping: 15, stiffness: 200, mass: 0.6}};
export const useSpring = (atMs: number, cfg = SPRING.elastico) => spring({frame: useCurrentFrame() - (atMs / 1000) * FPS, fps: FPS, config: cfg});
// tween con duración en ms: v(desdeMs, duracionMs, [a,b], curva)
export const useTween = (fromMs: number, durMs: number, range: [number, number], ease = EASE.out) =>
  interpolate(useMs(), [fromMs, fromMs + durMs], range, {...cl, easing: ease});

// ---------- 2. bucles orgánicos (cero quietud) ----------
// periodos primos entre sí para que los bucles no se sincronicen y parezca vivo
export const idle = (ms: number, seed = 0) => ({
  float: Math.sin((ms / 3100) * 2 * Math.PI + seed) * 10,                    // ±10 px, 3,1 s
  breathe: 1 + Math.sin((ms / 2300) * 2 * Math.PI + seed * 1.7) * 0.015,     // ±1,5 % de escala, 2,3 s
  sway: Math.sin((ms / 4700) * 2 * Math.PI + seed * 0.6) * 1.6,              // ±1,6°, 4,7 s
});

// ---------- fondo: Ken Burns + paralaje por capas ----------
// zoom 1.00→1.07 en toda la escena (inOut) + deriva lateral; las capas delanteras se mueven ×depth
export const KenBurns: React.FC<{src: string; startMs: number; endMs: number; depth?: number; dir?: 1 | -1; children?: React.ReactNode}> = ({src, startMs, endMs, depth = 1, dir = 1, children}) => {
  const ms = useMs(), k = interpolate(ms, [startMs, endMs], [0, 1], {...cl, easing: EASE.inOut});
  return <AbsoluteFill style={{transform: `scale(${1 + 0.07 * k * depth}) translateX(${dir * 24 * k * depth}px)`}}>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />{children}</AbsoluteFill>;
};

// ---------- 3. luz, sombra, grano (biblia de estilo) ----------
export const ContactShadow: React.FC<{x: number; y: number; w: number; lift?: number}> = ({x, y, w, lift = 0}) =>
  // cuanto más flota (lift en px), más pequeña y tenue
  <div style={{position: 'absolute', left: x - (w * 0.8) / 2, top: y - 18, width: w * 0.8 * (1 - lift / 400), height: 36, borderRadius: '50%',
    background: '#0A0820', opacity: 0.35 * (1 - lift / 300), filter: 'blur(24px)', transform: `translateX(${(w * 0.8 * lift) / 800}px)`}} />;

export const Vignette = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(5,4,20,.55) 100%)'}} />;

export const Grain: React.FC<{amount?: number}> = ({amount = 0.05}) => {
  const seed = useCurrentFrame() % 8; // el grano cambia cada fotograma (8 patrones) como en película
  return <AbsoluteFill style={{opacity: amount, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
    <svg width={W} height={H}><filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width={W} height={H} filter={`url(#g${seed})`} /></svg></AbsoluteFill>;
};

// partículas de luz de fondo: deriva lenta hacia arriba + parpadeo; nunca quietas
export const Motes: React.FC<{n?: number; color?: string; seed?: number}> = ({n = 28, color = '#FF5FA2', seed = 1}) => {
  const ms = useMs();
  return <svg width={W} height={H} style={{position: 'absolute'}}>{Array.from({length: n}, (_, i) => {
    const r = ((i * 9301 + seed * 49297) % 233280) / 233280, x = r * W, sp = 0.012 + r * 0.02;
    const y = H - (((ms * sp) + r * H * 3) % (H + 200)), tw = 0.35 + 0.35 * Math.sin(ms / 700 + i);
    return <circle key={i} cx={x + Math.sin(ms / 1900 + i) * 18} cy={y} r={2 + (i % 4)} fill={color} opacity={tw} style={{filter: 'blur(1px)'}} />;})}</svg>;
};

// ---------- sprite vivo: entrada con muelle + bucle orgánico + sombra de contacto + luz de borde ----------
type In = 'pop' | 'rise' | 'slideL' | 'slideR' | 'drop';
export const Actor: React.FC<{src: string; x: number; y: number; w: number; inMs: number; enter?: In; outMs?: number; seed?: number;
  floating?: boolean; rim?: string; heavy?: boolean; scale?: number}> = ({src, x, y, w, inMs, enter = 'pop', outMs, seed = 0, floating, rim = '#FF5FA2', heavy, scale = 1}) => {
  const ms = useMs(), p = useSpring(inMs, heavy ? SPRING.pesado : SPRING.elastico), id = idle(ms, seed);
  const o = outMs != null ? interpolate(ms, [outMs, outMs + 280], [1, 0], {...cl, easing: EASE.in}) : 1;
  const dx = enter === 'slideL' ? (1 - p) * -700 : enter === 'slideR' ? (1 - p) * 700 : 0;
  const dy = enter === 'rise' ? (1 - p) * 500 : enter === 'drop' ? (1 - p) * -600 : 0;
  const sc = (enter === 'pop' ? p : 1) * id.breathe * scale, lift = floating ? 30 + id.float * 1.6 : 0;
  return <>
    <ContactShadow x={x + dx} y={y + w * 0.48} w={w} lift={lift} />
    <Img src={staticFile(src)} style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w, opacity: Math.min(1, p * 1.4) * o,
      transform: `translate(${dx}px,${dy - lift + (floating ? 0 : id.float * 0.3)}px) scale(${sc}) rotate(${id.sway}deg)`,
      transformOrigin: '50% 90%', filter: `drop-shadow(-6px -4px 10px ${rim}40)`}} />
  </>;
};

// ---------- 4. texto al ritmo de la voz: stagger por palabra ----------
// cada palabra entra 70 ms después de la anterior: sube 24 px + fundido, 260 ms, EASE.out
export const STAGGER_MS = 70, WORD_IN_MS = 260;
export const StaggerText: React.FC<{text: string; atMs: number; y: number; size?: number; color?: string}> = ({text, atMs, y, size = 96, color = '#fff'}) => {
  const ms = useMs();
  return <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', fontFamily: '"Inter Display", Inter, sans-serif', fontWeight: 900, fontSize: size, color}}>
    {text.split(' ').map((w, i) => {const t = interpolate(ms, [atMs + i * STAGGER_MS, atMs + i * STAGGER_MS + WORD_IN_MS], [0, 1], {...cl, easing: EASE.out});
      return <span key={i} style={{display: 'inline-block', margin: '0 .18em', opacity: t, transform: `translateY(${(1 - t) * 24}px)`}}>{w}</span>;})}</div>;
};

// ---------- 3. transiciones (nunca corte seco) ----------
// a) paneo rápido de cámara (whip): la escena saliente se va 320 ms hacia la izquierda con desenfoque de movimiento,
//    la entrante llega desde la derecha; se solapan 320 ms.
// b) fundido cruzado: 400 ms, inOut.  c) "morph": un objeto escala/viaja hasta la posición del siguiente (MorphBridge).
export const TRANS_MS = {whip: 320, fade: 400, zoomThrough: 450, none: 0};
export type Trans = 'whip' | 'fade' | 'zoomThrough' | 'none';
export const Shot: React.FC<{startMs: number; endMs: number; inT?: Trans; outT?: Trans; punchMs?: number[]; children: React.ReactNode}> = ({startMs, endMs, inT = 'whip', outT = 'whip', punchMs = [], children}) => {
  const ms = useMs(), d = TRANS_MS[inT], dOut = TRANS_MS[outT];
  if (ms < startMs - d || ms > endMs + dOut) return null;
  const a = interpolate(ms, [startMs - d, startMs], [0, 1], {...cl, easing: EASE.out});     // entrada 0→1
  const b = interpolate(ms, [endMs, endMs + dOut], [0, 1], {...cl, easing: EASE.in});       // salida 0→1
  let x = 0, sc = 1, op = 1, blur = 0;
  if (inT === 'whip') {x += (1 - a) * W; blur += (1 - a) * 18;} else if (inT === 'fade') op *= a; else if (inT === 'zoomThrough') {sc *= 0.85 + 0.15 * a; op *= a;}
  if (outT === 'whip') {x -= b * W; blur += b * 18;} else if (outT === 'fade') op *= 1 - b; else {sc *= 1 + b * 1.4; op *= 1 - b;}
  // zoom de énfasis en palabra clave: +12 % en 180 ms (back), aguanta 900 ms, vuelve en 300 ms
  for (const p of punchMs) sc *= 1 + 0.12 * interpolate(ms, [p, p + 180, p + 1080, p + 1380], [0, 1, 1, 0], {...cl, easing: EASE.back});
  return <AbsoluteFill style={{transform: `translateX(${x}px) scale(${sc})`, opacity: op, filter: blur ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
};

// objeto puente: viaja de (x0,y0,w0) a (x1,y1,w1) en durMs con inOut; se usa para que un objeto "se convierta" en el siguiente plano
export const MorphBridge: React.FC<{src: string; atMs: number; durMs?: number; from: [number, number, number]; to: [number, number, number]; toSrc?: string}> = ({src, atMs, durMs = 600, from, to, toSrc}) => {
  const ms = useMs(), k = interpolate(ms, [atMs, atMs + durMs], [0, 1], {...cl, easing: EASE.inOut});
  if (ms < atMs || ms > atMs + durMs + 34) return null;
  const [x, y, w] = from.map((v, i) => v + (to[i] - v) * k);
  return <>{[src, toSrc].filter(Boolean).map((s, i) => <Img key={i} src={staticFile(s!)} style={{position: 'absolute', left: x - w / 2, top: y - w / 2, width: w,
    opacity: toSrc ? (i ? k : 1 - k) : 1}} />)}</>;
};
