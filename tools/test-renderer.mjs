// Lightweight source-level smoke test. Full TypeScript/runtime tests should be
// run after `npm install` in a networked environment.
import fs from 'node:fs';
const required=['src/renderer/software.ts','src/model/obj.ts','src/model/glb.ts','src/glyph/ui.ts','src/main.ts','app.json'];
for(const f of required) if(!fs.existsSync(f)) throw new Error(`Missing ${f}`);
console.log('G2 Model Viewer smoke test: required source files present.');
