import { _vec3 } from "./math/mathvec3";
import { _matr4 } from "./math/mathmat4";


export class surface {
  Name: string = "Default";
  Ka: _vec3 = _vec3.set(0.1, 0.1, 0.1);
  Kd: _vec3 = _vec3.set(0.9, 0.9, 0.9);
  Ks: _vec3 = _vec3.set(0.3, 0.3, 0.3);
  Ph: number = 30;
  Kr: _vec3 = _vec3.set(0, 0, 0);
  Kt: _vec3 = _vec3.set(0, 0, 0);
  RefractionCoef: number = 0;
  Decay: number = 0;
  GetArray() {
    return [
      ..._vec3.vec3(this.Ka),
      1,
      ..._vec3.vec3(this.Kd),
      1,
      ..._vec3.vec3(this.Ks),
      this.Ph,
      ..._vec3.vec3(this.Kr),
      this.RefractionCoef,
      ..._vec3.vec3(this.Kt),
      this.Decay
    ];
  }
}

export class shape {
  Obj: number[][] = _matr4.identity(); 
  Matrix: number[][] = _matr4.identity();
  TypeShape: number = 0;
  Material: number = 0; 
  GetArray() {
    return [..._matr4.toarr(this.Obj), ..._matr4.toarr(this.Matrix), this.TypeShape, this.Material, 0, 0];
  }
}

export let Shapes: shape[] = [];
export let Surfaces: surface[] = [];


export function GetArrayObjects() {
  let Result = [Shapes.length, 0, 0, 0];
  for (let element of Shapes) {
    Result = Result.concat(element.GetArray());
  }
  return new Float32Array(Result);
}

export function GetArraySurfaces() {
  let Result = [Surfaces.length, 0, 0, 0];
  for (let element of Surfaces) {
    Result = Result.concat(element.GetArray());
  }
  return new Float32Array(Result);
}
