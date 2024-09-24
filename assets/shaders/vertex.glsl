attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
uniform mat4 uRotateMatrix4;
uniform mat4 uModelMatrix4;
varying lowp vec4 vColor;
void main(void) {
  gl_Position =  uModelMatrix4 * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;
}