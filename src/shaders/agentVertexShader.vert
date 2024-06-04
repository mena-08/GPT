attribute vec3 a_position; // Vertex position
attribute vec2 a_texCoord;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
// /uniform float u_time;

varying vec2 v_texCoord;//pass texture coordinates to the fragment shader
varying vec3 v_position;  // Pass the position to the fragment shader

void main() {

    v_texCoord = a_texCoord;  // Assign texture coordinates
    v_position = a_position;  // Pass the position to the fragment shader
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
}
