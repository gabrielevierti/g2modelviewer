import { GlyphFrame, TILE_QUADRANTS } from '@gabrielevierti/glyph';
import type { Model } from '../model/types';

export interface ViewerUiState { model:Model; autoRotate:boolean; zoom:number; angle:number; }

export function createViewerFrame(): GlyphFrame {
  return new GlyphFrame({ width:576, height:288, supersample:2, surface:'outline', tileLayout:TILE_QUADRANTS });
}

function fmt(n:number|undefined){return (n??0).toLocaleString('en-US');}

export function paintViewerFrame(frame:GlyphFrame, state:ViewerUiState, modelLevels:Uint8Array):GlyphFrame {
  const m=state.model, meta=m.metadata;
  const rendered=m.meshes.reduce((n,x)=>n+x.triangles.length,0);
  frame.raster.clear(0);
  frame.draw((g)=>{
    g.blit(modelLevels,576,288,0,0);

    // Clean 576x288 composition: narrow top bar, model in the central field,
    // compact telemetry at upper-right, and one restrained footer.
    g.hline(20,556,25,2,1);
    g.text('G2 MODEL VIEWER',24,10,{size:11,weight:800},13);
    g.text(state.autoRotate?'AUTO':'MANUAL',552,12,{size:8,weight:800},state.autoRotate?12:7,'right','top');

    const title=m.name.length>23?m.name.slice(0,20)+'…':m.name;
    g.text(title.toUpperCase(),552,39,{size:8,weight:700},11,'right','top');
    g.hline(405,556,51,1,1);
    g.text(`Vertices: ${fmt(meta?.originalVertices ?? m.meshes.reduce((n,x)=>n+x.vertices.length,0))}`,552,64,{size:8,weight:600},9,'right','top');
    g.text(`Faces: ${fmt(meta?.originalFaces ?? 0)}`,552,78,{size:8,weight:600},9,'right','top');
    g.text(`Triangles: ${fmt(rendered)}${meta?.triangleCap&&((meta.originalTriangles??rendered)>meta.triangleCap)?' / '+fmt(meta.triangleCap):''}`,552,92,{size:8,weight:700},11,'right','top');

    // Bottom control strip stays visually subordinate to the model.
    g.hline(36,540,259,1,1);
    g.text(`ZOOM ${state.zoom.toFixed(1)}×`,40,270,{size:8,weight:700},10);
    g.text('← → ROTATE   ↑ ↓ ZOOM   TAP AUTO   DOUBLE TAP RESET',182,270,{size:7,weight:600},8,'left','top');
  });
  return frame;
}

export function makeGlyphFrame(state:ViewerUiState, modelLevels:Uint8Array):GlyphFrame {
  return paintViewerFrame(createViewerFrame(),state,modelLevels);
}
