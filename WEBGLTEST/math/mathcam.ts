import { _vec3 } from "./mathvec3.js";
import { _matr4 } from "./mathmat4.js";

let ProjSize = 0.1 /* Project plane fit square */,
  ProjDist = 0.1 /* Distance to project plane from viewer (near) */,
  ProjFarClip = 3000; /* Distance to project far clip plane (far) */

class _camera {
  ProjSize: number;
  ProjDist: number;
  ProjFarClip: number;
  FrameW: number;
  FrameH: number;
  MatrVP: number[][];
  MatrView: number[][];
  MatrProj: number[][];
  Loc: _vec3;
  At: _vec3;
  Dir: _vec3;
  Up: _vec3;
  Right: _vec3;
  constructor(
    ProjSize: number,
    ProjDist: number,
    ProjFarClip: number,
    MatrVP: number[][],
    MatrView: number[][],
    MatrProj: number[][],
    Loc: _vec3,
    At: _vec3,
    Dir: _vec3,
    Up: _vec3,
    Right: _vec3,
    FrameW: number,
    FrameH: number
  ) {
    this.ProjSize = ProjSize;
    this.ProjDist = ProjDist;
    this.ProjFarClip = ProjFarClip;
    this.MatrVP = MatrVP;
    this.MatrView = MatrView;
    this.MatrProj = MatrProj;
    this.Loc = Loc;
    this.At = At;
    this.Dir = Dir;
    this.Up = Up;
    this.Right = Right;
    this.FrameW = FrameW;
    this.FrameH = FrameH;
  }

  ProjSet() {
    let rx, ry: number;

    rx = ry = ProjSize;

    if (this.FrameW > this.FrameH) rx *= this.FrameW / this.FrameH;
    else ry *= this.FrameH / this.FrameW;

    let Wp = rx,
      Hp = ry;

    this.MatrProj = _matr4.frustum(
      -rx / 2,
      rx / 2,
      -ry / 2,
      ry / 2,
      ProjDist,
      ProjFarClip
    );
    this.MatrVP = _matr4.mulmatr(this.MatrView, this.MatrProj);
  }

  static view(Loc: _vec3, At: _vec3, Up1: _vec3) {
    const Dir = _vec3.normalize(_vec3.sub(At, Loc)),
      Right = _vec3.normalize(_vec3.cross(Dir, Up1)),
      Up = _vec3.cross(Right, Dir);
    return _matr4.set(
      Right.x,
      Up.x,
      -Dir.x,
      0,
      Right.y,
      Up.y,

      -Dir.y,
      0,
      Right.z,
      Up.z,
      -Dir.z,
      0,
      -_vec3.dot(Loc, Right),
      -_vec3.dot(Loc, Up),
      _vec3.dot(Loc, Dir),
      1
    );
  }
}
export let cam: _camera;

export function CamSet(Loc: _vec3, At: _vec3, Up1: _vec3) {
  let Up, Dir, Right;
  let MatrView = _camera.view(Loc, At, Up1);

  Up = _vec3.set(MatrView[0][1], MatrView[1][1], MatrView[2][1]);
  Dir = _vec3.set(-MatrView[0][2], -MatrView[1][2], -MatrView[2][2]);
  Right = _vec3.set(MatrView[0][0], MatrView[1][0], MatrView[2][0]);

  const rx = ProjSize,
    ry = ProjSize;

  let MatrProj = _matr4.frustum(
      -rx / 2,
      rx / 2,
      -ry / 2,
      ry / 2,

      ProjDist,
      ProjFarClip
    ),
    MatrVP = _matr4.mulmatr(MatrView, MatrProj);

  cam = new _camera(
    ProjSize,
    ProjDist,
    ProjFarClip,
    MatrVP,
    MatrView,
    MatrProj,
    Loc,
    At,
    Dir,
    Up,
    Right,
    500,
    500
  );
}
