import { myTimer } from "./res/timer";
import { myInput } from "./res/input";
import { parser } from "./res/parser";
import { Ubo_Matr, UBO } from "./res/ubo";

import { _vec3 } from "./math/mathvec3";

import { cam, CamSet } from "./math/mathcam";
import { _matr4 } from "./math/mathmat4";
import { Spheres, GetArraySpheres } from "./objects";

let gl: WebGL2RenderingContext;

let Ubo_set1: UBO;
export let Ubo_set1_data: Ubo_Matr;
let Ubo_set2: UBO;

let FlagDataObjectUpdate: boolean = true;

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
  };
}

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

    let key = "AD";

    Azimuth +=
      myTimer.globalDeltaTime *
      3 *
      (-30 * myInput.MouseClickLeft * myInput.Mdx);
    Elevator +=
      myTimer.globalDeltaTime *
      2 *
      (-30 * myInput.MouseClickLeft * myInput.Mdy);

    if (Elevator < 0.08) Elevator = 0.08;
    else if (Elevator > 178.9) Elevator = 178.9;

    // if (Azimuth < -45) Azimuth = -45;
    // else if (Azimuth > 45) Azimuth = 45;

    Dist +=
      myTimer.globalDeltaTime *
      (1 + myInput.Keys[16] * 27) *
      (1.2 * myInput.Mdz);
    if (Dist < 0.1) Dist = 0.1;
    // console.log(key.charCodeAt(0));
    if (myInput.MouseClickRight) {
      if (cam.FrameW > cam.FrameH) Wp *= cam.FrameW / cam.FrameH;
      else Hp *= cam.FrameH / cam.FrameW;

      sx = (((-myInput.Mdx * Wp * 10) / cam.FrameW) * Dist) / cam.ProjDist;
      sy = (((myInput.Mdy * Hp * 10) / cam.FrameH) * Dist) / cam.ProjDist;

      dv = _vec3.add(_vec3.mulnum(cam.Right, sx), _vec3.mulnum(cam.Up, sy));

      cam.At = _vec3.add(cam.At, dv);
      cam.Loc = _vec3.add(cam.Loc, dv);
    }
    CamSet(
      _matr4.point_transform(
        new _vec3(0, Dist, 0),
        _matr4.mulmatr(
          _matr4.mulmatr(_matr4.rotateX(Elevator), _matr4.rotateY(Azimuth)),
          _matr4.translate(cam.At)
        )
      ),
      cam.At,
      new _vec3(0, 1, 0)
    );
  }

  Ubo_set1_data.CamLoc = cam.Loc;
  Ubo_set1_data.CamAt = cam.At;
  Ubo_set1_data.CamRight = cam.Right;
  Ubo_set1_data.CamUp = cam.Up;
  Ubo_set1_data.CamDir = cam.Dir;

  //   if (Ani->Keys[VK_SHIFT] && Ani->KeysClick['P'])
  //     Ani->IsPause = !Ani->IsPause;
}

function resizeCam(w: number, h: number) {
  Ubo_set1_data.flags12FrameW.z = w;
  Ubo_set1_data.flags45FrameH.z = h;
  cam.ProjSet();
}

async function reloadShaders(): Promise<ProgramInfo | null> {
  const vsResponse = await fetch(
    "./shader/march.vertex.glsl" + "?nocache" + new Date().getTime()
  );
  const vsText = await vsResponse.text();
  // console.log(vsText);

  const fsResponse = await fetch(
    "./shader/march.fragment.glsl" + "?nocache" + new Date().getTime()
  );
  const fsText = await fsResponse.text();
  const dtResponse = await fetch(
    "./data.txt" + "?nocache" + new Date().getTime()
  );
  const dtText = await dtResponse.text();
  parser(dtText);
  FlagDataObjectUpdate = false;
  console.log(Spheres);
  Ubo_set2.update(GetArraySpheres(), gl);
  const shaderProgram = initShaderProgram(vsText, fsText);
  if (!shaderProgram) return null;

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "in_pos")
    }
  };

  return programInfo;
}

function loadShader(type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(vsSource: string, fsSource: string) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
  if (!vertexShader) return;
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
  if (!fragmentShader) return;

  // Create the shader program

  const shaderProgram = gl.createProgram();
  if (!shaderProgram) return;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
}

function initPositionBuffer(): WebGLBuffer | null {
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

interface Buffers {
  position: WebGLBuffer | null;
}

function initBuffers(): Buffers {
  const positionBuffer = initPositionBuffer();

  return {
    position: positionBuffer
  };
}

function setPositionAttribute(buffers: Buffers, programInfo: ProgramInfo) {
  const numComponents = 2; // pull out 2 values per iteration
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function drawScene(
  programInfo: ProgramInfo | null,
  buffers: Buffers,
  Uni: WebGLUniformLocation
) {
  gl.clearColor(0.28, 0.47, 0.8, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if (programInfo == null) return;
  setPositionAttribute(buffers, programInfo);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);
  Ubo_set1.apply(0, programInfo.program, gl);
  Ubo_set2.apply(1, programInfo.program, gl);
  const offset = 0;
  const vertexCount = 4;
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}
let Md = [0, 0],
  MouseClick = [0, 0],
  Wheel = 0,
  Keys = new Array(255).fill(0);

export async function main(w: number, h: number) {
  const vsResponse = await fetch(
    "./shader/march.vertex.glsl" + "?nocache" + new Date().getTime()
  );
  const vsText = await vsResponse.text();
  console.log(vsText);
  const fsResponse = await fetch(
    "./shader/march.fragment.glsl" + "?nocache" + new Date().getTime()
  );
  const fsText = await fsResponse.text();
  console.log(fsText);

  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  // Initialize the GL context
  gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
  gl.canvas.width = w;
  gl.canvas.height = h;

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.28, 0.47, 0.8, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  let shaderProgram = initShaderProgram(vsText, fsText);
  if (!shaderProgram) return;

  let programInfo: ProgramInfo | null = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "in_pos")
    }
  };
  const Uni = gl.getAttribLocation(shaderProgram, "time");
  const buffers = initBuffers();
  Ubo_set1_data = new Ubo_Matr(
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    new _vec3(0, 0, 0),
    0,
    0,
    0
  );
  Ubo_set1 = UBO.create(Ubo_set1_data.GetArray().length, "BaseData", gl);
  Ubo_set2 = UBO.create(24 * 10 + 4, "Sphere", gl);
  initCam();
  gl.viewport(0, 0, w, h);
  resizeCam(w, h);
  let programInf: ProgramInfo | null;
  programInf = programInfo;
  programInf = await reloadShaders();
  const render = async () => {
    if (myInput.KeysClick[82]) programInf = await reloadShaders();
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
    Ubo_set1_data.TimeGlobalDeltaGlobalDeltaLocal.x = myTimer.globalTime;
    Ubo_set1.update(Ubo_set1_data.GetArray(), gl);
    drawScene(programInf, buffers, Uni);
    Wheel = 0;
    Keys.fill(0);
    console.log(myTimer.FPS);
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
  gl.canvas.width = w;
  gl.canvas.height = h;
  gl.viewport(0, 0, w, h);
  resizeCam(w, h);
});
