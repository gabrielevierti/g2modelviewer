# G2ModelViewer

A software 3D renderer for [Even Realities G2](https://www.evenrealities.com/) that turns OBJ and GLB models into a 576×288, 16-level grayscale framebuffer using [Glyph](https://github.com/gabrielevierti/glyph).

G2ModelViewer is built around the constraints of the G2 rather than around a conventional desktop 3D pipeline: geometry is transformed and rasterized in software, visibility is resolved with a Z-buffer, the result is reduced to Gray4, and Glyph handles the final framebuffer/tile transport to the glasses.

The goal is simple: take a normal 3D asset and make it inspectable on a pair of G2 glasses without requiring a full 3D engine on the device.

## What it does

- Loads `.OBJ` and `.GLB` models.
- Handles large OBJ files in 4 MB chunks for Safari/WebKit compatibility.
- Preserves the source vertex set and triangle topology up to the renderer's explicit triangle budget.
- Uses a deterministic **40,000-triangle render budget** for large OBJ files.
- Samples the source mesh across its complete triangle sequence instead of taking only an arbitrary visible fragment.
- Computes area-weighted vertex normals for smooth grayscale shading.
- Uses back-face culling before rasterization.
- Uses a Z-buffer rather than painter's sorting for visibility.
- Renders directly to the G2's **576×288** logical framebuffer.
- Quantizes the final image to **16 Gray4 levels** with ordered dithering.
- Sends the resulting frame through Glyph's tile-based runtime.
- Supports automatic orbit and direct G2 controls.
- Includes a browser preview and Even Hub simulator workflow.

## Why a software renderer

The G2 is not a conventional 3D graphics target. The display ultimately receives a small grayscale image rather than a stream of vertices, textures and GPU commands.

G2ModelViewer therefore keeps the 3D pipeline on the host runtime:

```text
OBJ / GLB
    │
    ▼
Geometry loader
    │
    ├── vertices
    ├── triangles
    └── vertex normals
    │
    ▼
Software renderer
    │
    ├── model transform
    ├── projection
    ├── back-face culling
    ├── triangle rasterization
    └── Z-buffer
    │
    ▼
576 × 288 grayscale framebuffer
    │
    ▼
Gray4 resolve + ordered dithering
    │
    ▼
GlyphFrame
    │
    ▼
GlyphRuntime
    │
    ▼
Even Hub → G2
```

This also keeps the renderer deterministic and testable without requiring a graphics API on the glasses themselves.

## The display is the renderer's target

The G2 framebuffer is only **576×288 pixels** with **16 grayscale levels**. That changes how a 3D renderer needs to spend its time.

There is little value in producing a conventional high-resolution RGB image and then throwing most of it away. G2ModelViewer rasterizes directly at the logical display resolution and keeps the grayscale pipeline explicit all the way to Glyph.

The final pixel value is an integer from `0` to `15`:

```text
0  ───────────────────────────────  15
black                              white
```

The renderer keeps lighting continuous until the final Gray4 resolve. A 4×4 ordered dither distributes fractional intensity between neighbouring pixels so curved surfaces and shallow gradients retain more visual information after quantization.

## OBJ loading

Large OBJ files are read in **4 MB chunks** rather than through `File.stream()`. This avoids relying on browser stream behaviour that is inconsistent in some Safari/WebKit environments.

The loader performs two passes for large files:

1. Scan the file to determine vertex, face and triangle counts.
2. Parse the geometry while accumulating normals and retaining the triangles that fit the render budget.

The source vertex coordinates are normalized around the model's bounding-box centre so models with arbitrary real-world units fit the G2 camera automatically.

### Triangle budget

The renderer currently uses a deterministic maximum of **40,000 rendered triangles** for the large-file OBJ path.

This is a rendering budget, not a geometric modelling operation. The loader does not weld vertices, decimate the mesh, generate a new topology, or alter vertex positions. The original source counts remain available as metadata, while the rendered triangle count reports the geometry actually submitted to the software rasterizer.

The distinction is visible in the HUD:

```text
V 850,296 · F 420,208 · T 40,000/840,416
```

where `V` and `F` describe the original source and `T` describes the retained render set.

## Winding and normals

OBJ files do not guarantee a consistent outward winding order. G2ModelViewer calculates the signed volume of the complete source triangle set and uses it to detect globally inverted closed meshes.

When inversion is detected, the retained triangle winding is flipped. Vertex positions are never changed.

Normals are accumulated as area-weighted face normals and normalized once per vertex. The renderer then transforms those normals with the model rotation and interpolates them across each triangle for smooth lighting.

## Software renderer

The renderer is deliberately small and specialized for the G2 rather than being a general-purpose 3D engine.

### Vertex processing

Each vertex is transformed once per frame and projected into screen space. Triangle rasterization reuses those projected vertices instead of transforming the same vertex independently for every face.

### Back-face culling

Triangles facing away from the camera are discarded before their pixel bounding boxes are evaluated. This is especially important for closed objects, where a large fraction of the source geometry can be hidden on the opposite side of the surface.

Culling is a render-time optimization: it does not remove triangles from the loaded model.

### Z-buffer

Visible surfaces are resolved with a depth buffer. Each covered pixel stores the depth of the nearest triangle encountered so far.

There is no painter's sort and no need to reorder the complete triangle list every frame.

### Lighting

Lighting is grayscale and intentionally tuned for Gray4 rather than for a conventional RGB display.

The renderer combines:

- a directional key light,
- diffuse response,
- a small fill term,
- a restrained specular component,
- view-dependent fill,
- distance attenuation,
- contrast shaping before Gray4 quantization.

The result is kept away from an excessive ambient floor so surface relief remains visible after the 16-level conversion.

## Gray4 output

The renderer produces a continuous luminance value and resolves it to one of 16 display levels only at the end of the pipeline.

A 4×4 Bayer matrix provides ordered dithering:

```text
 0   8   2  10
12   4  14   6
 3  11   1   9
15   7  13   5
```

This is particularly useful for large surfaces where a direct 16-step quantization would otherwise produce obvious tonal bands.

The same Gray4 framebuffer is used for the browser preview and for the Glyph frame, keeping the preview representative of the actual G2 output.

## Glyph integration

G2ModelViewer uses Glyph as the display and transport layer rather than implementing its own image-container protocol.

The application creates a 576×288 `GlyphFrame` with the G2's quadrant tile layout. The rendered Gray4 image is placed into that framebuffer and passed to `GlyphRuntime`.

```text
SoftwareRenderer
      │
      │ Gray4 levels
      ▼
GlyphFrame
      │
      │ tile + diff + pack
      ▼
GlyphRuntime
      │
      ▼
Even Hub
      │
      ▼
G2
```

This separation is intentional: the 3D renderer knows about geometry and pixels; Glyph knows about framebuffer composition and G2 transport.

## Browser preview

The browser preview renders the same 576×288 Gray4 image at 2× for inspection. Image smoothing is disabled so the logical display pixels remain visible instead of being interpolated by the browser.

The preview also exposes the model statistics and current rendering state.

Typical readout:

```text
model.obj · V 125,420 · F 84,210 · T 40,000/164,832 · AUTO · Z 1.2×
```

## Controls

### Browser / keyboard

| Input | Action |
| --- | --- |
| `←` | Rotate left |
| `→` | Rotate right |
| `↑` | Zoom in |
| `↓` | Zoom out |
| `Space` | Toggle automatic orbit |
| Double click | Reset view |

### G2

| Input | Action |
| --- | --- |
| Scroll up | Zoom in |
| Scroll down | Zoom out |
| Tap | Toggle automatic orbit |
| Double tap | Reset view |

## Install

Requires Node.js 20+.

```bash
git clone https://github.com/gabrielevierti/g2-model-viewer.git
cd g2-model-viewer
npm install
npm run dev
```

Open the Vite URL shown in the terminal to use the browser preview.

## Load a model

Use the file picker and select either:

```text
model.obj
```

or:

```text
model.glb
```

OBJ loading reports progress because large files can require several seconds to scan and parse.

GLB files are parsed directly from their binary container and converted into the same internal `Model → Mesh → Triangle` representation used by the OBJ renderer.

## Even Hub simulator

Run the browser application:

```bash
npm run dev
```

Then start the simulator in another terminal:

```bash
npm run sim
```

For simulator automation:

```bash
npm run sim:automation
```

The browser preview remains useful without an Even device attached; the runtime connection is optional during local development.

## On device

Host Vite on the local network:

```bash
npm run host
```

Then use the Even development workflow to open the application on a paired G2.

To produce an Even Hub package:

```bash
npm run pack
```

This produces:

```text
g2-model-viewer.ehpk
```

## Project structure

```text
src/
├── app/
│   ├── controls.ts       input → viewer actions
│   └── runtime.ts        Even/Glyph runtime bridge
│
├── glyph/
│   └── ui.ts             G2 framebuffer composition
│
├── model/
│   ├── types.ts          internal mesh/model types
│   ├── obj.ts            large-file OBJ loader
│   ├── glb.ts            GLB loader
│   └── sample.ts         development sample geometry
│
├── renderer/
│   ├── math.ts           transforms and projection
│   └── software.ts       software rasterizer
│
└── main.ts               browser application and render loop
```

The renderer is intentionally independent from the Even runtime. This makes the expensive geometry and rasterization path testable in a normal browser before any transport to the glasses is involved.

## Performance model

There are two different costs in a viewer like this:

```text
geometry cost
    │
    ├── vertex transforms
    ├── triangle setup
    └── rasterization

transport cost
    │
    ├── framebuffer → tiles
    ├── changed-tile detection
    └── Even Hub / G2 transfer
```

G2ModelViewer addresses both separately.

The software renderer reduces geometry work with cached normals, one transform per vertex and back-face culling. The final framebuffer is handed to Glyph, which owns the tile diffing and transport path.

This separation also makes profiling easier: a slow frame can be investigated as renderer work or transport work instead of treating the entire pipeline as one opaque operation.

## Testing

Typecheck the project:

```bash
npm run typecheck
```

Build the application:

```bash
npm run build
```

Run the renderer test:

```bash
npm run test:renderer
```

## Known limitations

- The software rasterizer is CPU-bound. Very dense models can still become expensive, particularly when zoomed in because projected triangle bounding boxes cover more pixels.
- The OBJ render budget currently limits the number of triangles submitted to the renderer for large-file loading.
- The render budget is not a mesh decimator: retained triangles keep their original indices and vertex positions, but a partial triangle set can still expose holes in models whose surfaces are distributed across the source topology.
- OBJ material, texture and MTL data are not used by the grayscale renderer.
- GLB rendering currently focuses on geometry rather than a full PBR material pipeline.
- The renderer targets the G2's small grayscale framebuffer rather than desktop-quality 3D output.
- Runtime behaviour depends on the Even Hub/G2 environment when the application is actually connected to the glasses.

## Roadmap

The renderer architecture leaves room for several optimizations without changing the G2-facing framebuffer API:

- more aggressive screen-space triangle rejection,
- frustum clipping before rasterization,
- bounding-box rejection,
- lower-resolution interactive rendering followed by full-resolution idle rendering,
- tighter typed-array based transform loops,
- adaptive render budgets based on projected triangle cost,
- renderer profiling and frame-time instrumentation.

The important boundary remains the same: the model loader and software renderer produce pixels; Glyph turns those pixels into a G2 application frame.

## License

MIT.
