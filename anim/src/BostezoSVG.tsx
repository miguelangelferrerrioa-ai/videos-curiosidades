// Vídeo 05 "¿Por qué se contagian los bostezos?" — todo en SVG en línea (vec/arte.tsx), sin imágenes ni recortes.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import D from './bostezo.json';
import {Shot, Motes, Grain, Vignette, useMs, useSpring, EASE, SPRING, idle, W, H} from './lib/motion';
import {Captions} from './lib/captions';
import {Defs, PAL, Persona, Cabeza, Movil, CabezaPerfil, Termometro, Perro, FondoMetro, FondoNoche, FondoSalon, FondoAbstracto} from './vec/arte';

const F = D.frases;
const nz = (s: string) => s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
const kw = (i: number, w: string) => 1000 * (F[i].words.find(p => nz(p.w).includes(nz(w)))?.a ?? F[i].a);
const ini = (i: number) => (i === 0 ? 0 : (F[i].a - 0.12) * 1000), fin = (i: number) => (i < F.length - 1 ? (F[i + 1].a - 0.12) * 1000 : D.total * 1000);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Inter Display", Inter, sans-serif';
// curva de un bostezo: abre 500 ms (ease-out), aguanta 900 ms, cierra 500 ms
const yw = (ms: number, at: number) => interpolate(ms, [at, at + 500, at + 1400, at + 1900], [0, 1, 1, 0], {...cl, easing: EASE.inOut});
// aparición con muelle (0→1) para cualquier grupo SVG: escala desde su punto de apoyo
const Pop: React.FC<{at: number; x: number; y: number; heavy?: boolean; from?: 'pop' | 'up' | 'right'; children: React.ReactNode}> = ({at, x, y, heavy, from = 'pop', children}) => {
  const p = useSpring(at, heavy ? SPRING.pesado : SPRING.elastico);
  const tr = from === 'up' ? `translate(0 ${(1 - p) * 700})` : from === 'right' ? `translate(${(1 - p) * 800} 0)` : `translate(${x} ${y}) scale(${p}) translate(${-x} ${-y})`;
  return <g transform={tr} opacity={Math.min(1, p * 1.5)}>{children}</g>;
};
// lienzo SVG de una escena con cámara Ken Burns (1.00→1.07, inOut) y deriva lateral
const Lienzo: React.FC<{a: number; b: number; dir?: number; children: React.ReactNode}> = ({a, b, dir = 1, children}) => {
  const ms = useMs(), k = interpolate(ms, [a, b], [0, 1], {...cl, easing: EASE.inOut});
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', transform: `scale(${1 + 0.07 * k}) translateX(${dir * 20 * k}px)`}}><Defs />{children}</svg>;
};
const Tag: React.FC<{text: string; x: number; y: number; at: number; color?: string; size?: number}> = ({text, x, y, at, color = PAL.amar, size = 50}) => {
  const p = useSpring(at, SPRING.elastico);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5), background: 'rgba(20,16,58,.55)',
    borderRadius: 999, padding: '10px 28px', fontFamily: FONT, fontWeight: 800, fontSize: size, color, boxShadow: `0 8px 30px rgba(0,0,0,.35), inset 0 0 0 2px ${color}55`, whiteSpace: 'nowrap'}}>{text}</div>;
};
const Aura: React.FC<{x: number; y: number; at: number; r?: number}> = ({x, y, at, r = 170}) => {
  const ms = useMs(), k = interpolate(ms, [at, at + 900], [0, 1], {...cl, easing: EASE.out});
  return ms < at ? null : <circle cx={x} cy={y} r={r * (0.6 + 0.8 * k)} fill="none" stroke={PAL.amar} strokeWidth={10 * (1 - k) + 2} opacity={0.6 * (1 - k)} />;
};

export const BostezoSVG: React.FC = () => {
  const ms = useMs(), id = (s: number) => idle(ms, s);
  const pas = [[290, 1040, 0, '#2A1B4F', 1, PAL.rosa, false, false], [790, 1040, 3, '#E9E4F7', 2, PAL.azul0, true, false], [290, 1500, 1, '#1A1440', 0, '#24184A', false, false], [790, 1500, 2, '#5B3A9E', 1, PAL.verde2, false, true]] as const;
  const pasAt = (i: number) => ini(1) + 150 + i * ((fin(1) - ini(1) - 900) / 4);
  return <AbsoluteFill style={{background: PAL.noche0}}>
    {/* 0 gancho: cara que bosteza hacia cámara; salida "entrando" en la boca */}
    <Shot startMs={0} endMs={fin(0)} inT="none" outT="zoomThrough" punchMs={[kw(0, 'bostezar')]}>
      <Lienzo a={0} b={fin(0)}><FondoAbstracto t={ms} />
        <g transform={`translate(0 ${id(1).float})`}><Pop at={-2000} x={540} y={1150} heavy><Cabeza x={540} y={1100} r={330} yawn={yw(ms, kw(0, 'bostezar') - 200)} pelo="#1A1440" /></Pop></g>
      </Lienzo><Motes seed={1} />
    </Shot>
    {/* 1 contagio en cadena en el metro */}
    <Shot startMs={ini(1)} endMs={fin(1)} inT="zoomThrough">
      <Lienzo a={ini(1)} b={fin(1)} dir={-1}><FondoMetro t={ms} />
        {pas.map(([x, y, piel, pelo, pein, ropa, gafas, aur], i) => <g key={i} transform={`translate(0 ${id(i + 2).float * 0.4})`}>
          <Aura x={x} y={y - 120} at={pasAt(i) + 200} />
          <Pop at={ini(1) + i * 90} x={x} y={y + 200}><Persona x={x} y={y} s={0.95} yawn={yw(ms, pasAt(i))} piel={piel} pelo={pelo} peinado={pein} ropa={ropa} gafas={gafas} auricular={aur} /></Pop></g>)}
      </Lienzo>
    </Shot>
    {/* 2 la mitad de los adultos: el metro se convierte en un gráfico */}
    <Shot startMs={ini(2)} endMs={fin(2)} punchMs={[kw(2, 'mitad')]}>
      <Lienzo a={ini(2)} b={fin(2)}><FondoNoche t={ms} />
        {(() => {const k = interpolate(ms, [kw(2, 'mitad'), kw(2, 'mitad') + 1000], [0, 0.5], {...cl, easing: EASE.out}), R = 270, a = k * 2 * Math.PI - Math.PI / 2;
          return <Pop at={ini(2)} x={540} y={1150} heavy><circle cx={540} cy={1150} r={R} fill="#fff" opacity={0.12} />
            <path d={`M540 1150 L540 ${1150 - R} A${R} ${R} 0 ${k > 0.5 ? 1 : 0} 1 ${540 + R * Math.cos(a)} ${1150 + R * Math.sin(a)}Z`} fill={PAL.verde} />
            <circle cx={540} cy={1150} r={R * 0.56} fill={PAL.noche1} /></Pop>;})()}
        <text x={540} y={1205} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill={PAL.verde}>{Math.round(interpolate(ms, [kw(2, 'mitad'), kw(2, 'mitad') + 1000], [0, 50], {...cl, easing: EASE.out}))}%</text>
      </Lienzo>
      <Tag text="de los adultos" x={540} y={1560} at={kw(2, 'adultos')} color={PAL.verde} />
    </Shot>
    {/* 3-4 verlo, oírlo… leerlo: el móvil */}
    <Shot startMs={ini(3)} endMs={fin(4)} outT="fade" punchMs={[kw(3, 'leerlo'), kw(4, 'funciona')]}>
      <Lienzo a={ini(3)} b={fin(4)}><FondoSalon t={ms} />
        <g transform={`translate(0 ${id(4).float}) rotate(${id(4).sway} 540 1250)`}><Pop at={kw(3, 'leerlo') - 300} x={540} y={1300} from="up" heavy>
          <Movil x={540} y={1200} s={1.25} texto="bostezo" t={interpolate(ms, [kw(3, 'leerlo'), kw(3, 'leerlo') + 250], [0, 1], cl)} /></Pop></g>
      </Lienzo>
      <Tag text="👀 verlo" x={270} y={720} at={kw(3, 'verlo')} /><Tag text="👂 oírlo" x={810} y={720} at={kw(3, 'oirlo')} />
    </Shot>
    {/* 5-6 enfriar el cerebro */}
    <Shot startMs={ini(5)} endMs={fin(6)} inT="fade" punchMs={[kw(5, 'enfria'), kw(6, 'fresca')]}>
      <Lienzo a={ini(5)} b={fin(6)}><FondoAbstracto t={ms} acento={PAL.verde} />
        <g transform={`translate(0 ${id(5).float})`}><Pop at={ini(5)} x={430} y={1200} heavy>
          <CabezaPerfil x={430} y={1150} s={1.3} xray={interpolate(ms, [ini(5) + 300, ini(5) + 900], [0, 1], {...cl, easing: EASE.out})} boca={yw(ms, kw(6, 'aire') - 300)} t={ms} /></Pop></g>
        <Pop at={kw(5, 'enfria')} x={920} y={1150} from="right"><Termometro x={920} y={1100} s={1.1} nivel={interpolate(ms, [kw(6, 'aire'), kw(6, 'fresca')], [0.9, 0.3], {...cl, easing: EASE.inOut})} /></Pop>
        {[0, 1, 2].map(i => {const k = interpolate(ms, [kw(6, 'aire') + i * 120, kw(6, 'aire') + i * 120 + 900], [0, 1], {...cl, easing: EASE.inOut});
          return <path key={i} d={`M1060 ${1320 + i * 45} C 900 ${1240 + i * 30}, 760 ${1330 - i * 20}, 640 ${1240 + i * 25}`} fill="none" stroke={PAL.verde} strokeWidth={14 - i * 3} strokeLinecap="round" strokeDasharray="700" strokeDashoffset={700 * (1 - k)} opacity={0.85 - i * 0.2} />;})}
      </Lienzo><Motes color={PAL.verde} seed={3} />
      <Tag text="❄️ sangre más fresca" x={540} y={1680} at={kw(6, 'fresca')} color={PAL.verde} />
    </Shot>
    {/* 7 empatía: dos cerebros conectados */}
    <Shot startMs={ini(7)} endMs={fin(7)} punchMs={[kw(7, 'empatia')]}>
      <Lienzo a={ini(7)} b={fin(7)} dir={-1}><FondoAbstracto t={ms} />
        <g transform={`translate(0 ${id(7).float})`}><Pop at={ini(7)} x={290} y={1200}><CabezaPerfil x={290} y={1150} s={0.85} xray={1} t={ms} /></Pop></g>
        <g transform={`translate(0 ${id(8).float})`}><Pop at={ini(7) + 250} x={800} y={1200}><CabezaPerfil x={800} y={1150} s={0.85} xray={1} flip piel={3} pelo="#5B3A9E" t={ms} /></Pop></g>
        <line x1={420} y1={1080} x2={420 + 250 * interpolate(ms, [kw(7, 'empatia') - 300, kw(7, 'empatia') + 300], [0, 1], {...cl, easing: EASE.out})} y2={1080} stroke={PAL.rosa} strokeWidth={12} strokeLinecap="round" strokeDasharray="4 24" strokeDashoffset={-ms / 20} />
      </Lienzo><Motes seed={4} />
      <Tag text="empatía" x={545} y={880} at={kw(7, 'empatia')} color={PAL.rosa} size={62} />
    </Shot>
    {/* 8 familia y amigos vs desconocidos */}
    <Shot startMs={ini(8)} endMs={fin(8)} punchMs={[kw(8, 'familia')]}>
      <Lienzo a={ini(8)} b={fin(8)}><FondoSalon t={ms} />
        {([[220, kw(8, 'familia'), 14], [540, kw(8, 'amigos'), 10], [870, kw(8, 'desconocidos'), 3]] as const).map(([x, at, w], i) => {const k = interpolate(ms, [at - 200, at + 400], [0, 1], {...cl, easing: EASE.out});
          return <line key={i} x1={540} y1={820} x2={540 + (x - 540) * k} y2={820 + 330 * k} stroke={w > 4 ? PAL.rosa : 'rgba(255,255,255,.45)'} strokeWidth={w} strokeLinecap="round" strokeDasharray={w > 4 ? undefined : '10 12'} />;})}
        <circle cx={540} cy={820} r={30 + Math.sin(ms / 400) * 3} fill={PAL.rosa} />
        <Pop at={kw(8, 'familia') - 150} x={220} y={1550}><Persona x={170} y={1300} s={0.85} sentado={false} ropa={PAL.rosa} piel={1} yawn={yw(ms, kw(8, 'familia') + 300)} /><Persona x={300} y={1400} s={0.6} sentado={false} ropa={PAL.azul0} piel={1} peinado={2} /></Pop>
        <Pop at={kw(8, 'amigos') - 150} x={540} y={1600}><Persona x={560} y={1330} s={0.85} sentado={false} ropa={PAL.verde2} piel={2} peinado={1} yawn={yw(ms, kw(8, 'amigos') + 300)} /></Pop>
        <Pop at={kw(8, 'desconocidos') - 150} x={870} y={1600}><g opacity={0.75}><Persona x={890} y={1330} s={0.8} sentado={false} ropa="#24184A" piel={3} pelo="#3B2470" /></g></Pop>
      </Lienzo>
      <Tag text="+ contagio" x={260} y={1050} at={kw(8, 'amigos')} color={PAL.rosa} size={44} /><Tag text="− contagio" x={860} y={1050} at={kw(8, 'desconocidos')} color="#FFFFFF" size={44} />
    </Shot>
    {/* 9 perros */}
    <Shot startMs={ini(9)} endMs={fin(9)} punchMs={[kw(9, 'perros')]}>
      <Lienzo a={ini(9)} b={fin(9)} dir={-1}><FondoSalon t={ms} />
        <Pop at={ini(9)} x={300} y={1600}><Persona x={290} y={1250} s={1.0} ropa={PAL.purp1} yawn={yw(ms, kw(9, 'bostezan') - 400)} /></Pop>
        <Aura x={700} y={1350} at={kw(9, 'dueno')} r={220} />
        <Pop at={kw(9, 'perros') - 300} x={720} y={1500} from="right" heavy><Perro x={760} y={1380} s={1.05} yawn={yw(ms, kw(9, 'dueno'))} cola={ms / 120} /></Pop>
      </Lienzo>
      <Tag text="🐶 también se contagian" x={540} y={1760} at={kw(9, 'bostezan')} color="#FF8A3D" size={46} />
    </Shot>
    {/* 10-11 cierre en bucle: vuelve la cara del gancho */}
    <Shot startMs={ini(10)} endMs={D.total * 1000 + 500} inT="fade" punchMs={[kw(10, 'conecta')]}>
      <Lienzo a={ini(10)} b={D.total * 1000}><FondoAbstracto t={ms} />
        <circle cx={540} cy={1150} r={520} fill={PAL.rosa} opacity={0.18} filter="url(#blur18)" />
        <g transform={`translate(0 ${id(13).float})`}><Pop at={ini(10)} x={540} y={1150} heavy><Cabeza x={540} y={1100} r={310} yawn={yw(ms, kw(11, 'bostezado') - 300)} pelo="#1A1440" blink={Math.abs(Math.sin(ms / 1300)) > 0.985 ? 1 : 0} /></Pop></g>
      </Lienzo><Motes seed={5} n={40} />
      <Tag text="Dímelo abajo 👇" x={540} y={1720} at={kw(11, 'dimelo')} />
    </Shot>
    <Vignette />
    <Captions frases={F as any} />
    <Grain amount={0.05} />
  </AbsoluteFill>;
};
