import type { Model, Mesh } from '../model/types';
import { dot, norm, type Vec3 } from './math';

export interface RenderOptions {
  width:number;height:number;rx:number;ry:number;rz:number;zoom:number;
  shade?:boolean;
  backfaceCulling?:boolean;
}
export interface GrayFrame { width:number;height:number;levels:Uint8Array; }

type Prepared={normals:Float32Array};

export class SoftwareRenderer {
  private prepared=new WeakMap<Mesh,Prepared>();
  private light:Vec3=norm([0.56,0.46,0.70]);
  private view:Vec3=norm([0.18,-0.12,1]);
  private half:Vec3=norm([0.56+0.18,0.46-0.12,0.70+1]);
  private readonly bayer4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];

  private quantizeGray(lum:number,x:number,y:number):number{
    const clamped=Math.max(0,Math.min(15,lum));
    const base=Math.floor(clamped), frac=clamped-base;
    const threshold=(this.bayer4[(y&3)*4+(x&3)]+0.5)/16;
    return Math.max(0,Math.min(15,base+(frac>threshold?1:0)));
  }

  private prepare(mesh:Mesh):Prepared{
    const cached=this.prepared.get(mesh); if(cached) return cached;
    const n=mesh.vertexNormals
      ? new Float32Array(mesh.vertexNormals)
      : new Float32Array(mesh.vertices.length*3);
    if(!mesh.vertexNormals){
      for(const t of mesh.triangles){
        const a=mesh.vertices[t.a],b=mesh.vertices[t.b],c=mesh.vertices[t.c];
        const abx=b[0]-a[0], aby=b[1]-a[1], abz=b[2]-a[2];
        const acx=c[0]-a[0], acy=c[1]-a[1], acz=c[2]-a[2];
        const nx=aby*acz-abz*acy, ny=abz*acx-abx*acz, nz=abx*acy-aby*acx;
        for(const i of [t.a,t.b,t.c]){n[i*3]+=nx;n[i*3+1]+=ny;n[i*3+2]+=nz;}
      }
      for(let i=0;i<mesh.vertices.length;i++){
        const j=i*3,l=Math.hypot(n[j],n[j+1],n[j+2])||1;
        n[j]/=l;n[j+1]/=l;n[j+2]/=l;
      }
    }
    const p={normals:n}; this.prepared.set(mesh,p); return p;
  }

  render(model:Model,o:RenderOptions):GrayFrame{
    const {width,height}=o;
    const px=new Uint8Array(width*height);
    const depth=new Float32Array(width*height); depth.fill(Infinity);

    const totalVertices=model.meshes.reduce((n,m)=>n+m.vertices.length,0);
    const tv=new Float32Array(totalVertices*3);
    const tn=new Float32Array(totalVertices*3);
    const sx=new Float32Array(totalVertices), sy=new Float32Array(totalVertices), sz=new Float32Array(totalVertices);
    const visible=new Uint8Array(totalVertices);

    const cx=Math.cos(o.rx), sxr=Math.sin(o.rx), cy=Math.cos(o.ry), syr=Math.sin(o.ry), cz=Math.cos(o.rz), szr=Math.sin(o.rz);
    const f=1/Math.tan(Math.PI/6), scale=Math.min(width,height)*0.5;
    const meshes:{mesh:Mesh;offset:number}[]=[];
    let offset=0;

    // Transform every vertex once. Avoid allocating Vec3 arrays inside the frame loop.
    for(const mesh of model.meshes){
      const p=this.prepare(mesh); meshes.push({mesh,offset});
      for(let i=0;i<mesh.vertices.length;i++){
        const v=mesh.vertices[i], j=(offset+i)*3;
        // rotX -> rotY -> rotZ, expanded inline.
        const x0=v[0], y0=v[1]*cx-v[2]*sxr, z0=v[1]*sxr+v[2]*cx;
        const x1=x0*cy+z0*syr, y1=y0, z1=-x0*syr+z0*cy;
        const x=x1*cz-y1*szr, y=x1*szr+y1*cz, z=z1+3.7;
        tv[j]=x*o.zoom; tv[j+1]=y*o.zoom; tv[j+2]=z;
        const nx0=p.normals[i*3], ny0=p.normals[i*3+1]*cx-p.normals[i*3+2]*sxr, nz0=p.normals[i*3+1]*sxr+p.normals[i*3+2]*cx;
        const nx1=nx0*cy+nz0*syr, ny1=ny0, nz1=-nx0*syr+nz0*cy;
        tn[j]=nx1*cz-ny1*szr; tn[j+1]=nx1*szr+ny1*cz; tn[j+2]=nz1;
        if(z>0.05){
          sx[offset+i]=width*.5+(tv[j]*f/z)*scale;
          sy[offset+i]=height*.5-(tv[j+1]*f/z)*scale;
          sz[offset+i]=z;
          visible[offset+i]=1;
        }
      }
      offset+=mesh.vertices.length;
    }

    for(const md of meshes){
      const {mesh,offset}=md;
      for(const t of mesh.triangles){
        const ia=offset+t.a, ib=offset+t.b, ic=offset+t.c;
        if(!visible[ia]||!visible[ib]||!visible[ic]) continue;
        const ax=sx[ia], ay=sy[ia], bx=sx[ib], by=sy[ib], cxp=sx[ic], cyp=sy[ic];
        const area=(bx-ax)*(cyp-ay)-(by-ay)*(cxp-ax);
        // Back-face culling in screen space. With our Y-down framebuffer, positive
        // winding is the front side after projection. This skips hidden backside
        // triangles before entering the expensive pixel loop.
        if(o.backfaceCulling!==false && area<=0.05) continue;
        if(Math.abs(area)<0.05) continue;

        const minX=Math.max(0,Math.floor(Math.min(ax,bx,cxp))), maxX=Math.min(width-1,Math.ceil(Math.max(ax,bx,cxp)));
        const minY=Math.max(0,Math.floor(Math.min(ay,by,cyp))), maxY=Math.min(height-1,Math.ceil(Math.max(ay,by,cyp)));
        if(minX>maxX||minY>maxY) continue;
        const den=(by-cyp)*(ax-cxp)+(cxp-bx)*(ay-cyp);
        if(Math.abs(den)<1e-8) continue;

        const ja=ia*3,jb=ib*3,jc=ic*3;
        const axn=tn[ja],ayn=tn[ja+1],azn=tn[ja+2];
        const bxn=tn[jb],byn=tn[jb+1],bzn=tn[jb+2];
        const cxn=tn[jc],cyn=tn[jc+1],czn=tn[jc+2];
        const za=sz[ia],zb=sz[ib],zc=sz[ic];

        for(let y=minY;y<=maxY;y++){
          for(let x=minX;x<=maxX;x++){
            const w1=((by-cyp)*(x-cxp)+(cxp-bx)*(y-cyp))/den;
            const w2=((cyp-ay)*(x-cxp)+(ax-cxp)*(y-cyp))/den;
            const w3=1-w1-w2;
            if(w1<0||w2<0||w3<0) continue;
            const pi=y*width+x;
            const z=za*w1+zb*w2+zc*w3;
            if(z>=depth[pi]) continue;

            let lum=12;
            if(o.shade!==false){
              const nx=axn*w1+bxn*w2+cxn*w3, ny=ayn*w1+byn*w2+cyn*w3, nz=azn*w1+bzn*w2+czn*w3;
              const inv=1/(Math.hypot(nx,ny,nz)||1);
              const n0=nx*inv,n1=ny*inv,n2=nz*inv;
              const diffuse=Math.max(0,n0*this.light[0]+n1*this.light[1]+n2*this.light[2]);
              const spec=Math.pow(Math.max(0,n0*this.half[0]+n1*this.half[1]+n2*this.half[2]),24);
              const fill=Math.max(0,n0*this.view[0]+n1*this.view[1]+n2*this.view[2]);
              const fog=1-Math.max(0,Math.min(1,(z-2.8)/3));
              let light01=(0.085+0.78*diffuse+0.15*fill+0.025*spec)*(0.88+0.12*fog);
              light01=Math.pow(Math.max(0,Math.min(1,light01)),0.82);
              light01=Math.max(0,Math.min(1,(light01-.5)*1.28+.5));
              lum=15*light01;
            }
            depth[pi]=z; px[pi]=this.quantizeGray(lum,x,y);
          }
        }
      }
    }
    return {width,height,levels:px};
  }
}

export function grayToRgba(frame:GrayFrame,scale=1):Uint8ClampedArray{
  const out=new Uint8ClampedArray(frame.width*scale*frame.height*scale*4),w=frame.width*scale;
  for(let y=0;y<frame.height;y++)for(let x=0;x<frame.width;x++){
    const g=frame.levels[y*frame.width+x]*17;
    for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){
      const i=((y*scale+sy)*w+(x*scale+sx))*4;
      out[i]=g;out[i+1]=Math.min(255,g+Math.round(g*.35));out[i+2]=Math.round(g*.75);out[i+3]=255;
    }
  }
  return out;
}
