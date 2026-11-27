// Ilustraciones SVG del vídeo 08 (mosquitos): mosquito con alas que baten, gota de sangre, huevos, pez, rana, libélula,
// pájaro, murciélago, tundra ártica, orquídea, caja de laboratorio con ADN.
import React from 'react';
import {PAL, Sombra} from './arte';

const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};

// mosquito de perfil; t = ms (alas a ~30 Hz visibles como desenfoque), hembra = abdomen rojo de sangre
export const Mosquito: React.FC<{t: number; x: number; y: number; s?: number; rot?: number; sangre?: number; o?: number; flip?: boolean}> =
  ({t, x, y, s = 1, rot = 0, sangre = 0, o = 1, flip}) => {
  const ala = Math.sin(t / 16) * 28;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`} opacity={o}>
    {[[-40, 60, -60, 150], [10, 62, 30, 160], [50, 60, 110, 150]].map(([a, b, c, d], i) =>
      <path key={i} d={`M${a} ${b - 20} Q${a + (c - a) * 0.4} ${b + 40} ${c} ${d}`} fill="none" stroke="#3B2470" strokeWidth={6} strokeLinecap="round" />)}
    <path d="M-170 10 L-60 0" stroke="#3B2470" strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={95} cy={10} rx={110} ry={26} fill="#5B3A9E" transform="rotate(12 95 10)" />
    {sangre > 0 && <ellipse cx={110} cy={14} rx={95 * sangre} ry={24 * sangre} fill="#E53950" transform="rotate(12 95 10)" opacity={0.9} />}
    {[40, 80, 120, 160].map(k => <rect key={k} x={k} y={-6} width={10} height={36} rx={5} fill="#3B2470" opacity={0.5} transform="rotate(12 95 10)" />)}
    <ellipse cx={-5} cy={0} rx={45} ry={36} fill="#6B4FB0" />
    <circle cx={-55} cy={-4} r={26} fill="#7A5CC4" /><circle cx={-62} cy={-10} r={10} fill="#1A1440" />
    <path d="M-60 -24 Q-95 -70 -120 -60" fill="none" stroke="#3B2470" strokeWidth={4} />
    <g transform={`rotate(${-20 + ala} 0 -20)`}><ellipse cx={40} cy={-70} rx={90} ry={26} fill="#E3DEFF" opacity={0.55} /></g>
    <g transform={`rotate(${-35 - ala} 0 -20)`}><ellipse cx={30} cy={-75} rx={80} ry={22} fill="#E3DEFF" opacity={0.35} /></g>
  </g>;
};

export const GotaSangre: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 -60 C30 -20 45 5 45 25 A45 45 0 0 1 -45 25 C-45 5 -30 -20 0 -60Z" fill="#E53950" />
    <ellipse cx={-14} cy={8} rx={9} ry={14} fill="#fff" opacity={0.4} /></g>;

export const Huevos: React.FC<{t: number; x: number; y: number; k: number}> = ({t, x, y, k}) =>
  <g>{Array.from({length: 14}, (_, i) => {const a = i / 14 * Math.PI * 2, r = 60 + (i % 3) * 30, p = Math.min(1, Math.max(0, k * 14 - i));
    return <ellipse key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * 0.5} rx={14 * p} ry={22 * p} fill="#F4F1FF" opacity={0.9} transform={`rotate(${a * 57} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r * 0.5})`} />;})}</g>;

export const Pez: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) =>
  <g transform={`translate(${x + Math.sin(t / 900) * 40} ${y}) scale(${s})`}>
    <path d={`M80 0 L150 ${-50 + Math.sin(t / 150) * 10} L150 ${50 + Math.sin(t / 150) * 10}Z`} fill="#FF8A3D" />
    <ellipse cx={0} cy={0} rx={110} ry={62} fill="#FFB534" /><ellipse cx={10} cy={20} rx={90} ry={34} fill="#FF8A3D" opacity={0.5} />
    <circle cx={-60} cy={-12} r={10} fill={PAL.noche1} /><path d="M-20 -60 Q10 -100 50 -60Z" fill="#FF8A3D" />
  </g>;

export const Rana: React.FC<{t: number; x: number; y: number; s?: number; lengua?: number}> = ({t, x, y, s = 1, lengua = 0}) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={80} rx={130} />
    <ellipse cx={0} cy={20} rx={130} ry={80} fill="#3FB48F" /><ellipse cx={20} cy={50} rx={100} ry={40} fill="#2F9E7E" opacity={0.6} />
    {[-55, 55].map(k => <g key={k}><circle cx={k} cy={-45} r={36} fill="#3FB48F" /><circle cx={k} cy={-48} r={20} fill="#F4F1FF" /><circle cx={k + 4} cy={-46} r={11} fill={PAL.noche1} /></g>)}
    <path d="M-60 25 Q0 55 60 25" fill="none" stroke="#2F9E7E" strokeWidth={8} strokeLinecap="round" />
    {lengua > 0 && <line x1={0} y1={30} x2={lengua * 260} y2={30 - lengua * 300} stroke={PAL.rosa} strokeWidth={14} strokeLinecap="round" />}
  </g>;

export const Libelula: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) => {
  const a = Math.sin(t / 20) * 18;
  return <g transform={`translate(${x} ${y + Math.sin(t / 500) * 20}) scale(${s})`}>
    {[-1, 1].map(k => <g key={k}><ellipse cx={-10} cy={k * 60} rx={26} ry={80} fill="#9FE0FF" opacity={0.45} transform={`rotate(${k * (20 + a)} -10 0)`} />
      <ellipse cx={30} cy={k * 55} rx={22} ry={70} fill="#9FE0FF" opacity={0.35} transform={`rotate(${k * (-15 - a)} 30 0)`} /></g>)}
    <rect x={10} y={-10} width={220} height={20} rx={10} fill="#2F9E7E" /><ellipse cx={0} cy={0} rx={40} ry={26} fill="#3FB48F" /><circle cx={-40} cy={0} r={22} fill="#6EE7B7" />
  </g>;
};

export const Pajaro: React.FC<{t: number; x: number; y: number; s?: number; c?: string}> = ({t, x, y, s = 1, c = '#FF8A3D'}) => {
  const a = Math.sin(t / 90) * 30;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M-10 0 Q-60 ${-30 - a} -110 ${-10 - a * 1.5} Q-60 10 -10 10Z`} fill={c} opacity={0.8} />
    <ellipse cx={0} cy={0} rx={60} ry={34} fill={c} /><circle cx={50} cy={-18} r={26} fill={c} /><path d="M72 -20 L100 -12 L72 -6Z" fill={PAL.amar} />
    <circle cx={58} cy={-24} r={5} fill={PAL.noche1} />
    <path d={`M10 0 Q-20 ${-40 + a} -60 ${-30 + a * 1.4} Q-20 10 10 10Z`} fill={c} />
  </g>;
};

export const Murcielago: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) => {
  const a = Math.sin(t / 110) * 25;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map(k => <path key={k} d={`M0 0 Q${k * 60} ${-60 - a} ${k * 160} ${-30 - a} Q${k * 130} 10 ${k * 110} 0 Q${k * 80} 20 ${k * 55} 5 Q${k * 30} 25 0 10Z`} fill="#3B2470" />)}
    <ellipse cx={0} cy={5} rx={30} ry={40} fill="#5B3A9E" /><path d="M-18 -30 L-12 -55 L-4 -32 M4 -32 L12 -55 L18 -30" fill="#5B3A9E" />
    {[-10, 10].map(k => <circle key={k} cx={k} cy={-12} r={5} fill={PAL.amar} />)}
  </g>;
};

export const Tundra: React.FC<{t: number}> = ({t}) => <g>
  <rect width={1080} height={1920} fill="#1E2A5C" />
  <path d="M0 400 Q270 330 540 380 T1080 360 L1080 0 L0 0Z" fill="#14163A" />
  {[0, 1, 2].map(i => <path key={i} d={`M-100 ${260 + i * 50} Q300 ${180 + i * 40 + Math.sin(t / 1500 + i) * 30} 600 ${270 + i * 40} T1200 ${230 + i * 50}`} fill="none" stroke={i % 2 ? '#6EE7B7' : '#FF5FA2'} strokeWidth={50} opacity={0.18} filter="url(#blur18)" />)}
  <path d="M0 1350 Q300 1300 600 1340 T1080 1320 L1080 1920 L0 1920Z" fill="#E3DEFF" />
  <path d="M0 1450 Q300 1420 600 1460 T1080 1440 L1080 1920 L0 1920Z" fill="#B9AEE8" />
  {[160, 420, 760, 960].map((x, i) => <ellipse key={i} cx={x} cy={1500 + i * 40} rx={90} ry={22} fill="#7FD8FF" opacity={0.6} />)}
</g>;

// nube de mosquitos (puntos que zumban)
export const Nube: React.FC<{t: number; x: number; y: number; n?: number; r?: number; o?: number}> = ({t, x, y, n = 60, r = 220, o = 1}) =>
  <g opacity={o}>{Array.from({length: n}, (_, i) => <circle key={i} cx={x + Math.sin(t / (180 + rnd(i) * 200) + i) * r * rnd(i + 2)} cy={y + Math.cos(t / (160 + rnd(i + 4) * 220) + i * 2) * r * 0.6 * rnd(i + 5)} r={4} fill="#1A1440" />)}</g>;

export const Orquidea: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) =>
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t / 900) * 3})`}>
    <path d="M0 0 Q-20 300 10 520" fill="none" stroke="#2F9E7E" strokeWidth={16} strokeLinecap="round" />
    <ellipse cx={-110} cy={380} rx={120} ry={40} fill="#3FB48F" transform="rotate(-25 -110 380)" />
    {[0, 72, 144, 216, 288].map((a, i) => <ellipse key={i} cx={0} cy={-90} rx={55} ry={110} fill={i % 2 ? '#FF8FB8' : '#FFB3CF'} transform={`rotate(${a} 0 0)`} />)}
    <ellipse cx={0} cy={20} rx={60} ry={70} fill={PAL.rosa} /><circle cx={0} cy={0} r={30} fill={PAL.amar} />
  </g>;

export const Caja: React.FC<{t: number; x: number; y: number; abre: number}> = ({t, x, y, abre}) =>
  <g transform={`translate(${x} ${y})`}>
    <Sombra cx={0} cy={170} rx={230} />
    <rect x={-200} y={-120} width={400} height={290} rx={24} fill="#E3DEFF" /><rect x={20} y={-120} width={180} height={290} rx={24} fill="#000" opacity={0.08} />
    <g transform={`rotate(${-abre * 70} -200 -120)`}><rect x={-210} y={-160} width={420} height={50} rx={18} fill={PAL.azul0} /></g>
    <g transform="translate(0 30)">{[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={-60 + i * 20} y={-50 + Math.sin(i + t / 300) * 6} width={10} height={100} rx={5} fill={i % 2 ? PAL.rosa : PAL.azul1} transform={`rotate(${i * 30 + t / 20} ${-55 + i * 20} 0)`} />)}</g>
    <text x={0} y={140} textAnchor="middle" fontFamily='"Inter Display", Inter' fontWeight={900} fontSize={44} fill={PAL.purp1}>LAB</text>
  </g>;
