import { _vec3 } from "./mathvec3";

export function D2R(degree: number) {
  return (degree * Math.PI) / 180;
}

export function R2D(radian: number) {
  return (radian / Math.PI) * 180;
}

export class _matr4 {
  a: number[][];
  constructor(
    a00: number,
    a01: number,
    a02: number,
    a03: number,
    a10: number,
    a11: number,
    a12: number,
    a13: number,
    a20: number,
    a21: number,
    a22: number,
    a23: number,
    a30: number,
    a31: number,
    a32: number,
    a33: number
  ) {
    this.a = [
      [a00, a01, a02, a03],
      [a10, a11, a12, a13],
      [a20, a21, a22, a23],
      [a30, a31, a32, a33]
    ];
  }

  static identity() {
    return new _matr4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1).a;
  }
  static set(
    a00: number,
    a01: number,
    a02: number,
    a03: number,
    a10: number,
    a11: number,
    a12: number,
    a13: number,
    a20: number,
    a21: number,
    a22: number,
    a23: number,
    a30: number,
    a31: number,
    a32: number,
    a33: number
  ) {
    return new _matr4(
      a00,
      a01,
      a02,
      a03,
      a10,
      a11,
      a12,
      a13,
      a20,
      a21,
      a22,
      a23,
      a30,
      a31,
      a32,
      a33
    ).a;
  }
  static translate(a: _vec3) {
    return new _matr4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, a.x, a.y, a.z, 1).a;
  }
  static scale(a: _vec3) {
    return new _matr4(a.x, 0, 0, 0, 0, a.y, 0, 0, 0, 0, a.z, 0, 0, 0, 0, 1).a;
  }

  static rotateZ(degree: number) {
    const r = D2R(degree),
      co = Math.cos(r),
      si = Math.sin(r);
    let m = _matr4.identity();
    m[0][0] = co;
    m[1][0] = -si;
    m[0][1] = si;
    m[1][1] = co;

    return m;
  }
  static rotateX(degree: number) {
    const r = D2R(degree),
      co = Math.cos(r),
      si = Math.sin(r);
    let m = _matr4.identity();

    m[1][1] = co;
    m[2][1] = -si;
    m[1][2] = si;
    m[2][2] = co;

    return m;
  }

  static rotateY(degree: number) {
    const r = D2R(degree),
      co = Math.cos(r),
      si = Math.sin(r);
    let m = _matr4.identity();

    m[0][0] = co;
    m[2][0] = si;
    m[0][2] = -si;
    m[2][2] = co;

    return m;
  }

  static mulmatr(m1: number[][], m2: number[][]) {
    let r = _matr4.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
      k = 0;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (r[i][j] = 0, k = 0; k < 4; k++) {
          r[i][j] += m1[i][k] * m2[k][j];
        }
      }
    }
    return r;
  }

  static transpose(m: number[][]) {
    let r = _matr4.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        r[i][j] = m[j][i];
      }
    }
    return r;
  }

  static determ3x3(
    a11: number,
    a12: number,
    a13: number,
    a21: number,
    a22: number,
    a23: number,
    a31: number,
    a32: number,
    a33: number
  ) {
    return (
      a11 * a22 * a33 -
      a11 * a23 * a32 -
      a12 * a21 * a33 +
      a12 * a23 * a31 +
      a13 * a21 * a32 -
      a13 * a22 * a31
    );
  }

  static determ(m: number[][]) {
    return (
      m[0][0] *
        _matr4.determ3x3(
          m[1][1],
          m[1][2],
          m[1][3],
          m[2][1],
          m[2][2],
          m[2][3],
          m[3][1],
          m[3][2],
          m[3][3]
        ) -
      m[0][1] *
        _matr4.determ3x3(
          m[1][0],
          m[1][2],
          m[1][3],
          m[2][0],
          m[2][2],
          m[2][3],
          m[3][0],
          m[3][2],
          m[3][3]
        ) +
      m[0][2] *
        _matr4.determ3x3(
          m[1][0],
          m[1][1],
          m[1][3],
          m[2][0],
          m[2][1],
          m[2][3],
          m[3][0],
          m[3][1],
          m[3][3]
        ) -
      m[0][3] *
        _matr4.determ3x3(
          m[1][0],
          m[1][1],
          m[1][2],
          m[2][0],
          m[2][1],
          m[2][2],
          m[3][0],
          m[3][1],
          m[3][2]
        )
    );
  }

  static inverse(m: number[][]) {
    const det = _matr4.determ(m);
    let r = _matr4.identity();
    if (det === 0) return r;
    r[0][0] =
      _matr4.determ3x3(
        m[1][1],
        m[1][2],
        m[1][3],
        m[2][1],
        m[2][2],
        m[2][3],
        m[3][1],
        m[3][2],
        m[3][3]
      ) / det;

    r[1][0] =
      _matr4.determ3x3(
        m[1][0],
        m[1][2],
        m[1][3],
        m[2][0],
        m[2][2],
        m[2][3],
        m[3][0],
        m[3][2],
        m[3][3]
      ) / -det;
    r[2][0] =
      _matr4.determ3x3(
        m[1][0],
        m[1][1],
        m[1][3],
        m[2][0],
        m[2][1],
        m[2][3],
        m[3][0],
        m[3][1],
        m[3][3]
      ) / det;
    r[3][0] =
      _matr4.determ3x3(
        m[1][0],
        m[1][1],
        m[1][2],
        m[2][0],
        m[2][1],
        m[2][2],
        m[3][0],
        m[3][1],
        m[3][2]
      ) / -det;

    r[0][1] =
      _matr4.determ3x3(
        m[0][1],
        m[0][2],
        m[0][3],
        m[2][1],
        m[2][2],
        m[2][3],
        m[3][1],
        m[3][2],
        m[3][3]
      ) / -det;

    r[1][1] =
      _matr4.determ3x3(
        m[0][0],
        m[0][2],
        m[0][3],
        m[2][0],
        m[2][2],
        m[2][3],
        m[3][0],
        m[3][2],
        m[3][3]
      ) / det;

    r[2][1] =
      _matr4.determ3x3(
        m[0][0],
        m[0][1],
        m[0][3],
        m[2][0],
        m[2][1],
        m[2][3],
        m[3][0],
        m[3][1],
        m[3][3]
      ) / -det;
    r[3][1] =
      _matr4.determ3x3(
        m[0][0],
        m[0][1],
        m[0][2],
        m[2][0],
        m[2][1],
        m[2][2],
        m[3][0],
        m[3][1],
        m[3][2]
      ) / det;
    r[0][2] =
      _matr4.determ3x3(
        m[0][1],
        m[0][2],
        m[0][3],
        m[1][1],
        m[1][2],
        m[1][3],
        m[3][1],
        m[3][2],
        m[3][3]
      ) / det;
    r[1][2] =
      _matr4.determ3x3(
        m[0][0],
        m[0][2],
        m[0][3],
        m[1][0],
        m[1][2],
        m[1][3],
        m[3][0],
        m[3][2],
        m[3][3]
      ) / -det;
    r[2][2] =
      _matr4.determ3x3(
        m[0][0],
        m[0][1],
        m[0][3],
        m[1][0],
        m[1][1],
        m[1][3],
        m[3][0],
        m[3][1],
        m[3][3]
      ) / det;
    r[3][2] =
      _matr4.determ3x3(
        m[0][0],
        m[0][1],
        m[0][2],
        m[1][0],
        m[2][1],
        m[1][2],
        m[3][0],
        m[3][1],
        m[3][2]
      ) / -det;
    r[0][3] =
      _matr4.determ3x3(
        m[0][1],
        m[0][2],
        m[0][3],
        m[1][1],
        m[1][2],
        m[1][3],
        m[2][1],
        m[2][2],
        m[2][3]
      ) / -det;
    r[1][3] =
      _matr4.determ3x3(
        m[0][0],
        m[0][2],
        m[0][3],
        m[1][0],
        m[1][2],
        m[1][3],
        m[2][0],
        m[2][2],
        m[2][3]
      ) / det;
    r[2][3] =
      _matr4.determ3x3(
        m[0][0],
        m[0][1],
        m[0][3],
        m[1][0],
        m[1][1],
        m[1][3],
        m[2][0],
        m[2][1],
        m[2][3]
      ) / -det;
    r[3][3] =
      _matr4.determ3x3(
        m[0][0],
        m[0][1],
        m[0][2],
        m[1][0],
        m[2][1],
        m[1][2],
        m[2][0],
        m[2][1],
        m[2][2]
      ) / det;
    return r;
  }
  static frustum(
    l: number,
    r: number,
    b: number,
    t: number,
    n: number,
    f: number
  ) {
    let m = _matr4.identity();

    m[0][0] = (2 * n) / (r - l);
    m[0][1] = 0;
    m[0][2] = 0;
    m[0][3] = 0;

    m[1][0] = 0;
    m[1][1] = (2 * n) / (t - b);
    m[1][2] = 0;
    m[1][3] = 0;

    m[2][0] = (r + l) / (r - l);
    m[2][1] = (t + b) / (t - b);
    m[2][2] = (f + n) / -(f - n);
    m[2][3] = -1;

    m[3][0] = 0;
    m[3][1] = 0;
    m[3][2] = (-2 * n * f) / (f - n);
    m[3][3] = 0;

    return m;
  }

  static toarr(m: number[][]) {
    let v = [];

    for (let i = 0; i < 4; i++) {
      for (let g = 0; g < 4; g++) {
        v.push(m[i][g]);
      }
    }

    return v;
  }

  static point_transform(a: _vec3, b: number[][]) {
    return new _vec3(
      a.x * b[0][0] + a.y * b[1][0] + a.z * b[2][0] + b[3][0],
      a.x * b[0][1] + a.y * b[1][1] + a.z * b[2][1] + b[3][1],
      a.x * b[0][2] + a.y * b[1][2] + a.z * b[2][2] + b[3][2]
    );
  }

  static vectort_ransform(a: _vec3, b: number[][]) {
    return new _vec3(
      a.x * b[0][0] + a.y * b[1][0] + a.z * b[2][0],
      a.x * b[0][1] + a.y * b[1][1] + a.z * b[2][1],
      a.x * b[0][2] + a.y * b[1][2] + a.z * b[2][2]
    );
  }
  static mul_matr(a: _vec3, b: number[][]) {
    const w = a.x * b[0][3] + a.y * b[1][3] + a.z * b[2][3] + b[3][3];
    return new _vec3(
      (a.x * b[0][0] + a.y * b[1][0] + a.z * b[2][0] + b[3][0]) / w,
      (a.y * b[0][1] + a.y * b[1][1] + a.z * b[2][1] + b[3][1]) / w,
      (a.z * b[0][2] + a.y * b[1][2] + a.z * b[2][2] + b[3][2]) / w
    );
  }
}
