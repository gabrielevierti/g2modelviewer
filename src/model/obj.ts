import type { Model, Mesh, Triangle } from './types';

type Bounds = { minX:number; minY:number; minZ:number; maxX:number; maxY:number; maxZ:number; vertices:number; faces:number; triangles:number };

export function parseOBJ(text:string, name='model'):Model {
  const vertices:number[][]=[]; const faces:Triangle[]=[]; let originalFaces=0; let originalTriangles=0;
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim(); if(!line || line.startsWith('#')) continue;
    const p=line.split(/\s+/);
    if(p[0]==='v') vertices.push([+p[1],+p[2],+p[3]]);
    else if(p[0]==='f'){
      originalFaces++;
      const ids=p.slice(1).map(x=>parseInt(x.split('/')[0],10)).map(i=>i<0?vertices.length+i:i-1);
      originalTriangles+=Math.max(0,ids.length-2);
      for(let i=1;i<ids.length-1;i++) faces.push({a:ids[0],b:ids[i],c:ids[i+1]});
    }
  }
  orientOutward(vertices as any,faces);
  normalize(vertices);
  return {name,meshes:[{vertices:vertices as any,triangles:faces,name}],metadata:{originalVertices:vertices.length,originalFaces,originalTriangles,renderedTriangles:faces.length}};
}

async function* lines(file:File, chunkSize=4*1024*1024):AsyncGenerator<string>{
  const decoder=new TextDecoder('utf-8');
  let carry='';
  for(let offset=0; offset<file.size; offset+=chunkSize){
    const end=Math.min(file.size, offset+chunkSize);
    const buf=await file.slice(offset,end).arrayBuffer();
    carry += decoder.decode(buf,{stream:end<file.size});
    let nl=carry.indexOf('\n');
    while(nl>=0){ yield carry.slice(0,nl).replace(/\r$/,''); carry=carry.slice(nl+1); nl=carry.indexOf('\n'); }
  }
  carry += decoder.decode();
  if(carry) yield carry.replace(/\r$/,'');
}

function vertexIndex(token:string, count:number):number {
  const i=parseInt(token.split('/')[0],10);
  return i<0 ? count+i : i-1;
}

async function scan(file:File):Promise<Bounds>{
  let minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
  let vertices=0,faces=0,triangles=0;
  for await(const raw of lines(file)){
    const line=raw.trim(); if(!line || line[0]==='#') continue;
    const p=line.split(/\s+/);
    if(p[0]==='v'){
      const x=Number(p[1]),y=Number(p[2]),z=Number(p[3]);
      if(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(z)){
        minX=Math.min(minX,x); minY=Math.min(minY,y); minZ=Math.min(minZ,z);
        maxX=Math.max(maxX,x); maxY=Math.max(maxY,y); maxZ=Math.max(maxZ,z); vertices++;
      }
    } else if(p[0]==='f') { faces++; triangles+=Math.max(0,p.length-3); }
  }
  if(!vertices) throw new Error('OBJ contains no vertices.');
  return {minX,minY,minZ,maxX,maxY,maxZ,vertices,faces,triangles};
}

function normalize(vertices:number[][]):void {
  if(!vertices.length)return;
  let minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
  for(const v of vertices){minX=Math.min(minX,v[0]);minY=Math.min(minY,v[1]);minZ=Math.min(minZ,v[2]);maxX=Math.max(maxX,v[0]);maxY=Math.max(maxY,v[1]);maxZ=Math.max(maxZ,v[2]);}
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2,cz=(minZ+maxZ)/2,scale=2.2/Math.max(maxX-minX,maxY-minY,maxZ-minZ,1e-9);
  for(const v of vertices){v[0]=(v[0]-cx)*scale;v[1]=(v[1]-cy)*scale;v[2]=(v[2]-cz)*scale;}
}

function orientOutward(vertices:number[][], triangles:Triangle[]):void {
  // For a closed manifold, the signed volume tells us whether the OBJ winding is inverted.
  // We only flip the winding; vertex positions are never modified.
  let volume=0;
  for(const t of triangles){
    const a=vertices[t.a],b=vertices[t.b],c=vertices[t.c];
    if(!a||!b||!c)continue;
    volume += a[0]*(b[1]*c[2]-b[2]*c[1]) - a[1]*(b[0]*c[2]-b[2]*c[0]) + a[2]*(b[0]*c[1]-b[1]*c[0]);
  }
  if(volume<0) for(const t of triangles){const x=t.b;t.b=t.c;t.c=x;}
}

/**
 * Large-file OBJ loader with NO mesh simplification.
 * The original vertex positions and triangle topology are preserved exactly for
 * every triangle that is admitted by maxTriangles. The cap is the only geometry loss.
 */
export async function parseOBJFileOptimized(
  file:File,
  name=file.name,
  options:{maxTriangles?:number; onProgress?:(p:number)=>void}={}
):Promise<Model>{
  const maxTriangles=Number.POSITIVE_INFINITY;
  const bounds=await scan(file);
  options.onProgress?.(.18);

  // Allocate the original vertex set, not a clustered/decimated one.
  const vx=new Float64Array(bounds.vertices),vy=new Float64Array(bounds.vertices),vz=new Float64Array(bounds.vertices);
  const triangles:Triangle[]=[];
  // Accumulate normals from the COMPLETE source mesh, not only the render cap.
  // This keeps shading correct even when the renderer draws a triangle subset.
  const normalAccum=new Float64Array(bounds.vertices*3);
  let sourceIndex=0;
  let originalFaceIndex=0;
  let acceptedTriangleIndex=0;

  // The cap is a render budget, not mesh simplification. Keep a contiguous prefix
  // of the source topology rather than sparse sampling: sparse triangles create
  // holes and the model starts looking like a wireframe.
  const triangleBudget=bounds.triangles;

  let sourceTriangleIndex=0;
  let fullVolume=0;

  for await(const raw of lines(file)){
    const line=raw.trim(); if(!line || line[0]==='#') continue;
    const p=line.split(/\s+/);
    if(p[0]==='v'){
      vx[sourceIndex]=Number(p[1]);vy[sourceIndex]=Number(p[2]);vz[sourceIndex]=Number(p[3]);sourceIndex++;
    } else if(p[0]==='f' && p.length>=4){
      originalFaceIndex++;
      const ids=p.slice(1).map(t=>vertexIndex(t,sourceIndex));
      for(let i=1;i<ids.length-1;i++){
        const a=ids[0],b=ids[i],c=ids[i+1];
        const idx=sourceTriangleIndex++;
        if(a<0||b<0||c<0||a>=sourceIndex||b>=sourceIndex||c>=sourceIndex) continue;
        const ax=vx[a],ay=vy[a],az=vz[a],bx=vx[b],by=vy[b],bz=vz[b],cx=vx[c],cy=vy[c],cz=vz[c];
        const abx=bx-ax, aby=by-ay, abz=bz-az;
        const acx=cx-ax, acy=cy-ay, acz=cz-az;
        const nx=aby*acz-abz*acy, ny=abz*acx-abx*acz, nz=abx*acy-aby*acx;
        normalAccum[a*3]+=nx; normalAccum[a*3+1]+=ny; normalAccum[a*3+2]+=nz;
        normalAccum[b*3]+=nx; normalAccum[b*3+1]+=ny; normalAccum[b*3+2]+=nz;
        normalAccum[c*3]+=nx; normalAccum[c*3+1]+=ny; normalAccum[c*3+2]+=nz;
        fullVolume += ax*(by*cz-bz*cy) - ay*(bx*cz-bz*cx) + az*(bx*cy-by*cx);
        if(acceptedTriangleIndex<triangleBudget){
          triangles.push({a,b,c});
          acceptedTriangleIndex++;
        }
      }
    }
    if(sourceIndex%100000===0) options.onProgress?.(.18+.72*(sourceIndex/Math.max(1,bounds.vertices)));
  }

  const vertices:number[][]=new Array(bounds.vertices);
  let minX=Infinity,minY=Infinity,minZ=Infinity,maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
  for(let i=0;i<bounds.vertices;i++){minX=Math.min(minX,vx[i]);minY=Math.min(minY,vy[i]);minZ=Math.min(minZ,vz[i]);maxX=Math.max(maxX,vx[i]);maxY=Math.max(maxY,vy[i]);maxZ=Math.max(maxZ,vz[i]);}
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2,cz=(minZ+maxZ)/2;
  const scale=2.2/Math.max(maxX-minX,maxY-minY,maxZ-minZ,1e-9);
  for(let i=0;i<bounds.vertices;i++) vertices[i]=[(vx[i]-cx)*scale,(vy[i]-cy)*scale,(vz[i]-cz)*scale];

  // Orient the retained winding using the signed volume of the COMPLETE source mesh.
  // This avoids letting the triangle cap change the inside/outside decision.
  if(fullVolume<0){
    for(const t of triangles){const x=t.b;t.b=t.c;t.c=x;}
    for(let i=0;i<normalAccum.length;i++) normalAccum[i]*=-1;
  }
  const vertexNormals=new Float32Array(bounds.vertices*3);
  for(let i=0;i<bounds.vertices;i++){
    const x=normalAccum[i*3],y=normalAccum[i*3+1],z=normalAccum[i*3+2];
    const l=Math.hypot(x,y,z)||1;
    vertexNormals[i*3]=x/l; vertexNormals[i*3+1]=y/l; vertexNormals[i*3+2]=z/l;
  }
  options.onProgress?.(1);

  const mesh:Mesh={vertices:vertices as any,triangles,name,vertexNormals};
  return {name,meshes:[mesh],metadata:{originalVertices:bounds.vertices,originalFaces:bounds.faces,originalTriangles:bounds.triangles,renderedTriangles:triangles.length,triangleCap:maxTriangles}};
}
