export class _vec3 {
  x: number;
  y: number;
  z: number;
  constructor(x1: number, y1: number, z1: number) {
    this.x = x1;
    this.y = y1;
    this.z = z1;
  }

  static set(x1: number, y1: number, z1: number) {
    return new _vec3(x1, y1, z1);
  }

  static add(b: _vec3, a: _vec3) {
    return new _vec3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  static sub(a: _vec3, b: _vec3) {
    return new _vec3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static mulnum(a: _vec3, b: number) {
    return new _vec3(a.x * b, a.y * b, a.z * b);
  }

  static divnum(a: _vec3, b: number) {
    return new _vec3(a.x / b, a.y / b, a.z / b);
  }

  static neg(a: _vec3) {
    return new _vec3(-a.x, -a.y, -a.z);
  }

  static dot(a: _vec3, b: _vec3) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a: _vec3, b: _vec3) {
    return new _vec3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - b.x * a.y
    );
  }

  static len2(a: _vec3) {
    return a.x * a.x + a.y * a.y + a.z * a.z;
  }

  //  return Vec3Set(
  //     P.X * M.M[0][0] + P.Y * M.M[1][0] + P.Z * M.M[2][0] + M.M[3][0],
  //     P.X * M.M[0][1] + P.Y * M.M[1][1] + P.Z * M.M[2][1] + M.M[3][1],
  //     P.X * M.M[0][2] + P.Y * M.M[1][2] + P.Z * M.M[2][2] + M.M[3][2]

  static len(a: _vec3): number {
    return Math.sqrt(_vec3.len2(a));
  }

  static normalize(a: _vec3) {
    return _vec3.divnum(a, _vec3.len(a));
  }

  static vec3(a: _vec3) {
    return [a.x, a.y, a.z];
  }
}
