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
  words.push({s:c,a,b:a+d,page});cnt++;chars+=c.length;a+=d;if(/[.,:;…?!]$/.test(w)){page++;cnt=0;chars=0;}});page++;});

// ---- textos grandes, golpes, destellos ----
const POS={titulo:880,arriba:330,arriba2:470,centro:820,centro2:970,centro3:1060};
const TAM={enorme:240,grande:180,medio:120,pequeno:76,mini:60};
const COL={amarillo:['#ffd23f','rgba(255,120,30,.9)'],naranja:['#ff7a2a','rgba(255,40,0,1)'],blanco:['#ffffff','rgba(255,120,30,.7)'],
 crema:['#ffe6b0','rgba(255,170,60,.9)'],rojo:['#ff6a5a','rgba(255,40,20,.9)'],azul:['#9fe0ff','rgba(60,160,255,.8)'],
 acido:['#f4ff6a','rgba(200,220,0,.8)'],rosa:['#ff9a8a','rgba(255,80,60,.7)']};
const L=(i,f)=>starts[i]+durs[i]*f;const END=i=>i<F.length-1?starts[i+1]-.15:TOTAL-.2;
const calls=[],impacts=[],flashes=[],red=[];
F.forEach((l,i)=>{(l.textos||[]).forEach(x=>{const a=L(i,x.t??0);
  const b=x.hasta==null||x.hasta==='fin'?END(i):x.hasta==='final'?TOTAL-.2:L(i,x.hasta);
  const [color,glow]=COL[x.color||'blanco'];
  calls.push({a,b,text:x.texto,y:POS[x.pos||'arriba'],size:TAM[x.tam||'grande'],color,glow:x.brillo===false?null:glow,
   count:x.contar?[x.contar,x.durante??1.5]:null});
  if(x.golpe)impacts.push(a);if(x.flash)flashes.push(a);});
 if(l.rojo)red.push([L(i,l.rojo[0]),L(i,l.rojo[1])]);});
impacts.sort((a,b)=>a-b);
// Nunca dos textos grandes en el mismo sitio a la vez: el anterior se quita cuando entra el siguiente
calls.sort((a,b)=>a.a-b.a);
for(let i=0;i<calls.length;i++)for(let j=i+1;j<calls.length;j++){const A=calls[i],B=calls[j];
 if(Math.abs(A.y-B.y)<(A.size+B.size)*.45&&B.a<A.b)A.b=Math.max(A.a+.2,B.a-.05);}
const TL={shots,words,calls,impacts,flashes,red,total:TOTAL,starts,durs,voice,beatEnd:P.ritmo_hasta!=null?starts[P.ritmo_hasta]:null,res:RES,gs:1};
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
 for(const k of Object.keys(sh)){ // de una en una (las imágenes x4 pesan varios MB)
  const c=X4&&fs.existsSync(`${DIR}/imagenes_x4/${k}.jpg`)?`${DIR}/imagenes_x4/${k}.jpg`:`${DIR}/imagenes/${k}.jpg`;
  await p.evaluate(([k,c,d])=>window.addTex(k,c,d),[k,'data:image/jpeg;base64,'+fs.readFileSync(c).toString('base64'),'data:image/png;base64,'+fs.readFileSync(`${DIR}/imagenes/${k}_d.png`).toString('base64')]);}
 await p.evaluate(cam=>{for(const k in cam)SH[k]=cam[k];},sh);
 if(mode==='t'){const d=await p.evaluate(x=>window.frame(x),+process.argv[4]);fs.writeFileSync(process.argv[5],Buffer.from(d.split(',')[1],'base64'));await br.close();return;}
 const from=+process.argv[3],to=Math.min(+process.argv[4],TOTAL),outp=process.argv[5];
 const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf',RES>1?'14':'18','-pix_fmt','yuv420p',outp]);
 const N=Math.round((to-from)*FPS);
 for(let f=0;f<N;f++){const d=await p.evaluate(x=>window.frame(x),from+f/FPS);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();})();
