var gl;
var squareVerticesBuffer;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix;
var squareVerticesColorBuffer;
var squareVerticesBuffer;
var vertexColorAttribute;
var lastSquareUpdateTime = 0;

var squareRotation = 0.0;

var squareXOffset = 0.0;
var squareYOffset = 0.0;
var squareZOffset = 0.0;

//to move howmuch
var xIncValue = 0.2;
var yIncValue = -0.4;
var zIncValue = 0.3;



function start(){
  var canvas = document.getElementById("webgl");

  initWebGL(canvas);
  //color
  gl.clearColor(0.0,0.0,0.0,1.0);
  //debt testing ? MDN ?
  gl.enable(gl.DEPTH_TEST);
  //near thigs?
  gl.depthFunc(gl.LEQUAL);
  //clear colors
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  initShaders();
  initBuffers();
  //drawScene();
  setInterval(drawScene, 15);
}

function initWebGL(canvas){
  gl = null;

  gl = canvas.getContext("experimental-webgl")

  return gl;
}


// all around handler for shaders
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");

  // Create the shader program

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program: ");
  }
  gl.useProgram(shaderProgram);

  vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(vertexColorAttribute);

  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
}

function getShader(gl,id){

  //etsi halutu shader
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
  return null;
}

  var theSource = "";
 var currentChild = shaderScript.firstChild;

//so we need shader source String?
 while(currentChild){
   if(currentChild.nodeType ==3){
     theSource += currentChild.textContent;
   }
    var currentChild = currentChild.nextSibling;
 }
 var shader;

    if(shaderScript.type == "x-shader/x-fragment"){
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex"){
     shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader,theSource);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
   return null;
}

  return shader;
}

var horizAspect = 480.0/640.0;

//checked
function initBuffers() {

  //Lisää vektorit

  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  var vertices = [
    1.0,  1.0,  0.0,
    -1.0, 1.0,  0.0,
    1.0,  -1.0, 0.0,
    -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  //lisää värit

  var colors = [
    1.0,  1.0,  1.0,  1.0,    // white
    1.0,  0.0,  0.0,  1.0,    // red
    0.0,  1.0,  0.0,  1.0,    // green
    0.0,  0.0,  1.0,  1.0     // blue
  ];
  squareVerticesColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

  loadIdentity();
  mvTranslate([-0.0, 0.0, -6.0]);

  mvPushMatrix();
  mvRotate(squareRotation, [1, 0, 1]);
  mvTranslate([squareXOffset, squareYOffset, squareZOffset]);

  //Draw array using buffes
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  //add colors to buffers
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesColorBuffer);
  gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

  //draw

  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  mvPopMatrix();

  var currentTime = Date.now();
    if (lastSquareUpdateTime) {
    	var delta = currentTime - lastSquareUpdateTime;

      squareRotation += (30 * delta) / 1000.0;

      squareRotation += (30 * delta) / 1000.0;
      squareXOffset += xIncValue * ((30 * delta) / 1000.0);
      squareYOffset += yIncValue * ((30 * delta) / 1000.0);
      squareZOffset += zIncValue * ((30 * delta) / 1000.0);

      if (Math.abs(squareYOffset) > 2.5) {
        xIncValue = -xIncValue;
        yIncValue = -yIncValue;
        zIncValue = -zIncValue;
      }
    }

    lastSquareUpdateTime = currentTime;
}


//Matrix operations.

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }

  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;

  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}
