// Renderiza un vídeo a partir de videos/<nombre>/plan.json
// Uso: node motor/render.js videos/<nombre> [desde hasta salida.mp4 | t foto.jpg]
// Lee: plan.json, imagenes/<id>.jpg + <id>_d.png, voz (vo_XX.wav por frase, o un solo archivo + tiempos.json)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const DIR=path.resolve(process.argv[2]);const P=JSON.parse(fs.readFileSync(DIR+'/plan.json'));
const FPS=30,OFF=.35,GAP=P.pausa??.3,TAIL=P.cola??2.2;
// Resolución de salida: 4k = 2160x3840 (por defecto), 2k = 1440x2560, 1080 = borrador rápido
const RES={'4k':2,'2k':4/3,'1080':1}[process.env.RES||P.resolucion||'4k'];
const X4=fs.existsSync(DIR+'/imagenes_x4');

// ---- duración de cada frase ----
function wavDur(f){const b=fs.readFileSync(f);let i=12,sr=0,ch=1,bits=16;
 while(i<b.length-8){const id=b.toString('ascii',i,i+4),n=b.readUInt32LE(i+4);
  if(id==='fmt '){ch=b.readUInt16LE(i+10);sr=b.readUInt32LE(i+12);bits=b.readUInt16LE(i+22);}
  if(id==='data')return n/(sr*ch*bits/8);i+=8+n+(n%2);}throw 'wav sin datos '+f;}
const F=P.frases;let starts,durs,voice;
if(fs.existsSync(DIR+'/voz/tiempos.json')){ // un solo audio (p. ej. ElevenLabs) alineado con motor/alinear.py
 const T=JSON.parse(fs.readFileSync(DIR+'/voz/tiempos.json'));starts=T.map(x=>x[0]+OFF);durs=T.map(x=>x[1]-x[0]);
 voice={single:'voz/narracion.wav',offset:OFF};
}else{ // un wav por frase (clon de voz de Colab: vo_00.wav, vo_01.wav...)
 durs=F.map((_,i)=>wavDur(`${DIR}/voz/vo_${String(i).padStart(2,'0')}.wav`));
 let t=OFF;starts=durs.map(d=>{const s=t;t+=d+GAP;return s;});voice={lines:F.map((_,i)=>`voz/vo_${String(i).padStart(2,'0')}.wav`),starts};
}
const TOTAL=Math.ceil((starts[F.length-1]+durs[F.length-1]+TAIL)*10)/10;

// ---- planos ----
const pick=k=>(P.elegidas&&P.elegidas[k])||k; // "a03" -> "a03_20"
const shots=[];F.forEach((l,i)=>{const a=i?starts[i]-.12:0,b=i<F.length-1?starts[i+1]-.12:TOTAL;const k=l.planos.length;
 l.planos.forEach((n,j)=>shots.push({k:pick(n),a:a+(b-a)*j/k,b:a+(b-a)*(j+1)/k}));});

// ---- palabras (subtítulos) ----
const NUM={'0':4,'1':3,'2':3,'3':4,'4':6,'5':5,'6':4,'7':5,'8':4,'9':5};
const spoken=w=>{const d=w.replace(/[^0-9]/g,'');if(!d)return w.length;return d.length===1?NUM[d]:d.length*9;};
const words=[];let page=0;F.forEach((l,i)=>{const ws=l.show.split(' ');const wt=ws.map(w=>spoken(w)+(/[.,:;…?!]$/.test(w)?4:1));
 const tot=wt.reduce((a,b)=>a+b,0);let a=starts[i],cnt=0,chars=0;
 ws.forEach((w,j)=>{const d=durs[i]*wt[j]/tot;const c=w.replace(/[,.:;]$/,'').toUpperCase();
  if(cnt>=3||chars+c.length>17){page++;cnt=0;chars=0;}
  words.push({s:c,a,b:a+d,page,line:i});cnt++;chars+=c.length;a+=d;if(/[.,:;…?!]$/.test(w)){page++;cnt=0;chars=0;}});page++;});

// ---- tiempos REALES de cada palabra (motor/palabras.py, Whisper) ----
// Empareja las palabras del guion con las reconocidas y corrige subtítulos y textos (si no, quedan estimados).
const MAPA=F.map((_,i)=>[[0,0],[durs[i],durs[i]]]); // por frase: puntos (tiempo estimado, tiempo real), relativos
const PJ=DIR+'/voz/palabras.json';
if(fs.existsSync(PJ)&&!fs.existsSync(DIR+'/voz/tiempos.json')){
 const R=JSON.parse(fs.readFileSync(PJ));const nz=s=>s.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g,'');
 F.forEach((_,i)=>{const E=words.filter(w=>w.line===i),Q=R[i]||[];if(!Q.length)return;
  const a=E.map(w=>nz(w.s)),b=Q.map(w=>nz(w.w)),n=a.length,m=b.length; // LCS
  const T=Array.from({length:n+1},()=>new Array(m+1).fill(0));
  for(let x=n-1;x>=0;x--)for(let y=m-1;y>=0;y--)T[x][y]=a[x]&&a[x]===b[y]?T[x+1][y+1]+1:Math.max(T[x+1][y],T[x][y+1]);
  const pts=[[0,0]];let x=0,y=0;
  while(x<n&&y<m){if(a[x]&&a[x]===b[y]){pts.push([E[x].a-starts[i],Q[y].a]);x++;y++;}else if(T[x+1][y]>=T[x][y+1])x++;else y++;}
  pts.push([durs[i],Math.max(durs[i],Q[Q.length-1].b)]);
  for(let k=1;k<pts.length;k++)if(pts[k][1]<pts[k-1][1])pts[k][1]=pts[k-1][1]; // monótono
  MAPA[i]=pts;
  const f=t=>{for(let k=1;k<pts.length;k++)if(t<=pts[k][0]){const [x0,y0]=pts[k-1],[x1,y1]=pts[k];return y0+(x1>x0?(t-x0)/(x1-x0):0)*(y1-y0);}return pts[pts.length-1][1];};
  E.forEach(w=>{w.a=starts[i]+f(w.a-starts[i]);w.b=starts[i]+f(w.b-starts[i]);});
 });
}
const realRel=(i,t)=>{const p=MAPA[i];for(let k=1;k<p.length;k++)if(t<=p[k][0]){const [x0,y0]=p[k-1],[x1,y1]=p[k];return y0+(x1>x0?(t-x0)/(x1-x0):0)*(y1-y0);}return p[p.length-1][1];};

// ---- textos grandes, golpes, destellos ----
const POS={titulo:880,arriba:330,arriba2:470,centro:820,centro2:970,centro3:1060};
const TAM={enorme:240,grande:180,medio:120,pequeno:76,mini:60};
const COL={amarillo:['#ffd23f','rgba(255,120,30,.9)'],naranja:['#ff7a2a','rgba(255,40,0,1)'],blanco:['#ffffff','rgba(255,120,30,.7)'],
 crema:['#ffe6b0','rgba(255,170,60,.9)'],rojo:['#ff6a5a','rgba(255,40,20,.9)'],azul:['#9fe0ff','rgba(60,160,255,.8)'],
 acido:['#f4ff6a','rgba(200,220,0,.8)'],rosa:['#ff9a8a','rgba(255,80,60,.7)']};
const L=(i,f)=>starts[i]+realRel(i,durs[i]*f); // fracción de la frase -> momento real en que se dice esa palabra
const END=i=>i<F.length-1?starts[i+1]-.15:TOTAL-.2;
const calls=[],impacts=[],flashes=[],red=[],sfxEv=[];
F.forEach((l,i)=>{(l.textos||[]).forEach(x=>{const a=L(i,x.t??0);
  const b=x.hasta==null||x.hasta==='fin'?END(i):x.hasta==='final'?TOTAL-.2:L(i,x.hasta);
  const [color,glow]=COL[x.color||'blanco'];
  calls.push({a,b,text:x.texto,y:POS[x.pos||(P.subs==='arriba'?'centro':'arriba')],size:TAM[x.tam||'grande'],color,glow:x.brillo===false?null:glow,
   count:x.contar?[x.contar,x.durante??1.5]:null});
  if(x.golpe)impacts.push(a);if(x.flash)flashes.push(a);});
 if(l.rojo)red.push([L(i,l.rojo[0]),L(i,l.rojo[1])]);
 // efectos por frase: "sfx":[{"id":"glitch/dropout","t":0.6,"g":0.7}] (id del banco de earshot o de motor/sfx; el pico cae en t)
 (l.sfx||[]).forEach(x=>sfxEv.push({id:x.id,a:L(i,x.t??0),g:x.g??.7,dur:x.dur??null,pitch:x.pitch??null}));});
impacts.sort((a,b)=>a-b);
// Nunca dos textos grandes en el mismo sitio a la vez: el anterior se quita cuando entra el siguiente
calls.sort((a,b)=>a.a-b.a);
for(let i=0;i<calls.length;i++)for(let j=i+1;j<calls.length;j++){const A=calls[i],B=calls[j];
 if(Math.abs(A.y-B.y)<(A.size+B.size)*.45&&B.a<A.b)A.b=Math.max(A.a+.2,B.a-.05);}
// ---- mapas: globo terráqueo con países reales (Natural Earth), vuelo de cámara, ruta y marcadores ----
// "mapa":{"vuela":[[lon,lat,zoom],...],"ruta":[[lon,lat],...],"ruta_t":[0.15,0.85],"marcas":[{"en":[lon,lat],"texto":"...","t":0.3}],
//         "t":0,"hasta":0.5,"frases":1}   (t/hasta = fracción de la frase; ruta_t y marcas.t = fracción de la ventana del mapa; zoom 1 = globo entero)
const shotA=i=>i?starts[i]-.12:0,shotB=i=>i<F.length-1?starts[i+1]-.12:TOTAL;
const maps=[];F.forEach((l,i)=>{const m=l.mapa;if(!m)return;
 const a=m.t?L(i,m.t):shotA(i),b=m.hasta!=null?L(i,m.hasta):shotB(Math.min(F.length-1,i+(m.frases??1)-1)),at=f=>a+(b-a)*f;const rt=m.ruta_t||[.15,.85];
 maps.push({a,b,vuela:m.vuela||[[0,20,1]],ruta:m.ruta||null,ra:at(rt[0]),rb:at(rt[1]),
  marcas:(m.marcas||[]).map(x=>({en:x.en,texto:x.texto||'',a:at(x.t??.3)}))});});
// zoom de énfasis por frase: "zoom":[{"t":0.5,"k":1.3,"x":0,"y":0,"hasta":0.9}] (x,y = desplazamiento hacia el objeto, -0.2..0.2)
const zooms=[];F.forEach((l,i)=>(l.zoom||[]).forEach(z=>zooms.push({a:L(i,z.t??0),b:z.hasta==null?END(i):L(i,z.hasta),k:z.k??1.3,x:z.x??0,y:z.y??0})));
const TL={shots,words,calls,impacts,flashes,red,maps,zooms,pro:!!P.pro,subs:P.subs||'abajo',sfx:sfxEv,total:TOTAL,starts,durs,voice,beatEnd:P.ritmo_hasta!=null?starts[P.ritmo_hasta]:null,res:RES,gs:1};
fs.writeFileSync(DIR+'/timeline.json',JSON.stringify(TL,null,1));

// ---- cámara por plano (movimiento, partículas, calor) ----
const CAM=P.camara||{};const MOVS=['push','orbitL','crane','pull','orbitR','drift','push','rush'];
const camFor=(k,i)=>CAM[k]||CAM[k.split('_')[0]]||[MOVS[i%MOVS.length],'dust',0];

(async()=>{const mode=process.argv[3];if(mode==='solo-timeline'){console.log('total',TOTAL);return;}
 const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await br.newPage({viewport:{width:400,height:400}});p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+__dirname+'/scene.html');
 const sh={};shots.forEach((s,i)=>{sh[s.k]=sh[s.k]||camFor(s.k,i);});
 await p.evaluate(tl=>window.setup(tl,{}),TL);
 if(maps.length){ // d3-geo + contornos de países (escala 1:50 m) solo si el vídeo tiene mapas
  for(const m of ['d3-array','d3-geo'])await p.addScriptTag({path:path.join(__dirname,'..','node_modules',m,'dist',m+'.min.js')});
  const topo=require('world-atlas/countries-50m.json'),{feature,mesh}=require('topojson-client');
  await p.evaluate(g=>window.setGeo(g),{land:feature(topo,topo.objects.land),borders:mesh(topo,topo.objects.countries,(a,b)=>a!==b)});}
 for(const k of Object.keys(sh)){ // de una en una (las imágenes x4 pesan varios MB)
  const c=X4&&fs.existsSync(`${DIR}/imagenes_x4/${k}.jpg`)?`${DIR}/imagenes_x4/${k}.jpg`:`${DIR}/imagenes/${k}.jpg`;
  await p.evaluate(([k,c,d])=>window.addTex(k,c,d),[k,'data:image/jpeg;base64,'+fs.readFileSync(c).toString('base64'),'data:image/png;base64,'+fs.readFileSync(`${DIR}/imagenes/${k}_d.png`).toString('base64')]);}
 await p.evaluate(cam=>{for(const k in cam)SH[k]=cam[k];},sh);
 // ---- clips de imagen a vídeo (celda.py --clips + motor/clips.py): sustituyen a la foto fija de su plano ----
 // A 24 fps desde el inicio del plano; si el plano dura más que el clip, va y vuelve (adelante y atrás) en vez de ralentizarse.
 // plan.json -> "clip_max": {"c18": 40} usa solo los primeros N fotogramas (la parte buena); "clip_no": ["c04"] lo ignora.
 const CMAX=P.clip_max||{},CNO=P.clip_no||[],base=k=>k.split('_')[0];
 const CL={};for(const k of Object.keys(sh)){const d=`${DIR}/clips/${k}`;if(fs.existsSync(d)&&!CNO.includes(k)&&!CNO.includes(base(k))){
  const n=fs.readdirSync(d).filter(x=>x.endsWith('.jpg')).length,m=CMAX[k]??CMAX[base(k)];if(n)CL[k]=Math.max(2,Math.min(n,m||n));}}
 if(Object.keys(CL).length){console.log('clips:',Object.keys(CL).length);await p.evaluate(ks=>{CLIPK=new Set(ks);},Object.keys(CL));}
 const last={};
 const clipAt=async time=>{let i=shots.findIndex(s=>time>=s.a&&time<s.b);if(i<0)i=shots.length-1;const s=shots[i],n=CL[s.k];if(!n)return;
  const f=Math.floor((time-s.a)*24),pp=2*(n-1),j=f%pp,idx=j<n?j:pp-j;if(last[s.k]===idx)return;last[s.k]=idx;
  await p.evaluate(([k,u])=>window.setClip(k,u),[s.k,'data:image/jpeg;base64,'+fs.readFileSync(`${DIR}/clips/${s.k}/${String(idx+1).padStart(3,'0')}.jpg`).toString('base64')]);};
 if(mode==='t'){await clipAt(+process.argv[4]);const d=await p.evaluate(x=>window.frame(x),+process.argv[4]);fs.writeFileSync(process.argv[5],Buffer.from(d.split(',')[1],'base64'));await br.close();return;}
 const from=+process.argv[3],to=Math.min(+process.argv[4],TOTAL),outp=process.argv[5];
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf',RES>1?'14':'18','-pix_fmt','yuv420p',outp]);
 const N=Math.round((to-from)*FPS);
 for(let f=0;f<N;f++){await clipAt(from+f/FPS);const d=await p.evaluate(x=>window.frame(x),from+f/FPS);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();})();
