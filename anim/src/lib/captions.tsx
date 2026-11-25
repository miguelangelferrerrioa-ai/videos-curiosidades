// Subtítulos virales (estilo 1mdatos) sincronizados con los tiempos reales de Whisper (anim/src/<nombre>.json).
// Formato del plan.json, por frase:  "clave": "bostezar"  (palabra de énfasis; varias con "|": "familia|amigos")
//                                   "color": "amarillo" | "verde" | "naranja" | "rosa"   (opcional; por defecto amarillo)
// Reglas:
//  - Inter Display 900, 84 px a 1080p, blanco #FFFFFF; sin cajas ni contorno negro duro: solo sombra difuminada.
//  - Grupos de 2–3 palabras (corta antes en puntuación o si pasa de 18 letras); el grupo aparece cuando se dice su 1.ª palabra.
//  - Entrada del grupo: escala 0.90→1.00 en 220 ms con rebote suave (bezier .34,1.56,.64,1) + fundido 120 ms.
//  - Las palabras del grupo aún no dichas van al 55 % de opacidad; la dicha, al 100 %.
//  - Palabra clave: cambia de blanco a color de énfasis EXACTAMENTE cuando empieza a pronunciarse (120 ms de transición)
//    y hace un "pop" de 1.00→1.12→1.04.
//  - Posición: tercio superior (y = 360 px), fuera de la zona de la interfaz de TikTok/Shorts (abajo y a la derecha).
import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';

type Wd = {w: string; a: number; b: number};
type Fr = {a: number; b: number; words: Wd[]; clave?: string; color?: string};
const COL: Record<string, string> = {amarillo: '#FFD23F', verde: '#7CFF6B', naranja: '#FF8A3D', rosa: '#FF5FA2'};
const nz = (s: string) => s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
const BACK = Easing.bezier(0.34, 1.56, 0.64, 1), cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const groups = (ws: Wd[]) => {
  const out: number[][] = []; let g: number[] = [], len = 0;
  ws.forEach((w, i) => {
    if (g.length && (g.length >= 3 || len + w.w.length > 18)) {out.push(g); g = []; len = 0;}
    g.push(i); len += w.w.length;
    if (/[.,;:?!…]$/.test(w.w) && g.length >= 2) {out.push(g); g = []; len = 0;}
  });
  if (g.length) out.push(g);
  return out;
};

export const Captions: React.FC<{frases: Fr[]; fps?: number; y?: number; size?: number}> = ({frases, fps = 30, y = 360, size = 84}) => {
  const t = useCurrentFrame() / fps;
  const fr = frases.find((f, i) => t >= f.words[0]?.a - 0.05 && t < (frases[i + 1]?.words[0]?.a ?? f.b + 0.6) - 0.05);
  if (!fr) return null;
  const G = groups(fr.words);
  const gi = G.findIndex((g, k) => t >= fr.words[g[0]].a - 0.05 && (k === G.length - 1 || t < fr.words[G[k + 1][0]].a - 0.05));
  if (gi < 0) return null;
  const g = G[gi], g0 = fr.words[g[0]].a - 0.05;
  const sc = interpolate(t, [g0, g0 + 0.22], [0.9, 1], {...cl, easing: BACK}), op = interpolate(t, [g0, g0 + 0.12], [0, 1], cl);
  const claves = (fr.clave || '').split('|').map(nz).filter(Boolean), emph = COL[fr.color || 'amarillo'];
  return <div style={{position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', transform: `scale(${sc})`, opacity: op,
    fontFamily: '"Inter Display", Inter, sans-serif', fontWeight: 900, fontSize: size, lineHeight: 1.15, letterSpacing: -1}}>
    {g.map(i => {
      const w = fr.words[i], said = t >= w.a, key = claves.some(c => nz(w.w).includes(c));
      const k = key ? interpolate(t, [w.a, w.a + 0.12], [0, 1], cl) : 0;
      const pop = key ? interpolate(t, [w.a, w.a + 0.1, w.a + 0.25], [1, 1.12, 1.04], cl) : 1;
      return <span key={i} style={{display: 'inline-block', margin: '0 .16em', color: k > 0.5 ? emph : '#FFFFFF', opacity: said ? 1 : 0.55,
        transform: `scale(${pop})`, textShadow: '0 4px 18px rgba(8,6,30,.75), 0 1px 3px rgba(8,6,30,.6)'}}>{w.w.toUpperCase()}</span>;
    })}
  </div>;
};
