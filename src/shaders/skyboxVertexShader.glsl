attribute vec3 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying mediump vec2 v_texCoord;

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1.0);
    v_texCoord = a_texCoord;
}