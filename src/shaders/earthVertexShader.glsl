attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;
uniform mat4 u_modelMatrix;

varying vec2 v_texCoord; // For passing the texture coord to the fragment shader
varying vec3 v_lighting; // For passing the lighting effect to the fragment shader

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
    v_texCoord = a_texCoord;

    //apply lightning effect
    mediump vec3 ambientLight = vec3(0.5, 0.5, 0.5);
    mediump vec3 directionalLightColor = vec3(1, 1, 1);
    mediump vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = u_normalMatrix * vec4(a_normal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    v_lighting = ambientLight + (directionalLightColor * directional);
}