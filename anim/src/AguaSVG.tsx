// Vídeo 07 "¿Se puede quedar la Tierra sin agua?" — SVG en línea.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import D from './agua.json';
import {Shot, Motes, Grain, Vignette, useMs, useSpring, EASE, SPRING, idle, W, H} from './lib/motion';
import {Captions} from './lib/captions';
import {Defs, PAL, FondoNoche, FondoAbstracto} from './vec/arte';
import {DefsAgua, Tierra, Ciclo, Dino, GotaDividida, Glaciar, Botella, Gente, Grifo, Hidrogeno, SolGigante, Vaso, Gota} from './vec/agua';

const F = D.frases;
const nz = (s: string) => s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
const kw = (i: number, w: string) => 1000 * (F[i].words.find(p => nz(p.w).includes(nz(w)))?.a ?? F[i].a);
const ini = (i: number) => (i === 0 ? 0 : (F[i].a - 0.12) * 1000), fin = (i: number) => (i < F.length - 1 ? (F[i + 1].a - 0.12) * 1000 : D.total * 1000);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Inter Display", Inter, sans-serif';
const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const Pop: React.FC<{at: number; x: number; y: number; heavy?: boolean; from?: 'pop' | 'up' | 'right' | 'left'; children: React.ReactNode}> = ({at, x, y, heavy, from = 'pop', children}) => {
  const p = useSpring(at, heavy ? SPRING.pesado : SPRING.elastico);
  const tr = from === 'up' ? `translate(0 ${(1 - p) * 800})` : from === 'right' ? `translate(${(1 - p) * 900} 0)` : from === 'left' ? `translate(${(p - 1) * 900} 0)` : `translate(${x} ${y}) scale(${p}) translate(${-x} ${-y})`;
  return <g transform={tr} opacity={Math.min(1, p * 1.5)}>{children}</g>;
};
const Lienzo: React.FC<{a: number; b: number; dir?: number; zoom?: number; children: React.ReactNode}> = ({a, b, dir = 1, zoom = 0.07, children}) => {
  const ms = useMs(), k = interpolate(ms, [a, b], [0, 1], {...cl, easing: EASE.inOut});
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', transform: `scale(${1 + zoom * k}) translateX(${dir * 20 * k}px)`}}><Defs /><DefsAgua />{children}</svg>;
};
const Tag: React.FC<{text: string; x: number; y: number; at: number; color?: string; size?: number}> = ({text, x, y, at, color = PAL.amar, size = 50}) => {
  const p = useSpring(at, SPRING.elastico);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * p})`, opacity: Math.min(1, p * 1.5), background: 'rgba(20,16,58,.55)',
    borderRadius: 999, padding: '10px 28px', fontFamily: FONT, fontWeight: 800, fontSize: size, color, boxShadow: `0 8px 30px rgba(0,0,0,.35), inset 0 0 0 2px ${color}55`, whiteSpace: 'nowrap'}}>{text}</div>;
};
const Big: React.FC<{text: string; at: number; y: number; color?: string; size?: number}> = ({text, at, y, color = PAL.amar, size = 150}) => {
  const p = useSpring(at, SPRING.elastico);
  return <div style={{position: 'absolute', top: y, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, transform: `scale(${0.9 + 0.1 * p})`,
    opacity: Math.min(1, p * 1.4), textShadow: '0 10px 40px rgba(0,0,0,.5)'}}>{text}</div>;
};

export const AguaSVG: React.FC = () => {
  const ms = useMs(), id = (s: number) => idle(ms, s);
  return <AbsoluteFill style={{background: PAL.noche0}}>
    {/* 0 gancho: la Tierra se queda sin agua (los océanos se vacían y vuelven) */}
    <Shot startMs={0} endMs={fin(0)} inT="none" punchMs={[kw(0, 'agua')]}>
      <Lienzo a={0} b={fin(0)}><FondoNoche t={ms} />
        <Pop at={-2000} x={540} y={1150} heavy><Tierra t={ms} x={540} y={1150} r={330} seca={interpolate(ms, [kw(0, 'sin'), kw(0, 'agua') + 400, kw(0, 'respuesta'), fin(0)], [0, 1, 1, 0], {...cl, easing: EASE.inOut})} /></Pop>
      </Lienzo><Motes color="#7FD8FF" seed={1} />
    </Shot>
    {/* 1 1.386 millones de km³ */}
    <Shot startMs={ini(1)} endMs={fin(1)} punchMs={[kw(1, 'millones')]}>
      <Lienzo a={ini(1)} b={fin(1)} zoom={0.12}><FondoNoche t={ms} /><Tierra t={ms} x={540} y={1300} r={420} /></Lienzo>
      <Big text={miles(interpolate(ms, [kw(1, '1.386'), kw(1, 'millones') + 300], [0, 1386], {...cl, easing: EASE.out}))} at={kw(1, '1.386')} y={420} color="#7FD8FF" size={170} />
      <Tag text="millones de km³" x={540} y={680} at={kw(1, 'millones')} color="#7FD8FF" />
    </Shot>
    {/* 2 ciclo del agua */}
    <Shot startMs={ini(2)} endMs={fin(2)} punchMs={[kw(2, 'vuelve')]}>
      <Lienzo a={ini(2)} b={fin(2)} dir={-1}><FondoAbstracto t={ms} acento="#7FD8FF" /><Ciclo t={ms} k={interpolate(ms, [ini(2), ini(2) + 500], [0, 1], cl)} /></Lienzo>
      <Tag text="☀️ se evapora" x={760} y={1250} at={kw(2, 'evapora')} color="#FFD23F" size={42} />
      <Tag text="🌧️ llueve" x={330} y={1150} at={kw(2, 'llueve')} color="#7FD8FF" size={42} />
    </Shot>
    {/* 3 dinosaurio */}
    <Shot startMs={ini(3)} endMs={fin(3)} punchMs={[kw(3, 'dinosaurio')]}>
      <Lienzo a={ini(3)} b={fin(3)}><FondoNoche t={ms} />
        <path d="M0 1550 Q540 1500 1080 1560 L1080 1920 L0 1920Z" fill="url(#gMar)" />
        <Pop at={kw(3, 'dinosaurio') - 400} x={600} y={1500} from="right" heavy><Dino t={ms} x={640} y={1330} s={1.1} /></Pop>
        <Gota x={300} y={900 + id(3).float} s={1.6} />
      </Lienzo>
    </Shot>
    {/* 4 97 % salada */}
    <Shot startMs={ini(4)} endMs={fin(4)} punchMs={[kw(4, 'salada')]}>
      <Lienzo a={ini(4)} b={fin(4)}><FondoAbstracto t={ms} />
        <g transform={`translate(0 ${id(4).float})`}><Pop at={ini(4)} x={540} y={1150} heavy><GotaDividida x={540} y={1180} s={2.4} k={interpolate(ms, [kw(4, '97'), kw(4, 'salada') + 300], [0, 1], {...cl, easing: EASE.out})} /></Pop></g>
      </Lienzo>
      <Big text={`${Math.round(interpolate(ms, [kw(4, '97'), kw(4, 'salada')], [0, 97], {...cl, easing: EASE.out}))} %`} at={kw(4, '97')} y={1250} color="#FFFFFF" />
      <Tag text="🧂 salada" x={540} y={1560} at={kw(4, 'salada')} color={PAL.rosa} />
    </Shot>
    {/* 5 congelada o bajo tierra */}
    <Shot startMs={ini(5)} endMs={fin(5)} punchMs={[kw(5, 'congelada')]}>
      <Lienzo a={ini(5)} b={fin(5)} dir={-1}><FondoNoche t={ms} /><Glaciar t={ms} k={interpolate(ms, [ini(5), ini(5) + 600], [0, 1], cl)} /></Lienzo>
      <Tag text="🧊 glaciares" x={560} y={560} at={kw(5, 'congelada')} color="#9FE0FF" />
      <Tag text="💧 bajo tierra" x={540} y={1650} at={kw(5, 'escondida')} color="#7FD8FF" />
    </Shot>
    {/* 6 botella de 1 L: ríos y lagos = un par de gotas */}
    <Shot startMs={ini(6)} endMs={fin(6)} punchMs={[kw(6, 'gotas')]}>
      <Lienzo a={ini(6)} b={fin(6)}><FondoAbstracto t={ms} acento="#7FD8FF" />
        <g transform={`translate(0 ${id(6).float * 0.6})`}><Pop at={kw(6, 'botella') - 300} x={540} y={1300} from="up" heavy><Botella t={ms} x={540} y={1050} s={1.15} gotas={interpolate(ms, [kw(6, 'rios'), kw(6, 'rios') + 300], [0, 1], cl)} /></Pop></g>
      </Lienzo>
      <Tag text="1 litro = toda el agua" x={540} y={560} at={kw(6, 'litro')} color="#FFFFFF" size={44} />
      <Tag text="ríos y lagos 💧💧" x={540} y={1760} at={kw(6, 'gotas')} />
    </Shot>
    {/* 7 2.000 millones sin agua potable */}
    <Shot startMs={ini(7)} endMs={fin(7)} punchMs={[kw(7, '2.000')]}>
      <Lienzo a={ini(7)} b={fin(7)}><FondoAbstracto t={ms} acento={PAL.rosa} /><Gente t={ms} k={interpolate(ms, [kw(7, '2.000'), kw(7, 'personas') + 600], [0, 1], cl)} /></Lienzo>
      <Big text={`${miles(interpolate(ms, [kw(7, '2.000'), kw(7, 'millones') + 300], [0, 2000], {...cl, easing: EASE.out}))} M`} at={kw(7, '2.000')} y={1680} color={PAL.rosa} size={130} />
    </Shot>
    {/* 8 Ciudad del Cabo, día cero */}
    <Shot startMs={ini(8)} endMs={fin(8)} punchMs={[kw(8, 'grifo')]}>
      <Lienzo a={ini(8)} b={fin(8)} dir={-1}><FondoAbstracto t={ms} acento="#FF8A3D" />
        <Pop at={ini(8)} x={540} y={1000} from="right"><Grifo t={ms} x={560} y={900} s={1.3} flujo={interpolate(ms, [kw(8, 'cortar'), kw(8, 'grifo') + 400], [1, 0], {...cl, easing: EASE.in})} /></Pop>
      </Lienzo>
      <Tag text="Ciudad del Cabo · 2018" x={540} y={560} at={kw(8, 'ciudad')} color="#FF8A3D" />
      <Big text="DÍA CERO" at={kw(8, 'grifo')} y={1600} color="#FF8A3D" size={120} />
    </Shot>
    {/* 9 hidrógeno al espacio */}
    <Shot startMs={ini(9)} endMs={fin(9)} punchMs={[kw(9, 'espacio')]}>
      <Lienzo a={ini(9)} b={fin(9)}><FondoNoche t={ms} /><Tierra t={ms} x={540} y={1150} r={300} /><Hidrogeno t={ms} x={540} y={1150} r={300} /></Lienzo>
      <Tag text="H · hidrógeno" x={540} y={600} at={kw(9, 'hidrogeno')} color="#E3DEFF" />
    </Shot>
    {/* 10 el Sol evaporará los océanos */}
    <Shot startMs={ini(10)} endMs={fin(10)} punchMs={[kw(10, 'evaporara')]}>
      <Lienzo a={ini(10)} b={fin(10)}><FondoNoche t={ms} />
        <SolGigante t={ms} k={interpolate(ms, [ini(10), fin(10)], [0, 1], {...cl, easing: EASE.inOut})} />
        <Tierra t={ms} x={540} y={1350} r={280} seca={interpolate(ms, [kw(10, 'evaporara') - 300, fin(10)], [0, 1], cl)} />
      </Lienzo>
      <Tag text="dentro de ~1.000 millones de años" x={540} y={1760} at={kw(10, 'dentro')} color="#FF8A3D" size={40} />
    </Shot>
    {/* 11 lo que se acaba es la que podemos beber */}
    <Shot startMs={ini(11)} endMs={fin(11)} inT="fade" punchMs={[kw(11, 'beber')]}>
      <Lienzo a={ini(11)} b={fin(11)}><FondoAbstracto t={ms} acento="#7FD8FF" />
        <Pop at={ini(11)} x={540} y={1300} heavy><Vaso t={ms} x={540} y={1150} s={1.3} nivel={interpolate(ms, [kw(11, 'acaba'), fin(11)], [0.8, 0.15], {...cl, easing: EASE.inOut})} /></Pop>
      </Lienzo><Motes color="#7FD8FF" seed={5} />
    </Shot>
    {/* 12 cierre en bucle: vuelve la Tierra */}
    <Shot startMs={ini(12)} endMs={D.total * 1000 + 500} inT="fade" punchMs={[kw(12, 'poca')]}>
      <Lienzo a={ini(12)} b={D.total * 1000}><FondoNoche t={ms} /><Tierra t={ms} x={540} y={1150} r={330} /></Lienzo>
      <Tag text="Dímelo abajo 👇" x={540} y={1650} at={kw(12, 'dimelo')} />
    </Shot>
    <Vignette />
    <Captions frases={F as any} />
    <Grain amount={0.05} />
  </AbsoluteFill>;
};
