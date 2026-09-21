import type { Vec3 } from '../renderer/math';
export interface Triangle { a:number; b:number; c:number; }
export interface Mesh { vertices:Vec3[]; triangles:Triangle[]; name:string; vertexNormals?:Float32Array; }
export interface Model { meshes:Mesh[]; name:string; metadata?: { originalVertices?:number; originalFaces?:number; originalTriangles?:number; renderedTriangles?:number; triangleCap?:number; }; }
