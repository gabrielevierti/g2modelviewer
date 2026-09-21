import { GlyphRuntime } from '@gabrielevierti/glyph/runtime';
import { paintViewerFrame, createViewerFrame, type ViewerUiState } from '../glyph/ui';
import type { Action } from './controls';

export async function startG2Runtime(onAction:(a:Action)=>void){
  const runtime = new GlyphRuntime({ timeoutMs: 2500 });
  await runtime.start();
  const frame = createViewerFrame();
  runtime.onInput((event:any)=>{
    switch(event?.type){
      case 'scroll-up': onAction('up'); break;
      case 'scroll-down': onAction('down'); break;
      case 'double-tap': onAction('double'); break;
      case 'tap': onAction('tap'); break;
    }
  });
  return { async render(state:ViewerUiState,levels:Uint8Array){ paintViewerFrame(frame,state,levels); await runtime.render(frame.toFrame()); } };
}
