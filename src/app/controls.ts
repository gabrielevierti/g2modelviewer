export type Action='left'|'right'|'up'|'down'|'tap'|'double';
export interface ViewerState { autoRotate:boolean; rx:number; ry:number; zoom:number; }

export function applyAction(s:ViewerState,a:Action):ViewerState{
  if(a==='tap') return {...s,autoRotate:!s.autoRotate};
  if(a==='double') return {...s,rx:0.18,ry:0.55,zoom:1.0,autoRotate:true};
  if(a==='left') return {...s,autoRotate:false,ry:s.ry-0.28};
  if(a==='right') return {...s,autoRotate:false,ry:s.ry+0.28};
  if(a==='up') return {...s,zoom:Math.min(1.8,s.zoom+0.12)};
  if(a==='down') return {...s,zoom:Math.max(0.55,s.zoom-0.12)};
  return s;
}
