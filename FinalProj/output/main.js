var XXX = (function (exports) {
    'use strict';

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
        response(M, Md, MouseClick, Wheel, Keys) {
            // if (Keys[17] != 0)
            for (let i = 0; i < 256; i++) {
                this.KeysClick[i] = Keys[i] && !this.Keys[i] ? 1 : 0;
            }
            for (let i = 0; i < 256; i++) {
                this.Keys[i] = Keys[i];
            }
            this.Mdx = Md[0];
            this.Mdy = Md[1];
            this.Mx = M[0];
            this.My = M[1];
            // this.Mx = M[0];
            // this.My = M[1];
            this.Mdz = Wheel;
            this.Mz += Wheel;
            this.MouseClickLeft = MouseClick[0];
            this.MouseClickRight = MouseClick[1];
        }
    } // End of 'Input' function
    let myInput = new InPut([0, 0], []);

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

    let MapCnvs;
    let TitelsCnvs;
    let CountImageLoad = 0;
    let DrawFPS = false;
    //https://tile.tracestrack.com/topo__/
    //https://a.tile.openstreetmap.org/
    const SizeImage = 256;
    class camera {
        x = 0;
        y = 256;
        zoom = 1;
        IsUpdate = true;
    }
    class titel {
        x = 0;
        y = 0;
        zoom = 0;
        img = new Image(SizeImage, SizeImage);
        IsVisible = true;
        SetLoad() {
            CountImageLoad++;
        }
        drawMap() {
            let n = SizeImage * Math.pow(2, Cam.zoom);
            let offset = (((Cam.x - MapCnvs.canvas.width / 2) % n) + n) % n;
            if (this.img == undefined || this.img == null)
                return;
            for (let j = 0; j < MapCnvs.canvas.width / n + 2; j++) {
                if (offset > j * n + this.x * SizeImage + SizeImage ||
                    j * n + this.x * SizeImage > MapCnvs.canvas.width + offset)
                    continue;
                let x = j * SizeImage * Math.pow(2, Cam.zoom) +
                    this.x * SizeImage +
                    -(Cam.x - MapCnvs.canvas.width / 2) +
                    Math.floor((Cam.x - MapCnvs.canvas.width / 2) / n) * n, y = -Cam.y + MapCnvs.canvas.height / 2 + this.y * SizeImage;
                MapCnvs.drawImage(this.img, 0, 0, SizeImage, SizeImage, x, y, SizeImage, SizeImage);
                if (DrawFPS) {
                    MapCnvs.beginPath();
                    MapCnvs.moveTo(x, y);
                    MapCnvs.lineTo(x, y + SizeImage);
                    MapCnvs.lineTo(x + SizeImage, y + SizeImage);
                    MapCnvs.lineTo(x + SizeImage, y);
                    MapCnvs.lineTo(x, y);
                    MapCnvs.stroke();
                    MapCnvs.fillText(this.x + "," + this.y, x + 5, y + 15);
                    MapCnvs.fillText(this.x + "," + this.y, x + 5, y + SizeImage - 5);
                    MapCnvs.fillText(this.x + "," + this.y, x + SizeImage - 30, y + 15);
                    MapCnvs.fillText(this.x + "," + this.y, x + SizeImage - 30, y + SizeImage - 5);
                    MapCnvs.stroke();
                }
            }
        }
    }
    let Cam = new camera();
    let titels = new Map();
    //new Image(SizeImage, SizeImage);
    function mod(a, b) {
        return ((a % b) + b) % b;
    }
    function renderCam() {
        let x, y, zoom;
        x = myInput.MouseClickLeft * myInput.Mdx;
        y = myInput.MouseClickLeft * myInput.Mdy;
        zoom = myInput.Mdz == 0 ? 0 : myInput.Mdz > 0 ? -1 : 1;
        if (x == 0 && y == 0 && zoom == 0)
            Cam.IsUpdate = false;
        else
            Cam.IsUpdate = true;
        if (myInput.KeysClick[68]) {
            Cam.IsUpdate = true;
        }
        if (myInput.KeysClick[71]) {
            DrawFPS = !DrawFPS;
            Cam.IsUpdate = true;
        }
        let n = SizeImage * Math.pow(2, Cam.zoom);
        Cam.x = (((Cam.x - x) % n) + n) % n;
        Cam.y -= y;
        if (zoom != 0) {
            let dx = (2 * myInput.Mx - MapCnvs.canvas.width) / 2, dy = (MapCnvs.canvas.height - 2 * myInput.My) / 2;
            Cam.x += dx;
            Cam.y -= dy;
            let wp = mod(Cam.x, n) / n;
            let hp = mod(Cam.y, n) / n;
            Cam.zoom = mod(Cam.zoom + zoom, 20);
            n = SizeImage * Math.pow(2, Cam.zoom);
            Cam.x = wp * n - dx;
            Cam.y = hp * n + dy;
        }
    }
    // //( &&
    // ((((Cam.x % n) + n) % n) - MapCnvs.canvas.width / 2 > x * SizeImage + SizeImage ||
    // (((Cam.x % n) + n) % n) + MapCnvs.canvas.width / 2 < x * SizeImage)
    function LoadMap() {
        if (CountImageLoad != 0)
            return;
        let n = SizeImage * Math.pow(2, Cam.zoom);
        if (MapCnvs.canvas.width > n) {
            for (let i = 0; i < Math.pow(4, Cam.zoom); i++) {
                let x = i % Math.pow(2, Cam.zoom), y = Math.floor(i / Math.pow(2, Cam.zoom));
                if (Cam.y - MapCnvs.canvas.height / 2 > y * SizeImage + SizeImage ||
                    Cam.y + MapCnvs.canvas.height / 2 < y * SizeImage)
                    continue;
                let v = titels.get((Math.pow(4, Cam.zoom) - 1) / 3 + i);
                if (v != undefined) {
                    v.IsVisible = true;
                    CountImageLoad++;
                }
                else {
                    v = new titel();
                    let im = new Image(SizeImage, SizeImage);
                    im.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${x}/${y}.png`;
                    im.onload = v.SetLoad;
                    v.img = im;
                    v.x = x;
                    v.y = y;
                    titels.set((Math.pow(4, Cam.zoom) - 1) / 3 + i, v);
                }
            }
        }
        else {
            let X0 = Math.floor((mod(Cam.x, n) - MapCnvs.canvas.width / 2) / SizeImage), Y0 = Math.floor((Cam.y - MapCnvs.canvas.height / 2 < 0
                ? 0
                : Cam.y - MapCnvs.canvas.height / 2 > n
                    ? n
                    : Cam.y - MapCnvs.canvas.height / 2) / SizeImage), X1 = Math.ceil((mod(Cam.x, n) + MapCnvs.canvas.width / 2) / SizeImage), Y1 = Math.ceil((Cam.y + MapCnvs.canvas.height / 2 < 0
                ? 0
                : Cam.y + MapCnvs.canvas.height / 2 > n
                    ? n
                    : Cam.y + MapCnvs.canvas.height / 2) / SizeImage);
            for (let j = Y0; j < Y1; j++)
                for (let i = X0; i < X1; i++) {
                    let x = mod(i, Math.pow(2, Cam.zoom)), y = mod(j, Math.pow(2, Cam.zoom));
                    let v = titels.get((Math.pow(4, Cam.zoom) - 1) / 3 + x + y * Math.pow(2, Cam.zoom));
                    if (v != undefined) {
                        if (!v.IsVisible)
                            CountImageLoad++;
                        v.IsVisible = true;
                    }
                    else {
                        v = new titel();
                        let im = new Image(SizeImage, SizeImage);
                        im.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${x}/${y}.png`;
                        im.onload = v.SetLoad;
                        v.img = im;
                        v.x = x;
                        v.y = y;
                        titels.set((Math.pow(4, Cam.zoom) - 1) / 3 + x + y * Math.pow(2, Cam.zoom), v);
                    }
                }
        }
        for (const [key, value] of titels) {
            if (!value.IsVisible)
                titels.delete(key);
            else
                value.IsVisible = false;
        }
    }
    let Md = [0, 0], M = [0, 0], MouseClick = [0, 0], Wheel = 0, Keys = new Array(255).fill(0);
    async function main(w, h) {
        const canvas1 = document.querySelector("#mapcanvas");
        if (!canvas1) {
            return;
        }
        MapCnvs = canvas1.getContext("2d");
        MapCnvs.canvas.width = w;
        MapCnvs.canvas.height = h;
        const canvas = document.querySelector("#numtitelscanvas");
        if (!canvas) {
            return;
        }
        TitelsCnvs = canvas.getContext("2d");
        TitelsCnvs.canvas.width = w;
        TitelsCnvs.canvas.height = h;
        const render = async () => {
            myTimer.Response();
            if (Cam.IsUpdate) {
                LoadMap();
            }
            if (CountImageLoad == titels.size) {
                MapCnvs.clearRect(0, 0, MapCnvs.canvas.width, MapCnvs.canvas.height);
                TitelsCnvs.clearRect(0, 0, TitelsCnvs.canvas.width, TitelsCnvs.canvas.height);
                MapCnvs.font = "20px serif";
                TitelsCnvs.font = "48px serif";
                if (DrawFPS) {
                    TitelsCnvs.fillText("Titels:" + titels.size, 10, 50);
                    TitelsCnvs.fillText("FPS:" + myTimer.FPS.toFixed(2), 10, 100);
                }
                for (const [key, value] of titels) {
                    value.drawMap();
                }
                CountImageLoad = 0;
            }
            if (CountImageLoad > titels.size) {
                CountImageLoad = 0;
                LoadMap();
            }
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
                M[0] = e.clientX;
                M[1] = e.clientY;
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
            myInput.response(M, Md, MouseClick, Wheel, Keys);
            Md[0] = Md[1] = 0;
            renderCam();
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
        MapCnvs.canvas.width = w;
        MapCnvs.canvas.height = h;
        TitelsCnvs.canvas.width = w;
        TitelsCnvs.canvas.height = h;
        // for (let i = 0; i < Math.pow(2, Cam.zoom); i++) {
        //   img.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${i % 2}/${Math.floor(i / 2)}.png`;
        //   img.onload = () => drawMap1(i % 2, Math.floor(i / 2));
        // }
        LoadMap();
    });

    exports.main = main;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vcmVzL2lucHV0LnRzIiwiLi4vcmVzL3RpbWVyLnRzIiwiLi4vbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBJblB1dCB7XG4gIEtleXM6IG51bWJlcltdO1xuICBLZXlzQ2xpY2s6IG51bWJlcltdO1xuICBNeDogbnVtYmVyO1xuICBNeTogbnVtYmVyO1xuICBNejogbnVtYmVyO1xuICBNZHg6IG51bWJlcjtcbiAgTWR5OiBudW1iZXI7XG4gIE1kejogbnVtYmVyO1xuXG4gIE1vdXNlQ2xpY2tMZWZ0OiBudW1iZXI7XG4gIE1vdXNlQ2xpY2tSaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKE1vdXNlQ2xpY2s6IG51bWJlcltdLCBLZXlzOiBudW1iZXJbXSkge1xuICAgIHRoaXMuS2V5cyA9IHRoaXMuS2V5c0NsaWNrID0gS2V5cztcbiAgICB0aGlzLk14ID0gdGhpcy5NeSA9IHRoaXMuTXogPSB0aGlzLk1keCA9IHRoaXMuTWR5ID0gdGhpcy5NZHogPSAwO1xuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxuXG4gIHJlc3BvbnNlKFxuICAgIE06IG51bWJlcltdLFxuICAgIE1kOiBudW1iZXJbXSxcbiAgICBNb3VzZUNsaWNrOiBudW1iZXJbXSxcbiAgICBXaGVlbDogbnVtYmVyLFxuICAgIEtleXM6IG51bWJlcltdXG4gICkge1xuICAgIC8vIGlmIChLZXlzWzE3XSAhPSAwKVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgICAgdGhpcy5LZXlzQ2xpY2tbaV0gPSBLZXlzW2ldICYmICF0aGlzLktleXNbaV0gPyAxIDogMDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xuICAgICAgdGhpcy5LZXlzW2ldID0gS2V5c1tpXTtcbiAgICB9XG5cbiAgICB0aGlzLk1keCA9IE1kWzBdO1xuICAgIHRoaXMuTWR5ID0gTWRbMV07XG5cbiAgICB0aGlzLk14ID0gTVswXTtcbiAgICB0aGlzLk15ID0gTVsxXTtcblxuICAgIC8vIHRoaXMuTXggPSBNWzBdO1xuICAgIC8vIHRoaXMuTXkgPSBNWzFdO1xuICAgIHRoaXMuTWR6ID0gV2hlZWw7XG4gICAgdGhpcy5NeiArPSBXaGVlbDtcblxuICAgIHRoaXMuTW91c2VDbGlja0xlZnQgPSBNb3VzZUNsaWNrWzBdO1xuICAgIHRoaXMuTW91c2VDbGlja1JpZ2h0ID0gTW91c2VDbGlja1sxXTtcbiAgfVxufSAvLyBFbmQgb2YgJ0lucHV0JyBmdW5jdGlvblxuXG5leHBvcnQgbGV0IG15SW5wdXQgPSBuZXcgSW5QdXQoWzAsIDBdLCBbXSk7XG4iLCIvLyBpbXBvcnQgeyBVQk8sIFVib19jZWxsIH0gZnJvbSBcIi4vcm5kL3Jlcy91Ym8uanNcIjtcbi8vIGltcG9ydCB7IGNhbSB9IGZyb20gXCIuL21hdGgvbWF0aGNhbS5qc1wiO1xuLy8gaW1wb3J0IHsgX3ZlYzMgfSBmcm9tIFwiLi9tYXRoL21hdGh2ZWMzLmpzXCI7XG4vLyBpbXBvcnQgeyBDYW1VQk8gfSBmcm9tIFwiLi9ybmQvcm5kYmFzZS5qc1wiO1xuXG5jbGFzcyBUaW1lIHtcbiAgZ2V0VGltZSgpOiBudW1iZXIge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGxldCB0ID1cbiAgICAgIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMDAwLjAgK1xuICAgICAgZGF0ZS5nZXRTZWNvbmRzKCkgK1xuICAgICAgZGF0ZS5nZXRNaW51dGVzKCkgKiA2MDtcbiAgICByZXR1cm4gdDtcbiAgfVxuXG4gIGdsb2JhbFRpbWU6IG51bWJlcjtcbiAgbG9jYWxUaW1lOiBudW1iZXI7XG4gIGdsb2JhbERlbHRhVGltZTogbnVtYmVyO1xuICBwYXVzZVRpbWU6IG51bWJlcjtcbiAgbG9jYWxEZWx0YVRpbWU6IG51bWJlcjtcbiAgZnJhbWVDb3VudGVyOiBudW1iZXI7XG4gIHN0YXJ0VGltZTogbnVtYmVyO1xuICBvbGRUaW1lOiBudW1iZXI7XG4gIG9sZFRpbWVGUFM6IG51bWJlcjtcbiAgaXNQYXVzZTogYm9vbGVhbjtcbiAgRlBTOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIEZpbGwgdGltZXIgZ2xvYmFsIGRhdGFcbiAgICB0aGlzLmdsb2JhbFRpbWUgPSB0aGlzLmxvY2FsVGltZSA9IHRoaXMuZ2V0VGltZSgpO1xuICAgIHRoaXMuZ2xvYmFsRGVsdGFUaW1lID0gdGhpcy5sb2NhbERlbHRhVGltZSA9IDA7XG5cbiAgICAvLyBGaWxsIHRpbWVyIHNlbWkgZ2xvYmFsIGRhdGFcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMub2xkVGltZSA9IHRoaXMub2xkVGltZUZQUyA9IHRoaXMuZ2xvYmFsVGltZTtcbiAgICB0aGlzLmZyYW1lQ291bnRlciA9IDA7XG4gICAgdGhpcy5pc1BhdXNlID0gZmFsc2U7XG4gICAgdGhpcy5GUFMgPSAzMC4wO1xuICAgIHRoaXMucGF1c2VUaW1lID0gMDtcbiAgfVxuXG4gIFJlc3BvbnNlKCkge1xuICAgIGxldCB0ID0gdGhpcy5nZXRUaW1lKCk7XG4gICAgLy8gR2xvYmFsIHRpbWVcbiAgICB0aGlzLmdsb2JhbFRpbWUgPSB0O1xuICAgIHRoaXMuZ2xvYmFsRGVsdGFUaW1lID0gdCAtIHRoaXMub2xkVGltZTtcbiAgICAvLyBUaW1lIHdpdGggcGF1c2VcbiAgICBpZiAodGhpcy5pc1BhdXNlKSB7XG4gICAgICB0aGlzLmxvY2FsRGVsdGFUaW1lID0gMDtcbiAgICAgIHRoaXMucGF1c2VUaW1lICs9IHQgLSB0aGlzLm9sZFRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9jYWxEZWx0YVRpbWUgPSB0aGlzLmdsb2JhbERlbHRhVGltZTtcbiAgICAgIHRoaXMubG9jYWxUaW1lID0gdCAtIHRoaXMucGF1c2VUaW1lIC0gdGhpcy5zdGFydFRpbWU7XG4gICAgfVxuICAgIC8vIEZQU1xuICAgIHRoaXMuZnJhbWVDb3VudGVyKys7XG4gICAgaWYgKHQgLSB0aGlzLm9sZFRpbWVGUFMgPiAzKSB7XG4gICAgICB0aGlzLkZQUyA9IHRoaXMuZnJhbWVDb3VudGVyIC8gKHQgLSB0aGlzLm9sZFRpbWVGUFMpO1xuICAgICAgdGhpcy5vbGRUaW1lRlBTID0gdDtcbiAgICAgIHRoaXMuZnJhbWVDb3VudGVyID0gMDtcbiAgICB9XG4gICAgdGhpcy5vbGRUaW1lID0gdDtcbiAgfVxufVxuXG5leHBvcnQgbGV0IG15VGltZXIgPSBuZXcgVGltZSgpO1xuIiwiaW1wb3J0IHsgbXlJbnB1dCB9IGZyb20gXCIuL3Jlcy9pbnB1dFwiO1xuaW1wb3J0IHsgbXlUaW1lciB9IGZyb20gXCIuL3Jlcy90aW1lclwiO1xuXG5sZXQgTWFwQ252czogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xubGV0IFRpdGVsc0NudnM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbmxldCBDb3VudEltYWdlTG9hZCA9IDA7XG5cbmxldCBEcmF3R3JpZCA9IGZhbHNlO1xubGV0IERyYXdGUFMgPSBmYWxzZTtcblxuLy9odHRwczovL3RpbGUudHJhY2VzdHJhY2suY29tL3RvcG9fXy9cbi8vaHR0cHM6Ly9hLnRpbGUub3BlbnN0cmVldG1hcC5vcmcvXG5jb25zdCBTaXplSW1hZ2UgPSAyNTY7XG5cbmNsYXNzIGNhbWVyYSB7XG4gIHggPSAwO1xuICB5ID0gMjU2O1xuICB6b29tID0gMTtcbiAgSXNVcGRhdGUgPSB0cnVlO1xufVxuXG5jbGFzcyB0aXRlbCB7XG4gIHggPSAwO1xuICB5ID0gMDtcbiAgem9vbSA9IDA7XG4gIGltZyA9IG5ldyBJbWFnZShTaXplSW1hZ2UsIFNpemVJbWFnZSk7XG4gIElzVmlzaWJsZSA9IHRydWU7XG5cbiAgU2V0TG9hZCgpIHtcbiAgICBDb3VudEltYWdlTG9hZCsrO1xuICB9XG5cbiAgZHJhd01hcCgpIHtcbiAgICBsZXQgbiA9IFNpemVJbWFnZSAqIE1hdGgucG93KDIsIENhbS56b29tKTtcbiAgICBsZXQgb2Zmc2V0ID0gKCgoQ2FtLnggLSBNYXBDbnZzLmNhbnZhcy53aWR0aCAvIDIpICUgbikgKyBuKSAlIG47XG4gICAgaWYgKHRoaXMuaW1nID09IHVuZGVmaW5lZCB8fCB0aGlzLmltZyA9PSBudWxsKSByZXR1cm47XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBNYXBDbnZzLmNhbnZhcy53aWR0aCAvIG4gKyAyOyBqKyspIHtcbiAgICAgIGlmIChcbiAgICAgICAgb2Zmc2V0ID4gaiAqIG4gKyB0aGlzLnggKiBTaXplSW1hZ2UgKyBTaXplSW1hZ2UgfHxcbiAgICAgICAgaiAqIG4gKyB0aGlzLnggKiBTaXplSW1hZ2UgPiBNYXBDbnZzLmNhbnZhcy53aWR0aCArIG9mZnNldFxuICAgICAgKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgbGV0IHggPVxuICAgICAgICAgIGogKiBTaXplSW1hZ2UgKiBNYXRoLnBvdygyLCBDYW0uem9vbSkgK1xuICAgICAgICAgIHRoaXMueCAqIFNpemVJbWFnZSArXG4gICAgICAgICAgLShDYW0ueCAtIE1hcENudnMuY2FudmFzLndpZHRoIC8gMikgK1xuICAgICAgICAgIE1hdGguZmxvb3IoKENhbS54IC0gTWFwQ252cy5jYW52YXMud2lkdGggLyAyKSAvIG4pICogbixcbiAgICAgICAgeSA9IC1DYW0ueSArIE1hcENudnMuY2FudmFzLmhlaWdodCAvIDIgKyB0aGlzLnkgKiBTaXplSW1hZ2U7XG5cbiAgICAgIE1hcENudnMuZHJhd0ltYWdlKFxuICAgICAgICB0aGlzLmltZyxcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgU2l6ZUltYWdlLFxuICAgICAgICBTaXplSW1hZ2UsXG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIFNpemVJbWFnZSxcbiAgICAgICAgU2l6ZUltYWdlXG4gICAgICApO1xuICAgICAgaWYgKERyYXdGUFMpIHtcbiAgICAgICAgTWFwQ252cy5iZWdpblBhdGgoKTtcbiAgICAgICAgTWFwQ252cy5tb3ZlVG8oeCwgeSk7XG4gICAgICAgIE1hcENudnMubGluZVRvKHgsIHkgKyBTaXplSW1hZ2UpO1xuICAgICAgICBNYXBDbnZzLmxpbmVUbyh4ICsgU2l6ZUltYWdlLCB5ICsgU2l6ZUltYWdlKTtcbiAgICAgICAgTWFwQ252cy5saW5lVG8oeCArIFNpemVJbWFnZSwgeSk7XG4gICAgICAgIE1hcENudnMubGluZVRvKHgsIHkpO1xuICAgICAgICBNYXBDbnZzLnN0cm9rZSgpO1xuXG4gICAgICAgIE1hcENudnMuZmlsbFRleHQodGhpcy54ICsgXCIsXCIgKyB0aGlzLnksIHggKyA1LCB5ICsgMTUpO1xuICAgICAgICBNYXBDbnZzLmZpbGxUZXh0KHRoaXMueCArIFwiLFwiICsgdGhpcy55LCB4ICsgNSwgeSArIFNpemVJbWFnZSAtIDUpO1xuICAgICAgICBNYXBDbnZzLmZpbGxUZXh0KHRoaXMueCArIFwiLFwiICsgdGhpcy55LCB4ICsgU2l6ZUltYWdlIC0gMzAsIHkgKyAxNSk7XG4gICAgICAgIE1hcENudnMuZmlsbFRleHQoXG4gICAgICAgICAgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnksXG4gICAgICAgICAgeCArIFNpemVJbWFnZSAtIDMwLFxuICAgICAgICAgIHkgKyBTaXplSW1hZ2UgLSA1XG4gICAgICAgICk7XG4gICAgICAgIE1hcENudnMuc3Ryb2tlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmxldCBDYW0gPSBuZXcgY2FtZXJhKCk7XG5sZXQgdGl0ZWxzID0gbmV3IE1hcDxudW1iZXIsIHRpdGVsPigpO1xuLy9uZXcgSW1hZ2UoU2l6ZUltYWdlLCBTaXplSW1hZ2UpO1xuXG5mdW5jdGlvbiBtb2QoYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgcmV0dXJuICgoYSAlIGIpICsgYikgJSBiO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDYW0oKSB7XG4gIGxldCB4LCB5LCB6b29tO1xuXG4gIHggPSBteUlucHV0Lk1vdXNlQ2xpY2tMZWZ0ICogbXlJbnB1dC5NZHg7XG4gIHkgPSBteUlucHV0Lk1vdXNlQ2xpY2tMZWZ0ICogbXlJbnB1dC5NZHk7XG4gIHpvb20gPSBteUlucHV0Lk1keiA9PSAwID8gMCA6IG15SW5wdXQuTWR6ID4gMCA/IC0xIDogMTtcblxuICBpZiAoeCA9PSAwICYmIHkgPT0gMCAmJiB6b29tID09IDApIENhbS5Jc1VwZGF0ZSA9IGZhbHNlO1xuICBlbHNlIENhbS5Jc1VwZGF0ZSA9IHRydWU7XG5cbiAgaWYgKG15SW5wdXQuS2V5c0NsaWNrWzY4XSkge1xuICAgIERyYXdHcmlkID0gIURyYXdHcmlkO1xuICAgIENhbS5Jc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICBpZiAobXlJbnB1dC5LZXlzQ2xpY2tbNzFdKSB7XG4gICAgRHJhd0ZQUyA9ICFEcmF3RlBTO1xuICAgIENhbS5Jc1VwZGF0ZSA9IHRydWU7XG4gIH1cbiAgbGV0IG4gPSBTaXplSW1hZ2UgKiBNYXRoLnBvdygyLCBDYW0uem9vbSk7XG4gIENhbS54ID0gKCgoQ2FtLnggLSB4KSAlIG4pICsgbikgJSBuO1xuICBDYW0ueSAtPSB5O1xuICBpZiAoem9vbSAhPSAwKSB7XG4gICAgbGV0IGR4ID0gKDIgKiBteUlucHV0Lk14IC0gTWFwQ252cy5jYW52YXMud2lkdGgpIC8gMixcbiAgICAgIGR5ID0gKE1hcENudnMuY2FudmFzLmhlaWdodCAtIDIgKiBteUlucHV0Lk15KSAvIDI7XG5cbiAgICBDYW0ueCArPSBkeDtcbiAgICBDYW0ueSAtPSBkeTtcblxuICAgIGxldCB3cCA9IG1vZChDYW0ueCwgbikgLyBuO1xuICAgIGxldCBocCA9IG1vZChDYW0ueSwgbikgLyBuO1xuXG4gICAgQ2FtLnpvb20gPSBtb2QoQ2FtLnpvb20gKyB6b29tLCAyMCk7XG4gICAgbiA9IFNpemVJbWFnZSAqIE1hdGgucG93KDIsIENhbS56b29tKTtcblxuICAgIENhbS54ID0gd3AgKiBuIC0gZHg7XG4gICAgQ2FtLnkgPSBocCAqIG4gKyBkeTtcbiAgfVxufVxuXG4vLyAvLyggJiZcbi8vICgoKChDYW0ueCAlIG4pICsgbikgJSBuKSAtIE1hcENudnMuY2FudmFzLndpZHRoIC8gMiA+IHggKiBTaXplSW1hZ2UgKyBTaXplSW1hZ2UgfHxcbi8vICgoKENhbS54ICUgbikgKyBuKSAlIG4pICsgTWFwQ252cy5jYW52YXMud2lkdGggLyAyIDwgeCAqIFNpemVJbWFnZSlcblxuZnVuY3Rpb24gTG9hZE1hcCgpIHtcbiAgaWYgKENvdW50SW1hZ2VMb2FkICE9IDApIHJldHVybjtcbiAgbGV0IG4gPSBTaXplSW1hZ2UgKiBNYXRoLnBvdygyLCBDYW0uem9vbSk7XG4gIGlmIChNYXBDbnZzLmNhbnZhcy53aWR0aCA+IG4pIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgucG93KDQsIENhbS56b29tKTsgaSsrKSB7XG4gICAgICBsZXQgeCA9IGkgJSBNYXRoLnBvdygyLCBDYW0uem9vbSksXG4gICAgICAgIHkgPSBNYXRoLmZsb29yKGkgLyBNYXRoLnBvdygyLCBDYW0uem9vbSkpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIENhbS55IC0gTWFwQ252cy5jYW52YXMuaGVpZ2h0IC8gMiA+IHkgKiBTaXplSW1hZ2UgKyBTaXplSW1hZ2UgfHxcbiAgICAgICAgQ2FtLnkgKyBNYXBDbnZzLmNhbnZhcy5oZWlnaHQgLyAyIDwgeSAqIFNpemVJbWFnZVxuICAgICAgKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIGxldCB2OiB1bmRlZmluZWQgfCB0aXRlbCA9IHRpdGVscy5nZXQoXG4gICAgICAgIChNYXRoLnBvdyg0LCBDYW0uem9vbSkgLSAxKSAvIDMgKyBpXG4gICAgICApO1xuICAgICAgaWYgKHYgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHYuSXNWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgQ291bnRJbWFnZUxvYWQrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHYgPSBuZXcgdGl0ZWwoKTtcbiAgICAgICAgbGV0IGltID0gbmV3IEltYWdlKFNpemVJbWFnZSwgU2l6ZUltYWdlKTtcbiAgICAgICAgaW0uc3JjID0gYGh0dHBzOi8vYS50aWxlLm9wZW5zdHJlZXRtYXAub3JnLyR7Q2FtLnpvb219LyR7eH0vJHt5fS5wbmdgO1xuICAgICAgICBpbS5vbmxvYWQgPSB2LlNldExvYWQ7XG4gICAgICAgIHYuaW1nID0gaW07XG4gICAgICAgIHYueCA9IHg7XG4gICAgICAgIHYueSA9IHk7XG4gICAgICAgIHRpdGVscy5zZXQoKE1hdGgucG93KDQsIENhbS56b29tKSAtIDEpIC8gMyArIGksIHYpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgWDAgPSBNYXRoLmZsb29yKChtb2QoQ2FtLngsIG4pIC0gTWFwQ252cy5jYW52YXMud2lkdGggLyAyKSAvIFNpemVJbWFnZSksXG4gICAgICBZMCA9IE1hdGguZmxvb3IoXG4gICAgICAgIChDYW0ueSAtIE1hcENudnMuY2FudmFzLmhlaWdodCAvIDIgPCAwXG4gICAgICAgICAgPyAwXG4gICAgICAgICAgOiBDYW0ueSAtIE1hcENudnMuY2FudmFzLmhlaWdodCAvIDIgPiBuXG4gICAgICAgICAgICA/IG5cbiAgICAgICAgICAgIDogQ2FtLnkgLSBNYXBDbnZzLmNhbnZhcy5oZWlnaHQgLyAyKSAvIFNpemVJbWFnZVxuICAgICAgKSxcbiAgICAgIFgxID0gTWF0aC5jZWlsKChtb2QoQ2FtLngsIG4pICsgTWFwQ252cy5jYW52YXMud2lkdGggLyAyKSAvIFNpemVJbWFnZSksXG4gICAgICBZMSA9IE1hdGguY2VpbChcbiAgICAgICAgKENhbS55ICsgTWFwQ252cy5jYW52YXMuaGVpZ2h0IC8gMiA8IDBcbiAgICAgICAgICA/IDBcbiAgICAgICAgICA6IENhbS55ICsgTWFwQ252cy5jYW52YXMuaGVpZ2h0IC8gMiA+IG5cbiAgICAgICAgICAgID8gblxuICAgICAgICAgICAgOiBDYW0ueSArIE1hcENudnMuY2FudmFzLmhlaWdodCAvIDIpIC8gU2l6ZUltYWdlXG4gICAgICApO1xuXG4gICAgZm9yIChsZXQgaiA9IFkwOyBqIDwgWTE7IGorKylcbiAgICAgIGZvciAobGV0IGkgPSBYMDsgaSA8IFgxOyBpKyspIHtcbiAgICAgICAgbGV0IHggPSBtb2QoaSwgTWF0aC5wb3coMiwgQ2FtLnpvb20pKSxcbiAgICAgICAgICB5ID0gbW9kKGosIE1hdGgucG93KDIsIENhbS56b29tKSk7XG4gICAgICAgIGxldCB2OiB1bmRlZmluZWQgfCB0aXRlbCA9IHRpdGVscy5nZXQoXG4gICAgICAgICAgKE1hdGgucG93KDQsIENhbS56b29tKSAtIDEpIC8gMyArIHggKyB5ICogTWF0aC5wb3coMiwgQ2FtLnpvb20pXG4gICAgICAgICk7XG4gICAgICAgIGlmICh2ICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICghdi5Jc1Zpc2libGUpIENvdW50SW1hZ2VMb2FkKys7XG4gICAgICAgICAgdi5Jc1Zpc2libGUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHYgPSBuZXcgdGl0ZWwoKTtcbiAgICAgICAgICBsZXQgaW0gPSBuZXcgSW1hZ2UoU2l6ZUltYWdlLCBTaXplSW1hZ2UpO1xuICAgICAgICAgIGltLnNyYyA9IGBodHRwczovL2EudGlsZS5vcGVuc3RyZWV0bWFwLm9yZy8ke0NhbS56b29tfS8ke3h9LyR7eX0ucG5nYDtcbiAgICAgICAgICBpbS5vbmxvYWQgPSB2LlNldExvYWQ7XG4gICAgICAgICAgdi5pbWcgPSBpbTtcbiAgICAgICAgICB2LnggPSB4O1xuICAgICAgICAgIHYueSA9IHk7XG4gICAgICAgICAgdGl0ZWxzLnNldChcbiAgICAgICAgICAgIChNYXRoLnBvdyg0LCBDYW0uem9vbSkgLSAxKSAvIDMgKyB4ICsgeSAqIE1hdGgucG93KDIsIENhbS56b29tKSxcbiAgICAgICAgICAgIHZcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB0aXRlbHMpIHtcbiAgICBpZiAoIXZhbHVlLklzVmlzaWJsZSkgdGl0ZWxzLmRlbGV0ZShrZXkpO1xuICAgIGVsc2UgdmFsdWUuSXNWaXNpYmxlID0gZmFsc2U7XG4gIH1cbn1cblxubGV0IE1kID0gWzAsIDBdLFxuICBNID0gWzAsIDBdLFxuICBNb3VzZUNsaWNrID0gWzAsIDBdLFxuICBXaGVlbCA9IDAsXG4gIEtleXMgPSBuZXcgQXJyYXkoMjU1KS5maWxsKDApO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFpbih3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICBjb25zdCBjYW52YXMxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYXBjYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gIGlmICghY2FudmFzMSkge1xuICAgIHJldHVybjtcbiAgfVxuICBNYXBDbnZzID0gY2FudmFzMS5nZXRDb250ZXh0KFwiMmRcIikgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG4gIE1hcENudnMuY2FudmFzLndpZHRoID0gdztcbiAgTWFwQ252cy5jYW52YXMuaGVpZ2h0ID0gaDtcblxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgIFwiI251bXRpdGVsc2NhbnZhc1wiXG4gICkgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gIGlmICghY2FudmFzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgVGl0ZWxzQ252cyA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIikgYXMgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuXG4gIFRpdGVsc0NudnMuY2FudmFzLndpZHRoID0gdztcbiAgVGl0ZWxzQ252cy5jYW52YXMuaGVpZ2h0ID0gaDtcbiAgY29uc3QgcmVuZGVyID0gYXN5bmMgKCkgPT4ge1xuICAgIG15VGltZXIuUmVzcG9uc2UoKTtcbiAgICBpZiAoQ2FtLklzVXBkYXRlKSB7XG4gICAgICBMb2FkTWFwKCk7XG4gICAgfVxuICAgIGlmIChDb3VudEltYWdlTG9hZCA9PSB0aXRlbHMuc2l6ZSkge1xuICAgICAgTWFwQ252cy5jbGVhclJlY3QoMCwgMCwgTWFwQ252cy5jYW52YXMud2lkdGgsIE1hcENudnMuY2FudmFzLmhlaWdodCk7XG4gICAgICBUaXRlbHNDbnZzLmNsZWFyUmVjdChcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgVGl0ZWxzQ252cy5jYW52YXMud2lkdGgsXG4gICAgICAgIFRpdGVsc0NudnMuY2FudmFzLmhlaWdodFxuICAgICAgKTtcbiAgICAgIE1hcENudnMuZm9udCA9IFwiMjBweCBzZXJpZlwiO1xuICAgICAgVGl0ZWxzQ252cy5mb250ID0gXCI0OHB4IHNlcmlmXCI7XG5cbiAgICAgIGlmIChEcmF3RlBTKSB7XG4gICAgICAgIFRpdGVsc0NudnMuZmlsbFRleHQoXCJUaXRlbHM6XCIgKyB0aXRlbHMuc2l6ZSwgMTAsIDUwKTtcbiAgICAgICAgVGl0ZWxzQ252cy5maWxsVGV4dChcIkZQUzpcIiArIG15VGltZXIuRlBTLnRvRml4ZWQoMiksIDEwLCAxMDApO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdGl0ZWxzKSB7XG4gICAgICAgIHZhbHVlLmRyYXdNYXAoKTtcbiAgICAgIH1cbiAgICAgIENvdW50SW1hZ2VMb2FkID0gMDtcbiAgICB9XG4gICAgaWYgKENvdW50SW1hZ2VMb2FkID4gdGl0ZWxzLnNpemUpIHtcbiAgICAgIENvdW50SW1hZ2VMb2FkID0gMDtcbiAgICAgIExvYWRNYXAoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKGUuYnV0dG9uID09IDApIHtcbiAgICAgICAgTW91c2VDbGlja1swXSA9IDE7XG4gICAgICB9XG4gICAgICBpZiAoZS5idXR0b24gPT0gMikge1xuICAgICAgICBNb3VzZUNsaWNrWzFdID0gMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCAoZSkgPT4ge1xuICAgICAgaWYgKGUuYnV0dG9uID09IDApIHtcbiAgICAgICAgTW91c2VDbGlja1swXSA9IDA7XG4gICAgICB9XG4gICAgICBpZiAoZS5idXR0b24gPT0gMikge1xuICAgICAgICBNb3VzZUNsaWNrWzFdID0gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIChlKSA9PiB7XG4gICAgICBNZFswXSA9IGUubW92ZW1lbnRYO1xuICAgICAgTWRbMV0gPSBlLm1vdmVtZW50WTtcbiAgICAgIE1bMF0gPSBlLmNsaWVudFg7XG4gICAgICBNWzFdID0gZS5jbGllbnRZO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gICAgICBLZXlzW2Uua2V5Q29kZV0gPSAxO1xuICAgIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCAoZSkgPT4ge1xuICAgICAgS2V5c1tlLmtleUNvZGVdID0gMDtcbiAgICB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgKGUpID0+IHtcbiAgICAgIFdoZWVsID0gZS5kZWx0YVk7XG4gICAgfSk7XG5cbiAgICBteUlucHV0LnJlc3BvbnNlKE0sIE1kLCBNb3VzZUNsaWNrLCBXaGVlbCwgS2V5cyk7XG5cbiAgICBNZFswXSA9IE1kWzFdID0gMDtcbiAgICByZW5kZXJDYW0oKTtcbiAgICBXaGVlbCA9IDA7XG4gICAgS2V5cy5maWxsKDApO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgfTtcbiAgcmVuZGVyKCk7XG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoZXZlbnQpID0+IHtcbiAgbGV0IHc6IG51bWJlciA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICBsZXQgaDogbnVtYmVyID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBtYWluKHcsIGgpO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIChldmVudCkgPT4ge1xuICBsZXQgdzogbnVtYmVyID0gd2luZG93LmlubmVyV2lkdGg7XG4gIGxldCBoOiBudW1iZXIgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIE1hcENudnMuY2FudmFzLndpZHRoID0gdztcbiAgTWFwQ252cy5jYW52YXMuaGVpZ2h0ID0gaDtcblxuICBUaXRlbHNDbnZzLmNhbnZhcy53aWR0aCA9IHc7XG4gIFRpdGVsc0NudnMuY2FudmFzLmhlaWdodCA9IGg7XG4gIC8vIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5wb3coMiwgQ2FtLnpvb20pOyBpKyspIHtcbiAgLy8gICBpbWcuc3JjID0gYGh0dHBzOi8vYS50aWxlLm9wZW5zdHJlZXRtYXAub3JnLyR7Q2FtLnpvb219LyR7aSAlIDJ9LyR7TWF0aC5mbG9vcihpIC8gMil9LnBuZ2A7XG4gIC8vICAgaW1nLm9ubG9hZCA9ICgpID0+IGRyYXdNYXAxKGkgJSAyLCBNYXRoLmZsb29yKGkgLyAyKSk7XG4gIC8vIH1cbiAgTG9hZE1hcCgpO1xufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUEsTUFBTSxLQUFLLENBQUE7SUFDVCxJQUFBLElBQUksQ0FBVztJQUNmLElBQUEsU0FBUyxDQUFXO0lBQ3BCLElBQUEsRUFBRSxDQUFTO0lBQ1gsSUFBQSxFQUFFLENBQVM7SUFDWCxJQUFBLEVBQUUsQ0FBUztJQUNYLElBQUEsR0FBRyxDQUFTO0lBQ1osSUFBQSxHQUFHLENBQVM7SUFDWixJQUFBLEdBQUcsQ0FBUztJQUVaLElBQUEsY0FBYyxDQUFTO0lBQ3ZCLElBQUEsZUFBZSxDQUFTO1FBRXhCLFdBQVksQ0FBQSxVQUFvQixFQUFFLElBQWMsRUFBQTtZQUM5QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxFQUFFLEdBQUcs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
