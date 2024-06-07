import { _vec3 } from "../math/mathvec3";
import { Spheres, sphere } from "../objects";

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
  Spheres.length = 0;
  let Name: string;
  let arrayOfStrings = Txt.split("\n");
  for (let i = 0; i < arrayOfStrings.length; i++) {
    if (arrayOfStrings[i][0] == "/" && arrayOfStrings[i][1] == "/") continue;
    let words = arrayOfStrings[i].split(" ");
    Name = words[0];
    if (words.length == 1) continue;
    let Type = words[1];
    if (Type == "sphere") {
      let x: _vec3 | null;
      if (words.length != 8) continue;

      let Sph = new sphere();
      Sph.Name = Name;

      x = ReadVec3fromString(words[2]);
      if (x == null) continue;
      else Sph.P = x;
      Sph.R = Number(words[3]);

      x = ReadVec3fromString(words[4]);
      if (x == null) continue;
      else Sph.Surf.Ka = x;
      x = ReadVec3fromString(words[5]);
      if (x == null) continue;
      else Sph.Surf.Kd = x;
      x = ReadVec3fromString(words[6]);
      if (x == null) continue;
      else Sph.Surf.Ks = x;
      Sph.Surf.Ph = Number(words[3]);
      Spheres.push(Sph);
    }
  }
}
