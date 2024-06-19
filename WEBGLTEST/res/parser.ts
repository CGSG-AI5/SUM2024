import { _vec3 } from "../math/mathvec3";
import { Shapes, Surfaces, shape, surface } from "../objects";

import { Ubo_set1_data } from "../main";
import { _matr4 } from "../math/mathmat4";

function ReadVec3fromString(Str: string) {
  let h: number[];
  if (Str[0] != "{" || Str[Str.length - 1] != "}") return null;
  h = Str.slice(1, Str.length - 1)
    .split(",")
    .map(Number);

  if (h.length < 3) return null;

  return _vec3.set(h[0], h[1], h[2]);
}

export function parser(Txt: string) {
  Shapes.length = 0;
  Surfaces.length = 1;
  let Name: string;
  let arrayOfStrings = Txt.split("\n");
  for (let i = 0; i < arrayOfStrings.length; i++) {
    if (arrayOfStrings[i][0] == "/" && arrayOfStrings[i][1] == "/") continue;
    let words = arrayOfStrings[i].split(" ");
    if (words.length == 1) continue;
    let Type = words[0];
    if (Type == "scene") {
      if (words.length != 6) continue;
      let x: _vec3 | null;
      x = ReadVec3fromString(words[1]);
      if (x == null) continue;
      Ubo_set1_data.AmbientColor = x;

      x = ReadVec3fromString(words[2]);
      if (x == null) continue;
      Ubo_set1_data.BackgroundColor = x;

      Ubo_set1_data.RefractionCoef = Number(words[3]);
      Ubo_set1_data.Decay = Number(words[4]);
      Ubo_set1_data.MaxRecLevel = Number(words[5]);
    } else if (Type == "surface") {
      if (words.length != 10) continue;
      let x: _vec3 | null;
      let Surf = new surface();
      Surf.Name = words[1];

      let flag = false;
      for (let element of Surfaces) {
        if (element.Name == Surf.Name) {
          flag = true;
          break;
        }
      }
      if (flag) continue;

      x = ReadVec3fromString(words[2]);
      if (x == null) continue;
      Surf.Ka = x;

      x = ReadVec3fromString(words[3]);
      if (x == null) continue;
      Surf.Kd = x;

      x = ReadVec3fromString(words[4]);
      if (x == null) continue;
      Surf.Ks = x;

      Surf.Ph = Number(words[5]);

      x = ReadVec3fromString(words[6]);
      if (x == null) continue;
      Surf.Kr = x;

      x = ReadVec3fromString(words[7]);
      if (x == null) continue;
      Surf.Kt = x;

      Surf.RefractionCoef = Number(words[8]);
      Surf.Decay = Number(words[9]);

      Surfaces.push(Surf);
    } else {
      let id = -1;
      let x: _vec3 | null;
      let Sph = new shape();

      if (Type == "sphere") {
        if (words.length != 6) continue;
        Sph.Obj[0][0] = Number(words[1]);
        Sph.TypeShape = 0;
        id = 2;
      }
      if (Type == "box") {
        if (words.length != 6) continue;
        x = ReadVec3fromString(words[1]);
        if (x == null) continue;

        Sph.Obj[0][0] = x.x;
        Sph.Obj[0][1] = x.y;
        Sph.Obj[0][2] = x.z;

        Sph.TypeShape = 1;
        id = 2;
      }
      if (Type == "round_box") {
        if (words.length != 7) continue;
        x = ReadVec3fromString(words[1]);
        if (x == null) continue;

        Sph.Obj[0][0] = x.x;
        Sph.Obj[0][1] = x.y;
        Sph.Obj[0][2] = x.z;
        Sph.Obj[0][3] = Number(words[2]);

        Sph.TypeShape = 2;
        id = 3;
      }
      if (Type == "torus") {
        if (words.length != 7) continue;
        Sph.Obj[0][0] = Number(words[1]);
        Sph.Obj[0][1] = Number(words[2]);

        Sph.TypeShape = 3;
        id = 3;
      }
      if (Type == "cylinder") {
        if (words.length != 6) continue;
        x = ReadVec3fromString(words[1]);
        if (x == null) continue;

        Sph.Obj[0][0] = x.x;
        Sph.Obj[0][1] = x.y;
        Sph.Obj[0][2] = x.z;

        Sph.TypeShape = 4;
        id = 2;
      }
      if (id != -1) {
        let Scale: number[][];
        let Rot: number[][];
        let Trans: number[][];

        x = ReadVec3fromString(words[id]);
        if (x == null) continue;
        Trans = _matr4.translate(x);

        x = ReadVec3fromString(words[id + 1]);
        if (x == null) continue;
        Rot = _matr4.mulmatr(
          _matr4.mulmatr(_matr4.rotateY(x.x), _matr4.rotateY(x.y)),
          _matr4.rotateZ(x.z)
        );

        x = ReadVec3fromString(words[id + 2]);
        if (x == null) continue;
        Scale = _matr4.scale(x);

        Sph.Matrix = _matr4.inverse(
          _matr4.mulmatr(_matr4.mulmatr(Scale, Rot), Trans)
        );

        let index = 0;
        for (let element of Surfaces) {
          if (words[id + 3] == element.Name) {
            Sph.Material = index;
          }
          index++;
        }
        Shapes.push(Sph);
      }
    }
  }
}
