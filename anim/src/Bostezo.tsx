import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import D from './bostezo.json';
import {KenBurns, Actor, Shot, Motes, Grain, Vignette, useMs, EASE, useSpring, SPRING, W, H} from './lib/motion';
import {Captions} from './lib/captions';

const F = D.frases, P = (n: string) => `bostezo/${n}.png`;
const nz = (s: string) => s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
const kw = (i: number, w: string) => 1000 * (F[i].words.find(p => nz(p.w).includes(nz(w)))?.a ?? F[i].a);   // ms
const ini = (i: number) => (i === 0 ? 0 : (F[i].a - 0.12) * 1000), fin = (i: number) => (i < F.length - 1 ? (F[i + 1].a - 0.12) * 1000 : D.total * 1000);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Inter Display", Inter, sans-serif';

// etiqueta minimal (sin caja dura): pastilla semitransparente con borde redondeado
const Tag: React.FC<{text: string; x: number; y: number; at: number; color?: string; size?: number}> = ({text, x, y, at, color = '#FFD23F', size = 50}) => {
  const p = useSpring(at, SPRING.elastico);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5),
    background: 'rgba(20,16,58,.55)', borderRadius: 999, padding: '10px 28px', fontFamily: FONT, fontWeight: 800, fontSize: size, color,
    boxShadow: `0 8px 30px rgba(0,0,0,.35), inset 0 0 0 2px ${color}55`, whiteSpace: 'nowrap'}}>{text}</div>;
};

// número grande con contador (easing out, 900 ms)
const Count: React.FC<{at: number; to: number; suf?: string; y: number; color?: string}> = ({at, to, suf = '', y, color = '#7CFF6B'}) => {
  const ms = useMs(), p = useSpring(at, SPRING.elastico), v = Math.round(interpolate(ms, [at, at + 900], [0, to], {...cl, easing: EASE.out}));
  return <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 190, color,
    transform: `scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.4), textShadow: '0 10px 40px rgba(0,0,0,.45)'}}>{v}{suf}</div>;
};

// anillo de "aura" que crece y se apaga cuando alguien bosteza (contagio)
const Aura: React.FC<{x: number; y: number; at: number; r?: number}> = ({x, y, at, r = 180}) => {
  const ms = useMs(), k = interpolate(ms, [at, at + 900], [0, 1], {...cl, easing: EASE.out});
  if (ms < at) return null;
  return <svg width={W} height={H} style={{position: 'absolute'}}><circle cx={x} cy={y} r={r * (0.6 + 0.8 * k)} fill="none" stroke="#FFD23F" strokeWidth={10 * (1 - k) + 2} opacity={0.55 * (1 - k)} />
    <circle cx={x} cy={y} r={r * 0.9} fill="#FFD23F" opacity={0.12 * Math.sin(Math.min(1, k * 1.5) * Math.PI)} /></svg>;
};

// gráfico circular (50 %)
const Pie: React.FC<{at: number; frac: number}> = ({at, frac}) => {
  const ms = useMs(), p = useSpring(at - 200, SPRING.pesado), k = interpolate(ms, [at, at + 1000], [0, frac], {...cl, easing: EASE.out});
  const R = 260, cx = 540, cy = 1180, a = k * 2 * Math.PI - Math.PI / 2;
  const d = `M${cx},${cy} L${cx},${cy - R} A${R},${R} 0 ${k > 0.5 ? 1 : 0} 1 ${cx + R * Math.cos(a)},${cy + R * Math.sin(a)} Z`;
  return <svg width={W} height={H} style={{position: 'absolute', transform: `scale(${p})`, transformOrigin: `${cx}px ${cy}px`}}>
    <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7CFF6B" /><stop offset="1" stopColor="#2F9E7E" /></linearGradient></defs>
    <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,.12)" /><path d={d} fill="url(#pg)" /><circle cx={cx} cy={cy} r={R * 0.55} fill="#1d1648" /></svg>;
};

// cintas de aire frío que entran (trazo animado con dash)
const Air: React.FC<{at: number}> = ({at}) => {
  const ms = useMs(); if (ms < at) return null;
  return <svg width={W} height={H} style={{position: 'absolute'}}>{[0, 1, 2].map(i => {const k = interpolate(ms, [at + i * 120, at + i * 120 + 900], [0, 1], {...cl, easing: EASE.inOut});
    return <path key={i} d={`M ${980} ${1250 + i * 50} C 820 ${1150 + i * 40}, 700 ${1300 - i * 30}, ${560} ${1150 + i * 30}`} fill="none" stroke="#6EE7B7" strokeWidth={14 - i * 3}
      strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - k)} opacity={0.85 - i * 0.2} />;})}</svg>;
};

// líneas de conexión (empatía): gruesas a la familia, finas al desconocido
const Links: React.FC<{at: number; to: [number, number, number][]}> = ({at, to}) => {
  const ms = useMs();
  return <svg width={W} height={H} style={{position: 'absolute'}}>{to.map(([x, y, w], i) => {const k = interpolate(ms, [at + i * 250, at + i * 250 + 600], [0, 1], {...cl, easing: EASE.out});
    return <line key={i} x1={540} y1={760} x2={540 + (x - 540) * k} y2={760 + (y - 760) * k} stroke={w > 4 ? '#FF5FA2' : 'rgba(255,255,255,.45)'} strokeWidth={w} strokeLinecap="round"
      strokeDasharray={w > 4 ? '0' : '10 12'} opacity={0.9} />;})}
    <circle cx={540} cy={760} r={26 + Math.sin(ms / 400) * 3} fill="#FF5FA2" /></svg>;
};

export const Bostezo: React.FC = () => {
  const ms = useMs();
  return <AbsoluteFill style={{background: '#14163A'}}>
    {/* 0 gancho: la cara bosteza hacia cámara y la cámara "entra" en la boca */}
    <Shot startMs={0} endMs={fin(0)} inT="fade" outT="zoomThrough" punchMs={[kw(0, 'bostezar')]}>
      <KenBurns src={P('f_azul_542')} startMs={0} endMs={fin(0)} />
      <Motes color="#FF5FA2" seed={1} />
      <Actor src={P('cara_bostezo_11')} x={540} y={1150} w={900} inMs={0} heavy seed={1} scale={interpolate(ms, [0, fin(0)], [1, 1.15], {...cl, easing: EASE.in})} />
    </Shot>
    {/* 1 contagio en el metro: cada pasajero bosteza después del anterior */}
    <Shot startMs={ini(1)} endMs={fin(1)} inT="zoomThrough">
      <KenBurns src={P('f_metro_511')} startMs={ini(1)} endMs={fin(1)} dir={-1} />
      {([['pasajero1_22', 300, 1020], ['pasajero2_31', 780, 1060], ['pasajero3_42', 300, 1530], ['pasajero4_51', 780, 1540]] as const).map(([s, x, y], i) => {
        const at = ini(1) + 200 + i * ((fin(1) - ini(1) - 600) / 4);
        return <React.Fragment key={s}><Aura x={x} y={y} at={at + 150} /><Actor src={P(s)} x={x} y={y} w={430} inMs={at} seed={i + 2} /></React.Fragment>;})}
    </Shot>
    {/* 2 la mitad de los adultos */}
    <Shot startMs={ini(2)} endMs={fin(2)} punchMs={[kw(2, 'mitad')]}>
      <KenBurns src={P('f_noche_522')} startMs={ini(2)} endMs={fin(2)} />
      <Motes color="#7CFF6B" seed={2} />
      <Pie at={kw(2, 'mitad')} frac={0.5} />
      <Count at={kw(2, 'mitad')} to={50} suf=" %" y={1080} />
      <Tag text="de los adultos" x={540} y={1560} at={kw(2, 'adultos')} color="#7CFF6B" />
    </Shot>
    {/* 3-4 verlo, oírlo… o leerlo: el móvil muestra la palabra */}
    <Shot startMs={ini(3)} endMs={fin(4)} outT="fade" punchMs={[kw(3, 'leerlo'), kw(4, 'funciona')]}>
      <KenBurns src={P('f_salon_531')} startMs={ini(3)} endMs={fin(4)} />
      <Tag text="👀 verlo" x={260} y={760} at={kw(3, 'verlo')} />
      <Tag text="👂 oírlo" x={820} y={760} at={kw(3, 'oirlo')} />
      <Actor src={P('movil_62')} x={540} y={1260} w={720} inMs={kw(3, 'leerlo') - 250} enter="rise" heavy seed={4} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1160, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#3F5BD9',
        opacity: interpolate(ms, [kw(3, 'leerlo'), kw(3, 'leerlo') + 200], [0, 1], cl), transform: `translateX(-28px) rotate(-4deg) scale(${1 + Math.sin(ms / 300) * 0.02})`}}>bostezo</div>
    </Shot>
    {/* 5-6 teoría: enfriar el cerebro */}
    <Shot startMs={ini(5)} endMs={fin(6)} inT="fade" punchMs={[kw(5, 'enfria'), kw(6, 'fresca')]}>
      <KenBurns src={P('f_azul_541')} startMs={ini(5)} endMs={fin(6)} />
      <Motes color="#6EE7B7" seed={3} />
      <Actor src={P('cabeza_cerebro_71')} x={470} y={1180} w={760} inMs={ini(5) + 100} floating seed={5} rim="#6EE7B7" />
      <Actor src={P('termometro_92')} x={900} y={1150} w={300} inMs={kw(5, 'enfria')} enter="slideR" seed={6} rim="#6EE7B7" />
      <Air at={kw(6, 'aire')} />
      <Tag text="❄️ más fresco" x={540} y={1650} at={kw(6, 'fresca')} color="#6EE7B7" />
    </Shot>
    {/* 7 empatía: dos cabezas conectadas */}
    <Shot startMs={ini(7)} endMs={fin(7)} punchMs={[kw(7, 'empatia')]}>
      <KenBurns src={P('f_azul_542')} startMs={ini(7)} endMs={fin(7)} dir={-1} />
      <Motes seed={4} />
      <Actor src={P('cabeza_cerebro_71')} x={290} y={1200} w={500} inMs={ini(7)} floating seed={7} />
      <Actor src={P('cabeza_chica_82')} x={800} y={1200} w={460} inMs={ini(7) + 250} floating seed={8} />
      <svg width={W} height={H} style={{position: 'absolute'}}><line x1={440} y1={1130} x2={440 + 230 * interpolate(ms, [kw(7, 'empatia') - 300, kw(7, 'empatia') + 300], [0, 1], {...cl, easing: EASE.out})} y2={1130}
        stroke="#FF5FA2" strokeWidth={10} strokeLinecap="round" strokeDasharray="4 22" strokeDashoffset={-ms / 20} /></svg>
      <Tag text="empatía" x={555} y={900} at={kw(7, 'empatia')} color="#FF5FA2" size={62} />
    </Shot>
    {/* 8 familia y amigos vs desconocidos */}
    <Shot startMs={ini(8)} endMs={fin(8)} punchMs={[kw(8, 'familia')]}>
      <KenBurns src={P('f_salon_532')} startMs={ini(8)} endMs={fin(8)} />
      <Links at={kw(8, 'familia') - 200} to={[[230, 1250, 14], [540, 1350, 10], [860, 1250, 2]]} />
      <Actor src={P('familia_102')} x={230} y={1350} w={420} inMs={kw(8, 'familia') - 150} seed={9} />
      <Actor src={P('amigos_112')} x={540} y={1440} w={380} inMs={kw(8, 'amigos') - 150} seed={10} />
      <Actor src={P('desconocido_121')} x={860} y={1350} w={360} inMs={kw(8, 'desconocidos') - 150} seed={11} />
      <Tag text="+ contagio" x={300} y={1000} at={kw(8, 'amigos')} color="#FF5FA2" size={44} />
      <Tag text="− contagio" x={850} y={1000} at={kw(8, 'desconocidos')} color="#FFFFFF" size={44} />
    </Shot>
    {/* 9 perros */}
    <Shot startMs={ini(9)} endMs={fin(9)} punchMs={[kw(9, 'perros')]}>
      <KenBurns src={P('f_salon_531')} startMs={ini(9)} endMs={fin(9)} dir={-1} />
      <Aura x={560} y={1250} at={kw(9, 'bostezan')} r={260} />
      <Actor src={P('perro_132')} x={560} y={1250} w={720} inMs={kw(9, 'perros') - 300} enter="slideR" heavy seed={12} />
      <Tag text="🐶 también se contagian" x={540} y={1720} at={kw(9, 'bostezan')} color="#FF8A3D" size={46} />
    </Shot>
    {/* 10-11 cierre: vuelve la cara del gancho (bucle) */}
    <Shot startMs={ini(10)} endMs={D.total * 1000 + 500} inT="fade" punchMs={[kw(10, 'conecta')]}>
      <KenBurns src={P('f_azul_542')} startMs={ini(10)} endMs={D.total * 1000} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, rgba(255,95,162,.35), rgba(0,0,0,0) 60%)'}} />
      <Motes color="#FF5FA2" seed={5} n={40} />
      <Actor src={P('cara_bostezo_11')} x={540} y={1180} w={860} inMs={ini(10) + 100} heavy seed={13} />
      <Tag text="Dímelo abajo 👇" x={540} y={1720} at={kw(11, 'dimelo')} />
    </Shot>
    <Vignette />
    <Captions frases={F as any} />
    <Grain amount={0.05} />
  </AbsoluteFill>;
};
