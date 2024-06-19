import { myInput } from "./res/input";
import { myTimer } from "./res/timer";

let MapCnvs: CanvasRenderingContext2D;

class camera {
  x = 0;
  y = 0;
  zoom = 1;
  IsUpdate = true;
}

class titel {
  x = 0;
  y = 0;
  zoom = 0;
  img = new Image(256, 256);
  IsVisible = true;

  drawMap() {
    let offset =
      ((Cam.x % 256) + 256) % 256 == 0 ? 0 : ((Cam.x % 256) + 256) % 256;
    //console.log(this.x, this.y);
    //console.log(typeof this.img);
    if (this.img == undefined || this.img == null) return;
    for (let j = 0; j < (MapCnvs.canvas.width - offset) / 256 + 2; j++)
      MapCnvs.drawImage(
        this.img,
        0,
        0,
        256,
        256,
        -offset + j * 256 * (Cam.zoom + 1) + this.x * 256,
        MapCnvs.canvas.height / 2 - 128 + Cam.y + this.y * 255,
        256,
        256
      );
  }
}

let Cam = new camera();
let titels = new Map<number, titel>();
//new Image(256, 256);
function renderCam() {
  let x, y, zoom;

  x = myInput.MouseClickLeft * myInput.Mdx;
  y = myInput.MouseClickRight * myInput.Mdy;
  zoom = myInput.Mdz == 0 ? 0 : myInput.Mdz > 0 ? -1 : 1;

  if (x == 0 && y == 0 && zoom == 0) Cam.IsUpdate = false;
  else Cam.IsUpdate = true;

  Cam.x -= x;
  Cam.y += y;
  Cam.zoom += zoom;
  if (Cam.zoom < 0) Cam.zoom = 0;
}

function LoadMap() {
  MapCnvs.clearRect(0, 0, MapCnvs.canvas.width, MapCnvs.canvas.height);
  for (let i = 0; i < Math.pow(4, Cam.zoom); i++) {
    let x = i % Math.pow(2, Cam.zoom),
      y = Math.floor(i / Math.pow(2, Cam.zoom));
    let n = 256 * Math.pow(2, Cam.zoom);
    if (
      ((((Cam.x % n) + n) % n) - MapCnvs.canvas.width / 2 < x * 256 + 256 &&
        Cam.y - MapCnvs.canvas.height / 2 < y * 256 + 256) ||
      ((((Cam.x % n) + n) % n) + MapCnvs.canvas.width / 2 > x * 256 &&
        Cam.y + MapCnvs.canvas.height / 2 > y * 256)
    ) {
      let v: undefined | titel = titels.get(
        (Math.pow(4, Cam.zoom) - 1) / 3 + i
      );
      if (v != undefined) v.IsVisible = true;
      else {
        v = new titel();
        let im = new Image(256, 256);
        im.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${x}/${y}.png`;
        im.onload = v.drawMap;
        v.img = im;
        v.x = x;
        v.y = y;
        titels.set((Math.pow(4, Cam.zoom) - 1) / 3 + i, v);
      }
    }
  }
  for (const [key, value] of titels) {
    if (!value.IsVisible) titels.delete(key);
    else value.IsVisible = false;
  }
  console.log(titels);
  for (const [key, value] of titels) {
    value.drawMap();
  }
}

let Md = [0, 0],
  MouseClick = [0, 0],
  Wheel = 0,
  Keys = new Array(255).fill(0);

export async function main(w: number, h: number) {
  const canvas1 = document.querySelector("#fpscanvas") as HTMLCanvasElement;
  if (!canvas1) {
    return;
  }
  MapCnvs = canvas1.getContext("2d") as CanvasRenderingContext2D;

  MapCnvs.canvas.width = w;
  MapCnvs.canvas.height = h;
  const render = async () => {
    myTimer.Response();
    if (Cam.IsUpdate) LoadMap();

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
  // for (let i = 0; i < Math.pow(2, Cam.zoom); i++) {
  //   img.src = `https://a.tile.openstreetmap.org/${Cam.zoom}/${i % 2}/${Math.floor(i / 2)}.png`;
  //   img.onload = () => drawMap1(i % 2, Math.floor(i / 2));
  // }
  LoadMap();
});
