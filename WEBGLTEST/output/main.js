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

    class surface {
        Name = "Default";
        Ka = _vec3.set(0.1, 0.1, 0.1);
        Kd = _vec3.set(0.9, 0.9, 0.9);
        Ks = _vec3.set(0.3, 0.3, 0.3);
        Ph = 30;
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
    class shape {
        Obj = _matr4.identity();
        Matrix = _matr4.identity();
        TypeShape = 0;
        Material = 0;
        GetArray() {
            return [..._matr4.toarr(this.Obj), ..._matr4.toarr(this.Matrix), this.TypeShape, this.Material, 0, 0];
        }
    }
    let Shapes = [];
    let Surfaces = [];
    function GetArrayObjects() {
        let Result = [Shapes.length, 0, 0, 0];
        for (let element of Shapes) {
            Result = Result.concat(element.GetArray());
        }
        return new Float32Array(Result);
    }
    function GetArraySurfaces() {
        let Result = [Surfaces.length, 0, 0, 0];
        for (let element of Surfaces) {
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
        Shapes.length = 0;
        Surfaces.length = 1;
        let arrayOfStrings = Txt.split("\n");
        for (let i = 0; i < arrayOfStrings.length; i++) {
            if (arrayOfStrings[i][0] == "/" && arrayOfStrings[i][1] == "/")
                continue;
            let words = arrayOfStrings[i].split(" ");
            if (words.length == 1)
                continue;
            let Type = words[0];
            if (Type == "scene") {
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
            else if (Type == "surface") {
                if (words.length != 10)
                    continue;
                let x;
                let Surf = new surface();
                Surf.Name = words[1];
                let flag = false;
                for (let element of Surfaces) {
                    if (element.Name == Surf.Name) {
                        flag = true;
                        break;
                    }
                }
                if (flag)
                    continue;
                x = ReadVec3fromString(words[2]);
                if (x == null)
                    continue;
                Surf.Ka = x;
                x = ReadVec3fromString(words[3]);
                if (x == null)
                    continue;
                Surf.Kd = x;
                x = ReadVec3fromString(words[4]);
                if (x == null)
                    continue;
                Surf.Ks = x;
                Surf.Ph = Number(words[5]);
                x = ReadVec3fromString(words[6]);
                if (x == null)
                    continue;
                Surf.Kr = x;
                x = ReadVec3fromString(words[7]);
                if (x == null)
                    continue;
                Surf.Kt = x;
                Surf.RefractionCoef = Number(words[8]);
                Surf.Decay = Number(words[9]);
                Surfaces.push(Surf);
            }
            else {
                let id = -1;
                let x;
                let Sph = new shape();
                if (Type == "sphere") {
                    if (words.length != 6)
                        continue;
                    Sph.Obj[0][0] = Number(words[1]);
                    Sph.TypeShape = 0;
                    id = 2;
                }
                if (Type == "box") {
                    if (words.length != 6)
                        continue;
                    x = ReadVec3fromString(words[1]);
                    if (x == null)
                        continue;
                    Sph.Obj[0][0] = x.x;
                    Sph.Obj[0][1] = x.y;
                    Sph.Obj[0][2] = x.z;
                    Sph.TypeShape = 1;
                    id = 2;
                }
                if (Type == "round_box") {
                    if (words.length != 7)
                        continue;
                    x = ReadVec3fromString(words[1]);
                    if (x == null)
                        continue;
                    Sph.Obj[0][0] = x.x;
                    Sph.Obj[0][1] = x.y;
                    Sph.Obj[0][2] = x.z;
                    Sph.Obj[0][3] = Number(words[2]);
                    Sph.TypeShape = 2;
                    id = 3;
                }
                if (Type == "torus") {
                    if (words.length != 7)
                        continue;
                    Sph.Obj[0][0] = Number(words[1]);
                    Sph.Obj[0][1] = Number(words[2]);
                    Sph.TypeShape = 3;
                    id = 3;
                }
                if (Type == "cylinder") {
                    if (words.length != 6)
                        continue;
                    x = ReadVec3fromString(words[1]);
                    if (x == null)
                        continue;
                    Sph.Obj[0][0] = x.x;
                    Sph.Obj[0][1] = x.y;
                    Sph.Obj[0][2] = x.z;
                    Sph.TypeShape = 4;
                    id = 2;
                }
                if (id != -1) {
                    let Scale;
                    let Rot;
                    let Trans;
                    x = ReadVec3fromString(words[id]);
                    if (x == null)
                        continue;
                    Trans = _matr4.translate(x);
                    x = ReadVec3fromString(words[id + 1]);
                    if (x == null)
                        continue;
                    Rot = _matr4.mulmatr(_matr4.mulmatr(_matr4.rotateY(x.x), _matr4.rotateY(x.y)), _matr4.rotateZ(x.z));
                    x = ReadVec3fromString(words[id + 2]);
                    if (x == null)
                        continue;
                    Scale = _matr4.scale(x);
                    Sph.Matrix = _matr4.inverse(_matr4.mulmatr(_matr4.mulmatr(Scale, Rot), Trans));
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
    let FpsCnvas;
    let Ubo_set1;
    exports.Ubo_set1_data = void 0;
    let Ubo_set2;
    let Ubo_set3;
    let max_size = 10;
    function initCam() {
        CamSet(_vec3.set(-2, 6, -6), _vec3.set(0, 0, 0), _vec3.set(0, 1, 0));
        exports.Ubo_set1_data.ProjDistFarTimeLocal.x = cam.ProjDist;
    }
    function renderCam() {
        let Dist = _vec3.len(_vec3.sub(cam.At, cam.Loc));
        let cosT, sinT, cosP, sinP, plen, Azimuth, Elevator;
        let Wp, Hp, sx, sy;
        let dv;
        Wp = Hp = cam.ProjSize;
        cosT = (cam.Loc.y - cam.At.y) / Dist;
        sinT = Math.sqrt(1 - cosT * cosT);
        plen = Dist * sinT;
        cosP = (cam.Loc.z - cam.At.z) / plen;
        sinP = (cam.Loc.x - cam.At.x) / plen;
        Azimuth = (Math.atan2(sinP, cosP) / Math.PI) * 180;
        Elevator = (Math.atan2(sinT, cosT) / Math.PI) * 180;
        Azimuth +=
            myTimer.globalDeltaTime * 3 * (-30 * myInput.MouseClickLeft * myInput.Mdx);
        Elevator +=
            myTimer.globalDeltaTime * 2 * (-30 * myInput.MouseClickLeft * myInput.Mdy);
        if (Elevator < 0.08)
            Elevator = 0.08;
        else if (Elevator > 178.9)
            Elevator = 178.9;
        // if (Azimuth < -45) Azimuth = -45;
        // else if (Azimuth > 45) Azimuth = 45;
        Dist +=
            myTimer.globalDeltaTime * (1 + myInput.Keys[16] * 27) * (1.2 * myInput.Mdz);
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
        exports.Ubo_set1_data.CamLoc = cam.Loc;
        exports.Ubo_set1_data.CamAt = cam.At;
        exports.Ubo_set1_data.CamRight = cam.Right;
        exports.Ubo_set1_data.CamUp = cam.Up;
        exports.Ubo_set1_data.CamDir = cam.Dir;
        //   if (Ani->Keys[VK_SHIFT] && Ani->KeysClick['P'])
        //     Ani->IsPause = !Ani->IsPause;
    }
    function drawFps() {
        FpsCnvas.clearRect(0, 0, FpsCnvas.canvas.width, FpsCnvas.canvas.height);
        FpsCnvas.font = "48px serif";
        FpsCnvas.fillText("FPS:" + myTimer.FPS.toFixed(2), 10, 50);
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
        console.log(Shapes);
        console.log(Surfaces);
        Ubo_set2.update(GetArrayObjects(), gl);
        Ubo_set3.update(GetArraySurfaces(), gl);
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
        Ubo_set3.apply(2, programInfo.program, gl);
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
        const canvas1 = document.querySelector("#fpscanvas");
        if (!canvas || !canvas1) {
            return;
        } // Initialize the GL context
        FpsCnvas = canvas1.getContext("2d");
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
        Surfaces.push(new surface());
        Ubo_set1 = UBO.create(exports.Ubo_set1_data.GetArray().length, "BaseData", gl);
        Ubo_set2 = UBO.create(36 * max_size + 4, "Primitives", gl);
        Ubo_set3 = UBO.create(20 * max_size + 4, "PrimitivesSurfaces", gl);
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
            drawFps();
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
        FpsCnvas.canvas.width = w;
        FpsCnvas.canvas.height = h;
        gl.viewport(0, 0, w, h);
        resizeCam(w, h);
    });

    exports.main = main;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vcmVzL3RpbWVyLnRzIiwiLi4vcmVzL2lucHV0LnRzIiwiLi4vbWF0aC9tYXRodmVjMy50cyIsIi4uL21hdGgvbWF0aG1hdDQudHMiLCIuLi9vYmplY3RzLnRzIiwiLi4vcmVzL3BhcnNlci50cyIsIi4uL3Jlcy91Ym8udHMiLCIuLi9tYXRoL21hdGhjYW0udHMiLCIuLi9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCB7IFVCTywgVWJvX2NlbGwgfSBmcm9tIFwiLi9ybmQvcmVzL3Viby5qc1wiO1xuLy8gaW1wb3J0IHsgY2FtIH0gZnJvbSBcIi4vbWF0aC9tYXRoY2FtLmpzXCI7XG4vLyBpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzMuanNcIjtcbi8vIGltcG9ydCB7IENhbVVCTyB9IGZyb20gXCIuL3JuZC9ybmRiYXNlLmpzXCI7XG5cbmNsYXNzIFRpbWUge1xuICBnZXRUaW1lKCk6IG51bWJlciB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgbGV0IHQgPVxuICAgICAgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAvIDEwMDAuMCArXG4gICAgICBkYXRlLmdldFNlY29uZHMoKSArXG4gICAgICBkYXRlLmdldE1pbnV0ZXMoKSAqIDYwO1xuICAgIHJldHVybiB0O1xuICB9XG5cbiAgZ2xvYmFsVGltZTogbnVtYmVyO1xuICBsb2NhbFRpbWU6IG51bWJlcjtcbiAgZ2xvYmFsRGVsdGFUaW1lOiBudW1iZXI7XG4gIHBhdXNlVGltZTogbnVtYmVyO1xuICBsb2NhbERlbHRhVGltZTogbnVtYmVyO1xuICBmcmFtZUNvdW50ZXI6IG51bWJlcjtcbiAgc3RhcnRUaW1lOiBudW1iZXI7XG4gIG9sZFRpbWU6IG51bWJlcjtcbiAgb2xkVGltZUZQUzogbnVtYmVyO1xuICBpc1BhdXNlOiBib29sZWFuO1xuICBGUFM6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gRmlsbCB0aW1lciBnbG9iYWwgZGF0YVxuICAgIHRoaXMuZ2xvYmFsVGltZSA9IHRoaXMubG9jYWxUaW1lID0gdGhpcy5nZXRUaW1lKCk7XG4gICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0aGlzLmxvY2FsRGVsdGFUaW1lID0gMDtcblxuICAgIC8vIEZpbGwgdGltZXIgc2VtaSBnbG9iYWwgZGF0YVxuICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5vbGRUaW1lID0gdGhpcy5vbGRUaW1lRlBTID0gdGhpcy5nbG9iYWxUaW1lO1xuICAgIHRoaXMuZnJhbWVDb3VudGVyID0gMDtcbiAgICB0aGlzLmlzUGF1c2UgPSBmYWxzZTtcbiAgICB0aGlzLkZQUyA9IDMwLjA7XG4gICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xuICB9XG5cbiAgUmVzcG9uc2UoKSB7XG4gICAgbGV0IHQgPSB0aGlzLmdldFRpbWUoKTtcbiAgICAvLyBHbG9iYWwgdGltZVxuICAgIHRoaXMuZ2xvYmFsVGltZSA9IHQ7XG4gICAgdGhpcy5nbG9iYWxEZWx0YVRpbWUgPSB0IC0gdGhpcy5vbGRUaW1lO1xuICAgIC8vIFRpbWUgd2l0aCBwYXVzZVxuICAgIGlmICh0aGlzLmlzUGF1c2UpIHtcbiAgICAgIHRoaXMubG9jYWxEZWx0YVRpbWUgPSAwO1xuICAgICAgdGhpcy5wYXVzZVRpbWUgKz0gdCAtIHRoaXMub2xkVGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2NhbERlbHRhVGltZSA9IHRoaXMuZ2xvYmFsRGVsdGFUaW1lO1xuICAgICAgdGhpcy5sb2NhbFRpbWUgPSB0IC0gdGhpcy5wYXVzZVRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICB9XG4gICAgLy8gRlBTXG4gICAgdGhpcy5mcmFtZUNvdW50ZXIrKztcbiAgICBpZiAodCAtIHRoaXMub2xkVGltZUZQUyA+IDMpIHtcbiAgICAgIHRoaXMuRlBTID0gdGhpcy5mcmFtZUNvdW50ZXIgLyAodCAtIHRoaXMub2xkVGltZUZQUyk7XG4gICAgICB0aGlzLm9sZFRpbWVGUFMgPSB0O1xuICAgICAgdGhpcy5mcmFtZUNvdW50ZXIgPSAwO1xuICAgIH1cbiAgICB0aGlzLm9sZFRpbWUgPSB0O1xuICB9XG59XG5cbmV4cG9ydCBsZXQgbXlUaW1lciA9IG5ldyBUaW1lKCk7XG4iLCJjbGFzcyBJblB1dCB7XG4gIEtleXM6IG51bWJlcltdO1xuICBLZXlzQ2xpY2s6IG51bWJlcltdO1xuICBNeDogbnVtYmVyO1xuICBNeTogbnVtYmVyO1xuICBNejogbnVtYmVyO1xuICBNZHg6IG51bWJlcjtcbiAgTWR5OiBudW1iZXI7XG4gIE1kejogbnVtYmVyO1xuXG4gIE1vdXNlQ2xpY2tMZWZ0OiBudW1iZXI7XG4gIE1vdXNlQ2xpY2tSaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKE1vdXNlQ2xpY2s6IG51bWJlcltdLCBLZXlzOiBudW1iZXJbXSkge1xuICAgIHRoaXMuS2V5cyA9IHRoaXMuS2V5c0NsaWNrID0gS2V5cztcbiAgICB0aGlzLk14ID0gdGhpcy5NeSA9IHRoaXMuTXogPSB0aGlzLk1keCA9IHRoaXMuTWR5ID0gdGhpcy5NZHogPSAwO1xuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxuXG4gIHJlc3BvbnNlKE06IG51bWJlcltdLCBNb3VzZUNsaWNrOiBudW1iZXJbXSwgV2hlZWw6IG51bWJlciwgS2V5czogbnVtYmVyW10pIHtcbiAgICAvLyBpZiAoS2V5c1sxN10gIT0gMClcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHRoaXMuS2V5c0NsaWNrW2ldID0gS2V5c1tpXSAmJiAhdGhpcy5LZXlzW2ldID8gMSA6IDA7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjU2OyBpKyspIHtcbiAgICAgIHRoaXMuS2V5c1tpXSA9IEtleXNbaV07XG4gICAgfVxuXG4gICAgdGhpcy5NZHggPSBNWzBdO1xuICAgIHRoaXMuTWR5ID0gTVsxXTtcblxuICAgIC8vIHRoaXMuTXggPSBNWzBdO1xuICAgIC8vIHRoaXMuTXkgPSBNWzFdO1xuICAgIHRoaXMuTWR6ID0gV2hlZWw7XG4gICAgdGhpcy5NeiArPSBXaGVlbDtcblxuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxufSAvLyBFbmQgb2YgJ0lucHV0JyBmdW5jdGlvblxuXG5leHBvcnQgbGV0IG15SW5wdXQgPSBuZXcgSW5QdXQoWzAsIDBdLCBbXSk7XG4iLCJleHBvcnQgY2xhc3MgX3ZlYzMge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbiAgejogbnVtYmVyO1xuICBjb25zdHJ1Y3Rvcih4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB6MTogbnVtYmVyKSB7XG4gICAgdGhpcy54ID0geDE7XG4gICAgdGhpcy55ID0geTE7XG4gICAgdGhpcy56ID0gejE7XG4gIH1cblxuICBzdGF0aWMgc2V0KHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHoxOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKHgxLCB5MSwgejEpO1xuICB9XG5cbiAgc3RhdGljIGFkZChiOiBfdmVjMywgYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKGEueCArIGIueCwgYS55ICsgYi55LCBhLnogKyBiLnopO1xuICB9XG5cbiAgc3RhdGljIHN1YihhOiBfdmVjMywgYjogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKGEueCAtIGIueCwgYS55IC0gYi55LCBhLnogLSBiLnopO1xuICB9XG5cbiAgc3RhdGljIG11bG51bShhOiBfdmVjMywgYjogbnVtYmVyKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMyhhLnggKiBiLCBhLnkgKiBiLCBhLnogKiBiKTtcbiAgfVxuXG4gIHN0YXRpYyBkaXZudW0oYTogX3ZlYzMsIGI6IG51bWJlcikge1xuICAgIHJldHVybiBuZXcgX3ZlYzMoYS54IC8gYiwgYS55IC8gYiwgYS56IC8gYik7XG4gIH1cblxuICBzdGF0aWMgbmVnKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIG5ldyBfdmVjMygtYS54LCAtYS55LCAtYS56KTtcbiAgfVxuXG4gIHN0YXRpYyBkb3QoYTogX3ZlYzMsIGI6IF92ZWMzKSB7XG4gICAgcmV0dXJuIGEueCAqIGIueCArIGEueSAqIGIueSArIGEueiAqIGIuejtcbiAgfVxuXG4gIHN0YXRpYyBjcm9zcyhhOiBfdmVjMywgYjogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKFxuICAgICAgYS55ICogYi56IC0gYS56ICogYi55LFxuICAgICAgYS56ICogYi54IC0gYS54ICogYi56LFxuICAgICAgYS54ICogYi55IC0gYi54ICogYS55XG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBsZW4yKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIGEueCAqIGEueCArIGEueSAqIGEueSArIGEueiAqIGEuejtcbiAgfVxuXG4gIC8vICByZXR1cm4gVmVjM1NldChcbiAgLy8gICAgIFAuWCAqIE0uTVswXVswXSArIFAuWSAqIE0uTVsxXVswXSArIFAuWiAqIE0uTVsyXVswXSArIE0uTVszXVswXSxcbiAgLy8gICAgIFAuWCAqIE0uTVswXVsxXSArIFAuWSAqIE0uTVsxXVsxXSArIFAuWiAqIE0uTVsyXVsxXSArIE0uTVszXVsxXSxcbiAgLy8gICAgIFAuWCAqIE0uTVswXVsyXSArIFAuWSAqIE0uTVsxXVsyXSArIFAuWiAqIE0uTVsyXVsyXSArIE0uTVszXVsyXVxuXG4gIHN0YXRpYyBsZW4oYTogX3ZlYzMpOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLnNxcnQoX3ZlYzMubGVuMihhKSk7XG4gIH1cblxuICBzdGF0aWMgbm9ybWFsaXplKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIF92ZWMzLmRpdm51bShhLCBfdmVjMy5sZW4oYSkpO1xuICB9XG5cbiAgc3RhdGljIHZlYzMoYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gW2EueCwgYS55LCBhLnpdO1xuICB9XG59XG4iLCJpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGh2ZWMzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBEMlIoZGVncmVlOiBudW1iZXIpIHtcbiAgcmV0dXJuIChkZWdyZWUgKiBNYXRoLlBJKSAvIDE4MDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFIyRChyYWRpYW46IG51bWJlcikge1xuICByZXR1cm4gKHJhZGlhbiAvIE1hdGguUEkpICogMTgwO1xufVxuXG5leHBvcnQgY2xhc3MgX21hdHI0IHtcbiAgYTogbnVtYmVyW11bXTtcbiAgY29uc3RydWN0b3IoXG4gICAgYTAwOiBudW1iZXIsXG4gICAgYTAxOiBudW1iZXIsXG4gICAgYTAyOiBudW1iZXIsXG4gICAgYTAzOiBudW1iZXIsXG4gICAgYTEwOiBudW1iZXIsXG4gICAgYTExOiBudW1iZXIsXG4gICAgYTEyOiBudW1iZXIsXG4gICAgYTEzOiBudW1iZXIsXG4gICAgYTIwOiBudW1iZXIsXG4gICAgYTIxOiBudW1iZXIsXG4gICAgYTIyOiBudW1iZXIsXG4gICAgYTIzOiBudW1iZXIsXG4gICAgYTMwOiBudW1iZXIsXG4gICAgYTMxOiBudW1iZXIsXG4gICAgYTMyOiBudW1iZXIsXG4gICAgYTMzOiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5hID0gW1xuICAgICAgW2EwMCwgYTAxLCBhMDIsIGEwM10sXG4gICAgICBbYTEwLCBhMTEsIGExMiwgYTEzXSxcbiAgICAgIFthMjAsIGEyMSwgYTIyLCBhMjNdLFxuICAgICAgW2EzMCwgYTMxLCBhMzIsIGEzM11cbiAgICBdO1xuICB9XG5cbiAgc3RhdGljIGlkZW50aXR5KCkge1xuICAgIHJldHVybiBuZXcgX21hdHI0KDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpLmE7XG4gIH1cbiAgc3RhdGljIHNldChcbiAgICBhMDA6IG51bWJlcixcbiAgICBhMDE6IG51bWJlcixcbiAgICBhMDI6IG51bWJlcixcbiAgICBhMDM6IG51bWJlcixcbiAgICBhMTA6IG51bWJlcixcbiAgICBhMTE6IG51bWJlcixcbiAgICBhMTI6IG51bWJlcixcbiAgICBhMTM6IG51bWJlcixcbiAgICBhMjA6IG51bWJlcixcbiAgICBhMjE6IG51bWJlcixcbiAgICBhMjI6IG51bWJlcixcbiAgICBhMjM6IG51bWJlcixcbiAgICBhMzA6IG51bWJlcixcbiAgICBhMzE6IG51bWJlcixcbiAgICBhMzI6IG51bWJlcixcbiAgICBhMzM6IG51bWJlclxuICApIHtcbiAgICByZXR1cm4gbmV3IF9tYXRyNChcbiAgICAgIGEwMCxcbiAgICAgIGEwMSxcbiAgICAgIGEwMixcbiAgICAgIGEwMyxcbiAgICAgIGExMCxcbiAgICAgIGExMSxcbiAgICAgIGExMixcbiAgICAgIGExMyxcbiAgICAgIGEyMCxcbiAgICAgIGEyMSxcbiAgICAgIGEyMixcbiAgICAgIGEyMyxcbiAgICAgIGEzMCxcbiAgICAgIGEzMSxcbiAgICAgIGEzMixcbiAgICAgIGEzM1xuICAgICkuYTtcbiAgfVxuICBzdGF0aWMgdHJhbnNsYXRlKGE6IF92ZWMzKSB7XG4gICAgcmV0dXJuIG5ldyBfbWF0cjQoMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgYS54LCBhLnksIGEueiwgMSkuYTtcbiAgfVxuICBzdGF0aWMgc2NhbGUoYTogX3ZlYzMpIHtcbiAgICByZXR1cm4gbmV3IF9tYXRyNChhLngsIDAsIDAsIDAsIDAsIGEueSwgMCwgMCwgMCwgMCwgYS56LCAwLCAwLCAwLCAwLCAxKS5hO1xuICB9XG5cbiAgc3RhdGljIHJvdGF0ZVooZGVncmVlOiBudW1iZXIpIHtcbiAgICBjb25zdCByID0gRDJSKGRlZ3JlZSksXG4gICAgICBjbyA9IE1hdGguY29zKHIpLFxuICAgICAgc2kgPSBNYXRoLnNpbihyKTtcbiAgICBsZXQgbSA9IF9tYXRyNC5pZGVudGl0eSgpO1xuICAgIG1bMF1bMF0gPSBjbztcbiAgICBtWzFdWzBdID0gLXNpO1xuICAgIG1bMF1bMV0gPSBzaTtcbiAgICBtWzFdWzFdID0gY287XG5cbiAgICByZXR1cm4gbTtcbiAgfVxuICBzdGF0aWMgcm90YXRlWChkZWdyZWU6IG51bWJlcikge1xuICAgIGNvbnN0IHIgPSBEMlIoZGVncmVlKSxcbiAgICAgIGNvID0gTWF0aC5jb3MociksXG4gICAgICBzaSA9IE1hdGguc2luKHIpO1xuICAgIGxldCBtID0gX21hdHI0LmlkZW50aXR5KCk7XG5cbiAgICBtWzFdWzFdID0gY287XG4gICAgbVsyXVsxXSA9IC1zaTtcbiAgICBtWzFdWzJdID0gc2k7XG4gICAgbVsyXVsyXSA9IGNvO1xuXG4gICAgcmV0dXJuIG07XG4gIH1cblxuICBzdGF0aWMgcm90YXRlWShkZWdyZWU6IG51bWJlcikge1xuICAgIGNvbnN0IHIgPSBEMlIoZGVncmVlKSxcbiAgICAgIGNvID0gTWF0aC5jb3MociksXG4gICAgICBzaSA9IE1hdGguc2luKHIpO1xuICAgIGxldCBtID0gX21hdHI0LmlkZW50aXR5KCk7XG5cbiAgICBtWzBdWzBdID0gY287XG4gICAgbVsyXVswXSA9IHNpO1xuICAgIG1bMF1bMl0gPSAtc2k7XG4gICAgbVsyXVsyXSA9IGNvO1xuXG4gICAgcmV0dXJuIG07XG4gIH1cblxuICBzdGF0aWMgbXVsbWF0cihtMTogbnVtYmVyW11bXSwgbTI6IG51bWJlcltdW10pIHtcbiAgICBsZXQgciA9IF9tYXRyNC5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCksXG4gICAgICBrID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA0OyBqKyspIHtcbiAgICAgICAgZm9yIChyW2ldW2pdID0gMCwgayA9IDA7IGsgPCA0OyBrKyspIHtcbiAgICAgICAgICByW2ldW2pdICs9IG0xW2ldW2tdICogbTJba11bal07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICBzdGF0aWMgdHJhbnNwb3NlKG06IG51bWJlcltdW10pIHtcbiAgICBsZXQgciA9IF9tYXRyNC5zZXQoMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNDsgaisrKSB7XG4gICAgICAgIHJbaV1bal0gPSBtW2pdW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIHN0YXRpYyBkZXRlcm0zeDMoXG4gICAgYTExOiBudW1iZXIsXG4gICAgYTEyOiBudW1iZXIsXG4gICAgYTEzOiBudW1iZXIsXG4gICAgYTIxOiBudW1iZXIsXG4gICAgYTIyOiBudW1iZXIsXG4gICAgYTIzOiBudW1iZXIsXG4gICAgYTMxOiBudW1iZXIsXG4gICAgYTMyOiBudW1iZXIsXG4gICAgYTMzOiBudW1iZXJcbiAgKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGExMSAqIGEyMiAqIGEzMyAtXG4gICAgICBhMTEgKiBhMjMgKiBhMzIgLVxuICAgICAgYTEyICogYTIxICogYTMzICtcbiAgICAgIGExMiAqIGEyMyAqIGEzMSArXG4gICAgICBhMTMgKiBhMjEgKiBhMzIgLVxuICAgICAgYTEzICogYTIyICogYTMxXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBkZXRlcm0obTogbnVtYmVyW11bXSkge1xuICAgIHJldHVybiAoXG4gICAgICBtWzBdWzBdICpcbiAgICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgICBtWzFdWzFdLFxuICAgICAgICAgIG1bMV1bMl0sXG4gICAgICAgICAgbVsxXVszXSxcbiAgICAgICAgICBtWzJdWzFdLFxuICAgICAgICAgIG1bMl1bMl0sXG4gICAgICAgICAgbVsyXVszXSxcbiAgICAgICAgICBtWzNdWzFdLFxuICAgICAgICAgIG1bM11bMl0sXG4gICAgICAgICAgbVszXVszXVxuICAgICAgICApIC1cbiAgICAgIG1bMF1bMV0gKlxuICAgICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICAgIG1bMV1bMF0sXG4gICAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgICBtWzFdWzNdLFxuICAgICAgICAgIG1bMl1bMF0sXG4gICAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgICBtWzJdWzNdLFxuICAgICAgICAgIG1bM11bMF0sXG4gICAgICAgICAgbVszXVsyXSxcbiAgICAgICAgICBtWzNdWzNdXG4gICAgICAgICkgK1xuICAgICAgbVswXVsyXSAqXG4gICAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgICAgbVsxXVswXSxcbiAgICAgICAgICBtWzFdWzFdLFxuICAgICAgICAgIG1bMV1bM10sXG4gICAgICAgICAgbVsyXVswXSxcbiAgICAgICAgICBtWzJdWzFdLFxuICAgICAgICAgIG1bMl1bM10sXG4gICAgICAgICAgbVszXVswXSxcbiAgICAgICAgICBtWzNdWzFdLFxuICAgICAgICAgIG1bM11bM11cbiAgICAgICAgKSAtXG4gICAgICBtWzBdWzNdICpcbiAgICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgICBtWzFdWzBdLFxuICAgICAgICAgIG1bMV1bMV0sXG4gICAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgICBtWzJdWzBdLFxuICAgICAgICAgIG1bMl1bMV0sXG4gICAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgICBtWzNdWzBdLFxuICAgICAgICAgIG1bM11bMV0sXG4gICAgICAgICAgbVszXVsyXVxuICAgICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHN0YXRpYyBpbnZlcnNlKG06IG51bWJlcltdW10pIHtcbiAgICBjb25zdCBkZXQgPSBfbWF0cjQuZGV0ZXJtKG0pO1xuICAgIGxldCByID0gX21hdHI0LmlkZW50aXR5KCk7XG4gICAgaWYgKGRldCA9PT0gMCkgcmV0dXJuIHI7XG4gICAgclswXVswXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzJdWzNdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzJdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gZGV0O1xuXG4gICAgclsxXVswXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzJdWzNdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzJdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gLWRldDtcbiAgICByWzJdWzBdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bM10sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyBkZXQ7XG4gICAgclszXVswXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzFdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzJdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzJdWzJdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzJdXG4gICAgICApIC8gLWRldDtcblxuICAgIHJbMF1bMV0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVsyXVszXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVsyXSxcbiAgICAgICAgbVszXVszXVxuICAgICAgKSAvIC1kZXQ7XG5cbiAgICByWzFdWzFdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bMl1bM10sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMl0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyBkZXQ7XG5cbiAgICByWzJdWzFdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bM10sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyAtZGV0O1xuICAgIHJbM11bMV0gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVszXVswXSxcbiAgICAgICAgbVszXVsxXSxcbiAgICAgICAgbVszXVsyXVxuICAgICAgKSAvIGRldDtcbiAgICByWzBdWzJdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bMl0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyBkZXQ7XG4gICAgclsxXVsyXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzBdWzNdLFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzFdWzNdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzJdLFxuICAgICAgICBtWzNdWzNdXG4gICAgICApIC8gLWRldDtcbiAgICByWzJdWzJdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bM11bMF0sXG4gICAgICAgIG1bM11bMV0sXG4gICAgICAgIG1bM11bM11cbiAgICAgICkgLyBkZXQ7XG4gICAgclszXVsyXSA9XG4gICAgICBfbWF0cjQuZGV0ZXJtM3gzKFxuICAgICAgICBtWzBdWzBdLFxuICAgICAgICBtWzBdWzFdLFxuICAgICAgICBtWzBdWzJdLFxuICAgICAgICBtWzFdWzBdLFxuICAgICAgICBtWzJdWzFdLFxuICAgICAgICBtWzFdWzJdLFxuICAgICAgICBtWzNdWzBdLFxuICAgICAgICBtWzNdWzFdLFxuICAgICAgICBtWzNdWzJdXG4gICAgICApIC8gLWRldDtcbiAgICByWzBdWzNdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bMl0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bMl0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bMl0sXG4gICAgICAgIG1bMl1bM11cbiAgICAgICkgLyAtZGV0O1xuICAgIHJbMV1bM10gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVswXVszXSxcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsxXVszXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsyXSxcbiAgICAgICAgbVsyXVszXVxuICAgICAgKSAvIGRldDtcbiAgICByWzJdWzNdID1cbiAgICAgIF9tYXRyNC5kZXRlcm0zeDMoXG4gICAgICAgIG1bMF1bMF0sXG4gICAgICAgIG1bMF1bMV0sXG4gICAgICAgIG1bMF1bM10sXG4gICAgICAgIG1bMV1bMF0sXG4gICAgICAgIG1bMV1bMV0sXG4gICAgICAgIG1bMV1bM10sXG4gICAgICAgIG1bMl1bMF0sXG4gICAgICAgIG1bMl1bMV0sXG4gICAgICAgIG1bMl1bM11cbiAgICAgICkgLyAtZGV0O1xuICAgIHJbM11bM10gPVxuICAgICAgX21hdHI0LmRldGVybTN4MyhcbiAgICAgICAgbVswXVswXSxcbiAgICAgICAgbVswXVsxXSxcbiAgICAgICAgbVswXVsyXSxcbiAgICAgICAgbVsxXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsxXVsyXSxcbiAgICAgICAgbVsyXVswXSxcbiAgICAgICAgbVsyXVsxXSxcbiAgICAgICAgbVsyXVsyXVxuICAgICAgKSAvIGRldDtcbiAgICByZXR1cm4gcjtcbiAgfVxuICBzdGF0aWMgZnJ1c3R1bShcbiAgICBsOiBudW1iZXIsXG4gICAgcjogbnVtYmVyLFxuICAgIGI6IG51bWJlcixcbiAgICB0OiBudW1iZXIsXG4gICAgbjogbnVtYmVyLFxuICAgIGY6IG51bWJlclxuICApIHtcbiAgICBsZXQgbSA9IF9tYXRyNC5pZGVudGl0eSgpO1xuXG4gICAgbVswXVswXSA9ICgyICogbikgLyAociAtIGwpO1xuICAgIG1bMF1bMV0gPSAwO1xuICAgIG1bMF1bMl0gPSAwO1xuICAgIG1bMF1bM10gPSAwO1xuXG4gICAgbVsxXVswXSA9IDA7XG4gICAgbVsxXVsxXSA9ICgyICogbikgLyAodCAtIGIpO1xuICAgIG1bMV1bMl0gPSAwO1xuICAgIG1bMV1bM10gPSAwO1xuXG4gICAgbVsyXVswXSA9IChyICsgbCkgLyAociAtIGwpO1xuICAgIG1bMl1bMV0gPSAodCArIGIpIC8gKHQgLSBiKTtcbiAgICBtWzJdWzJdID0gKGYgKyBuKSAvIC0oZiAtIG4pO1xuICAgIG1bMl1bM10gPSAtMTtcblxuICAgIG1bM11bMF0gPSAwO1xuICAgIG1bM11bMV0gPSAwO1xuICAgIG1bM11bMl0gPSAoLTIgKiBuICogZikgLyAoZiAtIG4pO1xuICAgIG1bM11bM10gPSAwO1xuXG4gICAgcmV0dXJuIG07XG4gIH1cblxuICBzdGF0aWMgdG9hcnIobTogbnVtYmVyW11bXSkge1xuICAgIGxldCB2ID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgZm9yIChsZXQgZyA9IDA7IGcgPCA0OyBnKyspIHtcbiAgICAgICAgdi5wdXNoKG1baV1bZ10pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB2O1xuICB9XG5cbiAgc3RhdGljIHBvaW50X3RyYW5zZm9ybShhOiBfdmVjMywgYjogbnVtYmVyW11bXSkge1xuICAgIHJldHVybiBuZXcgX3ZlYzMoXG4gICAgICBhLnggKiBiWzBdWzBdICsgYS55ICogYlsxXVswXSArIGEueiAqIGJbMl1bMF0gKyBiWzNdWzBdLFxuICAgICAgYS54ICogYlswXVsxXSArIGEueSAqIGJbMV1bMV0gKyBhLnogKiBiWzJdWzFdICsgYlszXVsxXSxcbiAgICAgIGEueCAqIGJbMF1bMl0gKyBhLnkgKiBiWzFdWzJdICsgYS56ICogYlsyXVsyXSArIGJbM11bMl1cbiAgICApO1xuICB9XG5cbiAgc3RhdGljIHZlY3RvcnRfcmFuc2Zvcm0oYTogX3ZlYzMsIGI6IG51bWJlcltdW10pIHtcbiAgICByZXR1cm4gbmV3IF92ZWMzKFxuICAgICAgYS54ICogYlswXVswXSArIGEueSAqIGJbMV1bMF0gKyBhLnogKiBiWzJdWzBdLFxuICAgICAgYS54ICogYlswXVsxXSArIGEueSAqIGJbMV1bMV0gKyBhLnogKiBiWzJdWzFdLFxuICAgICAgYS54ICogYlswXVsyXSArIGEueSAqIGJbMV1bMl0gKyBhLnogKiBiWzJdWzJdXG4gICAgKTtcbiAgfVxuICBzdGF0aWMgbXVsX21hdHIoYTogX3ZlYzMsIGI6IG51bWJlcltdW10pIHtcbiAgICBjb25zdCB3ID0gYS54ICogYlswXVszXSArIGEueSAqIGJbMV1bM10gKyBhLnogKiBiWzJdWzNdICsgYlszXVszXTtcbiAgICByZXR1cm4gbmV3IF92ZWMzKFxuICAgICAgKGEueCAqIGJbMF1bMF0gKyBhLnkgKiBiWzFdWzBdICsgYS56ICogYlsyXVswXSArIGJbM11bMF0pIC8gdyxcbiAgICAgIChhLnkgKiBiWzBdWzFdICsgYS55ICogYlsxXVsxXSArIGEueiAqIGJbMl1bMV0gKyBiWzNdWzFdKSAvIHcsXG4gICAgICAoYS56ICogYlswXVsyXSArIGEueSAqIGJbMV1bMl0gKyBhLnogKiBiWzJdWzJdICsgYlszXVsyXSkgLyB3XG4gICAgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgX3ZlYzMgfSBmcm9tIFwiLi9tYXRoL21hdGh2ZWMzXCI7XG5pbXBvcnQgeyBfbWF0cjQgfSBmcm9tIFwiLi9tYXRoL21hdGhtYXQ0XCI7XG5cblxuZXhwb3J0IGNsYXNzIHN1cmZhY2Uge1xuICBOYW1lOiBzdHJpbmcgPSBcIkRlZmF1bHRcIjtcbiAgS2E6IF92ZWMzID0gX3ZlYzMuc2V0KDAuMSwgMC4xLCAwLjEpO1xuICBLZDogX3ZlYzMgPSBfdmVjMy5zZXQoMC45LCAwLjksIDAuOSk7XG4gIEtzOiBfdmVjMyA9IF92ZWMzLnNldCgwLjMsIDAuMywgMC4zKTtcbiAgUGg6IG51bWJlciA9IDMwO1xuICBLcjogX3ZlYzMgPSBfdmVjMy5zZXQoMCwgMCwgMCk7XG4gIEt0OiBfdmVjMyA9IF92ZWMzLnNldCgwLCAwLCAwKTtcbiAgUmVmcmFjdGlvbkNvZWY6IG51bWJlciA9IDA7XG4gIERlY2F5OiBudW1iZXIgPSAwO1xuICBHZXRBcnJheSgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkthKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS2QpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5LcyksXG4gICAgICB0aGlzLlBoLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLktyKSxcbiAgICAgIHRoaXMuUmVmcmFjdGlvbkNvZWYsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuS3QpLFxuICAgICAgdGhpcy5EZWNheVxuICAgIF07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIHNoYXBlIHtcbiAgT2JqOiBudW1iZXJbXVtdID0gX21hdHI0LmlkZW50aXR5KCk7IFxuICBNYXRyaXg6IG51bWJlcltdW10gPSBfbWF0cjQuaWRlbnRpdHkoKTtcbiAgVHlwZVNoYXBlOiBudW1iZXIgPSAwO1xuICBNYXRlcmlhbDogbnVtYmVyID0gMDsgXG4gIEdldEFycmF5KCkge1xuICAgIHJldHVybiBbLi4uX21hdHI0LnRvYXJyKHRoaXMuT2JqKSwgLi4uX21hdHI0LnRvYXJyKHRoaXMuTWF0cml4KSwgdGhpcy5UeXBlU2hhcGUsIHRoaXMuTWF0ZXJpYWwsIDAsIDBdO1xuICB9XG59XG5cbmV4cG9ydCBsZXQgU2hhcGVzOiBzaGFwZVtdID0gW107XG5leHBvcnQgbGV0IFN1cmZhY2VzOiBzdXJmYWNlW10gPSBbXTtcblxuXG5leHBvcnQgZnVuY3Rpb24gR2V0QXJyYXlPYmplY3RzKCkge1xuICBsZXQgUmVzdWx0ID0gW1NoYXBlcy5sZW5ndGgsIDAsIDAsIDBdO1xuICBmb3IgKGxldCBlbGVtZW50IG9mIFNoYXBlcykge1xuICAgIFJlc3VsdCA9IFJlc3VsdC5jb25jYXQoZWxlbWVudC5HZXRBcnJheSgpKTtcbiAgfVxuICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShSZXN1bHQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gR2V0QXJyYXlTdXJmYWNlcygpIHtcbiAgbGV0IFJlc3VsdCA9IFtTdXJmYWNlcy5sZW5ndGgsIDAsIDAsIDBdO1xuICBmb3IgKGxldCBlbGVtZW50IG9mIFN1cmZhY2VzKSB7XG4gICAgUmVzdWx0ID0gUmVzdWx0LmNvbmNhdChlbGVtZW50LkdldEFycmF5KCkpO1xuICB9XG4gIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFJlc3VsdCk7XG59XG4iLCJpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuLi9tYXRoL21hdGh2ZWMzXCI7XG5pbXBvcnQgeyBTaGFwZXMsIFN1cmZhY2VzLCBzaGFwZSwgc3VyZmFjZSB9IGZyb20gXCIuLi9vYmplY3RzXCI7XG5cbmltcG9ydCB7IFVib19zZXQxX2RhdGEgfSBmcm9tIFwiLi4vbWFpblwiO1xuaW1wb3J0IHsgX21hdHI0IH0gZnJvbSBcIi4uL21hdGgvbWF0aG1hdDRcIjtcblxuZnVuY3Rpb24gUmVhZFZlYzNmcm9tU3RyaW5nKFN0cjogc3RyaW5nKSB7XG4gIGxldCBoOiBudW1iZXJbXTtcbiAgaWYgKFN0clswXSAhPSBcIntcIiB8fCBTdHJbU3RyLmxlbmd0aCAtIDFdICE9IFwifVwiKSByZXR1cm4gbnVsbDtcbiAgaCA9IFN0ci5zbGljZSgxLCBTdHIubGVuZ3RoIC0gMSlcbiAgICAuc3BsaXQoXCIsXCIpXG4gICAgLm1hcChOdW1iZXIpO1xuXG4gIGlmIChoLmxlbmd0aCA8IDMpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBfdmVjMy5zZXQoaFswXSwgaFsxXSwgaFsyXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZXIoVHh0OiBzdHJpbmcpIHtcbiAgU2hhcGVzLmxlbmd0aCA9IDA7XG4gIFN1cmZhY2VzLmxlbmd0aCA9IDE7XG4gIGxldCBOYW1lOiBzdHJpbmc7XG4gIGxldCBhcnJheU9mU3RyaW5ncyA9IFR4dC5zcGxpdChcIlxcblwiKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheU9mU3RyaW5ncy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhcnJheU9mU3RyaW5nc1tpXVswXSA9PSBcIi9cIiAmJiBhcnJheU9mU3RyaW5nc1tpXVsxXSA9PSBcIi9cIikgY29udGludWU7XG4gICAgbGV0IHdvcmRzID0gYXJyYXlPZlN0cmluZ3NbaV0uc3BsaXQoXCIgXCIpO1xuICAgIGlmICh3b3Jkcy5sZW5ndGggPT0gMSkgY29udGludWU7XG4gICAgbGV0IFR5cGUgPSB3b3Jkc1swXTtcbiAgICBpZiAoVHlwZSA9PSBcInNjZW5lXCIpIHtcbiAgICAgIGlmICh3b3Jkcy5sZW5ndGggIT0gNikgY29udGludWU7XG4gICAgICBsZXQgeDogX3ZlYzMgfCBudWxsO1xuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1sxXSk7XG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIFVib19zZXQxX2RhdGEuQW1iaWVudENvbG9yID0geDtcblxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1syXSk7XG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIFVib19zZXQxX2RhdGEuQmFja2dyb3VuZENvbG9yID0geDtcblxuICAgICAgVWJvX3NldDFfZGF0YS5SZWZyYWN0aW9uQ29lZiA9IE51bWJlcih3b3Jkc1szXSk7XG4gICAgICBVYm9fc2V0MV9kYXRhLkRlY2F5ID0gTnVtYmVyKHdvcmRzWzRdKTtcbiAgICAgIFVib19zZXQxX2RhdGEuTWF4UmVjTGV2ZWwgPSBOdW1iZXIod29yZHNbNV0pO1xuICAgIH0gZWxzZSBpZiAoVHlwZSA9PSBcInN1cmZhY2VcIikge1xuICAgICAgaWYgKHdvcmRzLmxlbmd0aCAhPSAxMCkgY29udGludWU7XG4gICAgICBsZXQgeDogX3ZlYzMgfCBudWxsO1xuICAgICAgbGV0IFN1cmYgPSBuZXcgc3VyZmFjZSgpO1xuICAgICAgU3VyZi5OYW1lID0gd29yZHNbMV07XG5cbiAgICAgIGxldCBmbGFnID0gZmFsc2U7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIFN1cmZhY2VzKSB7XG4gICAgICAgIGlmIChlbGVtZW50Lk5hbWUgPT0gU3VyZi5OYW1lKSB7XG4gICAgICAgICAgZmxhZyA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmbGFnKSBjb250aW51ZTtcblxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1syXSk7XG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIFN1cmYuS2EgPSB4O1xuXG4gICAgICB4ID0gUmVhZFZlYzNmcm9tU3RyaW5nKHdvcmRzWzNdKTtcbiAgICAgIGlmICh4ID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgU3VyZi5LZCA9IHg7XG5cbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbNF0pO1xuICAgICAgaWYgKHggPT0gbnVsbCkgY29udGludWU7XG4gICAgICBTdXJmLktzID0geDtcblxuICAgICAgU3VyZi5QaCA9IE51bWJlcih3b3Jkc1s1XSk7XG5cbiAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbNl0pO1xuICAgICAgaWYgKHggPT0gbnVsbCkgY29udGludWU7XG4gICAgICBTdXJmLktyID0geDtcblxuICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1s3XSk7XG4gICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIFN1cmYuS3QgPSB4O1xuXG4gICAgICBTdXJmLlJlZnJhY3Rpb25Db2VmID0gTnVtYmVyKHdvcmRzWzhdKTtcbiAgICAgIFN1cmYuRGVjYXkgPSBOdW1iZXIod29yZHNbOV0pO1xuXG4gICAgICBTdXJmYWNlcy5wdXNoKFN1cmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgaWQgPSAtMTtcbiAgICAgIGxldCB4OiBfdmVjMyB8IG51bGw7XG4gICAgICBsZXQgU3BoID0gbmV3IHNoYXBlKCk7XG5cbiAgICAgIGlmIChUeXBlID09IFwic3BoZXJlXCIpIHtcbiAgICAgICAgaWYgKHdvcmRzLmxlbmd0aCAhPSA2KSBjb250aW51ZTtcbiAgICAgICAgU3BoLk9ialswXVswXSA9IE51bWJlcih3b3Jkc1sxXSk7XG4gICAgICAgIFNwaC5UeXBlU2hhcGUgPSAwO1xuICAgICAgICBpZCA9IDI7XG4gICAgICB9XG4gICAgICBpZiAoVHlwZSA9PSBcImJveFwiKSB7XG4gICAgICAgIGlmICh3b3Jkcy5sZW5ndGggIT0gNikgY29udGludWU7XG4gICAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbMV0pO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcblxuICAgICAgICBTcGguT2JqWzBdWzBdID0geC54O1xuICAgICAgICBTcGguT2JqWzBdWzFdID0geC55O1xuICAgICAgICBTcGguT2JqWzBdWzJdID0geC56O1xuXG4gICAgICAgIFNwaC5UeXBlU2hhcGUgPSAxO1xuICAgICAgICBpZCA9IDI7XG4gICAgICB9XG4gICAgICBpZiAoVHlwZSA9PSBcInJvdW5kX2JveFwiKSB7XG4gICAgICAgIGlmICh3b3Jkcy5sZW5ndGggIT0gNykgY29udGludWU7XG4gICAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbMV0pO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcblxuICAgICAgICBTcGguT2JqWzBdWzBdID0geC54O1xuICAgICAgICBTcGguT2JqWzBdWzFdID0geC55O1xuICAgICAgICBTcGguT2JqWzBdWzJdID0geC56O1xuICAgICAgICBTcGguT2JqWzBdWzNdID0gTnVtYmVyKHdvcmRzWzJdKTtcblxuICAgICAgICBTcGguVHlwZVNoYXBlID0gMjtcbiAgICAgICAgaWQgPSAzO1xuICAgICAgfVxuICAgICAgaWYgKFR5cGUgPT0gXCJ0b3J1c1wiKSB7XG4gICAgICAgIGlmICh3b3Jkcy5sZW5ndGggIT0gNykgY29udGludWU7XG4gICAgICAgIFNwaC5PYmpbMF1bMF0gPSBOdW1iZXIod29yZHNbMV0pO1xuICAgICAgICBTcGguT2JqWzBdWzFdID0gTnVtYmVyKHdvcmRzWzJdKTtcblxuICAgICAgICBTcGguVHlwZVNoYXBlID0gMztcbiAgICAgICAgaWQgPSAzO1xuICAgICAgfVxuICAgICAgaWYgKFR5cGUgPT0gXCJjeWxpbmRlclwiKSB7XG4gICAgICAgIGlmICh3b3Jkcy5sZW5ndGggIT0gNikgY29udGludWU7XG4gICAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbMV0pO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcblxuICAgICAgICBTcGguT2JqWzBdWzBdID0geC54O1xuICAgICAgICBTcGguT2JqWzBdWzFdID0geC55O1xuICAgICAgICBTcGguT2JqWzBdWzJdID0geC56O1xuXG4gICAgICAgIFNwaC5UeXBlU2hhcGUgPSA0O1xuICAgICAgICBpZCA9IDI7XG4gICAgICB9XG4gICAgICBpZiAoaWQgIT0gLTEpIHtcbiAgICAgICAgbGV0IFNjYWxlOiBudW1iZXJbXVtdO1xuICAgICAgICBsZXQgUm90OiBudW1iZXJbXVtdO1xuICAgICAgICBsZXQgVHJhbnM6IG51bWJlcltdW107XG5cbiAgICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1tpZF0pO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgICAgVHJhbnMgPSBfbWF0cjQudHJhbnNsYXRlKHgpO1xuXG4gICAgICAgIHggPSBSZWFkVmVjM2Zyb21TdHJpbmcod29yZHNbaWQgKyAxXSk7XG4gICAgICAgIGlmICh4ID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgICBSb3QgPSBfbWF0cjQubXVsbWF0cihcbiAgICAgICAgICBfbWF0cjQubXVsbWF0cihfbWF0cjQucm90YXRlWSh4LngpLCBfbWF0cjQucm90YXRlWSh4LnkpKSxcbiAgICAgICAgICBfbWF0cjQucm90YXRlWih4LnopXG4gICAgICAgICk7XG5cbiAgICAgICAgeCA9IFJlYWRWZWMzZnJvbVN0cmluZyh3b3Jkc1tpZCArIDJdKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgY29udGludWU7XG4gICAgICAgIFNjYWxlID0gX21hdHI0LnNjYWxlKHgpO1xuXG4gICAgICAgIFNwaC5NYXRyaXggPSBfbWF0cjQuaW52ZXJzZShcbiAgICAgICAgICBfbWF0cjQubXVsbWF0cihfbWF0cjQubXVsbWF0cihTY2FsZSwgUm90KSwgVHJhbnMpXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBTdXJmYWNlcykge1xuICAgICAgICAgIGlmICh3b3Jkc1tpZCArIDNdID09IGVsZW1lbnQuTmFtZSkge1xuICAgICAgICAgICAgU3BoLk1hdGVyaWFsID0gaW5kZXg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgU2hhcGVzLnB1c2goU3BoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IF9tYXRyNCB9IGZyb20gXCIuLi9tYXRoL21hdGhtYXQ0LmpzXCI7XG5pbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuLi9tYXRoL21hdGh2ZWMzLmpzXCI7XG5cbmV4cG9ydCBjbGFzcyBVYm9fTWF0ciB7XG4gIENhbUxvYzogX3ZlYzM7XG4gIENhbUF0OiBfdmVjMztcbiAgQ2FtUmlnaHQ6IF92ZWMzO1xuICBDYW1VcDogX3ZlYzM7XG4gIENhbURpcjogX3ZlYzM7XG4gIFByb2pEaXN0RmFyVGltZUxvY2FsOiBfdmVjMztcbiAgVGltZUdsb2JhbERlbHRhR2xvYmFsRGVsdGFMb2NhbDogX3ZlYzM7XG4gIGZsYWdzMTJGcmFtZVc6IF92ZWMzO1xuICBmbGFnczQ1RnJhbWVIOiBfdmVjMztcbiAgQW1iaWVudENvbG9yOiBfdmVjMztcbiAgQmFja2dyb3VuZENvbG9yOiBfdmVjMztcbiAgUmVmcmFjdGlvbkNvZWY6IG51bWJlcjtcbiAgRGVjYXk6IG51bWJlcjtcbiAgTWF4UmVjTGV2ZWw6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoXG4gICAgQ2FtTG9jOiBfdmVjMyxcbiAgICBDYW1BdDogX3ZlYzMsXG4gICAgQ2FtUmlnaHQ6IF92ZWMzLFxuICAgIENhbVVwOiBfdmVjMyxcbiAgICBDYW1EaXI6IF92ZWMzLFxuICAgIFByb2pEaXN0RmFyVGltZUxvY2FsOiBfdmVjMyxcbiAgICBUaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsOiBfdmVjMyxcbiAgICBmbGFnczEyRnJhbWVXOiBfdmVjMyxcbiAgICBmbGFnczQ1RnJhbWVIOiBfdmVjMyxcbiAgICBBbWJpZW50Q29sb3I6IF92ZWMzLFxuICAgIEJhY2tncm91bmRDb2xvcjogX3ZlYzMsXG4gICAgUmVmcmFjdGlvbkNvZWY6IG51bWJlcixcbiAgICBEZWNheTogbnVtYmVyLFxuICAgIE1heFJlY0xldmVsOiBudW1iZXJcbiAgKSB7XG4gICAgdGhpcy5DYW1Mb2MgPSBDYW1Mb2M7XG4gICAgdGhpcy5DYW1BdCA9IENhbUF0O1xuICAgIHRoaXMuQ2FtUmlnaHQgPSBDYW1SaWdodDtcbiAgICB0aGlzLkNhbVVwID0gQ2FtVXA7XG4gICAgdGhpcy5DYW1EaXIgPSBDYW1EaXI7XG4gICAgdGhpcy5Qcm9qRGlzdEZhclRpbWVMb2NhbCA9IFByb2pEaXN0RmFyVGltZUxvY2FsO1xuXG4gICAgdGhpcy5UaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsID0gVGltZUdsb2JhbERlbHRhR2xvYmFsRGVsdGFMb2NhbDtcbiAgICB0aGlzLmZsYWdzMTJGcmFtZVcgPSBmbGFnczEyRnJhbWVXO1xuICAgIHRoaXMuZmxhZ3M0NUZyYW1lSCA9IGZsYWdzNDVGcmFtZUg7XG4gICAgdGhpcy5BbWJpZW50Q29sb3IgPSBBbWJpZW50Q29sb3I7XG4gICAgdGhpcy5CYWNrZ3JvdW5kQ29sb3IgPSBCYWNrZ3JvdW5kQ29sb3I7XG4gICAgdGhpcy5SZWZyYWN0aW9uQ29lZiA9IFJlZnJhY3Rpb25Db2VmO1xuICAgIHRoaXMuRGVjYXkgPSBEZWNheTtcbiAgICB0aGlzLk1heFJlY0xldmVsID0gTWF4UmVjTGV2ZWw7XG4gIH1cbiAgR2V0QXJyYXkoKSB7XG4gICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkNhbUxvYyksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkNhbUF0KSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQ2FtUmlnaHQpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5DYW1VcCksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLkNhbURpciksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLlByb2pEaXN0RmFyVGltZUxvY2FsKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuVGltZUdsb2JhbERlbHRhR2xvYmFsRGVsdGFMb2NhbCksXG4gICAgICAxLFxuICAgICAgLi4uX3ZlYzMudmVjMyh0aGlzLmZsYWdzMTJGcmFtZVcpLFxuICAgICAgMSxcbiAgICAgIC4uLl92ZWMzLnZlYzModGhpcy5mbGFnczQ1RnJhbWVIKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQW1iaWVudENvbG9yKSxcbiAgICAgIDEsXG4gICAgICAuLi5fdmVjMy52ZWMzKHRoaXMuQmFja2dyb3VuZENvbG9yKSxcbiAgICAgIDEsXG4gICAgICB0aGlzLlJlZnJhY3Rpb25Db2VmLFxuICAgICAgdGhpcy5EZWNheSxcbiAgICAgIHRoaXMuTWF4UmVjTGV2ZWwsXG4gICAgICAxXG4gICAgXSk7XG4gIH1cbn1cblxuLy8gcmF5PFR5cGU+IEZyYW1lKCBUeXBlIFhzLCBUeXBlIFlzLCBUeXBlIGR4LCBUeXBlIGR5ICkgY29uc3Rcbi8vIHtcbi8vICAgdmVjMzxUeXBlPiBBID0gRGlyICogUHJvakRpc3Q7XG4vLyAgIHZlYzM8VHlwZT4gQiA9IFJpZ2h0ICogKChYcyArIDAuNSAtIEZyYW1lVyAvIDIuMCkgLyBGcmFtZVcgKiBXcCk7XG4vLyAgIHZlYzM8VHlwZT4gQyA9IFVwICogKCgtKFlzICsgMC41KSArIEZyYW1lSCAvIDIuMCkgLyBGcmFtZUggKiBIcCk7XG4vLyAgIHZlYzM8VHlwZT4gWCA9IHZlYzM8VHlwZT4oQSArIEIgKyBDKTtcbi8vICAgcmV0dXJuICByYXk8VHlwZT4oWCArIExvYywgWC5Ob3JtYWxpemluZygpKTtcbi8vIH0gLyogRW5kIG9mICdSZXNpemUnIGZ1bmN0aW9uICovXG5cbmV4cG9ydCBjbGFzcyBVQk8ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVib2lkOiBXZWJHTEJ1ZmZlciB8IG51bGw7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgdWJvaWQ6IFdlYkdMQnVmZmVyIHwgbnVsbCkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy51Ym9pZCA9IHVib2lkO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZShTaXplOiBudW1iZXIsIG5hbWU6IHN0cmluZywgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICBsZXQgZnIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLlVOSUZPUk1fQlVGRkVSLCBmcik7XG5cbiAgICBnbC5idWZmZXJEYXRhKGdsLlVOSUZPUk1fQlVGRkVSLCBTaXplICogNCwgZ2wuU1RBVElDX0RSQVcpO1xuICAgIHJldHVybiBuZXcgVUJPKG5hbWUsIGZyKTtcbiAgfVxuXG4gIHVwZGF0ZShVYm9BcnJheTogRmxvYXQzMkFycmF5LCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuVU5JRk9STV9CVUZGRVIsIHRoaXMudWJvaWQpO1xuICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuVU5JRk9STV9CVUZGRVIsIDAsIFVib0FycmF5KTtcbiAgfVxuXG4gIGFwcGx5KHBvaW50OiBudW1iZXIsIFNoZE5vOiBXZWJHTFByb2dyYW0sIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgbGV0IGJsa19sb2MgPSBnbC5nZXRVbmlmb3JtQmxvY2tJbmRleChTaGRObywgdGhpcy5uYW1lKTtcblxuICAgIGdsLnVuaWZvcm1CbG9ja0JpbmRpbmcoU2hkTm8sIGJsa19sb2MsIHBvaW50KTtcbiAgICBnbC5iaW5kQnVmZmVyQmFzZShnbC5VTklGT1JNX0JVRkZFUiwgcG9pbnQsIHRoaXMudWJvaWQpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGh2ZWMzLmpzXCI7XG5pbXBvcnQgeyBfbWF0cjQgfSBmcm9tIFwiLi9tYXRobWF0NC5qc1wiO1xuXG5sZXQgUHJvalNpemUgPSAwLjEgLyogUHJvamVjdCBwbGFuZSBmaXQgc3F1YXJlICovLFxuICBQcm9qRGlzdCA9IDAuMSAvKiBEaXN0YW5jZSB0byBwcm9qZWN0IHBsYW5lIGZyb20gdmlld2VyIChuZWFyKSAqLyxcbiAgUHJvakZhckNsaXAgPSAzMDAwOyAvKiBEaXN0YW5jZSB0byBwcm9qZWN0IGZhciBjbGlwIHBsYW5lIChmYXIpICovXG5cbmNsYXNzIF9jYW1lcmEge1xuICBQcm9qU2l6ZTogbnVtYmVyO1xuICBQcm9qRGlzdDogbnVtYmVyO1xuICBQcm9qRmFyQ2xpcDogbnVtYmVyO1xuICBGcmFtZVc6IG51bWJlcjtcbiAgRnJhbWVIOiBudW1iZXI7XG4gIE1hdHJWUDogbnVtYmVyW11bXTtcbiAgTWF0clZpZXc6IG51bWJlcltdW107XG4gIE1hdHJQcm9qOiBudW1iZXJbXVtdO1xuICBMb2M6IF92ZWMzO1xuICBBdDogX3ZlYzM7XG4gIERpcjogX3ZlYzM7XG4gIFVwOiBfdmVjMztcbiAgUmlnaHQ6IF92ZWMzO1xuICBjb25zdHJ1Y3RvcihcbiAgICBQcm9qU2l6ZTogbnVtYmVyLFxuICAgIFByb2pEaXN0OiBudW1iZXIsXG4gICAgUHJvakZhckNsaXA6IG51bWJlcixcbiAgICBNYXRyVlA6IG51bWJlcltdW10sXG4gICAgTWF0clZpZXc6IG51bWJlcltdW10sXG4gICAgTWF0clByb2o6IG51bWJlcltdW10sXG4gICAgTG9jOiBfdmVjMyxcbiAgICBBdDogX3ZlYzMsXG4gICAgRGlyOiBfdmVjMyxcbiAgICBVcDogX3ZlYzMsXG4gICAgUmlnaHQ6IF92ZWMzLFxuICAgIEZyYW1lVzogbnVtYmVyLFxuICAgIEZyYW1lSDogbnVtYmVyXG4gICkge1xuICAgIHRoaXMuUHJvalNpemUgPSBQcm9qU2l6ZTtcbiAgICB0aGlzLlByb2pEaXN0ID0gUHJvakRpc3Q7XG4gICAgdGhpcy5Qcm9qRmFyQ2xpcCA9IFByb2pGYXJDbGlwO1xuICAgIHRoaXMuTWF0clZQID0gTWF0clZQO1xuICAgIHRoaXMuTWF0clZpZXcgPSBNYXRyVmlldztcbiAgICB0aGlzLk1hdHJQcm9qID0gTWF0clByb2o7XG4gICAgdGhpcy5Mb2MgPSBMb2M7XG4gICAgdGhpcy5BdCA9IEF0O1xuICAgIHRoaXMuRGlyID0gRGlyO1xuICAgIHRoaXMuVXAgPSBVcDtcbiAgICB0aGlzLlJpZ2h0ID0gUmlnaHQ7XG4gICAgdGhpcy5GcmFtZVcgPSBGcmFtZVc7XG4gICAgdGhpcy5GcmFtZUggPSBGcmFtZUg7XG4gIH1cblxuICBQcm9qU2V0KCkge1xuICAgIGxldCByeCwgcnk6IG51bWJlcjtcblxuICAgIHJ4ID0gcnkgPSBQcm9qU2l6ZTtcblxuICAgIGlmICh0aGlzLkZyYW1lVyA+IHRoaXMuRnJhbWVIKSByeCAqPSB0aGlzLkZyYW1lVyAvIHRoaXMuRnJhbWVIO1xuICAgIGVsc2UgcnkgKj0gdGhpcy5GcmFtZUggLyB0aGlzLkZyYW1lVztcblxuICAgIGxldCBXcCA9IHJ4LFxuICAgICAgSHAgPSByeTtcblxuICAgIHRoaXMuTWF0clByb2ogPSBfbWF0cjQuZnJ1c3R1bShcbiAgICAgIC1yeCAvIDIsXG4gICAgICByeCAvIDIsXG4gICAgICAtcnkgLyAyLFxuICAgICAgcnkgLyAyLFxuICAgICAgUHJvakRpc3QsXG4gICAgICBQcm9qRmFyQ2xpcFxuICAgICk7XG4gICAgdGhpcy5NYXRyVlAgPSBfbWF0cjQubXVsbWF0cih0aGlzLk1hdHJWaWV3LCB0aGlzLk1hdHJQcm9qKTtcbiAgfVxuXG4gIHN0YXRpYyB2aWV3KExvYzogX3ZlYzMsIEF0OiBfdmVjMywgVXAxOiBfdmVjMykge1xuICAgIGNvbnN0IERpciA9IF92ZWMzLm5vcm1hbGl6ZShfdmVjMy5zdWIoQXQsIExvYykpLFxuICAgICAgUmlnaHQgPSBfdmVjMy5ub3JtYWxpemUoX3ZlYzMuY3Jvc3MoRGlyLCBVcDEpKSxcbiAgICAgIFVwID0gX3ZlYzMuY3Jvc3MoUmlnaHQsIERpcik7XG4gICAgcmV0dXJuIF9tYXRyNC5zZXQoXG4gICAgICBSaWdodC54LFxuICAgICAgVXAueCxcbiAgICAgIC1EaXIueCxcbiAgICAgIDAsXG4gICAgICBSaWdodC55LFxuICAgICAgVXAueSxcblxuICAgICAgLURpci55LFxuICAgICAgMCxcbiAgICAgIFJpZ2h0LnosXG4gICAgICBVcC56LFxuICAgICAgLURpci56LFxuICAgICAgMCxcbiAgICAgIC1fdmVjMy5kb3QoTG9jLCBSaWdodCksXG4gICAgICAtX3ZlYzMuZG90KExvYywgVXApLFxuICAgICAgX3ZlYzMuZG90KExvYywgRGlyKSxcbiAgICAgIDFcbiAgICApO1xuICB9XG59XG5leHBvcnQgbGV0IGNhbTogX2NhbWVyYTtcblxuZXhwb3J0IGZ1bmN0aW9uIENhbVNldChMb2M6IF92ZWMzLCBBdDogX3ZlYzMsIFVwMTogX3ZlYzMpIHtcbiAgbGV0IFVwLCBEaXIsIFJpZ2h0O1xuICBsZXQgTWF0clZpZXcgPSBfY2FtZXJhLnZpZXcoTG9jLCBBdCwgVXAxKTtcblxuICBVcCA9IF92ZWMzLnNldChNYXRyVmlld1swXVsxXSwgTWF0clZpZXdbMV1bMV0sIE1hdHJWaWV3WzJdWzFdKTtcbiAgRGlyID0gX3ZlYzMuc2V0KC1NYXRyVmlld1swXVsyXSwgLU1hdHJWaWV3WzFdWzJdLCAtTWF0clZpZXdbMl1bMl0pO1xuICBSaWdodCA9IF92ZWMzLnNldChNYXRyVmlld1swXVswXSwgTWF0clZpZXdbMV1bMF0sIE1hdHJWaWV3WzJdWzBdKTtcblxuICBjb25zdCByeCA9IFByb2pTaXplLFxuICAgIHJ5ID0gUHJvalNpemU7XG5cbiAgbGV0IE1hdHJQcm9qID0gX21hdHI0LmZydXN0dW0oXG4gICAgICAtcnggLyAyLFxuICAgICAgcnggLyAyLFxuICAgICAgLXJ5IC8gMixcbiAgICAgIHJ5IC8gMixcblxuICAgICAgUHJvakRpc3QsXG4gICAgICBQcm9qRmFyQ2xpcFxuICAgICksXG4gICAgTWF0clZQID0gX21hdHI0Lm11bG1hdHIoTWF0clZpZXcsIE1hdHJQcm9qKTtcblxuICBjYW0gPSBuZXcgX2NhbWVyYShcbiAgICBQcm9qU2l6ZSxcbiAgICBQcm9qRGlzdCxcbiAgICBQcm9qRmFyQ2xpcCxcbiAgICBNYXRyVlAsXG4gICAgTWF0clZpZXcsXG4gICAgTWF0clByb2osXG4gICAgTG9jLFxuICAgIEF0LFxuICAgIERpcixcbiAgICBVcCxcbiAgICBSaWdodCxcbiAgICA1MDAsXG4gICAgNTAwXG4gICk7XG59XG4iLCJpbXBvcnQgeyBteVRpbWVyIH0gZnJvbSBcIi4vcmVzL3RpbWVyXCI7XG5pbXBvcnQgeyBteUlucHV0IH0gZnJvbSBcIi4vcmVzL2lucHV0XCI7XG5pbXBvcnQgeyBwYXJzZXIgfSBmcm9tIFwiLi9yZXMvcGFyc2VyXCI7XG5pbXBvcnQgeyBVYm9fTWF0ciwgVUJPIH0gZnJvbSBcIi4vcmVzL3Vib1wiO1xuXG5pbXBvcnQgeyBfdmVjMyB9IGZyb20gXCIuL21hdGgvbWF0aHZlYzNcIjtcblxuaW1wb3J0IHsgY2FtLCBDYW1TZXQgfSBmcm9tIFwiLi9tYXRoL21hdGhjYW1cIjtcbmltcG9ydCB7IF9tYXRyNCB9IGZyb20gXCIuL21hdGgvbWF0aG1hdDRcIjtcbmltcG9ydCB7XG4gIFNoYXBlcyxcbiAgR2V0QXJyYXlPYmplY3RzLFxuICBTdXJmYWNlcyxcbiAgR2V0QXJyYXlTdXJmYWNlcyxcbiAgc3VyZmFjZVxufSBmcm9tIFwiLi9vYmplY3RzXCI7XG5cbmxldCBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcbmxldCBGcHNDbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG5sZXQgVWJvX3NldDE6IFVCTztcbmV4cG9ydCBsZXQgVWJvX3NldDFfZGF0YTogVWJvX01hdHI7XG5sZXQgVWJvX3NldDI6IFVCTztcbmxldCBVYm9fc2V0MzogVUJPO1xubGV0IG1heF9zaXplID0gMTA7XG5cbmxldCBGbGFnRGF0YU9iamVjdFVwZGF0ZTogYm9vbGVhbiA9IHRydWU7XG5cbmludGVyZmFjZSBQcm9ncmFtSW5mbyB7XG4gIHByb2dyYW06IFdlYkdMUHJvZ3JhbTtcbiAgYXR0cmliTG9jYXRpb25zOiB7XG4gICAgdmVydGV4UG9zaXRpb246IG51bWJlcjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaW5pdENhbSgpIHtcbiAgQ2FtU2V0KF92ZWMzLnNldCgtMiwgNiwgLTYpLCBfdmVjMy5zZXQoMCwgMCwgMCksIF92ZWMzLnNldCgwLCAxLCAwKSk7XG4gIFVib19zZXQxX2RhdGEuUHJvakRpc3RGYXJUaW1lTG9jYWwueCA9IGNhbS5Qcm9qRGlzdDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ2FtKCkge1xuICBsZXQgRGlzdCA9IF92ZWMzLmxlbihfdmVjMy5zdWIoY2FtLkF0LCBjYW0uTG9jKSk7XG4gIGxldCBjb3NULCBzaW5ULCBjb3NQLCBzaW5QLCBwbGVuLCBBemltdXRoLCBFbGV2YXRvcjtcbiAgbGV0IFdwLCBIcCwgc3gsIHN5O1xuICBsZXQgZHY7XG5cbiAgV3AgPSBIcCA9IGNhbS5Qcm9qU2l6ZTtcbiAgY29zVCA9IChjYW0uTG9jLnkgLSBjYW0uQXQueSkgLyBEaXN0O1xuICBzaW5UID0gTWF0aC5zcXJ0KDEgLSBjb3NUICogY29zVCk7XG5cbiAgcGxlbiA9IERpc3QgKiBzaW5UO1xuICBjb3NQID0gKGNhbS5Mb2MueiAtIGNhbS5BdC56KSAvIHBsZW47XG4gIHNpblAgPSAoY2FtLkxvYy54IC0gY2FtLkF0LngpIC8gcGxlbjtcblxuICBBemltdXRoID0gKE1hdGguYXRhbjIoc2luUCwgY29zUCkgLyBNYXRoLlBJKSAqIDE4MDtcbiAgRWxldmF0b3IgPSAoTWF0aC5hdGFuMihzaW5ULCBjb3NUKSAvIE1hdGguUEkpICogMTgwO1xuXG4gIGxldCBrZXkgPSBcIkFEXCI7XG5cbiAgQXppbXV0aCArPVxuICAgIG15VGltZXIuZ2xvYmFsRGVsdGFUaW1lICogMyAqICgtMzAgKiBteUlucHV0Lk1vdXNlQ2xpY2tMZWZ0ICogbXlJbnB1dC5NZHgpO1xuICBFbGV2YXRvciArPVxuICAgIG15VGltZXIuZ2xvYmFsRGVsdGFUaW1lICogMiAqICgtMzAgKiBteUlucHV0Lk1vdXNlQ2xpY2tMZWZ0ICogbXlJbnB1dC5NZHkpO1xuXG4gIGlmIChFbGV2YXRvciA8IDAuMDgpIEVsZXZhdG9yID0gMC4wODtcbiAgZWxzZSBpZiAoRWxldmF0b3IgPiAxNzguOSkgRWxldmF0b3IgPSAxNzguOTtcblxuICAvLyBpZiAoQXppbXV0aCA8IC00NSkgQXppbXV0aCA9IC00NTtcbiAgLy8gZWxzZSBpZiAoQXppbXV0aCA+IDQ1KSBBemltdXRoID0gNDU7XG5cbiAgRGlzdCArPVxuICAgIG15VGltZXIuZ2xvYmFsRGVsdGFUaW1lICogKDEgKyBteUlucHV0LktleXNbMTZdICogMjcpICogKDEuMiAqIG15SW5wdXQuTWR6KTtcbiAgaWYgKERpc3QgPCAwLjEpIERpc3QgPSAwLjE7XG4gIC8vIGNvbnNvbGUubG9nKGtleS5jaGFyQ29kZUF0KDApKTtcbiAgaWYgKG15SW5wdXQuTW91c2VDbGlja1JpZ2h0KSB7XG4gICAgaWYgKGNhbS5GcmFtZVcgPiBjYW0uRnJhbWVIKSBXcCAqPSBjYW0uRnJhbWVXIC8gY2FtLkZyYW1lSDtcbiAgICBlbHNlIEhwICo9IGNhbS5GcmFtZUggLyBjYW0uRnJhbWVXO1xuXG4gICAgc3ggPSAoKCgtbXlJbnB1dC5NZHggKiBXcCAqIDEwKSAvIGNhbS5GcmFtZVcpICogRGlzdCkgLyBjYW0uUHJvakRpc3Q7XG4gICAgc3kgPSAoKChteUlucHV0Lk1keSAqIEhwICogMTApIC8gY2FtLkZyYW1lSCkgKiBEaXN0KSAvIGNhbS5Qcm9qRGlzdDtcblxuICAgIGR2ID0gX3ZlYzMuYWRkKF92ZWMzLm11bG51bShjYW0uUmlnaHQsIHN4KSwgX3ZlYzMubXVsbnVtKGNhbS5VcCwgc3kpKTtcblxuICAgIGNhbS5BdCA9IF92ZWMzLmFkZChjYW0uQXQsIGR2KTtcbiAgICBjYW0uTG9jID0gX3ZlYzMuYWRkKGNhbS5Mb2MsIGR2KTtcbiAgfVxuICBDYW1TZXQoXG4gICAgX21hdHI0LnBvaW50X3RyYW5zZm9ybShcbiAgICAgIG5ldyBfdmVjMygwLCBEaXN0LCAwKSxcbiAgICAgIF9tYXRyNC5tdWxtYXRyKFxuICAgICAgICBfbWF0cjQubXVsbWF0cihfbWF0cjQucm90YXRlWChFbGV2YXRvciksIF9tYXRyNC5yb3RhdGVZKEF6aW11dGgpKSxcbiAgICAgICAgX21hdHI0LnRyYW5zbGF0ZShjYW0uQXQpXG4gICAgICApXG4gICAgKSxcbiAgICBjYW0uQXQsXG4gICAgbmV3IF92ZWMzKDAsIDEsIDApXG4gICk7XG5cbiAgVWJvX3NldDFfZGF0YS5DYW1Mb2MgPSBjYW0uTG9jO1xuICBVYm9fc2V0MV9kYXRhLkNhbUF0ID0gY2FtLkF0O1xuICBVYm9fc2V0MV9kYXRhLkNhbVJpZ2h0ID0gY2FtLlJpZ2h0O1xuICBVYm9fc2V0MV9kYXRhLkNhbVVwID0gY2FtLlVwO1xuICBVYm9fc2V0MV9kYXRhLkNhbURpciA9IGNhbS5EaXI7XG5cbiAgLy8gICBpZiAoQW5pLT5LZXlzW1ZLX1NISUZUXSAmJiBBbmktPktleXNDbGlja1snUCddKVxuICAvLyAgICAgQW5pLT5Jc1BhdXNlID0gIUFuaS0+SXNQYXVzZTtcbn1cblxuZnVuY3Rpb24gZHJhd0ZwcygpIHtcbiAgRnBzQ252YXMuY2xlYXJSZWN0KDAsIDAsIEZwc0NudmFzLmNhbnZhcy53aWR0aCwgRnBzQ252YXMuY2FudmFzLmhlaWdodCk7XG4gIEZwc0NudmFzLmZvbnQgPSBcIjQ4cHggc2VyaWZcIjtcbiAgRnBzQ252YXMuZmlsbFRleHQoXCJGUFM6XCIgKyBteVRpbWVyLkZQUy50b0ZpeGVkKDIpLCAxMCwgNTApO1xufVxuXG5mdW5jdGlvbiByZXNpemVDYW0odzogbnVtYmVyLCBoOiBudW1iZXIpIHtcbiAgVWJvX3NldDFfZGF0YS5mbGFnczEyRnJhbWVXLnogPSB3O1xuICBVYm9fc2V0MV9kYXRhLmZsYWdzNDVGcmFtZUgueiA9IGg7XG4gIGNhbS5Qcm9qU2V0KCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZFNoYWRlcnMoKTogUHJvbWlzZTxQcm9ncmFtSW5mbyB8IG51bGw+IHtcbiAgY29uc3QgdnNSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxuICAgIFwiLi9zaGFkZXIvbWFyY2gudmVydGV4Lmdsc2xcIiArIFwiP25vY2FjaGVcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICk7XG4gIGNvbnN0IHZzVGV4dCA9IGF3YWl0IHZzUmVzcG9uc2UudGV4dCgpO1xuICAvLyBjb25zb2xlLmxvZyh2c1RleHQpO1xuXG4gIGNvbnN0IGZzUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcbiAgICBcIi4vc2hhZGVyL21hcmNoLmZyYWdtZW50Lmdsc2xcIiArIFwiP25vY2FjaGVcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICk7XG4gIGNvbnN0IGZzVGV4dCA9IGF3YWl0IGZzUmVzcG9uc2UudGV4dCgpO1xuICBjb25zdCBkdFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgXCIuL2RhdGEudHh0XCIgKyBcIj9ub2NhY2hlXCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuICApO1xuICBjb25zdCBkdFRleHQgPSBhd2FpdCBkdFJlc3BvbnNlLnRleHQoKTtcbiAgcGFyc2VyKGR0VGV4dCk7XG4gIGNvbnNvbGUubG9nKFNoYXBlcyk7XG4gIGNvbnNvbGUubG9nKFN1cmZhY2VzKTtcbiAgVWJvX3NldDIudXBkYXRlKEdldEFycmF5T2JqZWN0cygpLCBnbCk7XG4gIFVib19zZXQzLnVwZGF0ZShHZXRBcnJheVN1cmZhY2VzKCksIGdsKTtcblxuICBjb25zdCBzaGFkZXJQcm9ncmFtID0gaW5pdFNoYWRlclByb2dyYW0odnNUZXh0LCBmc1RleHQpO1xuICBpZiAoIXNoYWRlclByb2dyYW0pIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHByb2dyYW1JbmZvOiBQcm9ncmFtSW5mbyA9IHtcbiAgICBwcm9ncmFtOiBzaGFkZXJQcm9ncmFtLFxuICAgIGF0dHJpYkxvY2F0aW9uczoge1xuICAgICAgdmVydGV4UG9zaXRpb246IGdsLmdldEF0dHJpYkxvY2F0aW9uKHNoYWRlclByb2dyYW0sIFwiaW5fcG9zXCIpXG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBwcm9ncmFtSW5mbztcbn1cblxuZnVuY3Rpb24gbG9hZFNoYWRlcih0eXBlOiBudW1iZXIsIHNvdXJjZTogc3RyaW5nKSB7XG4gIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcbiAgaWYgKCFzaGFkZXIpIHJldHVybiBudWxsO1xuICAvLyBTZW5kIHRoZSBzb3VyY2UgdG8gdGhlIHNoYWRlciBvYmplY3RcblxuICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuXG4gIC8vIENvbXBpbGUgdGhlIHNoYWRlciBwcm9ncmFtXG5cbiAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gIC8vIFNlZSBpZiBpdCBjb21waWxlZCBzdWNjZXNzZnVsbHlcblxuICBpZiAoIWdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgIGFsZXJ0KFxuICAgICAgYEFuIGVycm9yIG9jY3VycmVkIGNvbXBpbGluZyB0aGUgc2hhZGVyczogJHtnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcil9YFxuICAgICk7XG4gICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gc2hhZGVyO1xufVxuXG4vL1xuLy8gSW5pdGlhbGl6ZSBhIHNoYWRlciBwcm9ncmFtLCBzbyBXZWJHTCBrbm93cyBob3cgdG8gZHJhdyBvdXIgZGF0YVxuLy9cbmZ1bmN0aW9uIGluaXRTaGFkZXJQcm9ncmFtKHZzU291cmNlOiBzdHJpbmcsIGZzU291cmNlOiBzdHJpbmcpIHtcbiAgY29uc3QgdmVydGV4U2hhZGVyID0gbG9hZFNoYWRlcihnbC5WRVJURVhfU0hBREVSLCB2c1NvdXJjZSk7XG4gIGlmICghdmVydGV4U2hhZGVyKSByZXR1cm47XG4gIGNvbnN0IGZyYWdtZW50U2hhZGVyID0gbG9hZFNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIsIGZzU291cmNlKTtcbiAgaWYgKCFmcmFnbWVudFNoYWRlcikgcmV0dXJuO1xuXG4gIC8vIENyZWF0ZSB0aGUgc2hhZGVyIHByb2dyYW1cblxuICBjb25zdCBzaGFkZXJQcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICBpZiAoIXNoYWRlclByb2dyYW0pIHJldHVybjtcbiAgZ2wuYXR0YWNoU2hhZGVyKHNoYWRlclByb2dyYW0sIHZlcnRleFNoYWRlcik7XG4gIGdsLmF0dGFjaFNoYWRlcihzaGFkZXJQcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XG4gIGdsLmxpbmtQcm9ncmFtKHNoYWRlclByb2dyYW0pO1xuXG4gIC8vIElmIGNyZWF0aW5nIHRoZSBzaGFkZXIgcHJvZ3JhbSBmYWlsZWQsIGFsZXJ0XG5cbiAgaWYgKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHNoYWRlclByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xuICAgIGFsZXJ0KFxuICAgICAgYFVuYWJsZSB0byBpbml0aWFsaXplIHRoZSBzaGFkZXIgcHJvZ3JhbTogJHtnbC5nZXRQcm9ncmFtSW5mb0xvZyhcbiAgICAgICAgc2hhZGVyUHJvZ3JhbVxuICAgICAgKX1gXG4gICAgKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBzaGFkZXJQcm9ncmFtO1xufVxuXG5mdW5jdGlvbiBpbml0UG9zaXRpb25CdWZmZXIoKTogV2ViR0xCdWZmZXIgfCBudWxsIHtcbiAgLy8gQ3JlYXRlIGEgYnVmZmVyIGZvciB0aGUgc3F1YXJlJ3MgcG9zaXRpb25zLlxuICBjb25zdCBwb3NpdGlvbkJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuXG4gIC8vIFNlbGVjdCB0aGUgcG9zaXRpb25CdWZmZXIgYXMgdGhlIG9uZSB0byBhcHBseSBidWZmZXJcbiAgLy8gb3BlcmF0aW9ucyB0byBmcm9tIGhlcmUgb3V0LlxuICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xuXG4gIC8vIE5vdyBjcmVhdGUgYW4gYXJyYXkgb2YgcG9zaXRpb25zIGZvciB0aGUgc3F1YXJlLlxuICBjb25zdCBwb3NpdGlvbnMgPSBbMS4wLCAxLjAsIC0xLjAsIDEuMCwgMS4wLCAtMS4wLCAtMS4wLCAtMS4wXTtcblxuICAvLyBOb3cgcGFzcyB0aGUgbGlzdCBvZiBwb3NpdGlvbnMgaW50byBXZWJHTCB0byBidWlsZCB0aGVcbiAgLy8gc2hhcGUuIFdlIGRvIHRoaXMgYnkgY3JlYXRpbmcgYSBGbG9hdDMyQXJyYXkgZnJvbSB0aGVcbiAgLy8gSmF2YVNjcmlwdCBhcnJheSwgdGhlbiB1c2UgaXQgdG8gZmlsbCB0aGUgY3VycmVudCBidWZmZXIuXG4gIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucyksIGdsLlNUQVRJQ19EUkFXKTtcblxuICByZXR1cm4gcG9zaXRpb25CdWZmZXI7XG59XG5cbmludGVyZmFjZSBCdWZmZXJzIHtcbiAgcG9zaXRpb246IFdlYkdMQnVmZmVyIHwgbnVsbDtcbn1cblxuZnVuY3Rpb24gaW5pdEJ1ZmZlcnMoKTogQnVmZmVycyB7XG4gIGNvbnN0IHBvc2l0aW9uQnVmZmVyID0gaW5pdFBvc2l0aW9uQnVmZmVyKCk7XG5cbiAgcmV0dXJuIHtcbiAgICBwb3NpdGlvbjogcG9zaXRpb25CdWZmZXJcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2V0UG9zaXRpb25BdHRyaWJ1dGUoYnVmZmVyczogQnVmZmVycywgcHJvZ3JhbUluZm86IFByb2dyYW1JbmZvKSB7XG4gIGNvbnN0IG51bUNvbXBvbmVudHMgPSAyOyAvLyBwdWxsIG91dCAyIHZhbHVlcyBwZXIgaXRlcmF0aW9uXG4gIGNvbnN0IHR5cGUgPSBnbC5GTE9BVDsgLy8gdGhlIGRhdGEgaW4gdGhlIGJ1ZmZlciBpcyAzMmJpdCBmbG9hdHNcbiAgY29uc3Qgbm9ybWFsaXplID0gZmFsc2U7IC8vIGRvbid0IG5vcm1hbGl6ZVxuICBjb25zdCBzdHJpZGUgPSAwOyAvLyBob3cgbWFueSBieXRlcyB0byBnZXQgZnJvbSBvbmUgc2V0IG9mIHZhbHVlcyB0byB0aGUgbmV4dFxuICAvLyAwID0gdXNlIHR5cGUgYW5kIG51bUNvbXBvbmVudHMgYWJvdmVcbiAgY29uc3Qgb2Zmc2V0ID0gMDsgLy8gaG93IG1hbnkgYnl0ZXMgaW5zaWRlIHRoZSBidWZmZXIgdG8gc3RhcnQgZnJvbVxuICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVycy5wb3NpdGlvbik7XG4gIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoXG4gICAgcHJvZ3JhbUluZm8uYXR0cmliTG9jYXRpb25zLnZlcnRleFBvc2l0aW9uLFxuICAgIG51bUNvbXBvbmVudHMsXG4gICAgdHlwZSxcbiAgICBub3JtYWxpemUsXG4gICAgc3RyaWRlLFxuICAgIG9mZnNldFxuICApO1xuICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwcm9ncmFtSW5mby5hdHRyaWJMb2NhdGlvbnMudmVydGV4UG9zaXRpb24pO1xufVxuXG5mdW5jdGlvbiBkcmF3U2NlbmUoXG4gIHByb2dyYW1JbmZvOiBQcm9ncmFtSW5mbyB8IG51bGwsXG4gIGJ1ZmZlcnM6IEJ1ZmZlcnMsXG4gIFVuaTogV2ViR0xVbmlmb3JtTG9jYXRpb25cbikge1xuICBnbC5jbGVhckNvbG9yKDAuMjgsIDAuNDcsIDAuOCwgMS4wKTsgLy8gQ2xlYXIgdG8gYmxhY2ssIGZ1bGx5IG9wYXF1ZVxuICBnbC5jbGVhckRlcHRoKDEuMCk7IC8vIENsZWFyIGV2ZXJ5dGhpbmdcbiAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpOyAvLyBFbmFibGUgZGVwdGggdGVzdGluZ1xuICBnbC5kZXB0aEZ1bmMoZ2wuTEVRVUFMKTsgLy8gTmVhciB0aGluZ3Mgb2JzY3VyZSBmYXIgdGhpbmdzXG5cbiAgLy8gQ2xlYXIgdGhlIGNhbnZhcyBiZWZvcmUgd2Ugc3RhcnQgZHJhd2luZyBvbiBpdC5cblxuICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG4gIGlmIChwcm9ncmFtSW5mbyA9PSBudWxsKSByZXR1cm47XG4gIHNldFBvc2l0aW9uQXR0cmlidXRlKGJ1ZmZlcnMsIHByb2dyYW1JbmZvKTtcblxuICAvLyBUZWxsIFdlYkdMIHRvIHVzZSBvdXIgcHJvZ3JhbSB3aGVuIGRyYXdpbmdcblxuICBnbC51c2VQcm9ncmFtKHByb2dyYW1JbmZvLnByb2dyYW0pO1xuICBVYm9fc2V0MS5hcHBseSgwLCBwcm9ncmFtSW5mby5wcm9ncmFtLCBnbCk7XG4gIFVib19zZXQyLmFwcGx5KDEsIHByb2dyYW1JbmZvLnByb2dyYW0sIGdsKTtcbiAgVWJvX3NldDMuYXBwbHkoMiwgcHJvZ3JhbUluZm8ucHJvZ3JhbSwgZ2wpO1xuICBjb25zdCBvZmZzZXQgPSAwO1xuICBjb25zdCB2ZXJ0ZXhDb3VudCA9IDQ7XG4gIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVfU1RSSVAsIG9mZnNldCwgdmVydGV4Q291bnQpO1xufVxubGV0IE1kID0gWzAsIDBdLFxuICBNb3VzZUNsaWNrID0gWzAsIDBdLFxuICBXaGVlbCA9IDAsXG4gIEtleXMgPSBuZXcgQXJyYXkoMjU1KS5maWxsKDApO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbih3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICBjb25zdCB2c1Jlc3BvbnNlID0gYXdhaXQgZmV0Y2goXG4gICAgXCIuL3NoYWRlci9tYXJjaC52ZXJ0ZXguZ2xzbFwiICsgXCI/bm9jYWNoZVwiICsgbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgKTtcbiAgY29uc3QgdnNUZXh0ID0gYXdhaXQgdnNSZXNwb25zZS50ZXh0KCk7XG4gIGNvbnNvbGUubG9nKHZzVGV4dCk7XG4gIGNvbnN0IGZzUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcbiAgICBcIi4vc2hhZGVyL21hcmNoLmZyYWdtZW50Lmdsc2xcIiArIFwiP25vY2FjaGVcIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICk7XG4gIGNvbnN0IGZzVGV4dCA9IGF3YWl0IGZzUmVzcG9uc2UudGV4dCgpO1xuICBjb25zb2xlLmxvZyhmc1RleHQpO1xuXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2xjYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gIGNvbnN0IGNhbnZhczEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zwc2NhbnZhc1wiKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgaWYgKCFjYW52YXMgfHwgIWNhbnZhczEpIHtcbiAgICByZXR1cm47XG4gIH0gLy8gSW5pdGlhbGl6ZSB0aGUgR0wgY29udGV4dFxuXG4gIEZwc0NudmFzID0gY2FudmFzMS5nZXRDb250ZXh0KFwiMmRcIikgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2wyXCIpIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG4gIGdsLmNhbnZhcy53aWR0aCA9IHc7XG4gIGdsLmNhbnZhcy5oZWlnaHQgPSBoO1xuXG4gIC8vIE9ubHkgY29udGludWUgaWYgV2ViR0wgaXMgYXZhaWxhYmxlIGFuZCB3b3JraW5nXG4gIGlmIChnbCA9PT0gbnVsbCkge1xuICAgIGFsZXJ0KFxuICAgICAgXCJVbmFibGUgdG8gaW5pdGlhbGl6ZSBXZWJHTC4gWW91ciBicm93c2VyIG9yIG1hY2hpbmUgbWF5IG5vdCBzdXBwb3J0IGl0LlwiXG4gICAgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBTZXQgY2xlYXIgY29sb3IgdG8gYmxhY2ssIGZ1bGx5IG9wYXF1ZVxuICBnbC5jbGVhckNvbG9yKDAuMjgsIDAuNDcsIDAuOCwgMS4wKTtcbiAgLy8gQ2xlYXIgdGhlIGNvbG9yIGJ1ZmZlciB3aXRoIHNwZWNpZmllZCBjbGVhciBjb2xvclxuICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcblxuICBsZXQgc2hhZGVyUHJvZ3JhbSA9IGluaXRTaGFkZXJQcm9ncmFtKHZzVGV4dCwgZnNUZXh0KTtcbiAgaWYgKCFzaGFkZXJQcm9ncmFtKSByZXR1cm47XG5cbiAgbGV0IHByb2dyYW1JbmZvOiBQcm9ncmFtSW5mbyB8IG51bGwgPSB7XG4gICAgcHJvZ3JhbTogc2hhZGVyUHJvZ3JhbSxcbiAgICBhdHRyaWJMb2NhdGlvbnM6IHtcbiAgICAgIHZlcnRleFBvc2l0aW9uOiBnbC5nZXRBdHRyaWJMb2NhdGlvbihzaGFkZXJQcm9ncmFtLCBcImluX3Bvc1wiKVxuICAgIH1cbiAgfTtcbiAgY29uc3QgVW5pID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24oc2hhZGVyUHJvZ3JhbSwgXCJ0aW1lXCIpO1xuICBjb25zdCBidWZmZXJzID0gaW5pdEJ1ZmZlcnMoKTtcbiAgVWJvX3NldDFfZGF0YSA9IG5ldyBVYm9fTWF0cihcbiAgICBuZXcgX3ZlYzMoMCwgMCwgMCksXG4gICAgbmV3IF92ZWMzKDAsIDAsIDApLFxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcbiAgICBuZXcgX3ZlYzMoMCwgMCwgMCksXG4gICAgbmV3IF92ZWMzKDAsIDAsIDApLFxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcbiAgICBuZXcgX3ZlYzMoMCwgMCwgMCksXG4gICAgbmV3IF92ZWMzKDAsIDAsIDApLFxuICAgIG5ldyBfdmVjMygwLCAwLCAwKSxcbiAgICBuZXcgX3ZlYzMoMCwgMCwgMCksXG4gICAgbmV3IF92ZWMzKDAsIDAsIDApLFxuICAgIDAsXG4gICAgMCxcbiAgICAwXG4gICk7XG4gIFN1cmZhY2VzLnB1c2gobmV3IHN1cmZhY2UoKSk7XG4gIFVib19zZXQxID0gVUJPLmNyZWF0ZShVYm9fc2V0MV9kYXRhLkdldEFycmF5KCkubGVuZ3RoLCBcIkJhc2VEYXRhXCIsIGdsKTtcbiAgVWJvX3NldDIgPSBVQk8uY3JlYXRlKDM2ICogbWF4X3NpemUgKyA0LCBcIlByaW1pdGl2ZXNcIiwgZ2wpO1xuICBVYm9fc2V0MyA9IFVCTy5jcmVhdGUoMjAgKiBtYXhfc2l6ZSArIDQsIFwiUHJpbWl0aXZlc1N1cmZhY2VzXCIsIGdsKTtcbiAgaW5pdENhbSgpO1xuICBnbC52aWV3cG9ydCgwLCAwLCB3LCBoKTtcbiAgcmVzaXplQ2FtKHcsIGgpO1xuICBsZXQgcHJvZ3JhbUluZjogUHJvZ3JhbUluZm8gfCBudWxsO1xuICBwcm9ncmFtSW5mID0gcHJvZ3JhbUluZm87XG4gIHByb2dyYW1JbmYgPSBhd2FpdCByZWxvYWRTaGFkZXJzKCk7XG4gIGNvbnN0IHJlbmRlciA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAobXlJbnB1dC5LZXlzQ2xpY2tbODJdKSBwcm9ncmFtSW5mID0gYXdhaXQgcmVsb2FkU2hhZGVycygpO1xuICAgIG15VGltZXIuUmVzcG9uc2UoKTtcbiAgICBkcmF3RnBzKCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKGUuYnV0dG9uID09IDApIHtcbiAgICAgICAgTW91c2VDbGlja1swXSA9IDE7XG4gICAgICB9XG4gICAgICBpZiAoZS5idXR0b24gPT0gMikge1xuICAgICAgICBNb3VzZUNsaWNrWzFdID0gMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xuICAgICAgaWYgKGUuYnV0dG9uID09IDApIHtcbiAgICAgICAgTW91c2VDbGlja1swXSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoZS5idXR0b24gPT0gMikge1xuICAgICAgICBNb3VzZUNsaWNrWzFdID0gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlKSA9PiB7XG4gICAgICBNZFswXSA9IGUubW92ZW1lbnRYO1xuICAgICAgTWRbMV0gPSBlLm1vdmVtZW50WTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZSkgPT4ge1xuICAgICAgS2V5c1tlLmtleUNvZGVdID0gMTtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgKGUpID0+IHtcbiAgICAgIEtleXNbZS5rZXlDb2RlXSA9IDA7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIChlKSA9PiB7XG4gICAgICBXaGVlbCA9IGUuZGVsdGFZO1xuICAgIH0pO1xuXG4gICAgbXlJbnB1dC5yZXNwb25zZShNZCwgTW91c2VDbGljaywgV2hlZWwsIEtleXMpO1xuXG4gICAgTWRbMF0gPSBNZFsxXSA9IDA7XG4gICAgcmVuZGVyQ2FtKCk7XG4gICAgVWJvX3NldDFfZGF0YS5UaW1lR2xvYmFsRGVsdGFHbG9iYWxEZWx0YUxvY2FsLnggPSBteVRpbWVyLmdsb2JhbFRpbWU7XG4gICAgVWJvX3NldDEudXBkYXRlKFVib19zZXQxX2RhdGEuR2V0QXJyYXkoKSwgZ2wpO1xuICAgIGRyYXdTY2VuZShwcm9ncmFtSW5mLCBidWZmZXJzLCBVbmkpO1xuICAgIFdoZWVsID0gMDtcbiAgICBLZXlzLmZpbGwoMCk7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICB9O1xuICByZW5kZXIoKTtcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIChldmVudCkgPT4ge1xuICBsZXQgdzogbnVtYmVyID0gd2luZG93LmlubmVyV2lkdGg7XG4gIGxldCBoOiBudW1iZXIgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIG1haW4odywgaCk7XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKGV2ZW50KSA9PiB7XG4gIGxldCB3OiBudW1iZXIgPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgbGV0IGg6IG51bWJlciA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgZ2wuY2FudmFzLndpZHRoID0gdztcbiAgZ2wuY2FudmFzLmhlaWdodCA9IGg7XG4gIEZwc0NudmFzLmNhbnZhcy53aWR0aCA9IHc7XG4gIEZwc0NudmFzLmNhbnZhcy5oZWlnaHQgPSBoO1xuICBnbC52aWV3cG9ydCgwLCAwLCB3LCBoKTtcbiAgcmVzaXplQ2FtKHcsIGgpO1xufSk7XG4iXSwibmFtZXMiOlsiVWJvX3NldDFfZGF0YSJdLCJtYXBwaW5ncyI6Ijs7O0lBQUE7SUFDQTtJQUNBO0lBQ0E7SUFFQSxNQUFNLElBQUksQ0FBQTtRQUNSLE9BQU8sR0FBQTtJQUNMLFFBQUEsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUN4QixRQUFBLElBQUksQ0FBQyxHQUNILElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxNQUFNO2dCQUMvQixJQUFJLENBQUMsVUFBVSxFQUFFO0lBQ2pCLFlBQUEsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUN6QixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFFRCxJQUFBLFVBQVUsQ0FBUztJQUNuQixJQUFBLFNBQVMsQ0FBUztJQUNsQixJQUFBLGVBQWUsQ0FBUztJQUN4QixJQUFBLFNBQVMsQ0FBUztJQUNsQixJQUFBLGNBQWMsQ0FBUztJQUN2QixJQUFBLFlBQVksQ0FBUztJQUNyQixJQUFBLFNBQVMsQ0FBUztJQUNsQixJQUFBLE9BQU8sQ0FBUztJQUNoQixJQUFBLFVBQVUsQ0FBUztJQUNuQixJQUFBLE9BQU8sQ0FBVTtJQUNqQixJQUFBLEdBQUcsQ0FBUztJQUNaLElBQUEsV0FBQSxHQUFBOztZQUVFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQzs7SUFHL0MsUUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ2xFLFFBQUEsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDdEIsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNyQixRQUFBLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLFFBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7U0FDcEI7UUFFRCxRQUFRLEdBQUE7SUFDTixRQUFBLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7SUFFdkIsUUFBQSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztJQUV4QyxRQUFBLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtJQUNoQixZQUFBLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3BDO2lCQUFNO0lBQ0wsWUFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDM0MsWUFBQSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7YUFDdEQ7O1lBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO0lBQzNCLFlBQUEsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckQsWUFBQSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNwQixZQUFBLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO2FBQ3ZCO0lBQ0QsUUFBQSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztTQUNsQjtJQUNGLENBQUE7SUFFTSxJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRTs7SUMvRC9CLE1BQU0sS0FBSyxDQUFBO0lBQ1QsSUFBQSxJQUFJLENBQVc7SUFDZixJQUFBLFNBQVMsQ0FBVztJQUNwQixJQUFBLEVBQUUsQ0FBUztJQUNYLElBQUEsRUFBRSxDQUFTO0lBQ1gsSUFBQSxFQUFFLENBQVM7SUFDWCxJQUFBLEdBQUcsQ0FBUztJQUNaLElBQUEsR0FBRyxDQUFTO0lBQ1osSUFBQSxHQUFHLENBQVM7SUFFWixJQUFBLGNBQWMsQ0FBUztJQUN2QixJQUFBLGVBQWUsQ0FBUztRQUV4QixXQUFZLENBQUEsVUFBb0IsRUFBRSxJQUFjLEVBQUE7WUFDOUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNsQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDakUsUUFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQyxRQUFBLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO0lBRUQsSUFBQSxRQUFRLENBQUMsQ0FBVyxFQUFFLFVBQW9CLEVBQUUsS0FBYSxFQUFFLElBQWMsRUFBQTs7SUFHdkUsUUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN0RDtJQUNELFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEI7SUFFRCxRQUFBLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLFFBQUEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7OztJQUloQixRQUFBLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ2pCLFFBQUEsSUFBSSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUM7SUFFakIsUUFBQSxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQyxRQUFBLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RDO0lBQ0YsQ0FBQTtJQUVNLElBQUksT0FBTyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs7VUMzQzdCLEtBQUssQ0FBQTtJQUNoQixJQUFBLENBQUMsQ0FBUztJQUNWLElBQUEsQ0FBQyxDQUFTO0lBQ1YsSUFBQSxDQUFDLENBQVM7SUFDVixJQUFBLFdBQUEsQ0FBWSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBQTtJQUM1QyxRQUFBLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osUUFBQSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNaLFFBQUEsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDYjtJQUVELElBQUEsT0FBTyxHQUFHLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUE7WUFDM0MsT0FBTyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzlCO0lBRUQsSUFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFRLEVBQUUsQ0FBUSxFQUFBO1lBQzNCLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuRDtJQUVELElBQUEsT0FBTyxHQUFHLENBQUMsQ0FBUSxFQUFFLENBQVEsRUFBQTtZQUMzQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkQ7SUFFRCxJQUFBLE9BQU8sTUFBTSxDQUFDLENBQVEsRUFBRSxDQUFTLEVBQUE7WUFDL0IsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzdDO0lBRUQsSUFBQSxPQUFPLE1BQU0sQ0FBQyxDQUFRLEVBQUUsQ0FBUyxFQUFBO1lBQy9CLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUM3QztRQUVELE9BQU8sR0FBRyxDQUFDLENBQVEsRUFBQTtJQUNqQixRQUFBLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQztJQUVELElBQUEsT0FBTyxHQUFHLENBQUMsQ0FBUSxFQUFFLENBQVEsRUFBQTtZQUMzQixPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFDO0lBRUQsSUFBQSxPQUFPLEtBQUssQ0FBQyxDQUFRLEVBQUUsQ0FBUSxFQUFBO1lBQzdCLE9BQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDckIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDckIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FDdEIsQ0FBQztTQUNIO1FBRUQsT0FBTyxJQUFJLENBQUMsQ0FBUSxFQUFBO1lBQ2xCLE9BQU8sQ0FBQyxD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LENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSO0lBQ0gsWUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsZ0JBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUjtJQUNILFlBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLGdCQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1I7SUFDSCxZQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxnQkFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEVBQ0g7U0FDSDtRQUVELE9BQU8sT0FBTyxDQUFDLENBQWEsRUFBQTtZQUMxQixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLFFBQUEsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLElBQUksR0FBRyxLQUFLLENBQUM7SUFBRSxZQUFBLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFFWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUVYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLEdBQUcsQ0FBQztJQUVWLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNYLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLFlBQUEsTUFBTSxDQUFDLFNBQVMsQ0FDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDUixHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ1gsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsR0FBRyxDQUFDO0lBQ1YsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsWUFBQSxNQUFNLENBQUMsU0FBUyxDQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNSLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDWCxRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxZQUFBLE1BQU0sQ0FBQyxTQUFTLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ1IsR0FBRyxHQUFHLENBQUM7SUFDVixRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFDRCxJQUFBLE9BQU8sT0FBTyxDQUNaLENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUNULENBQVMsRUFDVCxDQUFTLEVBQ1QsQ0FBUyxFQUFBO0lBRVQsUUFBQSxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFMUIsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1osUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVaLFFBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUIsUUFBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1QixRQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVosUUFBQSxPQUFPLENBQUMsQ0FBQztTQUNWO1FBRUQsT0FBTyxLQUFLLENBQUMsQ0FBYSxFQUFBO1lBQ3hCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUVYLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUMxQixZQUFBLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzFCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Y7SUFFRCxRQUFBLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7SUFFRCxJQUFBLE9BQU8sZUFBZSxDQUFDLENBQVEsRUFBRSxDQUFhLEVBQUE7SUFDNUMsUUFBQSxPQUFPLElBQUksS0FBSyxDQUNkLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdkQsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RCxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3hELENBQUM7U0FDSDtJQUVELElBQUEsT0FBTyxnQkFBZ0IsQ0FBQyxDQUFRLEVBQUUsQ0FBYSxFQUFBO1lBQzdDLE9BQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDOUMsQ0FBQztTQUNIO0lBQ0QsSUFBQSxPQUFPLFFBQVEsQ0FBQyxDQUFRLEVBQUUsQ0FBYSxFQUFBO1lBQ3JDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxRQUFBLE9BQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENB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LENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNsQixDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsQ0FDRixDQUFDO0lBQ0YsSUFBQSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM3QixJQUFBLFFBQVEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDQSxxQkFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdkUsSUFBQSxRQUFRLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsUUFBUSxHQUFHLENBQUMsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0QsSUFBQSxRQUFRLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsUUFBUSxHQUFHLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuRSxJQUFBLE9BQU8sRUFBRSxDQUFDO1FBQ1YsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENB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
