// Ilustraciones 100 % SVG en línea (sin imágenes ni recortes). Biblia: canal/biblia_estilo.md
// Sin contornos negros: formas por planos de color (luz / base / sombra), luz arriba-izquierda, sombra de contacto.
import React from 'react';

export const PAL = {
  noche0: '#14163A', noche1: '#2A1B4F', purp0: '#3B2470', purp1: '#5B3A9E', azul0: '#3F5BD9', azul1: '#6C8BFF',
  rosa: '#FF5FA2', verde: '#6EE7B7', verde2: '#2F9E7E', amar: '#FFD23F', piel: '#F2B48C', pielL: '#F8C9A6', pielS: '#D98E6C',
  boca: '#5A1E3C', lengua: '#FF8FA8', blanco: '#F4F1FF',
};
const PIELES = [['#F2B48C', '#F8C9A6', '#D98E6C'], ['#C98A5E', '#D9A07A', '#A86E47'], ['#8D5A3B', '#A06C4A', '#6E4329'], ['#F6C7A8', '#FBDCC6', '#DDA382']];

// sombra de contacto (elipse difuminada)
export const Sombra: React.FC<{cx: number; cy: number; rx: number; o?: number}> = ({cx, cy, rx, o = 0.35}) =>
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill="#0A0820" opacity={o} filter="url(#blur18)" />;

// definiciones comunes (filtros y degradados); poner una vez en el SVG raíz
export const Defs: React.FC = () => <defs>
  <filter id="blur18" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
  <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
  <filter id="glow"><feGaussianBlur stdDeviation="14" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
  <linearGradient id="gNoche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.noche0} /><stop offset="1" stopColor={PAL.noche1} /></linearGradient>
  <linearGradient id="gPared" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2766" /><stop offset="1" stopColor="#24184A" /></linearGradient>
  <linearGradient id="gSuelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A1B4F" /><stop offset="1" stopColor="#1A1440" /></linearGradient>
  <linearGradient id="gAtar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF8FB8" /><stop offset=".55" stopColor="#B05BC9" /><stop offset="1" stopColor="#3B2470" /></linearGradient>
  <radialGradient id="gCerebro" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#FFB3CF" /><stop offset=".6" stopColor="#FF8FB8" /><stop offset="1" stopColor="#D45C8E" /></radialGradient>
</defs>;

// ---------- cara / persona ----------
// yawn 0..1 abre la boca, cierra los ojos y echa la cabeza hacia atrás
export const Cabeza: React.FC<{x: number; y: number; r: number; yawn?: number; piel?: number; pelo?: string; peinado?: number; gafas?: boolean; blink?: number}> =
  ({x, y, r, yawn = 0, piel = 0, pelo = '#2A1B4F', peinado = 0, gafas, blink = 0}) => {
  const [b, l, s] = PIELES[piel % 4], ojo = Math.max(yawn, blink), tilt = -yawn * 10;
  const by = y + r * 0.45, bw = r * (0.22 + yawn * 0.18), bh = r * (0.06 + yawn * 0.42);
  return <g transform={`rotate(${tilt} ${x} ${y + r})`}>
    <ellipse cx={x - r * 0.98} cy={y + r * 0.08} rx={r * 0.16} ry={r * 0.22} fill={s} /><ellipse cx={x + r * 0.98} cy={y + r * 0.08} rx={r * 0.16} ry={r * 0.22} fill={b} />
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.08} fill={b} />
    <ellipse cx={x + r * 0.28} cy={y + r * 0.2} rx={r * 0.72} ry={r * 0.85} fill={s} opacity={0.35} />
    <ellipse cx={x - r * 0.35} cy={y - r * 0.35} rx={r * 0.38} ry={r * 0.3} fill={l} opacity={0.7} />
    {/* pelo */}
    {peinado === 0 && <path d={`M${x - r} ${y - r * 0.1} Q${x - r * 1.05} ${y - r * 1.25} ${x} ${y - r * 1.15} Q${x + r * 1.1} ${y - r * 1.2} ${x + r} ${y - r * 0.15} Q${x + r * 0.5} ${y - r * 0.75} ${x - r * 0.2} ${y - r * 0.6} Q${x - r * 0.7} ${y - r * 0.55} ${x - r} ${y - r * 0.1}Z`} fill={pelo} />}
    {peinado === 1 && <path d={`M${x - r * 1.1} ${y + r * 0.9} Q${x - r * 1.35} ${y - r * 1.3} ${x} ${y - r * 1.18} Q${x + r * 1.35} ${y - r * 1.3} ${x + r * 1.1} ${y + r * 0.9} Q${x + r * 0.85} ${y - r * 0.4} ${x} ${y - r * 0.55} Q${x - r * 0.85} ${y - r * 0.4} ${x - r * 1.1} ${y + r * 0.9}Z`} fill={pelo} />}
    {peinado === 2 && <path d={`M${x - r * 0.95} ${y - r * 0.2} Q${x - r * 0.6} ${y - r * 1.2} ${x + r * 0.2} ${y - r * 1.05} Q${x + r} ${y - r * 0.9} ${x + r * 0.95} ${y - r * 0.25} Q${x + r * 0.3} ${y - r * 0.7} ${x - r * 0.95} ${y - r * 0.2}Z`} fill={pelo} opacity={0.9} />}
    {/* ojos: abiertos (óvalo) o cerrados (arco relleno) */}
    {[-1, 1].map(k => ojo > 0.5
      ? <path key={k} d={`M${x + k * r * 0.38 - r * 0.15} ${y - r * 0.02} Q${x + k * r * 0.38} ${y + r * 0.1} ${x + k * r * 0.38 + r * 0.15} ${y - r * 0.02} Q${x + k * r * 0.38} ${y + r * 0.04} ${x + k * r * 0.38 - r * 0.15} ${y - r * 0.02}Z`} fill={PAL.noche1} />
      : <ellipse key={k} cx={x + k * r * 0.38} cy={y - r * 0.02} rx={r * 0.09} ry={r * 0.12 * (1 - ojo * 1.6)} fill={PAL.noche1} />)}
    {gafas && [-1, 1].map(k => <circle key={k} cx={x + k * r * 0.38} cy={y - r * 0.02} r={r * 0.24} fill="#9FE0FF" opacity={0.25} />)}
    {/* cejas que suben al bostezar */}
    {[-1, 1].map(k => <rect key={k} x={x + k * r * 0.38 - r * 0.16} y={y - r * (0.3 + yawn * 0.12)} width={r * 0.32} height={r * 0.07} rx={r * 0.035} fill={pelo} transform={`rotate(${k * yawn * 12} ${x + k * r * 0.38} ${y - r * 0.3})`} />)}
    {/* boca */}
    <ellipse cx={x} cy={by + bh * 0.4} rx={bw} ry={Math.max(r * 0.03, bh)} fill={PAL.boca} />
    {yawn > 0.25 && <ellipse cx={x} cy={by + bh * 0.95} rx={bw * 0.6} ry={bh * 0.35} fill={PAL.lengua} />}
    <ellipse cx={x + r * 0.42} cy={y + r * 0.35} rx={r * 0.14} ry={r * 0.08} fill={PAL.rosa} opacity={0.25} />
  </g>;
};

// persona sentada (o de pie) con ropa en 3 tonos; brazo que sube a la boca al bostezar
export const Persona: React.FC<{x: number; y: number; s?: number; yawn?: number; piel?: number; pelo?: string; peinado?: number; ropa?: string; gafas?: boolean; sentado?: boolean; auricular?: boolean}> =
  ({x, y, s = 1, yawn = 0, piel = 0, pelo = '#2A1B4F', peinado = 0, ropa = PAL.purp1, gafas, sentado = true, auricular}) => {
  const [b, , sh] = PIELES[piel % 4];
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={sentado ? 210 : 330} rx={120} />
    {sentado ? <>
      <rect x={-70} y={120} width={150} height={44} rx={22} fill="#24184A" /><rect x={40} y={140} width={44} height={70} rx={20} fill="#24184A" />
      <rect x={-75} y={130} width={40} height={80} rx={18} fill="#1E1440" />
    </> : <><rect x={-55} y={120} width={44} height={200} rx={20} fill="#24184A" /><rect x={12} y={120} width={44} height={200} rx={20} fill="#1E1440" /></>}
    <path d="M-78 140 Q-85 10 0 -10 Q85 10 78 140 Z" fill={ropa} />
    <path d="M10 -8 Q85 10 78 140 L30 140 Z" fill="#000" opacity={0.18} />
    {/* brazo: de reposo a la boca */}
    <g transform={`rotate(${yawn * 140} 62 20)`}><rect x={48} y={15} width={34} height={110} rx={17} fill={ropa} /><circle cx={65} cy={128} r={20} fill={b} /></g>
    <rect x={-82} y={15} width={34} height={110} rx={17} fill={ropa} /><circle cx={-65} cy={128} r={20} fill={sh} />
    <rect x={-16} y={-36} width={32} height={34} rx={10} fill={sh} />
    <Cabeza x={0} y={-95} r={72} yawn={yawn} piel={piel} pelo={pelo} peinado={peinado} gafas={gafas} />
    {auricular && <><path d="M-78 -110 Q0 -215 78 -110" fill="none" stroke={PAL.rosa} strokeWidth={16} strokeLinecap="round" /><rect x={-92} y={-120} width={26} height={50} rx={12} fill={PAL.rosa} /><rect x={66} y={-120} width={26} height={50} rx={12} fill={PAL.rosa} /></>}
  </g>;
};

// ---------- objetos ----------
export const Movil: React.FC<{x: number; y: number; s?: number; texto?: string; t?: number}> = ({x, y, s = 1, texto = '', t = 1}) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={20} cy={330} rx={130} o={0.25} />
    <path d="M-150 260 Q-170 120 -110 60 L-60 240 Z" fill={PAL.pielS} />
    <rect x={-120} y={-300} width={240} height={480} rx={40} fill="#1A1440" />
    <rect x={-104} y={-280} width={208} height={440} rx={28} fill={PAL.blanco} />
    <rect x={-104} y={-280} width={208} height={60} rx={28} fill="#E3DEFF" />
    <text x={0} y={-50} textAnchor="middle" fontFamily='"Inter Display", Inter' fontWeight={900} fontSize={44} fill={PAL.azul0} opacity={t}>{texto}</text>
    {[0, 1, 2].map(i => <rect key={i} x={-76} y={20 + i * 36} width={152 - i * 30} height={14} rx={7} fill="#CFC8F5" />)}
    <path d="M60 240 Q160 200 150 60 Q120 40 100 80 L90 160 Z" fill={PAL.piel} />
    <ellipse cx={0} cy={-60} rx={200} ry={260} fill={PAL.azul1} opacity={0.08} />
  </g>;

export const Cerebro: React.FC<{x: number; y: number; s?: number; brillo?: number; t?: number}> = ({x, y, s = 1, brillo = 0, t = 0}) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {brillo > 0 && <ellipse cx={0} cy={0} rx={190} ry={150} fill={PAL.rosa} opacity={0.25 * brillo} filter="url(#blur18)" />}
    <path d="M-150 20 Q-170 -80 -90 -115 Q-40 -150 20 -128 Q90 -150 140 -95 Q185 -40 160 30 Q150 90 80 100 Q20 125 -40 105 Q-120 110 -150 20Z" fill="url(#gCerebro)" />
    <path d="M40 100 Q20 125 -40 105 Q-120 110 -150 20 Q-100 80 -20 80 Q60 85 120 60 Q100 95 40 100Z" fill="#D45C8E" opacity={0.6} />
    {/* circunvoluciones: cintas de color más oscuro, sin contorno negro */}
    {['M-110 -40 Q-80 -80 -40 -60 Q-10 -40 -40 -10', 'M-20 -100 Q20 -80 0 -40 Q-15 -10 20 10', 'M50 -90 Q100 -70 80 -30 Q60 0 100 20', 'M-120 30 Q-80 10 -60 40 Q-30 70 10 40', 'M30 50 Q70 30 110 50']
      .map((d, i) => <path key={i} d={d} fill="none" stroke="#D45C8E" strokeWidth={12} strokeLinecap="round" opacity={0.75} />)}
    <path d="M-30 100 Q-10 160 -30 200 Q0 205 20 160 Q30 120 20 100Z" fill="#D98EB0" />
    {[0, 1, 2, 3, 4].map(i => <circle key={i} cx={-100 + i * 50} cy={-60 + ((i * 37) % 90)} r={6 + 4 * Math.abs(Math.sin(t / 300 + i))} fill="#fff" opacity={brillo * 0.8} filter="url(#blur6)" />)}
  </g>;

// cabeza de perfil translúcida con el cerebro dentro
export const CabezaPerfil: React.FC<{x: number; y: number; s?: number; piel?: number; xray?: number; flip?: boolean; boca?: number; t?: number; pelo?: string}> =
  ({x, y, s = 1, piel = 0, xray = 1, flip, boca = 0, t = 0, pelo = '#2A1B4F'}) => {
  const [b, , sh] = PIELES[piel % 4];
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <Sombra cx={0} cy={330} rx={150} o={0.25} />
    <rect x={-70} y={150} width={130} height={170} rx={50} fill={sh} />
    <path d={`M-170 -40 Q-170 -230 0 -240 Q170 -235 190 -60 Q195 -20 230 30 Q240 50 210 60 Q215 ${90 + boca * 40} 200 ${110 + boca * 30} Q205 140 180 160 Q120 210 40 190 Q-80 200 -140 120 Q-180 60 -170 -40Z`} fill={b} opacity={1 - xray * 0.35} />
    <path d="M-170 -40 Q-170 -230 0 -240 Q120 -238 170 -150 Q60 -200 -60 -170 Q-150 -120 -150 0 Z" fill={pelo} opacity={1 - xray * 0.5} />
    {boca > 0 && <ellipse cx={200} cy={95 + boca * 20} rx={18} ry={10 + boca * 26} fill={PAL.boca} />}
    <circle cx={140} cy={-20} r={12} fill={PAL.noche1} opacity={boca > 0.5 ? 0 : 1} />
    <g opacity={xray}><Cerebro x={-10} y={-90} s={0.78} brillo={xray} t={t} /></g>
  </g>;
};

export const Termometro: React.FC<{x: number; y: number; s?: number; nivel: number}> = ({x, y, s = 1, nivel}) => {
  const c = nivel > 0.5 ? '#FF5A4A' : PAL.azul1, h = 40 + nivel * 260;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={210} rx={70} o={0.25} />
    <rect x={-34} y={-200} width={68} height={360} rx={34} fill={PAL.blanco} /><circle cx={0} cy={170} r={60} fill={PAL.blanco} />
    <rect x={-14} y={140 - h} width={28} height={h + 20} rx={14} fill={c} /><circle cx={0} cy={170} r={40} fill={c} />
    <rect x={-26} y={-190} width={14} height={300} rx={7} fill="#fff" opacity={0.5} />
  </g>;
};

export const Perro: React.FC<{x: number; y: number; s?: number; yawn?: number; cola?: number}> = ({x, y, s = 1, yawn = 0, cola = 0}) =>
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Sombra cx={0} cy={200} rx={190} />
    <path d={`M120 120 Q${200 + Math.sin(cola) * 30} ${40 + Math.cos(cola) * 20} ${190 + Math.sin(cola) * 50} -20`} fill="none" stroke="#9E5F36" strokeWidth={26} strokeLinecap="round" />
    <ellipse cx={20} cy={110} rx={150} ry={100} fill="#C9824E" /><ellipse cx={50} cy={140} rx={110} ry={60} fill="#9E5F36" opacity={0.45} />
    <rect x={-110} y={120} width={52} height={90} rx={24} fill="#C9824E" /><rect x={-30} y={130} width={52} height={80} rx={24} fill="#B5713F" />
    <ellipse cx={-70} cy={40} rx={70} ry={50} fill="#E8D2B5" />
    <g transform={`rotate(${-yawn * 14} -90 -30)`}>
      <ellipse cx={-90} cy={-60} rx={105} ry={95} fill="#C9824E" />
      <path d="M-180 -110 Q-230 -40 -190 40 Q-150 0 -150 -80Z" fill="#9E5F36" /><path d="M0 -110 Q50 -40 10 40 Q-30 0 -30 -80Z" fill="#9E5F36" />
      <ellipse cx={-90} cy={-5} rx={62} ry={44 + yawn * 30} fill="#E8D2B5" />
      <ellipse cx={-90} cy={10 + yawn * 10} rx={32} ry={6 + yawn * 34} fill={PAL.boca} />
      {yawn > 0.3 && <ellipse cx={-90} cy={30 + yawn * 18} rx={20} ry={14 * yawn} fill={PAL.lengua} />}
      <ellipse cx={-90} cy={-40} rx={22} ry={15} fill="#2A1B4F" />
      {[-1, 1].map(k => yawn > 0.5 ? <rect key={k} x={-90 + k * 42 - 16} y={-82} width={32} height={8} rx={4} fill="#2A1B4F" /> : <circle key={k} cx={-90 + k * 42} cy={-80} r={11} fill="#2A1B4F" />)}
    </g>
    <path d="M-150 30 Q-90 60 -30 30 L-30 50 Q-90 80 -150 50Z" fill={PAL.azul1} />
  </g>;

// ---------- fondos ----------
export const FondoMetro: React.FC<{t: number}> = ({t}) => <g>
  <rect width={1080} height={1920} fill="url(#gPared)" />
  {/* ventanas con luces del túnel pasando */}
  {[0, 1].map(i => <g key={i}><rect x={80 + i * 500} y={420} width={420} height={330} rx={40} fill={PAL.noche0} />
    {[0, 1, 2].map(k => <rect key={k} x={80 + i * 500 + (((t * 1.4 + k * 160 + i * 90) % 560) - 70)} y={540 + k * 40} width={90} height={14} rx={7} fill={PAL.azul1} opacity={0.55} filter="url(#blur6)" />)}
  </g>)}
  <rect x={0} y={790} width={1080} height={30} fill="#4A3384" />
  {[180, 540, 900].map(x => <rect key={x} x={x - 10} y={0} width={20} height={1920} fill="#8C7BD1" opacity={0.35} />)}
  <rect x={0} y={1720} width={1080} height={200} fill="url(#gSuelo)" />
  <rect x={0} y={1230} width={1080} height={60} rx={20} fill={PAL.purp0} /><rect x={0} y={1700} width={1080} height={60} rx={20} fill={PAL.purp0} />
</g>;

export const FondoNoche: React.FC<{t: number}> = ({t}) => <g>
  <rect width={1080} height={1920} fill="url(#gNoche)" />
  {Array.from({length: 70}, (_, i) => <circle key={i} cx={(i * 397) % 1080} cy={(i * 211) % 1300} r={1.5 + (i % 3)} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t / 900 + i))} />)}
  <circle cx={820} cy={420} r={90} fill="#FFE6F2" opacity={0.9} filter="url(#glow)" />
  <path d="M0 1500 Q270 1380 540 1460 Q810 1540 1080 1420 L1080 1920 L0 1920Z" fill={PAL.purp0} />
  <path d="M0 1620 Q300 1540 600 1610 Q850 1660 1080 1580 L1080 1920 L0 1920Z" fill="#24184A" />
</g>;

export const FondoSalon: React.FC<{t: number}> = ({t}) => <g>
  <rect width={1080} height={1920} fill="url(#gPared)" />
  <rect x={120} y={380} width={520} height={620} rx={30} fill="url(#gAtar)" />
  <rect x={372} y={380} width={16} height={620} fill="#24184A" /><rect x={120} y={682} width={520} height={16} fill="#24184A" />
  <circle cx={330} cy={760} r={70} fill="#FFD9A8" opacity={0.85} />
  <rect x={800} y={600} width={14} height={720} fill="#24184A" /><path d="M740 600 L874 600 L840 520 L774 520Z" fill={PAL.amar} />
  <ellipse cx={807} cy={640} rx={140} ry={200} fill={PAL.amar} opacity={0.12 + 0.03 * Math.sin(t / 500)} filter="url(#blur18)" />
  <rect x={0} y={1580} width={1080} height={340} fill="url(#gSuelo)" />
  <ellipse cx={540} cy={1700} rx={420} ry={70} fill={PAL.purp1} opacity={0.5} />
</g>;

export const FondoAbstracto: React.FC<{t: number; acento?: string}> = ({t, acento = PAL.rosa}) => <g>
  <rect width={1080} height={1920} fill="url(#gNoche)" />
  {[[200, 500, 220, acento], [880, 900, 300, PAL.azul0], [300, 1500, 260, PAL.purp1], [850, 1650, 180, acento]].map(([x, y, r, c], i) =>
    <circle key={i} cx={(x as number) + Math.sin(t / 2400 + i) * 40} cy={(y as number) + Math.cos(t / 3100 + i) * 50} r={r as number} fill={c as string} opacity={0.22} filter="url(#blur18)" />)}
</g>;
