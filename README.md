# G2 Model Viewer

A performance-oriented 3D OBJ/GLB viewer for Even Realities G2 using Glyph.

## OBJ loading

The viewer does **not** decimate, cluster, weld, or otherwise simplify OBJ geometry. Vertex positions and triangle topology are preserved for the triangles that are rendered.

Large OBJ files are read in 4 MB chunks for Safari/WebKit compatibility. The only geometry reduction is a deterministic render triangle cap of **12,000 triangles**. When an OBJ contains more triangles than the cap, triangles are sampled across the complete source mesh rather than taking only the first 12,000 faces.

The original vertex and face counts remain available in the HUD. The triangle count shown as rendered is the number actually sent to the software renderer.

The loader also detects inverted closed-mesh winding using the signed volume of the complete source mesh and flips the retained triangle winding when required. No vertex positions are changed.

## Renderer

The software renderer is designed around the G2's 576×288 display:

- one vertex transform per frame instead of one transform per triangle corner
- cached area-weighted vertex normals
- Gouraud-style grayscale lighting
- Z-buffer visibility; no painter sort
- back-face culling
- 16-level grayscale output
- fixed 12k triangle render budget
- no wireframe mode

Controls: left/right rotate, up/down zoom, tap toggles auto orbit, double tap resets the view.
