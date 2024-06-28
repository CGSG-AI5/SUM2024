import { myInput } from "./res/input";
import { myTimer } from "./res/timer";

let MapCnvs: CanvasRenderingContext2D;
let TilesCnvs: CanvasRenderingContext2D;
let CountImageLoad = 0;

let DrawGrid = false;
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
    if (this.img == undefined || this.img == null) return;
    for (let j = 0; j < MapCnvs.canvas.width / n + 2; j++) {
      if (
        offset > j * n + this.x * SizeImage + SizeImage ||
        j * n + this.x * SizeImage > MapCnvs.canvas.width + offset
      )
        continue;

      let x =
          j * SizeImage * Math.pow(2, Cam.zoom) +
          this.x * SizeImage +
          -(Cam.x - MapCnvs.canvas.width / 2) +
          Math.floor((Cam.x - MapCnvs.canvas.width / 2) / n) * n,
        y = -Cam.y + MapCnvs.canvas.height / 2 + this.y * SizeImage;

      MapCnvs.drawImage(
        this.img,
        0,
        0,
        SizeImage,
        SizeImage,
        x,
        y,
        SizeImage,
        SizeImage
      );
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
        MapCnvs.fillText(
          this.x + "," + this.y,
          x + SizeImage - 30,
          y + SizeImage - 5
        );
        MapCnvs.stroke();
      }
    }
  }
}

let Cam = new camera();
let tiles = new Map<number, titel>();
//new Image(SizeImage, SizeImage);

function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}

function renderCam() {
  let x, y, zoom;

  x = myInput.MouseClickLeft * myInput.Mdx;
  y = myInput.MouseClickLeft * myInput.Mdy;
  zoom = myInput.Mdz == 0 ? 0 : myInput.Mdz > 0 ? -1 : 1;

  if (x == 0 && y == 0 && zoom == 0) Cam.IsUpdate = false;
  else Cam.IsUpdate = true;

  if (myInput.KeysClick[68]) {
    DrawGrid = !DrawGrid;
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
    let dx = (2 * myInput.Mx - MapCnvs.canvas.width) / 2,
      dy = (MapCnvs.canvas.height - 2 * myInput.My) / 2;

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
  if (CountImageLoad != 0) return;
  let n = SizeImage * Math.pow(2, Cam.zoom);
  if (MapCnvs.canvas.width > n) {
    for (let i = 0; i < Math.pow(4, Cam.zoom); i++) {
      let x = i % Math.pow(2, Cam.zoom),
        y = Math.floor(i / Math.pow(2, Cam.zoom));

      if (
        Cam.y - MapCnvs.canvas.height / 2 > y * SizeImage + SizeImage ||
        Cam.y + MapCnvs.canvas.height / 2 < y * SizeImage
      )
        continue;
      let v: undefined | titel = tiles.get((Math.pow(4, Cam.zoom) - 1) / 3 + i);
      if (v != undefined) {
        v.IsVisible = true;
        CountImageLoad++;
      } else {
        v = new titel();
        let im = new Image(SizeImage, SizeImage);
        im.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${x}/${y}.png`;
        im.onload = v.SetLoad;
        v.img = im;
        v.x = x;
        v.y = y;
        tiles.set((Math.pow(4, Cam.zoom) - 1) / 3 + i, v);
      }
    }
  } else {
    let X0 = Math.floor((mod(Cam.x, n) - MapCnvs.canvas.width / 2) / SizeImage),
      Y0 = Math.floor(
        (Cam.y - MapCnvs.canvas.height / 2 < 0
          ? 0
          : Cam.y - MapCnvs.canvas.height / 2 > n
            ? n
            : Cam.y - MapCnvs.canvas.height / 2) / SizeImage
      ),
      X1 = Math.ceil((mod(Cam.x, n) + MapCnvs.canvas.width / 2) / SizeImage),
      Y1 = Math.ceil(
        (Cam.y + MapCnvs.canvas.height / 2 < 0
          ? 0
          : Cam.y + MapCnvs.canvas.height / 2 > n
            ? n
            : Cam.y + MapCnvs.canvas.height / 2) / SizeImage
      );

    for (let j = Y0; j < Y1; j++)
      for (let i = X0; i < X1; i++) {
        let x = mod(i, Math.pow(2, Cam.zoom)),
          y = mod(j, Math.pow(2, Cam.zoom));
        let v: undefined | titel = tiles.get(
          (Math.pow(4, Cam.zoom) - 1) / 3 + x + y * Math.pow(2, Cam.zoom)
        );
        if (v != undefined) {
          if (!v.IsVisible) CountImageLoad++;
          v.IsVisible = true;
        } else {
          v = new titel();
          let im = new Image(SizeImage, SizeImage);
          im.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${x}/${y}.png`;
          im.onload = v.SetLoad;
          v.img = im;
          v.x = x;
          v.y = y;
          tiles.set(
            (Math.pow(4, Cam.zoom) - 1) / 3 + x + y * Math.pow(2, Cam.zoom),
            v
          );
        }
      }
  }

  for (const [key, value] of tiles) {
    if (!value.IsVisible) tiles.delete(key);
    else value.IsVisible = false;
  }
}

let Md = [0, 0],
  M = [0, 0],
  MouseClick = [0, 0],
  Wheel = 0,
  Keys = new Array(255).fill(0);

export async function main(w: number, h: number) {
  const canvas1 = document.querySelector("#mapcanvas") as HTMLCanvasElement;
  if (!canvas1) {
    return;
  }
  MapCnvs = canvas1.getContext("2d") as CanvasRenderingContext2D;

  MapCnvs.canvas.width = w;
  MapCnvs.canvas.height = h;

  const canvas = document.querySelector("#numtilescanvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  TilesCnvs = canvas.getContext("2d") as CanvasRenderingContext2D;

  TilesCnvs.canvas.width = w;
  TilesCnvs.canvas.height = h;
  const render = async () => {
    myTimer.Response();
    if (Cam.IsUpdate) {
      LoadMap();
    }
    if (CountImageLoad == tiles.size) {
      MapCnvs.clearRect(0, 0, MapCnvs.canvas.width, MapCnvs.canvas.height);
      TilesCnvs.clearRect(
        0,
        0,
        TilesCnvs.canvas.width,
        TilesCnvs.canvas.height
      );
      MapCnvs.font = "20px serif";
      TilesCnvs.font = "48px serif";

      if (DrawFPS) {
        TilesCnvs.fillText("Tiles:" + tiles.size, 10, 50);
        TilesCnvs.fillText("FPS:" + myTimer.FPS.toFixed(2), 10, 100);
      }
      for (const [key, value] of tiles) {
        value.drawMap();
      }
      CountImageLoad = 0;
    }
    if (CountImageLoad > tiles.size) {
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
  let w: number = window.innerWidth;
  let h: number = window.innerHeight;
  main(w, h);
});

window.addEventListener("resize", (event) => {
  let w: number = window.innerWidth;
  let h: number = window.innerHeight;
  MapCnvs.canvas.width = w;
  MapCnvs.canvas.height = h;

  TilesCnvs.canvas.width = w;
  TilesCnvs.canvas.height = h;
  // for (let i = 0; i < Math.pow(2, Cam.zoom); i++) {
  //   img.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${i % 2}/${Math.floor(i / 2)}.png`;
  //   img.onload = () => drawMap1(i % 2, Math.floor(i / 2));
  // }
  LoadMap();
});
