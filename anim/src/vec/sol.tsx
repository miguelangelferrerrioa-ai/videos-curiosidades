// Ilustraciones SVG del vídeo 06 (Sol): gránulos, palomitas, observatorio en volcán, espejo, convección, olla, distancia Tierra–Sol, moneda.
import React from 'react';
import {PAL, Sombra} from './arte';

const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x);};

// gradientes propios (añadir dentro del <svg>, junto a <Defs/>)
export const DefsSol: React.FC = () => <defs>
  <radialGradient id="gGran" cx=".45" cy=".4" r=".65"><stop offset="0" stopColor="#FFF1B0" /><stop offset=".45" stopColor="#FFB534" /><stop offset="1" stopColor="#E8621A" /></radialGradient>
  <radialGradient id="gSol" cx=".4" cy=".4" r=".7"><stop offset="0" stopColor="#FFF4C2" /><stop offset=".5" stopColor="#FFB534" /><stop offset="1" stopColor="#E8621A" /></radialGradient>
  <linearGradient id="gVolcan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B3A9E" /><stop offset="1" stopColor="#24184A" /></linearGradient>
  <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E3DEFF" /><stop offset="1" stopColor="#8C7BD1" /></linearGradient>
  <radialGradient id="gPop" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".7" stopColor="#FFF1C9" /><stop offset="1" stopColor="#F3C77A" /></radialGradient>
</defs>;

// campo de gránulos solares: celdas que "hierven" (laten, cambian de brillo y se renuevan); vida = ms por ciclo de cada celda
export const Granulos: React.FC<{t: number; x?: number; y?: number; w?: number; h?: number; cell?: number; vida?: number; hot?: number}> =
  ({t, x = 0, y = 0, w = 1080, h = 1920, cell = 120, vida = 4200, hot = 1}) => {
  const cols = Math.ceil(w / cell) + 2, rows = Math.ceil(h / (cell * 0.87)) + 2, out: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * 97 + c, ph = ((t / vida) + rnd(i)) % 1, life = Math.sin(ph * Math.PI);  // nace, crece y se apaga
    const cx = x + (c - 1) * cell + (r % 2) * cell / 2 + (rnd(i + 3) - 0.5) * cell * 0.35, cy = y + (r - 1) * cell * 0.87 + (rnd(i + 7) - 0.5) * cell * 0.35;
    const rr = cell * (0.42 + 0.12 * life) * (0.85 + rnd(i + 11) * 0.3);
    out.push(<ellipse key={i} cx={cx} cy={cy} rx={rr} ry={rr * (0.85 + rnd(i + 5) * 0.25)} fill="url(#gGran)" opacity={0.55 + 0.45 * life * hot}
      transform={`rotate(${rnd(i + 9) * 180} ${cx} ${cy})`} />);
  }
  return <g><rect x={x} y={y} width={w} height={h} fill="#7A2306" />{out}</g>;
};

// palomitas (cúmulo de bolitas) — para el gancho
export const Palomita: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) =>
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[[0, 0, 34], [-28, -14, 26], [26, -18, 28], [-6, -36, 24], [20, 16, 22], [-24, 18, 20]].map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r} fill="url(#gPop)" />)}
    <circle cx={4} cy={6} r={12} fill="#E8A84A" opacity={0.6} />
  </g>;

export const Cubo: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={300} rx={230} />
    <path d="M-220 -40 L220 -40 L170 290 L-170 290Z" fill="#F4F1FF" />
    {[-150, -60, 30, 120].map((k, i) => <path key={i} d={`M${k} -40 L${k + 50} -40 L${k + 38} 290 L${k + 3 - (i - 1.5) * 4} 290Z`} fill={PAL.rosa} />)}
    <path d="M60 -40 L220 -40 L170 290 L60 290Z" fill="#000" opacity={0.12} />
  </g>;

// observatorio en la cima de un volcán (de noche, con la cúpula abriéndose: abre 0..1)
export const Volcan: React.FC<{t: number; abre?: number}> = ({t, abre = 0}) => <g>
  <path d="M-100 1920 L380 1050 Q540 960 700 1050 L1180 1920Z" fill="url(#gVolcan)" />
  <path d="M540 980 Q640 990 700 1050 L1180 1920 L760 1920Z" fill="#000" opacity={0.18} />
  {[0, 1, 2].map(i => <ellipse key={i} cx={420 + i * 120 + Math.sin(t / 2000 + i) * 30} cy={1230 + i * 90} rx={160} ry={28} fill="#E3DEFF" opacity={0.18} filter="url(#blur6)" />)}
  <Sombra cx={540} cy={1000} rx={150} o={0.3} />
  <rect x={430} y={900} width={220} height={100} rx={10} fill="#E3DEFF" />
  <path d="M430 905 A110 110 0 0 1 650 905Z" fill="url(#gMetal)" />
  <rect x={540 - 14 - abre * 30} y={800} width={28 + abre * 60} height={105} fill={PAL.noche0} />
  <circle cx={540} cy={1000} r={6} fill={PAL.amar} opacity={0.6 + 0.4 * Math.sin(t / 300)} />
</g>;

// espejo de 4 m que concentra la luz en un punto (rayos animados); fundir 0..1 = gota de metal fundido
export const Espejo: React.FC<{t: number; x: number; y: number; foco?: number; fundir?: number}> = ({t, x, y, foco = 1, fundir = 0}) => <g transform={`translate(${x} ${y})`}>
  <Sombra cx={0} cy={330} rx={300} />
  <path d="M-320 160 Q0 300 320 160 L300 210 Q0 350 -300 210Z" fill="url(#gMetal)" />
  <path d="M-320 160 Q0 300 320 160 Q0 250 -320 160Z" fill="#9FE0FF" opacity={0.7} />
  {[-260, -150, -50, 50, 150, 260].map((k, i) => {const d = (t / 6 + i * 40) % 200;
    return <g key={i}><line x1={k} y1={-700} x2={k} y2={180 + Math.abs(k) * -0.25} stroke={PAL.amar} strokeWidth={8} opacity={0.35} />
      <line x1={k} y1={180 + Math.abs(k) * -0.25} x2={0} y2={-260} stroke={PAL.amar} strokeWidth={8} opacity={0.55 * foco} strokeDasharray="30 30" strokeDashoffset={-d} /></g>;})}
  <circle cx={0} cy={-260} r={40 + 10 * Math.sin(t / 120)} fill="#FFF4C2" opacity={foco} filter="url(#glow)" />
  {fundir > 0 && <g><rect x={-60} y={-330} width={120} height={50} rx={10} fill="#8C7BD1" />
    <path d={`M-10 -282 Q0 ${-282 + fundir * 120} 10 -282Z`} fill="#FF8A3D" /><circle cx={0} cy={-282 + fundir * 130} r={14 * fundir} fill="#FF5A4A" /></g>}
</g>;

// tuberías de refrigeración con flujo azul y copos
export const Frio: React.FC<{t: number; o?: number}> = ({t, o = 1}) => <g opacity={o}>
  {[0, 1, 2].map(i => <g key={i}><path d={`M-50 ${1350 + i * 90} Q300 ${1300 + i * 90} 540 ${1380 + i * 90} T1130 ${1340 + i * 90}`} fill="none" stroke="#3F5BD9" strokeWidth={34} strokeLinecap="round" />
    <path d={`M-50 ${1350 + i * 90} Q300 ${1300 + i * 90} 540 ${1380 + i * 90} T1130 ${1340 + i * 90}`} fill="none" stroke="#9FE0FF" strokeWidth={12} strokeLinecap="round" strokeDasharray="40 60" strokeDashoffset={-t / 4 - i * 30} /></g>)}
  {[0, 1, 2, 3, 4].map(i => {const yy = ((t / 8 + i * 150) % 700); return <text key={i} x={150 + i * 190} y={600 + yy} fontSize={60} opacity={0.7 * Math.sin((yy / 700) * Math.PI)}>❄️</text>;})}
</g>;

// corte de un gránulo: sube en el centro (naranja), se enfría y baja por los bordes (rojo oscuro)
export const Conveccion: React.FC<{t: number; x: number; y: number; s?: number; k?: number}> = ({t, x, y, s = 1, k = 1}) => {
  const d = -t / 5;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={420} ry={300} fill="url(#gGran)" />
    <ellipse cx={0} cy={0} rx={420} ry={300} fill="none" stroke="#7A2306" strokeWidth={70} opacity={0.85} />
    {[-1, 1].map(sg => <path key={sg} d={`M0 200 L0 -150 Q0 -230 ${sg * 160} -230 Q${sg * 330} -230 ${sg * 340} -60 L${sg * 340} 200`} fill="none" stroke={sg > 0 ? '#FFF1B0' : '#FFF1B0'}
      strokeWidth={22} strokeLinecap="round" strokeDasharray="40 36" strokeDashoffset={d} opacity={k} />)}
    <path d="M-30 -120 L0 -190 L30 -120Z" fill="#FFF1B0" opacity={k} />
    {[-1, 1].map(sg => <path key={sg} d={`M${sg * 310} 140 L${sg * 340} 210 L${sg * 370} 140Z`} fill="#3B0E02" opacity={k} />)}
  </g>;
};

// olla hirviendo con burbujas
export const Olla: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <Sombra cx={0} cy={260} rx={300} />
  {[-1, 1].map(k => <path key={k} d={`M${k * 260} -10 Q${k * 340} 20 ${k * 260} 70Z`} fill="#3B2470" />)}
  <path d="M-270 -60 L270 -60 L240 250 Q0 290 -240 250Z" fill="#5B3A9E" /><path d="M60 -60 L270 -60 L240 250 Q150 270 60 268Z" fill="#000" opacity={0.18} />
  <ellipse cx={0} cy={-60} rx={270} ry={50} fill="#FF8A3D" /><ellipse cx={0} cy={-60} rx={240} ry={38} fill="#FFB534" />
  {Array.from({length: 12}, (_, i) => {const ph = ((t / 900) + rnd(i)) % 1;
    return <circle key={i} cx={-200 + rnd(i + 2) * 400} cy={-60 - ph * 260} r={10 + rnd(i + 4) * 18} fill="#FFF1B0" opacity={1 - ph} />;})}
  {[0, 1, 2].map(i => {const ph = ((t / 1400) + i / 3) % 1; return <path key={i} d={`M${-120 + i * 120} ${-120 - ph * 300} q30 -40 0 -80 q-30 -40 0 -80`} fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.35 * (1 - ph)} />;})}
</g>;

// el Sol entero y la Tierra, con distancia
export const SolTierra: React.FC<{t: number; k?: number}> = ({t, k = 1}) => <g>
  <circle cx={880} cy={1100} r={330} fill="url(#gSol)" />
  <circle cx={880} cy={1100} r={330 + 30 + 10 * Math.sin(t / 300)} fill="#FFB534" opacity={0.25} filter="url(#blur18)" />
  <circle cx={150} cy={1100} r={34} fill={PAL.azul0} /><path d="M130 1080 q20 -10 30 5 q-10 20 -30 10Z" fill={PAL.verde2} />
  <line x1={200} y1={1100} x2={200 + 330 * k} y2={1100} stroke="#fff" strokeWidth={6} strokeDasharray="14 14" strokeDashoffset={-t / 20} />
</g>;

export const Moneda: React.FC<{t: number; x: number; y: number; s?: number}> = ({t, x, y, s = 1}) => {
  const sx = Math.abs(Math.cos(t / 700));
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={140} rx={110} o={0.25} />
    <ellipse cx={0} cy={0} rx={110 * Math.max(0.15, sx)} ry={110} fill="#E0A82E" /><ellipse cx={-10 * sx} cy={-6} rx={86 * Math.max(0.1, sx)} ry={86} fill="#FFD23F" />
    <text x={0} y={30} textAnchor="middle" fontFamily='"Inter Display", Inter' fontWeight={900} fontSize={90} fill="#E0A82E" transform={`scale(${Math.max(0.15, sx)} 1)`}>€</text>
  </g>;
};

// lupa que se mueve sobre los gránulos y amplía (marca de 20 km)
export const Lupa: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 170}) => <g>
  <circle cx={x} cy={y} r={r} fill="none" stroke="#F4F1FF" strokeWidth={22} />
  <rect x={x + r * 0.62} y={y + r * 0.62} width={44} height={170} rx={22} fill="#F4F1FF" transform={`rotate(-45 ${x + r * 0.7} ${y + r * 0.7})`} />
  <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill="#fff" opacity={0.18} />
</g>;
