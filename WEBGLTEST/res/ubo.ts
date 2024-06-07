import { _matr4 } from "../math/mathmat4.js";
import { _vec3 } from "../math/mathvec3.js";

export class Ubo_Matr {
  CamLoc: _vec3;
  CamAt: _vec3;
  CamRight: _vec3;
  CamUp: _vec3;
  CamDir: _vec3;
  ProjDistFarTimeLocal: _vec3;
  TimeGlobalDeltaGlobalDeltaLocal: _vec3;
  flags12FrameW: _vec3;
  flags45FrameH: _vec3;
  constructor(
    CamLoc: _vec3,
    CamAt: _vec3,
    CamRight: _vec3,
    CamUp: _vec3,
    CamDir: _vec3,
    ProjDistFarTimeLocal: _vec3,
    TimeGlobalDeltaGlobalDeltaLocal: _vec3,
    flags12FrameW: _vec3,
    flags45FrameH: _vec3
  ) {
    this.CamLoc = CamLoc;
    this.CamAt = CamAt;
    this.CamRight = CamRight;
    this.CamUp = CamUp;
    this.CamDir = CamDir;
    this.ProjDistFarTimeLocal = ProjDistFarTimeLocal;

    this.TimeGlobalDeltaGlobalDeltaLocal = TimeGlobalDeltaGlobalDeltaLocal;
    this.flags12FrameW = flags12FrameW;
    this.flags45FrameH = flags45FrameH;
  }
  GetArray() {
    return new Float32Array([
      ..._vec3.vec3(this.CamLoc),
      1,
      ..._vec3.vec3(this.CamAt),
      1,
      ..._vec3.vec3(this.CamRight),
      1,
      ..._vec3.vec3(this.CamUp),
      1,
      ..._vec3.vec3(this.CamDir),
      1,
      ..._vec3.vec3(this.ProjDistFarTimeLocal),
      1,
      ..._vec3.vec3(this.TimeGlobalDeltaGlobalDeltaLocal),
      1,
      ..._vec3.vec3(this.flags12FrameW),
      1,
      ..._vec3.vec3(this.flags45FrameH),
      1
    ]);
  }
}

// ray<Type> Frame( Type Xs, Type Ys, Type dx, Type dy ) const
// {
//   vec3<Type> A = Dir * ProjDist;
//   vec3<Type> B = Right * ((Xs + 0.5 - FrameW / 2.0) / FrameW * Wp);
//   vec3<Type> C = Up * ((-(Ys + 0.5) + FrameH / 2.0) / FrameH * Hp);
//   vec3<Type> X = vec3<Type>(A + B + C);
//   return  ray<Type>(X + Loc, X.Normalizing());
// } /* End of 'Resize' function */

export class UBO {
  name: string;
  uboid: WebGLBuffer | null;
  constructor(name: string, uboid: WebGLBuffer | null) {
    this.name = name;
    this.uboid = uboid;
  }

  static create(Size: number, name: string, gl: WebGL2RenderingContext) {
    let fr = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, fr);

    gl.bufferData(gl.UNIFORM_BUFFER, Size * 4, gl.STATIC_DRAW);
    return new UBO(name, fr);
  }

  update(UboArray: Float32Array, gl: WebGL2RenderingContext) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.uboid);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, UboArray);
  }

  apply(point: number, ShdNo: WebGLProgram, gl: WebGL2RenderingContext) {
    let blk_loc = gl.getUniformBlockIndex(ShdNo, this.name);

    gl.uniformBlockBinding(ShdNo, blk_loc, point);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, point, this.uboid);
  }
}
