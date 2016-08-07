var gl;

function start(){
  var canvas = document.getElementById("webgl");

  gl= initWebGL(canvas);
  //color
  gl.clearColor(0.0,0.0,0.0,1.0);
  //debt testing ? MDN ?
  gl.enable(gl.DEPTH_TEST);
  //near thigs?
  gl.depthFunc(gl.LEQUAL);
  //clear colors
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

}

function initWebGL(canvas){
  gl = null;

  gl = canvas.getContext("webgl")

  return gl;
}
