import { _vec3 } from "./math/mathvec3";

class surface {
  Ka: _vec3 = _vec3.set(0, 0, 0);
  Kd: _vec3 = _vec3.set(0, 0, 0);
  Ks: _vec3 = _vec3.set(0, 0, 0);
  Ph: number = 0;
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

export class sphere {
  Name: string = "";
  R: number = 0;
  P: _vec3 = _vec3.set(0, 0, 0);
  Surf: surface = new surface();
  GetArray() {
    return [..._vec3.vec3(this.P), this.R].concat(this.Surf.GetArray());
  }
}

export let Spheres: sphere[] = [];

export function GetArraySpheres() {
  let Result = [Spheres.length, 0, 0, 0];
  for (let element of Spheres) {
    Result = Result.concat(element.GetArray());
  }
  return new Float32Array(Result);
}
