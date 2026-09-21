export type Vec3 = [number,number,number];
export type Vec2 = [number,number];

export const v3=(x=0,y=0,z=0):Vec3=>[x,y,z];
export const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
export const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export const mul=(a:Vec3,s:number):Vec3=>[a[0]*s,a[1]*s,a[2]*s];
export const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const len=(a:Vec3)=>Math.hypot(a[0],a[1],a[2]);
export const norm=(a:Vec3):Vec3=>{const l=len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]};
export function rotX(p:Vec3,a:number):Vec3{const c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c]}
export function rotY(p:Vec3,a:number):Vec3{const c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c]}
export function rotZ(p:Vec3,a:number):Vec3{const c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]]}
export function transform(p:Vec3,rx:number,ry:number,rz:number):Vec3{return rotZ(rotY(rotX(p,rx),ry),rz)}

// The G2 framebuffer is 576x288 (2:1). Use the same world-to-screen scale
// for X and Y; using w/2 for X and h/2 for Y distorts every model horizontally.
export function project(p:Vec3,w:number,h:number,fov:number,near=0.05){
  const z=p[2]; if(z<=near)return{x:0,y:0,z,visible:false};
  const f=1/Math.tan(fov*0.5);
  const s=Math.min(w,h)*0.5;
  return{x:w*0.5+(p[0]*f/z)*s,y:h*0.5-(p[1]*f/z)*s,z,visible:true};
}
