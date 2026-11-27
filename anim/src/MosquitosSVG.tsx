// Vídeo 08 "¿Qué pasaría si desaparecieran los mosquitos?" — SVG en línea. Fotograma 0 lleno (inT none).
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import D from './mosquitos.json';
import {Shot, Motes, Grain, Vignette, useMs, useSpring, EASE, SPRING, idle, W, H} from './lib/motion';
import {Captions} from './lib/captions';
import {Defs, PAL, Persona, FondoNoche, FondoAbstracto, FondoSalon} from './vec/arte';
import {Dino, DefsAgua, Gente} from './vec/agua';
import {Mosquito, GotaSangre, Huevos, Pez, Rana, Libelula, Pajaro, Murcielago, Tundra, Nube, Orquidea, Caja} from './vec/mosquito';

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

export const MosquitosSVG: React.FC = () => {
  const ms = useMs(), id = (s: number) => idle(ms, s);
  const vuela = (s: number, cx: number, cy: number, r = 60) => [cx + Math.sin(ms / 700 + s) * r, cy + Math.cos(ms / 530 + s * 2) * r * 0.6] as const;
  return <AbsoluteFill style={{background: PAL.noche0}}>
    {/* 0 gancho: mosquito gigante en pantalla desde el fotograma 0; al decir "desaparecieran" se desvanece en partículas */}
    <Shot startMs={0} endMs={fin(0)} inT="none" punchMs={[kw(0, 'mosquitos')]}>
      <Lienzo a={0} b={fin(0)}><FondoSalon t={ms} />
        {(() => {const [x, y] = vuela(1, 560, 1150, 40), o = interpolate(ms, [kw(0, 'desaparecieran'), kw(0, 'todos') + 200], [1, 0.15], cl);
          return <Mosquito t={ms} x={x} y={y} s={2.6} rot={-8} o={o} />;})()}
      </Lienzo><Motes color="#FF5FA2" seed={1} />
    </Shot>
    {/* 1 el animal más mortal */}
    <Shot startMs={ini(1)} endMs={fin(1)} punchMs={[kw(1, 'mortal')]}>
      <Lienzo a={ini(1)} b={fin(1)}><FondoAbstracto t={ms} acento="#E53950" />
        <circle cx={540} cy={1150} r={380} fill="#E53950" opacity={interpolate(ms, [kw(1, 'mortal'), kw(1, 'mortal') + 400], [0, 0.25], cl)} filter="url(#blur18)" />
        {(() => {const [x, y] = vuela(2, 540, 1150, 30); return <Mosquito t={ms} x={x} y={y} s={2} rot={-5} />;})()}
      </Lienzo>
      <Tag text="☠️ el animal más mortal" x={540} y={1650} at={kw(1, 'mortal')} color="#E53950" />
    </Shot>
    {/* 2 malaria: 600.000 al año */}
    <Shot startMs={ini(2)} endMs={fin(2)} punchMs={[kw(2, '600.000')]}>
      <Lienzo a={ini(2)} b={fin(2)} dir={-1}><FondoAbstracto t={ms} acento="#E53950" /><Gente t={ms} k={interpolate(ms, [kw(2, '600.000'), kw(2, 'ninos') + 400], [0, 1], cl)} /></Lienzo>
      <Big text={miles(interpolate(ms, [kw(2, '600.000'), kw(2, 'personas') + 200], [0, 600000], {...cl, easing: EASE.out}))} at={kw(2, '600.000')} y={1630} color="#E53950" size={140} />
    </Shot>
    {/* 3 solo pican las hembras: sangre para los huevos */}
    <Shot startMs={ini(3)} endMs={fin(3)} punchMs={[kw(3, 'hembras')]}>
      <Lienzo a={ini(3)} b={fin(3)}><FondoAbstracto t={ms} />
        {(() => {const [x, y] = vuela(3, 600, 1050, 25); return <Mosquito t={ms} x={x} y={y} s={1.8} sangre={interpolate(ms, [kw(3, 'sangre') - 200, kw(3, 'sangre') + 700], [0, 1], {...cl, easing: EASE.out})} />;})()}
        <g transform={`translate(0 ${id(3).float})`}><Pop at={kw(3, 'sangre')} x={260} y={900}><GotaSangre x={260} y={900} s={1.5} /></Pop></g>
        <Huevos t={ms} x={540} y={1500} k={interpolate(ms, [kw(3, 'huevos') - 200, kw(3, 'huevos') + 600], [0, 1], cl)} />
      </Lienzo>
      <Tag text="♀ solo las hembras" x={540} y={680} at={kw(3, 'hembras')} color={PAL.rosa} />
    </Shot>
    {/* 4 zumbido: alas cientos de veces por segundo */}
    <Shot startMs={ini(4)} endMs={fin(4)} punchMs={[kw(4, 'zumbido')]}>
      <Lienzo a={ini(4)} b={fin(4)} zoom={0.12}><FondoAbstracto t={ms} acento="#9FE0FF" />
        {[0, 1, 2].map(i => {const k = ((ms / 600) + i / 3) % 1; return <circle key={i} cx={540} cy={1100} r={150 + k * 450} fill="none" stroke="#9FE0FF" strokeWidth={8} opacity={0.5 * (1 - k)} />;})}
        <Mosquito t={ms * 2} x={560} y={1100} s={2.4} />
      </Lienzo>
      <Big text="~600 / s" at={kw(4, 'cientos')} y={1600} color="#9FE0FF" size={120} />
    </Shot>
    {/* 5 3.500 especies, la mayoría no pica humanos */}
    <Shot startMs={ini(5)} endMs={fin(5)} punchMs={[kw(5, '3.500')]}>
      <Lienzo a={ini(5)} b={fin(5)}><FondoNoche t={ms} />
        {Array.from({length: 12}, (_, i) => {const [x, y] = vuela(i, 180 + (i % 3) * 360, 700 + Math.floor(i / 3) * 260, 30);
          return <Pop key={i} at={kw(5, '3.500') - 300 + i * 50} x={x} y={y}><Mosquito t={ms + i * 40} x={x} y={y} s={0.6} flip={i % 2 === 1} /></Pop>;})}
      </Lienzo>
      <Big text={`+${miles(interpolate(ms, [kw(5, '3.500'), kw(5, 'especies') + 300], [0, 3500], {...cl, easing: EASE.out}))}`} at={kw(5, '3.500')} y={1680} color={PAL.verde} size={120} />
    </Shot>
    {/* 6 desde los dinosaurios */}
    <Shot startMs={ini(6)} endMs={fin(6)} punchMs={[kw(6, 'dinosaurios')]}>
      <Lienzo a={ini(6)} b={fin(6)} dir={-1}><FondoNoche t={ms} />
        <Pop at={ini(6)} x={560} y={1500} from="right" heavy><Dino t={ms} x={620} y={1350} s={1.1} /></Pop>
        {(() => {const [x, y] = vuela(6, 330, 900, 50); return <Mosquito t={ms} x={x} y={y} s={0.9} />;})()}
      </Lienzo>
    </Shot>
    {/* 7 millones de vidas salvadas */}
    <Shot startMs={ini(7)} endMs={fin(7)} punchMs={[kw(7, 'salvarian')]}>
      <Lienzo a={ini(7)} b={fin(7)}><FondoAbstracto t={ms} acento={PAL.verde} />
        <g>{Array.from({length: 48}, (_, i) => {const c = i % 6, r = Math.floor(i / 6), on = interpolate(ms, [ini(7) + i * 40, ini(7) + i * 40 + 300], [0, 1], cl);
          return <g key={i} transform={`translate(${190 + c * 140} ${600 + r * 128}) scale(${0.7 + 0.3 * on})`}><circle cx={0} cy={-30} r={22} fill={on > 0.5 ? PAL.verde : '#8C7BD1'} /><rect x={-28} y={-4} width={56} height={60} rx={26} fill={on > 0.5 ? PAL.verde2 : '#5B3A9E'} /></g>;})}</g>
      </Lienzo>
      <Tag text="💚 vidas salvadas" x={540} y={1700} at={kw(7, 'salvarian')} color={PAL.verde} />
    </Shot>
    {/* 8 cadena alimentaria */}
    <Shot startMs={ini(8)} endMs={fin(8)} punchMs={[kw(8, 'alimentan')]}>
      <Lienzo a={ini(8)} b={fin(8)} dir={-1}><FondoNoche t={ms} />
        <path d="M0 1450 Q540 1400 1080 1460 L1080 1920 L0 1920Z" fill="url(#gMar)" />
        <Pop at={kw(8, 'peces')} x={250} y={1650}><Pez t={ms} x={250} y={1640} s={0.9} /></Pop>
        <Pop at={kw(8, 'ranas')} x={760} y={1420}><Rana t={ms} x={760} y={1380} s={0.9} lengua={interpolate(ms, [kw(8, 'ranas') + 300, kw(8, 'ranas') + 500, kw(8, 'ranas') + 800], [0, 1, 0], cl)} /></Pop>
        <Pop at={kw(8, 'libelulas')} x={300} y={1000}><Libelula t={ms} x={300} y={1000} s={0.9} /></Pop>
        <Pop at={kw(8, 'pajaros')} x={760} y={800}><Pajaro t={ms} x={760} y={800} s={1.1} /></Pop>
        <Pop at={kw(8, 'murcielagos')} x={330} y={650}><Murcielago t={ms} x={330} y={650} s={1.1} /></Pop>
        <Nube t={ms} x={560} y={1120} n={30} r={180} />
      </Lienzo>
    </Shot>
    {/* 9 Ártico: aves comiendo nubes de mosquitos */}
    <Shot startMs={ini(9)} endMs={fin(9)} punchMs={[kw(9, 'aves')]}>
      <Lienzo a={ini(9)} b={fin(9)}><Tundra t={ms} />
        <Nube t={ms} x={540} y={1150} n={110} r={380} />
        {[0, 1, 2, 3, 4].map(i => <Pop key={i} at={kw(9, 'aves') - 300 + i * 120} x={0} y={0} from="right"><Pajaro t={ms + i * 60} x={200 + i * 170 + ((ms / 6) % 200)} y={700 + (i % 2) * 140} s={0.7} c={i % 2 ? '#E3DEFF' : '#FFB534'} /></Pop>)}
      </Lienzo>
      <Tag text="❄️ Ártico" x={540} y={600} at={kw(9, 'artico')} color="#9FE0FF" />
    </Shot>
    {/* 10 polinizan orquídeas */}
    <Shot startMs={ini(10)} endMs={fin(10)} punchMs={[kw(10, 'flores')]}>
      <Lienzo a={ini(10)} b={fin(10)} dir={-1}><FondoAbstracto t={ms} acento={PAL.rosa} />
        <Pop at={ini(10)} x={540} y={1300} from="up" heavy><Orquidea t={ms} x={540} y={1050} s={1.5} /></Pop>
        {(() => {const [x, y] = vuela(10, 720, 880, 50); return <Mosquito t={ms} x={x} y={y} s={0.8} flip />;})()}
      </Lienzo>
      <Tag text="🌸 orquídeas" x={540} y={1760} at={kw(10, 'orquideas')} color={PAL.rosa} />
    </Shot>
    {/* 11 otros insectos ocuparían su lugar */}
    <Shot startMs={ini(11)} endMs={fin(11)} punchMs={[kw(11, 'ocuparian')]}>
      <Lienzo a={ini(11)} b={fin(11)}><FondoNoche t={ms} />
        <Nube t={ms} x={540} y={1150} n={60} r={300} o={interpolate(ms, [ini(11), kw(11, 'ocuparian')], [1, 0.2], cl)} />
        <Nube t={ms + 999} x={540} y={1150} n={60} r={300} o={interpolate(ms, [kw(11, 'ocuparian') - 300, kw(11, 'ocuparian') + 400], [0, 1], cl)} />
        <Pop at={kw(11, 'insectos')} x={540} y={1150}><Libelula t={ms} x={500} y={1150} s={1.2} /></Pop>
      </Lienzo>
      <Tag text="🔄 otros insectos" x={540} y={1650} at={kw(11, 'insectos')} />
    </Shot>
    {/* 12 mosquitos modificados en laboratorio */}
    <Shot startMs={ini(12)} endMs={fin(12)} punchMs={[kw(12, 'modificados')]}>
      <Lienzo a={ini(12)} b={fin(12)} dir={-1}><FondoAbstracto t={ms} acento={PAL.azul1} />
        <Pop at={ini(12)} x={540} y={1400} from="up" heavy><Caja t={ms} x={540} y={1350} abre={interpolate(ms, [kw(12, 'sueltan'), kw(12, 'sueltan') + 600], [0, 1], {...cl, easing: EASE.out})} /></Pop>
        {Array.from({length: 6}, (_, i) => {const k = interpolate(ms, [kw(12, 'sueltan') + i * 120, kw(12, 'sueltan') + i * 120 + 1800], [0, 1], cl);
          return k > 0 ? <Mosquito key={i} t={ms + i * 30} x={540 + (i - 2.5) * 140 * k} y={1250 - k * 600 - (i % 2) * 80} s={0.55} o={Math.min(1, k * 3)} flip={i < 3} /> : null;})}
      </Lienzo>
      <Tag text="🧬 modificados" x={540} y={640} at={kw(12, 'modificados')} color={PAL.azul1} />
    </Shot>
    {/* 13 no es ciencia ficción */}
    <Shot startMs={ini(13)} endMs={fin(13)} punchMs={[kw(13, 'ficcion')]}>
      <Lienzo a={ini(13)} b={fin(13)}><FondoNoche t={ms} />
        {(() => {const [x, y] = vuela(13, 540, 1150, 40), o = interpolate(ms, [kw(13, 'borrar'), kw(13, 'borrar') + 900], [1, 0.1], cl);
          return <Mosquito t={ms} x={x} y={y} s={1.9} o={o} />;})()}
      </Lienzo><Motes color={PAL.rosa} seed={4} />
    </Shot>
    {/* 14 cierre en bucle con el gancho */}
    <Shot startMs={ini(14)} endMs={D.total * 1000 + 500} inT="fade" punchMs={[kw(14, 'desaparecer')]}>
      <Lienzo a={ini(14)} b={D.total * 1000}><FondoSalon t={ms} />
        {(() => {const [x, y] = vuela(1, 560, 1150, 40); return <Mosquito t={ms} x={x} y={y} s={2.6} rot={-8} />;})()}
      </Lienzo>
      <Tag text="Dímelo abajo 👇" x={540} y={1700} at={kw(14, 'dimelo')} />
    </Shot>
    <Vignette />
    <Captions frases={F as any} />
    <Grain amount={0.05} />
  </AbsoluteFill>;
};
