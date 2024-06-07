// https://github.com/Eugeny/tabby
// https://michaelwalczyk.com/blog-ray-marching.html
// https://iquilezles.org/articles/distfunctions/

let gl: WebGL2RenderingContext;

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number;
  };
  // uniformLocations: {
  //   projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
  //   modelViewM atrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
  // },
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

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
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

function drawScene(programInfo: ProgramInfo, buffers: Buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  // buffer into the vertexPosition attribute.
  setPositionAttribute(buffers, programInfo);

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

//
// start here
//

export async function main() {
  const vsResponse = await fetch('./march.vertex.glsl');
  const vsText = await vsResponse.text();
  console.log(vsText);
  const fsResponse = await fetch('./march.fragment.glsl');
  const fsText = await fsResponse.text();
  console.log(fsText);

  const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  // Initialize the GL context
  gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      'Unable to initialize WebGL. Your browser or machine may not support it.'
    );
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  const shaderProgram = initShaderProgram(vsText, fsText);
  if (!shaderProgram) return;

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'in_pos')
    }
    // uniformLocations: {
    //   projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
    //   modelViewM atrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    // },
  };

  const buffers = initBuffers();

  drawScene(programInfo, buffers);
}

window.addEventListener('load', (event) => {
  main();
});
