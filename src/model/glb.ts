import type { Model, Mesh } from './types';

const TYPE_SIZE:Record<number,number>={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const NUM_COMP:Record<string,number>={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};

function readComponent(view:DataView,off:number,componentType:number){
  switch(componentType){
    case 5120:return view.getInt8(off);
    case 5121:return view.getUint8(off);
    case 5122:return view.getInt16(off,true);
    case 5123:return view.getUint16(off,true);
    case 5125:return view.getUint32(off,true);
    case 5126:return view.getFloat32(off,true);
    default:throw new Error(`Unsupported GLB componentType ${componentType}`);
  }
}

export function parseGLB(buffer:ArrayBuffer,name='model'):Model{
  const view=new DataView(buffer);
  if(view.getUint32(0,true)!==0x46546c67) throw new Error('Not a GLB file');
  let off=12,json:any=null,bin:Uint8Array|undefined;
  while(off<view.byteLength){
    const len=view.getUint32(off,true),type=view.getUint32(off+4,true); off+=8;
    const chunk=new Uint8Array(buffer,off,len); off+=len;
    if(type===0x4e4f534a) json=JSON.parse(new TextDecoder().decode(chunk));
    else if(type===0x004e4942) bin=chunk;
  }
  if(!json||!bin) throw new Error('GLB missing JSON or BIN chunk');
  const buffers=[bin];
  const access=(idx:number)=>json.accessors[idx];
  const viewDef=(idx:number)=>json.bufferViews[idx];
  const getAccessor=(idx:number):number[][]=>{
    const a=access(idx),v=viewDef(a.bufferView), comps=NUM_COMP[a.type], size=TYPE_SIZE[a.componentType]*comps;
    const stride=v.byteStride??size, base=(v.byteOffset??0)+(a.byteOffset??0), out:number[][]=[];
    const data=buffers[a.buffer??0]; const dv=new DataView(data.buffer,data.byteOffset,data.byteLength);
    for(let i=0;i<a.count;i++){
      const row:number[]=[]; const start=base+i*stride;
      for(let c=0;c<comps;c++) row.push(readComponent(dv,start+c*TYPE_SIZE[a.componentType],a.componentType));
      out.push(row);
    }
    return out;
  };
  const meshes:Mesh[]=[];
  for(const gm of json.meshes??[]){
    for(const prim of gm.primitives??[]){
      if(prim.mode!==undefined&&prim.mode!==4) continue;
      if(prim.attributes?.POSITION===undefined) continue;
      const pos=getAccessor(prim.attributes.POSITION).map(v=>[v[0],v[1],v[2]] as [number,number,number]);
      let ids:number[];
      if(prim.indices!==undefined) ids=getAccessor(prim.indices).map(v=>v[0]);
      else ids=Array.from({length:pos.length},(_,i)=>i);
      const triangles=[]; for(let i=0;i+2<ids.length;i+=3) triangles.push({a:ids[i],b:ids[i+1],c:ids[i+2]});
      meshes.push({vertices:pos,triangles,name:gm.name??'mesh'});
    }
  }
  return {name,meshes};
}
