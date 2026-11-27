// Vídeo 06 "La imagen más detallada del Sol" — SVG en línea, sin imágenes.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import D from './sol.json';
import {Shot, Motes, Grain, Vignette, useMs, useSpring, EASE, SPRING, idle, W, H} from './lib/motion';
import {Captions} from './lib/captions';
import {Defs, PAL, Persona, FondoNoche, FondoAbstracto} from './vec/arte';
import {DefsSol, Granulos, Palomita, Cubo, Volcan, Espejo, Frio, Conveccion, Olla, SolTierra, Moneda, Lupa} from './vec/sol';

const F = D.frases;
const nz = (s: string) => s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
const kw = (i: number, w: string) => 1000 * (F[i].words.find(p => nz(p.w).includes(nz(w)))?.a ?? F[i].a);
const ini = (i: number) => (i === 0 ? 0 : (F[i].a - 0.12) * 1000), fin = (i: number) => (i < F.length - 1 ? (F[i + 1].a - 0.12) * 1000 : D.total * 1000);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = '"Inter Display", Inter, sans-serif';

const Pop: React.FC<{at: number; x: number; y: number; heavy?: boolean; from?: 'pop' | 'up' | 'right' | 'left'; children: React.ReactNode}> = ({at, x, y, heavy, from = 'pop', children}) => {
  const p = useSpring(at, heavy ? SPRING.pesado : SPRING.elastico);
  const tr = from === 'up' ? `translate(0 ${(1 - p) * 800})` : from === 'right' ? `translate(${(1 - p) * 900} 0)` : from === 'left' ? `translate(${(p - 1) * 900} 0)` : `translate(${x} ${y}) scale(${p}) translate(${-x} ${-y})`;
  return <g transform={tr} opacity={Math.min(1, p * 1.5)}>{children}</g>;
};
const Lienzo: React.FC<{a: number; b: number; dir?: number; zoom?: number; children: React.ReactNode}> = ({a, b, dir = 1, zoom = 0.07, children}) => {
  const ms = useMs(), k = interpolate(ms, [a, b], [0, 1], {...cl, easing: EASE.inOut});
  return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', transform: `scale(${1 + zoom * k}) translateX(${dir * 20 * k}px)`}}><Defs /><DefsSol />{children}</svg>;
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

export const SolSVG: React.FC = () => {
  const ms = useMs(), id = (s: number) => idle(ms, s);
  // palomitas que saltan del cubo y, al decir "Sol", se funden en gránulos
  const morf = interpolate(ms, [kw(0, 'superficie') - 200, kw(0, 'sol') + 300], [0, 1], {...cl, easing: EASE.inOut});
  return <AbsoluteFill style={{background: PAL.noche0}}>
    {/* 0 gancho: palomitas → superficie del Sol */}
    <Shot startMs={0} endMs={fin(0)} inT="none" outT="fade" punchMs={[kw(0, 'sol')]}>
      <Lienzo a={0} b={fin(0)}><FondoAbstracto t={ms} acento="#FF8A3D" />
        <g opacity={1 - morf}><Cubo x={540} y={1400} s={1} />
          {Array.from({length: 16}, (_, i) => {const ph = ((ms / 1100) + i / 16) % 1, a = (i * 137) % 360;
            return <Palomita key={i} x={540 + Math.cos(a) * 260 * ph} y={1330 - Math.sin(ph * Math.PI) * 520 - i * 4} s={0.9} rot={ms / 4 + i * 40} />;})}</g>
        <g opacity={morf} transform={`translate(540 1000) scale(${0.6 + 0.4 * morf}) translate(-540 -1000)`}><Granulos t={ms} /></g>
      </Lienzo>
    </Shot>
    {/* 1 la imagen más detallada: zoom lento sobre los gránulos */}
    <Shot startMs={ini(1)} endMs={fin(1)} inT="fade" punchMs={[kw(1, 'detallada')]}>
      <Lienzo a={ini(1)} b={fin(1)} zoom={0.15}><Granulos t={ms} /></Lienzo>
      <Tag text="imagen de 2025" x={540} y={1650} at={kw(1, 'imagen')} />
    </Shot>
    {/* 2 telescopio Inouye en un volcán de Hawái */}
    <Shot startMs={ini(2)} endMs={fin(2)} punchMs={[kw(2, 'volcan')]}>
      <Lienzo a={ini(2)} b={fin(2)}><FondoNoche t={ms} />
        <Pop at={ini(2)} x={540} y={1500} from="up" heavy><Volcan t={ms} abre={interpolate(ms, [kw(2, 'inouye'), kw(2, 'inouye') + 800], [0, 1], {...cl, easing: EASE.out})} /></Pop>
      </Lienzo><Motes color="#FFD23F" seed={2} />
      <Tag text="Inouye · Haleakalā (Hawái)" x={540} y={700} at={kw(2, 'inouye')} size={44} />
    </Shot>
    {/* 3 espejo de 4 m que podría fundir metal */}
    <Shot startMs={ini(3)} endMs={fin(3)} punchMs={[kw(3, 'fundir')]}>
      <Lienzo a={ini(3)} b={fin(3)}><FondoAbstracto t={ms} acento="#FF8A3D" />
        <g transform={`translate(0 ${id(3).float * 0.5})`}><Pop at={ini(3)} x={540} y={1400} heavy><Espejo t={ms} x={540} y={1250} foco={interpolate(ms, [kw(3, 'concentra'), kw(3, 'concentra') + 600], [0, 1], cl)}
          fundir={interpolate(ms, [kw(3, 'fundir'), kw(3, 'fundir') + 900], [0, 1], {...cl, easing: EASE.in})} /></Pop></g>
      </Lienzo>
      <Big text="4 m" at={kw(3, 'metros')} y={560} color="#9FE0FF" />
    </Shot>
    {/* 4 refrigeración */}
    <Shot startMs={ini(4)} endMs={fin(4)} punchMs={[kw(4, 'refrigeracion')]}>
      <Lienzo a={ini(4)} b={fin(4)} dir={-1}><FondoAbstracto t={ms} acento={PAL.azul1} />
        <Pop at={ini(4)} x={540} y={1400}><Frio t={ms} /></Pop>
      </Lienzo>
      <Tag text="❄️ refrigeración gigante" x={540} y={1050} at={kw(4, 'refrigeracion')} color="#9FE0FF" />
    </Shot>
    {/* 5 cada grano, una burbuja de plasma más grande que España */}
    <Shot startMs={ini(5)} endMs={fin(5)} punchMs={[kw(5, 'espana')]}>
      <Lienzo a={ini(5)} b={fin(5)} zoom={0.12}><Granulos t={ms} cell={330} vida={6000} />
        <circle cx={540} cy={1150} r={interpolate(ms, [kw(5, 'granos'), kw(5, 'granos') + 600], [0, 190], {...cl, easing: EASE.back})} fill="none" stroke="#fff" strokeWidth={8} strokeDasharray="18 14" strokeDashoffset={-ms / 30} />
      </Lienzo>
      <Tag text="hasta 2.000 km" x={540} y={1430} at={kw(5, 'plasma')} />
      <Tag text="🇪🇸 más grande que España" x={540} y={1560} at={kw(5, 'espana')} color="#FF8A3D" size={46} />
    </Shot>
    {/* 6 convección: sube en el centro, baja por los bordes */}
    <Shot startMs={ini(6)} endMs={fin(6)} punchMs={[kw(6, 'sube'), kw(6, 'hunde')]}>
      <Lienzo a={ini(6)} b={fin(6)}><FondoAbstracto t={ms} acento="#FF8A3D" />
        <g transform={`translate(0 ${id(6).float})`}><Pop at={ini(6)} x={540} y={1150} heavy><Conveccion t={ms} x={540} y={1150} s={1.05} k={interpolate(ms, [kw(6, 'centro'), kw(6, 'centro') + 500], [0, 1], cl)} /></Pop></g>
      </Lienzo>
      <Tag text="🔥 sube" x={540} y={720} at={kw(6, 'sube')} color="#FFD23F" /><Tag text="se enfría y baja" x={540} y={1600} at={kw(6, 'hunde')} color="#FF8A3D" size={44} />
    </Shot>
    {/* 7 olla hirviendo a 6.000 grados */}
    <Shot startMs={ini(7)} endMs={fin(7)} punchMs={[kw(7, 'grados')]}>
      <Lienzo a={ini(7)} b={fin(7)} dir={-1}><FondoAbstracto t={ms} acento="#FF5A4A" />
        <Pop at={ini(7)} x={540} y={1450} from="up" heavy><Olla t={ms} x={540} y={1250} s={1.15} /></Pop>
      </Lienzo>
      <Big text={`${Math.round(interpolate(ms, [kw(7, 'casi'), kw(7, 'grados')], [0, 6000], {...cl, easing: EASE.out})).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} °C`} at={kw(7, 'casi')} y={620} color="#FF8A3D" />
    </Shot>
    {/* 8 cada grano dura 10 minutos */}
    <Shot startMs={ini(8)} endMs={fin(8)} punchMs={[kw(8, 'minutos')]}>
      <Lienzo a={ini(8)} b={fin(8)}><Granulos t={ms * 3} cell={260} vida={2500} />
        {(() => {const k = interpolate(ms, [kw(8, 'dura'), fin(8)], [0, 1], cl), a = k * 2 * Math.PI - Math.PI / 2;
          return <g><circle cx={540} cy={1150} r={180} fill={PAL.noche0} opacity={0.85} />
            <path d={`M540 1150 L540 970 A180 180 0 ${k > 0.5 ? 1 : 0} 1 ${540 + 180 * Math.cos(a)} ${1150 + 180 * Math.sin(a)}Z`} fill={PAL.amar} opacity={0.9} /></g>;})()}
      </Lienzo>
      <Big text="10 min" at={kw(8, 'minutos')} y={1380} size={130} />
    </Shot>
    {/* 9 distingue cosas de 20 km: lupa */}
    <Shot startMs={ini(9)} endMs={fin(9)} punchMs={[kw(9, '20')]}>
      <Lienzo a={ini(9)} b={fin(9)} zoom={0.1}><Granulos t={ms} cell={110} />
        <Lupa x={540 + Math.sin(ms / 900) * 120} y={1150 + Math.cos(ms / 1100) * 80} r={200} />
      </Lienzo>
      <Big text="20 km" at={kw(9, '20')} y={1450} color="#7CFF6B" />
    </Shot>
    {/* 10 desde 150 millones de km = moneda a 170 km */}
    <Shot startMs={ini(10)} endMs={fin(10)} punchMs={[kw(10, 'moneda')]}>
      <Lienzo a={ini(10)} b={fin(10)}><FondoNoche t={ms} />
        <g opacity={interpolate(ms, [kw(10, 'moneda') - 300, kw(10, 'moneda')], [1, 0], cl)}><SolTierra t={ms} k={interpolate(ms, [ini(10), ini(10) + 900], [0, 1], {...cl, easing: EASE.out})} /></g>
        <g opacity={interpolate(ms, [kw(10, 'moneda') - 300, kw(10, 'moneda')], [0, 1], cl)}><Moneda t={ms} x={540} y={1150} s={1.6} /></g>
      </Lienzo>
      <Tag text="150 millones de km" x={540} y={1450} at={kw(10, '150')} />
      <Tag text="🪙 a 170 km" x={540} y={1600} at={kw(10, '170')} color="#FFD23F" />
    </Shot>
    {/* 11 la luz que te calienta */}
    <Shot startMs={ini(11)} endMs={fin(11)} inT="fade" punchMs={[kw(11, 'hervir')]}>
      <Lienzo a={ini(11)} b={fin(11)}><FondoNoche t={ms} />
        <circle cx={540} cy={560} r={200} fill="url(#gSol)" /><circle cx={540} cy={560} r={260 + 15 * Math.sin(ms / 400)} fill="#FFB534" opacity={0.25} filter="url(#blur18)" />
        {[0, 1, 2, 3, 4].map(i => <line key={i} x1={540} y1={760} x2={380 + i * 80} y2={1150} stroke={PAL.amar} strokeWidth={10} opacity={0.3} strokeDasharray="30 30" strokeDashoffset={-ms / 10} />)}
        <Pop at={ini(11)} x={540} y={1500} from="up"><Persona x={540} y={1300} s={1.1} sentado={false} ropa={PAL.rosa} piel={1} /></Pop>
      </Lienzo>
    </Shot>
    {/* 12 cierre en bucle: vuelven los gránulos-palomitas */}
    <Shot startMs={ini(12)} endMs={D.total * 1000 + 500} inT="fade" punchMs={[kw(12, 'sol')]}>
      <Lienzo a={ini(12)} b={D.total * 1000} zoom={0.12}><Granulos t={ms} cell={150} /></Lienzo>
      <Tag text="Dímelo abajo 👇" x={540} y={1650} at={kw(12, 'dimelo')} />
    </Shot>
    <Vignette />
    <Captions frases={F as any} />
    <Grain amount={0.05} />
  </AbsoluteFill>;
};
