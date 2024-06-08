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
        Kr = _vec3.set(0, 0, 0);
        Kt = _vec3.set(0, 0, 0);
        RefractionCoef = 0;
        Decay = 0;
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
            if (Name == "scene") {
                if (words.length != 6)
                    continue;
                let x;
                x = ReadVec3fromString(words[1]);
                if (x == null)
                    continue;
                exports.Ubo_set1_data.AmbientColor = x;
                x = ReadVec3fromString(words[2]);
                if (x == null)
                    continue;
                exports.Ubo_set1_data.BackgroundColor = x;
                exports.Ubo_set1_data.RefractionCoef = Number(words[3]);
                exports.Ubo_set1_data.Decay = Number(words[4]);
                exports.Ubo_set1_data.MaxRecLevel = Number(words[5]);
            }
            if (Type == "sphere") {
                let x;
                if (words.length != 12)
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
                Sph.Surf.Ph = Number(words[7]);
                x = ReadVec3fromString(words[8]);
                if (x == null)
                    continue;
                else
                    Sph.Surf.Kr = x;
                x = ReadVec3fromString(words[9]);
                if (x == null)
                    continue;
                else
                    Sph.Surf.Kt = x;
                Sph.Surf.RefractionCoef = Number(words[10]);
                Sph.Surf.Decay = Number(words[11]);
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
        AmbientColor;
        BackgroundColor;
        RefractionCoef;
        Decay;
        MaxRecLevel;
        constructor(CamLoc, CamAt, CamRight, CamUp, CamDir, ProjDistFarTimeLocal, TimeGlobalDeltaGlobalDeltaLocal, flags12FrameW, flags45FrameH, AmbientColor, BackgroundColor, RefractionCoef, Decay, MaxRecLevel) {
            this.CamLoc = CamLoc;
            this.CamAt = CamAt;
            this.CamRight = CamRight;
            this.CamUp = CamUp;
            this.CamDir = CamDir;
            this.ProjDistFarTimeLocal = ProjDistFarTimeLocal;
            this.TimeGlobalDeltaGlobalDeltaLocal = TimeGlobalDeltaGlobalDeltaLocal;
            this.flags12FrameW = flags12FrameW;
            this.flags45FrameH = flags45FrameH;
            this.AmbientColor = AmbientColor;
            this.BackgroundColor = BackgroundColor;
            this.RefractionCoef = RefractionCoef;
            this.Decay = Decay;
            this.MaxRecLevel = MaxRecLevel;
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
                1,
                ..._vec3.vec3(this.AmbientColor),
                1,
                ..._vec3.vec3(this.BackgroundColor),
                1,
                this.RefractionCoef,
                this.Decay,
                this.MaxRecLevel,
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
    exports.Ubo_set1_data = void 0;
    let Ubo_set2;
    function initCam() {
        CamSet(_vec3.set(0, 0, -5), _vec3.set(0, 0, 0), _vec3.set(0, 1, 0));
        exports.Ubo_set1_data.ProjDistFarTimeLocal.x = cam.ProjDist;
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
        exports.Ubo_set1_data.CamLoc = cam.Loc;
        exports.Ubo_set1_data.CamAt = cam.At;
        exports.Ubo_set1_data.CamRight = cam.Right;
        exports.Ubo_set1_data.CamUp = cam.Up;
        exports.Ubo_set1_data.CamDir = cam.Dir;
        //   if (Ani->Keys[VK_SHIFT] && Ani->KeysClick['P'])
        //     Ani->IsPause = !Ani->IsPause;
    }
    function resizeCam(w, h) {
        exports.Ubo_set1_data.flags12FrameW.z = w;
        exports.Ubo_set1_data.flags45FrameH.z = h;
        cam.ProjSet();
    }
    async function reloadShaders() {
        const vsResponse = await fetch("./shader/march.vertex.glsl" + "?nocache" + new Date().getTime());
        const vsText = await vsResponse.text();
        // console.log(vsText);
        const fsResponse = await fetch("./shader/march.fragment.glsl" + "?nocache" + new Date().getTime());
        const fsText = await fsResponse.text();
        const dtResponse = await fetch("./data.txt" + "?nocache" + new Date().getTime());
        const dtText = await dtResponse.text();
        parser(dtText);
        console.log(Spheres);
        Ubo_set2.update(GetArraySpheres(), gl);
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
        let programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "in_pos")
            }
        };
        gl.getAttribLocation(shaderProgram, "time");
        const buffers = initBuffers();
        exports.Ubo_set1_data = new Ubo_Matr(new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), new _vec3(0, 0, 0), 0, 0, 0);
        Ubo_set1 = UBO.create(exports.Ubo_set1_data.GetArray().length, "BaseData", gl);
        Ubo_set2 = UBO.create(24 * 10 + 4, "Sphere", gl);
        initCam();
        gl.viewport(0, 0, w, h);
        resizeCam(w, h);
        let programInf;
        programInf = programInfo;
        programInf = await reloadShaders();
        const render = async () => {
            if (myInput.KeysClick[82])
                programInf = await reloadShaders();
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
            Md[0] = Md[1] = 0;
            renderCam();
            exports.Ubo_set1_data.TimeGlobalDeltaGlobalDeltaLocal.x = myTimer.globalTime;
            Ubo_set1.update(exports.Ubo_set1_data.GetArray(), gl);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vcmVzL3RpbWVyLnRzIiwiLi4vcmVzL2lucHV0LnRzIiwiLi4vbWF0aC9tYXRodmVjMy50cyIsIi4uL29iamVjdHMudHMiLCIuLi9yZXMvcGFyc2VyLnRzIiwiLi4vcmVzL3Viby50cyIsIi4uL21hdGgvbWF0aG1hdDQudHMiLCIuLi9tYXRoL21hdGhjYW0udHMiLCIuLi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCB7IFVCTywgVWJvX2NlbGwgfSBmcm9tIFwiLi9ybmQvcmVzL3Viby5qc1wiO1xuLy8gaW1wb3J0IHsgY2FtIH0gZnJvbSBcIi4vbWF0aC9tYXRoY2FtLmpzXCI7XG4vLyBpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzMuanNcIjtcbi8vIGltcG9ydCB7IENhbVVCTyB9IGZyb20gXCIuL3JuZC9ybmRiYXNlLmpzXCI7XG5cbmNsYXNzIFRpbWUge1xuICBnZXRUaW1lKCk6IG51bWJlciB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IHQgPVxuICAgICAgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAvIDEwMDAuMCArXG4gICAgICBkYXRlLmdldFNlY29uZHMoKSArXG4gICAgICBkYXRlLmdldE1pbnV0ZXMoKSAqIDYwO1xuICAgIHJldHVybiB0O1xuICB9XG5cbiAgZ2xvYmFsVGltZTogbnVtYmVyO1xuICBsb2NhbFRpbWU6IG51bWJlcjtcbiAgZ2xvYmFsRGVsdGFUaW1lOiBudW1iZXI7XG4gIHBhdXNlVGltZTogbnVtYmVyO1xuICBsb2NhbERlbHRhVGltZTogbnVtYmVyO1xuICBmcmFtZUNvdW50ZXI6IG51bWJlcjtcbiAgc3RhcnRUaW1lOiBudW1iZXI7XG4gIG9sZFRpbWU6IG51bWJlcjtcbiAgb2xkVGltZUZQUzogbnVtYmVyO1xuICBpc1BhdXNlOiBib29sZWFuO1xuICBGUFM6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gRmlsbCB0aW1lciBnbG9iYWwgZGF0YVxuICAgIHRoaXMuZ2xvYmFsVGltZSA9IHRoaXMubG9jYWxUaW1lID0gdGhpcy5nZXRUaW1lKCk7XG4gICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0aGlzLmxvY2FsRGVsdGFUaW1lID0gMDtcblxuICAgIC8vIEZpbGwgdGltZXIgc2VtaSBnbG9iYWwgZGF0YVxuICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5vbGRUaW1lID0gdGhpcy5vbGRUaW1lRlBTID0gdGhpcy5nbG9iYWxUaW1lO1xuICAgIHRoaXMuZnJhbWVDb3VudGVyID0gMDtcbiAgICB0aGlzLmlzUGF1c2UgPSBmYWxzZTtcbiAgICB0aGlzLkZQUyA9IDMwLjA7XG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xuICB9XG5cbiAgUmVzcG9uc2UoKSB7XG4gICAgbGV0IHQgPSB0aGlzLmdldFRpbWUoKTtcbiAgICAvLyBHbG9iYWwgdGltZVxuICAgIHRoaXMuZ2xvYmFsVGltZSA9IHQ7XG4gICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0IC0gdGhpcy5vbGRUaW1lO1xuICAgIC8vIFRpbWUgd2l0aCBwYXVzZVxuICAgIGlmICh0aGlzLmlzUGF1c2UpIHtcbiAgICAgIHRoaXMubG9jYWxEZWx0YVRpbWUgPSAwO1xuICAgICAgdGhpcy5wYXVzZVRpbWUgKz0gdCAtIHRoaXMub2xkVGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbERlbHRhVGltZSA9IHRoaXMuZ2xvYmFsRGVsdGFUaW1lO1xuICAgICAgdGhpcy5sb2NhbFRpbWUgPSB0IC0gdGhpcy5wYXVzZVRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICB9XG4gICAgLy8gRlBTXG4gICAgdGhpcy5mcmFtZUNvdW50ZXIrKztcbiAgICBpZiAodCAtIHRoaXMub2xkVGltZUZQUyA+IDMpIHtcbiAgICAgIHRoaXMuRlBTID0gdGhpcy5mcmFtZUNvdW50ZXIgLyAodCAtIHRoaXMub2xkVGltZUZQUyk7XG4gICAgICB0aGlzLm9sZFRpbWVGUFMgPSB0O1xuICAgICAgdGhpcy5mcmFtZUNvdW50ZXIgPSAwO1xuICAgIH1cbiAgICB0aGlzLm9sZFRpbWUgPSB0O1xuICB9XG59XG5cbmV4cG9ydCBsZXQgbXlUaW1lciA9IG5ldyBUaW1lKCk7XG4iLCJjbGFzcyBJblB1dCB7XG4gIEtleXM6IG51bWJlcltdO1xuICBLZXlzQ2xpY2s6IG51bWJlcltdO1xuICBNeDogbnVtYmVyO1xuICBNeTogbnVtYmVyO1xuICBNejogbnVtYmVyO1xuICBNZHg6IG51bWJlcjtcbiAgTWR5OiBudW1iZXI7XG4gIE1kejogbnVtYmVyO1xuXG4gIE1vdXNlQ2xpY2tMZWZ0OiBudW1iZXI7XG4gIE1vdXNlQ2xpY2tSaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKE1vdXNlQ2xpY2s6IG51bWJlcltdLCBLZXlzOiBudW1iZXJbXSkge1xuICAgIHRoaXMuS2V5cyA9IHRoaXMuS2V5c0NsaWNrID0gS2V5cztcbiAgICB0aGlzLk14ID0gdGhpcy5NeSA9IHRoaXMuTXogPSB0aGlzLk1keCA9IHRoaXMuTWR5ID0gdGhpcy5NZHogPSAwO1xuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxuXG4gIHJlc3BvbnNlKE06IG51bWJlcltdLCBNb3VzZUNsaWNrOiBudW1iZXJbXSwgV2hlZWw6IG51bWJlciwgS2V5czogbnVtYmVyW10pIHtcbiAgICAvLyBpZiAoS2V5c1sxN10gIT0gMClcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHRoaXMuS2V5c0NsaWNrW2ldID0gS2V5c1tpXSAmJiAhdGhpcy5LZXlzW2ldID8gMSA6IDA7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHRoaXMuS2V5c1tpXSA9IEtleXNbaV07XG4gICAgfVxuXG4gICAgdGhpcy5NZHggPSBNWzBdO1xuICAgIHRoaXMuTWR5ID0gTVsxXTtcblxuICAgIC8vIHRoaXMuTXggPSBNWzBdO1xuICAgIC8vIHRoaXMuTXkgPSBNWzFdO1xuICAgIHRoaXMuTWR6ID0gV2hlZWw7XG4gICAgdGhpcy5NeiArPSBXaGVlbDtcblxuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxufSAvLyBFbmQgb2YgJ0lucHV0JyBmdW5jdGlvblxuXG5leHBvcnQgbGV0IG15SW5wdXQgPSBuZXcgSW5QdXQoWzAsIDBdLCBbXSk7XG4iLCJleHBvcnQgY2xhc3MgX3ZlYzMge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgejogbnVtYmVyO1xuICBjb25zdHJ1Y3Rvcih4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB6MTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDE7XG4gICAgdGhpcy55ID0geTE7XG4gICAgdGhpcy56ID0gejE7XG4gIH1cblxuICBzdGF0aWMgc2V0KHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHoxOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKHgxLCB5MSwgejEpO1xuICB9XG5cbiAgc3RhdGljIGFkZChiOiBfdmVjMywgYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKGEueCArIGIueCwgYS55ICsgYi55LCBhLnogKyBiLnopO1xuICB9XG5cbiAgc3RhdGljIHN1YihhOiBfdmVjMywgYjogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKGEueCAtIGIueCwgYS55IC0gYi55LCBhLnogLSBiLnopO1xuICB9XG5cbiAgc3RhdGljIG11bG51bShhOiBfdmVjMywgYjogbnVtYmVyKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMyhhLnggKiBiLCBhLnkgKiBiLCBhLnogKiBiKTtcbiAgfVxuXG4gIHN0YXRpYyBkaXZudW0oYTogX3ZlYzMsIGI6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgX3ZlYzMoYS54IC8gYiwgYS55IC8gYiwgYS56IC8gYik7XG4gIH1cblxuICBzdGF0aWMgbmVnKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMygtYS54LCAtYS55LCAtYS56KTtcbiAgfVxuXG4gIHN0YXRpYyBkb3QoYTogX3ZlYzMsIGI6IF92ZWMzKSB7XG4gICAgcmV0dXJuIGEueCAqIGIueCArIGEueSAqIGIueSArIGEueiAqIGIuejtcbiAgfVxuXG4gIHN0YXRpYyBjcm9zcyhhOiBfdmVjMywgYjogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKFxuICAgICAgYS55ICogYi56IC0gYS56ICogYi55LFxuICAgICAgYS56ICogYi54IC0gYS54ICogYi56LFxuICAgICAgYS54ICogYi55IC0gYi54ICogYS55XG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBsZW4yKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIGEueCAqIGEueCArIGEueSAqIGEueSArIGEueiAqIGEuejtcbiAgfVxuXG4gIC8vICByZXR1cm4gVmVjM1NldChcbiAgLy8gICAgIFAuWCAqIE0uTVswXVswXSArIFAuWSAqIE0uTVsxXVswXSArIFAuWiAqIE0uTVsyXVswXSArIE0uTVszXVswXSxcbiAgLy8gICAgIFAuWCAqIE0uTVswXVsxXSArIFAuWSAqIE0uTVsxXVsxXSArIFAuWiAqIE0uTVsyXVsxXSArIE0uTVszXVsxXSxcbiAgLy8gICAgIFAuWCAqIE0uTVswXVsyXSArIFAuWSAqIE0uTVsxXVsyXSArIFAuWiAqIE0uTVsyXVsyXSArIE0uTVszXVsyXVxuXG4gIHN0YXRpYyBsZW4oYTogX3ZlYzMpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoX3ZlYzMubGVuMihhKSk7XG4gIH1cblxuICBzdGF0aWMgbm9ybWFsaXplKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIF92ZWMzLmRpdm51bShhLCBfdmVjMy5sZW4oYSkpO1xuICB9XG5cbiAgc3RhdGljIHZlYzMoYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gW2EueCwgYS55LCBhLnpdO1xuICB9XG59XG4iLCJpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzNcIjtcclxuXHJcbmNsYXNzIHN1cmZhY2Uge1xyXG4gIEthOiBfdmVjMyA9IF92ZWMzLnNldCgwLCAwLCAwKTtcclxuICBLZDogX3ZlYzMgPSBfdmVjMy5zZXQoMCwgMCwgMCk7XHJcbiAgS3M6IF92ZWMzID0gX3ZlYzMuc2V0KDAsIDAsIDApO1xyXG4gIFBoOiBudW1iZXIgPSAwO1xyXG4gIEtyOiBfdmVjMyA9IF92ZWMzLnNldCgwLCAwLCAwKTtcclxuICBLdDogX3ZlYzMgPSBfdmVjMy5zZXQoMCwgMCwgMCk7XHJcbiAgUmVmcmFjdGlvbkNvZWY6IG51bWJlciA9IDA7XHJcbiAgRGVjYXk6IG51bWJlciA9IDA7XHJcbiAgR2V0QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS2EpLFxyXG4gICAgICAxLFxyXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS2QpLFxyXG4gICAgICAxLFxyXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS3MpLFxyXG4gICAgICB0aGlzLlBoLFxyXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS3IpLFxyXG4gICAgICB0aGlzLlJlZnJhY3Rpb25Db2VmLFxyXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS3QpLFxyXG4gICAgICB0aGlzLkRlY2F5XHJcbiAgICBdO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIHNwaGVyZSB7XHJcbiAgTmFtZTogc3RyaW5nID0gXCJcIjtcclxuICBSOiBudW1iZXIgPSAwO1xyXG4gIFA6IF92ZWMzID0gX3ZlYzMuc2V0KDAsIDAsIDApO1xyXG4gIFN1cmY6IHN1cmZhY2UgPSBuZXcgc3VyZmFjZSgpO1xyXG4gIEdldEFycmF5KCkge1xyXG4gICAgcmV0dXJuIFsuLi5fdmVjMy52ZWMzKHRoaXMuUCksIHRoaXMuUl0uY29uY2F0KHRoaXMuU3VyZi5HZXRBcnJheSgpKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBsZXQgU3BoZXJlczogc3BoZXJlW10gPSBbXTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXRBcnJheVNwaGVyZXMoKSB7XHJcbiAgbGV0IFJlc3VsdCA9IFtTcGhlcmVzLmxlbmd0aCwgMCwgMCwgMF07XHJcbiAgZm9yIChsZXQgZWxlbWVudCBvZiBTcGhlcmVzKSB7XHJcbiAgICBSZXN1bHQgPSBSZXN1bHQuY29uY2F0KGVsZW1lbnQuR2V0QXJyYXkoKSk7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFJlc3VsdCk7XHJcbn1cclxuIiwiaW1wb3J0IHsgX3ZlYzMgfSBmcm9tIFwiLi4vbWF0aC9tYXRodmVjM1wiO1xyXG5pbXBvcnQgeyBTcGhlcmVzLCBzcGhlcmUgfSBmcm9tIFwiLi4vb2JqZWN0c1wiO1xyXG5cclxuaW1wb3J0IHsgVWJvX3NldDFfZGF0YSB9IGZyb20gXCIuLi9tYWluXCI7XHJcblxyXG5mdW5jdGlvbiBSZWFkVmVjM2Zyb21TdHJpbmcoU3RyOiBzdHJpbmcpIHtcclxuICBsZXQgaDogbnVtYmVyW107XHJcbiAgaWYgKFN0clswXSAhPSBcIntcIiB8fCBTdHJbU3RyLmxlbmd0aCAtIDFdICE9IFwifVwiKSByZXR1cm4gbnVsbDtcclxuICBoID0gU3RyLnNsaWNlKDEsIFN0ci5sZW5ndGggLSAxKVxyXG4gICAgLnNwbGl0KFwiLFwiKVxyXG4gICAgLm1hcChOdW1iZXIpO1xyXG5cclxuICBpZiAoaC5sZW5ndGggPCAzKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgcmV0dXJuIF92ZWMzLnNldChoWzBdLCBoWzFdLCBoWzJdKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlcihUeHQ6IHN0cmluZykge1xyXG4gIFNwaGVyZXMubGVuZ3RoID0gMDtcclxuICBsZXQgTmFtZTogc3RyaW5nO1xyXG4gIGxldCBhcnJheU9mU3RyaW5ncyA9IFR4dC5zcGxpdChcIlxcblwiKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5T2ZTdHJpbmdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoYXJyYXlPZlN0cmluZ3NbaV1bMF0gPT0gXCIvXCIgJiYgYXJyYXlPZlN0cmluZ3NbaV1bMV0gPT0gXCIvXCIpIGNvbnRpbnVlO1xyXG4gICAgbGV0IHdvcmRzID0gYXJyYXlPZlN0cmluZ3NbaV0uc3BsaXQoXCIgXCIpO1xyXG4gICAgTmFtZSA9IHdvcmRzWzBdO1xyXG4gICAgaWYgKHdvcmRzLmxlbmd0aCA9PSAxKSBjb250aW51ZTtcclxuICAgIGxldCBUeXBlID0gd29yZHNbMV07XHJcbiAgICBpZiAoTmFtZSA9PSBcInNjZW5lXCIpIHtcclxuICAgICAgaWYgKHdvcmRzLmxlbmd0aCAhPSA2KSBjb250aW51ZTtcclxuICAgICAgbGV0IHg6IF92ZWMzIHwgbnVsbDtcclxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1sxXSk7XHJcbiAgICAgIGlmICh4ID09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICBVYm9fc2V0MV9kYXRhLkFtYmllbnRDb2xvciA9IHg7XHJcblxyXG4gICAgICB4ID0gUmVhZFZlYzNmcm9tU3RyaW5nKHdvcmRzWzJdKTtcclxuICAgICAgaWYgKHggPT0gbnVsbCkgY29udGludWU7XHJcbiAgICAgIFVib19zZXQxX2RhdGEuQmFja2dyb3VuZENvbG9yID0geDtcclxuXHJcbiAgICAgIFVib19zZXQxX2RhdGEuUmVmcmFjdGlvbkNvZWYgPSBOdW1iZXIod29yZHNbM10pO1xyXG4gICAgICBVYm9fc2V0MV9kYXRhLkRlY2F5ID0gTnVtYmVyKHdvcmRzWzRdKTtcclxuICAgICAgVWJvX3NldDFfZGF0YS5NYXhSZWNMZXZlbCA9IE51bWJlcih3b3Jkc1s1XSk7XHJcbiAgICB9XHJcbiAgICBpZiAoVHlwZSA9PSBcInNwaGVyZVwiKSB7XHJcbiAgICAgIGxldCB4OiBfdmVjMyB8IG51bGw7XHJcbiAgICAgIGlmICh3b3Jkcy5sZW5ndGggIT0gMTIpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgbGV0IFNwaCA9IG5ldyBzcGhlcmUoKTtcclxuICAgICAgU3BoLk5hbWUgPSBOYW1lO1xyXG5cclxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1syXSk7XHJcbiAgICAgIGlmICh4ID09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICBlbHNlIFNwaC5QID0geDtcclxuICAgICAgU3BoLlIgPSBOdW1iZXIod29yZHNbM10pO1xyXG5cclxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1s0XSk7XHJcbiAgICAgIGlmICh4ID09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICBlbHNlIFNwaC5TdXJmLkthID0geDtcclxuXHJcbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbNV0pO1xyXG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgZWxzZSBTcGguU3VyZi5LZCA9IHg7XHJcblxyXG4gICAgICB4ID0gUmVhZFZlYzNmcm9tU3RyaW5nKHdvcmRzWzZdKTtcclxuICAgICAgaWYgKHggPT0gbnVsbCkgY29udGludWU7XHJcbiAgICAgIGVsc2UgU3BoLlN1cmYuS3MgPSB4O1xyXG5cclxuICAgICAgU3BoLlN1cmYuUGggPSBOdW1iZXIod29yZHNbN10pO1xyXG5cclxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1s4XSk7XHJcbiAgICAgIGlmICh4ID09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICBlbHNlIFNwaC5TdXJmLktyID0geDtcclxuXHJcbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbOV0pO1xyXG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcclxuICAgICAgZWxzZSBTcGguU3VyZi5LdCA9IHg7XHJcblxyXG4gICAgICBTcGguU3VyZi5SZWZyYWN0aW9uQ29lZiA9IE51bWJlcih3b3Jkc1sxMF0pO1xyXG4gICAgICBTcGguU3VyZi5EZWNheSA9IE51bWJlcih3b3Jkc1sxMV0pO1xyXG4gICAgICBTcGhlcmVzLnB1c2goU3BoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgX21hdHI0IH0gZnJvbSBcIi4uL21hdGgvbWF0aG1hdDQuanNcIjtcbmltcG9ydCB7IF92ZWMzIH0gZnJvbSBcIi4uL21hdGgvbWF0aHZlYzMuanNcIjtcblxuZXhwb3J0IGNsYXNzIFVib19NYXRyIHtcbiAgQ2FtTG9jOiBfdmVjMztcbiAgQ2FtQXQ6IF92ZWMzO1xuICBDYW1SaWdodDogX3ZlYzM7XG4gIENhbVVwOiBfdmVjMztcbiAgQ2FtRGlyOiBfdmVjMztcbiAgUHJvakRpc3RGYXJUaW1lTG9jYWw6IF92ZWMzO1xuICBUaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsOiBfdmVjMztcbiAgZmxhZ3MxMkZyYW1lVzogX3ZlYzM7XG4gIGZsYWdzNDVGcmFtZUg6IF92ZWMzO1xuICBBbWJpZW50Q29sb3I6IF92ZWMzO1xuICBCYWNrZ3JvdW5kQ29sb3I6IF92ZWMzO1xuICBSZWZyYWN0aW9uQ29lZjogbnVtYmVyO1xuICBEZWNheTogbnVtYmVyO1xuICBNYXhSZWNMZXZlbDogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihcbiAgICBDYW1Mb2M6IF92ZWMzLFxuICAgIENhbUF0OiBfdmVjMyxcbiAgICBDYW1SaWdodDogX3ZlYzMsXG4gICAgQ2FtVXA6IF92ZWMzLFxuICAgIENhbURpcjogX3ZlYzMsXG4gICAgUHJvakRpc3RGYXJUaW1lTG9jYWw6IF92ZWMzLFxuICAgIFRpbWVHbG9iYWxEZWx0YUdsb2JhbERlbHRhTG9jYWw6IF92ZWMzLFxuICAgIGZsYWdzMTJGcmFtZVc6IF92ZWMzLFxuICAgIGZsYWdzNDVGcmFtZUg6IF92ZWMzLFxuICAgIEFtYmllbnRDb2xvcjogX3ZlYzMsXG4gICAgQmFja2dyb3VuZENvbG9yOiBfdmVjMyxcbiAgICBSZWZyYWN0aW9uQ29lZjogbnVtYmVyLFxuICAgIERlY2F5OiBudW1iZXIsXG4gICAgTWF4UmVjTGV2ZWw6IG51bWJlclxuICApIHtcbiAgICB0aGlzLkNhbUxvYyA9IENhbUxvYztcbiAgICB0aGlzLkNhbUF0ID0gQ2FtQXQ7XG4gICAgdGhpcy5DYW1SaWdodCA9IENhbVJpZ2h0O1xuICAgIHRoaXMuQ2FtVXAgPSBDYW1VcDtcbiAgICB0aGlzLkNhbURpciA9IENhbURpcjtcbiAgICB0aGlzLlByb2pEaXN0RmFyVGltZUxvY2FsID0gUHJvakRpc3RGYXJUaW1lTG9jYWw7XG5cbiAgICB0aGlzLlRpbWVHbG9iYWxEZWx0YUdsb2JhbERlbHRhTG9jYWwgPSBUaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsO1xuICAgIHRoaXMuZmxhZ3MxMkZyYW1lVyA9IGZsYWdzMTJGcmFtZVc7XG4gICAgdGhpcy5mbGFnczQ1RnJhbWVIID0gZmxhZ3M0NUZyYW1lSDtcbiAgICB0aGlzLkFtYmllbnRDb2xvciA9IEFtYmllbnRDb2xvcjtcbiAgICB0aGlzLkJhY2tncm91bmRDb2xvciA9IEJhY2tncm91bmRDb2xvcjtcbiAgICB0aGlzLlJlZnJhY3Rpb25Db2VmID0gUmVmcmFjdGlvbkNvZWY7XG4gICAgdGhpcy5EZWNheSA9IERlY2F5O1xuICAgIHRoaXMuTWF4UmVjTGV2ZWwgPSBNYXhSZWNMZXZlbDtcbiAgfVxuICBHZXRBcnJheSgpIHtcbiAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtTG9jKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtQXQpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5DYW1SaWdodCksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkNhbVVwKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtRGlyKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuUHJvakRpc3RGYXJUaW1lTG9jYWwpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5UaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuZmxhZ3MxMkZyYW1lVyksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLmZsYWdzNDVGcmFtZUgpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5BbWJpZW50Q29sb3IpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5CYWNrZ3JvdW5kQ29sb3IpLFxuICAgICAgMSxcbiAgICAgIHRoaXMuUmVmcmFjdGlvbkNvZWYsXG4gICAgICB0aGlzLkRlY2F5LFxuICAgICAgdGhpcy5NYXhSZWNMZXZlbCxcbiAgICAgIDFcbiAgICBdKTtcbiAgfVxufVxuXG4vLyByYXk8VHlwZT4gRnJhbWUoIFR5cGUgWHMsIFR5cGUgWXMsIFR5cGUgZHgsIFR5cGUgZHkgKSBjb25zdFxuLy8ge1xuLy8gICB2ZWMzPFR5cGU+IEEgPSBEaXIgKiBQcm9qRGlzdDtcbi8vICAgdmVjMzxUeXBlPiBCID0gUmlnaHQgKiAoKFhzICsgMC41IC0gRnJhbWVXIC8gMi4wKSAvIEZyYW1lVyAqIFdwKTtcbi8vICAgdmVjMzxUeXBlPiBDID0gVXAgKiAoKC0oWXMgKyAwLjUpICsgRnJhbWVIIC8gMi4wKSAvIEZyYW1lSCAqIEhwKTtcbi8vICAgdmVjMzxUeXBlPiBYID0gdmVjMzxUeXBlPihBICsgQiArIEMpO1xuLy8gICByZXR1cm4gIHJheTxUeXBlPihYICsgTG9jLCBYLk5vcm1hbGl6aW5nKCkpO1xuLy8gfSAvKiBFbmQgb2YgJ1Jlc2l6ZScgZnVuY3Rpb24gKi9cblxuZXhwb3J0IGNsYXNzIFVCTyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdWJvaWQ6IFdlYkdMQnVmZmVyIHwgbnVsbDtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCB1Ym9pZDogV2ViR0xCdWZmZXIgfCBudWxsKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLnVib2lkID0gdWJvaWQ7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlKFNpemU6IG51bWJlciwgbmFtZTogc3RyaW5nLCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIGxldCBmciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIGZyKTtcblxuICAgIGdsLmJ1ZmZlckRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIFNpemUgKiA0LCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgcmV0dXJuIG5ldyBVQk8obmFtZSwgZnIpO1xuICB9XG5cbiAgdXBkYXRlKFVib0FycmF5OiBGbG9hdDMyQXJyYXksIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5VTklGT1JNX0JVRkZFUiwgdGhpcy51Ym9pZCk7XG4gICAgZ2wuYnVmZmVyU3ViRGF0YShnbC5VTklGT1JNX0JVRkZFUiwgMCwgVWJvQXJyYXkpO1xuICB9XG5cbiAgYXBwbHkocG9pbnQ6IG51bWJlciwgU2hkTm86IFdlYkdMUHJvZ3JhbSwgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICBsZXQgYmxrX2xvYyA9IGdsLmdldFVuaWZvcm1CbG9ja0luZGV4KFNoZE5vLCB0aGlzLm5hbWUpO1xuXG4gICAgZ2wudW5pZm9ybUJsb2NrQmluZGluZyhTaGRObywgYmxrX2xvYywgcG9pbnQpO1xuICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlVOSUZPUk1fQlVGRkVSLCBwb2ludCwgdGhpcy51Ym9pZCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IF92ZWMzIH0gZnJvbSBcIi4vbWF0aHZlYzNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIEQyUihkZWdyZWU6IG51bWJlcikge1xuICByZXR1cm4gKGRlZ3JlZSAqIE1hdGguUEkpIC8gMTgwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUjJEKHJhZGlhbjogbnVtYmVyKSB7XG4gIHJldHVybiAocmFkaWFuIC8gTWF0aC5QSSkgKiAxODA7XG59XG5cbmV4cG9ydCBjbGFzcyBfbWF0cjQge1xuICBhOiBudW1iZXJbXVtdO1xuICBjb25zdHJ1Y3RvcihcbiAgICBhMDA6IG51bWJlcixcbiAgICBhMDE6IG51bWJlcixcbiAgICBhMDI6IG51bWJlcixcbiAgICBhMDM6IG51bWJlcixcbiAgICBhMTA6IG51bWJlcixcbiAgICBhMTE6IG51bWJlcixcbiAgICBhMTI6IG51bWJlcixcbiAgICBhMTM6IG51bWJlcixcbiAgICBhMjA6IG51bWJlcixcbiAgICBhMjE6IG51bWJlcixcbiAgICBhMjI6IG51bWJlcixcbiAgICBhMjM6IG51bWJlcixcbiAgICBhMzA6IG51bWJlcixcbiAgICBhMzE6IG51bWJlcixcbiAgICBhMzI6IG51bWJlcixcbiAgICBhMzM6IG51bWJlclxuICApIHtcbiAgICB0aGlzLmEgPSBbXG4gICAgICBbYTAwLCBhMDEsIGEwMiwgYTAzXSxcbiAgICAgIFthMTAsIGExMSwgYTEyLCBhMTNdLFxuICAgICAgW2EyMCwgYTIxLCBhMjIsIGEyM10sXG4gICAgICBbYTMwLCBhMzEsIGEzMiwgYTMzXVxuICAgIF07XG4gIH1cblxuICBzdGF0aWMgaWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIG5ldyBfbWF0cjQoMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSkuYTtcbiAgfVxuICBzdGF0aWMgc2V0KFxuICAgIGEwMDogbnVtYmVyLFxuICAgIGEwMTogbnVtYmVyLFxuICAgIGEwMjogbnVtYmVyLFxuICAgIGEwMzogbnVtYmVyLFxuICAgIGExMDogbnVtYmVyLFxuICAgIGExMTogbnVtYmVyLFxuICAgIGExMjogbnVtYmVyLFxuICAgIGExMzogbnVtYmVyLFxuICAgIGEyMDogbnVtYmVyLFxuICAgIGEyMTogbnVtYmVyLFxuICAgIGEyMjogbnVtYmVyLFxuICAgIGEyMzogbnVtYmVyLFxuICAgIGEzMDogbnVtYmVyLFxuICAgIGEzMTogbnVtYmVyLFxuICAgIGEzMjogbnVtYmVyLFxuICAgIGEzMzogbnVtYmVyXG4gICkge1xuICAgIHJldHVybiBuZXcgX21hdHI0KFxuICAgICAgYTAwLFxuICAgICAgYTAxLFxuICAgICAgYTAyLFxuICAgICAgYTAzLFxuICAgICAgYTEwLFxuICAgICAgYTExLFxuICAgICAgYTEyLFxuICAgICAgYTEzLFxuICAgICAgYTIwLFxuICAgICAgYTIxLFxuICAgICAgYTIyLFxuICAgICAgYTIzLFxuICAgICAgYTMwLFxuICAgICAgYTMxLFxuICAgICAgYTMyLFxuICAgICAgYTMzXG4gICAgKS5hO1xuICB9XG4gIHN0YXRpYyB0cmFuc2xhdGUoYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF9tYXRyNCgxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCBhLngsIGEueSwgYS56LCAxKS5hO1xuICB9XG4gIHN0YXRpYyBzY2FsZShhOiBfdmVjMykge1xuICAgIHJldHVybiBuZXcgX21hdHI0KGEueCwgMCwgMCwgMCwgMCwgYS55LCAwLCAwLCAwLCAwLCBhLnosIDAsIDAsIDAsIDAsIDEpLmE7XG4gIH1cblxuICBzdGF0aWMgcm90YXRlWihkZWdyZWU6IG51bWJlcikge1xuICAgIGNvbnN0IHIgPSBEMlIoZGVncmVlKSxcbiAgICAgIGNvID0gTWF0aC5jb3MociksXG4gICAgICBzaSA9IE1hdGguc2luKHIpO1xuICAgIGxldCBtID0gX21hdHI0LmlkZW50aXR5KCk7XG4gICAgbVswXVswXSA9IGNvO1xuICAgIG1bMV1bMF0gPSAtc2k7XG4gICAgbVswXVsxXSA9IHNpO1xuICAgIG1bMV1bMV0gPSBjbztcblxuICAgIHJldHVybiBtO1xuICB9XG4gIHN0YXRpYyByb3RhdGVYKGRlZ3JlZTogbnVtYmVyKSB7XG4gICAgY29uc3QgciA9IEQyUihkZWdyZWUpLFxuICAgICAgY28gPSBNYXRoLmNvcyhyKSxcbiAgICAgIHNpID0gTWF0aC5zaW4ocik7XG4gICAgbGV0IG0gPSBfbWF0cjQuaWRlbnRpdHkoKTtcblxuICAgIG1bMV1bMV0gPSBjbztcbiAgICBtWzJdWzFdID0gLXNpO1xuICAgIG1bMV1bMl0gPSBzaTtcbiAgICBtWzJdWzJdID0gY287XG5cbiAgICByZXR1cm4gbTtcbiAgfVxuXG4gIHN0YXRpYyByb3RhdGVZKGRlZ3JlZTogbnVtYmVyKSB7XG4gICAgY29uc3QgciA9IEQyUihkZWdyZWUpLFxuICAgICAgY28gPSBNYXRoLmNvcyhyKSxcbiAgICAgIHNpID0gTWF0aC5zaW4ocik7XG4gICAgbGV0IG0gPSBfbWF0cjQuaWRlbnRpdHkoKTtcblxuICAgIG1bMF1bMF0gPSBjbztcbiAgICBtWzJdWzBdID0gc2k7XG4gICAgbVswXVsyXSA9IC1zaTtcbiAgICBtWzJdWzJdID0gY287XG5cbiAgICByZXR1cm4gbTtcbiAgfVxuXG4gIHN0YXRpYyBtdWxtYXRyKG0xOiBudW1iZXJbXVtdLCBtMjogbnVtYmVyW11bXSkge1xuICAgIGxldCByID0gX21hdHI0LnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKSxcbiAgICAgIGsgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7IGorKykge1xuICAgICAgICBmb3IgKHJbaV1bal0gPSAwLCBrID0gMDsgayA8IDQ7IGsrKykge1xuICAgICAgICAgIHJbaV1bal0gKz0gbTFbaV1ba10gKiBtMltrXVtqXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIHN0YXRpYyB0cmFuc3Bvc2UobTogbnVtYmVyW11bXSkge1xuICAgIGxldCByID0gX21hdHI0LnNldCgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA0OyBqKyspIHtcbiAgICAgICAgcltpXVtqXSA9IG1bal1baV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgc3RhdGljIGRldGVybTN4MyhcbiAgICBhMTE6IG51bWJlcixcbiAgICBhMTI6IG51bWJlcixcbiAgICBhMTM6IG51bWJlcixcbiAgICBhMjE6IG51bWJlcixcbiAgICBhMjI6IG51bWJlcixcbiAgICBhMjM6IG51bWJlcixcbiAgICBhMzE6IG51bWJlcixcbiAgICBhMzI6IG51bWJlcixcbiAgICBhMzM6IG51bWJlclxuICApIHtcbiAgICByZXR1cm4gKFxuICAgICAgYTExICogYTIyICogYTMzIC1cbiAgICAgIGExMSAqIGEyMyAqIGEzMiAtXG4gICAgICBhMTIgKiBhMjEgKiBhMzMgK1xuICAgICAgYTEyICogYTIzICogYTMxICtcbiAgICAgIGExMyAqIGEyMSAqIGEzMiAtXG4gICAgICBhMTMgKiBhMjIgKiBhMzFcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIGRldGVybShtOiBudW1iZXJbXVtdKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIG1bMF1bMF0gKlxuICAgICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICAgIG1bMV1bMV0sXG4gICAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgICBtWzFdWzNdLFxuICAgICAgICAgIG1bMl1bMV0sXG4gICAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgICBtWzJdWzNdLFxuICAgICAgICAgIG1bM11bMV0sXG4gICAgICAgICAgbVszXVsyXSxcbiAgICAgICAgICBtWzNdWzNdXG4gICAgICAgICkgLVxuICAgICAgbVswXVsxXSAqXG4gICAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgICAgbVsxXVswXSxcbiAgICAgICAgICBtWzFdWzJdLFxuICAgICAgICAgIG1bMV1bM10sXG4gICAgICAgICAgbVsyXVswXSxcbiAgICAgICAgICBtWzJdWzJdLFxuICAgICAgICAgIG1bMl1bM10sXG4gICAgICAgICAgbVszXVswXSxcbiAgICAgICAgICBtWzNdWzJdLFxuICAgICAgICAgIG1bM11bM11cbiAgICAgICAgKSArXG4gICAgICBtWzBdWzJdICpcbiAgICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgICBtWzFdWzBdLFxuICAgICAgICAgIG1bMV1bMV0sXG4gICAgICAgICAgbVsxXVszXSxcbiAgICAgICAgICBtWzJdWzBdLFxuICAgICAgICAgIG1bMl1bMV0sXG4gICAgICAgICAgbVsyXVszXSxcbiAgICAgICAgICBtWzNdWzBdLFxuICAgICAgICAgIG1bM11bMV0sXG4gICAgICAgICAgbVszXVszXVxuICAgICAgICApIC1cbiAgICAgIG1bMF1bM10gKlxuICAgICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICAgIG1bMV1bMF0sXG4gICAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgICBtWzFdWzJdLFxuICAgICAgICAgIG1bMl1bMF0sXG4gICAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgICBtWzJdWzJdLFxuICAgICAgICAgIG1bM11bMF0sXG4gICAgICAgICAgbVszXVsxXSxcbiAgICAgICAgICBtWzNdWzJdXG4gICAgICAgIClcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIGludmVyc2UobTogbnVtYmVyW11bXSkge1xuICAgIGNvbnN0IGRldCA9IF9tYXRyNC5kZXRlcm0obSk7XG4gICAgbGV0IHIgPSBfbWF0cjQuaWRlbnRpdHkoKTtcbiAgICBpZiAoZGV0ID09PSAwKSByZXR1cm4gcjtcbiAgICByWzBdWzBdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bMl1bM10sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bMl0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyBkZXQ7XG5cbiAgICByWzFdWzBdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bMl1bM10sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMl0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyAtZGV0O1xuICAgIHJbMl1bMF0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVszXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIGRldDtcbiAgICByWzNdWzBdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bMl1cbiAgICAgICkgLyAtZGV0O1xuXG4gICAgclswXVsxXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzJdWzNdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzJdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gLWRldDtcblxuICAgIHJbMV1bMV0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVsyXVszXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsyXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIGRldDtcblxuICAgIHJbMl1bMV0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVszXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIC1kZXQ7XG4gICAgclszXVsxXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzJdXG4gICAgICApIC8gZGV0O1xuICAgIHJbMF1bMl0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVsyXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIGRldDtcbiAgICByWzFdWzJdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMl0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyAtZGV0O1xuICAgIHJbMl1bMl0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIGRldDtcbiAgICByWzNdWzJdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bMl1cbiAgICAgICkgLyAtZGV0O1xuICAgIHJbMF1bM10gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVsyXVszXVxuICAgICAgKSAvIC1kZXQ7XG4gICAgclsxXVszXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzJdWzNdXG4gICAgICApIC8gZGV0O1xuICAgIHJbMl1bM10gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsxXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVszXVxuICAgICAgKSAvIC1kZXQ7XG4gICAgclszXVszXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzJdXG4gICAgICApIC8gZGV0O1xuICAgIHJldHVybiByO1xuICB9XG4gIHN0YXRpYyBmcnVzdHVtKFxuICAgIGw6IG51bWJlcixcbiAgICByOiBudW1iZXIsXG4gICAgYjogbnVtYmVyLFxuICAgIHQ6IG51bWJlcixcbiAgICBuOiBudW1iZXIsXG4gICAgZjogbnVtYmVyXG4gICkge1xuICAgIGxldCBtID0gX21hdHI0LmlkZW50aXR5KCk7XG5cbiAgICBtWzBdWzBdID0gKDIgKiBuKSAvIChyIC0gbCk7XG4gICAgbVswXVsxXSA9IDA7XG4gICAgbVswXVsyXSA9IDA7XG4gICAgbVswXVszXSA9IDA7XG5cbiAgICBtWzFdWzBdID0gMDtcbiAgICBtWzFdWzFdID0gKDIgKiBuKSAvICh0IC0gYik7XG4gICAgbVsxXVsyXSA9IDA7XG4gICAgbVsxXVszXSA9IDA7XG5cbiAgICBtWzJdWzBdID0gKHIgKyBsKSAvIChyIC0gbCk7XG4gICAgbVsyXVsxXSA9ICh0ICsgYikgLyAodCAtIGIpO1xuICAgIG1bMl1bMl0gPSAoZiArIG4pIC8gLShmIC0gbik7XG4gICAgbVsyXVszXSA9IC0xO1xuXG4gICAgbVszXVswXSA9IDA7XG4gICAgbVszXVsxXSA9IDA7XG4gICAgbVszXVsyXSA9ICgtMiAqIG4gKiBmKSAvIChmIC0gbik7XG4gICAgbVszXVszXSA9IDA7XG5cbiAgICByZXR1cm4gbTtcbiAgfVxuXG4gIHN0YXRpYyB0b2FycihtOiBudW1iZXJbXVtdKSB7XG4gICAgbGV0IHYgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBnID0gMDsgZyA8IDQ7IGcrKykge1xuICAgICAgICB2LnB1c2gobVtpXVtnXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHY7XG4gIH1cblxuICBzdGF0aWMgcG9pbnRfdHJhbnNmb3JtKGE6IF92ZWMzLCBiOiBudW1iZXJbXVtdKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMyhcbiAgICAgIGEueCAqIGJbMF1bMF0gKyBhLnkgKiBiWzFdWzBdICsgYS56ICogYlsyXVswXSArIGJbM11bMF0sXG4gICAgICBhLnggKiBiWzBdWzFdICsgYS55ICogYlsxXVsxXSArIGEueiAqIGJbMl1bMV0gKyBiWzNdWzFdLFxuICAgICAgYS54ICogYlswXVsyXSArIGEueSAqIGJbMV1bMl0gKyBhLnogKiBiWzJdWzJdICsgYlszXVsyXVxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgdmVjdG9ydF9yYW5zZm9ybShhOiBfdmVjMywgYjogbnVtYmVyW11bXSkge1xuICAgIHJldHVybiBuZXcgX3ZlYzMoXG4gICAgICBhLnggKiBiWzBdWzBdICsgYS55ICogYlsxXVswXSArIGEueiAqIGJbMl1bMF0sXG4gICAgICBhLnggKiBiWzBdWzFdICsgYS55ICogYlsxXVsxXSArIGEueiAqIGJbMl1bMV0sXG4gICAgICBhLnggKiBiWzBdWzJdICsgYS55ICogYlsxXVsyXSArIGEueiAqIGJbMl1bMl1cbiAgICApO1xuICB9XG4gIHN0YXRpYyBtdWxfbWF0cihhOiBfdmVjMywgYjogbnVtYmVyW11bXSkge1xuICAgIGNvbnN0IHcgPSBhLnggKiBiWzBdWzNdICsgYS55ICogYlsxXVszXSArIGEueiAqIGJbMl1bM10gKyBiWzNdWzNdO1xuICAgIHJldHVybiBuZXcgX3ZlYzMoXG4gICAgICAoYS54ICogYlswXVswXSArIGEueSAqIGJbMV1bMF0gKyBhLnogKiBiWzJdWzBdICsgYlszXVswXSkgLyB3LFxuICAgICAgKGEueSAqIGJbMF1bMV0gKyBhLnkgKiBiWzFdWzFdICsgYS56ICogYlsyXVsxXSArIGJbM11bMV0pIC8gdyxcbiAgICAgIChhLnogKiBiWzBdWzJdICsgYS55ICogYlsxXVsyXSArIGEueiAqIGJbMl1bMl0gKyBiWzNdWzJdKSAvIHdcbiAgICApO1xuICB9XG59XG4iLCJpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGh2ZWMzLmpzXCI7XG5pbXBvcnQgeyBfbWF0cjQgfSBmcm9tIFwiLi9tYXRobWF0NC5qc1wiO1xuXG5sZXQgUHJvalNpemUgPSAwLjEgLyogUHJvamVjdCBwbGFuZSBmaXQgc3F1YXJlICovLFxuICBQcm9qRGlzdCA9IDAuMSAvKiBEaXN0YW5jZSB0byBwcm9qZWN0IHBsYW5lIGZyb20gdmlld2VyIChuZWFyKSAqLyxcbiAgUHJvakZhckNsaXAgPSAzMDAwOyAvKiBEaXN0YW5jZSB0byBwcm9qZWN0IGZhciBjbGlwIHBsYW5lIChmYXIpICovXG5cbmNsYXNzIF9jYW1lcmEge1xuICBQcm9qU2l6ZTogbnVtYmVyO1xuICBQcm9qRGlzdDogbnVtYmVyO1xuICBQcm9qRmFyQ2xpcDogbnVtYmVyO1xuICBGcmFtZVc6IG51bWJlcjtcbiAgRnJhbWVIOiBudW1iZXI7XG4gIE1hdHJWUDogbnVtYmVyW11bXTtcbiAgTWF0clZpZXc6IG51bWJlcltdW107XG4gIE1hdHJQcm9qOiBudW1iZXJbXVtdO1xuICBMb2M6IF92ZWMzO1xuICBBdDogX3ZlYzM7XG4gIERpcjogX3ZlYzM7XG4gIFVwOiBfdmVjMztcbiAgUmlnaHQ6IF92ZWMzO1xuICBjb25zdHJ1Y3RvcihcbiAgICBQcm9qU2l6ZTogbnVtYmVyLFxuICAgIFByb2pEaXN0OiBudW1iZXIsXG4gICAgUHJvakZhckNsaXA6IG51bWJlcixcbiAgICBNYXRyVlA6IG51bWJlcltdW10sXG4gICAgTWF0clZpZXc6IG51bWJlcltdW10sXG4gICAgTWF0clByb2o6IG51bWJlcltdW10sXG4gICAgTG9jOiBfdmVjMyxcbiAgICBBdDogX3ZlYzMsXG4gICAgRGlyOiBfdmVjMyxcbiAgICBVcDogX3ZlYzMsXG4gICAgUmlnaHQ6IF92ZWMzLFxuICAgIEZyYW1lVzogbnVtYmVyLFxuICAgIEZyYW1lSDogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuUHJvalNpemUgPSBQcm9qU2l6ZTtcbiAgICB0aGlzLlByb2pEaXN0ID0gUHJvakRpc3Q7XG4gICAgdGhpcy5Qcm9qRmFyQ2xpcCA9IFByb2pGYXJDbGlwO1xuICAgIHRoaXMuTWF0clZQID0gTWF0clZQO1xuICAgIHRoaXMuTWF0clZpZXcgPSBNYXRyVmlldztcbiAgICB0aGlzLk1hdHJQcm9qID0gTWF0clByb2o7XG4gICAgdGhpcy5Mb2MgPSBMb2M7XG4gICAgdGhpcy5BdCA9IEF0O1xuICAgIHRoaXMuRGlyID0gRGlyO1xuICAgIHRoaXMuVXAgPSBVcDtcbiAgICB0aGlzLlJpZ2h0ID0gUmlnaHQ7XG4gICAgdGhpcy5GcmFtZVcgPSBGcmFtZVc7XG4gICAgdGhpcy5GcmFtZUggPSBGcmFtZUg7XG4gIH1cblxuICBQcm9qU2V0KCkge1xuICAgIGxldCByeCwgcnk6IG51bWJlcjtcblxuICAgIHJ4ID0gcnkgPSBQcm9qU2l6ZTtcblxuICAgIGlmICh0aGlzLkZyYW1lVyA+IHRoaXMuRnJhbWVIKSByeCAqPSB0aGlzLkZyYW1lVyAvIHRoaXMuRnJhbWVIO1xuICAgIGVsc2UgcnkgKj0gdGhpcy5GcmFtZUggLyB0aGlzLkZyYW1lVztcblxuICAgIGxldCBXcCA9IHJ4LFxuICAgICAgSHAgPSByeTtcblxuICAgIHRoaXMuTWF0clByb2ogPSBfbWF0cjQuZnJ1c3R1bShcbiAgICAgIC1yeCAvIDIsXG4gICAgICByeCAvIDIsXG4gICAgICAtcnkgLyAyLFxuICAgICAgcnkgLyAyLFxuICAgICAgUHJvakRpc3QsXG4gICAgICBQcm9qRmFyQ2xpcFxuICAgICk7XG4gICAgdGhpcy5NYXRyVlAgPSBfbWF0cjQubXVsbWF0cih0aGlzLk1hdHJWaWV3LCB0aGlzLk1hdHJQcm9qKTtcbiAgfVxuXG4gIHN0YXRpYyB2aWV3KExvYzogX3ZlYzMsIEF0OiBfdmVjMywgVXAxOiBfdmVjMykge1xuICAgIGNvbnN0IERpciA9IF92ZWMzLm5vcm1hbGl6ZShfdmVjMy5zdWIoQXQsIExvYykpLFxuICAgICAgUmlnaHQgPSBfdmVjMy5ub3JtYWxpemUoX3ZlYzMuY3Jvc3MoRGlyLCBVcDEpKSxcbiAgICAgIFVwID0gX3ZlYzMuY3Jvc3MoUmlnaHQsIERpcik7XG4gICAgcmV0dXJuIF9tYXRyNC5zZXQoXG4gICAgICBSaWdodC54LFxuICAgICAgVXAueCxcbiAgICAgIC1EaXIueCxcbiAgICAgIDAsXG4gICAgICBSaWdodC55LFxuICAgICAgVXAueSxcblxuICAgICAgLURpci55LFxuICAgICAgMCxcbiAgICAgIFJpZ2h0LnosXG4gICAgICBVcC56LFxuICAgICAgLURpci56LFxuICAgICAgMCxcbiAgICAgIC1fdmVjMy5kb3QoTG9jLCBSaWdodCksXG4gICAgICAtX3ZlYzMuZG90KExvYywgVXApLFxuICAgICAgX3ZlYzMuZG90KExvYywgRGlyKSxcbiAgICAgIDFcbiAgICApO1xuICB9XG59XG5leHBvcnQgbGV0IGNhbTogX2NhbWVyYTtcblxuZXhwb3J0IGZ1bmN0aW9uIENhbVNldChMb2M6IF92ZWMzLCBBdDogX3ZlYzMsIFVwMTogX3ZlYzMpIHtcbiAgbGV0IFVwLCBEaXIsIFJpZ2h0O1xuICBsZXQgTWF0clZpZXcgPSBfY2FtZXJhLnZpZXcoTG9jLCBBdCwgVXAxKTtcblxuICBVcCA9IF92ZWMzLnNldChNYXRyVmlld1swXVsxXSwgTWF0clZpZXdbMV1bMV0sIE1hdHJWaWV3WzJdWzFdKTtcbiAgRGlyID0gX3ZlYzMuc2V0KC1NYXRyVmlld1swXVsyXSwgLU1hdHJWaWV3WzFdWzJdLCAtTWF0clZpZXdbMl1bMl0pO1xuICBSaWdodCA9IF92ZWMzLnNldChNYXRyVmlld1swXVswXSwgTWF0clZpZXdbMV1bMF0sIE1hdHJWaWV3WzJdWzBdKTtcblxuICBjb25zdCByeCA9IFByb2pTaXplLFxuICAgIHJ5ID0gUHJvalNpemU7XG5cbiAgbGV0IE1hdHJQcm9qID0gX21hdHI0LmZydXN0dW0oXG4gICAgICAtcnggLyAyLFxuICAgICAgcnggLyAyLFxuICAgICAgLXJ5IC8gMixcbiAgICAgIHJ5IC8gMixcblxuICAgICAgUHJvakRpc3QsXG4gICAgICBQcm9qRmFyQ2xpcFxuICAgICksXG4gICAgTWF0clZQID0gX21hdHI0Lm11bG1hdHIoTWF0clZpZXcsIE1hdHJQcm9qKTtcblxuICBjYW0gPSBuZXcgX2NhbWVyYShcbiAgICBQcm9qU2l6ZSxcbiAgICBQcm9qRGlzdCxcbiAgICBQcm9qRmFyQ2xpcCxcbiAgICBNYXRyVlAsXG4gICAgTWF0clZpZXcsXG4gICAgTWF0clByb2osXG4gICAgTG9jLFxuICAgIEF0LFxuICAgIERpcixcbiAgICBVcCxcbiAgICBSaWdodCxcbiAgICA1MDAsXG4gICAgNTAwXG4gICk7XG59XG4iLCJpbXBvcnQgeyBteVRpbWVyIH0gZnJvbSBcIi4vcmVzL3RpbWVyXCI7XHJcbmltcG9ydCB7IG15SW5wdXQgfSBmcm9tIFwiLi9yZXMvaW5wdXRcIjtcclxuaW1wb3J0IHsgcGFyc2VyIH0gZnJvbSBcIi4vcmVzL3BhcnNlclwiO1xyXG5pbXBvcnQgeyBVYm9fTWF0ciwgVUJPIH0gZnJvbSBcIi4vcmVzL3Vib1wiO1xyXG5cclxuaW1wb3J0IHsgX3ZlYzMgfSBmcm9tIFwiLi9tYXRoL21hdGh2ZWMzXCI7XHJcblxyXG5pbXBvcnQgeyBjYW0sIENhbVNldCB9IGZyb20gXCIuL21hdGgvbWF0aGNhbVwiO1xyXG5pbXBvcnQgeyBfbWF0cjQgfSBmcm9tIFwiLi9tYXRoL21hdGhtYXQ0XCI7XHJcbmltcG9ydCB7IFNwaGVyZXMsIEdldEFycmF5U3BoZXJlcyB9IGZyb20gXCIuL29iamVjdHNcIjtcclxuXHJcbmxldCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcclxuXHJcbmxldCBVYm9fc2V0MTogVUJPO1xyXG5leHBvcnQgbGV0IFVib19zZXQxX2RhdGE6IFVib19NYXRyO1xyXG5sZXQgVWJvX3NldDI6IFVCTztcclxuXHJcbmxldCBGbGFnRGF0YU9iamVjdFVwZGF0ZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG5pbnRlcmZhY2UgUHJvZ3JhbUluZm8ge1xyXG4gIHByb2dyYW06IFdlYkdMUHJvZ3JhbTtcclxuICBhdHRyaWJMb2NhdGlvbnM6IHtcclxuICAgIHZlcnRleFBvc2l0aW9uOiBudW1iZXI7XHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdENhbSgpIHtcclxuICBDYW1TZXQoX3ZlYzMuc2V0KDAsIDAsIC01KSwgX3ZlYzMuc2V0KDAsIDAsIDApLCBfdmVjMy5zZXQoMCwgMSwgMCkpO1xyXG4gIFVib19zZXQxX2RhdGEuUHJvakRpc3RGYXJUaW1lTG9jYWwueCA9IGNhbS5Qcm9qRGlzdDtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyQ2FtKCkge1xyXG4gIGxldCBEaXN0ID0gX3ZlYzMubGVuKF92ZWMzLnN1YihjYW0uQXQsIGNhbS5Mb2MpKTtcclxuICBsZXQgY29zVCwgc2luVCwgY29zUCwgc2luUCwgcGxlbiwgQXppbXV0aCwgRWxldmF0b3I7XHJcbiAgbGV0IFdwLCBIcCwgc3gsIHN5O1xyXG4gIGxldCBkdjtcclxuICBpZiAobXlJbnB1dC5LZXlzWzE4XSkge1xyXG4gICAgV3AgPSBIcCA9IGNhbS5Qcm9qU2l6ZTtcclxuICAgIGNvc1QgPSAoY2FtLkxvYy55IC0gY2FtLkF0LnkpIC8gRGlzdDtcclxuICAgIHNpblQgPSBNYXRoLnNxcnQoMSAtIGNvc1QgKiBjb3NUKTtcclxuXHJcbiAgICBwbGVuID0gRGlzdCAqIHNpblQ7XHJcbiAgICBjb3NQID0gKGNhbS5Mb2MueiAtIGNhbS5BdC56KSAvIHBsZW47XHJcbiAgICBzaW5QID0gKGNhbS5Mb2MueCAtIGNhbS5BdC54KSAvIHBsZW47XHJcblxyXG4gICAgQXppbXV0aCA9IChNYXRoLmF0YW4yKHNpblAsIGNvc1ApIC8gTWF0aC5QSSkgKiAxODA7XHJcbiAgICBFbGV2YXRvciA9IChNYXRoLmF0YW4yKHNpblQsIGNvc1QpIC8gTWF0aC5QSSkgKiAxODA7XHJcblxyXG4gICAgbGV0IGtleSA9IFwiQURcIjtcclxuXHJcbiAgICBBemltdXRoICs9XHJcbiAgICAgIG15VGltZXIuZ2xvYmFsRGVsdGFUaW1lICpcclxuICAgICAgMyAqXHJcbiAgICAgICgtMzAgKiBteUlucHV0Lk1vdXNlQ2xpY2tMZWZ0ICogbXlJbnB1dC5NZHgpO1xyXG4gICAgRWxldmF0b3IgKz1cclxuICAgICAgbXlUaW1lci5nbG9iYWxEZWx0YVRpbWUgKlxyXG4gICAgICAyICpcclxuICAgICAgKC0zMCAqIG15SW5wdXQuTW91c2VDbGlja0xlZnQgKiBteUlucHV0Lk1keSk7XHJcblxyXG4gICAgaWYgKEVsZXZhdG9yIDwgMC4wOCkgRWxldmF0b3IgPSAwLjA4O1xyXG4gICAgZWxzZSBpZiAoRWxldmF0b3IgPiAxNzguOSkgRWxldmF0b3IgPSAxNzguOTtcclxuXHJcbiAgICAvLyBpZiAoQXppbXV0aCA8IC00NSkgQXppbXV0aCA9IC00NTtcclxuICAgIC8vIGVsc2UgaWYgKEF6aW11dGggPiA0NSkgQXppbXV0aCA9IDQ1O1xyXG5cclxuICAgIERpc3QgKz1cclxuICAgICAgbXlUaW1lci5nbG9iYWxEZWx0YVRpbWUgKlxyXG4gICAgICAoMSArIG15SW5wdXQuS2V5c1sxNl0gKiAyNykgKlxyXG4gICAgICAoMS4yICogbXlJbnB1dC5NZHopO1xyXG4gICAgaWYgKERpc3QgPCAwLjEpIERpc3QgPSAwLjE7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhrZXkuY2hhckNvZGVBdCgwKSk7XHJcbiAgICBpZiAobXlJbnB1dC5Nb3VzZUNsaWNrUmlnaHQpIHtcclxuICAgICAgaWYgKGNhbS5GcmFtZVcgPiBjYW0uRnJhbWVIKSBXcCAqPSBjYW0uRnJhbWVXIC8gY2FtLkZyYW1lSDtcclxuICAgICAgZWxzZSBIcCAqPSBjYW0uRnJhbWVIIC8gY2FtLkZyYW1lVztcclxuXHJcbiAgICAgIHN4ID0gKCgoLW15SW5wdXQuTWR4ICogV3AgKiAxMCkgLyBjYW0uRnJhbWVXKSAqIERpc3QpIC8gY2FtLlByb2pEaXN0O1xyXG4gICAgICBzeSA9ICgoKG15SW5wdXQuTWR5ICogSHAgKiAxMCkgLyBjYW0uRnJhbWVIKSAqIERpc3QpIC8gY2FtLlByb2pEaXN0O1xyXG5cclxuICAgICAgZHYgPSBfdmVjMy5hZGQoX3ZlYzMubXVsbnVtKGNhbS5SaWdodCwgc3gpLCBfdmVjMy5tdWxudW0oY2FtLlVwLCBzeSkpO1xyXG5cclxuICAgICAgY2FtLkF0ID0gX3ZlYzMuYWRkKGNhbS5BdCwgZHYpO1xyXG4gICAgICBjYW0uTG9jID0gX3ZlYzMuYWRkKGNhbS5Mb2MsIGR2KTtcclxuICAgIH1cclxuICAgIENhbVNldChcclxuICAgICAgX21hdHI0LnBvaW50X3RyYW5zZm9ybShcclxuICAgICAgICBuZXcgX3ZlYzMoMCwgRGlzdCwgMCksXHJcbiAgICAgICAgX21hdHI0Lm11bG1hdHIoXHJcbiAgICAgICAgICBfbWF0cjQubXVsbWF0cihfbWF0cjQucm90YXRlWChFbGV2YXRvciksIF9tYXRyNC5yb3RhdGVZKEF6aW11dGgpKSxcclxuICAgICAgICAgIF9tYXRyNC50cmFuc2xhdGUoY2FtLkF0KVxyXG4gICAgICAgIClcclxuICAgICAgKSxcclxuICAgICAgY2FtLkF0LFxyXG4gICAgICBuZXcgX3ZlYzMoMCwgMSwgMClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBVYm9fc2V0MV9kYXRhLkNhbUxvYyA9IGNhbS5Mb2M7XHJcbiAgVWJvX3NldDFfZGF0YS5DYW1BdCA9IGNhbS5BdDtcclxuICBVYm9fc2V0MV9kYXRhLkNhbVJpZ2h0ID0gY2FtLlJpZ2h0O1xyXG4gIFVib19zZXQxX2RhdGEuQ2FtVXAgPSBjYW0uVXA7XHJcbiAgVWJvX3NldDFfZGF0YS5DYW1EaXIgPSBjYW0uRGlyO1xyXG5cclxuICAvLyAgIGlmIChBbmktPktleXNbVktfU0hJRlRdICYmIEFuaS0+S2V5c0NsaWNrWydQJ10pXHJcbiAgLy8gICAgIEFuaS0+SXNQYXVzZSA9ICFBbmktPklzUGF1c2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2l6ZUNhbSh3OiBudW1iZXIsIGg6IG51bWJlcikge1xyXG4gIFVib19zZXQxX2RhdGEuZmxhZ3MxMkZyYW1lVy56ID0gdztcclxuICBVYm9fc2V0MV9kYXRhLmZsYWdzNDVGcmFtZUgueiA9IGg7XHJcbiAgY2FtLlByb2pTZXQoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVsb2FkU2hhZGVycygpOiBQcm9taXNlPFByb2dyYW1JbmZvIHwgbnVsbD4ge1xyXG4gIGNvbnN0IHZzUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgIFwiLi9zaGFkZXIvbWFyY2gudmVydGV4Lmdsc2xcIiArIFwiP25vY2FjaGVcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgKTtcclxuICBjb25zdCB2c1RleHQgPSBhd2FpdCB2c1Jlc3BvbnNlLnRleHQoKTtcclxuICAvLyBjb25zb2xlLmxvZyh2c1RleHQpO1xyXG5cclxuICBjb25zdCBmc1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICBcIi4vc2hhZGVyL21hcmNoLmZyYWdtZW50Lmdsc2xcIiArIFwiP25vY2FjaGVcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgKTtcclxuICBjb25zdCBmc1RleHQgPSBhd2FpdCBmc1Jlc3BvbnNlLnRleHQoKTtcclxuICBjb25zdCBkdFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICBcIi4vZGF0YS50eHRcIiArIFwiP25vY2FjaGVcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXHJcbiAgKTtcclxuICBjb25zdCBkdFRleHQgPSBhd2FpdCBkdFJlc3BvbnNlLnRleHQoKTtcclxuICBwYXJzZXIoZHRUZXh0KTtcclxuICBGbGFnRGF0YU9iamVjdFVwZGF0ZSA9IGZhbHNlO1xyXG4gIGNvbnNvbGUubG9nKFNwaGVyZXMpO1xyXG4gIFVib19zZXQyLnVwZGF0ZShHZXRBcnJheVNwaGVyZXMoKSwgZ2wpO1xyXG4gIGNvbnN0IHNoYWRlclByb2dyYW0gPSBpbml0U2hhZGVyUHJvZ3JhbSh2c1RleHQsIGZzVGV4dCk7XHJcbiAgaWYgKCFzaGFkZXJQcm9ncmFtKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgY29uc3QgcHJvZ3JhbUluZm86IFByb2dyYW1JbmZvID0ge1xyXG4gICAgcHJvZ3JhbTogc2hhZGVyUHJvZ3JhbSxcclxuICAgIGF0dHJpYkxvY2F0aW9uczoge1xyXG4gICAgICB2ZXJ0ZXhQb3NpdGlvbjogZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbSwgXCJpbl9wb3NcIilcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gcHJvZ3JhbUluZm87XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGxvYWRTaGFkZXIodHlwZTogbnVtYmVyLCBzb3VyY2U6IHN0cmluZykge1xyXG4gIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcclxuICBpZiAoIXNoYWRlcikgcmV0dXJuIG51bGw7XHJcbiAgLy8gU2VuZCB0aGUgc291cmNlIHRvIHRoZSBzaGFkZXIgb2JqZWN0XHJcblxyXG4gIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XHJcblxyXG4gIC8vIENvbXBpbGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblxyXG4gIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcclxuXHJcbiAgLy8gU2VlIGlmIGl0IGNvbXBpbGVkIHN1Y2Nlc3NmdWxseVxyXG5cclxuICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgYWxlcnQoXHJcbiAgICAgIGBBbiBlcnJvciBvY2N1cnJlZCBjb21waWxpbmcgdGhlIHNoYWRlcnM6ICR7Z2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpfWBcclxuICAgICk7XHJcbiAgICBnbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHNoYWRlcjtcclxufVxyXG5cclxuLy9cclxuLy8gSW5pdGlhbGl6ZSBhIHNoYWRlciBwcm9ncmFtLCBzbyBXZWJHTCBrbm93cyBob3cgdG8gZHJhdyBvdXIgZGF0YVxyXG4vL1xyXG5mdW5jdGlvbiBpbml0U2hhZGVyUHJvZ3JhbSh2c1NvdXJjZTogc3RyaW5nLCBmc1NvdXJjZTogc3RyaW5nKSB7XHJcbiAgY29uc3QgdmVydGV4U2hhZGVyID0gbG9hZFNoYWRlcihnbC5WRVJURVhfU0hBREVSLCB2c1NvdXJjZSk7XHJcbiAgaWYgKCF2ZXJ0ZXhTaGFkZXIpIHJldHVybjtcclxuICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGxvYWRTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSLCBmc1NvdXJjZSk7XHJcbiAgaWYgKCFmcmFnbWVudFNoYWRlcikgcmV0dXJuO1xyXG5cclxuICAvLyBDcmVhdGUgdGhlIHNoYWRlciBwcm9ncmFtXHJcblxyXG4gIGNvbnN0IHNoYWRlclByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgaWYgKCFzaGFkZXJQcm9ncmFtKSByZXR1cm47XHJcbiAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcbiAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuICBnbC5saW5rUHJvZ3JhbShzaGFkZXJQcm9ncmFtKTtcclxuXHJcbiAgLy8gSWYgY3JlYXRpbmcgdGhlIHNoYWRlciBwcm9ncmFtIGZhaWxlZCwgYWxlcnRcclxuXHJcbiAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHNoYWRlclByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgYWxlcnQoXHJcbiAgICAgIGBVbmFibGUgdG8gaW5pdGlhbGl6ZSB0aGUgc2hhZGVyIHByb2dyYW06ICR7Z2wuZ2V0UHJvZ3JhbUluZm9Mb2coXHJcbiAgICAgICAgc2hhZGVyUHJvZ3JhbVxyXG4gICAgICApfWBcclxuICAgICk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHJldHVybiBzaGFkZXJQcm9ncmFtO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0UG9zaXRpb25CdWZmZXIoKTogV2ViR0xCdWZmZXIgfCBudWxsIHtcclxuICAvLyBDcmVhdGUgYSBidWZmZXIgZm9yIHRoZSBzcXVhcmUncyBwb3NpdGlvbnMuXHJcbiAgY29uc3QgcG9zaXRpb25CdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHJcbiAgLy8gU2VsZWN0IHRoZSBwb3NpdGlvbkJ1ZmZlciBhcyB0aGUgb25lIHRvIGFwcGx5IGJ1ZmZlclxyXG4gIC8vIG9wZXJhdGlvbnMgdG8gZnJvbSBoZXJlIG91dC5cclxuICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xyXG5cclxuICAvLyBOb3cgY3JlYXRlIGFuIGFycmF5IG9mIHBvc2l0aW9ucyBmb3IgdGhlIHNxdWFyZS5cclxuICBjb25zdCBwb3NpdGlvbnMgPSBbMS4wLCAxLjAsIC0xLjAsIDEuMCwgMS4wLCAtMS4wLCAtMS4wLCAtMS4wXTtcclxuXHJcbiAgLy8gTm93IHBhc3MgdGhlIGxpc3Qgb2YgcG9zaXRpb25zIGludG8gV2ViR0wgdG8gYnVpbGQgdGhlXHJcbiAgLy8gc2hhcGUuIFdlIGRvIHRoaXMgYnkgY3JlYXRpbmcgYSBGbG9hdDMyQXJyYXkgZnJvbSB0aGVcclxuICAvLyBKYXZhU2NyaXB0IGFycmF5LCB0aGVuIHVzZSBpdCB0byBmaWxsIHRoZSBjdXJyZW50IGJ1ZmZlci5cclxuICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gIHJldHVybiBwb3NpdGlvbkJ1ZmZlcjtcclxufVxyXG5cclxuaW50ZXJmYWNlIEJ1ZmZlcnMge1xyXG4gIHBvc2l0aW9uOiBXZWJHTEJ1ZmZlciB8IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRCdWZmZXJzKCk6IEJ1ZmZlcnMge1xyXG4gIGNvbnN0IHBvc2l0aW9uQnVmZmVyID0gaW5pdFBvc2l0aW9uQnVmZmVyKCk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwb3NpdGlvbjogcG9zaXRpb25CdWZmZXJcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRQb3NpdGlvbkF0dHJpYnV0ZShidWZmZXJzOiBCdWZmZXJzLCBwcm9ncmFtSW5mbzogUHJvZ3JhbUluZm8pIHtcclxuICBjb25zdCBudW1Db21wb25lbnRzID0gMjsgLy8gcHVsbCBvdXQgMiB2YWx1ZXMgcGVyIGl0ZXJhdGlvblxyXG4gIGNvbnN0IHR5cGUgPSBnbC5GTE9BVDsgLy8gdGhlIGRhdGEgaW4gdGhlIGJ1ZmZlciBpcyAzMmJpdCBmbG9hdHNcclxuICBjb25zdCBub3JtYWxpemUgPSBmYWxzZTsgLy8gZG9uJ3Qgbm9ybWFsaXplXHJcbiAgY29uc3Qgc3RyaWRlID0gMDsgLy8gaG93IG1hbnkgYnl0ZXMgdG8gZ2V0IGZyb20gb25lIHNldCBvZiB2YWx1ZXMgdG8gdGhlIG5leHRcclxuICAvLyAwID0gdXNlIHR5cGUgYW5kIG51bUNvbXBvbmVudHMgYWJvdmVcclxuICBjb25zdCBvZmZzZXQgPSAwOyAvLyBob3cgbWFueSBieXRlcyBpbnNpZGUgdGhlIGJ1ZmZlciB0byBzdGFydCBmcm9tXHJcbiAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlcnMucG9zaXRpb24pO1xyXG4gIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoXHJcbiAgICBwcm9ncmFtSW5mby5hdHRyaWJMb2NhdGlvbnMudmVydGV4UG9zaXRpb24sXHJcbiAgICBudW1Db21wb25lbnRzLFxyXG4gICAgdHlwZSxcclxuICAgIG5vcm1hbGl6ZSxcclxuICAgIHN0cmlkZSxcclxuICAgIG9mZnNldFxyXG4gICk7XHJcbiAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocHJvZ3JhbUluZm8uYXR0cmliTG9jYXRpb25zLnZlcnRleFBvc2l0aW9uKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd1NjZW5lKFxyXG4gIHByb2dyYW1JbmZvOiBQcm9ncmFtSW5mbyB8IG51bGwsXHJcbiAgYnVmZmVyczogQnVmZmVycyxcclxuICBVbmk6IFdlYkdMVW5pZm9ybUxvY2F0aW9uXHJcbikge1xyXG4gIGdsLmNsZWFyQ29sb3IoMC4yOCwgMC40NywgMC44LCAxLjApOyAvLyBDbGVhciB0byBibGFjaywgZnVsbHkgb3BhcXVlXHJcbiAgZ2wuY2xlYXJEZXB0aCgxLjApOyAvLyBDbGVhciBldmVyeXRoaW5nXHJcbiAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpOyAvLyBFbmFibGUgZGVwdGggdGVzdGluZ1xyXG4gIGdsLmRlcHRoRnVuYyhnbC5MRVFVQUwpOyAvLyBOZWFyIHRoaW5ncyBvYnNjdXJlIGZhciB0aGluZ3NcclxuXHJcbiAgLy8gQ2xlYXIgdGhlIGNhbnZhcyBiZWZvcmUgd2Ugc3RhcnQgZHJhd2luZyBvbiBpdC5cclxuXHJcbiAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gIGlmIChwcm9ncmFtSW5mbyA9PSBudWxsKSByZXR1cm47XHJcbiAgc2V0UG9zaXRpb25BdHRyaWJ1dGUoYnVmZmVycywgcHJvZ3JhbUluZm8pO1xyXG5cclxuICAvLyBUZWxsIFdlYkdMIHRvIHVzZSBvdXIgcHJvZ3JhbSB3aGVuIGRyYXdpbmdcclxuXHJcbiAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtSW5mby5wcm9ncmFtKTtcclxuICBVYm9fc2V0MS5hcHBseSgwLCBwcm9ncmFtSW5mby5wcm9ncmFtLCBnbCk7XHJcbiAgVWJvX3NldDIuYXBwbHkoMSwgcHJvZ3JhbUluZm8ucHJvZ3JhbSwgZ2wpO1xyXG4gIGNvbnN0IG9mZnNldCA9IDA7XHJcbiAgY29uc3QgdmVydGV4Q291bnQgPSA0O1xyXG4gIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVfU1RSSVAsIG9mZnNldCwgdmVydGV4Q291bnQpO1xyXG59XHJcbmxldCBNZCA9IFswLCAwXSxcclxuICBNb3VzZUNsaWNrID0gWzAsIDBdLFxyXG4gIFdoZWVsID0gMCxcclxuICBLZXlzID0gbmV3IEFycmF5KDI1NSkuZmlsbCgwKTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XHJcbiAgY29uc3QgdnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgXCIuL3NoYWRlci9tYXJjaC52ZXJ0ZXguZ2xzbFwiICsgXCI/bm9jYWNoZVwiICsgbmV3IERhdGUoKS5nZXRUaW1lKClcclxuICApO1xyXG4gIGNvbnN0IHZzVGV4dCA9IGF3YWl0IHZzUmVzcG9uc2UudGV4dCgpO1xyXG4gIGNvbnNvbGUubG9nKHZzVGV4dCk7XHJcbiAgY29uc3QgZnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgXCIuL3NoYWRlci9tYXJjaC5mcmFnbWVudC5nbHNsXCIgKyBcIj9ub2NhY2hlXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxyXG4gICk7XHJcbiAgY29uc3QgZnNUZXh0ID0gYXdhaXQgZnNSZXNwb25zZS50ZXh0KCk7XHJcbiAgY29uc29sZS5sb2coZnNUZXh0KTtcclxuXHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnbGNhbnZhc1wiKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICBpZiAoIWNhbnZhcykge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICAvLyBJbml0aWFsaXplIHRoZSBHTCBjb250ZXh0XHJcbiAgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG4gIGdsLmNhbnZhcy53aWR0aCA9IHc7XHJcbiAgZ2wuY2FudmFzLmhlaWdodCA9IGg7XHJcblxyXG4gIC8vIE9ubHkgY29udGludWUgaWYgV2ViR0wgaXMgYXZhaWxhYmxlIGFuZCB3b3JraW5nXHJcbiAgaWYgKGdsID09PSBudWxsKSB7XHJcbiAgICBhbGVydChcclxuICAgICAgXCJVbmFibGUgdG8gaW5pdGlhbGl6ZSBXZWJHTC4gWW91ciBicm93c2VyIG9yIG1hY2hpbmUgbWF5IG5vdCBzdXBwb3J0IGl0LlwiXHJcbiAgICApO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0IGNsZWFyIGNvbG9yIHRvIGJsYWNrLCBmdWxseSBvcGFxdWVcclxuICBnbC5jbGVhckNvbG9yKDAuMjgsIDAuNDcsIDAuOCwgMS4wKTtcclxuICAvLyBDbGVhciB0aGUgY29sb3IgYnVmZmVyIHdpdGggc3BlY2lmaWVkIGNsZWFyIGNvbG9yXHJcbiAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XHJcblxyXG4gIGxldCBzaGFkZXJQcm9ncmFtID0gaW5pdFNoYWRlclByb2dyYW0odnNUZXh0LCBmc1RleHQpO1xyXG4gIGlmICghc2hhZGVyUHJvZ3JhbSkgcmV0dXJuO1xyXG5cclxuICBsZXQgcHJvZ3JhbUluZm86IFByb2dyYW1JbmZvIHwgbnVsbCA9IHtcclxuICAgIHByb2dyYW06IHNoYWRlclByb2dyYW0sXHJcbiAgICBhdHRyaWJMb2NhdGlvbnM6IHtcclxuICAgICAgdmVydGV4UG9zaXRpb246IGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW0sIFwiaW5fcG9zXCIpXHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCBVbmkgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtLCBcInRpbWVcIik7XHJcbiAgY29uc3QgYnVmZmVycyA9IGluaXRCdWZmZXJzKCk7XHJcbiAgVWJvX3NldDFfZGF0YSA9IG5ldyBVYm9fTWF0cihcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcclxuICAgIDAsXHJcbiAgICAwLFxyXG4gICAgMFxyXG4gICk7XHJcbiAgVWJvX3NldDEgPSBVQk8uY3JlYXRlKFVib19zZXQxX2RhdGEuR2V0QXJyYXkoKS5sZW5ndGgsIFwiQmFzZURhdGFcIiwgZ2wpO1xyXG4gIFVib19zZXQyID0gVUJPLmNyZWF0ZSgyNCAqIDEwICsgNCwgXCJTcGhlcmVcIiwgZ2wpO1xyXG4gIGluaXRDYW0oKTtcclxuICBnbC52aWV3cG9ydCgwLCAwLCB3LCBoKTtcclxuICByZXNpemVDYW0odywgaCk7XHJcbiAgbGV0IHByb2dyYW1JbmY6IFByb2dyYW1JbmZvIHwgbnVsbDtcclxuICBwcm9ncmFtSW5mID0gcHJvZ3JhbUluZm87XHJcbiAgcHJvZ3JhbUluZiA9IGF3YWl0IHJlbG9hZFNoYWRlcnMoKTtcclxuICBjb25zdCByZW5kZXIgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAobXlJbnB1dC5LZXlzQ2xpY2tbODJdKSBwcm9ncmFtSW5mID0gYXdhaXQgcmVsb2FkU2hhZGVycygpO1xyXG4gICAgbXlUaW1lci5SZXNwb25zZSgpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBpZiAoZS5idXR0b24gPT0gMCkge1xyXG4gICAgICAgIE1vdXNlQ2xpY2tbMF0gPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlLmJ1dHRvbiA9PSAyKSB7XHJcbiAgICAgICAgTW91c2VDbGlja1sxXSA9IDE7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xyXG4gICAgICBpZiAoZS5idXR0b24gPT0gMCkge1xyXG4gICAgICAgIE1vdXNlQ2xpY2tbMF0gPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChlLmJ1dHRvbiA9PSAyKSB7XHJcbiAgICAgICAgTW91c2VDbGlja1sxXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlKSA9PiB7XHJcbiAgICAgIE1kWzBdID0gZS5tb3ZlbWVudFg7XHJcbiAgICAgIE1kWzFdID0gZS5tb3ZlbWVudFk7XHJcbiAgICB9KTtcclxuXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGUpID0+IHtcclxuICAgICAgS2V5c1tlLmtleUNvZGVdID0gMTtcclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKGUpID0+IHtcclxuICAgICAgS2V5c1tlLmtleUNvZGVdID0gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGUpID0+IHtcclxuICAgICAgV2hlZWwgPSBlLmRlbHRhWTtcclxuICAgIH0pO1xyXG5cclxuICAgIG15SW5wdXQucmVzcG9uc2UoTWQsIE1vdXNlQ2xpY2ssIFdoZWVsLCBLZXlzKTtcclxuXHJcbiAgICBNZFswXSA9IE1kWzFdID0gMDtcclxuICAgIHJlbmRlckNhbSgpO1xyXG4gICAgVWJvX3NldDFfZGF0YS5UaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsLnggPSBteVRpbWVyLmdsb2JhbFRpbWU7XHJcbiAgICBVYm9fc2V0MS51cGRhdGUoVWJvX3NldDFfZGF0YS5HZXRBcnJheSgpLCBnbCk7XHJcbiAgICBkcmF3U2NlbmUocHJvZ3JhbUluZiwgYnVmZmVycywgVW5pKTtcclxuICAgIFdoZWVsID0gMDtcclxuICAgIEtleXMuZmlsbCgwKTtcclxuICAgIGNvbnNvbGUubG9nKG15VGltZXIuRlBTKTtcclxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcclxuICB9O1xyXG4gIHJlbmRlcigpO1xyXG59XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KSA9PiB7XHJcbiAgbGV0IHc6IG51bWJlciA9IHdpbmRvdy5pbm5lcldpZHRoO1xyXG4gIGxldCBoOiBudW1iZXIgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgbWFpbih3LCBoKTtcclxufSk7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoZXZlbnQpID0+IHtcclxuICBsZXQgdzogbnVtYmVyID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgbGV0IGg6IG51bWJlciA9IHdpbmRvdy5pbm5lckhlaWdodDtcclxuICBnbC5jYW52YXMud2lkdGggPSB3O1xyXG4gIGdsLmNhbnZhcy5oZWlnaHQgPSBoO1xyXG4gIGdsLnZpZXdwb3J0KDAsIDAsIHcsIGgpO1xyXG4gIHJlc2l6ZUNhbSh3LCBoKTtcclxufSk7XHJcbiJdLCJuYW1lcyI6WyJVYm9fc2V0MV9kYXRhIl0sIm1hcHBpbmdzIjoiOzs7SUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUVBLE1BQU0sSUFBSSxDQUFBO1FBQ1IsT0FBTyxHQUFB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QUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLElBQUksSUFBSTtvQkFBRSxTQUFTOztJQUNuQixnQkFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXJCLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLElBQUksSUFBSTtvQkFBRSxTQUFTOztJQUNuQixnQkFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXJCLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLElBQUksSUFBSTtvQkFBRSxTQUFTOztJQUNuQixnQkFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFckIsWUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRS9CLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLElBQUksSUFBSTtvQkFBRSxTQUFTOztJQUNuQixnQkFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRXJCLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLElBQUksSUFBSTtvQkFBRSxTQUFTOztJQUNuQixnQkFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFckIsWUFBQSxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUMsWUFBQSxHQUFHLENB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QUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1I7SUFDSCxZQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxnQkFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSO0lBQ0gsWUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsZ0JBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUjtJQUNILFlBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLGdCQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsRUFDSDtTQUNIO1FBRUQsT0FBTyxPQUFPLENBQUMsQ0FBYSxFQUFBO1lBQzFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsUUFBQSxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUIsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUFFLFlBQUEsT0FBTyxDQUFDLENBQUM7SUFDeEIsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUVYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBRVgsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBRVYsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLEdBQUcsQ0FBQztJQUNWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLEdBQUcsQ0FBQztJQUNWLFFBQUEsT0FBTyxDQUFDLENBQUM7U0FDVjtJQUNELElBQUEsT0FBTyxPQUFPLENBQ1osQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQUE7SUFFVCxRQUFBLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUUxQixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVosUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFYixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFWixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7UUFFRCxPQUFPLEtBQUssQ0FBQyxDQUFhLEVBQUE7WUFDeEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRVgsUUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQzFCLFlBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDakI7YUFDRjtJQUVELFFBQUEsT0FBTyxDQUFDLENBQUM7U0FDVjtJQUVELElBQUEsT0FBTyxlQUFlLENBQUMsQ0FBUSxFQUFFLENBQWEsRUFBQTtJQUM1QyxRQUFBLE9BQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RCxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3ZELENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDeEQsQ0FBQztTQUNIO0lBRUQsSUFBQSxPQUFPLGdCQUFnQixDQUFDLENBQVEsRUFBRSxDQUFhLEVBQUE7WUFDN0MsT0FBTyxJQUFJLEtBQUssQ0FDZCxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDN0MsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM5QyxDQUFDO1NBQ0g7SUFDRCxJQUFBLE9BQU8sUUFBUSxDQUFDLENBQVEsRUFBRSxDQUFhLEVBQUE7WUFDckMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLFFBQUEsT0FBTyxJQUFJLEtBQUssQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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QUMsTUFBTSxDQUFDO0lBS3JDLFFBQUEsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQ1AsRUFBRSxHQUFHLENBQUMsRUFDTixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQ1AsRUFBRSxHQUFHLENBQUMsRUFDTixRQUFRLEVBQ1IsV0FBVyxDQUNaLENBQUM7SUFDRixRQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM1RDtJQUVELElBQUEsT0FBTyxJQUFJLENBQUMsR0FBVSxFQUFFLEVBQVMsRUFBRSxHQUFVLEVBQUE7SUFDM0MsUUFBQSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQzdDLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQzlDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQixRQUFBLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FDZixLQUFLLENBQUMsQ0FBQyxFQUNQLEVBQUUsQ0FBQyxDQUFDLEVBQ0osQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLENBQUMsRUFDRCxLQUFLLENBQUMsQ0FBQyxFQUNQLEVBQUUsQ0FBQyxDQUFDLEVBRUosQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLENBQUMsRUFDRCxLQUFLLENBQUMsQ0FBQyxFQUNQLEVBQUUsQ0FBQyxDQUFDLEVBQ0osQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUNOLENBQUMsRUFDRCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUN0QixDQUFDLEtBQUssQ0FBQyxHQUFH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
