// Ilustraciones SVG del vídeo 07 (agua): Tierra con océanos, ciclo del agua, dinosaurio, gota dividida, glaciar y subsuelo,
// botella con gotas, cuadrícula de personas, grifo, hidrógeno escapando, Sol gigante, vaso.
import React from 'react';
import {PAL, Sombra} from './arte';

const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};
export const DefsAgua: React.FC = () => <defs>
  <radialGradient id="gMar" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#6C8BFF" /><stop offset=".6" stopColor="#3F5BD9" /><stop offset="1" stopColor="#24308F" /></radialGradient>
  <linearGradient id="gAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FD8FF" /><stop offset="1" stopColor="#3F5BD9" /></linearGradient>
  <linearGradient id="gHielo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4FBFF" /><stop offset="1" stopColor="#9FE0FF" /></linearGradient>
  <linearGradient id="gTierra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6B4A8F" /><stop offset="1" stopColor="#2A1B4F" /></linearGradient>
  <radialGradient id="gSolA" cx=".4" cy=".4" r=".7"><stop offset="0" stopColor="#FFF4C2" /><stop offset=".5" stopColor="#FFB534" /><stop offset="1" stopColor="#E8621A" /></radialGradient>
</defs>;

const gota = (s: number) => `M0 ${-60 * s} C ${30 * s} ${-20 * s}, ${45 * s} ${5 * s}, ${45 * s} ${25 * s} A ${45 * s} ${45 * s} 0 0 1 ${-45 * s} ${25 * s} C ${-45 * s} ${5 * s}, ${-30 * s} ${-20 * s}, 0 ${-60 * s} Z`;
export const Gota: React.FC<{x: number; y: number; s?: number; fill?: string; o?: number}> = ({x, y, s = 1, fill = 'url(#gAgua)', o = 1}) =>
  <g transform={`translate(${x} ${y})`} opacity={o}><path d={gota(s)} fill={fill} /><ellipse cx={-14 * s} cy={8 * s} rx={9 * s} ry={14 * s} fill="#fff" opacity={0.45} /></g>;

// Tierra con océanos que giran (continentes desplazándose)
export const Tierra: React.FC<{t: number; x: number; y: number; r: number; seca?: number}> = ({t, x, y, r, seca = 0}) => {
  const off = (t / 40) % (r * 4);
  const cont = [[0.1, -0.35, 0.42, 0.28], [0.9, 0.05, 0.36, 0.5], [1.7, -0.2, 0.5, 0.3], [2.5, 0.35, 0.3, 0.22], [3.2, -0.05, 0.4, 0.38]];
  return <g>
    <circle cx={x} cy={y} r={r * 1.12} fill="#6C8BFF" opacity={0.18} filter="url(#blur18)" />
    <clipPath id="clipT"><circle cx={x} cy={y} r={r} /></clipPath>
    <circle cx={x} cy={y} r={r} fill={seca > 0 ? `rgb(${63 + 120 * seca},${91 + 20 * seca},${217 - 150 * seca})` : 'url(#gMar)'} />
    <g clipPath="url(#clipT)">{[0, 1].map(k => cont.map(([cx, cy, w, h], i) =>
      <ellipse key={`${k}${i}`} cx={x - r * 2 + ((cx * r + off + k * r * 4) % (r * 4))} cy={y + cy * r} rx={w * r} ry={h * r} fill={seca > 0.5 ? '#C98A5E' : '#2F9E7E'} transform={`rotate(${i * 23} ${x} ${y})`} />))}
      <circle cx={x + r * 0.35} cy={y + r * 0.3} r={r} fill="#0A0820" opacity={0.35} />
      <ellipse cx={x - r * 0.4} cy={y - r * 0.45} rx={r * 0.35} ry={r * 0.22} fill="#fff" opacity={0.15} /></g>
  </g>;
};

// ciclo del agua: sol, mar, vapor que sube, nube y lluvia
export const Ciclo: React.FC<{t: number; k?: number}> = ({t, k = 1}) => <g>
  <circle cx={880} cy={560} r={110} fill="url(#gSolA)" /><circle cx={880} cy={560} r={150} fill="#FFB534" opacity={0.2} filter="url(#blur18)" />
  <path d="M0 1450 Q270 1410 540 1450 T1080 1450 L1080 1920 L0 1920Z" fill="url(#gMar)" />
  {[0, 1, 2].map(i => <path key={i} d={`M${-100 + ((t / 8 + i * 360) % 1280)} 1470 q40 -20 80 0`} fill="none" stroke="#9FE0FF" strokeWidth={8} strokeLinecap="round" opacity={0.6} />)}
  {[0, 1, 2, 3].map(i => {const ph = ((t / 1500) + i / 4) % 1; return <path key={i} d={`M${700 + i * 60} ${1420 - ph * 500} q20 -30 0 -60 q-20 -30 0 -60`} fill="none" stroke="#E3DEFF" strokeWidth={12} strokeLinecap="round" opacity={0.5 * Math.sin(ph * Math.PI) * k} />;})}
  <g transform={`translate(${380 + Math.sin(t / 1500) * 20} 760)`}>
    {[[-110, 20, 80], [-30, -20, 100], [70, 10, 85], [140, 40, 60]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill="#E3DEFF" />)}
    <rect x={-190} y={30} width={390} height={80} rx={40} fill="#E3DEFF" /><rect x={-190} y={70} width={390} height={40} rx={20} fill="#B9AEE8" />
  </g>
  {Array.from({length: 14}, (_, i) => {const ph = ((t / 700) + rnd(i)) % 1; return <Gota key={i} x={240 + rnd(i + 1) * 300} y={900 + ph * 520} s={0.25} o={k * (1 - ph * 0.5)} />;})}
</g>;

// dinosaurio (saurópodo) bebiendo
export const Dino: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) => {
  const cuello = Math.sin(t / 700) * 6;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={210} rx={260} />
    <path d="M200 60 Q330 90 380 30 Q350 120 210 130Z" fill="#2F9E7E" />
    <ellipse cx={40} cy={70} rx={210} ry={120} fill="#3FB48F" /><ellipse cx={70} cy={110} rx={170} ry={70} fill="#2F9E7E" opacity={0.55} />
    {[-120, -40, 80, 160].map((k, i) => <rect key={i} x={k} y={120} width={58} height={95} rx={26} fill={i % 2 ? '#2F9E7E' : '#3FB48F'} />)}
    <g transform={`rotate(${cuello} -130 20)`}>
      <path d="M-120 40 Q-220 -60 -230 -230 L-170 -240 Q-160 -90 -60 0Z" fill="#3FB48F" />
      <ellipse cx={-215} cy={-250} rx={70} ry={42} fill="#3FB48F" /><circle cx={-240} cy={-262} r={9} fill={PAL.noche1} />
      <ellipse cx={-180} cy={-238} rx={18} ry={8} fill="#2F9E7E" />
    </g>
    {[0, 1, 2, 3].map(i => <circle key={i} cx={-20 + i * 70} cy={30 - (i % 2) * 20} r={16} fill="#6EE7B7" opacity={0.6} />)}
  </g>;
};

// gota grande dividida: 97 % salada / 3 % dulce (k = progreso del relleno)
export const GotaDividida: React.FC<{x: number; y: number; s?: number; k: number}> = ({x, y, s = 1, k}) => {
  const H = 105 * s * 2, top = y - 60 * s * 2, nivel = top + H * (1 - 0.97 * k);
  return <g>
    <clipPath id="clipG"><path d={gota(s * 2)} transform={`translate(${x} ${y})`} /></clipPath>
    <path d={gota(s * 2)} transform={`translate(${x} ${y})`} fill="#E3DEFF" opacity={0.25} />
    <g clipPath="url(#clipG)"><rect x={x - 200 * s} y={nivel} width={400 * s} height={H + 50} fill="#2B3E9E" />
      {Array.from({length: 18}, (_, i) => <circle key={i} cx={x - 70 * s + rnd(i) * 140 * s} cy={nivel + 30 + rnd(i + 3) * (H - 30)} r={5} fill="#fff" opacity={0.5} />)}
      <rect x={x - 200 * s} y={top - 50} width={400 * s} height={nivel - top + 50} fill="#7FD8FF" /></g>
  </g>;
};

// corte del terreno: glaciar arriba, agua subterránea abajo, un río fino
export const Glaciar: React.FC<{t: number; k?: number}> = ({t, k = 1}) => <g>
  <path d="M0 1100 L220 760 L360 900 L560 640 L760 880 L900 740 L1080 980 L1080 1920 L0 1920Z" fill="url(#gTierra)" />
  <path d="M220 760 L300 840 L250 860 L180 820Z M560 640 L680 770 L600 800 L520 760 L480 700Z M900 740 L980 840 L900 830 L860 790Z" fill="url(#gHielo)" opacity={k} />
  <rect x={0} y={1350} width={1080} height={570} fill="#24184A" />
  {Array.from({length: 30}, (_, i) => <ellipse key={i} cx={(i * 173) % 1080} cy={1420 + ((i * 97) % 440)} rx={40 + (i % 3) * 20} ry={14} fill="#3F5BD9" opacity={(0.35 + 0.25 * Math.sin(t / 600 + i)) * k} />)}
  <path d="M0 1300 Q300 1270 540 1310 T1080 1290" fill="none" stroke="#7FD8FF" strokeWidth={10} strokeDasharray="30 20" strokeDashoffset={-t / 10} />
</g>;

// botella de 1 L con gotas que caen
export const Botella: React.FC<{t: number; x: number; y: number; s?: number; gotas?: number}> = ({t, x, y, s = 1, gotas = 0}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <Sombra cx={0} cy={380} rx={170} />
  <rect x={-50} y={-360} width={100} height={60} rx={14} fill={PAL.azul0} />
  <path d="M-55 -300 Q-55 -230 -150 -180 L-150 330 Q-150 370 -110 370 L110 370 Q150 370 150 330 L150 -180 Q55 -230 55 -300Z" fill="#9FE0FF" opacity={0.35} />
  <path d="M-150 -80 L150 -80 L150 330 Q150 370 110 370 L-110 370 Q-150 370 -150 330Z" fill="url(#gAgua)" opacity={0.85} />
  <path d={`M-150 -80 Q-75 ${-95 + Math.sin(t / 300) * 6} 0 -80 T150 -80`} fill="#7FD8FF" />
  <rect x={-120} y={-160} width={30} height={460} rx={15} fill="#fff" opacity={0.25} />
  {gotas > 0 && [0, 1].map(i => {const ph = ((t / 900) + i * 0.5) % 1; return <Gota key={i} x={0} y={420 + ph * 220} s={0.35} o={gotas * (1 - ph)} />;})}
</g>;

// cuadrícula de personas: 'marcadas' en rosa (1 de cada 4)
export const Gente: React.FC<{t: number; k: number}> = ({t, k}) => <g>{Array.from({length: 48}, (_, i) => {
  const c = i % 6, r = Math.floor(i / 6), x = 190 + c * 140, y = 600 + r * 128, on = i % 4 === 1 && rnd(i) * 1 < k * 1.2;
  return <g key={i} transform={`translate(${x} ${y + Math.sin(t / 500 + i) * 3})`}><circle cx={0} cy={-30} r={22} fill={on ? PAL.rosa : '#B9AEE8'} />
    <rect x={-28} y={-4} width={56} height={60} rx={26} fill={on ? PAL.rosa : '#8C7BD1'} /></g>;})}</g>;

// grifo que se seca
export const Grifo: React.FC<{t: number; x: number; y: number; s?: number; flujo: number}> = ({t, x, y, s = 1, flujo}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-300} y={-60} width={260} height={80} rx={30} fill="url(#gHielo)" />
  <path d="M-60 -60 L60 -60 Q140 -60 140 20 L140 80 L60 80 L60 30 Q60 20 40 20 L-60 20Z" fill="#B9AEE8" />
  <rect x={-40} y={-130} width={60} height={80} rx={16} fill="#8C7BD1" /><rect x={-110} y={-160} width={200} height={40} rx={20} fill={PAL.rosa} />
  <rect x={78} y={80} width={44} height={flujo * 600} rx={22} fill="url(#gAgua)" opacity={0.9} />
  {flujo < 0.2 && <Gota x={100} y={130 + ((t / 3) % 400)} s={0.4} o={1 - ((t / 3) % 400) / 400} />}
</g>;

// hidrógeno escapando de la Tierra (puntitos que salen)
export const Hidrogeno: React.FC<{t: number; x: number; y: number; r: number}> = ({t, x, y, r}) => <g>{Array.from({length: 30}, (_, i) => {
  const ph = ((t / 2500) + rnd(i)) % 1, a = rnd(i + 5) * Math.PI * 2, d = r * (1.05 + ph * 1.6);
  return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d} r={7} fill="#E3DEFF" opacity={(1 - ph) * 0.9} />;})}</g>;

export const SolGigante: React.FC<{t: number; k: number}> = ({t, k}) => <g>
  <circle cx={540} cy={-200 + 0} r={300 + k * 700} fill="url(#gSolA)" />
  <circle cx={540} cy={-200} r={360 + k * 760 + Math.sin(t / 300) * 20} fill="#FFB534" opacity={0.25} filter="url(#blur18)" />
</g>;

export const Vaso: React.FC<{t: number; x: number; y: number; s?: number; nivel?: number}> = ({t, x, y, s = 1, nivel = 0.7}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <Sombra cx={0} cy={260} rx={150} />
  <path d="M-130 -220 L130 -220 L100 250 L-100 250Z" fill="#E3DEFF" opacity={0.25} />
  <clipPath id="clipV"><path d="M-130 -220 L130 -220 L100 250 L-100 250Z" /></clipPath>
  <g clipPath="url(#clipV)"><rect x={-140} y={250 - 470 * nivel} width={280} height={500} fill="url(#gAgua)" />
    <path d={`M-140 ${250 - 470 * nivel} Q-70 ${240 - 470 * nivel + Math.sin(t / 300) * 8} 0 ${250 - 470 * nivel} T140 ${250 - 470 * nivel}`} fill="#7FD8FF" /></g>
  <rect x={-110} y={-200} width={24} height={420} rx={12} fill="#fff" opacity={0.3} />
</g>;
