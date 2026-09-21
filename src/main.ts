import { SoftwareRenderer } from './renderer/software';
import { applyAction, type Action } from './app/controls';
import { startG2Runtime } from './app/runtime';
import { createViewerFrame, paintViewerFrame } from './glyph/ui';
import type { Model } from './model/types';

const root=document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML=`<div class="shell"><main class="stage"><canvas id="preview" width="1152" height="576"></canvas><div class="hint">← → ROTATE · ↑ ↓ ZOOM · TAP AUTO ORBIT · DOUBLE CLICK RESET</div></main><aside class="panel"><div class="brand">G2 MODEL VIEWER</div><label class="picker">LOAD MODEL<input id="file" type="file" accept=".obj,.glb"></label><div class="controls"><div>← → <span>rotate</span></div><div>↑ ↓ <span>zoom</span></div><div>SPACE <span>auto orbit</span></div><div>DOUBLE CLICK <span>reset view</span></div></div><div id="readout" class="readout"></div></aside></div>`;

const canvas=document.querySelector<HTMLCanvasElement>('#preview')!;
const ctx=canvas.getContext('2d',{alpha:false})!;
const tmp=document.createElement('canvas'); tmp.width=576; tmp.height=288;
const tmpCtx=tmp.getContext('2d',{alpha:false})!;
const renderer=new SoftwareRenderer();
const glyphFrame=createViewerFrame();
let model:Model={name:'No model loaded',meshes:[],metadata:{originalVertices:0,originalFaces:0,originalTriangles:0,renderedTriangles:0}};
let state={autoRotate:true,rx:0.18,ry:0.55,zoom:1.0};
let last=performance.now();
let g2Runtime:any=null;
let g2Busy=false;

function upscaleLevels(levels:Uint8Array,w:number,h:number):Uint8Array{
  if(w===576&&h===288) return levels;
  const out=new Uint8Array(576*288);
  for(let y=0;y<288;y++){const sy=Math.min(h-1,Math.floor(y*h/288)); for(let x=0;x<576;x++){const sx=Math.min(w-1,Math.floor(x*w/576)); out[y*576+x]=levels[sy*w+sx];}}
  return out;
}

function showFrame(levels:Uint8Array,w:number,h:number){
  const full=upscaleLevels(levels,w,h);
  paintViewerFrame(glyphFrame,{model,autoRotate:state.autoRotate,zoom:state.zoom,angle:state.ry},full);
  const image=tmpCtx.createImageData(576,288);
  for(let i=0;i<full.length;i++){const g=full[i]*17; const j=i*4; image.data[j]=g; image.data[j+1]=Math.min(255,g+Math.round(g*.35)); image.data[j+2]=Math.round(g*.75); image.data[j+3]=255;}
  tmpCtx.putImageData(image,0,0);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(tmp,0,0,1152,576);
  return full;
}

function stats(){
  const meta=model.metadata; const rendered=model.meshes.reduce((n,m)=>n+m.triangles.length,0);
  return `V ${((meta?.originalVertices??0)).toLocaleString()} · F ${(meta?.originalFaces??0).toLocaleString()} · T ${rendered.toLocaleString()}${meta?.triangleCap && (meta.originalTriangles??rendered)>meta.triangleCap?`/${meta.triangleCap.toLocaleString()}`:''}`;
}

let lastG2=0;
function draw(now:number){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(state.autoRotate) state.ry+=dt*.65;
  // During motion, render at half resolution: 4x fewer pixel tests without
  // dropping a single triangle. When stopped, return to the native G2 raster.
  const moving=state.autoRotate;
  const rw=moving?288:576, rh=moving?144:288;
  const f=renderer.render(model,{width:rw,height:rh,rx:state.rx,ry:state.ry,rz:0,zoom:state.zoom,backfaceCulling:true});
  const full=showFrame(f.levels,rw,rh);
  // Do not make the G2 transport the frame-rate limiter. Cap updates while
  // rotating; Glyph still receives the complete 576x288 Gray4 frame.
  if(g2Runtime&&!g2Busy&&(now-lastG2>50||!moving)){
    lastG2=now; g2Busy=true;
    g2Runtime.render({model,autoRotate:state.autoRotate,zoom:state.zoom,angle:state.ry},full).catch((e:any)=>console.warn('G2 render failed',e)).finally(()=>g2Busy=false);
  }
  document.querySelector('#readout')!.textContent=`${model.name} · ${stats()} · ${state.autoRotate?'AUTO':'MANUAL'} · Z ${state.zoom.toFixed(1)}× · ${moving?'288×144 FAST':'576×288 FULL'}`;
  requestAnimationFrame(draw);
}

function action(a:Action){state=applyAction(state,a);}
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')action('left');else if(e.key==='ArrowRight')action('right');else if(e.key==='ArrowUp')action('up');else if(e.key==='ArrowDown')action('down');else if(e.key===' ') {e.preventDefault();action('tap');} else if(e.key==='Escape') state={...state,autoRotate:true};});
canvas.addEventListener('click',()=>action('tap')); canvas.addEventListener('dblclick',()=>action('double'));

document.querySelector<HTMLInputElement>('#file')!.addEventListener('change',async e=>{
  const file=(e.target as HTMLInputElement).files?.[0]; if(!file)return;
  const status=document.querySelector('#status')!;
  try{
    const lower=file.name.toLowerCase();
    status.textContent=`Reading ${file.name} · ${(file.size/1024/1024).toFixed(0)} MB`;
    if(lower.endsWith('.obj')){
      const {parseOBJFileOptimized}=await import('./model/obj');
      model=await parseOBJFileOptimized(file,file.name,{maxTriangles:Number.POSITIVE_INFINITY,onProgress:p=>{status.textContent=`Reading ${file.name} · ${Math.round(p*100)}%`;}});
    } else if(lower.endsWith('.glb')){
      const b=await file.arrayBuffer(); const {parseGLB}=await import('./model/glb'); model=parseGLB(b,file.name);
    } else throw new Error('Only OBJ and GLB are supported.');
    state={...state,rx:0.18,ry:0.55,zoom:1.0};
    const cap=model.metadata?.triangleCap;
    status.textContent=`Loaded ${model.name}${cap&&((model.metadata?.originalTriangles??0)>cap)?` · capped at ${cap.toLocaleString()} triangles`:''}`;
  } catch(err){status.textContent=`Could not load model: ${(err as Error)?.message??String(err)}`;}
});

requestAnimationFrame(draw);
startG2Runtime(action).then(r=>{g2Runtime=r}).catch(e=>console.info('No Even bridge; browser preview remains active.',e));
