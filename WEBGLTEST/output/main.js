var XXX = (function (exports) {
    'use strict';

    // import { UBO, Ubo_cell } from "./rnd/res/ubo.js";
    // import { cam } from "./math/mathcam.js";
    // import { _vec3 } from "./math/mathvec3.js";
    // import { CamUBO } from "./rnd/rndbase.js";
    class Time {
        getTime() {
            const date = new Date();
            let t = date.getMilliseconds() / 1000.0 +
                date.getSeconds() +
                date.getMinutes() * 60;
            return t;
        }
        globalTime;
        localTime;
        globalDeltaTime;
        pauseTime;
        localDeltaTime;
        frameCounter;
        startTime;
        oldTime;
        oldTimeFPS;
        isPause;
        FPS;
        constructor() {
            // Fill timer global data
            this.globalTime = this.localTime = this.getTime();
            this.globalDeltaTime = this.localDeltaTime = 0;
            // Fill timer semi global data
            this.startTime = this.oldTime = this.oldTimeFPS = this.globalTime;
            this.frameCounter = 0;
            this.isPause = false;
            this.FPS = 30.0;
            this.pauseTime = 0;
        }
        Response() {
            let t = this.getTime();
            // Global time
            this.globalTime = t;
            this.globalDeltaTime = t - this.oldTime;
            // Time with pause
            if (this.isPause) {
                this.localDeltaTime = 0;
                this.pauseTime += t - this.oldTime;
            }
            else {
                this.localDeltaTime = this.globalDeltaTime;
                this.localTime = t - this.pauseTime - this.startTime;
            }
            // FPS
            this.frameCounter++;
            if (t - this.oldTimeFPS > 3) {
                this.FPS = this.frameCounter / (t - this.oldTimeFPS);
                this.oldTimeFPS = t;
                this.frameCounter = 0;
            }
            this.oldTime = t;
        }
    }
    let myTimer = new Time();

    class InPut {
        Keys;
        KeysClick;
        Mx;
        My;
        Mz;
        Mdx;
        Mdy;
        Mdz;
        MouseClickLeft;
        MouseClickRight;
        constructor(MouseClick, Keys) {
            this.Keys = this.KeysClick = Keys;
            this.Mx = this.My = this.Mz = this.Mdx = this.Mdy = this.Mdz = 0;
            this.MouseClickLeft = MouseClick[0];
            this.MouseClickRight = MouseClick[1];
        }
        response(M, MouseClick, Wheel, Keys) {
            // if (Keys[17] != 0)
            for (let i = 0; i < 256; i++) {
                this.KeysClick[i] = Keys[i] && !this.Keys[i] ? 1 : 0;
            }
            for (let i = 0; i < 256; i++) {
                this.Keys[i] = Keys[i];
            }
            this.Mdx = M[0];
            this.Mdy = M[1];
            // this.Mx = M[0];
            // this.My = M[1];
            this.Mdz = Wheel;
            this.Mz += Wheel;
            this.MouseClickLeft = MouseClick[0];
            this.MouseClickRight = MouseClick[1];
        }
    } // End of 'Input' function
    let myInput = new InPut([0, 0], []);

    class _vec3 {
        x;
        y;
        z;
        constructor(x1, y1, z1) {
            this.x = x1;
            this.y = y1;
            this.z = z1;
        }
        static set(x1, y1, z1) {
            return new _vec3(x1, y1, z1);
        }
        static add(b, a) {
            return new _vec3(a.x + b.x, a.y + b.y, a.z + b.z);
        }
        static sub(a, b) {
            return new _vec3(a.x - b.x, a.y - b.y, a.z - b.z);
        }
        static mulnum(a, b) {
            return new _vec3(a.x * b, a.y * b, a.z * b);
        }
        static divnum(a, b) {
            return new _vec3(a.x / b, a.y / b, a.z / b);
        }
        static neg(a) {
            return new _vec3(-a.x, -a.y, -a.z);
        }
        static dot(a, b) {
            return a.x * b.x + a.y * b.y + a.z * b.z;
        }
        static cross(a, b) {
            return new _vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - b.x * a.y);
        }
        static len2(a) {
            return a.x * a.x + a.y * a.y + a.z * a.z;
        }
        //  return Vec3Set(
        //     P.X * M.M[0][0] + P.Y * M.M[1][0] + P.Z * M.M[2][0] + M.M[3][0],
        //     P.X * M.M[0][1] + P.Y * M.M[1][1] + P.Z * M.M[2][1] + M.M[3][1],
        //     P.X * M.M[0][2] + P.Y * M.M[1][2] + P.Z * M.M[2][2] + M.M[3][2]
        static len(a) {
            return Math.sqrt(_vec3.len2(a));
        }
        static normalize(a) {
            return _vec3.divnum(a, _vec3.len(a));
        }
        static vec3(a) {
            return [a.x, a.y, a.z];
        }
    }

    class surface {
        Ka = _vec3.set(0, 0, 0);
        Kd = _vec3.set(0, 0, 0);
        Ks = _vec3.set(0, 0, 0);
        Ph = 0;
        GetArray() {
            return [
                ..._vec3.vec3(this.Ka),
                1,
                ..._vec3.vec3(this.Kd),
                1,
                ..._vec3.vec3(this.Ks),
                this.Ph
            ];
        }
    }
    class sphere {
        Name = "";
        R = 0;
        P = _vec3.set(0, 0, 0);
        Surf = new surface();
        GetArray() {
            return [..._vec3.vec3(this.P), this.R].concat(this.Surf.GetArray());
        }
    }
    let Spheres = [];
    function GetArraySpheres() {
        let Result = [Spheres.length, 0, 0, 0];
        for (let element of Spheres) {
            Result = Result.concat(element.GetArray());
        }
        return new Float32Array(Result);
    }

    function ReadVec3fromString(Str) {
        let h;
        if (Str[0] != "{" || Str[Str.length - 1] != "}")
            return null;
        h = Str.slice(1, Str.length - 1)
            .split(",")
            .map(Number);
        if (h.length < 3)
            return null;
        return _vec3.set(h[0], h[1], h[2]);
    }
    function parser(Txt) {
        Spheres.length = 0;
        let Name;
        let arrayOfStrings = Txt.split("\n");
        for (let i = 0; i < arrayOfStrings.length; i++) {
            if (arrayOfStrings[i][0] == "/" && arrayOfStrings[i][1] == "/")
                continue;
            let words = arrayOfStrings[i].split(" ");
            Name = words[0];
            if (words.length == 1)
                continue;
            let Type = words[1];
            if (Type == "sphere") {
                let x;
                if (words.length != 8)
                    continue;
                let Sph = new sphere();
                Sph.Name = Name;
                x = ReadVec3fromString(words[2]);
                if (x == null)
                    continue;
                else
                    Sph.P = x;
                Sph.R = Number(words[3]);
                x = ReadVec3fromString(words[4]);
                if (x == null)
                    continue;
                else
                    Sph.Surf.Ka = x;
                x = ReadVec3fromString(words[5]);
                if (x == null)
                    continue;
                else
                    Sph.Surf.Kd = x;
                x = ReadVec3fromString(words[6]);
                if (x == null)
                    continue;
                else
                    Sph.Surf.Ks = x;
                Sph.Surf.Ph = Number(words[3]);
                Spheres.push(Sph);
            }
        }
    }

    class Ubo_Matr {
        CamLoc;
        CamAt;
        CamRight;
        CamUp;
        CamDir;
        ProjDistFarTimeLocal;
        TimeGlobalDeltaGlobalDeltaLocal;
        flags12FrameW;
        flags45FrameH;
        constructor(CamLoc, CamAt, CamRight, CamUp, CamDir, ProjDistFarTimeLocal, TimeGlobalDeltaGlobalDeltaLocal, flags12FrameW, flags45FrameH) {
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
    class UBO {
        name;
        uboid;
        constructor(name, uboid) {
            this.name = name;
            this.uboid = uboid;
        }
        static create(Size, name, gl) {
            let fr = gl.createBuffer();
            gl.bindBuffer(gl.UNIFORM_BUFFER, fr);
            gl.bufferData(gl.UNIFORM_BUFFER, Size * 4, gl.STATIC_DRAW);
            return new UBO(name, fr);
        }
        update(UboArray, gl) {
            gl.bindBuffer(gl.UNIFORM_BUFFER, this.uboid);
            gl.bufferSubData(gl.UNIFORM_BUFFER, 0, UboArray);
        }
        apply(point, ShdNo, gl) {
            let blk_loc = gl.getUniformBlockIndex(ShdNo, this.name);
            gl.uniformBlockBinding(ShdNo, blk_loc, point);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, point, this.uboid);
        }
    }

    function D2R(degree) {
        return (degree * Math.PI) / 180;
    }
    class _matr4 {
        a;
        constructor(a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33) {
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
        static set(a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33) {
            return new _matr4(a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33).a;
        }
        static translate(a) {
            return new _matr4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, a.x, a.y, a.z, 1).a;
        }
        static scale(a) {
            return new _matr4(a.x, 0, 0, 0, 0, a.y, 0, 0, 0, 0, a.z, 0, 0, 0, 0, 1).a;
        }
        static rotateZ(degree) {
            const r = D2R(degree), co = Math.cos(r), si = Math.sin(r);
            let m = _matr4.identity();
            m[0][0] = co;
            m[1][0] = -si;
            m[0][1] = si;
            m[1][1] = co;
            return m;
        }
        static rotateX(degree) {
            const r = D2R(degree), co = Math.cos(r), si = Math.sin(r);
            let m = _matr4.identity();
            m[1][1] = co;
            m[2][1] = -si;
            m[1][2] = si;
            m[2][2] = co;
            return m;
        }
        static rotateY(degree) {
            const r = D2R(degree), co = Math.cos(r), si = Math.sin(r);
            let m = _matr4.identity();
            m[0][0] = co;
            m[2][0] = si;
            m[0][2] = -si;
            m[2][2] = co;
            return m;
        }
        static mulmatr(m1, m2) {
            let r = _matr4.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0), k = 0;
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    for (r[i][j] = 0, k = 0; k < 4; k++) {
                        r[i][j] += m1[i][k] * m2[k][j];
                    }
                }
            }
            return r;
        }
        static transpose(m) {
            let r = _matr4.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    r[i][j] = m[j][i];
                }
            }
            return r;
        }
        static determ3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33) {
            return (a11 * a22 * a33 -
                a11 * a23 * a32 -
                a12 * a21 * a33 +
                a12 * a23 * a31 +
                a13 * a21 * a32 -
                a13 * a22 * a31);
        }
        static determ(m) {
            return (m[0][0] *
                _matr4.determ3x3(m[1][1], m[1][2], m[1][3], m[2][1], m[2][2], m[2][3], m[3][1], m[3][2], m[3][3]) -
                m[0][1] *
                    _matr4.determ3x3(m[1][0], m[1][2], m[1][3], m[2][0], m[2][2], m[2][3], m[3][0], m[3][2], m[3][3]) +
                m[0][2] *
                    _matr4.determ3x3(m[1][0], m[1][1], m[1][3], m[2][0], m[2][1], m[2][3], m[3][0], m[3][1], m[3][3]) -
                m[0][3] *
                    _matr4.determ3x3(m[1][0], m[1][1], m[1][2], m[2][0], m[2][1], m[2][2], m[3][0], m[3][1], m[3][2]));
        }
        static inverse(m) {
            const det = _matr4.determ(m);
            let r = _matr4.identity();
            if (det === 0)
                return r;
            r[0][0] =
                _matr4.determ3x3(m[1][1], m[1][2], m[1][3], m[2][1], m[2][2], m[2][3], m[3][1], m[3][2], m[3][3]) / det;
            r[1][0] =
                _matr4.determ3x3(m[1][0], m[1][2], m[1][3], m[2][0], m[2][2], m[2][3], m[3][0], m[3][2], m[3][3]) / -det;
            r[2][0] =
                _matr4.determ3x3(m[1][0], m[1][1], m[1][3], m[2][0], m[2][1], m[2][3], m[3][0], m[3][1], m[3][3]) / det;
            r[3][0] =
                _matr4.determ3x3(m[1][0], m[1][1], m[1][2], m[2][0], m[2][1], m[2][2], m[3][0], m[3][1], m[3][2]) / -det;
            r[0][1] =
                _matr4.determ3x3(m[0][1], m[0][2], m[0][3], m[2][1], m[2][2], m[2][3], m[3][1], m[3][2], m[3][3]) / -det;
            r[1][1] =
                _matr4.determ3x3(m[0][0], m[0][2], m[0][3], m[2][0], m[2][2], m[2][3], m[3][0], m[3][2], m[3][3]) / det;
            r[2][1] =
                _matr4.determ3x3(m[0][0], m[0][1], m[0][3], m[2][0], m[2][1], m[2][3], m[3][0], m[3][1], m[3][3]) / -det;
            r[3][1] =
                _matr4.determ3x3(m[0][0], m[0][1], m[0][2], m[2][0], m[2][1], m[2][2], m[3][0], m[3][1], m[3][2]) / det;
            r[0][2] =
                _matr4.determ3x3(m[0][1], m[0][2], m[0][3], m[1][1], m[1][2], m[1][3], m[3][1], m[3][2], m[3][3]) / det;
            r[1][2] =
                _matr4.determ3x3(m[0][0], m[0][2], m[0][3], m[1][0], m[1][2], m[1][3], m[3][0], m[3][2], m[3][3]) / -det;
            r[2][2] =
                _matr4.determ3x3(m[0][0], m[0][1], m[0][3], m[1][0], m[1][1], m[1][3], m[3][0], m[3][1], m[3][3]) / det;
            r[3][2] =
                _matr4.determ3x3(m[0][0], m[0][1], m[0][2], m[1][0], m[2][1], m[1][2], m[3][0], m[3][1], m[3][2]) / -det;
            r[0][3] =
                _matr4.determ3x3(m[0][1], m[0][2], m[0][3], m[1][1], m[1][2], m[1][3], m[2][1], m[2][2], m[2][3]) / -det;
            r[1][3] =
                _matr4.determ3x3(m[0][0], m[0][2], m[0][3], m[1][0], m[1][2], m[1][3], m[2][0], m[2][2], m[2][3]) / det;
            r[2][3] =
                _matr4.determ3x3(m[0][0], m[0][1], m[0][3], m[1][0], m[1][1], m[1][3], m[2][0], m[2][1], m[2][3]) / -det;
            r[3][3] =
                _matr4.determ3x3(m[0][0], m[0][1], m[0][2], m[1][0], m[2][1], m[1][2], m[2][0], m[2][1], m[2][2]) / det;
            return r;
        }
        static frustum(l, r, b, t, n, f) {
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
        static toarr(m) {
            let v = [];
            for (let i = 0; i < 4; i++) {
                for (let g = 0; g < 4; g++) {
                    v.push(m[i][g]);
                }
            }
            return v;
        }
        static point_transform(a, b) {
            return new _vec3(a.x * b[0][0] + a.y * b[1][0] + a.z * b[2][0] + b[3][0], a.x * b[0][1] + a.y * b[1][1] + a.z * b[2][1] + b[3][1], a.x * b[0][2] + a.y * b[1][2] + a.z * b[2][2] + b[3][2]);
        }
        static vectort_ransform(a, b) {
            return new _vec3(a.x * b[0][0] + a.y * b[1][0] + a.z * b[2][0], a.x * b[0][1] + a.y * b[1][1] + a.z * b[2][1], a.x * b[0][2] + a.y * b[1][2] + a.z * b[2][2]);
        }
        static mul_matr(a, b) {
            const w = a.x * b[0][3] + a.y * b[1][3] + a.z * b[2][3] + b[3][3];
            return new _vec3((a.x * b[0][0] + a.y * b[1][0] + a.z * b[2][0] + b[3][0]) / w, (a.y * b[0][1] + a.y * b[1][1] + a.z * b[2][1] + b[3][1]) / w, (a.z * b[0][2] + a.y * b[1][2] + a.z * b[2][2] + b[3][2]) / w);
        }
    }

    let ProjSize = 0.1 /* Project plane fit square */, ProjDist = 0.1 /* Distance to project plane from viewer (near) */, ProjFarClip = 3000; /* Distance to project far clip plane (far) */
    class _camera {
        ProjSize;
        ProjDist;
        ProjFarClip;
        FrameW;
        FrameH;
        MatrVP;
        MatrView;
        MatrProj;
        Loc;
        At;
        Dir;
        Up;
        Right;
        constructor(ProjSize, ProjDist, ProjFarClip, MatrVP, MatrView, MatrProj, Loc, At, Dir, Up, Right, FrameW, FrameH) {
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
            let rx, ry;
            rx = ry = ProjSize;
            if (this.FrameW > this.FrameH)
                rx *= this.FrameW / this.FrameH;
            else
                ry *= this.FrameH / this.FrameW;
            this.MatrProj = _matr4.frustum(-rx / 2, rx / 2, -ry / 2, ry / 2, ProjDist, ProjFarClip);
            this.MatrVP = _matr4.mulmatr(this.MatrView, this.MatrProj);
        }
        static view(Loc, At, Up1) {
            const Dir = _vec3.normalize(_vec3.sub(At, Loc)), Right = _vec3.normalize(_vec3.cross(Dir, Up1)), Up = _vec3.cross(Right, Dir);
            return _matr4.set(Right.x, Up.x, -Dir.x, 0, Right.y, Up.y, -Dir.y, 0, Right.z, Up.z, -Dir.z, 0, -_vec3.dot(Loc, Right), -_vec3.dot(Loc, Up), _vec3.dot(Loc, Dir), 1);
        }
    }
    let cam;
    function CamSet(Loc, At, Up1) {
        let Up, Dir, Right;
        let MatrView = _camera.view(Loc, At, Up1);
        Up = _vec3.set(MatrView[0][1], MatrView[1][1], MatrView[2][1]);
        Dir = _vec3.set(-MatrView[0][2], -MatrView[1][2], -MatrView[2][2]);
        Right = _vec3.set(MatrView[0][0], MatrView[1][0], MatrView[2][0]);
        const rx = ProjSize, ry = ProjSize;
        let MatrProj = _matr4.frustum(-rx / 2, rx / 2, -ry / 2, ry / 2, ProjDist, ProjFarClip), MatrVP = _matr4.mulmatr(MatrView, MatrProj);
        cam = new _camera(ProjSize, ProjDist, ProjFarClip, MatrVP, MatrView, MatrProj, Loc, At, Dir, Up, Right, 500, 500);
    }

    let gl;
    let Ubo_set1;
    let Ubo_set1_data;
    let Ubo_set2;
    let FlagDataObjectUpdate = true;
    function initCam() {
        CamSet(_vec3.set(0, 0, -5), _vec3.set(0, 0, 0), _vec3.set(0, 1, 0));
        Ubo_set1_data.ProjDistFarTimeLocal.x = cam.ProjDist;
    }
    function renderCam() {
        let Dist = _vec3.len(_vec3.sub(cam.At, cam.Loc));
        let cosT, sinT, cosP, sinP, plen, Azimuth, Elevator;
        let Wp, Hp, sx, sy;
        let dv;
        if (myInput.Keys[18]) {
            Wp = Hp = cam.ProjSize;
            cosT = (cam.Loc.y - cam.At.y) / Dist;
            sinT = Math.sqrt(1 - cosT * cosT);
            plen = Dist * sinT;
            cosP = (cam.Loc.z - cam.At.z) / plen;
            sinP = (cam.Loc.x - cam.At.x) / plen;
            Azimuth = (Math.atan2(sinP, cosP) / Math.PI) * 180;
            Elevator = (Math.atan2(sinT, cosT) / Math.PI) * 180;
            Azimuth +=
                myTimer.globalDeltaTime *
                    3 *
                    (-30 * myInput.MouseClickLeft * myInput.Mdx);
            Elevator +=
                myTimer.globalDeltaTime *
                    2 *
                    (-30 * myInput.MouseClickLeft * myInput.Mdy);
            if (Elevator < 0.08)
                Elevator = 0.08;
            else if (Elevator > 178.9)
                Elevator = 178.9;
            // if (Azimuth < -45) Azimuth = -45;
            // else if (Azimuth > 45) Azimuth = 45;
            Dist +=
                myTimer.globalDeltaTime *
                    (1 + myInput.Keys[16] * 27) *
                    (1.2 * myInput.Mdz);
            if (Dist < 0.1)
                Dist = 0.1;
            // console.log(key.charCodeAt(0));
            if (myInput.MouseClickRight) {
                if (cam.FrameW > cam.FrameH)
                    Wp *= cam.FrameW / cam.FrameH;
                else
                    Hp *= cam.FrameH / cam.FrameW;
                sx = (((-myInput.Mdx * Wp * 10) / cam.FrameW) * Dist) / cam.ProjDist;
                sy = (((myInput.Mdy * Hp * 10) / cam.FrameH) * Dist) / cam.ProjDist;
                dv = _vec3.add(_vec3.mulnum(cam.Right, sx), _vec3.mulnum(cam.Up, sy));
                cam.At = _vec3.add(cam.At, dv);
                cam.Loc = _vec3.add(cam.Loc, dv);
            }
            CamSet(_matr4.point_transform(new _vec3(0, Dist, 0), _matr4.mulmatr(_matr4.mulmatr(_matr4.rotateX(Elevator), _matr4.rotateY(Azimuth)), _matr4.translate(cam.At))), cam.At, new _vec3(0, 1, 0));
        }
        Ubo_set1_data.CamLoc = cam.Loc;
        Ubo_set1_data.CamAt = cam.At;
        Ubo_set1_data.CamRight = cam.Right;
        Ubo_set1_data.CamUp = cam.Up;
        Ubo_set1_data.CamDir = cam.Dir;
        //   if (Ani->Keys[VK_SHIFT] && Ani->KeysClick['P'])
        //     Ani->IsPause = !Ani->IsPause;
    }
    function resizeCam(w, h) {
        Ubo_set1_data.flags12FrameW.z = w;
        Ubo_set1_data.flags45FrameH.z = h;
        cam.ProjSet();
    }
    async function reloadShaders() {
        const vsResponse = await fetch("./shader/march.vertex.glsl" + "?nocache" + new Date().getTime());
        const vsText = await vsResponse.text();
        // console.log(vsText);
        const fsResponse = await fetch("./shader/march.fragment.glsl" + "?nocache" + new Date().getTime());
        const fsText = await fsResponse.text();
        const dtResponse = await fetch("./data.txt" + "?nocache" + new Date().getTime());
        if (FlagDataObjectUpdate) {
            const dtText = await dtResponse.text();
            parser(dtText);
            FlagDataObjectUpdate = false;
            console.log(Spheres);
            Ubo_set2.update(GetArraySpheres(), gl);
        }
        const shaderProgram = initShaderProgram(vsText, fsText);
        if (!shaderProgram)
            return null;
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "in_pos")
            }
        };
        return programInfo;
    }
    function loadShader(type, source) {
        const shader = gl.createShader(type);
        if (!shader)
            return null;
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    function initShaderProgram(vsSource, fsSource) {
        const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
        if (!vertexShader)
            return;
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
        if (!fragmentShader)
            return;
        // Create the shader program
        const shaderProgram = gl.createProgram();
        if (!shaderProgram)
            return;
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
            return null;
        }
        return shaderProgram;
    }
    function initPositionBuffer() {
        // Create a buffer for the square's positions.
        const positionBuffer = gl.createBuffer();
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Now create an array of positions for the square.
        const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return positionBuffer;
    }
    function initBuffers() {
        const positionBuffer = initPositionBuffer();
        return {
            position: positionBuffer
        };
    }
    function setPositionAttribute(buffers, programInfo) {
        const numComponents = 2; // pull out 2 values per iteration
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    function drawScene(programInfo, buffers, Uni) {
        gl.clearColor(0.28, 0.47, 0.8, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        // Clear the canvas before we start drawing on it.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (programInfo == null)
            return;
        setPositionAttribute(buffers, programInfo);
        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
        Ubo_set1.apply(0, programInfo.program, gl);
        Ubo_set2.apply(1, programInfo.program, gl);
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
    let Md = [0, 0], MouseClick = [0, 0], Wheel = 0, Keys = new Array(255).fill(0);
    async function main(w, h) {
        const vsResponse = await fetch("./shader/march.vertex.glsl" + "?nocache" + new Date().getTime());
        const vsText = await vsResponse.text();
        console.log(vsText);
        const fsResponse = await fetch("./shader/march.fragment.glsl" + "?nocache" + new Date().getTime());
        const fsText = await fsResponse.text();
        console.log(fsText);
        const canvas = document.querySelector("#glcanvas");
        if (!canvas) {
            return;
        }
        // Initialize the GL context
        gl = canvas.getContext("webgl2");
        gl.canvas.width = w;
        gl.canvas.height = h;
        // Only continue if WebGL is available and working
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
        // Set clear color to black, fully opaque
        gl.clearColor(0.28, 0.47, 0.8, 1.0);
        // Clear the color buffer with specified clear color
        gl.clear(gl.COLOR_BUFFER_BIT);
        let shaderProgram = initShaderProgram(vsText, fsText);
        if (!shaderProgram)
            return;
        ({
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "in_pos")
            }
        });
        gl.getAttribLocation(shaderProgram, "time");
        const buffers = initBuffers();
        Ubo_set1_data = new Ubo_Matr(new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0));
        Ubo_set1 = UBO.create(Ubo_set1_data.GetArray().length, "BaseData", gl);
        Ubo_set2 = UBO.create(16 * 10 + 4, "Sphere", gl);
        initCam();
        gl.viewport(0, 0, w, h);
        resizeCam(w, h);
        const render = async () => {
            let programInf = await reloadShaders();
            myTimer.Response();
            window.addEventListener("mousedown", (e) => {
                e.preventDefault();
                if (e.button == 0) {
                    MouseClick[0] = 1;
                }
                if (e.button == 2) {
                    MouseClick[1] = 1;
                }
            });
            window.addEventListener("mouseup", (e) => {
                if (e.button == 0) {
                    MouseClick[0] = 0;
                }
                if (e.button == 2) {
                    MouseClick[1] = 0;
                }
            });
            window.addEventListener("mousemove", (e) => {
                Md[0] = e.movementX;
                Md[1] = e.movementY;
            });
            window.addEventListener("keydown", (e) => {
                Keys[e.keyCode] = 1;
            });
            window.addEventListener("keyup", (e) => {
                Keys[e.keyCode] = 0;
            });
            window.addEventListener("wheel", (e) => {
                Wheel = e.deltaY;
            });
            myInput.response(Md, MouseClick, Wheel, Keys);
            if (myInput.KeysClick[82])
                FlagDataObjectUpdate = true;
            Md[0] = Md[1] = 0;
            renderCam();
            Ubo_set1_data.TimeGlobalDeltaGlobalDeltaLocal.x = myTimer.globalTime;
            Ubo_set1.update(Ubo_set1_data.GetArray(), gl);
            drawScene(programInf, buffers);
            Wheel = 0;
            Keys.fill(0);
            console.log(myTimer.FPS);
            window.requestAnimationFrame(render);
        };
        render();
    }
    window.addEventListener("load", (event) => {
        let w = window.innerWidth;
        let h = window.innerHeight;
        main(w, h);
    });
    window.addEventListener("resize", (event) => {
        let w = window.innerWidth;
        let h = window.innerHeight;
        gl.canvas.width = w;
        gl.canvas.height = h;
        gl.viewport(0, 0, w, h);
        resizeCam(w, h);
    });

    exports.main = main;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vcmVzL3RpbWVyLnRzIiwiLi4vcmVzL2lucHV0LnRzIiwiLi4vbWF0aC9tYXRodmVjMy50cyIsIi4uL29iamVjdHMudHMiLCIuLi9yZXMvcGFyc2VyLnRzIiwiLi4vcmVzL3Viby50cyIsIi4uL21hdGgvbWF0aG1hdDQudHMiLCIuLi9tYXRoL21hdGhjYW0udHMiLCIuLi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCB7IFVCTywgVWJvX2NlbGwgfSBmcm9tIFwiLi9ybmQvcmVzL3Viby5qc1wiO1xuLy8gaW1wb3J0IHsgY2FtIH0gZnJvbSBcIi4vbWF0aC9tYXRoY2FtLmpzXCI7XG4vLyBpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzMuanNcIjtcbi8vIGltcG9ydCB7IENhbVVCTyB9IGZyb20gXCIuL3JuZC9ybmRiYXNlLmpzXCI7XG5cbmNsYXNzIFRpbWUge1xuICBnZXRUaW1lKCk6IG51bWJlciB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IHQgPVxuICAgICAgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAvIDEwMDAuMCArXG4gICAgICBkYXRlLmdldFNlY29uZHMoKSArXG4gICAgICBkYXRlLmdldE1pbnV0ZXMoKSAqIDYwO1xuICAgIHJldHVybiB0O1xuICB9XG5cbiAgZ2xvYmFsVGltZTogbnVtYmVyO1xuICBsb2NhbFRpbWU6IG51bWJlcjtcbiAgZ2xvYmFsRGVsdGFUaW1lOiBudW1iZXI7XG4gIHBhdXNlVGltZTogbnVtYmVyO1xuICBsb2NhbERlbHRhVGltZTogbnVtYmVyO1xuICBmcmFtZUNvdW50ZXI6IG51bWJlcjtcbiAgc3RhcnRUaW1lOiBudW1iZXI7XG4gIG9sZFRpbWU6IG51bWJlcjtcbiAgb2xkVGltZUZQUzogbnVtYmVyO1xuICBpc1BhdXNlOiBib29sZWFuO1xuICBGUFM6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gRmlsbCB0aW1lciBnbG9iYWwgZGF0YVxuICAgIHRoaXMuZ2xvYmFsVGltZSA9IHRoaXMubG9jYWxUaW1lID0gdGhpcy5nZXRUaW1lKCk7XG4gICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0aGlzLmxvY2FsRGVsdGFUaW1lID0gMDtcblxuICAgIC8vIEZpbGwgdGltZXIgc2VtaSBnbG9iYWwgZGF0YVxuICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5vbGRUaW1lID0gdGhpcy5vbGRUaW1lRlBTID0gdGhpcy5nbG9iYWxUaW1lO1xuICAgIHRoaXMuZnJhbWVDb3VudGVyID0gMDtcbiAgICB0aGlzLmlzUGF1c2UgPSBmYWxzZTtcbiAgICB0aGlzLkZQUyA9IDMwLjA7XG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xuICB9XG5cbiAgUmVzcG9uc2UoKSB7XG4gICAgbGV0IHQgPSB0aGlzLmdldFRpbWUoKTtcbiAgICAvLyBHbG9iYWwgdGltZVxuICAgIHRoaXMuZ2xvYmFsVGltZSA9IHQ7XG4gICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0IC0gdGhpcy5vbGRUaW1lO1xuICAgIC8vIFRpbWUgd2l0aCBwYXVzZVxuICAgIGlmICh0aGlzLmlzUGF1c2UpIHtcbiAgICAgIHRoaXMubG9jYWxEZWx0YVRpbWUgPSAwO1xuICAgICAgdGhpcy5wYXVzZVRpbWUgKz0gdCAtIHRoaXMub2xkVGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbERlbHRhVGltZSA9IHRoaXMuZ2xvYmFsRGVsdGFUaW1lO1xuICAgICAgdGhpcy5sb2NhbFRpbWUgPSB0IC0gdGhpcy5wYXVzZVRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICB9XG4gICAgLy8gRlBTXG4gICAgdGhpcy5mcmFtZUNvdW50ZXIrKztcbiAgICBpZiAodCAtIHRoaXMub2xkVGltZUZQUyA+IDMpIHtcbiAgICAgIHRoaXMuRlBTID0gdGhpcy5mcmFtZUNvdW50ZXIgLyAodCAtIHRoaXMub2xkVGltZUZQUyk7XG4gICAgICB0aGlzLm9sZFRpbWVGUFMgPSB0O1xuICAgICAgdGhpcy5mcmFtZUNvdW50ZXIgPSAwO1xuICAgIH1cbiAgICB0aGlzLm9sZFRpbWUgPSB0O1xuICB9XG59XG5cbmV4cG9ydCBsZXQgbXlUaW1lciA9IG5ldyBUaW1lKCk7XG4iLCJjbGFzcyBJblB1dCB7XG4gIEtleXM6IG51bWJlcltdO1xuICBLZXlzQ2xpY2s6IG51bWJlcltdO1xuICBNeDogbnVtYmVyO1xuICBNeTogbnVtYmVyO1xuICBNejogbnVtYmVyO1xuICBNZHg6IG51bWJlcjtcbiAgTWR5OiBudW1iZXI7XG4gIE1kejogbnVtYmVyO1xuXG4gIE1vdXNlQ2xpY2tMZWZ0OiBudW1iZXI7XG4gIE1vdXNlQ2xpY2tSaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKE1vdXNlQ2xpY2s6IG51bWJlcltdLCBLZXlzOiBudW1iZXJbXSkge1xuICAgIHRoaXMuS2V5cyA9IHRoaXMuS2V5c0NsaWNrID0gS2V5cztcbiAgICB0aGlzLk14ID0gdGhpcy5NeSA9IHRoaXMuTXogPSB0aGlzLk1keCA9IHRoaXMuTWR5ID0gdGhpcy5NZHogPSAwO1xuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxuXG4gIHJlc3BvbnNlKE06IG51bWJlcltdLCBNb3VzZUNsaWNrOiBudW1iZXJbXSwgV2hlZWw6IG51bWJlciwgS2V5czogbnVtYmVyW10pIHtcbiAgICAvLyBpZiAoS2V5c1sxN10gIT0gMClcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHRoaXMuS2V5c0NsaWNrW2ldID0gS2V5c1tpXSAmJiAhdGhpcy5LZXlzW2ldID8gMSA6IDA7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHRoaXMuS2V5c1tpXSA9IEtleXNbaV07XG4gICAgfVxuXG4gICAgdGhpcy5NZHggPSBNWzBdO1xuICAgIHRoaXMuTWR5ID0gTVsxXTtcblxuICAgIC8vIHRoaXMuTXggPSBNWzBdO1xuICAgIC8vIHRoaXMuTXkgPSBNWzFdO1xuICAgIHRoaXMuTWR6ID0gV2hlZWw7XG4gICAgdGhpcy5NeiArPSBXaGVlbDtcblxuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxufSAvLyBFbmQgb2YgJ0lucHV0JyBmdW5jdGlvblxuXG5leHBvcnQgbGV0IG15SW5wdXQgPSBuZXcgSW5QdXQoWzAsIDBdLCBbXSk7XG4iLCJleHBvcnQgY2xhc3MgX3ZlYzMge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgejogbnVtYmVyO1xuICBjb25zdHJ1Y3Rvcih4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB6MTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDE7XG4gICAgdGhpcy55ID0geTE7XG4gICAgdGhpcy56ID0gejE7XG4gIH1cblxuICBzdGF0aWMgc2V0KHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHoxOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKHgxLCB5MSwgejEpO1xuICB9XG5cbiAgc3RhdGljIGFkZChiOiBfdmVjMywgYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKGEueCArIGIueCwgYS55ICsgYi55LCBhLnogKyBiLnopO1xuICB9XG5cbiAgc3RhdGljIHN1YihhOiBfdmVjMywgYjogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKGEueCAtIGIueCwgYS55IC0gYi55LCBhLnogLSBiLnopO1xuICB9XG5cbiAgc3RhdGljIG11bG51bShhOiBfdmVjMywgYjogbnVtYmVyKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMyhhLnggKiBiLCBhLnkgKiBiLCBhLnogKiBiKTtcbiAgfVxuXG4gIHN0YXRpYyBkaXZudW0oYTogX3ZlYzMsIGI6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgX3ZlYzMoYS54IC8gYiwgYS55IC8gYiwgYS56IC8gYik7XG4gIH1cblxuICBzdGF0aWMgbmVnKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMygtYS54LCAtYS55LCAtYS56KTtcbiAgfVxuXG4gIHN0YXRpYyBkb3QoYTogX3ZlYzMsIGI6IF92ZWMzKSB7XG4gICAgcmV0dXJuIGEueCAqIGIueCArIGEueSAqIGIueSArIGEueiAqIGIuejtcbiAgfVxuXG4gIHN0YXRpYyBjcm9zcyhhOiBfdmVjMywgYjogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKFxuICAgICAgYS55ICogYi56IC0gYS56ICogYi55LFxuICAgICAgYS56ICogYi54IC0gYS54ICogYi56LFxuICAgICAgYS54ICogYi55IC0gYi54ICogYS55XG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBsZW4yKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIGEueCAqIGEueCArIGEueSAqIGEueSArIGEueiAqIGEuejtcbiAgfVxuXG4gIC8vICByZXR1cm4gVmVjM1NldChcbiAgLy8gICAgIFAuWCAqIE0uTVswXVswXSArIFAuWSAqIE0uTVsxXVswXSArIFAuWiAqIE0uTVsyXVswXSArIE0uTVszXVswXSxcbiAgLy8gICAgIFAuWCAqIE0uTVswXVsxXSArIFAuWSAqIE0uTVsxXVsxXSArIFAuWiAqIE0uTVsyXVsxXSArIE0uTVszXVsxXSxcbiAgLy8gICAgIFAuWCAqIE0uTVswXVsyXSArIFAuWSAqIE0uTVsxXVsyXSArIFAuWiAqIE0uTVsyXVsyXSArIE0uTVszXVsyXVxuXG4gIHN0YXRpYyBsZW4oYTogX3ZlYzMpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoX3ZlYzMubGVuMihhKSk7XG4gIH1cblxuICBzdGF0aWMgbm9ybWFsaXplKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIF92ZWMzLmRpdm51bShhLCBfdmVjMy5sZW4oYSkpO1xuICB9XG5cbiAgc3RhdGljIHZlYzMoYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gW2EueCwgYS55LCBhLnpdO1xuICB9XG59XG4iLCJpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzNcIjtcclxuXHJcbmNsYXNzIHN1cmZhY2Uge1xyXG4gIEthOiBfdmVjMyA9IF92ZWMzLnNldCgwLCAwLCAwKTtcclxuICBLZDogX3ZlYzMgPSBfdmVjMy5zZXQoMCwgMCwgMCk7XHJcbiAgS3M6IF92ZWMzID0gX3ZlYzMuc2V0KDAsIDAsIDApO1xyXG4gIFBoOiBudW1iZXIgPSAwO1xyXG4gIEdldEFycmF5KCkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkthKSxcclxuICAgICAgMSxcclxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLktkKSxcclxuICAgICAgMSxcclxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLktzKSxcclxuICAgICAgdGhpcy5QaFxyXG4gICAgXTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBzcGhlcmUge1xyXG4gIE5hbWU6IHN0cmluZyA9IFwiXCI7XHJcbiAgUjogbnVtYmVyID0gMDtcclxuICBQOiBfdmVjMyA9IF92ZWMzLnNldCgwLCAwLCAwKTtcclxuICBTdXJmOiBzdXJmYWNlID0gbmV3IHN1cmZhY2UoKTtcclxuICBHZXRBcnJheSgpIHtcclxuICAgIHJldHVybiBbLi4uX3ZlYzMudmVjMyh0aGlzLlApLCB0aGlzLlJdLmNvbmNhdCh0aGlzLlN1cmYuR2V0QXJyYXkoKSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgbGV0IFNwaGVyZXM6IHNwaGVyZVtdID0gW107XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gR2V0QXJyYXlTcGhlcmVzKCkge1xyXG4gIGxldCBSZXN1bHQgPSBbU3BoZXJlcy5sZW5ndGgsIDAsIDAsIDBdO1xyXG4gIGZvciAobGV0IGVsZW1lbnQgb2YgU3BoZXJlcykge1xyXG4gICAgUmVzdWx0ID0gUmVzdWx0LmNvbmNhdChlbGVtZW50LkdldEFycmF5KCkpO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShSZXN1bHQpO1xyXG59XHJcbiIsImltcG9ydCB7IF92ZWMzIH0gZnJvbSBcIi4uL21hdGgvbWF0aHZlYzNcIjtcclxuaW1wb3J0IHsgU3BoZXJlcywgc3BoZXJlIH0gZnJvbSBcIi4uL29iamVjdHNcIjtcclxuXHJcbmZ1bmN0aW9uIFJlYWRWZWMzZnJvbVN0cmluZyhTdHI6IHN0cmluZykge1xyXG4gIGxldCBoOiBudW1iZXJbXTtcclxuICBpZiAoU3RyWzBdICE9IFwie1wiIHx8IFN0cltTdHIubGVuZ3RoIC0gMV0gIT0gXCJ9XCIpIHJldHVybiBudWxsO1xyXG4gIGggPSBTdHIuc2xpY2UoMSwgU3RyLmxlbmd0aCAtIDEpXHJcbiAgICAuc3BsaXQoXCIsXCIpXHJcbiAgICAubWFwKE51bWJlcik7XHJcblxyXG4gIGlmIChoLmxlbmd0aCA8IDMpIHJldHVybiBudWxsO1xyXG5cclxuICByZXR1cm4gX3ZlYzMuc2V0KGhbMF0sIGhbMV0sIGhbMl0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VyKFR4dDogc3RyaW5nKSB7XHJcbiAgU3BoZXJlcy5sZW5ndGggPSAwO1xyXG4gIGxldCBOYW1lOiBzdHJpbmc7XHJcbiAgbGV0IGFycmF5T2ZTdHJpbmdzID0gVHh0LnNwbGl0KFwiXFxuXCIpO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlPZlN0cmluZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgIGlmIChhcnJheU9mU3RyaW5nc1tpXVswXSA9PSBcIi9cIiAmJiBhcnJheU9mU3RyaW5nc1tpXVsxXSA9PSBcIi9cIikgY29udGludWU7XHJcbiAgICBsZXQgd29yZHMgPSBhcnJheU9mU3RyaW5nc1tpXS5zcGxpdChcIiBcIik7XHJcbiAgICBOYW1lID0gd29yZHNbMF07XHJcbiAgICBpZiAod29yZHMubGVuZ3RoID09IDEpIGNvbnRpbnVlO1xyXG4gICAgbGV0IFR5cGUgPSB3b3Jkc1sxXTtcclxuICAgIGlmIChUeXBlID09IFwic3BoZXJlXCIpIHtcclxuICAgICAgbGV0IHg6IF92ZWMzIHwgbnVsbDtcclxuICAgICAgaWYgKHdvcmRzLmxlbmd0aCAhPSA4KSBjb250aW51ZTtcclxuXHJcbiAgICAgIGxldCBTcGggPSBuZXcgc3BoZXJlKCk7XHJcbiAgICAgIFNwaC5OYW1lID0gTmFtZTtcclxuXHJcbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbMl0pO1xyXG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgZWxzZSBTcGguUCA9IHg7XHJcbiAgICAgIFNwaC5SID0gTnVtYmVyKHdvcmRzWzNdKTtcclxuXHJcbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbNF0pO1xyXG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgZWxzZSBTcGguU3VyZi5LYSA9IHg7XHJcbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbNV0pO1xyXG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgZWxzZSBTcGguU3VyZi5LZCA9IHg7XHJcbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbNl0pO1xyXG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgZWxzZSBTcGguU3VyZi5LcyA9IHg7XHJcbiAgICAgIFNwaC5TdXJmLlBoID0gTnVtYmVyKHdvcmRzWzNdKTtcclxuICAgICAgU3BoZXJlcy5wdXNoKFNwaCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IF9tYXRyNCB9IGZyb20gXCIuLi9tYXRoL21hdGhtYXQ0LmpzXCI7XG5pbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuLi9tYXRoL21hdGh2ZWMzLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBVYm9fTWF0ciB7XG4gIENhbUxvYzogX3ZlYzM7XG4gIENhbUF0OiBfdmVjMztcbiAgQ2FtUmlnaHQ6IF92ZWMzO1xuICBDYW1VcDogX3ZlYzM7XG4gIENhbURpcjogX3ZlYzM7XG4gIFByb2pEaXN0RmFyVGltZUxvY2FsOiBfdmVjMztcbiAgVGltZUdsb2JhbERlbHRhR2xvYmFsRGVsdGFMb2NhbDogX3ZlYzM7XG4gIGZsYWdzMTJGcmFtZVc6IF92ZWMzO1xuICBmbGFnczQ1RnJhbWVIOiBfdmVjMztcbiAgY29uc3RydWN0b3IoXG4gICAgQ2FtTG9jOiBfdmVjMyxcbiAgICBDYW1BdDogX3ZlYzMsXG4gICAgQ2FtUmlnaHQ6IF92ZWMzLFxuICAgIENhbVVwOiBfdmVjMyxcbiAgICBDYW1EaXI6IF92ZWMzLFxuICAgIFByb2pEaXN0RmFyVGltZUxvY2FsOiBfdmVjMyxcbiAgICBUaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsOiBfdmVjMyxcbiAgICBmbGFnczEyRnJhbWVXOiBfdmVjMyxcbiAgICBmbGFnczQ1RnJhbWVIOiBfdmVjM1xuICApIHtcbiAgICB0aGlzLkNhbUxvYyA9IENhbUxvYztcbiAgICB0aGlzLkNhbUF0ID0gQ2FtQXQ7XG4gICAgdGhpcy5DYW1SaWdodCA9IENhbVJpZ2h0O1xuICAgIHRoaXMuQ2FtVXAgPSBDYW1VcDtcbiAgICB0aGlzLkNhbURpciA9IENhbURpcjtcbiAgICB0aGlzLlByb2pEaXN0RmFyVGltZUxvY2FsID0gUHJvakRpc3RGYXJUaW1lTG9jYWw7XG5cbiAgICB0aGlzLlRpbWVHbG9iYWxEZWx0YUdsb2JhbERlbHRhTG9jYWwgPSBUaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsO1xuICAgIHRoaXMuZmxhZ3MxMkZyYW1lVyA9IGZsYWdzMTJGcmFtZVc7XG4gICAgdGhpcy5mbGFnczQ1RnJhbWVIID0gZmxhZ3M0NUZyYW1lSDtcbiAgfVxuICBHZXRBcnJheSgpIHtcbiAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtTG9jKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtQXQpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5DYW1SaWdodCksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkNhbVVwKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtRGlyKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuUHJvakRpc3RGYXJUaW1lTG9jYWwpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5UaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuZmxhZ3MxMkZyYW1lVyksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLmZsYWdzNDVGcmFtZUgpLFxuICAgICAgMVxuICAgIF0pO1xuICB9XG59XG5cbi8vIHJheTxUeXBlPiBGcmFtZSggVHlwZSBYcywgVHlwZSBZcywgVHlwZSBkeCwgVHlwZSBkeSApIGNvbnN0XG4vLyB7XG4vLyAgIHZlYzM8VHlwZT4gQSA9IERpciAqIFByb2pEaXN0O1xuLy8gICB2ZWMzPFR5cGU+IEIgPSBSaWdodCAqICgoWHMgKyAwLjUgLSBGcmFtZVcgLyAyLjApIC8gRnJhbWVXICogV3ApO1xuLy8gICB2ZWMzPFR5cGU+IEMgPSBVcCAqICgoLShZcyArIDAuNSkgKyBGcmFtZUggLyAyLjApIC8gRnJhbWVIICogSHApO1xuLy8gICB2ZWMzPFR5cGU+IFggPSB2ZWMzPFR5cGU+KEEgKyBCICsgQyk7XG4vLyAgIHJldHVybiAgcmF5PFR5cGU+KFggKyBMb2MsIFguTm9ybWFsaXppbmcoKSk7XG4vLyB9IC8qIEVuZCBvZiAnUmVzaXplJyBmdW5jdGlvbiAqL1xuXG5leHBvcnQgY2xhc3MgVUJPIHtcbiAgbmFtZTogc3RyaW5nO1xuICB1Ym9pZDogV2ViR0xCdWZmZXIgfCBudWxsO1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIHVib2lkOiBXZWJHTEJ1ZmZlciB8IG51bGwpIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMudWJvaWQgPSB1Ym9pZDtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGUoU2l6ZTogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgbGV0IGZyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgZnIpO1xuXG4gICAgZ2wuYnVmZmVyRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgU2l6ZSAqIDQsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICByZXR1cm4gbmV3IFVCTyhuYW1lLCBmcik7XG4gIH1cblxuICB1cGRhdGUoVWJvQXJyYXk6IEZsb2F0MzJBcnJheSwgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCB0aGlzLnVib2lkKTtcbiAgICBnbC5idWZmZXJTdWJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCAwLCBVYm9BcnJheSk7XG4gIH1cblxuICBhcHBseShwb2ludDogbnVtYmVyLCBTaGRObzogV2ViR0xQcm9ncmFtLCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIGxldCBibGtfbG9jID0gZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgoU2hkTm8sIHRoaXMubmFtZSk7XG5cbiAgICBnbC51bmlmb3JtQmxvY2tCaW5kaW5nKFNoZE5vLCBibGtfbG9jLCBwb2ludCk7XG4gICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVU5JRk9STV9CVUZGRVIsIHBvaW50LCB0aGlzLnVib2lkKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgX3ZlYzMgfSBmcm9tIFwiLi9tYXRodmVjM1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gRDJSKGRlZ3JlZTogbnVtYmVyKSB7XG4gIHJldHVybiAoZGVncmVlICogTWF0aC5QSSkgLyAxODA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSMkQocmFkaWFuOiBudW1iZXIpIHtcbiAgcmV0dXJuIChyYWRpYW4gLyBNYXRoLlBJKSAqIDE4MDtcbn1cblxuZXhwb3J0IGNsYXNzIF9tYXRyNCB7XG4gIGE6IG51bWJlcltdW107XG4gIGNvbnN0cnVjdG9yKFxuICAgIGEwMDogbnVtYmVyLFxuICAgIGEwMTogbnVtYmVyLFxuICAgIGEwMjogbnVtYmVyLFxuICAgIGEwMzogbnVtYmVyLFxuICAgIGExMDogbnVtYmVyLFxuICAgIGExMTogbnVtYmVyLFxuICAgIGExMjogbnVtYmVyLFxuICAgIGExMzogbnVtYmVyLFxuICAgIGEyMDogbnVtYmVyLFxuICAgIGEyMTogbnVtYmVyLFxuICAgIGEyMjogbnVtYmVyLFxuICAgIGEyMzogbnVtYmVyLFxuICAgIGEzMDogbnVtYmVyLFxuICAgIGEzMTogbnVtYmVyLFxuICAgIGEzMjogbnVtYmVyLFxuICAgIGEzMzogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuYSA9IFtcbiAgICAgIFthMDAsIGEwMSwgYTAyLCBhMDNdLFxuICAgICAgW2ExMCwgYTExLCBhMTIsIGExM10sXG4gICAgICBbYTIwLCBhMjEsIGEyMiwgYTIzXSxcbiAgICAgIFthMzAsIGEzMSwgYTMyLCBhMzNdXG4gICAgXTtcbiAgfVxuXG4gIHN0YXRpYyBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gbmV3IF9tYXRyNCgxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKS5hO1xuICB9XG4gIHN0YXRpYyBzZXQoXG4gICAgYTAwOiBudW1iZXIsXG4gICAgYTAxOiBudW1iZXIsXG4gICAgYTAyOiBudW1iZXIsXG4gICAgYTAzOiBudW1iZXIsXG4gICAgYTEwOiBudW1iZXIsXG4gICAgYTExOiBudW1iZXIsXG4gICAgYTEyOiBudW1iZXIsXG4gICAgYTEzOiBudW1iZXIsXG4gICAgYTIwOiBudW1iZXIsXG4gICAgYTIxOiBudW1iZXIsXG4gICAgYTIyOiBudW1iZXIsXG4gICAgYTIzOiBudW1iZXIsXG4gICAgYTMwOiBudW1iZXIsXG4gICAgYTMxOiBudW1iZXIsXG4gICAgYTMyOiBudW1iZXIsXG4gICAgYTMzOiBudW1iZXJcbiAgKSB7XG4gICAgcmV0dXJuIG5ldyBfbWF0cjQoXG4gICAgICBhMDAsXG4gICAgICBhMDEsXG4gICAgICBhMDIsXG4gICAgICBhMDMsXG4gICAgICBhMTAsXG4gICAgICBhMTEsXG4gICAgICBhMTIsXG4gICAgICBhMTMsXG4gICAgICBhMjAsXG4gICAgICBhMjEsXG4gICAgICBhMjIsXG4gICAgICBhMjMsXG4gICAgICBhMzAsXG4gICAgICBhMzEsXG4gICAgICBhMzIsXG4gICAgICBhMzNcbiAgICApLmE7XG4gIH1cbiAgc3RhdGljIHRyYW5zbGF0ZShhOiBfdmVjMykge1xuICAgIHJldHVybiBuZXcgX21hdHI0KDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIGEueCwgYS55LCBhLnosIDEpLmE7XG4gIH1cbiAgc3RhdGljIHNjYWxlKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIG5ldyBfbWF0cjQoYS54LCAwLCAwLCAwLCAwLCBhLnksIDAsIDAsIDAsIDAsIGEueiwgMCwgMCwgMCwgMCwgMSkuYTtcbiAgfVxuXG4gIHN0YXRpYyByb3RhdGVaKGRlZ3JlZTogbnVtYmVyKSB7XG4gICAgY29uc3QgciA9IEQyUihkZWdyZWUpLFxuICAgICAgY28gPSBNYXRoLmNvcyhyKSxcbiAgICAgIHNpID0gTWF0aC5zaW4ocik7XG4gICAgbGV0IG0gPSBfbWF0cjQuaWRlbnRpdHkoKTtcbiAgICBtWzBdWzBdID0gY287XG4gICAgbVsxXVswXSA9IC1zaTtcbiAgICBtWzBdWzFdID0gc2k7XG4gICAgbVsxXVsxXSA9IGNvO1xuXG4gICAgcmV0dXJuIG07XG4gIH1cbiAgc3RhdGljIHJvdGF0ZVgoZGVncmVlOiBudW1iZXIpIHtcbiAgICBjb25zdCByID0gRDJSKGRlZ3JlZSksXG4gICAgICBjbyA9IE1hdGguY29zKHIpLFxuICAgICAgc2kgPSBNYXRoLnNpbihyKTtcbiAgICBsZXQgbSA9IF9tYXRyNC5pZGVudGl0eSgpO1xuXG4gICAgbVsxXVsxXSA9IGNvO1xuICAgIG1bMl1bMV0gPSAtc2k7XG4gICAgbVsxXVsyXSA9IHNpO1xuICAgIG1bMl1bMl0gPSBjbztcblxuICAgIHJldHVybiBtO1xuICB9XG5cbiAgc3RhdGljIHJvdGF0ZVkoZGVncmVlOiBudW1iZXIpIHtcbiAgICBjb25zdCByID0gRDJSKGRlZ3JlZSksXG4gICAgICBjbyA9IE1hdGguY29zKHIpLFxuICAgICAgc2kgPSBNYXRoLnNpbihyKTtcbiAgICBsZXQgbSA9IF9tYXRyNC5pZGVudGl0eSgpO1xuXG4gICAgbVswXVswXSA9IGNvO1xuICAgIG1bMl1bMF0gPSBzaTtcbiAgICBtWzBdWzJdID0gLXNpO1xuICAgIG1bMl1bMl0gPSBjbztcblxuICAgIHJldHVybiBtO1xuICB9XG5cbiAgc3RhdGljIG11bG1hdHIobTE6IG51bWJlcltdW10sIG0yOiBudW1iZXJbXVtdKSB7XG4gICAgbGV0IHIgPSBfbWF0cjQuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApLFxuICAgICAgayA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNDsgaisrKSB7XG4gICAgICAgIGZvciAocltpXVtqXSA9IDAsIGsgPSAwOyBrIDwgNDsgaysrKSB7XG4gICAgICAgICAgcltpXVtqXSArPSBtMVtpXVtrXSAqIG0yW2tdW2pdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgc3RhdGljIHRyYW5zcG9zZShtOiBudW1iZXJbXVtdKSB7XG4gICAgbGV0IHIgPSBfbWF0cjQuc2V0KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICByW2ldW2pdID0gbVtqXVtpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICBzdGF0aWMgZGV0ZXJtM3gzKFxuICAgIGExMTogbnVtYmVyLFxuICAgIGExMjogbnVtYmVyLFxuICAgIGExMzogbnVtYmVyLFxuICAgIGEyMTogbnVtYmVyLFxuICAgIGEyMjogbnVtYmVyLFxuICAgIGEyMzogbnVtYmVyLFxuICAgIGEzMTogbnVtYmVyLFxuICAgIGEzMjogbnVtYmVyLFxuICAgIGEzMzogbnVtYmVyXG4gICkge1xuICAgIHJldHVybiAoXG4gICAgICBhMTEgKiBhMjIgKiBhMzMgLVxuICAgICAgYTExICogYTIzICogYTMyIC1cbiAgICAgIGExMiAqIGEyMSAqIGEzMyArXG4gICAgICBhMTIgKiBhMjMgKiBhMzEgK1xuICAgICAgYTEzICogYTIxICogYTMyIC1cbiAgICAgIGExMyAqIGEyMiAqIGEzMVxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgZGV0ZXJtKG06IG51bWJlcltdW10pIHtcbiAgICByZXR1cm4gKFxuICAgICAgbVswXVswXSAqXG4gICAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgICBtWzFdWzJdLFxuICAgICAgICAgIG1bMV1bM10sXG4gICAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgICBtWzJdWzJdLFxuICAgICAgICAgIG1bMl1bM10sXG4gICAgICAgICAgbVszXVsxXSxcbiAgICAgICAgICBtWzNdWzJdLFxuICAgICAgICAgIG1bM11bM11cbiAgICAgICAgKSAtXG4gICAgICBtWzBdWzFdICpcbiAgICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgICBtWzFdWzBdLFxuICAgICAgICAgIG1bMV1bMl0sXG4gICAgICAgICAgbVsxXVszXSxcbiAgICAgICAgICBtWzJdWzBdLFxuICAgICAgICAgIG1bMl1bMl0sXG4gICAgICAgICAgbVsyXVszXSxcbiAgICAgICAgICBtWzNdWzBdLFxuICAgICAgICAgIG1bM11bMl0sXG4gICAgICAgICAgbVszXVszXVxuICAgICAgICApICtcbiAgICAgIG1bMF1bMl0gKlxuICAgICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICAgIG1bMV1bMF0sXG4gICAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgICBtWzFdWzNdLFxuICAgICAgICAgIG1bMl1bMF0sXG4gICAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgICBtWzJdWzNdLFxuICAgICAgICAgIG1bM11bMF0sXG4gICAgICAgICAgbVszXVsxXSxcbiAgICAgICAgICBtWzNdWzNdXG4gICAgICAgICkgLVxuICAgICAgbVswXVszXSAqXG4gICAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgICAgbVsxXVswXSxcbiAgICAgICAgICBtWzFdWzFdLFxuICAgICAgICAgIG1bMV1bMl0sXG4gICAgICAgICAgbVsyXVswXSxcbiAgICAgICAgICBtWzJdWzFdLFxuICAgICAgICAgIG1bMl1bMl0sXG4gICAgICAgICAgbVszXVswXSxcbiAgICAgICAgICBtWzNdWzFdLFxuICAgICAgICAgIG1bM11bMl1cbiAgICAgICAgKVxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgaW52ZXJzZShtOiBudW1iZXJbXVtdKSB7XG4gICAgY29uc3QgZGV0ID0gX21hdHI0LmRldGVybShtKTtcbiAgICBsZXQgciA9IF9tYXRyNC5pZGVudGl0eSgpO1xuICAgIGlmIChkZXQgPT09IDApIHJldHVybiByO1xuICAgIHJbMF1bMF0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVsyXVszXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVsyXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIGRldDtcblxuICAgIHJbMV1bMF0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVsyXVszXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsyXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIC1kZXQ7XG4gICAgclsyXVswXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzNdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gZGV0O1xuICAgIHJbM11bMF0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVsyXVxuICAgICAgKSAvIC1kZXQ7XG5cbiAgICByWzBdWzFdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bMl1bM10sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bMl0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyAtZGV0O1xuXG4gICAgclsxXVsxXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzJdWzNdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzJdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gZGV0O1xuXG4gICAgclsyXVsxXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzNdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gLWRldDtcbiAgICByWzNdWzFdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bMl1cbiAgICAgICkgLyBkZXQ7XG4gICAgclswXVsyXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzJdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gZGV0O1xuICAgIHJbMV1bMl0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsyXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIC1kZXQ7XG4gICAgclsyXVsyXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gZGV0O1xuICAgIHJbM11bMl0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVsyXVxuICAgICAgKSAvIC1kZXQ7XG4gICAgclswXVszXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzJdWzNdXG4gICAgICApIC8gLWRldDtcbiAgICByWzFdWzNdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bMl1bM11cbiAgICAgICkgLyBkZXQ7XG4gICAgclsyXVszXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzNdXG4gICAgICApIC8gLWRldDtcbiAgICByWzNdWzNdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bMl1cbiAgICAgICkgLyBkZXQ7XG4gICAgcmV0dXJuIHI7XG4gIH1cbiAgc3RhdGljIGZydXN0dW0oXG4gICAgbDogbnVtYmVyLFxuICAgIHI6IG51bWJlcixcbiAgICBiOiBudW1iZXIsXG4gICAgdDogbnVtYmVyLFxuICAgIG46IG51bWJlcixcbiAgICBmOiBudW1iZXJcbiAgKSB7XG4gICAgbGV0IG0gPSBfbWF0cjQuaWRlbnRpdHkoKTtcblxuICAgIG1bMF1bMF0gPSAoMiAqIG4pIC8gKHIgLSBsKTtcbiAgICBtWzBdWzFdID0gMDtcbiAgICBtWzBdWzJdID0gMDtcbiAgICBtWzBdWzNdID0gMDtcblxuICAgIG1bMV1bMF0gPSAwO1xuICAgIG1bMV1bMV0gPSAoMiAqIG4pIC8gKHQgLSBiKTtcbiAgICBtWzFdWzJdID0gMDtcbiAgICBtWzFdWzNdID0gMDtcblxuICAgIG1bMl1bMF0gPSAociArIGwpIC8gKHIgLSBsKTtcbiAgICBtWzJdWzFdID0gKHQgKyBiKSAvICh0IC0gYik7XG4gICAgbVsyXVsyXSA9IChmICsgbikgLyAtKGYgLSBuKTtcbiAgICBtWzJdWzNdID0gLTE7XG5cbiAgICBtWzNdWzBdID0gMDtcbiAgICBtWzNdWzFdID0gMDtcbiAgICBtWzNdWzJdID0gKC0yICogbiAqIGYpIC8gKGYgLSBuKTtcbiAgICBtWzNdWzNdID0gMDtcblxuICAgIHJldHVybiBtO1xuICB9XG5cbiAgc3RhdGljIHRvYXJyKG06IG51bWJlcltdW10pIHtcbiAgICBsZXQgdiA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGcgPSAwOyBnIDwgNDsgZysrKSB7XG4gICAgICAgIHYucHVzaChtW2ldW2ddKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdjtcbiAgfVxuXG4gIHN0YXRpYyBwb2ludF90cmFuc2Zvcm0oYTogX3ZlYzMsIGI6IG51bWJlcltdW10pIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKFxuICAgICAgYS54ICogYlswXVswXSArIGEueSAqIGJbMV1bMF0gKyBhLnogKiBiWzJdWzBdICsgYlszXVswXSxcbiAgICAgIGEueCAqIGJbMF1bMV0gKyBhLnkgKiBiWzFdWzFdICsgYS56ICogYlsyXVsxXSArIGJbM11bMV0sXG4gICAgICBhLnggKiBiWzBdWzJdICsgYS55ICogYlsxXVsyXSArIGEueiAqIGJbMl1bMl0gKyBiWzNdWzJdXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyB2ZWN0b3J0X3JhbnNmb3JtKGE6IF92ZWMzLCBiOiBudW1iZXJbXVtdKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMyhcbiAgICAgIGEueCAqIGJbMF1bMF0gKyBhLnkgKiBiWzFdWzBdICsgYS56ICogYlsyXVswXSxcbiAgICAgIGEueCAqIGJbMF1bMV0gKyBhLnkgKiBiWzFdWzFdICsgYS56ICogYlsyXVsxXSxcbiAgICAgIGEueCAqIGJbMF1bMl0gKyBhLnkgKiBiWzFdWzJdICsgYS56ICogYlsyXVsyXVxuICAgICk7XG4gIH1cbiAgc3RhdGljIG11bF9tYXRyKGE6IF92ZWMzLCBiOiBudW1iZXJbXVtdKSB7XG4gICAgY29uc3QgdyA9IGEueCAqIGJbMF1bM10gKyBhLnkgKiBiWzFdWzNdICsgYS56ICogYlsyXVszXSArIGJbM11bM107XG4gICAgcmV0dXJuIG5ldyBfdmVjMyhcbiAgICAgIChhLnggKiBiWzBdWzBdICsgYS55ICogYlsxXVswXSArIGEueiAqIGJbMl1bMF0gKyBiWzNdWzBdKSAvIHcsXG4gICAgICAoYS55ICogYlswXVsxXSArIGEueSAqIGJbMV1bMV0gKyBhLnogKiBiWzJdWzFdICsgYlszXVsxXSkgLyB3LFxuICAgICAgKGEueiAqIGJbMF1bMl0gKyBhLnkgKiBiWzFdWzJdICsgYS56ICogYlsyXVsyXSArIGJbM11bMl0pIC8gd1xuICAgICk7XG4gIH1cbn1cbiIsImltcG9ydCB7IF92ZWMzIH0gZnJvbSBcIi4vbWF0aHZlYzMuanNcIjtcbmltcG9ydCB7IF9tYXRyNCB9IGZyb20gXCIuL21hdGhtYXQ0LmpzXCI7XG5cbmxldCBQcm9qU2l6ZSA9IDAuMSAvKiBQcm9qZWN0IHBsYW5lIGZpdCBzcXVhcmUgKi8sXG4gIFByb2pEaXN0ID0gMC4xIC8qIERpc3RhbmNlIHRvIHByb2plY3QgcGxhbmUgZnJvbSB2aWV3ZXIgKG5lYXIpICovLFxuICBQcm9qRmFyQ2xpcCA9IDMwMDA7IC8qIERpc3RhbmNlIHRvIHByb2plY3QgZmFyIGNsaXAgcGxhbmUgKGZhcikgKi9cblxuY2xhc3MgX2NhbWVyYSB7XG4gIFByb2pTaXplOiBudW1iZXI7XG4gIFByb2pEaXN0OiBudW1iZXI7XG4gIFByb2pGYXJDbGlwOiBudW1iZXI7XG4gIEZyYW1lVzogbnVtYmVyO1xuICBGcmFtZUg6IG51bWJlcjtcbiAgTWF0clZQOiBudW1iZXJbXVtdO1xuICBNYXRyVmlldzogbnVtYmVyW11bXTtcbiAgTWF0clByb2o6IG51bWJlcltdW107XG4gIExvYzogX3ZlYzM7XG4gIEF0OiBfdmVjMztcbiAgRGlyOiBfdmVjMztcbiAgVXA6IF92ZWMzO1xuICBSaWdodDogX3ZlYzM7XG4gIGNvbnN0cnVjdG9yKFxuICAgIFByb2pTaXplOiBudW1iZXIsXG4gICAgUHJvakRpc3Q6IG51bWJlcixcbiAgICBQcm9qRmFyQ2xpcDogbnVtYmVyLFxuICAgIE1hdHJWUDogbnVtYmVyW11bXSxcbiAgICBNYXRyVmlldzogbnVtYmVyW11bXSxcbiAgICBNYXRyUHJvajogbnVtYmVyW11bXSxcbiAgICBMb2M6IF92ZWMzLFxuICAgIEF0OiBfdmVjMyxcbiAgICBEaXI6IF92ZWMzLFxuICAgIFVwOiBfdmVjMyxcbiAgICBSaWdodDogX3ZlYzMsXG4gICAgRnJhbWVXOiBudW1iZXIsXG4gICAgRnJhbWVIOiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5Qcm9qU2l6ZSA9IFByb2pTaXplO1xuICAgIHRoaXMuUHJvakRpc3QgPSBQcm9qRGlzdDtcbiAgICB0aGlzLlByb2pGYXJDbGlwID0gUHJvakZhckNsaXA7XG4gICAgdGhpcy5NYXRyVlAgPSBNYXRyVlA7XG4gICAgdGhpcy5NYXRyVmlldyA9IE1hdHJWaWV3O1xuICAgIHRoaXMuTWF0clByb2ogPSBNYXRyUHJvajtcbiAgICB0aGlzLkxvYyA9IExvYztcbiAgICB0aGlzLkF0ID0gQXQ7XG4gICAgdGhpcy5EaXIgPSBEaXI7XG4gICAgdGhpcy5VcCA9IFVwO1xuICAgIHRoaXMuUmlnaHQgPSBSaWdodDtcbiAgICB0aGlzLkZyYW1lVyA9IEZyYW1lVztcbiAgICB0aGlzLkZyYW1lSCA9IEZyYW1lSDtcbiAgfVxuXG4gIFByb2pTZXQoKSB7XG4gICAgbGV0IHJ4LCByeTogbnVtYmVyO1xuXG4gICAgcnggPSByeSA9IFByb2pTaXplO1xuXG4gICAgaWYgKHRoaXMuRnJhbWVXID4gdGhpcy5GcmFtZUgpIHJ4ICo9IHRoaXMuRnJhbWVXIC8gdGhpcy5GcmFtZUg7XG4gICAgZWxzZSByeSAqPSB0aGlzLkZyYW1lSCAvIHRoaXMuRnJhbWVXO1xuXG4gICAgbGV0IFdwID0gcngsXG4gICAgICBIcCA9IHJ5O1xuXG4gICAgdGhpcy5NYXRyUHJvaiA9IF9tYXRyNC5mcnVzdHVtKFxuICAgICAgLXJ4IC8gMixcbiAgICAgIHJ4IC8gMixcbiAgICAgIC1yeSAvIDIsXG4gICAgICByeSAvIDIsXG4gICAgICBQcm9qRGlzdCxcbiAgICAgIFByb2pGYXJDbGlwXG4gICAgKTtcbiAgICB0aGlzLk1hdHJWUCA9IF9tYXRyNC5tdWxtYXRyKHRoaXMuTWF0clZpZXcsIHRoaXMuTWF0clByb2opO1xuICB9XG5cbiAgc3RhdGljIHZpZXcoTG9jOiBfdmVjMywgQXQ6IF92ZWMzLCBVcDE6IF92ZWMzKSB7XG4gICAgY29uc3QgRGlyID0gX3ZlYzMubm9ybWFsaXplKF92ZWMzLnN1YihBdCwgTG9jKSksXG4gICAgICBSaWdodCA9IF92ZWMzLm5vcm1hbGl6ZShfdmVjMy5jcm9zcyhEaXIsIFVwMSkpLFxuICAgICAgVXAgPSBfdmVjMy5jcm9zcyhSaWdodCwgRGlyKTtcbiAgICByZXR1cm4gX21hdHI0LnNldChcbiAgICAgIFJpZ2h0LngsXG4gICAgICBVcC54LFxuICAgICAgLURpci54LFxuICAgICAgMCxcbiAgICAgIFJpZ2h0LnksXG4gICAgICBVcC55LFxuXG4gICAgICAtRGlyLnksXG4gICAgICAwLFxuICAgICAgUmlnaHQueixcbiAgICAgIFVwLnosXG4gICAgICAtRGlyLnosXG4gICAgICAwLFxuICAgICAgLV92ZWMzLmRvdChMb2MsIFJpZ2h0KSxcbiAgICAgIC1fdmVjMy5kb3QoTG9jLCBVcCksXG4gICAgICBfdmVjMy5kb3QoTG9jLCBEaXIpLFxuICAgICAgMVxuICAgICk7XG4gIH1cbn1cbmV4cG9ydCBsZXQgY2FtOiBfY2FtZXJhO1xuXG5leHBvcnQgZnVuY3Rpb24gQ2FtU2V0KExvYzogX3ZlYzMsIEF0OiBfdmVjMywgVXAxOiBfdmVjMykge1xuICBsZXQgVXAsIERpciwgUmlnaHQ7XG4gIGxldCBNYXRyVmlldyA9IF9jYW1lcmEudmlldyhMb2MsIEF0LCBVcDEpO1xuXG4gIFVwID0gX3ZlYzMuc2V0KE1hdHJWaWV3WzBdWzFdLCBNYXRyVmlld1sxXVsxXSwgTWF0clZpZXdbMl1bMV0pO1xuICBEaXIgPSBfdmVjMy5zZXQoLU1hdHJWaWV3WzBdWzJdLCAtTWF0clZpZXdbMV1bMl0sIC1NYXRyVmlld1syXVsyXSk7XG4gIFJpZ2h0ID0gX3ZlYzMuc2V0KE1hdHJWaWV3WzBdWzBdLCBNYXRyVmlld1sxXVswXSwgTWF0clZpZXdbMl1bMF0pO1xuXG4gIGNvbnN0IHJ4ID0gUHJvalNpemUsXG4gICAgcnkgPSBQcm9qU2l6ZTtcblxuICBsZXQgTWF0clByb2ogPSBfbWF0cjQuZnJ1c3R1bShcbiAgICAgIC1yeCAvIDIsXG4gICAgICByeCAvIDIsXG4gICAgICAtcnkgLyAyLFxuICAgICAgcnkgLyAyLFxuXG4gICAgICBQcm9qRGlzdCxcbiAgICAgIFByb2pGYXJDbGlwXG4gICAgKSxcbiAgICBNYXRyVlAgPSBfbWF0cjQubXVsbWF0cihNYXRyVmlldywgTWF0clByb2opO1xuXG4gIGNhbSA9IG5ldyBfY2FtZXJhKFxuICAgIFByb2pTaXplLFxuICAgIFByb2pEaXN0LFxuICAgIFByb2pGYXJDbGlwLFxuICAgIE1hdHJWUCxcbiAgICBNYXRyVmlldyxcbiAgICBNYXRyUHJvaixcbiAgICBMb2MsXG4gICAgQXQsXG4gICAgRGlyLFxuICAgIFVwLFxuICAgIFJpZ2h0LFxuICAgIDUwMCxcbiAgICA1MDBcbiAgKTtcbn1cbiIsImltcG9ydCB7IG15VGltZXIgfSBmcm9tIFwiLi9yZXMvdGltZXJcIjtcclxuaW1wb3J0IHsgbXlJbnB1dCB9IGZyb20gXCIuL3Jlcy9pbnB1dFwiO1xyXG5pbXBvcnQgeyBwYXJzZXIgfSBmcm9tIFwiLi9yZXMvcGFyc2VyXCI7XHJcbmltcG9ydCB7IFVib19NYXRyLCBVQk8gfSBmcm9tIFwiLi9yZXMvdWJvXCI7XHJcblxyXG5pbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzNcIjtcclxuXHJcbmltcG9ydCB7IGNhbSwgQ2FtU2V0IH0gZnJvbSBcIi4vbWF0aC9tYXRoY2FtXCI7XHJcbmltcG9ydCB7IF9tYXRyNCB9IGZyb20gXCIuL21hdGgvbWF0aG1hdDRcIjtcclxuaW1wb3J0IHsgU3BoZXJlcywgR2V0QXJyYXlTcGhlcmVzIH0gZnJvbSBcIi4vb2JqZWN0c1wiO1xyXG5cclxubGV0IGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG5cclxubGV0IFVib19zZXQxOiBVQk87XHJcbmxldCBVYm9fc2V0MV9kYXRhOiBVYm9fTWF0cjtcclxubGV0IFVib19zZXQyOiBVQk87XHJcblxyXG5sZXQgRmxhZ0RhdGFPYmplY3RVcGRhdGU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuaW50ZXJmYWNlIFByb2dyYW1JbmZvIHtcclxuICBwcm9ncmFtOiBXZWJHTFByb2dyYW07XHJcbiAgYXR0cmliTG9jYXRpb25zOiB7XHJcbiAgICB2ZXJ0ZXhQb3NpdGlvbjogbnVtYmVyO1xyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRDYW0oKSB7XHJcbiAgQ2FtU2V0KF92ZWMzLnNldCgwLCAwLCAtNSksIF92ZWMzLnNldCgwLCAwLCAwKSwgX3ZlYzMuc2V0KDAsIDEsIDApKTtcclxuICBVYm9fc2V0MV9kYXRhLlByb2pEaXN0RmFyVGltZUxvY2FsLnggPSBjYW0uUHJvakRpc3Q7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckNhbSgpIHtcclxuICBsZXQgRGlzdCA9IF92ZWMzLmxlbihfdmVjMy5zdWIoY2FtLkF0LCBjYW0uTG9jKSk7XHJcbiAgbGV0IGNvc1QsIHNpblQsIGNvc1AsIHNpblAsIHBsZW4sIEF6aW11dGgsIEVsZXZhdG9yO1xyXG4gIGxldCBXcCwgSHAsIHN4LCBzeTtcclxuICBsZXQgZHY7XHJcbiAgaWYgKG15SW5wdXQuS2V5c1sxOF0pIHtcclxuICAgIFdwID0gSHAgPSBjYW0uUHJvalNpemU7XHJcbiAgICBjb3NUID0gKGNhbS5Mb2MueSAtIGNhbS5BdC55KSAvIERpc3Q7XHJcbiAgICBzaW5UID0gTWF0aC5zcXJ0KDEgLSBjb3NUICogY29zVCk7XHJcblxyXG4gICAgcGxlbiA9IERpc3QgKiBzaW5UO1xyXG4gICAgY29zUCA9IChjYW0uTG9jLnogLSBjYW0uQXQueikgLyBwbGVuO1xyXG4gICAgc2luUCA9IChjYW0uTG9jLnggLSBjYW0uQXQueCkgLyBwbGVuO1xyXG5cclxuICAgIEF6aW11dGggPSAoTWF0aC5hdGFuMihzaW5QLCBjb3NQKSAvIE1hdGguUEkpICogMTgwO1xyXG4gICAgRWxldmF0b3IgPSAoTWF0aC5hdGFuMihzaW5ULCBjb3NUKSAvIE1hdGguUEkpICogMTgwO1xyXG5cclxuICAgIGxldCBrZXkgPSBcIkFEXCI7XHJcblxyXG4gICAgQXppbXV0aCArPVxyXG4gICAgICBteVRpbWVyLmdsb2JhbERlbHRhVGltZSAqXHJcbiAgICAgIDMgKlxyXG4gICAgICAoLTMwICogbXlJbnB1dC5Nb3VzZUNsaWNrTGVmdCAqIG15SW5wdXQuTWR4KTtcclxuICAgIEVsZXZhdG9yICs9XHJcbiAgICAgIG15VGltZXIuZ2xvYmFsRGVsdGFUaW1lICpcclxuICAgICAgMiAqXHJcbiAgICAgICgtMzAgKiBteUlucHV0Lk1vdXNlQ2xpY2tMZWZ0ICogbXlJbnB1dC5NZHkpO1xyXG5cclxuICAgIGlmIChFbGV2YXRvciA8IDAuMDgpIEVsZXZhdG9yID0gMC4wODtcclxuICAgIGVsc2UgaWYgKEVsZXZhdG9yID4gMTc4LjkpIEVsZXZhdG9yID0gMTc4Ljk7XHJcblxyXG4gICAgLy8gaWYgKEF6aW11dGggPCAtNDUpIEF6aW11dGggPSAtNDU7XHJcbiAgICAvLyBlbHNlIGlmIChBemltdXRoID4gNDUpIEF6aW11dGggPSA0NTtcclxuXHJcbiAgICBEaXN0ICs9XHJcbiAgICAgIG15VGltZXIuZ2xvYmFsRGVsdGFUaW1lICpcclxuICAgICAgKDEgKyBteUlucHV0LktleXNbMTZdICogMjcpICpcclxuICAgICAgKDEuMiAqIG15SW5wdXQuTWR6KTtcclxuICAgIGlmIChEaXN0IDwgMC4xKSBEaXN0ID0gMC4xO1xyXG4gICAgLy8gY29uc29sZS5sb2coa2V5LmNoYXJDb2RlQXQoMCkpO1xyXG4gICAgaWYgKG15SW5wdXQuTW91c2VDbGlja1JpZ2h0KSB7XHJcbiAgICAgIGlmIChjYW0uRnJhbWVXID4gY2FtLkZyYW1lSCkgV3AgKj0gY2FtLkZyYW1lVyAvIGNhbS5GcmFtZUg7XHJcbiAgICAgIGVsc2UgSHAgKj0gY2FtLkZyYW1lSCAvIGNhbS5GcmFtZVc7XHJcblxyXG4gICAgICBzeCA9ICgoKC1teUlucHV0Lk1keCAqIFdwICogMTApIC8gY2FtLkZyYW1lVykgKiBEaXN0KSAvIGNhbS5Qcm9qRGlzdDtcclxuICAgICAgc3kgPSAoKChteUlucHV0Lk1keSAqIEhwICogMTApIC8gY2FtLkZyYW1lSCkgKiBEaXN0KSAvIGNhbS5Qcm9qRGlzdDtcclxuXHJcbiAgICAgIGR2ID0gX3ZlYzMuYWRkKF92ZWMzLm11bG51bShjYW0uUmlnaHQsIHN4KSwgX3ZlYzMubXVsbnVtKGNhbS5VcCwgc3kpKTtcclxuXHJcbiAgICAgIGNhbS5BdCA9IF92ZWMzLmFkZChjYW0uQXQsIGR2KTtcclxuICAgICAgY2FtLkxvYyA9IF92ZWMzLmFkZChjYW0uTG9jLCBkdik7XHJcbiAgICB9XHJcbiAgICBDYW1TZXQoXHJcbiAgICAgIF9tYXRyNC5wb2ludF90cmFuc2Zvcm0oXHJcbiAgICAgICAgbmV3IF92ZWMzKDAsIERpc3QsIDApLFxyXG4gICAgICAgIF9tYXRyNC5tdWxtYXRyKFxyXG4gICAgICAgICAgX21hdHI0Lm11bG1hdHIoX21hdHI0LnJvdGF0ZVgoRWxldmF0b3IpLCBfbWF0cjQucm90YXRlWShBemltdXRoKSksXHJcbiAgICAgICAgICBfbWF0cjQudHJhbnNsYXRlKGNhbS5BdClcclxuICAgICAgICApXHJcbiAgICAgICksXHJcbiAgICAgIGNhbS5BdCxcclxuICAgICAgbmV3IF92ZWMzKDAsIDEsIDApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgVWJvX3NldDFfZGF0YS5DYW1Mb2MgPSBjYW0uTG9jO1xyXG4gIFVib19zZXQxX2RhdGEuQ2FtQXQgPSBjYW0uQXQ7XHJcbiAgVWJvX3NldDFfZGF0YS5DYW1SaWdodCA9IGNhbS5SaWdodDtcclxuICBVYm9fc2V0MV9kYXRhLkNhbVVwID0gY2FtLlVwO1xyXG4gIFVib19zZXQxX2RhdGEuQ2FtRGlyID0gY2FtLkRpcjtcclxuXHJcbiAgLy8gICBpZiAoQW5pLT5LZXlzW1ZLX1NISUZUXSAmJiBBbmktPktleXNDbGlja1snUCddKVxyXG4gIC8vICAgICBBbmktPklzUGF1c2UgPSAhQW5pLT5Jc1BhdXNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNpemVDYW0odzogbnVtYmVyLCBoOiBudW1iZXIpIHtcclxuICBVYm9fc2V0MV9kYXRhLmZsYWdzMTJGcmFtZVcueiA9IHc7XHJcbiAgVWJvX3NldDFfZGF0YS5mbGFnczQ1RnJhbWVILnogPSBoO1xyXG4gIGNhbS5Qcm9qU2V0KCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZFNoYWRlcnMoKTogUHJvbWlzZTxQcm9ncmFtSW5mbyB8IG51bGw+IHtcclxuICBjb25zdCB2c1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICBcIi4vc2hhZGVyL21hcmNoLnZlcnRleC5nbHNsXCIgKyBcIj9ub2NhY2hlXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICk7XHJcbiAgY29uc3QgdnNUZXh0ID0gYXdhaXQgdnNSZXNwb25zZS50ZXh0KCk7XHJcbiAgLy8gY29uc29sZS5sb2codnNUZXh0KTtcclxuXHJcbiAgY29uc3QgZnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgXCIuL3NoYWRlci9tYXJjaC5mcmFnbWVudC5nbHNsXCIgKyBcIj9ub2NhY2hlXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICk7XHJcbiAgY29uc3QgZnNUZXh0ID0gYXdhaXQgZnNSZXNwb25zZS50ZXh0KCk7XHJcbiAgY29uc3QgZHRSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgXCIuL2RhdGEudHh0XCIgKyBcIj9ub2NhY2hlXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICk7XHJcbiAgaWYgKEZsYWdEYXRhT2JqZWN0VXBkYXRlKSB7XHJcbiAgICBjb25zdCBkdFRleHQgPSBhd2FpdCBkdFJlc3BvbnNlLnRleHQoKTtcclxuICAgIHBhcnNlcihkdFRleHQpO1xyXG4gICAgRmxhZ0RhdGFPYmplY3RVcGRhdGUgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKFNwaGVyZXMpO1xyXG4gICAgVWJvX3NldDIudXBkYXRlKEdldEFycmF5U3BoZXJlcygpLCBnbCk7XHJcbiAgfVxyXG4gIGNvbnN0IHNoYWRlclByb2dyYW0gPSBpbml0U2hhZGVyUHJvZ3JhbSh2c1RleHQsIGZzVGV4dCk7XHJcbiAgaWYgKCFzaGFkZXJQcm9ncmFtKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgY29uc3QgcHJvZ3JhbUluZm86IFByb2dyYW1JbmZvID0ge1xyXG4gICAgcHJvZ3JhbTogc2hhZGVyUHJvZ3JhbSxcclxuICAgIGF0dHJpYkxvY2F0aW9uczoge1xyXG4gICAgICB2ZXJ0ZXhQb3NpdGlvbjogZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbSwgXCJpbl9wb3NcIilcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gcHJvZ3JhbUluZm87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRTaGFkZXIodHlwZTogbnVtYmVyLCBzb3VyY2U6IHN0cmluZykge1xyXG4gIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcclxuICBpZiAoIXNoYWRlcikgcmV0dXJuIG51bGw7XHJcbiAgLy8gU2VuZCB0aGUgc291cmNlIHRvIHRoZSBzaGFkZXIgb2JqZWN0XHJcblxyXG4gIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XHJcblxyXG4gIC8vIENvbXBpbGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblxyXG4gIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcclxuXHJcbiAgLy8gU2VlIGlmIGl0IGNvbXBpbGVkIHN1Y2Nlc3NmdWxseVxyXG5cclxuICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgYWxlcnQoXHJcbiAgICAgIGBBbiBlcnJvciBvY2N1cnJlZCBjb21waWxpbmcgdGhlIHNoYWRlcnM6ICR7Z2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpfWBcclxuICAgICk7XHJcbiAgICBnbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHNoYWRlcjtcclxufVxyXG5cclxuLy9cclxuLy8gSW5pdGlhbGl6ZSBhIHNoYWRlciBwcm9ncmFtLCBzbyBXZWJHTCBrbm93cyBob3cgdG8gZHJhdyBvdXIgZGF0YVxyXG4vL1xyXG5mdW5jdGlvbiBpbml0U2hhZGVyUHJvZ3JhbSh2c1NvdXJjZTogc3RyaW5nLCBmc1NvdXJjZTogc3RyaW5nKSB7XHJcbiAgY29uc3QgdmVydGV4U2hhZGVyID0gbG9hZFNoYWRlcihnbC5WRVJURVhfU0hBREVSLCB2c1NvdXJjZSk7XHJcbiAgaWYgKCF2ZXJ0ZXhTaGFkZXIpIHJldHVybjtcclxuICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGxvYWRTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSLCBmc1NvdXJjZSk7XHJcbiAgaWYgKCFmcmFnbWVudFNoYWRlcikgcmV0dXJuO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblxyXG4gIGNvbnN0IHNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgaWYgKCFzaGFkZXJQcm9ncmFtKSByZXR1cm47XHJcbiAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcbiAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuICBnbC5saW5rUHJvZ3JhbShzaGFkZXJQcm9ncmFtKTtcclxuXHJcbiAgLy8gSWYgY3JlYXRpbmcgdGhlIHNoYWRlciBwcm9ncmFtIGZhaWxlZCwgYWxlcnRcclxuXHJcbiAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHNoYWRlclByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgYWxlcnQoXHJcbiAgICAgIGBVbmFibGUgdG8gaW5pdGlhbGl6ZSB0aGUgc2hhZGVyIHByb2dyYW06ICR7Z2wuZ2V0UHJvZ3JhbUluZm9Mb2coXHJcbiAgICAgICAgc2hhZGVyUHJvZ3JhbVxyXG4gICAgICApfWBcclxuICAgICk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHJldHVybiBzaGFkZXJQcm9ncmFtO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0UG9zaXRpb25CdWZmZXIoKTogV2ViR0xCdWZmZXIgfCBudWxsIHtcclxuICAvLyBDcmVhdGUgYSBidWZmZXIgZm9yIHRoZSBzcXVhcmUncyBwb3NpdGlvbnMuXHJcbiAgY29uc3QgcG9zaXRpb25CdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHJcbiAgLy8gU2VsZWN0IHRoZSBwb3NpdGlvbkJ1ZmZlciBhcyB0aGUgb25lIHRvIGFwcGx5IGJ1ZmZlclxyXG4gIC8vIG9wZXJhdGlvbnMgdG8gZnJvbSBoZXJlIG91dC5cclxuICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xyXG5cclxuICAvLyBOb3cgY3JlYXRlIGFuIGFycmF5IG9mIHBvc2l0aW9ucyBmb3IgdGhlIHNxdWFyZS5cclxuICBjb25zdCBwb3NpdGlvbnMgPSBbMS4wLCAxLjAsIC0xLjAsIDEuMCwgMS4wLCAtMS4wLCAtMS4wLCAtMS4wXTtcclxuXHJcbiAgLy8gTm93IHBhc3MgdGhlIGxpc3Qgb2YgcG9zaXRpb25zIGludG8gV2ViR0wgdG8gYnVpbGQgdGhlXHJcbiAgLy8gc2hhcGUuIFdlIGRvIHRoaXMgYnkgY3JlYXRpbmcgYSBGbG9hdDMyQXJyYXkgZnJvbSB0aGVcclxuICAvLyBKYXZhU2NyaXB0IGFycmF5LCB0aGVuIHVzZSBpdCB0byBmaWxsIHRoZSBjdXJyZW50IGJ1ZmZlci5cclxuICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gIHJldHVybiBwb3NpdGlvbkJ1ZmZlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEJ1ZmZlcnMge1xyXG4gIHBvc2l0aW9uOiBXZWJHTEJ1ZmZlciB8IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRCdWZmZXJzKCk6IEJ1ZmZlcnMge1xyXG4gIGNvbnN0IHBvc2l0aW9uQnVmZmVyID0gaW5pdFBvc2l0aW9uQnVmZmVyKCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwb3NpdGlvbjogcG9zaXRpb25CdWZmZXJcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRQb3NpdGlvbkF0dHJpYnV0ZShidWZmZXJzOiBCdWZmZXJzLCBwcm9ncmFtSW5mbzogUHJvZ3JhbUluZm8pIHtcclxuICBjb25zdCBudW1Db21wb25lbnRzID0gMjsgLy8gcHVsbCBvdXQgMiB2YWx1ZXMgcGVyIGl0ZXJhdGlvblxyXG4gIGNvbnN0IHR5cGUgPSBnbC5GTE9BVDsgLy8gdGhlIGRhdGEgaW4gdGhlIGJ1ZmZlciBpcyAzMmJpdCBmbG9hdHNcclxuICBjb25zdCBub3JtYWxpemUgPSBmYWxzZTsgLy8gZG9uJ3Qgbm9ybWFsaXplXHJcbiAgY29uc3Qgc3RyaWRlID0gMDsgLy8gaG93IG1hbnkgYnl0ZXMgdG8gZ2V0IGZyb20gb25lIHNldCBvZiB2YWx1ZXMgdG8gdGhlIG5leHRcclxuICAvLyAwID0gdXNlIHR5cGUgYW5kIG51bUNvbXBvbmVudHMgYWJvdmVcclxuICBjb25zdCBvZmZzZXQgPSAwOyAvLyBob3cgbWFueSBieXRlcyBpbnNpZGUgdGhlIGJ1ZmZlciB0byBzdGFydCBmcm9tXHJcbiAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcnMucG9zaXRpb24pO1xyXG4gIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoXHJcbiAgICBwcm9ncmFtSW5mby5hdHRyaWJMb2NhdGlvbnMudmVydGV4UG9zaXRpb24sXHJcbiAgICBudW1Db21wb25lbnRzLFxyXG4gICAgdHlwZSxcclxuICAgIG5vcm1hbGl6ZSxcclxuICAgIHN0cmlkZSxcclxuICAgIG9mZnNldFxyXG4gICk7XHJcbiAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocHJvZ3JhbUluZm8uYXR0cmliTG9jYXRpb25zLnZlcnRleFBvc2l0aW9uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd1NjZW5lKFxyXG4gIHByb2dyYW1JbmZvOiBQcm9ncmFtSW5mbyB8IG51bGwsXHJcbiAgYnVmZmVyczogQnVmZmVycyxcclxuICBVbmk6IFdlYkdMVW5pZm9ybUxvY2F0aW9uXHJcbikge1xyXG4gIGdsLmNsZWFyQ29sb3IoMC4yOCwgMC40NywgMC44LCAxLjApOyAvLyBDbGVhciB0byBibGFjaywgZnVsbHkgb3BhcXVlXHJcbiAgZ2wuY2xlYXJEZXB0aCgxLjApOyAvLyBDbGVhciBldmVyeXRoaW5nXHJcbiAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpOyAvLyBFbmFibGUgZGVwdGggdGVzdGluZ1xyXG4gIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpOyAvLyBOZWFyIHRoaW5ncyBvYnNjdXJlIGZhciB0aGluZ3NcclxuXHJcbiAgLy8gQ2xlYXIgdGhlIGNhbnZhcyBiZWZvcmUgd2Ugc3RhcnQgZHJhd2luZyBvbiBpdC5cclxuXHJcbiAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gIGlmIChwcm9ncmFtSW5mbyA9PSBudWxsKSByZXR1cm47XHJcbiAgc2V0UG9zaXRpb25BdHRyaWJ1dGUoYnVmZmVycywgcHJvZ3JhbUluZm8pO1xyXG5cclxuICAvLyBUZWxsIFdlYkdMIHRvIHVzZSBvdXIgcHJvZ3JhbSB3aGVuIGRyYXdpbmdcclxuXHJcbiAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtSW5mby5wcm9ncmFtKTtcclxuICBVYm9fc2V0MS5hcHBseSgwLCBwcm9ncmFtSW5mby5wcm9ncmFtLCBnbCk7XHJcbiAgVWJvX3NldDIuYXBwbHkoMSwgcHJvZ3JhbUluZm8ucHJvZ3JhbSwgZ2wpO1xyXG4gIGNvbnN0IG9mZnNldCA9IDA7XHJcbiAgY29uc3QgdmVydGV4Q291bnQgPSA0O1xyXG4gIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVfU1RSSVAsIG9mZnNldCwgdmVydGV4Q291bnQpO1xyXG59XHJcbmxldCBNZCA9IFswLCAwXSxcclxuICBNb3VzZUNsaWNrID0gWzAsIDBdLFxyXG4gIFdoZWVsID0gMCxcclxuICBLZXlzID0gbmV3IEFycmF5KDI1NSkuZmlsbCgwKTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XHJcbiAgY29uc3QgdnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgXCIuL3NoYWRlci9tYXJjaC52ZXJ0ZXguZ2xzbFwiICsgXCI/bm9jYWNoZVwiICsgbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICApO1xyXG4gIGNvbnN0IHZzVGV4dCA9IGF3YWl0IHZzUmVzcG9uc2UudGV4dCgpO1xyXG4gIGNvbnNvbGUubG9nKHZzVGV4dCk7XHJcbiAgY29uc3QgZnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgXCIuL3NoYWRlci9tYXJjaC5mcmFnbWVudC5nbHNsXCIgKyBcIj9ub2NhY2hlXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICk7XHJcbiAgY29uc3QgZnNUZXh0ID0gYXdhaXQgZnNSZXNwb25zZS50ZXh0KCk7XHJcbiAgY29uc29sZS5sb2coZnNUZXh0KTtcclxuXHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnbGNhbnZhc1wiKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICBpZiAoIWNhbnZhcykge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICAvLyBJbml0aWFsaXplIHRoZSBHTCBjb250ZXh0XHJcbiAgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG4gIGdsLmNhbnZhcy53aWR0aCA9IHc7XHJcbiAgZ2wuY2FudmFzLmhlaWdodCA9IGg7XHJcblxyXG4gIC8vIE9ubHkgY29udGludWUgaWYgV2ViR0wgaXMgYXZhaWxhYmxlIGFuZCB3b3JraW5nXHJcbiAgaWYgKGdsID09PSBudWxsKSB7XHJcbiAgICBhbGVydChcclxuICAgICAgXCJVbmFibGUgdG8gaW5pdGlhbGl6ZSBXZWJHTC4gWW91ciBicm93c2VyIG9yIG1hY2hpbmUgbWF5IG5vdCBzdXBwb3J0IGl0LlwiXHJcbiAgICApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0IGNsZWFyIGNvbG9yIHRvIGJsYWNrLCBmdWxseSBvcGFxdWVcclxuICBnbC5jbGVhckNvbG9yKDAuMjgsIDAuNDcsIDAuOCwgMS4wKTtcclxuICAvLyBDbGVhciB0aGUgY29sb3IgYnVmZmVyIHdpdGggc3BlY2lmaWVkIGNsZWFyIGNvbG9yXHJcbiAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XHJcblxyXG4gIGxldCBzaGFkZXJQcm9ncmFtID0gaW5pdFNoYWRlclByb2dyYW0odnNUZXh0LCBmc1RleHQpO1xyXG4gIGlmICghc2hhZGVyUHJvZ3JhbSkgcmV0dXJuO1xyXG5cclxuICBsZXQgcHJvZ3JhbUluZm86IFByb2dyYW1JbmZvIHwgbnVsbCA9IHtcclxuICAgIHByb2dyYW06IHNoYWRlclByb2dyYW0sXHJcbiAgICBhdHRyaWJMb2NhdGlvbnM6IHtcclxuICAgICAgdmVydGV4UG9zaXRpb246IGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW0sIFwiaW5fcG9zXCIpXHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCBVbmkgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtLCBcInRpbWVcIik7XHJcbiAgY29uc3QgYnVmZmVycyA9IGluaXRCdWZmZXJzKCk7XHJcbiAgVWJvX3NldDFfZGF0YSA9IG5ldyBVYm9fTWF0cihcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKVxyXG4gICk7XHJcbiAgVWJvX3NldDEgPSBVQk8uY3JlYXRlKFVib19zZXQxX2RhdGEuR2V0QXJyYXkoKS5sZW5ndGgsIFwiQmFzZURhdGFcIiwgZ2wpO1xyXG4gIFVib19zZXQyID0gVUJPLmNyZWF0ZSgxNiAqIDEwICsgNCwgXCJTcGhlcmVcIiwgZ2wpO1xyXG4gIGluaXRDYW0oKTtcclxuICBnbC52aWV3cG9ydCgwLCAwLCB3LCBoKTtcclxuICByZXNpemVDYW0odywgaCk7XHJcblxyXG4gIGNvbnN0IHJlbmRlciA9IGFzeW5jICgpID0+IHtcclxuICAgIGxldCBwcm9ncmFtSW5mID0gYXdhaXQgcmVsb2FkU2hhZGVycygpO1xyXG4gICAgbXlUaW1lci5SZXNwb25zZSgpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZiAoZS5idXR0b24gPT0gMCkge1xyXG4gICAgICAgIE1vdXNlQ2xpY2tbMF0gPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlLmJ1dHRvbiA9PSAyKSB7XHJcbiAgICAgICAgTW91c2VDbGlja1sxXSA9IDE7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xyXG4gICAgICBpZiAoZS5idXR0b24gPT0gMCkge1xyXG4gICAgICAgIE1vdXNlQ2xpY2tbMF0gPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlLmJ1dHRvbiA9PSAyKSB7XHJcbiAgICAgICAgTW91c2VDbGlja1sxXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlKSA9PiB7XHJcbiAgICAgIE1kWzBdID0gZS5tb3ZlbWVudFg7XHJcbiAgICAgIE1kWzFdID0gZS5tb3ZlbWVudFk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgS2V5c1tlLmtleUNvZGVdID0gMTtcclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKGUpID0+IHtcclxuICAgICAgS2V5c1tlLmtleUNvZGVdID0gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGUpID0+IHtcclxuICAgICAgV2hlZWwgPSBlLmRlbHRhWTtcclxuICAgIH0pO1xyXG5cclxuICAgIG15SW5wdXQucmVzcG9uc2UoTWQsIE1vdXNlQ2xpY2ssIFdoZWVsLCBLZXlzKTtcclxuICAgIGlmIChteUlucHV0LktleXNDbGlja1s4Ml0pIEZsYWdEYXRhT2JqZWN0VXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICBNZFswXSA9IE1kWzFdID0gMDtcclxuICAgIHJlbmRlckNhbSgpO1xyXG4gICAgVWJvX3NldDFfZGF0YS5UaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsLnggPSBteVRpbWVyLmdsb2JhbFRpbWU7XHJcbiAgICBVYm9fc2V0MS51cGRhdGUoVWJvX3NldDFfZGF0YS5HZXRBcnJheSgpLCBnbCk7XHJcbiAgICBkcmF3U2NlbmUocHJvZ3JhbUluZiwgYnVmZmVycywgVW5pKTtcclxuICAgIFdoZWVsID0gMDtcclxuICAgIEtleXMuZmlsbCgwKTtcclxuICAgIGNvbnNvbGUubG9nKG15VGltZXIuRlBTKTtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcclxuICB9O1xyXG4gIHJlbmRlcigpO1xyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KSA9PiB7XHJcbiAgbGV0IHc6IG51bWJlciA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gIGxldCBoOiBudW1iZXIgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgbWFpbih3LCBoKTtcclxufSk7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoZXZlbnQpID0+IHtcclxuICBsZXQgdzogbnVtYmVyID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgbGV0IGg6IG51bWJlciA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICBnbC5jYW52YXMud2lkdGggPSB3O1xyXG4gIGdsLmNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIGdsLnZpZXdwb3J0KDAsIDAsIHcsIGgpO1xyXG4gIHJlc2l6ZUNhbSh3LCBoKTtcclxufSk7XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUVBLE1BQU0sSUFBSSxDQUFBO1FBQ1IsT0FBTyxHQUFBO0lBQ0wsUUFBQSxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ3hCLFFBQUEsSUFBSSxDQUFDLEdBQ0gsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLE1BQU07Z0JBQy9CLElB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QyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRWIsUUFBQSxPQUFPLENBQUMsQ0FBQztTQUNWO1FBRUQsT0FBTyxPQUFPLENBQUMsTUFBYyxFQUFBO1lBQzNCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFDbkIsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ2hCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLFFBQUEsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUViLFFBQUEsT0FBTyxDQUFDLENBQUM7U0FDVjtJQUVELElBQUEsT0FBTyxPQUFPLENBQUMsRUFBYyxFQUFFLEVBQWMsRUFBQTtJQUMzQyxRQUFBLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQ2hFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDUixRQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxF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Q0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUjtJQUNILFlBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLGdCQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1I7SUFDSCxZQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxnQkFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0g7U0FDSDtRQUVELE9BQU8sT0FBTyxDQUFDLENBQWEsRUFBQTtZQUMxQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLFFBQUEsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLElBQUksR0FBRyxLQUFLLENBQUM7SUFBRSxZQUFBLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFFWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUVYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFDRCxJQUFBLE9BQU8sT0FBTyxDQUNaLENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUFBO0lBRVQsUUFBQSxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFMUIsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1osUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVaLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUIsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVosUUFBQSxPQUFPLENBQUMsQ0FBQztTQUNWO1FBRUQsT0FBTyxLQUFLLENBQUMsQ0FBYSxFQUFBO1lBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUVYLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUMxQixZQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Y7SUFFRCxRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFFRCxJQUFBLE9BQU8sZUFBZSxDQUFDLENBQVEsRUFBRSxDQUFhLEVBQUE7SUFDNUMsUUFBQSxPQUFPLElBQUksS0FBSyxDQUNkLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdkQsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RCxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3hELENBQUM7U0FDSDtJQUVELElBQUEsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFRLEVBQUUsQ0FBYSxFQUFBO1lBQzdDLE9BQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDOUMsQ0FBQztTQUNIO0lBQ0QsSUFBQSxPQUFPLFFBQVEsQ0FBQyxDQUFRLEVBQUUsQ0FBYSxFQUFBO1lBQ3JDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxRQUFBLE9BQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUM3RCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQzdELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdB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
